import { Request, Response } from 'express';
/**
 * Retrieves a single transaction by its ID.
 * (This function remains unchanged)
 */
export declare const getTransactionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Retrieves a paginated list of transactions with search and filtering.
 * Uses page-based (offset) pagination.
 */
export declare const getAllTransactions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=transCtrl.d.ts.map