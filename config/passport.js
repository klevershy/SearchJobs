const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

passport.use( new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    }, async (email, password, done) => {
        const user = await Users.findOne({ email });

        if(!user) return done(null, false, {
            message: 'User does not Exist'
        });

        // if the user exist, we go to verify him 
        const verifyPass = user.comparePassword(password);
        if(!verifyPass) return done(null, false, {
            message: 'Password incorrect'
        });

        // user exist and password is correct
        return done(null, user);

    }));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) =>{
    const user = await Users.findById(id).exec();
    return done(null, user);
});

module.exports = passport;