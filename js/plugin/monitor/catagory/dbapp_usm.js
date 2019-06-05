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
		// 静态信息
		static_info : function (el, paramObj){
			um_ajax_get({
		        url : "monitorview/network/ibmSwitch/queryStatic",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	 if(data && data.length!=0)
		        	 { 
		        	 	 el.umDataBind("render" ,data[0]);

		        	 }
		        	
		        }
		    });
		},
		// cpu使用率
		cpu_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/network/ibmSwitch/queryIbmSwitchCpuMemInfo",
		        paramObj : paramObj,
		        isLoad : false,
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
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5']
		            });

		        }
		    }); 
		},

		// 磁盘使用
		first_disk_chart : function (el ,paramObj){
			el.addClass("prel")
			el.css("padding-left" ,"20px")
			var disk_used_url = "monitorview/network/ibmSwitch/queryIbmSwitchDiskInfo";
			um_ajax_get({
		        url : disk_used_url,
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var buffer = [];
		            var _tmp
		            for (var i = 0; i < data.length; i++) {
		            	if (data[i].pathDisc != "TOTAL")
		            	{
			                buffer.push('<div class="col-lg-4">');
			                buffer.push('<div class="disk-info">');
			                buffer.push('<span>'+data[i].pathDisc+'</span>');
			                buffer.push('<span class="disk-chart"><div style="width:'
			                                    +(data[i].diskUsage)+'%"></div></span>');
			                buffer.push('<span>已使用'+data[i].diskUsage+'%</span>');
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