/**
 * Wrap model passed with additional information
 * @param {Object} model
 * @param {Object} req
 */

var config = require('../config'),
    htmlHelpers = require('./htmlHelpers');

exports.buildModel = function(model, req){
    var locals = { model: model};
    locals.req = req;
    locals.config = config;
    locals.html = htmlHelpers;
    locals.modelErrors = req.modelErrors || [];
    return locals;
}