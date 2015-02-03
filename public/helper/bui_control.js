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
 * @name 控件基础类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.Control', ['./JSON', './bui', './bui.EventDispatcher'], function(){

bui.Control = function (options, pending) {
    bui.EventDispatcher.call(this);
    
    // 状态列表
    this.state = {};
    // 初始化参数
    this.initOptions( options );
    // 生成控件id
    if ( !this.id ) {
        this.id = bui.Control.makeGUID(this.formname);
    }
    
    // 注释掉的原因：在bui.Control.create前会设置me.main
    //if (this.main && !this.getMain().getAttribute('id')) {
    //    this.getMain().setAttribute('id', this.id);
    //}
    
    // parentControl父控件不传则默认为window对象
    // parentControl父控件默认为window对象, 不是的话后面会再改回来. 
    // var parentControl = bui.window;
    // Add: 上面这样做静态没问题，动态生成appendSelfTo就会出问题，因此需要加上options.parentControl
    // Fixme: 第二次执行到这里bui.Master.get()居然是前一个action？
    var parentControl = options.parentControl || bui.window;
    parentControl.controlMap = parentControl.controlMap || {};
    
    // 默认为根控件,若不是则会在后面render时覆盖parentControl属性
    parentControl.controlMap[ this.id ] = this;
    this.parentControl = parentControl;
    
    // 子类调用此构造函数不可以立即执行!!只能放在子类的构造函数中执行!否则实例化时找不到子类中定义的属性!
    // 进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.Control.prototype = {
    /**
     * @name 初始化参数
     * @protected
     * @param {Object} options 参数集合
     */
    initOptions: function ( options ) {
        for (var k in options) {
            this[k] = options[k];
        }
    },
    // 注: controlMap不能放在这里,放在这里会导致"原型继承属性只是用一个副本的坑"!!
    // controlMap: {},
    /**
     * @name 获取dom子部件的css class
     * @protected
     * @return {String}
     */
    getClass: function(opt_key) {
        if (!this.type) {
            return '';
        }
        
        var me = this,
            type = String(me.type).toLowerCase(),
            className = 'ui-' + type,
            skinName = 'skin-' + type + '-' + me.skin;

        if (opt_key) {
            className += '-' + opt_key;
            skinName += '-' + opt_key;
        }
        
        if (me.skin) {
            className = skinName + ' ' + className;
        }
        
        return className;
    },

    /**
     * @name 获取dom子部件的id
     * @public
     * @return {String}
     */
    getId: function(key) {
        var me = this,
            // uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
            // idPrefix = 'ctrl' + this.type + this.id;
            idPrefix = this.id;
        
        if (key) {
            idPrefix = idPrefix + key;
        }
        return idPrefix;
    },
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
     * @name 渲染控件
     * @public
     */
    render: function() {
        var me = this,
            elem = me.getMain();
        if (elem && elem.getAttribute(bui.env+'_initView') != 'true') {
            bui.Control.addClass(elem, me.getClass());
            me.initView();
            elem.setAttribute(bui.env+'_initView', 'true');
        }
    },
    /**
     * @name 生成HTML
     * @public
     */
    initView: function () {
        var debug = true;
    },
    /**
     * @name 绑定事件
     * @public
     */
    initBehavior: function () {
        var me = this;
    },
    initBehaviorByTree: function () {
        var me = this;
        if (me.controlMap) {
            for (var i in me.controlMap) {
                me.controlMap[i].initBehaviorByTree();
            }
        }
        me.initBehavior();
    },
    /**
     * @name 验证控件的值
     * @public
     */
    validate: function() {
        var me = this,
            result = true,
            controlMap = me.controlMap,
            Validator = bui.Control.getExtClass('bui.Validator');
        
        if (me.rule && (!me.state || !me.state.disabled)) {
            if (Object.prototype.toString.call(me.rule)!=='[object Array]') {
                me.rule = [me.rule];
            }
            for (var i=0, len=me.rule.length; i<len && result; i++) {
                if (me.rule[i]) {
                    result = result && Validator.applyRule(me, me.rule[i]);
                }
            }
        }
        
        if (result && controlMap && (!me.state || !me.state.disabled)) {
            for (var i in controlMap) {
                if (i && controlMap[i]) {
                    result = controlMap[i].validate() && result;
                }
            }
        }
        
        return result;
    },
    hideError: function () {
        var me = this,
            Validator = bui.Control.getExtClass('bui.Validator');
        Validator.cancelNoticeInTile(me.getMain());
        if (me.controlMap) {
            for (var i in me.controlMap) {
                if (me.controlMap[i]) {
                    me.controlMap[i].hideError();
                }
            }
        }
    },
    showError: function (errorMsg) {
        var me = this,
            Validator = bui.Control.getExtClass('bui.Validator');
        Validator.noticeInTail(errorMsg, me.getMain());
    },
    showChildError:   function (v) {
        var me = this,
            control;
        if (me.controlMap && v) {
            for (var i in v) {
                control = me.controlMap[i] || me.getByFormname(i);
                if (!control) {continue;}
                if (control.showError){
                    control.showError(v[i]);
                }
                control = null;
            }
        }
    },
    /**
     * @name 返回控件的值
     * @public
     */
    //getValue:   new Function(), // 注: 控件直接返回值(对象/数组/字符串)时才能使用getValue! 获取所有子控件的值,应该用getParamMap
    setValue:   function(){this.setValueByTree(this.value);},
    /**
     * @name 给控件树一次性赋值
     * @param {Object} v 值
     */
    setValueByTree:   function (v) {
        var me = this,
            control;
        if (me.controlMap && v) {
            for (var i in v) {
                control = me.controlMap[i] || me.getByFormname(i);
                if (!control) {continue;}
                if (control.constructor && 
                    control.constructor.prototype && 
                    control.constructor.prototype.hasOwnProperty && 
                    control.constructor.prototype.hasOwnProperty('setValue')){
                    
                    control.setValue(v[i]);
                }
                else if (control.controlMap) {
                    control.setValueByTree(v[i]);
                }
                control = null;
            }
        }
    },
    /**
     * @name 获取子控件的值，返回一个map
     * @public
     */
    getParamMap: function() {
        var me = this,
            paramMap = {},
            childControl,
            formname;
        // 如果有子控件建议递归调用子控件的getValue!!
        if (me.controlMap) {
            for (var i in me.controlMap) {
                if (me.controlMap[i]) {
                    childControl = me.controlMap[i];
                    formname = childControl.getFormname();
                    
                    if (childControl.getValue && String(childControl.isForm) !== 'false') {
                        paramMap[formname] = childControl.getValue();
                    }
                    else if (childControl.controlMap){
                        paramMap[formname] = childControl.getParamMap();
                    }
                }
            }
        }
        
        return paramMap;
    },
    /**
     * @name 获取控件的值，返回一个string
     * @public
     */
    getParamString: function() {
        var me = this,
            paramMap = me.getParamMap(),
            paramString = [],
            toJSON = function(v){return String(v)};
        
        if (typeof JSON !== 'undefined' && JSON && JSON.stringify) {
            toJSON = JSON.stringify;
        }
        
        if (paramMap) {
            for(var i in paramMap){
                if (i) {
                    paramString.push(i + '=' + toJSON(paramMap[i]));
                }
            }
        }
           
        return paramString.join('&');
    },
    /**
     * @name 通过formname访问子控件
     * @public
     * @param {String} formname 子控件的formname
     */
    getByFormname: function (formname) {
        var me = this;
        return bui.Control.getByFormname(formname, me);
    },
    /**
     * @name 显示控件
     * @public
     */
    show: function() {
        this.getMain().style.display = 'block';
        bui.Control.removeClass(this.getMain(), 'hide');
    },

    /**
     * @name 隐藏控件
     * @public
     */
    hide: function() {
        bui.Control.addClass(this.getMain(), 'hide');
        this.getMain().style.display = 'none';
    },
    /**
     * @name 获取控件状态
     * @protected
     * @param {String} state 要获取的状态.
     * @return {boolean|Null}
     */
    getState: function(state) {
        if (!this.state) {
            this.state = {};
        }
        return !!this.state[state];
    },
    /**
     * @name 设置控件的当前状态
     * @protected
     * @param {String} state 要设置的状态.
     */
    setState: function(state) {
        var me = this, 
            main=me.getMain();
        if (!me.state) {
            me.state = {};
        }
        
        me.state[state] = 1;
        bui.Control.addClass(main, me.getClass(state));
    },
    /**
     * @name 移除控件的当前状态
     * @protected
     * @param {String} state 要移除的状态.
     */
    removeState: function(state) {
        var me = this,
            main = me.getMain();
        if (!me.state) {
            me.state = {};
        }
        
        me.state[state] = undefined;
        delete me.state[state];
        
        bui.Control.removeClass(main, me.getClass(state));
    },
    /**
     * @name 设置控件不可用状态
     * @public
     * @param {Boolean} disabled
     */
    setDisabled: function ( disabled ) {
        if (typeof disabled === 'undefined') {
            disabled = true;
        }
        disabled ? this.setState('disabled') : this.removeState('disabled');
        this.getMain().disabled = disabled;
    },
    /**
     * @name 设置控件不可用状态
     * @public
     * @param {Boolean} disabled
     */
    setReadonly: function ( readOnly ) {
        if (typeof readOnly === 'undefined') {
            readOnly = true;
        }
        readOnly ? this.setState('readonly') : this.removeState('readonly');
        this.getMain().readOnly = readOnly;
    },
    /**
     * @name 判断控件不可用状态
     * @public
     * @return {boolean}
     */
    isDisabled: function () {
        return this.getState('disabled');
    },
    isReadonly: function() {
        return this.getState('readonly');
    },
    /**
     * @name 设置控件width和height
     * @public
     */
    setSize: function (size) {
        var me = this,
            main = me.getMain();
        me.size = size ? size : me.size;
        
        if (me.size && me.size.width) {
            main.style.width  = me.size.width;
        }
        if (me.size && me.size.height) {
            main.style.height = me.size.height;
        }
        
        if (me.size && me.size.top) {
            main.style.top    = me.size.top;
        }
        if (me.size && me.size.right) {
            main.style.right  = me.size.right;
        }
        if (me.size && me.size.bottom) {
            main.style.bottom = me.size.bottom;
        }
        if (me.size && me.size.left) {
            main.style.left   = me.size.left;
        }
    },
    /**
     * @name 获取表单控件的表单名
     * @public
     * @param {Object} control
     */
    getFormname: function() {
        var me = this,
            elem = me.getMain();
        var itemName = me.formname || me['name'] || 
            (elem ? elem.getAttribute('name') : null) || me.getId();
        return itemName;
    },
    /**
     * @name 释放控件
     * @protected
     */
    dispose: function() {
        var me = this,
            controlMap,
            main = me.getMain(),
            k,
            id;
        // 从父控件的controlMap中删除引用
        if (me.parentControl) {
            controlMap = me.parentControl.controlMap;
            k = me.getId();
            controlMap[k] = undefined;
            delete controlMap[k];
        }
        
        me.disposeChild();
        
        if (main) {
            // 释放控件主区域的常用事件
            main.onmouseover = undefined;
            main.onmouseout = undefined;
            main.onmousedown = undefined;
            main.onmouseup = undefined;
            main.onkeyup = undefined;
            main.onkeydown = undefined;
            main.onkeypress = undefined;
            main.onchange = undefined;
            main.onpropertychange = undefined;
            main.onfocus = undefined;
            main.onblur = undefined;
            main.onclick = undefined;
            main.ondblclick = undefined;
            // 清空HTML内容
            if (main.innerHTML){
                main.innerHTML = '';
            }
            main.parentNode.removeChild(main);
            /*// 释放掉引用
            for (var i in me.main) {
                if (i) {
                    try {
                        if (Object.hasOwnProperty.call(me.main, i) && 'function,object'.indexOf(typeof (me.main[i]))>-1) {
                            me.main[i] = undefined;
                            delete me.main[i];
                        }
                    }
                    catch (e) {
                        // 移除一些自有属性如"valueAsNumber"时可能会出错!
                        //console.log(e)
                    }
                }
            }*/
            //me.main = undefined;
        }
        
        me.rendered = undefined;
        
        // 因为使用的属性而非闭包实现的EventDispatcher，因此无需担心内存回收的问题。
    },
    disposeChild: function(){
        var me = this,
            controlMap = me.controlMap;
        // dispose子控件
        if (controlMap) {
            for (var k in controlMap) {
                controlMap[k].dispose();
                delete controlMap[k];
            }
            me.controlMap = {};
        }
    },
    /**
     * @name 挂载到父dom节点中,注: 通过调用bui.Control.appendControl实现
     * @param {Element} wrap 父dom节点.
     */
    appendSelfTo : function(wrap) {
        var uiObj = this,
            elem = wrap,
            control,
            container = bui.dom.documentElement,
            main;
        if (wrap && wrap.appendChild && wrap.childNodes) {
            while(elem && elem.tagName && String(elem.tagName).toLowerCase()!='body'){
                // label标签自带control属性!!
                if (elem && elem.getAttribute && elem.control && Object.prototype.toString.call(elem.control)==='[object String]') {
                    control = bui.Control.getById(elem.control);
                    // 将控件从临时容器移动到指定控件下
                    bui.Control.appendControl(control, uiObj);
                    break;
                }
                else {
                    elem = elem.parentNode;
                }
            }
            
            if (uiObj.getMain()) {
                wrap.appendChild(uiObj.getMain());
            }
        }
        else if (wrap && wrap.controlMap) {
            bui.Control.appendControl(wrap, uiObj);
            main = uiObj.getMain();
            if (main) {
                control = wrap;
                while (control) {
                    container = control.getMain();
                    if (container) {
                        break;
                    }
                    control = control.parentControl;
                }
                container.appendChild(main);
            }
        }
    },
    /**
     * @name Control的主要处理流程
     * @protected
     * @param {Object} argMap arg表.
     */
    enterControl: function(){
        var uiObj = this,
            objId = uiObj.getId(),
            elem,
            control,
            parentControl = uiObj.parentControl;
        
        elem = uiObj.getMain();
        // 注：默认增加一个空元素作为控件主元素!
        if (!elem) {
            elem = bui.dom.createElement('DIV');
            elem.id = bui.Control.makeElemGUID();
            uiObj.main = elem.id;
            bui.dom.documentElement.appendChild(elem);
        }
        
        if ( elem ) {
            // 便于通过elem.control找到control
            elem.control = objId;
            // 动态生成control需手动维护me.parentControl
            // 回溯找到父控件,若要移动控件,则需手动维护parentControl属性!!
            while(elem && elem.tagName){
                elem = elem.parentNode;
                //label标签自带control属性!!
                if (elem && elem.getAttribute && elem.control  && Object.prototype.toString.call(elem.control)==='[object String]') {
                    control = bui.Control.getById(elem.control, parentControl);
                    bui.Control.appendControl(control, uiObj);
                    break;
                }
                // 未找到直接父控件则将control从bui.window.controlMap移动到action.controlMap中
                if ('html,body'.indexOf(String(elem.tagName).toLowerCase()) > -1) {
                    if (bui && bui.Action && bui.Master.get()) {
                        control = bui.Master.get();
                        bui.Control.appendControl(control, uiObj);
                    }
                    break;
                }
            }
            
            // bui.Control.elemList.push(uiObj);
            // 设计用来集中缓存索引,最后发现不能建,建了垃圾回收会有问题!!
            
            // 每个控件渲染开始的时间。
            uiObj.startRenderTime = new Date();
            // 1. initView()会在render调用父类的render时自动调用，
            // 2. 不管是批量bui.Control.init()还是bui.Control.create(), 都会通过enterControl来执行render
            // 3. initBehavior()会在后面执行
            if (uiObj.render){
                uiObj.render();
            }
            /*注: 如果isRendered为false则默认调用父类的渲染函数,子类的render中有异步情况需特殊处理!
            if (!uiObj.isRendered){
                uiObj.constructor.superClass.prototype.render.call(uiObj);
            }
            //注释掉的原因：调用父类的render应该由子类自己决定!
            */
            var uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
            elem = uiObj.getMain();
            if (elem) {
                // 解除obj对DOM的引用!
                uiObj.main = elem.getAttribute('id');
                
                //注释掉原因,导出到browser的html中不能还原! 
                //elem.setAttribute('_' + uiAttr, elem.getAttribute(uiAttr));
                //elem.removeAttribute(uiAttr);
            }
            
            uiObj.endRenderTime = new Date();
            
            if (uiObj.initBehaviorByTree) {
                uiObj.initBehaviorByTree();
            }
            else if (uiObj.initBehavior) {
                uiObj.initBehavior();
            }
            
            uiObj.endInitBehaviorTime = new Date();
        }
    }
};

