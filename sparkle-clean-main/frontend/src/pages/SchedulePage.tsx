import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, getNextCleaningDate, recordCleaning } from "@/lib/api";
import { Client } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, CheckCircle2, CalendarIcon, Sparkles } from "lucide-react";
import { format, addDays, startOfDay, isWithinInterval, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface UpcomingItem { client: Client; nextDate: Date; }

export default function SchedulePage() {
  const { data: clients, isLoading } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });
  const qc = useQueryClient();
  const [recordDialog, setRecordDialog] = useState<Client | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const now = new Date();
  const activeClients = (clients ?? []).filter(c => c.status === "active");

  const upcoming: UpcomingItem[] = activeClients
    .map(c => ({ client: c, nextDate: getNextCleaningDate(c) }))
    .filter((x): x is UpcomingItem => x.nextDate !== null)
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

  const noSchedule = activeClients.filter(c => !c.lastCleanedDate);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeek = upcoming.filter(u => isWithinInterval(u.nextDate, { start: weekStart, end: weekEnd }));
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
      toast.error("Failed to record cleaning");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Schedule</h1>
        <p className="text-muted-foreground text-sm">Week of {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dayItems = thisWeek.filter(u => isSameDay(u.nextDate, day));
            const isToday = isSameDay(day, now);
            return (
              <motion.div key={day.toISOString()} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={cn("shadow-card min-h-[120px] border-border/50 hover:shadow-elevated transition-shadow", isToday && "ring-2 ring-primary/30")}>
                  <CardHeader className="p-3 pb-1">
                    <p className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>{format(day, "EEE")}</p>
                    <p className={cn("text-lg font-bold", isToday ? "text-primary" : "text-foreground")}>{format(day, "d")}</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1.5">
                    {dayItems.map(item => (
                      <div key={item.client.id} className="bg-accent rounded-md p-1.5 text-xs">
                        <p className="font-medium text-foreground truncate">{item.client.name}</p>
                        <p className="text-muted-foreground">${item.client.pricePerVisit}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

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
                <p className="text-muted-foreground text-sm mt-1">No cleanings scheduled — time to add some clients</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {noSchedule.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-warning">First visit — schedule now</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setRecordDialog(c); setSelectedDate(new Date()); }}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Record
                  </Button>
                </div>
              ))}
              {upcoming.map(({ client: c, nextDate }, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{format(nextDate, "EEE, MMM d, yyyy")} · {c.serviceType} · ${c.pricePerVisit}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setRecordDialog(c); setSelectedDate(nextDate); }}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Record
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!recordDialog} onOpenChange={v => { if (!v) setRecordDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Completed Cleaning</DialogTitle></DialogHeader>
          {recordDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Recording for <strong>{recordDialog.name}</strong></p>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2" />{format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={d => d && setSelectedDate(d)} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this cleaning…" rows={3} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setRecordDialog(null)}>Cancel</Button>
                <Button onClick={handleRecord}><CheckCircle2 className="w-4 h-4 mr-1" /> Record & Create Invoice</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
