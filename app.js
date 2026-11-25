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
 * Middlewares section: This section includes the middlewares applied to every request (JSON body parsing).
 */

app.use(express.json()); // Middleware to parse JSON request bodies

/**
 * In-memory data storage section: This section contains the in-memory data storage for products, categories, suppliers,
 * warehouses, and stock movements, and the counters used to generate their ids.
 */

// Define in-memory data storage for categories
const categories = [
    { id: 1, name: 'Category 1', description: 'Description of category 1' },
    { id: 2, name: 'Category 2', description: 'Description of category 2' },
    { id: 3, name: 'Category 3', description: 'Description of category 3' },
    { id: 4, name: 'Category 4', description: 'Description of category 4' }
];

// Define in-memory data storage for suppliers
const suppliers = [
    { id: 1, name: 'Supplier 1', contact: 'Contact 1', email: 'supplier1@example.com', phone: '+1 555 0101', address: '1 Main Street' },
    { id: 2, name: 'Supplier 2', contact: 'Contact 2', email: 'supplier2@example.com', phone: '+1 555 0102', address: '2 Main Street' },
    { id: 3, name: 'Supplier 3', contact: 'Contact 3', email: 'supplier3@example.com', phone: '+1 555 0103', address: '3 Main Street' },
    { id: 4, name: 'Supplier 4', contact: 'Contact 4', email: 'supplier4@example.com', phone: '+1 555 0104', address: '4 Main Street' }
];

// Define in-memory data storage for warehouses
const warehouses = [
    { id: 1, name: 'Warehouse 1', address: '1 Storage Street' },
    { id: 2, name: 'Warehouse 2', address: '2 Storage Street' },
    { id: 3, name: 'Warehouse 3', address: '3 Storage Street' }
];

// Define in-memory data storage for products.
// stock is the number of units in each warehouse (only the warehouses that have some), and quantity is the total.
// The stock is low when quantity is lower than or equal to lowStockThreshold.
const products = [
    {
        id: 1, sku: 'Product 1', name: 'Product One', price: 10.99, category: 'Category 1', supplier: 'Supplier 1', quantity: 20, lowStockThreshold: 5,
        stock: [{ warehouse: 'Warehouse 1', quantity: 15 }, { warehouse: 'Warehouse 2', quantity: 5 }]
    },
    {
        id: 2, sku: 'Product 2', name: 'Product Two', price: 15.99, category: 'Category 2', supplier: 'Supplier 2', quantity: 5, lowStockThreshold: 5,
        stock: [{ warehouse: 'Warehouse 1', quantity: 5 }]
    },
    {
        id: 3, sku: 'Product 3', name: 'Product Three', price: 20.99, category: 'Category 3', supplier: 'Supplier 3', quantity: 0, lowStockThreshold: 5,
        stock: []
    },
    {
        id: 4, sku: 'Product 4', name: 'Product Four', price: 25.99, category: 'Category 4', supplier: 'Supplier 4', quantity: 50, lowStockThreshold: 5,
        stock: [{ warehouse: 'Warehouse 2', quantity: 30 }, { warehouse: 'Warehouse 3', quantity: 20 }]
    }
];

// Define in-memory data storage for stock movements (empty at startup, filled by POST /products/:sku/movements).
// A movement is linked to the id of its product and not to its SKU, because the SKU of a deleted product can be used again.
const movements = [];

// Next id to assign to a new product (never reused, even after a deletion)
let nextProductId = products.reduce((maxId, p) => Math.max(maxId, p.id), 0) + 1;

// Next ids to assign to new categories, suppliers and warehouses (never reused, even after a deletion)
let nextCategoryId = categories.reduce((maxId, c) => Math.max(maxId, c.id), 0) + 1;
let nextSupplierId = suppliers.reduce((maxId, s) => Math.max(maxId, s.id), 0) + 1;
let nextWarehouseId = warehouses.reduce((maxId, w) => Math.max(maxId, w.id), 0) + 1;

