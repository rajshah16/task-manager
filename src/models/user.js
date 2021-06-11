const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    } ,
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter the proper email id")
            }
        }
    },
    age:{
        type:Number,
        default: 0 ,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    } , 
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("Pls enter a unique password")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }] ,
    avatar:{
        type:Buffer
    }
} , {
    timestamps:true
})

/*
This toJSON property will virtually set the output send to the user 
toJSON is called always when strigify is used 
*/
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

/*
Normal methods are accessible on the instances as the below method is written 
After the user login so we will run the method on individual instance
*/
userSchema.methods.generateAuthToken = async function(){
    const user = this
    // Below it is done to convert the ObjectID into the normal String
    const token = jwt.sign({_id : user._id.toString()} , process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// Static methods are accessible Model methods
userSchema.statics.findByCredentials = async (email , password)=>{
    const user = await User.findOne({email: email})
    if(!user){
        throw new Error("Unable to login")
    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user
}

// Virtual property is not stored in the database it is used to poulte the stuffs
userSchema.virtual('tasks' , {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

// Hash the plain text into password 
userSchema.pre('save' , async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8)
    }
    next()
})

// Delete the task when user is deleted
userSchema.pre('remove' , async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})

    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User