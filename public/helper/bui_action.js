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
 * @name @name 页面流程控制类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./bui.Action', ['./bui'], function(){

bui.Action = function(options){
    // 防止重复执行!!
    if (this.baseConstructed) {return this;}
    bui.EventDispatcher.call(this);
    /**
     * @name Action的页面主元素ID[容器]
     * @public
     * @return {Map}
     */
    this.main  = null;
    /**
     * @name Action的模板名
     * @public
     * @return {String}
     */
    this.view = null;
    /**
     * @name Action实例化时需要提前加载的model数据
     * @public
     * @return {Map}
     */
    this.PARAM_MAP = {};
    /**
     * @name Action的数据模型
     * @public
     * @return {Map}
     */
    var baseModel = bui.Action.getExtClass('bui.BaseModel'); 
    this.model = new baseModel();
    /**
     * @name Action的顶层控件容器
     * @public
     * @return {Map}
     */
    this.controlMap = {};
    // 声明类型
    this.type = 'action';
    
    // 保存参数
    if (options) {
        this.initOptions(options);
    }
    // 是否执行过构造过程
    this.baseConstructed = true;
    
    bui.Action.push(this);

    // enterAction需要在实例化时调用，这里不能直接进!
    // this.enterAction()
};

bui.Action.prototype = {
    /**
     * @name 设置参数
     * @protected
     * @param {Object} options 参数集合
     * @private
     */
    initOptions: function ( options ) {
        for ( var k in options ) {
            this[ k ] = options[ k ];
        }
    },
    getId: function () {
        return this.id;
    },
    /**
     * @name 获取视图模板名
     * @protected
     * @return {String} target名字
     * @default 默认为action的id
     */
    getView: function(){
        var view = (this.view == null ? this.id : this.view);
        // 获取view
        if(typeof view === 'function'){
            view = view();
        }
        view = bui.Action.getExtClass('bui.Template').getTarget(String(view));
        
        return view;
    },
    /**
     * @name Action的主要处理流程
     * @protected
     * @param {Object} argMap arg表.
     */
    enterAction : function(args){
        var me = this,
            que;
        // 创建一个异步队列     
        que = new bui.asyque(); // 注：可以参照src/er/asyque.js文件。非常简单，不到30行代码
        que.push(function(next){var me = this;
            // [nodejs&browser]
            var main = me.getMain();
            if (!bui.dom && main && main.setInnerHTML) {
                bui.dom = bui.bocument;
            }
            bui.dom = bui.dom || document;
            
            // 设为活动action 
            me.active = true;
            
            // 开始执行Action的处理流程
            me.trigger('ENTER_ACTION', me);
            
            // 默认创建一个DIV作为主元素
            if (!me.main){
                me.main = bui.Action.makeGUID(me.id);
                if (!bui.dom.getElementById(me.main)) {
                    var mainElem = bui.dom.createElement('DIV');
                    mainElem.id = me.main;
                    bui.dom.getElementById(bui.mainId).appendChild(mainElem);
                }
            }
            me.getMain().action = me;    
            // 保存通过URL传过来的参数
            me.args = args;
            
            // 判断model是否存在，不存在则新建一个
            if (!me.model) {
                var baseModel = bui.Action.getExtClass('bui.BaseModel'); 
                me.model = new baseModel();
            }
            
            me.trigger('LOAD_MODEL', me);
            var k;
            // 先将PARAM_MAP中的key/value装入model
            for(k in me.PARAM_MAP){ 
                if(k){ 
                    me.model.set(k, me.PARAM_MAP[k]); 
                }
            }
        
        next&&next();}, me);
        
        // 初始化Model
        que.push(me.initModel, me);
        
        que.push(function(next){var me = this;
        
            // 触发MODEL_LOADED事件
            me.trigger('MODEL_LOADED', me);
            // 触发LOAD_VIEW事件
            me.trigger('LOAD_VIEW', me);
        
        next&&next();}, me);
        
        // 初始化View
        que.push(me.initView,me);
        
        que.push(function(next){var me = this;
            // 触发VIEW_LOADED事件
            me.trigger('VIEW_LOADED', me);
            
        next&&next();}, me);
        
        que.push(function(next){var me = this;
            var mainHTML,
                tpl;
            // 渲染视图
            me.trigger('BEFORE_RENDER', me);
            if (me.main){
                tpl = me.
                    getView();
                mainHTML = bui.Action.getExtClass('bui.Template').merge(tpl, me.model.getData());
                me.setInnerHTML(mainHTML);
            }
            me.render();
            me.rendered = true;
            
            // 渲染当前view中的控件
            bui.Action.getExtClass('bui.Control').init(me.getMain(), me.model, me);
            
            me.trigger('AFTER_RENDER', me);
            
            // 控件事件绑定
            me.initBehavior(me.controlMap);
            // me.checkAuthority();
            me.trigger('ACTION_READY', me);

            // bui.Action.getExtClass('bui.Mask').hideLoading();
            // 渲染结束，检查渲染期间是否有新请求
            bui.Action.getExtClass('bui.Master').checkNewRequest();
        
        next&&next();}, me);

        que.next();
    },
    /**
     * @name 初始化数据模型
     * @protected
     * @param {Object} argMap 初始化的参数.
     */
    initModel: function(callback){
        callback&&callback();
    },
    /**
     * @name 初始化视图[target的二次处理,如替换引用部分等]
     * @protected
     * @param {Object} argMap 初始化的参数.
     */
    initView: function(callback){
        callback&&callback();
    },
    
    /**
     * @name 绘制当前action的显示
     * @protected
     * @param {HTMLElement} dom 绘制区域的dom元素.
     */
    render: function(){},
    /**
     * @name 获取控件的elem(nodejs). 注:控件即使不需要显示任何内容也必须有一个挂载的elem(可以是隐藏的),
     * 通过模板解析控件时会用到 [nodejs&browser]
     * @public
     * @return {String}
     */
    getMain: function () {
        var me = this,
            elem;
        elem = bui.dom ? bui.dom.getElementById(me.main) : null;
        return elem;
    },
    /**
     * @name 获取控件的innerHTML
     * @public
     * @param {HTMLElement} elem 默认为控件主DOM[可选]
     * @return {String}
     */
    getInnerHTML: function (elem) {
        var me = this,
            elem = elem || me.getMain(),
            html = '';
        if (elem.getInnerHTML) {
            html = elem.getInnerHTML();
        }
        else if (elem.innerHTML !== undefined) {
            html = elem.innerHTML;
        }
        return html;
    },
    /**
     * @name 设定控件的innerHTML[nodejs&browser]
     * @public
     * @param {String} html innerHTML
     * @param {HTMLElement} elem 默认为控件主DOM[可选]
     * @return {String}
     */
    setInnerHTML: function (html, elem) {
        var me = this,
            elem = elem || me.getMain();
        if (elem.setInnerHTML) {
            elem.setInnerHTML(html);
        }
        else if (elem.innerHTML !== undefined) {
            elem.innerHTML = html;
        }
    },
    /**
     * @name 初始化列表行为
     * @public
     * @param {Object} controlMap 当前主内容区域绘制的控件集合.
     */
    initBehavior: function(controlMap){},
    /**
     * @name 根据当前用户权限进行相应设置
     *
     */
    // checkAuthority: function(){},
    
    /**
     * @name Action验证外部接口
     * @public
     */
    validate: function(){
        return bui.Action.getExtClass('bui.Control').prototype.validate.call(this);
    },
    /**
     * @name Action获取表单提交接口
     * @public
     */
    getParamMap: function(){
        return bui.Action.getExtClass('bui.Control').prototype.getParamMap.call(this);
    },
    /**
     * @name Action获取提交字符串接口
     * @public
     */
    getParamString: function(){
        return bui.Action.getExtClass('bui.Control').prototype.getParamString.call(this);
    },
    /**
     * @name 验证并提交数据
     * @public
     */
    validateAndSubmit: function() {
        return bui.Action.getExtClass('bui.Control').prototype.validateAndSubmit.call(this);
    },
    /**
     * @name 根据控件formName找到对应控件
     * @static
     * @param {String} 控件formName
     */
    getByFormName: function(formName){
        return bui.Control.getByFormName(formName, this);
    },
    /**
     * @name 提交完成的事件处理函数,提示完成
     * @private
     * @param {Object} data 提交的返回数据.
     */
    onsubmitfinished: function(data) {
        // cb.notice(data.message);
    },
    /**
     * @name 释放控件
     * @protected
     */
    dispose: function() {
        var me = this,
            controlMap = me.controlMap,
            main = me.getMain(),
            model = me.model;
        
        me.trigger('BEFORE_LEAVE', me);
        me.leave();
        
        // dispose子控件
        if (controlMap) {
            for (var k in controlMap) {
                controlMap[k].dispose();
                delete controlMap[k];
            }
        }
        me.controlMap = {};

        // 释放控件主区域的事件以及引用
        if (main) {
            main.onmouseover = null;
            main.onmouseout = null;
            main.onmousedown = null;
            main.onmouseup = null;
            
            if (main.innerHTML) {
                main.innerHTML = '';
            }
            if (main.setInnerHTML) {
                main.setInnerHTML('');
            }
            
        }
        
        if (model) {
            model.dispose();
            me.model = undefined;
        }
        
        me.rendered = null;
        me.active = null;
        me.trigger('LEAVE', me);
        
        me.clear();
    },
    /**
     * @name 后退
     * @protected
     */
    back: function() {
        bui.Action.getExtClass('bui.Master').back();
    },
    /**
     * @name 退出
     * @public
     */
    leave: function() {}
};

