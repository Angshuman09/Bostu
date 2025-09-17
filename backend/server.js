import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js'
import productRoutes from './routes/product.route.js'
import { db } from './lib/dbConnect.js';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//routes3
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);

app.listen(PORT, ()=>{
    db();
    console.log(`port is running in the port ${PORT}`);
});