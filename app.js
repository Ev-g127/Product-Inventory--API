/**
 * Products Inventory API
 * Group 3 Project
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('expres');


// Create an instance of the Express application
const app = express();

// Load the PORT from environment variables or use default value 3000
const PORT = process.env.PORT || 3000;

/**
 * Products section: This section contains the in-memory data storage for products, categories, and suppliers. 
 * It also includes the server setup to listen on the specified PORT.
 */

// Define in-memory data storage for categories and products
const categories = [];

// Define in-memory data storage for suppliers
const suppliers = [];

// Define in-memory data storage for products
const products = [
    { id: 1, sku: 'Product 1', price: 10.99, category: 'Category 1', supplier: 'Supplier 1' },
    { id: 2, sku: 'Product 2', price: 15.99, category: 'Category 2', supplier: 'Supplier 2' },
    { id: 3, sku: 'Product 3', price: 20.99, category: 'Category 3', supplier: 'Supplier 3' },
    { id: 4, sku: 'Product 4', price: 25.99, category: 'Category 4', supplier: 'Supplier 4' }
];



/**
 * Server Setup: This section sets up the Express server to listen on the specified PORT.
 */

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
