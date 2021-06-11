const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json()) // This will parse the incoming json to objectid
app.use(userRouter)
app.use(taskRouter)

app.listen(port , ()=>{
    console.log('Server is on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')


