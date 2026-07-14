// Formă de date „plată" (serializabilă) pentru emailurile legate de comenzi.
// Nu importăm tipuri Prisma aici ca template-urile să poată fi randate și în
// afara contextului bazei de date (ex. scriptul de preview).
export type OrderEmailItem = {
  title: string;
  quantity: number;
  price: number;
};

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
};
