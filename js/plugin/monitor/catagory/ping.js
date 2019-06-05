define(['/js/plugin/monitor/monitorInfo.js','/js/plugin/plot/plot.js'] ,function (monitorInfo,plot){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/protocol/ping/queryPingBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},

		// ping信息
		ping_info_list : function (el ,paramObj){
			var ping_info_list_url="monitorview/protocol/ping/queryPingInfo";
			var ping_info_list_header = [
					                          {text:"目标机IP" ,name:"pingIp"},
										      {text:"跳出时间(毫秒)" ,name:"timeOut"},
										      {text:"连接跳数" ,name:"pingTtl"},
										      {text:"是否连通" ,name:"pingResult" ,render:function (txt){
										      	if (txt == "true")
										      		return "是"
										      	else
										      		return "否"
										      	return ""
										      }},
										      {text:"连接时间(毫秒)" ,name:"pingCost"},
										      {text:"结束时间" ,name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : ping_info_list_url,
		        header : ping_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		// traceroute信息
		traceroute_info_list : function (el ,paramObj){
			var traceroute_info_list_url="monitorview/protocol/ping/queryTracerouteInfo";
			var traceroute_info_list_header = [
						                            {text:"连接次数" ,name:"tracerouteNum"},
											        {text:"目标机IP" ,name:"tracerouteIp"},
											        {text:"通过的IP" ,name:"tracerouteIp1"},
											        {text:"连接平均时间(毫秒)" ,name:"tracerouteEqtime"},
											        {text:"结束时间" ,name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : traceroute_info_list_url,
		        header : traceroute_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		response_time_chart : function( urlParamObj){
			var self = this
			urlParamObj.id = 7
			um_ajax_get({
		        url : "monitor/queryMonitorInfoStatByAttrId",
		        paramObj : urlParamObj,
		        isLoad : false,
		        successCallBack : function (data1){
		        	var data = data1[0].res_time
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
		                categoryArray.push(data[i].ENTER_DATE);
		            	responseTimeObj.data.push(data[i].AVG_RTT);
		            }
		            seriesArray.push(responseTimeObj);

		            plot.lineRender($("#response_time_chart_div") ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                grid: {
		                    left: '6%',
		                    right: '8%',
		                    bottom: '3%',
		                    containLabel: true
		                },
		                axisLabelFormatter : function (value){
							return value.substr(5)
						}
		            });
		        }
		    });
		},

		bad_loss_chart : function( urlParamObj){
			var self = this
			urlParamObj.id = 6
			um_ajax_get({
		        url : "monitor/queryMonitorInfoStatByAttrId",
		        paramObj : urlParamObj,
		        isLoad : false,
		        successCallBack : function (data1){
		        	var data = data1[0].packet_loss
		        	if (!data || data.length == 0)
		        		return false
		            var legendArray = ['丢包率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var responseTimeObj = new Object();
		            responseTimeObj.name = '丢包率(%)';
		            responseTimeObj.type = "line";
		            responseTimeObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].ENTER_DATE);
		            	responseTimeObj.data.push(data[i].PACKET_LOSS);
		            }
		            seriesArray.push(responseTimeObj);

		            plot.lineRender($("#bad_loss_chart_div") ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                grid: {
		                    left: '6%',
		                    right: '8%',
		                    bottom: '3%',
		                    containLabel: true
		                },
		                axisLabelFormatter : function (value){
							return value.substr(5)
						}
		            });
		        }
		    });
		}
	}
})