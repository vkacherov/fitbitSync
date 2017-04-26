'use strict';

var passport = require('passport'),
    getConfig = require('./getConfig'),
    url = require('url'),
    FitbitOAuth2Strategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy;

function auth(app, context) {
    const config = getConfig(app),
        callbackPath = '/auth/fitbit/callback';
    var timeStamp = new Date().toISOString();
	
    context.log("Auth init ",timeStamp);
    
    app.get('/auth/fitbit', passport.authenticate('fitbit', { scope: ['activity', 'profile', 'sleep', 'weight', 'nutrition']}));
    app.get(
        callbackPath,
        passport.authenticate('fitbit', { 
            successRedirect: '/',
            failureRedirect: '/auth-error'
        })
    );

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

    passport.use(new FitbitOAuth2Strategy({
        clientID: config.fitbitClientKey,
        clientSecret: config.fitbitClientSecret,
        callbackUrl: callbackUrl
    }, function(accessToken, refreshToken, profile, done) {
        context.log({profileId: profile.id, profileDisplayName: profile.displayName}, 'Logged in user');

        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        done(null, profile);
    }));
}

module.exports = auth;