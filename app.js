// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('expres');

const app = express();

// Load the PORT from environment variables or use default value 3000
const PORT = process.env.PORT || 3000;




// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
