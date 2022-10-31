const express = require('express');
const router = express.Router();
const storage = require('../middlewares/storage');

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
