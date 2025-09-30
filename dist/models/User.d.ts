import { Model } from 'sequelize';
declare class User extends Model {
    id: number;
    email: string;
    password: string;
    name: string;
    accountType: string;
    country: string;
    countryCode: string;
    state: string;
    address: string;
    phoneNumber: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export default User;
//# sourceMappingURL=User.d.ts.map