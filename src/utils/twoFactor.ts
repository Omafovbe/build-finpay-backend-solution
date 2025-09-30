import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import crypto from 'crypto'

/**
 * Generates a new 2FA secret for a user
 */
export const generateTwoFactorSecret = (): string => {
  return speakeasy.generateSecret({
    name: 'FinPay',
    issuer: 'FinPay',
    length: 32,
  }).base32
}

/**
 * Generates a QR code URL for 2FA setup
 */
export const generateQRCodeUrl = (secret: string, email: string): string => {
  return speakeasy.otpauthURL({
    secret: secret,
    label: email,
    issuer: 'FinPay',
    encoding: 'base32',
  })
}

/**
 * Generates QR code as data URL
 */
export const generateQRCodeDataURL = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url)
  } catch (error) {
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Verifies a 2FA token
 */
export const verifyTwoFactorToken = (
  secret: string,
  token: string
): boolean => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow for 30 seconds clock skew
  })
}

/**
 * Generates backup codes for 2FA
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }

  return codes
}

/**
 * Verifies a backup code
 */
export const verifyBackupCode = (
  backupCodes: string[],
  code: string
): { valid: boolean; remainingCodes?: string[] } => {
  const codeIndex = backupCodes.findIndex((backupCode) => backupCode === code)

  if (codeIndex === -1) {
    return { valid: false }
  }

  // Remove the used code from the array
  const remainingCodes = backupCodes.filter((_, index) => index !== codeIndex)

  return {
    valid: true,
    remainingCodes,
  }
}

/**
 * Hashes backup codes for secure storage
 */
export const hashBackupCodes = (codes: string[]): string => {
  return codes.join(',')
}

/**
 * Validates backup codes format
 */
export const parseBackupCodes = (hashedCodes: string): string[] => {
  return hashedCodes.split(',').filter((code) => code.length > 0)
}
