require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/messageModel');
const reviewCommentRoutes = require('./routes/reviewCommentRoutes')
const orderRoutes = require('./routes/orderRoutes')
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

require('./utils/config');

var corsOptions = {
    origin: process.env.CLIENT_URL || "*",
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true
};

app.use(express.json());
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/file', uploadRoutes);
app.use('/api/gig', gigRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/review', reviewCommentRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/search', searchRoutes)

app.get('/', (req, res) => {
    res.send('The freelancer (iAmFreelancer) website backend running...');
});

io.on('connection', (socket) => {

    socket.on('joinRoom', (userId) => {
        socket.join(userId);
    });

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, content } = data;

        try {
            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                content: content
            });
            await newMessage.save();

            io.to(senderId).emit('receiveMessage', newMessage);
            io.to(receiverId).emit('receiveMessage', newMessage);

        } catch (error) {
            console.error('Error saving or emitting message:', error);
            socket.emit('messageError', 'Failed to send message due to server error.');
        }
    });

    // socket.on('disconnect', () => {
    //     console.log(`User disconnected: ${socket.id}`); 
    // });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URL: ${process.env.MONGO_URL ? 'Connected' : 'Not Set (Check .env)'}`);
});