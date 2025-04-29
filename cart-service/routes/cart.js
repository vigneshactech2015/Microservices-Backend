// routes/cart.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');

router.post('/add', controller.addToCart);
router.post('/remove', controller.removeFromCart);
router.get('/:userId', controller.getCart);
router.delete('/:userId', controller.clearCart);

module.exports = router;
