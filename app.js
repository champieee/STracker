const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');  // Import the MySQL connection
const app = express();

app.use(bodyParser.json());  // To handle JSON body data

const JWT_SECRET = 'your_jwt_secret';  // Use a strong secret for JWTs

// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
            if (err) throw err;
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// Login user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    });
});

// Middleware to authenticate users based on JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Add a workout (Authenticated route)
app.post('/api/workouts', authenticateToken, (req, res) => {
    const { exercise, weight } = req.body;
    const userId = req.user.userId;

    db.query('INSERT INTO workouts (user_id, exercise, weight, date) VALUES (?, ?, ?, ?)', [userId, exercise, weight, new Date()], (err, results) => {
        if (err) throw err;
        res.status(201).json({ message: 'Workout added successfully' });
    });
});

// Get workouts for the authenticated user
app.get('/api/workouts', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.query('SELECT * FROM workouts WHERE user_id = ?', [userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
