import { Router } from 'express'
import {
  getDashboardOverview,
  getWalletBalances,
  getFinancialSummary,
  getUserAccounts,
  getInvoiceSummary,
  getExchangeRates,
  getActiveVirtualCards,
  getAccountById,
} from '../controllers/dashboardCtrl'
import authenticateToken from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

/**
 * @swagger
 * /api/dashboard/balances:
 *   get:
 *     summary: Get dashboard overview with balance information
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All balances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "All baalnces retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: string
 *                       example: "5,350"
 *                     usd:
 *                       type: string
 *                       example: "500"
 *                     gbp:
 *                       type: string
 *                       example: "2,200"
 *                     eur:
 *                       type: string
 *                       example: "5,700"
 *                     ngn:
 *                       type: string
 *                       example: "2,200,000"
 *                     currency:
 *                       type: string
 *                       example: "USD"
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/balances', getDashboardOverview)

/**
 * @swagger
 * /api/dashboard/wallet-balances:
 *   get:
 *     summary: Get wallet balances for all currencies
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Wallet balances retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balances:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                           balance:
 *                             type: number
 *                             example: 1500.50
 *                           formattedBalance:
 *                             type: string
 *                             example: "$1,500.50"
 *                     totalBalanceUSD:
 *                       type: number
 *                       example: 1500.50
 *                     totalBalanceFormatted:
 *                       type: string
 *                       example: "$1,500.50"
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/wallet-balances', getWalletBalances)

/**
 * @swagger
 * /api/dashboard/financial-summary:
 *   get:
 *     summary: Get financial summary with income, expenses, and transaction breakdown
 *     tags: [Dashboard]
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
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Financial summary retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                       example: 5000.00
 *                     totalExpenses:
 *                       type: number
 *                       example: 2500.00
 *                     netIncome:
 *                       type: number
 *                       example: 2500.00
 *                     transactionCount:
 *                       type: integer
 *                       example: 45
 *                     byCurrency:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                           income:
 *                             type: number
 *                             example: 3000.00
 *                           expenses:
 *                             type: number
 *                             example: 1500.00
 *                           count:
 *                             type: integer
 *                             example: 25
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/financial-summary', getFinancialSummary)

/**
 * @swagger
 * /api/dashboard/accounts:
 *   get:
 *     summary: Get all accounts for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "User accounts retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "123e4567-e89b-12d3-a456-426614174000"
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                           accountHolder:
 *                             type: string
 *                             example: "John Doe"
 *                           bankName:
 *                             type: string
 *                             example: "WELLS FARGO BANK, N.A."
 *                           accountNumber:
 *                             type: string
 *                             example: "1234567890"
 *                           routingNumber:
 *                             type: string
 *                             example: "121000248"
 *                           accountType:
 *                             type: string
 *                             example: "checking"
 *                           address:
 *                             type: string
 *                             example: "123 Main St, New York, NY 10001"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                     totalAccounts:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/accounts', getUserAccounts)

/**
 * @swagger
 * /api/dashboard/invoice-summary:
 *   get:
 *     summary: Get invoice summary with counts for due, overdue, and pending invoices
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieved invoices summaries successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Retrieved invoices summaries successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoices:
 *                       type: object
 *                       properties:
 *                         due:
 *                           type: integer
 *                           description: Number of invoices due (future due date, pending status)
 *                           example: 20
 *                         overdue:
 *                           type: integer
 *                           description: Number of overdue invoices (past due date, not paid)
 *                           example: 2
 *                         pending:
 *                           type: integer
 *                           description: Number of pending invoices (pending status)
 *                           example: 82
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/invoice-summary', getInvoiceSummary)

/**
 * @swagger
 * /api/dashboard/exchange-rates:
 *   get:
 *     summary: Get current exchange rates with buy and sell prices
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [NGN, USD, EUR, GBP, GHS]
 *         description: Base currency for exchange rates (default is NGN)
 *         example: NGN
 *     responses:
 *       200:
 *         description: Retrieved current exchange rates successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Retrieved current exchange rates successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                       description: The base currency used for rates
 *                       example: "NGN"
 *                     rates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currency:
 *                             type: string
 *                             description: Target currency code
 *                             example: "USD"
 *                           buyPrice:
 *                             type: string
 *                             description: Buy price (formatted with commas)
 *                             example: "1,320"
 *                           sellPrice:
 *                             type: string
 *                             description: Sell price with markup (formatted with commas)
 *                             example: "1,390"
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error or API configuration missing
 */
router.get('/exchange-rates', getExchangeRates)

/**
 * @swagger
 * /api/dashboard/cards:
 *   get:
 *     summary: Get all active virtual cards for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active virtual cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Active virtual cards retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cardReference:
 *                             type: string
 *                             description: Unique card reference ID
 *                             example: "123e4567-e89b-12d3-a456-426614174000"
 *                           reference:
 *                             type: string
 *                             description: Card reference number
 *                             example: "VC-2024-001"
 *                           type:
 *                             type: string
 *                             description: Card type
 *                             example: "virtual"
 *                           currency:
 *                             type: string
 *                             description: Card currency
 *                             example: "USD"
 *                           holderName:
 *                             type: string
 *                             description: Cardholder name
 *                             example: "John Doe"
 *                           brand:
 *                             type: string
 *                             description: Card brand
 *                             example: "visa"
 *                           expiryMonth:
 *                             type: string
 *                             description: Card expiry month
 *                             example: "12"
 *                           expiryYear:
 *                             type: string
 *                             description: Card expiry year
 *                             example: "2025"
 *                           firstSix:
 *                             type: string
 *                             description: First 6 digits of card number
 *                             example: "411111"
 *                           lastFour:
 *                             type: string
 *                             description: Last 4 digits of card number
 *                             example: "1111"
 *                           status:
 *                             type: string
 *                             description: Card status
 *                             example: "active"
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             description: Card creation date
 *                             example: "2024-01-15T10:30:00Z"
 *                           fees:
 *                             type: number
 *                             description: Card fees
 *                             example: 2.50
 *                           walletId:
 *                             type: string
 *                             description: Associated wallet ID
 *                             example: "wallet-123"
 *                     totalCards:
 *                       type: integer
 *                       description: Total number of active virtual cards
 *                       example: 3
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/cards', getActiveVirtualCards)

/**
 * @swagger
 * /api/dashboard/accounts/{accountId}:
 *   get:
 *     summary: Get a single account by account ID
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique account ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Account retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Account retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Unique account ID
 *                           example: "123e4567-e89b-12d3-a456-426614174000"
 *                         currency:
 *                           type: string
 *                           description: Account currency
 *                           example: "USD"
 *                         accountHolder:
 *                           type: string
 *                           description: Account holder name
 *                           example: "John Doe"
 *                         bankName:
 *                           type: string
 *                           description: Bank name
 *                           example: "WELLS FARGO BANK, N.A."
 *                         accountNumber:
 *                           type: string
 *                           description: Account number
 *                           example: "1234567890"
 *                         routingNumber:
 *                           type: string
 *                           description: Routing number
 *                           example: "121000248"
 *                         accountType:
 *                           type: string
 *                           description: Type of account
 *                           example: "checking"
 *                         address:
 *                           type: string
 *                           description: Account holder address
 *                           example: "123 Main St, New York, NY 10001"
 *                         isActive:
 *                           type: boolean
 *                           description: Account status
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           description: Account creation date
 *                           example: "2024-01-15T10:30:00Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Account last update date
 *                           example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get('/accounts/:accountId', getAccountById)

export default router
