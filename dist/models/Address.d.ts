import { Model } from 'sequelize';
declare class Address extends Model {
    id: number;
    customerId: string;
    country: string;
    state: string;
    line1: string;
    line2: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Address;
//# sourceMappingURL=Address.d.ts.map