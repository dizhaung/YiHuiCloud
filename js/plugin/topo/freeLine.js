define(['jtopo','/js/lib/Json2xml.js','/js/plugin/topo/topo_util.js'],function (jtopo,Json2xml,topoUtil){

	var scene;
	var json2xml = new Json2xml();

	var FreeLine = function (jsonObj){
		this.startNode = new JTopo.Node();
		this.startNode.setLocation(Number(jsonObj._startX),Number(jsonObj._startY));
		this.startNode.setSize(4,4);
		this.endNode = new JTopo.Node();
		this.endNode.setLocation(Number(jsonObj._endX),Number(jsonObj._endY));
		this.endNode.setSize(4,4);

		this.line;
		if(jsonObj._type == 'Free_Link'){
			this.line = new JTopo.Link(this.startNode,this.endNode);
		}else if(jsonObj._type == 'Free_FoldLink'){
			this.line = new JTopo.FoldLink(this.startNode,this.endNode);
		}else if(jsonObj._type == 'Free_FlexionalLink'){
			this.line = new JTopo.SquarelyFlexionalLink(this.startNode,this.endNode);
		}else {
			this.line = new JTopo.Link(this.startNode,this.endNode);
		}
		
		this.line.id = jsonObj._id ? jsonObj._id : topoUtil.guid();
		this.line.type = jsonObj._type ? jsonObj._type : 'Link';
		this.line.name = jsonObj._name ? jsonObj._name : '';

		this.line.lineWidth = jsonObj._lineWidth ? Number(jsonObj._lineWidth) : 1;
		this.line.strokeColor = jsonObj._strokeColor ? jsonObj._strokeColor : '105, 109, 244';
		this.line.alpha = jsonObj._alpha ? Number(jsonObj._alpha) : 1;
		this.line.direction = jsonObj._direction ? jsonObj._direction : 'horizontal';
		this.line.offsetGap = jsonObj._offsetGap ? Number(jsonObj._offsetGap) : 100;
		
		this.line.arrowsRadius = jsonObj._arrowsRadius != 0 ? Number(jsonObj._arrowsRadius) : null;
		this.line.dashedPattern = jsonObj._dashedPattern != 0 ? Number(jsonObj._dashedPattern) : null;

		this.line.pro = this;

		for(var key in eventActionMap){
			this.bindAction(key)
		}
	}
	
	FreeLine.createFreeLine = function(obj){
		$.ajax({
			type : "GET",
			url : "module/monitor_info/topo_manage_topo2_tpl.html",
			success : function (data){
				var title = obj && obj.node ? '修改自由线段' : '新增自由线段';
				g_dialog.dialog($(data).find("#link_type_info"),{
					width : "600px",
					title : title,
					init : init,
					saveclick : save_click,
					autoHeight : true
				});
				var newcolor;
				function init(el){
					el.find('form').append('<div class="form-group">\
						<label class="col-lg-2 control-label">虚线间隔</label>\
						<div class="col-lg-10">\
							<input type="number" data-id="dashedPattern" class="form-control input-sm" value="0">\
						</div>\
					</div>');
					el.find('form').append('<div class="form-group">\
						<label class="col-lg-2 control-label">显示箭头</label>\
						<div class="col-lg-10">\
							<input type="number" data-id="arrowsRadius" class="form-control input-sm" value="0">\
						</div>\
					</div>');

					el.find('[name=link_type]').click(function (){
						if($(this).val() == '1'){
							el.find('.flod_attr1').hide();
							el.find('.flod_attr2').hide();
							el.find('.flod_attr1').find('input').prop('disabled',true)
							el.find('.flod_attr2').find('input').prop('disabled',true)
						}else if($(this).val() == '0'){
							el.find('.flod_attr1').show();
							el.find('.flod_attr2').hide();
							el.find('.flod_attr1').find('input').prop('disabled',false)
							el.find('.flod_attr2').find('input').prop('disabled',true)
						}else if($(this).val() == '2'){
							el.find('.flod_attr1').show();
							el.find('.flod_attr2').show();
							el.find('.flod_attr1').find('input').prop('disabled',false)
							el.find('.flod_attr2').find('input').prop('disabled',false)
						}
					})
					var oldcolor = "RGBA(105, 109, 244, 1)";
					if(obj && obj.node){
						el.find('input[data-id=dashedPattern]').val(obj.node.dashedPattern || 0);
						el.find('input[data-id=arrowsRadius]').val(obj.node.arrowsRadius || 0);
						if(obj.node instanceof JTopo.FoldLink){
							el.find('input[value=0]').click();
						}else if(obj.node instanceof JTopo.SquarelyFlexionalLink){
							el.find('input[value=2]').click();
						}else if(obj.node instanceof JTopo.Link){
							el.find('input[value=1]').click();
						}

						obj.node.direction && el.find('input[name=fold_link_type][value='+obj.node.direction+']').click();
						obj.node.offsetGap && el.find('input[data-id=offsetGap]').val(obj.node.offsetGap);
						obj.node.lineWidth && el.find('select[data-id=lineWidth]').val(obj.node.lineWidth);
						oldcolor = "RGBA("+obj.node.strokeColor + ',' + obj.node.alpha +")";
					}else {
						el.find('input[value=1]').click();
					}

					require(['/js/lib/spectrum/spectrum.js',
						'css!/js/lib/spectrum/spectrum.css',
						],function (){
							el.find('[data-id=color]').spectrum({
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
					if( !(obj && obj.node) ){//新建
						var jsonObj = {};
						jsonObj._id = topoUtil.guid();
						if(saveObj.link_type == '1'){
							jsonObj._type = 'Free_Link'
						}else if(saveObj.link_type == '0'){
							jsonObj._type = 'Free_FoldLink'
						}else if(saveObj.link_type == '2'){
							jsonObj._type = 'Free_FlexionalLink'
						}
						jsonObj._name = '';
						jsonObj._lineWidth = saveObj.lineWidth;
						jsonObj._strokeColor = newcolor ? newcolor.r + ',' + newcolor.g + ',' + newcolor.b : '105, 109, 244';
						jsonObj._alpha = newcolor ? newcolor.a : 1;
						jsonObj._direction = saveObj.fold_link_type;
						jsonObj._offsetGap = saveObj.offsetGap;
						jsonObj._arrowsRadius = saveObj.arrowsRadius;
						jsonObj._dashedPattern = saveObj.dashedPattern;

						jsonObj._startX = 100 - scene.translateX;
						jsonObj._startY = 100 - scene.translateY;
						jsonObj._endX = 200 - scene.translateX;
						jsonObj._endY = 200 - scene.translateY;
						var freeLine = new FreeLine(jsonObj,scene);
						scene.add(freeLine.startNode);
						scene.add(freeLine.endNode);
						scene.add(freeLine.line);
					}else {//修改
						//判断连线类型是否变化
						if(saveObj.link_type == '1' && obj.node.type == 'Free_Link'
							|| saveObj.link_type == '0' && obj.node.type == 'Free_FoldLink'
							|| saveObj.link_type == '2' && obj.node.type == 'Free_FlexionalLink' ){//类型没变化
							newcolor && (obj.node.strokeColor = newcolor.r + ',' + newcolor.g + ',' + newcolor.b,obj.node.alpha = newcolor.a);
							if(saveObj.link_type == '1'){
								obj.node.lineWidth = Number(saveObj.lineWidth);
							}else if(saveObj.link_type == '0'){
								obj.node.lineWidth = Number(saveObj.lineWidth);
								obj.node.direction = saveObj.fold_link_type;
							}else if(saveObj.link_type == '2'){
								obj.node.lineWidth = Number(saveObj.lineWidth);
								obj.node.direction = saveObj.fold_link_type;
								obj.node.offsetGap = Number(saveObj.offsetGap);
							}
						}else{//类型变化了
							var xmlstr = obj.node.pro.serialize();
							var json = json2xml.xml_str2json(xmlstr)
							var line = json.freeLine;
							if(saveObj.link_type == '1'){
								line._type = 'Free_Link';
							}else if(saveObj.link_type == '0'){
								line._type = 'Free_FoldLink';
							}else if(saveObj.link_type == '2'){
								line._type = 'Free_FlexionalLink';
							}
							var link = new FreeLine(line,scene);
							scene.remove(obj.node);
							scene.remove(obj.node.pro.startNode);
							scene.remove(obj.node.pro.endNode);
							obj.node = link.line;
							scene.add(obj.node.pro.startNode);
							scene.add(obj.node.pro.endNode);
							scene.add(obj.node);
							newcolor && (obj.node.strokeColor = newcolor.r + ',' + newcolor.g + ',' + newcolor.b,obj.node.alpha = newcolor.a);
							if(saveObj.link_type == '1'){
								obj.node.lineWidth = Number(saveObj.lineWidth);
							}else if(saveObj.link_type == '0'){
								obj.node.lineWidth = Number(saveObj.lineWidth);
								obj.node.direction = saveObj.fold_link_type;
							}else if(saveObj.link_type == '2'){
								obj.node.lineWidth = Number(saveObj.lineWidth);
								obj.node.direction = saveObj.fold_link_type;
								obj.node.offsetGap = Number(saveObj.offsetGap);
							}
						}

						obj.node.dashedPattern = saveObj.dashedPattern == 0 ? null : Number(saveObj.dashedPattern);
						obj.node.arrowsRadius = saveObj.arrowsRadius == 0 ? null : Number(saveObj.arrowsRadius);
					}

					g_dialog.hide(el);
				}
			}
		});
	}
	
	FreeLine.commonActionInit = function (scenep,currentObj){
		scene = scenep;
		FreeLine.setPrototypeEventAction('rightmouseup',rightClick);
		function rightClick(obj){
			var event = obj.event;
			$("#free_line_menu").css({
				top: event.pageY,
				left: event.pageX
			}).show().focus().blur(function (){
				$(this).hide();
				currentObj = undefined;
			});
			currentObj = obj;
		}
		$('#content_div').find('#free_line_menu').remove();
		$('#content_div').append('\
			<ul id="free_line_menu" class="contextmenu" style="display:none;z-index: 10;" tabindex="999">\
			<li><a>更改属性</a></li>\
			<li><a>删除线段</a></li>\
			</ul>\
			');
		$("#free_line_menu a").click(function (){
			var text = $(this).text();
			if(text == "更改属性"){
				FreeLine.createFreeLine(currentObj);
			}else if(text == "删除线段"){
				var localCuttrntObj = $.extend(true,{},currentObj);
				g_dialog.operateConfirm("确认删除?",{
					title : "确认删除",
					saveclick : function (){
						scene.remove(localCuttrntObj.node);
						scene.remove(localCuttrntObj.node.nodeA);
						scene.remove(localCuttrntObj.node.nodeZ);
					}
				});
			}
			$('#free_line_menu').hide();
		});
	}

	FreeLine.prototype.serialize = function (){
		var _self = this.line;
		var jsonObj = {
			freeLine : {
				_id : _self.id,
				_name : _self.name,
				_type : _self.type,

				_lineWidth : _self.lineWidth,
				_strokeColor : _self.strokeColor,
				_alpha : _self.alpha,
				_direction : _self.direction,
				_offsetGap : _self.offsetGap,

				_arrowsRadius : _self.arrowsRadius || '',
				_dashedPattern : _self.dashedPattern || '',

				_startX : this.startNode.x,
				_startY : this.startNode.y,
				_endX : this.endNode.x,
				_endY : this.endNode.y
			}
		};
		var resultXml_str = json2xml.json2xml_str(jsonObj);
		return resultXml_str;
	}

	var eventActionMap = {}
	FreeLine.setPrototypeEventAction = function (eventType,action){
		eventActionMap[eventType] = action;
	}
	FreeLine.prototype.bindAction = function (key){
		var that = this;
		if(key == 'rightmouseup'){
			this.line.addEventListener('mouseup',function(event){
				if(3 == event.which)
				{
					eventActionMap[key]({event : event, node : that.line});
				}
			});
		}else {
			this.line.addEventListener(key,function(event){
				eventActionMap[key]({event : event, node : that.line});
			});
		}
	}

	return FreeLine;
	
});