bui.inherits(bui.Action, bui.EventDispatcher);

/**
 * @name Action的静态属性[索引Action]
 */
bui.Action.list = [];
/**
 * @name 索引Action类派生出action
 * @public
 * @param {Object} action 对象
 */
bui.Action.push = function(action){
    if(bui.Action.get[action.id] && bui.window.console) {
        bui.window.console.error('Action ID: "' + action.id + '" already exist.');
    }
    
    bui.Action.list.push(action);
};
/**
 * @name 移除action的索引
 *
 * @param {Object} action 对象
 * @public
 */
bui.Action.removeActionIndex = function(action){
    var map = bui.Action.list,
        i;
    for (i in map) {
        if (map[i] == action) {
            map[i] = undefined;
        }
    }
};
/**
 * @name 通过Action类派生出action
 *
 * @param {Object} action 对象
 * @public
 */
bui.Action.derive = function(action){
    var me,
        i,
        instance,
        func = function(){},
        type = Object.prototype.toString.call(action);
    // 传进来的是一个Function
    if (type == '[object Function]'){
        bui.inherits(action, bui.Action);
        bui.inherits(func, action);
        
        // 相当于在传入的构造函数最前面执行bui.Action.call(this);
        instance = new func();
        bui.Action.call(instance);
        action.call(instance);
        /**/
    }
    // 传进来的是一个单例object
    else if (type == '[object Object]' || type == '[object String]'){
        action = type == '[object String]' ? bui.window[action] : action;
    
        me = new bui.Action();
        for (i in me) {
            if(action[i] === undefined){
                action[i] = me[i];
            }
        }
        bui.Action.list[action.id] = action;
    }
};

