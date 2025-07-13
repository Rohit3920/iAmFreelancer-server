const Gig = require('../models/gigModel');

async function createGig(req, res) {
    const { title, description, price, category, userId } = req.body;

    if (!title || !description || !price || !category || !userId) {
        return res.status(400).json({ message: 'Please provide all required fields: title, description, price, category, and userId.' });
    }

    try {
        const newGig = await Gig.create({
            title,
            description,
            price,
            userId,
            category,
            totalStars: 0,
            starNumber: 0,
            cover: req.file ? req.file.path : '',
            images: req.files ? req.files.map(file => file.path) : [],
            shortTitle: title.substring(0, 50),
            shortDesc: description.substring(0, 100),
            deliveryTime: 3,
            revisionNumber: 1,
            features: [],
            sales: 0
        });

        res.status(201).json({
            _id: newGig._id,
            title: newGig.title,
            description: newGig.description,
            price: newGig.price,
            category: newGig.category,
            userId: newGig.userId,
            cover: newGig.cover,
            images: newGig.images,
            shortTitle: newGig.shortTitle,
            shortDesc: newGig.shortDesc,
            deliveryTime: newGig.deliveryTime,
            revisionNumber: newGig.revisionNumber,
            features: newGig.features,
            sales: newGig.sales,
            totalStars: newGig.totalStars,
            starNumber: newGig.starNumber,
            message: 'Gig created successfully!'
        });
    } catch (error) {
        console.error('Error creating gig:', error);
        res.status(500).json({ message: 'Server error while creating gig.' });
    }
}

async function getAllGigs(req, res) {
    try {
        const gigs = await Gig.find().populate('userId', 'username email');
        res.status(200).json(gigs);
    } catch (error) {
        console.error('Error fetching gigs:', error);
        res.status(500).json({ message: 'Server error while fetching gigs.' });
    }
}
async function getGigById(req, res) {
    const { id } = req.params;

    try {
        const gig = await Gig.findById(id).populate('userId', 'username email');
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        res.status(200).json(gig);
    } catch (error) {
        console.error('Error fetching gig by ID:', error);
        res.status(500).json({ message: 'Server error while fetching gig.' });
    }
}

async function updateGig(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    console.log('Update Gig Request:', req.body);

    try {
        const existingGig = await Gig.findById(id);
        if (!existingGig) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        Object.assign(existingGig, updateData);
        await existingGig.save();

        if (!existingGig) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        res.status(200).json({ message: 'Gig updated successfully', gig: existingGig });

    } catch (error) {
        console.error('Error updating gig:', error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'A gig with this title already exists. Please choose a different title.', details: error.keyValue });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error during gig update', details: error.message });
        }
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Gig ID format' });
        }

        res.status(500).json({ message: 'Server error while updating gig.', error: error.message });
    }
}

async function deleteGig(req, res) {
    const { id } = req.params;

    try {
        const deletedGig = await Gig.findByIdAndDelete(id);
        if (!deletedGig) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        res.status(200).json({ message: 'Gig deleted successfully!' });
    } catch (error) {
        console.error('Error deleting gig:', error);
        res.status(500).json({ message: 'Server error while deleting gig.' });
    }
}

module.exports = {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig
};