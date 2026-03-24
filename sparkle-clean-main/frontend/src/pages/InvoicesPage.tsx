import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: "paid" | "unpaid";
};

const MOCK_INVOICES: InvoiceItem[] = [
  { id: "i1", invoiceNumber: "INV-1001", clientName: "Ava Johnson", amount: 150, status: "paid" },
  { id: "i2", invoiceNumber: "INV-1002", clientName: "Noah Lee", amount: 220, status: "unpaid" },
  { id: "i3", invoiceNumber: "INV-1003", clientName: "Mia Garcia", amount: 95, status: "unpaid" },
];

export default function InvoicesPage() {
  const outstanding = MOCK_INVOICES
    .filter((invoice) => invoice.status === "unpaid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">Track payment status and balances</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-700">${outstanding.toFixed(2)}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {MOCK_INVOICES.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{invoice.invoiceNumber}</p>
                <p className="text-sm text-slate-500">{invoice.clientName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                <Badge className={invoice.status === "paid" ? "" : "bg-amber-100 text-amber-800"}>
                  {invoice.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}