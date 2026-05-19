import mongoose from 'mongoose';
interface IClient extends mongoose.Document {
    name: string;
    phone: string;
    email?: string;
    address: string;
    serviceType: string;
    pricePerVisit: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    lastCleanedDate?: Date;
    dateAdded: Date;
    status: 'active' | 'inactive';
    notes?: string;
    preferredDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, {}> & IClient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Client.model.d.ts.map