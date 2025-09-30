import { Request as ExpressRequest, Response } from 'express'
import { Transaction, User, Card, Wallet, Account, Invoice } from '../models'
import { Op } from 'sequelize'
import { sequelize } from '../schema/db'
import axios from 'axios'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

/**
 * Get dashboard overview with wallet balances for all currencies
 */
export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // Get all wallets for the user with their balances
    const wallets = await Wallet.findAll({
      where: { userId },
      attributes: ['currency', 'balance'],
      order: [['currency', 'ASC']],
    })

    if (wallets.length === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No wallets found for this user',
        data: {
          total: '0',
          currency: 'USD',
        },
      })
    }

    // Build dynamic currency balances based on user's actual wallets
    const currencyBalances: { [key: string]: string } = {}
    let totalBalance = 0
    let defaultCurrency = 'USD'

    wallets.forEach((wallet) => {
      const balance = parseFloat(wallet.balance.toString())
      const currency = wallet.currency.toLowerCase()

      // Add this currency to our balances
      currencyBalances[currency] = balance.toLocaleString()

      // Use USD as total if available, otherwise use first currency found
      if (currency === 'usd') {
        totalBalance = balance
        defaultCurrency = wallet.currency // Use actual currency code (USD)
      } else if (totalBalance === 0) {
        // If no USD wallet, use the first available currency as total
        totalBalance = balance
        defaultCurrency = wallet.currency
      }
    })

    // Build the response data dynamically
    const responseData: any = {
      total: totalBalance.toLocaleString(),
      currency: defaultCurrency,
    }

    // Add all currency balances to response
    Object.entries(currencyBalances).forEach(([currency, balance]) => {
      responseData[currency] = balance
    })

    res.status(200).json({
      status: 200,
      message: 'All balances retrieved successfully',
      data: responseData,
    })
  } catch (error: any) {
    console.error('Error retrieving dashboard overview:', error)
    res.status(500).json({
      message: 'Failed to retrieve dashboard overview',
      error: error.message,
    })
  }
}

/**
 * Get wallet balances summary by currency
 */
export const getWalletBalances = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const wallets = await Wallet.findAll({
      where: { userId },
      attributes: ['currency', 'balance'],
      order: [['currency', 'ASC']],
    })

    if (wallets.length === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No wallets found for this user',
        data: {
          balances: [],
          totalBalanceUSD: 0,
        },
      })
    }

    const balances = wallets.map((wallet) => ({
      currency: wallet.currency,
      balance: parseFloat(wallet.balance.toString()),
      formattedBalance: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: wallet.currency,
      }).format(parseFloat(wallet.balance.toString())),
    }))

    // Calculate total in USD for reference
    const usdWallet = wallets.find((w) => w.currency === 'USD')
    const totalBalanceUSD = usdWallet
      ? parseFloat(usdWallet.balance.toString())
      : 0

    res.status(200).json({
      status: 200,
      message: 'Wallet balances retrieved successfully',
      data: {
        balances,
        totalBalanceUSD,
        totalBalanceFormatted: usdWallet
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalBalanceUSD)
          : '$0.00',
      },
    })
  } catch (error: any) {
    console.error('Error retrieving wallet balances:', error)
    res.status(500).json({
      message: 'Failed to retrieve wallet balances',
      error: error.message,
    })
  }
}

/**
 * Get financial summary for dashboard
 */
export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const wallets = await Wallet.findAll({
      where: { userId },
      attributes: ['id', 'currency', 'balance'],
    })

    if (wallets.length === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No wallets found for this user',
        data: {
          totalIncome: 0,
          totalExpenses: 0,
          netIncome: 0,
          transactionCount: 0,
          byCurrency: [],
        },
      })
    }

    const walletIds = wallets.map((w) => w.id)

    // Get transaction summary
    const totalIncome = await Transaction.sum('amount', {
      where: {
        walletId: { [Op.in]: walletIds },
        type: 'credit',
      },
    })

    const totalExpenses = await Transaction.sum('amount', {
      where: {
        walletId: { [Op.in]: walletIds },
        type: 'debit',
      },
    })

    const transactionCount = await Transaction.count({
      where: {
        walletId: { [Op.in]: walletIds },
      },
    })

    // Get breakdown by currency
    const currencyBreakdown = await Transaction.findAll({
      where: {
        walletId: { [Op.in]: walletIds },
      },
      attributes: [
        'currency',
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['currency', 'type'],
      raw: true,
    })

    const byCurrency = currencyBreakdown.reduce((acc: any, item: any) => {
      const currency = item.currency
      if (!acc[currency]) {
        acc[currency] = {
          currency,
          income: 0,
          expenses: 0,
          count: 0,
        }
      }

      if (item.type === 'credit') {
        acc[currency].income += parseFloat(item.totalAmount || 0)
      } else {
        acc[currency].expenses += parseFloat(item.totalAmount || 0)
      }
      acc[currency].count += parseInt(item.count || 0)

      return acc
    }, {})

    res.status(200).json({
      status: 200,
      message: 'Financial summary retrieved successfully',
      data: {
        totalIncome: parseFloat((totalIncome || 0).toString()),
        totalExpenses: parseFloat((totalExpenses || 0).toString()),
        netIncome:
          parseFloat((totalIncome || 0).toString()) -
          parseFloat((totalExpenses || 0).toString()),
        transactionCount,
        byCurrency: Object.values(byCurrency),
      },
    })
  } catch (error: any) {
    console.error('Error retrieving financial summary:', error)
    res.status(500).json({
      message: 'Failed to retrieve financial summary',
      error: error.message,
    })
  }
}

