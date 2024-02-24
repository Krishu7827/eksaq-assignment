const express = require('express');
const {connectDB} = require('./db.config');
const {router} = require('./Audio.Router');

/** Initialize Express app */ 
const app = express();

// Connect to MongoDB
connectDB();

/** Middleware to parse JSON bodies **/
app.use(express.json());

/** Route */
app.use('/api', router);

/** start the server **/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
