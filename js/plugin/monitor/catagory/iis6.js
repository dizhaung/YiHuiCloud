define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/iis/queryIisMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		            // $("#test_info_monitor_div").umDataBind("render" ,data.testInfo[0]);
		        }
		    });
		},

		// 内存使用率
		memory_use_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/iis/queryIisMemoryInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var items = data;
		            var legendArray = ['内存（%）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '内存（%）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].enterDate);
		                seriesObj.data.push(items[i].memoryValue);
		            }
		            seriesArray.push(seriesObj);

		            plot.lineRender(el, {
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
		    }); 
		},

		// 文件流量信息
		file_flow_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/iis/queryIisFileFlowInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var items = data;
		            var legendArray = ['发送文件率（Byte/s）','接收文件率（Byte/s）','文件传输率（Byte/s）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '发送文件率（Byte/s）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].enterDate);
		                seriesObj.data.push(items[i].sentFilerate);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '接收文件率（Byte/s）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < items.length; i++) {
		                seriesObj2.data.push(items[i].rxdFilerate);
		            }
		            seriesArray.push(seriesObj2);

		            var seriesObj3 = new Object();
		            seriesObj3.name = '文件传输率（Byte/s）';
		            seriesObj3.type = "line";
		            seriesObj3.data = [];
		            for (var i = 0; i < items.length; i++) {
		                seriesObj3.data.push(items[i].fileTranRate);
		            }
		            seriesArray.push(seriesObj3);
		            
		            plot.lineRender(el, {
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
		    }); 
		},

		// 线程
		process_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/iis/queryIisThreadInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var items = data;
		            var legendArray = ['线程数量'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '线程数量';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].enterDate);
		                seriesObj.data.push(items[i].threads);
		            }
		            seriesArray.push(seriesObj);
		            
		            plot.lineRender(el, {
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
		    }); 
		},

		// 字节
		byte_flow_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/iis/queryIisFileFlowInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var items2 = data;
		            var legendArray2 = ['发送字节率（Byte/s）','接收字节率（Byte/s）','字节传输率（Byte/s）'];
		            var categoryArray2 = [];
		            var seriesArray2 = [];
		            
		            var seriesObj21 = new Object();
		            seriesObj21.name = '发送字节率（Byte/s）';
		            seriesObj21.type = "line";
		            seriesObj21.data = [];
		            for (var i = 0; i < items2.length; i++) {
		                categoryArray2.push(items2[i].enterDate);
		                seriesObj21.data.push(items2[i].sentByterate);
		            }
		            seriesArray2.push(seriesObj21);
		            
		            var seriesObj22 = new Object();
		            seriesObj22.name = '接收字节率（Byte/s）';
		            seriesObj22.type = "line";
		            seriesObj22.data = [];
		            for (var i = 0; i < items2.length; i++) {
		                seriesObj22.data.push(items2[i].rxdByterate);
		            }
		            seriesArray2.push(seriesObj22);

		            var seriesObj23 = new Object();
		            seriesObj23.name = '字节传输率（Byte/s）';
		            seriesObj23.type = "line";
		            seriesObj23.data = [];
		            for (var i = 0; i < items2.length; i++) {
		                seriesObj23.data.push(items2[i].byteTranRate);
		            }
		            seriesArray2.push(seriesObj23);

		            plot.lineRender(el, {
		                legend : legendArray2,
		                category : categoryArray2,
		                series : seriesArray2
		            });
		        }
		    }); 
		},

		//用户访问
		user_access_info_list : function(el, paramObj) {
			var user_access_info_list_url="monitorview/middleware/iis/queryIisUserAccessMutative";
			var user_access_info_list_header = [
							                        {text:'站点名称',name:"siteName"},
						                            {text:'HTTP服务连接数',name:"linkCnt"},
						                            {text:'每秒匿名</br>用户登录数量',name:"psAmUsercnt"},
						                            {text:'每秒非匿名</br>用户登录数量',name:"psNoamUsercnt"},
						                            {text:'HTTP服务的当前匿名</br>连接用户数',name:"amUsercnt"},
						                            {text:'非匿名用户数量',name:"noamUsercnt"},
						                            {text:'站点是否可用',name:"siteStatus"},
						                            {text:'获取时间',name:"updateDate"}
							                     ];
		    g_grid.render(el ,{
		        url : user_access_info_list_url,
		        header : user_access_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        dbThLine : true
		    });
		}
	}
})