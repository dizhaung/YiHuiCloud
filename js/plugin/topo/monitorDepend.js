define(['jtopo','/js/lib/Json2xml.js','/js/plugin/topo/topo_util.js'],function (jtopo,Json2xml,topoUtil){

	var monitorDepend = function (jsonObj,scene){
		var startNode = scene.findElements(function (el){
			return el instanceof JTopo.Node && el.id == jsonObj._startId;
		})[0];
		var endNode = scene.findElements(function (el){
			return el instanceof JTopo.Node && el.id == jsonObj._endId;
		})[0];
		if(!startNode || !endNode){
			return null;
		}
		this.depend;
		if(jsonObj._type == 'Link'){
			this.depend = new JTopo.Link(startNode,endNode);
		}else if(jsonObj._type == 'FoldLink'){
			this.depend = new JTopo.FoldLink(startNode,endNode);
		}else if(jsonObj._type == 'FlexionalLink'){
			this.depend = new JTopo.SquarelyFlexionalLink(startNode,endNode);
		}else {
			this.depend = new JTopo.Link(startNode,endNode);
		}
		
		this.depend.id = jsonObj._id ? Number(jsonObj._id) : topoUtil.guid();
		this.depend.type = jsonObj._type ? jsonObj._type : 'Link';
		this.depend.name = jsonObj._name ? jsonObj._name : '';

		this.depend.dependenceType = jsonObj._dependenceType ? jsonObj._dependenceType : 'KEY';//REF
		this.depend.dependenceRatio = jsonObj._dependenceRatio ? jsonObj._dependenceRatio : '80';

		this.depend.lineWidth = jsonObj._lineWidth ? Number(jsonObj._lineWidth) : 1;
		this.depend.strokeColor = jsonObj._strokeColor ? jsonObj._strokeColor : '105, 109, 244';
		this.depend.alpha = jsonObj._alpha ? Number(jsonObj._alpha) : 1;
		this.depend.direction = jsonObj._direction ? jsonObj._direction : 'horizontal';
		this.depend.offsetGap = jsonObj._offsetGap ? Number(jsonObj._offsetGap) : 100;

		this.depend.show = jsonObj._visible ? jsonObj._visible : '1';
		this.depend.arrowsRadius = jsonObj._arrowsRadius ? Number(jsonObj._arrowsRadius) : null;

		this.depend.pro = this;

		if(this.depend.dependenceType == 'REF'){
			this.depend.dashedPattern = 10;
		}else {
			this.depend.dashedPattern = null;
		}

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}

	monitorDepend.commonActionInit = function (currentObj,menuArray){
		monitorDepend.setPrototypeEventAction('rightmouseup',nodeRightClick);
		function nodeRightClick(obj){
			var event = obj.event;
			$("#depend_menu").css({
				top: event.pageY,
				left: event.pageX
			}).show().focus().blur(function (){
				$(this).hide();
				currentObj = undefined;
			});
			currentObj = obj;
		}
		$('#content_div').find('#depend_menu').remove();
		var ul = $('<ul id="depend_menu" class="contextmenu rightmenu" style="display:none;" tabindex="999"></ul>');
		for(var i=0;i<menuArray.length;i++){
			ul.append('<li><a>'+menuArray[i].text+'</a></li>');
		}
		$('#content_div').append(ul);

		$("#depend_menu a").click(function (){
			var text = $(this).text();
			for(var i=0;i<menuArray.length;i++){
				if(menuArray[i].text == text){
					menuArray[i].action(currentObj);
				}
			}
			$('#depend_menu').hide();
		});
	}

	monitorDepend.prototype.serialize = function (){
		var _self = this.depend;
		var jsonObj = {
			dependence : {
				_id : _self.id,
				_name : _self.name,
				_type : _self.type,
				_startId : _self.nodeA.id,
				_endId : _self.nodeZ.id,

				_dependenceType : _self.dependenceType,
				_dependenceRatio : _self.dependenceRatio,

				_lineWidth : _self.lineWidth,
				_strokeColor : _self.strokeColor,
				_alpha : _self.alpha,
				_direction : _self.direction,
				_offsetGap : _self.offsetGap,

				_visible : _self.show,
				_arrowsRadius : _self.arrowsRadius || ''
			}
		};
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}

	monitorDepend.prototype.bindAction = function (key){
		var that = this;
		if(key == 'rightmouseup'){
			this.depend.addEventListener('mouseup',function(event){
				if(3 == event.which)
				{
					eventActionMap[key]({event : event, node : that.depend});
				}
			});
		}else {
			this.depend.addEventListener(key,function(event){
				eventActionMap[key]({event : event, node : that.depend});
			});
		}
	}

	var eventActionMap = {}
	monitorDepend.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}
	return monitorDepend;
});
