const { Schema } = require('mongoose');
const connections = require('../../config/connection');

const UserSchema = new Schema({
    // email: {
    //     type: String,
    //     required: true,
    // },

    id: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        require: false,
        default: null,
    },
    id_type: {
        type: String,
        require: false,
    },

}, {
    collection: 'authUserModel',
    versionKey: false,
}, );

module.exports = connections.model('AuthUserModel', UserSchema);
