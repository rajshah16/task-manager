const express = require('express')
const cookieParser = require('cookie-parser')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.static('public'))
app.use(express.json()) // This will parse the incoming json to objectid
app.use(userRouter)
app.use(taskRouter)
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.listen(port , ()=>{
    console.log('Server is on port ' + port)
})



