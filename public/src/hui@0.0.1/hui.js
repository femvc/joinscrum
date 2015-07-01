'use strict';
//   __    __           ______   ______  _____    __  __     
//  /\ \  /\ \ /'\_/`\ /\  _  \ /\__  _\/\  __`\ /\ \/\ \    
//  \ `\`\\/'//\      \\ \ \/\ \\/_/\ \/\ \ \/\ \\ \ \ \ \   
//   `\ `\ /' \ \ \__\ \\ \  __ \  \ \ \ \ \ \ \ \\ \ \ \ \  
//     `\ \ \  \ \ \_/\ \\ \ \/\ \  \ \ \ \ \ \_\ \\ \ \_\ \ 
//       \ \_\  \ \_\\ \_\\ \_\ \_\  \ \_\ \ \_____\\ \_____\
//        \/_/   \/_/ \/_/ \/_/\/_/   \/_/  \/_____/ \/_____/
//                                                                                                                                      
//     

/**
 * @name HUI是一个富客户端应用的前端MVC框架
 * @public
 * @author haiyang5210
 * @date 2015-06-25 10:48
 */

// 使用window.hui定义可能会导致速度下降约7倍
var hui;
if (hui === undefined) {
    hui = {};

    // Nodejs support 'require' and does not support 'define', browser does not supported both. 
    // hui.require(['jquery', 'button'], function(){})
    hui.require = function (n, cb, asyc) {
        if (!n) return;
        if (Object.prototype.toString.call(n) !== '[object Array]') {
            n = [n];
        }
        hui.define('', n, cb, asyc);
    };
    //define('lib_module',['lib@0.0.1','json@0.0.1'], function(exports){exports.todo='...';});
    hui.define = function (name, deps, fun, asyc) {
        if (!name || !hui.define.getModule(name)) {
            //Name missing. Allow for anonymous modules
            name = typeof name !== 'string' ? '' : String(name).toLowerCase();
            deps = deps && deps.splice && deps.length ? deps : [];
            var left = [];
            for (var i = 0, len = deps.length; i < len; i++) {
                left.push(String(deps[i]).toLowerCase());
            }

            var conf = {
                name: name,
                depend: deps,
                left: left,
                todo: fun,
                loaded: false,
                exports: {},
                asyc: asyc
            };
            hui.define.modules.push(conf);

            hui.define.checkDepend();

            if (asyc === 'syc' || hui.define.autoload !== false) {
                conf.left.length && hui.define.loadmod(conf.left);
            }
        }
    };
    // 注：模块源地址
    hui.define.source = 'http://bpmjs.org/api/combo??';
    // 注：已通过<script>标签发送请求的模块
    hui.define.loadfile = [];
    // 注：请求成功返回但尚未初始化的模块
    hui.define.modules = [];
    // 注：执行初始化后的模块
    hui.define.parsed = [];
    // 注：是否自动加载依赖模块
    hui.define.autoload = false;

    hui.define.loadmod = function (n, conf) {
        var left = [];
        for (var i = 0; i < n.length; i++) {
            if (!hui.define.checkLoaded(n[i], conf)) {
                left.push(n[i]);
            }
        }
        if (left.length) {
            hui.define.loadfile = hui.define.loadfile.concat(left);

            var url = hui.define.source + left.join(',');

            var ex = [];
            for (var i = 0, len = hui.define.modules.length; i < len; i++) {
                hui.define.modules[i].name && ex.push(hui.define.modules[i].name);
            }
            var param = ex.length ? '?n=' + ex.join(',') : '';
            param = (param || '') + (hui.require.debug ? (param ? '&debug=true' : '?debug=true') : '');

            var script = document.createElement('script');
            script.src = url + (url.indexOf('.') === 0 ? '' : param);
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    };
    hui.define.checkLoaded = function (n, conf) {
        var loaded = !!hui.define.getModule(n, conf);
        if (!loaded) {
            for (var i = 0, len = hui.define.loadfile.length; i < len; i++) {
                if (hui.define.loadfile[i].split('@')[0].replace('./', '') === n) {
                    loaded = true;
                    break;
                }
            }
        }
        return loaded;
    };

    hui.define.checkDepend = function () {
        hui.define.modules = hui.define.modules || [];
        // 注: 只能用倒序, 否则会碰到依赖项未定义的错误
        for (var i = hui.define.modules.length - 1; i > -1; i--) {
            var m = hui.define.modules[i];

            for (var j = 0, len2 = hui.define.parsed.length; j < len2; j++) {
                var n = hui.define.parsed[j];
                for (var k = m.left.length - 1; k > -1; k--) {
                    if (m.left[k].replace('./', '').split('@')[0] == n) {
                        m.left.splice(k, 1);
                    }
                }
            }

            if (!m.loaded && m.left.length < 1) {
                m.loaded = true;
                // 放在前面未执行todo就放到loaded中了，会误触其他函数的todo，只能放在后面
                // [注: push放在这里则后面检测依赖只能用倒序，放在后面不好实现][有误]
                m.todo && m.todo(m.exports);
                // 放在todo前面有问题，依赖项刚加载还没来得及执行就触发了其他依赖此项的todo，会报依赖项未定义的错误
                m.name && hui.define.parsed.push(m.name);

                i = hui.define.modules.length;
            }
        }
    };

    hui.define.getModule = function (n) {
        n = n.split('@')[0].replace('./', '');
        var module = null;
        if (hui.define.modules) {
            for (var i = 0, len = hui.define.modules.length; i < len; i++) {
                if (hui.define.modules[i] && hui.define.modules[i].name === n) {
                    module = hui.define.modules[i];
                    break;
                }
            }
        }
        return module;
    };

    hui.define.checkLeft = function () {
        var left = [];
        var list = hui.define.modules;
        for (var i = 0, len = list.length; i < len; i++) {
            left = left.concat(hui.define.modules[i].left);
        }
        return left;
    };
    hui.define.loadLeft = function () {
        var left = hui.define.checkLeft();
        left && hui.define.loadmod(left);
    };
}

hui.define('hui', [], function () {
    // !!! global.hui = ...
    if (typeof window != 'undefined' && !window.hui) {
        window.hui = {};
    }
    if (window.hui) {
        window.hui.window = window; /*hui.bocument = document;//注：hui.bocument与document不相同!!*/
    }
    hui.window.cc = [];


    /** 
     * @name 为对象绑定方法和作用域
     * @param {Function|String} handler 要绑定的函数，或者一个在作用域下可用的函数名
     * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
     * @param {args* 0..n} args 函数执行时附加到执行时函数前面的参数
     * @returns {Function} 封装后的函数
     */
    hui.fn = function (func, scope) {
        if (Object.prototype.toString.call(func) === '[object String]') {
            func = scope[func];
        }
        if (Object.prototype.toString.call(func) !== '[object Function]') {
            throw 'Error "hui.util.fn()": "func" is null';
        }
        var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
        return function () {
            var fn = '[object String]' == Object.prototype.toString.call(func) ? scope[func] : func,
                args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
            return fn.apply(scope || fn, args);
        };
    };

    /**
 * @name 原型继承
 * @public
 * @param {Class} child 子类
 * @param {Class} parent 父类
 * @example 
    hui.ChildControl = function (options, pending) {
        //如果使用this.constructor.superClass.call将无法继续继承此子类,否则会造成死循环!!
        hui.ChildControl.superClass.call(this, options, 'pending');
        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };
    hui.Form.prototype = {
        render: function () {
            hui.Form.superClass.prototype.render.call(this);
            //Todo...
        }
    };
    hui.inherits(hui.Form, hui.Control);
 */
    hui.inherits = function (child, parent) {
        var clazz = new Function();
        clazz.prototype = parent.prototype;

        var childProperty = child.prototype;
        child.prototype = new clazz();

        for (var key in childProperty) {
            if (childProperty.hasOwnProperty(key)) {
                child.prototype[key] = childProperty[key];
            }
        }

        child.prototype.constructor = child;

        //child是一个function
        //使用super在IE下会报错!!!
        child.superClass = parent;
    };

});

hui.define('hui_util', [], function () {

    hui.util = {};

    /**
     * @name 将innerHTML生成的元素append到elem后面
     * @public
     * @param {HTMLElement} elem 父元素
     * @param {String} html 子元素HTML字符串
     */
    hui.util.appendHTML = function (elem, html) {
        if (window.jQuery) {
            return window.jQuery(elem).append(html);
        }
        else {
            var node = document.createElement('DIV');
            node.innerHTML = html;
            elem.appendChild(node);
            var list = [];
            for (var i = 0, len = node.childNodes.length; i < len; i++) {
                list[i] = node.childNodes[i];
            }
            for (var i = 0, len = list.length; i < len; i++) {
                //for (var i=list.length--; i>-1; i--) {
                elem.appendChild(list[i]);
            }
            elem.removeChild(node);

            return elem;
        }
    };
    /**
     * @name 将innerHTML生成的元素append到elem后面
     * @public
     * @param {HTMLElement} elem 父元素
     * @param {String} html 子元素HTML字符串
     */
    hui.util.getDom = function (str) {
        var list = [],
            wrap = document.createElement('DIV');
        wrap.innerHTML = str;
        for (var i = 0, len = wrap.childNodes.length; i < len; i++) {
            if (wrap.childNodes[i].nodeType == 1) {
                list.push(wrap.childNodes[i]);
            }
        }
        return list;
    };

    /**
     * @name 在当前元素直系祖父节点中查找有className的元素
     * @public
     * @param {Element} parentElement DOM元素
     * @param {String} className
     */
    hui.util.findParentByClassName = function (parentElement, className) {
        var control = null;
        while (parentElement && parentElement.tagName) {
            //label标签自带control属性!!
            if (parentElement && hui.Control.hasClass(parentElement, className)) {
                control = parentElement;
                break;
            }
            // 未找到直接父控件则将control从hui.window.childControl移动到action.childControl中
            else if (~',html,body,'.indexOf(',' + String(parentElement.tagName).toLowerCase() + ',')) {
                break;
            }
            parentElement = parentElement.parentNode;
        }
        return control;
    };
    /**
     * @name 在当前元素前后兄弟节点中查找有className的元素
     * @public
     * @param {Element} parentElement DOM元素
     * @param {String} className
     */
    hui.util.findSiblingByClassName = function (cur, className, pre) {
        var control = null,
            element = cur;
        if (!pre || pre == 'next' || pre == 'nxt' || pre == 'last') {
            while (element) {
                if (hui.Control.hasClass(element, className)) {
                    control = element;
                    if (pre !== 'last' && element !== cur) break;
                }
                element = element.nextSibling;
            }
        }
        if (!pre || pre == 'pre' || pre == 'first') {
            while (element) {
                if (hui.Control.hasClass(element, className)) {
                    control = element;
                    if (pre !== 'first' && element !== cur) break;
                }
                element = element.previousSibling;
            }
        }
        return control;
    };

    hui.util.hasClass = function (element, className) {
        if (window.jQuery) {
            return window.jQuery(element).hasClass(className);
        }
        else {
            return ~(' ' + element.className + ' ').indexOf(' ' + className + ' ');
        }
    };
    hui.util.addClass = function (element, className) {
        if (window.jQuery) {
            return window.jQuery(element).addClass(className);
        }
        else {
            if (~'[object Array][object NodeList]'.indexOf(Object.prototype.toString.call(element))) {
                for (var i = 0, len = element.length; i < len; i++) {
                    hui.util.addClass(element[i], className);
                }
            }
            else if (element) {
                hui.util.removeClass(element, className);
                element.className = (element.className + ' ' + className).replace(/(\s)+/ig, ' ');
            }
            return element;
        }
    };
    // Support * and ?, like hui.util.removeClass(elem, 'daneden-*');
    hui.util.removeClass = function (element, className) {
        if (window.jQuery && String(className).indexOf('*') === -1 && String(className).indexOf('?') === -1) {
            return window.jQuery(element).removeClass(className);
        }
        else {
            if (~'[object Array][object NodeList]'.indexOf(Object.prototype.toString.call(element))) {
                for (var i = 0, len = element.length; i < len; i++) {
                    hui.util.removeClass(element[i], className);
                }
            }
            else if (element) {
                var list = className.replace(/\s+/ig, ' ').split(' '),
                    /* Attention: str need two spaces!! */
                    str = (' ' + (element.className || '').replace(/(\s)/ig, '  ') + ' '),
                    name,
                    rex;
                // 用list[i]移除str
                for (var i = 0, len = list.length; i < len; i++) {
                    name = list[i];
                    name = name.replace(/(\*)/g, '\\S*').replace(/(\?)/g, '\\S?');
                    rex = new RegExp(' ' + name + ' ', 'ig');
                    str = str.replace(rex, ' ');
                }
                str = str.replace(/(\s)+/ig, ' ');
                str = str.replace(/^(\s)+/ig, '').replace(/(\s)+$/ig, '');
                element.className = str;
            }
            return element;
        }
    };

    hui.util.getDocumentHead = function (doc) {
        doc = doc || document;
        return doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
    };
    hui.util.hasCssString = function hasCssString(id, doc) {
        var sheets,
            c,
            result = false;
        doc = doc || document;
        if (doc.createStyleSheet && (sheets = doc.styleSheets)) {
            for (var i = 0, len = sheets.length; i < len; i++) {
                c = sheets[i];
                if (c && c.owningElement && c.owningElement.id === id) {
                    result = c.owningElement;
                    break;
                }
                else if (c && c.ownerNode && c.ownerNode.id === id) {
                    result = c.ownerNode;
                    break;
                }
            }
        }
        else if ((sheets = doc.getElementsByTagName('style'))) {
            for (var i = 0, len = sheets.length; i < len; i++) {
                c = sheets[i];
                if (c.id === id) {
                    result = c;
                    break;
                }
            }
        }

        return result;
    };
    hui.util.removeCssString = function removeCssString(id, doc) {
        var parent,
            result = hui.util.hasCssString(id, doc);
        if (result) {
            parent = result.parentNode;
            parent.removeChild(result);
        }
    };

    hui.util.importCssString = function importCssString(cssText, id, doc) {
        hui.util.removeCssString(id, doc);
        doc = doc || document;

        var style = document.createElement('style');
        if (id) {
            style.id = id;
        }
        var head = doc.head || doc.body || doc.documentElement;
        head.insertBefore(style, head.lastChild);
        if (head !== doc.documentElement && style.nextSibling) {
            head.insertBefore(style.nextSibling, style);
        }
        style.setAttribute('type', 'text/css');
        // all browsers, except IE before version 9
        if (style.styleSheet) {
            style.styleSheet.cssText = cssText;
        }
        // Internet Explorer before version 9
        else {
            style.appendChild(document.createTextNode(cssText));
        }

        return style;
    };

    hui.util.insertCssRule = function (className, cssText) {
        var list = document.getElementsByTagName('style'),
            style = list && list.length ? list[list.length - 1] : hui.util.importCssString(''),
            sheet = style.sheet ? style.sheet : style.styleSheet,
            rules = sheet.cssRules || sheet.rules,
            index = rules.length,
            pre = className.indexOf('{'),
            nxt;
        if (pre !== -1) {
            nxt = className.indexOf('}', pre + 1);
            cssText = className.substring(pre + 1, nxt === -1 ? className.length : nxt);
            className = className.substring(0, pre);
        }
        cssText = String(cssText).replace(/(^\s+|\s+$)/g, '');
        if (cssText.indexOf('{') === 0) {
            cssText = cssText.substring(1, cssText.length);
        }
        if (cssText.indexOf('}') === cssText.length - 1) {
            cssText = cssText.substring(0, cssText.length - 2);
        }

        // all browsers, except IE before version 9
        if (sheet.insertRule) {
            sheet.insertRule(className + '{' + cssText + '}', index);
        }
        else {
            // Internet Explorer before version 9
            if (sheet.addRule) {
                sheet.addRule(className, cssText, index);
            }
        }
    };
    hui.util.addCssRule = hui.util.insertCssRule;


    hui.util.importCssStylsheet = function importCssStylsheet(uri, doc) {
        doc = doc || document;
        if (doc.createStyleSheet) {
            doc.createStyleSheet(uri);
        }
        else {
            var link = hui.util.createElement('link');
            link.rel = 'stylesheet';
            link.href = uri;

            hui.util.getDocumentHead(doc).appendChild(link);
        }
    };

    /** 
     * @name 对目标字符串进行格式化
     * @public
     * @param {String} source 目标字符串
     * @param {Object|String...} opts 提供相应数据的对象或多个字符串
     * @return {String} 格式化后的字符串
     */
    hui.util.format = function (source, opts) {
        function handler(match, key) {
            var type = String(key).indexOf('!!') === 0 ? 'decode' : String(key).indexOf('!') === 0 ? '' : 'encode',
                parts = key.replace(/^!!?/, '').split('.'),
                part = parts.shift(),
                cur = data,
                variable;
            while (part) {
                if (cur[part] !== undefined) {
                    cur = cur[part];
                }
                else {
                    cur = undefined;
                    break;
                }
                part = parts.shift();
            }

            variable = cur;
            if ('[object Function]' === toString.call(variable)) {
                variable = variable(key);
            }
            if (undefined !== variable) {
                variable = String(variable);
                // encodeURIComponent not encode '
                var fr = '&|<|>| |\'|"|\\'.split('|'),
                    to = '&amp;|&lt;|&gt;|&nbsp;|&apos;|&quot;|&#92;'.split('|');
                if (type === 'decode') {
                    for (var i = fr.length - 1; i > -1; i--) {
                        variable = variable.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
                    }
                }
                else if (type === 'encode') {
                    for (var i = 0, l = fr.length; i < l; i++) {
                        variable = variable.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
                    }
                }
            }

            return (undefined === variable ? '' : variable);
        }

        source = String(source);
        var data = Array.prototype.slice.call(arguments, 1),
            toString = Object.prototype.toString;
        if (data.length) {
            data = (data.length == 1 ?
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object (Array|Object)\]/.test(toString.call(opts))) ? opts : data) : data);

            return source.replace(/#\{(.+?)\}/g, handler).replace(/\{\{(.+?)\}\}/g, handler);
        }
        return source;
    };

    /** 
     * @name 对数组进行排序
     * @public
     * @param {Array} list 目标数组
     * @param {String} field 目标排序字段
     * @param {String} order 升序（默认）或降序
     * @return {array} 排序后的数组
     */
    hui.util.sortBy = function (list, field, order) {
        if (list && list.sort && list.length) {
            list.sort(function (a, b) {
                var m, n;
                m = String(a[field]).toLowerCase();
                n = String(b[field]).toLowerCase();

                if (String(parseInt('0' + m, 10)) == m && String(parseInt('0' + n, 10)) == n) {
                    m = parseInt(m, 10);
                    n = parseInt(n, 10);
                }
                else {
                    if (m > n) {
                        m = 1;
                        n = -m;
                    }
                    else if (m < n) {
                        m = -1;
                        n = -m;
                    }
                    else {
                        m = 1;
                        n = m;
                    }
                }
                return (order == 'desc' ? n - m : m - n);
            });
        }
        return list;
    };

    /** 
     * @name 事件绑定与解绑
     */
    hui.util.on = function (elem, eventName, handler) {
        if (window.jQuery && window.jQuery.prototype.on) {
            return window.jQuery(elem).on(eventName, handler);
        }
        else {
            if (elem.addEventListener) {
                elem.addEventListener(eventName, handler, false);
            }
            else if (elem.attachEvent) {
                elem.attachEvent('on' + eventName, handler);
                // elem.attachEvent('on' + eventName, function(){handler.call(elem)}); 
                //此处使用回调函数call()，让 this指向elem //注释掉原因：无法解绑
            }
        }
    };
    hui.util.off = function (elem, eventName, handler) {
        if (window.jQuery && window.jQuery.prototype.off) {
            return window.jQuery(elem).off(eventName, handler);
        }
        else {
            if (elem.removeEventListener) {
                elem.removeEventListener(eventName, handler, false);
            }
            if (elem.detachEvent) {
                elem.detachEvent('on' + eventName, handler);
            }
        }
    };

    /** 
     * @name 给elem绑定onenter事件
     * @public
     * @param {HTMLElement} elem 目标元素
     * @param {Function} fn 事件处理函数
     */
    hui.util.onenter = function (elem, fn) {
        hui.util.on(elem, 'keyup', function (e) {
            e = e || hui.window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                elem.onenter && elem.onenter();
                fn(elem);
            }
        });
    };

    /** 
     * @name 给elem绑定onesc事件
     * @public
     * @param {HTMLElement} elem 目标元素
     * @param {Function} fn 事件处理函数
     */
    hui.util.onesc = function (elem, fn) {
        hui.util.on(elem, 'keyup', function (e) {
            e = e || hui.window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 27) {
                elem.onesc && elem.onesc();
                fn(elem);
            }
        });
    };


    hui.util.getCookie = function (name) {
        var start = document.cookie.indexOf(name + '=');
        var len = start + name.length + 1;
        if ((!start) && (name != document.cookie.substring(0, name.length))) {
            return undefined;
        }
        if (start == -1) return undefined;
        var end = document.cookie.indexOf(';', len);
        if (end == -1) end = document.cookie.length;
        return unescape(document.cookie.substring(len, end));
    };
    hui.util.setCookie = function (name, value, expires, path, domain, secure) {
        expires = expires || 24 * 60 * 60 * 1000;
        var expires_date = new Date((new Date()).getTime() + (expires));
        document.cookie = name + '=' + escape(value) + ((expires) ? ';expires=' + expires_date.toGMTString() : '') + /*expires.toGMTString()*/
            ((path) ? ';path=' + path : '') + ((domain) ? ';domain=' + domain : '') + ((secure) ? ';secure' : '');
    };
    hui.util.removeCookie = function (name, path, domain) {
        if (hui.util.getCookie(name)) document.cookie = name + '=' + ((path) ? ';path=' + path : '') + ((domain) ? ';domain=' + domain : '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
    };

    hui.util.formatDate = function (date, fmt) {
        if (!date) date = new Date();
        fmt = fmt || 'yyyy-MM-dd HH:mm';
        var o = {
            'M+': date.getMonth() + 1, //月份      
            'd+': date.getDate(), //日      
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时      
            'H+': date.getHours(), //小时      
            'm+': date.getMinutes(), //分      
            's+': date.getSeconds(), //秒      
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度      
            'S': date.getMilliseconds() //毫秒      
        };
        var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + '']);
        }
        for (var k in o) {
            if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    };
    /*  
  将String类型解析为Date类型.  
  parseDate('2006-1-1') return new Date(2006,0,1)  
  parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
  parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
  parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
  parseDate('不正确的格式') retrun null  
*/
    hui.util.parseDate = function (str) {
        str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, '');
        var results = null;

        //秒数 #9744242680 
        results = str.match(/^ *(\d{10}) *$/);
        if (results && results.length > 0)
            return new Date(parseInt(str) * 1000);

        //毫秒数 #9744242682765 
        results = str.match(/^ *(\d{13}) *$/);
        if (results && results.length > 0)
            return new Date(parseInt(str));

        //20110608 
        results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);
        if (results && results.length > 3)
            return new Date(parseInt(results[1]), parseInt(results[2]) - 1, parseInt(results[3]));

        //20110608 1010 
        results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);
        if (results && results.length > 5)
            return new Date(parseInt(results[1]), parseInt(results[2]) - 1, parseInt(results[3]), parseInt(results[4]), parseInt(results[5]));

        //2011-06-08 
        results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/);
        if (results && results.length > 3)
            return new Date(parseInt(results[1]), parseInt(results[2]) - 1, parseInt(results[3]));

        //2011-06-08 10:10 
        results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/);
        if (results && results.length > 5)
            return new Date(parseInt(results[1]), parseInt(results[2]) - 1, parseInt(results[3]), parseInt(results[4]), parseInt(results[5]));

        //2011/06\\08 10:10:10 
        results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);
        if (results && results.length > 6)
            return new Date(parseInt(results[1]), parseInt(results[2]) - 1, parseInt(results[3]), parseInt(results[4]), parseInt(results[5]), parseInt(results[6]));

        return (new Date(str));
    };

    /**
     * 对特殊字符和换行符编码// .replace(/%/ig,"%-")
     */
    hui.util.encode = function (str, decode) {
        str = String(str);
        // encodeURIComponent not encode '
        var fr = '%| |&|;|=|+|<|>|,|"|\'|#|/|\\|\n|\r|\t'.split('|'),
            to = '%25|%20|%26|%3B|%3D|%2B|%3C|%3E|%2C|%22|%27|%23|%2F|%5C|%0A|%0D|%09'.split('|');
        if (decode == 'decode') {
            for (var i = fr.length - 1; i > -1; i--) {
                str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
            }
        }
        else {
            for (var i = 0, l = fr.length; i < l; i++) {
                str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
            }
        }
        return str;
    };
    hui.util.decode = function (str) {
        return this.encode(str, 'decode');
    };
    hui.util.encodehtml = function (str, decode) {
        str = String(str);
        // encodeURIComponent not encode '
        var fr = '&|<|>| |\'|"|\\'.split('|'),
            to = '&amp;|&lt;|&gt;|&nbsp;|&apos;|&quot;|&#92;'.split('|');
        if (decode == 'decode') {
            for (var i = fr.length - 1; i > -1; i--) {
                str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
            }
        }
        else {
            for (var i = 0, l = fr.length; i < l; i++) {
                str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
            }
        }
        return str;
    };
    hui.util.decodehtml = function (str) {
        return this.encodehtml(str, 'decode');
    };

    //setInnerHTML: function (elem, html){}
    hui.util.setInnerHTML = function (elem, html) {
        elem = elem && elem.getMain ? elem.getMain() : elem;
        if (elem && elem.innerHTML !== undefined) {
            elem.innerHTML = html;
        }
        return elem;
    };
    hui.util.setInnerText = function (elem, text) {
        if (!elem) return;
        if (elem.textContent !== undefined) {
            elem.textContent = text;
        }
        else {
            elem.innerText = text;
        }
    };

    hui.appendHTML = hui.util.appendHTML;
    hui.hasClass = hui.util.hasClass;
    hui.addClass = hui.util.addClass;
    hui.removeClass = hui.util.removeClass;
    // hui.format = hui.util.format;
    hui.sortBy = hui.util.sortBy;
    hui.on = hui.util.on;
    hui.off = hui.util.off;
    hui.onenter = hui.util.onenter;

    hui.getCookie = hui.util.getCookie;
    hui.setCookie = hui.util.setCookie;
    hui.removeCookie = hui.util.removeCookie;
    hui.formatDate = hui.util.formatDate;
    hui.parseDate = hui.util.parseDate;
    hui.setInnerHTML = hui.util.setInnerHTML;
    hui.setInnerText = hui.util.setInnerText;



});

hui.util.importCssString('html {}');