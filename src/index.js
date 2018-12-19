import './style.css';
import './style/index.scss';
import utils from './js/utils';
import jquery from 'jquery';

var slideData = {}; // json 数据
var pageIndex = 1; // 第几页
var preloadingNum = 10; // 预加载资源的数量
var finishPreloadingNum = 0; // 预加载资源完成的数量
var globalBox = document.getElementById('globalBox'); // 顶层box
var imgBox = document.getElementById('imgBox'); // 用于放置img标签
var videoBox = document.getElementById('videoBox'); // 用于放置video标签
var preloadPage = document.getElementById('preloading'); // 预加载页面
var progressBar = document.getElementById('progress'); // 进度条
var classRoomIsloaded = false; // classroom相关js是否加载完的标记
var timer = null;
var courseWidth = 1024; // 课件宽度
var courseHeight = 768; // 课件高度

const btn_import = document.getElementById('btn_import');
btn_import.addEventListener('click', () => {
    import(/* webpackChunkName: "lodash" */'./js/import').then(res => {
        console.log('./js/import..');
        console.log(res);
        res.getImport();
    })
})

console.log(jquery);
utils.getName();
// init();	
function init(){
    //设置鼠标右键
    document.oncontextmenu=function(){
        return false;
    }
    //跨域设置
    if(document.domain !='uuabc.com' ){
        document.domain = 'uuabc.com';
    }

    // document.domain = 'localhost';

}

// json资源加载
var xhr = new XMLHttpRequest();
xhr.open('GET', '/static/data.json?v=' + Math.random(), true);
xhr.addEventListener("load", function () {
    slideData = JSON.parse(xhr.response);
    // 筛选数据
    exchangeData();
    // 动态创建img、video
    createTag();
    // 预加载资源
    if(!preloadingNum) {
        preloadingNum = 1;
    }
    for(var i = 0, len = preloadingNum; i < len; i++) {
        preloadResourceByIndex(i, preloadResourceFinish);
    }

});
xhr.send(null);

function isImg(sourceType) {
    return sourceType.indexOf('image') !== -1;
}

function isVideo(sourceType) {
    return sourceType.indexOf('video') !== -1;
}

var exchangeDataArr = [];
function exchangeData() {
    var sourceType;
    var type;
    for(var i = 0, len = slideData.slideMediaTypes.length; i < len; i++) {
        sourceType = slideData.slideMediaTypes[i];
        if(isImg(sourceType)) {
            type = 'img';
        }
        if(isVideo(sourceType)) {
            type = 'video';
        }
        exchangeDataArr.push({
            type: type,
            state: 0,
            sourceIndex: i,
            sourceSrc: slideData.slideUrls[i],
        })
    };
}

var sourceTotalDomArr = [];
function createTag() {
    var item;
    var parentDom;
    var childDom;
    for(var i = 0, len = exchangeDataArr.length; i < len; i++) {
        item = exchangeDataArr[i];
        parentDom = item.type == 'img' ? imgBox : videoBox;
        childDom = document.createElement(item.type);
        childDom.src = '';
        childDom.dataset.type = item.type;
        childDom.dataset.state = item.state;
        childDom.dataset.sourceIndex = item.sourceIndex;
        childDom.dataset.sourceSrc = item.sourceSrc;
        parentDom.appendChild(childDom);
        sourceTotalDomArr.push(childDom);
    }
}

function initSourceZIndex() {
    var firstSourceType = slideData.slideMediaTypes[0];
    if(isVideo(firstSourceType)) {
        imgBox.style.zIndex = 10;
        imgBox.style.display = 'none';
        videoBox.style.zIndex = 11;
        videoBox.style.display = 'block';
        videoBox.firstElementChild.play();
    }
}

function getDomByResourceIndex(resourceIndex) {
    var dom;
    for(var i = 0, len = sourceTotalDomArr.length; i < len; i++) {
        dom = sourceTotalDomArr[i];
        if(dom.dataset.sourceIndex == resourceIndex) return dom;
    }
}

