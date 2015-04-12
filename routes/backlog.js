'use strict'; // utf-8编码
var dataModel = require('../models/backlog').createNew();

// backlog_api
// app.get('/ue_api/internal/backlog_list',     account.auth, backlog.list);
// app.get('/ue_api/internal/backlog_detail',   account.auth, backlog.detail);
// app.get('/ue_api/internal/backlog_save',     account.auth, backlog.save);

function getDataRecord(req, res, filter, next) {
    if (filter.backlog_id || filter.backlog_name) {
        dataModel.getItem(filter, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }
            // Output backlog_detail
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
        if (!filter.backlog_id) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_id');
        }
        if (!filter.backlog_name) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_name');
        }
    }
}

exports.detail = function (req, res, next) {
    var filter = {};
    if (req.paramlist.backlog_id) {
        filter.backlog_id = req.paramlist.backlog_id;
    }

    return getDataRecord(req, res, filter);
};

var arr = ['backlog_name', 'backlog_desc', 'backlog_index', 'sprint_id', 'product_id', 'backlog_deleted', 'user_id', 'edit_time'];
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

    if (params.backlog_name)
        filter.backlog_name = global.common.likeWith(params.backlog_name);
    if (params.backlog_desc)
        filter.backlog_desc = global.common.likeWith(params.backlog_desc);

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
    if (!req.paramlist.backlog_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_name');
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
    filter.backlog_id = '40' +  global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 8);

    dataModel.insert(filter, function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    });


};
exports.add = add;
exports.save = function (req, res, next) {
    if (!req.paramlist.backlog_id) {
        // return response.err(req, res, 'MISSING_PARAMETERS', 'backlog_id');
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
            backlog_id: req.paramlist.backlog_id
        });
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;

    dataModel.update({
        backlog_id: req.paramlist.backlog_id
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
                backlog_id: req.paramlist.backlog_id
            });
        }
    });


};