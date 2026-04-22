import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import Client from '../models/Client.model';
import Invoice from '../models/Invoice.model';
import connectDB from '../config/db';

dotenv.config();

const seed = async () => {
  await connectDB();
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase(); // Clear DB for fresh seed
  } else {
    throw new Error('Database connection not established');
  }

  // Create admin
  const admin = new User({
    email: 'admin@sparkleclean.com',
    password: 'Kevo@2004',
    name: 'Admin User',
    role: 'admin',
  });
  await admin.save();

  // Sample clients
  const clients = [
    {
      name: 'John Doe',
      phone: '123-456-7890',
      address: '123 Main St, Miami, FL',
      serviceType: 'Standard',
      pricePerVisit: 100,
      frequency: 'weekly',
      createdBy: admin._id,
    },
    {
      name: 'Jane Smith',
      phone: '987-654-3210',
      address: '456 Oak Ave, Orlando, FL',
      serviceType: 'Deep Clean',
      pricePerVisit: 150,
      frequency: 'biweekly',
      createdBy: admin._id,
    },
    {
      name: 'Bob Johnson',
      phone: '555-123-4567',
      address: '789 Pine Rd, Tampa, FL',
      serviceType: 'Move-In/Out',
      pricePerVisit: 200,
      frequency: 'monthly',
      createdBy: admin._id,
    },
  ];

  const savedClients = await Client.insertMany(clients);

  // Sample invoices
  const invoices = [
    {
      client: savedClients[0]._id,
      invoiceNumber: 'INV-202602-0001',
      amount: 100,
      dueDate: new Date(),
      status: 'unpaid',
    },
    {
      client: savedClients[1]._id,
      invoiceNumber: 'INV-202602-0002',
      amount: 150,
      dueDate: new Date(),
      status: 'paid',
      paidDate: new Date(),
    },
  ];

  await Invoice.insertMany(invoices);

  console.log('✅ Database seeded successfully!');
  process.exit(0);
};

seed().catch((error) => {
  console.error('❌ Seed error:', error);
  process.exit(1);
});