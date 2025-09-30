"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceSummaryByStatus = exports.getInvoicesFiltered = exports.deleteInvoice = exports.updateInvoice = exports.getInvoiceById = exports.createInvoice = exports.getAllInvoices = void 0;
const models_1 = require("../models"); // Import your models
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = require("sequelize");
const getAllInvoices = async (req, res) => {
    try {
        // Assuming you have user information in req.user
        const userId = req.user?.userId; // Access userId from req.user
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const invoices = await models_1.Invoice.findAll({
            where: { userId: userId },
            include: [
                { model: models_1.Customer, as: 'customer' },
                { model: models_1.Item, as: 'items' },
            ],
        });
        res.json(invoices);
    }
    catch (error) {
        console.error('Error getting invoices:', error);
        res
            .status(500)
            .json({ message: 'Failed to get invoices', error: error.message });
    }
};
exports.getAllInvoices = getAllInvoices;
const createInvoice = async (req, res) => {
    try {
        const { customerId, currency, issueDate, dueDate, items, userId, status } = req.body;
        // Create the invoice
        const invoice = await models_1.Invoice.create({
            customerId,
            currency,
            issueDate,
            dueDate,
            userId,
            status,
        });
        // Create the items
        await Promise.all(items.map(async (itemData) => {
            await models_1.Item.create({
                invoiceId: invoice.id,
                description: itemData.description,
                quantity: itemData.quantity,
                amount: itemData.amount,
            });
        }));
        // Fetch the created invoice with associated customer and items
        const createdInvoice = await models_1.Invoice.findByPk(invoice.id, {
            include: [
                { model: models_1.Customer, as: 'customer' },
                { model: models_1.Item, as: 'items' },
            ],
        });
        res.status(201).json(createdInvoice);
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        res
            .status(500)
            .json({ message: 'Failed to create invoice', error: error.message });
    }
};
exports.createInvoice = createInvoice;
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await models_1.Invoice.findByPk(id, {
            include: [
                { model: models_1.Customer, as: 'customer' },
                { model: models_1.Item, as: 'items' },
            ],
        });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Error getting invoice by ID:', error);
        res
            .status(500)
            .json({ message: 'Failed to get invoice', error: error.message });
    }
};
exports.getInvoiceById = getInvoiceById;
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId, currency, issueDate, dueDate, status } = req.body;
        const invoice = await models_1.Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await invoice.update({
            customerId,
            currency,
            issueDate,
            dueDate,
            status,
        });
        res.json({ message: 'Invoice updated successfully' });
    }
    catch (error) {
        console.error('Error updating invoice:', error);
        res
            .status(500)
            .json({ message: 'Failed to update invoice', error: error.message });
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await models_1.Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await invoice.destroy();
        res.status(204).send(); // No content
    }
    catch (error) {
        console.error('Error deleting invoice:', error);
        res
            .status(500)
            .json({ message: 'Failed to delete invoice', error: error.message });
    }
};
exports.deleteInvoice = deleteInvoice;
const getInvoicesFiltered = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { page = 1, size = 10, status, terms, filter } = req.query;
        let where = { userId };
        // Handle status
        if (status) {
            const today = (0, moment_1.default)().startOf('day');
            const twoDaysPrior = today.clone().subtract(2, 'days');
            const twoDaysAfter = today.clone().add(2, 'days');
            const oneWeekAgo = today.clone().subtract(1, 'week');
            if (status === 'draft') {
                where.status = 'draft';
            }
            else if (status === 'pending') {
                where.status = 'pending';
            }
            else if (status === 'due') {
                where.status = 'pending';
                where.dueDate = {
                    [sequelize_1.Op.between]: [twoDaysPrior.toDate(), twoDaysAfter.toDate()],
                };
            }
            else if (status === 'overdue') {
                where.status = 'pending';
                where.dueDate = {
                    [sequelize_1.Op.lt]: oneWeekAgo.toDate(),
                };
            }
        }
        // Handle filter
        if (filter) {
            try {
                const filterObj = JSON.parse(filter);
                Object.assign(where, filterObj);
            }
            catch (e) {
                return res.status(400).json({ message: 'Invalid filter format' });
            }
        }
        // Handle search terms
        let include = [
            { model: models_1.Customer, as: 'customer' },
            { model: models_1.Item, as: 'items' },
        ];
        if (terms) {
            include[0].where = {
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.iLike]: `%${terms}%` } },
                    { email: { [sequelize_1.Op.iLike]: `%${terms}%` } },
                ],
            };
            // Also search in invoice id
            where[sequelize_1.Op.or] = where[sequelize_1.Op.or] || [];
            where[sequelize_1.Op.or].push({ id: { [sequelize_1.Op.iLike]: `%${terms}%` } });
        }
        const offset = (parseInt(page) - 1) * parseInt(size);
        const limit = parseInt(size);
        const { count, rows } = await models_1.Invoice.findAndCountAll({
            where,
            include,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });
        res.json({
            invoices: rows,
            total: count,
            page: parseInt(page),
            size: parseInt(size),
            totalPages: Math.ceil(count / limit),
        });
    }
    catch (error) {
        console.error('Error getting filtered invoices:', error);
        res
            .status(500)
            .json({ message: 'Failed to get invoices', error: error.message });
    }
};
exports.getInvoicesFiltered = getInvoicesFiltered;
const getInvoiceSummaryByStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const today = (0, moment_1.default)().startOf('day');
        const twoDaysPrior = today.clone().subtract(2, 'days');
        const twoDaysAfter = today.clone().add(2, 'days');
        const oneWeekAgo = today.clone().subtract(1, 'week');
        const draft = await models_1.Invoice.count({
            where: { userId: userId, status: 'draft' },
        });
        const pending = await models_1.Invoice.count({
            where: { userId: userId, status: 'pending' },
        });
        const due = await models_1.Invoice.count({
            where: {
                userId: userId,
                status: 'pending',
                dueDate: {
                    [sequelize_1.Op.between]: [twoDaysPrior.toDate(), twoDaysAfter.toDate()],
                },
            },
        });
        const overdue = await models_1.Invoice.count({
            where: {
                userId: userId,
                status: 'pending',
                dueDate: {
                    [sequelize_1.Op.lt]: oneWeekAgo.toDate(),
                },
            },
        });
        res.json({ draft, pending, due, overdue });
    }
    catch (error) {
        console.error('Error getting invoice summary:', error);
        res
            .status(500)
            .json({ message: 'Failed to get invoice summary', error: error.message });
    }
};
exports.getInvoiceSummaryByStatus = getInvoiceSummaryByStatus;
//# sourceMappingURL=invoiceCtrl.js.map