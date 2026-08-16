import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildReceiptPdf } from "@/lib/email/pdf/receipt-pdf";

/**
 * Bonul electronic al unei comenzi, ca PDF, la cerere din admin.
 *
 * Există pentru două motive practice: clientul care sună și cere din nou bonul
 * („l-am șters din email") și verificarea că generarea PDF chiar merge pe
 * serverul de producție — fonturile și siglele sunt fișiere citite la runtime,
 * incluse manual în bundle (vezi outputFileTracingIncludes din next.config.ts).
 *
 * E sub /api/admin/*, deci cere sesiune de admin (vezi proxy.ts).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  }

  let pdf: Buffer;
  try {
    pdf = await buildReceiptPdf({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    building: order.building,
    apartment: order.apartment,
    city: order.city,
    items: order.items.map((item) => ({
      title: item.title,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    paymentReference: order.paymentId,
    // Bonul poartă momentul plății; pentru comenzile la livrare (încă neîncasate)
    // rămâne data comenzii, ca documentul să aibă totuși un reper corect.
    paidAt: order.paymentStatus === "PAID" ? order.updatedAt : order.createdAt,
    });
  } catch (error) {
    // Ruta e doar pentru admin, deci putem întoarce motivul exact — altfel
    // depanarea generării PDF pe serverless ar fi oarbă.
    console.error("[bon] generarea PDF a eșuat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Bon-${order.orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
