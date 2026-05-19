import mongoose from 'mongoose';
interface IBooking extends mongoose.Document {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    serviceType: 'Standard' | 'Deep Clean' | 'Move-In/Out' | 'Other';
    preferredDate: Date;
    preferredTime: 'Morning 8am-12pm' | 'Afternoon 12pm-5pm' | 'Evening 5pm-8pm';
    notes?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    bookingRef: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.model.d.ts.map