'use strict';
/*
 * HTML Parser By Andy Wang (femvc.com)
 * Original code by Andy Wang, Mozilla Public License
 * Use like this:
 *     var opt_str = '<div id="test">This is a test.</div>';
 *     bui.bocument.documentElement.setInnerHTML(opt_str);
 *     alert(bui.bocument.getElementById('test').getInnerHTML());
 *
 */
define('./bui.HTMLElement', ['./bui'], function(){

bui.HTMLElement = function(options) {
    this.guid = bui.HTMLElement.makeGUID();
}
bui.HTMLElement.prototype = {
    getGUID: function () {
        var me = this;
        return me.guid;
    },
    appendChild: function (child) {
        var me = this;
        if (me.childNodes) {
            me.childNodes.push(child);
        }
    },
    insertBefore: function (parentNode, nextSibling) {
        var me = this;
    },
    insertAfter: function (parentNode, previousSibling) {
        
    },
    getAttribute: function (attrName) {
        var me = this,
            attrValue = undefined,
            list = me.attributes || [];
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].name == attrName) {
                attrValue = list[i].value;
                break;
            }
        }
        return attrValue;
    },
    setAttribute: function (attrName, attrValue) {
        var me = this,
            attrValue = attrValue == undefined ? '' : attrValue,
            list = me.attributes || [],
            exist = false;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].name == attrName) {
                list[i].value = attrValue;
                exist = true;
                break;
            }
        }
        if (!exist) {
            me.attributes.push({name: attrName, value: attrValue});
        }
        return attrValue;
    },
    removeAttribute: function (attrName) {
        var me = this,
            attrValue = undefined,
            list = me.attributes || [],
            exist = false;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i].name == attrName) {
                me.attributes.splice(i,1);
                break;
            }
        }
        
        return attrValue;
    },
    getElementsByTagName: function (tagName) {
        var me = this,
            list = bui.HTMLElement.findAllNodes(me),
            result = [];
    
        for (var i=0,len=list.length; i<len; i++) {
            if(tagName == list[i].tagName){
                result.push(list[i]);
            }
        }
        return result;
    },
    setInnerHTML: function (str) {
        var me = this;
        me.childNodes = [];
        bui.bocument.parse(str, me);
    },
    getInnerHTML: function () {
        var me = this,
            html = '',
            list = me.childNodes || [];
        for (var i=0,len=list.length; i<len; i++) {
            html += list[i].getOuterHTML();
        }
        return html;
    },
    getOuterHTML: function () {
        var me = this,
            html = '',
            inner,
            list = me.attributes || [];
        for (var i=0,len=list.length; i<len; i++) {
            html += ' ' + list[i].name + '="' + (list[i].value == undefined ? '' : list[i].value) + '"';
        }
        if (me.nodeType == 'selfClose') {
            html = me.tagName == 'nodetext' && me.clazz == 'Text()' ? me.nodeValue : '<' + me.tagName + html + ' />';
        }
        else {
            inner = me.getInnerHTML();
            html = '<' + me.tagName + html + ' >' + inner + '</' + me.tagName + '>';
        }
        
        return html;
    }
};
/**
* @name 获取唯一id
* @public
* @return {String}
*/
bui.HTMLElement.makeGUID = (function(){
    var guid = 1000000; // 0 -> root
    return function(){
        return String( guid++ );
    };
})(); 

/**
 * @name 获取所有子节点element
 * @public
 * @param {HTMLElement} elem
 * @param {String} stopAttr 如果元素存在该属性,如'ui',则不遍历其下面的子元素
 */
bui.HTMLElement.findAllNodes = function(elem, stopAttr){
    var i, len, k, v,
        childNode,
        elements,
        list,
        childlist,
        node;
    elements=[];
    list=[elem];
    
    while(list.length){
        childNode= list.pop();
        if(!childNode) continue;
        // Not set 'stopAttr', get all nodeds.
        if (stopAttr === undefined || (childNode.getAttribute && childNode.getAttribute(stopAttr))) {
            elements.push(childNode);
        }
        childlist = childNode.childNodes;
        if (!childlist||childlist.length<1) continue;
        if (childNode != elem && stopAttr!==undefined && childNode.getAttribute(stopAttr)) {
            continue;
        }
        for (i=0,len=childlist.length;i<len;i++){
            node = childlist[i];
            list.push(node);
        }
    }
    // 去掉顶层elem,如不去掉处理复合控件时会导致死循环!!
    if(elements[0] === elem) elements.shift();
    
    return elements.reverse();
};