bui.inherits(bui.Control, bui.EventDispatcher);
/*
 * @name BUI组件方法库
 * @static
 * @private
 */

/**
 * @name 获取唯一id
 * @public
 * @return {String}
 */
bui.Control.makeGUID = (function(){
    var guid = 1;
    return function(formname){
        return '_' + (formname ? formname : 'inner') + '_' + ( guid++ );
    };
})();
 
/**
 * @name 获取唯一id
 * @public
 * @return {String}
 */
bui.Control.makeElemGUID = (function(){
    var guid = 1;
    return function(formname){
        return '_' + bui.formatDate(new Date(), 'yyyyMMdd_HHmm') + '_' + ( guid++ );
    };
})();
 
/**
 * @name 初始化控件渲染
 * @public
 * @param {HTMLElement} opt_wrap 渲染的区域容器元素
 * @param {Object}      opt_propMap 控件需要用到的数据Model{@key}
 * @param {Object}      parentControl 渲染的action,不传则默认为window对象
 * @return {Object} 控件集合
 */
//bui.Control.init('<div ui="type:"></div>');//暂时禁止此方法生成控件树
//bui.Control.init(bui.bocument.getElementById('content'));
bui.Control.init = function ( opt_wrap, opt_propMap, parentControl ) {
    if (!opt_wrap) {
        return false;
    }
    // [nodejs&browser]
    if (!bui.dom && opt_wrap.setInnerHTML) {
        bui.dom = bui.bocument;
    }
    bui.dom = bui.dom || document;
    
    /*Step 1: 转换string到DOM
    // 容器为空的判断
    if (typeof (opt_wrap) == 'string') {
        bui.bocument.documentElement.setInnerHTML(opt_wrap);
        opt_wrap = bui.bocument.documentElement;
    }*/
    
    /*Step 2: 转换DOM到control*/
    opt_propMap = opt_propMap || {}; // 这里并不会缓存BaseModel，因此销毁空间时无须担心BaseModel
    // parentControl不传默认为window对象
    parentControl = parentControl || bui.window;
    parentControl.controlMap = parentControl.controlMap || {};
    
    var uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
    var realEls = [];
    var attrs, attrStr, attrArr, attrArrLen, attrSegment;
    var attr, attrName, attrValue, extraAttrMap;
    var elem, objId, control;
    
    // 把dom元素存储到临时数组中
    // 控件渲染的过程会导致elements的改变
    realEls = bui.Control.findAllNodes(opt_wrap);
    
    // 循环解析自定义的ui属性并渲染控件
    // <div ui="type:'UIType',id:'uiId',..."></div>
    for (var i=0,len=realEls.length; i<len; i++) {
        elem = realEls[ i ];
        
        if (elem && elem.getAttribute && elem.getAttribute( uiAttr ) && elem.getAttribute(bui.env+'_initView') != 'true') {
            attrStr = elem.getAttribute( uiAttr );
            attrStr = '{' + attrStr + '}';
            
            // 解析ui属性
            attrs = (new Function('return '+attrStr))();
            for (var j in attrs) {
                // 通过@定义的需要到传入的model中找
                attrValue = attrs[j];
                if (attrValue && typeof attrValue == 'string' && attrValue.indexOf('@') === 0) {
                    attrName = attrValue.substr(1);
                    
                    attrValue = opt_propMap&&opt_propMap.get ? opt_propMap.get(attrName) : opt_propMap[attrName];
                    // 默认读取opt_propMap中的,没有再到全局context中取,防止强耦合.
                    if (attrValue === undefined) { 
                        attrValue = bui.Control.getExtClass('bui.context').get(attrName);
                    }
                    attrs[j] = attrValue;
                }
            }
            
            // 创建并渲染控件
            objId = attrs[ 'id' ];
            if ( !objId ) {
                objId = bui.Control.makeGUID(attrs['formname']);
                attrs[ 'id' ] = objId;
            }           
            /*extraAttrMap = opt_propMap[ objId ];
            // 将附加属性注入
            for ( k in extraAttrMap ) {
                attrs[ k ] = attrs[ k ] || extraAttrMap[ k ];
            }*/
            
            // 主元素参数初始化
            if(attrs.main          == undefined && elem)          {attrs.main = elem.getAttribute('id') ? elem.getAttribute('id') : bui.Control.makeElemGUID(); elem.setAttribute('id', attrs.main);}
            if(attrs.parentControl == undefined && parentControl) {attrs.parentControl = parentControl;}
            // 生成控件 //这里的parentControl, elem不能去掉!!否则在后面的enterControl理会重复生成elem!!! 
            //control = bui.Control.create( attrs[ 'type' ], attrs, parentControl, elem);
            //放在了上上一行,故去掉了parentControl, elem
                        
            control = bui.Control.create( attrs[ 'type' ], attrs);
            /**
             * 保留ui属性便于调试与学习
             */
            // elem.setAttribute( uiAttr, '' );
        }
    }
    
    return parentControl.controlMap;
};

