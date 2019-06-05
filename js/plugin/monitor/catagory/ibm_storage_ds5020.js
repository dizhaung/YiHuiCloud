define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/storage/ibmds5020/queryIbmDs5020MonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		// 物理分区
		physical_info_list : function (el ,paramObj){
			var physical_info_list_url="monitorview/storage/ibmds5020/queryPhysicalDrive";
			var physical_info_list_header = [
					                        {text:'名称',name:"name"},
				                            {text:'容量',name:"capacityName"},
				                            {text:'描述',name:"driveDesc"},
				                            {text:'状态',name:"status"},
				                            {text:'获取时间',name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : physical_info_list_url,
		        header : physical_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 逻辑分区
		logic_info_list : function (el ,paramObj){
			var logic_info_list_url="monitorview/storage/ibmds5020/queryLogiclDrive";
			var logic_info_list_header = [
					                        {text:'名称',name:"name"},
				                            {text:'容量',name:"capacityName"},
				                            {text:'描述',name:"driveDesc"},
				                            {text:'状态',name:"status"},
				                            {text:'获取时间',name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : logic_info_list_url,
		        header : logic_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 通道
		pipe_info_list : function (el ,paramObj){
			var pipe_info_list_url="monitorview/storage/ibmds5020/queryChannelInfo";
			var pipe_info_list_header = [
					                        {text:'名称',name:"name"},
				                            {text:'描述',name:"driveDesc"},
				                            {text:'状态',name:"status"},
				                            {text:'控制器A每秒错误数',name:"controllAErrorSec"},
				                            {text:'控制器A分区每秒错误数',name:"controllALogicErrorSec"},
				                            {text:'控制器A超时每秒错误数',name:"controllATimeoutErrorSec"},
				                            {text:'控制器A每秒I/O数',name:"controllALogicIOSec"},
				                            {text:'控制器A错误数',name:"controllAError"},
				                            {text:'控制器A分区错误数',name:"controllALogicError"},
				                            {text:'控制器A超时错误数',name:"controllATimeoutError"},
				                            {text:'控制器A I/O数',name:"controllALogicIO"},
				                            {text:'控制器B每秒错误数',name:"controllBErrorSec"},
				                            {text:'控制器B分区每秒错误数',name:"controllBLogicErrorSec"},
				                            {text:'控制器B超时每秒错误数',name:"controllBTimeoutErrorSec"},
				                            {text:'控制器B每秒I/O数',name:"controllBLogicIOSec"},
				                            {text:'控制器B错误数',name:"controllBError"},
				                            {text:'控制器B分区错误数',name:"controllBLogicError"},
				                            {text:'控制器B超时错误数',name:"controllBTimeoutError"},
				                            {text:'控制器B I/O数',name:"controllBLogicIO"},
				                            {text:'获取时间',name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : pipe_info_list_url,
		        header : pipe_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 控制器
		controller_info_list : function (el ,paramObj){
			var controller_info_list_url="monitorview/storage/ibmds5020/queryControllerInfo";
			var controller_info_list_header = [
					                        {text:'名称',name:"name"},
				                            {text:'描述',name:"driveDesc"},
				                            {text:'状态',name:"status"},
				                            {text:'获取时间',name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : controller_info_list_url,
		        header : controller_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		}
	}
});