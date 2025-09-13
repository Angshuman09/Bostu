import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is requried"]
    },
    email:{
        type: String,
        required:[true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type: String,
        required:[true, "Password is required"],
        minlength:[6, "Password must be atleast of 6 characters"]
    },
    cartItems:[
        {
            quantity:{
                type:String,
                default:1
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'Product'
            }
        }
    ],

    role:{
        type: String,
        enum: ["customer", "admin"],
        default:"customer"
    }
},{timestamps:true});


userSchema.pre('save',async function (next){
    if(!this.isModified('password')) return next();
    try {
        const salt = bcrypt.getSalt(10);
        this.password =await bcrypt.hash(this.password,salt);
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.comparePassword = async function (password){
    return bcrypt.compare(password, this.password);
}


export const User = mongoose.model('User', userSchema);