/**
 * @name 创建控件对象
 * @public
 * @param {String} type 控件类型
 * @param {Object} options 控件初始化参数
 * @return {bui.Control} 创建的控件对象
 */
bui.Control.create = function ( type, options) {
    options = options || {};
    
    // [nodejs&browser]
    if (!bui.dom && options['main'] && options['main'].setInnerHTML) {
        bui.dom = bui.bocument;
    }
    bui.dom = bui.dom || document;
    
    var uiClazz = bui[ type ],
        objId   = options.id,
        uiObj   = null,
        elem,
        control,
        k;
    if (!uiClazz && window && window.console && window.console.error) {
        window.console.error('"ui_' + String(type).toLowerCase() + '.js" is not loaded successfully.')
    }
    
    if ( objId !== undefined && objId !== null && objId !== '' && uiClazz ) {
        // 1. 模版批量生成控件时，options里一般没有m ain，m ain指向元素自身! //注:已改成默认有m ain
        // 2. new的方式创建控件时，options里一般有m ain!
        // 在这里设置m ain属性注意不能覆盖new uiClazz(options)的设置,也便于后面render时重新设置
        //if(options.m ain == undefined && m ain) {options.m ain = m ain;}//注:已移动到bui.Control.init中了
        
        // 设置临时parentControl放置子控件//注释掉原因:创建控件默认放在bui.window下//放到bui.Control.init中了
        //if(options.parentControl == undefined && parentControl) {options.parentControl = parentControl;}
        /**
         * 创建控件对象
         */
        uiObj = new uiClazz(options);
        /*Hack方式不利于理解程序，所以去掉!!*/
            /**
             * 调用父类的构造函数
             *
            bui.Control.call( uiObj, options );
            /**
             * 再次调用子类的构造函数
             * 
             * @comment 这里为什么不直接放到new uiClazz(options)里呢? 因为调用父类的构造函数会被覆盖掉.
             *
            uiClazz.call( uiObj, options );/*已废弃*
            /**/
            /*uiObj.clazz = uiClazz;// 已经使用this.constructor代替*/
    }

    return uiObj;
};

