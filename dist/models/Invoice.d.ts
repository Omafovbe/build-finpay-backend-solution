import { Model } from 'sequelize';
declare class Invoice extends Model {
    id: string;
    customerId: string;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    userId: number;
    status: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Invoice;
//# sourceMappingURL=Invoice.d.ts.map