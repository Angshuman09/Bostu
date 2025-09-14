import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = (userId)=>{
    const accessToken = jwt.sign({userId}, process.env.ACCESSTOKEN_SECRET_KEY, {
        expiresIn: '15m'
    })

    const refreshToken = jwt.sign({userId}, process.env.REFRESHTOKEN_SECRET_KEY,{
        expiresIn: '15d'
    })

    return {accessToken, refreshToken};
}


export const SignupController = async (req, res)=>{
   try {
     const {name, email, password} = req.body;
 
     const isexist = await User.findOne({email});
 
     if(isexist) return res.status(400).json({error:"User already exist"});
 
     const newUser = await User.create({
         name, email, password
     })


     res.status(200).json({
        id: newUser._id,
        email: newUser.email,
        name: newUser.name
     }); 
     
   } catch (error) {
    console.log(`server error occur in signup controller: ${error}`);
    res.status(500).json({error:`server error occur in signup controller: ${error}` })
   }
}

export const LoginController = (req, res)=>{
    
}

export const LogoutController = (req, res)=>{
    
}