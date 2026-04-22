import type { Response, Request } from "express";
export declare const testAuthFunction: (_req: Request, res: Response) => Promise<void>;
export declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const LoginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMe: (req: any, res: any) => Promise<any>;
export declare const logout: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authcontroller.d.ts.map