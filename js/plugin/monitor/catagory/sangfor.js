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

		            um_ajax_get({
				        url : "Sangfor/querySangforBaseInfo",
				        paramObj : paramObj,
				        isLoad : false,
				        successCallBack : function (data){
				        	if (!data || data.length == 0)
				        		return false
				        	$("#base_info_monitor_div").find("[data-id=state]").text(data[0].state)
				        }
				    });
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
		            	legendArray = ['剩余内存(M)'];
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
			            seriesMemObj.name = '剩余内存(M)';
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
		// 并发会话趋势
		session_user_thruput_chart : function (el ,paramObj){
			um_ajax_get({
				url : "Sangfor/querySangforSessionUserLinkInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	var categoryArray = [];

		        	var seriesArray_1 = [];
		        	var seriesArray_2 = [];
		        	var seriesArray_3 = [];

		        	var seriesObj_1 = new Object()
	        		var seriesObj_2 = new Object()
	        		var seriesObj_3_a = new Object()
	        		var seriesObj_3_b = new Object()

	        		seriesObj_1.type = "line"
	        		seriesObj_2.type = "line"
	        		seriesObj_3_a.type = "line"
	        		seriesObj_3_b.type = "line"

	        		seriesObj_1.name = '会话数';
	        		seriesObj_2.name = '在线人数';
	        		seriesObj_3_a.name = '上行速率(Kbps)'
	        		seriesObj_3_b.name = '下行速率(Kbps)'

	        		seriesObj_1.data = []
	        		seriesObj_2.data = []
	        		seriesObj_3_a.data = []
	        		seriesObj_3_b.data = []

		        	for (var i = 0; i < data.length; i++) {
		        		categoryArray.push(data[i].enterDate)
		        		
		        		seriesObj_1.data.push(data[i].allConn)
		        		seriesObj_2.data.push(data[i].allUser)
		        		seriesObj_3_a.data.push(data[i].sslUpFlow)
		        		seriesObj_3_b.data.push(data[i].sslDownFlow)
		        	}

		        	seriesArray_1.push(seriesObj_1)
	        		seriesArray_2.push(seriesObj_2)
	        		seriesArray_3.push(seriesObj_3_a)
	        		seriesArray_3.push(seriesObj_3_b)

		        	plot.lineRender($("#session_line_chart") ,{
		                legend : ['会话数'],
		                category :categoryArray,
		                series : seriesArray_1,
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5' ,'#f4bc37'],
		                axisLabelFormatter : function (value){
							return value.substr(11)
						}
		            });

		            plot.lineRender($("#user_line_chart") ,{
		                legend : ['在线人数'],
		                category :categoryArray,
		                series : seriesArray_2,
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5' ,'#f4bc37'],
		                axisLabelFormatter : function (value){
							return value.substr(11)
						}
		            });

		            plot.lineRender($("#thruput_chart") ,{
		                legend : ['上行速率(Kbps)' ,'下行速率(Kbps)'],
		                category :categoryArray,
		                series : seriesArray_3,
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5' ,'#f4bc37'],
		                axisLabelFormatter : function (value){
							return value.substr(11)
						}
		            });
		        }
			})
		},
		// 线路状态
		line_table : function (el ,paramObj){
			var __header = [
							 {text : "线路" ,name : "sllName"},
							 {text : "IP地址" ,name : "sslIpv"},
							 {text : "发送" ,name : "sslUpFlow" ,render : function (txt){
							 	return txt + "Kbps"
							 }},
							 {text : "接收" ,name : "sslDownFlow" ,render : function (txt){
							 	return txt + "Kbps"
							 }},
							 {text : "状态" ,name : "state"},
						   ]
			g_grid.render($("#line_table") ,{
				//data : [{}],
		        url : "Sangfor/querySangforBaseInfo",
		        header : __header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        showCount : false,
		        paginator : false
		    });
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
});