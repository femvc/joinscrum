'use strict';
/** 
 * @name 增加拖拽功能 
 * @example 
 Draggable('targetElementId',
        {
        preventDefault: true,
        start: function(){
            var me = this;
            me.startTime = new Date();
        },
        move: function(){
            if (this.moving) {return;}
            this.moving = true;
            //alert('move');
            //this.elem.style.left = this.oldPoint.left+'px';
            //this.elem.style.top = this.oldPoint.left +'px';
            
            this.moving = false;
        },
        end:function(){
            //alert('end');
            var dx = this.nowPoint.x-this.startPoint.x;
            var dy = this.nowPoint.y-this.startPoint.y;
            if (dx > 30){
                //alert('right');
                me.renderApplist('pre');
            }
            if (dx < -30){
                //alert('left');
                me.renderApplist('next');
            }
        }
    });
     
 */ 
define('./Draggable', [], function(){

var Draggable = (function(){
    var supportsTouches = ('createTouch' in document);//判断是否支持触摸
        
    function _drag(elem, opt){
        for (var i in opt){
            this[i] = opt[i];
        }
        
        this.elem = (typeof elem == 'string') ? document.getElementById(elem) : elem;//被拖动节点
        this.onstart = opt.start || new Function();//
        this.onmove  = opt.move || new Function();
        this.onend   = opt.end || new Function();
        this.click   = opt.click || new Function();
        this.revert  = opt.revert === undefined ? true : false;
        
        this.action = false;
        this.init();
    }
    _drag.prototype = {
        startEvent: supportsTouches ? "touchstart" : "mousedown",//支持触摸式使用相应的事件替代
        moveEvent: supportsTouches ? "touchmove"  : "mousemove",
        endEvent: supportsTouches ? "touchend"   : "mouseup",
        preventDefaultEvent: function(e){
            if(e) {e.preventDefault();}
            else {window.event.returnValue = false;}
        },
        getMousePoint: function(e){
            var x = 0,
                y = 0,
                doc = document.documentElement,
                body = document.body;
            if (!e) {e=window.event;}
            if (window.pageYoffset) {
                x = window.pageXOffset;
                y = window.pageYOffset;
            }
            else{
                x = (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                y = (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
            }
            if(supportsTouches){
                var evt = e.touches.item(0);//仅支持单点触摸,第一个触摸点
                x=evt.pageX;
                y=evt.pageY;
            }
            else{
                x += e.clientX;
                y += e.clientY;
            }
            return {'x' : x, 'y' : y};
        },
        getCurrentPosition: function(elem){
            var me = this,
                position = elem.currentStyle ? elem.currentStyle.position : getComputedStyle(elem).position,
                x = elem.currentStyle ? elem.currentStyle.left : getComputedStyle(elem).left,
                y = elem.currentStyle ? elem.currentStyle.top  : getComputedStyle(elem).top,
                oldPoint = {left: parseInt('0'+x, 10), top: parseInt('0'+y, 10)};
            
            return oldPoint;
        },
        cumulativeOffset: function(elem) {
            var valueT = 0, 
                valueL = 0;
            if (elem.parentNode) {
                do {
                    valueT += elem.offsetTop  || 0;
                    valueL += elem.offsetLeft || 0;
                    elem = elem.offsetParent;
                } while (elem);
            }
            return {left: valueL, top: valueT};
        },
        onmousemove: function () {
            var me = this;
            if (me.autoTop !== false && !me.zIndex) {
                me.zIndex = me.elem.style.zIndex;
            }
            me.elem.style.zIndex = 1000;
            
            if (!me.preventDefault) {
                me.newParentOffset = me.cumulativeOffset(me.elem.parentNode);
                
                me.elem.style.left = (me.nowPoint.x - me.newParentOffset.left - me.relativePosition.left - me.relativeCursor.left) + 'px';
                me.elem.style.top  = (me.nowPoint.y - me.newParentOffset.top  - me.relativePosition.top  - me.relativeCursor.top ) + 'px';
                /*
                me.elem.style.left = (me.oldPoint.x + 
                                      me.nowPoint.x-me.startPoint.x + 
                                      me.oldParentOffset.left - me.newParentOffset.left) + 'px';
                me.elem.style.top  = (me.oldPoint.y + 
                                      me.nowPoint.y-me.startPoint.y +
                                      me.oldParentOffset.top - me.newParentOffset.top) + 'px';
                */
            }
            //this.elem.style.left=this.nowPoint.x+'px';
            //this.elem.style.top=this.nowPoint.y+'px';
            // Check if any element affect by drag.
            if (typeof Droppables != 'undefined' && Droppables.show && !me.dropTimer) {
                me.dropTimer = window.setTimeout(function(){ 
                    me.dropTimer = null;
                    Droppables.show(me.nowPoint, me); 
                    
                }, 50);
            }
            
            me.onmove();
        },
        init: function(){
            var me = this,
                elem = me.elem;
            
            elem.setAttribute('draggable', 'true');
            
            // 注：只支持自身是relative的拖拽，absolute的有待扩展
            me.position = elem.currentStyle ? elem.currentStyle.position : getComputedStyle(elem).position;
            if (me.position != 'relative' && me.position != 'absolute') {
                elem.style.position = 'relative';
            }
            
            elem['on'+me.startEvent] = me.bind(function(e){//绑定节点的 [鼠标按下/触摸开始] 事件
                
                //根据外部处理结果决定是否
                if (this.onstart(e) !== false) {
                    //this.preventDefaultEvent(e);
                    if (this.action) return false;
                    else this.action = true;
                    
                    this.startPoint = this.getMousePoint(e);
                    // 注：被拖拽对象的原始位置. 有可能position:relative;left:10px;top:10px;
                    this.oldPoint        = this.getCurrentPosition(this.elem);
                    this.oldParentOffset = this.cumulativeOffset(this.elem.parentNode);
                    this.nowPoint        = this.getMousePoint(e);
                    
                    this.relativePosition   = {
                        left: this.elem.offsetLeft - this.oldPoint.left, 
                        top:  this.elem.offsetTop  - this.oldPoint.top
                    };
                    this.relativeCursor   = {
                        left: this.nowPoint.x - this.oldParentOffset.left - this.relativePosition.left, 
                        top : this.nowPoint.y - this.oldParentOffset.top  - this.relativePosition.top
                    };
                    this.isMoved = false;
                    
                    document['on'+this.moveEvent] = this.bind(function(e){
                        //取消文档的默认行为[鼠标移动、触摸移动]
                        this.preventDefaultEvent(e);
                        var me = this;
                        me.nowPoint = me.getMousePoint(e);
                        
                        if (!me.onmoveTimer) {
                            me.onmoveTimer = window.setTimeout(function(){
                                me.onmoveTimer = null;
                                me.isMoved = true;
                                me.onmousemove(e);
                            }, 30);
                        }
                        
                    }, this);
                    
                    document['on'+this.endEvent] = document['ontouchcancel'] = this.bind(function(){
                        window.clearTimeout(this.onmoveTimer);
                        this.onmoveTimer = null;
                        
                        document['on'+this.endEvent] = document['ontouchcancel'] = document['on'+this.moveEvent] = null;
                        
                        if (this.autoTop !== false){
                            this.elem.style.zIndex = this.zIndex;
                        }
                        this.action = false;
                        if (this.isMoved && this.onend() !== false && this.revert) {
                            this.elem.style.left = '0px';
                            this.elem.style.top = '0px';
                        }
                    }, this);
                }
                else {
                    this.action = false;
                }
            }, me);
        },
        bind:function(fn,obj){
            return function(){
                fn.apply(obj, arguments);
            }
        },
        moveSelfTo: function (drop, point) {
            var me = this,
                newParentOffset = me.cumulativeOffset(drop),
                oldParentOffset = me.cumulativeOffset(me.elem.parentNode),
                num,
                taskItems,
                frontNum,
                child;
                
            taskItems = me.c('task', drop);
            num = Math.floor((20 + point.y - newParentOffset.top)/43);
            
            // !child
            if (num > taskItems.length-1) {
                frontNum = taskItems.length > 0 ? taskItems.length-1 : 0;
                child = null;
            }
            else {
                child = taskItems[num];
                
                if (child == me.elem || (child == me.elem.nextSibling)) {
                    return;
                }
                
                frontNum = num;
                if (child.parentNode == me.elem.parentNode ) {
                    for (var i=0,len=taskItems.length; i<len; i++) {
                        if (taskItems[i] == me.elem && i < num) {
                            frontNum = num - 1; break;
                        }
                    }
                }
            }
            
            var relativePosition = {
                left: 0,
                top: 7 + frontNum * 43
            };
            
            me.relativePosition = relativePosition;
            me.newParentOffset = newParentOffset;
            
            drop.insertBefore(me.elem, child);
            // me.onmoveTimer是为了防止出现drop后蹦回去的情况
            if (!me.preventDefault && me.onmoveTimer) {
                me.elem.style.left = (me.nowPoint.x - me.newParentOffset.left - me.relativePosition.left - me.relativeCursor.left) + 'px';
                me.elem.style.top  = (me.nowPoint.y - me.newParentOffset.top  - me.relativePosition.top  - me.relativeCursor.top ) + 'px';
            }
        },
        c: function(searchClass, node, tag) {  
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
        }
    };
    
    var result = function(elem, opt){
        var dragElem = new _drag(elem, opt);
        result.drags.push(dragElem);
        
        return dragElem;
    };
    result.drags = [];
    
    return result;
})(); 

// !!! global.Draggable = ...
if (typeof window != 'undefined') {window.Draggable = Draggable;}
if (typeof global != 'undefined') {global.Draggable = Draggable;}

//////////////////////////////////////Drag End////////////////////////////////////////////////

var Droppables = {
    drops: [],

    remove: function(elem) {
        var me = this,
            list = me.drops;
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i] == elem) {
                me.drop.splice(i, 1);
                break;
            }
        }
    },
    add: function(elem) {
        this.drops.push(elem);
    },
    show: function(point, drag) {
        if(!this.drops.length) return;

        var me = this,
            drops = me.drops,
            drop, 
            affected = [],
            elem = drag.elem;
        
        for (var i=0,len=drops.length; i<len; i++) {
            drop = drops[i];
            if (me.within(drop, point.x, point.y)) {
                affected.push(drop);      
            }
        }
        
        for (var i=0,len=affected.length; i<len; i++) {
            drop = affected[i];
            
            (drop.onHover ? drop.onHover(drag, drop, point) : Droppables.onHover(drag, drop, point));
        }
    },
    // caches x/y coordinate pair to use with overlap
    within: function(elem, x, y) {
        if (this.includeScrollOffsets) {
            return this.withinIncludingScrolloffsets(elem, x, y);
        }
        this.xcomp = x;
        this.ycomp = y;
        this.offset = this.cumulativeOffset(elem);

        return (y >= this.offset.top &&
                y <  this.offset.top + elem.offsetHeight &&
                x >= this.offset.left &&
                x <  this.offset.left + elem.offsetWidth);
    },
    withinIncludingScrolloffsets: function(elem, x, y) {
        var offsetcache = this.cumulativeScrollOffset(elem);

        this.xcomp = x + offsetcache.left - this.deltaX;
        this.ycomp = y + offsetcache.top - this.deltaY;
        this.offset = this.cumulativeOffset(elem);

        return (this.ycomp >= this.offset.top &&
                this.ycomp <  this.offset.top + elem.offsetHeight &&
                this.xcomp >= this.offset.left &&
                this.xcomp <  this.offset.left + elem.offsetWidth);
    },
    cumulativeOffset: function(elem) {
        var valueT = 0, 
            valueL = 0;
        if (elem.parentNode) {
            do {
                valueT += elem.offsetTop  || 0;
                valueL += elem.offsetLeft || 0;
                elem = elem.offsetParent;
            } while (elem);
        }
        return {left: valueL, top: valueT};
    },
    cumulativeScrollOffset: function(elem) {
        var valueT = 0, valueL = 0;
        do {
            valueT += elem.scrollTop  || 0;
            valueL += elem.scrollLeft || 0;
            elem = elem.parentNode;
        } while (elem);
        
        return {left: valueL, top: valueT};
    },
    onHover: function(drag, drop, point) {
        var elem = drag.elem,
            oldParentNode = elem.parentNode;
        
        drag.moveSelfTo(drop, point);
    }
};

// !!! global.Draggable = ...
if (typeof window != 'undefined') {window.Droppables = Droppables;}
if (typeof global != 'undefined') {global.Droppables = Droppables;}


});