/**
 * Get all accounts for the authenticated user
 */
export const getUserAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const accounts = await Account.findAll({
      where: {
        userId,
        isActive: true,
      },
      attributes: [
        'id',
        'currency',
        'accountHolder',
        'bankName',
        'accountNumber',
        'routingNumber',
        'accountType',
        'address',
        'isActive',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']],
    })

    if (accounts.length === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No accounts found for this user',
        data: {
          accounts: [],
          totalAccounts: 0,
        },
      })
    }

    // Format accounts data for response
    const formattedAccounts = accounts.map((account) => ({
      id: account.id,
      currency: account.currency,
      accountHolder: account.accountHolder,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber,
      accountType: account.accountType,
      address: account.address,
      isActive: account.isActive,
      createdAt: account.createdAt,
    }))

    res.status(200).json({
      status: 200,
      message: 'User accounts retrieved successfully',
      data: {
        accounts: formattedAccounts,
        totalAccounts: accounts.length,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving user accounts:', error)
    res.status(500).json({
      message: 'Failed to retrieve user accounts',
      error: error.message,
    })
  }
}

/**
 * Get invoice summary for dashboard
 */
export const getInvoiceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const currentDate = new Date()

    // Count pending invoices (status = 'pending')
    const pendingCount = await Invoice.count({
      where: {
        userId,
        status: 'pending',
      },
    })

    // Count overdue invoices (dueDate < current date and status != 'paid')
    const overdueCount = await Invoice.count({
      where: {
        userId,
        dueDate: {
          [Op.lt]: currentDate,
        },
        status: {
          [Op.ne]: 'paid',
        },
      },
    })

    // Count due invoices (dueDate >= current date and status = 'pending')
    const dueCount = await Invoice.count({
      where: {
        userId,
        dueDate: {
          [Op.gte]: currentDate,
        },
        status: 'pending',
      },
    })

    res.status(200).json({
      status: 200,
      message: 'Retrieved invoices summaries successfully',
      data: {
        invoices: {
          due: dueCount,
          overdue: overdueCount,
          pending: pendingCount,
        },
      },
    })
  } catch (error: any) {
    console.error('Error retrieving invoice summary:', error)
    res.status(500).json({
      message: 'Failed to retrieve invoice summary',
      error: error.message,
    })
  }
}

/**
 * Get current exchange rates for dashboard
 */
