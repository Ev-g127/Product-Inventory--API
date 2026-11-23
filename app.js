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
 * In-memory data storage section: This section contains the in-memory data storage for products, categories, and suppliers. It also includes the server setup to listen on the specified PORT.
 */

// Define in-memory data storage for categories and products
const categories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' },
    { id: 3, name: 'Category 3' },
    { id: 4, name: 'Category 4' }
];

// Define in-memory data storage for suppliers
const suppliers = [
    { id: 1, name: 'Supplier 1' },
    { id: 2, name: 'Supplier 2' },
    { id: 3, name: 'Supplier 3' },
    { id: 4, name: 'Supplier 4' }
];

// Define in-memory data storage for products
const products = [
    { id: 1, sku: 'Product 1', price: 10.99, category: 'Category 1', supplier: 'Supplier 1' },
    { id: 2, sku: 'Product 2', price: 15.99, category: 'Category 2', supplier: 'Supplier 2' },
    { id: 3, sku: 'Product 3', price: 20.99, category: 'Category 3', supplier: 'Supplier 3' },
    { id: 4, sku: 'Product 4', price: 25.99, category: 'Category 4', supplier: 'Supplier 4' }
];

/**
 * Products section: This section contains the in-memory data storage for products, categories, and suppliers. 
 * It also includes the server setup to listen on the specified PORT.
 */

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

// Define a route to create a new product
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

    // Check if the category is valid
    if (!categories.some(c => c.name === category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    // Check if the supplier is valid
    if (!suppliers.some(s => s.name === supplier)) {
        return res.status(400).json({ error: 'Invalid supplier' });
    }

    // Create a new product
    const newProduct = { id: products.length + 1, sku, price, category, supplier };
    products.push(newProduct);

    // Return the created product
    res.status(201).json(newProduct);
});

// Define a route to update a specific product by SKU
app.patch('/products/:sku', (req, res) => {
    const productSku = req.params.sku;
    const { price, category, supplier } = req.body;

    // Find the product by SKU
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Check if the category is valid (part of the categories array)
    if (category !== undefined && !categories.some(c => c.name === category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    // Check if the supplier is valid (part of the suppliers array)
    if (supplier !== undefined && !suppliers.some(s => s.name === supplier)) {
        return res.status(400).json({ error: 'Invalid supplier' });
    }

    // Update the product with the new values
    product.price = price;
    product.category = category;
    product.supplier = supplier;

    // Return the updated product
    res.status(200).json(product);
});

// Define a route to delete a specific product by SKU
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


/**
 * Categories section: This section contains the in-memory data storage for categories and the route to handle categories.
 */

// Define a route to get all categories
app.get('/categories', (req, res) => {
    res.status(200).json(categories);
});

// Define a route to get a specific category by its name
app.get('/categories/:name', (req, res) => {
    const categoryName = req.params.name;
    const category = categories.find(c => c.name === categoryName);

    // If the category is not found, return a 404 error response
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    // If the category is found, return the category data as JSON
    res.status(200).json(category);
});

// Define a route to get all products in a specific category
app.get('/categories/:name/products', (req, res) => {
    const categoryName = req.params.name;
    const category = categories.find(c => c.name === categoryName);

    // If the category is not found, return a 404 error response
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    // Check if the category is valid (part of the categories array)
    if (!categories.some(c => c.name === categoryName)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    const productsInCategory = products.filter(p => p.category === categoryName);
    res.status(200).json(productsInCategory);
});

// Define a route to update a specific category by its name
app.patch('/categories/:name', (req, res) => {
    const categoryName = req.params.name;
    const { newName } = req.body;

    // Find the category by name
    const category = categories.find(c => c.name === categoryName);

    // If the category is not found, return a 404 error response
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    // If the new name is provided and is different from the current name
    if (newName && newName !== categoryName) {
        // Check if a category with the new name already exists
        if (categories.some(c => c.name === newName)) {
            return res.status(400).json({ error: 'Category with that name already exists' });
        }

        // Update the category name
        category.name = newName;
    }

    // Return a success response
    res.status(200).json({ message: 'Category updated successfully', category });
});

// Delete a specific category by its name
app.delete('/categories/:name', (req, res) => {
    const categoryName = req.params.name;

    // Find the category by name
    const category = categories.find(c => c.name === categoryName);

    // If the category is not found, return a 404 error response
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    // Check if there are any products associated with this category
    const productsInCategory = products.filter(p => p.category === categoryName);
    if (productsInCategory.length > 0) {
        return res.status(400).json({ error: 'Cannot delete category with associated products' });
    }

    // Remove the category from the categories array
    const index = categories.indexOf(category);
    if (index !== -1) {
        categories.splice(index, 1);
    }

    // Return a success response
    res.status(200).json({ message: 'Category deleted successfully' });
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
