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
		transaction_manager : function(paramObj){
			um_ajax_get({
		        url : "monitorview/app/resin/queryTransaction",
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
				        subObj.data.push(items[i].commitTotal);
				    }
				    seriesArray.push(subObj);

				    var failObj = new Object();
				    failObj.name = '提交失败的事务处理/秒';
				    failObj.type = "line";
				    failObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        failObj.data.push(items[i].commitFailTotal);
				    }
				    seriesArray.push(failObj);

				    var rollbackObj = new Object();
				    rollbackObj.name = '回滚事务处理/秒';
				    rollbackObj.type = "line";
				    rollbackObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        rollbackObj.data.push(items[i].rollbackTotal);
				    }
				    seriesArray.push(rollbackObj);

				    var dealingObj = new Object();
				    dealingObj.name = '正在处理的事务处理';
				    dealingObj.type = "line";
				    dealingObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        dealingObj.data.push(items[i].transactionCount);
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
		        url : "monitorview/app/resin/queryServerRequest",
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
				        dealedObj.data.push(items[i].requestCountTotal);
				    }
				    seriesArray.push(dealedObj);

				   /* var readObj = new Object();
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
				    seriesArray.push(writeObj);*/
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
		        url : "monitorview/app/resin/queryThread",
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
				        activityObj.data.push(items[i].threadActiveCount);
				    }
				    seriesArray.push(activityObj);

				    var freeObj = new Object();
				    freeObj.name = '空闲的RESIN线程';
				    freeObj.type = "line";
				    freeObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        freeObj.data.push(items[i].threadIdleCount);
				    }
				    seriesArray.push(freeObj);

				    var waitObj = new Object();
				    waitObj.name = 'RESIN线程等待';
				    waitObj.type = "line";
				    waitObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        waitObj.data.push(items[i].threadWaitCount);
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
		        url : "monitorview/app/resin/queryThread",
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
				        maxObj.data.push(items[i].threadMax);
				    }				    
				    seriesArray.push(maxObj);

				    var totalObj = new Object();
				    totalObj.name = 'RESIN线程总数';
				    totalObj.type = "line";
				    totalObj.data = [];
				    for (var i = 0; i < items.length; i++) {
				        totalObj.data.push(items[i].threadCount);
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
			var web_app_list_url="monitorview/app/resin/queryWebApp";
			var web_app_list_header = [
								         {text:"名称" ,name:"webappName"},
								         {text:"活动会话" ,name:"sessionActiveCount"},
								         {text:"无效会话" ,name:"sessionInvalidateTotal"},
								         {text:"最大会话" ,name:"sessionMax"},
								         {text:"会话利用率(%)" ,name:"sessionMax",render:function(txt,rowData){
                                             return (parseInt(rowData.sessionActiveCount)/parseInt(rowData.sessionMax)).toFixed(2)
								         }}, 								    
								         {text:"请求/秒" ,name:"requestCount"},
								         {text:"字节接收/秒" ,name:"requestReadBytesTotal"},
								         {text:"字节发送/秒" ,name:"requestWriteBytesTotal"},
								         {text:"错误数" ,name:"status500CountTotal"},
								         {text:"状态" ,name:"state"},
								        
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
			var connection_pool_list_url="monitorview/app/resin/queryConnectionPool";
			var connection_pool_list_header = [
								         {text:"名称" ,name:"name"},
								         {text:"活动连接" ,name:"connectionActiveCount"},
								         {text:"空闲连接" ,name:"connectionIdleCount"},
								         {text:"失败连接" ,name:"connectionFailTotal"},
								         {text:"连接总数" ,name:"connectionCount"},
								         {text:"最大连接" ,name:"maxConnections"},
								         {text:"池利用率(%)" ,name:"",render:function(txt,rowData){
								         	return (parseInt(rowData.connectionCount)/parseInt(rowData.maxConnections)).toFixed(2)
								         }},
								         /*{text:"健康状况" ,name:"",render:function(txt){

								         }},
								         {text:"告警配置" ,name:""}*/
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