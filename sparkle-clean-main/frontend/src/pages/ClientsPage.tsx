import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, getNextCleaningDate, exportToCSV } from "@/lib/api";
import { Client } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Download, Pencil, Trash2, Phone, Mail, MapPin, Users, Home } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  email: z.string().trim().email("Invalid email").or(z.literal("")).optional(),
  address: z.string().trim().min(1, "Address is required").max(200),
  serviceType: z.enum(["Standard", "Deep Clean", "Move-In/Out", "Other"]),
  pricePerVisit: z.coerce.number().positive("Price must be > 0"),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  status: z.enum(["active", "inactive"]),
  notes: z.string().max(500).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

function ClientFormDialog({ client, onClose }: { client?: Client; onClose: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      name: client.name, phone: client.phone, email: client.email, address: client.address,
      serviceType: client.serviceType, pricePerVisit: client.pricePerVisit, frequency: client.frequency,
      status: client.status, notes: client.notes,
    } : {
      serviceType: "Standard", frequency: "weekly", status: "active", pricePerVisit: 100,
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client) {
        await clientsApi.update(client.id, data);
        toast.success("Client updated");
      } else {
        await clientsApi.create({
          name: data.name, phone: data.phone, email: data.email || "", address: data.address,
          serviceType: data.serviceType, pricePerVisit: data.pricePerVisit, frequency: data.frequency,
          status: data.status, notes: data.notes || "", lastCleanedDate: null, createdBy: user?.id ?? "",
        });
        toast.success("Client added");
      }
      qc.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input {...register("name")} placeholder="Client name" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Phone *</Label>
          <Input {...register("phone")} placeholder="(305) 555-0000" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input {...register("email")} placeholder="email@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Price per Visit *</Label>
          <Input type="number" step="0.01" {...register("pricePerVisit")} />
          {errors.pricePerVisit && <p className="text-xs text-destructive">{errors.pricePerVisit.message}</p>}
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Address *</Label>
          <Input {...register("address")} placeholder="Full address" />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Service Type</Label>
          <Controller name="serviceType" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Standard", "Deep Clean", "Move-In/Out", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </div>
        <div className="space-y-1.5">
          <Label>Frequency</Label>
          <Controller name="frequency" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller name="status" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <Textarea {...register("notes")} placeholder="Any special instructions…" rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{client ? "Update" : "Add Client"}</Button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const { data: clients, isLoading } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | undefined>();

  const filtered = (clients ?? []).filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q);
  });

  const handleDelete = async (id: string) => {
    await clientsApi.remove(id);
    toast.success("Client deleted");
    qc.invalidateQueries({ queryKey: ["clients"] });
  };

  const handleExport = () => {
    exportToCSV(filtered.map(c => ({
      name: c.name, phone: c.phone, email: c.email, address: c.address,
      serviceType: c.serviceType, pricePerVisit: c.pricePerVisit, frequency: c.frequency, status: c.status,
    })), "sparkleclean-clients.csv");
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1" />CSV</Button>
          <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditClient(undefined); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Client</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editClient ? "Edit Client" : "New Client"}</DialogTitle></DialogHeader>
              <ClientFormDialog client={editClient} onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, or address…" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden shadow-elevated"
        >
          <img
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-64 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
            <Home className="w-12 h-12 text-primary mb-3" />
            <p className="text-lg font-display font-bold text-foreground">No clients yet</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Add your first client to start managing cleanings</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Your First Client
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const next = getNextCleaningDate(c);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Card className="shadow-card hover:shadow-elevated transition-all duration-300 group border-border/50 hover:-translate-y-0.5">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px] mt-1">{c.status}</Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditClient(c); setDialogOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {c.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{c.phone}</div>
                      {c.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{c.email}</div>}
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /><span className="truncate">{c.address}</span></div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{c.serviceType} · {c.frequency}</span>
                      <span className="font-semibold text-foreground">${c.pricePerVisit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Next: {next ? format(next, "MMM d, yyyy") : "Schedule first visit"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
