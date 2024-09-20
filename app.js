const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');  // Import the mssql connection
const app = express();

app.use(bodyParser.json());  // To handle JSON body data

const JWT_SECRET = 'your_jwt_secret';  // Use a strong secret for JWTs

// Database configuration
const dbConfig = {
    user: 'str',  // Replace with your Azure SQL admin username
    password: 'Hone9!!!',  // Replace with your Azure SQL admin password
    server: 'stracker-server.database.windows.net',
    database: 'sTrackerDB',
    options: {
        encrypt: true,                // Required for Azure SQL
        enableArithAbort: true        // Recommended for Azure SQL
    }
};

// Function to connect to the database
async function connectToDb() {
    try {
        return await sql.connect(dbConfig);
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Registering user: ${username}`);  // Log to verify request
    try {
        const pool = await connectToDb();

        // Check if the user already exists
        const result = await pool
            .request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM users WHERE username = @username');

        if (result.recordset.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database
        await pool
            .request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO users (username, password) VALUES (@username, @password)');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Login user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectToDb();

        // Check if the user exists
        const result = await pool
            .request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM users WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware to authenticate users based on JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Add a workout (Authenticated route)
app.post('/api/workouts', authenticateToken, async (req, res) => {
    const { exercise, weight } = req.body;
    const userId = req.user.userId;

    try {
        const pool = await connectToDb();

        await pool
            .request()
            .input('user_id', sql.Int, userId)
            .input('exercise', sql.NVarChar, exercise)
            .input('weight', sql.Float, weight)
            .input('date', sql.Date, new Date())
            .query('INSERT INTO workouts (user_id, exercise, weight, date) VALUES (@user_id, @exercise, @weight, @date)');

        res.status(201).json({ message: 'Workout added successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get workouts for the authenticated user
app.get('/api/workouts', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const pool = await connectToDb();

        const result = await pool
            .request()
            .input('user_id', sql.Int, userId)
            .query('SELECT * FROM workouts WHERE user_id = @user_id');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a workout by id
app.delete('/api/workouts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const pool = await connectToDb();

        const result = await pool
            .request()
            .input('id', sql.Int, id)
            .input('user_id', sql.Int, userId)
            .query('DELETE FROM workouts WHERE id = @id AND user_id = @user_id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized action' });
        }

        res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
