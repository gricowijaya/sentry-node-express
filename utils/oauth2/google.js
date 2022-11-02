const { google } = require('googleapis');
const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
} = process.env;
const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);
module.exports = { 
    // function to generate auth url 
    generateAuthURL: () => {
        // the scopes is just for getting email and profile
        const scopes = [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ];

        // generate the authUrl
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            response_type: 'code', // this is what we want for login 
            scope: scopes
        });

        return authUrl;
    },

    setCredentials: async(code) => { 
        return new Promise(async (resolve, reject) => {
            try { 
                // we receive the code that we get from the code 
                const { tokens } = await oauth2Client.getToken(code);
                // set credential so we can just call it in the function
                oauth2Client.setCredentials(tokens); 
                return resolve(tokens);
            } catch(err) { 
                return reject(err);
            }
        });
    },

    getUserData: async() => { 
        return new Promise(async (resolve, rejects) => { 
            try { 
                // create the versioning
                var oauth2 = google.oauth2({
                    auth: oauth2Client,
                    version: 'v2'
                });

                // getting the user info
                oauth2.userinfo.get((err, res) => {
                    if (err) { 
                        return rejects(err);
                    } else {
                        return resolve(res);
                    }
                });
            } catch(err) { 
                return rejects(err);
            }
        });
    }
};
