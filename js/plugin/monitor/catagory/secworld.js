define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/secworld/queryMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		            $("[data-id=interfaceCount]").text(data.interfaceStore.interfaceCount);
		        }
		    });
		},
		system_info : function(el, paramObj){
			um_ajax_get({
		        url : "monitorview/network/secworld/querySystemInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	el.umDataBind("render" ,data[0]);
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/network/secworld/queryCpuInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var legendArray = ['CPU使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

	            	var seriesObj = new Object();
		            seriesObj.name = 'CPU使用率(%)';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].enterDate);
		                seriesObj.data.push(data[i].cpuUsage);
		            }
		            seriesArray.push(seriesObj);
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31']
		            });

		        }
		    }); 
		},

		// 内存使用率
		mem_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/network/secworld/queryMemoryInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var legendArray = ['内存使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

	            	var seriesObj = new Object();
		            seriesObj.name = '内存使用率(%)';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].enterDate);
		                seriesObj.data.push(data[i].memoryUsage);
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

		// 磁盘使用
		disk_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/network/secworld/queryDiskInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var legendArray = ['磁盘使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

		            var seriesObj = new Object();
		            seriesObj.name = '磁盘使用率(%)';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].enterDate);
		                seriesObj.data.push(data[i].diskUsage);
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
		
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
});