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
		        }
		    });
		},
		url_sel_render : function (urlParamObj){
			$("#url_sel").empty()
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonurl/queryCommonUrlConfig",
		        paramObj : {monitorId : urlParamObj.monitorId},
		        isLoad : false,
		        successCallBack : function (data){
		            for (var i = 0; i < data.length; i++) {
		                $("#url_sel").append('<option value="'+data[i].urlConfigId+'">'+data[i].urlAddress+'</option>')
		            }
		            $("#url_sel").trigger("change");
		            // if (flag)
		            // {
		            //     page_info();
		            // }
		        }
		    });
		},
		// 页面信息
		page_info_render : function (urlParamObj){
			$("#page_info").umDataBind("reset");
		    urlParamObj.urlConfigId = $("#url_sel").val();
		    um_ajax_get({
		        url : "monitorview/commonmonitor/commonurl/queryPageInfo",
		        paramObj : urlParamObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#page_info").umDataBind("render" ,data);
		        }
		    });
		},
		// 响应时间图表
		response_time_chart : function (urlParamObj){
			urlParamObj.urlConfigId = $("#url_sel").val();
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonurl/queryResponseTime",
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
		                categoryArray.push(data[i].enterDate);
		            	responseTimeObj.data.push(data[i].responseTime);
		            }
		            seriesArray.push(responseTimeObj);

		            plot.lineRender($("#response_time_chart_div") ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                grid: {
		                    left: '10%',
		                    right: '10%',
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
		// 页面大小图表
		page_size_chart : function (urlParamObj){
			urlParamObj.urlConfigId = $("#url_sel").val();
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonurl/queryResponseTime",
		        paramObj : urlParamObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	if (!data || data.length == 0)
		        		return false
		            var legendArray = ['页面大小(字节)'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var urlPageSizeObj = new Object();
		            urlPageSizeObj.name = '页面大小(字节)';
		            urlPageSizeObj.type = "line";
		            urlPageSizeObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].enterDate);
		                urlPageSizeObj.data.push(data[i].urlPageSize);
		            }
		            seriesArray.push(urlPageSizeObj);

		            plot.lineRender($("#page_size_chart_div") ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                grid: {
		                    left: '10%',
		                    right: '10%',
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