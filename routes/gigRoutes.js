const express = require('express');
const router = express.Router();
const {
    createGig,
    getAllGigs,
    getGigById,
    getGigByUserId,
    updateGig,
    deleteGig
} = require('../controllers/gigController');


router.post('/', createGig);
router.get('/', getAllGigs);
router.get('/user/:userId', getGigByUserId);
router.get('/:id', getGigById);
router.put('/:id', updateGig);
router.delete('/:id', deleteGig);

module.exports = router;