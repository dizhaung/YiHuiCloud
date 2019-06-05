define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/asset/asset.js'] ,function (monitorInfo ,asset){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/os/liunx/queryLiunxBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	
		        	if(data && data.monitorbaseinfo && data.monitorbaseinfo)
		       		 	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		           
		            if(data && data.linuxStaticInfo[0] && data.linuxStaticInfo[0])
			            $("#base_info_asset_div").umDataBind("render" ,data.linuxStaticInfo[0]);
		           
		            if(data!=null&&data.edInfo[0] && data.edInfo[0])
		           		$("#base_info_main_div").umDataBind("render" ,data.edInfo[0])
		            if(data && data.assetinfo && data.assetinfo)
		           		$("#base_info_assetType_div").umDataBind("render" ,data.assetinfo);
		           	if(data!=null&&data.edInfo[0] && data.edInfo[0])
		           		$("#base_info_monitor_div").find("[data-id=systemVersion]").text(data.edInfo[0].systemVersion)

		        }
		    });
		},

		// cpu当前使用信息
		cpu_info_chart : function (paramObj){
			monitorInfo.cpu_use_rate_render({
				url : "monitorview/os/windows/queryAllUsageInfoCurrent",
		        paramObj : paramObj,
		        one_secend : $("#one_secend"),
		        five_secend : $("#five_secend"),
		        fifteen_secend : $("#fifteen_secend"),
		        chart_el: $("#cpu_current_use_chart")
			})
		},

		// cpu使用率
		cpu_use_chart : function (el, paramObj){
			monitorInfo.cpu_memo_use_rate({
		        url : "monitorview/os/windows/queryAllUsageInfo",
		        paramObj : paramObj,
		        line_chart : el,
		        type:"cpu"
		    })
		},

		// 内存使用率
		memory_use_chart : function (el ,paramObj){
			monitorInfo.cpu_memo_use_rate({
		        url : "monitorview/os/windows/queryAllUsageInfo",
		        paramObj : paramObj,
		        line_chart : el,
		        type:"memory"
		    })
		},

		// 内存当前信息
		memory_info_chart : function (el_phy_memory ,el_ver_memory ,paramObj){
			um_ajax_get({
		        url : "monitorview/os/windows/queryAllUsageInfoCurrent",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function(data){
		            var PhysicalMem = data.PhysicalMem
		            var memThreshold = data.memThreshold
		            monitorInfo.memory_info_render(el_phy_memory,{
		                title : "物理内存",
		                not_used_val : PhysicalMem.freePhisicalMemory ? PhysicalMem.freePhisicalMemory : 0,
		                used_val : PhysicalMem.usedPhisicalMemory ? PhysicalMem.usedPhisicalMemory : 0,
		                used_rate : PhysicalMem.memoryUsage ? PhysicalMem.memoryUsage : 0,
		                fauleThreshold : memThreshold.memFaultThreshold,
		                perfThreshold : memThreshold.memPerformanceThreshold
		            });

		            monitorInfo.memory_info_render(el_ver_memory,{
		                title : "虚拟内存",
		                not_used_val : PhysicalMem.freeVirtualMemory ? PhysicalMem.freeVirtualMemory : 0,
		                used_val : PhysicalMem.usedVirtualMemory ? PhysicalMem.usedVirtualMemory : 0,
		                used_rate : PhysicalMem.virtualMemoryUsage ? PhysicalMem.virtualMemoryUsage : 0
		            });
		        }
		    });
		},

		// 磁盘使用
		first_disk_chart : function (el ,paramObj){
			monitorInfo.disk_used_chart(el ,{
		        paramObj : paramObj
		    });
		},

		// 磁盘IO
		io_list : function (el ,paramObj){
			var io_list_url="monitorview/os/windows/queryDiskIOInfo";
			var io_list_header = [
			                              {text:"磁盘名称" ,name:"physicalVolume"},
			                              {text:"总速度(MB/s)" ,name:"speed"},
			                              {text:"读速度(MB/s)" ,name:"readSpeed"},
			                              {text:"写速度(MB/s)" ,name:"writeSpeed"},
			                              {text:"获取时间" ,name:"enterDate"}
			                           ];
		    g_grid.render(el ,{
		        url : io_list_url,
		        header : io_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		// 补丁
		node_list : function (el ,paramObj){
			var node_list_url="monitorview/os/windows/queryPatchInfo";
			var node_list_header = [
		                              {text:"补丁号" ,name:"patchId"},
		                              {text:"补丁描述" ,name:"desc"},
		                              {text:"获取时间" ,name:"enterDate"}
		                           ]
			g_grid.render(el ,{
		        url : node_list_url,
		        header : node_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		network_list : function (el ,paramObj){
			var Network_list_url="monitorview/os/liunx/queryLinuxIPMacInfo";
			var Network_list_header = [
			                              {text:"网卡名称" ,name:"nicName"},
			                              {text:"MAC地址" ,name:"nicMac"},
			                              {text:"IP地址" ,name:"nicIp"},
			                              {text:"子网掩码" ,name:"nicMask"},
			                              {text:"网关地址" ,name:"nicBroadcast"},
			                              // {text:"发送速度" ,name:"nicSend"},
			                              // {text:"接收速度" ,name:"nicRecevice"}
			                           ];
			g_grid.render($("#system_info_table") ,{
		        url : Network_list_url,
		        header : Network_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		system_process_list : function (el ,paramObj){
			var process_list_header = [
			                              {text:"进程ID" ,name:"processId"},
			                            /*  {text:"使用用户" ,name:"userName"},*/
			                              {text:"映像名称" ,name:"imageName"},
			                              {text:"CPU使用率(%)" ,name:"cpuUsage"},
			                              {text:"内存使用率(%)" ,name:"memUsage"},
			                              {text:"占用CPU时间" ,name:"cpuTime"},
			                              {text:"获取时间" ,name:"enterDate"}
			                           ];

			var user_val = $("[data-flag=process_sel]").eq(0).val();
		    var img_val = $("[data-flag=process_sel]").eq(1).val();
		    var sort_val = $("[data-flag=process_sel]").eq(2).val();

		    if (user_val == "----" && img_val == "----")
		    {
		        $("[data-flag=process_sel]").eq(2).removeAttr("disabled");
		    }
		    else
		    {
		        $("[data-flag=process_sel]").eq(2).attr("disabled" ,"disabled");
		    }
		    if(sort_val == "----")
		    {
		        $("[data-flag=process_sel]").eq(0).removeAttr('disabled');
		        $("[data-flag=process_sel]").eq(1).removeAttr('disabled');
		    }
		    else
		    {
		        $("[data-flag=process_sel]").eq(0).attr('disabled', 'disabled');
		        $("[data-flag=process_sel]").eq(1).attr('disabled', 'disabled');
		    }

			var obj = new Object();
		    obj.monitorId = paramObj.monitorId;
		    obj.time = paramObj.time;
		    obj.regionId = paramObj.regionId;
		    obj.userName = "----"
		    obj.imageName = "----"
		    obj.orderBy = "----"

		    g_grid.render($("#system_info_table") ,{
		        url : "monitorview/os/windows/queryProcessDynamicListByAttStatus",
		        header : process_list_header,
		        paramObj : obj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		process_list : function (el ,paramObj){
			var process_list_url = "monitorview/os/windows/queryProcessList";
			var process_list_heard = [
								  {text:'进程名称',name:"procName"},
								  {text:'进程数量',name:"procNum"},
								  {text:'进程路径',name:"aixPath" ,tip : true,render:function(txt){
									  if (txt && txt.length > 20)
									  {
										  return txt.substr(0 ,20) + "...";
									  }
									  return txt;
								  }},
								  // {text:'关注状态',name:"atteStatus"},
								  {text:'运行状态',name:"runStatus"},
								  {text:'数据获取时间',name:"enterDate"}
								];
			//进程
		    g_grid.render(el ,{
		        url : process_list_url,
		        header : process_list_heard,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
				paginator : false,
				showCount : true,
		        allowCheckBox : false
		    });
		},
		port_list : function (el ,paramObj){
			//端口
			var port_list_heard = [
								  {text:'端口名称',name:"portName"},
								  // {text:'关注状态',name:"atteStatusName"},
								  {text:'运行状态',name:"runStatusName"},
								  {text:'进程信息',name:"processInfo"},
								  {text:'进程用户',name:"processUser"},
								  {text:'进程ID(pid)',name:"processId"},
								  {text:'获取时间',name:"enterDate"}
								];
			var port_list_url = "monitorview/os/windows/queryHostsPortList";
			g_grid.render(el ,{
		        url : port_list_url,
		        header : port_list_heard,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
				paginator : false,
				showCount : true,
		        allowCheckBox : false
		    });
		},
		msconfig_list : function (el ,paramObj){
			var msconfig_list_head = [
						  {text:'启动项名称',name:"runName"},
						  // {text:'关注状态',name:"atteStatusName"},
						  {text:'获取时间',name:"enterDate"}
						];
			var msconfig_list_url = "monitorview/os/windows/queryStartUpList";

			g_grid.render(el ,{
		        url : msconfig_list_url,
		        header : msconfig_list_head,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
				paginator : false,
				showCount : true,
		        allowCheckBox : false
		    });
		},
		account_list : function (el ,paramObj){
			var account_list_head = [
								  {text:'策略名称',name:"policyName",render : function (txt){
								  		return txt;					  }},
								  {text:'策略描述',name:"t",render : function (txt ,rowData){
								  		return dict_pass_info[rowData.policyName];
								  }},
								  {text:'策略值',name:"policyValue"},
								  {text:'获取时间',name:"enterDate"}
								];
			var account_list_url = "monitorview/os/windows/queryPolicyList";
			g_grid.render(el ,{
		        url : account_list_url,
		        header : account_list_head,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
				paginator : false,
				showCount : true,
		        allowCheckBox : false
		    });
		},
		script_config_list : function (el ,paramObj){
			var script_config_list_url = "monitorview/os/windows/queryScriptList";
			var script_config_list_head = [
									      {text:"脚本全路径" ,name:"scriptFullpath"},
									      {text:"参数" ,name:"arg"},
									      {text:"执行结果" ,name:"scriptResult"},
									      {text:"获取时间" ,name:"enterDate"}
									   ];
			g_grid.render(el ,{
				url : script_config_list_url,
				header : script_config_list_head,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false
			});
		},
		//日志文件关键字监控
		file_config_list : function (el ,paramObj){
			if (!el.data("isInit"))
			{
				$("#add_btn").click(function (){
					edit_template_init();
				})
				el.data("isInit" ,true)
			}
			$("#add_btn").show()
			var file_config_list_url = "monitorview/os/windows/queryLogFile";
			var file_config_list_head = [
									      {text:"文件路径" ,name:"filePath"},
									      {text:"录入时间" ,name:"enterDate"},
									      {text:"关键字" ,name:"keywordId", render:function(){
									    	  return "<a href='javascript:void(0);'>详情</a>"
									      },click:function (rowData){
									    	  keyword_detail_get(rowData);
									      }},
									      {text:"匹配结果" ,name:"result", render:function(){
									    	  return "<a href='javascript:void(0);'>详情</a>"
									      },click:function (rowData){
									    	  result_detail_get(rowData);
									      }}
									   ];
			var index_oper = [
									{icon:"icon-location-arrow" ,text:"匹配" ,aclick:match_btn},
								  	{icon:"icon-edit" ,text:"修改" ,aclick:edit_template_init},
								  	{icon:"icon-trash" ,text:"删除" ,aclick:delete_btn}
							 ];
			var detail_list_url = "monitorview/os/windows/queryFileKeyword";
			var keyword_detail_list_header = [
			    						      {text:"关键字" ,name:"keywordName"},
			    						      {text:"匹配规则" ,name:"fileRule"},
			    						      {text:"次数" ,name:"times"}
			    						];

			var result_detail_list_header = [
			    						      {text:"关键字" ,name:"keywordName"},
			    						      {text:"匹配规则" ,name:"fileRule"},
			    						      {text:"次数" ,name:"times"},
			    						      {text:"匹配结果" ,name:"result"}
			    						];
			var config_create_url = "monitorview/os/windows/logfileConfig";
			var config_update_url = "monitorview/os/windows/updLogfile";
			var config_delete_url = "monitorview/os/windows/deleteLogfile";
			var config_match_url =  "monitorview/os/windows/matchFileKeyword";
			var file_key_word_url = "monitorview/os/windows/queryFileKeyword";
			g_grid.render(el ,{
				url : file_config_list_url,
				header : file_config_list_head,
				oper: index_oper,
				operWidth:"100px",
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				tdClick : true
			});

			function keyword_detail_get(rowData)
			{
				g_dialog.dialog($("#tem").find("[id=keyword_detail_tem]").html(),{
					width:"700px",
					init:init,
					title:"日志文件关键字详情",
					isDetail : true
				});
				
				function init(aEl)
				{
					aEl.umDataBind("render" ,rowData);
					g_grid.render(aEl.find("#keyword_detail_list_div") ,{
						url : detail_list_url,
						header : keyword_detail_list_header,
						paramObj : {keywordId:rowData.keywordId,regionId:paramObj.regionId},
						gridCss : "um-grid-style",
						hasBorder : false,
						hideSearch : true,
						allowCheckBox : false,
						tdClick : true
					});
				}
			}

			function result_detail_get(rowData)
			{
				g_dialog.dialog($("#tem").find("[id=result_detail_tem]").html(),{
					width:"700px",
					init:init,
					title:"匹配结果详情",
					isDetail : true
				});
				
				function init(bEl)
				{
					bEl.umDataBind("render" ,rowData);
					g_grid.render(bEl.find("#result_detail_list_div") ,{
						url : detail_list_url,
						header : result_detail_list_header,
						paramObj : {keywordId:rowData.keywordId,regionId:paramObj.regionId},
						gridCss : "um-grid-style",
						hasBorder : false,
						hideSearch : true,
						allowCheckBox : false,
						tdClick : true
					});
				}
			}

			function edit_template_init(rowData)
			{
				var title = rowData ? "日志文件关键字监控修改" : "日志文件关键字监控新增";
				g_dialog.dialog($("#tem").find("[id=config_edit_template]").html(),{
					width:"800px",
					init:init,
					title:title,
					initAfter:initAfter,
					saveclick:save_click,
				});

				function init(cEl)
				{
					if (rowData)
					{
						$(cEl).umDataBind("render" ,rowData);
					}
					g_grid.render(cEl.find("[id=config_edit_table]") ,{
						data : [],
						header : keyword_detail_list_header,
						gridCss : "um-grid-style",
						hideSearch : true,
						paginator : false
					});
					cEl.find("[id=chevron-right]").click(function (){
						if (!g_validate.validate(cEl.find("[id=form-left-div]")))
						{
							return false;
						}
						if (cEl.find("[data-flag=keywordName]").val()=="") 
						{
							g_validate.setError(cEl.find("[data-flag=keywordName]"),"不能为空。");
							return false;
						} 
						else 
						{
							g_validate.setError(cEl.find("[data-flag=keywordName]"),"");
						}
						if (cEl.find("[data-flag=times]").val()=="") 
						{
							g_validate.setError(cEl.find("[data-flag=times]"),"不能为空。");
							return false;
						} 
						else 
						{
							g_validate.setError(cEl.find("[data-flag=times]"),"");
						}
						var keywordNameArray = g_grid.getIdArray(cEl.find("[id=config_edit_table]") ,{attr:"keywordName"});
						if (keywordNameArray.indexOf(cEl.find("[data-flag=keywordName]").val()) != -1)
						{
							g_dialog.operateAlert(cEl ,"记录重复！" ,"error");
							return false;
						}

						g_grid.addData(cEl.find("[id=config_edit_table]") ,[{
							keywordName : cEl.find("[data-flag=keywordName]").val(),
							fileRule : cEl.find("[data-flag=fileRule]").val(),
							times : cEl.find("[data-flag=times]").val()
						}]);
						cEl.find("[data-flag=keywordName]").val("");
						cEl.find("[data-flag=times]").val("");
					});

					cEl.find("[id=chevron-left]").click(function (){
						var data = g_grid.getData(cEl.find("[id=config_edit_table]") ,{chk:true});
						if (data.length == 0)
						{
							g_dialog.operateAlert(cEl ,"请选择一条记录。" ,"error");
						}
						else if (data.length > 1)
						{
							g_dialog.operateAlert(cEl ,"只允许选择一条记录。" ,"error");
						}
						else
						{
							cEl.find("[data-flag=keywordName]").val(data[0].keywordName);
							cEl.find("[data-flag=fileRule]").val(data[0].fileRule);
							cEl.find("[data-flag=times]").val(data[0].times);
							cEl.find("[data-flag=fileRule]").trigger("change");
							g_grid.removeData(cEl.find("[id=config_edit_table]"));
						}
						
					});
				}

				function initAfter(cEl)
				{
					if (rowData)
					{
						cEl.umDataBind("render" ,rowData);
						um_ajax_get({
							url : file_key_word_url,
							paramObj : {keywordId:rowData.keywordId,regionId:paramObj.regionId},
							maskObj:cEl,
							successCallBack : function (data){
								g_grid.addData(cEl.find("[id=config_edit_table]") ,data);
							}
						});
					}
				}

				function save_click(cEl ,saveObj)
				{
					if (!g_validate.validate(cEl)){
						return false;
					}
					saveObj.fileKeywordStore = g_grid.getData(cEl.find("[id=config_edit_table]"));
					if (saveObj.fileKeywordStore.length==0) 
					{
						g_dialog.operateAlert(cEl ,"请完善配置。" ,"error");
						return false;
					}
					for(var i = 0; i < saveObj.fileKeywordStore.length; i++)
					{
						var fileRuleTmp = saveObj.fileKeywordStore[i].fileRule;
						if(fileRuleTmp==">"){
							saveObj.fileKeywordStore[i].keywordRule="1";
						}else if(fileRuleTmp=="="){
							saveObj.fileKeywordStore[i].keywordRule="2";
						}else if(fileRuleTmp=="<"){
							saveObj.fileKeywordStore[i].keywordRule="3";
						}
					}

					var flag_url = config_create_url;
					if(rowData){
						flag_url = config_update_url;
					}
					saveObj.monitorId = paramObj.monitorId;
					saveObj.edId = paramObj.assetId;
					saveObj.regionId = paramObj.regionId;
					um_ajax_post({
						url : flag_url,
						paramObj: saveObj,
						maskObj:cEl,
						successCallBack : function(data){
							g_dialog.hide(cEl);
							g_dialog.operateAlert(null ,"操作成功");
							file_config_list();
						}
					})
				}
			}

			function match_btn(rowData)
			{
				var obj = new Object();
				obj.monitorId = paramObj.monitorId;
				obj.edId = paramObj.assetId;
				obj.regionId = paramObj.regionId;
				obj.keywordId = rowData.keywordId;
				obj.time = $("#query_time_label").text();
				obj.filePath = rowData.filePath;
				um_ajax_post({
					url : config_match_url,
					paramObj : obj,
					maskObj:el,
					successCallBack : function (data){
						g_dialog.operateAlert($("#file_config_panel") ,"匹配完成。");
					}
				});
			}

			function delete_btn(rowData){
				var obj = new Object();
				obj.monitorId = paramObj.monitorId;
				obj.edId = paramObj.assetId;
				obj.regionId = paramObj.regionId;
				obj.keywordId = rowData.keywordId;
				g_dialog.operateConfirm(index_delete_confirm_msg ,{
					saveclick : function (){
						um_ajax_post({
							url : config_delete_url,
							paramObj : obj,
							maskObj:el,
							successCallBack : function (){
								g_dialog.operateAlert();
								file_config_list();
							}
						});
					}
				})
			}
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
})