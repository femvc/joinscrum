'use strict'; // utf-8编码
var taskModel = require('../models/task').createNew();
var tasklogModel = require('../models/tasklog').createNew();

exports.gettasklog = function (req, res, next) {
    var uid = req.sessionStore.user[req.sessionID];
    if (!req.paramlist.test_id) {
        return response.err(req, res, 'INTERNAL_INVALIDE_PARAMETER');
    }

    var atclist = [];

    var current = 1;
    var count = 10000;
    var sort = {};
    var filter = {
        atcid: {
            $in: atclist
        }
    };

    taskModel.getItems(filter, sort, current, count, function (err, task) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        filter = {
            test_id: req.paramlist.test_id
        }
        tasklogModel.getItems(filter, sort, current, count, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }

            response.ok(req, res, {
                paper: atclist,
                your_answer: doc,
                reference_answer: task
            });
        });
    });
};

exports.gettasklogs = function (req, res, next) {
    var uid = req.sessionStore.user[req.sessionID];

    var current = 1,
        count = 10000,
        sort = {},
        filter = {};

    tasklogModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, doc);
    });

};