"use client";

import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { useSalonReviews } from "@/hooks/use-reviews";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star } from "lucide-react";

export default function DashboardReviewsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const salonId = user?.uid || "";
  const { data: reviews, isLoading } = useSalonReviews(salonId, 100);

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-6">
        {t.salonDetail.reviews}
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
        </div>
      ) : (reviews?.length || 0) > 0 ? (
        <div className="space-y-3">
          {reviews!.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-border/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-foreground">{review.userName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {review.rating.toFixed(1)}
                </Badge>
              </div>

              <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">{t.salonDetail.noReviews}</p>
        </div>
      )}
    </div>
  );
}
