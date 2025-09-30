"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFunds = exports.sendMoney = exports.withdrawFunds = exports.fundAccount = exports.addCurrencyWallet = exports.getReceivingAccountDetails = exports.getFinancialSummary = exports.getAccountStatement = exports.getBalance = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const db_1 = require("../schema/db");
const json2csv_1 = require("json2csv");
const currencyConv_1 = require("../utils/currencyConv");
/**
 * Retrieves the balance for the authenticated user's wallet,
 * filtered by currency.
 */
const getBalance = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currency } = req.query;
        // Validate input
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Authentication error: User not found' });
        }
        if (!currency) {
            return res
                .status(400)
                .json({ message: 'Currency query parameter is required' });
        }
        // Find the user's wallet for the specified currency
        const wallet = await models_1.Wallet.findOne({
            where: {
                userId: userId,
                currency: currency,
            },
        });
        if (!wallet) {
            // Create a new wallet with a zero balance if one doesn't exist
            const newWallet = await models_1.Wallet.create({
                userId: userId,
                currency: currency,
                balance: 0,
            });
            return res.status(201).json({
                status: 201,
                message: 'Wallet created and balance retrieved successfully',
                data: {
                    balance: '0.00',
                    currency: newWallet.currency,
                },
            });
        }
        // Format the balance with commas
        const formattedBalance = new Intl.NumberFormat('en-US').format(wallet.balance);
        res.status(200).json({
            status: 200,
            message: 'Balance retrieved successfully',
            data: {
                balance: formattedBalance,
                currency: wallet.currency,
            },
        });
    }
    catch (error) {
        console.error('Error retrieving balance:', error);
        res
            .status(500)
            .json({ message: 'Failed to retrieve balance', error: error.message });
    }
};
exports.getBalance = getBalance;
const getAccountStatement = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currency, startDate, endDate, format = 'json' } = req.query;
        if (!userId || !currency || !startDate || !endDate) {
            return res.status(400).json({
                message: 'Missing required query parameters: currency, startDate, endDate',
            });
        }
        const wallet = await models_1.Wallet.findOne({ where: { userId, currency } });
        if (!wallet) {
            return res
                .status(404)
                .json({ message: `No ${currency} wallet found for this user.` });
        }
        const transactions = await models_1.Transaction.findAll({
            where: {
                walletId: wallet.id,
                createdAt: {
                    [sequelize_1.Op.between]: [
                        new Date(startDate),
                        new Date(endDate),
                    ],
                },
            },
            order: [['createdAt', 'DESC']],
        });
        if (format === 'csv') {
            const json2csvParser = new json2csv_1.Parser();
            const csv = json2csvParser.parse(transactions.map((t) => t.toJSON()));
            res.header('Content-Type', 'text/csv');
            res.attachment(`statement-${currency}-${startDate}-to-${endDate}.csv`);
            return res.send(csv);
        }
        res
            .status(200)
            .json({ status: 200, message: 'Statement retrieved', data: transactions });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: 'Failed to retrieve statement', error: error.message });
    }
};
exports.getAccountStatement = getAccountStatement;
const getFinancialSummary = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Authentication error' });
        const userWallets = await models_1.Wallet.findAll({ where: { userId } });
        const walletIds = userWallets.map((w) => w.id);
        const totalIncome = await models_1.Transaction.sum('amount', {
            where: { walletId: { [sequelize_1.Op.in]: walletIds }, type: 'credit' },
        });
        const totalExpenses = await models_1.Transaction.sum('amount', {
            where: { walletId: { [sequelize_1.Op.in]: walletIds }, type: 'debit' },
        });
        res.status(200).json({
            status: 200,
            message: 'Summary retrieved',
            data: {
                totalIncome: totalIncome || 0,
                totalExpenses: totalExpenses || 0,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: 'Failed to retrieve summary', error: error.message });
    }
};
exports.getFinancialSummary = getFinancialSummary;
/**
 * Retrieves the virtual card details associated with a specific wallet.
 * These cards can be used as "receiving accounts".
 */
