/*!
*
* clay-laboratory - Provide more flexible data visualization solutions!
* git+https://github.com/yelloxing/clay.git
* 
* author 心叶
*
* version 1.4.0
* 
* build Sun Jul 29 2018
*
* Copyright yelloxing
* Released under the MIT license
* 
* Date:Fri Nov 23 2018 10:36:45 GMT+0800 (CST)
*/
(function (global, factory) {

    'use strict';

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);
    } else {
        factory(global);
    }

})(typeof window !== "undefined" ? window : this, function (global, undefined) {

    'use strict';

    var clay = function (selector, context) {
        return new clay.prototype.init(selector, context);
    };

    clay.prototype.init = function (selector, context) {

        this.context = context = context || document;
        var nodes = _sizzle(selector, context), flag;
        for (flag = 0; flag < nodes.length; flag++) {
            this[flag] = nodes[flag];
        }
        this.selector = selector;
        this.length = nodes.length;
        return this;

    };

    clay.prototype.init.prototype = clay.prototype;

    // 命名空间路径
var _namespace = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
};

// 空格、标志符
var _regexp = {
    // http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace: "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier: "(?:\\\\.|[\\w-]|[^\0-\\xa0])+"
};

// 记录需要使用xlink命名空间常见的xml属性
var _xlink = ["href", "title", "show", "type", "role", "actuate"];

// 负责查找结点
function _sizzle(selector, context) {

    var temp = [], flag;
    if (typeof selector === 'string') {
        // 去掉回车，空格和换行
        selector = (selector + "").trim().replace(/[\n\f\r]/g, '');

        // 支持的选择器包括：
        // #id .class [attr='value'] tagName
        // 包括任意组合
        // 如果选择全部元素，只可以传递一个*
        if (selector === "*") {
            return context.getElementsByTagName('*');
        }

        // 用于判断是否为合法选择器组合
        var whitespace = _regexp.whitespace,
            identifier = _regexp.identifier,
            attrReg = "\\[" + whitespace + "{0,}" + identifier + "(?:" + whitespace + "{0,}=" + whitespace + "{0,}(\\\'|\\\"){0,1}" + identifier + "\\1{0,1}){0,1}" + whitespace + "{0,}\\]",
            regexp = new RegExp("^(?:" + identifier + "){0,1}(?:(?:#|\\.)" + identifier + "|" + attrReg + "){0,}$");
        if (regexp.test(selector)) {

            // 分离出来四大选择器
            // 然后初始化容器
            var targetNodes,
                id = selector.match(new RegExp('#' + identifier, 'g')),
                cls = selector.match(new RegExp('\\.' + identifier, 'g')),
                tag = selector.match(new RegExp('^' + identifier)),
                attr = selector.match(new RegExp(attrReg, 'g'));
            if (id) {
                if (id.length > 1) {
                    return [];
                }
                // IE 6+, Firefox 3+, Safari 3+, Chrome 4+, and Opera 10+
                // 如果使用了id选择器，自动在全局查找
                targetNodes = document.getElementById((id.shift(0) + "").replace(/^#/, ''));
                targetNodes = targetNodes ? [targetNodes] : [];
            } else if (context.getElementsByClassName && cls) {

                // IE 9+, Firefox 3+, Safari4+, Chrome 4+, and Opera 10+
                targetNodes = context.getElementsByClassName((cls.shift(0) + "").replace(/^\./, ''));
            } else if (tag) {
                targetNodes = context.getElementsByTagName(tag.shift(0));
            } else {
                targetNodes = context.getElementsByTagName('*');
            }

            // 利用余下条件进行过滤
            // 只需要过滤class、tag和attr
            var t, x, y, f,
                attrSplit = "^\\[" + whitespace + "{0,}(" + identifier + ")(?:" + whitespace + "{0,}=" + whitespace + "{0,}(?:\\\'|\\\"){0,1}(" + identifier + ")(?:\\\'|\\\"){0,1}){0,1}" + whitespace + "{0,}\\]$",
                attrSplitReg = new RegExp(attrSplit);
            for (flag = 0; flag < targetNodes.length; flag++) {
                f = true;
                if (tag && tag.length > 0) {

                    // 由于标签tagName存在大小写的不同
                    // 比较的时候直接统一用大写
                    if ((tag[0] + "").toUpperCase() !== (targetNodes[flag].tagName + "").toUpperCase()) {
                        continue;
                    }
                }

                t = " " + targetNodes[flag].getAttribute('class') + " ";
                for (x = 0; f && cls && x < cls.length; x++) {
                    if (t.search(" " + (cls[x] + "").replace(/\./, '') + " ") < 0) {
                        f = false;
                        break;
                    }
                }

                for (x = 0; f && attr && x < attr.length; x++) {
                    t = attrSplitReg.exec(attr[x]);
                    y = targetNodes[flag].getAttribute(t[1]);
                    // 属性值写的时候需要相等
                    if (y === null || (t[2] && y != t[2])) {
                        f = false;
                        break;
                    }
                }
                if (f)
                    temp.push(targetNodes[flag]);
            }

            return temp;
        }

        // 其它情况一律认为希望把字符串变成结点
        else {
            try {
                return [_toNode(selector)];
            } catch (e) {
                return [];
            }
        }

    }
    // 如果是结点
    else if (selector && (selector.nodeType === 1 || selector.nodeType === 11 || selector.nodeType === 9)) {
        return [selector];
    }
    // 如果是结点集合
    else if (selector && (selector.constructor === Array || selector.constructor === HTMLCollection || selector.constructor === NodeList)) {
        for (flag = 0; flag < selector.length; flag++) {
            if (selector[flag] && (selector[flag].nodeType === 1 || selector[flag].nodeType === 11 || selector[flag].nodeType === 9)) {
                temp.push(selector[flag]);
            }
        }
        return temp;
    }
    // 如果是clay对象
    else if (selector && selector.constructor === clay) {
        return selector;
    } else {
        return [];
    }

}

// 把字符串变成结点
function _toNode(str) {
    var frame = document.createElementNS(_namespace.svg, 'svg');
    // 把传递元素类型和标记进行统一处理
    if (new RegExp("^" + _regexp.identifier + "$").test(str)) str = "<" + str + "></" + str + ">";
    frame.innerHTML = str;
    var childNodes = frame.childNodes, flag, child;
    for (flag = 0; flag < childNodes.length; flag++) {
        if (childNodes[flag].nodeType === 1 || childNodes[flag].nodeType === 9 || childNodes[flag].nodeType === 11) {
            child = childNodes[flag];
            break;
        }
    }
    // 如果不是svg元素，重新用html命名空间创建
    // 目前结点只考虑了svg元素和html元素
    // 如果考虑别的元素类型需要修改此处判断方法
    if (child.tagName == 'canvas' || /[A-Z]/.test(child.tagName)) {
        frame = document.createElement("div");
        frame.innerHTML = str;
        childNodes = frame.childNodes;
        for (flag = 0; flag < childNodes.length; flag++) {
            if (childNodes[flag].nodeType === 1 || childNodes[flag].nodeType === 9 || childNodes[flag].nodeType === 11) {
                child = childNodes[flag];
                break;
            }
        }
    }
    return child;
}

// 当前维护的第一个结点作为上下文查找
clay.prototype.find = function (selector) {
    if (this.length <= 0) return clay();
    var newClay = clay(),
        nodes = _sizzle(selector, this[0]), flag;
    newClay.selector = selector;
    for (flag = 0; flag < nodes.length; flag++) {
        newClay[flag] = nodes[flag];
        newClay.length += 1;
    }
    return newClay;
};

clay.prototype.eq = function (flag) {
    return this.length <= flag ? new clay() : new clay(this[flag]);
};

clay.prototype.appendTo = function (target) {

    var newClay = clay(target), i, j;
    for (i = 0; i < newClay.length; i++)
        for (j = 0; j < this.length; j++)
            newClay[i].appendChild(this[j]);
    return this;
};

clay.prototype.remove = function () {

    var flag;
    for (flag = 0; flag < this.length; flag++)
        this[flag].parentNode.removeChild(this[flag]);
    return this;
};

// 选择器重新查找一次
clay.prototype.refresh = function () {

    var nodes = _sizzle(this.selector, this.context), flag, length = this.length;
    this.length = 0;
    for (flag = 0; flag < nodes.length; flag++) {
        this[flag] = nodes[flag];
        this.length += 1;
    }
    for (; flag < length; flag++) {
        delete this[flag];
    }
    return this;
};

clay.prototype.attr = function (attr, val) {

    if (val == null || val == undefined) {
        return this.length > 0 ? this[0].getAttribute(attr) : undefined;
    } else {
        var flag, _val;
        for (flag = 0; flag < this.length; flag++) {
            _val = typeof val === 'function' ? val(this[flag]._data, flag, this.eq(flag)) : val;
            // 如果是xml元素
            // 针对xlink使用特殊方法赋值
            if (/[A-Z]/.test(this[flag].tagName) && _xlink.indexOf(attr) >= 0) {
                this[flag].setAttributeNS(_namespace.xlink, 'xlink:' + attr, _val);
            } else {
                this[flag].setAttribute(attr, _val);
            }
        }
        return this;
    }
};

clay.prototype.css = function (name, style) {

    if (arguments.length <= 1 && typeof name !== 'object') {
        if (this.length < 1) return undefined;
        var allStyle = document.defaultView && document.defaultView.getComputedStyle ?
            document.defaultView.getComputedStyle(this[0], null) :
            this[0].currentStyle;
        return typeof name === 'string' ?
            allStyle.getPropertyValue(name) :
            allStyle;
    } else if (this.length > 0) {
        var flag, key;
        if (typeof name === 'object') {
            for (key in name)
                for (flag = 0; flag < this.length; flag++)
                    this[flag].style[key] = typeof style === 'function' ? style(this[flag]._data, flag, key, name[key]) : name[key];
        } else {
            for (flag = 0; flag < this.length; flag++)
                this[flag].style[name] = typeof style === 'function' ? style(this[flag]._data, flag) : style;
        }
    }
    return this;

};

clay.prototype.size = function (type) {
    type = type || "border";
    var elemHeight, elemWidth;
    if (type == 'content') { //内容
        elemWidth = this[0].clientWidth - ((this.css('padding-left') + "").replace('px', '')) - ((this.css('padding-right') + "").replace('px', ''));
        elemHeight = this[0].clientHeight - ((this.css('padding-top') + "").replace('px', '')) - ((this.css('padding-bottom') + "").replace('px', ''));
    } else if (type == 'padding') { //内容+内边距
        elemWidth = this[0].clientWidth;
        elemHeight = this[0].clientHeight;
    } else if (type == 'border') { //内容+内边距+边框
        elemWidth = this[0].offsetWidth;
        elemHeight = this[0].offsetHeight;
    } else if (type == 'scroll') { //滚动的宽（不包括border）
        elemWidth = this[0].scrollWidth;
        elemHeight = this[0].scrollHeight;
    }
    return {
        width: elemWidth,
        height: elemHeight
    };
};

// 用于把数据绑定到一组结点或返回第一个结点数据
// 可以传递函数对数据处理
clay.prototype.datum = function (data, calcback) {

    if (data === null || data === undefined) {
        return this.length > 0 ? this[0]._data : undefined;
    } else {
        var flag;
        for (flag = 0; flag < this.length; flag++) {
            data = typeof calcback === 'function' ? calcback(data, flag) : data;
            this[flag]._data = data;
        }
        return this;
    }

};
// 用于把一组数据绑定到一组结点或返回一组结点数据
// 可以传递函数对数据处理
clay.prototype.data = function (datas, calcback) {

    var flag, temp = [];
    if (datas && datas.constructor === Array) {
        // 创建新的对象返回，不修改原来对象
        var newClay = clay();
        newClay.selector = this.selector;
        for (flag = 0; flag < datas.length && flag < this.length; flag++) {
            this[flag]._data = typeof calcback === 'function' ? calcback(datas[flag], flag) : datas[flag];
            newClay[flag] = this[flag];
            newClay.length += 1;
        }
        // 分别记录需要去平衡的数据和结点
        newClay._enter = [];
        for (; flag < datas.length; flag++) {
            newClay._enter.push(typeof calcback === 'function' ? calcback(datas[flag], flag) : datas[flag]);
        }
        newClay._exit = [];
        for (; flag < this.length; flag++) {
            newClay._exit.push(this[flag]);
        }
        return newClay;
    } else {
        // 获取数据
        for (flag = 0; flag < this.length; flag++) {
            temp[flag] = this[flag]._data;
        }
        return temp;
    }

};
// 把过滤出来多于结点的数据部分变成结点返回
// 需要传递一个字符串来标明新创建元素是什么
clay.prototype.enter = function (str) {

    var flag, node, newClay = clay();
    newClay.selector = this.selector;
    for (flag = 0; this._enter && flag < this._enter.length; flag++) {
        node = _toNode(str);
        node._data = this._enter[flag];
        newClay[flag] = node;
        newClay.length += 1;
    }
    delete this._enter;
    return newClay;

};
// 把过滤出来多于数据的结点部分返回
clay.prototype.exit = function () {

    var flag, newClay = clay();
    newClay.selector = this.selector;
    for (flag = 0; this._exit && flag < this._exit.length; flag++) {
        newClay[flag] = this._exit[flag];
        newClay.length += 1;
    }
    delete this._exit;
    return newClay;

};

clay.prototype.bind = function (eventType, callback) {

    var flag;
    if (window.attachEvent)
        for (flag = 0; flag < this.length; flag++)
            // 后绑定的先执行
            this[flag].attachEvent("on" + eventType, callback);
    else
        for (flag = 0; flag < this.length; flag++)
            // 捕获
            this[flag].addEventListener(eventType, callback, false);
    return this;

};

clay.prototype.unbind = function (eventType, callback) {

    var flag;
    if (window.detachEvent)
        for (flag = 0; flag < this.length; flag++)
            this[flag].detachEvent("on" + eventType, callback);
    else
        for (flag = 0; flag < this.length; flag++)
            this[flag].removeEventListener(eventType, callback, false);
    return this;
};

/*
 ************************************
 * 事件相关计算方法
 */

//  获取鼠标相对特定元素左上角位置
clay.prototype.position = function (event) {

    var bounding = this[0].getBoundingClientRect();

    return {
        "x": event.clientX - bounding.left,
        "y": event.clientY - bounding.top
    };

};

var _clock = {
    //当前正在运动的动画的tick函数堆栈
    timers: [],
    //唯一定时器的定时间隔
    interval: 13,
    //指定了动画时长duration默认值
    speeds: 400,
    //定时器ID
    timerId: null
};

// 提供间隔执行方法
clay.animation = function (doback, duration, callback) {
    _clock.timer(function (deep) {
        //其中deep为0-1，表示改变的程度
        doback(deep);
    }, duration, callback);
};

//把tick函数推入堆栈
_clock.timer = function (tick, duration, callback) {
    if (typeof tick !== 'function') {
        throw new Error('tick is required!');
    }
    duration = typeof duration === 'number' ? duration : _clock.speeds;
    if (duration < 0) duration = -duration;
    _clock.timers.push({
        "createTime": new Date(),
        "tick": tick,
        "duration": duration,
        "callback": callback
    });
    _clock.start();
};

//开启唯一的定时器timerId
_clock.start = function () {
    if (!_clock.timerId) {
        _clock.timerId = setInterval(_clock.tick, _clock.interval);
    }
};

//被定时器调用，遍历timers堆栈
_clock.tick = function () {
    var createTime, flag, tick, callback, timer, duration, passTime, needStop, deep,
        timers = _clock.timers;
    _clock.timers = [];
    _clock.timers.length = 0;
    for (flag = 0; flag < timers.length; flag++) {
        //初始化数据
        timer = timers[flag];
        createTime = timer.createTime;
        tick = timer.tick;
        duration = timer.duration;
        callback = timer.callback;
        needStop = false;

        //执行
        passTime = (+new Date() - createTime) / duration;
        if (passTime >= 1) {
            needStop = true;
        }
        passTime = passTime > 1 ? 1 : passTime;
        deep = passTime;
        tick(deep);
        if (passTime < 1) {
            //动画没有结束再添加
            _clock.timers.push(timer);
        } else if (callback) {
            callback();
        }
    }
    if (_clock.timers.length <= 0) {
        _clock.stop();
    }
};

//停止定时器，重置timerId=null
_clock.stop = function () {
    if (_clock.timerId) {
        clearInterval(_clock.timerId);
        _clock.timerId = null;
    }
};

// 把颜色统一转变成rgba(x,x,x,x)格式
// 返回数字数组[r,g,b,a]
clay.color = function (color) {
    var temp = clay('head').css('color', color).css('color').replace(/^rgba?\(([^)]+)\)$/, '$1').split(new RegExp('\\,' + _regexp.whitespace));
    return [+temp[0], +temp[1], +temp[2], temp[3] == undefined ? 1 : +temp[3]];
};

// 给一组数据，轮询执行一遍
clay.loop = function (datas, callback) {
    var flag = 0, data;
    for (data in datas)
        callback(datas[data], data, flag++);
    return clay;
};

// 用特定色彩绘制区域
var _drawerRegion = function (pen, color, drawback) {
    pen.beginPath();
    pen.fillStyle = color;
    drawback(pen);
    pen.fill();
};

// 区域对象，用于存储区域信息
// 初衷是解决类似canvas交互问题
// 可以用于任何标签的区域控制
clay.prototype.region = function () {

    var regions = {},//区域映射表
        canvas = document.createElement('canvas'),
        rgb = [0, 0, 0],//区域标识色彩,rgb(0,0,0)表示空白区域
        p = 'r';//色彩增值位置

    canvas.setAttribute('width', this[0].offsetWidth);//内容+内边距+边框
    canvas.setAttribute('height', this[0].offsetHeight);

    var _this = this;

    // 用于计算包含关系的画板
    var canvas2D = canvas.getContext("2d"),

        regionManger = {

            // 绘制（添加）区域范围
            /**
             * region_id：区域唯一标识（一个标签上可以维护多个区域）
             * type：扩展区域类型
             * data：区域位置数据
             */
            "drawer": function (region_id, drawback) {
                if (regions[region_id] == undefined) regions[region_id] = {
                    'r': function () {
                        rgb[0] += 1;
                        p = 'g';
                        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                    },
                    'g': function () {
                        rgb[1] += 1;
                        p = 'b';
                        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                    },
                    'b': function () {
                        rgb[2] += 1;
                        p = 'r';
                        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                    }
                }[p]();
                _drawerRegion(canvas2D, regions[region_id], drawback);
                return regionManger;
            },

            // 擦除区域范围
            "erase": function (drawback) {
                _drawerRegion(canvas2D, 'rgb(0,0,0)', drawback);
                return regionManger;
            },

            // 获取此刻鼠标所在区域
            "getRegion": function (event) {
                var pos = _this.position(event), i;
                pos.x -= _this.css('border-left-width').replace('px', '');
                pos.y -= _this.css('border-top-width').replace('px', '');
                var currentRGBA = canvas2D.getImageData(pos.x - 0.5, pos.y - 0.5, 1, 1).data;
                for (i in regions) {
                    if ("rgb(" + currentRGBA[0] + "," + currentRGBA[1] + "," + currentRGBA[2] + ")" == regions[i]) {
                        return [i, pos.x, pos.y];
                    }
                }
                return undefined;
            }
        };

    return regionManger;

};

// 获取canvas2D对象
function _getCanvas2D(selector) {
    if (selector && selector.constructor === CanvasRenderingContext2D)
        return selector;
    else {
        var canvas = clay(selector);
        if (canvas.length > 0)
            return canvas[0].getContext("2d");
    }
}

// 直接使用canvas2D绘图
clay.prototype.painter = function () {
    if (this.length > 0 && (this[0].nodeName != 'CANVAS' && this[0].nodeName != 'canvas'))
        throw new Error('painter is not function');
    return _getCanvas2D(this);
};

// 使用图层绘图
clay.prototype.layer = function () {
    if (this.length > 0 && (this[0].nodeName != 'CANVAS' && this[0].nodeName != 'canvas'))
        throw new Error('layer is not function');
    // 画笔
    var painter = _getCanvas2D(this),
        canvas = [],
        // 图层集合
        layer = {};
    var width = this[0].clientWidth,//内容+内边距
        height = this[0].clientHeight;
    var layerManager = {
        "painter": function (index) {
            if (!layer[index] || layer[index].constructor !== CanvasRenderingContext2D) {

                canvas.push(document.createElement('canvas'));
                // 设置大小才会避免莫名其妙的错误
                canvas[canvas.length - 1].setAttribute('width', width);
                canvas[canvas.length - 1].setAttribute('height', height);

                layer[index] = canvas[canvas.length - 1].getContext('2d');
            }
            return layer[index];
        },
        "clean": function (ctx2D) {
            ctx2D.clearRect(0, 0, width, height);
            return layerManager;
        },
        "update": function () {
            if (painter && painter.constructor === CanvasRenderingContext2D) {
                var flag;
                painter.clearRect(0, 0, width, height);
                painter.save();
                // 混合模式等先不考虑
                for (flag = 0; flag < canvas.length; flag++) {
                    painter.drawImage(canvas[flag], 0, 0, width, height, 0, 0, width, height);
                }
                painter.restore();
            }
            return layerManager;
        }
    };

    return layerManager;

};

// 在(a,b,c)方向位移d
var _move = function (d, a, b, c) {
    c = c || 0;
    var sqrt = Math.sqrt(a * a + b * b + c * c);
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        a * d / sqrt, b * d / sqrt, c * d / sqrt, 1
    ];
};

// 围绕0Z轴旋转
// 其它的旋转可以借助transform实现
// 旋转角度单位采用弧度制
var _rotate = function (deg) {
    var sin = Math.sin(deg),
        cos = Math.cos(deg);
    return [
        cos, sin, 0, 0,
        -sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

// 围绕圆心x、y和z分别缩放xTimes, yTimes和zTimes倍
var _scale = function (xTimes, yTimes, zTimes, cx, cy, cz) {
    cx = cx || 0; cy = cy || 0; cz = cz || 0;
    return [
        xTimes, 0, 0, 0,
        0, yTimes, 0, 0,
        0, 0, zTimes, 0,
        cx - cx * xTimes, cy - cy * yTimes, cz - cz * zTimes, 1
    ];
};

// 针对任意射线(a1,b1,c1)->(a2,b2,c2)
// 计算出二个变换矩阵
// 分别为：任意射线变成OZ轴变换矩阵 + OZ轴变回原来的射线的变换矩阵
var _transform = function (a1, b1, c1, a2, b2, c2) {

    if (typeof a1 === 'number' && typeof b1 === 'number') {

        // 如果设置二个点
        // 表示二维上围绕某个点旋转
        if (typeof c1 !== 'number') {
            c1 = 0; a2 = a1; b2 = b1; c2 = 1;
        }
        // 只设置三个点(设置不足六个点都认为只设置了三个点)
        // 表示围绕从原点出发的射线旋转
        else if (typeof a2 !== 'number' || typeof b2 !== 'number' || typeof c2 !== 'number') {
            a2 = a1; b2 = b1; c2 = c1; a1 = 0; b1 = 0; c1 = 0;
        }

        if (a1 == a2 && b1 == b2 && c1 == c2) throw new Error('It\'s not a legitimate ray!');

        var sqrt1 = Math.sqrt((a2 - a1) * (a2 - a1) + (b2 - b1) * (b2 - b1)),
            cos1 = sqrt1 != 0 ? (b2 - b1) / sqrt1 : 1,
            sin1 = sqrt1 != 0 ? (a2 - a1) / sqrt1 : 0,

            b = (a2 - a1) * sin1 + (b2 - b1) * cos1,
            c = c2 - c1,

            sqrt2 = Math.sqrt(b * b + c * c),
            cos2 = sqrt2 != 0 ? c / sqrt2 : 1,
            sin2 = sqrt2 != 0 ? b / sqrt2 : 0;

        return [

            // 任意射线变成OZ轴变换矩阵
            [
                cos1, cos2 * sin1, sin1 * sin2, 0,
                -sin1, cos1 * cos2, cos1 * sin2, 0,
                0, -sin2, cos2, 0,
                b1 * sin1 - a1 * cos1, c1 * sin2 - a1 * sin1 * cos2 - b1 * cos1 * cos2, -a1 * sin1 * sin2 - b1 * cos1 * sin2 - c1 * cos2, 1
            ],

            // OZ轴变回原来的射线的变换矩阵
            [
                cos1, -sin1, 0, 0,
                cos2 * sin1, cos2 * cos1, -sin2, 0,
                sin1 * sin2, cos1 * sin2, cos2, 0,
                a1, b1, c1, 1
            ]

        ];
    } else {
        throw new Error('a1 and b1 is required!');
    }
};

// 二个4x4矩阵相乘
// 或矩阵和齐次坐标相乘
var _multiply = function (matrix4, param) {
    var newParam = [], i, j;
    for (i = 0; i < 4; i++)
        for (j = 0; j < param.length / 4; j++)
            newParam[j * 4 + i] =
                matrix4[i] * param[j * 4] +
                matrix4[i + 4] * param[j * 4 + 1] +
                matrix4[i + 8] * param[j * 4 + 2] +
                matrix4[i + 12] * param[j * 4 + 3];
    return newParam;
};

/**
 * 4x4矩阵
 * 列主序存储
 */
clay.Matrix4 = function (initMatrix4) {

    var matrix4 = initMatrix4 || [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    var matrix4Obj = {
        "move": function (dis, a, b, c) {
            matrix4 = _multiply(_move(dis, a, b, c), matrix4);
            return matrix4Obj;
        },
        "rotate": function (deg, a1, b1, c1, a2, b2, c2) {
            var matrix4s = _transform(a1, b1, c1, a2, b2, c2);
            matrix4 = _multiply(_multiply(_multiply(matrix4s[1], _rotate(deg)), matrix4s[0]), matrix4);
            return matrix4Obj;
        },
        "scale": function (xTimes, yTimes, zTimes, cx, cy, cz) {
            matrix4 = _multiply(_scale(xTimes, yTimes, zTimes, cx, cy, cz), matrix4);
            return matrix4Obj;
        },
        // 乘法
        // 可以传入一个矩阵(matrix4,flag)
        "multiply": function (newMatrix4, flag) {
            matrix4 = flag ? _multiply(matrix4, newMatrix4) : _multiply(newMatrix4, matrix4);
            return matrix4Obj;
        },
        // 对一个坐标应用变换
        // 齐次坐标(x,y,z,w)
        "use": function (x, y, z, w) {
            // w为0表示点位于无穷远处，忽略
            z = z || 0; w = w || 1;
            var temp = _multiply(matrix4, [x, y, z, w]);
            temp[0] = Math.round(temp[0] * 100000000000000) / 100000000000000;
            temp[1] = Math.round(temp[1] * 100000000000000) / 100000000000000;
            temp[2] = Math.round(temp[2] * 100000000000000) / 100000000000000;
            return temp;
        },
        "value": function () {
            return matrix4;
        }
    };

    return matrix4Obj;
};

// Hermite三次插值
clay.hermite = function () {

    var scope = { "u": 0.5 };

    // 根据x值返回y值
    var hermite = function (x) {

        if (scope.MR) {
            var sx = (x - scope.a) / (scope.b - scope.a),
                sx2 = sx * sx,
                sx3 = sx * sx2;
            var sResult = sx3 * scope.MR[0] + sx2 * scope.MR[1] + sx * scope.MR[2] + scope.MR[3];
            return sResult * (scope.b - scope.a);
        } else {
            throw new Error('You shoud first set the position!');
        }

    };

    // 设置张弛系数【应该在点的位置设置前设置】
    hermite.setU = function (t) {

        if (typeof t === 'number') {
            scope.u = (1 - t) * 0.5;
        } else {
            throw new Error('Expecting a figure!');
        }
        return hermite;

    };

    // 设置点的位置
    hermite.setP = function (x1, y1, x2, y2, s1, s2) {

        if (x1 < x2) {
            // 记录原始尺寸
            scope.a = x1; scope.b = x2;
            var p3 = scope.u * s1,
                p4 = scope.u * s2;
            // 缩放到[0,1]定义域
            y1 /= (x2 - x1);
            y2 /= (x2 - x1);
            // MR是提前计算好的多项式通解矩阵
            // 为了加速计算
            // 如上面说的
            // 统一在[0,1]上计算后再通过缩放和移动恢复
            // 避免了动态求解矩阵的麻烦
            scope.MR = [
                2 * y1 - 2 * y2 + p3 + p4,
                3 * y2 - 3 * y1 - 2 * p3 - p4,
                p3,
                y1
            ];
        } else {
            throw new Error('The point position should be increamented!');
        }
        return hermite;

    };

    return hermite;
};

clay.cardinal = function () {

    var scope = { "t": 0 };

    // 根据x值返回y值
    var i;
    var cardinal = function (x) {

        if (scope.hs) {
            i = -1;
            // 寻找记录x实在位置的区间
            // 这里就是寻找对应的拟合函数
            while (i + 1 < scope.hs.x.length && (x > scope.hs.x[i + 1] || (i == -1 && x >= scope.hs.x[i + 1]))) {
                i += 1;
            }
            if (i == -1 || i >= scope.hs.h.length)
                throw new Error('Coordinate crossing!');
            return scope.hs.h[i](x);
        } else {
            throw new Error('You shoud first set the position!');
        }

    };

    // 设置张弛系数【应该在点的位置设置前设置】
    cardinal.setU = function (t) {

        if (typeof t === 'number') {
            scope.t = t;
        } else {
            throw new Error('Expecting a figure!');
        }
        return cardinal;

    };

    // 设置点的位置
    // 参数格式：[[x,y],[x,y],...]
    // 至少二个点
    cardinal.setP = function (points) {

        scope.hs = {
            "x": [],
            "h": []
        };
        var flag,
            slope = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]),
            temp;
        scope.hs.x[0] = points[0][0];
        for (flag = 1; flag < points.length; flag++) {
            if (points[flag][0] <= points[flag - 1][0]) throw new Error('The point position should be increamented!');
            scope.hs.x[flag] = points[flag][0];
            // 求点斜率
            temp = flag < points.length - 1 ?
                (points[flag + 1][1] - points[flag - 1][1]) / (points[flag + 1][0] - points[flag - 1][0]) :
                (points[flag][1] - points[flag - 1][1]) / (points[flag][0] - points[flag - 1][0]);
            // 求解二个点直接的拟合方程
            // 第一个点的前一个点直接取第一个点
            // 最后一个点的后一个点直接取最后一个点
            scope.hs.h[flag - 1] = clay.hermite().setU(scope.t).setP(points[flag - 1][0], points[flag - 1][1], points[flag][0], points[flag][1], slope, temp);
            slope = temp;
        }
        return cardinal;

    };

    return cardinal;
};

var
    // 围绕X轴旋转
    _rotateX = function (deg, x, y, z) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [x, y * cos - z * sin, y * sin + z * cos];
    },
    // 围绕Y轴旋转
    _rotateY = function (deg, x, y, z) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [z * sin + x * cos, y, z * cos - x * sin];
    },
    // 围绕Z轴旋转
    _rotateZ = function (deg, x, y, z) {
        var cos = Math.cos(deg), sin = Math.sin(deg);
        return [x * cos - y * sin, x * sin + y * cos, z];
    };

