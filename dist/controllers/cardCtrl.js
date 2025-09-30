"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = exports.getCardById = exports.getAllCards = exports.createCard = void 0;
const uuid_1 = require("uuid");
const Card_1 = __importDefault(require("../models/Card"));
/**
 * Creates a new card.
 * This simulates calling a card provider and receiving detailed card info.
 */
const createCard = async (req, res) => {
    try {
        const { name, type, brand, fees, walletId } = req.body;
        // Basic validation
        if (!name || !type || !brand || fees === undefined || !walletId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // --- Simulation of external service call ---
        // In a real app, you would call a service like Stripe or Marqeta.
        // The service would return the detailed card data.
        // Here, we generate it for demonstration.
        const now = new Date();
        const expiryDate = new Date(now.setFullYear(now.getFullYear() + 3)); // Expires in 3 years
        const newCardData = {
            card_reference: (0, uuid_1.v4)(),
            reference: `webhook_${(0, uuid_1.v4)()}`,
            type: type,
            currency: 'USD',
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
        };
        // --- End of Simulation ---
        const card = await Card_1.default.create(newCardData);
        // Respond with the format specified in the prompt
        res.status(201).json({
            status: 201,
            message: 'Card created successfully',
            data: card,
        });
    }
    catch (error) {
        console.error('Error creating card:', error);
        res
            .status(500)
            .json({ message: 'Failed to create card', error: error.message });
    }
};
exports.createCard = createCard;
/**
 * Retrieves all cards, optionally filtered by walletId.
 */
const getAllCards = async (req, res) => {
    try {
        const { walletId } = req.query; // Filter by walletId from query params
        const whereClause = walletId ? { walletId } : {};
        const cards = await Card_1.default.findAll({ where: whereClause });
        res.status(200).json({
            status: 200,
            message: 'Cards retrieved successfully',
            data: cards,
        });
    }
    catch (error) {
        console.error('Error retrieving cards:', error);
        res
            .status(500)
            .json({ message: 'Failed to retrieve cards', error: error.message });
    }
};
exports.getAllCards = getAllCards;
/**
 * Retrieves a single card by its ID (card_reference).
 */
const getCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card_1.default.findByPk(id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.status(200).json({
            status: 200,
            message: 'Card retrieved successfully',
            data: card,
        });
    }
    catch (error) {
        console.error('Error retrieving card:', error);
        res
            .status(500)
            .json({ message: 'Failed to retrieve card', error: error.message });
    }
};
exports.getCardById = getCardById;
/**
 * Deletes a card by its ID (card_reference).
 */
const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card_1.default.findByPk(id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        await card.destroy();
        res.status(200).json({ message: 'Card deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting card:', error);
        res
            .status(500)
            .json({ message: 'Failed to delete card', error: error.message });
    }
};
exports.deleteCard = deleteCard;
//# sourceMappingURL=cardCtrl.js.map