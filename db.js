var mongoose = require('mongoose');

/*
exports.conf = {
    db: {
      db: 'schedulemanager',
      host: 'localhost',
      port: 27017
    },
    secret: '076ee61d63aa10a125ea872411e433b9'
};
*/
/*
exports.conf = {
    db: {
	    username: 'nodejitsu',
	    password: 'dd4345feb48c8882b5f2cdf8890d06a3',
	    db: 'nodejitsudb6760722510',
	    host: 'paulo.mongohq.com',
	    port: 10005
    },
    secret: '076ee61d63aa10a125ea872411e433b9'
};
*/
exports.conf = {
    db: {
	    username: 'nodejitsu_rshkarin2013',
	    password: '44dajvvh29lrpalh8d3vt6ohlr',
	    db: 'nodejitsu_rshkarin2013_nodejitsudb9932981960',
	    host: 'ds045978.mongolab.com',
	    port: 45978
    },
    secret: '076ee61d63aa10a125ea872411e433b9'
};

var dbUrl = 'mongodb://';
dbUrl += this.conf.db.username+':'+this.conf.db.password+'@';
dbUrl += this.conf.db.host+':'+this.conf.db.port;
dbUrl += '/' + this.conf.db.db;

exports.connect = function() {
	mongoose.connect(dbUrl);
	return mongoose.connection;	
}