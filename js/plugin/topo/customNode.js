/**
	网络拓扑资产节点
*/
define(['jtopo','/js/lib/Json2xml.js'],function (jtopo,Json2xml){

	var customNode = function (jsonObj){
		this.initialize = function (){
			jsonObj._name && customNode.prototype.initialize.apply(this, arguments);
			this.myTopoStyle = true;
			var d = "deviceId,deviceType".split(",");
			this.serializedProperties = this.serializedProperties.concat(d);
		}
		this.initialize();
		this.deserialize(jsonObj);
	}
	customNode.prototype = new JTopo.Node();

	customNode.getDefaultItem = function(obj,i,scene){
		var item = {};
		item._id = obj.edId;
		item._name = obj.assetName;
		item._img = obj.deviceTypeMap;
		item._x = (!obj.x?200+i*100-scene.translateX:obj.x);
		item._y = (!obj.y?200-scene.translateY:obj.y);
		var asset = {};
		asset.id = (obj.edId==undefined?"":obj.edId);
		asset.type = (obj.assetTypeName==undefined?"":obj.assetTypeName);
		asset.name = (obj.assetName==undefined?"":obj.assetName);
		asset.ports={};
		asset.os = {};
		asset.os.id = (obj.osType==undefined?"":obj.osType);
		asset.os.name = (obj.ptName==undefined?"":obj.ptName);
		asset.os.img = (obj.deviceTypeMap==undefined?"":obj.deviceTypeMap);
		asset.ip = obj.mainIp==undefined?"":obj.mainIp;
		asset.bussinessDomainId = (obj.bussinessDomainId==undefined?"":obj.bussinessDomainId);
		asset.bussinessDomainName = (obj.bussinessDomainName==undefined?"":obj.bussinessDomainName);
		asset.businessSystemId = (obj.businessSystemId==undefined?"":obj.businessSystemId);
		asset.businessSystemName = (obj.businessSystemName==undefined?"":obj.businessSystemName);
		asset.securityDomainId = (obj.securityDomainId==undefined?"":obj.securityDomainId);
		asset.securityDomainName = (obj.securityDomainName==undefined?"":obj.securityDomainName);
		item.asset = asset;
		return item;
	}

	customNode.prototype.serialize = function (){
		var _self = this;
		var jsonObj = {
			node : {
				_id : _self.id,
				_name : _self.name,
				_isDeltaInfo : _self.isDeltaInfo,
				_img : _self.img,
				_x : _self.x,
				_y : _self.y,
				_width : _self.width,
				_height : _self.height,
				_type : _self.type,
				_containerId : _self.containerId,
				asset : _self.asset
			}
		};
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}
	customNode.prototype.deserialize = function (jsonObj){
		var _self = this;
		this.x = Number(jsonObj._x);
		this.y = Number(jsonObj._y);
		this.width = jsonObj._width?Number(jsonObj._width):40;
		this.height = jsonObj._height?Number(jsonObj._height):40;
		this.id = Number(jsonObj._id);
		this.isDeltaInfo = Number(jsonObj._isDeltaInfo);
		this.name = jsonObj._name;
		this.text = jsonObj._name;

		jsonObj._containerId && (this.containerId = jsonObj._containerId);
		
		this.img = jsonObj._img;
		!jsonObj._type && (jsonObj._type = "");
		this.type = jsonObj._type;
		this.asset = jsonObj.asset;
		jsonObj._img && this.setImage(jsonObj._img);
		this.fontColor = '255,255,255';
		jsonObj._eventlevel && (this.eventlevel = jsonObj._eventlevel);
		if(!!jsonObj.hideTip){
			return ;
		}

		var overTimeout;

		this.addEventListener('mouseover',function (event){

			var div = $('<div id="tip_div" class="pabs" style="top:'+event.pageY+'px;left:'+event.pageX+'px;background-color:#FFF8DC;padding:5px;border-radius:5px;"></div>');
			var form_group = $('<div class="form-group" style="margin:0;"></div>');
			var label_name = $('<label >设备名称 :</label>');
			var label_value = $('<label >'+this.asset.name+'</label>');

			var form_group1 = $('<div class="form-group" style="margin:0;"></div>');
			var label_name1 = $('<label >设备主IP :</label>');
			var label_value1 = $('<label >'+this.asset.ip+'</label>');

			var form_group2 = $('<div class="form-group" style="margin:0;"></div>');
			var label_name2 = $('<label >业务域 :</label>');
			var label_value2 = $('<label >'+this.asset.bussinessDomainName+'</label>');

			var form_group3 = $('<div class="form-group" style="margin:0;"></div>');
			var label_name3 = $('<label >安全域 :</label>');
			var label_value3 = $('<label >'+this.asset.securityDomainName+'</label>');

			var form_group4 = $('<div class="form-group" style="margin:0;"></div>');
			var label_name4 = $('<label >操作系统 :</label>');
			var label_value4 = $('<label >'+(this.asset.os._name?(this.asset.os._name=='未定义'?'未知':this.asset.os._name):'未知')+'</label>');

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

			div.append(form_group);
			div.append(form_group1);
			div.append(form_group2);
			div.append(form_group3);
			div.append(form_group4);

			overTimeout = setTimeout(function (){
				var parentHeight = $('#content_div').innerHeight();
				var parentWidth = $('#content_div').innerWidth();
				
				$('#content_div').append(div);
				var thisHeight = div.outerHeight();
				var thisWidth = div.outerWidth();

				if(event.pageY + thisHeight >= parentHeight){
					div.css('top',event.pageY - thisHeight)
				}
				if(event.pageX + thisWidth >= parentWidth){
					div.css('left',event.pageX - thisWidth)
				}
			},500);
		});
		this.addEventListener('mouseout',function (event){
			$('#content_div').find('#tip_div').remove();
			clearTimeout(overTimeout)
		});
		this.addEventListener('mousedrag',function (event){
			$('#content_div').find('#tip_div').remove();
			clearTimeout(overTimeout)
		})

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	var eventActionMap = {}
	customNode.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}
	customNode.prototype.bindAction = function (key){
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
	//暂时没用
	customNode.prototype.reloadImg = function(){
		var param = this.img.split("/");
		param[param.length-1] = param[param.length-1].replace("png","svg");
		this.setImage("/img/topo/new/"+param[param.length-1]);
	}
	//暂时没用
	customNode.prototype.loadImg = function(){
		this.setImage(this.img);
	}
	
	return customNode;
});
