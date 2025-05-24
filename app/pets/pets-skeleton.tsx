import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PetsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-8">
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden border-border/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-16 w-16 bg-muted rounded-full animate-pulse"></div>
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 