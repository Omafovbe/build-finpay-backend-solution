import { Model } from 'sequelize';
declare class Card extends Model {
    card_reference: string;
    reference: string;
    type: string;
    currency: string;
    holder_name: string;
    brand: string;
    expiry_month: string;
    expiry_year: string;
    first_six: string;
    last_four: string;
    status: string;
    date: Date;
    fees: number;
    walletId: string;
}
export default Card;
//# sourceMappingURL=Card.d.ts.map