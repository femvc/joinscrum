'use strict'; // utf-8编码
var backlogModel = require('../models/backlog').createNew();

// backlog_api
// app.get('/ue_api/internal/backlog_list',     account.auth, backlog.list);
// app.get('/ue_api/internal/backlog_detail',   account.auth, backlog.detail);
// app.get('/ue_api/internal/backlog_save',     account.auth, backlog.save);

var arr = [
    // 'backlog_id',
    // 'backlog_name',
    // 'backlog_desc',
    'backlog_index',
    'sprint_id',
    'backlog_deleted',
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
        if (params[arr[i]]) {
            filter[i] = params[arr[i]];
        }
    }
    if (params.backlog_name)
        filter.backlog_name = global.common.likeWith(params.backlog_name);
    if (params.backlog_desc)
        filter.backlog_desc = global.common.likeWith(params.backlog_desc);

    backlogModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

function get_backlog (req, res, filter, next) {
    if (!filter.backlog_id && !filter.backlog_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_id');
    }
    backlogModel.getItem(filter, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        // Output backlog_detail
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
    var backlog = {};
    if (req.paramlist.backlog_id) {
        backlog.backlog_id = req.paramlist.backlog_id;
    }
    
    return get_backlog(req, res, backlog);
};

exports.save = function (req, res, next) {
    var backlog_id = req.paramlist.backlog_id,
        backlog = {},
        callback;

    if (!req.paramlist.backlog_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_name');
    }
    if (!req.paramlist.sprint_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
    }

    backlog.backlog_name = req.paramlist.backlog_name;
    backlog.backlog_desc = req.paramlist.backlog_desc;
    for (var i=0,len=arr.length; i<len; i++) {
        if (req.paramlist[arr[i]]) {
            backlog[arr[i]] = req.paramlist[arr[i]];
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
    if (backlog_id) {
        backlog.update_time = date;
        backlog.backlog_id = backlog_id;
        backlogModel.update({
            backlog_id: backlog_id
        }, {
            $set: backlog
        }, {
            upsert: false,
            multi: false
        }, function (err, doc) {
            if (err) {
                callback(err, doc);
            }
            else {
                return get_backlog(req, res, {backlog_id: req.paramlist.backlog_id});
            }
        });
    }
    // Add
    else {
        get_backlog(req, res, {backlog_name: req.paramlist.backlog_name}, function (doc) {
            if (doc) {
                response.err(req, res, 'ALREADY_EXIST', 'backlog');
            }
            else {
                backlog.update_time = date;
                backlog.backlog_id = 'backlog' + global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);

                backlogModel.insert(backlog, callback);
            }
        });
    }

};