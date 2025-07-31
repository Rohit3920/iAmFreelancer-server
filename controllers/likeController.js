const Gig = require('../models/gigModel');
const mongoose = require('mongoose');

exports.likeGig = async (req, res) => {
    const { gigId } = req.params;
    const userId = req.body.userId;

    try {
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ error: 'Gig not found.', code: 'GIG_NOT_FOUND' });
        }

        const alreadyLiked = gig.like.includes(userId);
        if (alreadyLiked) {
            return res.status(400).json({ error: 'You have already liked this gig.', code: 'ALREADY_LIKED' });
        }

        gig.like.push(userId);
        await gig.save();

        res.status(200).json({
            message: 'Gig liked successfully.',
            gigId: gig._id,
            userId: userId,
            likesCount: gig.like.length
        });

    } catch (error) {
        console.error('Error liking gig:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ error: 'Invalid gig ID format.', code: 'INVALID_GIG_ID' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.unlikeGig = async (req, res) => {
    const { gigId, userId } = req.params; 

    try {
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ error: 'Gig not found.', code: 'GIG_NOT_FOUND' });
        }

        if (!Array.isArray(gig.like)) {
            gig.like = []; 
        }

        const likedIndex = gig.like.indexOf(userId);
        if (likedIndex === -1) {
            return res.status(400).json({ error: 'You have not liked this gig.', code: 'NOT_LIKED' });
        }

        gig.like.splice(likedIndex, 1);
        await gig.save();

        res.status(200).json({
            message: 'Gig unliked successfully.',
            gigId: gig._id,
            userId: userId,
            likesCount: gig.like.length
        });

    } catch (error) {
        console.error('Error unliking gig:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ error: 'Invalid gig ID format.', code: 'INVALID_GIG_ID' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getLikedByUserId = async (req, res) => {
    const userId = req.params.userId;

    try {
        const likedGigs = await Gig.find({ like: userId }).populate('userId', 'username email profilePicture');

        res.status(200).json(likedGigs);
    } catch (error) {
        console.error('Error fetching liked gigs:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getLikedByGigId = async (req, res) => {
    const { gigId } = req.params;

    try {
        const gig = await Gig.findById(gigId).populate('userId', 'username email profilePicture');
        if (!gig) {
            return res.status(404).json({ error: 'Gig not found.', code: 'GIG_NOT_FOUND' });
        }

        res.status(200).json(gig);

    } catch (error) {
        console.error('Error fetching gig by ID:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ error: 'Invalid gig ID format.', code: 'INVALID_GIG_ID' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
};
