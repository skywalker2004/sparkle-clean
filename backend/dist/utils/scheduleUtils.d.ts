import { Document } from 'mongoose';
export declare const calculateNextCleaning: (client: Document & {
    lastCleanedDate?: Date;
    frequency: string;
}) => Date;
//# sourceMappingURL=scheduleUtils.d.ts.map