/**
 * 把地球看成一个半径为100px的圆球
 * 等角斜方位投影
 */
clay.map = function () {

    var scope = {
        // 投影中心经纬度
        c: [107, 36],
        // 缩放比例
        s: 1
    }, p;

    // 计算出来的位置是偏离中心点的距离
    var map = function (longitude, latitude) {
        /**
        * 通过旋转的方法
        * 先旋转出点的位置
        * 然后根据把地心到旋转中心的这条射线变成OZ这条射线的变换应用到初始化点上
        * 这样求的的点的x,y就是最终结果
        *
        *  计算过程：
        *  1.初始化点的位置是p（x,0,0）,其中x的值是地球半径除以缩放倍速
        *  2.根据点的纬度对p进行旋转，旋转后得到的p的坐标纬度就是目标纬度
        *  3.同样的对此刻的p进行经度的旋转，这样就获取了极点作为中心点的坐标
        *  4.接着想象一下为了让旋转中心移动到极点需要进行旋转的经纬度是多少，记为lo和la
        *  5.然后再对p进行经度度旋转lo获得新的p
        *  6.然后再对p进行纬度旋转la获得新的p
        *  7.旋转结束
        *
        * 特别注意：第5和第6步顺序一定不可以调换，原因来自经纬度定义上
        * 【除了经度为0的位置，不然纬度的旋转会改变原来的经度值，反过来不会】
        *
        */
        p = _rotateY((360 - latitude) / 180 * Math.PI, 100 * scope.s, 0, 0);
        p = _rotateZ(longitude / 180 * Math.PI, p[0], p[1], p[2]);
        p = _rotateZ((90 - scope.c[0]) / 180 * Math.PI, p[0], p[1], p[2]);
        p = _rotateX((90 - scope.c[1]) / 180 * Math.PI, p[0], p[1], p[2]);

        return [
            -p[0],//加-号是因为浏览器坐标和地图不一样
            p[1],
            p[2]
        ];
    };

    // 设置缩放比例
    map.scale = function (scale) {
        if (typeof scale === 'number') scope.s = scale;
        return map;
    };

    // 设置旋转中心
    map.center = function (longitude, latitude) {
        if (typeof longitude === 'number' && typeof latitude === 'number') {
            scope.c = [longitude, latitude];
        }
        return map;
    };

    return map;

};

