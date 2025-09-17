import express from 'express';
import { getAllProductController, getFeaturedProductController } from '../controllers/product.controller.js';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware.js';

const route = express.Router();

route.get('/',isAuthenticated, isAdmin, getAllProductController);
route.get('/featured', getFeaturedProductController);
route.post('/', isAuthenticated, isAdmin, );

export default route;