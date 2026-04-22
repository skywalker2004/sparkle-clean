import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesApi, exportToCSV } from "@/lib/api";
import { Invoice } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, DollarSign, FileText, Printer, Sparkles, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#059669", "#10b981", "#34d399", "#6ee7b7"],
  });
}

function InvoicePreviewModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>${invoice.invoiceNumber}</title>
      <style>body{font-family:system-ui;max-width:600px;margin:40px auto;color:#1e293b}
      h1{color:#059669;font-size:24px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}
      .total{font-size:20px;font-weight:700;margin-top:16px}</style></head>
      <body><h1>✨ SparkleClean</h1><p>Invoice ${invoice.invoiceNumber}</p>
      <div class="row"><span>Client</span><span>${invoice.clientName}</span></div>
      <div class="row"><span>Amount</span><span>$${invoice.amount.toFixed(2)}</span></div>
      <div class="row"><span>Due Date</span><span>${format(new Date(invoice.dueDate), "PPP")}</span></div>
      <div class="row"><span>Status</span><span>${invoice.status.toUpperCase()}</span></div>
      ${invoice.paidDate ? `<div class="row"><span>Paid</span><span>${format(new Date(invoice.paidDate), "PPP")}</span></div>` : ""}
      <p class="total">Total: $${invoice.amount.toFixed(2)}</p>
      <p style="margin-top:40px;font-size:12px;color:#94a3b8">SparkleClean © 2026 · Thank you for your business!</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Invoice Preview
        </DialogTitle>
      </DialogHeader>
      <div className="relative rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-5"
          loading="lazy"
        />
        <div className="relative space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="text-center border-b border-border pb-4">
            <p className="text-lg font-display font-bold text-primary">✨ SparkleClean</p>
            <p className="text-xs text-muted-foreground mt-1">Invoice {invoice.invoiceNumber}</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium">{invoice.clientName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">${invoice.amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{format(new Date(invoice.dueDate), "PPP")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
              <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>{invoice.status}</Badge>
            </div>
            {invoice.paidDate && (
              <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>{format(new Date(invoice.paidDate), "PPP")}</span></div>
            )}
          </div>
          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">SparkleClean © 2026 · Thank you for your business!</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
      </div>
    </DialogContent>
  );
}

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const filtered = (invoices ?? []).filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return inv.clientName.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalOutstanding = (invoices ?? []).filter(i => i.status === "unpaid").reduce((s, i) => s + i.amount, 0);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBulkPay = async () => {
    if (selected.size === 0) return;
    await invoicesApi.markPaid(Array.from(selected));
    fireConfetti();
    toast.success(`${selected.size} invoice(s) marked as paid 🎉`);
    setSelected(new Set());
    qc.invalidateQueries({ queryKey: ["invoices"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const handleSinglePay = async (id: string) => {
    await invoicesApi.markPaid([id]);
    fireConfetti();
    toast.success("Invoice marked as paid! 🎉");
    qc.invalidateQueries({ queryKey: ["invoices"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const handleExport = () => {
    exportToCSV(filtered.map(i => ({
      invoiceNumber: i.invoiceNumber, client: i.clientName, amount: i.amount,
      dueDate: format(new Date(i.dueDate), "yyyy-MM-dd"), status: i.status,
      paidDate: i.paidDate ? format(new Date(i.paidDate), "yyyy-MM-dd") : "",
    })), "sparkleclean-invoices.csv");
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1" />CSV</Button>
          {selected.size > 0 && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Button size="sm" onClick={handleBulkPay}>
                <DollarSign className="w-4 h-4 mr-1" />Mark {selected.size} Paid
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="gradient-card-3 text-primary-foreground border-0 shadow-elevated">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Outstanding</p>
              <p className="text-2xl font-display font-bold">${totalOutstanding.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Input placeholder="Search client or invoice #…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden shadow-elevated"
        >
          <img
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-56 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
            <FileText className="w-12 h-12 text-primary mb-3" />
            <p className="text-lg font-display font-bold text-foreground">No invoices found</p>
            <p className="text-muted-foreground text-sm mt-1">Invoices will appear here when you record cleanings</p>
          </div>
        </motion.div>
      ) : (
        <Card className="shadow-card overflow-hidden border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left w-10"></th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Invoice #</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Due Date</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Paid</th>
                  <th className="p-3 text-left font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setPreviewInvoice(inv)}
                  >
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      {inv.status === "unpaid" && (
                        <Checkbox checked={selected.has(inv.id)} onCheckedChange={() => toggleSelect(inv.id)} aria-label={`Select ${inv.invoiceNumber}`} />
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="p-3 font-medium">{inv.clientName}</td>
                    <td className="p-3">${inv.amount.toFixed(2)}</td>
                    <td className="p-3">{format(new Date(inv.dueDate), "MMM d, yyyy")}</td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      {inv.status === "unpaid" ? (
                        <Badge variant="destructive" className="text-[10px] cursor-pointer hover:opacity-80" onClick={() => handleSinglePay(inv.id)}>
                          unpaid — click to pay
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px]">paid</Badge>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{inv.paidDate ? format(new Date(inv.paidDate), "MMM d") : "—"}</td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewInvoice(inv)} aria-label="Preview invoice">
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={!!previewInvoice} onOpenChange={v => { if (!v) setPreviewInvoice(null); }}>
        {previewInvoice && <InvoicePreviewModal invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />}
      </Dialog>
    </div>
  );
}
