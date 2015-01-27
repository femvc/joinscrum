'use strict'; // utf-8编码
var backlogModel = require('../models/backlog').createNew();

exports.getbacklog = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    backlogModel.getItem({
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

exports.savebacklog = function (req, res, next) {
    var atcid = req.paramlist.atcid,
        backlog = {},
        callback, date;

    if (!req.paramlist.title) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'title');
    }
    if (!req.paramlist.options) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'options');
    }

    backlog.major = JSON.parse(req.paramlist.major);
    backlog.title = req.paramlist.title;
    backlog.level = JSON.parse(req.paramlist.level);
    backlog.label = JSON.parse(req.paramlist.label);
    backlog.options = JSON.parse(req.paramlist.options);

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    if (atcid) {
        backlog.update_time = date;
        backlog.atcid = atcid;
        backlogModel.update({
            atcid: atcid
        }, {
            $set: backlog
        }, {
            upsert: true,
            multi: false
        }, callback);
    }
    else {
        backlog.update_time = date;
        backlog.atcid = global.common.formatDate(now, 'yyyyMMddHHmmss') + '_' + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);
        backlogModel.insert(backlog, callback);
    }
};

exports.removebacklog = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    backlogModel.remove({
        atcid: atcid
    }, function (err) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, null);
    });
};

exports.getbacklogs = function (req, res, next) {
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

    backlogModel.getItems(filter, sort, current, count, function (err, doc) {
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