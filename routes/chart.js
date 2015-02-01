'use strict'; // utf-8编码
var dataModel = require('../models/task').createNew();

// chart_api
// app.get('/ue_api/internal/burndown',        account.auth, chart.burndown);
// app.get('/ue_api/internal/burden',          account.auth, chart.burden);

var arr = ['sprint_id'];
exports.burden = function (req, res, next) {
    if (!req.paramlist.sprint_id) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'sprint_id');
    }
    
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
    filter.task_deleted = 0;

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

