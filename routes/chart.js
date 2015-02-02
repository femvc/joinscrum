'use strict'; // utf-8编码
var dataModel = require('../models/task').createNew();

// chart_api
// app.get('/ue_api/internal/burndown',        account.auth, chart.burndown);
// app.get('/ue_api/internal/burden',          account.auth, chart.burden);

exports.burden = function (req, res, next) {
    // if (!req.paramlist.sprint_id) {
    //     return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
    // }
    
    var params = req.paramlist,
        current = params.current || 1,
        count = params.count || 1000,
        sort = {
            'update_time': -1,
            'create_time': -1
        },
        filter = {};
    if (req.paramlist.task_deleted === '0') {
        filter.task_deleted = '0';
    }
    else if (req.paramlist.task_deleted === 'deleted') {
        filter.task_deleted = 'deleted';
    }
    
    if (req.paramlist.sprint_id) {
        filter.sprint_id = req.paramlist.sprint_id;
    }

    dataModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        var remaining = {};
        var task_remaining;
        for (var i=0,len=doc.length; i<len; i++) {
            task_remaining = Number(doc[i].task_remaining);
            remaining[doc[i].task_person] = remaining[doc[i].task_person] === undefined ? 0 : remaining[doc[i].task_person];
            if (!isNaN(task_remaining) && task_remaining > 0) {
                remaining[doc[i].task_person] += task_remaining;
            }
        }

        response.ok(req, res, remaining);
    });
};

