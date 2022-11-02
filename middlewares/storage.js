const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    // destination of the file uploads
    destination: (req, file, callback) => {
        callback(null, '../public/images')
    },
    // we want to generate new name with Date and the real name  
    filename: (req, file, callback) => {
        // const nameFile = Date.now() + '-' + path.extname(file.originalname); 
        const nameFile = `${Date.now()}-${file.originalname}`; 
        callback(null, nameFile);
    }
});

// here is the upload middleware we should use this when we want to create a handler for any upload controller  
const upload =  multer({
    storage: storage,
    // filter the file
    fileFilter: (req, file, callback) => {
        // check the mimetype if we accept then we return callback true 
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') { 
            callback(null, true)
        } else {
            const err = new Error(`Only PNG JPG and JPEG file`);
            // if we don't accept then we return callback err
            callback(null, err);
        }
    },
    onError: (err, next) => { 
        next(err);
    }
})

module.exports = upload;
