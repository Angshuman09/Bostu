import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import {redis} from '../lib/redis.js'
const generateAccessAndRefreshToken = (userId)=>{
    const accessToken = jwt.sign({userId}, process.env.ACCESSTOKEN_SECRET_KEY, {
        expiresIn: '15m'
    })

    const refreshToken = jwt.sign({userId}, process.env.REFRESHTOKEN_SECRET_KEY,{
        expiresIn: '15d'
    })

    return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken)=>{
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 15*24*60*60);
}

const setCookies = (res, accessToken, refreshToken) =>{
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 15*60*1000
    });

    res.cookie('refreshToken', refreshToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 15*24*60*60*1000
    });
};


export const SignupController = async (req, res)=>{
   try {
     const {name, email, password} = req.body;
 
     const isexist = await User.findOne({email});
 
     if(isexist) return res.status(400).json({error:"User already exist"});

     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
     if(!emailRegex.test(email)) return res.status(400).json({error:"Not a valid email"});

     const newUser = await User.create({
         name, email, password
     })

     const {accessToken, refreshToken} = generateAccessAndRefreshToken(newUser._id);
     await storeRefreshToken(newUser._id, refreshToken);

     setCookies(res, accessToken, refreshToken);

     res.status(200).json({
         user:{
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role:newUser.role
     },
     message: "account created successfully"
   }); 
     
   } catch (error) {
    console.log(`server error occur in signup controller: ${error}`);
    res.status(500).json({error:`server error occur in signup controller: ${error}` })
   }
}

export const LoginController =async (req, res)=>{
    try {
       const {email, password} = req.body;
       const user = await User.findOne({email});
       if(user && (await user.comparePassword(password))){
        const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(200).json({
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
       }
       else{
        res.status(400).json({message: "Invalid email or password"});
       }
    } catch (error) {
    console.log(`server error occur in Login controller: ${error}`);
    res.status(500).json({error:`server error occur in Login controller: ${error}` })
    }  
}

export const LogoutController =async (req, res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET_KEY);
            await redis.del(`refresh_token:${decoded.userId}`);

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.json({message:"Logged out successfully"});
        }
    } catch (error) {
    console.log(`server error occur in Logout controller: ${error}`);
    res.status(500).json({error:`server error occur in Logout controller: ${error}` })
    }
}

export const refreshToken = async (req, res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(404).json({error: "refresh token not found"});

        const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET_KEY);

        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if(storedToken != refreshToken){
            return res.status(401).json({error: "Invalid refresh token"});
        }

        const accessToken = jwt.sign({userId:decoded.userId}, process.env.ACCESSTOKEN_SECRET_KEY,{
           expiresIn: '15m'
        })

        res.cookie('accessToken', accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: 'strict',
            maxAge: 15*60*1000
        })

        res.json({message: "token refresh successfully"});

    } catch (error) {
    console.log(`server error occur in refresh token controller: ${error}`);
    res.status(500).json({error:`server error occur in refresh token controller: ${error}` })
    }
}

export const getProfile = async (req, res)=>{
    try {
        res.json(req.user);
    } catch (error) {
        console.log(`server error occur in get profile controller: ${error}`);
        res.status(500).json({error:`server error occur in get profile controller: ${error}` })
    }
}