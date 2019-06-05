define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_post({
		        url : "monitorview/app/jdk/queryJdkMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		thread_info : function (paramObj){
			var self = this
			um_ajax_get({
		        url : "monitorview/app/jdk/queryThread",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#thread_info_div").umDataBind("reset")
		            if(data.length > 0){
		            	$("#thread_info_div").umDataBind("render" ,data[data.length-1]);
		            }
		            self.process_info_chart(data)
		        }
		    });
		},

		process_info_chart : function(data){
			var items = data;
		    var legendArray = ['线程总数','守护线程'];
		    var categoryArray = [];
		    var seriesArray = [];
		    
		    var threadCntObj = new Object();
		    threadCntObj.name = '线程总数';
		    threadCntObj.type = "line";
		    threadCntObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        categoryArray.push(items[i].enterDate);
		        threadCntObj.data.push(items[i].threadCnt);
		    }
		    seriesArray.push(threadCntObj);

		    var daemonThreadCntObj = new Object();
		    daemonThreadCntObj.name = '守护线程';
		    daemonThreadCntObj.type = "line";
		    daemonThreadCntObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        daemonThreadCntObj.data.push(items[i].daemonThreadCnt);
		    }
		    seriesArray.push(daemonThreadCntObj);

		    plot.lineRender($("#process_info_chart_div") ,{
		        legend : legendArray,
		        category : categoryArray,
		        series : seriesArray,
		        axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
		    });
		},
		load_info : function (paramObj){
			var self = this
			um_ajax_get({
		        url : "monitorview/app/jdk/queryClass",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#load_info_div").umDataBind("reset");
			        if(data.length > 0){
		        		$("#load_info_div").umDataBind("render" ,data[data.length-1]);
		        	}
		            self.load_info_chart(data);
		        }
		    });
		},
		load_info_chart : function(data){
			var items = data;
		    var legendArray = ['JVM加载类数'];
		    var categoryArray = [];
		    var seriesArray = [];
		    
		    var responseTimeObj = new Object();
		    responseTimeObj.name = 'JVM加载类数';
		    responseTimeObj.type = "line";
		    responseTimeObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        categoryArray.push(items[i].enterDate);
		        responseTimeObj.data.push(items[i].loadClassCnt);
		    }
		    seriesArray.push(responseTimeObj);

		    plot.lineRender($("#load_info_chart_div") ,{
		        legend : legendArray,
		        category : categoryArray,
		        series : seriesArray,
		        axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
		    });
		},
		system_info : function (paramObj){
			var self = this
			um_ajax_get({
		        url : "monitorview/app/jdk/querySystem",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#system_info_div").umDataBind("reset")
		            if(data.length > 0){
		            	$("#system_info_div").umDataBind("render" ,data[data.length-1]);
		            }
		        }
		    });
		},
		heapUsage_info : function(paramObj){
			var self = this
			var obj = $.extend(true,
                                    {
                                        chooseStartDate:$("#heapUsage_start_date").text(),
                                        chooseEndDate:$("#heapUsage_end_date").text()
                                    },
                                    paramObj
                                );
		    obj.flag="min";
		    um_ajax_get({
		        url :"monitorview/app/jdk/queryJvm",
		        paramObj : obj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#heapUsage_div").umDataBind("reset")
		            if(data.length > 0){
		                $("#heapUsage_div").umDataBind("render" ,data[data.length-1]);
		            }
		            self.heapUsage_chart(data)
		        }
		    });
		},
		heapUsage_chart : function(data){
			var items = data;
		    var legendArray = ['堆当前使用','堆当前已分配'];
		    var categoryArray = [];
		    var seriesArray = [];
		    var seriesHeapObj = new Object();
		    seriesHeapObj.name = '堆当前使用';
		    seriesHeapObj.type = "line";
		    seriesHeapObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        categoryArray.push(items[i].enterDate);
		        seriesHeapObj.data.push(parseInt(items[i].heapUsedMemory));
		    }
		    seriesArray.push(seriesHeapObj);

		    var seriesCommitHeapObj = new Object();
		    seriesCommitHeapObj.name = '堆当前已分配';
		    seriesCommitHeapObj.type = "line";
		    seriesCommitHeapObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        seriesCommitHeapObj.data.push(parseInt(items[i].heapCommitMemory));
		    }
		    seriesArray.push(seriesCommitHeapObj);

		    plot.lineRender($("#heapUsage_chart_div") ,{
		        legend : legendArray,
		        category :categoryArray,
		        series : seriesArray,
		        lineStyle : true,
		        color_array : ['#62cb31','#23b7e5'],
		        axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
		    });
		},
		notheapUsage_info :function(paramObj){
			var self = this
			var obj = $.extend(true,
                                    {
                                        chooseStartDate:$("#notheapUsage_start_date").text(),
                                        chooseEndDate:$("#notheapUsage_end_date").text()
                                    },
                                    paramObj
                                );
		    obj.flag="min";
		    um_ajax_get({
		        url :"monitorview/app/jdk/queryJvm",
		        paramObj : obj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#notheapUsage_div").umDataBind("reset")
		            if(data.length > 0){
		                $("#notheapUsage_div").umDataBind("render" ,data[data.length-1]);
		            }
		            self.notHeapUsage_chart(data)
		        }
		    });
		},
		notHeapUsage_chart : function(data){
			var items = data;
		    var legendArray = ['非堆当前使用','非堆当前已分配'];
		    var categoryArray = [];
		    var seriesArray = [];
		    var seriesHeapObj = new Object();
		    seriesHeapObj.name = '非堆当前使用';
		    seriesHeapObj.type = "line";
		    seriesHeapObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        categoryArray.push(items[i].enterDate);
		        seriesHeapObj.data.push(parseInt(items[i].permGenUsed));
		    }
		    seriesArray.push(seriesHeapObj);

		    var seriesCommitHeapObj = new Object();
		    seriesCommitHeapObj.name = '非堆当前已分配';
		    seriesCommitHeapObj.type = "line";
		    seriesCommitHeapObj.data = [];
		    for (var i = 0; i < items.length; i++) {
		        seriesCommitHeapObj.data.push(parseInt(items[i].permGenCommitted));
		    }
		    seriesArray.push(seriesCommitHeapObj);

		    plot.lineRender($("#notHeapUsage_chart_div") ,{
		        legend : legendArray,
		        category :categoryArray,
		        series : seriesArray,
		        lineStyle : true,
		        color_array : ['#62cb31','#23b7e5'],
		        axisLabelFormatter : function (value){
					return value?value.substr(5,11):""
				}
		    });
		},
		cpu_info : function(paramObj){
			var obj = $.extend(true,
                                    {
                                        chooseStartDate:$("#cpu_use_start_date").text(),
                                        chooseEndDate:$("#cpu_use_end_date").text()
                                    },
                                    paramObj
                                );
		    obj.flag="min";
			um_ajax_get({
		        url : "monitorview/app/jdk/queryCpu",
		        paramObj : obj,
		        isLoad : false,
		        successCallBack : function (data){
		            var items = data;
				    var legendArray = ['CPU使用率(%)','GC使用率(%)'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var cpuUsageObj = new Object();
				    cpuUsageObj.name = 'CPU使用率(%)';
				    cpuUsageObj.type = "line";
				    cpuUsageObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].enterDate);
				        cpuUsageObj.data.push(items[i].cpuUsage);
				    }
				    seriesArray.push(cpuUsageObj);

				    var gcUsageObj = new Object();
				    gcUsageObj.name = 'GC使用率(%)';
				    gcUsageObj.type = "line";
				    gcUsageObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        gcUsageObj.data.push(items[i].gcUsage);
				    }
				    seriesArray.push(gcUsageObj);
				    plot.lineRender($("#cpu_usage_chart_div") ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray,
				        axisLabelFormatter : function (value){
							return value?value.substr(5,11):""
						}
				    });
		        }
		    });
		},
		transaction_manager : function(paramObj){
			um_ajax_get({
		        url : "",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var items = data;
				    var legendArray = ['提交的事务处理/秒','提交失败的事务处理/秒','回滚事务处理/秒','正在处理的事务处理'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var subObj = new Object();
				    subObj.name = '提交的事务处理/秒';
				    subObj.type = "line";
				    subObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].enterDate);
				        subObj.data.push(items[i].sub);
				    }
				    seriesArray.push(subObj);

				    var failObj = new Object();
				    failObj.name = '提交失败的事务处理/秒';
				    failObj.type = "line";
				    failObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        failObj.data.push(items[i].fail);
				    }
				    seriesArray.push(failObj);

				    var rollbackObj = new Object();
				    rollbackObj.name = '回滚事务处理/秒';
				    rollbackObj.type = "line";
				    rollbackObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        rollbackObj.data.push(items[i].rollback);
				    }
				    seriesArray.push(rollbackObj);

				    var dealingObj = new Object();
				    dealingObj.name = '正在处理的事务处理';
				    dealingObj.type = "line";
				    dealingObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        dealingObj.data.push(items[i].dealing);
				    }
				    seriesArray.push(dealingObj);
				    plot.lineRender($("#transaction_manager_chart") ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray
				    });
				}
			})
		},
		rquest_throughput : function(paramObj){
			um_ajax_get({
		        url : "",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var items = data;
				    var legendArray = ['处理的请求/秒','字节读取/秒','字节写入/秒'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var dealedObj = new Object();
				    dealedObj.name = '处理的请求/秒';
				    dealedObj.type = "line";
				    dealedObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].enterDate);
				        dealedObj.data.push(items[i].dealed);
				    }
				    seriesArray.push(dealedObj);

				    var readObj = new Object();
				    readObj.name = '字节读取/秒';
				    readObj.type = "line";
				    readObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        readObj.data.push(items[i].read);
				    }
				    seriesArray.push(readObj);

				    var writeObj = new Object();
				    writeObj.name = '字节写入/秒';
				    writeObj.type = "line";
				    writeObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        writeObj.data.push(items[i].writeObj);
				    }
				    seriesArray.push(writeObj);
				    plot.lineRender($("#rquest_throughput_chart") ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray
				    });
				}
			})
		},
		resin_status : function(paramObj){
			um_ajax_get({
		        url : "",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var items = data;
				    var legendArray = ['活动的RESIN线程','空闲的RESIN线程','RESIN线程等待'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var activityObj = new Object();
				    activityObj.name = '活动的RESIN线程';
				    activityObj.type = "line";
				    activityObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].enterDate);
				        activityObj.data.push(items[i].activity);
				    }
				    seriesArray.push(activityObj);

				    var freeObj = new Object();
				    freeObj.name = '空闲的RESIN线程';
				    freeObj.type = "line";
				    freeObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        freeObj.data.push(items[i].free);
				    }
				    seriesArray.push(freeObj);

				    var waitObj = new Object();
				    waitObj.name = 'RESIN线程等待';
				    waitObj.type = "line";
				    waitObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        waitObj.data.push(items[i].waiting);
				    }
				    seriesArray.push(waitObj);
				    plot.lineRender($("#resin_status_chart") ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray
				    });
				}
			})
		},
		resin_usage : function(paramObj){
			um_ajax_get({
		        url : "",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var items = data;
				    var legendArray = ['最大RESIN线程','RESIN线程总数'];
				    var categoryArray = [];
				    var seriesArray = [];
				    
				    var maxObj = new Object();
				    maxObj.name = '最大RESIN线程';
				    maxObj.type = "line";
				    maxObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        categoryArray.push(items[i].enterDate);
				        maxObj.data.push(items[i].max);
				    }				    
				    seriesArray.push(maxObj);

				    var totalObj = new Object();
				    totalObj.name = 'RESIN线程总数';
				    totalObj.type = "line";
				    totalObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        totalObj.data.push(items[i].total);
				    }
				    seriesArray.push(totalObj);

				    plot.lineRender($("#resin_usage_chart") ,{
				        legend : legendArray,
				        category : categoryArray,
				        series : seriesArray
				    });
				}
			})
		},
		web_app_list : function(paramObj){
			var web_app_list_url="";
			var web_app_list_header = [
								         {text:"名称" ,name:""},
								         {text:"活动会话" ,name:""},
								         {text:"无效会话" ,name:""},
								         {text:"最大会话" ,name:""},
								         {text:"会话利用率(%)" ,name:""},
								         {text:"请求/秒" ,name:""},
								         {text:"字节接收/秒" ,name:""},
								         {text:"字节发送/秒" ,name:""},
								         {text:"错误数" ,name:""},
								         {text:"状态" ,name:""},
								         {text:"健康状况" ,name:"",render:function(txt){

								         }},
								         {text:"告警配置" ,name:""}
								      ];
		    g_grid.render($("#web_app_table") ,{
		        url : web_app_list_url,
		        header : web_app_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		connection_pool_list : function(paramObj){
			var connection_pool_list_url="";
			var connection_pool_list_header = [
								         {text:"名称" ,name:""},
								         {text:"活动连接" ,name:""},
								         {text:"空闲连接" ,name:""},
								         {text:"失败连接" ,name:""},
								         {text:"连接总数" ,name:""},
								         {text:"最大连接" ,name:""},
								         {text:"池利用率(%)" ,name:""},
								         {text:"健康状况" ,name:"",render:function(txt){

								         }},
								         {text:"告警配置" ,name:""}
								      ];
		    g_grid.render($("#connection_pool_table") ,{
		        url : connection_pool_list_url,
		        header : connection_pool_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		}
	}
})
