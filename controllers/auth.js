const googleOauth2 = require('../utils/oauth2/google');
const facebookOauth2 = require('../utils/oauth2/facebook');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');
const userType = require('../utils/enum');
const {
    JWT_SECRET_KEY
} = process.env
module.exports = {
    // controller for login googleOAuth
    google: async (req, res, next) => {
        try {
            // get the google uri code for login with google oauth
            // code is for getting the credential from the google user.
            const code = req.query.code;

            // if there's no code from the google than it'll generate an url and redirect to that url
            if (!code) {
                // generate the url for redirecting
                const url = googleOauth2.generateAuthURL();
                return res.redirect(url);
            }

            // we can get the token
            await googleOauth2.setCredentials(code);

            // after the code above we can get the data user;
            const { data } = await googleOauth2.getUserData();

            // check if user is exists in the database
            const userExists = await User.findOne({ where: { email: data.email } });

            // check if the user is created with the basic account or not
            if (userExists && userExists.user_type == userType.basic) {
                return res.status(400).json({
                    status: false,
                    message: "You have registered with your email, Please login with your email instead",
                    data: null
                });
            }

            // check if the user is created with the facebook account or not
            if (userExists && userExists.user_type == userType.facebook) {
                return res.status(400).json({
                    status: false,
                    message: "You have registered with your facebook account, Please login with your facebook account instead",
                    data: null
                });
            }

            // if the user does not exists than we can create the creds into the database
            if (!userExists) {
                userExists = await User.create({
                    name: [data.given_name, data.family_name].join(' '),
                    email: data.email,
                    user_type: userType.google
                })
            }

            // payload for token
            const payload = {
                id: userExists.id,
                username: userExists.username,
                email: userExists.email,
                user_type: userExists.user_type
            }

            // // create the token
            const token = jwt.sign(payload, JWT_SECRET_KEY);

            // return the token
            return res.status(200).json({
                message: "Successfully Login With Google",
                user_id: userExists.id,
                token
            });

            // if authroized then it's a successful login 
            // res.send('Successful Login') ;
        } catch (err) {
            next(err);
        }
    },

    facebook: async (req, res, next) => {
        try {
            // get the code from facebook
            const code = req.query.code;

            // if there's no code from the google than it'll generate an url and redirect to that url
            if (!code) {
                // generate the url for redirecting
                const url = facebookOauth2.generateAuthURL();
                return res.redirect(url);
            }

            // we can get the token
            const access_token = await facebookOauth2.getAccessToken(code);

            // after the code above we can get the data user;
            const userInfo = await facebookOauth2.getUserInfo(access_token);

            // so we can access the user
            const userExists = await User.findOne({ where: { email: userInfo.email } });

            // check if the user is created with the basic account or not
            if (userExists && userExists.user_type == userType.basic) {
                return res.status(400).json({
                    status: false,
                    message: "You have registered with your email, Please Login with you email instead",
                    data: null
                });
            }

            // check if the user is created with the facebook account or not
            if (userExists && userExists.user_type == userType.google) {
                return res.status(400).json({
                    status: false,
                    message: "You have registered with your google account, Please login with your google account instead",
                    data: null
                });
            }
            // if the user does not exists than we can create the creds into the database
            if (!userExists) {
                userExists = await User.create({
                    name: [userInfo.first_name, userInfo.last_name].join(' '),
                    email: userInfo.email,
                    user_type: userType.facebook
                })
            }

            // payload for token
            const payload = {
                id: userExists.id,
                username: userExists.username,
                email: userExists.email,
                user_type: userExists.user_type
            }

            // // create the token
            const token = jwt.sign(payload, JWT_SECRET_KEY);

            // return the token
            return res.status(200).json({
                message: "Successfully Login With Facebook",
                user_id: userExists.id,
                token
            });

            // if authorized then it's a successful login 
            // return res.send('Successful Login') ;
        } catch (err) {
            next(err);
        }
    },

    register: async (req, res, next) => {
        try {
            const {email, password } = req.body;

            const existUser = await User.findOne({ where: { email: email } });
            if (existUser) {
                return res.status(409).json({
                    status: false,
                    message: 'email already used!'
                });
            }

            const encryptedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                email: email,
                password: encryptedPassword
            });
            
            console.log(user)

            return res.status(201).json({
                status: true,
                message: 'success',
                data: {
                    email: user.email
                }
            });
        } catch (err) {
            // console.log(err);
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'email or password doesn\'t match!'
                });
            }

            const correct = await bcrypt.compare(password, user.password);
            if (!correct) {
                return res.status(400).json({
                    status: false,
                    message: 'email or password doesn\'t match!'
                });
            }

            // generate token
            payload = {
                id: user.id,
                email: user.email,
            };

            const token = jwt.sign(payload, JWT_SECRET_KEY);

            return res.status(200).json({
                status: true,
                message: 'success',
                data: {
                    token: token
                }
            });
        } catch (err) {
            // console.log(err)
            next(err);
        }
    },

    whoami: (req, res, next) => {
        const user = req.user;

        try {
            return res.status(200).json({
                status: false,
                message: 'success',
                data: user
            });
        } catch (err) {
            next(err);
        }
    },
}
