'use strict'; // utf-8编码
var dataModel = require('../models/user').createNew();
var userLogic = require('../helpers/user');

// user_api
// app.get('/ue_api/internal/user_list',       account.auth, user.list);
// app.get('/ue_api/internal/user_info',       account.auth, user.detail);
// app.get('/ue_api/internal/user_add',        account.auth, user.add);
// app.get('/ue_api/internal/user_edit',       account.auth, user.edit);
// app.get('/ue_api/internal/user_login',      account.auth, user.login);
// app.get('/ue_api/internal/user_logout',     account.auth, user.logout);
// app.get('/ue_api/internal/user_loginstatus',account.auth, user.loginstatus);

function getDataRecord(req, res, filter, next) {
    if (filter.uid || filter.username) {
        dataModel.getItem(filter, function (err, doc) {
            if (err) {
                response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
            }
            // Output user_detail
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
        if (!filter.uid) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'uid');
        }
        if (!filter.username) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'username');
        }
    }
}

exports.detail = function (req, res, next) {
    var filter = {};
    if (req.paramlist.uid) {
        filter.uid = req.paramlist.uid;
    }
    if (req.paramlist.username) {
        filter.username = req.paramlist.username;
    }

    return getDataRecord(req, res, filter);
};

var arr = ['username', 'password', 'realname'];
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

    if (params.username)
        filter.username = global.common.likeWith(params.username);
    if (params.user_desc)
        filter.user_desc = global.common.likeWith(params.user_desc);

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
    if (!req.paramlist.username) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'username');
    }
    if (req.paramlist.username.length < 2 || req.paramlist.username.length > 20 || !(/^[_a-zA-Z\d\u4E00-\uFA29]+$/.test(req.paramlist.username))) {
        return response.err(req, res, 'INTERNAL_INVALIDE_PARAMETER', 'username');
    }
    if (!req.paramlist.password) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'password');
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
        username: req.paramlist.username
    }, function (doc) {
        if (doc) {
            response.err(req, res, 'USER_ALREADY_EXIST');
        }
        else {
            filter.update_time = date;
            filter.uid = '10' +  global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 8);

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
    if (!req.paramlist.uid) {
        // return response.err(req, res, 'MISSING_PARAMETERS', 'uid');
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
            uid: req.paramlist.uid
        });
    }

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    filter.update_time = date;

    dataModel.update({
        uid: req.paramlist.uid
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
                uid: req.paramlist.uid
            });
        }
    });


};

exports.login = function (req, res, next) {
    if (!req.paramlist.username) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'username');
    }
    if (!req.paramlist.password) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'password');
    }
    dataModel.getItem({
        username: req.paramlist.username,
        password: req.paramlist.password
    }, function (err, resp) {
        if (err || !resp || !resp._id)
            return response.err(req, res, 'USER_LOGIN_FAIL');

        var user = userLogic.output(resp);
        user.mid = user.uid;
        req.sessionStore.user = req.sessionStore.user || {};
        req.sessionStore.user[req.sessionID] = user.uid;

        return response.ok(req, res, user);
    });
};

exports.logout = function (req, res, next) {
    req.session.destroy();
    return response.ok(req, res, 'ok');
};

exports.loginstatus = function (req, res, next) {
    if (req.sessionStore.user && req.sessionStore.user[req.sessionID]) {
        return response.ok(req, res, 'ok');
    }
    else {
        return response.ok(req, res, 'logout');
    }
};