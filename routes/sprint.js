'use strict'; // utf-8编码
var sprintModel = require('../models/sprint').createNew();

// sprint_api
// app.get('/ue_api/internal/sprint_list',     account.auth, sprint.list);
// app.get('/ue_api/internal/sprint_detail',   account.auth, sprint.detail);
// app.get('/ue_api/internal/sprint_save',     account.auth, sprint.save);

var arr = [
    // 'sprint_id',
    // 'sprint_name',
    // 'sprint_desc',
    'sprint_index',
    'product_id',
    'sprint_deleted',
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
    if (params.sprint_name)
        filter.sprint_name = global.common.likeWith(params.sprint_name);
    if (params.sprint_desc)
        filter.sprint_desc = global.common.likeWith(params.sprint_desc);

    sprintModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

function get_sprint (req, res, filter, next) {
    if (!filter.sprint_id && !filter.sprint_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
    }
    sprintModel.getItem(filter, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        // Output sprint_detail
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
    var sprint = {};
    if (req.paramlist.sprint_id) {
        sprint.sprint_id = req.paramlist.sprint_id;
    }
    
    return get_sprint(req, res, sprint);
};

exports.save = function (req, res, next) {
    var sprint_id = req.paramlist.sprint_id,
        sprint = {},
        callback;

    if (!req.paramlist.sprint_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_name');
    }
    if (!req.paramlist.product_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'product_id');
    }

    sprint.sprint_name = req.paramlist.sprint_name;
    sprint.sprint_desc = req.paramlist.sprint_desc;
    for (var i=0,len=arr.length; i<len; i++) {
        if (req.paramlist[arr[i]]) {
            sprint[arr[i]] = req.paramlist[arr[i]];
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
    if (sprint_id) {
        sprint.update_time = date;
        sprint.sprint_id = sprint_id;
        
        sprintModel.update({
            sprint_id: sprint_id
        }, {
            $set: sprint
        }, {
            upsert: false,
            multi: false
        }, function (err, doc) {
            if (err) {
                callback(err, doc);
            }
            else {
                return get_sprint(req, res, {sprint_id: req.paramlist.sprint_id});
            }
        });
    }
    // Add
    else {
        get_sprint(req, res, {sprint_name: req.paramlist.sprint_name}, function (doc) {
            if (doc) {
                response.err(req, res, 'ALREADY_EXIST', 'sprint');
            }
            else {
                sprint.update_time = date;
                sprint.sprint_id = 'sprint' + global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);

                sprintModel.insert(sprint, callback);
            }
        });
    }

};