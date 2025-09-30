import { Model } from 'sequelize';
declare class Transaction extends Model {
    id: string;
    walletId: string;
    type: 'credit' | 'debit';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    currency: string;
}
export default Transaction;
//# sourceMappingURL=Transaction.d.ts.map