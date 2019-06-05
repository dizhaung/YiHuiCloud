define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/plot/plot.js',] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonurl/queryCommonUrlMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
            		$("#base_info_asset_div").find("[data-id=port]").text(data.monitorbaseinfo.port)
		        }
		    });
		},
		
		// 响应时间图表
		response_time_chart : function (urlParamObj){
			urlParamObj.urlConfigId = $("#url_sel").val();
			um_ajax_get({
		        url : "monitorview/commonmonitor/commontcp/queryTimeDynamicInfo",
		        paramObj : urlParamObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	if (!data || data.length == 0)
		        		return false
		            var legendArray = ['响应时间(ms)'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var responseTimeObj = new Object();
		            responseTimeObj.name = '响应时间(ms)';
		            responseTimeObj.type = "line";
		            responseTimeObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].updateDate);
		            	responseTimeObj.data.push(data[i].responseTime);
		            }
		            seriesArray.push(responseTimeObj);

		            plot.lineRender($("#response_time_chart_div") ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                grid: {
		                    left: '8%',
		                    right: '8%',
		                    bottom: '3%',
		                    containLabel: true
		                },
		                /*axisLabelFormatter : function (value){
							return value.substr(5)
						}*/
		            });
		        }
		    });
		}
		
	}
})