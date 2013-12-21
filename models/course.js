var mongoose = require('mongoose');

/*
 * Schema
 */
var CourseSchema = mongoose.Schema({
    status: String,
    title: String,
    field: String,
    description: String,
    keyWords: Array,
    professor: String,
    students: {type: Array, default: new Array()},
    startDate: Date,
    finishDate: Date
});

/*
 * Static methods
 */
CourseSchema.statics.findAll = function (callback) {
    return this.find().sort({startDate: -1}).exec(callback);
};

CourseSchema.statics.findByObjQuery = function (objQuery, callback) {
    return this.find(objQuery).sort({startDate: -1}).exec(callback);
};

CourseSchema.statics.createCourse = function (body, callback) {
    var schema = this;
    return schema.create(body, callback);
};

CourseSchema.statics.findByProfessorAndRemove = function (professor_id, callback) {
    return this.remove({professor: professor_id}, callback);
};

CourseSchema.statics.findOtherCoursesByProfessor = function (professor_id, callback) {
    //return this.remove({professor: { $ne: professor_id}}, callback);
};


var CourseModel = mongoose.model('Course', CourseSchema);
module.exports.Course = CourseModel;