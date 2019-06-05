define(['/js/plugin/monitor/monitorInfo.js'] ,function (monitorInfo){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/db/db2/queryDB2MonitorBaseInfo",
		        paramObj : {
		        			  monitorId : $("#instance_sel").val() ,instStatus : 1,
		                      inpuDate:paramObj.time,
		                      assetId:paramObj.assetId
		                   },
		        isLoad : false,
		        successCallBack : function (data){
		            $("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		            data.db2StaticInfo && $("[data-id=version]").text(data.db2StaticInfo.versionI);
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
				        isLoad:false,
				        successCallBack : function (data1){
				            var selBuff = [];
				            // for (var i = 0; i < data1.length; i++) {
				            //     selBuff.push({id:data1[i].codevalue ,text:data1[i].codename});
				            // }
				            // $("#instance_sel").select2({
				            //       data: selBuff,
				            //       width:"100%"
				            // });
				            console.log(data1)
				            var selBuff = [];
				            for (var i = 0; i < data1.length; i++) {
				                selBuff.push({id:data1[i].codevalue ,text:data1[i].codename});
				            }

				            $("#instance_sel").select2({
				                  data: selBuff,
				                  width:"100%",
				                  minimumResultsForSearch : -1
				            });
				            
				            self.base_info_render(paramObj)
				            self.instance_info_render()
				            self.tsp_list()
				            self.link_info_list(paramObj)
				            self.buffer_list()
				            self.memory_list()
				            self.heap_list()
				            self.lock_list()
				            self.app_list()
				            self.user_access_list()
				        }
				    });
		        }
		    });
		},

		instance_info_render : function (){
			var instance_list_url = "monitorview/db/db2/queryDB2Instance";
			var instance_list_header = [
			                              {text:"数据库路径" ,name:"dbPath"},
			                              {text:"版本" ,name:"versionI"},
			                              {text:"实例启动时间" ,name:"startTime"},
			                              {text:"字符集" ,name:"charset"},
			                              {text:"数据库名称" ,name:"dbName"},
			                              {text:"实例" ,name:"instance"},
			                              {text:"更新时间" ,name:"updateDateI"},
			                              {text:"输入时间" ,name:"inpuDate"},
			                              {text:"一天前的时间" ,name:"dayAgoDate"},
			                              {text:"核心进程数" ,name:"processCount"}
			                           ];
           	paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#instance_list_div") ,{
		        url : instance_list_url,
		        header : instance_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        showCount : true
		    });
		},

		tsp_list : function (){
			var tsp_list_url = "monitorview/db/db2/queryDB2TableSpace";

			var tsp_list_header = [
		                              {text:"表空间名称" ,name:"tabsName"},
					                  {text:"表空间类型" ,name:"tabsType"},
					                  {text:"表空间内容类型" ,name:"tabsContentType"},
					                  {text:"表空间状态" ,name:"tabsStatus"},
					                  {text:"最大表空间大小" ,name:"tabsMaxSize"},
					                  {text:"当前大小" ,name:"tabsCurSize"},
		                           ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#table_space_div") ,{
		        url : tsp_list_url,
		        header : tsp_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        showCount : true
		    });
		},
		log_tsp_list : function (){
			var log_tsp_list_url = "monitorview/db/db2/queryDB2LogTSP";

			var log_tsp_list_header = [
		                              {text:"使用的最大辅助日志空间" ,name:"secLogUsedTop"},
					                  {text:"使用的最大总日志空间" ,name:"totLogUsedTop"},
					                  {text:"目前分配的辅助日志数" ,name:"secLogAllocated"},
					                  {text:"使用的总日志空间" ,name:"totalLogUsed"},
					                  {text:"可用的总日志空间" ,name:"totalLogAvailable"}
		                           ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#table_space_div") ,{
		        url : log_tsp_list_url,
		        header : log_tsp_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        showCount : true
		    });
		},
		link_info_list : function (opt){
			var link_info_list_url = "monitorview/db/db2/queryDB2Link";
			var link_info_list_header = [
											{text:"对DB2 CONNECT尝试连接的总数" ,name:"gwTotalCons"},
				                            {text:"当前连接数" ,name:"gwCurCons"},
				                            {text:"等待主机应答的连接数" ,name:"gwConsWaitHost"},
				                            {text:"等待客户机发送请求的连接数" ,name:"gwConsWaitClient"}
										 ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#link_info_table") ,{
				url : link_info_list_url,
				header : link_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
		        showCount : true
			});
		},
		buffer_list : function (){
			var buffer_list_url = "monitorview/db/db2/queryDB2Buffer";
			var buffer_list_header = [
										{text:"缓冲池名称" ,name:"bpName"},
									    {text:"缓冲区缓存总体命中率" ,name:"totalHitRatioPercent"},
									    {text:"缓冲区缓存数据命中率" ,name:"datHitRatioPercent"},
									    {text:"缓冲区缓存索引命中率" ,name:"indexHitRatioPercent"}
									 ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#buffer_list_table") ,{
				url : buffer_list_url,
				header : buffer_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
		        showCount : true
			});
		},
		memory_list : function (){
			var memory_list_url = "monitorview/db/db2/queryDB2Memory";
			var memory_list_header = [
										  {text:"内存池标识" ,name:"poolId"},
									      {text:"辅助内存池标识" ,name:"poolSecondaryId"},
									      {text:"内存池当前大小" ,name:"poolCurSize"},
									      {text:"内存使用水位" ,name:"poolWatermark"},
									      {text:"内存池配置大小" ,name:"poolConfigSize"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#memory_list_table") ,{
				url : memory_list_url,
				header : memory_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true
			});
		},
		heap_list : function (){
			var heap_list_url = "monitorview/db/db2/queryDB2Heap";
			var heap_list_header = [
										  {text:"分配的</br>总排序堆" ,name:"sortHeapAllocated"},
									      {text:"超过阈值后的</br>排序数" ,name:"postThreadholdSorts"},
									      {text:"共享阈值后的</br>排序数" ,name:"postShrSort"},
									      {text:"请求的管道</br>排序数" ,name:"pipedSortReq"},
									      {text:"接受的管道</br>排序数" ,name:"pipedSortsAc"},
									      {text:"总排序数" ,name:"totalSorts"},
									      {text:"排序溢出数" ,name:"sortOverflows"},
									      {text:"排序专用堆</br>高水位标记" ,name:"sortHeapTop"},
									      {text:"排序共享堆</br>高水位标记" ,name:"sortShheapTop"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#heap_list_table") ,{
				url : heap_list_url,
				header : heap_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true,
				dbThLine : true
			});
		},
		lock_list : function (){
			var lock_list_url = "monitorview/db/db2/queryDB2Lock";
			var lock_list_header = [
										  {text:"挂起的锁定数" ,name:"locksHeld"},
				                          {text:"等待锁定的</br>总消耗时间" ,name:"lockWaitTime"},
				                          {text:"锁定升级数" ,name:"lockEscals"},
				                          {text:"互斥锁的</br>升级数" ,name:"xlockEscal"},
				                          {text:"指示等待锁定的</br>代理程序数" ,name:"lockWaiting"},
				                          {text:"锁定超时次数" ,name:"lockTimerouts"},
				                          {text:"使用中的锁定</br>列表内存总量" ,name:"lockListInUse"},
				                          {text:"检测到的</br>死锁数" ,name:"deadlocks"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#lock_list_table") ,{
				url : lock_list_url,
				header : lock_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true,
				dbThLine : true
			});
		},
		app_list : function (){
			var app_list_url = "monitorview/db/db2/queryDB2AgentList";
			var app_list_header = [
									  {text:"应用程序句柄 " ,name:"agentId"},
								      {text:"应用程序状态" ,name:"applStatus"},
								      {text:"应用程序状态更改时间" ,name:"statusChangeTime"},
								      {text:"应用程序名称" ,name:"applName"},
								      {text:"客户机进程标识" ,name:"clientPid"},
								      {text:"应用程序空闲时间 " ,name:"applIdleTime"},
								      {text:"IO直接读取数据数量" ,name:"directReads"},
								      {text:"IO直接写入数据数量" ,name:"directWrites"},
								      {text:"IO直接读取读请求的次数" ,name:"directReadReqs"},
								      {text:"IO直接写入写请求的次数" ,name:"directWriteReqs"},
								      {text:"IO直接读取时间 " ,name:"directReadTime"},
								      {text:"IO直接写入时间" ,name:"directWriteTime"},
								      {text:"挂起的锁定数" ,name:"locksHeld"},
								      {text:"锁定等待数" ,name:"lockWaits"},
								      {text:"等待锁定的时间" ,name:"lockWaitTime"},
								      {text:"锁定升级数 " ,name:"lockEscals"},
								      {text:"互斥锁定升级数" ,name:"xlockEscals"},
								      {text:"死锁数" ,name:"deadlocks"},
								      {text:"锁定超时" ,name:"lockTimeoutVal"},
								      {text:"代理使用的用户CPU时间" ,name:"agentUsrCpuTime"},
								      {text:"代理使用的系统CPU时间" ,name:"agentSysCpuTime"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#app_list_table") ,{
				url : app_list_url,
				header : app_list_header,
				paramObj : paramObj,
				tableWidth : "3500px",
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true,
				cbf : function (){
					var __tr = $("#app_list_table").find(".um-grid-head-tr")
					__tr.oneTime(3000 ,function (){
						__tr.find("td").each(function (){
							$(this).find("div").css("width" ,"100%")
						})
					})
					
				}
			});
		},
		user_access_list : function (){
			var user_access_list_url = "monitorview/db/db2/queryDB2Access";
			var user_access_list_header = [
									  {text:"应用程序状态" ,name:"applStatus"},
								      {text:"应用程序名称" ,name:"applName"},
								      {text:"连接用户名" ,name:"authid"},
								      {text:"应用程序IP-ID" ,name:"applId"},
								      {text:"连接客户端机器名称" ,name:"clientNname"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#user_access_list_table") ,{
				url : user_access_list_url,
				header : user_access_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true
			});
		},
	}
})