require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const gigRoutes = require('./routes/gigRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
require('./utils/config');

//cors configuration
var corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["POST", "GET", "DELETE", "PUT"],
    Credential: true
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
// app.use(cors());
const http = require('http').Server(app);




app.use('/api/auth', authRoutes)
app.use('/api/gig', gigRoutes);

app.get('/', (req, res) => {
    res.send('The freelancer (iAmFreelancer) website backend running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URL: ${process.env.MONGO_URL ? 'Connected' : 'Not Set (Check .env)'}`);
});