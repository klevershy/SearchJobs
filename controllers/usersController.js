const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const multer = require('multer');
const shortid = require('shortid');

// upload images
exports.uploadImage = (req, res, next) =>{
    upload (req, res, function(error){
        
        if(error){
          
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'Ups, File is too large, maximum 100kb')
                   
                }else {
                    req.flash('error', error.message);
                }
            }else {
                req.flash('error', error.message);
            }
            res.redirect('/administration');
            return ;
        } else {
            return next();
        }        
    });
}


// Multer Options
const configurationMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, __dirname+'../../public/uploads/profiles');
        },
        filename: (req, file, cb) =>{
            
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            // execute the callback as TRUE or FALSE: true when image is accepted
            cb(null, true);
        } else {
            cb(new Error('invalid file format'), false);
        }
    }  
}

const upload = multer(configurationMulter).single('image');

// create account form
exports.createAccountForm = (req, res) =>{
    res.render('create-account',{
        pageName: 'Create your Account in devJobs',
        tagline: 'Start to publish yours post for hiring, just create an account'
    });
}


exports.validateRegister = async(req, res, next) =>{

    // sanitize 
    req.sanitizeBody('name').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirm').escape();
    
    // validate
    req.checkBody('name', 'name is required').notEmpty();
    req.checkBody('email', 'valid email is required').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('confirm', 'confirm password is required').notEmpty();
    req.checkBody('confirm', 'Password is different').equals(req.body.password);

    const errors = req.validationErrors();

    if(errors){
        // if there are errors
        req.flash('error', errors.map(error => error.msg));

        res.render('create-account', {
            pageName: 'Create your Account in devJobs',
            tagline: 'Start to publish yours post for hiring, just create an account',
            messages: req.flash()
        });
        return;
    }

    // if everything is ok
    
    next();
}

exports.createUser = async(req, res, next) =>{
    // create user into DB

    const user = new Users(req.body);

    try {
        await user.save();
        res.redirect('/login');
    } catch(error){
        req.flash('error', error);
        res.redirect('/create-account');
    }    
}

// form to login
exports.loginForm =  (req, res) =>{
    
    res.render('log-In', {
        pageName: "Login into devJobs"

    })
}

// Form for edit profile
exports.editProfileForm = (req, res) =>{
    res.render('edit-profile', {
        pageName: 'Edit your Open Position in devJobs',
        user: req.user,
        closeLogout: true,
        name: req.user.name,
        image: req.user.image
    });
}

// save changes on edit profile
exports.editProfile = async (req, res) =>{
    const user = await Users.findById(req.user._id);
    
    user.name = req.body.name;
    user.email = req.body.email;
        if(req.body.password) {
            user.password = req.body.password
        }

       if(req.file){
           user.image = req.file.filename;
       }
     
        await user.save();

        req.flash('correcto', 'Changes saved correctly!!');

    // redirect 
    res.redirect('/administration');
}

// Sanitize And validate edit profile form
exports.validateProfile = (req, res, next) =>{
    // sanitize
    req.sanitizeBody('name').escape();
    req.sanitizeBody('email').escape();
        if(req.body.password){
            req.sanitizeBody('password').escape();
        }
        // validate
        req.checkBody('name', 'Name field is required').notEmpty();
        req.checkBody('email', 'Email field is required').notEmpty();

        const errors = req.validationErrors();

        if (errors){
            req.flash('error', errors.map(error => error.msg));

            res.render('edit-profile', {
                pageName: 'Edit your Open Position in devJobs',
                user: req.user,
                closeLogout: true,
                name: req.user.name,
                image:req.user.image,
                messages: req.flash()
            });
        }
        next(); // everything is ok, next middleware
}