/**
* @name 根据GUID获取元素
* @public
* @param {String} guid 元素全局唯一标识符
* @return {element}
*/
bui.HTMLElement.getElementByGUID = function (guid, parentNode) {
    var me = this,
        result = null,
        parentNode = parentNode || bui.bocument.documentElement,
        list = bui.HTMLElement.findAllNodes(parentNode);
    
    if (guid === undefined || guid === parentNode.getGUID()) {
        result = parentNode;
    }
    else if (parentNode) { 
        for (var i=0,len=list.length; i<len; i++) {
            if(guid == list[i].getGUID()){
                result = list[i];
                break;
            }
        }
    }
    
    return result;
};

bui.bocument = {
    // Regular Expressions for parsing tags and attributes
	startTag: /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*\")|(?:'[^']*\')|[^>\s]+))?)*)\s*(\/?)>/,
	endTag  : /^<\/([-A-Za-z0-9_]+)[^>]*>/,
	attr    : /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)\")|(?:'((?:\\.|[^'])*)\')|([^>\s]+)))?/g,
	
    // System Elements
    sysTag:   {'html':1,'head':1,'body':1,'title':1},	
	
    // Empty Elements - HTML 4.01
	empty:     {'area':1,'base':1,'basefont':1,'br':1,'col':1,'frame':1,'hr':1,'img':1,'input':1,'isindex':1,
                'link':1,'meta':1,'param':1,'embed':1},
    
	// Block Elements - HTML 4.01
	block:     {'address':1,'applet':1,'blockquote':1,'button':1,'center':1,'dd':1,'del':1,'dir':1,'div':1,
                'dl':1,'dt':1,'fieldset':1,'form':1,'frameset':1,'hr':1,'iframe':1,'ins':1,'isindex':1,'li':1,
                'map':1,'menu':1,'noframes':1,'noscript':1,'object':1,'ol':1,'p':1,'pre':1,'script':1,'table':1,
                'tbody':1,'td':1,'tfoot':1,'th':1,'thead':1,'tr':1,'ul':1},
    
	// Inline Elements - HTML 4.01
	inline:    {'a':1,'abbr':1,'acronym':1,'applet':1,'b':1,'basefont':1,'bdo':1,'big':1,'br':1,'button':1,
                'cite':1,'code':1,'del':1,'dfn':1,'em':1,'font':1,'i':1,'iframe':1,'img':1,'input':1,'ins':1,
                'kbd':1,'label':1,'map':1,'object':1,'q':1,'s':1,'samp':1,'script':1,'select':1,'small':1,
                'span':1,'strike':1,'strong':1,'sub':1,'sup':1,'textarea':1,'tt':1,'u':1,'var':1},
    
	// Elements that you can':1,' intentionally':1,' leave open
	// (and which close themselves)
	closeSelf: {'colgroup':1,'dd':1,'dt':1,'li':1,'options':1,'p':1,'td':1,'tfoot':1,'th':1,'thead':1,'tr':1},
    
	// Attributes that have their values filled in disabled="disabled"
	fillAttrs: {'checked':1,'compact':1,'declare':1,'defer':1,'disabled':1,'ismap':1,'multiple':1,'nohref':1,
                'noresize':1,'noshade':1,'nowrap':1,'readonly':1,'selected':1},
    
	// Special Elements (can contain anything)
	special:   {'script':1,'style':1},
    // Token serial
    stack: [],
    // Strict xml model!!
	parse: function( html, root ) {
        var me = this;
        me.stack = me.tokenization(html);
        me.domtree = me.treeConstruction(me.stack, root);
        return me.domtree;
    },
    // Token serial
    tokenization: function( html ) {
		var me = this,
            tokenserial = [],
            index,
            m, n,
            token,
            nodeValue,
            match, 
            last = html = String(html);
        
        // status machines
        var chars = true,
            attrs = false,
            tagOpen = false,
            commentOpen = false,
            docOpen = true,
            script = false,
            style = false;
        
        // <!--comment--> <html>1234</html>
		while ( html ) {
            // doctype 
            if ( html.indexOf('<!DOCTYPE') == 0 ) {
                m = html.indexOf('>', 5);
                n = html.indexOf('<', 5);
                
                index = m == -1 ?  (n  > -1 ? /*m=-1&&n>-1*/n     : /*m=-1&&n=-1*/html.length) : 
                      /*m  > -1 ?*/(n == -1 ? /*m>-1&&n=-1*/m + 1 : /*m>-1&&n>-1*/(m > n ? n : m + 1));
                nodeValue = html.substring(0, index);
                token = {tagName: 'doctype', clazz: 'DocumentType()', nodeValue: nodeValue, nodeType: 'selfClose'};
                tokenserial.push(token);
                html = html.substring(index, html.length);
            } 
            // Comment 
            else if ( html.indexOf('<!--') == 0 ) {
                m = html.indexOf('<!--');
                n = html.indexOf('-->', m + 4);
                n = n == -1 ? html.length : n;
                nodeValue = html.substring(m + 4, n);
                token = {tagName: 'comment', clazz: 'Comment()', nodeValue: nodeValue, nodeType: 'selfClose'};
                tokenserial.push(token);
                html = html.substring(0, m) + html.substring(n + 3, html.length);
            } 
            // end tag
            if ( html.indexOf('</') == 0 ) {
                match = html.match( me.endTag );
                
                if ( match ) {
                    token = {tagName: match[1], clazz: 'HTMLElement()', nodeType: 'endTag'}; 
                    tokenserial.push(token);
                    html = html.substring( match[0].length );
                }
            } 
            // start tag
            else if ( html.indexOf('<') == 0 ) {
                match = html.match( me.startTag );
                
                if ( match ) {
                    var attrs = [];
	            
                    match[2].replace(me.attr, function(match, name) {
                        var value = arguments[2] ? arguments[2] :
                            arguments[3] ? arguments[3] :
                            arguments[4] ? arguments[4] :
                            me.fillAttrs[name] ? name : "";

                        attrs.push({
                            name: name,
                            value: value,
                            escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
                        });
                    });
                    
                    token = {tagName: match[1], clazz: 'HTMLElement()', attributes: attrs, nodeType: 'startTag'}; 
                    tokenserial.push(token);
                    html = html.substring( match[0].length );
                }
            }
            // text
            else {
                m = html.indexOf('<', 1);
                index = m == -1 ?  html.length : m;
                nodeValue = html.substring(0, index);
                
                token = {tagName: 'nodetext', clazz: 'Text()', nodeValue: nodeValue, nodeType: 'selfClose'};
                tokenserial.push(token);
                html = html.substring(index, html.length);
            }
        }
        
        return tokenserial;
    },
    treeConstruction: function (tokens, parentNode) {
        var me = this,
            domtree = parentNode || bui.bocument.documentElement,
            curentParent = domtree,
            token,
            elem,
            parentElem;
        for (var i=0,len=tokens.length; i<len; i++) {
            token = tokens[i];
            
            if (token.nodeType == 'selfClose') {
                elem = me.createElement(token.tagName, token);
                curentParent.childNodes.push(elem);
                elem.parentNode = curentParent.getGUID();
            }
            else if (me.empty[token.tagName] || token.nodeType == 'startTag') {
                token.nodeType = 'startTag';
                elem = me.createElement(token.tagName, token);
                curentParent.childNodes.push(elem);
                elem.parentNode = curentParent.getGUID();
                
                // Not empty tag
                if (!me.empty[token.tagName] && !me.closeSelf[token.tagName]) {
                    elem.childNodes = [];
                    curentParent = elem;
                }
            }
            else if (token.nodeType == 'endTag') {
                if (!me.closeSelf[token.tagName]) {
                    
                    if (token.tagName == curentParent.tagName) {
                        curentParent = bui.HTMLElement.getElementByGUID(curentParent.parentNode, domtree);
                    }
                    // Only deal with block tag!
                    else if (me.block[token.tagName]) {
                        parentElem = curentParent;
                        while (parentElem) {
                            if (parentElem.tagName == token.tagName) {
                                curentParent = bui.HTMLElement.getElementByGUID(parentElem.parentNode, domtree);
                            }
                            else {
                                parentElem = parentElem.parentNode;
                            }
                        }
                    }
                }
            }
        }
        return domtree;
        
    },
    createElement: function (tagName, options) {
        var me = this,
            clazz = me.getElementConstructor(),
            elem = new clazz();
        
        options.tagName = tagName;
        
        for (var i in options) {
            elem[i] = options[i];
        }
        return elem;
    },
    getElementConstructor: function () {
        return function () {
            this.getGUID = function(){return this.guid;};
        };
    },
    getElementById: function (id) {
        var me = this,
            list = bui.HTMLElement.findAllNodes(bui.bocument.documentElement),
            result = undefined;

        for (var i=0,len=list.length; i<len; i++) {
            if (id === list[i].getAttribute('id')){
                result = list[i];
                break;
            }
        }
        return result;
    }
};
// Over write method 'getElementConstructor'
bui.bocument.getElementConstructor = function () {
    return bui.HTMLElement;
};

// 根节点 
bui.bocument.documentElement = bui.bocument.createElement('HTML', {childNodes:[], clazz: 'HTMLElement()', nodeType: 'startTag'});
// body节点 
bui.bocument.body = bui.bocument.createElement('BODY', {childNodes:[], clazz: 'HTMLElement()', nodeType: 'startTag'});

bui.window = {};

});