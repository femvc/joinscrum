'use strict';
// Nodejs support 'require' and does not support 'define', browser does not supported both. 
if (typeof (define)  == 'undefined') {
    //define('./lib.module',['./lib','./JSON'], function(exports){exports.todo='...';});
    var define = function (name, deps, fun) {
        //Name missing. Allow for anonymous modules
        name = typeof name !== 'string' ? '' : name;
        deps = deps && deps.splice && deps.length ? deps : [];
        
        define.modules = define.modules || [];
        define.modules.push({
            name: name, 
            depend: deps, 
            left: deps.join(',').replace(/[ ]/g, '')+',', 
            todo: fun, 
            loaded: false,
            exports: {}
        });
        
        define.checkDepend();
    };
    define.loaded = [];
    define.checkDepend = function () {
        define.modules = define.modules || [];
        // 注: 只能用倒序, 否则会碰到依赖项未定义的错误
        for (var i=define.modules.length-1; i>-1; i--) {
            var m = define.modules[i];
            for (var j=0,len2=define.loaded.length; j<len2; j++) {
                var n = define.loaded[j];
                m.left = m.left.replace(n+',', '');
            }
            
            if (!m.loaded && m.left.length<2) {
                m.loaded = true;
                // 放在前面未执行todo就放到loaded中了，会误触其他函数的todo，只能放在后面
                // [注: push放在这里则后面检测依赖只能用倒序，放在后面不好实现][有误]
                define.loaded.push(m.name);
                
                m.todo(m.exports);
            }
        }
    };
    // 注：查看漏加载的模块!!
    define.left = function(){
        var left = '';
        for (var i=0,len=define.modules.length; i<len; i++) {
            left += define.modules[i].left;
        }
        return left;
    };
    (typeof (global) == 'undefined' ? window.define = define : global.define = define);
};

// global for window
if (typeof (global)  == 'undefined') {
    window.global = window;
}
