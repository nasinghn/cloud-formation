const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 80;
app.use(express.json())


// Enable CORS
app.use(cors());

// MySQL database configuration
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'admin',
    password: 'sanjay12',
    database: 'Narender',
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('Connected to MySQL database');
});

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello, this is your Node.js server connected to MySQL!');
});

app.post('/prod/order', (req, res) => {
    const { CustomerId, ProductId, Quantity } = req.body;
    console.log(req.body)
    if (CustomerId == "" || ProductId == "" || Quantity <0) {
        return res.status(400).json({ error: 'CustomerId, ProductId, and Quantity are required.' });
    }

    const insertQuery = 'INSERT INTO Orders (CustomerId, ProductId, Quantity) VALUES (?, ?, ?)';
    db.query(insertQuery, [CustomerId, ProductId, Quantity], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        return res.status(201).json({ message: 'Order inserted successfully' });
    });
});

// API endpoint to insert customer
app.post('/prod/userinput', (req, res) => {
    const { CustomerName, CustomerEmail, CustomerAddress } = req.body;

    if (!CustomerName || !CustomerEmail || !CustomerAddress) {
        return res.status(400).json({ error: 'CustomerName, CustomerEmail, and CustomerAddress are required.' });
    }

    const insertCustomerQuery = 'INSERT INTO Customers (CustomerName, Email, Address) VALUES (?, ?, ?)';
    db.query(insertCustomerQuery, [CustomerName, CustomerEmail, CustomerAddress], (err, result) => {
        if (err) {
            console.error('Error inserting customer:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        return res.status(201).json({ message: 'Customer inserted successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
