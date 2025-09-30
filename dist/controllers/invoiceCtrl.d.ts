import { Request, Response } from 'express';
export declare const getAllInvoices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createInvoice: (req: Request, res: Response) => Promise<void>;
export declare const getInvoiceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInvoicesFiltered: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInvoiceSummaryByStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=invoiceCtrl.d.ts.map