// Next id to assign to a new stock movement
let nextMovementId = 1;

/**
 * Validation helpers section: small functions used by the routes to check the fields of the request body and of the query string.
 */

// Removes the spaces at the start and at the end of a text (" Food " => "Food").
// Other values (numbers, undefined...) are returned unchanged, so that the checks below can reject them.
const trimText = value => typeof value === 'string' ? value.trim() : value;

// Returns true if the value is a string that is not empty (or only spaces)
const isNonEmptyString = value => typeof value === 'string' && value.trim() !== '';

// Returns true if the value is a real number greater than or equal to 0, with 2 decimals at most.
// toFixed(2) rounds to 2 decimals: if the number is not the same after that (10.999 => 11), it had more than 2 decimals.
const isValidPrice = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number(value.toFixed(2)) === value;

// Returns true if the value is a whole number greater than or equal to 0.
// isSafeInteger also rejects texts ("5"), decimals (2.5) and numbers too big to be counted exactly.
const isValidQuantity = value => Number.isSafeInteger(value) && value >= 0;

// Returns true if the value is a text that contains a number greater than or equal to 0, such as "10.5".
// The values of a query string are always texts, even when they look like numbers.
const isNumberText = value => isNonEmptyString(value) && Number.isFinite(Number(value)) && Number(value) >= 0;

// Returns true if the value looks like an email address (simple check: text@text.text, without spaces)
const isValidEmail = value => isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Returns true if the two names are the same, ignoring upper and lower case ("Food" and "food")
const isSameName = (nameA, nameB) => nameA.toLowerCase() === nameB.toLowerCase();

// Returns true if the text contains the search text, ignoring upper and lower case ("Phone case" contains "PHONE")
const containsText = (text, searchText) => text.toLowerCase().includes(searchText.toLowerCase());

// Returns the names of the fields whose value is missing, e.g. findMissingFields({ name, email }) => ['email']
const findMissingFields = fields => Object.keys(fields).filter(key => fields[key] === undefined);

// Returns the name of the first field that is not a non-empty string, or undefined if they are all valid.
// Fields that were not sent (undefined) are skipped, so it also works for partial updates.
const findInvalidTextField = fields => Object.keys(fields).find(key => fields[key] !== undefined && !isNonEmptyString(fields[key]));

/**
 * Stock helpers section: small functions used by the routes to read and change the units of a product.
 */

// Returns true if the stock of a product is low
const isLowStock = product => product.quantity <= product.lowStockThreshold;

// Returns the number of units of a product in a warehouse (0 if there are none)
const getWarehouseQuantity = (product, warehouseName) => {
    const stockLine = product.stock.find(s => s.warehouse === warehouseName);
    return stockLine ? stockLine.quantity : 0;
};

// Adds units of a product to a warehouse, or removes some if the number of units is negative
const changeWarehouseQuantity = (product, warehouseName, units) => {
    const stockLine = product.stock.find(s => s.warehouse === warehouseName);

    if (stockLine) {
        stockLine.quantity += units;
    } else {
        product.stock.push({ warehouse: warehouseName, quantity: units });
    }

    // Keep only the warehouses that still have units, and calculate the new total
    product.stock = product.stock.filter(s => s.quantity > 0);
    product.quantity = product.stock.reduce((total, s) => total + s.quantity, 0);
};

/**
 * Products section: This section contains the routes to create, read, update, delete and search products.
 */

