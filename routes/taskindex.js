'use strict'; // utf-8编码
var dataModel = require('../models/taskindex').createNew();

var arr = ['sprint_id', 'backlog_id', 'task_status', 'taskindex'];
exports.list = function (req, res, next) {
    if (!req.paramlist.sprint_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
    }

    // res.end('aaaaaaaaaa');
    var params = req.paramlist,
        current = params.current || 1,
        count = params.count || 1000,
        sort = {
            'update_time': -1,
            'create_time': -1
        },
        filter = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        if (req.paramlist[arr[i]] !== undefined) {
            filter[arr[i]] = req.paramlist[arr[i]];
        }
    }

    dataModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

exports.save = function (req, res, next) {
    if (!req.paramlist.sprint_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
    }
    if (!req.paramlist.backlog_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_id');
    }
    if (!req.paramlist.task_status) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'task_status');
    }
    if (!req.paramlist.taskindex) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'taskindex');
    }

    var filter = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        if (req.paramlist[arr[i]] !== undefined) {
            filter[arr[i]] = req.paramlist[arr[i]];
        }
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;

    dataModel.update({
        sprint_id: req.paramlist.sprint_id,
        backlog_id: req.paramlist.backlog_id,
        task_status: req.paramlist.task_status
    }, {
        $set: filter
    }, {
        upsert: true,
        multi: false
    }, function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        else {
            response.ok(req, res, doc[0]);
        }
    });


};