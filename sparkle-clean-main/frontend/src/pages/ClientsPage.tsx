import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useMemo, useState } from "react";

type ClientItem = {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
};

const MOCK_CLIENTS: ClientItem[] = [
  { id: "c1", name: "Ava Johnson", phone: "(555) 101-2222", address: "12 Maple St", status: "active" },
  { id: "c2", name: "Noah Lee", phone: "(555) 111-3333", address: "44 Pine Ave", status: "active" },
  { id: "c3", name: "Mia Garcia", phone: "(555) 222-4444", address: "8 Cedar Rd", status: "inactive" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK_CLIENTS;
    return MOCK_CLIENTS.filter((client) =>
      `${client.name} ${client.phone} ${client.address}`.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">View and search client records</p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, or address"
        className="max-w-md"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{client.name}</span>
                <Badge className={client.status === "active" ? "" : "bg-slate-200 text-slate-700"}>
                  {client.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-slate-600">
              <p>{client.phone}</p>
              <p>{client.address}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}