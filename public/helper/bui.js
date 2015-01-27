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
 * @name BUI是一个富客户端应用的前端MVC框架[源于ER框架]
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui', ['./JSON'], function(){

// 使用window.bui定义可能会导致速度下降约7倍
var bui = {};

bui.env = typeof (window) === 'undefined' ? 'nodejs' : 'browser';
bui.lang = {};
bui.mainId = 'main'; //默认main，也可以在后面修改

bui.g = function(id, parentNode) {
    if (!parentNode || parentNode == bui.bocument || parentNode == bui.bocument.body) {
        return bui.dom ? bui.dom.getElementById(id) : document.getElementById(id);
    }
    else {
        var i, len, k, v,
            childNode,
            elements,
            list,
            childlist,
            node;
        elements=[],list=[parentNode];
        
        while(list.length){
            childNode= list.pop();
            if(!childNode) continue;
            if (childNode.id == id) {
                break;
            }
            elements.push(childNode);
            childlist = childNode.childNodes;
            if(!childlist||childlist.length<1) continue;
            for(i=0,len=childlist.length;i<len;i++){
                node = childlist[i];
                list.push(node);
            }
        }
        return (childNode.id == id ? childNode : null);
    }
};

bui.c = function(searchClass, node, tag) {  
    if (document.getElementsByClassName) {  
        var nodes =  (node || document).getElementsByClassName(searchClass),result = nodes; 
        if (tag != undefined) { 
            result = []; 
            for (var i=0,len=nodes.length; i<len; i++) {
                if (tag === '*' || nodes[i].tagName.toUpperCase() === tag.toUpperCase()){ 
                    result.push(nodes[i]);
                }
            } 
        } 
        return result; 
    }
    else {  
        searchClass = searchClass != null ? String(searchClass).replace(/\s+/g, ' ') : '';
        node = node || document;  
        tag = tag || '*';  
        
        var classes = searchClass.split(' '),  
            elements = (tag === '*' && node.all) ? node.all : node.getElementsByTagName(tag),  
            patterns = [],  
            returnElements = [],  
            current,  
            match;  
        
        var i = classes.length;  
        while (--i >= 0) {  
            patterns.push(new RegExp('(^|\\s)' + classes[i] + '(\\s|$)'));  
        }  
        var j = elements.length;  
        while (--j >= 0) {  
            current = elements[j];  
            match = false;  
            for (var k=0,kl=patterns.length; k<kl; k++){  
                match = patterns[k].test(current.className);  
                if (!match) { break;  } 
            }  
            if (match){ returnElements.push(current);}   
        }  
        return returnElements;  
    }  
};
/**
 * @name 将innerHTML生成的元素append到elem后面
 * @public
 * @param {HTMLElement} elem 父元素
 * @param {String} html 子元素HTML字符串
 */
bui.appendHtml = function (elem, html) {
    var node = document.createElement('DIV');
    node.innerHTML = html;
    elem.appendChild(node);
    for (var i=0,len=node.childNodes.length; i<len; i++) {
        elem.appendChild(node.childNodes[i]);
    }
    elem.removeChild(node);
};

bui.addClass = function (element, className) {
    bui.removeClass(element, className);
    element.className = (element.className +' '+ className).replace(/(\s)+/ig,' ');
    return element;
};
// Support * and ?, like bui.removeClass(elem, 'daneden-*');
bui.removeClass = function(element, className) {
    var list = className.replace(/\s+/ig, ' ').split(' '),
        /* Attention: str need two spaces!! */
        str = (' ' + (element.className || '').replace(/(\s)/ig, '  ') + ' '),
        name,
        rex;
    // 用list[i]移除str
    for (var i=0,len=list.length; i < len; i++){
        name = list[i];
        name = name.replace(/(\*)/g,'\\S*').replace(/(\?)/g,'\\S?');
        rex = new RegExp(' '+name + ' ', 'ig');
        str = str.replace(rex, ' ');
    }
    str = str.replace(/(\s)+/ig,' ');
    str = str.replace(/^(\s)+/ig,'').replace(/(\s)+$/ig,'');
    element.className = str;
    return element;
};

/** 
 * @name 对目标字符串进行格式化
 * @public
 * @param {String} source 目标字符串
 * @param {Object|String...} opts 提供相应数据的对象或多个字符串
 * @return {String} 格式化后的字符串
 */
