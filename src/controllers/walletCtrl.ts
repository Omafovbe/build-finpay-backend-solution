import { Request as ExpressRequest, Response } from 'express'
import { Transaction, User, Card, Wallet } from '../models'
import { Op } from 'sequelize'
import { sequelize } from '../schema/db'
import { Parser } from 'json2csv'
import { convertCurrency } from '../utils/currencyConv'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

/**
 * Retrieves the balance for the authenticated user's wallet,
 * filtered by currency.
 */
export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { currency } = req.query

    // Validate input
    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }
    if (!currency) {
      return res
        .status(400)
        .json({ message: 'Currency query parameter is required' })
    }

    // Find the user's wallet for the specified currency
    const wallet = await Wallet.findOne({
      where: {
        userId: userId,
        currency: currency as string,
      },
    })

    if (!wallet) {
      // Create a new wallet with a zero balance if one doesn't exist
      const newWallet = await Wallet.create({
        userId: userId,
        currency: currency as string,
        balance: 0,
      })

      return res.status(201).json({
        status: 201,
        message: 'Wallet created and balance retrieved successfully',
        data: {
          balance: '0.00',
          currency: newWallet.currency,
        },
      })
    }

    // Format the balance with commas
    const formattedBalance = new Intl.NumberFormat('en-US').format(
      wallet.balance
    )

    res.status(200).json({
      status: 200,
      message: 'Balance retrieved successfully',
      data: {
        balance: formattedBalance,
        currency: wallet.currency,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving balance:', error)
    res
      .status(500)
      .json({ message: 'Failed to retrieve balance', error: error.message })
  }
}

export const getAccountStatement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { currency, startDate, endDate, format = 'json' } = req.query

    if (!userId || !currency || !startDate || !endDate) {
      return res.status(400).json({
        message:
          'Missing required query parameters: currency, startDate, endDate',
      })
    }

    const wallet = await Wallet.findOne({ where: { userId, currency } })
    if (!wallet) {
      return res
        .status(404)
        .json({ message: `No ${currency} wallet found for this user.` })
    }

    const transactions = await Transaction.findAll({
      where: {
        walletId: wallet.id,
        createdAt: {
          [Op.between]: [
            new Date(startDate as string),
            new Date(endDate as string),
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    })

    if (format === 'csv') {
      const json2csvParser = new Parser()
      const csv = json2csvParser.parse(transactions.map((t) => t.toJSON()))
      res.header('Content-Type', 'text/csv')
      res.attachment(`statement-${currency}-${startDate}-to-${endDate}.csv`)
      return res.send(csv)
    }

    res
      .status(200)
      .json({ status: 200, message: 'Statement retrieved', data: transactions })
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Failed to retrieve statement', error: error.message })
  }
}

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId)
      return res.status(401).json({ message: 'Authentication error' })

    const userWallets = await Wallet.findAll({ where: { userId } })
    const walletIds = userWallets.map((w) => w.id)

    const totalIncome = await Transaction.sum('amount', {
      where: { walletId: { [Op.in]: walletIds }, type: 'credit' },
    })
    const totalExpenses = await Transaction.sum('amount', {
      where: { walletId: { [Op.in]: walletIds }, type: 'debit' },
    })

    res.status(200).json({
      status: 200,
      message: 'Summary retrieved',
      data: {
        totalIncome: totalIncome || 0,
        totalExpenses: totalExpenses || 0,
      },
    })
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Failed to retrieve summary', error: error.message })
  }
}

/**
 * Retrieves the virtual card details associated with a specific wallet.
 * These cards can be used as "receiving accounts".
 */
export const getReceivingAccountDetails = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId
    const { id: walletId } = req.params // The ID from the URL is the walletId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // First, verify the wallet belongs to the authenticated user
    const wallet = await Wallet.findOne({
      where: {
        id: walletId,
        userId: userId,
      },
    })

    if (!wallet) {
      return res
        .status(404)
        .json({ message: 'Wallet not found or access denied.' })
    }

    // Find all cards associated with this wallet
    const cards = await Card.findAll({
      where: {
        walletId: wallet.id,
      },
      // You can select specific attributes to match the "receiving account" format
      attributes: [
        ['holder_name', 'accountHolder'],
        ['brand', 'bankName'], // Using 'brand' as a stand-in for bankName
        ['card_reference', 'accountNumber'], // Using card_reference as a unique account number
        'type',
        'currency',
        'status',
        'last_four',
      ],
    })

    if (!cards || cards.length === 0) {
      return res.status(404).json({
        message: 'No receiving accounts (cards) found for this wallet.',
      })
    }

    // The user prompt implies a single object, but the description mentions multiple.
    // Returning an array is more flexible. If only one card is found, it will be an array with one item.
    res.status(200).json({
      status: 200,
      message: 'Receiving account details retrieved successfully',
      data: cards,
    })
  } catch (error: any) {
    console.error('Error retrieving receiving account details:', error)
    res.status(500).json({
      message: 'Failed to retrieve receiving account details',
      error: error.message,
    })
  }
}

