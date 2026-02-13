"use client";

import { formatPrice } from "@/lib/mockData";

interface RevenueChartProps {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export default function RevenueChart({ monthlyRevenue }: RevenueChartProps) {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="w-full">
      <h4 className="mb-4 text-sm font-medium text-gray-500">
        Monthly Revenue (Last 6 Months)
      </h4>
      <div className="flex items-end gap-2 sm:gap-4" style={{ height: 180 }}>
        {monthlyRevenue.map((item) => {
          const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          const barHeight = Math.max(heightPercent, 2); // minimum 2% so empty months show a sliver

          return (
            <div
              key={item.month}
              className="group flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              {/* Tooltip on hover */}
              <div className="relative mb-1">
                <span className="invisible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                  {formatPrice(item.revenue)}
                </span>
              </div>

              {/* Bar */}
              <div
                className="w-full min-w-[24px] max-w-[60px] rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-300 group-hover:from-brand-700 group-hover:to-brand-500 dark:from-brand-500 dark:to-brand-300 dark:group-hover:from-brand-600 dark:group-hover:to-brand-400"
                style={{ height: `${barHeight}%` }}
              />

              {/* Month label */}
              <p className="mt-2 text-[10px] font-medium text-gray-500 sm:text-xs">
                {item.month}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue scale labels */}
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>{formatPrice(0)}</span>
        <span>{formatPrice(maxRevenue)}</span>
      </div>
    </div>
  );
}
