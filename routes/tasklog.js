'use strict'; // utf-8编码
var tasklogModel = require('../models/tasklog').createNew();

exports.saveTasklog = function (req, res, task) {
    delete task._id;
    tasklogModel.insert(task, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, task);
    });
};

exports.getTasklogs = function (req, res, next) {
    var params = req.paramlist,
        current = params.current || 1,
        count = params.count || 10000,
        sort = {
            'update_time': -1,
            'create_time': -1
        },
        filter = {};

    if (params.sprint_id)
        filter.sprint_id = params.sprint_id;
    if (params.product_id)
        filter.product_id = params.product_id;

    tasklogModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};