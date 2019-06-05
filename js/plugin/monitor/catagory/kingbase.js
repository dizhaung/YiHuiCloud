define(['/js/plugin/monitor/monitorInfo.js','/js/plugin/plot/plot.js'] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/db/kingbase/queryKingbaseMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		        	$("#base_info_asset_div2").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div2").umDataBind("render" ,data.assetinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		            if (data.monitorbaseinfo.version == "KINGBASE_V8") {
		            	$("#table_space").hide()
		            }
		        }
		    });
		},
		static_info : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/kingbase/queryStaticInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#static_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		table_space_list : function (paramObj){
			var table_space_list_url = "monitorview/db/kingbase/queryTableSpaceInfo";

			var table_space_list_header = [
											  {text:"文件逻辑名" ,name:"logicName"},
										      {text:"文件所属的</br>表空间名" ,name:"spcName"},
										      {text:"文件的物理路径" ,name:"fileName"},
										      {text:"文件的初始大小" ,name:"initSize"},
										      {text:"文件的最大大小" ,name:"maxSize"},
										      {text:"文件的增长率" ,name:"growth"},
										      {text:"文件当前大小" ,name:"currentSize"},
										      {text:"文件中被使用的页面数" ,name:"usedBlocks"},
										      {text:"文件中的数据页面数" ,name:"dataBlocks"},
										      {text:"文件中的空闲页面数" ,name:"freeBlocks"},
										      {text:"记录时间" ,name:"enterDate"}
			                           ];
			g_grid.render($("#table_space_div") ,{
		        url : table_space_list_url,
		        header : table_space_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        paginator : false,
		        showCount : true,
		        dbThLine : true
		    });
		},
		lock_list : function (paramObj){
			var lock_list_url = "monitorview/db/kingbase/queryLockInfo";
			var lock_list_header = [
									  {text:"数据库名" ,name:"dbName"},
								      {text:"表名" ,name:"tableName"},
								      {text:"锁模式" ,name:"lockMode"},
								      {text:"锁是否已经被授予" ,name:"granted"},
								      {text:"封锁对象的类型" ,name:"lockType"},
								      {text:"记录时间" ,name:"enterDate"}
									 ];
            g_grid.render($("#lock_list_table") ,{
				url : lock_list_url,
				header : lock_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true
			});
		},
		sequence_list : function (paramObj){
			var sequence_list_url = "monitorview/db/kingbase/querySequenceInfo";
			var sequence_list_header = [
									  {text:"表对应模式名" ,name:"dbName"},
								      {text:"序列名" ,name:"sequenceName"},
								      {text:"读取的块数" ,name:"readBlks"},
								      {text:"读取的块的命中数" ,name:"hitBlks"},
								      {text:"记录时间" ,name:"enterDate"}
									 ];
            g_grid.render($("#sequence_list_table") ,{
				url : sequence_list_url,
				header : sequence_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true
			});
		},
		transcation_list : function (paramObj){
			var transcation_list_url = "monitorview/db/kingbase/queryTranscationInfo";
			var transcation_list_header = [
									  {text:"数据库名" ,name:"dbName"},
								      {text:"活动后台数" ,name:"backendNum"},
								      {text:"提交的事务数" ,name:"commitNum"},
								      {text:"回滚的事务数" ,name:"rollbackNum"},
								      {text:"读取的块数" ,name:"readBlks"},
								      {text:"命中的块数" ,name:"hitBlks"},
								      {text:"记录时间" ,name:"enterDate"}
									 ];
            g_grid.render($("#transcation_list_table") ,{
				url : transcation_list_url,
				header : transcation_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				showCount : true
			});
		},
		user_access_list : function (paramObj){
			var user_access_list_url = "monitorview/db/kingbase/queryAccessInfo";
			var user_access_list_header = [
									  {text:"数据库实例名" ,name:"dbName"},
								      {text:"用户名" ,name:"userName"},
								      {text:"是否处于等待状态" ,name:"waitStatus", render:function(txt){
								      	if (txt == 1) {
								      		return txt = "是"
								      	} else {
								      		return txt = "否"
								      	}
								      }},
								      {text:"客户端地址" ,name:"clientAddr"},
								      {text:"客户端端口" ,name:"clientPort"},
								      {text:"记录时间" ,name:"enterDate"}
									 ];
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
		}

	}
});