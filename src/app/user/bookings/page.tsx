"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, MapPin, Star, Eye, Loader2, X } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useUserBookings, useCancelBooking } from "@/hooks/use-bookings";
import { useSubmitReview } from "@/hooks/use-reviews";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { BookingModel } from "@/types/booking";

const statusColors: Record<string, string> = {
  inprocess: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

function BookingCard({ booking, t, onCancel, onReview }: { booking: BookingModel; t: ReturnType<typeof useLocale>["t"]; onCancel?: (booking: BookingModel) => void; onReview?: (booking: BookingModel) => void }) {
  const startDate = new Date(booking.schedule?.startAt || Date.now());

  return (
    <div className="bg-white rounded-xl border border-border/50 p-4">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-xl bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
          <span className="text-[#C9AA8B] font-bold text-lg">
            {booking.salon?.shopName?.charAt(0) || "S"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {booking.salon?.shopName || "Salon"}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${statusColors[booking.status] || ""}`}
            >
              {booking.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{booking.salon?.city || ""}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {startDate.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {booking.services?.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-[#F5EDE6] text-[#8B7355] rounded-full">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="font-semibold text-foreground">
          {t.common.currency}{booking.pricing?.total || 0}
        </span>
        <div className="flex gap-2">
          <Link href={`/bookings/${booking.bookingId}`}>
            <Button variant="outline" size="sm" className="text-xs rounded-lg h-8 gap-1">
              <Eye className="h-3 w-3" />
              {t.userBookings.viewDetails}
            </Button>
          </Link>
          {(booking.status === "inprocess" || booking.status === "pending") && onCancel && (
            <Button variant="outline" size="sm" className="text-xs rounded-lg h-8 text-destructive border-destructive/30 hover:bg-destructive/5 gap-1"
              onClick={() => onCancel(booking)}>
              <X className="h-3 w-3" />
              {t.userBookings.cancel}
            </Button>
          )}
          {booking.status === "completed" && !booking.review?.isReviewed && onReview && (
            <Button size="sm" className="text-xs rounded-lg h-8 bg-[#C9AA8B] hover:bg-[#B8956F] text-white gap-1"
              onClick={() => onReview(booking)}>
              <Star className="h-3 w-3" />
              {t.userBookings.writeReview}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { t } = useLocale();
  const { uid, isLoggedIn } = useAuth();
  const router = useRouter();
  const { data: bookings, isLoading } = useUserBookings();
  const cancelMutation = useCancelBooking();
  const reviewMutation = useSubmitReview();

  // --- All useState hooks BEFORE any conditional returns (Rules of Hooks) ---
  const [bookingToCancel, setBookingToCancel] = useState<BookingModel | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Review state
  const [reviewBooking, setReviewBooking] = useState<BookingModel | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const predefinedReasons = [
    "Schedule conflict",
    "Found a better deal",
    "Changed my mind",
    "Booked elsewhere",
    "Salon is too far",
    "Wait time too long",
    "Personal emergency",
    "Other"
  ];

  const inprocess = bookings?.filter((b) => b.status === "inprocess" || b.status === "pending") || [];
  const completed = bookings?.filter((b) => b.status === "completed") || [];
  const cancelled = bookings?.filter((b) => b.status === "cancelled") || [];

  const handleCancelClick = (booking: BookingModel) => {
    setBookingToCancel(booking);
    setSelectedReason("");
    setCancelReason("");
  };

  const handleReviewClick = (booking: BookingModel) => {
    setReviewBooking(booking);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleReviewSubmit = () => {
    if (!reviewBooking || !uid) return;
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    reviewMutation.mutate({
      salonId: reviewBooking.salon?.salonId || "",
      bookingId: reviewBooking.bookingId,
      userId: uid,
      rating: reviewRating,
      comment: reviewComment.trim(),
    }, {
      onSuccess: () => {
        toast.success("Review submitted successfully!");
        setReviewBooking(null);
      },
      onError: () => toast.error("Failed to submit review"),
    });
  };

  const confirmCancel = () => {
    if (!bookingToCancel) return;

    const finalReason = selectedReason === "Other" ? cancelReason.trim() : selectedReason;
    if (!finalReason) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setIsCancelling(true);
    cancelMutation.mutate({
      bookingId: bookingToCancel.bookingId,
      reason: finalReason,
      receiverId: bookingToCancel.salon?.salonId || "",
      salonName: bookingToCancel.salon?.shopName || "Salon",
    }, {
      onSuccess: () => {
        toast.success("Booking cancelled successfully");
        setBookingToCancel(null);
      },
      onError: () => toast.error("Failed to cancel booking"),
      onSettled: () => setIsCancelling(false),
    });
  };

  return (
    <>
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            {t.userBookings.title}
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
            </div>
          ) : (
            <Tabs defaultValue="inprocess">
              <TabsList className="bg-white border border-border/50 rounded-xl p-1 w-full">
                <TabsTrigger value="inprocess" className="flex-1 rounded-lg text-sm data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                  {t.userBookings.tabs.inprocess} ({inprocess.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 rounded-lg text-sm data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                  {t.userBookings.tabs.completed} ({completed.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="flex-1 rounded-lg text-sm data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                  {t.userBookings.tabs.cancelled} ({cancelled.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inprocess" className="mt-4 space-y-3">
                {inprocess.length > 0 ? (
                  inprocess.map((b) => <BookingCard key={b.bookingId} booking={b} t={t} onCancel={handleCancelClick} />)
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">{t.userBookings.noBookings}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-4 space-y-3">
                {completed.length > 0 ? (
                  completed.map((b) => <BookingCard key={b.bookingId} booking={b} t={t} onReview={handleReviewClick} />)
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">{t.userBookings.noBookings}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-4 space-y-3">
                {cancelled.length > 0 ? (
                  cancelled.map((b) => <BookingCard key={b.bookingId} booking={b} t={t} />)
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">{t.userBookings.noBookings}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={(open) => { if (!open) setReviewBooking(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>

          {reviewBooking && (
            <div className="py-2">
              {/* Salon info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
                  <span className="text-[#C9AA8B] font-bold text-lg">
                    {reviewBooking.salon?.shopName?.charAt(0) || "S"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">
                    {reviewBooking.salon?.shopName || "Salon"}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{reviewBooking.salon?.city || ""}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  {reviewBooking.status}
                </Badge>
              </div>

              <div className="border-t border-border/50 pt-4">
                {/* Rating */}
                <p className="text-center text-sm font-medium text-foreground mb-3">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-1.5 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${reviewRating >= star
                          ? "fill-[#C9AA8B] text-[#C9AA8B]"
                          : "fill-transparent text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <Textarea
                  placeholder="Add a comment (optional)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setReviewBooking(null)} disabled={reviewMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewMutation.isPending || reviewRating === 0}
              className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white"
            >
              {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reason Dialog */}
      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              Please select a reason for cancelling this booking at <span className="font-semibold text-foreground">{bookingToCancel?.salon?.shopName || "the salon"}</span>.
            </p>

            <div className="space-y-3 mb-4">
              {predefinedReasons.map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedReason === reason ? 'border-[#C9AA8B]' : 'border-border group-hover:border-border/80'}`}>
                    {selectedReason === reason && <div className="w-2.5 h-2.5 rounded-full bg-[#C9AA8B]" />}
                  </div>
                  <span className={`text-sm ${selectedReason === reason ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Other" && (
              <Textarea
                placeholder="Please type your reason here..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="resize-none mt-2"
                rows={3}
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setBookingToCancel(null)} disabled={isCancelling}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={isCancelling || !selectedReason || (selectedReason === "Other" && !cancelReason.trim())}
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
