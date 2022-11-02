const express = require('express');
const router = express.Router();
const storage = require('../middlewares/storage');
const multer = require('multer');
const upload = multer();
const auth = require('../controllers/auth');
const middlewares = require('../middlewares/index');
const user = require('../controllers/user');

// login endpoint /api/auth/login
// router.get('/api/auth/login/google', auth.google);
// router.get('/api/auth/login/facebook', auth.facebook);

router.post('/api/auth/register', auth.register);
router.post('/api/auth/login', auth.login);
router.get('/api/auth/whoami', middlewares.mustLogin, auth.whoami);

// use the post method for upload single file
router.post('/upload/imagekit', middlewares.mustLogin, upload.single('media'), user.uploadPicture);

// use the put method for update a  single file
router.put('/update/imagekit', middlewares.mustLogin, upload.single('media'), user.updatePicture);

// use the post method for upload single file
router.post('/upload/single', storage.single('media'), (req, res) => {
    // return res.json(req.file);
    const imageUrl = req.protocol + "://" + req.get('host') + "/images/" +  req.file.filename;
    return res.status(200).json({
        url: imageUrl
    });
});

// use the post multiple file
router.post('/upload/multiple', storage.array('media'), (req, res, next) => {
    try { 
        // return res.json(req.files);
        // create an array of files.
        const files = [];
        req.files.forEach(file => {
            const imageUrl = req.protocol + "://" + req.get('host') + "/images/" +  req.file.filename;
            file.push(imageUrl);
        });

        return res.status(200).json({
            files
        })
    } catch(err) { 
        next(err)
    }
});

module.exports = router;
