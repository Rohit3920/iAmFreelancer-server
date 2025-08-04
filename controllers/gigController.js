const Gig = require('../models/gigModel');

async function createGig(req, res) {
    const {
        title,
        description,
        price,
        categoryMain,
        categorySub,
        userId,
        cover,
        images,
        shortTitle,
        shortDesc,
        deliveryTime,
        revisionNumber,
        coreFeatures,
        serviceType,
        searchTags
    } = req.body;

    if (!title || !description || !price || !categoryMain || !categorySub || !userId) {
        return res.status(400).json({ message: 'Please provide all required fields: title, description, price, categoryMain, categorySub, and userId.' });
    }

    try {
        const newGig = await Gig.create({
            title,
            description,
            price,
            categoryMain,
            categorySub,
            userId,
            totalStars: 0,
            starNumber: 0,
            cover: cover || '',
            images: Array.isArray(images) ? images : [],
            shortTitle: shortTitle || title.substring(0, 50),
            shortDesc: shortDesc || description.substring(0, 100),
            deliveryTime: Number(deliveryTime) || 3,
            revisionNumber: Number(revisionNumber) || 1,
            coreFeatures: Array.isArray(coreFeatures) ? coreFeatures : [],
            serviceType: serviceType || 0,
            searchTags: Array.isArray(searchTags) ? searchTags : [],
        });

        res.status(201).json({
            _id: newGig._id,
            title: newGig.title,
            description: newGig.description,
            price: newGig.price,
            categoryMain: newGig.categoryMain,
            categorySub: newGig.categorySub,
            userId: newGig.userId,
            cover: newGig.cover,
            images: newGig.images,
            shortTitle: newGig.shortTitle,
            shortDesc: newGig.shortDesc,
            deliveryTime: newGig.deliveryTime,
            totalStars: newGig.totalStars,
            starNumber: newGig.starNumber,
            revisionNumber: newGig.revisionNumber,
            coreFeatures: newGig.coreFeatures,
            serviceType: newGig.serviceType,
            searchTags: newGig.searchTags,
            message: 'Gig created successfully!'
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).json({ message: 'Server error while creating gig.', error: error.message });
    }
}

async function getAllGigs(req, res) {
    try {
        const gigs = await Gig.find().populate('userId', 'username email profilePicture');
        res.status(200).json(gigs);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching gigs.', error: error.message });
    }
}

async function getGigById(req, res) {
    const { id } = req.params;

    try {
        const gig = await Gig.findById(id).populate('userId', 'username email profilePicture');
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        res.status(200).json(gig);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Gig ID format.' });
        }
        res.status(500).json({ message: 'Server error while fetching gig.', error: error.message });
    }
}

async function getGigByUserId(req, res) {
    const { userId } = req.params;

    try {
        const gigs = await Gig.find({ userId }).populate('userId', 'username email profilePicture');
        if (!gigs || gigs.length === 0) {
            return res.status(404).json({ message: 'No gigs found for this user.' });
        }
        res.status(200).json(gigs);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Gig UserId format.' });
        }
        res.status(500).json({ message: 'Server error while fetching gig.', error: error.message });
    }
}

async function updateGig(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedGig = await Gig.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('userId', 'username email profilePicture');
        if (!updatedGig) {
            return res.status(404).json({ message: 'Gig not found.' });
        }
        res.status(200).json({ message: 'Gig updated successfully', gig: updatedGig });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Validation error during gig update', details: errors });
        }
        if (error.name === 'CastError') {
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
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Gig ID format.' });
        }
        res.status(500).json({ message: 'Server error while deleting gig.', error: error.message });
    }
}

module.exports = {
    createGig,
    getAllGigs,
    getGigByUserId,
    getGigById,
    updateGig,
    deleteGig
};