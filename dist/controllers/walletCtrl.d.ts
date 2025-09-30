import { Request, Response } from 'express';
/**
 * Retrieves the balance for the authenticated user's wallet,
 * filtered by currency.
 */
export declare const getBalance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAccountStatement: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFinancialSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Retrieves the virtual card details associated with a specific wallet.
 * These cards can be used as "receiving accounts".
 */
export declare const getReceivingAccountDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addCurrencyWallet: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const fundAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const withdrawFunds: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMoney: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Converts funds from one of the user's wallets to another.
 */
export declare const convertFunds: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=walletCtrl.d.ts.map