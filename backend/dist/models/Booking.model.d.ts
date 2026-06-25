import mongoose from 'mongoose';
export interface IBooking extends mongoose.Document {
    bookingRef: string;
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    serviceType: string;
    servicePrice: number;
    quantity: number;
    totalPrice: number;
    preferredDate: string;
    preferredTime: 'Morning 8am–12pm' | 'Afternoon 12pm–4pm' | 'Evening 4pm–8pm';
    frequency: 'One-time Booking' | 'Weekly' | 'Bi-weekly' | 'Monthly';
    propertyType: 'Apartment' | 'Maisonette' | 'Bungalow' | 'Villa' | 'Office' | 'Townhouse' | 'Studio' | 'Other';
    propertySize: 'Studio / Bedsitter' | '1 Bedroom' | '2 Bedrooms' | '3 Bedrooms' | '4 Bedrooms' | '5+ Bedrooms' | 'Large Commercial';
    notes?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.model.d.ts.map