import { useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, getNextCleaningDate, recordCleaning, bookingsApi } from "@/lib/api";
import { Client, Booking } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, CheckCircle2, CalendarIcon, Sparkles, Phone, MapPin } from "lucide-react";
import {
  format, addDays, startOfDay, isWithinInterval,
  startOfWeek, endOfWeek, isSameDay,
} from "date-fns";
import { cn, formatKES } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface UpcomingItem {
  client: Client;
  nextDate: Date;
}

export default function SchedulePage() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.list,
  });
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingsApi.list,
  });
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"schedule" | "bookings">("schedule");
  const [recordDialog, setRecordDialog] = useState<Client | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [bookingStatusDialog, setBookingStatusDialog] = useState<Booking | null>(null);

  const now = new Date();
  const activeClients = (clients ?? []).filter(c => c.status === "active");

  const upcoming: UpcomingItem[] = activeClients
    .map(c => ({ client: c, nextDate: getNextCleaningDate(c) }))
    .filter((x): x is UpcomingItem => x.nextDate !== null)
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

  const noSchedule = activeClients.filter(c => !c.lastCleanedDate);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeek = upcoming.filter(u =>
    isWithinInterval(u.nextDate, { start: weekStart, end: weekEnd })
  );
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleRecord = async () => {
    if (!recordDialog) return;
    try {
      await recordCleaning(recordDialog.id, selectedDate, notes);
      toast.success(`Cleaning recorded for ${recordDialog.name}`);
      setRecordDialog(null);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      toast.error("Failed to record cleaning. Please try again.");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      if (newStatus === "confirmed") {
        await bookingsApi.confirmBooking(bookingId);
        toast.success("✅ Booking confirmed! Client and invoice created successfully.");
        qc.invalidateQueries({ queryKey: ["clients"] });
        qc.invalidateQueries({ queryKey: ["invoices"] });
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      } else {
        await bookingsApi.updateStatus(bookingId, newStatus);
        toast.success(`Booking ${newStatus}`);
      }
      setBookingStatusDialog(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update booking status";
      toast.error(message);
    }
  };

  const pendingBookings = bookings.filter((b: Booking) => b.status === "pending");
  const confirmedBookings = bookings.filter((b: Booking) => b.status === "confirmed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Schedule & Bookings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your cleaning schedule and pending bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        <button
          onClick={() => setActiveTab("schedule")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "schedule"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDays className="w-4 h-4 inline mr-2" />
          Schedule
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Phone className="w-4 h-4 inline mr-2" />
          Bookings {pendingBookings.length > 0 && <Badge className="ml-2">{pendingBookings.length}</Badge>}
        </button>
      </div>

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dayItems = thisWeek.filter(u => isSameDay(u.nextDate, day));
            const isToday = isSameDay(day, now);
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={cn(
                  "shadow-card min-h-[120px] border-border/50 hover:shadow-elevated transition-shadow",
                  isToday && "ring-2 ring-primary/30"
                )}>
                  <CardHeader className="p-3 pb-1">
                    <p className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                      {format(day, "EEE")}
                    </p>
                    <p className={cn("text-lg font-bold", isToday ? "text-primary" : "text-foreground")}>
                      {format(day, "d")}
                    </p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1.5">
                    {dayItems.map(item => (
                      <div key={item.client.id} className="bg-accent rounded-md p-1.5 text-xs">
                        <p className="font-medium text-foreground truncate">{item.client.name}</p>
                        <p className="text-muted-foreground">{formatKES(item.client.pricePerVisit)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* All Upcoming Cleanings List */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-display">All Upcoming Cleanings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 && noSchedule.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80&auto=format&fit=crop"
                alt=""
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                <Sparkles className="w-10 h-10 text-primary mb-3" />
                <p className="text-lg font-display font-bold text-foreground">All clear!</p>
                <p className="text-muted-foreground text-sm mt-1">
                  No cleanings scheduled — add some clients to get started
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {/* Clients with no first visit yet */}
              {noSchedule.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30"
                >
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {c.address} · First visit not yet recorded
                    </p>
                    {c.startDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        📅 Start date: {format(new Date(c.startDate), "EEE, MMM d, yyyy")}
                      </p>
                    )}
                    {c.notes?.includes("Booking ref:") && (
                      <p className="text-xs text-muted-foreground/70 italic">
                        {c.notes.match(/Booking ref: [^\s|]+/)?.[0]}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRecordDialog(c); setSelectedDate(new Date()); }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Record
                  </Button>
                </div>
              ))}

              {/* Clients with upcoming scheduled visits */}
              {upcoming.map(({ client: c, nextDate }, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{c.name}</p>
                      <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {c.frequency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(nextDate, "EEE, MMM d, yyyy")} · {c.serviceType} · {formatKES(c.pricePerVisit)}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.address}</p>
                    {c.startDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        📅 Start date: {format(new Date(c.startDate), "EEE, MMM d, yyyy")}
                      </p>
                    )}
                    {c.notes?.includes("Booking ref:") && (
                      <p className="text-xs text-muted-foreground/70 italic">
                        {c.notes.match(/Booking ref: [^\s|]+/)?.[0]}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRecordDialog(c); setSelectedDate(nextDate); }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Record
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Cleaning Dialog */}
      <Dialog
        open={!!recordDialog}
        onOpenChange={(v: boolean) => { if (!v) setRecordDialog(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Completed Cleaning</DialogTitle>
          </DialogHeader>
          {recordDialog && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">{recordDialog.name}</p>
                <p className="text-xs text-muted-foreground">{recordDialog.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recordDialog.serviceType} · {formatKES(recordDialog.pricePerVisit)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Date of Cleaning</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d: Date | undefined) => d && setSelectedDate(d)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Any notes about this cleaning session…"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setRecordDialog(null)}>Cancel</Button>
                <Button onClick={handleRecord}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Record & Generate Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
        {bookingsLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <>
            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <Card className="shadow-card border-border/50 border-orange-500/30 bg-orange-50/5 dark:bg-orange-950/10">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
                    Pending Bookings ({pendingBookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingBookings.map((booking: Booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-orange-500/30 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{booking.fullName}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{booking.bookingRef}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBookingStatusDialog(booking)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          {booking.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {format(new Date(booking.preferredDate), "MMM d, yyyy")} - {booking.preferredTime}
                        </div>
                        <p>Service: {booking.serviceType}</p>
                        {booking.email && <p>Email: {booking.email}</p>}
                        {booking.notes && <p className="text-xs italic">Notes: {booking.notes}</p>}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Confirmed Bookings */}
            {confirmedBookings.length > 0 && (
              <Card className="shadow-card border-border/50 border-green-500/30 bg-green-50/5 dark:bg-green-950/10">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    Confirmed Bookings ({confirmedBookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {confirmedBookings.map((booking: Booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-green-500/30 bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{booking.fullName}</p>
                          <Badge className="mt-1 text-xs bg-green-600">Confirmed</Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          {booking.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {format(new Date(booking.preferredDate), "MMM d, yyyy")} - {booking.preferredTime}
                        </div>
                        <p>Service: {booking.serviceType}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* No Bookings */}
            {pendingBookings.length === 0 && confirmedBookings.length === 0 && (
              <Card className="shadow-card border-border/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bookings submitted through the public booking page will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      )}

      {/* Update Booking Status Dialog */}
      <Dialog
        open={!!bookingStatusDialog}
        onOpenChange={(v: boolean) => { if (!v) setBookingStatusDialog(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
          </DialogHeader>
          {bookingStatusDialog && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">{bookingStatusDialog.fullName}</p>
                <p className="text-xs text-muted-foreground mt-1">{bookingStatusDialog.bookingRef}</p>
                <p className="text-xs text-muted-foreground">{bookingStatusDialog.address}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(bookingStatusDialog.preferredDate), "MMM d, yyyy")}</p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleUpdateBookingStatus(bookingStatusDialog.id, "confirmed")}
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpdateBookingStatus(bookingStatusDialog.id, "cancelled")}
                >
                  Cancel Booking
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setBookingStatusDialog(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}