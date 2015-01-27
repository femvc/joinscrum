'use strict'; // utf-8编码
var taskModel = require('../models/task').createNew();

exports.getTask = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    taskModel.getItem({
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

exports.saveTask = function (req, res, next) {
    var atcid = req.paramlist.atcid,
        task = {},
        callback, date;

    if (!req.paramlist.title) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'title');
    }
    if (!req.paramlist.options) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'options');
    }

    task.major = JSON.parse(req.paramlist.major);
    task.title = req.paramlist.title;
    task.level = JSON.parse(req.paramlist.level);
    task.label = JSON.parse(req.paramlist.label);
    task.options = JSON.parse(req.paramlist.options);

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    if (atcid) {
        task.update_time = date;
        task.atcid = atcid;
        taskModel.update({
            atcid: atcid
        }, {
            $set: task
        }, {
            upsert: true,
            multi: false
        }, callback);
    }
    else {
        task.update_time = date;
        task.atcid = global.common.formatDate(now, 'yyyyMMddHHmmss') + '_' + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);
        taskModel.insert(task, callback);
    }
};

exports.removeTask = function (req, res, next) {
    var atcid = req.paramlist.atcid;
    if (!atcid) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'atcid');
    }
    taskModel.remove({
        atcid: atcid
    }, function (err) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, null);
    });
};

exports.getTasks = function (req, res, next) {
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

    taskModel.getItems(filter, sort, current, count, function (err, doc) {
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