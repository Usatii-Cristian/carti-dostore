import { redirect } from "next/navigation";

/**
 * Adresa veche de confirmare. A fost înlocuită cu pagina comenzii
 * (`/comanda/<număr>?nou=1`): tiparul `/checkout/succes?order=…` era interpretat
 * de unele firewall-uri corporative drept site de jocuri de noroc, iar clienții
 * care comandau de la birou erau blocați (sesizare primită de la BNM).
 *
 * O păstrăm doar ca redirect, pentru linkurile vechi din emailuri și istoricul
 * browserului.
 */
export default async function CheckoutSuccessRedirect({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  redirect(order ? `/comanda/${encodeURIComponent(order)}?nou=1` : "/");
}
