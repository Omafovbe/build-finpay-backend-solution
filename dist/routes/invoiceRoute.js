"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoiceCtrl_1 = require("../controllers/invoiceCtrl");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
/**
 * @swagger
 * /api/invoice:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth_1.default, invoiceCtrl_1.getAllInvoices);
/**
 * @swagger
 * /api/invoice/filtered:
 *   get:
 *     summary: Get filtered invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *         description: Filter by invoice status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *     responses:
 *       200:
 *         description: Filtered list of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 */
router.get('/filtered', auth_1.default, invoiceCtrl_1.getInvoicesFiltered);
/**
 * @swagger
 * /api/invoice:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - amount
 *               - currency
 *               - dueDate
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID
 *               amount:
 *                 type: number
 *                 description: Invoice amount
 *               currency:
 *                 type: string
 *                 description: Currency code
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth_1.default, invoiceCtrl_1.createInvoice);
/**
 * @swagger
 * /api/invoice/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth_1.default, invoiceCtrl_1.getInvoiceById);
/**
 * @swagger
 * /api/invoice/{id}:
 *   put:
 *     summary: Update invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth_1.default, invoiceCtrl_1.updateInvoice);
/**
 * @swagger
 * /api/invoice/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth_1.default, invoiceCtrl_1.deleteInvoice);
/**
 * @swagger
 * /api/invoice/summary/status:
 *   get:
 *     summary: Get invoice summary by status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice summary by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending:
 *                   type: integer
 *                   description: Number of pending invoices
 *                 paid:
 *                   type: integer
 *                   description: Number of paid invoices
 *                 overdue:
 *                   type: integer
 *                   description: Number of overdue invoices
 *                 cancelled:
 *                   type: integer
 *                   description: Number of cancelled invoices
 *       401:
 *         description: Unauthorized
 */
router.get('/summary/status', auth_1.default, invoiceCtrl_1.getInvoiceSummaryByStatus);
exports.default = router;
//# sourceMappingURL=invoiceRoute.js.map