/**
 * 前一刻位置、速度和加速度，时间间隔
 * 在极其小的时间间隔里，加速度的改变对位置的计算可以忽略不计
 */
var _Velocity_Verlet_P = function (p, v, a, dt) {
    return p + v * dt + a * dt * dt * 0.5;
};

/**
 * 前一刻速度、加速度，此刻加速度，时间间隔
 * 假设加速度的改变在极其小的时间间隔里可以看成线性变化
 */
var _Velocity_Verlet_V = function (v, a, na, dt) {
    return v + (a + na) * dt * 0.5;
};

/**
 * @param {array} electrons 电子集合
 * 每个电子的保存结构为:
 * [x,y]
 *
 * @return {array} cElectrons 库仑力电子集合
 * 每个电子的保存结构为：
 * [x,y,lawx,lawy]，最后二个参数是计算的x和y方向的库仑力
 */
var _coulomb_law = function (electrons) {
    var
        // Barnes-Hut近似精度平方
        theta2 = 0.81,
        // 四叉树
        Q_Tree = {},
        i, j;

    // 求解出坐标最值
    var minX = electrons[0][0], minY = electrons[0][1], maxX = electrons[0][0], maxY = electrons[0][1];
    for (i = 1; i < electrons.length; i++) {
        if (electrons[i][0] < minX) minX = electrons[i][0];
        else if (electrons[i][0] > maxX) maxX = electrons[i][0];
        if (electrons[i][1] < minY) minY = electrons[i][1];
        else if (electrons[i][1] > maxY) maxY = electrons[i][1];
    }

    // 生成四叉树
    (function calc_Q_Tree(nodes, id, ix, ax, iy, ay) {
        var mx = (ix + ax) * 0.5,
            my = (iy + ay) * 0.5;
        Q_Tree[id] = {
            "num": nodes.length,
            "cx": mx,
            "cy": my,
            "w": ax - ix,
            "h": ay - iy,
            // 无法或无需分割，包含的是结点
            "e": [],
            // 分割的子区域，包含的是区域id
            "children": []
        };
        if (nodes.length == 1) {
            Q_Tree[id].e = [nodes[0]];
            return;
        }
        var ltNodes = [], rtNodes = [], lbNodes = [], rbNodes = [];
        for (i = 0; i < nodes.length; i++) {
            // 分割线上的
            if (
                nodes[i][0] == mx || nodes[i][1] == my ||
                nodes[i][0] == ix || nodes[i][0] == ax ||
                nodes[i][1] == iy || nodes[i][1] == ay
            ) Q_Tree[id].e.push(nodes[i]);
            // 更小的格子里
            else if (nodes[i][0] < mx) {
                if (nodes[i][1] < my) ltNodes.push(nodes[i]); else lbNodes.push(nodes[i]);
            } else {
                if (nodes[i][1] < my) rtNodes.push(nodes[i]); else rbNodes.push(nodes[i]);
            }
        }
        // 启动子区域分割
        if (ltNodes.length > 0) {
            Q_Tree[id].children.push(id + "1");
            calc_Q_Tree(ltNodes, id + "1", ix, mx, iy, my);
        }
        if (rtNodes.length > 0) {
            Q_Tree[id].children.push(id + "2");
            calc_Q_Tree(rtNodes, id + "2", mx, ax, iy, my);
        }
        if (lbNodes.length > 0) {
            Q_Tree[id].children.push(id + "3");
            calc_Q_Tree(lbNodes, id + "3", ix, mx, my, ay);
        }
        if (rbNodes.length > 0) {
            Q_Tree[id].children.push(id + "4");
            calc_Q_Tree(rbNodes, id + "4", mx, ax, my, ay);
        }

    })(electrons, 'Q', minX, maxX, minY, maxY);

    // 求解库仑力
    var treeNode, eleNode, law = [], d2, r2,
        /**
         * q1、x1、y1：目标作用电子（或电子团）的电荷、x坐标、y坐标
         * q2、x2、y2：目标计算电子的电荷、x坐标、y坐标
         */
        doLaw = function (q1, x1, y1, x2, y2) {
            if (x1 == x2 && y1 == y2)
                // 重叠的点忽略
                return [0, 0];
            var f = q1 / ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            var d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            return [
                f * (x2 - x1) / d,
                f * (y2 - y1) / d
            ];
        };

    var calc_Coulomb_Law = function (treeName, i) {
        treeNode = Q_Tree[treeName];
        eleNode = electrons[i];
        // Barnes-Hut加速计算
        // 区域面积
        d2 = treeNode.cx * treeNode.cy;
        // '质心'间距离平方
        r2 = (eleNode[0] - treeNode.cx) * (eleNode[0] - treeNode.cx) + (eleNode[1] - treeNode.cy) * (eleNode[1] - treeNode.cy);
        if (d2 / r2 <= theta2) {
            // 默认每个电荷数量是1，且都同性
            return doLaw(treeNode.num, treeNode.cx, treeNode.cy, eleNode[0], eleNode[1]);
        } else {
            var result_law = [0, 0], temp_law;
            for (j = 0; j < treeNode.e.length; j++) {
                temp_law = doLaw(1, treeNode.e[j][0], treeNode.e[j][1], eleNode[0], eleNode[1]);
                result_law[0] += temp_law[0];
                result_law[1] += temp_law[1];
            }
            for (j = 0; j < treeNode.children.length; j++) {
                temp_law = calc_Coulomb_Law(treeNode.children[j], i);
                result_law[0] += temp_law[0];
                result_law[1] += temp_law[1];
            }
            return result_law;
        }
    };
    for (i = 0; i < electrons.length; i++) {
        law = calc_Coulomb_Law('Q', i);
        electrons[i][2] = law[0];
        electrons[i][3] = law[1];
    }

    return electrons;

};