// Define a route to get all products. The query string can filter and sort them, and several filters can be used together,
// e.g. GET /products?category=Food&maxPrice=20&lowStock=true&sort=price&order=desc
app.get('/products', (req, res) => {
    const { name, minPrice, maxPrice, lowStock, sort, order } = req.query;
    const category = trimText(req.query.category);
    const supplier = trimText(req.query.supplier);

    // Each text filter must be one non-empty text (?name=a&name=b would give an array)
    const invalidField = findInvalidTextField({ name, category, supplier });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    // Validate the other filters that were sent
    if (minPrice !== undefined && !isNumberText(minPrice)) {
        return res.status(400).json({ error: 'minPrice must be a number greater than or equal to 0' });
    }

    if (maxPrice !== undefined && !isNumberText(maxPrice)) {
        return res.status(400).json({ error: 'maxPrice must be a number greater than or equal to 0' });
    }

    if (lowStock !== undefined && lowStock !== 'true' && lowStock !== 'false') {
        return res.status(400).json({ error: "lowStock must be 'true' or 'false'" });
    }

    // Validate the sort
    if (sort !== undefined && sort !== 'name' && sort !== 'price' && sort !== 'quantity') {
        return res.status(400).json({ error: "sort must be 'name', 'price' or 'quantity'" });
    }

    if (order !== undefined && order !== 'asc' && order !== 'desc') {
        return res.status(400).json({ error: "order must be 'asc' or 'desc'" });
    }

    if (order !== undefined && sort === undefined) {
        return res.status(400).json({ error: 'order can only be used with sort' });
    }

    // Start with a copy of all the products, then keep only those that match each filter that was sent
    let matchingProducts = [...products];
    if (name !== undefined) matchingProducts = matchingProducts.filter(p => containsText(p.name, name));
    if (category !== undefined) matchingProducts = matchingProducts.filter(p => isSameName(p.category, category));
    if (supplier !== undefined) matchingProducts = matchingProducts.filter(p => isSameName(p.supplier, supplier));
    if (minPrice !== undefined) matchingProducts = matchingProducts.filter(p => p.price >= Number(minPrice));
    if (maxPrice !== undefined) matchingProducts = matchingProducts.filter(p => p.price <= Number(maxPrice));
    if (lowStock !== undefined) matchingProducts = matchingProducts.filter(p => isLowStock(p) === (lowStock === 'true'));

    // Sort the copy: the order of the products array does not change
    if (sort === 'name') matchingProducts.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'price') matchingProducts.sort((a, b) => a.price - b.price);
    if (sort === 'quantity') matchingProducts.sort((a, b) => a.quantity - b.quantity);
    if (order === 'desc') matchingProducts.reverse();

    res.status(200).json(matchingProducts);
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
    // In Express 5, req.body is undefined when no JSON body was sent
    // lowStockThreshold is optional: by default, the threshold is 5 units
    const { price, quantity, stock, lowStockThreshold = 5 } = req.body ?? {};
    const sku = trimText(req.body?.sku);
    const name = trimText(req.body?.name);
    const category = trimText(req.body?.category);
    const supplier = trimText(req.body?.supplier);

    // Validate the request body to ensure all required fields are present
    if ([sku, name, price, category, supplier].some(field => field === undefined)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // A new product has no units: they arrive through stock movements, which say in which warehouse they are
    if (quantity !== undefined || stock !== undefined) {
        return res.status(400).json({ error: 'quantity and stock cannot be set here: create the product, then use POST /products/:sku/movements' });
    }

    // Validate the types of the fields
    if (!isNonEmptyString(sku)) {
        return res.status(400).json({ error: 'sku must be a non-empty string' });
    }

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' });
    }

    if (!isValidPrice(price)) {
        return res.status(400).json({ error: 'price must be a number greater than or equal to 0, with 2 decimals at most' });
    }

    if (!isValidQuantity(lowStockThreshold)) {
        return res.status(400).json({ error: 'lowStockThreshold must be a whole number greater than or equal to 0' });
    }

    // Check if a product with the same SKU already exists (case-insensitive)
    const existingProduct = products.find(p => isSameName(p.sku, sku));
    if (existingProduct) {
        return res.status(409).json({ error: 'Product with this SKU already exists' });
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
    const newProduct = { id: nextProductId++, sku, name, price, category, supplier, quantity: 0, lowStockThreshold, stock: [] };
    products.push(newProduct);

    // Return the created product
    res.status(201).json(newProduct);
});

