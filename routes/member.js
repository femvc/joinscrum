'use strict'; // utf-8编码
var dataModel = require('../models/member').createNew();

// member_api
// app.get('/ue_api/internal/member_list',     account.auth, member.list);
// app.get('/ue_api/internal/member_detail',   account.auth, member.detail);
// app.get('/ue_api/internal/member_save',     account.auth, member.save);

function getDataRecord(req, res, filter, next) {
    if (filter.member_id || filter.member_name) {
        dataModel.getItem(filter, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }
            // Output member_detail
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
        if (!filter.member_id) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'member_id');
        }
        if (!filter.member_name) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'member_name');
        }
    }
}

exports.detail = function (req, res, next) {
    var filter = {};
    if (req.paramlist.member_id) {
        filter.member_id = req.paramlist.member_id;
    }

    return getDataRecord(req, res, filter);
};

var arr = ['member_name', 'member_desc', 'member_key', 'member_index'];
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

    if (params.member_name)
        filter.member_name = global.common.likeWith(params.member_name);
    if (params.member_desc)
        filter.member_desc = global.common.likeWith(params.member_desc);

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
    if (!req.paramlist.member_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'member_name');
    }

    var filter = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        if (req.paramlist[arr[i]] !== undefined) {
            filter[arr[i]] = req.paramlist[arr[i]];
        }
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');

    getDataRecord(req, res, {
        member_name: req.paramlist.member_name
    }, function (doc) {
        if (doc) {
            response.err(req, res, 'USER_ALREADY_EXIST');
        }
        else {
            filter.update_time = date;
            filter.member_id = '20' +  global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 8);

            dataModel.insert(filter, function (err, doc) {
                if (err) {
                    response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
                }
                response.ok(req, res, doc);
            });
        }
    });

};
exports.add = add;
exports.save = function (req, res, next) {
    if (!req.paramlist.member_id) {
        // return response.err(req, res, 'MISSING_PARAMETERS', 'member_id');
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
            member_id: req.paramlist.member_id
        });
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;

    dataModel.update({
        member_id: req.paramlist.member_id
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
                member_id: req.paramlist.member_id
            });
        }
    });


};