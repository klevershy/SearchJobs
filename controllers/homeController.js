const mongoose = require('mongoose');
const Opening = mongoose.model('Open');


exports.showJobs = async (req, res, next) =>{

    const openings = await Opening.find();

    if(!openings) return next();

    res.render('home', {
        pageName: 'devJobs',
        tagline: 'Find and Public All kind of jobs',
        barra: true,
        boton: true,
        openings
    })
}