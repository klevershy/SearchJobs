const passport = require('passport');
const mongoose = require('mongoose');
const Opening = mongoose.model('Open');
const Users = mongoose.model('Users');
const crypto = require('crypto');
const sendEmail = require('../handlers/email');

exports.authenticateUser = passport.authenticate('local', {
    successRedirect: '/administration',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Both fields are required'
})

// Check if user is authenticated or NOT
exports.verifyUser = (req, res, next) =>{
    
    // check user
    if(req.isAuthenticated()){
        return next(); // user is authenticated
    }
    // redirect
    res.redirect('/login');
}


exports.showPanel = async(req, res) =>{

    // consult the authenticated user
    const openings = await Opening.find({ author: req.user._id});

     res.render('administration', {
         pageName: 'Administration Panel',
         tagline: 'Create and Administrate your opening positions from here',
         closeLogout: true,
         name: req.user.name,
         image: req.user.image,
         openings
     })
}


// Logout 
exports.logout = (req, res) =>{
    req.logout();
    req.flash('correcto', 'You have LogOut correctly ');

    return res.redirect('/login');
}

// Reset password form

exports.resetPasswordForm = (req, res) =>{
    res.render('reset-password', {
        pageName: 'Reset your password',
        tagline: 'Please follow the instructions to reset your password'
    });   
}


// Generate Token in the User Table
exports.sendToken = async(req, res) =>{
   const user = await Users.findOne({ email: req.body.email});
   
   if(!user){
       req.flash('error', 'the user does not exist');
       return res.redirect('/login');
    }

    // The user exist, generate Token
    user.token = crypto.randomBytes(20).toString('hex');
    user.expired = Date.now() + 3600000;

    // save the user
    await user.save();
    const resetUrl = `http://${req.headers.host}/reset-password/${user.token}`;

 

    //  : send notification by email
    await sendEmail.send({
        user,
        subject: 'Password reset',
        resetUrl,
        file: 'reset'
    });

    // everything ok
    req.flash('correcto', 'Check your email and follow the instructions');
    res.redirect('/login');
}


// validate if token and user exist, show the view
exports.resetPassword = async(req, res) =>{
    const user = await Users.findOne({
        token: req.params.token,
        expired: {
            $gt: Date.now()
        }
    });

    if(!user){
        req.flash('error', 'The form is not valid, try again!!');
        return res.redirect('/reset-password');
    }

    // Everything ok, show the form
    res.render('new-password', {
        pageName : 'New Password'
    });
}

// save new password into DB
exports.savePassword = async(req, res) =>{
    const user = await Users.findOne({
        token: req.params.token,
        expired: {
            $gt: Date.now()
        }
    });

    // user do not exist or token is invalid
    if(!user){
        req.flash('error', 'The form is not valid, try again!!');
        return res.redirect('/reset-password');
    }

    // saving new password, clean previous values
    user.password = req.body.password;
    user.token = undefined;
    user.expired = undefined;

    // add and eliminate values from the object;
    await user.save();

    // redirect
    req.flash('correcto', 'Password modified correctly ');
    res.redirect('/login');
}