clay.rotate = function (cx, cy, deg, x, y) {
    var cos = Math.cos(deg), sin = Math.sin(deg);
    return [
        ((x - cx) * cos - (y - cy) * sin + cx) * 100000000000000 / 100000000000000,
        ((x - cx) * sin + (y - cy) * cos + cy) * 100000000000000 / 100000000000000
    ];
};

// 绘图方法挂载钩子
clay.svg = {};
clay.canvas = {};

// 基本的canvas对象
// config采用canvas设置属性的api
// 前二个参数不是必输项
// 绘制前再提供下面提供的方法设置也是可以的
// 第三个参数代表图形绘制控制方法
// 最后一个是配置给控制方法的参数
var _canvas = function (_selector, config, painterback, param) {

    var key, temp = painterback(param);
    temp._painter = _getCanvas2D(_selector);

    if (config)
        for (key in config)
            temp._painter[key] = config[key];

    // 设置画笔
    temp.painter = function (selector) {
        temp._painter = _getCanvas2D(selector);
        return temp;
    };

    // 配置画笔
    temp.config = function (_config) {
        for (key in _config)
            temp._painter[key] = _config[key];
        return temp;
    };

    return temp;

};

// 弧
var _arc = function (painter) {

    var scope = {
        c: [0, 0],
        r: [100, 140]
    };

    // r1和r2，内半径和外半径
    // beginA起点弧度，rotateA旋转弧度式
    var arc = function (beginA, rotateA, r1, r2) {

        if (typeof r1 !== 'number') r1 = scope.r[0];
        if (typeof r2 !== 'number') r2 = scope.r[1];

        var temp = [], p;

        // 内部
        p = _rotateZ(beginA, r1, 0, 0);
        temp[0] = p[0];
        temp[1] = p[1];
        p = _rotateZ(rotateA, p[0], p[1], 0);
        temp[2] = p[0];
        temp[3] = p[1];

        // 外部
        p = _rotateZ(beginA, r2, 0, 0);
        temp[4] = p[0];
        temp[5] = p[1];
        p = _rotateZ(rotateA, p[0], p[1], 0);
        temp[6] = p[0];
        temp[7] = p[1];

        return painter(
            scope.c[0], scope.c[1],
            r1, r2,
            beginA, beginA + rotateA,
            temp[0] + scope.c[0], temp[1] + scope.c[1],
            temp[4] + scope.c[0], temp[5] + scope.c[1],
            temp[2] + scope.c[0], temp[3] + scope.c[1],
            temp[6] + scope.c[0], temp[7] + scope.c[1]
        );
    };

    // 设置内外半径
    arc.setRadius = function (r1, r2) {
        scope.r = [r1, r2];
        return arc;
    };

    // 设置弧中心
    arc.setCenter = function (x, y) {
        scope.c = [x, y];
        return arc;
    };

    return arc;

};

