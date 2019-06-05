define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/storage/venusload/queryVenusLoadBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/storage/venusload/queryVenusLoadInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var cpuData = data;
    				var physicalMemData = data;
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
			            for (var i = 0; i < cpuData.length; i++) {
			                categoryArray.push(cpuData[i].updateDate);
			                seriesCpuObj.data.push(cpuData[i].cpuUsage);
			            }
			            seriesArray.push(seriesCpuObj);
		            }
		            if (type == "memory")
		            {
		            	var seriesMemObj = new Object();
			            seriesMemObj.name = '内存使用率(%)';
			            seriesMemObj.type = "line";
			            seriesMemObj.data = [];
			            for (var i = 0; i < physicalMemData.length; i++) {
			                seriesMemObj.data.push(physicalMemData[i].memoryUsage);
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
		// 连接数
		session_num_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/storage/venusload/queryVenusLoadInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		        	var items = data;
				    var legendArray = ['连接数'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var sessionNumObj = new Object();
				    sessionNumObj.name = '连接数';
				    sessionNumObj.type = "line";
				    sessionNumObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].updateDate);
				        sessionNumObj.data.push(items[i].sessionNum);
				    }
				    seriesArray.push(sessionNumObj);

				    plot.lineRender(el ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray,
				        color_array : ['#f4bc37']
				    });
		        }
		    });		    
		},
		// 转发率
		forward_rate_chart : function (el ,paramObj){
			um_ajax_get({
				url : "monitorview/storage/venusload/queryVenusLoadInfo",
				paramObj : paramObj,
				isLoad:false,
				successCallBack : function (data){
					var items = data;
				    var legendArray = ['转发率(kbps)'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var forwardRateObj = new Object();
				    forwardRateObj.name = '转发率(kbps)';
				    forwardRateObj.type = "line";
				    forwardRateObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].updateDate);
				        forwardRateObj.data.push(items[i].forwardRate);
				    }
				    seriesArray.push(forwardRateObj);

				    plot.lineRender(el ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray,
				        color_array : ["#2380a6"]
				    });
				}
			});
		}
	}
});