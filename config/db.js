const mongoose = require('mongoose'); //mongoose.set('userCreateIndex', true);
require('dotenv').config({path: 'variables.env'});

mongoose.connect(process.env.DATABASE, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});

mongoose.connection.on('error', (error) =>{
    console.log(error);
});

// importing the models
require('../models/Openings');
require('../models/Users');