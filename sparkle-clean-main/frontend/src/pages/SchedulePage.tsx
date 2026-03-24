import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getNextCleaningDate } from "../lib/api";
import { format } from "date-fns";

const UPCOMING = [
  { id: "s1", clientName: "Ava Johnson" },
  { id: "s2", clientName: "Noah Lee" },
  { id: "s3", clientName: "Mia Garcia" },
];

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Cleanings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {UPCOMING.map((item) => {
              const nextDate = getNextCleaningDate();
              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <p className="font-medium">{item.clientName}</p>
                  <p className="text-sm text-slate-500">{format(nextDate, "EEEE, MMM d")}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}