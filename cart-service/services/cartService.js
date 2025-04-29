// In-memory store: { userId: [{ productId, quantity }] 

const carts = new Map(); 

function addItem(userId, productId, quantity) {
  const items = carts.get(userId) || [];
  const index = items.findIndex(item => item.productId === productId);

  if (index > -1) items[index].quantity += quantity;
  else items.push({ productId, quantity });

  carts.set(userId, items);
  return items;
}

function removeItem(userId, productId) {
  let items = carts.get(userId) || [];
  items = items.filter(item => item.productId !== productId);
  carts.set(userId, items);
  return items;
}

function getCart(userId) {
  return carts.get(userId) || [];
}

function clearCart(userId) {
  carts.delete(userId);
}

module.exports = { addItem, removeItem, getCart, clearCart };
