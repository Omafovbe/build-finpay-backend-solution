import { Request as ExpressRequest, Response, NextFunction } from 'express'
import { User } from '../models'
import {
  verifyTwoFactorToken,
  verifyBackupCode,
  parseBackupCodes,
} from '../utils/twoFactor'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

/**
 * Middleware to verify 2FA token or backup code
 */
export const verifyTwoFactor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId
    const { twoFactorToken, backupCode } = req.body

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication error: User not found',
      })
    }

    // Get user with 2FA information
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'email',
        'twoFactorSecret',
        'twoFactorEnabled',
        'twoFactorBackupCodes',
      ],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if 2FA is enabled for this user
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        message: '2FA is not enabled for this user',
      })
    }

    let isValidToken = false
    let isValidBackupCode = false

    // Verify 2FA token if provided
    if (twoFactorToken) {
      isValidToken = verifyTwoFactorToken(user.twoFactorSecret, twoFactorToken)
    }

    // Verify backup code if provided
    if (backupCode && user.twoFactorBackupCodes) {
      const backupCodes = parseBackupCodes(user.twoFactorBackupCodes)
      const backupResult = verifyBackupCode(backupCodes, backupCode)

      if (backupResult.valid && backupResult.remainingCodes) {
        isValidBackupCode = true

        // Update user with remaining backup codes
        await user.update({
          twoFactorBackupCodes: backupResult.remainingCodes.join(','),
        })
      }
    }

    // Check if either token or backup code is valid
    if (!isValidToken && !isValidBackupCode) {
      return res.status(401).json({
        message: 'Invalid 2FA token or backup code',
      })
    }

    // Add 2FA verification status to request
    req.user!.twoFactorVerified = true
    next()
  } catch (error: any) {
    console.error('2FA verification error:', error)
    res.status(500).json({
      message: '2FA verification failed',
      error: error.message,
    })
  }
}

/**
 * Middleware to check if 2FA is required for a route
 */
export const requireTwoFactor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication error: User not found',
      })
    }

    // Get user 2FA status
    const user = await User.findByPk(userId, {
      attributes: ['id', 'twoFactorEnabled'],
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // If 2FA is enabled, require verification
    if (user.twoFactorEnabled) {
      return res.status(403).json({
        message: '2FA verification required',
        requiresTwoFactor: true,
      })
    }

    next()
  } catch (error: any) {
    console.error('2FA requirement check error:', error)
    res.status(500).json({
      message: 'Failed to check 2FA requirement',
      error: error.message,
    })
  }
}
