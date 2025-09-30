import { Router } from 'express'
import {
  getCurrentUser,
  updateProfile,
  addBeneficiary,
  searchBeneficiaries,
  getBeneficiaries,
  getBeneficiaryById,
  updateBeneficiary,
  deleteBeneficiary,
  setupTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
  generateNewBackupCodes,
  getTwoFactorStatus,
} from '../controllers/userCtrl'
import authenticateToken from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/profile', getCurrentUser)

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [Freelancer, Company]
 *               country:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               state:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/profile', updateProfile)

/**
 * @swagger
 * /api/user/beneficiaries:
 *   post:
 *     summary: Add a new beneficiary
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *               - bankName
 *               - accountNumber
 *               - accountType
 *               - relationship
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [Savings, Current, Checking]
 *               relationship:
 *                 type: string
 *     responses:
 *       201:
 *         description: Beneficiary added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       409:
 *         description: Beneficiary already exists
 *       500:
 *         description: Internal server error
 */
router.post('/beneficiaries', addBeneficiary)

/**
 * @swagger
 * /api/user/beneficiaries/search:
 *   get:
 *     summary: Search beneficiaries
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by beneficiary name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Search by beneficiary email
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *         description: Search by beneficiary phone number
 *       - in: query
 *         name: bankName
 *         schema:
 *           type: string
 *         description: Search by bank name
 *       - in: query
 *         name: accountNumber
 *         schema:
 *           type: string
 *         description: Search by account number
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *         description: Search by relationship
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Beneficiaries retrieved successfully
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/beneficiaries/search', searchBeneficiaries)

/**
 * @swagger
 * /api/user/beneficiaries:
 *   get:
 *     summary: Get all user beneficiaries
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Beneficiaries retrieved successfully
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/beneficiaries', getBeneficiaries)

/**
 * @swagger
 * /api/user/beneficiaries/{id}:
 *   get:
 *     summary: Get beneficiary by ID
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Beneficiary ID
 *     responses:
 *       200:
 *         description: Beneficiary retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Beneficiary not found
 *       500:
 *         description: Internal server error
 */
router.get('/beneficiaries/:id', getBeneficiaryById)

/**
 * @swagger
 * /api/user/beneficiaries/{id}:
 *   put:
 *     summary: Update beneficiary
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Beneficiary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               accountType:
 *                 type: string
 *                 enum: [Savings, Current, Checking]
 *               relationship:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Beneficiary updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Beneficiary not found
 *       500:
 *         description: Internal server error
 */
router.put('/beneficiaries/:id', updateBeneficiary)

/**
 * @swagger
 * /api/user/beneficiaries/{id}:
 *   delete:
 *     summary: Delete beneficiary (soft delete)
 *     tags: [Beneficiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Beneficiary ID
 *     responses:
 *       200:
 *         description: Beneficiary deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Beneficiary not found
 *       500:
 *         description: Internal server error
 */
router.delete('/beneficiaries/:id', deleteBeneficiary)

/**
 * @swagger
 * /api/user/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user account
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated successfully
 *       400:
 *         description: 2FA already enabled
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/2fa/setup', setupTwoFactor)

/**
 * @swagger
 * /api/user/2fa/verify:
 *   post:
 *     summary: Verify 2FA token and enable 2FA
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit token from authenticator app
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid token or 2FA already enabled
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/2fa/verify', verifyTwoFactorSetup)

/**
 * @swagger
 * /api/user/2fa/status:
 *   get:
 *     summary: Get 2FA status for user
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved successfully
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/2fa/status', getTwoFactorStatus)

/**
 * @swagger
 * /api/user/2fa/disable:
 *   post:
 *     summary: Disable 2FA for user account
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *                 description: User password for verification
 *               token:
 *                 type: string
 *                 description: Current 2FA token
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid password or token
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/2fa/disable', disableTwoFactor)

/**
 * @swagger
 * /api/user/2fa/backup-codes:
 *   post:
 *     summary: Generate new backup codes
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Current 2FA token
 *     responses:
 *       200:
 *         description: New backup codes generated successfully
 *       400:
 *         description: Invalid token or 2FA not enabled
 *       401:
 *         description: Authentication error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/2fa/backup-codes', generateNewBackupCodes)

export default router
