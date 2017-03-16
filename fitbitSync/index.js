// Fitbit URLs
const fitbitBaseUrl = "https://api.fitbit.com/1/user/-/";
const fitbitAuthUrl = "https://www.fitbit.com/oauth2/authorize";

// Fitbit access metadata   
const clientId = GetEnvironmentVariable('clientId');
const clientSecret = GetEnvironmentVariable('clientSecret');

const auth0 = require('azure-functions-auth0')({
	clientId: clientId,
	clientSecret: clientSecret,
	domain: fitbitAuthUrl
});

function GetEnvironmentVariable(name) {
	return process.env[name];
}

/**
 * Azure Function that is periodically invoked to synchronize the Fitbit 
 * user telemetry with the data store on Azure. The function retrieves 
 * the Fitbit user telemetry for the user up to the current time 
 * period 
 *
 * @param  context - execution context of the function  
 * @param event - Azure function object containing event data 
 */
module.exports = auth0(function(context, myTimer, req) { 
	"use strict";

	// Load the axios http lib.
	const axios = require('axios');
	// Promise lib.
	const promise = require('promise');

	context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

	if (req.user) {
		context.res = {
			body: req.user
		};
	}
	else {
		context.res = {
			status: 400,
			body: "The user seems to be missing"
		};
	}
	
	var timeStamp = new Date().toISOString();
	context.log('JavaScript timer trigger function ran!', timeStamp);

	context.done();
});

/**
 * Determines the user's time offset from UTC in milliseconds. This allows us to normalized
 * the local time with the device's timezone. (at least the last recorded timezone)
 * @return the UTC offset in milliseconds
 */
function getFitbitProfileUTCOffset() {
	return axios({
		url: fitbitBaseUrl + "profile.json",
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	}).then(response => {
		let offsetFromUTCMillis = response.data.user.offsetFromUTCMillis
		console.log("User's UTC offest in milliseconds is: " + offsetFromUTCMillis);
		return offsetFromUTCMillis;
	}).catch(error => {
		throw error;
	});
}


/**
 * Get the intraday steps for the current user using the input UTC offet
 */
function getIntradaySteps(offsetFromUTCMillis) {
	// Moment.js library
	const moment = require('moment')

	//Get the current date/time and offset based on the Fitbit user's profile
	let now = moment();
	now.add(offsetFromUTCMillis, 'ms');

	//Format date range values
	let hourString = now.get('hour');
	let dateString = now.format("YYYY-MM-DD");

	//URL to fetch data for the current hour
	let url = fitbitBaseUrl + `activities/steps/date/${dateString}/1d/15min/time/${hourString}:00/${hourString}:59.json`;

	//Fetch the data from Fitbit
	console.log("Invoking Fitbit endpoint at: " + url);

	return axios({
		url: url,
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	}).then(response => {
		console.log("Returned payload: \n" + JSON.stringify(response.data["activities-steps-intraday"]));
		let dataset = response.data["activities-steps-intraday"].dataset;
		return dataset;
	}).catch(error => {
		throw error;
	});
}
