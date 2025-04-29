const cartService = require('../services/cartService');

exports.addToCart = (req, res) => {
  const { userId, productId, quantity } = req.body;
  const updatedCart = cartService.addItem(userId, productId, quantity);
  res.json({ cart: updatedCart });
};

exports.removeFromCart = (req, res) => {
  const { userId, productId } = req.body;
  const updatedCart = cartService.removeItem(userId, productId);
  res.json({ cart: updatedCart });
};

exports.getCart = (req, res) => {
  const { userId } = req.params;
  const cart = cartService.getCart(userId);
  res.json({ cart });
};

exports.clearCart = (req, res) => {
  const { userId } = req.params;
  cartService.clearCart(userId);
  res.json({ message: 'Cart cleared' });
};
