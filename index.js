const connectToMongo = require("./db")
const express = require('express')
const authController = require('./routes/auth')
const NotesController = require('./routes/notes')
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}


connectToMongo()
const app = express();
const port = process.env.PORT;
app.use(cors(corsOptions))
app.use(express.json());

//Available routes
app.use('/api/auth', authController)
app.use('/api/notes', NotesController)

app.get('/', (req,res) => {
   res.send('Hello World')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
