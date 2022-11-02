require('dotenv').config();
const ImageKit = require('imagekit');
const {
    IMAGE_KIT_PUBLIC_KEY,
    IMAGE_KIT_PRIVATE_KEY,
    IMAGE_KIT_URL_ENDPOINT
} = process.env
var imagekit = new ImageKit({
    publicKey : IMAGE_KIT_PUBLIC_KEY,
    privateKey: IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint : IMAGE_KIT_URL_ENDPOINT
});

module.exports = imagekit;
