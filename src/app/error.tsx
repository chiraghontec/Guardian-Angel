
"use client"; 

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Something went wrong!
      </h1>
      <p className="text-muted-foreground mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="px-6 py-3"
      >
        Try again
      </Button>
    </div>
  );
}
