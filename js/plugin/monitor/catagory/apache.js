define(['/js/plugin/monitor/monitorInfo.js','/js/plugin/plot/plot.js'] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/apache/queryApacheMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		            $("#static_info_div").umDataBind("render" ,data.staticInfo[0]);
		        }
		    });
		},
		chart_render : function (paramObj){
			var self = this
			um_ajax_get({
		        url : "monitorview/middleware/apache/queryRequestsInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	self.request_num_chart(data)
		        	self.transfer_num_chart(data)
		        	self.thread_chart(data)
		        	self.cpu_use_chart(data)
		        }
		    });
		},
		request_num_chart : function (data){
			var legendArray = ['每秒请求数'];
			var categoryArray = [];
			var seriesArray = [];
			var seriesObj = new Object();
			seriesObj.data = []
			for (var i = 0; i < data.length; i++) {
				seriesObj.name = '每秒请求数'
				seriesObj.type = "line";
				seriesObj.data.push(data[i].requests);
				categoryArray.push(data[i].enterDate);
			}
			seriesArray.push(seriesObj);
			plot.lineRender($("#request_num_chart"), {
				legend : legendArray,
				category :categoryArray,
				series : seriesArray,
				axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
			});
		},
		transfer_num_chart : function (data){
			var legendArray = ['请求传输量(KB/S)' ,'传输量(KB/S)'];
			var categoryArray = [];
			var seriesArray = [];
			var seriesObj = new Object();
			seriesObj.data = []
			for (var i = 0; i < data.length; i++) {
				seriesObj.name = '请求传输量(KB/S)'
				seriesObj.type = "line";
				seriesObj.data.push(data[i].tranQuantityReq);
				categoryArray.push(data[i].enterDate);
			}
			seriesArray.push(seriesObj);

			var seriesObj1 = new Object();
			seriesObj1.data = []
			for (var i = 0; i < data.length; i++) {
				seriesObj1.name = '传输量(KB/S)'
				seriesObj1.type = "line";
				seriesObj1.data.push(data[i].tranQuantitySec);
			}
			seriesArray.push(seriesObj1);
			plot.lineRender($("#transfer_num_chart"), {
				legend : legendArray,
				category :categoryArray,
				series : seriesArray,
				// tooltipFormatter : '{a0} : {c0}' + "KB/S" + '</br>' 
				// 						+ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{a1} : {c1}' + "KB/S",
				axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
			});
		},
		thread_chart : function (data){
			var legendArray = ['空闲线程数' ,'忙碌线程数'];
			var categoryArray = [];
			var seriesArray = [];
			var seriesObj = new Object();
			seriesObj.data = []
			for (var i = 0; i < data.length; i++) {
				seriesObj.name = '空闲线程数'
				seriesObj.type = "line";
				seriesObj.data.push(data[i].freeCount);
				categoryArray.push(data[i].enterDate);
			}
			seriesArray.push(seriesObj);

			var seriesObj1 = new Object();
			seriesObj1.data = []
			for (var i = 0; i < data.length; i++) {
				seriesObj1.name = '忙碌线程数'
				seriesObj1.type = "line";
				seriesObj1.data.push(data[i].busyCount);
			}
			seriesArray.push(seriesObj1);
			plot.lineRender($("#thread_chart"), {
				legend : legendArray,
				category :categoryArray,
				series : seriesArray,
				axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
			});
		},
		cpu_use_chart : function (data){
			var legendArray = ['CPU使用率(%)'];
			var categoryArray = [];
			var seriesArray = [];
			var seriesObj = new Object();
			seriesObj.data = []
			for (var i = 0; i < data.length; i++) {
				seriesObj.name = 'CPU使用率(%)'
				seriesObj.type = "line";
				seriesObj.data.push(data[i].cpuUsage);
				categoryArray.push(data[i].enterDate);
			}
			seriesArray.push(seriesObj);
			plot.lineRender($("#cpu_use_chart"), {
				legend : legendArray,
				category :categoryArray,
				series : seriesArray,
				axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
			});
		},

	}
});