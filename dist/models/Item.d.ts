import { Model } from 'sequelize';
declare class Item extends Model {
    id: number;
    invoiceId: string;
    description: string;
    quantity: number;
    amount: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Item;
//# sourceMappingURL=Item.d.ts.map