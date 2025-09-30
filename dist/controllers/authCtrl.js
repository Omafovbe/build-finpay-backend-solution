"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPasswordwithToken = exports.forgotPasswordwithEmail = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const User_1 = __importDefault(require("../models/User"));
// Nodemailer transporter setup
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const register = async (req, res) => {
    //   console.info('Registering new user:', req.body)
    try {
        const { email, password, name, accountType, country, countryCode, state, address, phoneNumber, } = req.body;
        const existingUser = await User_1.default.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = await User_1.default.create({
            email,
            password,
            name,
            accountType,
            country,
            countryCode,
            state,
            address,
            phoneNumber,
        });
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Registration error:', error);
        res
            .status(500)
            .json({ message: 'Registration failed', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const { password: excludedPassword, resetPasswordExpires: excludedResetPasswordExpires, resetPasswordToken: excludedResetPasswordToken, ...userData } = user.get();
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1h',
        });
        res.status(200).json({
            status: 200,
            message: 'Login in successfully',
            data: { token, user: userData },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        res.status(200).json({ message: 'User Password reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res
            .status(400)
            .json({ message: 'Password reset failed', error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const forgotPasswordwithEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        const hashedResetToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();
        const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;
        const message = `
      You are receiving this because you (or someone else) have requested the reset of a password.
      Please click on the following link, or paste this into your browser to complete the process:
      ${resetUrl}
      If you did not request this, please ignore this email and your password will remain unchanged.
    `;
        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: message,
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res
            .status(500)
            .json({ message: 'Forgot password failed', error: error.message });
    }
};
exports.forgotPasswordwithEmail = forgotPasswordwithEmail;
const resetPasswordwithToken = async (req, res) => {
    try {
        const hashedResetToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');
        const user = await User_1.default.findOne({
            where: {
                resetPasswordToken: hashedResetToken,
                resetPasswordExpires: { [require('sequelize').Op.gt]: Date.now() },
            },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const { password } = req.body;
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res
            .status(500)
            .json({ message: 'Password reset failed', error: error.message });
    }
};
exports.resetPasswordwithToken = resetPasswordwithToken;
const logout = async (req, res) => {
    // Invalidate the user's token or session
    try {
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed', error: error.message });
    }
};
exports.logout = logout;
//# sourceMappingURL=authCtrl.js.map