// 采用SVG绘制圆弧
clay.svg.arc = function () {
    return _arc(
        function (
            cx, cy,
            rmin, rmax,
            beginA, endA,
            begInnerX, begInnerY,
            begOuterX, begOuterY,
            endInnerX, endInnerY,
            endOuterX, endOuterY
        ) {
            var f = (endA - beginA) > Math.PI ? 1 : 0,
                d = "M" + begInnerX + " " + begInnerY;
            d +=
                // 横半径 竖半径 x轴偏移角度 0小弧/1大弧 0逆时针/1顺时针 终点x 终点y
                "A" + rmin + " " + rmin + " 0 " + f + " 1 " + endInnerX + " " + endInnerY;
            d += "L" + endOuterX + " " + endOuterY;
            d += "A" + rmax + " " + rmax + " 0 " + f + " 0 " + begOuterX + " " + begOuterY;
            d += "L" + begInnerX + " " + begInnerY;
            return d;
        }
    );
};

// 采用Canvas绘制圆弧
clay.canvas.arc = function (selector, config) {

    var key,
        obj =
            // 返回画扇形图的流程控制函数
            // 并且返回的函数挂载了canvas特有的方法和属性
            // 因此称之为基本的canvas对象
            _canvas(selector, config, _arc, function (
                cx, cy,
                rmin, rmax,
                beginA, endA,
                begInnerX, begInnerY,
                begOuterX, begOuterY,
                endInnerX, endInnerY,
                endOuterX, endOuterY
            ) {
                obj._painter.beginPath();
                obj._painter.moveTo(begInnerX, begInnerY);
                obj._painter.arc(
                    // (圆心x，圆心y，半径，开始角度，结束角度，true逆时针/false顺时针)
                    cx, cy, rmin, beginA, endA, false);
                obj._painter.lineTo(endOuterX, endOuterY);
                obj._painter.arc(cx, cy, rmax, endA, beginA, true);
                obj._painter.lineTo(begInnerX, begInnerY);
                obj._painter.fill();
                return obj._painter;

            });

    return obj;

};