// --- Wallet & Currency Management ---

export const addCurrencyWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { currency } = req.body
    if (!userId || !currency)
      return res.status(400).json({ message: 'Currency is required' })

    const [wallet, created] = await Wallet.findOrCreate({
      where: { userId, currency },
      defaults: { userId, currency, balance: 0 },
    })

    if (!created) {
      return res
        .status(409)
        .json({ message: `A wallet with ${currency} already exists.` })
    }

    res.status(201).json({
      status: 201,
      message: `${currency} wallet created successfully`,
      data: wallet,
    })
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Failed to create wallet', error: error.message })
  }
}

// --- Fund Movement ---

export const fundAccount = async (req: AuthRequest, res: Response) => {
  // This is a simulation. A real implementation would use a payment gateway webhook.
  try {
    const userId = req.user?.userId
    const { amount, currency } = req.body
    if (!userId || !amount || !currency)
      return res
        .status(400)
        .json({ message: 'Amount and currency are required' })

    const wallet = await Wallet.findOne({ where: { userId, currency } })
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' })

    await sequelize.transaction(async (t) => {
      await wallet.increment('balance', { by: amount, transaction: t })
      await Transaction.create(
        {
          walletId: wallet.id,
          type: 'credit',
          amount,
          currency,
          description: 'Account funded via external source',
        },
        { transaction: t }
      )
    })

    res
      .status(200)
      .json({ status: 200, message: 'Account funded successfully' })
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Failed to fund account', error: error.message })
  }
}

export const withdrawFunds = async (req: AuthRequest, res: Response) => {
  // This is a simulation. A real implementation would trigger a payout process.
  try {
    const userId = req.user?.userId
    const { amount, currency } = req.body
    if (!userId || !amount || !currency)
      return res
        .status(400)
        .json({ message: 'Amount and currency are required' })

    const wallet = await Wallet.findOne({ where: { userId, currency } })
    if (!wallet || wallet.balance < amount) {
      return res
        .status(400)
        .json({ message: 'Insufficient funds or wallet not found' })
    }

    await sequelize.transaction(async (t) => {
      await wallet.decrement('balance', { by: amount, transaction: t })
      await Transaction.create(
        {
          walletId: wallet.id,
          type: 'debit',
          amount,
          currency,
          description: 'Withdrawal to external account',
        },
        { transaction: t }
      )
    })

    res
      .status(200)
      .json({ status: 200, message: 'Withdrawal initiated successfully' })
  } catch (error: any) {
    res.status(500).json({ message: 'Withdrawal failed', error: error.message })
  }
}

