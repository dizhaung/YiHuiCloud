define(['jtopo',
	'/js/lib/Json2xml.js',
	'abPanel',
	'/js/plugin/topo/topo_util.js'],function (jtopo,
		Json2xml,
		abPanel,
		topoUtil){

	var customContainer = function (jsonObj,scene,noaction){
		this.container = new JTopo.Container();
		noaction && (this.container.dragable = false,this.container.childDragble = false,this.container.showSelected = false);
		this.deserialize(jsonObj,scene);
		this.container.pro = this;
	}

	var containerDefault = {
		id : '',
		fillColor : "106,157,243",
		borderRadius : 0,
		borderWidth : 0,
		borderColor : '255,255,255',
		dashedPattern : 0,
		alpha : 0.2,
		text : '',
		fontSize : '12px Consolas',
		fontColor : '255,255,255',
		textPosition : 'Bottom_Center',
		_cids : ''
	};

	customContainer.generate = function (scene){
		if(scene.selectedElements.length == 0){
			g_dialog.operateAlert(null,'未选中任何节点','error');
			return false;
		}
		g_dialog.operateConfirm('确认选中节点分为一组？',{saveclick : function (){
			var containers = scene.getElementsByClass(customContainer);
			var nodes = scene.selectedElements;
			nodes = nodes.filter(function (item){
				if(item instanceof JTopo.Node){
					return true;
				}else {
					return false;
				}
			})
			if(nodes.length == 0){
				g_dialog.operateAlert(null,'未选中任何节点');
				return false;
			}
			for(var i=0;i<containers.length;i++){
				for(var j=0;j<containers[i].childs.length;j++){
					for(var k=0;k<nodes.length;k++){
						if(nodes[k].id == containers[i].childs[j].id){
							g_dialog.operateAlert(null,'选取的节点中存在其它分组的节点，不能添加');
							return false;
						}
					}
				}
			}
			var cids = nodes.map(function (item){
				return item.id;
			}).join(',')
			var json = {cids : cids};
			var container = new customContainer(json,scene);
			scene.add(container.container);
		}})
	}

	customContainer.commonActionInit = function (scene,currentObj){
		customContainer.setPrototypeEventAction('rightmouseup',containerRightClick);
		function containerRightClick(obj){
			var event = obj.event;
			$("#link_menu").hide();
			$("#node_menu").hide();
			$("#container_menu").css({
				top: event.pageY,
				left: event.pageX
			}).show().focus().blur(function (){
				$(this).hide();
				currentObj = undefined;
			});
			currentObj = obj;
		}
		$('#content_div').find('#container_menu').remove();
		$('#content_div').append('\
			<ul id="container_menu" class="contextmenu rightmenu" style="display:none;" tabindex="999">\
			<li><a>更改属性</a></li>\
			<li><a>增删节点</a></li>\
			<li><a>删除容器</a></li>\
			</ul>\
			');
		$("#container_menu a").click(function (){
			var text = $(this).text();
			if(text == "更改属性"){
				containerInfo(currentObj);
			}else if(text == "增删节点"){
				containerDealNode(currentObj);
			}else if(text == "删除容器"){
				var localCuttrntObj = $.extend({},currentObj);
				g_dialog.operateConfirm("确认删除该容器?",{
					title : "确认删除",
					saveclick : deleteNode
				});
				function deleteNode(){
					scene.remove(localCuttrntObj.node);
					currentObj = undefined;
				}
			}
			$('#container_menu').hide();
		});
		function containerInfo(obj){
			$.ajax({
				type : "GET",
				url : "module/monitor_info/topo_manage_topo2_tpl.html",
				success : function (data){
					g_dialog.dialog($(data).find("[id=modifygroup]"),{
						width:"580px",
						title:"分组操作",
						init:init,
						saveclick:save_click,
						autoHeight: true
					});
					var fillColor,borderColor,fontColor;
					function init(el){
						el.find('[data-id=borderWidth]').val(obj.node.borderWidth);
						el.find('[data-id=dashedPattern]').val(obj.node.dashedPattern);
						el.find('[data-id=borderRadius]').val(obj.node.borderRadius);
						el.find('[data-id=text]').val(obj.node.text);
						obj.node.textPosition && el.find('input[type=radio][value='+obj.node.textPosition+']').click()
						obj.node.fontSize && el.find('[data-id=fontSize]').val(obj.node.fontSize);

						var fillColorStr = "RGBA(" + obj.node.fillColor + "," + obj.node.alpha + ")";
						var borderColorStr = "RGBA(" + obj.node.borderColor + "," + obj.node.borderAlpha + ")";
						var fontColorStr = "RGBA(" + obj.node.fontColor + "," + obj.node.fontAlpha + ")";
						require(['/js/lib/spectrum/spectrum.js',
							'css!/js/lib/spectrum/spectrum.css',
							],function (){
								el.find('[data-id=fillColor]').spectrum({
									color : fillColorStr,
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
									change: updateFillColor,
									move: updateFillColor
								});
								function updateFillColor(color) {
									fillColor = color.toRgb();
								}
								el.find('[data-id=borderColor]').spectrum({
									color : borderColorStr,
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
									change: updateBorderColor,
									move: updateBorderColor
								});
								function updateBorderColor(color) {
									borderColor = color.toRgb();
								}
								el.find('[data-id=fontColor]').spectrum({
									color : fontColorStr,
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
									change: updateFontColor,
									move: updateFontColor
								});
								function updateFontColor(color) {
									fontColor = color.toRgb();
								}
							});
					}
					function save_click(el,saveObj){
						obj.node.borderWidth = Number(saveObj.borderWidth);
						obj.node.dashedPattern = Number(saveObj.dashedPattern);
						obj.node.borderRadius = Number(saveObj.borderRadius);
						obj.node.fontSize = Number(saveObj.fontSize);
						obj.node.textPosition = saveObj.textPosition;
						obj.node.text = saveObj.text;
						obj.node.fontFamily = 'Consolas';
						obj.node.font = obj.node.fontSize + "px " + obj.node.fontFamily;

						fillColor && (obj.node.fillColor = fillColor.r + ',' + fillColor.g + ',' + fillColor.b , obj.node.alpha = fillColor.a);
						borderColor && (obj.node.borderColor = borderColor.r + ',' + borderColor.g + ',' + borderColor.b , obj.node.borderAlpha = borderColor.a);
						fontColor && (obj.node.fontColor = fontColor.r + ',' + fontColor.g + ',' + fontColor.b , obj.node.fontAlpha = fontColor.a);

						g_dialog.hide(el);
					}
				}
			});
		}
		function containerDealNode(obj){
			$.ajax({
				type : "GET",
				url : "module/monitor_info/topo_manage_topo2_tpl.html",
				success : function (data){
					g_dialog.dialog($(data).find("[id=manage_node_for_group]"),{
						width:"580px",
						title:"分组操作",
						init:init,
						saveclick:save_click,
						autoHeight:true
					});

					function init(el){
						var innodes = obj.node.childs;
						innodes = innodes.map(function (item){
							return {
								value : item.id,
								text : item.text
							}
						})
						var allNode = scene.getAllNodes();
						var containers = scene.getElementsByClass(JTopo.Container);
						var noContainerNode = allNode.filter(function (item){
							for(var i=0;i<containers.length;i++){
								var containerItem = containers[i];
								for(var j=0;j<containerItem.childs.length;j++){
									if(containerItem.childs[j].id == item.id){
										return false;
									}
								}
							}
							return true;
						})
						var outnodes = noContainerNode;
						outnodes = outnodes.map(function (item){
							return {
								value : item.id,
								text : item.text
							}
						})
						abPanel.render(el.find(".centent") ,{
							left_data:outnodes,
							right_data:innodes
						});
					}
					function save_click(el,saveObj){
						var dataArray = abPanel.getValue(el.find(".centent"));
						obj.node.removeAll();
						for(var i=0;i<dataArray.length;i++){
							var nodeItem = scene.findElements(function (item){
								return item.id == dataArray[i];
							})[0]
							nodeItem && obj.node.add(nodeItem);
							nodeItem && (nodeItem.containerId = obj.node.id);
						}
						g_dialog.hide(el);
					}
				}
			});
		}
	}

	customContainer.serialize = function (_self){
		var jsonObj = {
			container : {
				id : _self.id,
				fillColor : _self.fillColor,
				borderRadius : _self.borderRadius,
				borderWidth : _self.borderWidth,
				borderColor : _self.borderColor,
				borderAlpha : _self.borderAlpha,
				dashedPattern : _self.dashedPattern,
				alpha : _self.alpha,
				text : _self.text,
				fontSize : _self.fontSize,
				fontColor : _self.fontColor,
				fontAlpha : _self.fontAlpha,
				textPosition : _self.textPosition,
				cids : _self.childs.map(function (item){return item.id;}).join()
			}
		};
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}

	customContainer.prototype.serialize = function (){
		var _self = this.container;
		var jsonObj = {
			container : {
				id : _self.id,
				fillColor : _self.fillColor,
				borderRadius : _self.borderRadius,
				borderWidth : _self.borderWidth,
				borderColor : _self.borderColor,
				borderAlpha : _self.borderAlpha,
				dashedPattern : _self.dashedPattern,
				alpha : _self.alpha,
				text : _self.text,
				fontSize : _self.fontSize,
				fontColor : _self.fontColor,
				fontAlpha : _self.fontAlpha,
				textPosition : _self.textPosition,
				cids : _self.childs.map(function (item){return item.id;}).join()
			}
		};
		var json2xml2 = new Json2xml();
		var resultXml_str = json2xml2.json2xml_str(jsonObj);
		return resultXml_str;
	}
	customContainer.prototype.deserialize = function (jsonObj,scene){
		for(var key in containerDefault){
			if(jsonObj[key] == null){
				jsonObj[key] = containerDefault[key];
			}
		}
		(jsonObj.id || jsonObj.id===0) ? (this.container.id = jsonObj.id) : (this.container.id = topoUtil.guid());
		(jsonObj.fillColor||jsonObj.fillColor===0) && (this.container.fillColor = jsonObj.fillColor);
		(jsonObj.borderRadius||jsonObj.borderRadius===0) && (this.container.borderRadius = Number(jsonObj.borderRadius) );
		(jsonObj.borderWidth||jsonObj.borderWidth===0) && (this.container.borderWidth = Number(jsonObj.borderWidth) );
		(jsonObj.borderColor||jsonObj.borderColor===0) && (this.container.borderColor = jsonObj.borderColor);
		(jsonObj.borderAlpha||jsonObj.borderAlpha===0) && (this.container.borderAlpha = jsonObj.borderAlpha);
		(jsonObj.dashedPattern||jsonObj.dashedPattern===0) && (this.container.dashedPattern = jsonObj.dashedPattern);
		(jsonObj.alpha||jsonObj.alpha===0) && (this.container.alpha = jsonObj.alpha);
		(jsonObj.text||jsonObj.text===0) && (this.container.text = jsonObj.text);
		(jsonObj.fontSize||jsonObj.fontSize===0) && (this.container.fontSize = jsonObj.fontSize);
		this.container.fontFamily = 'Consolas';
		this.container.font = this.container.fontSize + "px " + this.container.fontFamily;
		(jsonObj.fontColor||jsonObj.fontColor===0) && (this.container.fontColor = jsonObj.fontColor);
		(jsonObj.fontAlpha||jsonObj.fontAlpha===0) && (this.container.fontAlpha = jsonObj.fontAlpha);
		(jsonObj.textPosition||jsonObj.textPosition===0) && (this.container.textPosition = jsonObj.textPosition);
		(jsonObj.cids||jsonObj.cids===0) && (this.container.cids = jsonObj.cids);
		var cids = jsonObj.cids.split(",");
		var nodes = new Array();
		for(var j=0;j<cids.length;j++)
		{

			if(cids[j]=="")
				continue;

			var node = scene.findElements(function (a){
				return a.id == cids[j];
			})[0];

			if(!node ||    
				node.type== "dependence" || 
				node.type== "arrow" || 
				node.type== "layer" ||
				node.type== "line")
				continue;
			if(node)
			{
				nodes.push(node);
			}
		}

		var box = topoUtil.getSquareBox(nodes);

		this.container.padding = box.padding;
		this.container.setLocation(box.x,box.y);

		for(var j=0;j<nodes.length;j++)
		{
			this.container.add(nodes[j]);
			nodes[j].containerId = this.container.id;
		}

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	customContainer.prototype.bindAction = function (key){
		if(key == 'rightmouseup'){
			this.container.addEventListener('mouseup',function(event){
				if(3 == event.which)
				{
					eventActionMap[key]({event : event, node : this});
				}
			});
		}else {
			this.container.addEventListener(key,function(event){
				eventActionMap[key]({event : event, node : this});
			});
		}
	}
	var eventActionMap = {}
	customContainer.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}

	return customContainer;
	
});
