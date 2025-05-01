const cartService = require('../services/cartService');

exports.addToCart = (req, res) => {
  const { userId, productId, quantity } = req.body;
  if(!userId || !productId || !quantity){
    return res.status(400).json({message:"userId , productId , quantity is required !"});
  }
  const updatedCart = cartService.addItem(userId, productId, quantity);
  res.status(200).json({message:"Item added to cart successfully", cart: updatedCart });
};

exports.removeFromCart = (req, res) => {
  const { userId, productId } = req.body;
  if(!userId || !productId){
    return res.status(400).json({message:"User Id , productId is required "})
  }
  const updatedCart = cartService.removeItem(userId, productId);
  res.status(200).json({ message:"Item has been removed from cart",cart: updatedCart });
};

exports.getCart = (req, res) => {
  const { userId } = req.params;
  if(!userId){
    return res.status(400).json({message:"User Id is required"})
  }
  const cart = cartService.getCart(userId);
  res.status(200).json({ cart });
};

exports.clearCart = (req, res) => {
  const { userId } = req.params;
  if(!userId){
    return res.status(400).json({message:"User Id is required"})
  }
  cartService.clearCart(userId);
  res.status(200).json({ message: 'Cart cleared' });
};
