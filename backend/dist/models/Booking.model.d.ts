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
    preferredTime: 'Morning 8am-12pm' | 'Afternoon 12pm-5pm' | 'Evening 5pm-8pm';
    frequency: 'One-time' | 'Weekly' | 'Biweekly' | 'Monthly';
    propertyType: 'Apartment' | 'House' | 'Office' | 'Shop' | 'Other';
    propertySize: 'Studio/1BR' | '2-3 Bedroom' | '4-5 Bedroom' | 'Large 6BR+' | 'Commercial Small' | 'Commercial Large';
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