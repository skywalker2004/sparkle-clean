import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getInvoices: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createInvoice: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markPaid: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMonthlyRevenue: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=invoice.controller.d.ts.map