function progressAnimation(progress) {
    var precent = progress * 100;
    progressBar.style.width = precent + '%';
}

// 动态调整globalBox的尺寸，使其宽高比例保持不变1024*768
function resetSize() {
    var courseScale = courseWidth / courseHeight;
    var body = document.body;
    var bodyWidth = body.offsetWidth;
    var bodyHeight = body.offsetHeight;
    var bodyScale = bodyWidth / bodyHeight;
    if(bodyScale >= courseScale) {
        globalBox.style.height = bodyHeight + 'px';
        globalBox.style.width = Math.ceil(bodyHeight * courseScale) + 'px';
    }else {
        globalBox.style.width = bodyWidth + 'px';
        globalBox.style.height = Math.ceil(bodyWidth / courseScale) + 'px';
    }
}

window.addEventListener('resize', resetSize, false);
resetSize();

// 根据资源索引预加载资源
function preloadResourceByIndex(resourceIndex, callback) {
    function next() {
        finishPreloadingNum ++;
        if(callback) {
            progressNumIn(finishPreloadingNum / preloadingNum);
            progressAnimation(finishPreloadingNum / preloadingNum);
            // 判断首页预加载是否完成
            if(finishPreloadingNum >= preloadingNum) {
                // 用于确保能够调用得到classroom的callbackResLoaded方法
                callback && callback();
                timer = setInterval(function(){
                    if(classRoomIsloaded) {
                        clearInterval(timer);
                        callback && callback();
                        return;
                    }
                    callbackInResLoaded(slideData.slideCount);
                }, 1000);
            }
        }
    }
    var dom = getDomByResourceIndex(resourceIndex);
    if(dom.dataset.type == 'img') {
        loadImg();
        function loadImg() {
            dom.src=dom.dataset.sourceSrc;
            dom.onload = function(e) {
                dom.dataset.state = 1;
                next();
            }
            dom.onerror = function() {
                loadImg();
            }
        }
        
    }else if(dom.dataset.type == 'video') {
        loadVideo();
        function loadVideo() {
            if(dom.dataset.state != '0') return;
            var req = new XMLHttpRequest();
            req.open('GET', dom.dataset.sourceSrc, true);
            req.responseType = 'blob';

            req.onload = function() {
                if (this.status === 200) {
                    var sourceBlob = this.response;
                    var vid = URL.createObjectURL(sourceBlob); // IE10+
                    if(dom.paused) {
                        dom.dataset.state = 1;
                        dom.src = vid;
                    }
                    next();
                }
            }

            req.onprogress = function(evt) {
    
            }
            
            req.onerror = function() {
                loadVideo();
            }

            req.send(null);
        }
    }
}

// 首页预加载完成后调用
function preloadResourceFinish() {
    console.log('preloadResourceFinish...');
    // 调整初始化时资源的层级
    initSourceZIndex();
    callbackInPageLoaded(false, false); // 参数默认值
    // callbackInSendMsg(JSON.stringify({ type: 1 })); // 该方法不需要调用
    // 移除loading页面
    preloadPage.parentElement.removeChild(preloadPage);
    // 切换到第一页 -- 由classroom调用
    pageIndex = 1;
    sureResourceIsFinish();
}


/***-----   以下是课件调用外部程序的方法   ------**/
var uuabc;    

// 加载进度，整个课件加载进度
var progressNum;
function progressNumIn(num){
    if(uuabc && uuabc.progressNum)
    {
        uuabc.progressNum(num);
    }
    
    if(null != progressNum)
    {
        progressNum(num);
    }
}

// 课件资源加载完成，total课件总页码
var callbackResLoaded;
function callbackInResLoaded(total){
    if(uuabc && uuabc.callbackResLoaded)
    {
        uuabc.callbackResLoaded(total);
        classRoomIsloaded = true;
    }
    if(null != callbackResLoaded)
    {
        callbackResLoaded(total);
        classRoomIsloaded = true;
    }
}

