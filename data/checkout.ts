/** Datos ficticios del comprador (no son datos reales). */
export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const customer: Customer = {
  firstName: 'Ana',
  lastName: 'Prueba',
  postalCode: '080001',
};
