const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require ('cors');
const AuthRouter = require('./Routes/AuthRouters');

require('dotenv').config();
require ('./Models/db');
const PORT = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
    res.send('PONG'); 
});

app.use(bodyParser.json());
app.use(cors());                         //alow requests from other Ports
app.use('/auth', AuthRouter)

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})



//28 