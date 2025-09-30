import { Request, Response } from 'express';
/**
 * Creates a new card.
 * This simulates calling a card provider and receiving detailed card info.
 */
export declare const createCard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Retrieves all cards, optionally filtered by walletId.
 */
export declare const getAllCards: (req: Request, res: Response) => Promise<void>;
/**
 * Retrieves a single card by its ID (card_reference).
 */
export declare const getCardById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Deletes a card by its ID (card_reference).
 */
export declare const deleteCard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=cardCtrl.d.ts.map