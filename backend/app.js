const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const products = require('./routes/product');
const authRoute = require('./routes/authRoute');

// Middleware
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma"
    ],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/v1', products);
app.use('/api/auth', authRoute);

module.exports = app;