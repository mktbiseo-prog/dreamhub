import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorDashboard, formatPrice } from "@/lib/queries";

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

        {/* Stats Cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {data ? formatPrice(data.totalRevenue) : "$0.00"}
            </p>
          </div>
          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-medium text-gray-500">
              Total Supporters
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {data?.totalSupporters ?? 0}
            </p>
          </div>
          <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {data?.totalOrders ?? 0}
            </p>
          </div>
        </div>

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
