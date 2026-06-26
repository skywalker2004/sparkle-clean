import { IBooking } from '../models/Booking.model';
export declare function formatBookingDate(dateStr: string): string;
export declare function formatKES(amount: number): string;
export declare function sendClientConfirmationEmail(booking: IBooking): Promise<void>;
export declare function sendAdminNotificationEmail(booking: IBooking): Promise<void>;
//# sourceMappingURL=email.service.d.ts.map