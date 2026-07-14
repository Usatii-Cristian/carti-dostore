import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart, Wallet, PackageX } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Dashboard — Admin Dostore Carti" };

export default async function AdminDashboardPage() {
  const { totalOrders, totalRevenue, lowStockBooks, recentOrders } = await getDashboardStats();

  const cards = [
    {
      label: "Total comenzi",
      value: totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      label: "Venit total (comenzi plătite)",
      value: formatPrice(totalRevenue),
      icon: Wallet,
    },
    {
      label: "Cărți cu stoc sub 5",
      value: lowStockBooks.length.toString(),
      icon: PackageX,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-semibold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Ultimele comenzi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Comandă</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Plată</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/admin/comenzi/${order.id}`}
                        className="font-medium text-navy hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-700">{order.customerName}</td>
                    <td className="py-2.5 pr-4 text-slate-900">{formatPrice(order.total)}</td>
                    <td className="py-2.5 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-2.5">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                  </tr>
                ))}

                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Nicio comandă încă.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Stoc redus</h2>
          <ul className="space-y-2.5">
            {lowStockBooks.map((book) => (
              <li key={book.id} className="flex items-center justify-between gap-3 text-sm">
                <Link
                  href={`/admin/carti/${book.id}/editare`}
                  className="truncate text-navy hover:underline"
                >
                  {book.title}
                </Link>
                <span className="shrink-0 font-semibold text-red-600">{book.stock} buc.</span>
              </li>
            ))}

            {lowStockBooks.length === 0 && (
              <li className="text-sm text-slate-500">Toate cărțile au stoc suficient.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