// 页面更改成功，single 是否单人互动，action学生是否互动
var callbackPageLoaded;
function callbackInPageLoaded(single, action){
    if(uuabc && uuabc.callbackPageLoaded)
    {
        uuabc.callbackPageLoaded(single, action);
    }
    if(null != callbackPageLoaded)
    {
        callbackPageLoaded(single, action);
    }
}

// 页面指令响应，msg指令消息，必须json格式，必须含type字段，规范如下：
// type: 1, 插入此记录，删除之前所有记录
// type: 2, 插入此记录，删除之前此类型的记录
// type: 3, 插入此记录
// type: 4, 直接丢弃，不做记录
var callbackSendMsg;
function callbackInSendMsg(msg) {
    if(uuabc && uuabc.callbackSendMsg)
    {
        uuabc.callbackSendMsg(msg);
    }
    
    if(null != callbackSendMsg)
    {
        callbackSendMsg(msg);
    }     
}

// 鼠标点击，x, y 坐标点
var mouseClick;
function mouseClickIn(tStageX,tStageY){
    if(uuabc && uuabc.mouseClick)
    {
        uuabc.mouseClick(tStageX,tStageY);
    }
    if(null != mouseClick)
    {
        mouseClick(tStageX,tStageY);
    }
}

// 鼠标按下，x, y 坐标点
var mouseDown;
function mouseDownIn(tStageX,tStageY){
    if(uuabc && uuabc.mouseDown)
    {
        uuabc.mouseDown(tStageX,tStageY);
    }
    if(null != mouseDown)
    {
        mouseDown(tStageX,tStageY);
    }
}

// 鼠标松开，x, y 坐标点
var mouseUp;
function mouseUpIn(tStageX,tStageY){
    if(uuabc && uuabc.mouseUp)
    {
        uuabc.mouseUp(tStageX,tStageY);
    }
    if(null != mouseUp)
    {
        mouseUp(tStageX,tStageY);
    }
}

// 鼠标移动，x, y 坐标点
var mouseMove;
function mouseMoveIn(tStageX,tStageY){
    if(uuabc && uuabc.mouseMove)
    {
        uuabc.mouseMove(tStageX,tStageY);
    }
    if(null != mouseMove)
    {
        mouseMove(tStageX,tStageY);
    }
}

// 本页面mainBox上的监听鼠标事件
function mouseEvent(type, evt) {
    var stageX = 0, stageY = 0;
    
    function addDistance(dom) {
        var offsetLeft = dom.offsetLeft;
        var offsetTop = dom.offsetTop;
        stageX += offsetLeft ;
        stageY += offsetTop;
        if(dom.parentElement != mainBox) {
            addDistance(dom.parentElement);
        }
    }

    stageX = evt.offsetX;
    stageY = evt.offsetY;
    if(evt.target !== mainBox) addDistance(evt.target);
    switch(type) {
        case 'click':
            mouseClickIn(stageX, stageY);
            break;
        case 'mousedown':
            mouseDownIn(stageX, stageY);
            break;
        case 'mouseup':
            mouseUpIn(stageX, stageY);
            break;
        case 'mousemove':
            mouseMoveIn(stageX, stageY);
            break;
    }
}

var mainBox = document.getElementById('box');
mainBox.addEventListener('click', function(evt) {
    mouseEvent('click', evt);
});
mainBox.addEventListener('mousedown', function(evt) {
    mouseEvent('mousedown', evt);
});
mainBox.addEventListener('mouseup', function(evt) {
    mouseEvent('mouseup', evt);
});
mainBox.addEventListener('mousemove', function(evt) {
    mouseEvent('mousemove', evt);
});