// Define a route to update a specific product by SKU
app.patch('/products/:sku', (req, res) => {
    const productSku = req.params.sku;
    const { price, lowStockThreshold } = req.body ?? {};
    const name = trimText(req.body?.name);
    const category = trimText(req.body?.category);
    const supplier = trimText(req.body?.supplier);

    // Find the product by SKU
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // The SKU identifies the product in the URLs, so it never changes
    if (req.body?.sku !== undefined) {
        return res.status(400).json({ error: 'sku cannot be updated' });
    }

    // The stock only changes through stock movements, so that every change is kept in the history
    if (req.body?.quantity !== undefined || req.body?.stock !== undefined) {
        return res.status(400).json({ error: 'quantity and stock cannot be updated here: use POST /products/:sku/movements' });
    }

    // At least one field to update must be sent
    if ([name, price, category, supplier, lowStockThreshold].every(field => field === undefined)) {
        return res.status(400).json({ error: 'Nothing to update: send name, price, category, supplier and/or lowStockThreshold' });
    }

    // Validate the types of the fields that were sent
    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' });
    }

    if (price !== undefined && !isValidPrice(price)) {
        return res.status(400).json({ error: 'price must be a number greater than or equal to 0, with 2 decimals at most' });
    }

    if (lowStockThreshold !== undefined && !isValidQuantity(lowStockThreshold)) {
        return res.status(400).json({ error: 'lowStockThreshold must be a whole number greater than or equal to 0' });
    }

    // Check if the category is valid (part of the categories array)
    if (category !== undefined && !categories.some(c => c.name === category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    // Check if the supplier is valid (part of the suppliers array)
    if (supplier !== undefined && !suppliers.some(s => s.name === supplier)) {
        return res.status(400).json({ error: 'Invalid supplier' });
    }

    // Update only the fields that were sent in the request body (partial update)
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (supplier !== undefined) product.supplier = supplier;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;

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
 * Stock movements section: This section contains the routes to add, remove or transfer units of a product,
 * and to read the history of these changes.
 */

// Define a route to get the stock movements of a specific product, from the oldest to the newest
app.get('/products/:sku/movements', (req, res) => {
    const productSku = req.params.sku;
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const productMovements = movements.filter(m => m.productId === product.id);
    res.status(200).json(productMovements);
});

// Define a route to move units of a product: into a warehouse (type 'in'), out of a warehouse (type 'out'),
// or from a warehouse to another one (type 'transfer')
app.post('/products/:sku/movements', (req, res) => {
    const productSku = req.params.sku;
    const { type, quantity } = req.body ?? {};
    const reason = trimText(req.body?.reason);
    const from = trimText(req.body?.from);
    const to = trimText(req.body?.to);

    // Find the product by SKU
    const product = products.find(p => p.sku === productSku);

    // If the product is not found, return a 404 error response
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Validate the request body to ensure all required fields are present
    const missingFields = findMissingFields({ type, quantity, reason });
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate the types of the fields
    if (type !== 'in' && type !== 'out' && type !== 'transfer') {
        return res.status(400).json({ error: "type must be 'in', 'out' or 'transfer'" });
    }

    // The quantity is always positive: the type says where the units go
    if (!isValidQuantity(quantity) || quantity === 0) {
        return res.status(400).json({ error: 'quantity must be a whole number greater than 0' });
    }

    if (!isNonEmptyString(reason)) {
        return res.status(400).json({ error: 'reason must be a non-empty string' });
    }

    // Check that the right warehouses were sent: 'in' only uses to, 'out' only uses from, and 'transfer' uses both
    if (type === 'in' && (to === undefined || from !== undefined)) {
        return res.status(400).json({ error: "type 'in' needs a warehouse in 'to' only" });
    }

    if (type === 'out' && (from === undefined || to !== undefined)) {
        return res.status(400).json({ error: "type 'out' needs a warehouse in 'from' only" });
    }

    if (type === 'transfer' && (from === undefined || to === undefined)) {
        return res.status(400).json({ error: "type 'transfer' needs a warehouse in 'from' and in 'to'" });
    }

    // Check if the warehouses are valid (part of the warehouses array)
    if (from !== undefined && !warehouses.some(w => w.name === from)) {
        return res.status(400).json({ error: 'Invalid warehouse in from' });
    }

    if (to !== undefined && !warehouses.some(w => w.name === to)) {
        return res.status(400).json({ error: 'Invalid warehouse in to' });
    }

    if (from === to) {
        return res.status(400).json({ error: 'from and to must be two different warehouses' });
    }

    // Check if there are enough units in the warehouse that they leave
    if (from !== undefined && quantity > getWarehouseQuantity(product, from)) {
        return res.status(409).json({ error: `Not enough stock in ${from}: only ${getWarehouseQuantity(product, from)} available` });
    }

    // Everything is valid: move the units and keep the movement in the history
    if (from !== undefined) changeWarehouseQuantity(product, from, -quantity);
    if (to !== undefined) changeWarehouseQuantity(product, to, quantity);

    // from or to is undefined when the type does not use it: undefined fields are not part of the JSON response
    const newMovement = {
        id: nextMovementId++,
        productId: product.id,
        sku: product.sku,
        type,
        quantity,
        reason,
        from,
        to,
        stockAfter: product.quantity,
        date: new Date().toISOString()
    };
    movements.push(newMovement);

    // Return the created movement
    res.status(201).json(newMovement);
});


/**
 * Warehouses section: This section contains the routes to create, read, update and delete warehouses,
 * and to list the products and the stock movements of a warehouse.
 */

// Define a route to get all warehouses, or only the warehouses whose name contains
// the text given in the query string, e.g. GET /warehouses?name=north (case-insensitive)
app.get('/warehouses', (req, res) => {
    const { name } = req.query;

    // No name filter: return all the warehouses
    if (name === undefined) {
        return res.status(200).json(warehouses);
    }

    // The name filter must be one non-empty text (?name=a&name=b would give an array)
    if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' });
    }

    const matchingWarehouses = warehouses.filter(w => containsText(w.name, name));
    res.status(200).json(matchingWarehouses);
});

// Define a route to create a new warehouse
app.post('/warehouses', (req, res) => {
    const { address } = req.body ?? {};
    const name = trimText(req.body?.name);

    // Validate the request body to ensure all required fields are present
    const missingFields = findMissingFields({ name, address });
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate the types of the fields
    const invalidField = findInvalidTextField({ name, address });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    // Check if a warehouse with the same name already exists (case-insensitive)
    if (warehouses.some(w => isSameName(w.name, name))) {
        return res.status(409).json({ error: 'Warehouse with this name already exists' });
    }

    // Create the new warehouse
    const newWarehouse = { id: nextWarehouseId++, name, address };
    warehouses.push(newWarehouse);

    // Return the created warehouse
    res.status(201).json({ message: 'Warehouse created successfully', warehouse: newWarehouse });
});

// Define a route to get a specific warehouse by its name
app.get('/warehouses/:name', (req, res) => {
    const warehouseName = req.params.name;
    const warehouse = warehouses.find(w => w.name === warehouseName);

    // If the warehouse is not found, return a 404 error response
    if (!warehouse) {
        return res.status(404).json({ error: 'Warehouse not found' });
    }

    // If the warehouse is found, return the warehouse data as JSON
    res.status(200).json(warehouse);
});

// Define a route to get the products of a warehouse, with the number of units in this warehouse only
app.get('/warehouses/:name/products', (req, res) => {
    const warehouseName = req.params.name;
    const warehouse = warehouses.find(w => w.name === warehouseName);

    // If the warehouse is not found, return a 404 error response
    if (!warehouse) {
        return res.status(404).json({ error: 'Warehouse not found' });
    }

    const productsInWarehouse = products
        .filter(p => getWarehouseQuantity(p, warehouseName) > 0)
        .map(p => ({ sku: p.sku, name: p.name, quantity: getWarehouseQuantity(p, warehouseName) }));
    res.status(200).json(productsInWarehouse);
});

// Define a route to get the stock movements of a warehouse (units that arrived or left), from the oldest to the newest
app.get('/warehouses/:name/movements', (req, res) => {
    const warehouseName = req.params.name;
    const warehouse = warehouses.find(w => w.name === warehouseName);

    // If the warehouse is not found, return a 404 error response
    if (!warehouse) {
        return res.status(404).json({ error: 'Warehouse not found' });
    }

    const warehouseMovements = movements.filter(m => m.from === warehouseName || m.to === warehouseName);
    res.status(200).json(warehouseMovements);
});

// Define a route to update a specific warehouse by its name (rename it and/or change its address)
app.patch('/warehouses/:name', (req, res) => {
    const warehouseName = req.params.name;
    const { address } = req.body ?? {};
    const newName = trimText(req.body?.newName);

    // Find the warehouse by name
    const warehouse = warehouses.find(w => w.name === warehouseName);

    // If the warehouse is not found, return a 404 error response
    if (!warehouse) {
        return res.status(404).json({ error: 'Warehouse not found' });
    }

    // At least one field to update must be sent
    if (newName === undefined && address === undefined) {
        return res.status(400).json({ error: 'Nothing to update: send newName and/or address' });
    }

    // Validate the types of the fields that were sent
    const invalidField = findInvalidTextField({ newName, address });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    // Check if another warehouse already has the new name (case-insensitive)
    if (newName !== undefined && warehouses.some(w => w !== warehouse && isSameName(w.name, newName))) {
        return res.status(409).json({ error: 'Warehouse with the new name already exists' });
    }

    // Update only the fields that were sent in the request body (partial update)
    if (address !== undefined) warehouse.address = address;

    if (newName !== undefined) {
        warehouse.name = newName;

        // Keep the stock of the products in sync with the new name
        products.forEach(p => {
            p.stock.forEach(s => {
                if (s.warehouse === warehouseName) s.warehouse = newName;
            });
        });

        // Keep the history of the movements in sync with the new name
        movements.forEach(m => {
            if (m.from === warehouseName) m.from = newName;
            if (m.to === warehouseName) m.to = newName;
        });
    }

    // Return a success response
    res.status(200).json({ message: 'Warehouse updated successfully', warehouse });
});

// Define a route to delete a specific warehouse by its name
app.delete('/warehouses/:name', (req, res) => {
    const warehouseName = req.params.name;

    // Find the warehouse by name
    const warehouse = warehouses.find(w => w.name === warehouseName);

    // If the warehouse is not found, return a 404 error response
    if (!warehouse) {
        return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Check if there are units of a product in this warehouse
    if (products.some(p => getWarehouseQuantity(p, warehouseName) > 0)) {
        return res.status(409).json({ error: 'Cannot delete warehouse with products in stock' });
    }

    // Check if the history uses this warehouse, so that it never mentions a warehouse that does not exist
    if (movements.some(m => m.from === warehouseName || m.to === warehouseName)) {
        return res.status(409).json({ error: 'Cannot delete warehouse with stock movements' });
    }

    // Remove the warehouse from the warehouses array
    warehouses.splice(warehouses.indexOf(warehouse), 1);

    // Return a success response
    res.status(200).json({ message: 'Warehouse deleted successfully' });
});


/**
 * Categories section: This section contains the routes to create, read, update and delete categories,
 * and to list the products of a category.
 */

// Define a route to get all categories, or only the categories whose name contains
// the text given in the query string, e.g. GET /categories?name=food (case-insensitive)
app.get('/categories', (req, res) => {
    const { name } = req.query;

    // No name filter: return all the categories
    if (name === undefined) {
        return res.status(200).json(categories);
    }

    // The name filter must be one non-empty text (?name=a&name=b would give an array)
    if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' });
    }

    const matchingCategories = categories.filter(c => containsText(c.name, name));
    res.status(200).json(matchingCategories);
});

// Define a route to create a new category
app.post('/categories', (req, res) => {
    const { description } = req.body ?? {};
    const name = trimText(req.body?.name);

    // Validate the request body to ensure all required fields are present
    const missingFields = findMissingFields({ name, description });
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate the types of the fields
    const invalidField = findInvalidTextField({ name, description });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    // Check if a category with the same name already exists (case-insensitive)
    if (categories.some(c => isSameName(c.name, name))) {
        return res.status(409).json({ error: 'Category with this name already exists' });
    }

    // Create the new category
    const newCategory = { id: nextCategoryId++, name, description };
    categories.push(newCategory);

    // Return the created category
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
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

    const productsInCategory = products.filter(p => p.category === categoryName);
    res.status(200).json(productsInCategory);
});

// Define a route to update a specific category by its name (rename it and/or change its description)
app.patch('/categories/:name', (req, res) => {
    const categoryName = req.params.name;
    const { description } = req.body ?? {};
    const newName = trimText(req.body?.newName);

    // Find the category by name
    const category = categories.find(c => c.name === categoryName);

    // If the category is not found, return a 404 error response
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    // At least one field to update must be sent
    if (newName === undefined && description === undefined) {
        return res.status(400).json({ error: 'Nothing to update: send newName and/or description' });
    }

    // Validate the types of the fields that were sent
    const invalidField = findInvalidTextField({ newName, description });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    // Check if another category already has the new name (case-insensitive)
    if (newName !== undefined && categories.some(c => c !== category && isSameName(c.name, newName))) {
        return res.status(409).json({ error: 'Category with the new name already exists' });
    }

    // Update only the fields that were sent in the request body (partial update)
    if (description !== undefined) category.description = description;

    if (newName !== undefined) {
        category.name = newName;

        // Keep the products linked to this category in sync with the new name
        products.forEach(p => {
            if (p.category === categoryName) p.category = newName;
        });
    }

    // Return a success response
    res.status(200).json({ message: 'Category updated successfully', category });
});

// Define a route to delete a specific category by its name
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
        return res.status(409).json({ error: 'Cannot delete category with associated products' });
    }

    // Remove the category from the categories array
    const index = categories.indexOf(category);
    if (index !== -1) {
        categories.splice(index, 1);
    }

    // Return a success response
    res.status(200).json({ message: 'Category deleted successfully' });
});


