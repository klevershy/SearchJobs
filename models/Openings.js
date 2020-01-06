const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

const openingsSchema = new mongoose.Schema({
    title:{
        type: String,
        required: 'Opening field is required',
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    location:{
        type: String,
        trim: true,
        required: 'Location field is required'
    },
    salary:{
        type: String,
        default: 0,
        trim: true
    },
    term: {
        type: String, 
        trim: true      
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidates: [{
        name: String,
        email: String,
        phone: String,
        cv: String
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: 'Author is required'
    }
});

openingsSchema.pre('save', function(next){
    // create url
    const url = slug(this.title);
    this.url = `${url}-${shortid.generate()}`;

    next();
});

// create an index
openingsSchema.index({ title: 'text' });


module.exports = mongoose.model('Open', openingsSchema);

