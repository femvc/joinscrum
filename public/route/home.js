'use strict';
define('./home', [], function(){

var home = function(){
    bui.Action.call(this);
    /**
     * @name Action索引ID
     * @comment 主要用于控件中通过onclick="bui.Control.getById('listTable','login');
     */
    this.id = 'list';
    this.view = 'home_layout';
    /**
     * @name 初始化数据模型
     */
    this.model = new bui.BaseModel({});
    this.BACK_LOCATION = '/';
};
    
home.prototype = {
    initModel: function(callback){
        var me = this;
        //me.getSprintData(callback);
        callback&&callback();
    },
    getSprintData: function (callback) {
        var me = this;
        
        Requester.get('/scrum_api/burden?sprint_id=', {
            onsuccess: function (err, data) {
                me.model.set('burden'   , data.result));
                callback&&callback();
                //me.getSprintDataCallback(callback);
            }
        });
    },
    getSprintDataCallback: function (callback) {
        
        callback&&callback();
    },
    render: function(){
        var me = this;
        // 注：还未执行bui.Control.init(),无法访问到me.getByFormname('home')!!!
        //me.getByFormname('home').addBacklogRow(me.model.get('backlog_list')[0]);
    },
    initBehavior: function(controlMap) {
        var me = this;
        
        // bui.Action.get().controlMap.vModal2.show();
        // me.controlMap.submit.onclick = bui.fn(me.onSubmit, me);
        var productList = me.getByFormname('product_list');
        var sprintList  = me.getByFormname('sprint_list' );
        var userList    = me.getByFormname('user_list' );
        productList.onchange = bui.fn(me.switchProduct, me);
        sprintList.onchange  = bui.fn(me.switchSprint, me);
        userList.onchange    = bui.fn(me.switchUser, me);
        
        me.getSprintData(function(){
            me.getByFormname('product_list').setOptions(me.model.get('product_list'));
            me.getByFormname('sprint_list' ).setOptions(me.model.get('sprint_list'));
            me.getByFormname('user_list'   ).setOptions(me.getUserList());
            
            me.getByFormname('user_list'   ).setValue(bui.getCookie('mid'));
            
            bui.g('welcome_user').innerHTML = me.getUserItem(bui.getCookie('mid')).user_name;
            
            me.switchProduct();
        });
        //me.switchProduct();
        
        bui.setCookie('task_lastmodify', ''); 
        me.checkTaskModify();
    },
    saveTask: function (taskValue) {
        var me = this;
        
        if (!taskValue) {
            var nc = bui.Control.getById('editTask', me);
            taskValue =  nc && nc.validate() ? nc.getParamMap() : null;
        }
        
        if (taskValue) {
            taskValue.backlog_id = Number(taskValue.backlog_id);
            
            if (!bui.isEqual(taskValue, me.getTaskItem(taskValue.task_id))) {
                // 自己修改的，无需显示刷新提示
                bui.setCookie('task_lastmodify', '');
                
                Requester.get(taskValue.task_id ? '/scrum_api/task_edit' : '/scrum_api/task_add', {
                    data: taskValue,
                    onsuccess: bui.fn(me.saveTaskCallback, me)
                });
            }
        }
    },
    saveTaskCallback: function (err, data) {
        var me = this;
        if (data.success == 'true') {
            var home = me.getByFormname('home'),
                list = me.model.get('task_list'),
                isAdd = true,
                taskValue = data.result[0];
            // 注：更新task_list
            for (var i=0,len=list.length; i<len; i++) {
                if (list[i].task_id === taskValue.task_id) {
                    list[i] = taskValue;
                    isAdd = false; 
                    list[i].task_deleted === 'deleted' && list.splice(i, 1);
                    break;
                }
            }
            isAdd && list.push(taskValue);
            
            //me.model.set('task_list'   , bui.sortBy(list, 'task_index', 'desc'));
            me.model.set('task_list'   , list);
            
            // 添加到任务板上
            if (String(taskValue.task_deleted) === 'deleted') {
                home.deleteTask(taskValue);
            }
            else if (bui.g('task_'+taskValue.task_id)) {
                home.updateTask(taskValue);
                bui.removeClass(bui.g('task_'+taskValue.task_id), 'deleted');
            }
            else {
                home.addTask(taskValue);
            }
            
            // 销毁对话框
            var editTask = bui.Control.getById('editTask', me);
            editTask&&editTask.dispose();
            
            // 高亮任务
            me.highlightTask();
            
            // 新增任务需保存上下次序
            isAdd && me.saveTaskIndex(taskValue);
        }
    },
    saveTaskIndex: function (taskValue) {
        var me = this,
            task_id = taskValue.task_id,
            backlogItem = bui.g('task_' + task_id).parentNode,
            str = backlogItem.id.split('_'),
            task_status = str[0],
            backlog_id = str[1],
            sprint_id = me.getByFormname('sprint_list').getValue(),
            list = backlogItem.childNodes,
            taskindex = [];
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i] && list[i].className && (' ' + list[i].className + ' ').indexOf(' task ') != -1) {
                taskindex.push(list[i].id.split('_')[1]);
            }
        }
        
        Requester.get('/scrum_api/taskindex_save', {
            data: { 
                backlog_id: backlog_id,
                task_status: task_status,
                sprint_id: sprint_id,
                taskindex: JSON.stringify(taskindex)
            },  
            onsuccess: new Function()
        });

    },
    highlightTask: function () {
        var me = this,
            user_id = me.getByFormname('user_list').getValue(),
            list = bui.c('task'),
            task_person;
        for (var i=0,len=list.length; i<len; i++) {
            task_person = bui.c('pointperson', list[i])[0];
            if (task_person.getAttribute('task_person') == user_id) {
                bui.addClass(list[i], 'taskofuser0');
            }
            else {
                bui.removeClass(list[i], 'taskofuser0');
            }
        }
        
    },
    checkTaskModify: function () {
        var me = this;
        Requester.get('/scrum_api/task_lastmodify?rand=' + Math.random(), {
            onsuccess: bui.fn(me.checkTaskModifyCallback, me)
        });
    },
    checkTaskModifyCallback: function (err, data) {
        var me = this,
            task_lastmodify = String(bui.getCookie('task_lastmodify')),
            last_log = data.result[0] ? data.result[0] : {_id: '0'};
        
        if (task_lastmodify && task_lastmodify !== String(last_log._id)) {
            bui.g('needsUpdate').style.display = 'block';
        }
        else {            
            bui.setCookie('task_lastmodify', last_log._id);
            
            me.checkTaskModifyTimer = window.setTimeout(function(){me.checkTaskModify();}, 30000);
        }
        
    },
    
};

bui.inherits(home, bui.Action);

bui.window.home = home;
});
