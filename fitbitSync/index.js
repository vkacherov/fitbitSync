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

	var timeStamp = new Date().toISOString();
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

		// Authenticate the app
		auth(app, context);

		// Get the data
		//exportCsv(context, app);

		context.log('JavaScript timer trigger function ran!', timeStamp);

		context.done();
};