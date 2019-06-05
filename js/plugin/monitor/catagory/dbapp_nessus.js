
define(['/js/plugin/monitor/monitorInfo.js'] ,function (monitorInfo){
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
		        }
		    });
		},

		// cpu当前使用信息
		cpu_info_chart : function (paramObj){
			monitorInfo.cpu_use_rate_render({
				url : "monitorview/os/windows/queryAllUsageInfoCurrent",
		        paramObj : paramObj,
		        cpu_current_use_bg : $("#cpu_current_use_bg"),
		        one_secend : $("#one_secend"),
		        five_secend : $("#five_secend"),
		        fifteen_secend : $("#fifteen_secend"),
		        cpu_label : $("#cpu_current_use_label")
			})
		},

		// cpu使用率
		cpu_use_chart : function (el ,paramObj){
			monitorInfo.cpu_memo_use_rate({
		        url : "monitorview/os/windows/queryAllUsageInfo",
		        paramObj : paramObj,
		        line_chart : el,
		        type:"cpu"
		    })  
		},

		// 内存当前信息
		memory_info_chart : function (el_phy_memory ,el_ver_memory ,paramObj){
			um_ajax_get({
		        url : "monitorview/os/windows/queryMemoryDynamicInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function(data){
		            monitorInfo.memory_info_render(el_phy_memory,{
		                title : "物理内存",
		                not_used_val : data[0] ? data[0].freePhisicalMemory : 0,
		                used_val : data[0] ? data[0].usedPhisicalMemory : 0,
		                used_rate : data[0] ? data[0].memoryUsage : 0
		            });

		            monitorInfo.memory_info_render(el_ver_memory,{
		                title : "虚拟内存",
		                not_used_val : data[0] ? data[0].freeVirtualMemory : 0,
		                used_val : data[0] ? data[0].usedVirtualMemory : 0,
		                used_rate : data[0] ? data[0].virtualMemoryUsage : 0
		            });
		        }
		    });
		},

		// 内存使用率
		memory_use_chart : function (el ,paramObj){
			monitorInfo.cpu_memo_use_rate({
		        url : "monitorview/os/windows/queryAllUsageInfoByChooseTime",
		        paramObj : paramObj,
		        line_chart : el,
		        type:"memory"
		    })
		},

		// 磁盘使用
		first_disk_chart : function (el ,paramObj){
			el.addClass("prel")
			el.css("padding-left" ,"20px")
			var disk_used_url = "monitorview/os/windows/queryTotalDiskDynamicInfoByAttStatus";
			um_ajax_get({
		        url : disk_used_url,
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var buffer = [];
		            var freeSize;
		            var usedSize;
		            var totalSize;
		            var _tmp
		            for (var i = 0; i < data.length; i++) {
		            	if (data[i].mountName != "TOTAL")
		            	{
		            		freeSize = parseFloat(data[i].freeSize);
			                usedSize = parseFloat(data[i].usedSize);
			                totalSize = (freeSize + usedSize).toFixed(2);
			                buffer.push('<div class="col-lg-4">');
			                buffer.push('<div class="disk-info">');
			                buffer.push('<span>'+data[i].mountName+'</span>');
			                buffer.push('<span class="disk-chart"><div style="width:'
			                                    +(data[i].diskUsage)+'%"></div></span>');
			                buffer.push('<span>'+data[i].freeSize+'GB可用，共'+data[i].totalSize+'GB</span>');
			                buffer.push('</div></div>');
		            	}
		            	else
		            		_tmp = data[i]
		            }
		            el.html(buffer.join(""));
		        }
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
		network_list : function (el ,paramObj){
			var Network_list_url="monitorview/os/liunx/queryLinuxIPMacInfo";
			var Network_list_header = [
			                              {text:"网卡名称" ,name:"nicName"},
			                              {text:"MAC地址" ,name:"nicMac"},
			                              {text:"IP地址" ,name:"nicIp"},
			                              {text:"子网掩码" ,name:"nicMask"},
			                              {text:"网关地址" ,name:"nicBroadcast"},
			                              {text:"发送速度" ,name:"nicSend"},
			                              {text:"接收速度" ,name:"nicRecevice"},
			                               {text:"入口总流量" ,name:"nicReceviceTotal",render:function(txt,rowData){                                                    
                                                    if(txt!=null && txt)
                                                    {
                                                    	  return changeUnit(txt);
                                                    }                                                  
			                              }},
			                              {text:"入口当前流量" ,name:"nicReceviceCurr",render:function(txt,rowData){                                                    
                                                    if(txt!=null && txt)
                                                    {
                                                    	  return changeUnit(txt);
                                                    }                                                  
			                              }},
			                              {text:"入口错误包数" ,name:"nicReceviceError"},
			                              {text:"入口丢失包数" ,name:"nicReceviceDrop"},
			                              {text:"出口总流量" ,name:"nicSendTotal",render:function(txt,rowData){                                                    
                                                    if(txt!=null && txt)
                                                    {
                                                    	  return changeUnit(txt);
                                                    }                                                  
			                              }},
			                              {text:"出口当前流量" ,name:"nicSendCurr",render:function(txt,rowData){                                                    
                                                    if(txt!=null && txt)
                                                    {
                                                    	  return changeUnit(txt);
                                                    }                                                  
			                              }},
			                              {text:"出口错误包数" ,name:"nicSendError"},
			                              {text:"出口丢失包数" ,name:"nicSendDrop"},
			                              {text:"状态" ,name:"status",render:function(txt){
			                              	  if(txt && txt != null)
			                              	  {
			                              	  	 if("yes"==txt){
			                              	  	 	return "正常"
			                              	  	 }
			                              	  	 else{
			                              	  	 	return  "异常"
			                              	  	 }
			                              	  }
			                              }}
			                           ];
			g_grid.render($("#system_info_table") ,{
		        url : Network_list_url,
		        header : Network_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        tableWidth :"2000px"
		    });
		},
		user_access_list : function (el ,paramObj){
			var user_access_list_url = "monitorview/os/liunx/queryLinuxUserAuditInfo";
			var user_access_list_head = [
									      {text:"登录用户名" ,name:"userName",searchRender:function (el){
									      	el.append('<input type="hidden" search-data="monitorId" value="'+paramObj.monitorId+'" searchCache/>');
									      	el.append('<input type="hidden" search-data="time" value="'+$("#query_time_label").text()+'" searchCache/>');
									      	el.append('<input type="hidden" search-data="regionId" value="'+paramObj.regionId+'" searchCache/>');
									      	el.append('<input class="form-control input-sm" search-data="userName" type="text">');
									      }},
									      {text:"登录IP" ,name:"loginIp" ,searchRender:function (el){
											index_render_div(el ,{type:"ip" ,startKey:"login_ip_start" ,endKey:"login_ip_end"});
										  }},
									      {text:"登录时间" ,name:"loginDate",searchRender:function (el){
											index_render_div(el ,{type:"date",startKey:"loginStart" ,endKey:"loginEnd"});
										  }},
									      {text:"登出时间" ,name:"logOutDate",searchRender:function (el){
											index_render_div(el ,{type:"date",startKey:"logoutStart" ,endKey:"logoutEnd"});
										  }},
									   ];		
			g_grid.render(el ,{
				url : user_access_list_url,
				header : user_access_list_head,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				allowCheckBox : false,

			});
		}
	}
	function changeUnit(txt)
	{
		var gtxt = parseInt(txt)/1024/1024/1024;
		var mtxt = parseInt(txt)/1024/1024;
		var ktxt = parseInt(txt)/1024;
		if(parseInt(gtxt)>0)
		{
            return gtxt.toFixed(2)+"GB";
		}
		else
		{
			if (parseInt(mtxt)) {
				return mtxt.toFixed(2)+"MB";
			}
			else
			{
				if(parseInt(ktxt)>0)
				{
					return ktxt.toFixed(2)+"KB";
				}
				else
				{
					return txt;
				}
			}
		}
	}
})