/**
 * @name 父控件添加子控件. 注: 将子控件加到父控件下面的容器中也可以调用appendSelfTo
 * @public
 * @param {Control} uiObj 子控件.
 */
bui.Control.appendControl = function(parent, uiObj) {
    var ctrId = uiObj.getId(),
        parentControl;
    
    if (uiObj.parentControl && uiObj.parentControl.controlMap) {
        uiObj.parentControl.controlMap[ctrId] = undefined;
        delete uiObj.parentControl.controlMap[ctrId];
    }
    
    // !!!悲催的案例,如果将controlMap放在prototype里, 这里parent.controlMap===uiObj.controlMap!!!
    parent.controlMap[ctrId] = uiObj;
    // 重置parentControl标识
    uiObj.parentControl = parent;
    
    // 
};

/**
 * @name 获取所有子节点element
 * @public
 * @param {HTMLElement} main
 * @param {String} stopAttr 如果元素存在该属性,如'ui',则不遍历其下面的子元素
 */
bui.Control.findAllNodes = function(main, stopAttr){
    var i, len, k, v,
        childNode,
        elements,
        list,
        childlist,
        node;
    elements=[];
    list=[main];
    
    while(list.length){
        childNode= list.pop();
        if(!childNode) continue;
        // Not set 'stopAttr', get all nodeds.
        if (stopAttr === undefined || (childNode.getAttribute && childNode.getAttribute(stopAttr))) {
            elements.push(childNode);
        }
        childlist = childNode.childNodes;
        if (!childlist||childlist.length<1) continue;
        if (childNode != main && stopAttr!==undefined && childNode.getAttribute(stopAttr)) {
            continue;
        }
        for (i=0,len=childlist.length;i<len;i++){
            node = childlist[i];
            list.push(node);
        }
    }
    // 去掉顶层main,如不去掉处理复合控件时会导致死循环!!
    if(elements[0] === main) elements.shift();
    
    return elements.reverse();
};
/**
 * @name 获取父控件或Action下所有控件
 * @public
 * @param {Object} control
 */
