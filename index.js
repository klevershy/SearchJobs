const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({path : 'variables.env'});


const app = express();

// Enabling body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// fields validation
app.use(expressValidator());

// enabling handlebars as view 
app.engine('handlebars', 
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');

// Static files 
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret:process.env.SECRET,
    key:process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection : mongoose.connection})
}));

// initialize Passport

app.use(passport.initialize());
app.use(passport.session());

// Alerts and flash messages
app.use(flash());

// Create our own middleware
app.use((req, res, next) =>{
    res.locals.messages = req.flash();
    next();
});

app.use('/', router());

// 404 page does not exist
app.use((req, res, next) =>{
    next( createError( 404, 'Page does not exist'))  
})

// administrating errors
app.use((error, req, res) =>{
    res.locals.message = error.message;
    const status = error.status || 500;
    res.locals.status = error.status;
    res.status(status)

    res.render('error');
})



// letting heroku to assign a port
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () =>{
    console.log('Server Running')
});