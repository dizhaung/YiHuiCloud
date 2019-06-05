define(['jtopo',
       'Json2xml',
       'topoCustomNode',
       'topoCustomLink',
       'topoCustomFoldLink',
       'topoCustomFlexionalLink',
       'topoCustomTextNode',
       'topoCustomContainer',
       'topoCustomNephogram',
       '/js/plugin/topo/topo_util.js',
       '/js/plugin/topo/topo.js',
       'css!/css/topo.css'] ,function (
        jtopo,
        Json2xml,
        CustomNode,
        CustomLink,
        CustomFoldLink,
        CustomFlexionalLink,
        CustomTextNode,
        CustomContainer,
        CustomNephogram,
        topoUtil,
        topo){

        var json2xml = new Json2xml({});

        var this_params;
        var topoId;
        var stage,scene,_root;
        var canvasDom;

        var url = {
                importUrl : 'topoManage/getTopoMonitor',
                importDefaultUrl : 'topoManage/getDefaultTopoMonitor'
        };

        function showLineData(link){
            if(!checkEventSwitch()){
                return ;
            }
            var overTimeout;
            link.mouseover(function(){
                var event = arguments.callee.caller.arguments[0] || window.event;

                var ids = link.id.split("::");
                var start = scene.findElements(function (item){
                    if(item.id == ids[0]){
                        return true;
                    }else {
                        return false;
                    }
                })[0]
                var end = scene.findElements(function (item){
                    if(item.id == ids[1]){
                        return true;
                    }else {
                        return false;
                    }
                })[0]
                var _start = null;
                var _end = null;
                if(start.type == "cloudNode" || end.type == "cloudNode")
                {
                    var _tempstart = $.extend({},start.type=="cloudNode"?start:end);
                    for(var i=0;i<_tempstart._lines.length;i++)
                    {
                        if(_tempstart._lines[i].newId == link.id)
                        {
                            var _ids = _tempstart._lines[i].id.split("::");
                            for(var j=0;j<_tempstart._nodes.length;j++)
                            {
                                if(_ids[0] == _tempstart._nodes[j].id)
                                {
                                    start = _tempstart._nodes[j];
                                }
                                else if(_ids[1] == _tempstart._nodes[j].id)
                                {
                                    end = _tempstart._nodes[j];
                                }
                                if(_start!=null && _end!=null)
                                {
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                var startPort = undefined;
                var endPort = undefined;
                if(!start.asset || !end.asset){
                    return;
                }
                !start.asset.ports && (start.asset.ports={});
                !start.asset.ports.port && (start.asset.ports.port=new Array());

                for(var i=0;i<start.asset.ports.port.length;i++){
                    if(start.asset.ports.port[i]._id == this.lineObj.networkLink.startPort){
                        startPort = start.asset.ports.port[i];
                        break;
                    }
                }
                !end.asset.ports && (end.asset.ports={});
                !end.asset.ports.port && (end.asset.ports.port=new Array());

                for(var i=0;i<end.asset.ports.port.length;i++){
                    if(end.asset.ports.port[i]._id == this.lineObj.networkLink.endPort){
                        endPort = end.asset.ports.port[i];
                        break;
                    }
                }

                !startPort && (startPort={});
                !endPort && (endPort={});

                !startPort._imFlux && (startPort._imFlux=0);
                !startPort._exFlux && (startPort._exFlux=0);
                !endPort._imFlux && (endPort._imFlux=0);
                !endPort._exFlux && (endPort._exFlux=0);

                var flux = Number(startPort._imFlux) + Number(startPort._exFlux)+ Number(endPort._exFlux) + Number(endPort._imFlux);
                !link.lineObj._interfaceSpeed && (link.lineObj._interfaceSpeed=0);
                var speed = Number(link.lineObj._interfaceSpeed)*2*1024*1024;
                if (speed == 0 && startPort._speed && endPort._speed)
                {
                    var speed = Number(startPort._speed)
                    if (speed > Number(endPort._speed))
                        speed = Number(endPort._speed)/(1024*1024)
                    else
                        speed = Number(startPort._speed)/(1024*1024)
                }
                !speed && (speed = 1);
                var a = flux/speed;
                this.toolTip = Math.floor(a * 100) / 100+"%"
                var redTip = false;
                if(link.lineObj._color == "red" || link.lineObj._color == "255,0,0" || link.lineObj._color == "#ff0000" || link.lineObj._color == "yellow" || link.lineObj._color == "gray" )
                    redTip = true;
                var div = $('<div id="_tip_div" class="pabs" style="background-color:#FFF8DC;padding:5px;border-radius:5px;"></div>');
                var form_group = $('<div class="form-group" style="margin:0;"></div>');
                var label_name = $('<label >链路带宽：</label>');
                var label_value = $('<label >'+link.lineObj._interfaceSpeed+"Mbps"+'</label>');
                var form_group1 = $('<div class="form-group" style="margin:0;padding-bottom:10px;"></div>');
                var label_name1 = $('<label >带宽利用率:</label>');
                var label_value1 = $('<label >'+this.toolTip+'</label>');

                !this.textS && (this.textS="");

                var form_group2 = $('<div class="form-group" style="margin:0;"></div>');
                var label_name2 = $('<label >设备名称 :</label>');
                var label_value2 = $('<label >'+start.asset.name+'</label>');
                var form_group3 = $('<div class="form-group" style="margin:0;"></div>');
                var label_name3 = $('<label >设备IP :</label>');
                var label_value3 = $('<label >'+start.asset.ip+'</label>');
                var form_group4 = $('<div class="form-group" style="margin:0;padding-bottom:10px;"></div>');
                var label_name4 = $('<label >接口描述 :</label>');
                var label_value4 = $('<label >'+this.textS+'</label>');

                !this.textE && (this.textE="");
                var form_group5 = $('<div class="form-group" style="margin:0;"></div>');
                var label_name5 = $('<label >设备名称 :</label>');
                var label_value5 = $('<label >'+end.asset.name+'</label>');
                var form_group6 = $('<div class="form-group" style="margin:0;"></div>');
                var label_name6 = $('<label >设备IP :</label>');
                var label_value6 = $('<label >'+end.asset.ip+'</label>');
                var form_group7 = $('<div class="form-group" style="margin:0;padding-bottom:10px;"></div>');
                var label_name7 = $('<label >接口描述 :</label>');
                var label_value7 = $('<label >'+this.textE+'</label>');


                var form_group8 = $('<div class="form-group" style="margin:0;"></div>');
                var label_name8 = $('<label >连线变红原因 :</label>');
                if(link.lineObj._color == "yellow")
                    label_name8 = $('<label >连线变黄原因 :</label>');
                else if(link.lineObj._color == "gray")
                    label_name8 = $('<label >连线变灰原因 :</label>');

                var label_value8 = $('<label >'+link.desc+'</label>');


                form_group.append(label_name);
                form_group.append(label_value);

                form_group1.append(label_name1);
                form_group1.append(label_value1);

                form_group2.append(label_name2);
                form_group2.append(label_value2);

                form_group3.append(label_name3);
                form_group3.append(label_value3);

                form_group4.append(label_name4);
                form_group4.append(label_value4);

                form_group5.append(label_name5);
                form_group5.append(label_value5);

                form_group6.append(label_name6);
                form_group6.append(label_value6);

                form_group7.append(label_name7);
                form_group7.append(label_value7);

                form_group8.append(label_name8);
                form_group8.append(label_value8);
                div.append(form_group);
                div.append(form_group1);
                div.append(form_group2);
                div.append(form_group3);
                div.append(form_group4);
                div.append(form_group5);
                div.append(form_group6);
                div.append(form_group7);

                if(redTip == true){
                    div.append(form_group8);
                }
                overTimeout = setTimeout(function (){
                   $('#content_div').append(div);
                    var parentHeight = $('#content_div').innerHeight();
                    var parentWidth = $('#content_div').innerWidth();

                    var thisHeight = div.outerHeight();
                    var thisWidth = div.outerWidth();

                    var top = event.pageY;
                    var left = event.pageX;

                    if(event.pageY + thisHeight >= parentHeight){
                        top = event.pageY - thisHeight
                    }
                    if(event.pageX + thisWidth >= parentWidth){
                        left = event.pageX - thisWidth
                    }

                    div.css({
                        top: top,
                        left: left
                    })
                },500);
            });
            link.mouseout(function(){
                $('#content_div').find('#_tip_div').remove();
                clearTimeout(overTimeout);
            });
        }

function eventForCloudNode(cloudNode){
        cloudNode.mouseup(function(event){
                var _event = event || window.event;
                if(3 != _event.which || this.goTopo == "" || this.goTopo == undefined){
                        return;
                }

                $("#node_menu").css({
                        top: _event.pageY,
                        left: _event.pageX
                }).show().focus().blur(function (){
                        $(this).hide();
                });
                $("#node_menu #gotopo").attr("value",this.goTopo);
                $("#node_menu #gotopo").show();
                $("#node_menu #reset").hide();
        });
        for(var j=0;j<cloudNode._nodes.length;j++){
                var tnode = cloudNode._nodes[j];
                tnode.mouseup(function(event){
                        var _event = event || window.event;

                        if(3 != _event.which){
                                return;
                        }
                        $("#node_menu").css({
                                top: _event.pageY,
                                left: _event.pageX-80
                        }).show().focus().blur(function (){
                                $(this).hide();
                        });
                        $("#node_menu #gotopo").hide();
                        $("#node_menu #reset").show();
                        $("#node_menu #reset").attr("value",cloudNode.id);
                });
        }
}

function setCloudEvent(){
    if(!checkEventSwitch()){
        return ;
    }
    var clouds = scene.findElements(function (a){
        return a.type == "cloudNode";
    });
    for(var i=0;clouds&&i<clouds.length;i++){
        eventForCloudNode(clouds[i]);
    }
}
function checkEventSwitch(){
    if(!!this_params.hideBtnBar)
        return false;
    else return true;
}
function showDBClickUrl(node){
    if(!checkEventSwitch()){
        return ;
    }
    node.dbclick(function(){
        if(this.type != "cloudNode"){
            topo.topo_gotoDeviceMonitor(this.id,this_params.regionId);
        }
    });
}
function objToArray(obj){
        if(!(obj instanceof Array)){
                var temp = obj;
                obj = new Array();
                obj.push(temp);
        }
        return obj;
}

function formatJson(jsonobj,bindEvent){
    if(jsonobj.root){

        scene.clear();
        stage.id=jsonobj.root.id;
        stage.width = 5000;
        stage.height = 5000;
        stage.wheelZoom = 0.85;
        _root = jsonobj.root;
        _root.name && (document.title = _root.name);

        scene.translateX = Number(_root._x) || 0;
        scene.translateY = Number(_root._y) || 0;
        if(_root.nodes.node){   
            _root.nodes.node = objToArray(_root.nodes.node);
            for(var i=0;i<_root.nodes.node.length;i++){
                var item = _root.nodes.node[i];
                if(!!this_params.hideBtnBar) item.hideTip = true;
                var node = new CustomNode(item);
                scene.add(node);
                bindEvent && showDBClickUrl(node);
            }
        }
        if(_root.lines.line){
            _root.lines.line = objToArray(_root.lines.line);
            var lineNumber = 0;
            for(var i=0;i<_root.lines.line.length;i++)
            {
                var dependence = _root.lines.line[i];
                if(dependence._id.split("::").length >= 3){
                    dependence.id = dependence._id;
                }
                else{
                    dependence.id = dependence.networkLink.startId+"::"+dependence.networkLink.endId+"::"+lineNumber;
                    dependence._id = dependence.id;
                }
                lineNumber = lineNumber+1;

                dependence._startId = dependence.networkLink.startId;
                dependence._endId = dependence.networkLink.endId;
                dependence.hideText = true;
                if(!dependence._color)
                    dependence._color = "gray";
                var link = null;
                if(dependence._type === "line"){
                    link = new CustomLink(dependence,scene);
                }else if(dependence._type === "foldline"){
                    link = new CustomFoldLink(dependence,scene);
                }else if(dependence._type === "squarelyflexionalline"){
                    link = new CustomFlexionalLink(dependence,scene);
                }else {
                    link = new CustomLink(dependence,scene);
                }
                link.id = dependence.id;
                link.type = "dependence";
                scene.add(link);
                bindEvent && showLineData(link);
            }
        }
        if(_root.nephograms && _root.nephograms.nephogram){ 
            _root.nephograms.nephogram = objToArray(_root.nephograms.nephogram);
            for(var i=0;i<_root.nephograms.nephogram.length;i++){
                CustomNephogram.formatCloudByCloudObj(scene,_root.nephograms.nephogram[i]);
            }
        }
        bindEvent && setCloudEvent()
        if(_root.dynTexts && _root.dynTexts.dynText){
            _root.dynTexts.dynText = objToArray(_root.dynTexts.dynText);
            for(var i=0;i<_root.dynTexts.dynText.length;i++){
                var textObj = _root.dynTexts.dynText[i];
                var textNode = new CustomTextNode(textObj);
                textNode.type = "text";
                scene.add(textNode);
            }
        }
        if(_root.squareBoxes && _root.squareBoxes.container){
            _root.squareBoxes.container = objToArray(_root.squareBoxes.container);
            for(var i=0;i<_root.squareBoxes.container.length;i++){
                var containerObj = _root.squareBoxes.container[i];
                var containerNode = new CustomContainer(containerObj,scene);
                scene.add(containerNode.container);
            }
        }
    }else {
        g_dialog.operateAlert(null,"数据加载出错","error");
    }
}

var defaultBackgroundImageURL = '/img/topo/backimg.png';
var defaultBackgroundImageRepeat = 'repeat';

return {
        createCanvasFactory : function (divEl,canvasId){
                canvasId || (canvasId = 'canvas');
                if(!divEl)return null;
                var canvas = document.createElement('canvas');
                canvas.id = canvasId;
                canvas.height = divEl.height();
                canvas.width = divEl.width();
                divEl.append(canvas);
                canvasDom = canvas;
                return canvas;
        },
        initParam : function(params){
                this_params = params;
                topoId = this_params.topoId;
        },
        createStageAndScene : function (canvas){
            var this_canvas = canvas? canvas : canvasDom;
            stage = new JTopo.Stage(this_canvas);
            scene = new JTopo.Scene();
            stage.add(scene);
            return {
                stage : stage,
                scene : scene
            }
        },
        initStageAndScene : function(stage1,scene1){
                stage = stage1;
                scene = scene1;
        },
        initTopoInfo : function (){
            var that = this;
            $.ajax({
                url : index_web_app + 'topoManage/getTopoInfo',
                data : {topoId:this_params.topoId,regionId:this_params.regionId},
                type : 'post',
                dataType : 'json',
                async : true,
                timeout : 6000,
                xhrFields: {
                    withCredentials: true
                },
                success : function (data){

                    var bgi = data.topoBackground;
                    !!bgi && that.setBackgroundImage(bgi);

                    if(this_params.changeTitle){
                        data.topoName && (document.title = data.topoName);
                        $("#titlename").text(data.topoName);
                    }
                },
                error : function (e)
                {
                }
            });
        },
        setBackgroundImage : function(url){
            var bgiurl = url.split(',')[0];
            if(!bgiurl){
                scene.background = defaultBackgroundImageURL
                scene.backgroundRepeat = defaultBackgroundImageRepeat
            }else {
                var bgis = url.split(',');
                um_ajax_get({
                    url : 'topoManage/getImageBase64',
                    paramObj : {imgUri : bgis[0]},
                    successCallBack : function (data){
                        var img = new Image();
                        img.src = data;
                        scene.background = img;
                        if(bgis.length==2){
                            scene.backgroundRepeat = bgis[1];
                        }else {
                            scene.backgroundRepeat = undefined;
                        }
                    },
                    failCallBack : function (){
                        scene.background = defaultBackgroundImageURL
                        scene.backgroundRepeat = defaultBackgroundImageRepeat
                    }
                })
            }
        },
        initView : function(bindEvent){
            um_ajax_get({
                url : (topoId?(url.importUrl + "?topoId="+topoId):url.importDefaultUrl),
                successCallBack : function (data){
                    if(data){
                        canvasDom.width = $(canvasDom).parent().width();
                        canvasDom.height = $(canvasDom).parent().height();
                        var jsonobj = json2xml.xml_str2json(data);
                        formatJson(jsonobj,bindEvent);
                    }else {
                        g_dialog.operateAlert(null,"获取数据异常","error");
                    }
                }
            })
            $("#node_menu a").click(function (event){
                var text = $(this).text();
                if(text == "恢复云图"){
                    var node = CustomNephogram.popCloud($(this).attr("value"));
                    CustomNephogram.formatCloud(scene,node._nodes,node);
                }else if(text == "拓扑图跳转"){
                    window.open("#/monitor_info/topo_manage_topo1?topoId="+$(this).attr("value")+"&topoType=1&defaultShow&image=&flag&taskId=&topoDiscoverIcon&hideMenu=1");
                }
                $('#node_menu').hide();
            });
        }
}
}
);