export const getExchangeRates = async (req: AuthRequest, res: Response) => {
  try {
    const baseCurrency = (req.query.currency as string) || 'NGN' // Default to NGN if not provided

    const API_URL = process.env.CURRENCY_API_URL
    const API_TOKEN = process.env.CURRENCY_API_TOKEN

    if (!API_URL || !API_TOKEN) {
      return res.status(500).json({
        message: 'Currency API configuration is missing',
      })
    }

    // The currencies you want to support (from the existing utility)
    const SUPPORTED_CURRENCIES = 'USD,NGN,GBP,GHS,EUR'

    // Construct the full API endpoint URL
    const endpoint = `${API_URL}access_key=${API_TOKEN}&currencies=${SUPPORTED_CURRENCIES}&source=USD&format=1`

    const { data } = await axios.get<{
      success: boolean
      source: string
      quotes: { [key: string]: number }
      error?: { code: number; info: string }
    }>(endpoint)

    if (!data.success || !data.quotes) {
      return res.status(500).json({
        message: data.error?.info || 'Failed to fetch currency rates.',
      })
    }

    const quotes = data.quotes // e.g., { "USDNGN": 1450.50, "USDGBP": 0.82 }

    // Define all supported currencies
    const allSupportedCurrencies = ['USD', 'EUR', 'GBP', 'GHS', 'NGN']

    // Build rates array with buyPrice and sellPrice
    const rates = allSupportedCurrencies
      .filter((currency) => currency !== baseCurrency) // Exclude base currency from rates
      .map((currency) => {
        // Get the rate for this currency relative to USD
        const rateToUSD = quotes[`USD${currency}`]

        if (!rateToUSD) {
          throw new Error(`Rate for ${currency} not available`)
        }

        // Calculate buy price: how many units of target currency per 1 unit of base currency
        let buyPrice: number

        if (baseCurrency === 'USD') {
          // If base is USD, buy price is direct rate (how many target currency per 1 USD)
          buyPrice = rateToUSD
        } else {
          // Get rate from base currency to USD
          const baseToUSD = quotes[`USD${baseCurrency}`]
          if (!baseToUSD) {
            throw new Error(
              `Rate for base currency ${baseCurrency} not available`
            )
          }

          // Calculate: 1 base currency = X USD, and 1 USD = Y target currency
          // So 1 base currency = X * Y target currency
          buyPrice = baseToUSD * rateToUSD
        }

        // Add markup for sell price (approximately 5% markup)
        const markupPercentage = 0.05 // 5% markup
        const sellPrice = buyPrice * (1 + markupPercentage)

        return {
          currency,
          buyPrice: buyPrice.toLocaleString(),
          sellPrice: sellPrice.toLocaleString(),
        }
      })

    res.status(200).json({
      status: 200,
      message: 'Retrieved current exchange rates successfully',
      data: {
        currency: baseCurrency,
        rates,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving exchange rates:', error)
    res.status(500).json({
      message: 'Failed to retrieve exchange rates',
      error: error.message,
    })
  }
}

/**
 * Get all active virtual cards for the authenticated user
 */
export const getActiveVirtualCards = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // Get user's wallets first to filter cards by wallet ownership
    const userWallets = await Wallet.findAll({
      where: { userId },
      attributes: ['id'],
    })

    if (userWallets.length === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No wallets found for this user',
        data: {
          cards: [],
          totalCards: 0,
        },
      })
    }

    const walletIds = userWallets.map((wallet) => wallet.id)

    // Get all active virtual cards for user's wallets
    const cards = await Card.findAll({
      where: {
        walletId: { [Op.in]: walletIds },
        status: 'active',
        type: 'virtual', // Only virtual cards
      },
      attributes: [
        'card_reference',
        'reference',
        'type',
        'currency',
        'holder_name',
        'brand',
        'expiry_month',
        'expiry_year',
        'first_six',
        'last_four',
        'status',
        'date',
        'fees',
        'walletId',
      ],
      order: [['date', 'DESC']],
    })

    if (cards.length === 0) {
      return res.status(200).json({
        status: 200,
        message: 'No active virtual cards found for this user',
        data: {
          cards: [],
          totalCards: 0,
        },
      })
    }

    // Format cards data for response
    const formattedCards = cards.map((card) => ({
      cardReference: card.card_reference,
      reference: card.reference,
      type: card.type,
      currency: card.currency,
      holderName: card.holder_name,
      brand: card.brand,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      firstSix: card.first_six,
      lastFour: card.last_four,
      status: card.status,
      date: card.date,
      fees: card.fees,
      walletId: card.walletId,
    }))

    res.status(200).json({
      status: 200,
      message: 'Active virtual cards retrieved successfully',
      data: {
        cards: formattedCards,
        totalCards: cards.length,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving active virtual cards:', error)
    res.status(500).json({
      message: 'Failed to retrieve active virtual cards',
      error: error.message,
    })
  }
}

/**
 * Get a single account by account ID
 */
export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { accountId } = req.params

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!accountId) {
      return res.status(400).json({
        message: 'Account ID is required',
      })
    }

    // Get the specific account for the user
    const account = await Account.findOne({
      where: {
        id: accountId,
        userId,
        isActive: true,
      },
      attributes: [
        'id',
        'currency',
        'accountHolder',
        'bankName',
        'accountNumber',
        'routingNumber',
        'accountType',
        'address',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    })

    if (!account) {
      return res.status(404).json({
        message: 'Account not found or access denied',
      })
    }

    // Format account data for response
    const formattedAccount = {
      id: account.id,
      currency: account.currency,
      accountHolder: account.accountHolder,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber,
      accountType: account.accountType,
      address: account.address,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }

    res.status(200).json({
      status: 200,
      message: 'Account retrieved successfully',
      data: {
        account: formattedAccount,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving account:', error)
    res.status(500).json({
      message: 'Failed to retrieve account',
      error: error.message,
    })
  }
}
