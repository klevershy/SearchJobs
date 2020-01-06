const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const openingsController = require('../controllers/openingsController');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');


module.exports = () =>{
    router.get('/', homeController.showJobs);

    // create Openings
    router.get('/openings/new',
        authController.verifyUser, 
        openingsController.newOpeningForm
    );
    router.post('/openings/new', 
        authController.verifyUser,
        openingsController.validateOpening,
        openingsController.addOpening
    );

    // Show an opening position (just one)
    router.get('/openings/:url', openingsController.showOpening);    

    // Edit Open position
    router.get('/openings/edit/:url', 
        authController.verifyUser,
        openingsController.editOpenFormPosition 
    );
    router.post('/openings/edit/:url',
        authController.verifyUser,
        openingsController.validateOpening,
        openingsController.editOpening
    );

    // Eliminate Opening Position
    router.delete('/openings/eliminate/:id', 
        openingsController.eliminateOpening
    );

    // create Accounts
    router.get('/create-account', usersController.createAccountForm);
    router.post('/create-account',
        usersController.validateRegister, 
        usersController.createUser);

    // authenticate users

    router.get('/login', usersController.loginForm);
    router.post('/login', authController.authenticateUser);

    // close session
    router.get('/logout', 
        authController.verifyUser,
        authController.logout
    );

    // Reset Password (emails)
    router.get('/reset-password', authController.resetPasswordForm);
    router.post('/reset-password', authController.sendToken);

    //Reset Password(Store in DB);
    router.get('/reset-password/:token', authController.resetPassword);
    router.post('/reset-password/:token', authController.savePassword)


    // administration panel
    router.get('/administration', 
        authController.verifyUser,
        authController.showPanel
    );
  
    // edit profile
    router.get('/edit-profile',
        authController.verifyUser, 
        usersController.editProfileForm
    );
    router.post('/edit-profile', 
        authController.verifyUser,
        // usersController.validateProfile,
        usersController.uploadImage,
        usersController.editProfile
    );

    // receive Candidate Messages
    router.post('/openings/:url', 
        openingsController.uploadCV,
        openingsController.contact
    );

    //  Show candidates by open position 
    router.get('/candidates/:id', 
        authController.verifyUser,
        openingsController.showCandidates
    );

    // search for opening positions

    router.post('/search', openingsController.searchOpenings);

    return router;
}

