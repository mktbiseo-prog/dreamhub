import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { getCurrentUser } from "@/lib/auth";
import { getSupporterDashboard, formatPrice } from "@/lib/queries";

export const metadata: Metadata = {
  title: "My Supported Dreams | Dream Store",
  description: "Dreams you're supporting and your order history.",
};

export default async function MyDreamsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/auth/sign-in?callbackUrl=/my-dreams");

  const data = await getSupporterDashboard(user.id);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Impact Banner */}
        <div className="mb-10 rounded-card bg-gradient-to-r from-brand-600 to-orange-500 p-8 text-white">
          <h1 className="text-3xl font-bold">
            You&apos;ve supported {data?.dreamCount ?? 0} dream
            {data?.dreamCount !== 1 ? "s" : ""}
          </h1>
          <p className="mt-2 text-white/80">
            Total contribution:{" "}
            <span className="font-bold text-white">
              {formatPrice(data?.totalSpent ?? 0)}
            </span>
          </p>
        </div>

        {/* Supported Dreams */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Dreams I&apos;m Supporting
          </h2>

          {data && data.supportedDreams.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {data.supportedDreams.map((dream) => (
                <Link
                  key={dream.id}
                  href={`/stories/${dream.id}`}
                  className="group overflow-hidden rounded-card border border-gray-200 bg-white transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
                >
                  {dream.coverImage && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={dream.coverImage}
                        alt={dream.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-2 left-3 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        {dream.category}
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      {dream.creatorAvatar ? (
                        <img
                          src={dream.creatorAvatar}
                          alt={dream.creatorName}
                          className="h-6 w-6 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                          {dream.creatorName.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        {dream.creatorName}
                      </span>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white">
                      {dream.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {dream.supporterCount} supporters
                    </p>

                    {/* Products purchased */}
                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        Your purchases:
                      </p>
                      <ul className="space-y-1">
                        {dream.products.map((p, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 dark:text-gray-400"
                          >
                            {p.title} &middot; {formatPrice(p.price)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-card border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <p className="mb-4 text-gray-500">
                You haven&apos;t supported any dreams yet.
              </p>
              <Link href="/">
                <Button>Discover Dreams</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Order History */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Order History
          </h2>

          {data && data.orderHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-card border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Dream
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.orderHistory.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.createdAt}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {order.productTitle}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/stories/${order.storyId}`}
                          className="text-brand-600 hover:underline"
                        >
                          {order.storyTitle}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {formatPrice(order.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No orders yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PENDING:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    REFUNDED:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.PENDING}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
