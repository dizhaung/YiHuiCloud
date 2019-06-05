define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/virtual/vmware/queryVmwareMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#vmware_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},

		mount_name_init : function (paramObj){
			var self = this;
		    um_ajax_get({
		        url : "monitorview/virtual/vmware/queryHostDetail",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var selBuff = [];
		            for (var i = 0; i < data.length; i++) {
		                selBuff.push({id:data[i].name ,text:data[i].name});
		            }
		            $("#mount_name").select2({
		                  data: selBuff,
		                  width:"100%"
		            });
		            self.virtual_machine_disk_list(paramObj);     
				}
			});
		},

		cpu_use_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/virtual/vmware/queryCPUDynamicInfo",
				paramObj : paramObj,
				isLoad:false,
				successCallBack : function (data){
					var items = data;
		            var legendArray = ['CPU使用率（%）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = 'CPU使用率（%）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].updateDate);
		                seriesObj.data.push(items[i].cpuUsage);
		            }
		            seriesArray.push(seriesObj);

		            plot.lineRender(el ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray,
		                axisLabelFormatter : function (value){
							return value.substr(5,11)
						}
		            });
				}
			});
		},

		memory_use_chart : function (el, paramObj) {
			um_ajax_get({
				url : "monitorview/virtual/vmware/queryMemoryUsageDynamicInfo",
				paramObj : paramObj,
				isLoad:false,
				successCallBack : function (data){
					var items = data;
		            var legendArray = ['内存使用率（%）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesObj = new Object();
		            seriesObj.name = '内存使用率（%）';
		            seriesObj.type = "line";
		            seriesObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].enterDate);
		                seriesObj.data.push(items[i].memoryUsage);
		            }
		            seriesArray.push(seriesObj);
		            plot.lineRender(el,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray,
		                axisLabelFormatter : function (value){
							return value.substr(5,11)
						}
		            });
				}
			});
		},

		//虚拟机信息
		virtual_machine_list : function (paramObj) {
			var virtual_machine_list_url="monitorview/virtual/vmware/queryHostDetail";
			var virtual_machine_list_header = [
										         {text:"虚拟机名称" ,name:"name" ,width:12.5},
										         {text:"操作系统" ,name:"osType" ,width:24.5},
										         {text:"内存大小(MB)" ,name:"ramSize" ,width:10.5},
										         {text:"CPU核数" ,name:"core" ,width:10.5},
										         {text:"已消耗</br>主机的CPU(HZ)" ,name:"cpuUse" ,width:10.5},
										         {text:"已消耗</br>主机的内存(MB)" ,name:"memUse" ,width:10.5},
										         {text:"电源状态" ,name:"powerType" ,width:10.5},
										         {text:"监控时间" ,name:"updateDate" ,width:10.5}
										      ];
		    g_grid.render($("#virtual_machine_info_table") ,{
		        url : virtual_machine_list_url,
		        header : virtual_machine_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        dbThLine : true,
		    });
		},

		virtual_machine_disk_list : function (paramObj) {
			var virtual_machine_disk_list_url="monitorview/virtual/vmware/queryDiskDynamicInfo";
			var virtual_machine_disk_list_header = [
											          {text:"虚拟机名称" ,name:"mountName"},
					                                  {text:"磁盘名称" ,name:"fileSysType"},
					                                  {text:"磁盘类型" ,name:"diskType"}, 
					                                  {text:"磁盘总大小(GB)" ,name:"totalSize"},
					                                  {text:"磁盘空闲大小(GB)" ,name:"freeSize"},
					                                  {text:"记录时间" ,name:"enterDate"}
											      ];
			paramObj.mountName = $("#mount_name").val();
		    g_grid.render($("#virtual_machine_info_table") ,{
		        url : virtual_machine_disk_list_url,
		        header : virtual_machine_disk_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		}
	}
})
