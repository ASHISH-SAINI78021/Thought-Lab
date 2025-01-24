require("dotenv").config();
const express = require("express");
const router = require('./route.js');
const DbConnect = require('./database.js');
const path = require("path");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const loadModals = require("./helper/loadModals.js");
const app = express();


app.use(cookieParser()); // It is used to use req.cookies in middleware

const corsOption = {
    origin : ['http://localhost:5173'] ,
    credentials : true
}

app.use(cors(corsOption));
loadModals();


// if a url starts with '/storage' then server storage folder acts as static folder
app.use("/storage" , express.static('storage'));

const PORT = process.env.PORT || 5500;
DbConnect();

app.use('/models' , express.static(path.join(__dirname , 'public' , 'models')));
app.use(express.json({limit : '8mb'})); // allow upto 8mb file -> to solve payload too large error
app.use(router);

app.get("/" , (req , res)=> {
    console.log("App is working fine");
    res.send("App is working fine");
});

app.listen(PORT , ()=> {
    console.log(`Listening on Port ${PORT}`);
});

