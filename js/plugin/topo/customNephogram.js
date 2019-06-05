define(['jtopo',
	'/js/lib/Json2xml.js',
	'/js/plugin/topo/topo_util.js',
	'topoCustomLink'
	],function (jtopo,
		Json2xml,
		topoUtil,
		CustomLink){

	var customNephogram = function (jsonObj){
		this.initialize = function (){
			jsonObj._name && customNephogram.prototype.initialize.apply(this, arguments);
			this.myTopoStyle = true;
			var d = "node,goTopo".split(",");
			this.serializedProperties = this.serializedProperties.concat(d);
		}
		this.initialize();
		this.deserialize(jsonObj);
	}
	customNephogram.prototype = new JTopo.Node();

	customNephogram.cloudArray = new Array();
	customNephogram.putCloud = function(cloud){
		this.cloudArray.push(cloud)
	}
	customNephogram.popCloud = function(cloudId){
		for(var i=0;i<this.cloudArray.length;i++){
			if(cloudId == this.cloudArray[i].id ){
				var temp = $.extend({},this.cloudArray[i]);
				this.cloudArray.splice(i,1);
				return temp;
			}
		}
	}
	customNephogram.createLink = function(scene,lineObj){
		var link = new CustomLink(lineObj,scene);
		link.id = lineObj.id;
		link.type = "dependence";
		scene.add(link);
		this.showLineData(link);
		this.loadNetPorts({node:link});
	}
	customNephogram.formatCloud = function(scene,nodes,saveObj,noaction){
		var cloudObj = {};
		
		cloudObj._id = saveObj.id ? saveObj.id : topoUtil.guid();
		cloudObj._name = saveObj.name;

		var box = topoUtil.getSquareBox(nodes);
		cloudObj._x = (saveObj.x?saveObj.x:(Number(box.x)+Number(box.width)/2));
		cloudObj._y = (saveObj.y?saveObj.y:(Number(box.y)+Number(box.height)/2));
		cloudObj._desc = saveObj.desc;
		cloudObj._cloudcolor = saveObj.cloudcolor;
		!saveObj.goTopo && (saveObj.goTopo = "");
		cloudObj._goTopo = saveObj.goTopo;

		var cloudNode = new customNephogram(cloudObj);
		cloudNode.containerId = saveObj.containerId;
		cloudNode.type = "cloudNode";
		cloudNode.id = cloudObj._id;
		if(		cloudNode.cloudcolor == "white" || 
			cloudNode.cloudcolor == undefined ||
			cloudNode.cloudcolor == "undefined")
			cloudNode.setImage("/img/topo/new/cloud/cloud.png");
		else 
			cloudNode.setImage("/img/topo/new/cloud/"+cloudNode.cloudcolor+"cloud.png");
		
		that = this;
		if(!noaction){
			cloudNode.dbclick(function(){
				that.cloudArray.push(this)
				that.removeCloud(scene,this);
			});
		}else {
			cloudNode.showSelected = false;
			cloudNode.dragable = false;
			cloudNode.fontColor = '255,255,255';
		}

		scene.add(cloudNode);
		var lines = scene.findElements(function (a){
			return a.type == "dependence";
		});
		cloudNode._nodes = new Array();
		cloudNode._lines = new Array();
		function checkInCloud(startId,endId,nodes){
			var length = 0;
			for(var i=0;i<nodes.length;i++){
				if(startId == nodes[i].id ){
					length = length +1;
				}
				else if(endId == nodes[i].id ){
					length = length +1;
				}
				if(length >= 2)
					return true;
			}
			return false;
		}
		function chechHaveLink(id,links){
			for(var i=0;i<links.length;i++){
				if(links[i].id == id)
					return true;
			}
			return false;
		}
		function putInArray(arry,obj){
			var i=0;
			for(;i<arry.length;i++)
			{
				if(arry[i].id == obj.id){
					return;
				}
			}
			arry[i] = obj;
		}
		for(var i=0;i<nodes.length;i++){
			var index = 0;
			for(var j=0;j<lines.length;j++){
				var ids = lines[j].id.split("::");
				var lineObj = $.extend({},lines[j].lineObj);
				!ids[2] && (ids[2] = index);
				index = index+1;

				if(checkInCloud(ids[0],ids[1],nodes) == true){
					if(chechHaveLink(lines[j].id,cloudNode._lines) == false){
						cloudNode._lines.push(lines[j]);
						scene.remove(lines[j]);
					}
					continue;
				}

				if(ids[0] == nodes[i].id || ids[1] == nodes[i].id)
				{
					if(ids[0] == nodes[i].id){
						lineObj.id = cloudNode.id+"::"+ids[1]+"::"+ids[2];
						lineObj._startId = cloudNode.id;
						lineObj._endId = ids[1];
					}
					else if(ids[1] == nodes[i].id){
						lineObj.id = ids[0]+"::"+cloudNode.id+"::"+ids[2];
						lineObj._startId = ids[0];
						lineObj._endId = cloudNode.id;
					}
					var createLinkState = true;
					for(var l=0;l<cloudNode._lines.length;l++)
					{
						if(cloudNode._lines[l].newId){
							if(cloudNode._lines[l].newId.indexOf(ids[0]+"::"+cloudNode.id)!=-1 || 
								cloudNode._lines[l].newId.indexOf(cloudNode.id+"::"+ids[1])!=-1)
							{
								createLinkState = false;
								break;
							}
						}
					}
					if(createLinkState == true)
						this.createLink(scene,lineObj);
					lines[j].newId = lineObj.id;
					cloudNode._lines.push(lines[j]);
					scene.remove(lines[j]);
				}
			}
		}
		if(!cloudNode._redLine)
			cloudNode._redLine = new Array();
		if(!cloudNode._yelLine)
			cloudNode._yelLine = new Array();
		for(var i=0;i<cloudNode._lines.length;i++)
		{
			if(saveObj.isShow)
			{
				if(cloudNode._lines[i].lineObj._color == "red"){
					putInArray(cloudNode._redLine,cloudNode._lines[i]);
				}
				else if(cloudNode._lines[i].lineObj._color == "yellow"){
					putInArray(cloudNode._yelLine,cloudNode._lines[i]);
				}
			}
		}
		for(var i=0;i<nodes.length;i++){
			cloudNode._nodes.push(nodes[i]);
			customNephogram.removeFromGroup(nodes[i],scene);
			scene.remove(nodes[i]);
		}
		if(saveObj.isShow && (cloudNode._redLine || cloudNode._yelLine))
		{
			cloudNode.isShow = true;
			if(cloudNode._redLine.length > 0)
			{
				cloudNode.setImage("/img/topo/new/cloud/redcloud.png");
			}
			else if(cloudNode._yelLine.length > 0){
				cloudNode.setImage("/img/topo/new/cloud/yellowcloud.png");
			}
			// cloudNode.addEventListener('mouseover',function (event){
			// 	var div = $('<div id="tip_div" class="pabs" style="top:'+(event.pageY+20)+'px;left:'+(event.pageX+20)+'px;background-color:#FFF8DC;padding:5px;border-radius:5px;"></div>');
			// 	if(this._redLine)
			// 	{
			// 		for(var i=0;i<this._redLine.length;i++)
			// 		{
			// 			var form_group = $('<div class="form-group" style="margin:0;"></div>');
			// 			var label_name = $('<label >'+this._redLine[i].desc+'</label>');
			// 			form_group.append(label_name);
			// 			div.append(form_group);
			// 		}
			// 	}
			// 	if(this._yelLine)
			// 	{
			// 		for(var i=0;i<this._yelLine.length;i++)
			// 		{
			// 			var form_group = $('<div class="form-group" style="margin:0;"></div>');
			// 			var label_name = $('<label >'+this._yelLine[i].desc+'</label>');
			// 			form_group.append(label_name);
			// 			div.append(form_group);
			// 		}
			// 	}

			// 	$('#content_div').append(div);
			// });
			// cloudNode.addEventListener('mouseout',function (event){
			// 	$('#content_div').find('#tip_div').remove();
			// });
		}
		cloudNode.addToGroup(scene);
		return cloudNode;
	}

	customNephogram.loadNetPorts = function(){

	}
	customNephogram.showLineData = function(link){

	}
	//清除全部云节点数据
	customNephogram.clearCloud = function(scene){
		//删除连接云节点的连线
		var lines = scene.findElements(function (a){
			var id = ""+a.id;
			return id.indexOf("cloud") != -1 && a.type == "dependence";
		});
		for(var i=0;i<lines.length;i++){
			scene.remove(lines[i]);
		}
		//先反向全删除
		var cloudNodes = scene.findElements(function (a){
			return a.type == "cloudNode";
		});
		for(var i=0;i<cloudNodes.length;i++){
			this.backUpNode(scene, cloudNodes[i]);
		}
		for(var i=0;i<cloudNodes.length;i++){
			this.backUpLink(scene, cloudNodes[i]);
		}
		for(var i=0;i<cloudNodes.length;i++){
			scene.remove(cloudNodes[i]);
		}
	}
	// 删除云节点
	customNephogram.removeCloud = function(scene,cloudNode,model){
		//删除连接云节点的连线
		var lines = scene.findElements(function (a){
			var id = ""+a.id;
			return id.indexOf(cloudNode.id+"::") != -1 || id.indexOf("::"+cloudNode.id) != -1;
		});
		for(var i=0;i<lines.length;i++){
			scene.remove(lines[i]);
		}
		//先反向全删除
		var cloudNodes = scene.findElements(function (a){
			return a.type == "cloudNode";
		});
		this.backUpNode(scene, cloudNode);
		for(var i=0;i<cloudNodes.length;i++){
			if(cloudNode.id != cloudNodes[i].id)
			this.backUpNode(scene, cloudNodes[i]);
		}
		for(var i=0;i<cloudNodes.length;i++){
			if(cloudNode.id != cloudNodes[i].id)
			this.backUpLink(scene, cloudNodes[i]);
		}
		this.backUpLink(scene, cloudNode);
		
		//删除云节点
		scene.remove(cloudNode);
		for(var i=0;i<cloudNodes.length;i++){
			cloudNodes[i].removeFromGroup(scene);
			scene.remove(cloudNodes[i]);
		}
		//创建云节点
		for(var i=0;i<cloudNodes.length;i++){
			if(cloudNode.id != cloudNodes[i].id){
				this.formatCloud(scene,cloudNodes[i]._nodes,cloudNodes[i]);
			}
		}
	}
	customNephogram.prototype.removeFromGroup = function (scene){
		var containerId = this.containerId;
		if(containerId){
			var group = scene.findElements(function (a){
				return a.id == containerId
			})[0]
			if(group){
				group.remove(this);
			}
		}
	}
	customNephogram.removeFromGroup = function (node,scene){
		var containerId = node.containerId;
		if(containerId){
			var group = scene.findElements(function (a){
				return a.id == containerId
			})[0]
			if(group){
				group.remove(node);
			}
		}
	}
	customNephogram.prototype.addToGroup = function (scene){
		var containerId = this.containerId;
		if(containerId){
			var group = scene.findElements(function (a){
				return a.id == containerId
			})[0]
			if(group){
				group.add(this);
			}
		}
	}
	customNephogram.addToGroup = function (node,scene){
		var containerId = node.containerId;
		if(containerId){
			var group = scene.findElements(function (a){
				return a.id == containerId
			})[0]
			if(group){
				group.add(node);
			}
		}
	}
	//还原节点
	customNephogram.backUpNode = function(scene,cloudNode){
		for(var i=0;i<cloudNode._nodes.length;i++){
			scene.add(cloudNode._nodes[i]);
			customNephogram.addToGroup(cloudNode._nodes[i],scene)
		}
	}
	//还原连线
	customNephogram.backUpLink = function(scene,cloudNode){
		for(var i=0;i<cloudNode._lines.length;i++){
			this.createLink(scene, cloudNode._lines[i].lineObj);
		}
	}

	customNephogram.getCloud = function (node){
		var cloudNodes = this.cloudArray;
		for(var i=0;i<cloudNodes.length;i++){
			for(var j=0;j<cloudNodes[i]._nodes.length;j++){
				if(cloudNodes[i]._nodes[j].id == node.id){
					return cloudNodes[i];
				}
			}
		}
		return null;
	}

	customNephogram.formatCloudByCloudObj = function(scene,cloudObj,noaction){
		var nodes = new Array();
		if(cloudObj.node instanceof Array){
			for(var i=0;i<cloudObj.node.length;i++){
				nodes[i] = scene.findElements(function (a){
					return a.id == cloudObj.node[i]._refId;
				})[0];
			}
		}
		else
			nodes[0] = scene.findElements(function (a){
				return a.id == cloudObj.node._refId;
			})[0];
		var saveObj = {};
		saveObj.id = cloudObj._id;
		saveObj.name = cloudObj._name;
		saveObj.desc = cloudObj._desc;
		saveObj.cloudcolor = cloudObj._cloudcolor;
		saveObj.goTopo = cloudObj._goTopo;

		saveObj.x = cloudObj._x;
		saveObj.y = cloudObj._y;
		saveObj.isShow = true;
		this.formatCloud(scene,nodes,saveObj,noaction);
	}
	customNephogram.getCloudData = function (scene){
		var nephogramStr = "";
		var cloudNodes = scene.findElements(function (a){
			return a.type == "cloudNode";
		});
		cloudNodes = cloudNodes.concat(this.cloudArray);
		if(!cloudNodes)
			return {nephogramStr:"",cloudNodes:new Array()};

		for(var i=0;i<cloudNodes.length;i++){
			nephogramStr += cloudNodes[i].serialize();
		}
		this.clearCloud(scene);
		return {nephogramStr:nephogramStr,cloudNodes:cloudNodes};
	}

	customNephogram.prototype.serialize = function (){
		var _self = this;
		var node = new Array();
		for(var i=0;i<_self._nodes.length;i++){
			node[i] = {_refId:_self._nodes[i].id};
		}
		var jsonObj = {
			nephogram : {
				_id : _self.id,
				_name : _self.name,
				_x : _self.x,
				_y : _self.y,
				_width : _self.width,
				_height : _self.height,
				_desc : _self.desc,
				_cloudcolor : _self.cloudcolor,
				_goTopo : _self.goTopo,
				node : node
			}
		};
		if(jsonObj.nephogram._cloudcolor == undefined || 
				jsonObj.nephogram._cloudcolor == 'undefined'){
			jsonObj.nephogram._cloudcolor = "white";
		}
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}
	customNephogram.prototype.deserialize = function (jsonObj){
		this.x = Number(jsonObj._x);
		this.y = Number(jsonObj._y);
		this.width = jsonObj._width?Number(jsonObj._width):40;
		this.height = jsonObj._height?Number(jsonObj._height):40;
		this.id = jsonObj._id ? jsonObj._id : topoUtil.guid();
		this.name = jsonObj._name;
		this.text = jsonObj._name;
		this.fontColor = '0,0,0';
		this.desc = jsonObj._desc;
		this.cloudcolor = jsonObj._cloudcolor;
		this.goTopo = jsonObj._goTopo;
		this.node = jsonObj.node;

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	customNephogram.prototype.bindAction = function (key){
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
	var eventActionMap = {}
	customNephogram.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}

	return customNephogram;
	
});