bui.Control.findAllControl = function(parentControl){
    var i, len, k, v,
        childNode,
        elements,
        list,
        childlist,
        node;
    elements=[];
    list=[parentControl];
    
    while(list.length){
        childNode= list.pop();
        if(!childNode) continue;
        elements.push(childNode);
        childlist = childNode.controlMap;
        if(!childlist) continue;
        for(i in childlist){
            node = childlist[i];
            list.push(node);
        }
    }
    // 去掉顶层父控件或Action,如不去掉处理复合控件时会导致死循环!!
    if(elements.length>0) elements.shift();
    return elements;
};
/**
 * @name 所有控件实例的索引. 注释掉原因: 建了索引会造成无法GC内存暴涨!
 */
// bui.Control.elemList = [];

/**
 * @name 根据控件id找到对应控件
 * @public
 * @param {Control} parentControl 可不传, 默认从当前Action开始找, 如果未使用action则直接从bui.window.controlMap开始找
 * @id 控件ID
 * @param {String} 控件id
 */
bui.Control.getById = function(id, parentControl){
    var me = this,
        list,
        result = null;
    // parentControl || bui.Control.getById(parentControl) || bui.Master.get(parentControl) || bui.Master.get() || window
    if (typeof parentControl == 'string') {
        parentControl = bui.Control.getById(parentControl);
    }
    // 如果传入的parentControl是DOM元素，视为未传入值处理
    parentControl = parentControl && parentControl.getId ? parentControl : 
        (bui.Action && bui.Master.get ? (bui.Master.get(parentControl) || bui.Master.get()) : bui.window);
    
    if (id === undefined || id === parentControl.getId()) {
        result = parentControl;
    }
    else if (parentControl) {
        list = bui.Control.findAllControl(parentControl);
        for (var i=0,len=list.length; i<len; i++) {
            if(list[i].id == id){
                result = list[i];
            }
        }
    }
    
    return result;
};
/**
 * @name 根据控件formname找到对应控件
 * @static
 * @param {String} 控件formname
 */
