import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { getCartsProductsController, addCartsController, deleteCartsController, updateQuantityController } from '../controllers/cart.controller.js';
const router = express.Router();

router.get('/', isAuthenticated, getCartsProductsController);
router.post('/', isAuthenticated, addCartsController);
router.delete('/', isAuthenticated, deleteCartsController);
router.put('/:id', isAuthenticated, updateQuantityController);

export default router;