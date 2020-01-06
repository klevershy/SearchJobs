const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');


const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    name:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token:String,
    expired: Date,
    image: String
});

// method for hash the passwords 
usersSchema.pre('save', async function(next){
    // if password is already hashed 
    if(!this.isModified('password')) {
        return next();   // stop the execution 
    }
    // if password is not hash
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

// send alert when user already exist
usersSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoError' && error.code === 11000){
        next('Ups!! email already exist')
    }else{
        next(error);
    }
})


// Authenticate User
usersSchema.methods = {
    comparePassword: function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Users', usersSchema);