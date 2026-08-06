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
  /**
   * Cum plătește clientul. Schimbă textul confirmării: la plata la livrare nu
   * are rost să-i promitem „un mesaj când plata e confirmată" — nu există nicio
   * plată de confirmat online.
   */
  paymentMethod?: "ONLINE" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY";
};