bui.Control.getByFormnameAll = function(formname, parentNode){
    var me = this,
        list = [],
        childNodes,
        main,
        /* 强制确认parentControl: 如果传入是parentControl的id，则找出其对应的Control */
        parentControl = bui.Control.getById(undefined, parentNode);
    
    if (formname) {
        formname = String(formname);
        
        // 先查找自身
        childNodes = parentControl && parentControl.controlMap ? parentControl.controlMap : {};
        //childNodes.unshift(parentControl);
        if (parentControl.getFormname && parentControl.getFormname() === formname) {
            list.push(parentControl);
        }
        
        // 再遍历控件树
        childNodes = parentControl && parentControl.controlMap ? bui.Control.findAllControl(parentControl) : {};
        for (var i in childNodes) {
            if (childNodes[i].getFormname() === formname) {
                list.push(childNodes[i]);
            }
        }  
    }
    
    return list;
};
/**
 * @name 根据控件formname找到对应控件
 * @static
 * @param {String} 控件formname
 */
bui.Control.getByFormname = function(formname, parentNode){
    var me = this,
        result = null,
        list = bui.Control.getByFormnameAll(formname, parentNode);
    if (parentNode && parentNode.parentNode && parentNode.childNodes) {
        for (var i=0,len=list.length; i<len; i++) {
            if (bui.Control.checkParentNode(list[i], parentNode)) {
                result = list[i];
                break;
            }
        }
    }
    else {
        result = list[0];
    }
    
    return result;
};