/**
 * Suppliers section: This section contains the routes to create, read, update and delete suppliers,
 * and to list the products of a supplier.
 */

// Define a route to get all suppliers, or only the suppliers whose name contains
// the text given in the query string, e.g. GET /suppliers?name=acme (case-insensitive)
app.get('/suppliers', (req, res) => {
    const { name } = req.query;

    // No name filter: return all the suppliers
    if (name === undefined) {
        return res.status(200).json(suppliers);
    }

    // The name filter must be one non-empty text (?name=a&name=b would give an array)
    if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' });
    }

    const matchingSuppliers = suppliers.filter(s => containsText(s.name, name));
    res.status(200).json(matchingSuppliers);
});

// Define a route to create a new supplier
app.post('/suppliers', (req, res) => {
    const { contact, email, phone, address } = req.body ?? {};
    const name = trimText(req.body?.name);

    // Validate the request body to ensure all required fields are present
    const missingFields = findMissingFields({ name, contact, email, phone, address });
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate the types of the fields
    const invalidField = findInvalidTextField({ name, contact, email, phone, address });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'email must be a valid email address' });
    }

    // Check if a supplier with the same name already exists (case-insensitive)
    if (suppliers.some(s => isSameName(s.name, name))) {
        return res.status(409).json({ error: 'Supplier with this name already exists' });
    }

    // Create the new supplier
    const newSupplier = { id: nextSupplierId++, name, contact, email, phone, address };
    suppliers.push(newSupplier);

    // Return the created supplier
    res.status(201).json({ message: 'Supplier created successfully', supplier: newSupplier });
});

