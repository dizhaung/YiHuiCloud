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
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/network/huawei/queryHuaWeiCpuMemInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var cpuStore = data.cpuStore;
		            var memStore = data.memStore;
		            var legendArray
		            if (type == "cpu")
		            	legendArray = ['CPU使用率(%)'];
		            else
		            	legendArray = ['内存使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

		            if (type == "cpu")
		            {
		            	var seriesCpuObj = new Object();
			            seriesCpuObj.name = 'CPU使用率(%)';
			            seriesCpuObj.type = "line";
			            seriesCpuObj.data = [];
			            for (var i = 0; i < cpuStore.length; i++) {
			                categoryArray.push(cpuStore[i].updateDate);
			                seriesCpuObj.data.push(cpuStore[i].cpuUsage);
			            }
			            seriesArray.push(seriesCpuObj);
		            }
		            if (type == "memory")
		            {
		            	var seriesMemObj = new Object();
			            seriesMemObj.name = '内存使用率(%)';
			            seriesMemObj.type = "line";
			            seriesMemObj.data = [];
			            for (var i = 0; i < memStore.length; i++) {
			            	categoryArray.push(memStore[i].updateDate);
			                seriesMemObj.data.push(memStore[i].memoryUsage);
			            }
			            seriesArray.push(seriesMemObj);
		            }
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5']
		            });

		        }
		    }); 
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
})