clay.treeLayout = function () {

    var scope = {
        "e": {}
    },
        // 维护的树
        alltreedata,
        // 根结点ID
        rootid,

        /**
         * 把内部保存的树结点数据
         * 计算结束后会调用配置的绘图方法
         */
        update = function () {

            var beforeDis = [], size = 0;
            (function positionCalc(pNode, deep) {

                var flag;
                for (flag = 0; flag < pNode.children.length; flag++)
                    // 因为全部的子结点的位置确定了，父结点的y位置就是子结点的中间位置
                    // 因此有子结点的，先计算子结点
                    positionCalc(alltreedata[pNode.children[flag]], deep + 1);

                // left的位置比较简单，deep从0开始编号
                // 比如deep=0，第一层，left=0+0.5=0.5，也就是根结点
                alltreedata[pNode.id].left = deep + 0.5;
                if (flag == 0) {

                    // beforeDis是一个数组，用以记录每一层此刻top下边缘（每一层是从上到下）
                    // 比如一层的第一个，top值最小可以取top=0.5
                    // 为了方便计算，beforeDis[deep] == undefined的时候表示现在准备计算的是这层的第一个结点
                    // 因此设置最低上边缘为-0.5
                    if (beforeDis[deep] == undefined) beforeDis[deep] = -0.5;
                    // 父边缘同意的进行初始化
                    if (beforeDis[deep - 1] == undefined) beforeDis[deep - 1] = -0.5;

                    // 添加的新结点top值第一种求法：本层上边缘+1（比如上边缘是-0.5，那么top最小是top=-0.5+1=0.5）
                    alltreedata[pNode.id].top = beforeDis[deep] + 1;

                    var pTop = beforeDis[deep] + 1 + (alltreedata[pNode.pid].children.length - 1) * 0.5;
                    // 计算的原则是：如果第一种可行，选择第一种，否则必须选择第二种
                    // 判断第一种是否可行的方法就是：如果第一种计算后确定的孩子上边缘不对导致孩子和孩子的前兄弟重合就是可行的
                    if (pTop - 1 < beforeDis[deep - 1])
                        // 必须保证父亲结点和父亲的前一个兄弟保存1的距离，至少
                        // 添加的新结点top值的第二种求法：根据孩子取孩子结点的中心top
                        alltreedata[pNode.id].top = beforeDis[deep - 1] + 1 - (alltreedata[pNode.pid].children.length - 1) * 0.5;

                } else {

                    // 此刻flag!=0
                    // 意味着结点有孩子，那么问题就解决了，直接取孩子的中间即可
                    // 其实，flag==0的分支计算的就是孩子，是没有孩子的叶结点，那是关键
                    alltreedata[pNode.id].top = (alltreedata[pNode.children[0]].top + alltreedata[pNode.children[flag - 1]].top) * 0.5;
                }

                // 计算好一个结点后，需要更新此刻该层的上边缘
                beforeDis[deep] = alltreedata[pNode.id].top;

                // size在每次计算一个结点后更新，是为了最终绘图的时候知道树有多宽（此处应该叫高）
                if (alltreedata[pNode.id].top + 0.5 > size) size = alltreedata[pNode.id].top + 0.5;

            })(alltreedata[rootid], 0);

            // 画图
            // 传递的参数分别表示：记录了位置信息的树结点集合、根结点ID和树的宽
            scope.e.drawer(alltreedata, rootid, size);

        };

    /**
     * 根据配置的层次关系（配置的id,child,root）把原始数据变成内部结构，方便后期位置计算
     * @param {any} initTree
     *
     * tempTree[id]={
     *  "data":原始数据,
     *  "pid":父亲ID,
     *  "id":唯一标识ID,
     *  "children":[cid1、cid2、...],
     *  "show":boolean，表示该结点在计算位置的时候是否可见
     * }
     */
    var toInnerTree = function (initTree) {

        var tempTree = {};
        // 根结点
        var temp = scope.e.root(initTree), id, rid;
        id = rid = scope.e.id(temp);
        tempTree[id] = {
            "data": temp,
            "pid": null,
            "id": id,
            "children": [],
            "show": true
        };
        // 根据传递的原始数据，生成内部统一结构
        (function createTree(pdata, pid) {
            var children = scope.e.child(pdata, initTree), flag;
            for (flag = 0; children && flag < children.length; flag++) {
                id = scope.e.id(children[flag]);
                tempTree[pid].children.push(id);
                tempTree[id] = {
                    "data": children[flag],
                    "pid": pid,
                    "id": id,
                    "children": [],
                    "show": true
                };
                createTree(children[flag], id);
            }
        })(temp, id);

        return [rid, tempTree];
    };

    // 可以传递任意格式的树原始数据
    // 只要配置对应的解析方法即可
    var tree = function (initTree) {

        var treeData = toInnerTree(initTree);
        alltreedata = treeData[1];
        rootid = treeData[0];
        update();
        return tree;

    };

    // 挂载处理事件
    // 获取根结点的方法:root(initTree)
    // 获取子结点的方法:child(parentTree,initTree)
    // 获取结点ID方法:id(treedata)
    // 结点更新处理方法 drawer(alltreedata, rootid, size)
    tree.bind = function (backname, callback, moreback) {
        scope.e[backname] = callback;
        return tree;
    };

    // 第三个参数为true的时候不会自动更新
    tree.add = function (pid, newnodes, notUpdate) {

        var treeData = toInnerTree(newnodes), id;
        treeData[1][treeData[0]].pid = pid;
        alltreedata[pid].children.push(treeData[0]);
        for (id in treeData[1])
            alltreedata[id] = treeData[1][id];
        if (!notUpdate) update();
        return tree;

    };
    tree.delete = function (id, notUpdate) {

        var index = alltreedata[alltreedata[id].pid].children.indexOf(id);
        if (index > -1)
            alltreedata[alltreedata[id].pid].children.splice(index, 1);

        // 删除多余结点
        (function deleteNode(pid) {
            var flag;
            for (flag = 0; flag < alltreedata[pid].children.length; flag++) {
                deleteNode(alltreedata[alltreedata[pid].children[flag]].id);
            }
            delete alltreedata[pid];
        })(id);

        if (!notUpdate) update();
        return tree;

    };

    // 控制结点显示还是隐藏
    // flag可选，"show"：显示，"hidden"：隐藏，不传递就是切换
    tree.toggle = function (id, notUpdate, flag) {

        var index = alltreedata[alltreedata[id].pid].children.indexOf(id);
        if (index > -1 && flag != 'show') {
            alltreedata[alltreedata[id].pid].children.splice(index, 1);
            alltreedata[id]._index = index;
        }
        else if (flag != 'hidden')
            alltreedata[alltreedata[id].pid].children.splice(alltreedata[id]._index, 0, id);
        if (!notUpdate) update();
        return tree;

    };

    tree.update = function () {

        update();
        return tree;
    };

    return tree;

};

