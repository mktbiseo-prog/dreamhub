"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";

export function FollowButton() {
  const [following, setFollowing] = useState(false);

  return (
    <Button
      variant={following ? "secondary" : "outline"}
      size="sm"
      onClick={() => setFollowing((prev) => !prev)}
    >
      {following ? "Following" : "Follow This Dream"}
    </Button>
  );
}