// Define a route to get a specific supplier by its name
app.get('/suppliers/:name', (req, res) => {
    const supplierName = req.params.name;
    const supplier = suppliers.find(s => s.name === supplierName);

    // If the supplier is not found, return a 404 error response
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    // If the supplier is found, return the supplier data as JSON
    res.status(200).json(supplier);
});

// Define a route to get all products from a specific supplier
app.get('/suppliers/:name/products', (req, res) => {
    const supplierName = req.params.name;
    const supplier = suppliers.find(s => s.name === supplierName);

    // If the supplier is not found, return a 404 error response
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    // Find all products associated with the supplier
    const productsFromSupplier = products.filter(p => p.supplier === supplierName);

    // Return the products as JSON
    res.status(200).json(productsFromSupplier);
});

// Define a route to update a specific supplier by its name (rename it and/or change its contact details)
app.patch('/suppliers/:name', (req, res) => {
    const supplierName = req.params.name;
    const { contact, email, phone, address } = req.body ?? {};
    const newName = trimText(req.body?.newName);

    // Find the supplier by name
    const supplier = suppliers.find(s => s.name === supplierName);

    // If the supplier is not found, return a 404 error response
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    // At least one field to update must be sent
    if ([newName, contact, email, phone, address].every(field => field === undefined)) {
        return res.status(400).json({ error: 'Nothing to update: send newName, contact, email, phone and/or address' });
    }

    // Validate the types of the fields that were sent
    const invalidField = findInvalidTextField({ newName, contact, email, phone, address });
    if (invalidField) {
        return res.status(400).json({ error: `${invalidField} must be a non-empty string` });
    }

    if (email !== undefined && !isValidEmail(email)) {
        return res.status(400).json({ error: 'email must be a valid email address' });
    }

    // Check if another supplier already has the new name (case-insensitive)
    if (newName !== undefined && suppliers.some(s => s !== supplier && isSameName(s.name, newName))) {
        return res.status(409).json({ error: 'Supplier with the new name already exists' });
    }

    // Update only the fields that were sent in the request body (partial update)
    if (contact !== undefined) supplier.contact = contact;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (address !== undefined) supplier.address = address;

    if (newName !== undefined) {
        supplier.name = newName;

        // Keep the products linked to this supplier in sync with the new name
        products.forEach(p => {
            if (p.supplier === supplierName) p.supplier = newName;
        });
    }

    // Return a success response
    res.status(200).json({ message: 'Supplier updated successfully', supplier });
});

