import { Request as ExpressRequest, Response } from 'express'
import { Invoice, Customer, Item, User } from '../models' // Import your models
import moment from 'moment'
import { Op } from 'sequelize'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
  }
}

export const getAllInvoices = async (req: AuthRequest, res: Response) => {
  try {
    // Assuming you have user information in req.user
    const userId = req.user?.userId // Access userId from req.user

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const invoices = await Invoice.findAll({
      where: { userId: userId },
      include: [
        { model: Customer, as: 'customer' },
        { model: Item, as: 'items' },
      ],
    })

    res.json(invoices)
  } catch (error: any) {
    console.error('Error getting invoices:', error)
    res
      .status(500)
      .json({ message: 'Failed to get invoices', error: error.message })
  }
}

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, currency, issueDate, dueDate, items, userId, status } =
      req.body

    // Create the invoice
    const invoice = await Invoice.create({
      customerId,
      currency,
      issueDate,
      dueDate,
      userId,
      status,
    })

    // Create the items
    await Promise.all(
      items.map(async (itemData: any) => {
        await Item.create({
          invoiceId: invoice.id,
          description: itemData.description,
          quantity: itemData.quantity,
          amount: itemData.amount,
        })
      })
    )

    // Fetch the created invoice with associated customer and items
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Item, as: 'items' },
      ],
    })

    res.status(201).json(createdInvoice)
  } catch (error: any) {
    console.error('Error creating invoice:', error)
    res
      .status(500)
      .json({ message: 'Failed to create invoice', error: error.message })
  }
}

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Item, as: 'items' },
      ],
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    res.json(invoice)
  } catch (error: any) {
    console.error('Error getting invoice by ID:', error)
    res
      .status(500)
      .json({ message: 'Failed to get invoice', error: error.message })
  }
}

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { customerId, currency, issueDate, dueDate, status } = req.body

    const invoice = await Invoice.findByPk(id)

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    await invoice.update({
      customerId,
      currency,
      issueDate,
      dueDate,
      status,
    })

    res.json({ message: 'Invoice updated successfully' })
  } catch (error: any) {
    console.error('Error updating invoice:', error)
    res
      .status(500)
      .json({ message: 'Failed to update invoice', error: error.message })
  }
}

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const invoice = await Invoice.findByPk(id)

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    await invoice.destroy()

    res.status(204).send() // No content
  } catch (error: any) {
    console.error('Error deleting invoice:', error)
    res
      .status(500)
      .json({ message: 'Failed to delete invoice', error: error.message })
  }
}

export const getInvoicesFiltered = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const { page = 1, size = 10, status, terms, filter } = req.query

    let where: any = { userId }

    // Handle status
    if (status) {
      const today = moment().startOf('day')
      const twoDaysPrior = today.clone().subtract(2, 'days')
      const twoDaysAfter = today.clone().add(2, 'days')
      const oneWeekAgo = today.clone().subtract(1, 'week')

      if (status === 'draft') {
        where.status = 'draft'
      } else if (status === 'pending') {
        where.status = 'pending'
      } else if (status === 'due') {
        where.status = 'pending'
        where.dueDate = {
          [Op.between]: [twoDaysPrior.toDate(), twoDaysAfter.toDate()],
        }
      } else if (status === 'overdue') {
        where.status = 'pending'
        where.dueDate = {
          [Op.lt]: oneWeekAgo.toDate(),
        }
      }
    }

    // Handle filter
    if (filter) {
      try {
        const filterObj = JSON.parse(filter as string)
        Object.assign(where, filterObj)
      } catch (e) {
        return res.status(400).json({ message: 'Invalid filter format' })
      }
    }

    // Handle search terms
    let include: any = [
      { model: Customer, as: 'customer' },
      { model: Item, as: 'items' },
    ]

    if (terms) {
      include[0].where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${terms}%` } },
          { email: { [Op.iLike]: `%${terms}%` } },
        ],
      }
      // Also search in invoice id
      where[Op.or] = where[Op.or] || []
      where[Op.or].push({ id: { [Op.iLike]: `%${terms}%` } })
    }

    const offset = (parseInt(page as string) - 1) * parseInt(size as string)
    const limit = parseInt(size as string)

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    })

    res.json({
      invoices: rows,
      total: count,
      page: parseInt(page as string),
      size: parseInt(size as string),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error: any) {
    console.error('Error getting filtered invoices:', error)
    res
      .status(500)
      .json({ message: 'Failed to get invoices', error: error.message })
  }
}

export const getInvoiceSummaryByStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const today = moment().startOf('day')
    const twoDaysPrior = today.clone().subtract(2, 'days')
    const twoDaysAfter = today.clone().add(2, 'days')
    const oneWeekAgo = today.clone().subtract(1, 'week')

    const draft = await Invoice.count({
      where: { userId: userId, status: 'draft' },
    })
    const pending = await Invoice.count({
      where: { userId: userId, status: 'pending' },
    })
    const due = await Invoice.count({
      where: {
        userId: userId,
        status: 'pending',
        dueDate: {
          [Op.between]: [twoDaysPrior.toDate(), twoDaysAfter.toDate()],
        },
      },
    })
    const overdue = await Invoice.count({
      where: {
        userId: userId,
        status: 'pending',
        dueDate: {
          [Op.lt]: oneWeekAgo.toDate(),
        },
      },
    })

    res.json({ draft, pending, due, overdue })
  } catch (error: any) {
    console.error('Error getting invoice summary:', error)
    res
      .status(500)
      .json({ message: 'Failed to get invoice summary', error: error.message })
  }
}
