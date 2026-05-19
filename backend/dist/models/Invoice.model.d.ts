import mongoose from 'mongoose';
interface IInvoice extends mongoose.Document {
    client: mongoose.Types.ObjectId;
    clientName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    status: 'unpaid' | 'paid';
    paidDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, {}> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Invoice.model.d.ts.map