import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({path:'../../.env'});

export const db =async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("mongodb connected successful");
    } catch (error) {
        console.log(`mongodb connection error : ${error}`);
        process.exit(1);
    }
}