define(['/js/plugin/monitor/monitor.js',
	'/js/plugin/dialog/dialog.js',
	'jtopo',
	'/js/lib/Json2xml.js',
	'/js/plugin/topo/customNode.js',
	'/js/plugin/topo/customLink.js',
	'/js/plugin/topo/customFoldLink.js',
	'/js/plugin/topo/customFlexionalLink.js',
	'/js/plugin/topo/customTextNode.js',
	'/js/plugin/topo/customContainer.js',
	'/js/plugin/topo/customNephogram.js',
	],function (monitor,
		dialog,
		jtopo,
		Json2xml,
		CustomNode,
		CustomLink,
		CustomFoldLink,
		CustomFlexionalLink,
		CustomTextNode,
		CustomContainer,
		customNephogram){

	var canvas,stage;
	var animateCache = [];
	return {
		doCancel : function (){
			// alert("doCancel");
		},
		goBack : function (type,fromType){
				if(fromType=='grid'){
					window.location.href = "#/monitor_info/app_monitor?fromType=grid";
				}else{
					window.location.href = "#/monitor_info/app_monitor";
				}
		},
		showMonitor : function (compId,compType,id){
			//应用系统
			if("appSystem"==compType){
				window.location.href = "#/monitor_info/app_monitor_topo?appId="+compId+"&fromType=thumb";
			}else if("os"==compType||"middleware"==compType||"database"==compType||
	   		"netDevice"==compType||"securityDevice"==compType||"storeDevice"==compType||
	   		"appsoftware"==compType||"generalAgreement"==compType){

				window.open('#/monitor_info/monitor_obj/monitor_info?monitorTypeId='+""+'&monitorId='+compId+'&regionId=&assetId='+""+'&hideMenu=1&queryByMonitor=1');
			}else {
				$.ajax({
					type : "GET",
					url : "module/sys_manage/monitor_config/app_monitor_config_tpl.html",
					server : "/",
					success : function(data){
						dialog.dialog($(data).find("[id=eventList]") ,{
							title : "事件详细信息",
							isDetail : true,
							width:"700px",
							init : init,
							initAfter : initAfter,
							saveclick : save 
						});
						function init(el) 
						{
						}
						function initAfter(el){
							g_grid.render(el.find("#event_table_div"),{
								header:[
								{text:'组件名称',name:"compName"},
								{text:'事件名称',name:"eventName"},
								{text:'事件类型',name:"eventType"},
								{text:'发生时间',name:"enterDate"}
								],
								url:"appMonitor/queryEventsList",
								paramObj : {compId : compId ,id : id ,compType : compType},
								hideSearch : true,
								maskObj : el
							});
						}
						function save(el){
						}
					}
				});
			}
		},
		addMonitor : function (type){
			var url = {
				edit_tpl : "module/sys_manage/monitor_config/monitor_config_tpl.html",
				monitor_type_data : "deviceMonitor/queryMonitorClassAndTypeList"
			};
			var swfId = "Main";
			monitor.monitorDialog({
				url : url.edit_tpl,
				ele : "[id=edit_template]",
				title : "监控器添加",
				showList : true,
				monitorType : url.monitor_type_data,
				step : 5,
				navTit : ["监控器类型" ,"被监控资产" ,"基本信息" ,"凭证信息" ,"指标信息"],
				submitCbf : function(){
					refreshMonitor(swfId,type)
				}
			});
		},
		doHelp : function (index){
			// g_dialog.operateAlert(null,"doHelp");
			// var flag = 0; //0是不存在，显示默认
			// if(typeof(index) == 'undefined'){
			// 	index ='default';
			// }else{
			// 	um_ajax_get({
			// 		url : "HelpExplain/queryNameExist?name="+index.toString()+"",
			// 		isAsync : false,
			// 		successCallBack : function (data){
			// 			flag = data.flag;
			// 		}
			// 	});
			// }
			// if(flag==0){
			// 	index = 'default';
			// }
			// window.open ('/module/helpExplain/helpExplain.html?name='+index+'', '帮助', 'height=650, width=320, top=20, left=0, toolbar=no, menubar=no, scrollbars=yes,overflow:auto,resizable=yes,location=no, status=no') 
		},
		goTopo : function (topoId,appId,appName){
			var flag = 3;//权限过滤，1：拓扑编辑;0：拓扑监控、网络拓扑
			var appMonitorFlag = 1;
			window.location.href = "#/monitor_info/topo_manage_topo?topoId="+topoId+"&topoType=2&flag="+flag+"&appMonitorFlag=" + appMonitorFlag + "&appId=" + appId + "&appName=" + encodeURI(encodeURIComponent(appName));
		},
		goToAppMonitorViewThumbnail : function (){
			alert("goToAppMonitorViewThumbnail");
		},
		refreshMonitor : function (swfId,type){
			alert("refreshMonitor");
			document.getElementById(swfId).refreshMonitor(type);
		},
		doUpload : function (swfId,title,serverPath,fileTitle){

			var url = {
				bgUpload : "module/sys_manage/monitor_config/app_monitor_config_tpl.html"
			};

			$.ajax({
				type : "GET",
				url : url.bgUpload,
				server : "/",
				success : function(data){
					dialog.dialog($(data).find("[id=bgUpload]") ,{
						title : title,
						init : init,
						saveclick : save 
					});
					function init(el) 
					{
						$(el).find("#fileInputLabel").text(fileTitle);
						index_create_upload_el($(el).find("[id=fileInput]"));
					}
					function save(el){
						um_ajax_file(el.find("#fileUpload_form") ,{
							url : "deviceRoom/uploadFile",
							maskObj : el,
							paramObj : {url : "/flash/appmonitor/assets/background/"},
							successCallBack : function (data){
								dialog.hide(el);
								g_topo.refreshFlash(swfId,data);
							}
						});
					}
				}
			});

		},
		refreshFlash : function (swfId,path){
			document.getElementById(swfId).refreshFlash();
		},
		/*以下为拓扑管理功能对应js方法 */
		topoSaveFile : function (imgView){
			var form = document.getElementById("exportForm");
			var form = $("#exportForm");
			form.find("#asset").val(imgView);
			form.prop("action",index_web_app+"topoManage/saveFile");
			form.submit();
		},
		topoGoBack : function (where){
			if(where == "edit"||where == "view"){
				window.location.href =  "#/monitor_info/topo_manage";
				// window.parent.parent.subLocus("tuppumanagement");//设置菜单
			}

			else if(where == "show"){
				window.location.href =  "#/monitor_info/topo_manage";
			}
			else if(where == "HBshow")
			{
				if(globalTopoFlag == "1")
				{//全国拓扑点击进入默认拓扑图后退出
					window.location =  "#/pages/asset/topo/globalTopoShow.jsp";
				}
				else if(globalTopoFlag == "2")
				{//进入运维首页后点击星星进入默认拓扑图
					window.location =  "#/shared/media/flash/envProtectShow/envProtectShow.jsp?globalTopoFlag=2";
				}
				else
				{//拓扑管理点击拓扑地图进入默认拓扑图后退出
					window.location =  "#/shared/media/flash/envProtectShow/envProtectShow.jsp";
				}
			}
			else if(where == "linkShow")
			{
				window.location =  "#/shared/media/flash/LinkTopoShow/linkTopoShow.jsp";
			}
			
			if(where == "appMonitor"){	//应用监控进入拓扑监控页面
				// var appId = '<%= request.getParameter("appId") %>';
				// <%
				// 	String appName = request.getParameter("appName");
				// 	if(appName!=null){
				// 		appName = URLDecoder.decode(request.getParameter("appName"), "UTF-8");
				// 	}
				// %>	
				// var appName = '<%= appName %>';
				// var baseJson = '{"id":"'+ appId + '","opType":"view","theme":"'+ unieap.themeName + '","fromType":"thumb"}';
				// window.location = "/shared/media/flash/appmonitor/Main.jsp?baseJson=" + baseJson;
			}
		},
		topoBackAlert : function (info){
			g_dialog.operateAlert(null,info,"error");
			window.location.href = "#/monitor_info/topo_manage";
		},
		topoJsAlert : function (info){
			g_dialog.operateAlert(null,info,"error");
		},
		consoleLog : function (info){
			console.log(info);
		},
		topo_goTopoName : function (){
			// alert("topo_goTopoName");跳转父topo
		},
		topo_doPing : function (){
			var wsh = null;
			try{
				wsh = new ActiveXObject('WScript.Shell');
			}catch(e){
				doAlert();
			}
			if(wsh)
			{
				if(ipAddr.indexOf('^')==-1)
				{
					wsh.Run('cmd  /k ping ' + ipAddr);
				}else
				{
					wsh.Run('cmd /k');
				}
			}
		},
		topo_doTelnet : function (){
			var wsh = null;
			try{
				wsh = new ActiveXObject('WScript.Shell');
			}catch(e){
				doAlert();
			}
			if(wsh)
			{
				if(ipAddr.indexOf('^')==-1)
				{
					wsh.Run('cmd  /k telnet ' + ipAddr);
				}else
				{
					wsh.Run('cmd /k');
				}
			}
		},
		topo_doTraceroute : function (){
			var wsh = null;
			try{
				wsh = new ActiveXObject('WScript.Shell');
			}catch(e){
				doAlert();
			}
			if(wsh)
			{
				if(ipAddr.indexOf('^')==-1)
				{
					wsh.Run('cmd  /k tracert ' + ipAddr);
				}else
				{
					wsh.Run('cmd /k');
				}
			}
		},
		topo_doMstsc : function (){
			var wsh = null;
			try{
				wsh = new ActiveXObject('WScript.Shell');
			}catch(e){
				doAlert();
			}
			if(wsh)
			{
				if(ipAddr.indexOf('^')==-1)
				{
					wsh.Run('cmd  /k mstsc /v:' + ipAddr);
				}else
				{
					wsh.Run('cmd /k');
				}
			}
		},
		topo_webCtl : function (param){
			window.open(param);
		},
		topo_doSsh : function (){
			var wsh = null;
			try{
				wsh = new ActiveXObject('WScript.Shell');
			}catch(e){
				doAlert();
			}
			if(wsh)
			{
				if(ipAddr.indexOf('^')==-1)
				{
					wsh.Run('putty ' + ipAddr);
				}else
				{
					wsh.Run('cmd /k');
				}
			}
		},
		topo_gotoFaultEventList : function (){
			alert("topo_gotoFaultEventList")
		},
		topo_gotoDeviceMonitor : function (edId,regionId){
			var tmpId = -1;
			um_ajax_get({
				/*url : "monitorView/queryEdMonitor",*/
				url : "monitorView/queryMonitorForEd",
				paramObj : {edId : edId},
				successCallBack : function (data){
					var  resultObj = data;
					if(resultObj.length<1){
						g_dialog.operateAlert(null,"该设备上没有配置监控器","error");
						tmpId = 0;
					}else {
						//window.open('#/monitor_info/monitor_obj/monitor_info?monitorTypeId=&monitorId=&regionId='+regionId+'&assetId='+edId+'&hideMenu=1&queryByAsset=1');
						tmpId =1;
					}
				}
			});
			$("body").everyTime(100 ,function (){
				if (tmpId == 1)
				{
					console.log(1)
					window.open('#/monitor_info/monitor_obj/monitor_info_bak?monitorTypeId=&monitorId=&regionId='+regionId+'&assetId='+edId+'&hideMenu=1&queryByAsset=1');
					$("body").stopTime();
				}
				else if(tmpId == 0){
					console.log(0)
					$("body").stopTime();
				}
				console.log(-1);
			})
		},
		topo_doWebLogin : function (){
			alert("topo_doWebLogin")
		},
		topo_goTopoBackName : function (param){
			//跳转到父拓扑图
			var topoId = param;
			um_ajax_get({
				url : "topoManage/getTopoName",
				paramObj : {topoId : topoId},
				successCallBack : function (data){
					//设置菜单路径
					swal(data.topoName);
				}
			});
		},
		topo_goClassificationBack : function (){
			alert("topo_goClassificationBack")
		},
		topo_doUpload : function (){
			var url = {
				bgUpload : "module/sys_manage/monitor_config/app_monitor_config_tpl.html"
			};

			$.ajax({
				type : "GET",
				url : url.bgUpload,
				server : "/",
				success : function(data){
					dialog.dialog($(data).find("[id=bgUpload]") ,{
						title : "上传背景图",
						init : init,
						saveclick : save 
					});
					function init(el) 
					{
						$(el).find("#fileInputLabel").text("选择图片");
						index_create_upload_el($(el).find("[id=fileInput]"));
					}
					function save(el){
						um_ajax_file(el.find("#fileUpload_form") ,{
							url : "deviceRoom/uploadFile",
							maskObj : el,
							paramObj : {url : "/flash/topo/assets/themes/backGroundImage/"},
							successCallBack : function (data){
								dialog.hide(el);
								document.getElementById("topo").getImagePath();
							}
						});
					}
				}
			});
		},
		topo_upload : function (){
			alert("topo_upload")
		},
		topo_monitorView : function (){
			window.open('#/monitor_info/monitor_obj/monitor?hideMenu=1');
		},
		topo_ManualRefresh : function (){
			window.location.reload()
		},
		topo_gotoImportantPort : function (){
			window.open("#/sys_manage/monitor_config/imp_interface");
		},
		topo_rightClickInit : function (){
			
		},
		topo_assetQuery : function (deviceStr){
			asset.queryDialog({
				subtract : deviceStr,
				saveclick : function (dataList){
					console.log(dataList)
					// document.getElementById("topo").getImagePath();
				}
			});
		},
		bigScreenResize : function (){
			'undefined' != typeof canvas &&canvas && (canvas.width = $(canvas).parent().width());
			'undefined' != typeof canvas &&canvas && (canvas.height = $(canvas).parent().height());
			'undefined' != typeof stage && stage && stage.childs.length>0 && (stage.childs[0].centerAndZoom());
		},
		bigScreenClear : function (){
			canvas = document.getElementById('canvas');
			if(!stage){
				stage = new JTopo.Stage(canvas);
			}
			stage.clear();
			for(var i=0;i<animateCache.length;i++){
				animateCache[i].stop();
			}
			animateCache = [];
			JTopo.Animate.stopAll();
		},
		oldTopoData : '',
		blackFont : false,
		resetSelf : function (){
			canvas = undefined;
			stage = undefined;
			animateCache = [];
			this.oldTopoData = '';
			this.blackFont = true;
		},
		initBigScreenShow : function (){
			var that = this;

			var params = index_query_param_get();

			var token = params.token;

			var paramObj = {token : token};

			var url = {
				importUrl : 'topoManage/getDefaultTopoMonitor'
			};

			var json2xml = new Json2xml();
			// this.bigScreenClear();
			canvas = document.getElementById('canvas');
			if(!stage){
				stage = new JTopo.Stage(canvas);
			}
			// for(var i=0;i<animateCache.length;i++){
			// 	animateCache[i].stop();
			// }
			// animateCache = [];
			// JTopo.Animate.stopAll();

			canvas.width = $(canvas).parent().width();
			canvas.height = $(canvas).parent().height();
			stage.width = 5000;
			stage.height = 5000;

			// var loadingObj = {
			// 	width: 100,
			// 	height: 100,

			// 	stepsPerFrame: 1,
			// 	trailLength: 1,
			// 	pointDistance: .05,

			// 	strokeColor: '#b9b9b9',

			// 	fps: 20,

			// 	setup: function() {
			// 		this._.lineWidth = 4;
			// 	},
			// 	step: function(point, index) {

			// 		var cx = this.padding + 50,
			// 		cy = this.padding + 50,
			// 		_ = this._,
			// 		angle = (Math.PI/180) * (point.progress * 360),
			// 		innerRadius = index === 1 ? 10 : 25;

			// 		_.beginPath();
			// 		_.moveTo(point.x, point.y);
			// 		_.lineTo(
			// 			(Math.cos(angle) * innerRadius) + cx,
			// 			(Math.sin(angle) * innerRadius) + cy
			// 			);
			// 		_.closePath();
			// 		_.stroke();

			// 	},
			// 	path: [
			// 	['arc', 50, 50, 40, 0, 360]
			// 	]
			// }
			// $("#loading").css("top",canvas.height/2-50);
			// $("#loading").css("left",canvas.width/2-50);
			// var sonic = new Sonic(loadingObj);
			// $("#loading").html("");
			// $("#loading").append(sonic.canvas);
			init();
			function init(){
				// $("#loading").show();
				// sonic.play();
				um_ajax_get({
					url : url.importUrl,
					isLoad : false,
					paramObj : paramObj,
					successCallBack : function (data){
						// sonic.stop();
						// $("#loading").hide();
						// $("#loading").html("");
						if(data){
							if(that.oldTopoData== data){
								return false
							}
							var jsonobj = json2xml.xml_str2json(data);
							that.oldTopoData = data;
							formatJson(jsonobj);
						}else {
							g_dialog.operateAlert(null,"暂无默认拓扑图","error");
						}
					},
					failCallBack : function (e){
						// sonic.stop();
						// $("#loading").hide();
						// $("#loading").html("");
					}
				})
			}
			function objToArray(obj){
				if(!(obj instanceof Array)){
					var temp = obj;
					obj = new Array();
					obj.push(temp);
				}
				return obj;
			}
			function formatJson(jsonobj){
				if(jsonobj.root){
					canvas.width = $(canvas).parent().innerWidth();
					canvas.height = $(canvas).parent().innerHeight();
					stage.clear();
					for(var i=0;i<animateCache.length;i++){
						animateCache[i].stop();
					}
					animateCache = [];
					JTopo.Animate.stopAll();
					stage.id=jsonobj.root.id;
					var _root = jsonobj.root;

					scene = new JTopo.Scene();
					scene.mode = "select";
					stage.add(scene);
					scene.translateX = Number(_root.x);
					scene.translateY = Number(_root.y);

					if(_root.nodes.node){
						_root.nodes.node = objToArray(_root.nodes.node)
						for(var i=0;i<_root.nodes.node.length;i++){
							var item = _root.nodes.node[i];
							var node = itemToNode(item);
							scene.add(node);
						}
					}
					if(_root.lines.line){
						_root.lines.line = objToArray(_root.lines.line)
						for(var i=0;i<_root.lines.line.length;i++){
							var dependence = _root.lines.line[i];
							var link = dependenceToLink(dependence,scene);
							scene.add(link);
						}
					}

					if(_root.dynTexts && _root.dynTexts.dynText){
						_root.dynTexts.dynText = objToArray(_root.dynTexts.dynText);
						for(var i=0;i<_root.dynTexts.dynText.length;i++){
							var textObj = _root.dynTexts.dynText[i];
							var textNode = new CustomTextNode(textObj);
							textNode.dragable = false;
							textNode.showSelected = false;
							scene.add(textNode);
						}
					}

					if(_root.nephograms.nephogram){ 
						_root.nephograms.nephogram = objToArray(_root.nephograms.nephogram);
						for(var i=0;i<_root.nephograms.nephogram.length;i++){
							customNephogram.formatCloudByCloudObj(scene,_root.nephograms.nephogram[i],true);
						}
					}

					if(_root.squareBoxes && _root.squareBoxes.squareBox){
						_root.squareBoxes.squareBox = objToArray(_root.squareBoxes.squareBox);
						for(var i=0;i<_root.squareBoxes.squareBox.length;i++){
							var containerObj = _root.squareBoxes.squareBox[i];
							var containerNode = new CustomContainer(containerObj);
							scene.add(containerNode);

							var childs = scene.childs;
							childs.forEach(function (child){
								if(child instanceof CustomNode || 
									child instanceof CustomTextNode || 
									child instanceof JTopo.Node || 
									child instanceof JTopo.Link || 
									child instanceof CustomNephogram){
									if(containerNode.isInBound(child.x,child.y)){
										containerNode.add(child);
									}
								}
							});
						}
					}
					if(_root.squareBoxes && _root.squareBoxes.container){
						_root.squareBoxes.container = objToArray(_root.squareBoxes.container);
						for(var i=0;i<_root.squareBoxes.container.length;i++){
							var containerObj = _root.squareBoxes.container[i];
							var containerNode = new CustomContainer(containerObj,scene,true);
							scene.add(containerNode.container);
						}
					}
					scene.centerAndZoomPadding = 25;
					scene.centerAndZoom();

				}else {
					g_dialog.operateAlert(null,"数据加载出错","error");
				}

			}

			function tenTo16(num){
				num = Number(num);
				var str = num.toString(16);
				while(str.length<6){
					str = '0'+str;
				}
				return str;
			}


			function newNode(x, y, w, h, text ,imgurl){
				var node = new JTopo.Node(text);
				node.setLocation(x, y);
				node.setSize(w, h);
				imgurl && node.setImage(imgurl);
				node.font = '12px Consolas';
				that.blackFont && (node.fontColor = '0,0,0');
				that.blackFont && (node.shadowBlur = 5);
				return node;
			}
			function itemToNode(item){
				var x = Number(item._x);
				var y = Number(item._y);
				var width = item._width?Number(item._width):40;
				var height = item._height?Number(item._height):40;
				var w = Number(width);
				var h = Number(height);
				var id = item._id;
				var name = item._name;
				var isDeltaInfo = Number(item._isDeltaInfo);
				var imgurl = imgMapping(item);
				if(imgurl.indexOf("hubswitch")!= -1){
					w= 2*w;
					h= 2*h;
				}
				var node = newNode(x,y,w,h,name,imgurl);
				node.asset = item.asset ;
				if(item._eventlevel!="0"){
					if(item._eventlevel=="1"){
						node.alarm = "性能事件";
						node.alarmColor = "255,255,0";
					}else if(item._eventlevel=="2"){
						node.alarm = "故障事件";
						node.alarmColor = "255,0,0";
					}else if(item._eventlevel=="3"){
						node.alarm = "性能&故障事件";
						node.alarmColor = "255,0,0";
					}
				}
				node.dragable = false;
				node.showSelected = false;
				// node.id=getUuid();//给节点赋予不同id可以解决仅方向不同两条线重合问题
				node.id=item.asset.id;
				node.myTopoStyle = true;
				node.eventlevel = item._eventlevel;
				node.alarmAlpha = 0.5;
				node.alarmBackground = '/img/topo/new/stpclient.svg';
				node.alarmBackground_scale = 1.3;
				if(node.eventlevel=='2'||node.eventlevel=='3'||node.eventlevel=='1'){
					if(node.eventlevel=='1'){
						node.alarmBackground_color = 'rgb(240,173,78)';
					}else {
						node.alarmBackground_color = 'rgb(217,83,79)';
					}
					var tempAnimate = JTopo.Animate.stepByStep(node,
							{
								alarmAlpha:0.2
							}, 1000, true , true).start();
					animateCache.push(tempAnimate);
				}
				return node;
			}
			function imgMapping(item){
				var img = item._img;
				var imgName = img.substring(img.lastIndexOf('/')+1,img.lastIndexOf('.'));
				var imgurl = "/img/topo/new/"+ imgName + ".svg";
				if(imgName.indexOf('cloud')!=-1){
					imgurl = "/img/topo/new/cloud/"+ imgName + ".svg";
				}
				// if(validateImage(imgurl)){
				// 	return imgurl;
				// }else {
				// 	return item._img;
				// }

				return item._img;
			}
			function validateImage(url)
			{    
				var xmlHttp ;
				if (window.ActiveXObject)
				{
					xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
				}
				else if (window.XMLHttpRequest)
				{
					xmlHttp = new XMLHttpRequest();
				}
				xmlHttp.open("Get",url,false);
				xmlHttp.send();
				if(xmlHttp.status==404)
					return false;
				else
					return true;
			}
			function getUuid() {
			    var len = 32; //32长度
			    var radix = 16; //16进制
			    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
			    var uuid = [],
			    i;
			    radix = radix || chars.length;
			    if (len) {
			    	for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
			    } else {
			    	var r;
			    	uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			    	uuid[14] = '4';
			    	for (i = 0; i < 36; i++) {
			    		if (!uuid[i]) {
			    			r = 0 | Math.random() * 16;
			    			uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8: r];
			    		}
			    	}
			    }
			    return uuid.join('');
			}

			function dependenceToLink(dependence,scene){
				var startNode = scene.findElements(function (a){
					return a.id == dependence._startId;
				})[0];
				var endNode = scene.findElements(function (a){
					return a.id == dependence._endId;
				})[0];
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
				link.bundleGap = 20;
				link.font = '14px Consolas';
				link.deltS = 20;
				link.deltE = 20;

				link.myTopoStyle = true;
				link.textRotate = true;
				link.type = 'dependence';
				link.id = dependence._id;
				link.lineObj = dependence;
				var startPort,endPort;
				if(startNode.asset.ports.port){
					if(startNode.asset.ports.port instanceof Array){
						for(var i=0;i<startNode.asset.ports.port.length;i++){
							var tempPort = startNode.asset.ports.port[i];
							if(tempPort._id==dependence.networkLink.startPort){
								startPort = tempPort;
								break;
							}
						}
					}else {
						if(startNode.asset.ports.port._id==dependence.networkLink.startPort){
							startPort = startNode.asset.ports.port;
						}
					}
				}
				if(endNode.asset.ports.port){
					if(endNode.asset.ports.port instanceof Array){
						for(var i=0;i<endNode.asset.ports.port.length;i++){
							var tempPort = endNode.asset.ports.port[i];
							if(tempPort._id==dependence.networkLink.endPort){
								endPort = tempPort;
								break;
							}
						}
					}else {
						if(endNode.asset.ports.port._id==dependence.networkLink.endPort){
							endPort = endNode.asset.ports.port;
						}
					}
				}
				link.textS = startPort?startPort._name:undefined;
				link.textE = endPort?endPort._name:undefined;
				//以两边节点的最大宽高决定转弯处的偏移量
				var maxwidth = Math.max(startNode.width,endNode.width);
				var maxheight = Math.max(startNode.height,endNode.height);
				var max = Math.max(maxwidth,maxheight);
				if(max/2>link.bundleOffset){
					link.bundleOffset = max/2;
				}
				if(dependence._color=="red"){
					link.strokeColor = "217,83,79";
				}else if(dependence._color=="green"){
					link.strokeColor = "98,203,49";
				}else {

				}
				if(startPort&&dependence._attention=='start'){
				}else if(endPort&&dependence._attention=='end'){
				}else {
					if(startPort&&endPort&&dependence._color!="red"){
						var max = Math.max(startPort._exFlux,startPort._imFlux,endPort._exFlux,endPort._imFlux);
						link.text = formatFlux(max);
					}else {
						link.text = '0B/s';
					}
				}
				function formatFlux(flux){
					if(Number(flux)/1000<1){
						return Number(flux) + 'B/s';
					}else if(Number(flux)/1000/1000<1){
						return (Number(flux)/1000).toFixed(2) + 'K/s';
					}else if(Number(flux)/1000/1000/1000<1){
						return (Number(flux)/1000/1000).toFixed(2) + 'M/s';
					}else {
						return (Number(flux)/1000/1000/1000).toFixed(2) + 'G/s';
					}
				}
				link.showSelected = false;
				link.addEventListener('mouseover',function (){
					this.oldZIndex = this.zIndex;
					this.zIndex = 998;
					startNode.oldZIndex = startNode.zIndex;
					startNode.zIndex = 999;
					endNode.oldZIndex = endNode.zIndex;
					endNode.zIndex = 999;
					scene.reZIndex();
				});
				link.addEventListener('mouseout',function (){
					this.zIndex = this.oldZIndex;
					startNode.zIndex = startNode.oldZIndex;
					endNode.zIndex = endNode.oldZIndex;
					scene.reZIndex();
				});
				return link;
			}
			function addAttributes(base,extend,attrName){
				var rootKeyset = Object.keys(extend);
				var _attrName = attrName || "attributes";
				base[_attrName] = {};
				for(var i=0;i<rootKeyset.length;i++){
					if((typeof extend[rootKeyset[i]]) == "string"){
						base[_attrName][rootKeyset[i]] = extend[rootKeyset[i]];
					}
				}
			}

		}

	}

});