import { Model } from 'sequelize';
declare class Wallet extends Model {
    id: string;
    userId: number;
    balance: number;
    currency: string;
}
export default Wallet;
//# sourceMappingURL=Wallet.d.ts.map