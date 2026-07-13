import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin/orders";
import { updateOrderStatus } from "@/lib/actions/admin-orders";
import { formatPrice } from "@/lib/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Detalii comandă — Admin BookStore" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/comenzi" className="mb-4 inline-block text-sm text-navy hover:underline">
        ← Înapoi la comenzi
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Comanda #{order.orderNumber}</h1>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Produse</h2>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-slate-500">Cantitate: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="text-slate-900">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Transport</dt>
                <dd className="text-slate-900">{formatPrice(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt className="text-slate-900">Total</dt>
                <dd className="text-slate-900">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Client</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Nume</dt>
                <dd className="text-right text-slate-900">{order.customerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-right text-slate-900">{order.customerEmail}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Telefon</dt>
                <dd className="text-right text-slate-900">{order.customerPhone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Adresă</dt>
                <dd className="text-right text-slate-900">
                  {order.shippingAddress}, {order.city}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Istoric plată</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">ID plată (maib)</dt>
                <dd className="text-right text-slate-900">{order.paymentId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Comandă creată</dt>
                <dd className="text-right text-slate-900">
                  {new Date(order.createdAt).toLocaleString("ro-RO")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Ultima actualizare</dt>
                <dd className="text-right text-slate-900">
                  {new Date(order.updatedAt).toLocaleString("ro-RO")}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Schimbă status</h2>
          <form action={updateOrderStatus.bind(null, order.id)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status comandă
              </label>
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status plată
              </label>
              <select
                name="paymentStatus"
                defaultValue={order.paymentStatus}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
            >
              Actualizează
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
