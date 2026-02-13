"use client";

import { Button } from "@dreamhub/ui";
import { useCafeStore } from "@/store/useCafeStore";
import { MOCK_CAFE_ID } from "@/data/mockCafe";

export function CheckInButton() {
  const { isCheckedIn, checkIn, checkOut } = useCafeStore();

  const handleClick = () => {
    if (isCheckedIn) {
      checkOut(MOCK_CAFE_ID);
    } else {
      checkIn(MOCK_CAFE_ID, "manual");
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full"
      variant={isCheckedIn ? "outline" : "default"}
      size="lg"
    >
      {isCheckedIn ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Check Out
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Check In
        </span>
      )}
    </Button>
  );
}
