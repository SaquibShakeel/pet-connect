import { Card, CardContent } from "@/components/ui/card";

export function FeedSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <Card className="overflow-hidden border-border/50">
            <CardContent className="p-0">
              {/* Post Header Skeleton */}
              <div className="p-4 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>

              {/* Post Image Skeleton */}
              <div className="aspect-square bg-muted"></div>

              {/* Post Actions Skeleton */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
} 