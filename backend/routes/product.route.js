import express from 'express';
import { getAllProductController, getFeaturedProductController, createProductController, deleteProductController, getRecommendProductController, getCategoryProductsController, toggleFeaturedProductController } from '../controllers/product.controller.js';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware.js';

const route = express.Router();

route.get('/',isAuthenticated, isAdmin, getAllProductController);
route.get('/featured', getFeaturedProductController);
route.post('/', isAuthenticated, isAdmin,createProductController );
route.delete('/:id',isAuthenticated, isAdmin, deleteProductController);
route.get('/recommend', getRecommendProductController);
route.get('/category/:category', getCategoryProductsController);
route.patch('/:id', isAuthenticated, isAdmin, toggleFeaturedProductController)
export default route;