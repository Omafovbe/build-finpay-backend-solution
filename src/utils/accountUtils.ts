/**
 * Utility functions for generating account-related data
 */

/**
 * Generates a random account number
 * Format: XXXX-XXXX-XXXX (12 digits with dashes)
 */
export const generateAccountNumber = (): string => {
  const segments: string[] = []

  for (let i = 0; i < 3; i++) {
    // Generate 4-digit segments
    const segment = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    segments.push(segment)
  }

  return segments.join('-')
}

/**
 * Generates a random routing number
 * Format: XXXXXXXX (9 digits)
 */
export const generateRoutingNumber = (): string => {
  // Generate 9-digit routing number
  const routingNumber = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, '0')
  return routingNumber
}

/**
 * Generates a random address for account
 */
export const generateRandomAddress = (): string => {
  const streetNumbers = ['123', '456', '789', '321', '654', '987']
  const streetNames = [
    'Main Street',
    'Oak Avenue',
    'Pine Road',
    'Elm Drive',
    'Cedar Lane',
    'Maple Street',
    'Washington Blvd',
    'Lincoln Avenue',
    'Jefferson Street',
    'Adams Road',
  ]
  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
  ]
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA']
  const zipCodes = [
    '10001',
    '90210',
    '60601',
    '77001',
    '85001',
    '19101',
    '78201',
    '92101',
    '75201',
    '95101',
  ]

  const streetNumber =
    streetNumbers[Math.floor(Math.random() * streetNumbers.length)]
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const state = states[Math.floor(Math.random() * states.length)]
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)]

  return `${streetNumber} ${streetName}, ${city}, ${state} ${zipCode}`
}

/**
 * Generates a random bank name
 */
export const generateRandomBankName = (): string => {
  const bankNames = [
    'Bank of America',
    'Chase Bank',
    'Wells Fargo Bank',
    'Citibank',
    'US Bank',
    'PNC Bank',
    'TD Bank',
    'Capital One',
    'BB&T Bank',
    'SunTrust Bank',
    'Regions Bank',
    'Fifth Third Bank',
    'KeyBank',
    'M&T Bank',
    'Huntington Bank',
  ]

  return bankNames[Math.floor(Math.random() * bankNames.length)]
}

/**
 * Validates account number format
 */
export const isValidAccountNumber = (accountNumber: string): boolean => {
  const accountNumberRegex = /^\d{4}-\d{4}-\d{4}$/
  return accountNumberRegex.test(accountNumber)
}

/**
 * Validates routing number format
 */
export const isValidRoutingNumber = (routingNumber: string): boolean => {
  const routingNumberRegex = /^\d{9}$/
  return routingNumberRegex.test(routingNumber)
}
