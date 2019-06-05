define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/ruijie/queryRuijieBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		// TCP信息
		tcp_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/ruijie/queryTCPInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#tcp_info_monitor_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		// UDP信息
		udp_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/ruijie/queryUDPInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#udp_info_monitor_div").umDataBind("render" ,data[0]);
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
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
});