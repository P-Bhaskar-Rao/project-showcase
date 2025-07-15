import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectSkeleton = () => (
  <Card className="group bg-white border border-gray-200 flex flex-col h-full">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4 mb-2 rounded" />
          <div className="space-y-1 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-2 min-w-0">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-1 space-y-4">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="min-h-[56px]">
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-5/6 mb-2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 mb-1 rounded" />
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-14 rounded" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2 items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 min-w-[80px] h-7 rounded" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProjectSkeleton; 