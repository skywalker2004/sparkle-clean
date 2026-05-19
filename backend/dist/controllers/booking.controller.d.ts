import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createBooking: (req: any, res: Response) => Promise<void>;
export declare const getBookings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBooking: (req: any, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBookingStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=booking.controller.d.ts.map