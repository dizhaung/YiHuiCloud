define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblogicMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		            $("#console_url").umDataBind("render" ,data.weblBaseInfo[0]);
		            // $("#test_info_monitor_div").umDataBind("render" ,data.testInfo[0]);
		        }
		    });
		},

		//JVM信息
		JVM_info_render : function (el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblJvm",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            el.umDataBind("render" ,data[0]);
		        }
		    });
		},

		//安全信息
		sec_info_render : function (el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblServerSecurity",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            el.umDataBind("render" ,data[0]);
		            if(data[0] && (data[0].desc=="null" || data[0].desc==null)){
		                el.find("[data-id=desc]").text('----');
		            }
		        }
		    });
		},

		//线程池信息
		thread_pool_render : function (el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblThreadpool",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		        	if(data[0]){	
		            	el.umDataBind("render" ,data[0]);
		                el.find("[data-id=suspended]").text(data[0].suspended=="true"?"是":"否");
		            }
		        }
		    });
		},

		//JMS信息
		jms_info_render : function (el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblJms",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		        	if(data[0]){	
		            	el.umDataBind("render" ,data[0]);
		            }
		        }
		    });
		},

		//Server信息
		server_info_list : function (el, paramObj) {
			var server_info_list_url="monitorview/middleware/weblogic/queryWeblJmsServer";
			var server_info_list_header = [
							                    {text:'JMS服务器名称',name:"jmsName"},
					                            {text:'当前字节数',name:"bytesCurrentcnt"},
					                            {text:'挂起字节数',name:"bytesPendingcnt"},
					                            {text:'当前可交换字节数',name:"bytesPageaCurtcnt"},
					                            {text:'当前信息数',name:"messagesCurrentcnt"},
					                            {text:'挂起信息数',name:"messagesPendcnt"},
					                            {text:'当前可交换信息数',name:"messagesPageCurtcnt"},
					                            {text:'获取时间',name:"enterDate"}
							                ];
		    g_grid.render(el ,{
		        url : server_info_list_url,
		        header : server_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//SAFAgent信息
		safgent_info_list : function (el, paramObj) {
			var safgent_info_list_url="monitorview/middleware/weblogic/queryWeblSAFAgent";
			var safgent_info_list_header = [
							                    {text:'SAF代理名称',name:"safName"},
					                            {text:'当前远程端点数',name:"remoteEndpotsCurtcnt"},
					                            {text:'最大远程端点数',name:"remoteEndpotsHighcnt"},
					                            {text:'远程端点总数',name:"remoteEndpotsTotcnt"},
					                            {text:'当前对话数',name:"conversationsCurtcnt"},
					                            {text:'最大对话数',name:"conversationsHighcnt"},
					                            {text:'对话总数',name:"conversationsTotalcnt"},
					                            {text:'暂停传入',name:"pausedForIncoming"},
					                            {text:'暂停接收',name:"pausedForReceiving"},
					                            {text:'暂停转发',name:"pausedForForwarding"},
					                            {text:'获取时间',name:"enterDate"}
							                ];
		    g_grid.render(el ,{
		        url : safgent_info_list_url,
		        header : safgent_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//jta基本信息
		jta_base_info_render : function(el, paramObj) {
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblJta",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            el.umDataBind("render" ,data[0]);
		        }
		    });
		},

		//jta命名事物信息
		tran_name_info_list : function(el, paramObj) {
			var tran_name_info_list_url = "monitorview/middleware/weblogic/queryWeblJtaTranName";
			var tran_name_info_list_header = [
							                    {text:'事务名称',name:"tranName"},
					                            {text:'事务总数',name:"tranTotalcnt"},
					                            {text:'提交事务',name:"tranCommitTotcnt"},
					                            {text:'回滚事务',name:"tranRlbkTotcnt"},
					                            {text:'超时回滚',name:"tranRlbkTimeoutTotcnt"},
					                            {text:'资源回滚',name:"tranRlbkResourceTotcnt"},
					                            {text:'应用程序回滚',name:"tranRlbkAppTotcnt"},
					                            {text:'系统回滚',name:"tranRlbkSysTotcnt"},
					                            {text:'试探事务',name:"tranHeuristTotcnt"},
					                            {text:'已放弃事务',name:"tranAbandonTotcnt"},
					                            {text:'获取时间',name:"enterDate"}
							                ];
		    g_grid.render(el ,{
		        url : tran_name_info_list_url,
		        header : tran_name_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//XA资源信息
		xa_resource_info_list : function(el, paramObj) {
			var xa_resource_info_list_url = "monitorview/middleware/weblogic/queryWeblJtaXa";
			var xa_resource_info_list_header = [
							                    {text:'XA资源名称',name:"resourceName"},
					                            {text:'事务总数',name:"tranTotCount"},
					                            {text:'提交事务',name:"tranCommitTotcnt"},
					                            {text:'回滚事务',name:"tranRolbackTotcnt"},
					                            {text:'试探事务',name:"tranHeuristTotcnt"},
					                            {text:'试探提交',name:"tranHeuristComtTotcnt"},
					                            {text:'试探危害',name:"tranHeuristHazdTotcnt"},
					                            {text:'试探混合',name:"tranHeurisMixTotcnt"},
					                            {text:'试探回滚',name:"tranHeuristRlbkTotcnt"},
					                            {text:'获取时间',name:"enterDate"}
							                ];
		    g_grid.render(el ,{
		        url : xa_resource_info_list_url,
		        header : xa_resource_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//非XA资源信息
		no_xa_source_info_list : function(el, paramObj) {
			var no_xa_resource_info_list_url = "monitorview/middleware/weblogic/queryWeblJtaNoXa";
			var no_xa_resource_info_list_header = [
								                    {text:'非XA资源名称',name:"nonxaResourceName"},
						                            {text:'事务总数',name:"tranTotCount"},
						                            {text:'提交事务',name:"tranCommitTotcnt"},
						                            {text:'回滚事务',name:"tranRolbackTotcnt"},
						                            {text:'试探事务',name:"tranHeuristTotcnt"},
						                            {text:'获取时间',name:"enterDate"}
						                           ];
		    g_grid.render(el ,{
		        url : no_xa_resource_info_list_url,
		        header : no_xa_resource_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//恢复服务信息
		recover_server_info_list : function(el, paramObj) {
			var recover_server_info_list_url = "monitorview/middleware/weblogic/queryWeblJtaRecovery";
			var recover_server_info_list_header = [
								                    {text:'名称',name:"name"},
						                            {text:'活动',name:"active"},
						                            {text:'已恢复事务处理的初始总数',name:"recoveredTranTotcnt"},
						                            {text:'已恢复事务处理的完成百分比（%）',name:"recoveredTranPercent"},
						                            {text:'获取时间',name:"enterDate"}
						                           ];
		    g_grid.render(el ,{
		        url : recover_server_info_list_url,
		        header : recover_server_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//应用信息
		app_info_render : function(opt){
			um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblApplication",
		        paramObj : opt.paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var selBuff = [];
		            for (var i = 0; i < data.length; i++) {
		                selBuff.push({id:data[i].applicationName ,text:data[i].applicationName});
		            }
		            $("#application_sel").select2({
		                  data: selBuff,
		                  width:"100%"
		            });
		            //缓存serverName
		            opt.cbf && opt.cbf(data)
		            $("#application_sel").trigger("change");
		        }
		    });
		},

		//组件下拉框
		component_get : function(opt){
			opt.paramObj.applicationName = opt.applicationName;
		    opt.paramObj.serverName = opt.serverName;
		    um_ajax_get({
		        url : "monitorview/middleware/weblogic/queryWeblSubApplication",
		        paramObj : opt.paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var selBuff2 = [];
		            for (var i = 0; i < data.length; i++) {
		                selBuff2.push({id:data[i].webApplicationName ,text:data[i].webApplicationName});
		            }

		            $("#component_sel").find("option").remove();
		            $("#component_sel").select2({
		                  data: selBuff2,
		                  width:"100%"
		            });

		            if(selBuff2.length==0){
		              return;
		            }
		            //缓存data
		            opt.cbf && opt.cbf(data);
		            $("#component_sel").trigger("change");
		            
		        }
		    });
		},

		//组件信息
		component_info_list : function(el, opt) {
			var subType0_url = "monitorview/middleware/weblogic/queryWeblAppWebServlet";
			var subType0_header = [
			                      {text:"Servlet名称" ,name:"servletName" ,width:"auto"},
			                      {text:"Servlet路径" ,name:"servletPath" ,width:"auto"},
			                      {text:"上下文路径" ,name:"contextPath" ,width:"auto"},
			                      {text:"平均执行时间" ,name:"executionTimeAvg" ,width:"auto"},
			                      {text:"最大执行时间" ,name:"executionTimeHigh" ,width:"auto"},
			                      {text:"最小执行时间" ,name:"executionTimeLow" ,width:"auto"},
			                      {text:"总执行时间" ,name:"executionTimeTot" ,width:"auto"},
			                      {text:"总调用次数" ,name:"invocationTotcnt" ,width:"auto"},
			                      {text:"总重载次数" ,name:"reloadTotcnt" ,width:"auto"},
			                      {text:"获取时间" ,name:"enterDate" ,width:"auto"}
			                    ];

			var subType1_url = "monitorview/middleware/weblogic/queryWeblAppEjb";
			var subType1_header = [
			                      {text:"EJB名称" ,name:"ejbName" ,width:"auto"},
			                      {text:"EJB类型" ,name:"ejbType" ,width:"auto"},
			                      {text:"事务提交总数" ,name:"tranCommitTotcnt" ,width:"auto"},
			                      {text:"事务回滚总数" ,name:"tranRlbkTotcnt" ,width:"auto"},
			                      {text:"事务超时总数" ,name:"tranTimedoutTotcnt" ,width:"auto"},
			                      {text:"活化数量" ,name:"activationCnt" ,width:"auto"},
			                      {text:"钝化数量" ,name:"passivationCnt" ,width:"auto"},
			                      {text:"在用Bean数量" ,name:"beansInuseCnt" ,width:"auto"},
			                      {text:"空闲Bean数量" ,name:"idleBeansCnt" ,width:"auto"},
			                      {text:"当前池化Bean数量" ,name:"pooledBeansCurtcnt" ,width:"auto"},
			                      {text:"当前等待着数量" ,name:"waiterCurtcnt" ,width:"auto"},
			                      {text:"等待着总数" ,name:"waiterTotalcnt" ,width:"auto"},
			                      {text:"获取时间" ,name:"enterDate" ,width:"auto"}
			                   ];

			var subType2_url = "monitorview/middleware/weblogic/queryWeblAppConncomppool";
			var subType2_header = [
			                      {text:"连接池组件名称" ,name:"connComponentName" ,width:"auto"},
			                      {text:"连接池名称" ,name:"poolName" ,width:"auto"},
			                      {text:"池大小高水位" ,name:"poolSizeHighWaterMark" ,width:"auto"},
			                      {text:"池大小低水位" ,name:"poolSizeLowWaterMark" ,width:"auto"},
			                      {text:"当前活动连接数" ,name:"activeConnCurtcnt" ,width:"auto"},
			                      {text:"当前空闲连接数" ,name:"freeConnCurtcnt" ,width:"auto"},
			                      {text:"最大活动连接数" ,name:"activeConnHighcnt" ,width:"auto"},
			                      {text:"最大空闲连接数" ,name:"freeConnHighcnt" ,width:"auto"},
			                      {text:"创建连接总数" ,name:"connCreateTotcnt" ,width:"auto"},
			                      {text:"销毁连接总数" ,name:"connDestroyTotcnt" ,width:"auto"},
			                      {text:"因错误销毁" ,name:"connDestroyErrorTotcnt" ,width:"auto"},
			                      {text:"因空闲销毁" ,name:"connDestroyShrinkTotcnt" ,width:"auto"},
			                      {text:"获取时间" ,name:"enterDate" ,width:"auto"}
			                   ];

			var subType3_url = "monitorview/middleware/weblogic/queryWeblAppJdbcconnectpool";
			var subType3_header = [
			                      {text:"连接池名称" ,name:"connpoolName" ,width:"auto"},
			                      {text:"平均活动连接数" ,name:"activeConnAvgCnt" ,width:"auto"},
			                      {text:"当前活动连接数" ,name:"activeConnCurtCnt" ,width:"auto"},
			                      {text:"最大活动连接数" ,name:"activeConnHighCnt" ,width:"auto"},
			                      {text:"当前等待连接数" ,name:"waitConnCurtCnt" ,width:"auto"},
			                      {text:"最大等待连接数" ,name:"waitConnHighCnt" ,width:"auto"},
			                      {text:"最大可用连接数" ,name:"highestAvailable" ,width:"auto"},
			                      {text:"最大不可用连接数" ,name:"highestUnavailable" ,width:"auto"},
			                      {text:"可用连接数" ,name:"numAvailable" ,width:"auto"},
			                      {text:"不可用连接数" ,name:"numUnavailable" ,width:"auto"},
			                      {text:"获取时间" ,name:"enterDate" ,width:"auto"}
			                   ];

			var subType4_url = "monitorview/middleware/weblogic/queryWeblAppJdbcdatasource";
			var subType4_header = [
			                      {text:"数据源名称" ,name:"datasourceName" ,width:"auto"},
			                      {text:"平均活动连接数" ,name:"activeConnAveragecnt" ,width:"auto"},
			                      {text:"当前活动连接数" ,name:"activeConnCurtCnt" ,width:"auto"},
			                      {text:"最大活动连接数" ,name:"activeConnHighCnt" ,width:"auto"},
			                      {text:"最大可用连接数" ,name:"highestAvailable" ,width:"auto"},
			                      {text:"最大不可用连接数" ,name:"highestUnavailable" ,width:"auto"},
			                      {text:"可用连接数" ,name:"numAvailable" ,width:"auto"},
			                      {text:"不可用连接数" ,name:"numUnavailable" ,width:"auto"},
			                      {text:"预编译语句缓存访问次数" ,name:"prepstmtAccessCnt" ,width:"auto"},
			                      {text:"预编译语句添加次数" ,name:"prepstmtAddCnt" ,width:"auto"},
			                      {text:"预编译语句删除次数" ,name:"prepstmtDelCnt" ,width:"auto"},
			                      {text:"预编译语句命中次数" ,name:"prepstmtHitCnt" ,width:"auto"},
			                      {text:"预编译语句丢失次数" ,name:"prepstmtMissCnt" ,width:"auto"},
			                      {text:"预编译语句当前大小" ,name:"prepstmtCurtSize" ,width:"auto"},
			                      {text:"当前等待连接数" ,name:"waitConnCurtcnt" ,width:"auto"},
			                      {text:"最大等待连接数" ,name:"waitConnHighCnt" ,width:"auto"},
			                      {text:"等待连接失败总数" ,name:"waitConnFailureTot" ,width:"auto"},
			                      {text:"等待连接成功总数" ,name:"waitConnSuccessTot" ,width:"auto"},
			                      {text:"等待连接总数" ,name:"waitConnTot" ,width:"auto"},
			                      {text:"最大等待时长" ,name:"waitSecondsHighCnt" ,width:"auto"},
			                      {text:"获取时间" ,name:"enterDate" ,width:"auto"}
			                   ];

			opt.paramObj.subAppName = opt.subAppName;
		    var temp_url = "";
		    var temp_header = "";
		    switch(opt.subType){
		        case "0":
		          temp_url = subType0_url;
		          temp_header = subType0_header;
		          break;
		        case "1":
		          temp_url = subType1_url;
		          temp_header = subType1_header;
		          break;
		        case "2":
		          temp_url = subType2_url;
		          temp_header = subType2_header;
		          break;
		        case "3":
		          temp_url = subType3_url;
		          temp_header = subType3_header;
		          break;
		        case "4":
		          temp_url = subType4_url;
		          temp_header = subType4_header;
		          break;
		    }
		    g_grid.render(el,{
		      url : temp_url,
		      header : temp_header,
		      paramObj : opt.paramObj,
		      gridCss : "um-grid-style",
		      hasBorder : false,
		      hideSearch : true,
		      allowCheckBox : false,
	          dbThLine : true,
	          tableWidth : "2000px"
		    });
		},

		//服务器状态信息
		server_status_list : function(el, paramObj){
			var server_status_list_url = "monitorview/middleware/weblogic/queryServerStatus";
			var server_status_list_header = [
						                    {text:'服务器名称',name:"serverName"},
				                            {text:'计算机名称',name:"hostName"},
				                            {text:'服务器状态',name:"serverStatus"},
				                            {text:'端口',name:"port"},
				                            {text:'获取时间',name:"enterDate"}
				                           ];
		    g_grid.render(el ,{
		        url : server_status_list_url,
		        header : server_status_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//连接信息
		connect_list : function(el, paramObj) {
			var connect_list_url = "monitorview/middleware/weblogic/queryWeblPersistentConn";
			var connect_list_header = [
					                    {text:'名称',name:"name",width:20},
			                            {text:'描述',name:"desc",width:10,render:function(text){
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'创建计数',name:"createCount",width:10},
			                            {text:'删除计数',name:"deleteCount",width:10},
			                            {text:'读取计数',name:"readCount",width:10},
			                            {text:'更新计数',name:"updateCount",width:10},
			                            {text:'对象计数',name:"objectCount",width:10},
			                            {text:'获取时间',name:"enterDate",width:10}
			                           ];
		    g_grid.render(el ,{
		        url : connect_list_url,
		        header : connect_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//统计信息
		count_list : function(el, paramObj) {
			var count_list_url = "monitorview/middleware/weblogic/queryWeblPersistent";
			var count_list_header = [
					                    {text:'名称',name:"name"},
			                            {text:'描述',name:"desc",render:function(text){
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'创建计数',name:"createCount"},
			                            {text:'删除计数',name:"deleteCount"},
			                            {text:'读取计数',name:"readCount"},
			                            {text:'更新计数',name:"updateCount"},
			                            {text:'对象计数',name:"objectCount"},
			                            {text:'物理写次数',name:"physicalWriteCount"},
			                            {text:'分配的IO缓冲区字节数(B)',name:"allocatedIoBufferBytes"},
			                            {text:'分配的窗口缓冲区字节数(B)',name:"allocatedWindowBufferBytes"},
			                            {text:'获取时间',name:"enterDate"}
			                           ];
		    g_grid.render(el ,{
		        url : count_list_url,
		        header : count_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//集群信息
		connective_list : function(el, paramObj) {
			var connective_list_url = "monitorview/middleware/weblogic/queryWeblCluster";
			var connective_list_header = [
					                    {text:'名字',name:"name"},
			                            {text:'描述',name:"desc",render:function(text){
			                                // debugger;
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'集群地址',name:"clusterAddress",render:function(text){
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'多播地址',name:"multicastAddress"},
			                            {text:'多播端口',name:"multicastPort"},
			                            {text:'多播TTL',name:"multicastTTL"},
			                            {text:'默认负载算法',name:"defaultLoadAlgorithm"},
			                            {text:'获取时间',name:"enterDate"}
			                           ];
		    g_grid.render(el ,{
		        url : connective_list_url,
		        header : connective_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//工作量信息
		work_list : function(el, paramObj) {
			var work_list_url = "monitorview/middleware/weblogic/queryWeblWork";
			var work_list_header = [
					                    {text:'名称',name:"name"},
			                            {text:'描述',name:"desc",render:function(text){
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'暂挂请求',name:"pendingRequests"},
			                            {text:'完成的请求',name:"completedRequests"},
			                            {text:'获取时间',name:"enterDate"}
			                           ];
		    g_grid.render(el ,{
		        url : work_list_url,
		        header : work_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//jdbc信息
		jdbc_list : function(el, paramObj) {
			var jdbc_list_url = "monitorview/middleware/weblogic/queryWeblJDBC";
			var jdbc_list_header = [
					                    {text:'名称',name:"name"},
			                            {text:'描述',name:"desc",render:function(text){
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'状态',name:"state"},
			                            {text:'当前活动连接数',name:"activeConnectionsCurrentCount"},
			                            {text:'活动连接平均数',name:"activeConnectionsAverageCount"},
			                            {text:'最大活动连接计数',name:"activeConnectionsHighCount"},
			                            {text:'获取时间',name:"enterDate"}
			                           ];
		    g_grid.render(el ,{
		        url : jdbc_list_url,
		        header : jdbc_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//通道信息
		pipe_list : function(el, paramObj) {
			var pipe_list_url = "monitorview/middleware/weblogic/queryWeblChannel";
			var pipe_list_header = [
					                    {text:'名称',name:"name"},
			                            {text:'描述',name:"desc",render:function(text){
			                                if(text=="null" || text==null){
			                                    return "----";
			                                }
			                                return text;
			                            }},
			                            {text:'公共URL',name:"publicURL"},
			                            {text:'已收到字节数（b）',name:"bytesReceivedCount"},
			                            {text:'已发送字节数（b）',name:"bytesSentCount"},
			                            {text:'接受计数',name:"acceptCount"},
			                            {text:'已收到消息数',name:"messagesReceivedCount"},
			                            {text:'已发送消息数',name:"messagesSentCount"},
			                            {text:'连接数',name:"connectionsCount"},
			                            {text:'获取时间',name:"enterDate"}
			                           ];
		    g_grid.render(el ,{
		        url : pipe_list_url,
		        header : pipe_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

	}
})