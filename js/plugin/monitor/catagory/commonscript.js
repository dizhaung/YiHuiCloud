define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/plot/plot.js',] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonurl/queryCommonUrlMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		url_sel_render : function (urlParamObj){
			$("#url_sel").empty()
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonscript/getCommonScriptContent",
		        paramObj : {monitorId : urlParamObj.monitorId},
		        isLoad : false,
		        successCallBack : function (data){
		            for (var i = 0; i < data.length; i++) {
		                $("#url_sel").append('<option value="'+data[i].codevalue+'">'+data[i].codename+'</option>')
		            }
		            $("#url_sel").trigger("change");
		       
		        }
		    });
		},
		// 页面信息
		common_script_render : function (el,urlParamObj){		 
		    var common_script_result_url="monitorview/commonmonitor/commonscript/getCommonScriptResult";
			var common_script_result_header = [
					                          {text:"执行结果" ,name:"result"},
										      {text:"响应时间" ,name:"enterDate"},
										  
					                     ];
		    g_grid.render(el ,{
		        url : common_script_result_url,
		        header : common_script_result_header,
		        paramObj : urlParamObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		}
	}
})