const getReceivingAccountDetails = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id: walletId } = req.params; // The ID from the URL is the walletId
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Authentication error: User not found' });
        }
        // First, verify the wallet belongs to the authenticated user
        const wallet = await models_1.Wallet.findOne({
            where: {
                id: walletId,
                userId: userId,
            },
        });
        if (!wallet) {
            return res
                .status(404)
                .json({ message: 'Wallet not found or access denied.' });
        }
        // Find all cards associated with this wallet
        const cards = await models_1.Card.findAll({
            where: {
                walletId: wallet.id,
            },
            // You can select specific attributes to match the "receiving account" format
            attributes: [
                ['holder_name', 'accountHolder'],
                ['brand', 'bankName'],
                ['card_reference', 'accountNumber'],
                'type',
                'currency',
                'status',
                'last_four',
            ],
        });
        if (!cards || cards.length === 0) {
            return res.status(404).json({
                message: 'No receiving accounts (cards) found for this wallet.',
            });
        }
        // The user prompt implies a single object, but the description mentions multiple.
        // Returning an array is more flexible. If only one card is found, it will be an array with one item.
        res.status(200).json({
            status: 200,
            message: 'Receiving account details retrieved successfully',
            data: cards,
        });
    }
    catch (error) {
        console.error('Error retrieving receiving account details:', error);
        res.status(500).json({
            message: 'Failed to retrieve receiving account details',
            error: error.message,
        });
    }
};
exports.getReceivingAccountDetails = getReceivingAccountDetails;
// --- Wallet & Currency Management ---
const addCurrencyWallet = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currency } = req.body;
        if (!userId || !currency)
            return res.status(400).json({ message: 'Currency is required' });
        const [wallet, created] = await models_1.Wallet.findOrCreate({
            where: { userId, currency },
            defaults: { userId, currency, balance: 0 },
        });
        if (!created) {
            return res
                .status(409)
                .json({ message: `A wallet with ${currency} already exists.` });
        }
        res.status(201).json({
            status: 201,
            message: `${currency} wallet created successfully`,
            data: wallet,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: 'Failed to create wallet', error: error.message });
    }
};
exports.addCurrencyWallet = addCurrencyWallet;
// --- Fund Movement ---
const fundAccount = async (req, res) => {
    // This is a simulation. A real implementation would use a payment gateway webhook.
    try {
        const userId = req.user?.userId;
        const { amount, currency } = req.body;
        if (!userId || !amount || !currency)
            return res
                .status(400)
                .json({ message: 'Amount and currency are required' });
        const wallet = await models_1.Wallet.findOne({ where: { userId, currency } });
        if (!wallet)
            return res.status(404).json({ message: 'Wallet not found' });
        await db_1.sequelize.transaction(async (t) => {
            await wallet.increment('balance', { by: amount, transaction: t });
            await models_1.Transaction.create({
                walletId: wallet.id,
                type: 'credit',
                amount,
                currency,
                description: 'Account funded via external source',
            }, { transaction: t });
        });
        res
            .status(200)
            .json({ status: 200, message: 'Account funded successfully' });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: 'Failed to fund account', error: error.message });
    }
};
exports.fundAccount = fundAccount;
const withdrawFunds = async (req, res) => {
    // This is a simulation. A real implementation would trigger a payout process.
    try {
        const userId = req.user?.userId;
        const { amount, currency } = req.body;
        if (!userId || !amount || !currency)
            return res
                .status(400)
                .json({ message: 'Amount and currency are required' });
        const wallet = await models_1.Wallet.findOne({ where: { userId, currency } });
        if (!wallet || wallet.balance < amount) {
            return res
                .status(400)
                .json({ message: 'Insufficient funds or wallet not found' });
        }
        await db_1.sequelize.transaction(async (t) => {
            await wallet.decrement('balance', { by: amount, transaction: t });
            await models_1.Transaction.create({
                walletId: wallet.id,
                type: 'debit',
                amount,
                currency,
                description: 'Withdrawal to external account',
            }, { transaction: t });
        });
        res
            .status(200)
            .json({ status: 200, message: 'Withdrawal initiated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Withdrawal failed', error: error.message });
    }
};
exports.withdrawFunds = withdrawFunds;
const sendMoney = async (req, res) => {
    const t = await db_1.sequelize.transaction(); // Start a transaction
    try {
        const senderId = req.user?.userId;
        const { amount, accountType, accountID, currency, recievingCurrency, description, } = req.body;
        // --- 1. Input Validation ---
        if (!senderId) {
            return res
                .status(401)
                .json({ message: 'Authentication error: User not found' });
        }
        const requiredFields = {
            amount,
            accountType,
            accountID,
            currency,
            recievingCurrency,
            description,
        };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (value === undefined || value === null) {
                await t.rollback();
                return res
                    .status(400)
                    .json({ message: `Missing required field: ${field}` });
            }
        }
        // --- 2. Debit Sender's Wallet ---
        const senderWallet = await models_1.Wallet.findOne({
            where: { userId: senderId, currency },
        });
        if (!senderWallet || senderWallet.balance < amount) {
            await t.rollback();
            return res
                .status(400)
                .json({ message: 'Insufficient funds or wallet not found.' });
        }
        await senderWallet.decrement('balance', { by: amount, transaction: t });
        // --- 3. Handle Currency Conversion ---
        const amountRecieved = await (0, currencyConv_1.convertCurrency)(amount, currency, recievingCurrency);
        // --- 4. Handle Recipient ---
        if (accountType === 'wallet') {
            // Internal transfer to another user's wallet
            const recipientWallet = await models_1.Wallet.findByPk(accountID);
            if (!recipientWallet) {
                await t.rollback();
                return res.status(404).json({ message: 'Recipient wallet not found.' });
            }
            // Credit recipient's wallet with the converted amount
            await recipientWallet.increment('balance', {
                by: amountRecieved,
                transaction: t,
            });
            // Create a corresponding credit transaction for the recipient
            await models_1.Transaction.create({
                walletId: recipientWallet.id,
                type: 'credit',
                amount: amountRecieved,
                currency: recievingCurrency,
                description: `Received from user ID ${senderId}`,
                status: 'completed',
            }, { transaction: t });
        }
        else {
            // External transfer (e.g., to a bank account). We just record the debit.
            // A real implementation would trigger a payout to a payment provider here.
            console.log(`Initiating external payout to ${accountType} ${accountID}`);
        }
        // --- 5. Record Sender's Transaction ---
        const senderTransaction = await models_1.Transaction.create({
            walletId: senderWallet.id,
            type: 'debit',
            amount,
            currency,
            description: description || `Sent to ${accountType}: ${accountID}`,
            status: 'completed',
        }, { transaction: t });
        // --- 6. Commit Transaction and Send Response ---
        await t.commit();
        // Format the response data
        const responseData = {
            id: senderTransaction.id,
            transactionDate: senderTransaction.get('createdAt'),
            userId: senderId,
            amountSent: parseFloat(senderTransaction.amount.toString()),
            sendingCurrency: senderTransaction.currency,
            amountRecieved: parseFloat(amountRecieved.toFixed(2)),
            recievingCurrency: recievingCurrency,
            description: senderTransaction.description,
            status: senderTransaction.status,
        };
        res.status(201).json({
            status: 201,
            message: 'You have successfully sent your fund',
            data: responseData,
        });
    }
    catch (error) {
        await t.rollback(); // Rollback on any error
        console.error('Error sending money:', error);
        res
            .status(500)
            .json({ message: 'Failed to send money', error: error.message });
    }
};
exports.sendMoney = sendMoney;
/**
 * Converts funds from one of the user's wallets to another.
 */
