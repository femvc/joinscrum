'use strict'; // utf-8编码
var tasklogModel = require('../models/tasklog').createNew();

exports.getTasklog = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    tasklogModel.getItem({
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

exports.saveTasklog = function (req, res, next) {
    var atcid = req.paramlist.atcid,
        tasklog = {},
        callback, date;

    if (!req.paramlist.title) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'title');
    }
    if (!req.paramlist.options) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'options');
    }

    tasklog.major = JSON.parse(req.paramlist.major);
    tasklog.title = req.paramlist.title;
    tasklog.level = JSON.parse(req.paramlist.level);
    tasklog.label = JSON.parse(req.paramlist.label);
    tasklog.options = JSON.parse(req.paramlist.options);

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    if (atcid) {
        tasklog.update_time = date;
        tasklog.atcid = atcid;
        tasklogModel.update({
            atcid: atcid
        }, {
            $set: tasklog
        }, {
            upsert: true,
            multi: false
        }, callback);
    }
    else {
        tasklog.update_time = date;
        tasklog.atcid = global.common.formatDate(now, 'yyyyMMddHHmmss') + '_' + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);
        tasklogModel.insert(tasklog, callback);
    }
};

exports.removeTasklog = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    tasklogModel.remove({
        atcid: atcid
    }, function (err) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, null);
    });
};

exports.getTasklogs = function (req, res, next) {
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

    tasklogModel.getItems(filter, sort, current, count, function (err, doc) {
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