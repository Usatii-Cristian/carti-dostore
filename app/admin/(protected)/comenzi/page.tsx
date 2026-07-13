import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOrders } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge, ORDER_STATUS_LABELS } from "@/components/admin/StatusBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Comenzi — Admin BookStore" };

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS);

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { orders, total, totalPages } = await getAdminOrders({ status, page });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Comenzi</h1>
          <p className="text-sm text-slate-500">{total} comenzi</p>
        </div>

        <form method="GET" className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
          >
            <option value="">Toate statusurile</option>
            {STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Filtrează
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Comandă</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Dată</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Plată</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/comenzi/${order.id}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{order.customerName}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("ro-RO")}
                </td>
                <td className="px-4 py-3 text-slate-900">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Nicio comandă găsită.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/comenzi"
        currentPage={page}
        totalPages={totalPages}
        query={{ status }}
      />
    </div>
  );
}
