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
		cpu_use_chart : function (el1 , el2, paramObj, type){
			um_ajax_get({
		        url : "monitorview/network/huawei/queryHuaWeiCpuMemInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var cpuStore = data.cpuStore;
		            var cpuLegendArray = ['CPU使用率(%)'];
	            	var seriesCpuObj = new Object();
		            seriesCpuObj.name = 'CPU使用率(%)';
		            seriesCpuObj.type = "line";
		            seriesCpuObj.data = [];
		            var cpucategoryArray = [];
		            for (var i = 0; i < cpuStore.length; i++) {
		                cpucategoryArray.push(cpuStore[i].updateDate);
		                seriesCpuObj.data.push(cpuStore[i].cpuUsage);
		            }
		            var cpuseriesArray = [];
		            cpuseriesArray.push(seriesCpuObj);

		            var memStore = data.memStore;
					var memLegendArray = ['内存使用率(%)'];
					var memseriesArray = [];
	            	var seriesMemObj = new Object();
		            seriesMemObj.name = '内存使用率(%)';
		            seriesMemObj.type = "line";
		            seriesMemObj.data = [];
		            var memcategoryArray = [];
		            for (var i = 0; i < memStore.length; i++) {
		            	memcategoryArray.push(memStore[i].updateDate);
		                seriesMemObj.data.push(memStore[i].memoryUsage);
		            }
		            var memseriesArray = [];
		            memseriesArray.push(seriesMemObj);
		            
		            plot.lineRender(el1 ,{
		                legend : cpuLegendArray,
		                category :cpucategoryArray,
		                series : cpuseriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31'],
		                axisLabelFormatter : function (value){
							return value.substr(5)
						}
		            });
		            plot.lineRender(el2 ,{
		                legend : memLegendArray,
		                category :memcategoryArray,
		                series : memseriesArray,
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
})