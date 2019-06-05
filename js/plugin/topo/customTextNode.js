define(['jtopo','/js/lib/Json2xml.js','/js/plugin/topo/topo_util.js'],function (jtopo,Json2xml,topoUtil){

	var customTextNode = function (jsonObj){
		this.initialize = function (){
			jsonObj._id && customTextNode.prototype.initialize.apply(this, arguments);
		}
		this.initialize();
		this.deserialize(jsonObj);
	}
	customTextNode.prototype = new JTopo.TextNode();

	var scene = null;
	
	customTextNode.createTextNode = function(obj){
		$.ajax({
			type : "GET",
			url : "module/monitor_info/topo_manage_topo2_tpl.html",
			success : function (data){
				g_dialog.dialog(
					$(data).find("[id=addTextNode]"),
					{
						width:"580px",
						title:"创建/修改文字节点",
						init:init,
						saveclick:save_click
					}
				);
				var newcolor ;
				function init(el){
					if(obj.node){
						$(el).find("input[data-id='name']").val(obj.node.text);
						$(el).find("select[data-id='textsize']").val(obj.node.fontSize);
					}

					el.find('select').select2({width:'100%'});
					el.find('select').trigger('change');
					var fontColor = obj.node? obj.node.fontColor : '154,192,254';
					var alpha = obj.node? obj.node.alpha : 1;
					var oldcolor = "RGBA("+ fontColor + ',' + alpha + ")";
					require(['/js/lib/spectrum/spectrum.js',
						'css!/js/lib/spectrum/spectrum.css',
						],function (){
							el.find('[data-id=textcolor]').spectrum({
								color : oldcolor,
								flat: true,
								showAlpha : true,
								showInput: true,
								containerClassName: "full-spectrum",
								preferredFormat: "rgb",
								showInitial: true,
								showPalette: true,
								showSelectionPalette: true,
								maxPaletteSize: 81,
								localStorageKey: 'spectrum.line',
								showButtons: false,
								change: updateBorders,
								move: updateBorders
							});
							function updateBorders(color) {
								newcolor = color.toRgb();
							}
					});
				}
				function save_click(el,saveObj){
					var tempnode = $.extend(true, {}, obj.node);
					if(!obj.node){
						tempnode.x = 200-scene.translateX;
						tempnode.y = 200-scene.translateY;
					}
					else{
						tempnode.x = obj.node.x;
						tempnode.y = obj.node.y;
					}
					if(!saveObj.name)
						saveObj.name = " ";
					tempnode.name = saveObj.name;
					tempnode.fontSize = saveObj.textsize;
					newcolor ? (tempnode.fontColor = newcolor.r + ',' + newcolor.g + ',' + newcolor.b , tempnode.alpha = newcolor.a): (tempnode.fontColor = '154,192,254',tempnode.alpha = 1.0);
					
					var textObj = {};
					textObj._x = tempnode.x;
					textObj._y = tempnode.y;
					textObj._width = tempnode.width;
					textObj._height = tempnode.height;
					textObj._id = tempnode.id;
					textObj._text = tempnode.name;
					textObj._color = tempnode.fontColor;
					textObj._alpha = tempnode.alpha;
					textObj._fontSize = tempnode.fontSize;
					textObj._fontFamily = tempnode.fontFamily;
					var textNode = new customTextNode(textObj);
					textNode.type = "text";

					if(!!obj.node){
						obj.node.text = tempnode.name;
						obj.node.fontColor = tempnode.fontColor;
						obj.node.alpha = tempnode.alpha;
						!tempnode.fontSize && (tempnode.fontSize = '12');
						!tempnode.fontFamily && (tempnode.fontFamily = 'Consolas');
						obj.node.fontSize = tempnode.fontSize;
						obj.node.fontFamily = tempnode.fontFamily;
						obj.node.font = tempnode.fontSize + "px " + tempnode.fontFamily;
					}else {
						scene.add(textNode);
					}

					g_dialog.hide(el);
				}
			}
		});
	}
	
	customTextNode.commonActionInit = function (scenep,currentObj){
		scene = scenep;
		customTextNode.setPrototypeEventAction('rightmouseup',containerRightClick);
		function containerRightClick(obj){
			var event = obj.event;
			$("#text_menu").css({
				top: event.pageY,
				left: event.pageX
			}).show().focus().blur(function (){
				$(this).hide();
				currentObj = undefined;
			});
			currentObj = obj;
		}
		$('#content_div').find('#text_menu').remove();
		$('#content_div').append('\
			<ul id="text_menu" class="contextmenu" style="display:none;z-index: 10;" tabindex="999">\
			<li><a>更改属性</a></li>\
			<li><a>删除节点</a></li>\
			</ul>\
			');
		$("#text_menu a").click(function (){
			var text = $(this).text();
			if(text == "更改属性"){
				customTextNode.createTextNode(currentObj);
			}else if(text == "删除节点"){
				var localCuttrntObj = $.extend({},currentObj);
				g_dialog.operateConfirm("确认删除?",{
					title : "确认删除",
					saveclick : function (){
						scenep.remove(localCuttrntObj.node);
						currentObj = undefined;
					}
				});
			}
			$('#text_menu').hide();
		});
	}

	customTextNode.prototype.serialize = function (){
		var _self = this;
		var jsonObj = {
			dynText : {
				_id : _self.id,
				_text : _self.text,
				_x : _self.x,
				_y : _self.y,
				_width : _self.width,
				_height : _self.height,
				_color : _self.fontColor,
				_alpha : _self.alpha,
				_borderColor : '',
				_backgroundColor : '',
				_fontSize : _self.fontSize,
				_fontFamily : _self.fontFamily,
				_bold : '',
				_italic : '',
				_underline : '',
				_align : ''
			}
		};
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}
	customTextNode.prototype.deserialize = function (jsonObj){
		this.x = Number(jsonObj._x);
		this.y = Number(jsonObj._y);
		this.width = jsonObj._width?Number(jsonObj._width):40;
		this.height = jsonObj._height?Number(jsonObj._height):40;
		this.id = jsonObj._id ? jsonObj._id : topoUtil.guid();
		this.text = jsonObj._text;
		this.name = jsonObj._text;
		this.fontColor = jsonObj._color;
		jsonObj._alpha ? (this.alpha = Number(jsonObj._alpha)) : (this.alpha = 1);
		!jsonObj._fontSize && (jsonObj._fontSize = '12');
		//新增方便取值
		this.fontSize = jsonObj._fontSize;
		!jsonObj._fontFamily && (jsonObj._fontFamily = 'Consolas');
		//新增方便取值
		this.fontFamily = jsonObj._fontFamily;
		this.font = jsonObj._fontSize + "px " + jsonObj._fontFamily;

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	customTextNode.prototype.bindAction = function (key){
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
	customTextNode.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}

	return customTextNode;
	
});
