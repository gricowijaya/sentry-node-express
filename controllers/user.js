const imagekit = require('../middlewares/imagekit');
const {User, Media} = require('../db/models');
module.exports = { 
    uploadPicture: async(req, res, next) => { 
        try { 
            if (!req.file) { 
                res.status(500).json({
                    status: "false",
                    message: "cannot get the file",
                    data: null
                });
            }

            // for checking the user who login
            const loggedUser = req.user;

            const file = req.file.buffer.toString('base64');
            const uploadedFile = await imagekit.upload({
                file,
                fileName: req.file.originalname
            });

            await User.create({
                image: uploadedFile.url
            });

            const media = await Media.create({
                filename: uploadedFile.name,
                url: uploadedFile.url,
                user_id: loggedUser.id,
            });

            return res.status(200).json({
                status: "false",
                message: "Successfully upload avatar",
                data: media
            });
        } catch(err) { 
            next(err);
        }
    },

    updatePicture: async(req, res, next) => { 
        try { 
            if (!req.file) { 
                res.status(500).json({
                    status: "false",
                    message: "cannot get the file",
                    data: null
                });
            }

            // for checking the user who login
            const loggedUser = req.user;

            const file = req.file.buffer.toString('base64');
            const uploadedFile = await imagekit.upload({
                file,
                fileName: req.file.originalname
            });

            await User.update({
                image: uploadedFile.url
            }, { where: { id: loggedUser.id } });

            await Media.update({
                filename: uploadedFile.name,
                url: uploadedFile.url,
                user_id: loggedUser.id,
            }, { where: { user_id: loggedUser.id } });

            const data = { 
                filename: uploadedFile.name,
                url: uploadedFile.url,
                user_id: loggedUser.id,
            }

            return res.status(200).json({
                status: "true",
                message: "Successfully update avatar !",
                data: data
            });
        } catch(err) { 
            next(err);
        }
    }
}
