import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import Card from '../models/Card'

/**
 * Creates a new card.
 * This simulates calling a card provider and receiving detailed card info.
 */
export const createCard = async (req: Request, res: Response) => {
  try {
    const { name, type, brand, fees, walletId } = req.body

    // Basic validation
    if (!name || !type || !brand || fees === undefined || !walletId) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // --- Simulation of external service call ---
    // In a real app, you would call a service like Stripe or Marqeta.
    // The service would return the detailed card data.
    // Here, we generate it for demonstration.
    const now = new Date()
    const expiryDate = new Date(now.setFullYear(now.getFullYear() + 3)) // Expires in 3 years

    const newCardData = {
      card_reference: uuidv4(),
      reference: `webhook_${uuidv4()}`, // Simulated unique reference
      type: type,
      currency: 'USD', // Defaulting to USD as per response example
      holder_name: name,
      brand: brand,
      expiry_month: String(expiryDate.getMonth() + 1).padStart(2, '0'),
      expiry_year: String(expiryDate.getFullYear()).slice(-2),
      first_six: Math.floor(100000 + Math.random() * 900000).toString(),
      last_four: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'active',
      date: new Date(),
      fees: fees,
      walletId: walletId,
    }
    // --- End of Simulation ---

    const card = await Card.create(newCardData)

    // Respond with the format specified in the prompt
    res.status(201).json({
      status: 201,
      message: 'Card created successfully',
      data: card,
    })
  } catch (error: any) {
    console.error('Error creating card:', error)
    res
      .status(500)
      .json({ message: 'Failed to create card', error: error.message })
  }
}

/**
 * Retrieves all cards, optionally filtered by walletId.
 */
export const getAllCards = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.query // Filter by walletId from query params
    const whereClause = walletId ? { walletId } : {}

    const cards = await Card.findAll({ where: whereClause })

    res.status(200).json({
      status: 200,
      message: 'Cards retrieved successfully',
      data: cards,
    })
  } catch (error: any) {
    console.error('Error retrieving cards:', error)
    res
      .status(500)
      .json({ message: 'Failed to retrieve cards', error: error.message })
  }
}

/**
 * Retrieves a single card by its ID (card_reference).
 */
export const getCardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const card = await Card.findByPk(id)

    if (!card) {
      return res.status(404).json({ message: 'Card not found' })
    }

    res.status(200).json({
      status: 200,
      message: 'Card retrieved successfully',
      data: card,
    })
  } catch (error: any) {
    console.error('Error retrieving card:', error)
    res
      .status(500)
      .json({ message: 'Failed to retrieve card', error: error.message })
  }
}

/**
 * Deletes a card by its ID (card_reference).
 */
export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const card = await Card.findByPk(id)

    if (!card) {
      return res.status(404).json({ message: 'Card not found' })
    }

    await card.destroy()

    res.status(200).json({ message: 'Card deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting card:', error)
    res
      .status(500)
      .json({ message: 'Failed to delete card', error: error.message })
  }
}