// 切换页面
function switchPage(pageIndex) {
    var sourceIndex = pageIndex - 1;
    var type = exchangeDataArr[sourceIndex].type;
    var dom = getDomByResourceIndex(sourceIndex);
    var parent = dom.parentElement;
    var anotherParent = type == 'img' ? videoBox : imgBox;
    if((sourceIndex + preloadingNum) < slideData.slideCount) {
        preloadResourceByIndex(sourceIndex + preloadingNum);
    }
    for(let i = 0, len = videoBox.children.length; i < len; i++) {
        videoBox.children[i].pause();
        videoBox.children[i].currentTime = 0;
    }
    for(let i = 0, len = parent.children.length; i < len; i++) {
        parent.children[i].style.zIndex = 1;
    }
    dom.style.zIndex = 2;
    // 防止预加载未完成的情况
    if(!dom.src) {
        dom.src = dom.dataset.sourceSrc;
    }
    parent.style.zIndex = 11;
    parent.style.display = 'block';
    anotherParent.style.zIndex = 10;
    anotherParent.style.display = 'none';
    if(type == 'video') {
        dom.play();
    }
}

// 切换页面之前的资源是否加载完成的检验
function sureResourceIsFinish() {
    var sourceIndex = pageIndex - 1;
    var type = exchangeDataArr[sourceIndex].type;
    var dom = getDomByResourceIndex(sourceIndex);
    if(dom.dataset.state == 1) {
        switchPage(pageIndex);
        callbackInPageLoaded(false, false);
        return;
    }
    if(type == 'img') {
        loadImg();
        function loadImg() {
            dom.src = dom.dataset.sourceSrc;
            dom.onload = function() {
                dom.dataset.state = 2;
                switchPage(pageIndex);
                callbackInPageLoaded(false, false);
                return;
            }
            dom.onerror = function() {
                loadImg();
            }
        }
        
    }else if(type == 'video') {
        loadVideo();
        function loadVideo() {
            var req = new XMLHttpRequest();
            req.open('GET', dom.dataset.sourceSrc, true);
            req.responseType = 'blob';
            req.onload = function() {
                if (this.status === 200) {
                    var sourceBlob = this.response;
                    var vid = URL.createObjectURL(sourceBlob); // IE10+
                    dom.dataset.state = 2;
                    dom.src = vid;
                    switchPage(pageIndex);
                    callbackInPageLoaded(false, false);
                    return;
                }
            };
            req.onerror = function() {
                loadVideo();
            }
            req.send(null);
        }   
    }
   
}

/***-----   以下是外部程序调用课件内的方法   ------**/
function PageMgr() {};
// 课件内鼠标样式设置，icon：鼠标样式，offset 偏移量，参见CSS鼠标样式定义
PageMgr.cursorIcon = function(icon, offsetX, offsetY) {
    var body = document.body;
    if(icon == 'auto') {
        body.style.cursor = 'auto';
        return;
    };
    var str = 'url("' + icon + '") ' + offsetX + ' ' + offsetY +  ', auto';
    body.style.cursor = str;
}

// 响应交互
PageMgr.receiveMsg = function(msg) {
    
}

// 上一页
PageMgr.prevPage = function() {
    pageIndex --;
    if(pageIndex <= 0) return;
    sureResourceIsFinish();
}

// 下一页
PageMgr.nextPage = function() {
    pageIndex ++;
    if(pageIndex > slideData.slideCount) return;
    sureResourceIsFinish();
}

  // 跳转到指定页
PageMgr.turnPage = function(page) {
    var pageIndexOut = parseInt(page);
    if(pageIndexOut <= 0  || pageIndexOut > slideData.slideCount) return;
    pageIndex = pageIndexOut;
    sureResourceIsFinish();
}

// 返回当前页码
PageMgr.cur_page = pageIndex;

// 返回总共页码
PageMgr.all_page = slideData.slideCount;

function GlobalData() {};
// 角色设置，1，学生，2老师
GlobalData.userType = 1;

// 学生互动授权启用
GlobalData.hasAuthority = function(enabled) {

}