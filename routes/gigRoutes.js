const express = require('express');
const router = express.Router();
const {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig
} = require('../controllers/gigController');


router.post('/', createGig);
router.get('/', getAllGigs);
router.get('/:id', getGigById);
router.put('/:id', updateGig);
router.delete('/:id', deleteGig);

module.exports = router;