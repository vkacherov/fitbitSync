/**
 * Azure Function that is periodically invoked to synchronize the Fitbit 
 * user telemetry with the data store on Azure. The function retrieves 
 * the Fitbit user telemetry for the user up to the current time 
 * period 
 *
 * @param  context - execution context of the function  
 * @param event - Azure function object containing event data 
 */

module.exports = function (context, myTimer) {
	"use strict";

	const express = require('express'),
		app = express(),
		path = require('path'),
		connect = require('connect'),
		traverse = require('traverse'),
		moment = require('moment'),
		_ = require('lodash'),
		_inRange = require('lodash.inrange'),
		getConfig = require('./getConfig'),
		exportCsv = _.curry(require('./exportCsv'))(app),
		auth = require('./auth'),
		passport = require('passport');
		
		app.use(connect.cookieParser());
		app.use(connect.session({secret: getConfig(app).sessionSecret}));
		app.use(passport.initialize());
		app.use(passport.session());

		app.get('/', function(req, res, next) {
			var userPath = ['session', 'passport', 'user'],
				traverseReq = traverse(req),
				userExists = traverseReq.has(userPath),
				user = userExists && traverseReq.get(userPath);

			res.json({
				user
			});
			var timeStamp = new Date().toISOString();
			context.log('User: ', user);
		});

		app.get('/diagnostics.json', function(req, res) {
			res.json({
				appVersion, 
				nodeJsVersion: process.version
			});
		});

		app.get('/export.csv', exportCsv);

		app.get('/auth-error', (req, res) => {
			var errorMsg = 'Authenticating with FitBit failed.';
			res.status(500);
			res.json(errorMsg);
			context.log(errorMsg);
		});

		app.use((err, req, res, next) => {
			if (err) {
				res.status(500);
				//res.render('error.ejs', {err, isFitbitProblem: _inRange(err.statusCode, 500, 600)});
			}
		});

		auth(app);

		var timeStamp = new Date().toISOString();
		context.log('JavaScript timer trigger function ran!', timeStamp);

		context.done();
};