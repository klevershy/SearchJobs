const mongoose = require('mongoose');
const Opening = mongoose.model('Open');

const multer = require('multer');
const shortid = require('shortid');

exports.newOpeningForm = (req, res) =>{
    res.render('new-openPosition', {
        pageName: 'New Open Position',
        tagline: 'Fill out the form and publish the Open Position',
        closeLogout: true,
        name: req.user.name,
        image: req.user.image

    });
}

// ADD OPENINGS to the DB

exports.addOpening = async (req, res) =>{
    const opening = new Opening(req.body);

    // user author of the opening
    opening.author = req.user._id;

    // create arr skills 
    opening.skills = req.body.skills.split(',');
  
    // save to DB
    const newOpening = await opening.save();

    // redirect 
    res.redirect(`/openings/${newOpening.url}`);
}

// Show single Open Position 
exports.showOpening = async(req, res, next) =>{
    const opening = await Opening.findOne({ url: req.params.url}).populate('author');

    // if no results
    if(!opening) return next();

    res.render('open', {
        opening,
        pageName: opening.title,
        barra: true       
    });
}

// edit open position 
exports.editOpenFormPosition = async(req, res, next) =>{
    const opening = await Opening.findOne({ url: req.params.url});

    if(!opening) return next();

    res.render('edit-opening', {
        opening,
        pageName: `Edit - ${opening.title}`,
        closeLogout: true,
        name: req.user.name,
        image: req.user.image
        
    })
}

exports.editOpening = async(req, res) =>{
    const openingUpdated = req.body;
    
    openingUpdated.skills = req.body.skills.split(',');

    const opening = await Opening.findOneAndUpdate({ url: req.params.url}, 
        openingUpdated, {
            new: true,
            runValidators: true
        });
    
    res.redirect(`/openings/${opening.url}`);
} 


// Validate & sanitize fields from new openings
exports.validateOpening = (req, res, next) =>{

    // sanitize fields
    req.sanitizeBody('title').escape();
    req.sanitizeBody('company').escape();
    req.sanitizeBody('location').escape();
    req.sanitizeBody('salary').escape();
    req.sanitizeBody('term').escape();
    req.sanitizeBody('skills').escape();

    // validate
    req.checkBody('title', 'Add a title to the Opening').notEmpty();
    req.checkBody('company', 'Add a company').notEmpty();
    req.checkBody('location', 'Add a location').notEmpty();
    req.checkBody('term', 'Select a type of contract').notEmpty();
    req.checkBody('skills', 'Add at least one skill').notEmpty();

    const errors = req.validationErrors();

    if(errors){
        // reload the errors view
        req.flash('error', errors.map(error => error.msg));

        res.render('new-openPosition', {
            pageName: 'New Open Position',
            tagline: 'Fill out the form and publish the Open Position',
            closeLogout: true,
            name: req.user.name,
            messages : req.flash()
    })
 }
 next(); // next middleware
}

// eliminate opening 
exports.eliminateOpening = async(req, res) =>{
    const {id} = req.params;

    const opening = await Opening.findById(id);
    
    if(verifyAuthor(opening, req.user)){
        // everything ok, user can eliminate 
        opening.remove();
        res.status(200).send('Open Position Deleted Correctly');
    }else{
        // no authorize to delete 
        res.status(403).send('error')
    }

    
}

const verifyAuthor = (opening ={}, user ={}) =>{
    if(!opening.author.equals(user._id)){
        return false
    }
    return true;
} 

// upload candidates message

exports.uploadCV = (req, res, next) =>{
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
            res.redirect('back');
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
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) =>{
            
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf' ){
            // execute the callback as TRUE or FALSE: true when image is accepted
            cb(null, true);
        } else {
            cb(new Error('invalid file format'));
        }
    }  
}

const upload = multer(configurationMulter).single('cv');

// Store candidates into DB
exports.contact = async(req, res, next) =>{
    
    const opening = await Opening.findOne({ url: req.params.url});
    
        // if opening does not exist
        if(!opening) return next();

        // If everything OK, build the new object
        const newCandidate ={
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            cv: req.file.filename
        }

        // store the Opening
        opening.candidates.push(newCandidate);
        await opening.save();

        // message flash and redirect
        req.flash('correcto', 'Curriculum sent correctly');
        res.redirect('/');
}

exports.showCandidates = async(req, res, next) =>{
    const opening = await Opening.findById(req.params.id);
    
    if(opening.author != req.user._id.toString()){
        return next();
    }

    if(!opening) return next();

    res.render('candidates', {
        pageName: `Candidates for Open Position - ${opening.title}`,
        closeLogout: true,
        name: req.user.name,
        image: req.user.image,
        candidates: opening.candidates
    })
}

// search Openings
exports.searchOpenings = async(req, res) =>{
    const openings = await Opening.find({
        $text:{
            $search : req.body.q
        }
    });
   
    // show openings
    res.render('home', {
        pageName: `results for ${req.body.q}`,
        barra: true,
        openings
    })
}