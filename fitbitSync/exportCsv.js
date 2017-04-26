'use strict';

var getTimeSeries = require('./getTimeSeries'),
    q = require('q'),
    _ = require('lodash'),
    json2csv = require('json2csv');

function exportCsv(app, req, res, next) {
    
    getTimeSeries(app, req.user).then(function(timeSeries) {
        // assume that all entries have the same keys
        var keys = _.keys(_.first(timeSeries));

        res.set('Content-Type', 'text/plain');
        res.send(json2csv({data: timeSeries, fields: keys}));
    }).fail(next);
}

module.exports = exportCsv;