import { Model } from 'sequelize';
declare class Customer extends Model {
    id: string;
    name: string;
    email: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Customer;
//# sourceMappingURL=Customer.d.ts.map