const dotenv = require('dotenv');
const path = require('path');

// Load .env.test from project root
dotenv.config({
    path: path.resolve(__dirname, '../.env.test'),
});
