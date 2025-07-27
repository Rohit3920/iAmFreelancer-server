const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/universal', searchController.universalSearch);
router.get('/gigs', searchController.gigSearch);
router.get('/orders', searchController.orderSearch);
router.get('/technologies', searchController.technologySearch);
router.get('/users', searchController.userSearch);

module.exports = router;