/**
 * @name 获取action
 * 获取控件用bui.Action.getExtClass('bui.Control').get(id, ctr||action)
 */
bui.Action.get = function(id){
    var map = bui.Action.list,
        action,
        v,
        cur;
    for (var i in map) {
        v = map[i];
        if (id !== undefined && v && v.id !== undefined && v.id == id) {
            action = map[i];
        }
        if (v && v.active) {
            cur = map[i];
        }
    }
    return (id !== undefined ? action : cur);
};
/**
 * @name 根据action的构造类或单例来从索引中找到已存在的action实例
 * @param {Function|Object} actionName action的单例或构造类
 */
bui.Action.getByActionName = function(actionName){/*接收参数:'字符串'|'Action子类'|'单例'，返回action实例*/
    var map = bui.Action.list,
        action = null,
        v,
        t;
    if (actionName) {
        if (Object.prototype.toString.call(actionName) === '[object String]') {        
            actionName = bui.getObjectByName(actionName);
        }
        t = Object.prototype.toString.call(actionName);
        for (var i in map) {
            v = map[i];
            if ((t === '[object Object]' && v === actionName) || 
                (t === '[object Function]' && (v instanceof actionName) && v.constructor == actionName)) {
                action = map[i];
            }
        }
    }
    
    return action;
};