const convertFunds = async (req, res) => {
    const t = await db_1.sequelize.transaction(); // Start a database transaction
    try {
        const userId = req.user?.userId;
        const { amount, fromCurrency, toCurrency } = req.body;
        // --- 1. Input Validation ---
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Authentication error: User not found' });
        }
        if (!amount || !fromCurrency || !toCurrency) {
            return res
                .status(400)
                .json({
                message: 'Request must include amount, fromCurrency, and toCurrency',
            });
        }
        if (fromCurrency === toCurrency) {
            return res
                .status(400)
                .json({ message: 'Cannot convert to the same currency.' });
        }
        // --- 2. Find Wallets and Check Balance ---
        const sourceWallet = await models_1.Wallet.findOne({
            where: { userId, currency: fromCurrency },
        });
        if (!sourceWallet || sourceWallet.balance < amount) {
            await t.rollback();
            return res
                .status(400)
                .json({ message: `Insufficient funds in ${fromCurrency} wallet.` });
        }
        // Find or create the destination wallet for the user
        const [destinationWallet] = await models_1.Wallet.findOrCreate({
            where: { userId, currency: toCurrency },
            transaction: t,
        });
        // --- 3. Perform Conversion and Database Operations ---
        const convertedAmount = await (0, currencyConv_1.convertCurrency)(amount, fromCurrency, toCurrency);
        // Debit the source wallet
        await sourceWallet.decrement('balance', { by: amount, transaction: t });
        // Credit the destination wallet
        await destinationWallet.increment('balance', {
            by: convertedAmount,
            transaction: t,
        });
        // Record the debit transaction
        const debitTransaction = await models_1.Transaction.create({
            walletId: sourceWallet.id,
            type: 'debit',
            amount,
            currency: fromCurrency,
            description: `Conversion of ${amount} ${fromCurrency} to ${toCurrency}`,
            status: 'completed',
        }, { transaction: t });
        // Record the credit transaction
        await models_1.Transaction.create({
            walletId: destinationWallet.id,
            type: 'credit',
            amount: convertedAmount,
            currency: toCurrency,
            description: `Received from conversion of ${amount} ${fromCurrency}`,
            status: 'completed',
        }, { transaction: t });
        // --- 4. Commit and Respond ---
        await t.commit();
        const responseData = {
            id: debitTransaction.id,
            conversionDate: debitTransaction.get('createdAt'),
            amountDebited: parseFloat(amount.toString()),
            fromCurrency: fromCurrency,
            amountCredited: parseFloat(convertedAmount.toFixed(2)),
            toCurrency: toCurrency,
            rate: parseFloat((convertedAmount / amount).toFixed(6)),
        };
        res.status(201).json({
            status: 201,
            message: 'You have successfully converted your fund',
            data: responseData,
        });
    }
    catch (error) {
        await t.rollback(); // Rollback the transaction on any error
        console.error('Error converting funds:', error);
        res
            .status(500)
            .json({ message: 'Failed to convert funds', error: error.message });
    }
};
exports.convertFunds = convertFunds;
//# sourceMappingURL=walletCtrl.js.map