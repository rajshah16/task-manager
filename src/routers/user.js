const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const { sendWelcomeEmail , sendCancelEmail} = require('../emails/account')

router.post('/users' , async (req,res)=>{
    const user = new User(req.body)
    /*
    Await is used to handle a function which returns the promise 
    Here save method returns the promise so await is used 
    
    */
    try{
        await user.save()
        sendWelcomeEmail(user.email , user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user , token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/users/login' , async (req, res) =>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token})
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout' , auth , async (req,res)=>{
    try{
        // Here filter will return an array that will contain the token which is not used by user
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll' , auth , async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }   
})  

router.get('/users/me' , auth , async (req,res)=>{
    res.send(req.user)
})

router.patch('/users/me', auth , async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me' , auth ,async (req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancelEmail(req.user.email , req.user.name)
        res.send(req.user)
    }
    catch(e){
        res.status(500).send()
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        // The below condition is regular expression
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload the images"))
        }

        cb(undefined , true)
    }
})

// Here in single we are using the keyword with which the image is uploaded from postman
router.post('/users/me/avatar' , auth , upload.single('avatar') , async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({ width:250 , height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
} , (error,req,res,next)=>{
    // Handling the error
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar' , auth , async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar' , async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        // It will send the type of the file
        /*
        Here below sets the headers in order to know the type of response
        */
        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
    
})

module.exports = router 