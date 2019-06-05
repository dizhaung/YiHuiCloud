define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/huawei/queryHuaweiBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		            $("[data-id=interfaceCount]").text(data.interfaceStore.interfaceCount);
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/network/cisco/queryCPUDynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var cpuStore = data;
		            var legendArray = ['CPU使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

		            var seriesObj = new Object();
		            seriesObj.name = 'CPU使用率(%)';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < cpuStore.length; i++) {
		                categoryArray.push(cpuStore[i].updateDate);
		                seriesObj.data.push(cpuStore[i].cpuUsage);
		            }
		            seriesArray.push(seriesObj);
		     
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31'],
		                axisLabelFormatter : function (value){
							return value.substr(5)
						}
		            });

		        }
		    }); 
		},
		mem_use_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/network/cisco/queryMemoryUsageDynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var memStore = data;
		            var legendArray = ['内存使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

		            var seriesMemObj = new Object();
		            seriesMemObj.name = '内存使用率(%)';
		            seriesMemObj.type = "line";
		            seriesMemObj.data = [];
		            for (var i = 0; i < memStore.length; i++) {
		            	categoryArray.push(memStore[i].enterDate);
		                seriesMemObj.data.push(memStore[i].memoryUsage);
		            }
		            seriesArray.push(seriesMemObj);
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#23b7e5'],
		                axisLabelFormatter : function (value){
							return value.substr(5)
						}
		            });

		        }
		    }); 
		},
		temperature_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/network/cisco/queryTempeInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var legendArray = ['温度(℃)'];
		            var categoryArray = [];
		            var seriesArray = [];

		            var seriesObj = new Object();
		            seriesObj.name = '温度(℃)';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		            	categoryArray.push(data[i].updateDate);
		                seriesObj.data.push(data[i].temperValue);
		            }
		            seriesArray.push(seriesObj);
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#23b7e5']
		            });

		        }
		    }); 
		},
		// 端口配置
		port_config_list : function (el ,paramObj){
			var port_info_list_url="monitorview/network/cisco/queryPortConfigInfo";
			var port_info_list_header = [
					                        {text:'端口号',name:"port"},
				                            {text:'类型',name:"type"},
				                            {text:'监控时间',name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : port_info_list_url,
		        header : port_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 启动时
		start_list : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/network/cisco/queryConfigInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	var buffer = []
		        	var reg = new RegExp('\n',"g")
		        	for (var i = 0; i < data.startupConf.length; i++) {
		        		buffer.push(data.startupConf[i].confContent.replace(reg , '</br>'))
		        	}
		        	el.html(buffer.join(""))
		        }
		    })
		},

		// 运行时
		running_list : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/network/cisco/queryConfigInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	var buffer = []
		        	var reg = new RegExp('\n',"g")
		        	for (var i = 0; i < data.runtimeConf.length; i++) {
		        		buffer.push(data.runtimeConf[i].confContent.replace(reg , '</br>'))
		        	}
		        	el.html(buffer.join(""))
		        }
		    })
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
});