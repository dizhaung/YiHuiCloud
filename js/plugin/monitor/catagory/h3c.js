define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/huawei/queryHuaweiBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		            $("[data-id=interfaceCount]").text(data.interfaceStore.interfaceCount);
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/network/huawei/queryHuaWeiCpuMemInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var cpuStore = data.cpuStore;
		            var memStore = data.memStore;
		            var legendArray
		            if (type == "cpu")
		            	legendArray = ['CPU使用率(%)'];
		            else
		            	legendArray = ['内存使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];

		            if (type == "cpu")
		            {
		            	var seriesCpuObj = new Object();
			            seriesCpuObj.name = 'CPU使用率(%)';
			            seriesCpuObj.type = "line";
			            seriesCpuObj.data = [];
			            for (var i = 0; i < cpuStore.length; i++) {
			                categoryArray.push(cpuStore[i].updateDate);
			                seriesCpuObj.data.push(cpuStore[i].cpuUsage);
			            }
			            seriesArray.push(seriesCpuObj);
		            }
		            if (type == "memory")
		            {
		            	var seriesMemObj = new Object();
			            seriesMemObj.name = '内存使用率(%)';
			            seriesMemObj.type = "line";
			            seriesMemObj.data = [];
			            for (var i = 0; i < memStore.length; i++) {
			            	categoryArray.push(memStore[i].updateDate);
			                seriesMemObj.data.push(memStore[i].memoryUsage);
			            }
			            seriesArray.push(seriesMemObj);
		            }
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                tooltipFormatter : function (param){
							return param[0].name.substr(5) + "</br>" + param[0].seriesName + " : " + param[0].value;	
						},
						axisLabelFormatter : function (value, index){
							if (value)
							{
								return value.substr(5,11);
							}
							else
							{
								return "";
							}
						},
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5']
		            });

		        }
		    }); 
		},
		// ARP表信息
		arp_info_list : function (el ,paramObj){
			var arp_info_list_url="monitorview/network/huawei/queryARP";
			var arp_info_list_header = [
					                        {text:'IP地址',name:"ipvAddr"},
				                            {text:'MAC地址',name:"ipMac"},
				                            {text:'获取时间',name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : arp_info_list_url,
		        header : arp_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// MAC表信息
		mac_info_list : function (el ,paramObj){
			var mac_info_list_url="monitorview/network/huawei/queryMac";
			var mac_info_list_header = [
					                        {text:'MAC地址',name:"macAddress"},
				                            {text:'接口名称',name:"interfaceDesc"},
				                            {text:'获取时间',name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : mac_info_list_url,
		        header : mac_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 路由信息
		route_info_list : function (el ,paramObj){
			var route_info_list_url="monitorview/network/huawei/queryRoute";
			var route_info_list_header = [
					                        {text:'路由目的地址',name:"routeDest"},
				                            {text:'路由MASK',name:"routeMask"},
				                            {text:'下次跳转地址',name:"routeNexthop"}
					                     ];
		    g_grid.render(el ,{
		        url : route_info_list_url,
		        header : route_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 端口
		port_info_list : function (el ,paramObj){
			var port_info_list_url="monitorview/network/cisco/queryPortConfigInfo";
			var port_info_list_header = [
					                        {text:'端口号',name:"port"},
				                            {text:'类型',name:"type"},
				                            {text:'监控时间',name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : port_info_list_url,
		        header : port_info_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 风扇
		fan_list : function (el ,paramObj){
			var fan_list_url="monitorview/network/huawei/queryFanInfo";
			var fan_list_header = [
			                        {text:"风扇名称" ,name:"fanDesc"},
			                        {text:"风扇状态" ,name:"fanStatus"}
			                     ];
		    g_grid.render(el ,{
		        url : fan_list_url,
		        header : fan_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		// 电源
		power_list : function (el ,paramObj){
			var power_list_url="monitorview/network/huawei/queryPowerInfo";
			var power_list_header = [
				                        {text:"电源名称" ,name:"powerDesc"},
				                        {text:"电源状态" ,name:"powerStatus"},
				                        {text:"获取时间" ,name:"enterDate"}
				                     ];
		    g_grid.render(el ,{
		        url : power_list_url,
		        header : power_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		temperature_list : function (el ,paramObj){
			var temperature_list_url="monitorview/network/huawei/queryTemperature";
			var temperature_list_header = [
					                        {text:"传感器名称" ,name:"temperDesc"},
					                        {text:"温度（℃）" ,name:"temperValue"},
					                        {text:"获取时间" ,name:"enterDate"}
					                     ];
		    g_grid.render(el ,{
		        url : temperature_list_url,
		        header : temperature_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
});