import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getClients: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getClient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createClient: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateClient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteClient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=client.controller.d.ts.map