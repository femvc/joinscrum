'use strict'; // utf-8编码
var dataModel = require('../models/product').createNew();

// product_api
// app.get('/ue_api/internal/product_list',     account.auth, product.list);
// app.get('/ue_api/internal/product_detail',   account.auth, product.detail);
// app.get('/ue_api/internal/product_save',     account.auth, product.save);

function getDataRecord(req, res, filter, next) {
    if (filter.product_id || filter.product_name) {
        dataModel.getItem(filter, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }
            // Output product_detail
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
        if (!filter.product_id) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'product_id');
        }
        if (!filter.product_name) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'product_name');
        }
    }
}

exports.detail = function (req, res, next) {
    var filter = {};
    if (req.paramlist.product_id) {
        filter.product_id = req.paramlist.product_id;
    }

    return getDataRecord(req, res, filter);
};

var arr = ['product_name', 'product_desc', 'product_key', 'product_index', 'product_member', 'product_observer'];
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

    if (params.product_name)
        filter.product_name = global.common.likeWith(params.product_name);
    if (params.product_desc)
        filter.product_desc = global.common.likeWith(params.product_desc);

    dataModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        var uid = req.sessionStore.user[req.sessionID];
        var result = [];
        for (var i = 0, len = doc.length; i < len; i++) {
            if (doc && doc[i] &&
                ((doc[i].product_member && doc[i].product_member.indexOf && (',' + doc[i].product_member.join(',') + ',').indexOf(',' + uid + ',') !== -1) ||
                    (doc[i].product_observer && doc[i].product_observer.indexOf && (',' + doc[i].product_observer.join(',') + ',').indexOf(',' + uid + ',') !== -1)
                )) {
                result.push(doc[i]);
            }
        }

        response.ok(req, res, {
            uid: uid,
            items: result
        });
    });
};

function add(req, res, next) {
    if (!req.paramlist.product_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'product_name');
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
        product_name: req.paramlist.product_name
    }, function (doc) {
        if (doc) {
            response.err(req, res, 'PRODUCT_ALREADY_EXIST');
        }
        else {
            filter.update_time = date;
            filter.product_id = '20' + global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 8);
            filter.product_member = !filter.product_member || !String(filter.product_member).replace(/,+/, '') ? [req.sessionStore.user[req.sessionID]] : filter.product_member.split(',');

            dataModel.insert(filter, function (err, doc) {
                if (err) {
                    response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
                }
                response.ok(req, res, doc);
            });
        }
    });
}
exports.add = add;
exports.save = function (req, res, next) {
    if (!req.paramlist.product_id) {
        // return response.err(req, res, 'MISSING_PARAMETERS', 'product_id');
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
            product_id: req.paramlist.product_id
        });
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;
    filter.product_member = !filter.product_member || !String(filter.product_member).replace(/,+/, '') ? [req.sessionStore.user[req.sessionID]] : filter.product_member.split(',');
    filter.product_observer = !filter.product_observer || !String(filter.product_observer).replace(/,+/, '') ? [req.sessionStore.user[req.sessionID]] : filter.product_observer.split(',');

    getDataRecord(req, res, {
        product_name: req.paramlist.product_id
    }, function (doc) {
        if (doc && ((
            doc.product_member && doc.product_member.indexOf(req.sessionStore.user[req.sessionID]) !== -1) || (
            doc.product_observer && doc.product_observer.indexOf(req.sessionStore.user[req.sessionID]) !== -1))) {
            dataModel.update({
                product_id: req.paramlist.product_id
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
                        product_id: req.paramlist.product_id
                    });
                }
            });
        }
        else {
            response.err(req, res, 'OUT_OF_PERMISSION');
        }
    });



};