bui.format = function (source, opts) {
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

/** 
 * @name 对数组进行排序
 * @public
 * @param {Array} list 目标数组
 * @param {String} field 目标排序字段
 * @param {String} order 升序（默认）或降序
 * @return {array} 排序后的数组
 */
bui.sortBy = function(list, field, order) { 
    if (list && list.sort && list.length) { 
        list.sort(function(a,b) { 
            var m, n; 
            m = String(a[field]).toLowerCase(); 
            n = String(b[field]).toLowerCase(); 
             
            if (String(parseInt('0'+m, 10)) == m && String(parseInt('0'+n, 10)) == n){ 
                m = parseInt(m, 10); 
                n = parseInt(n, 10); 
            }
            else { 
                if (m > n) { m = 1; n = -m;} 
                else if (m < n ) { m = -1; n = -m; } 
                else {m = 1; n = m;} 
            } 
            return (order == 'desc' ?  n - m : m - n ); 
        })
    } 
    return list; 
};

/** 
 * @name 事件绑定与解绑 
 */ 
bui.on = function(elem, eventName, handler) { 
    if (elem.addEventListener) { 
        elem.addEventListener(eventName, handler, false); 
    } 
    else if (elem.attachEvent) { 
        elem.attachEvent('on' + eventName, function(){handler.call(elem)}); 
       //此处使用回调函数call()，让 this指向elem 
    } 
};
bui.off = function(elem, eventName, handler) { 
    if (elem.removeEventListener) { 
         elem.removeEventListener(eventName, handler, false); 
    } 
    if (elem.detachEvent) { 
        elem.detachEvent('on' + eventName, handler); 
    } 
};

/** 
 * @name 给elem绑定onenter事件
 * @public
 * @param {HTMLElement} elem 目标元素
 * @param {Function} fn 事件处理函数
 */
bui.onenter = function(elem, fn) {
    bui.on(elem, 'keypress', function(e) {
        e = e || bui.window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            elem.onenter&&elem.onenter();
            fn(elem);
        }
    });
};

/** 
 * @name 为对象绑定方法和作用域
 * @param {Function|String} handler 要绑定的函数，或者一个在作用域下可用的函数名
 * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
 * @param {args* 0..n} args 函数执行时附加到执行时函数前面的参数
 * @returns {Function} 封装后的函数
 */
