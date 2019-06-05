define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/plot/plot.js'] ,function (monitorInfo ,plot){
	var cache_data
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/db/dm/queryDMBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		            $("[data-id=version]").text(data.monitorbaseinfo.version)
		        }
		    });
		},

		instance_sel : function (paramObj){
			var self = this
			paramObj.instStatus = 1;
		    paramObj.monitorTypeNameLanguage = 1;
		    paramObj.edId = paramObj.assetId;
		    um_ajax_get({
		        url : "monitorView/queryEdMonitor",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            um_ajax_get({
				        url : "monitorView/queryInstanceType",
				        paramObj : {monitorId:data.edmonitorstore[1].monitorId},
				        successCallBack : function (data1){
				            var selBuff = [];
				            for (var i = 0; i < data1.length; i++) {
				                selBuff.push({id:data1[i].codevalue ,text:data1[i].codename});
				            }

				            $("#thread_monitor_sel").select2({
				                  data: selBuff,
				                  width:"100%",
				                  minimumResultsForSearch:"-1"
				            });

				            $("#conver_monitor_sel").select2({
				                  data: selBuff,
				                  width:"100%",
				                  minimumResultsForSearch:"-1"
				            });

				            $("#matter_monitor_sel").select2({
				                  data: selBuff,
				                  width:"100%",
				                  minimumResultsForSearch:"-1"
				            });

				            $("#cache_monitor_sel").select2({
				                  data: selBuff,
				                  width:"100%",
				                  minimumResultsForSearch:"-1"
				            });

				            //[{id:1,text:"一"},{id:2,text:"二"}]
				            self.base_info_render(paramObj)
				            self.thread_monitor_info_list()
				            self.conver_monitor_info_list()
				            self.matter_monitor_info_list()
				            self.catch_type_get(paramObj)
				            
				        }
				    });
				    
		        }
		    });
		},
		thread_monitor_info_list : function (){
			var thread_monitor_info_url = "monitorview/db/dm/queryDMThreads";
			var thread_monitor_info_header = [
											{text:"ID" ,name:"id"},
											{text:"线程名称" ,name:"name"},
											{text:"线程开始时间" ,name:"startTime"},
											{text:"说明" ,name:"description"}
										 ];
			var paramObj = {
						   monitorId : $("#thread_monitor_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#thread_monitor_table") ,{
				url : thread_monitor_info_url,
				header : thread_monitor_info_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		conver_monitor_info_list : function (){
			var conver_monitor_info_list_url = "monitorview/db/dm/queryDMSessions";
			var conver_monitor_info_list_header = [
											{text:"会话ID" ,name:"sessId" ,width:"auto"},
											{text:"SQL语句" ,name:"sqlText",width:"auto",tip:true, render:function (txt){
												if (!txt)
													return ""
												var tmp = (txt.length > 20 ? (txt.substr(0,20) + "...") : txt);
												return  '<span title="'+txt+'">'+tmp+'</span>'
											}},
											{text:"会话状态" ,name:"state",width:"auto"},
											{text:"当前模式" ,name:"currSch" ,width:"auto"},
											{text:"当前用户" ,name:"userName" ,width:"auto"},
											{text:"会话创建时间" ,name:"creatTime" ,width:"auto"},
											{text:"客户类型" ,name:"clntType" ,width:"auto"},
											{text:"时区" ,name:"timeZone" ,width:"auto"},
											{text:"DDL语句是否自动提交 " ,width:"auto",name:"ddlAutocmt", render : function(txt){
												if (txt == "Y") {
													return "是";
												}else if(txt == "N"){
													return "否";
												}
											}},
											{text:"客户主机名" ,name:"clntHost",width:"auto"},
											{text:"应用名称" ,name:"appname",width:"auto"},
											{text:"操作系统" ,name:"osname",width:"auto"},
											{text:"连接类型" ,name:"connType",width:"auto"},
											{text:"协议类型" ,name:"protocolType",width:"auto"},
											{text:"IP地址" ,name:"clntIp" ,width:"auto"},
											{text:"连接是否正常" ,name:"status", width:"auto",render : function(txt){
												return "正常";
											}}
										 ];
			var paramObj = {
						   monitorId : $("#conver_monitor_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#conver_monitor_table") ,{
				url : conver_monitor_info_list_url,
				header : conver_monitor_info_list_header,
				paramObj : paramObj,
				tableWidth : "2000px",
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		matter_monitor_info_list : function (){
			var matter_monitor_info_list_url = "monitorview/db/dm/queryDMTrans";
			var matter_monitor_info_list_header = [
											{text:"事务ID" ,name:"id"},
											{text:"事务状态" ,name:"status"},
											{text:"隔离级" ,name:"isolation"},
											{text:"是否为只读事务" ,name:"readOnly", render : function(txt){
												if (txt == "Y") {
													return "是";
												}else if(txt == "N"){
													return "否";
												}
											}},
											{text:"会话ID" ,name:"sessId"},
											{text:"插入数目" ,name:"insCnt"},
											{text:"删除数目" ,name:"delCnt"},
											{text:"更新数目" ,name:"updCnt"},
											{text:"更新插入数目" ,name:"updInsCnt"},
											{text:"当前UNDO记录的递增序列号" ,name:"urecSeqno"},
											{text:"事务等待的锁" ,name:"waiting"}
										 ];
			var paramObj = {
						   monitorId : $("#matter_monitor_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#matter_monitor_table") ,{
				url : matter_monitor_info_list_url,
				header : matter_monitor_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		catch_type_get : function(paramObj){
			var self = this
			var monitorId = $("#cache_monitor_sel").val()
			um_ajax_get({
		        url : "monitorview/db/dm/queryDMCacheItem",
		        paramObj : {monitorId:monitorId,time:paramObj.time},
		        isLoad:false,
		        successCallBack : function (data2){
		        	var selBuff = [];
		            for (var i = 0; i < data2.type.length; i++) {
		                selBuff.push({id:data2.type[i].type ,text:data2.type[i].type});
		            }
		             $("#cache_type_sel").select2({
		                  data: selBuff,
		                  width:"100%",
		                  minimumResultsForSearch:"-1"
		            });
		            cache_data = data2.data
		            self.cache_monitor_chart()
		        }
		    })
		},

		cache_monitor_chart:function(){
			var type = $("#cache_type_sel").val()
			var data = []
			for (var i = 0; i < cache_data.length; i++) {
				cache_data[i].type == type && data.push(cache_data[i])
			}
			console.log(cache_data)
        	var legendArray1 = ["数量"]
        	var categoryArray1 = [];
            var seriesArray1 = [];
            var color_array1 = []

            var seriesObj1 = new Object()
        	seriesObj1.name = '数量';
            seriesObj1.type = "line";
            seriesObj1.data = [];

            var legendArray2 = ["大小(M)"]
        	var categoryArray2 = [];
            var seriesArray2 = [];
            var color_array2 = []

            var seriesObj2 = new Object()
        	seriesObj2.name = '大小(M)';
            seriesObj2.type = "line";
            seriesObj2.data = [];

            for (var i = 0; i < data.length; i++) {
            	categoryArray1.push(data[i].enterDate.substr(data[i].enterDate.indexOf("-")+1));
				seriesObj1.data.push(data[i].cacheCnt);
				categoryArray2.push(data[i].enterDate.substr(data[i].enterDate.indexOf("-")+1));
				seriesObj2.data.push(data[i].cacheSize);
            }
            seriesArray1.push(seriesObj1);
            seriesArray2.push(seriesObj2);

            plot.lineRender($("#count_chart_div") ,{
                legend : legendArray1,
                legendStyle : true,
                category :categoryArray1,
                series : seriesArray1,
                lineStyle : true,
                color_array : ['#3ad3b5']
            });

            plot.lineRender($("#size_chart_div")  ,{
                legend : legendArray2,
                legendStyle : true,
                category :categoryArray2,
                series : seriesArray2,
                lineStyle : true,
                color_array : ['#36aee1']
            });
		},

		cache_monitor_info_list : function (){
			var cache_monitor_info_list_url = "monitorview/db/dm/queryDMCacheItem";
			var cache_monitor_info_list_header = [
											{text:"地址" ,name:"address"},
											{text:"类型" ,name:"type"},
											{text:"是否溢出" ,name:"overflow", render : function(txt){
												if (txt == "Y") {
													return "是";
												}else if(txt == "N"){
													return "否";
												}
											}},
											{text:"是否在内存池中" ,name:"inPool", render : function(txt){
												if (txt == "Y") {
													return "是";
												}else if(txt == "N"){
													return "否";
												}
											}},
											{text:"是否可用" ,name:"disabled", render : function(txt){
												if (txt == "Y") {
													return "是";
												}else if(txt == "N"){
													return "否";
												}
											}},
											{text:"被引用的次数" ,name:"nfixed"},
											{text:"时间戳" ,name:"tsvalue"}
										 ];
			var paramObj = {
						   monitorId : $("#cache_monitor_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#cache_monitor_table") ,{
				url : cache_monitor_info_list_url,
				header : cache_monitor_info_list_header,
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