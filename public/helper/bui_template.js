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
 * @name 模板管理及解析类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.Template', ['./bui'], function(){

bui.Template = {
    /**
     * @name 解析前 originTargetContainer, 解析后 targetContainer
     */
    originTargetContainer:{},
    targetContainer:{},
    targetRule : /<!--\s*target:\s*([a-zA-Z0-9\.\-_]+)\s*-->/g,
    importRule : /<!--\s*import:\s*([a-zA-Z0-9\.\-_]+)\s*-->/g,
    /**
     * @name 根据模板url列表载入相应HTML模板文件
     * @public
     * @param {String} tplList 模板文件URL列表
     */
    loadAllTemplate: function(){
        var me = this, 
            i, len,
            tplList = me.TEMPLATE_LIST;
        
        bui.Template.loadedCount = 0;
        for (i=0,len=tplList.length; i<len; i++){
            if(tplList[i]){
                bui.Template.loadedCount++;
                bui.Template.loadTemplate(tplList[i]);
            }
        }
    },
    /**
     * @name 根据url载入相应HTML模板文件
     * @public
     * @param {String} url 模板文件URL
     */
    loadTemplate: function(url){
        if (typeof Requester != 'undefined' && Requester && Requester.get) {
            Requester.get(url, {onsuccess: bui.Template.callback, on404: bui.Template.callback});
	    }
        else if (typeof fs != 'undefined' && fs && fs.readFile) {
                fs.readFile(url, bui.Template.callback);
        }
    },
    /**
     * @name 模板加载回调事件接口
     * @private
     * @param {String} text 模板字符串
     */
    callback: function(err, text){
        bui.Template.loadedCount--;
        
        bui.Template.parseTemplate(text);
        if(bui.Template.loadedCount < 1){
            bui.Template.onload();
        }
    },
    /**
     * @name 模板加载完毕外部事件接口
     * @public
     */
    onload: function(callback){callback&&callback();},
    /**
     * @name 解析模板字符串流[增加target]
     * @public
     * @param {String} tplStr 模板字符串流tpl:<!-- target:mergeTest -->hello ${myName}!
     * @param {Object|string...} opts 提供相应数据的对象或多个字符串
     * @returns {String} 格式化后的字符串
     */
    parseTemplate:function(tplStr, lazyParse){
        var me = this,
            i,
            len,
            k,
            targetNameList,
            targetContentList,
            targetList,
            sep;
        
        //基本思路: 使用正则提取targetName与targetContent分别放入两个数组
        tplStr = !tplStr ? '' : String(tplStr);
        
        //坑爹的String.split(RegExp)有兼容性问题!!!
        //找到一个不重复的字符串做分隔符
        sep = String(Math.random()).replace('.','');
        for( i=0; tplStr.indexOf(sep)>-1 && i<1000; i++){sep = String(Math.random()).replace('.','');}
        if (tplStr.indexOf(sep)>-1) { throw { title: 'BUI Template Error: ',name: 'Math.random()'} }
        
        targetList = {};
        targetNameList = tplStr.match(me.targetRule)||[],
        targetContentList = tplStr.replace(me.targetRule, sep).split(sep);
        
        //抛弃掉第一个<!-- target: XXX -->之前的内容
        if (targetContentList.length-targetNameList.length==1) { targetContentList.shift(); }
        if (targetContentList.length != targetNameList.length) { throw { title: 'BUI Template Error: ', name: 'Methond "parseTemplate()" error.'} }
        
        for (i=0,len=targetNameList.length;i<len;i++){
            k = targetNameList[i].replace(me.targetRule,'$1');
            targetList[k] = targetContentList[i];
            
            //存入全局target容器(targetContainer中的后面将会替换)
            me.originTargetContainer[k] = targetContentList[i];
        }
        
        if (lazyParse !== true) {
            me.parseAllTarget();
        }
        
        return targetList;
    },
    /**
     * @name 获取Target
     * @public
     * @param {String} targetName Target名字
     * @returns {String} 未解析的target
     */
    getTarget: function(targetName){
        var me = this;
        if(targetName == null || targetName == '') return '';
        
        if(me.targetContainer[targetName] === undefined) {
            throw new Error('Target "'+targetName+'" not exist.');
        }
        
        return me.targetContainer[targetName];
    },
    /**
     * @name 依赖于me.originTargetContainer循环解析targetList中的target
     * @public
     * @param {String} tplStr 模板字符串流tpl:<!-- target:mergeTest -->hello ${myName}!
     * @param {Object|String...} opts 提供相应数据的对象或多个字符串
     * @returns {String} 格式化后的字符串
     */
    parseAllTarget: function(){
        var me = this,
            parsedTargetList = {},
            i,
            len,
            list,
            j,
            completeTargetName,
            v,
            parseTargetFinish = false,
            listSize,
            targetList;
        /**
         * 解析所有target
         */
        targetList = {};
        for(i in me.originTargetContainer){
            if (!i || !me.originTargetContainer[i]) continue;
            targetList[i] = me.originTargetContainer[i]; 
        }
        
        for (i in me.originTargetContainer) {
            if (!i || !me.originTargetContainer[i]) continue;
            v = me.originTargetContainer[i];
            for (j in targetList){
                if (!j || !targetList[j] || i == j) continue;
                targetList[j] = targetList[j].replace(new RegExp("<!--\\\s*import\\\s*:\\\s*("+i+")\\\s*-->","g"),v);
            }
        }
        
        me.targetContainer = targetList;
        
        return targetList;
    },
    /**
     * @name 合并模板与数据
     * @public
     * @param {HTMLElement} targetContent  原始模板内容.
     * @param {Object}      model    数据模型
     * @return {String} 替换掉${varName}变量后的模板内容.
     */
    merge: function(targetContent, model) {
        var me = this;
        model = model||{};
        targetContent = targetContent||'';
        targetContent = String(targetContent).replace(
            /\$\{([\.:a-z0-9_]+)\}/ig,
            function($0, $1) {
                $1 = $1 == null ? '' : String($1);
                var varName = $1.replace(/:[a-z]+$/i, ''),
                    variable = model[varName];
                
                // 默认读取model中的,没有再到全局context中取,防止强耦合.
                if (variable === undefined && bui && bui.context && bui.context.get) { 
                    variable = bui.context.get(varName);
                }
                //预留根据变量类型读取,便于后期扩展格式${userName:lang}
                var varType = $1.match(/:([a-z]+)$/);
                if (varType && varType.length > 1 && me.parseVariableByType) {
                    return me.parseVariableByType(varName, varType[1]);
                }
                return (variable !== undefined && variable !== null) ? variable : '';
            }
        );
        return targetContent.toString();
    },
    /**
     * @name 解析带有类型的模板变量的值
     * @private
     * @param {String} varName 变量名.
     * @param {String} type 变量类型，暂时为lang|config.
     * @return {String}
     */
    parseVariableByType: function(varName, type) {
        var packs = varName.split('.'),
            len = packs.length,
            variable,
            isFirst = true;

        type = String(type).toLowerCase();

        if (len == 1 && bui && bui[type]) {
            variable = bui[type][packs[0]];
        } 
        else {
            variable = bui.window;
            while (len--) {
                variable = variable[packs[0]];
                packs.shift();
                if (isFirst) {
                    variable = variable[type];
                    isFirst = false;
                }
            }
        }

        return variable||'';
    },
    error:function(msg){
        msg = 'Template: ' + msg;
        if (bui.window.console) {
            bui.window.console.log(msg);
        }
        else throw Error(msg);
    }
};

});