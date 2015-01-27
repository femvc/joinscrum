'use strict'; // utf-8编码
var userModel = require('../models/user').createNew();

exports.getUser = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    userModel.getItem({
        atcid: atcid
    }, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        if (req.paramlist.answer != 'yes' && doc && doc.options) {
            var list = doc.options;
            for (var i in list) {
                delete list[i].correct;
            }
        }
        response.ok(req, res, doc);
    });
};

exports.saveUser = function (req, res, next) {
    var atcid = req.paramlist.atcid,
        user = {},
        callback, date;

    if (!req.paramlist.title) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'title');
    }
    if (!req.paramlist.options) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'options');
    }

    user.major = JSON.parse(req.paramlist.major);
    user.title = req.paramlist.title;
    user.level = JSON.parse(req.paramlist.level);
    user.label = JSON.parse(req.paramlist.label);
    user.options = JSON.parse(req.paramlist.options);

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    if (atcid) {
        user.update_time = date;
        user.atcid = atcid;
        userModel.update({
            atcid: atcid
        }, {
            $set: user
        }, {
            upsert: true,
            multi: false
        }, callback);
    }
    else {
        user.update_time = date;
        user.atcid = global.common.formatDate(now, 'yyyyMMddHHmmss') + '_' + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);
        userModel.insert(user, callback);
    }
};

exports.removeUser = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    userModel.remove({
        atcid: atcid
    }, function (err) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, null);
    });
};

exports.getUsers = function (req, res, next) {
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

        if (req.paramlist.answer != 'yes') {
            for (var j in doc) {
                var list = doc[j].options;
                for (var i in list) {
                    delete list[i].correct;
                }
            }
        }

        response.ok(req, res, {
            items: doc
        });
    });
};