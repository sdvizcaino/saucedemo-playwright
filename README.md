# SauceDemo · Pruebas E2E con Playwright

Suite de pruebas end-to-end para [SauceDemo](https://www.saucedemo.com) con **Playwright + TypeScript** y el patrón **Page Object Model**. Cubre el flujo de compra, casos negativos, usuarios con comportamiento defectuoso y el ordenamiento del catálogo.

## Qué cubre

| Spec | Qué valida | Tags |
|---|---|---|
| `tests/purchase-flow.spec.ts` | Login, detalle de producto, carrito, checkout, totales e impuesto, y confirmación | `@smoke` `@regression` |
| `tests/negative.spec.ts` | Carrito vacío, campos obligatorios, campos con solo espacios, usuario bloqueado y acceso sin sesión | `@negative` `@regression` |
| `tests/users.spec.ts` | `problem_user` (datos del comprador, agregar al carrito, detalle) y tiempos de `performance_glitch_user` | `@regression` |
| `tests/sort.spec.ts` | Las 4 opciones de ordenamiento, con el resultado esperado calculado desde los datos | `@sort` `@regression` |
| `tests/smoke.spec.ts` | Login y catálogo visible | `@smoke` |

## Tests que fallan a propósito

Estos tests esperan el comportamiento **correcto** y hoy fallan porque documentan defectos reales de la aplicación. No se marcan con `test.fail()`: el pipeline queda en rojo como evidencia hasta que el defecto se corrija.

| Test | Defecto que documenta |
|---|---|
| CN-01 | Se puede iniciar el checkout con el carrito vacío |
| CN-03 | El formulario acepta campos con solo espacios |
| USR-01 | `problem_user`: el apellido reemplaza el nombre y no se puede continuar |
| USR-02 | `problem_user`: 3 de 6 productos no se pueden agregar al carrito |
| USR-03 | `problem_user`: el detalle abre otro producto |
| USR-04 | `performance_glitch_user`: login y ordenamiento tardan unos 5 s (presupuesto: 2.5 s navegación, 0.5 s acción) |

## Evidencia

Cada validación usa el fixture `check()`: resalta en rojo el elemento validado, adjunta una captura `OK` o `FAIL` al reporte y, si falla, etiqueta el elemento con el motivo. Las aserciones son `expect.soft`, así que un test sigue ejecutándose después de una falla y reporta todas las que encuentre. Además se graba video de cada test.

## Estructura

```
pages/      Page Objects (una clase por pantalla)
fixtures/   Fixture de Playwright con los Page Objects y check()
data/       Usuarios, productos, datos del comprador y presupuestos de tiempo
utils/      Helper de evidencia (recuadro rojo + captura)
tests/      Specs
```

## Cómo ejecutar

Requisitos: Node.js 22 o superior.

```bash
npm ci
npx playwright install chromium
cp .env.example .env

npm test                  # suite completa
npm run test:smoke        # solo @smoke
npm run test:regression   # solo @regression
npx playwright test --grep @sort
npm run report            # abre el reporte HTML
```

## CI

GitHub Actions ejecuta la suite en cada push a `main`, en cada pull request y a demanda. El reporte HTML, con capturas y videos, se publica como artefacto aunque haya fallas.
