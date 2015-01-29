'use strict'; // utf-8编码
var taskModel = require('../models/task').createNew();

// task_api
// app.get('/ue_api/internal/task_list',     account.auth, task.list);
// app.get('/ue_api/internal/task_detail',   account.auth, task.detail);
// app.get('/ue_api/internal/task_save',     account.auth, task.save);

var arr = [
    // 'task_id',
    // 'task_name',
    // 'task_desc',
    'task_person',
    'task_status',
    'task_remaining',
    'task_estimate',
    'backlog_id',
    'sprint_id',
    'task_deleted',
    'user_id',
    'edit_time'];

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

    for (var i=0,len=arr.length; i<len; i++) {
        if (params[arr[i]])
            filter[i] = params[arr[i]];
    }
    if (params.task_name)
        filter.task_name = global.common.likeWith(params.task_name);
    if (params.task_desc)
        filter.task_desc = global.common.likeWith(params.task_desc);

    taskModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

function get_task (req, res, filter, next) {
    if (!filter.task_id && !filter.task_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'task_id');
    }
    taskModel.getItem(filter, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        // Output task_detail
        if (!next) {
            if (!doc) {
                response.err(req, res, 'USER_USERNAME_NOT_EXIST');
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

exports.detail = function (req, res, next) {
    var task = {};
    if (req.paramlist.task_id) {
        task.task_id = req.paramlist.task_id;
    }
    
    return get_task(req, res, task);
};

exports.save = function (req, res, next) {
    var task_id = req.paramlist.task_id,
        task = {},
        callback;

    if (!req.paramlist.task_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'task_name');
    }
    if (!req.paramlist.backlog_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_id');
    }

    task.task_name = req.paramlist.task_name;
    task.task_desc = req.paramlist.task_desc;
    for (var i=0,len=arr.length; i<len; i++) {
        if (req.paramlist[arr[i]]) {
            task[arr[i]] = req.paramlist[arr[i]];
        }
    }

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    // Update
    if (task_id) {
        task.update_time = date;
        task.task_id = task_id;
        taskModel.update({
            task_id: task_id
        }, {
            $set: task
        }, {
            upsert: false,
            multi: false
        }, function (err, doc) {
            if (err) {
                callback(err, doc);
            }
            else {
                return get_task(req, res, {task_id: req.paramlist.task_id});
            }
        });
    }
    // Add
    else {
        get_task(req, res, {task_name: req.paramlist.task_name, backlog_id: req.paramlist.backlog_id}, function (doc) {
            if (doc) {
                response.err(req, res, 'ALREADY_EXIST', 'task');
            }
            else {
                task.update_time = date;
                task.task_id = 'task' + global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);

                taskModel.insert(task, callback);
            }
        });
    }

};