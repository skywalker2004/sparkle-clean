import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model";
import Client from "../models/Client.model";
import Invoice from "../models/Invoice.model";
import connectDB from "../config/db";
import { addDays, subDays } from "date-fns";

dotenv.config();

const seed = async () => {
  await connectDB();

  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
    console.log("???  Database cleared");
  }

  const admin = new User({
    email: "admin@sparkleclean.co.ke",
    password: "Nairobi2026!",
    name: "Admin User",
    role: "admin",
  });
  await admin.save();
  console.log("? Admin created: admin@sparkleclean.co.ke / Nairobi2026!");

  const now = new Date();
  const clients = await Client.insertMany([
    {
      name: "Wanjiru Kamau", phone: "+254 712 345 678",
      email: "wanjiru.kamau@gmail.com", address: "Westlands, Nairobi",
      serviceType: "Standard", pricePerVisit: 3500, frequency: "weekly",
      status: "active", notes: "Has a guard dog ? call before arriving",
      lastCleanedDate: subDays(now, 5).toISOString(), createdBy: admin._id,
    },
    {
      name: "Otieno Odhiambo", phone: "+254 723 456 789",
      email: "otieno@outlook.com", address: "Karen, Nairobi",
      serviceType: "Deep Clean", pricePerVisit: 7500, frequency: "biweekly",
      status: "active", notes: "Prefers cleaning on Saturdays",
      lastCleanedDate: subDays(now, 10).toISOString(), createdBy: admin._id,
    },
    {
      name: "Fatuma Hassan", phone: "+254 733 567 890",
      email: "fatuma.hassan@yahoo.com", address: "Lavington, Nairobi",
      serviceType: "Move-In/Out", pricePerVisit: 12000, frequency: "monthly",
      status: "active", notes: "Gate code: 2024",
      lastCleanedDate: subDays(now, 28).toISOString(), createdBy: admin._id,
    },
    {
      name: "Kipchoge Mutai", phone: "+254 745 678 901",
      email: "kipchoge.mutai@gmail.com", address: "Kilimani, Nairobi",
      serviceType: "Deep Clean", pricePerVisit: 9000, frequency: "biweekly",
      status: "active", notes: "Two floors ? extra time needed",
      lastCleanedDate: subDays(now, 12).toISOString(), createdBy: admin._id,
    },
    {
      name: "Aisha Mwangi", phone: "+254 756 789 012",
      email: "aisha.mwangi@gmail.com", address: "Runda, Nairobi",
      serviceType: "Standard", pricePerVisit: 4500, frequency: "weekly",
      status: "active", notes: "Has allergies ? use fragrance-free products only",
      lastCleanedDate: subDays(now, 6).toISOString(), createdBy: admin._id,
    },
    {
      name: "David Kariuki", phone: "+254 767 890 123",
      email: "david.kariuki@gmail.com", address: "Gigiri, Nairobi",
      serviceType: "Move-In/Out", pricePerVisit: 15000, frequency: "monthly",
      status: "active", notes: "Large compound with swimming pool",
      lastCleanedDate: null, createdBy: admin._id,
    },
    {
      name: "Amina Osman", phone: "+254 778 901 234",
      email: "amina.osman@gmail.com", address: "Parklands, Nairobi",
      serviceType: "Standard", pricePerVisit: 3800, frequency: "weekly",
      status: "active", notes: "Leave supplies in the utility room",
      lastCleanedDate: subDays(now, 4).toISOString(), createdBy: admin._id,
    },
    {
      name: "Njoroge Githuku", phone: "+254 789 012 345",
      email: "njoroge@gmail.com", address: "Kileleshwa, Nairobi",
      serviceType: "Standard", pricePerVisit: 3000, frequency: "weekly",
      status: "inactive", notes: "Service on hold until further notice",
      lastCleanedDate: subDays(now, 45).toISOString(), createdBy: admin._id,
    },
  ]);
  console.log(`? ${clients.length} clients seeded`);

  const invoiceData: any[] = [];
  for (let i = 0; i < 12; i++) {
    const date = subDays(now, 7 * (i + 1));
    const client = clients[i % 5];
    invoiceData.push({
      invoiceNumber: `SC-${String(i + 1).padStart(4, "0")}`,
      client: client._id.toString(),
      clientName: client.name,
      amount: client.pricePerVisit,
      dueDate: date.toISOString(),
      status: "paid",
      paidDate: addDays(date, 2).toISOString(),
      notes: "",
    });
  }
  invoiceData.push(
    {
      invoiceNumber: "SC-0101", client: clients[0]._id.toString(),
      clientName: clients[0].name, amount: clients[0].pricePerVisit,
      dueDate: subDays(now, 5).toISOString(), status: "unpaid", paidDate: null, notes: "",
    },
    {
      invoiceNumber: "SC-0102", client: clients[1]._id.toString(),
      clientName: clients[1].name, amount: clients[1].pricePerVisit,
      dueDate: subDays(now, 10).toISOString(), status: "unpaid", paidDate: null, notes: "",
    },
    {
      invoiceNumber: "SC-0103", client: clients[3]._id.toString(),
      clientName: clients[3].name, amount: clients[3].pricePerVisit,
      dueDate: subDays(now, 12).toISOString(), status: "unpaid", paidDate: null, notes: "",
    }
  );
  await Invoice.insertMany(invoiceData);
  console.log(`? ${invoiceData.length} invoices seeded`);
  console.log("\n?? Done! Login: admin@sparkleclean.co.ke / Nairobi2026!\n");
  process.exit(0);
};

seed().catch((err) => { console.error("? Seed error:", err); process.exit(1); });