export const sendMoney = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction() // Start a transaction

  try {
    const senderId = req.user?.userId
    const {
      amount,
      accountType,
      accountID,
      currency,
      recievingCurrency,
      description,
    } = req.body

    // --- 1. Input Validation ---
    if (!senderId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }
    const requiredFields = {
      amount,
      accountType,
      accountID,
      currency,
      recievingCurrency,
      description,
    }
    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null) {
        await t.rollback()
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` })
      }
    }

    // --- 2. Debit Sender's Wallet ---
    const senderWallet = await Wallet.findOne({
      where: { userId: senderId, currency },
    })
    if (!senderWallet || senderWallet.balance < amount) {
      await t.rollback()
      return res
        .status(400)
        .json({ message: 'Insufficient funds or wallet not found.' })
    }

    await senderWallet.decrement('balance', { by: amount, transaction: t })

    // --- 3. Handle Currency Conversion ---
    const amountRecieved = await convertCurrency(
      amount,
      currency,
      recievingCurrency
    )

    // --- 4. Handle Recipient ---
    if (accountType === 'wallet') {
      // Internal transfer to another user's wallet
      const recipientWallet = await Wallet.findByPk(accountID as string)
      if (!recipientWallet) {
        await t.rollback()
        return res.status(404).json({ message: 'Recipient wallet not found.' })
      }
      // Credit recipient's wallet with the converted amount
      await recipientWallet.increment('balance', {
        by: amountRecieved,
        transaction: t,
      })

      // Create a corresponding credit transaction for the recipient
      await Transaction.create(
        {
          walletId: recipientWallet.id,
          type: 'credit',
          amount: amountRecieved,
          currency: recievingCurrency,
          description: `Received from user ID ${senderId}`,
          status: 'completed',
        },
        { transaction: t }
      )
    } else {
      // External transfer (e.g., to a bank account). We just record the debit.
      // A real implementation would trigger a payout to a payment provider here.
      console.log(`Initiating external payout to ${accountType} ${accountID}`)
    }

    // --- 5. Record Sender's Transaction ---
    const senderTransaction = await Transaction.create(
      {
        walletId: senderWallet.id,
        type: 'debit',
        amount,
        currency,
        description: description || `Sent to ${accountType}: ${accountID}`,
        status: 'completed',
      },
      { transaction: t }
    )

    // --- 6. Commit Transaction and Send Response ---
    await t.commit()

    // Format the response data
    const responseData = {
      id: senderTransaction.id,
      transactionDate: senderTransaction.get('createdAt'),
      userId: senderId,
      amountSent: parseFloat(senderTransaction.amount.toString()),
      sendingCurrency: senderTransaction.currency,
      amountRecieved: parseFloat(amountRecieved.toFixed(2)),
      recievingCurrency: recievingCurrency,
      description: senderTransaction.description,
      status: senderTransaction.status,
    }

    res.status(201).json({
      status: 201,
      message: 'You have successfully sent your fund',
      data: responseData,
    })
  } catch (error: any) {
    await t.rollback() // Rollback on any error
    console.error('Error sending money:', error)
    res
      .status(500)
      .json({ message: 'Failed to send money', error: error.message })
  }
}

/**
 * Converts funds from one of the user's wallets to another.
 */
export const convertFunds = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction() // Start a database transaction

  try {
    const userId = req.user?.userId
    const { amount, fromCurrency, toCurrency } = req.body

    // --- 1. Input Validation ---
    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        message: 'Request must include amount, fromCurrency, and toCurrency',
      })
    }
    if (fromCurrency === toCurrency) {
      return res
        .status(400)
        .json({ message: 'Cannot convert to the same currency.' })
    }

    // --- 2. Find Wallets and Check Balance ---
    const sourceWallet = await Wallet.findOne({
      where: { userId, currency: fromCurrency },
    })
    if (!sourceWallet || sourceWallet.balance < amount) {
      await t.rollback()
      return res
        .status(400)
        .json({ message: `Insufficient funds in ${fromCurrency} wallet.` })
    }

    // Find or create the destination wallet for the user
    const [destinationWallet] = await Wallet.findOrCreate({
      where: { userId, currency: toCurrency },
      transaction: t,
    })

    // --- 3. Perform Conversion and Database Operations ---
    const convertedAmount = await convertCurrency(
      amount,
      fromCurrency,
      toCurrency
    )

    // Debit the source wallet
    await sourceWallet.decrement('balance', { by: amount, transaction: t })
    // Credit the destination wallet
    await destinationWallet.increment('balance', {
      by: convertedAmount,
      transaction: t,
    })

    // Record the debit transaction
    const debitTransaction = await Transaction.create(
      {
        walletId: sourceWallet.id,
        type: 'debit',
        amount,
        currency: fromCurrency,
        description: `Conversion of ${amount} ${fromCurrency} to ${toCurrency}`,
        status: 'completed',
      },
      { transaction: t }
    )

    // Record the credit transaction
    await Transaction.create(
      {
        walletId: destinationWallet.id,
        type: 'credit',
        amount: convertedAmount,
        currency: toCurrency,
        description: `Received from conversion of ${amount} ${fromCurrency}`,
        status: 'completed',
      },
      { transaction: t }
    )

    // --- 4. Commit and Respond ---
    await t.commit()

    const responseData = {
      id: debitTransaction.id, // ID of the primary (debit) transaction
      conversionDate: debitTransaction.get('createdAt'),
      amountDebited: parseFloat(amount.toString()),
      fromCurrency: fromCurrency,
      amountCredited: parseFloat(convertedAmount.toFixed(2)),
      toCurrency: toCurrency,
      rate: parseFloat((convertedAmount / amount).toFixed(6)),
    }

    res.status(201).json({
      status: 201,
      message: 'You have successfully converted your fund',
      data: responseData,
    })
  } catch (error: any) {
    await t.rollback() // Rollback the transaction on any error
    console.error('Error converting funds:', error)
    res
      .status(500)
      .json({ message: 'Failed to convert funds', error: error.message })
  }
}
