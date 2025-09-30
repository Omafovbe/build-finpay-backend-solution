"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./schema/db");
const routes_1 = require("./routes");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./middleware/auth"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const transRoutes_1 = __importDefault(require("./routes/transRoutes"));
const swagger_1 = require("./swagger");
const redoc_express_1 = __importDefault(require("redoc-express"));
require("./types/express/index.d.ts"); // Import types
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Swagger UI
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
// Redoc
app.get('/redoc', (0, redoc_express_1.default)({
    title: 'FinPay API Documentation',
    specUrl: '/api-docs.json',
}));
// API Docs JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.specs);
});
// Routes
app.use('/api/auth', routes_1.authRoutes);
app.use('/api/invoice', auth_1.default, routes_1.invoiceRoutes);
app.use('/api/cards', routes_1.cardRoutes);
app.use('/api/wallets', walletRoutes_1.default); // Add this line
app.use('/api/transactions', transRoutes_1.default); // Add this line
// Test the database connection
db_1.sequelize
    .authenticate()
    .then(() => {
    console.log('Connection has been established successfully.');
    return db_1.sequelize.sync();
})
    .then(() => {
    console.log('Database synced.');
})
    .catch((err) => {
    console.error('Unable to connect to the database:', err);
});
app.get('/', (req, res) => {
    res.send('FinPay Backend is running!');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map