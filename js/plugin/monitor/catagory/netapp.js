define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/brocade/queryBrocadeBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		runtime_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/storage/netapp/queryRunInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#runtime_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/storage/netapp/queryCPUDynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var cpuStore = data;
		            var legendArray = ['CPU使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

	            	var seriesCpuObj = new Object();
		            seriesCpuObj.name = 'CPU使用率(%)';
		            seriesCpuObj.type = "line";
		            seriesCpuObj.data = [];
		            for (var i = 0; i < cpuStore.length; i++) {
		                categoryArray.push(cpuStore[i].updateDate);
		                seriesCpuObj.data.push(cpuStore[i].cpuUsage);
		            }
		            seriesArray.push(seriesCpuObj);

		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5']
		            });

		        }
		    }); 
		},
		// 存储空间信息
		page_info_list : function (el ,paramObj){
			var page_info_list_url="monitorview/storage/netapp/queryDfinfoList";
			var page_info_list_header = [
					                        {text:'名称',name:"dfName"},
				                            {text:'使用率',name:"dfUsege"},
				                            {text:'剩余空间',name:"leftnum"},
				                            {text:'总空间',name:"total"},
				                            {text:'获取时间',name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : page_info_list_url,
		        header : page_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		//RAID信息
		disk_info_list : function (el ,paramObj){
			var disk_info_list_url="monitorview/storage/netapp/queryDiskList";
			var disk_info_list_header = [
					                        {text:'磁盘索引',name:"raidIndex"},
				                            {text:'磁盘名称',name:"raidName"},
				                            {text:'磁盘状态',name:"raidStatus"},
				                            {text:'磁盘温度',name:"raidTemperature"},
				                            {text:'剩余空间',name:"leftnum"},
				                            {text:'总空间',name:"total"},
				                            {text:'获取时间',name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : disk_info_list_url,
		        header : disk_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		io_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/storage/netapp/queryNetAndDiskIODynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var netStore = data.netIoStore;
		            var legendArray = ['发送速率（kb）','接收速率（kb）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '发送速率（kb）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < netStore.length; i++) {
		                categoryArray.push(netStore[i].updateDate);
		                seriesObj.data.push(netStore[i].sentBytes);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '接收速率（kb）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < netStore.length; i++) {
		                seriesObj2.data.push(netStore[i].rcvdBytes);
		            }
		            seriesArray.push(seriesObj2);
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });

		        }
		    }); 
		},
		disk_chart : function (el ,paramObj){
			um_ajax_get({
		        url : "monitorview/storage/netapp/queryNetAndDiskIODynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var diskStore = data.diskIostore;
		            var legendArray = ['读取速率（kb）','写入速率（kb）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '读取速率（kb）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < diskStore.length; i++) {
		                categoryArray.push(diskStore[i].updateDate);
		                seriesObj.data.push(diskStore[i].readBytes);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '写入速率（kb）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < diskStore.length; i++) {
		                seriesObj2.data.push(diskStore[i].writeBytes);
		            }
		            seriesArray.push(seriesObj2);
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });

		        }
		    }); 
		}
	}
});