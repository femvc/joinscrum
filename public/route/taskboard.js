'use strict';
define('./taskboard', [], function(){

var taskboard = function(){
    bui.Action.call(this);
    /**
     * @name Action索引ID
     * @comment 主要用于控件中通过onclick="bui.Control.getById('listTable','login');
     */
    this.id = 'list';
    this.view = 'taskboard_layout';
    /**
     * @name 初始化数据模型
     */
    this.model = new bui.BaseModel({});
    this.BACK_LOCATION = '/login';
};
    
taskboard.prototype = {
    initModel: function(callback){
        var me = this;
        //me.getSprintData(callback);
        callback&&callback();
    },
    getSprintData: function (callback) {
        var me = this;
        me.count = 3;
        Requester.get('/scrum_api/user_list', {
            onsuccess: function (err, data) {
                me.model.set('user_list'   , bui.sortBy(data.result, '_id'));
                me.getSprintDataCallback(callback);
            }
        });
        Requester.get('/scrum_api/product_list', {
            onsuccess: function (err, data) {
                me.model.set('product_list'   , bui.sortBy(data.result, 'product_id'));
                me.getSprintDataCallback(callback);
            }
        });
        Requester.get('/scrum_api/sprint_list', {
            onsuccess: function (err, data) {
                me.model.set('sprint_list'   , bui.sortBy(data.result, 'sprint_id', 'desc'));
                me.getSprintDataCallback(callback);
            }
        });
    },
    getSprintDataCallback: function (callback) {
        this.count--;
        if (this.count<1) {
            this.count = 2;
            callback&&callback();
            //this.getTaskData(callback)
        }
    },
    render: function(){
        var me = this;
        // 注：还未执行bui.Control.init(),无法访问到me.getByFormName('taskboard')!!!
        //me.getByFormName('taskboard').addBacklogRow(me.model.get('backlog_list')[0]);
    },
    initBehavior: function(controlMap) {
        var me = this;
        
        // bui.Action.get().controlMap.vModal2.show();
        // me.controlMap.submit.onclick = bui.fn(me.onSubmit, me);
        var productList = me.getByFormName('product_list');
        var sprintList  = me.getByFormName('sprint_list' );
        var userList    = me.getByFormName('user_list' );
        productList.onchange = bui.fn(me.switchProduct, me);
        sprintList.onchange  = bui.fn(me.switchSprint, me);
        userList.onchange    = bui.fn(me.switchUser, me);
        
        me.getSprintData(function(){
            me.getByFormName('product_list').setOptions(me.model.get('product_list'));
            me.getByFormName('user_list'   ).setOptions(me.getUserList());
            
            me.getByFormName('product_list').setValue(bui.getCookie('taskboard_product'));
            me.getByFormName('user_list'   ).setValue(bui.getCookie('taskboard_user'));
            
            bui.g('welcome_user').innerHTML = me.getUserItem(bui.getCookie('mid')).user_name;
            
            me.switchProduct();
        });
        //me.switchProduct();
        
        bui.setCookie('task_lastmodify', ''); 
        me.checkTaskModify();
    },
    switchUser: function () {
        var me = this;
        me.highlightTask();
    },
    switchProduct: function(){
        var me = this,
            sprint_all = me.model.get('sprint_list'),
            sprint_list = [],
            product_id = me.getByFormName('product_list').getValue();
        for (var i=0,len=sprint_all.length; i<len; i++) {
            if (sprint_all[i].product_id == product_id) {
                sprint_list.push(sprint_all[i]);
            }
        }
        me.getByFormName('sprint_list').setOptions(sprint_list);
        me.getByFormName('sprint_list').setValue(bui.getCookie('selected_sprint'));
        
        bui.setCookie('taskboard_product', product_id)
        me.switchSprint();
    },
    switchSprint: function () {
        var me = this,
            sprint_id = me.getByFormName('sprint_list').getValue() || -1;
        
        bui.setCookie('selected_sprint', sprint_id);
        
        me.model.remove('backlog_list');
        me.model.remove('task_list');
        
        Requester.get('/scrum_api/backlog_list?sprint_id='+sprint_id, {
            onsuccess: function (err, data) {
                me.model.set('backlog_list'   , bui.sortBy(data.result, 'backlog_index', 'desc'));
                me.switchSprintCallback();
            }
        });
        var include_deleted = bui.g('include_deleted').checked;
        Requester.get('/scrum_api/task_list?sprint_id='+sprint_id + (include_deleted? '&include_deleted=all' : ''), {
            onsuccess: function (err, data) {
                //me.model.set('task_list'   , bui.sortBy(data.result, 'task_index'));
                me.model.set('task_list'   , data.result);
                me.switchSprintCallback();
            }
        });
        
        Requester.get('/scrum_api/taskindex_list?sprint_id='+sprint_id, {
            onsuccess: function (err, data) {
                //me.model.set('task_list'   , bui.sortBy(data.result, 'task_index'));
                me.model.set('taskindex_list'   , data.result);
                me.switchSprintCallback();
            }
        });

        Requester.get('/scrum_api/burden?sprint_id='+sprint_id, {
            onsuccess: function (err, data) {
                //me.model.set('task_list'   , bui.sortBy(data.result, 'task_index'));
                me.model.set('burden'   , data.result);
                me.switchSprintCallback();
            }
        });
        
        
    },
    switchSprintCallback: function () {
        var me = this,
            taskboard = me.getByFormName('taskboard');
        if (me.model.get('backlog_list') && me.model.get('task_list') && me.model.get('taskindex_list') && 
            me.model.get('burden')) {
            taskboard.taskList = me.sortTask();
            me.repaintTaskboard();
        }
    },
    sortTask: function () {
        var me = this,
            task_list = me.model.get('task_list'),
            taskindex_list = me.model.get('taskindex_list'),
            taskList = {},
            item,
            index = 1;
        for (var i=0,len=taskindex_list.length; i<len; i++) {
            item = JSON.parse(taskindex_list[i].taskindex);
            for (var j=0,len2=item.length; j<len2; j++) {
                if (!taskList[item[j]]) {
                    taskList[item[j]] = index++;
                }
            }
        }
        for (var i=0,len=task_list.length; i<len; i++) {
            task_list[i].task_index = taskList[task_list[i].task_id];
        }
        
        return bui.sortBy(task_list, 'task_index', 'ASC');
    },
    getUserList: function () {
        var me = this,
            list = me.model.get('user_list');
        for (var i=0,len=list.length; i<len; i++) {
            list[i].user_label = list[i].user_name + '(' + list[i].user_id + ')';
        }
        return list;        
    },
    getUserItem: function (id) {
        var me = this,
            list = me.model.get('user_list'),
            item = null;
        id = id === '' ? 'unspecified' : id;
        
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].user_id == id) {
                item = list[i];
                break;
            }
        }
        return item;        
    },
    getProduct: function (id) {
        var me = this,
            list = me.model.get('product_list'),
            item = null;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].product_id == id) {
                item = list[i];
                break;
            }
        }
        return item;        
    },
    getSprint: function (id) {
        var me = this,
            list = me.model.get('sprint_list'),
            item = null;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].sprint_id == id) {
                item = list[i];
                break;
            }
        }
        return item;        
    },
    getBacklogItem: function (id) {
        var me = this,
            list = me.model.get('backlog_list'),
            item = null;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].backlog_id == id) {
                item = list[i];
                break;
            }
        }
        return item;        
    },
    getTaskItem: function (id) {
        var me = this,
            list = me.model.get('task_list'),
            item = null;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].task_id == id) {
                item = list[i];
                break;
            }
        }
        return item;        
    },
    /**
     * @name 新增backlog
     * @public
     */
    addBacklog: function () {
        this.editBacklog();
    },
    /**
     * @name 修改backlog
     * @public
     * @param {string} [backlog_id] 
     */
    editBacklog: function (backlog_id) {
        var me = this,
            nc = bui.Control.getById('editBacklog', me),
            sprint_id = me.getByFormName('sprint_list').getValue(),
            backlogValue,
            backlogItem;
        
        // 确定backlogItem的值
        backlogValue = {sprint_id: sprint_id};
        if (backlog_id) {
            backlogItem = me.getBacklogItem(backlog_id);
            if (backlogItem) {
                backlogValue.backlog_id     = backlogItem.backlog_id;
                backlogValue.backlog_name   = backlogItem.backlog_name;   
                backlogValue.backlog_desc   = backlogItem.backlog_desc;
                backlogValue.backlog_index  = backlogItem.backlog_index;  
                backlogValue.sprint_id      = backlogItem.sprint_id;      
            }
        }
        // 弹出对话框
        if (nc) {
            nc.dispose();
        }
        nc = bui.Control.create('Modal', {
            id: 'editBacklog', 
            title: backlog_id ? ' Edit Backlog' : ' Add Backlog', 
            contentView: 'taskboard_addbacklog', 
            size: { width:'500px', height: '310px', bottom: '8%'}
        });
        nc.appendSelfTo(this);
        // 绑定事件
        nc.doAction_save = new Function('bui.Action.get().saveBacklog()');
        
        nc.setValueByTree(backlogValue);
        nc.show();
    },
    saveBacklog: function () {
        var me = this;
        var nc = bui.Control.getById('editBacklog', me),
            taskboard = me.getByFormName('taskboard');
        
        if (nc && nc.validate()) {
            var backlogValue = nc.getParamMap();
            
            Requester.get(backlogValue.backlog_id ? '/scrum_api/backlog_edit' : '/scrum_api/backlog_add', {
                data: backlogValue,
                onsuccess: bui.fn(me.saveBacklogCallback, me)
            });
        }
    },
    saveBacklogCallback: function (err, data) {
        var me = this;
        if (data.success == 'true') {
            // 销毁对话框
            bui.Control.getById('editBacklog', me).dispose();
            
            me.switchSprint(); 
        }
    },
    repaintTaskboard: function () {
        var me = this,
            taskboard = me.getByFormName('taskboard');
        taskboard.removeBacklogRow('all');
        
        taskboard.product_key = me.getProduct(me.getByFormName('product_list').getValue()).product_key;
        taskboard.backlogList = me.model.get('backlog_list');
        
        taskboard.setBacklogList();
        taskboard.setTaskList();

        me.highlightTask();
        
        var burden = me.model.get('burden');
        var labels = [], 
            datasets = [];
        for (var i in burden) {
            if (i) {
                labels.push(i);
                datasets.push(Number(burden[i]));
            }
        }
        var barChartData = {
            animation: false,
			labels : labels, //['January','February','March','April','May','June','July'],
			datasets : [
				{
					fillColor   : 'rgba(242,91,8,1)',
					strokeColor : 'rgba(242,91,8,1)',
					data : datasets //[65,59,90,81,56,55,20]
				}
			],
            scaleStartValue: 0
			
		}

	    var myLine = new Chart(document.getElementById('chartBurden').getContext('2d')).Bar(barChartData);
    },
    
    /**
     * @name 操作task
     * @public
     */
    takeTask: function (task_id) {
        var me = this,
            user_id = me.getByFormName('user_list').getValue(),
            taskItem = me.getTaskItem(task_id);
        taskItem.task_person    = user_id;
        taskItem.task_deleted   = '';
        
        me.saveTask(taskItem);
    },
    moveTask: function (task) {
        var me = this,
            task_id = task.elem.id.split('_')[1],
            str = task.elem.parentNode.id.split('_'),
            taskItem = me.getTaskItem(task_id);
        taskItem.task_status    = str[0];
        taskItem.backlog_id     = str[1];
        taskItem.task_remaining = taskItem.task_status == 'done' ? 0 : taskItem.task_remaining;
        taskItem.task_deleted   = '';
        
        me.saveTask(taskItem);
    },
    deleteTask: function (task_id) {
        var me = this,
            user_id = me.getByFormName('user_list').getValue(),
            taskItem = me.getTaskItem(task_id);
        taskItem.task_deleted   = 'deleted';
        
        me.saveTask(taskItem);
    },
    /**
     * @name 新增task
     * @public
     */
    addTask: function(backlog_id) {
        var me = this,
            users = me.model.get('user_list'),
            sprint_id = me.getByFormName('sprint_list').getValue(),
            taskItem = {};
        taskItem.sprint_id  = sprint_id;
        taskItem.backlog_id = backlog_id;
        //alert(objId);
        me.editTask(taskItem);
    },
    /**
     * @name 修改task
     * @public
     * @param {string} [task_id] 
     */
    editTask: function (taskItem) {
        var me = this;
        
        taskItem = !taskItem.sprint_id ? me.getTaskItem(taskItem) : taskItem;
        
        var nc = bui.Control.getById('editTask', me);
        if (nc) {
            nc.dispose();
        }
        
        // 弹出对话框
        nc = bui.Control.create('Modal', {
            id: 'editTask', 
            title: '',  
            contentView: 'taskboard_addtask', 
            size: { width:'750px', height: '500px', bottom: '8%'}
        });
        nc.appendSelfTo(this);
        // 绑定事件
        nc.doAction_save = new Function('bui.Action.get().saveTask()');
        
        nc.setTitle(taskItem.task_name ? ' Edit Task - ' + taskItem.task_name + '' : 
                    ' Add Task to - ' + me.getBacklogItem(taskItem.backlog_id).backlog_name + '');
        // 必须先初始化options，否则task_person无法setValue!!
        nc.getByFormName('task_person').setOptions(me.getUserList());
        nc.getByFormName('task_person').setValue(bui.getCookie('taskboard_user'));
        // 默认解除deleted状态
        taskItem.task_deleted = '';
        nc.setValueByTree(taskItem);
        nc.show();
        
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
            // 保存任务上下次序
            if (taskValue.task_id) {
                me.saveTaskIndex(taskValue);
            }
        }
    },
    saveTaskCallback: function (err, data) {
        var me = this;
        if (data.success == 'true') {
            var taskboard = me.getByFormName('taskboard'),
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
                taskboard.deleteTask(taskValue);
            }
            else if (bui.g('task_'+taskValue.task_id)) {
                taskboard.updateTask(taskValue);
                bui.removeClass(bui.g('task_'+taskValue.task_id), 'deleted');
            }
            else {
                taskboard.addTask(taskValue);
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
            sprint_id = me.getByFormName('sprint_list').getValue(),
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
            user_id = me.getByFormName('user_list').getValue(),
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
        
        bui.setCookie('taskboard_user', user_id);
        
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
    /**
     * @name 修改Product
     * @public
     * @param {string} [product_id] 
     */
    addProduct: function () {
        this.editProduct('new');
    },
    editProduct: function (isNew) {
        var me = this,
            nc = bui.Control.getById('editProduct', me),
            product_id = me.getByFormName('product_list').getValue(),
            productValue,
            productItem;
        
        // 确定productItem的值
        productValue = {};
        if (isNew != 'new') {
            productItem = me.getProduct(product_id);
            if (productItem) {
                productValue.product_id     = productItem.product_id;
                productValue.product_name   = productItem.product_name;   
                productValue.product_key    = productItem.product_key;    
                productValue.product_index  = productItem.product_index;      
            }
        }
        // 弹出对话框
        if (nc) {
            nc.dispose();
        }
        nc = bui.Control.create('Modal', {
            id: 'editProduct', 
            title: product_id ? ' Edit Product' : ' Add Product', 
            contentView: 'taskboard_addproduct', 
            size: { width:'500px', height: '310px', bottom: '8%'}
        });
        nc.appendSelfTo(this);
        // 绑定事件
        nc.doAction_save = new Function('bui.Action.get().saveProduct()');
        
        nc.setValueByTree(productValue);
        nc.show();
    },
    saveProduct: function () {
        var me = this;
        var nc = bui.Control.getById('editProduct', me);
        
        if (nc && nc.validate()) {
            var productValue = nc.getParamMap();
            
            Requester.get(productValue.product_id ? '/scrum_api/product_edit' : '/scrum_api/product_add', {
                data: productValue,
                onsuccess: bui.fn(me.saveProductCallback, me)
            });
        }
    },
    saveProductCallback: function (err, data) {
        var me = this;
        if (data.success == 'true') {
            // 销毁对话框
            bui.Control.getById('editProduct', me).dispose();
            
            bui.setCookie('taskboard_product', data.result[0].product_id);
            bui.Locator.reload();
        }
    },
    /**
     * @name 修改Sprint
     * @public
     * @param {string} [sprint_id] 
     */
    addSprint: function () {
        this.editSprint('new');
    },
    editSprint: function (isNew) {
        var me = this,
            nc = bui.Control.getById('editSprint', me),
            product_id = me.getByFormName('product_list').getValue(),
            sprint_id  = me.getByFormName('sprint_list').getValue(),
            sprintValue,
            sprintItem;
        
        // 确定sprintItem的值
        sprintValue = {product_id: product_id};
        if (isNew != 'new') {
            sprintItem = me.getSprint(sprint_id);
            if (sprintItem) {
                sprintValue.sprint_id     = sprintItem.sprint_id;
                sprintValue.sprint_name   = sprintItem.sprint_name;   
                sprintValue.sprint_desc   = sprintItem.sprint_desc;  
                sprintValue.sprint_index  = sprintItem.sprint_index; 
                sprintValue.product_id    = sprintItem.product_id;      
            }
        }
        // 弹出对话框
        if (nc) {
            nc.dispose();
        }
        nc = bui.Control.create('Modal', {
            id: 'editSprint', 
            title: sprint_id ? ' Edit Sprint' : ' Add Sprint', 
            contentView: 'taskboard_addsprint', 
            size: { width:'500px', height: '310px', bottom: '8%'}
        });
        nc.appendSelfTo(this);
        // 绑定事件
        nc.doAction_save = new Function('bui.Action.get().saveSprint()');
        
        nc.setValueByTree(sprintValue);
        nc.show();
    },
    saveSprint: function () {
        var me = this;
        var nc = bui.Control.getById('editSprint', me);
        
        if (nc && nc.validate()) {
            var sprintValue = nc.getParamMap();
            
            Requester.get(sprintValue.sprint_id ? '/scrum_api/sprint_edit' : '/scrum_api/sprint_add', {
                data: sprintValue,
                onsuccess: bui.fn(me.saveSprintCallback, me)
            });
        }
    },
    saveSprintCallback: function (err, data) {
        var me = this;
        if (data.success == 'true') {
            // 销毁对话框
            bui.Control.getById('editSprint', me).dispose();
            
            bui.setCookie('selected_sprint', data.result[0].sprint_id);
            bui.Locator.reload();
        }
    }
};

bui.inherits(taskboard, bui.Action);

bui.window.taskboard = taskboard;
});