import express from 'express'
import {
  createCard,
  getAllCards,
  getCardById,
  deleteCard,
} from '../controllers/cardCtrl'
import authenticatedToken from '../middleware/auth'

const router = express.Router()

// Apply authentication middleware to all card routes
router.use(authenticatedToken)

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardNumber
 *               - cardType
 *               - expiryDate
 *             properties:
 *               cardNumber:
 *                 type: string
 *                 description: Card number
 *               cardType:
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Type of card
 *               expiryDate:
 *                 type: string
 *                 description: Card expiry date
 *     responses:
 *       201:
 *         description: Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', createCard)

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get all user cards
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllCards)

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get card by ID
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getCardById)

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Delete card by ID
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *       404:
 *         description: Card not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', deleteCard)

export default router
