const Message = require('../models/messageModel');
const User = require('../models/authModel');

const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort('timestamp');
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
};

const getMessageUser = async (req, res) => {
    try {
        const currentUserId = req.params.userId;

        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized: Current user ID not found.' });
        }

        const conversations = await Message.find({
            $or: [
                { sender: currentUserId },
                { receiver: currentUserId }
            ]
        })
        .select('sender receiver')
        .lean(); // Use .lean() for plain JavaScript objects, better performance

        const contactedUserIds = new Set();
        conversations.forEach(msg => {
            if (msg.sender.toString() !== currentUserId.toString()) {
                contactedUserIds.add(msg.sender.toString());
            }
            if (msg.receiver.toString() !== currentUserId.toString()) {
                contactedUserIds.add(msg.receiver.toString());
            }
        });

        const usersInCommunication = await User.find({
            _id: { $in: Array.from(contactedUserIds) }
        }).select('-password -__v');

        res.status(200).json(usersInCommunication);

    } catch (error) {
        console.error('Error fetching users in communication:', error);
        res.status(500).json({ message: 'Server error fetching communication users.' });
    }
};

module.exports = {
    getMessages,
    getMessageUser
};