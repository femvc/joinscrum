'use strict';
//   __  __   __  __    _____   ______   ______   __  __   _____     
//  /\ \/\ \ /\ \/\ \  /\___ \ /\__  _\ /\  _  \ /\ \/\ \ /\  __`\   
//  \ \ \_\ \\ \ \ \ \ \/__/\ \\/_/\ \/ \ \ \/\ \\ \ `\\ \\ \ \ \_\  
//   \ \  _  \\ \ \ \ \   _\ \ \  \ \ \  \ \  __ \\ \ . ` \\ \ \ =__ 
//    \ \ \ \ \\ \ \_\ \ /\ \_\ \  \_\ \__\ \ \/\ \\ \ \`\ \\ \ \_\ \
//     \ \_\ \_\\ \_____\\ \____/  /\_____\\ \_\ \_\\ \_\ \_\\ \____/
//      \/_/\/_/ \/_____/ \/___/   \/_____/ \/_/\/_/ \/_/\/_/ \/___/ 
//                                                                   
//                                                                   

/**
 * @name 按钮控件
 * @public
 * @author haiyang5210
 * @date 2014-11-15 19:53
 * @param {Object} options 控件初始化参数.
 */
hui.define('hui_taskboard', ['hui_util', 'hui_control', 'hui_draggable'], function () {

    hui.Taskboard = function (options, pending) {
        hui.Taskboard.superClass.call(this, options, 'pending');
        this.type = 'taskboard';

        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Taskboard.prototype = {
        

        product_key: '',
        /**
         * @name Taskboard的html模板
         * @private
         */
        getTaskboardTpl: function () {
            var str = [
                '<div class="taskboard-title"><b ondblclick="hui.Master.get().editSprint(\'#{sprint_id}\')">#{sprint_name}  #{sprint_start} - #{sprint_finish}</b></div>',
                '<table cellspacing="0" cellpadding="0" class="taskboard">',
                '    <colgroup>',
                '        <col class="fixedWidth" id="pbiCol">',
                '        <col span="4" class="fixedWidth">',
                '    </colgroup>',
                '    <thead>',
                '        <tr class="taskboard-header">',
                '            <th>Backlog Items <button class="link" style="margin-left:5px;margin-right:-20px;" onclick="hui.Master.get().addBacklog(\'#{sprint_id}\')">add</button></th>',
                '            <th colspan="4">Tasks / Status</th>',
                '        </tr>',
                '        <tr class="taskstatus">',
                '            <th>&nbsp;</th>',
                '            <th><div class="taskStatus">Not Started</div><div class="taskStatusCount"><span id="notStartedCount"></span> Tasks</div></th>',
                '            <th><div class="taskStatus">Impeded</div><div class="taskStatusCount"><span id="impededCount"></span> Tasks</div></th>',
                '            <th><div class="taskStatus">In Progress</div><div class="taskStatusCount"><span id="inProgressCount"></span> Tasks</div></th>',
                '            <th><div class="taskStatus">Done</div><div class="taskStatusCount"><span id="doneCount"></span> Tasks</div></th>',
                '        </tr>',
                '    </thead>',
                '    <tbody id="taskboard#{sprint_id}"></tbody>',
                '</table>'].join('');
            return str;
        },
        getTaskboardRowTpl: function () {
            var str = 
            '<table>' +
                '<tr>' +
                    '<td class="taskboardCell pbiCell" id="pbi_#{backlog_id}">#{!pbi_info}</td>' +
                    '<td class="taskboardCell" id="notstarted_#{backlog_id}" style="position: relative;"></td>' +
                    '<td class="taskboardCell" id="impeded_#{backlog_id}" style="position: relative;"></td>' +
                    '<td class="taskboardCell" id="inprogress_#{backlog_id}" style="position: relative;"></td>' +
                    '<td class="taskboardCell" id="done_#{backlog_id}" style="position: relative;"></td>' +
                '</tr>' +
            '</table>';
            return str;
        },
        getBacklogTpl: function () {
            var str = 
            '<div>' +
                '<span ondblclick="hui.Master.get().editBacklog(\'#{sprint_id}\', \'#{backlog_id}\')">' + 
                '<span class="pbikey"   id="pbikey_#{backlog_id}">(#{product_key})</span>&nbsp;' +
                '<span class="pbititle" id="pbititle_#{backlog_id}">#{backlog_name}</span></span><br><br><br>' +
                '<div  class="pbidesc"  id="pbidesc_#{backlog_id}">#{backlog_desc}</div>' +
            '</div>' +
            '<div style="width: 100%; height: 30px;">' +
                '<div class="pbiestimate">Estimate: - #{backlog_estimate}</div>' +
                '<div class="pbidone"><input type="checkbox" id="markdone_#{backlog_id}" onclick="hui.Master.get().doneBacklog(this)" ><label for="markdone_#{backlog_id}">Done</label></div>' +
            '</div>' +
            '<div style="width: 100%; height: 30px; text-align: right; padding-top: 6px;">' +
                '<div id="person_#{backlog_id}"></div>' +
                '<button class="link" id="addtask_#{backlog_id}" style="cursor: pointer; margin-right: 7px;" onclick="hui.Master.get().addTask(\'#{backlog_id}\')">add</button>' +
            '</div>';
            return str;
        },
        getTaskTpl: function () {
            var str = 
            '<div class="task #{task_deleted}" id="task_#{task_id}" style="z-index:inherit;">' +
            '</div>';
            return str;
        },
        getTaskContentTpl: function () {
            var str = 
                '<div class="tasktitle" ondblclick="hui.Master.get().editTask(\'#{sprint_id}\', \'#{task_id}\')" id="tasktitle_#{task_id}" title="#{task_name}">#{task_name}</div>' +
                '<div class="draghandle">' +
                    '<div class="taskhours">Hrs: <span id="hours_#{task_id}">#{task_remaining}</span></div>' +
                    '<div class="pointperson" id="pp_#{task_id}" task_person="#{task_person}">#{user_label}</div>' +
                '</div>' +
                '<div class="taskmenutrap" onclick="hui.g(\'menu_#{task_id}\').style.display=\'block\'" onmouseout="hui.g(\'menu_#{task_id}\').onmouseout()">&nbsp;</div>' +
                '<div class="taskmenu_list" style="display:none;" '+
                    ' id="menu_#{task_id}" onmouseover="window.clearTimeout(this.timer)" ' +
                    ' onmouseout="var me=this;me.timer=window.setTimeout(function(){me.style.display=\'none\';}, 500);">' +
                    '<div class="taskmenu_item" onclick="hui.Master.get().takeTask(\'#{task_id}\')">Take Task</div>' +
                    '<div class="taskmenu_item" onclick="hui.Master.get().editTask(\'#{sprint_id}\', \'#{task_id}\')">Edit Task</div>' +
                    '<div class="taskmenu_item" onclick="hui.Master.get().deleteTask(\'#{task_id}\')">Delete Task</div>' +
                '</div>';
            return str;
        },
        /**
         * @name 渲染控件
         * @public
         */
        render: function () {
            hui.Taskboard.superClass.prototype.render.call(this);
            var me   = this;
            // var main = me.getMain();
            // var innerDiv;
            var sprint_data = me.sprint_data ? me.sprint_data : {};
            if (sprint_data.sprint_start) {
                sprint_data.sprint_start = hui.util.formatDate(hui.util.parseDate(sprint_data.sprint_start), 'M/dd')
            }
            if (sprint_data.sprint_finish) {
                sprint_data.sprint_finish = hui.util.formatDate(hui.util.parseDate(sprint_data.sprint_finish), 'M/dd')
            }
            
            me.setInnerHTML(hui.format(me.getTaskboardTpl(), sprint_data));
        },
        addBacklogRow: function (backlogValue) {
            var me = this,
                taskboard = hui.g('taskboard'+me.sprint_id),
                row = document.createElement('DIV'),
                pbi_info,
                table,
                tr;
            backlogValue.product_key = me.product_key;
            backlogValue.sprint_id = me.sprint_id;
            pbi_info = hui.Control.format(me.getBacklogTpl(), backlogValue);
            
            row.innerHTML = hui.Control.format(me.getTaskboardRowTpl(), {
                backlog_id: backlogValue.backlog_id,
                pbi_info: pbi_info
            });
            
            // fixme: hui.dom.getElementsByTagName('TABLE', div) 等于document.getElementsByTagName('TABLE'), 因此不会获取到新创建的table!!
            // tr = hui.dom.getElementsByTagName('TABLE', div)[0].rows[0];
            table = row.childNodes[0];
            table = String(table.tagName).toUpperCase() == 'TABLE' ? table : row.childNodes[1];
            tr = table.rows[0];
            taskboard.appendChild(tr);
            taskboard.insertBefore(tr, taskboard.rows[0]);
            
            hui.Droppables.add(hui.g('notstarted_' + backlogValue.backlog_id));
            hui.Droppables.add(hui.g('impeded_'     + backlogValue.backlog_id));
            hui.Droppables.add(hui.g('inprogress_' + backlogValue.backlog_id));
            hui.Droppables.add(hui.g('done_'        + backlogValue.backlog_id));
        },
        addTaskRow: function(task){
            var me = this,
                taskElem,
                tmpContainer = document.createElement('DIV');
            
            // todo
            tmpContainer.innerHTML = hui.Control.format(me.getTaskTpl(), task);
            taskElem = tmpContainer.childNodes[0];
            taskElem = taskElem&&taskElem.tagName ? taskElem : tmpContainer.childNodes[1];
            document.documentElement.appendChild(taskElem);

            me.updateTask(task);
            
            hui.Draggable('task_'+task.task_id, {
                //preventDefault: true,
                start: function(){
                    var me = this;
                    me.startTime = new Date();
                },
                end:function(){
                    hui.Master.get().moveTask(this);
                }
            });
            
        },
        updateTask: function(task){
            var me = this,
                u = hui.Master.get().getUserItem(task.task_person) || {},
                backlog_id = task.backlog_id,
                status = task.task_status,
                td;
            task.task_remaining = task.task_remaining === '' ? '-' : task.task_remaining;
            task.user_label = u.realname + '(' + u.username + ')';
            
            var taskElem = hui.g('task_'+task.task_id);
            if (taskElem) {
                taskElem.innerHTML = hui.Control.format(me.getTaskContentTpl(), task);
            }

            td = hui.g(status + '_' + backlog_id);
            td && td.appendChild(taskElem);
        },
        deleteTask: function(task){
            // var me = this;
            // todo
            var taskElem = hui.g('task_'+task.task_id);
            if (taskElem) {
                var parentNode = taskElem.parentNode;
                parentNode.removeChild(taskElem);
            }
        },
        setBacklogList: function () {
            var me = this;
            var backlogList = hui.util.sortBy(me.backlogList, 'backlog_index');
            for (var i=0,len=backlogList.length; i<len; i++) {
                me.addBacklogRow(backlogList[i]);
            }
        },
        setTaskList: function () {
            var me = this;
            var taskList = me.taskList;
            for (var i=0,len=taskList.length; i<len; i++) {
                me.addTaskRow(taskList[i]);
            }
        },
        removeBacklogRow: function (list) {
            var me = this,
                taskboard = hui.g('taskboard'+me.sprint_id);
            if (taskboard && list == 'all') {
                taskboard.innerHTML = '';
            }
        }
    };

    /* hui.Taskboard 继承了 hui.Control */
    hui.inherits(hui.Taskboard, hui.Control);

hui.util.importCssString([
    '.taskboard {border-spacing: 0px; border: 2px solid #cccccc; width: 927px; table-layout: fixed;}',
    '.taskboard th {text-align: left; vertical-align: top; padding: 5px; border: 2px solid #cccccc; margin: 0px;font-size: 9pt; color: black; font-weight: bold;}',
    '.taskboard .draghandle {position: absolute; bottom: 0px; left: 0px; height: 16px; width: 146px;}',
    '.taskboard .fixedWidth {width: 180px;}',
    '.taskboard .link {border: 0px; color: #008000; display: inline; background-color: transparent; font-weight: bold; text-decoration: underline; cursor: pointer; padding: 0px 1px 0px 0px;}',
    '.taskboard .pbiCell {background-color: #e6e6e6; color: #999999; font-size: 1pt; }',
    '.taskboard .pbidesc {font-size: 8pt; color: #4d4d4d;overflow: hidden;}',
    '.taskboard .pbidone {font-size: 8pt; color: #4d4d4d;padding-top: 1em;float: right; text-align: right;}',
    '.taskboard .pbiestimate {font-size: 8pt; color: #4d4d4d;font-weight: bold;padding-top: 1em;float: left; text-align: left;}',
    '.taskboard .pbikey {font-size: 8pt; color: #4d4d4d;font-weight: bold;cursor: pointer;float: left;}',
    '.taskboard .pbititle {font-size: 8pt; color: #4d4d4d;font-weight: bold;overflow: hidden;cursor: pointer;}',
    '.taskboard .pointperson {bottom: 3px; color: #444444; overflow: hidden; position: absolute; text-overflow: ellipsis; white-space: nowrap; width: 74px;right: 1px;}',
    '.taskboard .task {width: 168px; height: 39px; margin-top: 4px; font-size: 9pt; position: relative; background-repeat: no-repeat; padding-left: 5px; cursor: move;background-image: url(vm/images/taskboxes/Task_box.gif);}',
    '.taskboard .taskStatus {float: left;}',
    '.taskboard .taskStatusCount {float: right;}',
    '.taskboard .taskboard-title {padding: 40px 0px 5px; font-size: 18px;}',
    '.taskboard .taskboardCell {padding-top: 3px; padding-bottom: 5px; padding-left: 4px; padding-right: 4px; font-size: 1px;}',
    '.taskboard .taskboardCell {text-align: left; vertical-align: top; padding: 5px; border: 2px solid #cccccc; margin: 0px;}',
    '.taskboard .taskhours {bottom: 3px; color: #444444; overflow: hidden; position: absolute; text-overflow: ellipsis; white-space: nowrap; width: 74px;left: 5px;}',
    '.taskboard .taskmenu_list .taskmenu_item {padding: 2px; cursor: pointer;}',
    '.taskboard .taskmenu_list .taskmenu_item:hover {background-color: #ececec; }',
    '.taskboard .taskmenu_list {border: 1px solid #888888; background-color: #ffffff; position: absolute; z-index: 3; left: 157px; top: 30px; width: 90px;}',
    '.taskboard .taskmenutrap {bottom: 3px; color: #444444; overflow: hidden; position: absolute; text-overflow: ellipsis; white-space: nowrap; width: 74px;cursor: pointer; width: 12px; height: 12px; right: 10px;}',
    '.taskboard .taskofuser0 {width: 168px; height: 39px; margin-top: 4px; font-size: 9pt; position: relative; background-repeat: no-repeat; padding-left: 5px; cursor: move;background-image: url(vm/images/taskboxes/Task_box_0.gif);}',
    '.taskboard .tasktitle {padding-top: 3px; position: absolute; cursor: pointer; color: white; white-space: nowrap; word-break: normal; width: 94%; overflow: hidden;}'
].join(''));

});
    
