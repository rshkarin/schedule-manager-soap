var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator');

/*
 * Schema
 */
var UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDay: Date,
    degree: String,
    universityName: String,
    groupNumber: String,
    personalId: String,
    userGroup: String,
    login: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

/*
 * Static methods
 */
UserSchema.statics.findAll = function (callback) {
    return this.find({userGroup: userGroup}).sort('lastName').exec(callback);
};

UserSchema.statics.findByUserGroup = function (userGroup, callback) {
    return this.find({userGroup: userGroup}).sort('lastName').exec(callback);
};

UserSchema.statics.findByLogin = function (login, callback) {
    return this.findOne({login: login}, callback);
};

UserSchema.statics.findByIds = function (ids, callback) {
    return this.find({ _id: { $in: ids}}, callback);
};

UserSchema.statics.createUser = function (body, callback) {
    var schema = this;
    schema.create(body, callback);
};

UserSchema.plugin(uniqueValidator, { mongoose: mongoose });

var UserModel = mongoose.model('User', UserSchema);
module.exports.User = UserModel;