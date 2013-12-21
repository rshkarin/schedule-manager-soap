  var soap = require('soap'),
      http = require('http'),
      util = require('util'),
      pw = require('credential'),
      moment = require('moment'),
      db = require('./db').connect(),
      conf = require('./db').conf,
      User = require ('./models/user').User,
      Course = require ('./models/course').Course,
      Session = require ('./models/session').Session,
      us = require('underscore');


  var smService = {
    ScheduleManagerService: {
      ScheduleManagerHttpPort: {
        AuthUser: function(args, callback) {
          User.findByLogin(args.username, function(err, found_user) {
            if (err) { 
              return callback({ state: { statusCode: 403, errors: [err] }, header: null, loggedUser: null}); 
            }

            if (!found_user) { 
              return callback({ state: { statusCode: 403, errors: ['Unknown credentials!'] }, header: null, loggedUser: null});
            }

              pw.verify(found_user.password, args.password, function (err, isValid) {
                if (err) {
                    return callback({ state: { statusCode: 403, errors: [err] }, header: null, loggedUser: null}); 
                }

                if (!isValid) { 
                    return callback({ state: { statusCode: 403, errors: ['Invalid password.'] }, header: null, loggedUser: null});
                }

                Session.createSession(found_user._id.toString(), function(err, sessionEntry) {
                  if (err) {
                    return callback({ state: { statusCode: 403, errors: [err] }, header: null, loggedUser: null}); 
                  }

                  console.log(sessionEntry);
                  console.log(found_user);

                  return callback({ state: { statusCode: 200, errors: null }, 
                                    header: { sessionId: sessionEntry._id.toString() }, 
                                    loggedUser: { 
                                                  _id: found_user._id.toString(),
                                                  firstName: found_user.firstName,
                                                  lastName: found_user.lastName,
                                                  birthDay: found_user.birthDay.toISOString(),
                                                  degree: found_user.degree,
                                                  universityName: found_user.universityName,
                                                  groupNumber: found_user.groupNumber,
                                                  personalId: found_user.personalId,
                                                  userGroup: found_user.userGroup
                                                }});
                });
              });
          });  
        },

        GetCourses: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            User.findById(userId, function(err, user) {
              var view_function = '',
                  args = {};

              var queryObj = new Object();

              if (!user || user.userGroup == 'Student') {
                  queryObj["status"] = new Object();
                  queryObj["status"]["$ne"] = "None";
              }
              else if (user.userGroup == 'Professor') {
                  queryObj["professor"] = user._id.toString();
              }
              else {
              }

              Course.findByObjQuery(queryObj, function(err, courses) {
                var courses_new = new Array();
                for (var i = 0; i < courses.length; ++i) {
                  courses_new.push({ 
                    _id: courses[i]._id.toString(),
                    status: courses[i].status,
                    title: courses[i].title,
                    field: courses[i].field,
                    description: courses[i].description,
                    keyWords: courses[i].keyWords,
                    professor: courses[i].professor,
                    students: courses[i].students,
                    startDate: courses[i].startDate.toISOString(),
                    finishDate: courses[i].finishDate.toISOString()
                  });
                }

                return callback({ state: { statusCode: 200, errors: null }, courses: courses_new })
              });
            });
          });
        },

        UpdateCourse: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            var errArr = new Array();

            if (us.isEmpty(args.course['title'])) {
              errArr.push('Please enter a valid title of course');
            }

            if (us.isEmpty(args.course['startDate'])) {
              errArr.push('Please enter a valid start date of course');
            }

            if (us.isEmpty(args.course['finishDate'])) {
              errArr.push('Please enter a valid start date of course');
            }

            if (errArr.length) {
                return callback({ state: { statusCode: 400, errors: errArr } })
            }
            else {



              Course.update({ _id: args.course._id }, { title: args.course.title,
                                                       field: args.course.field,
                                                       description: args.course.description,
                                                       keyWords: args.course.keyWords,
                                                       startDate: new Date(args.course.startDate),
                                                       finishDate: new Date(args.course.finishDate)}, function(err) {
                console.log(args.course.keyWords);
                if (err) {
                  console.log(err);
                  return callback({ state: { statusCode: 500, errors: [err] } });
                }

                return callback({ state: { statusCode: 200, errors: null }})
              });
            }
          });
        },

        CreateCourse: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            var errArr = new Array();

            if (us.isEmpty(args.course['title'])) {
              errArr.push('Please enter a valid title of course');
            }

            if (us.isEmpty(args.course['startDate'])) {
              errArr.push('Please enter a valid start date of course');
            }

            if (us.isEmpty(args.course['finishDate'])) {
              errArr.push('Please enter a valid start date of course');
            }

            if (us.isEmpty(args.course['professor'])) {
              errArr.push('Please enter a valid professor for this course');
            }

            if (us.isEmpty(args.course['status'])) {
              errArr.push('Please enter a valid status');
            }

            if (errArr.length) {
                callback({ state: { statusCode: 400, errors: errArr } });
            }
            else {
              Course.createCourse({ status: args.course.status,
                                    title: args.course.title,
                                    field: args.course.field,
                                    description: args.course.description,
                                    keyWords: args.course.keyWords,
                                    professor: args.course.professor,
                                    startDate: new Date(args.course.startDate),
                                    finishDate: new Date(args.course.finishDate)}, function (err) {
                if (err) {
                  return callback({ state: { statusCode: 500, errors: [err] } });
                }
                
                return callback({ state: { statusCode: 200, errors: null } });
              });
            }
          });
        },

        DeleteCourseById: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            Course.findByIdAndRemove(args.courseId, function(err, deletedCourse) {
              if (err) {
                return callback({ state: { statusCode: 500, errors: [err] } });
              }

              if (!deletedCourse) {
                return callback({ state: { statusCode: 202, errors: null } });
              }

              return callback({ state: { statusCode: 200, errors: null } });
            });
          });
        },

        SubscribeCourseById: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            Course.update({ _id: args.courseId }, { $push: { students: userId }  }, function(err) {
              if (err) {
                return callback({ state: { statusCode: 500, errors: [err] } });
              }

              return callback({ state: { statusCode: 200, errors: null } });
            });
          });
        },

        UnsubscribeCourseById: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            Course.update({ _id: args.courseId }, { $pull: { students: userId }  }, function(err) {
              if (err) {
                return callback({ state: { statusCode: 500, errors: [err] } });
              }

              return callback({ state: { statusCode: 200, errors: null } });
            });
          });
        },

        GetStudents: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            User.findByUserGroup('Student', function(err, users) {
              if (err) {
                return callback({ state: { statusCode: 500, errors: [err] } });
              }

              var users_new = new Array();
                for (var i = 0; i < users.length; ++i) {
                  users_new.push({ 
                    _id: users[i]._id.toString(),
                    firstName: users[i].firstName,
                    lastName: users[i].lastName,
                    birthDay: users[i].birthDay.toISOString(),
                    degree: users[i].degree,
                    universityName: users[i].universityName,
                    groupNumber: users[i].groupNumber,
                    personalId: users[i].personalId,
                    userGroup: users[i].userGroup
                  });
                }

                return callback({ state: { statusCode: 200, errors: null }, users: users_new });
            });
          });
        }, 

        GetUserById: function(args, callback) {
          Session.isAuthorized(args.header.sessionId, function(err, userId){
            if (err) {
              return callback({ state: { statusCode: 403, errors: [err] } });
            }

            User.findById(args.userId, function(err, foundedUser) {
              if (err) {
                return callback({ state: { statusCode: 500, errors: [err] } });
              }

              return callback({ state: { statusCode: 200, errors: null },
                                 user: { _id: foundedUser._id.toString(),
                                        firstName: foundedUser.firstName,
                                        lastName: foundedUser.lastName,
                                        birthDay: foundedUser.birthDay.toISOString(),
                                        degree: foundedUser.degree,
                                        universityName: foundedUser.universityName,
                                        groupNumber: foundedUser.groupNumber,
                                        personalId: foundedUser.personalId,
                                        userGroup: foundedUser.userGroup } });
            });
          });
        }
      }
    }
  }

  var xml = require('fs').readFileSync('wsdl/Service.wsdl', 'utf8'),
      server = http.createServer(function(request,response) {
          response.end("404: Not Found: " + request.url)
      });

  server.listen(8000);
  soap.listen(server, '/ScheduleManager', smService, xml);