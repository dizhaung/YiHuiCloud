/** 
	插件名称  :  inputdrop
	插件功能  :  自定义元素的下拉选择项，可支持下拉树以及下拉列表
	参数      :  
				  方法名  renderTree
				  参数      zNodes
				  方法名  renderSelect
				  参数    {
							data : [{text:1}],
							removeClick : function (){}
				  		  }
*/

define(['tree' ,'validate' ,'timepicker'] ,function (tree ,validate ,timepicker){
	return {
		renderTree:function (el ,zNodes ,opt){
			var self = this
			var id = el.attr("id");
			var __time = new Date().getTime() + Math.floor(Math.random() * Math.floor(100))
			el.attr("d-id" ,__time)
			var height = "150px";
			if (!opt)
			{
				opt = new Object();
			}
			el.data("opt" ,opt)
			opt.height && (height = opt.height);
			if (opt.enableChk == undefined)
			{
				opt.enableChk = true;
			}
			var buffer = [];
			buffer.push('<input type="text" class="form-control input-sm no-write no-event" readonly data-type="input" queryValue>');
			buffer.push('<i class="icon-remove pabs" style="margin-right:0;right:5px;top:7px;font-size:15px;opacity:0;color:rgba(51,51,51,0.5)"></i>')
			buffer.push('<input type="hidden" data-id="'+id+'" search-data="'+id+'" name="'+id+'"/>');
			buffer.push('<div class="inputdrop-content" data-id="content" id="'+__time+'_content" style="height:'+height+';overflow-y:auto;overflow-x:hidden"><ul class="ztree" id="'+new Date().getTime()+'"></ul></div>');
			el.append(buffer.join(""));

			var el_remove_i = el.find("[class*=icon-remove]")

			el.mouseover(function (){
				if (!opt.readonly)
					el_remove_i.css("opacity" ,"1")
				else
					el_remove_i.remove()
			}).mouseleave(function (){
				el_remove_i.css("opacity" ,"0")
			})

			el_remove_i.click(function (e){
				e.stopPropagation()
				self.clearTree(el)
				opt.removeCbf && opt.removeCbf()
			})
			
			tree.renderCheck(el.find("[data-id=content]").find("ul").eq(0),
								{
									inpDiv:el.find("input").eq(0),
									inpHiddenDiv:el.find("input").eq(1),
									zNodes:zNodes,
									enableChk:opt.enableChk,
									enableEdit:opt.enableEdit,
									pId:opt.pId,
									label:opt.label,
									id:opt.id,
									chkboxType: (opt.chkboxType?opt.chkboxType:{ "Y" : "", "N" : "" }),
									aCheckCb:opt.aCheckCb?opt.aCheckCb:function (){},
									noSelectVal : el.attr("no-select"),
									onlyLastChild : opt.onlyLastChild,
									treeClick : opt.treeClick,
									aCheckCb : opt.aCheckCb,
									allowCheckAll : true,
									beforeRemove: opt.beforeRemove
								}
							);
			var treeObj = el.find("[data-id=content]").find("ul").data("tree");

			this.initEvent(el ,opt);

			opt.renderStyle && self.__spanLableInit(el ,opt)

			// 默认展开roota节点
			var rootNode = opt.expandNodeId || "roota";
			opt.rootNode && (rootNode = opt.rootNode);
			var nodes = treeObj.getNodesByParam("id",rootNode, null);
			treeObj.expandNode(nodes[0] ,true ,false);

			!opt.renderStyle && el.css("border" ,"none");
			el.find("input").eq(0).css("border" ,"1px solid #cfdadd");

			opt && opt.position && (this.setPosition(el.find("[data-id=content]") ,opt));

			// 是否有初始化的值
			opt && opt.initVal && (this.setDataTree(el ,opt.initVal));

			opt && opt.contentWidth && (el.find("[data-id=content]").width(opt.contentWidth))

			opt && opt.searchBox && __searchBox_init(el ,el.find("[data-id=content]").find("ul[class*=ztree]") ,zNodes)

			opt && opt.placeholder && el.find("[data-type=input]").attr("placeholder" ,opt.placeholder)

			if (!isNaN(el.attr("noEdit")))
			{
				g_mask.mask(el)
				el.find("input").removeAttr("style")
				el.find(".icon-remove").remove()
			}

			el.attr("required")
					&& el.find("input").eq(0).attr("validate" ,"required");
		},
		addDataTree:function (el ,zNodes){
			var opt = el.data("opt")
			tree.renderCheck(el.find("[data-id=content]").find("ul").eq(0),
								{
									inpDiv:el.find("input").eq(0),
									inpHiddenDiv:el.find("input").eq(1),
									zNodes:zNodes,
									enableChk:opt.enableChk,
									pId:opt.pId,
									label:opt.label,
									id:opt.id,
									chkboxType: (opt.chkboxType?opt.chkboxType:{ "Y" : "", "N" : "" }),
									aCheckCb:opt.aCheckCb?opt.aCheckCb:function (){},
									noSelectVal : el.attr("no-select"),
									onlyLastChild : opt.onlyLastChild,
									treeClick : opt.treeClick,
									aCheckCb : opt.aCheckCb
								}
							);
		},
		setDataTree:function (el,idStr){
			var self = this
			var opt = el.data("opt")
			var buffer = [];
			try{
				var buffer = tree.setCheck(el.find("[data-id=content]").find("ul").eq(0) ,idStr);
			}catch(e){
				idStr = "";
			}
			el.find("input[data-type=input]").val(buffer.join(","));
			el.find("input[type=hidden]").val(idStr);
			if (opt.renderStyle)
			{
				var treeObj = el.find("[data-id=content]").find("ul").eq(0).data("tree")
				var nodeArray = treeObj.getCheckedNodes(true)
				self.renderSpanLabel(el ,nodeArray)
			}
		},
		/** 
			param : height 默认值:150px
					data   [{id:1,text:1}]
					hideRemove   true/false
					allowCheckBox  true/false
					isSingle   true/false
					isNew  true/false
					allowAll true/false
		*/
		renderSelect:function (el ,opt){
			var self = this
			var default_opt = {
				data : [],
				removeClick : function (){},
				hideRemove : true,
				allowCheckBox : true,
				isSingle : false
			}
			var id = el.attr("id");
			var __time = new Date().getTime() + Math.floor(Math.random() * Math.floor(100))
			el.attr("d-id" ,__time)
			var height = "150px";
			opt && opt.height && (height = opt.height);
			var opt = $.extend(default_opt ,opt);
			var data = opt.data;
			var buffer = [];
			var idTextMap = new HashMap();
			var el_chk;

			el.data("data" ,data)

			buffer.push('<input data-t="name_inp" type="text" class="form-control input-sm no-write" readonly data-type="input">');
			buffer.push('<i data-t="clear" class="icon-remove pabs" style="margin-right:0;right:5px;top:7px;font-size:15px;opacity:0;color:rgba(51,51,51,0.5)"></i>')
			buffer.push('<input type="hidden" data-type="id_inp" data-id="'+id+'" search-data="'+id+'" name="'+id+'"/>');
			buffer.push('<div class="inputdrop-content" data-id="content" id="'+__time+'_content" style="height:'+height+';overflow-y:auto;overflow-x:hidden;padding-left:0;padding-right:0px">'
							+'<div class="prel" style="height:1px;"><span class="pabs" style="right:5px;top:0;cursor:pointer;display:none" data-type="remove_all">全部清除</span></div><ul class="select-ul tran"></ul></div>');
			el.append(buffer.join(""));

			el.find("[data-type=remove_all]").click(function (){
				self.initSelect(el)
			})

			if (opt.allowAll)
			{
				el.find("ul").append('<li class="prel" style="padding-left:30px"><input class="pabs" style="left:5px;top:2px" type="checkbox" data-type="chk_all"/><span class="dib">全部</span></li>');
				el.find("ul").find("[data-type=chk_all]").click(function (){
					if ($(this).is(":checked"))
					{
						el_chk.prop("checked" ,"checked");
						getAll();
					}
					else
					{
						el_chk.removeAttr("checked");
						el_id_inp.val("");
						el_name_inp.val("");
						if (el.attr("initVal"))
						{
							el_id_inp.val(el.attr("initVal"));
						}
					}
				});	
			}
			
			for (var i=0;i<data.length;i++)
			{
				el.find("ul").append('<li class="prel" style="padding-left:30px"><input class="pabs" style="left:5px;top:2px" type="checkbox" data-type="chk" data-val="'
											+data[i].id+'"/><span class="dib" title="'+data[i].text+'">'
											+data[i].text+'</span><i class="icon-remove r" data-type="remove" data-idVal="'+data[i].id+'"></i></li>');
				idTextMap.put(data[i].id ,data[i].text);
			}
			el.data("map" ,idTextMap);

			el.attr("required")
					&& el.find("input").eq(0).attr("validate" ,"required");
			
			var chkIdList = [];
			var chkNameList = [];
			var el_id_inp = el.find("[data-id="+id+"]");
			var el_name_inp = el.find("[data-t=name_inp]");
			el_chk = el.find("ul").find("[data-type=chk]");
			var el_remove_i = el.find("ul").find("[data-type=remove]");
			opt.width && el.find(".inputdrop-content").css("width" ,opt.width)
			opt.overflowYHidden && el.find(".inputdrop-content").css("overflow-y" ,"hidden")
			opt.placeholder && el.find("[data-type=input]").attr("placeholder" ,opt.placeholder)

			el.css("border" ,"none");
			el.find("input").eq(0).css("border" ,"1px solid #cfdadd");
			
			if (el.hasClass("disable"))
			{
				el_name_inp.attr("disabled" ,"disabled");
			}

			var el_remove_i_1 = el.find("[data-t=clear]")

			el.mouseover(function (){
				el_remove_i_1.css("opacity" ,"1")
			}).mouseleave(function (){
				el_remove_i_1.css("opacity" ,"0")
			})

			el_remove_i_1.click(function (e){
				el_id_inp.val("")
				el_name_inp.val("")
				e.stopPropagation()
				el.find("[data-type=chk]").removeAttr("checked")
				opt.removeCbf && opt.removeCbf()
			})

			el.find("ul").on("click" ,"[data-type=remove]" ,function (){
				var idVal = $(this).attr("data-idVal");
				idTextMap.remove(idVal);
				var keyArray = idTextMap.keys();
				var valueArray = idTextMap.values();
				el.find("[data-type=id_inp]").val(keyArray.join(","));
				el.find("[data-t=name_inp]").val(valueArray.join(","));
				$(this).closest("li").remove();
				opt.singleRemoveCbf && opt.singleRemoveCbf()
			});

			if (opt.hideRemove)
				el_remove_i.hide()

			if (opt.hideRemoveAll)
				el_remove_i_1.remove()

			if (!opt.allowCheckBox)
			{
				el.find("[type=checkbox]").hide();
			}

			if (opt.isSingle)
			{
				var keyArray = idTextMap.keys();
				var valueArray = idTextMap.values();
				el.find("[data-type=id_inp]").val(keyArray.join(","));
				el.find("[data-t=name_inp]").val(valueArray.join(","));
			}

			el_chk.click(function (){
				chkIdList = [];
				chkNameList = [];
				el_chk.each(function (){
					if ($(this).is(":checked"))
					{
						chkIdList.push($(this).attr("data-val"));
						chkNameList.push($(this).next().text());
					}
				});
				
				el_id_inp.val(chkIdList.join(","));
				el_name_inp.val(chkNameList.join(","));

				if (el_id_inp.val())
				{
					g_validate.clear([el_name_inp]);
				}
			});

			this.initEvent(el ,opt);

			opt && opt.position && (this.setPosition(el.find("[data-id=content]") ,opt));

			if (!isNaN(el.attr("noEdit")))
			{
				el.find("input").removeAttr("style")
				el.find("input").attr("style" ,"background-color : rgba(0,0,0,0.1) !important")
				el.find(".icon-remove").remove()
			}

			function getAll()
			{
				chkIdList = [];
				chkNameList = [];
				el_chk.each(function (){
					chkIdList.push($(this).attr("data-val"));
					chkNameList.push($(this).next().text());
				});
				
				el_id_inp.val(chkIdList.join(","));
				el_name_inp.val(chkNameList.join(","));
			}
		},
		setDataSelect:function (el ,idStr)
		{
			if (!idStr)
				return false;
			el.find("input[type=checkbox]").removeAttr("checked");
			var el_id_inp = el.find("[data-type=id_inp]");
			var el_name_inp = el.find("[data-t=name_inp]");
			var el_chk = el.find("[data-type=chk]");
			var name_buffer = [];

			var idArray = idStr.split(",");

			for (var i = 0; i < idArray.length; i++) {
				el_chk.each(function (){
					if ($(this).attr("data-val") == idArray[i])
					{
						$(this)[0].checked = true;
						name_buffer.push($(this).next().text());
					}
				});
			}

			el_id_inp.val(idStr);
			el_name_inp.val(name_buffer.join(","));
		},
		addDataSelect:function (el ,opt){
			var __data = el.data("data")

			var idTextMap = el.data("map");
			var data = opt.data;
			var data1 = []
			// 过滤掉重复的数据
			data.forEach(function (tmp){
				var flag = false
				__data.forEach(function (__tmp){
					if (tmp.id == __tmp.id)
						flag = true
				})
				if (!flag)
					data1.push(tmp)
			})

			data =  data1

			for (var i = 0; i < data.length; i++) {
				el.find("ul").append('<li style="display:flex;"><input style="display:none" type="checkbox" data-type="chk" data-val="'
											+data[i].id+'"/><span class="ml10" style="flex:1;">'
											+data[i].text+'</span><i class="icon-remove r" data-type="remove" data-idVal="'+data[i].id+'"></i></li>');
				idTextMap.put(data[i].id ,data[i].text);
			}
			var keyArray = idTextMap.keys();
			var valueArray = idTextMap.values();
			el.find("[data-type=id_inp]").val(keyArray.join(","));
			el.find("[data-t=name_inp]").val(valueArray.join(","));
			el.data("data" ,data)
		},
		setEnable:function (el){
			el.removeClass("disable");
			el.find("[data-t=name_inp]").removeAttr("disabled");
			g_validate.clear([el.find("[validate]")]);
		},
		setDisable:function (el){
			el.addClass("disable");
			el.find("[data-t=name_inp]").attr("disabled" ,"disabled");
			g_validate.clear([el.find("[validate]")]);
		},
		clearTree:function (el){
			var self = this
			var el_inpdrop = el;
    		el_inpdrop.find("input[type=text]").val("");
			el_inpdrop.find("input[type=hidden]").val("");
			el_inpdrop.find("ul").find("[data-type*=chk]").removeAttr("checked");
			el_inpdrop.find("[data-type=span_label]").empty()
			if (el_inpdrop.attr("initVal"))
			{
				el_inpdrop.find("input[type=hidden]").val(el_inpdrop.attr("initVal"));
				self.setDataSelect(el_inpdrop ,el_inpdrop.attr("initVal"));
			}
			var treeObj = el_inpdrop.find("ul").data("tree");
			if (treeObj)
			{
				treeObj.checkAllNodes(false);
			}
		},
		clearSelect:function (el){
			el.find("input[type=text]").val("");
			el.find("input[type=hidden]").val("");
			el.find("input[type=checkbox]").removeAttr("checked");
		},
		initSelect:function (el){
			el.data("map" ,new HashMap());
			el.find("input[type=text]").val("");
			el.find("input[type=hidden]").val("");
			el.find("li").remove();
		},
		initEvent:function (el ,opt){
			if (!isNaN(el.attr("noEdit")))
			{
				return false;
			}
			var isUsing = false;
			var clickEl = el.find("input[data-type=input]")
			var contentEl
			opt = opt || {}
			if (opt.readonly)
				return false
			if (opt.renderStyle)
				clickEl = el
			clickEl.click(function (e){
				if (isUsing)
				{
					return false;
				}

				isUsing = true;

				$("body").find("div[data-id=content]").hide();
				
				contentEl = $("#" + el.attr("d-id") + "_content");

				var height = parseInt(contentEl.css("height"));

				contentEl.height(0);

				contentEl.show();

				if (opt.global)
				{
					var elWidth = el.width()
					var optWidth = parseInt(opt.width) || 0
					var __width = (elWidth >= optWidth) ? elWidth : optWidth
					$("body").append(contentEl)
					contentEl.css({left:el.offset().left + "px" ,
									top:(el.offset().top + el.height()) + "px" ,
									width:__width + "px",
									"background-color" : "#fff"})
					isUsing = false
				}
				

				var child = contentEl.children();

				child.css("opacity" ,0);
				child.css("position" ,"relative");
				child.css("top" ,"20px");

				contentEl.animate({height : height},"fast" ,function (){
					child.animate({top : "0",opacity : 1},"fast" ,function (){
						isUsing = false;
					});
				});

				e.stopPropagation();
			});

    		el.find("div[data-id=content]").click(function(e){
				e.stopPropagation();//阻止冒泡到body
			});

    		$("body").on("click.inputdrop" ,function (){
    			if (opt.global)
    				el.append(contentEl)
    			el.find("div[data-id=content]").hide();
    			el.find("div[class=__drop_div]").hide();
    		});
		},
		setPosition:function (inpContentEl ,opt){
			if (opt.position == "top")
			{
				inpContentEl.css("top" ,"-" + opt.height);
				inpContentEl.css("border-top" ,"1px solid #cfdadd");
				inpContentEl.css("border-bottom" ,"0");
			}
		},
		getText : function (el){
			return el.find("input[data-type=input]").val();
		},
		__spanLableInit : function (el ,opt){
			el.find("[class*=no-event]").css({"opacity" : 0})
			var el_span_div = $('<div data-type="span_label" class="pabs" '
								+'style="display:flex;align-items:center;left:10px;right:30px;top:0;height:30px;overflow:hidden"></div>').appendTo(el)
			el_span_div.on('click' ,'span' ,function (e){
				e.stopPropagation()
				opt.labelClick({id:$(this).attr("data-flag")})
			})
		},
		renderSpanLabel : function (el ,nodeArray){
			var el_span_div = el.find("[data-type=span_label]")
			var node 
			for (var i = 0; i < nodeArray.length; i++) {
				node = nodeArray[i]
				if (node.ASSETCODE)
					node.id = node.ASSETCODE
				if (node.checked)
					$('<span class="ml5 p5 poi" style="white-space:nowrap;text-overflow:ellipsis;overflow:hidden" title="'+node.label+'" data-flag="'+node.id+'">'+node.label+'</span>').appendTo(el_span_div)
				else
					el.find('[data-flag='+node.id+']').remove()	
			}
		},
		/** 渲染周历 */
		renderFlexoCalendar : function (el,opt){
			require(['/js/plugin/FlexoCalendar/FlexoCalendar.js','css!/js/plugin/FlexoCalendar/FlexoCalendar.css'] ,function (){
					//处理 input框 属性
					el.attr("readonly",true);
					el.css("cursor","pointer");
					$("#weekCalendar").remove();
					//body下 没有 weekcalendar 的情况 ，未调用过 周历的情况
					if($("body").find("#weekCalendar").length==0){

						var offset = el.offset();
						var width = el.outerWidth();
						var height = "183px";
						var buffer = [];
						buffer.push('<div id="weekCalendar" class="inputdrop-content" data-id="content" style="height:'+height+'px;width:'+width+'px;overflow-y:auto;overflow-x:hidden;position:absolute;z-index:99999;top:'+(offset.top+20)+'px;left:'+(offset.left)+'px;"><div id="weekDiv"></div></div>');
						$("body").append(buffer.join(""));
					}
					var startDate = $('<input type="text" class="form-control input-sm"  data-id="startDate" style="display:none;">');
					var endDate = $('<input type="text" class="form-control input-sm"  data-id="endDate" style="display:none;">');
					el.after(startDate);
					el.after(endDate);
					var date = new Date();
					var dateStr = g_moment(date).subtract(7,"day").format("YYYY-MM-DD");
					$("body").find("#weekCalendar").flexoCalendar({
						type : "weekly",
						today: false,
						selectDate : dateStr,
						onselect : function (daterange,target){
							var week = $(target).find(".week").text();
							var process = $(target).find(".process").text();
							el.val(week + " " + process);
							el.parent().find("[data-id=startDate]").val(daterange.split(",")[0]+" 00:00:00");
							el.parent().find("[data-id=endDate]").val(daterange.split(",")[1]+" 23:59:59");
							$("body").find("#weekCalendar").hide();
						}
					});
					var selectedEl = $("body").find("#weekCalendar").find("td.selected");
					var week = selectedEl.find(".week").text();
					var process = selectedEl.find(".process").text();
					var currentData = selectedEl.data("time");
					el.val(week + " " + process);
					if(currentData){
						el.parent().find("[data-id=startDate]").val(currentData.split(",")[0]+" 00:00:00");
						el.parent().find("[data-id=endDate]").val(currentData.split(",")[1]+" 23:59:59");
					}

					if (!isNaN(el.attr("noEdit")))
					{
						return false;
					}
					el.click(function (e){
						$("body").find("#weekCalendar").hide();

						var offset = el.offset();
						$("body").find("#weekCalendar").css("left",offset.left);
						$("body").find("#weekCalendar").css("top",(offset.top+30));
						var width = el.outerWidth();
						$("body").find("#weekCalendar").css("width",width);

						var contentEl = $("body").find("#weekCalendar");

						var height = parseInt(contentEl.css("height"));

						contentEl.height(0);

						contentEl.show();

						var child = contentEl.children();

						child.css("opacity" ,0);
						child.css("position" ,"relative");
						child.css("left" ,"20px");

						contentEl.animate({height : height},"fast" ,function (){
							child.animate({left : "0",opacity : 1},"fast" ,function (){});
						});

						e.stopPropagation();
					});
					$("body").find("#weekCalendar").click(function(e){
						e.stopPropagation();
					});

					$("body").on("click.inputdrop" ,function (){
						$("body").find("#weekCalendar").hide();
					});
			});
		},
		/** 渲染一个下拉div*/
		renderDropDiv : function (el ,opt){
			var el_a = $('<a href="javascript:;"><span class="__lable">已保存搜索</span><span><i class="icon-chevron-down"></i></span><div class="__drop_div"></div></a>')
			var el_drop_div = el_a.find(".__drop_div")
			var el_drop_span = el_a.find(".__lable")
			el_a.appendTo(el)
			el_a.click(function (e){
				$(".__drop_div").hide()
				el_drop_div.show()
				opt.dropClick && opt.dropClick(el_drop_div)
				e.stopPropagation();
			})

			$("body").on("click.inputdrop" ,function (){
    			el_drop_div.hide();
    		});

    		opt.render && opt.render(el_drop_div ,el_drop_span)
		},
		renderDropDivHide : function (el){
			el.find(".__drop_div").hide()
			el.find("a").blur()
		},
		calendarDropDiv : function (el ,opt){
			var el_a = $('<a href="javascript:;"><span class="__lable">本日</span><span><i class="icon-chevron-down"></i></span>'
							+'<div class="__drop_div"></div><input type="hidden" data-name="startDate"/><input type="hidden" data-name="endDate"/></a>')
			var el_drop_div = el_a.find(".__drop_div")
			var el_drop_span = el_a.find(".__lable")
			var el_start_date = el_a.find("[data-name=startDate]")
			var el_end_date = el_a.find("[data-name=endDate]")
			el_start_date.val(g_moment().format("YYYY-MM-DD 00:00:00"))
			el_end_date.val(g_moment().format("YYYY-MM-DD 23:59:59"))
			el_a.appendTo(el)
			el_a.click(function (e){
				$(".__drop_div").hide()
				el_drop_div.show()
				e.stopPropagation();
			})

			if (opt.position == "right")
				el_drop_div.css("left" ,"auto").css("right" ,"-1px")

			um_ajax_html({
				url : "js/plugin/inputdrop/inputdrop.html",
				selector : "#calendar_template",
				successCallBack : function (__el){
					el_drop_div.html(__el.html())
					laydate.render({
						elem: '#inputdrop_calendar',
						type: 'datetime',
						range: true,
						position: 'static',
						done: function(value, date){
						    //alert('你选择的日期是：' + value + '\n获得的对象是' + JSON.stringify(date));
						    el_a.find("[data-name=startDate]").val(value.split(" - ")[0])
						    el_a.find("[data-name=endDate]").val(value.split(" - ")[1])
						    el_drop_span.text(value)
							el_drop_div.hide();
							el_a.blur()
							opt.enterCbf && opt.enterCbf()
						}
					});
					el_drop_div.find("li").click(function (e){
						var __text = $(this).text()
						if (__text == "本日")
							el_start_date.val(g_moment().format("YYYY-MM-DD 00:00:00")),
							el_end_date.val(g_moment().format("YYYY-MM-DD 23:59:59"))
						if (__text == "昨日")
							el_start_date.val(g_moment().subtract(1, 'days').format("YYYY-MM-DD 00:00:00")),
							el_end_date.val(g_moment().subtract(1, 'days').format("YYYY-MM-DD 23:59:59"))
						if (__text == "最近24小时")
							el_start_date.val(g_moment().subtract(1, 'days').format("YYYY-MM-DD HH:mm:ss")),
							el_end_date.val(g_moment().format("YYYY-MM-DD HH:mm:ss"))
						if (__text == "本周")
							el_start_date.val(g_moment(timepicker.getCurrentWeek()[0]).format("YYYY-MM-DD 00:00:00")),
							el_end_date.val(g_moment(timepicker.getCurrentWeek()[1]).format("YYYY-MM-DD 23:59:59"))
						if (__text == "本月")
							el_start_date.val(g_moment(timepicker.getCurrentMonth()[0]).format("YYYY-MM-DD 00:00:00")),
							el_end_date.val(g_moment(timepicker.getCurrentMonth()[1]).format("YYYY-MM-DD 23:59:59"))
						if (__text == "本季度"){
							var __month = timepicker.getQuarterSeasonStartMonth(g_moment().format("MM")).split("-")
							el_start_date.val(g_moment().format("YYYY-"+__month[0]+"-01 00:00:00"))
							el_end_date.val(g_moment().format("YYYY-"+__month[1]+"-"+g_moment("YYYY-"+__month[1], "YYYY-MM").daysInMonth()+" 23:59:59"))
						}
						if (__text == "本年"){
							el_start_date.val(g_moment().format("YYYY-01-01 00:00:00"))
							el_end_date.val(g_moment().format("YYYY-12-31 23:59:59"))
						}

						el_drop_span.text(__text)
						el_drop_div.hide();
						el_a.blur()
						opt.enterCbf && opt.enterCbf()
						e.stopPropagation()
					})
				}
			})

			$("body").on("click.inputdrop" ,function (){
    			el_drop_div.hide();
    		});
		}
	}

	function __searchBox_init(el ,el_ul ,zNodes){
		el_ul.before($('<div class="__searchBox"><input class="__input"/><span id="inputdrop_searchBox_a" style="width:30px;cursor:pointer;">搜索</span></div>'))
		el.find("#inputdrop_searchBox_a").click(function (){
			__tree_query(el_ul ,$(this).prev().val() ,zNodes)
		})
	}

	var el_new_data = []

	function __findP(node ,zNodes){
		if (node.parentID == "root")
			return false
		for (var i = 0; i < zNodes.length; i++) {
			if (node.parentID == zNodes[i].id){
				el_new_data.push(zNodes[i])
				__findP(zNodes[i] ,zNodes)
			}
		}
	}

	function __tree_query(el_ul ,queryStr ,zNodes){
		el_new_data = []

		var el_tree = el_ul.data("tree")
		var nodes = el_tree.transformToArray(el_tree.getNodes());

		el_tree.showNodes(nodes)

		var nodeList = _.filter(nodes ,function (obj){
			return obj.label.toLowerCase().indexOf(queryStr.toLowerCase()) != -1
		})

		for (var i = 0; i < nodeList.length; i++) {
			el_new_data.push(nodeList[i])
			__findP(nodeList[i] ,zNodes)
		}

		el_new_data = _.uniq(el_new_data)

		var el_data_tmp = []
		// 找到未选中的
		for (var i = 0; i < nodes.length; i++) {
			var tmp = _.find(el_new_data ,function (obj){
				return obj.id == nodes[i].id
			})
			if (!tmp)
				el_data_tmp.push(nodes[i])
		}

		el_tree.hideNodes(el_data_tmp)
	}
});