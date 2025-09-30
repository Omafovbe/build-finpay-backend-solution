import axios from 'axios'

// The currencies you want to support
const SUPPORTED_CURRENCIES = 'USD,NGN,GBP,GHS,EUR'

interface CurrencyLayerResponse {
  success: boolean
  source: string
  quotes: {
    [key: string]: number
  }
  error?: {
    code: number
    info: string
  }
}

/**
 * Converts an amount from a source currency to a target currency using the currencylayer API.
 * @param amount The amount to convert.
 * @param fromCurrency The source currency code (e.g., 'USD').
 * @param toCurrency The target currency code (e.g., 'NGN').
 * @returns The converted amount.
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  // If currencies are the same, no conversion is needed
  if (fromCurrency === toCurrency) {
    return amount
  }

  const API_URL = process.env.CURRENCY_API_URL
  const API_TOKEN = process.env.CURRENCY_API_TOKEN

  if (!API_URL || !API_TOKEN) {
    throw new Error('Currency API URL or Token is not defined in .env file.')
  }

  // Construct the full API endpoint URL
  // The free plan for currencylayer only allows USD as the source currency.
  const endpoint = `${API_URL}access_key=${API_TOKEN}&currencies=${SUPPORTED_CURRENCIES}&source=USD&format=1`

  try {
    const { data } = await axios.get<CurrencyLayerResponse>(endpoint)

    if (!data.success || !data.quotes) {
      throw new Error(data.error?.info || 'Failed to fetch currency rates.')
    }

    const quotes = data.quotes // e.g., { "USDNGN": 1450.50, "USDGBP": 0.82 }

    // Get the rate for the 'from' currency relative to the source (USD)
    const fromRate = fromCurrency === 'USD' ? 1 : quotes[`USD${fromCurrency}`]
    // Get the rate for the 'to' currency relative to the source (USD)
    const toRate = toCurrency === 'USD' ? 1 : quotes[`USD${toCurrency}`]

    if (!fromRate || !toRate) {
      throw new Error(
        `Conversion rate for ${fromCurrency} or ${toCurrency} not available.`
      )
    }

    // First, convert the 'from' amount to the base currency (USD)
    const amountInUSD = amount / fromRate

    // Then, convert the USD amount to the 'to' currency
    const convertedAmount = amountInUSD * toRate

    return convertedAmount
  } catch (error: any) {
    console.error('Currency conversion API error:', error.message)
    // Rethrow the error to be handled by the calling controller function
    throw new Error('Could not perform currency conversion.')
  }
}
