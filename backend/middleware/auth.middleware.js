import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
export const isAuthenticated = async (req, res, next)=>{
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken) return res.status(401).json({error : "Unauthorized: No access token"});

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET_KEY);
    
            const user = await User.findById(decoded.userId).select('-password');
    
            if(!user) return res.status(404).json({error: "User not found"});
    
            req.user = user;
    
            next();
        } catch (error) {
            if(error.name === 'TokenExpiredError'){
                return res.status(401).json({error: "Unauthorized: Access token is expired."});
            }

            throw error;
        }
    } catch (error) {
        console.log(`Error in isAuthenticated middleware: ${error}`);
        res.status(500).json({error: `Error in isAuthenticated middleware: ${error}`});
    }
}


export const isAdmin = async (req, res, next)=>{
    if(req?.user && req.user.role==='admin'){
        return next();
    }
    return res.status(401).json({error: "Access denied: only admin allowed"});
}