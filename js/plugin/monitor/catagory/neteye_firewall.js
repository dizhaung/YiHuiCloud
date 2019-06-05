define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/security/neteyefw/queryNetEyeFwBaseInfoTotal",
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
		        url : "monitorview/security/neteyefw/queryCPUDynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		         
		            var legendArray= ['CPU使用率(%)'];
		    
		            var categoryArray = [];
		            var seriesArray = [];
                    var seriesCpuObj = new Object();
		            seriesCpuObj.name = 'CPU使用率(%)';
		            seriesCpuObj.type = "line";
		            seriesCpuObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].updateDate);
		                seriesCpuObj.data.push(data[i].cpuUsage);
		            }
		            seriesArray.push(seriesCpuObj);                 
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31']
		            });

		        }
		    }); 
		},
        // 内存使用率
		mem_use_chart : function (el ,paramObj,type){
			um_ajax_get({
		        url : "monitorview/security/neteyefw/queryMemoryUsageDynamicInfo",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		         
		            var legendArray = ['内存使用率(%)'];
		            var categoryArray = [];
		            var seriesArray = [];		        
	            	var seriesMemObj = new Object();
		            seriesMemObj.name = '内存使用率(%)';
		            seriesMemObj.type = "line";
		            seriesMemObj.data = [];
		            for (var i = 0; i < data.length; i++) {
		            	categoryArray.push(data[i].enterDate);
		                seriesMemObj.data.push(data[i].memoryUsage);
		            }
		            seriesArray.push(seriesMemObj);
		          
		            
		            plot.lineRender(el ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		            });

		        }
		    }); 
		},
		//接口面板
		interface_render : function(el, paramObj) {
			asset.assetFlowDiv(el ,paramObj);
		}
	}
})