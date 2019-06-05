/** 
	插件名称  :  表格插件
	插件功能  :  响应式，支持拖拽调整宽度
	参数      :
				header : [],
				data : null,
				paginator : true,
				oper : [],
				operStyle:true,
			 	operLayout:true,
				url : "",
				paramObj : new Object(),
				currentPage : 1,
				pageSize : 10,
				isLoad : true,
				allowCheckBox:true,
				maskObj : '',
				isAsync : true,
				dbClick : null,
				hasBorder : true,
				server : null,
				gridCss : "",   um-grid-style
				hideSearch : false,
				hideSort : false,
				cbf : function(){},
				dataKey : "",
				autoHeight:false,
				dbThLine : false,
				showTip : new Object(),
				dbIndex : 0,
				checkType:"checkbox",
				tableWidth : "",
				wholly : false,
				showCount : false,
				cacheSearch : false,
				searchInp : el_inp,
				searchKey : [],
				resizeFlag : true
*/

define(['/js/plugin/tip/tip.js'],function (tip){

	return {
		render : function (el ,opt){
			var self = this;

			var default_opt =   {
									header : [],
									data : null,
									paginator : true,
									oper : [],
									url : "",
									paramObj : new Object(),
									currentPage : 1,
									pageSize : 50,
									isLoad : true,
									allowCheckBox:true,
									maskObj : '',
									isAsync : true,
									dbClick : null,
									hasBorder : true,
									hideSearch : true,
									hideSort : false,
									dataKey : "",
									autoHeight:false,
									dbThLine:false,
									checkType:"checkbox",
									dbIndex:0,
									gridHeight:"260px",
									resizeFlag : true
								};

			var opt = $.extend(default_opt ,opt);

			el.data("opt" ,opt);

			var header = opt.header;
			var data = opt.data;
			var oper = opt.oper;
			var url = opt.url;
			var buffer = [];
			var searchBuffer = [];

			if (opt.maskObj == "")
			{
				opt.maskObj = el;
			}

			$.ajax({
				type: "GET",
				url: "js/plugin/grid/grid.html",
				success :function(data)
				{
					var gridEl = $(data);
					var thWidth;
					el.empty();
					// 是否显示分页信息
					if (!opt.paginator)
					{
						if (opt.showCount)
						{
							gridEl.find("[class=um-grid-pager]").find("div").eq(0).remove();
							gridEl.find("[class=um-grid-pager]").find("div").eq(0).remove();
							gridEl.find("[class*=um-grid-pager-info-outer]").children().html('共 <span data-id="total_record_count" style="font-weight:bold"></span> 条记录');
						}
						else
						{
							gridEl.find("div[class=um-grid-pager-outer]").remove();
							gridEl.find("div[class*=um-grid-table-outer]").css("bottom" ,0);
							gridEl.css("border-bottom" ,"1px solid #ddd");
						}
					}

					if (opt.headHide)
						gridEl.find(".um-grid-head-tr").css("opacity" ,0)

					// 是否有边框
					if (!opt.hasBorder)
					{
						gridEl.css("border" ,"none");
						gridEl.find("tr[class=um-grid-head-tr]").css("border-top" ,"none");
					}

					if (opt.dbThLine)
					{
						gridEl.addClass("um-grid-dbline");
					}

					var gridWidth = el.width();

					if (opt.tableWidth)
					{
						var __tableWidth = parseInt(opt.tableWidth)
						if (__tableWidth < $(window).width())
							__tableWidth = $(window).width()
						gridEl.css("padding-bottom" ,"35px");
						gridEl.find("[data-type=tabel-fix-width]").css("width" ,__tableWidth + "px");
						gridEl.find("[class*=um-grid-table-outer]").css("bottom" ,"0");
						gridWidth = gridEl.find("[data-type=tabel-fix-width]").width();
					}
					else
					{
						gridEl.find("[data-type=tabel-fix-width-outer]").attr("style" ,"overflow-x:hidden;overflow-y:hidden")
					}

					opt.gridCss && gridEl.addClass(opt.gridCss);

					el.append(gridEl);

					if (!opt.autoHeight)
					{
						gridEl.find('[data-id=um-grid-table-div]').slimscroll({
							height: (el.height() - 36) + "px",
							allowPageScroll: false
						});
					}

					gridEl.data("width" ,gridWidth);

					var elWidthWithOutCheckBox = gridWidth;

					// 渲染表头
					// 是否允许全选
					if (opt.allowCheckBox)
					{
						var tmp_opacity = (opt.checkType != "radio"?1:"0")
						elWidthWithOutCheckBox = gridWidth-30;
						buffer.push('<td style="width:29px;opacity:'+tmp_opacity+'" data-id="chk"><div style="width:29px"><div class="checkbox"><label class="i-checks"><input type="checkbox" data-id="check_all"><i></i></label></div></div></td>');
						searchBuffer.push('<td style="width:29px;opacity:'+tmp_opacity+'" data-type="first_td"><div style="width:29px"></div></td>');
					}

					if (opt.operWidth)
					{
						elWidthWithOutCheckBox = elWidthWithOutCheckBox - parseInt(opt.operWidth);
					}

					// 未定义表头宽度时的默认值
					var perWidth = 100/header.length;

					for (var i=0;i<header.length;i++)
					{
						if (header[i].width)
						{
							thWidth = parseInt(header[i].width/100 * elWidthWithOutCheckBox);
						}
						else
						{
							thWidth = parseInt(perWidth/100 * elWidthWithOutCheckBox);
						}
						buffer.push('<td data-key="'+header[i].name+'" style="width:'+thWidth+'px"><div style="width:'+(thWidth-3)+'px;text-align:'+header[i].align+'">'
									+'<span class="custom-down" data-id="sort"></span>'+header[i].text
									+'<span class="resize1" data-id="resize_span"></span></div></td>');
						searchBuffer.push('<td data-type="col" style="width:'+thWidth+'px"><div data-type="col-div" style="width:'+(thWidth-3)+'px"></div></td>');
					}

					// 是否有操作栏 
					if (opt.oper.length > 0)
					{
						buffer.push('<td data-id="chk_oper"><div></div></td>');
						searchBuffer.push('<td class="tc" data-type="first_td" style="'+opt.operWidth+'"><div class="w-all prel" style="top:5px"></div></td>');
					}

					// 是否显示搜索按钮
					if (opt.hideSearch)
					{
						gridEl.find("[data-type=table_search_i]").hide();
						gridEl.find("[class*=um-grid-search-outer]").remove();
					}

					gridEl.find("[class=um-grid-head]").find("tr").html(buffer.join(""));

					gridEl.find("[class=um-grid-search]").find("tr").html(searchBuffer.join(""));

					gridEl.find("[class=um-grid-search]").find("tr").find("td").not("[data-type=first_td]").each(function (i){
						if (header[i].searchRender)
						{
							header[i].searchRender && header[i].searchRender($(this).find("div") ,header[i].name);
						}
						else
						{
							$(this).find("div").append('<input type="text" class="form-control input-sm" search-data="'+header[i].name+'">');
						}
						if (header[i].hideSearch)
						{
							$(this).find("div").css("text-align" ,header[i].align);
							$(this).find("div").html("");
						}
						if (header[i].hideSearch && header[i].hideSearch == "hide")
						{
							$(this).find("div").html("");
						}
					});

					el.find("[data-id=pg_sel]").val(opt.pageSize);

					// 渲染数据
					self.renderData(gridEl ,opt);

					// 初始化拖拽事件
					//self.initDrag(gridEl ,opt);
					var el_search_outer = gridEl.find("[class=um-grid-search-outer]");
					var el_table_outer = gridEl.find("[class*=um-grid-table-outer]");

					// 重设查询按钮的位置
					if (!opt.allowCheckBox)
					{
						gridEl.find("[data-type=table_search_i]").css("left" ,"7px");
					}
					// 查询展开、收起点击事件
					gridEl.find("[data-type=table_search_i]").click(function (){
						if (el_table_outer.hasClass("um-grid-search-outer-expand"))
						{
							gridEl.find("[class*=um-grid-empty]").css("z-index" ,"2000")
							el_table_outer.removeClass("um-grid-search-outer-expand-zindex");
						}
						else
						{
							el_table_outer.oneTime(200 ,function (){
								el_table_outer.addClass("um-grid-search-outer-expand-zindex");
							});
							gridEl.find("[class*=um-grid-empty]").css("z-index" ,"1999")
						}
						
						el_table_outer.toggleClass("um-grid-search-outer-expand");
					});

					// 全选事件
					if (opt.allowCheckBox)
					{
						gridEl.find("[data-id=check_all]").click(function (){
							if ($(this)[0].checked)
							{
								gridEl.find("input[data-id=check_inp]").prop("checked" ,"checked");
							}
							else
							{
								gridEl.find("input[data-id=check_inp]").removeAttr("checked");
							}
						});
					}

					// 表格内查询按钮点击事件
					gridEl.find("[data-type=icon-check-sign]").click(function (){
						gridEl.find("[data-type=table_search_i]").click()
						var queryObj = el_search_outer.umDataBind("serialize" ,"search-data");
						if (!g_validate.validate(el_search_outer))
						{
							return false;
						}
						opt.paramObj = queryObj;
						opt.currentPage = 1;
						el.find("[data-id=current_page_num]").val("1");
						gridEl.data("queryObj" ,queryObj);
						self.renderData(gridEl ,opt);
					});
					// 表格内重置按钮点击事件
					gridEl.find("[data-type=icon-rotate-left]").click(function (){
						gridEl.find("[data-type=table_search_i]").click()
						el_search_outer.umDataBind("reset");
						g_validate.reset(el_search_outer);
						var queryObj = el_search_outer.umDataBind("serialize" ,"search-data");
						opt.paramObj = queryObj;
						opt.currentPage = 1;
						el.find("[data-id=current_page_num]").val("1");
						gridEl.data("queryObj" ,queryObj);
						self.renderData(gridEl ,opt);
					});

					// 分页数change事件
					el.find("[data-id=pg_sel]").select2({
			    		width : "100%",
			    		minimumResultsForSearch : -1
			    	});

			    	// 排序事件
			    	if(!opt.hideSort){
				    	el.find("[class=um-grid-head-tr]").find("td").not("[data-id=chk]").not("[data-type=oper_td]").each(function (i){
				    		var sortKey;
				    		var sortType;
				    		var sortBy;
				    		$(this).click(function (e){
				    			if ($(e.target).parent().attr("data-id") == "chk_oper")
				    			{
				    				return false;
				    			}
				    			sortKey = header[i].name;
				    			sortBy = (header[i].sortBy ? header[i].sortBy : "");
				    			if ($(this).data("sortType") == "minmax")
				    			{
				    				sortType = "maxmin";
				    			}
				    			else
				    			{
				    				sortType = "minmax";
				    			}
				    			$(this).data("sortType" ,sortType);
				    			if (header[i].sortKey)
				    			{
				    				sortKey = header[i].sortKey;
				    			}
				    			self.sort(el  ,{sortKey:sortKey ,sortType:sortType ,sortBy:sortBy});
				    		});
				    	});
			    	}
			    	
			    	el.find("[class*=select2-selection]").css("height" ,"22px");
			    	el.find("[class*=select2-selection__rendered]").css("line-height" ,"22px");
					el.find("[data-id=pg_sel]").change(function (){
						opt.pageSize = $(this).val();
						opt.currentPage = 1;
						el.find("[data-id=current_page_num]").val(1);
						//self.renderData(gridEl ,opt);

						// 当前查询条件
						var queryObj = gridEl.find("[class*=um-grid-search-tr]").umDataBind("serialize" ,"search-data");
						if (Object.keys(queryObj).length > 0)
							opt.paramObj = queryObj;

						self.render(el ,opt);
					});

					// resize事件
					if (!opt.tableWidth)
					{
						onWindowResize.add(function (){
							var tdWidthArray = gridEl.data("tdWidthArray");
							gridEl.stopTime();
							gridEl.oneTime(500 ,function (){
								if (gridEl.parent().width() == 0)
									return false
								var per;
								if (opt.allowCheckBox)
								{
									per = (gridEl.width()-30)/(gridEl.data("width")-30);
								}
								else
								{
									per = (gridEl.width())/(gridEl.data("width"));
								}
								el.find("[class=um-grid-head]").find("table").find("tr").find("td").not("[data-id*=chk]").each(function (i){
									if (tdWidthArray)
									{
										$(this).width(parseInt(tdWidthArray[i] * per));
										$(this).find("div").width(parseInt(tdWidthArray[i] * per));
									}
								});
								self.initTdWidth(gridEl ,opt);
								gridEl.data("width" ,gridEl.width());
							});
						});
					}
					
				}
			});
		},
		renderData : function (el ,opt){
			var self = this;
			if (!opt.paramObj)
			{
				opt.paramObj = new  Object();
			}
			if (opt.paginator)
			{
				opt.paramObj.currentPageNum = opt.currentPage;
				opt.paramObj.pageSize = opt.pageSize;
			}
			var data = opt.data;
			if (data)
			{
				inFunc_render(data);
			}
			else
			{
				if(opt && opt.queryBefore)
				{
					var queryBeforeResult = opt.queryBefore(opt.paramObj)
					if(queryBeforeResult)
					{
						opt.paramObj = queryBeforeResult;
					}
				}

				el.find("[data-id=um-grid-table-div]").find("table").empty()
				el.find(".slimScrollBar").css("top" ,"0px")

				if (el.hasClass("um-grid"))
					el.parent().css("height" ,opt.gridHeight)
				if (opt.type == "get")
				{
					um_ajax_get({
						url : opt.url,
						isLoad : opt.isLoad,
						paramObj : opt.paramObj,
						maskObj : opt.maskObj,
						isAsync : opt.isAsync,
						server : opt.server,
						successCallBack : function (data){
							var total = data.total
							if (opt.dataKey)
							{
								data = data[opt.dataKey];
							}
							if (opt.dataSuperKey)
							{
								data = eval('data' + opt.dataSuperKey)
							}
							if (total)
								data[0] && (data[0].recordCount = total)
							inFunc_render(data);
						}
					});
				}
				else
				{
					um_ajax_post({
						url : opt.url,
						isLoad : opt.isLoad,
						paramObj : opt.paramObj,
						maskObj : opt.maskObj,
						isAsync : opt.isAsync,
						server : opt.server,
						successCallBack : function (data){
							var total = data.total
							if (opt.dataKey)
							{
								data = data[opt.dataKey];
							}
							if (opt.dataSuperKey)
							{
								data = eval('data' + opt.dataSuperKey)
							}
							if (total)
								data[0] && (data[0].recordCount = total)
							inFunc_render(data);
						}
					});
				}
			}

			function inFunc_render(data)
			{
				self.emptyDivHide(el)
				var header = opt.header;
				var oper = opt.oper;
				var buffer = [];
				var dataObj;
				var tdText;
				el.data("record" ,data);
				if (!data || data.length == 0)
				{
					if (el.find("[data-id=check_all]").size() > 0)
					{
						el.find("[data-id=check_all]")[0].checked = false;
					}
					self.noDatPagerInit(el);
					// 自适应高度
					if (opt.autoHeight)
					{
						el.find("[class=slimScrollBar]").css("opacity" ,"0");
						el.parent().height(el.find('[data-id=um-grid-table-div]').find("table").height() + 209);
						el.find(".um-grid-pager-outer").remove()
					}
					opt.cbf && opt.cbf();
					if (opt.url)
						self.emptyDivShow(el)
					return false;
				}
				
				el.find(".um-grid-pager-outer").show()

				// 渲染TR
				self.renderTr(el ,opt ,data ,true);

				if (el.find("[data-id=check_all]").size() > 0)
				{
					el.find("[data-id=check_all]")[0].checked = false;
				}

				// 初始化分页
				if (opt.paginator || opt.showCount)
				{
					// 初始化分页
					self.initPager(el ,opt);
					// 初始化分页点击事件
					self.initPagerEvent(el ,opt);
				}

				if (opt.wholly)
				{
					el.find('[data-id=um-grid-table-div]').find("table").addClass("wholly");
					el.find('[data-id=um-grid-table-div]').find("table").wholly({
			            highlightHorizontal: 'wholly-highlight-horizontal',
			            highlightVertical: 'wholly-highlight-vertical'
			        });
				}
				
				// 渲染实时搜索
				if (opt.cacheSearch)
				{
					self.cacheSearch(el ,opt);
				}

				opt.cbf && opt.cbf();

				if (opt.showTip)
				{
					el.find("tr").not("[class=um-grid-head-tr]").not("[class=um-grid-search-tr]").each(function (){
						var trEl = $(this);
						trEl.find("td").not("[data-id=chk]").eq(0).addClass("tip");
						trEl.find("td").not("[data-id=chk]").eq(0).click(function (){
							$("body").find("tr[class=active]").removeClass("active");
							trEl.addClass("active");
							opt.showTip.render && opt.showTip.render(trEl.data("data"));
							return false;
						});
					});

					// 绑定页面点击事件
					$("body").on("click.grid" ,function (e){
						if ($(e.target).closest("div.checkbox").size() > 0)
						{
						}
						else if ($(e.target).attr("class") == "umDialog-right-content"
								|| $(e.target).closest("[class=umDialog-right-content]").size() > 0
								|| $(e.target).closest("[class=um_mask]").size() > 0)
						{
							return false;
						}
						else
						{
							el.find("tr").not("[class=um-grid-head-tr]").not("[class=um-grid-search-tr]").removeClass("active");
							g_dialog.rightDialogHide();
							return false;
						}
						
					});

					// 绑定键盘上移下移事件
					$("body").on("keypress.grid" ,function (event){
						var keycode = (event.keyCode ? event.keyCode : event.which);
						var currentTR = el.find("tr[class=active]");
						// 上移
					    if(keycode == '40')
					    {  
					        currentTR.next().find("td").not("[data-id=chk]").eq(0).click();
					        //return false;
					    }
					    // 下移
					    if (keycode == '38')
					    {
					    	currentTR.prev().find("td").not("[data-id=chk]").eq(0).click();
					    	//return false;
					    }
					})
				}

				if (el.height() == 0){
					$("body").oneTime(500 ,function (){
						el.height(el.parent().height())
					})
				}
				if (opt.resizeFlag)
				{
					self.resizeSup(el.parent())
					el.oneTime(500 ,function (){
						if (el.hasClass("um-grid"))
							self.resize(el.parent())
						else
							self.resize(el)	
					})
				}
			}
		},
		isOutTr:function(data){
			return false;
		},
		emptyDivShow:function (el){
			var el_table_outer = el.find("[class*=um-grid-table-outer]");
			var el_empty_div = $('<div class="um-grid-empty vertical-container"><span>暂无数据</span></div>').appendTo(el)
			if (el_table_outer.hasClass("um-grid-search-outer-expand"))
				el.find("[class*=um-grid-empty]").css("z-index" ,"1999")
			else
				el.find("[class*=um-grid-empty]").css("z-index" ,"2000")
		},
		emptyDivHide:function (el){
			el.find("[class*=um-grid-empty]").remove()
		},
		emptyDivRemove:function (){

		},
		renderTr : function (el ,opt ,data ,emptyFlag){
			var self = this;
			var header = opt.header;
			var oper = opt.oper;
			var buffer = [];
			var dataObj;
			var tdText;
			var titleText;
			if (emptyFlag)
			{
				el.find("[data-id=um-grid-table-div]").find("table").empty();
			}
			for (var i=0;i<data.length;i++)
			{
				if(self.isOutTr(data[i]) == true){
					continue;
				}
				buffer = [];
				buffer.push("<tr>");
				dataObj = data[i];
				titleText = "";
				// 是否允许全选
				if (opt.allowCheckBox)
				{
					buffer.push('<td style="width:29px" data-id="chk"><div style="width:29px"><div class="checkbox"><label class="i-checks"><input type="'+opt.checkType+'" data-id="check_inp" '+(data[i].gridChecked?"checked":"")+' name="__t"><i></i></label></div></div></td>');
				}
				for (var j=0;j<header.length;j++)
				{
					titleText = "";
					tdText = dataObj[header[j].name];
					if (header[j].render)
					{
						tdText = header[j].render(tdText ,dataObj);
					}
					else if(header[j].increment)
					{
						tdText = (i + 1)
					}
					else
					{
						tdText && (titleText = 'title="' + dataObj[header[j].name] +'"' +"'")
					}
					if (tdText == null)
					{
						tdText = "";
					}
					buffer.push('<td data-key="'+header[j].name+'" style="vertical-align:'+header[j].vertical+'"><div style="text-align:'+header[j].align+';font-weight:'+header[j].bold+'" '+titleText+'>'+tdText+'</div></td>');
				}
				// 渲染操作栏
				if (oper && oper.length > 0)
				{
					buffer.push('<td data-type="oper_td" style="text-align:center">');
					for (var j=0;j<oper.length;j++)
					{
						oper[j].render && (oper[j].icon = oper[j].render(data[i]));

						var operTmp = oper[j];

						if (oper[j].customRender)
						{
							operTmp = oper[j].customRender(data[i]);
						}
						
						if (!oper[j].isShow || oper[j].isShow(data[i]))
						{
							if (opt.operStyle)
							{
								if (opt.operLayout)
								{
									buffer.push('<a data-type="aclick" href="javascript:void(0);" style="color:#000;float:left;width:'+operTmp.width+'"><i class="'+(operTmp.style?operTmp.style:opt.operStyle)+'" title="'+operTmp.text+'">'+operTmp.text+'</i></a>');
								}
								else
								{
									buffer.push('<a data-type="aclick" href="javascript:void(0);" style="color:#000;margin:0 3px"><i class="'+(operTmp.style?operTmp.style:opt.operStyle)+'" title="'+operTmp.text+'">'+operTmp.text+'</i></a>');
								}
							}
							else
							{
								buffer.push('<a data-type="aclick" href="javascript:void(0);" style="margin:0 3px">'+operTmp.text+'</a>');
							}
						}
						else
						{
							buffer.push('<a data-type="aclick" class="'+operTmp.icon+' __dis" style="margin: 0 3px;"></a>');
						}
					}
					buffer.push("</td>");
				}

				buffer.push("</tr>");

				var trObj = $(buffer.join(""));

				el.find("[data-id=um-grid-table-div]").find("table").append(trObj);

				trObj.data("data" ,data[i]);

				// 绑定选中事件
				trObj.find("[data-id=check_inp]").click(function (){
					var trData = $(this).closest("tr").data("data");
					$(this).is(":checked")?(trData.gridChecked=true):(trData.gridChecked=false);
				});

				// 绑定操作栏事件
				trObj.find("[data-type=oper_td]").each(function (){
					$(this).find("[data-type=aclick]").each(function (i){
						$(this).click(function (){
							!$(this).hasClass("__dis") && oper[i].aclick($(this).closest('tr').data("data") ,$(this).closest('tr'));
							return false;
						});
					});
				});
			}
			// 给td绑定双击事件
			if (opt.tdDbClick)
			{
				self.tdDbClick(el ,opt);
			}
			// 给td绑定单击事件
			if (opt.tdClick)
			{
				self.tdClick(el ,opt);
			}
			// 双击事件
			if (opt.dbClick)
			{
				el.find("tr").not("[class=um-grid-head-tr]").not("[class=um-grid-search-tr]").each(function (){
					var trEl = $(this);
					trEl.find("td").not("[data-id=chk]").eq(opt.dbIndex).addClass("tip");
					trEl.find("td").not("[data-id=chk]").eq(opt.dbIndex).click(function (){
						opt.dbClick(trEl.data("data"));
						return false;
					});
				});
			}
			// 初始化单元格宽度
			self.initTdWidth(el ,opt);

			// 自适应高度
			if (opt.autoHeight)
			{
				el.find("[class=slimScrollBar]").css("opacity" ,"0");
				if (el.hasClass("um-grid"))
					el.parent().height(el.find('[data-id=um-grid-table-div]').find("table").height() + 104)
				else
					el.height(el.find('[data-id=um-grid-table-div]').find("table").height() + 104)
			}
		},
		addData : function (el ,data){
			var opt = el.data("opt");
			var header = opt.header;
			var oper = opt.oper;
			var buffer = [];
			var dataObj;
			var tdText;
			// 渲染TR
			this.renderTr(el ,opt ,data);
			if (opt.wholly)
			{
				el.find('[data-id=um-grid-table-div]').find("table").unbind("mouseenter");
				el.find('[data-id=um-grid-table-div]').find("table").unbind("mouseleave");
				el.find('[data-id=um-grid-table-div]').find("table").wholly({
			            highlightHorizontal: 'wholly-highlight-horizontal',
			            highlightVertical: 'wholly-highlight-vertical'
			    });
			}
			if (opt.showTip)
			{
				el.find("tr").not("[class=um-grid-head-tr]").not("[class=um-grid-search-tr]").each(function (){
					var trEl = $(this);
					trEl.find("td").not("[data-id=chk]").eq(0).addClass("tip");
					trEl.find("td").not("[data-id=chk]").eq(0).click(function (){
						$("body").find("tr[class=active]").removeClass("active");
						trEl.addClass("active");
						opt.showTip.render && opt.showTip.render(trEl.data("data"));
						return false;
					});
				});
			}
			el.find("[data-id=total_record_count]").text(data[0]?data[0].recordCount:0);
			el.find("[data-id=current_page_record_count]").text(data.length);
		},
		updateData : function (el ,option){
			var opt = el.data("opt");
			var header = opt.header;
			var trObj = option.trObj;
			var newData = option.data;
			trObj.data("data" ,newData);
			trObj.find("td").not("[data-id=chk]").not("[data-type=oper_td]").each(function (i){
				if (header[i].render)
				{
					$(this).find("div").html(header[i].render(newData[header[i].name]));
				}
				else
				{
					$(this).find("div").html(newData[header[i].name]);
				}
				
			});
		},
		cacheSearch : function (el ,opt){
			var self = this;
			el.data("opt" ,opt);
			var el_search_inp = opt.searchInp;
			var searchKeyArray = opt.searchKey;
			var delayFlag = true;
			var data = el.data("record");
			var cacheMap = new HashMap();
			var cacheStrArray = [];
			var inpVal;
			var dataStr = [];
			var dataIndex;
			var newData = [];
			for (var i = data.length - 1; i >= 0; i--){
				dataStr = [];
				for (var j = 0; j < searchKeyArray.length; j++) {
					dataStr.push(data[i][searchKeyArray[j]]);
				}
				cacheMap.put(dataStr.join(",") ,i);
				cacheStrArray.push(dataStr.join(","));
			}
			el_search_inp.on("keyup" ,function (){
				if (delayFlag)
				{
					el_search_inp.oneTime(500 ,function (){
						newData = [];
						inpVal = el_search_inp.val();
						for (var i = cacheStrArray.length - 1; i >= 0; i--) {
							dataIndex = cacheStrArray[i].toLowerCase().indexOf(inpVal.trim().toLowerCase());
							if (dataIndex > -1)
							{
								newData.push(data[cacheMap.get(cacheStrArray[i])]);
							}
						}
						delayFlag = true;
						self.removeData(el ,{t:1});
						self.addData(el ,newData);
					});
				}
				delayFlag = false;
			})
		},
		refresh : function (el ,option){
			var opt = el.data("opt");
			if (!opt)
				return false
			var gridEl = el.find("[class=um-grid]");
			// 当前查询条件
			var queryObj = gridEl.find("[class*=um-grid-search-tr]").umDataBind("serialize" ,"search-data");

			if (option && option.queryBefore)
			{
				var queryBeforeResult = option.queryBefore(queryObj)
				if (queryBeforeResult)
				{
					queryObj = queryBeforeResult;
				}
			}

			opt.paramObj = queryObj;

			this.renderData(el ,opt);
		},
		removeData : function(el ,option){
			// 不传参数时，删除checkbox选中的
			if (!option)
			{
				el.find("[data-id=check_inp]").each(function (){
					$(this).is(":checked") && ($(this).closest("tr").remove());
				});
				el.find("[data-id=check_all]").attr("checked" ,false);
			}
			else
			{
				el.find("[class=um-grid-table]").find("tr").remove();
				el.find("[data-id=check_all]").attr("checked" ,false);
			}
		},
		getData : function (el ,option){
			var dataList = [];
			el.find("[data-id=um-grid-table-div]").find("table").find("tr").each(function (i){
				var flag = true;
				if (option && option.chk)
				{
					flag = $(this).find("[data-id=check_inp]").is(":checked");
				}
				flag && dataList.push($(this).data("data"));
			});
			return dataList;
		},
		getTrObj : function (el ,option){
			if (option && (option.index || option.index == 0))
			{
				return el.find("[data-id=um-grid-table-div]").find("table").find("tr").eq(option.index);
			}
			else
			{
				return el.find("[data-id=um-grid-table-div]").find("table").find("tr");
			}
		},
		getIdArray : function (el ,option)
		{
			var idArray = [];
			el.find("[data-id=um-grid-table-div]").find("table").find("tr").each(function (i){
				var flag = true;
				if (option && option.chk)
				{
					flag = $(this).find("[data-id=check_inp]").is(":checked")
				}
				flag && idArray.push($(this).data("data")[option.attr]);
			});
			return idArray;
		},
		moveUp : function (trObj){
			var a = trObj;
			var b = trObj.prev();
			a.insertBefore(b);
		},
		moveDown : function (trObj){
			var a = trObj;
			var b = trObj.next();
		    a.insertAfter(b);
		},
		tdDbClick : function (el ,opt){
			var header = opt.header;
			el.find("[data-id=um-grid-table-div]").find("table").find("tr").each(function (i){
				var el_td = $(this);
				$(this).find("td").not("[data-id=chk]").not("[data-type=oper_td]").each(function (j){
					if (header[j].dbclick)
					{
						$(this).dblclick(function (){
							if ($(this).find("input").size() > 0)
							{
								return false;
							}
							var tmpStr = $(this).find("div").html();
							var el_td_div = $(this).find("div");
							el_td_div.html('<input style="width:95%"/>');
							el_td_div.find("input").focus().val(tmpStr);
							el_td_div.find("input").blur(function (){
								el_td_div.html($(this).val());
								var el_tr_data = el_td.closest("tr").data("data");
								el_tr_data[header[j].name] = $(this).val();
								header[j].tdBlur && header[j].tdBlur(el_td.closest("tr"));
							});
						});
					}
				});
			});
		},
		tdClick : function (el ,opt){
			var header = opt.header;
			el.find("[data-id=um-grid-table-div]").find("table").find("tr").each(function (i){
				$(this).find("td").not("[data-id=chk]").not("[data-type=oper_td]").each(function (j){
					var el_td = $(this);
					if (header[j].click)
					{
						if (el_td.find("i").size() > 0)
						{
							el_td.find("i").click(function (e){
								var el_tr_data = el_td.closest("tr").data("data");
								header[j].click(el_tr_data);
								e.stopPropagation();
							});
						}
						else
						{
							el_td.css("cursor" ,"pointer")
							el_td.css("color" ,"rgb(15, 162, 235)")
							el_td.click(function (e){
								var el_tr_data = el_td.closest("tr").data("data");
								header[j].click(el_tr_data);
								e.stopPropagation();
							});
						}
						
					}
				});
			});
		},
		initPager : function (el ,opt){
			var self = this;

			var data = el.data("record");

			if (!data || data.length == 0)
			{
				return false;
			}

			var currentPage = el.find("[data-id=current_page_num]").val();

			el.data("currentPage" ,currentPage);

			el.find("[data-id=current_page_record_count]").text(data.length);
			el.find("[data-id=total_record_count]").text(data[0].recordCount);

			var el_first_page = el.find("[data-id=first_page]");
			var el_prev_page = el.find("[data-id=prev_page]");
			var el_next_page = el.find("[data-id=next_page]");
			var el_last_page = el.find("[data-id=last_page]");

			if (currentPage > 1)
			{
				el_first_page.removeClass("forbid");
				el_prev_page.removeClass("forbid");
			}
			else
			{
				el_first_page.addClass("forbid");
				el_prev_page.addClass("forbid");
			}

			var cTotal = (currentPage - 1) * opt.pageSize + data.length;
			if (cTotal < data[0].recordCount)
			{
				el_next_page.removeClass("forbid");
				el_last_page.removeClass("forbid");
			}
			else
			{
				el_next_page.addClass("forbid");
				el_last_page.addClass("forbid");
			}
		},
		initPagerEvent : function (el ,opt){
			var self = this;
			var data = el.data("record");
			opt.isLoad = true;

			if (!data || data.length == 0)
			{
				return false;
			}

			var el_first_page = el.find("[data-id=first_page]");
			var el_prev_page = el.find("[data-id=prev_page]");
			var el_next_page = el.find("[data-id=next_page]");
			var el_last_page = el.find("[data-id=last_page]");
			var el_current_page_num = el.find("[data-id=current_page_num]")

			el_first_page.off("click");
			el_prev_page.off("click");
			el_next_page.off("click");
			el_last_page.off("click");
			el_current_page_num.unbind("keyup")

			if (!el_first_page.hasClass("forbid"))
			{
				el_first_page.click(function (){
					opt.currentPage = 1;
					el.find("[data-id=current_page_num]").val(1);
					self.renderData(el ,opt);
				});
			}
			
			if (!el_prev_page.hasClass("forbid"))
			{
				el_prev_page.click(function (){
					opt.currentPage = parseInt(el.data("currentPage")) - 1;
					el.find("[data-id=current_page_num]").val(opt.currentPage);
					self.renderData(el ,opt);
				});
			}

			if (!el_next_page.hasClass("forbid"))
			{
				el_next_page.click(function (){
					opt.currentPage = parseInt(el.data("currentPage")) + 1;
					el.find("[data-id=current_page_num]").val(opt.currentPage);
					self.renderData(el ,opt);
				});
			}

			if (!el_last_page.hasClass("forbid"))
			{
				el_last_page.click(function (){
					var last_page_num = Math.ceil(data[0].recordCount/opt.pageSize);
					opt.currentPage = last_page_num;
					el.find("[data-id=current_page_num]").val(opt.currentPage);
					self.renderData(el ,opt);
				});
			}

			el_current_page_num.bind('keyup',function(event){ 
				if (event.keyCode == 13)
				{
					var last_page_num = Math.ceil(data[0].recordCount/opt.pageSize);
					if (el_current_page_num.val() > last_page_num)
						return false
					opt.currentPage = el_current_page_num.val()
					self.renderData(el ,opt);
				}
			})
		},
		noDatPagerInit : function (el){
			el.find("[data-id=first_page]").off("click").removeClass("forbid").addClass("forbid");
			el.find("[data-id=prev_page]").off("click").removeClass("forbid").addClass("forbid");
			el.find("[data-id=next_page]").off("click").removeClass("forbid").addClass("forbid");
			el.find("[data-id=last_page]").off("click").removeClass("forbid").addClass("forbid");

			el.find("[data-id=current_page_record_count]").text(0);
			el.find("[data-id=total_record_count]").text(0);

			el.find("[data-id=um-grid-table-div]").find("table").empty();
		},
		initTdWidth : function (el ,opt)
		{
			var header = opt.header;
			var tdWidthArray = [];
			var thTmp = el.find("[class=um-grid-head]").find("table").find("tr").find("td").not("[data-id*=chk]");
			var searchThTmp = el.find("[class=um-grid-search]").find("[data-type=col]");
			var grid_table = el.find("[data-id=um-grid-table-div]").find("table");
			thTmp.each(function (i){
				tdWidthArray.push(parseInt(thTmp.eq(i).css("width")));
			});

			el.data("tdWidthArray" ,tdWidthArray);

			for (var i=0;i<header.length;i++)
			{
				var width = tdWidthArray[i];
				grid_table.find("tr").not("[class*=expand-tr]").each(function (){
					$(this).find("td").not("[data-id=chk]").eq(i).css("width" ,width + "px");
					$(this).find("td").not("[data-id=chk]").eq(i).find("div").css("width" ,(width-3) + "px");
					searchThTmp.eq(i).css("width" ,width + "px");
					searchThTmp.eq(i).find("[data-type=col-div]").css("width" ,(width-3) + "px");
				});
			}
		},
		initDrag : function (el ,opt){
			var self = this;
			//鼠标离控件左上角的相对位置
			var _x;
			var _y;

			var _left;

			var leftColumn;
			var rightColumn;

			var leftColumnStartWidth;
			var rightColumnStartWidth;

			var thTmp;
			var thAttr;

			el.find("[data-id=resize_span]").mousedown(function (e){
				e.preventDefault();
				var left = getTdWidthFromLeft($(e.target).closest("td"));
				el.find("[data-id=um-grid-resize-mark]").css("left" ,left + "px");
				el.find("[data-id=um-grid-resize-mark]").show();
				_x = e.pageX;
				_y = e.pageY;
				_left = parseInt(el.find("[data-id=um-grid-resize-mark]").css("left"));
				leftColumn = $(this).closest('td');
				rightColumn = $(this).closest('td').next();

				leftColumnStartWidth = leftColumn.width();
				rightColumnStartWidth = rightColumn.width();

				$(document).on('mousemove.rc' ,function (e){
					difference = e.pageX - _x;
					leftColumn.width(leftColumnStartWidth + difference);
					leftColumn.find("div").width(leftColumnStartWidth + difference);
					rightColumn.width(rightColumnStartWidth - difference);
					rightColumn.find("div").width(rightColumnStartWidth - difference);

				});

				$(document).one('mouseup' ,function (e){
					$(document).off('mousemove.rc');
					el.find("[data-id=um-grid-resize-mark]").hide();
					self.initTdWidth(el ,opt);
				});
			});

			// $("body").mouseup(function (){
			// 	el.find("[data-id=um-grid-resize-mark]").hide();
			// });

			function getTdWidthFromLeft(elTd){	
				var el = elTd;
				var elWidth = el.width();
				while (el.width() != null)
				{
					el = el.prev();
					elWidth = elWidth + (el.width() == null ? 0 : el.width());
				}
				return elWidth;
			}
		},
		resize : function (el ,flag){
			var opt = el.data("opt");

			if (!opt)
				return false

			var header = opt.header;

			var thWidth;

			// 未定义表头宽度时的默认值
			var perWidth = 100/header.length;

			var elWidthWithOutCheckBox = el.width();

			if (opt.allowCheckBox)
			{
				elWidthWithOutCheckBox = el.width()-30;
			}

			if (opt.operWidth)
			{
				elWidthWithOutCheckBox = elWidthWithOutCheckBox - parseInt(opt.operWidth);
			}

			for (var i=0;i<header.length;i++)
			{
				if (header[i].width)
				{
					thWidth = parseInt(header[i].width/100 * elWidthWithOutCheckBox);
				}
				else
				{
					thWidth = parseInt(perWidth/100 * elWidthWithOutCheckBox);
				}
				el.find("[class*=um-grid-head-tr]").find("td").not("[data-id=chk]").eq(i).css("width" ,thWidth + "px");
				el.find("[class*=um-grid-head-tr]").find("td").not("[data-id=chk]").eq(i).find("div").css("width" ,(thWidth-3) + "px");
			}

			this.initTdWidth(el ,opt);
		},
		resizeSup : function (el){
			var self = this
			var opt = el.data("opt")
			if (!opt)
				return false
			var gridEl = el.find("[class=um-grid]")
			var tdWidthArray = gridEl.data("tdWidthArray");
			gridEl.stopTime();
			gridEl.oneTime(500 ,function (){
				var per;
				if (opt.allowCheckBox)
				{
					per = (gridEl.width()-30)/(gridEl.data("width")-30);
				}
				else
				{
					per = (gridEl.width())/(gridEl.data("width"));
				}
				el.find("[class=um-grid-head]").find("table").find("tr").find("td").not("[data-id*=chk]").each(function (i){
					if (tdWidthArray)
					{
						$(this).width(parseInt(tdWidthArray[i] * per));
						$(this).find("div").width(parseInt(tdWidthArray[i] * per));
					}
				});
				self.initTdWidth(gridEl ,opt);
				gridEl.data("width" ,gridEl.width());
			});
		},
		sort : function (el ,opt){
			var sortType = opt.sortType;
			var sortBy = opt.sortBy;
			// 从小到大
			if (sortType == "minmax")
			{
				var min = -1;
				var max = 1;
			}
			// 从大到小
			else if (sortType == "maxmin")
			{
				var min = 1;
				var max = -1;
			}
			var by = function (name){
				return function (o ,p){
					var a,b;
					if (typeof o === "object" && typeof p === "object" && o && p)
					{
						a = o[name];
						b = p[name];
						if (sortBy == "int")
						{
							a = parseInt(a);
							b = parseInt(b);
						}
						if (a === b)
						{
							return 0;
						}
						if (typeof a === typeof b)
						{
							return a < b ? min : max;
						}
						return typeof a < typeof b ? min : max;
					}
					else
					{
						throw("error");
					}
				}
			}
			var dataArray = this.getData(el ,{chk:false});

			var sortedDataArray = dataArray.sort(by(opt.sortKey));
			this.removeData(el ,{});
			this.addData(el ,sortedDataArray);
		}
	}

});