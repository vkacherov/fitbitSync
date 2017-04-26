/**
 * Azure Function that is periodically invoked to synchronize the Fitbit 
 * user telemetry with the data store on Azure. The function retrieves 
 * the Fitbit user telemetry for the user up to the current time 
 * period 
 *
 * @param  context - execution context of the function  
 * @param event - Azure function object containing event data 
 */
"use strict";

var timeStamp = new Date().toISOString();
const createHandler = require("azure-function-express").createHandler,
	express = require('express'),
	app = express(),
	path = require('path'),
	connect = require('connect'),
	traverse = require('traverse'),
	moment = require('moment'),
	_ = require('lodash'),
	_inRange = require('lodash.inrange'),
	getConfig = require('./getConfig'),
	config = getConfig(app),
	exportCsv = _.curry(require('./exportCsv'))(app),
	passport = require('passport'),
	callbackPath = '/auth/fitbit/callback',
	passport = require('passport'),
	url = require('url'),
	FitbitOAuth2Strategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy;
	
app.use(connect.cookieParser());
app.use(connect.session({secret: getConfig(app).sessionSecret}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

const callbackUrl = url.format({
	protocol: 'http',
	host: config.host,
	port: config.port,
	pathname: callbackPath
});

// Authenticate the app
app.get('/auth/fitbit', (req, res) => {
	req.context.log('Auth fitbit cloud init', timeStamp);
	passport.authenticate('fitbit', { 
		scope: ['activity', 'profile', 'sleep', 'weight', 'nutrition']
	})
});

app.get(callbackPath, (req,res) => {
	req.context.log('Auth fitbit cloud callback', timeStamp);
	passport.authenticate('fitbit', { 
		successRedirect: '/',
		failureRedirect: '/auth-error'
	})
});

passport.use(new FitbitOAuth2Strategy({
	clientID: config.fitbitClientKey,
	clientSecret: config.fitbitClientSecret,
	callbackUrl: callbackUrl
}, function(accessToken, refreshToken, profile, done) {
	//context.log({profileId: profile.id, profileDisplayName: profile.displayName}, 'Logged in user');

	profile.accessToken = accessToken;
	profile.refreshToken = refreshToken;

	done(null, profile);
}));

// Get the data
//exportCsv(context, app);

module.exports = createHandler(app);