bui.fn = function(func, scope){
    if(Object.prototype.toString.call(func)==='[object String]'){func=scope[func];}
    if(Object.prototype.toString.call(func)!=='[object Function]'){ throw 'Error "bui.fn()": "func" is null';}
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
    bui.ChildControl = function (options, pending) {
        //如果使用this.constructor.superClass.call将无法继续继承此子类,否则会造成死循环!!
        bui.ChildControl.superClass.call(this, options, 'pending');
        this.type = 'childcontrol';
        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };
    bui.Form.prototype = {
        render: function () {
            bui.Form.superClass.prototype.render.call(this);
            //Todo...
        }
    };
    bui.inherits(bui.Form, bui.Control);
 */
bui.inherits = function (child, parent) {
    var clazz = new Function();
    clazz.prototype = parent.prototype;
    
    var childProperty = child.prototype;
    child.prototype = new clazz();
    
    for (var key in childProperty) {
        child.prototype[key] = childProperty[key];
    }
    
    child.prototype.constructor = child;
    
    //child是一个function
    //使用super在IE下会报错!!!
    child.superClass = parent;
};

/**
 * @name 对象扩展
 * @param {Class} child 子类
 * @param {Class} parent 父类
 * @public
 */
bui.extend = function (child, parent) {
    for (var key in parent) {
        child[key] = parent[key];
    }
};
/** 
 * @name 对象派生(不推荐!!!)
 * @param {Object} obj 派生对象
 * @param {Class} clazz 派生父类
 * @public
 */
bui.derive = function(obj, clazz){    
    var i,
        me = new clazz();
    
    for(i in me){
        if(obj[i] == undefined) obj[i] = me[i];
    }
};

/** 
 * @name 根据字符串查找对象
 * @param {String} name 对象对应的字符串
 * @param {Object} opt_obj 父对象
 * @public
 */
bui.getObjectByName = function(name, opt_obj) {
    var parts = name.split('.'),
        part,
        cur = opt_obj || bui.window;
    while (cur&&(part=parts.shift())) {
        cur = cur[part];
    }
    return cur;
};

/** 
 * @name对一个object进行深度拷贝
 * @param {Any} source 需要进行拷贝的对象.
 * @param {Array} oldArr 源对象树索引.
 * @param {Array} newArr 目标对象树索引.
 * @return {Any} 拷贝后的新对象.
 */
bui.clone = function(source, oldArr, newArr) {
    if (typeof source === 'undefined') {
        return undefined;
    }
    if (typeof JSON !== 'undefined') {
        return JSON.parse(JSON.stringify(source));
    }

    var result = source, 
        i, 
        len,
        j,
        len2,
        exist = -1;
    oldArr = oldArr || [];
    newArr = newArr || [];
    
    if (source instanceof Date) {
        result = new Date(source.getTime());
    } 
    else if ((source instanceof Array) || (Object.prototype.toString.call(source) == '[object Object]')) {
        for (j=0,len2=oldArr.length; j<len2; j++) {
            if (oldArr[j] == source) {
                exist = j;
                break;
            }
        }
        if (exist != -1) {
            result = newArr[exist];
            exist = -1;
        }
        else {
            if (source instanceof Array) {
                result = [];
                oldArr.push(source);
                newArr.push(result);
                var resultLen = 0;
                for (i = 0, len = source.length; i < len; i++) {
                    result[resultLen++] = bui.clone(source[i], oldArr, newArr);
                }
            }
            else if (!!source && Object.prototype.toString.call(source) == '[object Object]') {
                result = {};
                oldArr.push(source);
                newArr.push(result);
                for (i in source) {
                    if (source.hasOwnProperty(i)) {
                        result[i] = bui.clone(source[i], oldArr, newArr);
                    }
                }
            }
        }
    }

    return result;
};

// link from Undercore.js 
// Internal recursive comparison function for `isEqual`.
bui.isEqual = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b){return a !== 0 || 1 / a == 1 / b;}
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) {return a === b;}
    if (aStack == undefined || bStack == undefined ) {
        aStack = [];
        bStack = [];
    }
    // Compare `[[Class]]` names.
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)){return false;}
    switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
        case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    
    var size = 0, 
        result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size == b.length;
        if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
                if (!(result = bui.isEqual(a[size], b[size], aStack, bStack))) break;
            }
        }
    } 
    else {
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor, 
            bCtor = b.constructor;
        if (aCtor !== bCtor && !(Object.prototype.toString.call(aCtor) == '[object Function]' && (aCtor instanceof aCtor) &&
                               Object.prototype.toString.call(bCtor) == '[object Function]' && (bCtor instanceof bCtor))) {
            return false;
        }
        // Deep compare objects.
        for (var key in a) {
            if (Object.prototype.hasOwnProperty.call(a, key)) {
                // Count the expected number of properties.
                size++;
                // Deep compare each member.
                if (!(result = Object.prototype.hasOwnProperty.call(b, key) && bui.isEqual(a[key], b[key], aStack, bStack))) break;
            }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
            for (key in b) {
                if (Object.prototype.hasOwnProperty.call(b, key) && !(size--)) break;
            }
            result = !size;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    
    return result;
};

bui.getCookie = function(name) {  
    var start = document.cookie.indexOf(name + "=");  
    var len = start + name.length + 1;  
    if ((!start) && (name != document.cookie.substring(0, name.length))) {  
        return undefined;  
    }  
    if (start == -1) return undefined;  
    var end = document.cookie.indexOf(';', len);  
    if (end == -1) end = document.cookie.length;  
    return unescape(document.cookie.substring(len, end));  
};
bui.setCookie = function(name, value, expires, path, domain, secure) {  
    expires = expires || 24*60*60*1000;
    var expires_date = new Date((new Date()).getTime() + (expires));  
    document.cookie = name + '=' + escape(value) + ((expires) ? ';expires=' + expires_date.toGMTString() : '') + /*expires.toGMTString()*/   
    ((path) ? ';path=' + path: '') + ((domain) ? ';domain=' + domain: '') + ((secure) ? ';secure': '');  
};
bui.removeCookie = function(name, path, domain) {  
    if (bui.getCookie(name)) document.cookie = name + '=' + ((path) ? ';path=' + path: '') + ((domain) ? ';domain=' + domain: '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';  
};

bui.formatDate = function(date,fmt) {      
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
/*  
  将String类型解析为Date类型.  
  parseDate('2006-1-1') return new Date(2006,0,1)  
  parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
  parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
  parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
  parseDate('不正确的格式') retrun null  
*/   
bui.parseDate = function(str){   
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
     
    return null;   
}; 
    

// !!! global.bui = ...
if (typeof window != 'undefined') {window.bui = bui;bui.window = window;/*bui.bocument = document;//注：bui.bocument与document不相同! bui.dom等于bui.bocument或document!*/}
if (typeof global != 'undefined') {global.bui = bui;bui.window = global;}

});