/**
 * @name 判断控件是否在某父元素下
 * @static
 * @param {Control} control 控件
 * @param {HTMLElement} parentNode DOM元素
 */
bui.Control.checkParentNode = function (control, parentNode) {
    var main,
        result = false;
    // 判断控件是否在parentNode元素下
    if (parentNode && result.getMain) {
        main = result.getMain();
        while (main) {
            if (main.parentNode === parentNode) {
                result = true;
                main = null;
            }
            else {
                main = main.parentNode;
            }
        }
    }
    return result;
};

/**
 * @name 为目标元素添加className
 * @public
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {String} className 要添加的className，允许同时添加多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @returns {HTMLElement} 目标元素
 */
bui.Control.addClass = function (element, className) {
    bui.Control.removeClass(element, className);
    element.className = (element.className +' '+ className).replace(/(\s)+/ig," ");
    return element;
};
bui.Control.removeClass = function(element, className) {
    var list = className.replace(/\s+/ig, ' ').split(' '),
        str = element.className||'';
    var i,len,k,v;
    for (i=0,len=list.length; i < len; i++){
         str = (" "+str.replace(/(\s)/ig,"  ")+" ").replace(new RegExp(" "+list[i]+" ","g")," ");
    }
    str = str.replace(/(\s)+/ig," ");
    str = str.replace(/^(\s)+/ig,'').replace(/(\s)+$/ig,'');
    element.className = str;
    return element;
};
/**
 * @name 对目标字符串进行格式化
 * @public
 * @param {String} source 目标字符串
 * @param {Object|String...} opts 提供相应数据的对象或多个字符串
 * @returns {String} 格式化后的字符串
 */