clay.forceLayout = function () {

    var scope = {
        // 处理方法
        "e": {},
        // 配置参数
        "c": {}
    },
        // 分别用于保存结点和连线，内部存储
        allNode, allLink,
        i, j, k, flag, source, target, dx, dy, d, fx, fy, ax, ay, dsq,
        // 标记轮播计算是否在运行中
        running = false,
        num = 0,

        // 阻尼衰减
        alpha = 1,
        alphaMin = 0.001,
        // alpha衰减率
        alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
        alphaTarget = 0,

        // 更新弹簧引力
        updateSpring = function () {
            for (i in allLink) {
                for (j in allLink[i]) {
                    source = allNode[i];
                    target = allNode[j];
                    dx = source.x - target.x;
                    dy = source.y - target.y;
                    // 如果绳子长度为0，忽略作用力
                    if (dx != 0 && dy != 0) {
                        d = Math.sqrt(dx * dx + dy * dy);
                        // scope.c.spring表示弹簧系数
                        // 同一组之间和别的组之间为了显示的分开，绳子长度进行了统一的缩放
                        k = scope.c.spring * (d - (allLink[i][j].isG ? allLink[i][j].l * scope.c.scale : allLink[i][j].l));
                        fx = k * dx / d;
                        fy = k * dy / d;
                        // 软木棒作用的双方都会受到力
                        allNode[i].fx -= fx;
                        allNode[i].fy -= fy;
                        allNode[j].fx += fx;
                        allNode[j].fy += fy;
                    }
                }
            }
        },
        // 更新库伦斥力
        updateReplusion = function () {
            k = [];
            for (i in allNode)
                k.push([allNode[i].x, allNode[i].y]);
            j = _coulomb_law(k);
            k = 0;
            for (i in allNode) {
                allNode[i].fx += j[k][2] / scope.c.coulomb;
                allNode[i].fy += j[k][3] / scope.c.coulomb;
                k += 1;
            }
        },
        // 中心引力，用以聚笼结点
        updateCenter = function () {
            for (i in allNode) {
                k = allNode[i].ng > 0 ? allNode[i].ng : -1;
                allNode[i].fx += (500 - allNode[i].x) * scope.c.center * k;
                allNode[i].fy += (500 - allNode[i].y) * scope.c.center * k;
            }
        },
        //持续计算
        tick = function () {
            // alpha不断衰减
            alpha += (alphaTarget - alpha) * alphaDecay;

            /**
             * 计算
             */
            // 初始化受力
            for (i in allNode) {
                allNode[i].fx = 0;
                allNode[i].fy = 0;
            }
            // 更新力，得出加速度
            updateSpring();
            updateReplusion();
            updateCenter();
            // 更新位置
            for (i in allNode) {
                // 1.计算新的位置
                dx = _Velocity_Verlet_P(allNode[i].x, allNode[i].vx, allNode[i].ax, 1) - allNode[i].x;
                dy = _Velocity_Verlet_P(allNode[i].y, allNode[i].vy, allNode[i].ay, 1) - allNode[i].y;
                dsq = dx * dx + dy * dy;
                // 1.1超过一次改变最大程度
                if (dsq > 100) {
                    // 如果二次位置（之前和计算后的）绘制的面积大于100，认为这是一次剧烈的改变
                    // 剧烈的改变是不友好的用户体验
                    k = Math.sqrt(100 / dsq);
                    dx *= k;
                    dy *= k;
                }
                // 更新结点位置
                allNode[i].x += dx;
                allNode[i].y += dy;
                // 1.2 如果结点越界
                if (allNode[i].x < 0) allNode[i].x = 0;
                if (allNode[i].y < 0) allNode[i].y = 0;
                if (allNode[i].x > 1000) allNode[i].x = 1000;
                if (allNode[i].y > 1000) allNode[i].y = 1000;
                // 2.更新加速度
                ax = allNode[i].ax * alpha;
                ay = allNode[i].ay * alpha;
                allNode[i].ax = allNode[i].fx / 1000 * alpha;
                allNode[i].ay = allNode[i].fy / 1000 * alpha;
                // 3.更新速度
                // 采用速度verlet算法计算
                // 乘上alpha是为了让结点慢慢停下来
                // 因为理论上来说，结点很大概率会永远停不下来
                // 但这是不需要的，因此添加了阻尼衰减
                allNode[i].vx = _Velocity_Verlet_V(allNode[i].vx, ax, allNode[i].ax, 1) * alpha;
                allNode[i].vy = _Velocity_Verlet_V(allNode[i].vy, ay, allNode[i].ay, 1) * alpha;
            }

            // 调用钩子
            if (num < 30) {
                num += 1;
            } else {
                // 重新渲染前调用
                if (scope.e.live && typeof scope.e.live[0] === 'function') scope.e.live[0]();

                // 绘制结点
                for (i in allNode) scope.e.update[0](allNode[i]);
                for (i in allLink)
                    for (j in allLink[i])
                        // 绘制连线
                        scope.e.update[1](allNode[i], allNode[j], allLink[i][j]);

                // 渲染结束后调用
                if (scope.e.live && typeof scope.e.live[1] === 'function') scope.e.live[1]();
            }

            // 判断是否需要停止
            if (alpha >= alphaMin)
                // 计算一定次数以后再开始绘制页面
                // 这是为了加速渲染
                // 我们不希望初始化计算时间过长
                if (num < 30)
                    tick();
                else
                    window.setTimeout(function () {
                        // 每次重新渲染页面不需要太快
                        // 一定间隔后渲染依旧不会影响体验
                        tick();
                    }, 40);
            else
                // 标记迭代结束
                running = false;
        },
        // 启动更新
        update = function () {
            if (!running) {
                // running表示此刻是否在迭代计算
                running = true;
                tick();
                alpha = 1;
            } else {
                // 如果在迭代计算
                // 启动更新等价与保证衰减率不低于0.3
                alpha = alpha < 0.3 ? 0.3 : alpha;
            }

        };

    /**
     * 调用启动布局计算的方法
     * @param {Array} initnodes 全部结点
     * @param {Array} initlinks 全部连线
     *
     * -----------------------------------------
     * 需要分析这些数据的方法需要在绘图前配置好
     * 因此原则上来说，原始数据只要是二个数组
     * 其它没有任何要求
     *
     */
    var force = function (initnodes, initlinks) {
        allNode = {}; allLink = {};
        // 分析结点
        // 初始化结点被分配在一个10*10的区域
        // 这里的num表示这个区域一行至少需要存放多少个结点
        // sw表示一个结点占据的宽是多少
        var num = Math.ceil(10 / Math.sqrt(100 / initnodes.length)),
            sw = 10 / num;
        j = { "p": [], "g": {} };
        for (i = 0; i < initnodes.length; i++) {
            // k返回一个数组
            // [结点id，结点所在组的名称]
            k = scope.e.analyse[0](initnodes[i]);
            // 内部存储一个点的结构
            allNode[k[0]] = {
                "orgData": initnodes[i],//结点原始数据
                "vx": 0, "vy": 0,//结点坐标
                "ax": 0, "ay": 0,//结点加速度
                //记录结点和哪些结点连接在一起
                // t保存的是结点作为source
                // s保存的是结点作为target
                "t": [], "s": [],
                "id": k[0],//该结点的唯一标识
                "g": k[1],//结点所在的组
                "ng": 0,//和结点相连却不是一个组的连线个数
                "ig": 0//和结点相连是一个组的连线个数
            };

            // j中的p记录了初始化结点可以存放的位置有哪些
            // j中的g记录了根据组分别保存的结点
            // 这二个记录的目的是在稍晚点的时候初始化点的坐标的时候
            // 把同一组的结点尽力初始化在一起
            j.p.push([i % num * sw + sw * 0.5, Math.ceil((i + 1) / num) * sw - sw * 0.5]);
            j.g[k[1]] = j.g[k[1]] || [];
            j.g[k[1]].push(k[0]);
        }
        flag = 0;
        for (i in j.g) {
            for (k in j.g[i]) {
                // 如同前面描述的，这里把可以存放的点，根据组来一个个分配
                allNode[j.g[i][k]].x = j.p[flag][0] + 495;
                allNode[j.g[i][k]].y = j.p[flag][1] + 495;
                flag += 1;
            }
        }

        // 分析连线
        for (i = 0; i < initlinks.length; i++) {
            // k返回一个数组
            // [sorce结点，target结点，连线长度]
            k = scope.e.analyse[1](initlinks[i]);
            allLink[k[0]] = allLink[k[0]] || {};
            // 内部存储一条线的结构
            allLink[k[0]][k[1]] = {
                "l": k[2],//线条长度
                "orgData": initlinks[i],//线条元素数据
                // true表示连线的二个结点是一个组的，否则为false
                "isG": (allNode[k[0]].g == allNode[k[1]].g ? true : false)
            };
            // 告诉结点，他连接的点
            allNode[k[0]].t.push(k[1]);
            allNode[k[1]].s.push(k[0]);
            if (allNode[k[0]].g != allNode[k[1]].g) {
                allNode[k[0]].ng += 1;
                allNode[k[1]].ng += 1;
            } else {
                allNode[k[0]].ig += 1;
                allNode[k[1]].ig += 1;
            }
        }
        update();

    };

    // 挂载处理事件
    // 结点更新处理方法 update(nodeback(node), linkback(link, sourceNode, targetNode))
    // 分析结点和连线的方法 analyse(nodeback(initnode), linkback(inilink))
    // 生命钩子 live(beforback(),afterback())
    force.bind = function (type, nodeback, linkback) {

        if (typeof nodeback !== 'function') nodeback = function () { };
        if (typeof linkback !== 'function') linkback = function () { };
        scope.e[type] = [nodeback, linkback];
        return force;
    };

    // 更新一个特定结点位置
    // 在页面交互的时候，请使用这个方法更新鼠标拖动的结点的实时位置
    force.update = function (id, x, y) {
        allNode[id].x = x;
        allNode[id].y = y;
        update();
        return force;
    };

    /**
     * 配置方法
     * @param {json} config
     *
     * 下面是全部可配置项的例子
     * config={
     *
     *   center:26,//中心力强度
     *   coulomb:400,//库仑力缩小倍数
     *   spring:200,//软棒系数
     *   scale:0.3//组内绳子缩短程度
     *
     * }
     */
    force.config = function (config) {
        for (k in config)
            scope.c[k] = config[k];
        return force;
    };

    return force;
};

