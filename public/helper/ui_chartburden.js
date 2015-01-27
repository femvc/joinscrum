'use strict';
//    ____     ____                _   _     ____          ____      ____                   
//  /\  __\  /\  __\    /'\_/`\  /\ \/\ \  /\  __`\      /\  __`\  /\  __`\    /'\_/`\      
//  \ \ \_/_ \ \ \_/_  /\      \ \ \ \ \ \ \ \ \ \_\     \ \ \ \_\ \ \ \ \ \  /\      \     
//   \ \  __\ \ \  __\ \ \ \_/\_\ \ \ \ \ \ \ \ \  __     \ \ \  __ \ \ \ \ \ \ \ \_/\_\    
//    \ \ \_/  \ \ \_/_ \ \ \\ \ \ \ \ \_/ \ \ \ \_\ \  __ \ \ \_\ \ \ \ \_\ \ \ \ \\ \ \   
//     \ \_\    \ \____/ \ \_\\ \_\ \ `\___/  \ \____/ /\_\ \ \____/  \ \_____\ \ \_\\ \_\  
//      \/_/     \/___/   \/_/ \/_/  `\/__/    \/___/  \/_/  \/___/    \/_____/  \/_/ \/_/  
//                                                                                          
//                                                                                          

/**
 * @name 按钮控件
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./bui.ChartBurden', ['./bui', './bui.Control', './bui.Modal'], function(){


bui.ChartBurden = function (options, pending) {
    bui.ChartBurden.superClass.call(this, options, 'pending');
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'ChartBurden';
    
    //进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.ChartBurden.prototype = {
    product_key: '',
    /**
     * @name ChartBurden的html模板
     * @private
     */
    getChartBurdenRowTpl: function () {
        var str = 
        '<table>' +
            '<tr>' +
                '<td class="ChartBurdenCell pbiCell" id="pbi_#{backlog_id}">#{pbi_info}</td>' +
                '<td class="ChartBurdenCell" id="notstarted_#{backlog_id}" style="position: relative;"></td>' +
                '<td class="ChartBurdenCell" id="impeded_#{backlog_id}" style="position: relative;"></td>' +
                '<td class="ChartBurdenCell" id="inprogress_#{backlog_id}" style="position: relative;"></td>' +
                '<td class="ChartBurdenCell" id="done_#{backlog_id}" style="position: relative;"></td>' +
            '</tr>' +
        '</table>';
        return str;
    },
    getBacklogTpl: function () {
        var str = 
        '<div>' +
            '<span ondblclick="bui.Action.get().editBacklog(\'#{backlog_id}\')">' + 
            '<span class="pbikey"   id="pbikey_#{backlog_id}">(#{product_key}-#{backlog_id})</span>&nbsp;' +
            '<span class="pbititle" id="pbititle_#{backlog_id}">#{backlog_name}</span></span><br><br><br>' +
            '<div  class="pbidesc"  id="pbidesc_#{backlog_id}">#{backlog_desc}</div>' +
        '</div>' +
        '<div style="width: 100%; height: 30px;">' +
            '<div class="pbiestimate">Estimate: - #{backlog_estimate}</div>' +
            '<div class="pbidone"><input type="checkbox" id="markdone_#{backlog_id}" onclick="bui.Action.get().doneBacklog(this)" ><label for="markdone_#{backlog_id}">Done</label></div>' +
        '</div>' +
        '<div style="width: 100%; height: 30px;">' +
            '<div id="person_#{backlog_id}"></div>' +
            '<img title="Add Task" src="vm/img/add-task-active.gif" id="addtask_#{backlog_id}" style="cursor: pointer;" onclick="bui.Action.get().addTask(\'#{backlog_id}\')" class="addtask">' +
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
            '<div class="tasktitle" ondblclick="bui.Action.get().editTask(\'#{task_id}\')" id="tasktitle_#{task_id}" title="#{task_name}">#{task_name}</div>' +
            '<div class="draghandle">' +
                '<div class="taskhours">Hrs: <span id="hours_#{task_id}">#{task_remaining}</span></div>' +
                '<div class="pointperson" id="pp_#{task_id}" task_person="#{task_person}">#{user_label}</div>' +
            '</div>' +
            '<div class="taskmenutrap" onclick="bui.g(\'menu_#{task_id}\').style.display=\'block\'" onmouseout="bui.g(\'menu_#{task_id}\').onmouseout()">&nbsp;</div>' +
            '<div class="taskmenu_list" style="display:none;" '+
                ' id="menu_#{task_id}" onmouseover="window.clearTimeout(this.timer)" ' +
                ' onmouseout="var me=this;me.timer=window.setTimeout(function(){me.style.display=\'none\';}, 500);">' +
                '<div class="taskmenu_item" onclick="bui.Action.get().takeTask(\'#{task_id}\')">Take Task</div>' +
                '<div class="taskmenu_item" onclick="bui.Action.get().editTask(\'#{task_id}\')">Edit Task</div>' +
                '<div class="taskmenu_item" onclick="bui.Action.get().deleteTask(\'#{task_id}\')">Delete Task</div>' +
            '</div>';
        return str;
    },
    /**
     * @name 渲染控件
     * @public
     */
    render: function () {
        bui.ChartBurden.superClass.prototype.render.call(this);
        var me   = this,
            main = me.getMain(),
            innerDiv;
        
        me.setInnerHTML(me.getChartBurdenTpl());
    },
    addBacklogRow: function (backlogValue) {
        var me = this,
            ChartBurden = bui.g('ChartBurden'),
            row = bui.dom.createElement('DIV'),
            pbi_info,
            table,
            tr;
        backlogValue.product_key = me.product_key;
        pbi_info = bui.Control.format(me.getBacklogTpl(), backlogValue);
        
        row.innerHTML = bui.Control.format(me.getChartBurdenRowTpl(), {
            backlog_id: backlogValue.backlog_id,
            pbi_info: pbi_info
        });
        
        // fixme: bui.dom.getElementsByTagName('TABLE', div) 等于document.getElementsByTagName('TABLE'), 因此不会获取到新创建的table!!
        // tr = bui.dom.getElementsByTagName('TABLE', div)[0].rows[0];
        table = row.childNodes[0];
        table = String(table.tagName).toUpperCase() == 'TABLE' ? table : row.childNodes[1];
        tr = table.rows[0];
        ChartBurden.appendChild(tr);
        ChartBurden.insertBefore(tr, ChartBurden.rows[0]);
        
        Droppables.add(bui.g('notstarted_' + backlogValue.backlog_id));
        Droppables.add(bui.g('impeded_'     + backlogValue.backlog_id));
        Droppables.add(bui.g('inprogress_' + backlogValue.backlog_id));
        Droppables.add(bui.g('done_'        + backlogValue.backlog_id));
    },
    addTask: function(task){
        var me = this,
            backlog_id = task.backlog_id,
            status = task.task_status,
            td,
            taskElem,
            tmpContainer = bui.dom.createElement('DIV');
        
        // todo
        tmpContainer.innerHTML = bui.Control.format(me.getTaskTpl(), task);
        taskElem = tmpContainer.childNodes[0];
        taskElem = taskElem&&taskElem.tagName ? taskElem : tmpContainer.childNodes[1];
        td = bui.g(status + '_' + backlog_id);
        td.appendChild(taskElem);

        me.updateTask(task);
        
        Draggable('task_'+task.task_id, {
            //preventDefault: true,
            start: function(){
                var me = this;
                me.startTime = new Date();
            },
            end:function(){
                bui.Action.get().moveTask(this);
            }
        });
        
    },
    updateTask: function(task){
        var me = this,
            u = bui.Action.get().getUserItem(task.task_person);
        task.task_remaining = task.task_remaining === '' ? '-' : task.task_remaining;
        task.user_label = u.user_name + '(' + u.user_id + ')';
        
        var taskElem = bui.g('task_'+task.task_id);
        if (taskElem) {
            taskElem.innerHTML = bui.Control.format(me.getTaskContentTpl(), task);
        }
    },
    deleteTask: function(task){
        var me = this;
        // todo
        var taskElem = bui.g('task_'+task.task_id);
        if (taskElem) {
            var parentNode = taskElem.parentNode;
            parentNode.removeChild(taskElem);
        }
    },
    setBacklogList: function () {
        var me = this;
        var backlogList = me.backlogList;
        for (var i=0,len=backlogList.length; i<len; i++) {
            me.addBacklogRow(backlogList[i]);
        }
    },
    setTaskList: function () {
        var me = this;
        var taskList = me.taskList;
        for (var i=0,len=taskList.length; i<len; i++) {
            me.addTask(taskList[i]);
        }
    },
    removeBacklogRow: function (list) {
        var me = this,
            ChartBurden = bui.g('ChartBurden');
        if (list == 'all') {
            ChartBurden.innerHTML = '';
        }
    }
    
    
};

/*通过bui.Control派生bui.ChartBurden*/
//bui.Control.derive(bui.ChartBurden);
/* bui.ChartBurden 继承了 bui.Control */
bui.inherits(bui.ChartBurden, bui.Control);


});
