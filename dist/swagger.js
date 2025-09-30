"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = exports.swaggerUi = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FinPay Backend API',
            version: '1.0.0',
            description: 'A comprehensive fintech API for payment processing, wallet management, and financial operations',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name',
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            description: 'User password',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            description: 'User password',
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name',
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name',
                        },
                    },
                },
                Card: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Card ID',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        cardNumber: {
                            type: 'string',
                            description: 'Masked card number',
                        },
                        cardType: {
                            type: 'string',
                            enum: ['credit', 'debit'],
                            description: 'Type of card',
                        },
                        expiryDate: {
                            type: 'string',
                            description: 'Card expiry date',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Card creation timestamp',
                        },
                    },
                },
                Wallet: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Wallet ID',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        currency: {
                            type: 'string',
                            description: 'Wallet currency code',
                        },
                        balance: {
                            type: 'number',
                            description: 'Current balance',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Wallet creation timestamp',
                        },
                    },
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Transaction ID',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        type: {
                            type: 'string',
                            enum: ['credit', 'debit'],
                            description: 'Transaction type',
                        },
                        amount: {
                            type: 'number',
                            description: 'Transaction amount',
                        },
                        currency: {
                            type: 'string',
                            description: 'Transaction currency',
                        },
                        description: {
                            type: 'string',
                            description: 'Transaction description',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Transaction timestamp',
                        },
                    },
                },
                Invoice: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Invoice ID',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        customerId: {
                            type: 'string',
                            description: 'Customer ID',
                        },
                        amount: {
                            type: 'number',
                            description: 'Invoice amount',
                        },
                        currency: {
                            type: 'string',
                            description: 'Invoice currency',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'paid', 'overdue', 'cancelled'],
                            description: 'Invoice status',
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Invoice due date',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Invoice creation timestamp',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                        status: {
                            type: 'integer',
                            description: 'HTTP status code',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
//# sourceMappingURL=swagger.js.map