/** Productos usados en los casos, con el precio que muestra el catálogo. */
export const products = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const;

/** Tasa de impuesto observada en el resumen del checkout (8 %). */
export const TAX_RATE = 0.08;

/** Formatea un número como lo muestra la app: $29.99 */
export const money = (value: number): string => `$${value.toFixed(2)}`;
