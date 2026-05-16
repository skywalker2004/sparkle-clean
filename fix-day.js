const fs = require("fs");
const path = "D:\\sparkle-clean\\frontend\\src\\pages\\ClientsPage.tsx";
let c = fs.readFileSync(path, "utf8");

// 1. Add watch to useForm destructure
c = c.replace(
  "const {\n    register,\n    handleSubmit,\n    control,\n    formState: { errors, isSubmitting },\n  } = useForm<ClientFormData>({",
  "const {\n    register,\n    handleSubmit,\n    watch,\n    control,\n    formState: { errors, isSubmitting },\n  } = useForm<ClientFormData>({"
);

// 2. Add autoDay calculation after useForm
c = c.replace(
  "  const onSubmit = async (data: ClientFormData) => {",
  `  const startDate = watch("startDate");
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const autoDay = startDate ? days[new Date(startDate).getDay()] : null;

  const onSubmit = async (data: ClientFormData) => {
    if (autoDay) data.preferredDay = autoDay as ClientFormData["preferredDay"];`
);

// 3. Remove duplicate line added
c = c.replace(
  `    if (autoDay) data.preferredDay = autoDay as ClientFormData["preferredDay"];
    try {`,
  `    try {`
);

// 4. Replace preferredDay dropdown with read-only display
c = c.replace(
  `        {/* Preferred Day */}
        <div className="space-y-1.5">
          <Label>Preferred Day</Label>
          <Controller
            name="preferredDay"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.preferredDay && <p className="text-xs text-destructive">{errors.preferredDay.message}</p>}
        </div>

        {/* Start Date — right after Preferred Day */}
        <div className="space-y-1.5">
          <Label>Start Date *</Label>
          <Input
            type="date"
            {...register("startDate")}
            className="w-full"
          />
          {errors.startDate && (
            <p className="text-xs text-destructive">{errors.startDate.message}</p>
          )}
        </div>`,
  `        {/* Start Date */}
        <div className="space-y-1.5">
          <Label>Start Date *</Label>
          <Input
            type="date"
            {...register("startDate")}
            className="w-full"
          />
          {errors.startDate && (
            <p className="text-xs text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        {/* Auto Preferred Day */}
        <div className="space-y-1.5">
          <Label>Preferred Day</Label>
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 text-sm">
            {autoDay ? (
              <span className="text-foreground font-medium">?? {autoDay}</span>
            ) : (
              <span className="text-muted-foreground">Pick a start date</span>
            )}
          </div>
        </div>`
);

fs.writeFileSync(path, c, "utf8");
console.log("? Done — Preferred Day is now auto-set from Start Date");
