define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/tomcat/queryTomcatMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
            		$("#base_info_asset_div").find("[data-id=port]").text(data.monitorbaseinfo.port)
		        }
		    });
		},

		//JVM
		JVM_info_render : function (el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/tomcat/queryTomcatJvmInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	el.umDataBind("render" ,data);
		        }
		    });
		},

		//JVM动态信息
		JVM_line_chart: function (el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/tomcat/queryMemoryInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var legendArray = [];
		            var categoryArray = [];
		            var seriesArray = [];
		            for (var i = 0; i < data.length; i++) {
		                legendArray.push(data[i].lineName+"内存(M)");
		                var seriesObj = new Object();
		                seriesObj.name = data[i].lineName+"内存(M)";
		                seriesObj.type = "line";
		                seriesObj.data = [];
		                for (var j = 0; j < data[i].items.length; j++) {
		                    seriesObj.data.push(data[i].items[j].value);
		                    if (i == 0)
		                    {
		                        categoryArray.push(data[i].items[j].lable);
		                    }
		                }
		                seriesArray.push(seriesObj);
		            }
		            plot.lineRender(el, {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });
		        }
		    }); 
		},

		//WEB模块信息
		WEB_module_info_list : function (el, paramObj) {
			var WEB_module_info_list_url="monitorview/middleware/tomcat/queryWebList";
			var WEB_module_info_list_header = [
							                        {text:'模块名称',name:"moduleName"},
													{text:'模块启用时间',name:"startDate"},
													{text:'状态',name:"status", render : function(text){
														return text == 0 ? "不可用" : "可用";
													}},
													{text:'获取时间',name:"enterDate"}
							                     ];
		    g_grid.render(el ,{
		        url : WEB_module_info_list_url,
		        header : WEB_module_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		WEB_module_info_list_v5 : function (el, paramObj) {
			var WEB_module_info_list_url="monitorview/middleware/tomcat/queryWebList";
			var WEB_module_info_list_header = [
							                        {text:'模块名称',name:"moduleName"},
													{text:'状态',name:"status", render : function(text){
														return text == 0 ? "不可用" : "可用";
													}},
													{text:'获取时间',name:"enterDate"}
							                     ];
		    g_grid.render(el ,{
		        url : WEB_module_info_list_url,
		        header : WEB_module_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//线程信息
		thread_info_list : function (el, paramObj) {
			var thread_info_list_url="monitorview/middleware/tomcat/queryThreadList";
			var thread_info_list_header = [
						                        {text:'线程名称',name:"threadName"},
												{text:'线程状态',name:"threadStatus"},
												{text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : thread_info_list_url,
		        header : thread_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//进程
		tomcat_process_line_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatProTimeInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);

							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//当前线程数
		current_thread_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatCurrentThreadInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);
							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//当前忙线程数
		current_thread_busy_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatCurrentThreadBusyInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);
							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//线程池信息
		ports_info_list : function (el, paramObj) {
			var ports_info_list_url="monitorview/middleware/tomcat/queryThreadPoolList";
			var ports_info_list_header = [
						                        {text:'协议名',name:"port_name"},
												{text:'最大线程数',name:"max_thread_cnt"},
												{text:'当前线程数',name:"cur_thread_cnt"},
												{text:'当前忙线程数',name:"cur_thread_busy"},
												{text:'获取时间',name:"enter_date"}
						                     ];
		    g_grid.render(el ,{
		        url : ports_info_list_url,
		        header : ports_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//Tomcat发送字节数（MB）
		receive_byte_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatReceivedInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);
							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//Tomcat发送字节数（MB）
		sent_byte_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatSenttInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);
							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//Tomcat请求数
		request_count_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatRequestCountInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);
							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//Tomcat错误数
		error_count_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/middleware/tomcat/queryTomcatErrorCountInfo",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var legendArray = [];
					var categoryArray = [];
					var seriesArray = [];
					for (var i = 0; i < data.length; i++) {
						legendArray.push(data[i].lineName);
						var seriesObj = new Object();
						seriesObj.name = data[i].lineName;
						seriesObj.type = "line";
						seriesObj.data = [];
						for (var j = 0; j < data[i].items.length; j++) {
							seriesObj.data.push(data[i].items[j].value);
							if (i == 0)
							{
								categoryArray.push(data[i].items[j].lable);
							}
						}
						seriesArray.push(seriesObj);
					}
					plot.lineRender(el, {
						legend : legendArray,
						category :categoryArray,
						series : seriesArray
					});
				}
			});
		},

		//Tomcat请求处理信息
		request_handele_list : function (el, paramObj) {
			var request_handele_list_url="monitorview/middleware/tomcat/queryRequestList";
			var request_handele_list_header = [
					                        {text:"协议" ,name:"protocol"},
											{text:"发送字节数(B)" ,name:"bytesSent"},
											{text:"接收字节数(B)" ,name:"bytesReceived"},
											{text:"错误数" ,name:"errorCount"},
											{text:"请求数" ,name:"requestCount"},
											// {text:"最大时间(ms)" ,name:"maxTime"},
											// {text:"模式类型" ,name:"modeType"},
											// {text:"进程时间(ms)" ,name:"processTime"},
											{text:"获取时间" ,name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : request_handele_list_url,
		        header : request_handele_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//Tomcat连接器信息
		linker_info_list : function (el, paramObj) {
			var linker_info_list_url="monitorview/middleware/tomcat/queryConnectList";
			var linker_info_list_header = [
					                        {text:"协议" ,name:"protocol"},
											{text:"端口" ,name:"port"},
											{text:"最大线程数" ,name:"maxThreads"},
											{text:"最大POST请求大小" ,name:"maxPortSize"},
											{text:"最大HTTP队头大小" ,name:"maxHttpHeaderSize"},
											{text:"最大活动请求" ,name:"maxAliveRequests"},
											{text:"获取时间" ,name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : linker_info_list_url,
		        header : linker_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//Tomcat连接器信息
		linker_info_list_v5 : function (el, paramObj) {
			var linker_info_list_url="monitorview/middleware/tomcat/queryConnectList";
			var linker_info_list_header = [
					                        {text:"协议" ,name:"protocol"},
											{text:"端口" ,name:"port"},
											{text:"最大POST请求大小" ,name:"maxPortSize"},
											{text:"最大HTTP队头大小" ,name:"maxHttpHeaderSize"},
											{text:"最大活动请求" ,name:"maxAliveRequests"},
											{text:"获取时间" ,name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : linker_info_list_url,
		        header : linker_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
	}
})