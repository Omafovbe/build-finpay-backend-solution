import { Request as ExpressRequest, Response } from 'express'
import { User, Beneficiary } from '../models'
import { Op } from 'sequelize'
import {
  generateTwoFactorSecret,
  generateQRCodeUrl,
  generateQRCodeDataURL,
  generateBackupCodes,
  hashBackupCodes,
  verifyTwoFactorToken,
} from '../utils/twoFactor'
import bcrypt from 'bcryptjs'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

/**
 * Retrieves the current authenticated user's profile information.
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          'password',
          'resetPasswordToken',
          'resetPasswordExpires',
          'twoFactorSecret',
          'twoFactorBackupCodes',
        ],
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      status: 200,
      message: 'User profile retrieved successfully',
      data: user,
    })
  } catch (error: any) {
    console.error('Error retrieving current user:', error)
    res.status(500).json({
      message: 'Failed to retrieve user profile',
      error: error.message,
    })
  }
}

/**
 * Updates the authenticated user's profile information.
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const updateData = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // Remove fields that shouldn't be updated directly
    const fieldsToRemove = [
      'id',
      'email',
      'password',
      'createdAt',
      'updatedAt',
      'resetPasswordToken',
      'resetPasswordExpires',
    ]
    fieldsToRemove.forEach((field) => delete updateData[field])

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
      })
    }

    const [updatedRowsCount, updatedRows] = await User.update(updateData, {
      where: { id: userId },
      returning: true,
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const updatedUser = updatedRows[0]

    res.status(200).json({
      status: 200,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        accountType: updatedUser.accountType,
        country: updatedUser.country,
        countryCode: updatedUser.countryCode,
        state: updatedUser.state,
        address: updatedUser.address,
        phoneNumber: updatedUser.phoneNumber,
      },
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    res
      .status(500)
      .json({ message: 'Failed to update profile', error: error.message })
  }
}

/**
 * Adds a new beneficiary for the authenticated user.
 */
