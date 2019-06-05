define(['jtopo','/js/lib/Json2xml.js','/js/plugin/topo/topo_util.js'],function (jtopo,Json2xml,topoUtil){

	var monitorNode = function (jsonObj,option){
		this.initialize = function (){
			jsonObj && monitorNode.prototype.initialize.apply(this, arguments);
			this.myTopoStyle = true;
			var d = "deviceId,deviceType".split(",");
			this.serializedProperties = this.serializedProperties.concat(d);
		}
		this.initialize();
		if(!jsonObj){
			jsonObj = this.formatOption(option);
		}
		this.deserialize(jsonObj);
	}
	monitorNode.prototype = new JTopo.Node();

	monitorNode.commonActionInit = function (currentObj,menuArray){
		monitorNode.setPrototypeEventAction('rightmouseup',nodeRightClick);
		function nodeRightClick(obj){
			var event = obj.event;
			$("#node_menu").css({
				top: event.pageY,
				left: event.pageX
			}).show().focus().blur(function (){
				$(this).hide();
				currentObj = undefined;
			});
			currentObj = obj;
		}
		$('#content_div').find('#node_menu').remove();
		var ul = $('<ul id="node_menu" class="contextmenu rightmenu" style="display:none;" tabindex="999"></ul>');
		for(var i=0;i<menuArray.length;i++){
			ul.append('<li><a>'+menuArray[i].text+'</a></li>');
		}
		$('#content_div').append(ul);

		$("#node_menu a").click(function (){
			var text = $(this).text();
			for(var i=0;i<menuArray.length;i++){
				if(menuArray[i].text == text){
					menuArray[i].action(currentObj);
				}
			}
			$('#node_menu').hide();
		});
	}

	var newNumber = 0;

	monitorNode.prototype.formatOption = function (option){
		var json = {};
		json._name = '未命名节点' + (++newNumber);
		json._type = option.type;
		json._width = 40;
		json._height = 40;
		json._monitorType = option.monitorType;
		json._fontColor = '255,255,255';
		json._monitorId = null;
		return json;
	}

	monitorNode.prototype.serialize = function (){
		var _self = this;
		var jsonObj = {
			item : {
				_id : _self.id,
				_name : _self.text,
				_oldname : _self.oldtext,
				_type : _self.type,
				_x : _self.x,
				_y : _self.y,
				_oldX : _self.oldX,
				_oldY : _self.oldY,
				_width : _self.width,
				_height : _self.height,
				_containerId : _self.containerId,
				_fontColor : _self.fontColor,
				_zIndex : _self.zIndex,

				_compId : _self.compId,
				_compName : _self.compName,
				_compType : _self.compType,
				_compTypeC : _self.compTypeC || '',
				_isSelf : _self.isSelf,
				_status : _self.status,
				_systemPerformImpactFactor : _self.systemPerformImpactFactor,
				_dbId : '',
				_author : '',
				_visible : _self.visible,
				_cloudId : _self.cloudId,

				_hiddenDepend : _self.hiddenDepend,
				_bossDisplayType : _self.bossDisplayType,

				_monitorCache : _self.monitorCache || {}
			}
		};
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}
	monitorNode.prototype.deserialize = function (jsonObj){
		var _self = this;
		this.id = jsonObj._id ? jsonObj._id : topoUtil.guid();
		this.dbId = jsonObj._dbId;
		this.text = jsonObj._name;
		this.type = jsonObj._type;
		this.x = Number(jsonObj._x);
		this.y = Number(jsonObj._y);
		this.oldX = this.x;
		this.oldY = this.y;
		this.width = jsonObj._width?Number(jsonObj._width):40;
		this.height = jsonObj._height?Number(jsonObj._height):40;
		jsonObj._fontColor && (this.fontColor = jsonObj._fontColor);
		jsonObj._containerId && (this.containerId = jsonObj._containerId);
		// jsonObj._zIndex && (this.zIndex = Number(jsonObj._zIndex) );
		jsonObj._oldname && (this.oldtext = jsonObj._oldname);

		var option = topoUtil.getNodeTypeOption(jsonObj._type);
		

		this.compId = jsonObj._compId || '';
		this.compName = jsonObj._compName || '';
		this.compType = jsonObj._type;
		this.compTypeC = jsonObj._compTypeC || '';
		this.isSelf = jsonObj._isSelf || 'false';
		this.systemPerformImpactFactor = Number(jsonObj._systemPerformImpactFactor) || 50;
		this.show = jsonObj._visible || 'true';//visible
		this.cloudId = jsonObj._cloudId || '';
		
		this.status = jsonObj._status || 'UNCONFIG';
		this.monitorCache = jsonObj._monitorCache || {};

		this.bossDisplayType = jsonObj._bossDisplayType|| '1';//1:显示 0:不显示 自身显示配置
		this.hiddenDepend = jsonObj._hiddenDepend || '0';//0:显示 1：隐藏 依赖显示配置

		if (!this.compTypeC)
			this.setImage(option.imgurl);
		else
			this.reloadImg();

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	monitorNode.prototype.bindAction = function (key){
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
	monitorNode.prototype.reloadImg = function(){
		this.loadImg();
	}
	monitorNode.prototype.loadImg = function(){
		if(this.type == 'appSystem'){
			this.setImage('/img/draw/appSystem.svg');
			if(this.compId){
				this.status = 'CONFIG'
			}else {
				this.status = 'UNCONFIG'
			}
		}else {
			if(this.compTypeC && this.compId){
				this.setImage('/img/assetmonitor1/'+this.compTypeC + '/'+this.compTypeC+'.svg');
				this.status = 'CONFIG'
			}else {
				this.setImage('/img/draw/'+this.type+'.svg');
				this.status = 'UNCONFIG'
			}
		}
	}
	var eventActionMap = {}
	monitorNode.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}
	return monitorNode;
});
