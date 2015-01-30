'use strict'; // utf-8编码
var userModel = require('../models/user').createNew();
var userLogic = require('../helpers/user');


// app.get('/ue_api/internal/user_list',       account.auth, user.list);
// app.get('/ue_api/internal/user_info',       account.auth, user.detail);
// app.get('/ue_api/internal/user_add',        account.auth, user.add);
// app.get('/ue_api/internal/user_edit',       account.auth, user.edit);
// app.get('/ue_api/internal/user_login',      account.auth, user.login);
// app.get('/ue_api/internal/user_logout',     account.auth, user.logout);
// app.get('/ue_api/internal/user_loginstatus',account.auth, user.loginstatus);

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

    if (params.title)
        filter.title = global.common.likeWith(params.title);
    if (params.author)
        filter.author = params.author;

    userModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

function get_user (req, res, filter, next) {
    if (!filter.uid && !filter.username) {
        if (!filter.uid) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'uid');
        }
        if (!filter.username) {
            return response.err(req, res, 'MISSING_PARAMETERS', 'username');
        }
    }
    userModel.getItem(filter, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        // Output user_detail
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
    var user = {};
    if (req.paramlist.uid) {
        user.uid = req.paramlist.uid;
    }
    if (req.paramlist.username) {
        user.username = req.paramlist.username;
    }
    
    return get_user(req, res, user);
};

exports.save = function (req, res, next) {
    var uid = req.paramlist.uid,
        user = {},
        callback;

    if (!req.paramlist.username) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'username');
    }
    if (req.paramlist.username.length < 2 || req.paramlist.username.length > 20 || !(/^[_a-zA-Z\d\u4E00-\uFA29]+$/.test(req.paramlist.username))) {
        return response.err(req, res, 'INTERNAL_INVALIDE_PARAMETER', 'username');
    }
    if (!req.paramlist.password) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'password');
    }

    user.username = req.paramlist.username;
    user.password = req.paramlist.password;

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    // Update
    if (uid) {
        user.update_time = date;
        user.uid = uid;
        userModel.update({
            uid: uid
        }, {
            $set: user
        }, {
            upsert: false,
            multi: false
        }, function (err, doc) {
            if (err) {
                callback(err, doc);
            }
            else {
                return get_user(req, res, {uid: req.paramlist.uid});
            }
        });
    }
    // Add
    else {
        get_user(req, res, {username: req.paramlist.username}, function (doc) {
            if (doc) {
                response.err(req, res, 'USER_ALREADY_EXIST');
            }
            else {
                user.update_time = date;
                user.uid = global.common.formatDate(now, 'yyyyMMddHHmmss') + '_' + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);

                userModel.insert(user, callback);
            }
        });
    }

};

exports.login = function (req, res, next) {
    if (!req.paramlist.username) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'username');
    }
    if (!req.paramlist.password) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'password');
    }
    userModel.getItem({
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