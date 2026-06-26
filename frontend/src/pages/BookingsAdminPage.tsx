import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api";
import { Booking } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MapPin, CalendarIcon, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatKES } from "@/lib/utils";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const variants: Record<Booking["status"], string> = {
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };
  return (
    <Badge variant="outline" className={variants[status]}>
      {status}
    </Badge>
  );
}

function ActionsTakenBadge({ booking }: { booking: Booking }) {
  if (booking.status === "cancelled") {
    return <Badge variant="outline" className="text-red-600">❌ Cancelled</Badge>;
  }
  if (booking.convertedToClient) {
    return <Badge variant="outline" className="text-green-600">✅ Client Created</Badge>;
  }
  if (booking.status === "pending") {
    return <Badge variant="outline" className="text-orange-600">⏳ Awaiting Confirmation</Badge>;
  }
  return null;
}

export default function BookingsAdminPage() {
  const qc = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmedInfo, setConfirmedInfo] = useState<Record<string, string>>({});

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingsApi.list,
  });

  const handleConfirm = async (booking: Booking) => {
    setConfirmingId(booking.id);
    try {
      const result = await bookingsApi.confirmBooking(booking.id);
      const invoiceNumber = result.invoice?.invoiceNumber || "created";
      setConfirmedInfo(prev => ({
        ...prev,
        [booking.id]: `Client added to system · Invoice ${invoiceNumber} created`,
      }));
      toast.success("✅ Booking confirmed! Client and invoice created successfully.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm booking");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = async (booking: Booking) => {
    setCancellingId(booking.id);
    try {
      await bookingsApi.updateStatus(booking.id, "cancelled");
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bookings</h1>
        <p className="text-muted-foreground text-sm">
          Manage incoming booking requests from the public booking page
        </p>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-display">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No bookings yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Bookings submitted through the public booking page will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Reference</th>
                    <th className="pb-3 pr-4 font-medium">Client</th>
                    <th className="pb-3 pr-4 font-medium hidden md:table-cell">Service</th>
                    <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Date & Time</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Actions Taken</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((booking, i) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {booking.bookingRef}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{booking.fullName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {booking.phone}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {booking.address}
                        </p>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">{booking.serviceType}</td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-xs">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(booking.preferredDate), "MMM d, yyyy")} · {booking.preferredTime}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium">{formatKES(booking.totalPrice)}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={booking.status} />
                        {confirmedInfo[booking.id] && (
                          <p className="text-xs text-green-600 mt-1">{confirmedInfo[booking.id]}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <ActionsTakenBadge booking={booking} />
                      </td>
                      <td className="py-3">
                        {booking.status === "pending" && !booking.convertedToClient && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={confirmingId === booking.id}
                              onClick={() => handleConfirm(booking)}
                            >
                              {confirmingId === booking.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancel(booking)}
                            >
                              {cancellingId === booking.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