// 把着色器字符串加载成着色器对象
var _loadShader = function (gl, type, source) {
    // 创建着色器对象
    var shader = gl.createShader(type);
    if (shader == null) throw new Error('Unable to create shader!');
    // 绑定资源
    gl.shaderSource(shader, source);
    // 编译着色器
    gl.compileShader(shader);
    // 检测着色器编译是否成功
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('Failed to compile shader:' + gl.getShaderInfoLog(shader));
    return shader;
};

// 初始化着色器
var _useShader = function (gl, vshaderSource, fshaderSource) {
    // 分别加载顶点着色器对象和片段着色器对象
    var vertexShader = _loadShader(gl, gl.VERTEX_SHADER, vshaderSource),
        fragmentShader = _loadShader(gl, gl.FRAGMENT_SHADER, fshaderSource);
    // 创建一个着色器程序
    var glProgram = gl.createProgram();
    // 把前面创建的二个着色器对象添加到着色器程序中
    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    // 把着色器程序链接成一个完整的程序
    gl.linkProgram(glProgram);
    // 检测着色器程序链接是否成功
    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS))
        throw new Error('Failed to link program: ' + gl.getProgramInfoLog(glProgram));
    // 使用这个完整的程序
    gl.useProgram(glProgram);
    return glProgram;
};

// 获取一个新的缓冲区
// isElement默认false，创建第一种缓冲区，为true创建第二种
var _newBuffer = function (gl, isElement) {
    var buffer = gl.createBuffer(),
        TYPE = isElement ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    // 把缓冲区对象绑定到目标
    gl.bindBuffer(TYPE, buffer);
    return buffer;
};

// 数据写入缓冲区
// data是一个类型化数组，表示写入的数据
// usage表示程序如何使用存储在缓冲区的数据
var _writeBuffer = function (gl, data, usage, isElement) {
    var TYPE = isElement ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    gl.bufferData(TYPE, data, usage);
};

// 使用缓冲区数据
// location指定待分配的attribute变量的存储位置
// size每个分量个数
// type数据类型，应该是以下的某个：
//      gl.UNSIGNED_BYTE    Uint8Array
//      gl.SHORT            Int16Array
//      gl.UNSIGNED_SHORT   Uint16Array
//      gl.INT              Int32Array
//      gl.UNSIGNED_INT     Uint32Array
//      gl.FLOAT            Float32Array
// stride相邻二个数据项的字节数
// offset数据的起点字节位置
// normalized是否把非浮点型的数据归一化到[0,1]或[-1,1]区间
var _useBuffer = function (gl, location, size, type, stride, offset, normalized) {
    // 把缓冲区对象分配给目标变量
    gl.vertexAttribPointer(location, size, type, normalized || false, stride || 0, offset || 0);
    // 连接目标对象和缓冲区对象
    gl.enableVertexAttribArray(location);
};

// 删除缓冲区
var _deleteBuffer = function (gl, buffer) {
    gl.deleteBuffer(buffer);
};

// 初始化一个纹理对象
// type有两个选择gl.TEXTURE_2D代表二维纹理，gl.TEXTURE_CUBE_MAP 立方体纹理
var _initTexture = function (gl, unit, type) {
    // 创建纹理对象
    var texture = gl.createTexture();
    // 开启纹理单元，unit表示开启的编号
    gl.activeTexture(gl['TEXTURE' + unit]);
    // 绑定纹理对象到目标上
    gl.bindTexture(type, texture);
    return texture;
};

// 配置纹理
var _configTexture = function (gl, type, config) {
    var key;
    for (key in config) {
        /**
         *
         * 可配置项有四个：
         *  1. gl.TEXTURE_MAX_FILTER：放大方法
         *  2. gl.TEXTURE_MIN_FILTER：缩小方法
         *  3. gl.TEXTURE_WRAP_S：水平填充方法
         *  4. gl.TEXTURE_WRAP_T：垂直填充方法
         *
         */
        gl.texParameteri(type, gl[key], gl[config[key]]);
    }
};

// 链接资源图片
// level默认传入0即可，和金字塔纹理有关
// format表示图像的内部格式：
//      gl.RGB(红绿蓝)
//      gl.RGBA(红绿蓝透明度)
//      gl.ALPHA(0.0,0.0,0.0,透明度)
//      gl.LUMINANCE(L、L、L、1L:流明)
//      gl.LUMINANCE_ALPHA(L、L、L,透明度)
// textureType表示纹理数据的格式：
//      gl.UNSIGNED_BYTE: 表示无符号整形，每一个颜色分量占据1字节
//      gl.UNSIGNED_SHORT_5_6_5: 表示RGB，每一个分量分别占据占据5, 6, 5比特
//      gl.UNSIGNED_SHORT_4_4_4_4: 表示RGBA，每一个分量分别占据占据4, 4, 4, 4比特
//      gl.UNSIGNED_SHORT_5_5_5_1: 表示RGBA，每一个分量分别占据占据5比特，A分量占据1比特
var _linkImage = function (gl, type, level, format, textureType, image) {
    gl.texImage2D(type, level, format, format, textureType, image);
};

// 删除纹理
var _deleteTexture = function (gl, texture) {
    gl.deleteTexture(texture);
};

// 获取webgl上下文
function _getCanvasWebgl(selector, opts) {
    if (selector && selector.constructor === WebGLRenderingContext) return selector;
    var canvas = clay(selector),
        names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"],
        context = null, i;
    if (canvas.length > 0) {
        for (i = 0; i < names.length; i++) {
            try {
                context = canvas[0].getContext(names[i], opts);
            } catch (e) { }
            if (context) break;
        }
    }
    return context;
}

// 启动webgl绘图
clay.prototype.webgl = function (opts) {
    if (this.length > 0 && (this[0].nodeName != 'CANVAS' && this[0].nodeName != 'canvas'))
        throw new Error('Webgl is not a function!');
    var gl = _getCanvasWebgl(this, opts),
        glObj = {
            "painter": function () {
                return gl;
            },

            // 启用着色器
            "shader": function (vshaderSource, fshaderSource) {
                gl.program = _useShader(gl, vshaderSource, fshaderSource);
                return glObj;
            },

            // 缓冲区
            "buffer": function (isElement) {
                // 创建缓冲区
                var buffer = _newBuffer(gl, isElement),
                    bufferData,
                    bufferObj = {
                        // 写入数据
                        "write": function (data, usage) {
                            usage = usage || gl.STATIC_DRAW;
                            _writeBuffer(gl, data, usage, isElement);
                            bufferData = data;
                            return bufferObj;
                        },
                        // 分配使用
                        "use": function (location, size, stride, offset, type, normalized) {
                            var fsize = bufferData.BYTES_PER_ELEMENT;
                            if (typeof location == 'string') location = gl.getAttribLocation(gl.program, location);
                            type = type || gl.FLOAT;
                            stride = stride || 0;
                            offset = offset || 0;
                            type = type || gl.FLOAT;
                            _useBuffer(gl, location, size, type, stride * fsize, offset * fsize, normalized);
                            return bufferObj;
                        },
                        // 关闭退出
                        "close": function () {
                            _deleteBuffer(gl, buffer);
                            return glObj;
                        }
                    };
                return bufferObj;
            },

            // 纹理
            "texture": function (unit, type) {
                type = type || gl.TEXTURE_2D;
                // 创建纹理
                var texture = _initTexture(gl, unit, type);
                var textureObj = {
                    // 配置纹理对象
                    "config": function (config) {
                        _configTexture(gl, type, config);
                        return textureObj;
                    },
                    // 链接图片资源
                    "use": function (level, format, textureType, image) {
                        _linkImage(gl, type, level, format, textureType, image);
                        return textureObj;
                    },
                    // 关闭纹理
                    "close": function () {
                        _deleteTexture(gl, texture);
                        return glObj;
                    }
                };
                return textureObj;
            }

        };

    return glObj;
};


    clay.author = '心叶';
    clay.email = 'yelloxing@gmail.com';
    clay.version = '1.4.0';

    global.clay = global.$$ = clay;

    return clay;

});
