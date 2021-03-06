'use strict'; // utf-8编码
var dataModel = require('../models/sprint').createNew();

// sprint_api
// app.get('/ue_api/internal/sprint_list',     account.auth, sprint.list);
// app.get('/ue_api/internal/sprint_detail',   account.auth, sprint.detail);
// app.get('/ue_api/internal/sprint_save',     account.auth, sprint.save);

function getDataRecord(req, res, filter, next) {
    if (filter.sprint_id || filter.sprint_name) {
        dataModel.getItem(filter, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }
            // Output sprint_detail
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
        if (!filter.sprint_id) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
        }
        if (!filter.sprint_name) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_name');
        }
    }
}

exports.detail = function (req, res, next) {
    var filter = {};
    if (req.paramlist.sprint_id) {
        filter.sprint_id = req.paramlist.sprint_id;
    }

    return getDataRecord(req, res, filter);
};

var arr = ['sprint_name', 'sprint_desc', 'sprint_index', 'product_id', 'sprint_deleted', 'sprint_start', 'sprint_finish', 'user_id', 'edit_time', 'sprint_done'];
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

    if (params.include_done !== 'yes')
        filter.sprint_done = '';
    if (params.sprint_name)
        filter.sprint_name = global.common.likeWith(params.sprint_name);
    if (params.sprint_desc)
        filter.sprint_desc = global.common.likeWith(params.sprint_desc);

    dataModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

function add(req, res, next) {
    if (!req.paramlist.sprint_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_name');
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
    filter.sprint_id = '30' +  global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 8);

    dataModel.insert(filter, function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    });


}
exports.add = add;
exports.save = function (req, res, next) {
    if (!req.paramlist.sprint_id) {
        // return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
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
            sprint_id: req.paramlist.sprint_id
        });
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;

    dataModel.update({
        sprint_id: req.paramlist.sprint_id
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
                sprint_id: req.paramlist.sprint_id
            });
        }
    });


};