export const addBeneficiary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const {
      name,
      email,
      phoneNumber,
      bankName,
      accountNumber,
      accountType,
      relationship,
    } = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // Validate required fields
    const requiredFields = {
      name,
      email,
      phoneNumber,
      bankName,
      accountNumber,
      accountType,
      relationship,
    }

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` })
      }
    }

    // Validate account type
    const validAccountTypes = ['Savings', 'Current', 'Checking']
    if (!validAccountTypes.includes(accountType)) {
      return res.status(400).json({
        message: `Invalid account type. Must be one of: ${validAccountTypes.join(
          ', '
        )}`,
      })
    }

    // Check if beneficiary with same account number already exists for this user
    const existingBeneficiary = await Beneficiary.findOne({
      where: {
        userId,
        accountNumber,
      },
    })

    if (existingBeneficiary) {
      return res.status(409).json({
        message: 'A beneficiary with this account number already exists',
      })
    }

    const newBeneficiary = await Beneficiary.create({
      userId,
      name,
      email,
      phoneNumber,
      bankName,
      accountNumber,
      accountType,
      relationship,
    })

    res.status(201).json({
      status: 201,
      message: 'Beneficiary added successfully',
      data: newBeneficiary,
    })
  } catch (error: any) {
    console.error('Error adding beneficiary:', error)
    res
      .status(500)
      .json({ message: 'Failed to add beneficiary', error: error.message })
  }
}

/**
 * Searches beneficiaries for the authenticated user based on query parameters.
 */
export const searchBeneficiaries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const {
      name,
      email,
      phoneNumber,
      bankName,
      accountNumber,
      relationship,
      isActive,
      limit = 10,
      offset = 0,
    } = req.query

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // Build search conditions
    const searchConditions: any = { userId }

    if (name) {
      searchConditions.name = { [Op.iLike]: `%${name}%` }
    }
    if (email) {
      searchConditions.email = { [Op.iLike]: `%${email}%` }
    }
    if (phoneNumber) {
      searchConditions.phoneNumber = { [Op.iLike]: `%${phoneNumber}%` }
    }
    if (bankName) {
      searchConditions.bankName = { [Op.iLike]: `%${bankName}%` }
    }
    if (accountNumber) {
      searchConditions.accountNumber = { [Op.iLike]: `%${accountNumber}%` }
    }
    if (relationship) {
      searchConditions.relationship = { [Op.iLike]: `%${relationship}%` }
    }
    if (isActive !== undefined) {
      searchConditions.isActive = isActive === 'true'
    }

    const beneficiaries = await Beneficiary.findAll({
      where: searchConditions,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    })

    const totalCount = await Beneficiary.count({
      where: searchConditions,
    })

    res.status(200).json({
      status: 200,
      message: 'Beneficiaries retrieved successfully',
      data: {
        beneficiaries,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore:
            parseInt(offset as string) + parseInt(limit as string) < totalCount,
        },
      },
    })
  } catch (error: any) {
    console.error('Error searching beneficiaries:', error)
    res
      .status(500)
      .json({ message: 'Failed to search beneficiaries', error: error.message })
  }
}

/**
 * Retrieves all beneficiaries for the authenticated user.
 */
export const getBeneficiaries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { limit = 10, offset = 0, isActive } = req.query

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const whereCondition: any = { userId }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive === 'true'
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereCondition,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    })

    const totalCount = await Beneficiary.count({
      where: whereCondition,
    })

    res.status(200).json({
      status: 200,
      message: 'Beneficiaries retrieved successfully',
      data: {
        beneficiaries,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore:
            parseInt(offset as string) + parseInt(limit as string) < totalCount,
        },
      },
    })
  } catch (error: any) {
    console.error('Error retrieving beneficiaries:', error)
    res.status(500).json({
      message: 'Failed to retrieve beneficiaries',
      error: error.message,
    })
  }
}

/**
 * Retrieves a specific beneficiary by ID for the authenticated user.
 */
export const getBeneficiaryById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!id) {
      return res.status(400).json({ message: 'Beneficiary ID is required' })
    }

    const beneficiary = await Beneficiary.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    })

    if (!beneficiary) {
      return res.status(404).json({
        message: 'Beneficiary not found or access denied',
      })
    }

    res.status(200).json({
      status: 200,
      message: 'Beneficiary retrieved successfully',
      data: beneficiary,
    })
  } catch (error: any) {
    console.error('Error retrieving beneficiary:', error)
    res
      .status(500)
      .json({ message: 'Failed to retrieve beneficiary', error: error.message })
  }
}

/**
 * Updates a specific beneficiary for the authenticated user.
 */
export const updateBeneficiary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const updateData = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!id) {
      return res.status(400).json({ message: 'Beneficiary ID is required' })
    }

    // Remove fields that shouldn't be updated directly
    const fieldsToRemove = ['id', 'userId', 'createdAt', 'updatedAt']
    fieldsToRemove.forEach((field) => delete updateData[field])

    // Validate account type if provided
    if (updateData.accountType) {
      const validAccountTypes = ['Savings', 'Current', 'Checking']
      if (!validAccountTypes.includes(updateData.accountType)) {
        return res.status(400).json({
          message: `Invalid account type. Must be one of: ${validAccountTypes.join(
            ', '
          )}`,
        })
      }
    }

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
      })
    }

    const [updatedRowsCount] = await Beneficiary.update(updateData, {
      where: {
        id: parseInt(id),
        userId,
      },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        message: 'Beneficiary not found or access denied',
      })
    }

    // Fetch the updated beneficiary
    const updatedBeneficiary = await Beneficiary.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    })

    res.status(200).json({
      status: 200,
      message: 'Beneficiary updated successfully',
      data: updatedBeneficiary,
    })
  } catch (error: any) {
    console.error('Error updating beneficiary:', error)
    res
      .status(500)
      .json({ message: 'Failed to update beneficiary', error: error.message })
  }
}

/**
 * Deletes (soft delete by deactivating) a beneficiary for the authenticated user.
 */
export const deleteBeneficiary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!id) {
      return res.status(400).json({ message: 'Beneficiary ID is required' })
    }

    const beneficiary = await Beneficiary.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    })

    if (!beneficiary) {
      return res.status(404).json({
        message: 'Beneficiary not found or access denied',
      })
    }

    // Soft delete by deactivating
    await beneficiary.update({ isActive: false })

    res.status(200).json({
      status: 200,
      message: 'Beneficiary deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting beneficiary:', error)
    res
      .status(500)
      .json({ message: 'Failed to delete beneficiary', error: error.message })
  }
}

/**
 * Sets up 2FA for the authenticated user by generating a secret and QR code.
 */
export const setupTwoFactor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'twoFactorEnabled', 'twoFactorSecret'],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        message: '2FA is already enabled for this user',
      })
    }

    // Generate new 2FA secret
    const secret = generateTwoFactorSecret()

    // Generate QR code URL
    const qrCodeUrl = generateQRCodeUrl(secret, user.email)

    // Generate QR code data URL
    const qrCodeDataURL = await generateQRCodeDataURL(qrCodeUrl)

    // Generate backup codes
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = hashBackupCodes(backupCodes)

    // Store the secret and backup codes (don't enable 2FA yet)
    await user.update({
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedBackupCodes,
    })

    res.status(200).json({
      status: 200,
      message: '2FA setup initiated. Please verify with token to enable.',
      data: {
        qrCodeUrl: qrCodeDataURL,
        secret: secret, // Only for testing, remove in production
        backupCodes: backupCodes, // Only for testing, remove in production
        manualEntryKey: secret,
      },
    })
  } catch (error: any) {
    console.error('Error setting up 2FA:', error)
    res
      .status(500)
      .json({ message: 'Failed to setup 2FA', error: error.message })
  }
}

/**
 * Verifies 2FA token and enables 2FA for the user.
 */
export const verifyTwoFactorSetup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { token } = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!token) {
      return res.status(400).json({ message: '2FA token is required' })
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'twoFactorSecret', 'twoFactorEnabled'],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        message: '2FA is already enabled for this user',
      })
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        message: '2FA setup not initiated. Please call setup endpoint first.',
      })
    }

    // Verify the token
    const isValidToken = verifyTwoFactorToken(user.twoFactorSecret, token)

    if (!isValidToken) {
      return res.status(400).json({
        message: 'Invalid 2FA token',
      })
    }

    // Enable 2FA
    await user.update({
      twoFactorEnabled: true,
    })

    res.status(200).json({
      status: 200,
      message: '2FA has been successfully enabled for your account',
      data: {
        twoFactorEnabled: true,
      },
    })
  } catch (error: any) {
    console.error('Error verifying 2FA setup:', error)
    res
      .status(500)
      .json({ message: 'Failed to verify 2FA setup', error: error.message })
  }
}

/**
 * Disables 2FA for the authenticated user.
 */
export const disableTwoFactor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { password, token } = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!password || !token) {
      return res.status(400).json({
        message: 'Password and 2FA token are required',
      })
    }

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // If 2FA is enabled, verify token
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const isValidToken = verifyTwoFactorToken(user.twoFactorSecret, token)
      if (!isValidToken) {
        return res.status(400).json({ message: 'Invalid 2FA token' })
      }
    }

    // Disable 2FA and clear secret and backup codes
    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    })

    res.status(200).json({
      status: 200,
      message: '2FA has been successfully disabled for your account',
      data: {
        twoFactorEnabled: false,
      },
    })
  } catch (error: any) {
    console.error('Error disabling 2FA:', error)
    res
      .status(500)
      .json({ message: 'Failed to disable 2FA', error: error.message })
  }
}

/**
 * Generates new backup codes for the user.
 */
export const generateNewBackupCodes = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId
    const { token } = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!token) {
      return res.status(400).json({ message: '2FA token is required' })
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'twoFactorSecret', 'twoFactorEnabled'],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        message: '2FA is not enabled for this user',
      })
    }

    // Verify the token
    const isValidToken = verifyTwoFactorToken(user.twoFactorSecret, token)
    if (!isValidToken) {
      return res.status(400).json({ message: 'Invalid 2FA token' })
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = hashBackupCodes(backupCodes)

    // Update user with new backup codes
    await user.update({
      twoFactorBackupCodes: hashedBackupCodes,
    })

    res.status(200).json({
      status: 200,
      message: 'New backup codes generated successfully',
      data: {
        backupCodes: backupCodes, // Only for testing, remove in production
      },
    })
  } catch (error: any) {
    console.error('Error generating backup codes:', error)
    res.status(500).json({
      message: 'Failed to generate backup codes',
      error: error.message,
    })
  }
}

/**
 * Gets 2FA status for the authenticated user.
 */
export const getTwoFactorStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'twoFactorEnabled', 'twoFactorSecret'],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      status: 200,
      message: '2FA status retrieved successfully',
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
        hasSecret: !!user.twoFactorSecret,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving 2FA status:', error)
    res
      .status(500)
      .json({ message: 'Failed to retrieve 2FA status', error: error.message })
  }
}
