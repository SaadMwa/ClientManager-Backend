import type { Request, Response } from "express";
export declare const createClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getClients: (req: any, res: any) => Promise<void>;
export declare const getClientById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDashboardStats: (req: any, res: any) => Promise<any>;
//# sourceMappingURL=ClientController.d.ts.map