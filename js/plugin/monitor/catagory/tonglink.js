define(['/js/plugin/monitor/monitorInfo.js'] ,function (monitorInfo){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/tonglink/queryTongLinkMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},

		//队列信息
		que_info_list : function (el, paramObj) {
			var que_info_list_url="monitorview/middleware/tonglink/queryQueInfo";
			var que_info_list_header = [
					                        {text:'队列名称',name:"queName"},
											{text:'队列ID',name:"queId"},
											{text:'队列模式',name:"queMode"},
											{text:'队列总消息个数',name:"totalMsgNum"},
											{text:'保持消息个数',name:"remainMsgNum"},
											{text:'当前保存的消息数',name:"keptMsgNum"},
											{text:'发送个数',name:"sendingNum"},
											{text:'接收个数',name:"receivingNum"},
											{text:'等待请求个数',name:"waitResNum"},
											{text:'等待应答个数',name:"waiAckNum"},
											{text:'终止个数',name:"suspendNum"},
											{text:'保持空间大小(非持久的)',name:"npremainSpace"},
											{text:'保持空间大小(持久的)',name:"premainSpace"},
											{text:'监控时间',name:"enterDate"}
						                ];
		    g_grid.render(el ,{
		        url : que_info_list_url,
		        header : que_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//通道信息
		conn_info_list : function (el, paramObj) {
			var conn_info_list_url="monitorview/middleware/tonglink/queryConnInfo";
			var conn_info_list_header = [
					                        {text:'通道名称',name:"connName"},
											{text:'通道状态',name:"connStatus"},
											{text:'通道类型',name:"connType"},
											{text:'记录时间',name:"enterDate"}
						                ];
		    g_grid.render(el ,{
		        url : conn_info_list_url,
		        header : conn_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		//客户代理信息
		client_info_list : function (el, paramObj) {
			var client_info_list_url="monitorview/middleware/tonglink/queryBrokerInfo";
			var client_info_list_header = [
					                        {text:'代理号',name:"clientBrokerId"},
											{text:'会话池数量',name:"sessionNum"},
											{text:'记录时间',name:"enterDate"}
						                ];
		    g_grid.render(el ,{
		        url : client_info_list_url,
		        header : client_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
	}
})