import express from 'express'
import {
  getBalance,
  getAccountStatement,
  getFinancialSummary,
  getReceivingAccountDetails,
  addCurrencyWallet,
  fundAccount,
  withdrawFunds,
  sendMoney,
  convertFunds,
} from '../controllers/walletCtrl'
import authenticatedToken from '../middleware/auth'

const router = express.Router()

// All wallet routes require authentication
router.use(authenticatedToken)

/**
 * @swagger
 * /api/wallets/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Current wallet balance
 *                 currency:
 *                   type: string
 *                   description: Wallet currency
 *       401:
 *         description: Unauthorized
 */
router.get('/balance', getBalance)

/**
 * @swagger
 * /api/wallets/statements:
 *   get:
 *     summary: Get account statements
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account statements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 */
router.get('/statements', getAccountStatement)

/**
 * @swagger
 * /api/wallets/expenses-income:
 *   get:
 *     summary: Get financial summary (expenses and income)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netBalance:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/expenses-income', getFinancialSummary)

/**
 * @swagger
 * /api/wallets/accounts/{id}:
 *   get:
 *     summary: Get receiving account details
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.get('/accounts/:id', getReceivingAccountDetails)

/**
 * @swagger
 * /api/wallets/add-currency:
 *   post:
 *     summary: Add currency wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *             properties:
 *               currency:
 *                 type: string
 *                 description: Currency code (e.g., USD, EUR)
 *     responses:
 *       201:
 *         description: Currency wallet added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/add-currency', addCurrencyWallet)

/**
 * @swagger
 * /api/wallets/fund:
 *   post:
 *     summary: Fund account
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to fund
 *               currency:
 *                 type: string
 *                 description: Currency code
 *     responses:
 *       200:
 *         description: Account funded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/fund', fundAccount)

/**
 * @swagger
 * /api/wallets/withdraw:
 *   post:
 *     summary: Withdraw funds
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *               currency:
 *                 type: string
 *                 description: Currency code
 *     responses:
 *       200:
 *         description: Funds withdrawn successfully
 *       400:
 *         description: Bad request or insufficient funds
 *       401:
 *         description: Unauthorized
 */
router.post('/withdraw', withdrawFunds)

/**
 * @swagger
 * /api/wallets/send:
 *   post:
 *     summary: Send money to another account
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - amount
 *               - currency
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: Recipient account ID
 *               amount:
 *                 type: number
 *                 description: Amount to send
 *               currency:
 *                 type: string
 *                 description: Currency code
 *     responses:
 *       200:
 *         description: Money sent successfully
 *       400:
 *         description: Bad request or insufficient funds
 *       401:
 *         description: Unauthorized
 */
router.post('/send', sendMoney)

/**
 * @swagger
 * /api/wallets/convert:
 *   post:
 *     summary: Convert funds between currencies
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromCurrency
 *               - toCurrency
 *               - amount
 *             properties:
 *               fromCurrency:
 *                 type: string
 *                 description: Source currency code
 *               toCurrency:
 *                 type: string
 *                 description: Target currency code
 *               amount:
 *                 type: number
 *                 description: Amount to convert
 *     responses:
 *       200:
 *         description: Funds converted successfully
 *       400:
 *         description: Bad request or insufficient funds
 *       401:
 *         description: Unauthorized
 */
router.post('/convert', convertFunds)

export default router
