import { Request as ExpressRequest, Response } from 'express'
import { Transaction, Wallet } from '../models'
import { Op, WhereOptions } from 'sequelize'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

/**
 * Retrieves a single transaction by its ID.
 * (This function remains unchanged)
 */
export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id: transactionId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'Authentication error' })
    }

    const transaction = await Transaction.findOne({
      where: { id: transactionId },
      include: {
        model: Wallet,
        as: 'wallet',
        where: { userId },
        attributes: [],
      },
    })

    if (!transaction) {
      return res
        .status(404)
        .json({ message: 'Transaction not found or access denied' })
    }

    res.status(200).json({
      status: 200,
      message: 'Transaction retrieved successfully',
      data: transaction,
    })
  } catch (error: any) {
    console.error('Error retrieving transaction:', error)
    res.status(500).json({
      message: 'Failed to retrieve transaction',
      error: error.message,
    })
  }
}

/**
 * Retrieves a paginated list of transactions with search and filtering.
 * Uses page-based (offset) pagination.
 */
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Authentication error' })
    }

    const {
      page = '1', // Default to page 1
      size = '10', // Default to 10 items per page
      search,
      filterBy,
    } = req.query as {
      page?: string
      size?: string
      search?: string
      filterBy?: string
    }

    const limit = parseInt(size, 10)
    const currentPage = parseInt(page, 10)
    const offset = (currentPage - 1) * limit

    // --- Build the WHERE clause (this logic is the same) ---
    const where: WhereOptions = {}

    if (search) {
      where.description = { [Op.iLike]: `%${search}%` }
    }

    if (filterBy) {
      const [key, value] = filterBy.split(':')
      if (['type', 'status', 'currency'].includes(key)) {
        where[key] = value
      }
    }

    // --- Perform the Query using findAndCountAll ---
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: {
        model: Wallet,
        as: 'wallet',
        where: { userId },
        attributes: [],
      },
    })

    // --- Calculate Pagination Metadata ---
    const totalPages = Math.ceil(count / limit)

    res.status(200).json({
      status: 200,
      message: 'Transactions retrieved successfully',
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage,
        pageSize: limit,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving transactions:', error)
    res.status(500).json({
      message: 'Failed to retrieve transactions',
      error: error.message,
    })
  }
}