bui.Control.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
        data = (data.length == 1 ? 
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
            : data);
        return source.replace(/#\{(.+?)\}/g, function (match, key){
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if('[object Function]' == toString.call(replacer)){
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
};

/*  
  将String类型解析为Date类型.  
  parseDate('2006-1-1') return new Date(2006,0,1)  
  parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
  parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
  parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
  parseDate('不正确的格式') retrun null  
*/   
bui.Control.parseDate = function(str){
    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, ''); 
    var results = null; 
     
    //秒数 #9744242680 
    results = str.match(/^ *(\d{10}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str)*1000);    
     
    //毫秒数 #9744242682765 
    results = str.match(/^ *(\d{13}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str));    
     
    //20110608 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    //20110608 1010 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    //2011-06-08 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    //2011-06-08 10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    //2011-06-08 10:10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));    
     
    return (new Date(str));   
};

bui.Control.formatDate = function(date, fmt) {      
    if(!date) date = new Date(); 
    fmt = fmt||'yyyy-MM-dd HH:mm'; 
    var o = {      
    "M+" : date.getMonth()+1, //月份      
    "d+" : date.getDate(), //日      
    "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时      
    "H+" : date.getHours(), //小时      
    "m+" : date.getMinutes(), //分      
    "s+" : date.getSeconds(), //秒      
    "q+" : Math.floor((date.getMonth()+3)/3), //季度      
    "S" : date.getMilliseconds() //毫秒      
    };      
    var week = {      
    "0" : "/u65e5",      
    "1" : "/u4e00",      
    "2" : "/u4e8c",      
    "3" : "/u4e09",      
    "4" : "/u56db",      
    "5" : "/u4e94",      
    "6" : "/u516d"     
    };      
    if(/(y+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));      
    }      
    if(/(E+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[date.getDay()+""]);      
    }      
    for(var k in o){      
        if(new RegExp("("+ k +")").test(fmt)){      
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));      
        }      
    }      
    return fmt;      
};


bui.Control.getExtClass = function (clazz) {
    var result = function(){};
    switch (clazz) {
        case 'bui.BaseModel':
            if (typeof bui !== 'undefined' && bui.BaseModel) {
                result = bui.BaseModel;
            }
            else {
                result.get = new Function();
                result.set = new Function();
            }
        break;
        case 'bui.Validator':
            if (typeof bui !== 'undefined' && bui.Validator) {
                result = bui.Validator;
            }
            else {
                result.cancelNoticeInTile = new Function();
                result.set = new Function();
            }
        break;
        case 'bui.Action':
            if (typeof bui !== 'undefined' && bui.Validator) {
                result = bui.Validator;
            }
            else {
                result.get = new Function();
            }
        break;
        case 'bui.context':
            if (typeof bui !== 'undefined' && bui.context) {
                result = bui.context;
            }
            else {
                result = {};
                result.get = new Function();
            }
        break;
        default: 
    }
    return result;
};

});