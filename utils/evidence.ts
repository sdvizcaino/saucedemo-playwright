import type { Locator, Page, TestInfo } from '@playwright/test';

const MARK_ATTR = 'data-qa-evidence';

/** Dibuja un recuadro rojo sobre el elemento (sin mover el layout). Si `label` viene, agrega una etiqueta. */
async function highlight(target: Locator, label?: string): Promise<void> {
  try {
    await target.first().evaluate(
      (el, { attr, text }) => {
        const node = el as HTMLElement;
        node.style.outline = '3px solid red';
        node.style.outlineOffset = '2px';
        node.setAttribute(attr, 'true');
        if (text) {
          const rect = node.getBoundingClientRect();
          const tag = document.createElement('div');
          tag.setAttribute(attr, 'label');
          tag.textContent = text;
          Object.assign(tag.style, {
            position: 'absolute',
            top: `${rect.top + window.scrollY - 22}px`,
            left: `${rect.left + window.scrollX}px`,
            background: 'red',
            color: 'white',
            font: 'bold 12px sans-serif',
            padding: '2px 6px',
            zIndex: '99999',
          });
          document.body.appendChild(tag);
        }
      },
      { attr: MARK_ATTR, text: label },
      { timeout: 2_000 },
    );
  } catch {
    // El elemento no existe o no es visible: la aserción reportará el motivo.
  }
}

/** Quita recuadros y etiquetas para no contaminar los pasos siguientes. */
async function clearHighlights(page: Page): Promise<void> {
  await page.evaluate((attr) => {
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
      if (el.getAttribute(attr) === 'label') {
        el.remove();
      } else {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        el.removeAttribute(attr);
      }
    });
  }, MARK_ATTR);
}

/**
 * Valida un elemento dejando evidencia:
 * 1. Encierra en rojo el elemento validado.
 * 2. Ejecuta la aserción (usar `expect.soft` para que el test continúe si falla).
 * 3. Si falló, agrega la etiqueta "FAIL" sobre el elemento.
 * 4. Adjunta un screenshot al reporte: "OK - ..." o "FAIL - ...".
 */
export async function verify(
  page: Page,
  testInfo: TestInfo,
  target: Locator,
  description: string,
  assertion: () => Promise<void>,
): Promise<void> {
  const errorsBefore = testInfo.errors.length;
  await highlight(target);
  await assertion();
  const failed = testInfo.errors.length > errorsBefore;
  if (failed) {
    await highlight(target, `FAIL: ${description}`);
  }
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(`${failed ? 'FAIL' : 'OK'} - ${description}`, {
    body: screenshot,
    contentType: 'image/png',
  });
  await clearHighlights(page);
}
