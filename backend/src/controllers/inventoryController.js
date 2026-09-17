const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/inventory
const listProducts = asyncHandler(async (req, res) => {
  const products = await prisma.inventoryProduct.findMany({ orderBy: { name: 'asc' } });
  const withAlert = products.map((p) => ({ ...p, lowStock: p.quantity < p.minQuantity }));
  res.json(withAlert);
});

// GET /api/inventory/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.inventoryProduct.findUnique({
    where: { id: req.params.id },
    include: { movements: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });
  if (!product) throw new ApiError(404, 'Produto não encontrado');
  res.json({ ...product, lowStock: product.quantity < product.minQuantity });
});

// POST /api/inventory
const createProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, minQuantity, price, description } = req.body;
  if (!name || price === undefined) throw new ApiError(400, 'Nome e preço são obrigatórios');
  if (Number(quantity) < 0) throw new ApiError(400, 'Quantidade não pode ser negativa');

  const product = await prisma.inventoryProduct.create({
    data: {
      name,
      category,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      price: Number(price),
      description,
    },
  });
  res.status(201).json(product);
});

// PUT /api/inventory/:id
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, minQuantity, price, description, active } = req.body;
  const product = await prisma.inventoryProduct.update({
    where: { id: req.params.id },
    data: {
      name,
      category,
      minQuantity: minQuantity !== undefined ? Number(minQuantity) : undefined,
      price: price !== undefined ? Number(price) : undefined,
      description,
      active,
    },
  });
  res.json(product);
});

// DELETE /api/inventory/:id - desativa
const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.inventoryProduct.update({ where: { id: req.params.id }, data: { active: false } });
  res.json({ message: 'Produto desativado com sucesso' });
});

// POST /api/inventory/:id/movement  { type: 'ENTRADA' | 'SAIDA', quantity, reason }
const registerMovement = asyncHandler(async (req, res) => {
  const { type, quantity, reason } = req.body;
  if (!['ENTRADA', 'SAIDA'].includes(type)) throw new ApiError(400, 'Tipo de movimentação inválido');
  const qty = Number(quantity);
  if (!qty || qty <= 0) throw new ApiError(400, 'Quantidade deve ser maior que zero');

  const product = await prisma.inventoryProduct.findUnique({ where: { id: req.params.id } });
  if (!product) throw new ApiError(404, 'Produto não encontrado');

  const newQuantity = type === 'ENTRADA' ? product.quantity + qty : product.quantity - qty;
  if (newQuantity < 0) throw new ApiError(400, 'Estoque insuficiente para esta saída');

  const [movement] = await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: { type, quantity: qty, reason, productId: product.id, userId: req.user.id },
    }),
    prisma.inventoryProduct.update({ where: { id: product.id }, data: { quantity: newQuantity } }),
  ]);

  res.status(201).json({ movement, newQuantity, lowStock: newQuantity < product.minQuantity });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  registerMovement,
};
