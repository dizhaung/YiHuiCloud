define(['jtopo','/js/lib/Json2xml.js'],function (jtopo,Json2xml){

	var customLink = function (jsonObj,scene){
		this.initialize = function (){
			customLink.prototype.initialize.apply(this, arguments);
			this.myTopoStyle = true;
			this.textS = "";
			this.textE = "";
			this.textRotate = true;
			var d = "textS,textE".split(",");
			this.serializedProperties = this.serializedProperties.concat(d);
		}
		var startNode = scene.findElements(function (a){
			return a.id == jsonObj._startId;
		})[0];
		var endNode = scene.findElements(function (a){
			return a.id == jsonObj._endId;
		})[0];
		!jsonObj._interfaceSpeed && (jsonObj._interfaceSpeed = "");
		var text = jsonObj._interfaceSpeed;
		if(jsonObj.hideText == true){
			this.textS = "";
			this.textE = "";
			this.desc  = "";
			this.textback = text;
			text = "";
		}
		this.initialize(startNode,endNode,text);
		this.deserialize(jsonObj,scene);
	}
	customLink.prototype = new JTopo.Link();

	customLink.prototype.serialize = function (){
		var json2xml2 = new Json2xml();
		var _self = this;
		var jsonObj = _self.lineObj;
		if(_self.textback != undefined){
			_self.text = _self.textback;
		}
		var json = {
			line : {
				_id : _self.id,
				_name : _self.id,
				_startId : _self.nodeA.id,
				_endId : _self.nodeZ.id,
				_interfaceSpeed : _self.text,
				_color : '',
				_desc : '',
				_monitorId : '',
				_monitorName : '',
				_edId : '',
				_interfaceId : '',
				_flag : '',
				_pingYip : '',
				_pingMip : '',
				_pingStatus : '',
				networkLink : {
					startId : _self.nodeA.id,
					startPort : _self.lineObj.networkLink.startPort,
					endId : _self.nodeZ.id,
					endPort :_self.lineObj.networkLink.endPort
				},
				extend : {
					lineWidth : _self.lineWidth,
					strokeColor : _self.strokeColor,
					alpha : _self.alpha
				}
			}
		}
		var resultXml_str = json2xml2.json2xml_str(json);
		return resultXml_str;
	}
	customLink.prototype.deserialize = function (jsonObj,scene){
		this.lineObj = jsonObj;
		this.id = jsonObj._id;
		var startNode = scene.findElements(function (a){
			return a.id == jsonObj._startId;
		})[0];
		var endNode = scene.findElements(function (a){
			return a.id == jsonObj._endId;
		})[0];
		this.bundleOffset = 50;
		this.bundleGap = 20;
		this.textOffsetY = 3;
		
		jsonObj._color && (this.strokeColor = jsonObj._color);
		jsonObj.extend&&(this.strokeColor = jsonObj.extend.strokeColor?jsonObj.extend.strokeColor:'0,200,255');
		jsonObj.extend&&(this.alpha = jsonObj.extend.alpha?Number(jsonObj.extend.alpha):1);
		jsonObj.extend&&(this.lineWidth = jsonObj.extend.lineWidth?Number(jsonObj.extend.lineWidth):3);
		this.desc = jsonObj._desc;
		var startPort,endPort;
		if(startNode.asset && startNode.asset.ports && startNode.asset.ports.port){
			if(startNode.asset.ports.port instanceof Array){
				for(var i=0;i<startNode.asset.ports.port.length;i++){
					var tempPort = startNode.asset.ports.port[i];
					if(tempPort._id==jsonObj.networkLink.startPort){
						startPort = tempPort;
						break;
					}
				}
			}else {
				if(startNode.asset.ports.port._id==jsonObj.networkLink.startPort){
					startPort = startNode.asset.ports.port;
				}
			}
		}
		if(endNode.asset && endNode.asset.ports &&endNode.asset.ports.port){
			if(endNode.asset.ports.port instanceof Array){
				for(var i=0;i<endNode.asset.ports.port.length;i++){
					var tempPort = endNode.asset.ports.port[i];
					if(tempPort._id==jsonObj.networkLink.endPort){
						endPort = tempPort;
						break;
					}
				}
			}else {
				if(endNode.asset.ports.port._id==jsonObj.networkLink.endPort){
					endPort = endNode.asset.ports.port;
				}
			}
		}
		this.textS = startPort?startPort._name:undefined;
		this.textE = endPort?endPort._name:undefined;
		
		if(jsonObj._color=="red"){
			this.strokeColor = "217,83,79";
		}else if(jsonObj._color=="green"){
			this.strokeColor = "92,184,92";
		}else if(jsonObj._color=="yellow"){
			this.strokeColor = "240,173,78";
		}else if(jsonObj._color=="gray"){
			this.strokeColor = "153,153,153";
		}

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	customLink.prototype.bindAction = function (key){
		if(key == 'rightmouseup'){
			this.addEventListener('mouseup',function(event){
				if(3 == event.which)
				{
					eventActionMap[key]({event : event, node : this});
				}
			});
		}else {
			this.addEventListener(key,function(event){
				eventActionMap[key]({event : event, node : this});
			});
		}
	}
	customLink.prototype.reloadPort = function(){
		var startPort,endPort;
		if(this.lineObj.networkLink.startPort){
			this.nodeA.asset.ports.port = objToArray(this.nodeA.asset.ports.port);
			for(var i=0;i<this.nodeA.asset.ports.port.length;i++){
				var tempPort = this.nodeA.asset.ports.port[i];
				if(tempPort._id==this.lineObj.networkLink.startPort){
					startPort = tempPort;
					break;
				}
			}
		}
		if(this.lineObj.networkLink.endPort){
			this.nodeZ.asset.ports.port = objToArray(this.nodeZ.asset.ports.port);
			for(var i=0;i<this.nodeZ.asset.ports.port.length;i++){
				var tempPort = this.nodeZ.asset.ports.port[i];
				if(tempPort._id==this.lineObj.networkLink.endPort){
					endPort = tempPort;
					break;
				}
			}
		}
		this.textS = startPort?startPort._name:undefined;
		this.textE = endPort?endPort._name:undefined;
	}
	var eventActionMap = {}
	customLink.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}
	function objToArray(obj){
		if(!(obj instanceof Array)){
			var temp = obj;
			obj = new Array();
			obj.push(temp);
		}
		return obj;
	}
	return customLink;
});