/**
 * Products Inventory API
 * Group 3 Project
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');


// Create an instance of the Express application
const app = express();

// Load the PORT from environment variables or use default value 3000
const PORT = process.env.PORT || 3000;

/**
 * Middlewares section: This section includes the necessary middlewares for the Express application, such as JSON parsing and CORS handling.
 */

app.use(express.json()); // Middleware to parse JSON request bodies

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

// Define a route to get all products
app.get('/products', (req, res) => {
    res.status(200).json(products);
});

// Define a route to get a specific product by SKU
app.get('/products/:sku', (req, res) => {
    const productSku = req.params.sku;
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // If the product is found, return the product data as JSON
    res.status(200).json(product);
});

app.post('/products', (req, res) => {
    const { sku, price, category, supplier } = req.body;

    // Validate the request body to ensure all required fields are present
    if(!sku || !price || !category || !supplier) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if a product with the same SKU already exists
    const existingProduct = products.find(p => p.sku === sku);
    if (existingProduct) {
        return res.status(400).json({ error: 'Product with this SKU already exists' });
    }

    // Create a new product
    const newProduct = { id: products.length + 1, sku, price, category, supplier };
    products.push(newProduct);

    // Return the created product
    res.status(201).json(newProduct);
});

app.patch('/products/:sku', (req, res) => {
    const productSku = req.params.sku;
    const { price, category, supplier } = req.body;

    // Find the product by SKU
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product with the new values
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (supplier !== undefined) product.supplier = supplier;

    // Return the updated product
    res.status(200).json(product);
});

app.delete('/products/:sku', (req, res) => {
    const productSku = req.params.sku;

    // Find the product by SKU
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Remove the product from the array
    const deletedProduct = products.splice(products.indexOf(product), 1)[0];

    // Return a success response
    res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
});


// Error handling middleware for unknown routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

/**
 * Server Setup: This section sets up the Express server to listen on the specified PORT.
 */

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
