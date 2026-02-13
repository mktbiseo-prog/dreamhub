import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorDashboard, formatPrice } from "@/lib/queries";
import RevenueChart from "./RevenueChart";
import StripeConnectCard from "./StripeConnectCard";

export const metadata: Metadata = {
  title: "Creator Dashboard | Dream Store",
  description: "Manage your dreams, products, and supporters.",
};

export default async function CreatorDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/auth/sign-in?callbackUrl=/dashboard");

  const data = await getCreatorDashboard(user.id);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name?.split(" ")[0] || "Dreamer"}
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your dreams, track supporters, and grow your impact.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">
                Total Revenue
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {data ? formatPrice(data.totalRevenue) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              From completed orders
            </p>
          </div>

          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <svg
                  className="h-4 w-4 text-orange-600 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">
                Platform Fees
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {data ? formatPrice(data.totalPlatformFees) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              10% platform commission
            </p>
          </div>

          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">
                Net Earnings
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {data ? formatPrice(data.netEarnings) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Your payout amount
            </p>
          </div>

          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="h-4 w-4 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">
                Available Balance
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {data ? formatPrice(data.netEarnings) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Ready for payout
            </p>
          </div>
        </div>

        {/* Revenue Breakdown Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Revenue Breakdown
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue Chart */}
            <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              {data && data.monthlyRevenue.length > 0 ? (
                <RevenueChart monthlyRevenue={data.monthlyRevenue} />
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-sm text-gray-500">
                    No revenue data yet. Start selling to see your chart!
                  </p>
                </div>
              )}
            </div>

            {/* Per-Dream Revenue Table */}
            <div className="rounded-card border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h4 className="text-sm font-medium text-gray-500">
                  Earnings Per Dream
                </h4>
              </div>

              {data && data.perDreamRevenue.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                          Dream
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                          Orders
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                          Gross
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                          Fee (10%)
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                          Net
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {data.perDreamRevenue.map((dream) => (
                        <tr key={dream.id}>
                          <td className="max-w-[160px] truncate px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                            {dream.title}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">
                            {dream.orderCount}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">
                            {formatPrice(dream.grossRevenue)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right text-orange-600 dark:text-orange-400">
                            -{formatPrice(dream.platformFees)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-green-600 dark:text-green-400">
                            {formatPrice(dream.netEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex h-[140px] items-center justify-center px-6">
                  <p className="text-sm text-gray-500">
                    No completed orders yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Payment Settings (Stripe Connect) */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Payment Settings
          </h2>
          <StripeConnectCard
            stripeConnectId={data?.stripeConnectId ?? null}
          />
        </section>

        {/* My Dreams */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Dreams
            </h2>
            <Link href="/stories/create">
              <Button size="sm">Start a New Dream</Button>
            </Link>
          </div>

          {data && data.stories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.stories.map((story) => {
                const completedCount = story.milestones.filter(
                  (m) => m.completed
                ).length;
                const progressPercent =
                  story.milestones.length > 0
                    ? Math.round(
                        (completedCount / story.milestones.length) * 100
                      )
                    : 0;

                return (
                  <div
                    key={story.id}
                    className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {story.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {story.category} &middot; Created {story.createdAt}
                        </p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {story.orderCount} orders
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-orange-400 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{story.productCount} products</span>
                      <span>&middot;</span>
                      <span>{story.followerCount} followers</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={`/stories/${story.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/stories/${story.id}/products/create`}>
                        <Button variant="outline" size="sm">
                          + Add Product
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-card border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <p className="mb-4 text-gray-500">
                You haven&apos;t started any dreams yet.
              </p>
              <Link href="/stories/create">
                <Button>Start Your Dream</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Recent Payouts Table */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Recent Payouts
          </h2>

          {data && data.recentOrders.length > 0 ? (
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
                      Buyer
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">
                      Gross Amount
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">
                      Platform Fee
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">
                      Your Payout
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.createdAt}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-gray-900 dark:text-white">
                        {order.productTitle}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.buyerAvatar ? (
                            <img
                              src={order.buyerAvatar}
                              alt={order.buyerName}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                              {order.buyerName.charAt(0)}
                            </div>
                          )}
                          <span className="text-gray-900 dark:text-white">
                            {order.buyerName}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatPrice(order.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-orange-600 dark:text-orange-400">
                        -{formatPrice(order.platformFee)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                        {formatPrice(order.creatorPayout)}
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
            <p className="text-sm text-gray-500">
              No payout records yet. Start selling to see your earnings!
            </p>
          )}
        </section>

        {/* Recent Orders */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Recent Orders
          </h2>

          {data && data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto rounded-card border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Supporter
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Product
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
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.createdAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.buyerAvatar ? (
                            <img
                              src={order.buyerAvatar}
                              alt={order.buyerName}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                              {order.buyerName.charAt(0)}
                            </div>
                          )}
                          <span className="text-gray-900 dark:text-white">
                            {order.buyerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {order.productTitle}
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
            <p className="text-sm text-gray-500">
              No orders yet. Share your dream to start getting supporters!
            </p>
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
