define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/storage/ibmStorage/queryIbmStorageMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/storage/ibmStorage/queryCpuInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var cpuStore = data.cpuStore;
		            var memStore = data.memStore;
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
		// 接口使用动态信息
		interface_chart : function (el ,paramObj){
			um_ajax_get({
				url : "monitorview/storage/ibmStorage/queryInterfaceDynamicInfo",
				paramObj : paramObj,
				isLoad:false,
		        successCallBack : function (data){
		        	var fc = data.datas[0].items;
		            var sas = data.datas[1].items;
		            var iscsi = data.datas[2].items;
		            var legendArray = ['光纤接口流速（FC）','串行接口流速（SAS）','设备接口流速（ISCSI）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '光纤接口流速（FC）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < fc.length; i++) {
		                categoryArray.push(fc[i].tip);
		                seriesObj.data.push(fc[i].value);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '串行接口流速（SAS）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < sas.length; i++) {
		                seriesObj2.data.push(sas[i].value);
		            }
		            seriesArray.push(seriesObj2);

		            var seriesObj3 = new Object();
		            seriesObj3.name = '设备接口流速（ISCSI）';
		            seriesObj3.type = "line";
		            seriesObj3.data = [];
		            for (var i = 0; i < iscsi.length; i++) {
		                seriesObj3.data.push(iscsi[i].value);
		            }
		            seriesArray.push(seriesObj3);
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
			});
		},

		// 卷使用动态信息
		page_chart : function (paramObj){
			um_ajax_get({
				url : "monitorview/storage/ibmStorage/queryVolumeDynamicInfo",
				paramObj : paramObj,
				isLoad:false,
		        successCallBack : function (data){
		        	//读写速度
		            var readRate = data.rateFlexList[0].items;
		            var writeRates = data.rateFlexList[1].items;
		            var legendArray = ['读速度（Mbps）','写速度（Mbps）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '读速度（Mbps）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < readRate.length; i++) {
		                categoryArray.push(readRate[i].tip);
		                seriesObj.data.push(readRate[i].value);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '写速度（Mbps）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < writeRates.length; i++) {
		                seriesObj2.data.push(writeRates[i].value);
		            }
		            seriesArray.push(seriesObj2);
		            plot.lineRender($("#page_info") ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });

		            //读写时间
		            var readTime = data.timeFlexList[0].items;
		            var writeTime = data.timeFlexList[1].items;
		            var legendArray = ['读响应时间（MS）','写响应时间（MS）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '读响应时间（MS）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < readTime.length; i++) {
		                categoryArray.push(readTime[i].tip);
		                seriesObj.data.push(readTime[i].value);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '写响应时间（MS）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < writeTime.length; i++) {
		                seriesObj2.data.push(writeTime[i].value);
		            }
		            seriesArray.push(seriesObj2);
		            
		            plot.lineRender($("#page_info_time") ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
			});
		},

		// MDisk使用动态信息
		mdisk_chart : function (paramObj){
			um_ajax_get({
				url : "monitorview/storage/ibmStorage/queryMDiskDynamicInfo",
				paramObj : paramObj,
				isLoad:false,
		        successCallBack : function (data){
		        	//读写速度
		            var readRate = data.rateFlexList[0].items;
		            var writeRates = data.rateFlexList[1].items;
		            var legendArray = ['读速度（Mbps）','写速度（Mbps）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '读速度（Mbps）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < readRate.length; i++) {
		                categoryArray.push(readRate[i].tip);
		                seriesObj.data.push(readRate[i].value);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '写速度（Mbps）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < writeRates.length; i++) {
		                seriesObj2.data.push(writeRates[i].value);
		            }
		            seriesArray.push(seriesObj2);
		            
		            plot.lineRender($("#mdisk_info") ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });

		            //读写时间
		            var readTime = data.timeFlexList[0].items;
		            var writeTime = data.timeFlexList[1].items;
		            var legendArray = ['读响应时间（MS）','写响应时间（MS）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '读响应时间（MS）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < readTime.length; i++) {
		                categoryArray.push(readTime[i].tip);
		                seriesObj.data.push(readTime[i].value);
		            }
		            seriesArray.push(seriesObj);

		            var seriesObj2 = new Object();
		            seriesObj2.name = '写响应时间（MS）';
		            seriesObj2.type = "line";
		            seriesObj2.data = [];
		            for (var i = 0; i < writeTime.length; i++) {
		                seriesObj2.data.push(writeTime[i].value);
		            }
		            seriesArray.push(seriesObj2);
		            
		            plot.lineRender($("#mdisk_info_time") ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
			});
		},
		// 电池状态信息
		buffer_status_list : function (el ,paramObj){
			var buffer_status_list_url="monitorview/storage/ibmStorage/queryBatteryInfo";
			var buffer_status_list_header = [
					                        {text:'机柜标识',name:"enclosure"},
				                            {text:'电池ID',name:"batteryId"},
				                            {text:'状态',name:"status"},
				                            {text:'电池充电状态',name:"chargeStatus"},
				                            {text:'电池是否调整',name:"recondition"},
				                            {text:'电池电量状态',name:"percentCharge"},
				                            {text:'电池寿命状态',name:"lifeWaring"},
				                            {text:'数据入库时间',name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : buffer_status_list_url,
		        header : buffer_status_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 磁盘状态信息
		disk_status_list : function (el ,paramObj){
			var disk_status_list_url="monitorview/storage/ibmStorage/queryDiskInfo";
			var disk_status_list_header = [
					                        {text:'磁盘状态',name:"status"},
				                            {text:'插槽编号',name:"slotId"},
				                            {text:'磁盘容量(G)',name:"capacity"},
				                            {text:'驱动类型',name:"techType"},
				                            {text:'阵列标识',name:"mdiskId"},
				                            {text:'阵列名称',name:"mdiskName"},
				                            {text:'数据入库时间',name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : disk_status_list_url,
		        header : disk_status_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		}
	}
});