import React from "react";

export default function loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-background">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-muted-foreground text-center">
          Please wait while we prepare your workspace
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Skeleton UI for content being loaded */}
        <div className="space-y-2">
          <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
