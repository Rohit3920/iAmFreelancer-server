const User = require('../models/authModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { username, email, password, description, userRole } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all required fields: username, email, and password.' });
    }

    try {
        // const existingUserByEmail = await User.findOne({ email });
        // if (existingUserByEmail) {
        //     return res.json({ message: 'User with that email already exists.' });
        // }

        // const existingUserByUsername = await User.findOne({ username });
        // if (existingUserByUsername) {
        //     return res.json({ message: 'User with that username already exists.' });
        // }

        const user = await User.create({
            username,
            email,
            password,
            description,
            userRole
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
                message: 'User registered successfully!'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data provided.' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error('Registration error:', error); // More descriptive error logging
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password, userRole } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email, userRole }).select('+password');

        if (user && (await user.comparePassword(password))) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                userRole: user.userRole,
                email: user.email,
                token: generateToken(user._id),
                message: 'Logged in successfully!'
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials (email or password)' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        const email = req.params.email;


        if (!email) {
            return res.status(400).json({ success: false, message: 'Invalid email format. user' });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'User data retrieved successfully.',
            user: user,
        });

    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};


const changePassword = async (req, res) => {
    const targetUserId = req.params.id; // User ID from the URL parameters
    const { oldPassword, newPassword } = req.body; // Expected from the request body

    // Input validation
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both old password and new password are required.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    if (oldPassword === newPassword) {
        return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
    }

    try {
        const user = await User.findById(targetUserId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Error changing password:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getUser = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        let updateData = { ...req.body };

        if (updateData.password) {
            delete updateData.password;
            console.warn('Password update attempted via updateUser. Please use the /change-password endpoint for password changes.');
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        updateData.updatedAt = Date.now();
        Object.assign(user, updateData);
        await user.save();

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json({ message: 'User updated successfully', user: userWithoutPassword });

    } catch (error) {
        console.error('Error updating user:', error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate key error', details: error.keyValue });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', details: error.message });
        }
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserByEmail,
    changePassword,
    getUser,
    getUserById,
    updateUser
};
