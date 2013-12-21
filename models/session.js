var mongoose = require('mongoose');

/*
 * Schema
 */
var SessionSchema = mongoose.Schema({
    createdAt: { type: Date, 
                 expires: 3600 },
    userId: { type: String,
              required: true }
});

/*
 * Static methods
 */
SessionSchema.statics.createSession = function (data, callback) {
    var schema = this;
    schema.create({ userId: data }, callback);
};

SessionSchema.statics.isAuthorized = function (sessionId, callback) {
    var schema = this;
    schema.findById(sessionId, function(err, sessionEntry){
        if (sessionEntry)
            callback(null, sessionEntry.userId);
        else
            callback('You are not authorized.', null);
    });
};

var SessionModel = mongoose.model('Session', SessionSchema);
module.exports.Session = SessionModel;