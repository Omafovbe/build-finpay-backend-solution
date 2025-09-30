import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinPay Backend API',
      version: '1.0.0',
      description:
        'A comprehensive fintech API for payment processing, wallet management, and financial operations',
    },
    servers: [
      {
        url: 'http://localhost:3005',
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
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            accountType: {
              type: 'string',
              enum: ['Freelancer', 'Company'],
              description: 'Type of account',
            },
            country: {
              type: 'string',
              description: 'User country',
            },
            countryCode: {
              type: 'string',
              description: 'Country code',
            },
            state: {
              type: 'string',
              description: 'User state/province',
            },
            address: {
              type: 'string',
              description: 'User address',
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number',
            },
            twoFactorEnabled: {
              type: 'boolean',
              description: 'Two-factor authentication status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account last update timestamp',
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
          required: [
            'email',
            'password',
            'name',
            'accountType',
            'country',
            'countryCode',
            'state',
            'address',
            'phoneNumber',
          ],
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
            name: {
              type: 'string',
              description: 'User full name',
            },
            accountType: {
              type: 'string',
              enum: ['Freelancer', 'Company'],
              description: 'Type of account',
            },
            country: {
              type: 'string',
              description: 'User country',
            },
            countryCode: {
              type: 'string',
              description: 'Country code (e.g., US, NG, GB)',
            },
            state: {
              type: 'string',
              description: 'User state/province',
            },
            address: {
              type: 'string',
              description: 'User full address',
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number',
            },
          },
        },
        Card: {
          type: 'object',
          properties: {
            card_reference: {
              type: 'string',
              description: 'Unique card reference ID (UUID)',
            },
            reference: {
              type: 'string',
              description: 'Card reference number',
            },
            type: {
              type: 'string',
              description: 'Card type (virtual, physical, etc.)',
            },
            currency: {
              type: 'string',
              description: 'Card currency code',
            },
            holder_name: {
              type: 'string',
              description: 'Cardholder name',
            },
            brand: {
              type: 'string',
              description: 'Card brand (visa, mastercard, etc.)',
            },
            expiry_month: {
              type: 'string',
              description: 'Card expiry month (MM)',
            },
            expiry_year: {
              type: 'string',
              description: 'Card expiry year (YYYY)',
            },
            first_six: {
              type: 'string',
              description: 'First 6 digits of card number',
            },
            last_four: {
              type: 'string',
              description: 'Last 4 digits of card number',
            },
            status: {
              type: 'string',
              description: 'Card status',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Card creation date',
            },
            fees: {
              type: 'number',
              description: 'Card fees',
            },
            walletId: {
              type: 'string',
              description: 'Associated wallet ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Card creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Card last update timestamp',
            },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique wallet ID (UUID)',
            },
            userId: {
              type: 'integer',
              description: 'User ID (foreign key)',
            },
            balance: {
              type: 'number',
              description: 'Current wallet balance (decimal)',
            },
            currency: {
              type: 'string',
              description: 'Wallet currency code (e.g., USD, NGN, EUR)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Wallet creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Wallet last update timestamp',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique transaction ID (UUID)',
            },
            walletId: {
              type: 'string',
              description: 'Associated wallet ID (UUID)',
            },
            type: {
              type: 'string',
              enum: ['credit', 'debit'],
              description: 'Transaction type',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount (decimal)',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              description: 'Transaction status',
            },
            description: {
              type: 'string',
              description: 'Transaction description',
            },
            currency: {
              type: 'string',
              description: 'Transaction currency code',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction last update timestamp',
            },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique invoice ID (UUID)',
            },
            customerId: {
              type: 'string',
              description: 'Customer ID (UUID)',
            },
            currency: {
              type: 'string',
              description: 'Invoice currency code',
            },
            issueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Invoice issue date',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Invoice due date',
            },
            userId: {
              type: 'integer',
              description: 'User ID (foreign key)',
            },
            status: {
              type: 'string',
              enum: ['pending', 'draft', 'paid'],
              description: 'Invoice status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Invoice creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Invoice last update timestamp',
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
}

const specs = swaggerJSDoc(options)

export { swaggerUi, specs }