// Define a route to delete a specific supplier by its name
app.delete('/suppliers/:name', (req, res) => {
    const supplierName = req.params.name;

    // Find the supplier by name
    const supplier = suppliers.find(s => s.name === supplierName);

    // If the supplier is not found, return a 404 error response
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    // Check if there are any products associated with this supplier
    const productsFromSupplier = products.filter(p => p.supplier === supplierName);

    // If there are products associated with this supplier, return a 409 Conflict error response
    if (productsFromSupplier.length > 0) {
        return res.status(409).json({ error: 'Cannot delete supplier with associated products' });
    }

    // Remove the supplier from the suppliers array
    const supplierIndex = suppliers.indexOf(supplier);
    if (supplierIndex !== -1) {
        suppliers.splice(supplierIndex, 1);
    }

    // Return a success response
    res.status(200).json({ message: 'Supplier deleted successfully' });
});

// Fallback middleware for unknown routes: answers 404 when no route above matched the request
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware: catches errors thrown in the routes (and invalid JSON bodies or URLs)
// and always answers in JSON, without sending the stack trace to the client
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;

    // Log unexpected errors on the server side only
    if (status >= 500) {
        console.error(err);
    }

    // A status below 500 is a client error, such as malformed JSON or a badly encoded URL: its message is safe to send
    res.status(status).json({ error: status < 500 ? err.message : 'Internal server error' });
});

/**
 * Server Setup: This section sets up the Express server to listen on the specified PORT.
 */

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
