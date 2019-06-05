define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/sngforad/querySngforadBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		        	$("[data-id=interfaceCount]").text(data.interfaceStore.interfaceCount);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		            $("#static_info_monitor_div").umDataBind("render" ,data.staticInfo);
		        }
		    });
		},
		// cpu使用率
		use_chart : function (paramObj){
			um_ajax_get({
		        url : "monitorview/network/sngforad/queryCPUDMemInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var cpulegendArray = ['CPU使用率(%)'];
		            var memlegendArray = ['内存使用率(%)'];

		            var cpucategoryArray = [];
		            var memcategoryArray = [];
		            var cpuseriesArray = [];
		            var memseriesArray = [];

	            	var seriesCpuObj = new Object();
		            seriesCpuObj.name = 'CPU使用率(%)';
		            seriesCpuObj.type = "line";
		            seriesCpuObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                cpucategoryArray.push(data[i].updateDate);
		                seriesCpuObj.data.push(data[i].cpuUsage);
		            }
		            cpuseriesArray.push(seriesCpuObj);

	            	var seriesMemObj = new Object();
		            seriesMemObj.name = '内存使用率(%)';
		            seriesMemObj.type = "line";
		            seriesMemObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		            	memcategoryArray.push(data[i].updateDate);
		                seriesMemObj.data.push(data[i].memUsage);
		            }
		            memseriesArray.push(seriesMemObj);
		            
		            plot.lineRender($("#cpu_use_line_chart"),{
		                legend : cpulegendArray,
		                category :cpucategoryArray,
		                series : cpuseriesArray,
		                tooltipFormatter : function (param){
							return param[0].name.substr(5) + "</br>" + param[0].seriesName + " : " + param[0].value;	
						},
						axisLabelFormatter : function (value, index){
							if (value)
							{
								return value.substr(5);
							}
							else
							{
								return "";
							}
						},
		                lineStyle : true,
		                color_array : ['#62cb31']
		            });
		            plot.lineRender($("#memory_use_line_chart"),{
		                legend : memlegendArray,
		                category :memcategoryArray,
		                series : memseriesArray,
		                tooltipFormatter : function (param){
							return param[0].name.substr(5) + "</br>" + param[0].seriesName + " : " + param[0].value;	
						},
						axisLabelFormatter : function (value, index){
							if (value)
							{
								return value.substr(5);
							}
							else
							{
								return "";
							}
						},
		                lineStyle : true,
		                color_array : ['#23b7e5']
		            });

		        }
		    }); 
		},

		// 磁盘使用
		first_disk_chart : function (el ,paramObj){
			el.addClass("prel")
			el.css("padding-left" ,"20px")
			var disk_used_url = "monitorview/network/sngforad/querySngforadDiskInfo";
			um_ajax_get({
		        url : disk_used_url,
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var buffer = [];
		            var _tmp
		            for (var i = 0; i < data.length; i++) {
		            	if (data[i].diskFileSystemName != "TOTAL")
		            	{
			                buffer.push('<div class="col-lg-4">');
			                buffer.push('<div class="disk-info">');
			                buffer.push('<span>'+data[i].diskFileSystemName+'</span>');
			                buffer.push('<span class="disk-chart"><div style="width:'
			                                    +(data[i].diskUsage)+'%"></div></span>');
			                buffer.push('<span>'+data[i].diskAvail+'B可用,共'+data[i].diskSize+'B</span>');
			                buffer.push('</div></div>');
		            	}
		            	else
		            		_tmp = data[i]
		            }
		            el.html(buffer.join(""));
		        }
		    });
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
});