const axios = require('axios')
const querystring = require('query-string')
const {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_REDIRECT_URI
} = process.env
module.exports = { 
    generateAuthURL: () => { 
            const params = querystring.stringify({
                client_id: FACEBOOK_APP_ID,
                redirect_uri: FACEBOOK_REDIRECT_URI,
                scope:['email', 'user_friends'].join(','),
                respose_type: 'code',
                auth_type: 'rerequest',
                display:'popup'
            });

        return `https://www.facebook.com/v15.0/dialog/oauth?${params}`;
    },

    // getting the access token from user
    getAccessToken: async(code) => { 
        const { data } = await axios({
            url: `https://graph.facebook.com/v15.0/oauth/access_token`, // get the access token
            method: 'get',
            params: { 
                client_id: FACEBOOK_APP_ID,
                client_secret: FACEBOOK_APP_SECRET,
                redirect_uri: FACEBOOK_REDIRECT_URI,
                code,
            }
            
        });

        // return the access_token from facebook
        return data.access_token
    },

    // get the user info from the graph API.
    getUserInfo: async(accessToken) => { 
        // get the data and return the access token  
        const { data } = await axios({
            url: "https://graph.facebook.com/me", // ref :  https://developers.facebook.com/docs/graph-api/overview there's a section called #/me
            method: 'get', // according to the documentation  we shoudl use the get method
            params: { 
                fields: ['id', 'email', 'first_name', 'last_name', 'user_photos', 'user_friends'].join(','), // the fields we want
                access_token: accessToken, // return the access_token
            }
        });

        return data;
    }
}
