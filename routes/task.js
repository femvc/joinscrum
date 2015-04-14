'use strict'; // utf-8编码
var dataModel = require('../models/task').createNew();
var tasklog = require('./tasklog');

// task_api
// app.get('/ue_api/internal/task_list',     account.auth, task.list);
// app.get('/ue_api/internal/task_detail',   account.auth, task.detail);
// app.get('/ue_api/internal/task_save',     account.auth, task.save);

function getDataRecord(req, res, filter, next) {
    if (filter.task_id || filter.task_name) {
        dataModel.getItem(filter, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }
            // Output task_detail
            if (!next) {
                if (!doc) {
                    response.err(req, res, 'RECORD_NOT_EXIST', filter);
                }
                else {
                    response.ok(req, res, doc);
                }
            }
            else {
                next(doc);
            }
        });
    }
    else {
        if (!filter.task_id) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'task_id');
        }
        if (!filter.task_name) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'task_name');
        }
    }
}

exports.detail = function (req, res, next) {
    var filter = {};
    if (req.paramlist.task_id) {
        filter.task_id = req.paramlist.task_id;
    }

    return getDataRecord(req, res, filter);
};

var arr = [
    'task_name', 'task_desc', 'task_index', 'backlog_id', 'task_deleted', 'user_id', 'edit_time',
    'task_person', 'task_status', 'task_remaining', 'task_estimate', 'task_start', 'sprint_id', 'product_id'
];
exports.list = function (req, res, next) {
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

    if (params.task_name)
        filter.task_name = global.common.likeWith(params.task_name);
    if (params.task_desc)
        filter.task_desc = global.common.likeWith(params.task_desc);

    dataModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc,
            sprint_id: req.paramlist.sprint_id
        });
    });
};

function add(req, res, next) {
    if (!req.paramlist.task_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'task_name');
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
    filter.task_id = '50' +  global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 8);
    filter.task_deleted = '0';

    dataModel.insert(filter, function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        
        tasklog.saveTasklog(req, res, doc[0]);
    });

};
exports.add = add;
exports.save = function (req, res, next) {
    if (!req.paramlist.task_id) {
        // return response.err(req, res, 'MISSING_PARAMETERS', 'task_id');
        return add(req, res, next);
    }

    var filter = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        if (req.paramlist[arr[i]] !== undefined) {
            filter[arr[i]] = req.paramlist[arr[i]];
        }
    }

    if (JSON.stringify(filter) === '{}') {
        return getDataRecord(req, res, {
            task_id: req.paramlist.task_id
        });
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;

    dataModel.update({
        task_id: req.paramlist.task_id
    }, {
        $set: filter
    }, {
        upsert: false,
        multi: false
    }, function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        else {
            return getDataRecord(req, res, {
                task_id: req.paramlist.task_id
            }, function (doc) {
                
                tasklog.saveTasklog(req, res, doc);
            });
        }
    });


};