/**
 * @name 获取唯一id
 * @public
 * @return {String}
 */
bui.Action.makeGUID = (function(){
    var guid = 1;
    return function(formName){
        return '_' + (formName ? formName : 'inner') + '_' + ( guid++ );
    };
})();


bui.Action.getExtClass = function(clazz){
    var result = function(){};
    switch (clazz) {
        case 'bui.Control':
            if (typeof bui !== 'undefined' && bui && bui.Control) {
                result = bui.Control;
            }
            else {
                result.get = new Function();
                result.init = new Function();
                result.prototype.validate = new Function();
                result.prototype.getParamMap = new Function();
                result.prototype.getParamString = new Function();
                result.prototype.validateAndSubmit = new Function();
            }
        break;
        case 'bui.Template':
            if (typeof bui !== 'undefined' && bui && bui.Template) {
                result = bui.Template;
            }
            else {
                result.getTarget = new Function();
                result.merge = new Function();
                result.prototype.validate = new Function();
                result.prototype.getParamMap = new Function();
                result.prototype.getParamString = new Function();
            }
        break;
        case 'bui.Mask':
            if (typeof bui !== 'undefined' && bui && bui.Mask) {
                result = bui.Mask;
            }
            else {
                result.hideLoading = new Function();
            }
        break;
        case 'bui.Master':
            if (typeof bui !== 'undefined' && bui && bui.Master) {
                result = bui.Master;
            }
            else {
                result.checkNewRequest = new Function();
                result.back = new Function();
            }
        break;
        case 'bui.BaseModel':
            if (typeof bui !== 'undefined' && bui && bui.BaseModel) {
                result = bui.BaseModel;
            }
            else {
                result.prototype.set = new Function();
            }
        break;
        default: 
    }
    return result;
};

});

define('./page404', ['./bui', './bui.Action', './bui.Router'], function(){

/*============================================
 * 404 page
 ============================================*/
var page404;
page404 = function(){
    bui.Action.call(this);
    /**
     * @name Action索引ID
     * 
     * @comment 主要用于控件中通过onclick="bui.Control.getById('listTable','login');
     */
    this.id = 'page404';
    /**
     * @name 初始化数据模型
     */
    // 使用了getView这里可以不用设置view属性
    // this.view = 'page404';
    /**
     * @name 初始化数据模型
     */
    var baseModel = bui.Action.getExtClass('bui.BaseModel'); 
    this.model = new baseModel();   
};

page404.prototype = {
    getView: function(){
        var str = '<div style="font-size:10pt;line-height:1.2em; line-height: 1.2em;padding: 15px;text-align: left;"><h3 style="margin:0px;line-height:3em;">The page cannot be found</h3>'
            +'<p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>'
            +'<p>Please try the following:</p>'
            +'<ul><li>If you typed the page address in the Address bar, make sure that it is spelled correctly.<br/></li>'
            +'<li>Open the <a href="#/">home page</a>, and then look for links to the information you want.</li>'
            +'<li>Click the <a href="javascript:history.go(-1)">Back</a> button to try another link. </li>'
            +'</ul><p><br></p>HTTP 404 - File not found<br />Need any help? This service is #{name}.<br /></div>';
        return str;
    },
    initModel: function(callback){
        var me = this;
        //me.model.set('free', 'not free');
        callback&&callback();
    },
    render: function(){
        var me = this;
        /*Requester.get('/mockup/user.json', {onsuccess:function(err, data){
            me.setInnerHTML(bui.format(me.getInnerHTML(), {name: data.result}));
        }});*/
    },
    /**
     * @name 初始化列表行为
     *
     * @param {Object} controlMap 当前主内容区域绘制的控件集合.
     */
    initBehavior: function(controlMap) {
        var me = this;
        
    }
};

bui.inherits(page404, bui.Action);
bui.Router.setRule('/404', 'page404');

bui.window.page404 = page404;

});