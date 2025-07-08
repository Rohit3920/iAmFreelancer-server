const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const URL = process.env.MONGO_URL;

        if (!URL) {
            console.error("Error: MONGO_URL is not defined in environment variables. Please set it in your .env file.");
            process.exit(1);
        }

        await mongoose.connect(URL);

        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
