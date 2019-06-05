define(['/js/plugin/monitor/monitorInfo.js'],function (monitorInfo){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "apusicServerView/queryApusicMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		        }
		    })
		},

		//数据源详细信息
		data_source_info_list : function (el, paramObj) {
			var data_source_info_list_url="apusicServerView/queryDataSource";
			var data_source_info_list_header = [
							                        {text:'数据源名称',name:"dsName"},
						                            {text:'连接URL',name:"connUrl",tip:true,render:function (txt){
						                                if (txt)
						                                {
						                                    return txt.length > 20 ? txt.substr(0,20) : txt;
						                                }
						                            }},
						                            {text:'JNDI名称',name:"jndiName"},
						                            {text:'驱动类名',name:"driveName"},
						                            {text:'语句缓存数',name:"cacheSize"},
						                            {text:'结果集预取大小',name:"fetchSize"},
						                            {text:'获取时间',name:"enterDate"}
							                     ];
		    g_grid.render(el ,{
		        url : data_source_info_list_url,
		        header : data_source_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//License配置信息
		license_config_list : function (el, paramObj) {
			var license_config_list_url="apusicServerView/queryLicence";
			var license_config_list_header = [
						                        {text:'产品名称',name:"productName"},
					                            {text:'产品版本',name:"productVersion"},
					                            {text:'提供商',name:"vendor"},
					                            {text:'服务器运行状态',name:"serverState"},
					                            {text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : license_config_list_url,
		        header : license_config_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//http线程池服务信息
		http_process_list : function (el, paramObj) {
			var http_process_list_url="apusicServerView/queryHttpThreadPool";
			var http_process_list_header = [
						                        {text:'线程创建个数',name:"createThreadCnt"},
					                            {text:'线程销毁个数',name:"destoryThreadCnt",render:function(txt){
					                            	if("-1"==txt)
					                            		return "0"
					                            	else
					                            		return txt
					                            }},
					                            {text:'当前线程数',name:"currentThreadCnt"},
					                            {text:'最大线程个数',name:"maxThreadCnt",render:function(txt){
					                            	if(txt=="-2")
					                            		return "0"
					                            	else
					                            		return txt
					                            }},
					                            {text:'忙线程数',name:"busyThreadCnt"},
					                            {text:'最大忙线程数',name:"maxBusyThreadCnt"},
					                            {text:'线程最小执行时间',name:"minProcTime"},
					                            {text:'线程最大执行时间',name:"maxProcTime"},
					                            {text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : http_process_list_url,
		        header : http_process_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//ACP服务信息
		ACP_service_list : function (el, paramObj) {
			var ACP_service_list_url="apusicServerView/queryAcpConfig";
			var ACP_service_list_header = [
						                        {text:'ACP超时(秒)',name:"timeOut"},
					                            {text:'ACP是否启用',name:"acpEnabled",render:function(txt){
					                            	if("1"==txt) 
					                            		return "是"
					                            	else if("0"==txt)
					                            		return "否"
					                            	else
					                            		return txt
					                            }},
					                            {text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : ACP_service_list_url,
		        header : ACP_service_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//AJP服务信息
		AJP_service_list : function (el, paramObj) {
			var AJP_service_list_url="apusicServerView/queryAjpConfig";
			var AJP_service_list_header = [
						                        {text:'AJP地址',name:"address"},
					                            {text:'AJP端口',name:"port"},
					                            {text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : AJP_service_list_url,
		        header : AJP_service_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//EJB服务信息
		EJB_service_list : function (el, paramObj) {
			var EJB_service_list_url="apusicServerView/queryEjbConfig";
			var EJB_service_list_header = [
						                        {text:'缺省EntityBean数据源',name:"defEntityDs"},
					                            {text:'缺省消息连接创建器',name:"defMsgCnnDs"},
					                            {text:'Entity缓存',name:"entityCacheSize"},
					                            {text:'Session缓存',name:"sessionCacheSize"},
					                            {text:'Session存储目录',name:"sessionStoreDir"},
					                            {text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : EJB_service_list_url,
		        header : EJB_service_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//app服务信息
		app_service_list : function (el, paramObj) {
			var app_service_list_url="apusicServerView/queryAppConfig";
			var app_service_list_header = [
						                        {text:'应用名',name:"name"},
					                            {text:'上下文根节点',name:"contextRoot"},
					                            {text:'部署路径',name:"deployPath"},
					                            {text:'J2EE类型',name:"j2eeType"},
					                            {text:'状态',name:"state"},
					                            {text:'获取时间',name:"enterDate"}
						                     ];
		    g_grid.render(el ,{
		        url : app_service_list_url,
		        header : app_service_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
	}
})