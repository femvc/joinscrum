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
 * @name Requester请求管理类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./Requester', [], function(){

var Requester = {
    /**
     * @name 全局事件处理接口 注：不支持onsuccess
     * @public
     * @Map {'ontimeout':function(){},'onfailure':function(){}}
     */
    handler:{},
    /** 
     * @name 创建XMLHttpRequest对象 
     * @private
     * @return {XMLHttpRequest} XMLHttpRequest对象 
     * @description 使用缓存模式避免每次都检测浏览器类型
     */ 
    createOriginalXHRObject: function () {
        var me = this,
            i,
            list,
            len,
            xhr = null,
            methods = [
                function () {return new XMLHttpRequest();}, 
                function () {return new ActiveXObject('Microsoft.XMLHTTP');},
                function () {return new ActiveXObject('Msxml2.XMLHTTP');}
            ];
        i = (window.location.protocol == 'file:' && window.ActiveXObject) ? 1 : 0;// 用于本地调试,IE下xmlhttp不能读取本地文本文件
        for (len = methods.length; i < len; i++) {
            try {
                xhr = methods[i]();
                this.createOriginalXHRObject = methods[i];
                break;
            } catch (e) {
                continue;
            }
        }
        if (!xhr) {
            throw new Error(100000,'Requester.createXHRProxyObject() fail. Your browser not support XHR.');
        }
        
        return xhr;
    },
    /** 
     * @name 预置XMLHttpRequestProxy对象 
     * @private
     * @return {XMLHttpRequestProxy} XMLHttpRequestProxy对象 
     * @description 
     */ 
    createXHRProxyObject: function () {            
        var me = this,
            xhr = {};
        xhr.xhr = me.createOriginalXHRObject();
        xhr.eventHandlers = {};
        xhr.fire = me.creatFireHandler();
        // 标示是否是本地调试
        xhr.online = (/^https?:$/i.test(window.location.protocol));
        // 处理成功返回结果
        xhr.responseCallback = function (handler, data) {
            // 根据返回结果更新用户状态
            window.Requester.updateStatus(data);
            
            // 当后端验证失败时
            if ( String(data.success).replace(/\s/ig,'').toLowerCase() !== 'true' && Requester.backendError && window.Requester.backendError(xhr, data)) {
                return 'finished';
            }
            else {
                // Todo: 如果返回用户状态表示此次请求非法，该如何处理？// Fixed: 此类情况应该服务器端判断之后再返回一个错误提示结果。
                window.setTimeout(function(){handler(null, data);}, 0);
            }
        };
        
        return xhr;
    },
    /** 
     * @name 生成新的触发事件方法 
     * @private
     * @param {String} type 事件类型 
     */ 
    creatFireHandler: function(){
        return function (type) { 
            type = 'on' + type; 
            var xhr = this,
                handler = xhr.eventHandlers[type], 
                globelHandler = window.Requester.handler[type],
                data; 
            /**
             * 注：在这里使用了setTimeout来断开xhr的链式作用域，如果不使用setTimeout
             * 会发现在连接池开启的情况下
             * Requester.get('tpl.html', { onsuccess: function() { Requester.get('tpl.html', { onsuccess: function(){alert(1)} }); } });
             * 永远不会执行alert(1);单步跟进会发现xhr的readyState到3就停住了。
             */
            // 不对事件类型进行验证 
            if (handler) { 
                // 如果action已被销毁则直接忽略本次请求结果.由于默认开启连接池,因此无需销毁xhr的fire方法!
                if (xhr.eventHandlers.action && !xhr.eventHandlers.action.active) {
                    return;
                }
                
                if (xhr.tick) { 
                  clearTimeout(tick); 
                } 
                
                if (type != 'onsuccess') { 
                    window.setTimeout(function(){handler('fail', xhr);}, 0); 
                } 
                else { 
                    // 处理获取xhr.responseText导致出错的情况,比如请求图片地址. 
                    try { 
                        xhr.xhr.responseText; 
                    } catch(error) { 
                        window.setTimeout(function(){handler('error', xhr);}, 0); 
                        return ; 
                    } 
                    var text = xhr.xhr.responseText.replace(/^\s+/ig, ""); 
                    if(text.indexOf('{') === 0 || text.indexOf('[') === 0){ 
                        // {success:true,message: 
                        // 插入表单验证错误提示 
                        var JSONParser; 
                        try { 
                            JSONParser = new Function("return " + text + ";");
                            data = JSONParser();
                        } 
                        // 如果json解析出错则尝试移除多于逗号再试 
                        catch (e){ 
                            JSONParser = new Function("return " + window.Requester.removeJSONExtComma(text) + ";"); 
                            data = JSONParser();
                        } 
                        
                        xhr.responseCallback(handler, data);
                    }
                    else { 
                        window.setTimeout(function(){handler(null, text);}, 0); 
                    } 
                } 
            } 
            // 检查是否配置了全局事件
            else if (globelHandler) { 
                // onsuccess不支持全局事件 
                if (type == 'onsuccess') { 
                    return; 
                } 
                globelHandler(xhr); 
            }
        };
    },
    /**
     * @name 检测是否有空闲的XHR或创建新对象
     * @private
     * @after Requester
     * @comment 使用Facade外观模式修改Requester.request方法
     * 以增加路径权限判断
     */
    getValidXHR: function () {
        var me = this;
        return me.createXHRProxyObject();
    },
    /**
     * @name request发送请求
     * @private
     * @url {String} 请求的URL
     * @options {Map} POST的参数，回调函数，MD5加密等
     */ 
    request: function (url, opt_options, xhr) {
        xhr = xhr || this.getValidXHR();
        // 权限检测
        url = this.beforeRequest(url, opt_options);
        
        
        // Mockup 返回是JSON数据, 注：Mockup 默认都是成功的，因此无需xhr.fire('success');
        if (url && typeof url != 'string' && xhr) {
            xhr.responseCallback(xhr.eventHandlers['onsuccess'], url);
        }
        // 有可用连接且url是字符串
        else if (url && typeof url == 'string' && xhr) {
            var me = this,
                options     = opt_options || {}, 
                data        = options.data || '', 
                async       = xhr.online && !(options.async === false), 
                username    = options.username || '', 
                password    = options.password || '', 
                method      = (options.method || 'GET').toUpperCase(), 
                headers     = options.headers || {}, 
                timeout     = options.timeout || 0, 
                usemd5      = options.usemd5 || false,
                tick, key, str,
                stateChangeHandler; 
                
            xhr.eventHandlers['on404'] = me.on404;
            // 将options参数中的事件参数复制到eventHandlers对象中 
            // 这里复制所有options的成员，eventHandlers有冗余 
            // 但是不会产生任何影响，并且代码紧凑
            for (key in options) { 
                xhr.eventHandlers[key] = options[key]; 
            } 
            xhr.url = url;
            
            headers['X-Requested-With'] = 'XMLHttpRequest'; 
            
            try { 
                // 提交到服务器端的参数是Map则转换为string
                if(Object.prototype.toString.call(data)==='[object Object]'){ 
                    str = []; 
                    for(key in data){
                        if (key){
                            str.push(window.Requester.encode(key) + '=' + window.Requester.encode(data[key])) 
                        }
                    }
                    data = str.join('&');
                }
                // 注：每次请求必须带上的公共参数,如token
                data = window.Requester.addSysParam(data);
                
                // 使用GET方式提交
                if (method == 'GET') { 
                    if (data) { 
                        url += (url.indexOf('?') >= 0 ? ( data.substr(0,1) == '&' ? '' : '&') : '?') + data; 
                        data = null; 
                    }
                }
                else if (usemd5) {
                    data = window.Requester.encodeMD5(data);
                }
                try {
                    if (username) { 
                        xhr.xhr.open(method, url, async, username, password); 
                    } else { 
                        xhr.xhr.open(method, url, async); 
                    } 
                }
                catch (e) {
                    debugger;
                    alert(e.message ? e.message : String(e));
                }

                
                stateChangeHandler = window.Requester.fn(me.createStateChangeHandler, xhr);
                if (async) { 
                    xhr.xhr.onreadystatechange = stateChangeHandler; 
                } 
                
                // 在open之后再进行http请求头设定 
                // FIXME 是否需要添加; charset=UTF-8呢 
                if (method == 'POST') { 
                    xhr.xhr.setRequestHeader("Content-Type", 
                        (headers['Content-Type'] || "application/x-www-form-urlencoded")); 
                } 
                
                for (key in headers) { 
                    if (headers.hasOwnProperty(key)) { 
                        xhr.xhr.setRequestHeader(key, headers[key]); 
                    } 
                } 
                
                xhr.fire('beforerequest'); 
                
                if (timeout) { 
                  xhr.tick = setTimeout(function(){ 
                    xhr.xhr.onreadystatechange = window.Requester.blank; 
                    xhr.xhr.abort(); 
                    xhr.fire('timeout'); 
                  }, timeout); 
                } 
                xhr.xhr.send(data);

                if (!async) { 
                    stateChangeHandler.call(xhr); 
                } 
            } 
            catch (ex) { 
                xhr.fire('failure'); 
            } 
        }
        
    },
    /** 
     * @name readyState发生变更时调用 
     * @private
     * @ignore 
     */ 
    createStateChangeHandler: function() { 
        var xhr = this;// window.console.log(xhr.readyState);
        if (xhr.xhr.readyState == 4) { 
            try { 
                var stat = xhr.xhr.status; 
            } catch (ex) { 
                // 在请求时，如果网络中断，Firefox会无法取得status 
                xhr.fire('failure'); 
                return; 
            } 
            
            xhr.fire(stat); 
            
            // http://www.never-online.net/blog/article.asp?id=261 
                // case 12002: // Server timeout 
                // case 12029: // dropped connections 
                // case 12030: // dropped connections 
                // case 12031: // dropped connections 
                // case 12152: // closed by server 
                // case 13030: // status and statusText are unavailable 
                
            // IE error sometimes returns 1223 when it
            // should be 204, so treat it as success 
            if ((stat >= 200 && stat < 300) 
                || stat == 304 
                || stat == 1223) { 
                // 注：在Chrome下，Request.post(url, {onsuccess: function(){Request.post(url, {onsuccess: function(){alert()}})}}) 
                // 如上，两次请求会共用同一个XHR对象从而造成status=0的错误，因此需要标识请求是否已成功返回
                xhr.status = 'finished';
                xhr.fire('success'); 
            } 
            else { 
                if (stat === 0 && !xhr.online) {
                    xhr.fire('success'); 
                }
                else {
                    if (stat === 0 && window.console && window.console.log) {
                        window.console.error('XHR Error: Cross domain, cannot access: %s.',xhr.url);
                    }
                    xhr.fire('failure'); 
                }
            } 
            
            /* 
             * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the 
             * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler 
             * function maybe still be called after it is deleted. The theory is that the 
             * callback is cached somewhere. Setting it to null or an empty function does 
             * seem to work properly, though. 
             *
             * On IE, there are two problems: Setting onreadystatechange to null (as 
             * opposed to an empty function) sometimes throws an exception. With 
             * particular (rare) versions of jscript.dll, setting onreadystatechange from 
             * within onreadystatechange causes a crash. Setting it from within a timeout 
             * fixes this bug (see issue 1610). 
             *
             * End result: *always* set onreadystatechange to an empty function (never to 
             * null). Never set onreadystatechange from within onreadystatechange (always 
             * in a setTimeout()). 
             *
            window.setTimeout(function() { 
                // 避免内存泄露. 
                // 由new Function改成不含此作用域链的 window.Requester.blank 函数, 
                // 以避免作用域链带来的隐性循环引用导致的IE下内存泄露. By rocy 2011-01-05 . 
                xhr.onreadystatechange = window.Requester.blank; 
                if (xhr.eventHandlers['async']) { 
                    xhr = null; 
                } 
            }, 0); */
            
            if (window.Requester.checkQue) {
                window.setTimeout(window.Requester.checkQue, 0);
            }
        } 
    },
    /**
     * @name encodeMD5加密提交的数据
     * @private
     * @data {String} 需要加密的paramString
     * @return {String} 加密后的paramString
     */ 
    encodeMD5: function (data) {
        var paramstr = Base64.encode(data).replace(/\+/g,'*');
        var md5 = String(MD5.encode(paramstr)).toUpperCase();
        paramstr = paramstr.split('');
        paramstr.reverse();

        return 'result=' + md5 + paramstr.join('');
    },
    /**
    * 对特殊字符和换行符编码// .replace(/%/ig,"%-")
    */
    encode:function(str){
        return String(str).replace(/%/ig,"%25").replace(/[ ]/ig,"%20").replace(/&/ig,"%26").replace(/;/ig,"%3B").replace(/=/ig,"%3D").replace(/\+/ig,"%2B").replace(/</ig,"%3C").replace(/>/ig,"%3E").replace(/\,/ig,"%2C").replace(/\"/ig,"%22").replace(/\'/ig,"%27").replace(/\#/ig,"%23").replace(/\//ig,"%2F").replace(/\\/ig,"%5C").replace(/\n/ig,"%0A").replace(/\r/ig,"%0D");
    },
    rencode:function(str){
        return String(str).replace(/aa/ig,"aa").replace(/[ ]/ig,"%20").replace(/&/ig,"%26").replace(/;/ig,"%3B").replace(/=/ig,"%3D").replace(/\+/ig,"%2B").replace(/</ig,"%3C").replace(/>/ig,"%3E").replace(/\,/ig,"%2C").replace(/\"/ig,"%22").replace(/\'/ig,"%27").replace(/\#/ig,"%23").replace(/\//ig,"%2F").replace(/\\/ig,"%5C").replace(/\n/ig,"%0A").replace(/\r/ig,"%0D");
    },
    decode:function(str){
                               return String(str).replace(/%20/ig," ").replace(/%26/ig,"&").replace(/%3B/ig,";").replace(/%3D/ig,"=").replace(/%2B/ig,"+").replace(/%3C/ig,"<").replace(/%3E/ig,">").replace(/%2C/ig,",").replace(/%22/ig,'"').replace(/%27/ig,"'").replace(/%23/ig,'#').replace(/%2F/ig,"/").replace(/%5C/ig,"\\").replace(/%0A/ig,"\n").replace(/%0D/ig,"\r").replace(/%25/ig,"%");//.replace(/%-/ig,"%");
    },
    
    /**
     * @name 处理404错误
     */
    on404: function(){}
};
/**
 * 不含任何作用域的空函数
 */
Requester.blank = function(){};

/**
 * @name 增加每次请求必须带上的公共参数,如token
 * @public
 * @param {String} str 已有参数
 */
Requester.addSysParam = function (str) {return str;};

/** 
 * @name 为对象绑定方法和作用域
 * @private
 * @param {Function|String} handler 要绑定的函数，或者一个在作用域下可用的函数名
 * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
 * @param {args* 0..n} args 函数执行时附加到执行时函数前面的参数
 * @returns {Function} 封装后的函数
 */
Requester.fn = function(func, scope){
    if(Object.prototype.toString.call(func)==='[object String]'){func=scope[func];}
    if(Object.prototype.toString.call(func)!=='[object Function]'){ throw 'Error "Requester.fn()": "func" is null';}
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
    return function () {
        var fn = '[object String]' == Object.prototype.toString.call(func) ? scope[func] : func,
            args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
        return fn.apply(scope || fn, args);
    };
};

/**
 * @name 移除JSON字符串中多余的逗号如{'a':[',],}',],}
 * @public
 * @param {String} JSON字符串
 * @return {String} 处理后的JSON字符串
 */
Requester.removeJSONExtComma = function(str) {
    var i,
        j,
        len,
        list,
        c,
        notValue = null,
        preQuot = null,
        lineNum;

    list = String(str).split('');
    for (i = 0, len = list.length; i < len; i++) {
        c = list[i];
        // 单引或双引
        if (/^[\'\"]$/.test(c)) {
            if (notValue === null && preQuot === null) {
                notValue = false;
                preQuot = i;
                continue;
            }
            // 值
            if (!notValue) {
                // 前面反斜杠个数
                lineNum = 0;
                for (j = i - 1; j > -1; j--) {
                    if (list[j] === '\\') {lineNum++;}
                    else { j = -1; }
                }
                // 个数为偶数且和开始引号相同
                // 结束引号
                if (lineNum % 2 === 0) {
                    if (list[preQuot] === c) {
                        notValue = true;
                        preQuot = -1;
                    }
                }
            }
            // 非值
            else {
                // 开始引号
                if (preQuot == -1) {
                    preQuot = i;
                    notValue = false;
                }
                // 结束引号
                else if (list[preQuot] === c) {
                    notValue = true;
                    preQuot = -1;
                }
            }
        }
        // 逗号
        else if (c === ']' || c === '}') {
            // 非值
            if (notValue) {
                for (j = i - 1; j > -1; j--) {
                    if (/^[\t\r\n\s ]+$/.test(list[j])) {continue;}
                    else { if (list[j] === ',') list[j] = ''; break; }
                }
            }
        }
    }
    return list.join('').replace(/\n/g,'').replace(/\r/g,'');
};

/**
 * @name 发送Requester请求
 * @public
 * @function
 * @grammar Requester.get(url, params)
 * @param {String}     url         发送请求的url地址
 * @param {String}     data         发送的数据
 * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
 * @meta standard
 * @see Requester.request
 * @returns {XMLHttpRequest}     发送请求的XMLHttpRequest对象
 */
// 'onsuccess': onsuccess,'method': 'POST','data': data,'action': action,'async': async,'usemd5': true
Requester.get     = function (url, params) {params.method = 'GET';                          return Requester.request(url, params);};
Requester.head    = function (url, params) {params.method = 'HEAD';                         return Requester.request(url, params);};
Requester.post    = function (url, params) {params.method = 'POST';                         return Requester.request(url, params);};
Requester.postMD5 = function (url, params) {params.method = 'POST'; params.usemd5 = true;   return Requester.request(url, params);};


/*============================================
 * 客户端模拟请求返回结果
 ============================================*/
/**
 * @name 增加Mockup拦截器
 * @private
 * @return {null|String} null或新url
 */
Requester.beforeRequest = function (url, opt_options) {
    // 检查请求的资源是否有权限
    var permit,
        Permission = Requester.getExtClass('bui.Permission'),
        Mockup = Requester.getExtClass('bui.Mockup');
        
    permit = Permission.checkRequest(url, opt_options);
    if (permit && permit[0] == 'notpermit') { return null; }
    else { url = permit ? permit[1] : url; }

    var result = url;
    // 检查是否启用了mockup
    if (Mockup.find(url)) {
        if (window.console && window.console.log) {
            window.console.log(url);
        }
        result = bui.Mockup.get(url, opt_options);
    }
    
    return result;
};

/**
 * @name 根据返回结果更新用户状态
 * @private
 */
Requester.updateStatus = function (data) {
    // 更新用户状态, 注: 每次请求都会返回用户状态 // Todo: 如果有需要用户再次发出请求以确认用户状态的呢？// Fixed: 应该服务器端负责处理
    if (window.bui && bui.Permission && bui.Permission.updateStatus){ 
        // bui.Permission.updateStatus(data); 
    }
}

/*============================================
 * 请求返回自动校验
 ============================================*/
/**
 * @name 当后端验证失败时自动调用
 * @private
 * @data {Map} XHR返回的responseText
 * @return {void}
 */
Requester.backendError = function (xhr, data) {
    if (window.bui && bui.Action && bui.Action.get){
        var key, 
            input, 
            formMap = {},
            errorMap = data.field || {},
            action = bui.Action.get(); 
        // Todo: 应该封装成可以手动调用
        for (key in errorMap) { 
            input = action.getByFormName(key); 
            if (input) { 
                if (bui.Validator) {
                    input.hideError(); 
                    input.showError(errorMap[key]); 
                }
            } 
        }
        
        return 'finished';
    }
};


/*============================================
 * Requester扩展 - XHR请求池
 ============================================*/
Requester.pool =  [];
Requester.poolsize = 20;
/**
 * @name 来不及执行的XHR请求队列
 * @private
 */
Requester.que = [];
/**
 * @name 修改XHR的request方法
 * @private
 * @after Requester
 */
// 缓存Requester.request以供后面调用
Requester.sendRequest = Requester.request;
// 修改Requester.request
Requester.request = function(url, opt_options){
    // 将请求放进队列
    this.que.push({'url':url,'options':opt_options});
    this.checkQue();
};

/**
 * @name checkQue检查队列是否有等待的任务
 * @private
 * @return {void} 
 */ 
Requester.checkQue = function () {
    var me = Requester,
        req = me.que.pop();
    if (req && req.url && req.options) {
        
        var xhr = me.getValidXHR();
        if (xhr) {
            me.sendRequest(req.url, req.options, xhr);
        }
        else {
            me.que.push(req);
        }
    }
};
/**
 * @name 检测是否有空闲的XHR或创建新对象
 * @private
 * @after Requester
 * @comment 使用Facade外观模式修改Requester.request方法以增加路径权限判断
 */
Requester.getValidXHR = function () {
    var me = this,
        i,
        list,
        len,
        xhr = null;
    // 找出空闲XHR对象
    for (i = 0, len = me.pool.length; i < len; i++) {
        if (me.pool[i].xhr.status == 200 && (me.pool[i].xhr.readyState == 0 || me.pool[i].xhr.readyState == 4)) {
            // me.pool[i].xhr.abort();
            if (me.pool[i].status == 'finished') {
                xhr = me.pool[i];
                xhr.status = '';
                break;
            }
        }
    }
    // 假如没有空闲对象且请求池未满，则继续新建
    if (xhr == null && me.pool.length < me.poolsize) {
        xhr = me.createXHRProxyObject();
        me.pool.push(xhr);
    }

    return xhr;
};


/**============================================
 * @name 发送JSONP请求
 * @public
 * @param {String} url 请求的地址
 * @param {String|Object} data 发送的参数
 * @param {String} onsuccess 回调函数
 * @param {String|Object} action 发送请求的Action
 **============================================*/

/** 
 * JSONP回调接口MAP 
 */  
Requester.proxy = {};
/**
 * @name 发送JSONP请求
 * @public
 */
Requester.JSONP = function (url, params) {
    var me = this,
    // 获取可用JSONP对象, 不存在则自动生成
    proxy = me.getValidProxy(params['action']);
    
    proxy['action'] = params['action'];
    proxy['onsuccess'] = params['onsuccess'];
    proxy['status'] = 'send';
    document.getElementById(proxy['id']).src = url + '?rand='+Math.random()+'&callback=Requester.proxy["'+proxy['id']+'"].callback';  
};
/**
 * @name 返回可用JSONP对象
 * @private
 * @return {Object}
 */
Requester.getValidProxy = function() {
    var me = this;
    return me.createProxy();
};
/**
 * @name 工厂模式创建JSONP对象
 * @private
 * @param {id String} 唯一标识
 * @return {void} 
 */
Requester.createProxy = function(id){
    // this->window.Requester
    var me = this,
        proxy = {};

    proxy.id = id || (new Date()).getTime() + '' + Math.random();
    proxy.status = 'finished';
    proxy.callback = me.creatProxyCallback();
    
    var script = document.createElement('script');       
    script.id = proxy.id;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(script);
    script = null;

    Requester.proxy[proxy.id] = proxy;

    return proxy;
};
/**
 * @name 工厂模式创建JSONP对象回调接口
 * @private
 * @return {void} 
 */
Requester.creatProxyCallback = function(){
    return function(data) {
        // this->JSONP Object
        var proxy = this,
            errorMap,
            key, 
            input, 
            formMap = {}; 

        proxy.status = 'finished';
        
        // 当后端验证失败时, 调用系统验证接口
        if (data && proxy.action && String(data.success).replace(/\s/ig,'').toLowerCase() !== 'true' && 
            window.Requester.backendError && window.Requester.backendError(data)) {
            return 'finished';
        }
        
        // 调用用户传入的回调接口
        if (proxy.onsuccess) {
            proxy.onsuccess(null, data);
        }
    }
};

/*============================================
 * Requester扩展模块 - JSONP请求池
 ============================================*/
/**
 * @name 返回可用JSONP对象
 * @private
 * @return {String} id 唯一标识
 */
Requester.getValidProxy = function() {
    var me = this,
        i,
        proxy = null,
        script;
    
    // 查找可用JSONP对象
    for (i in me.proxy) {
        if (i && me.proxy[i] && me.proxy[i].status == 'finished') {
            script = document.getElementById(i);
            if (script && window.addEventListener) {
                script.parentNode.removeChild(script);
                proxy = me.createProxy(i);
            }
            break;
        }
    }
    
    return (proxy || me.createProxy());
};

/**
* @name 测试代码
*
function doit() {
    // 注: test.json -> {"message":{},"success":"true","result":[]}
    Requester.get('ajax/test.json', {
        data: '',
        onsuccess: function(data){
            alert(data.success)
        }
    });

    // 注: 跨域会导致请求出错
    Requester.get('http://www.5imemo.com/other/ajax/jsonp.php', {onsuccess: function(data){alert(data.success)}});
    
    // 注: 跨域会导致请求出错
    Requester.JSONP('http://www.5imemo.com/other/ajax/jsonp.php', {onsuccess: function(data){ alert(data.id)}});
}
*/

Requester.getExtClass = function (clazz) {
    var result = function(){};
    switch (clazz) {
        case 'bui.Permission':
            if (typeof bui !== 'undefined' && bui.Permission) {
                result = bui.Permission;
            }
            else {
                result.checkRequest = new Function();
                result.set = new Function();
            }
        break;
        case 'bui.Mockup':
            if (typeof bui !== 'undefined' && bui.Mockup) {
                result = bui.Mockup;
            }
            else {
                result.find = new Function();
                result.get = new Function();
            }
        break;
        default: 
    }
    return result;
};



// !!! global.bui = ...
if (typeof window != 'undefined') {window.Requester = Requester;}
if (typeof global != 'undefined') {global.Requester = Requester;}

});
