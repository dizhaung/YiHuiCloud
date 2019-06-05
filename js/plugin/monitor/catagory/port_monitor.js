define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/plot/plot.js',] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			var self = this
			um_ajax_get({
		        url : "monitorView/queryMonitorBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
            		$("#base_info_asset_div").find("[data-id=dbName]").text(data.monitorbaseinfo.dbName)
            		self.url_sel_render(data.monitorbaseinfo.dbName, paramObj)
		        }
		    });
		},
		url_sel_render : function (dbName,urlParamObj){
			var self = this
			urlParamObj.id = 5
			$("#url_sel").empty()
			um_ajax_get({
		        url : "monitor/queryMonitorInfoStatByAttrId",
		        paramObj : urlParamObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	if (!data[0]) {
		        		var dbNameArray = dbName ? dbName.split(";") : []
		        		for (var i = 0; i < dbNameArray.length; i++) {
		        			$("#url_sel").append('<option value="'+dbNameArray[i]+'">'+dbNameArray[i]+'</option>')
		        			$("#response_time_chart_div").html("<span style='position: absolute;top:50%; right:50%; transform: translateX(-50%); font-size: 16px;font-weight: bold;'>暂无数据</span>")
		        		}
		        	} else {
		        		for (var attrName in data[0]){
			        		 $("#url_sel").append('<option value="'+attrName+'">'+attrName+'</option>')
			        	}
			        	$("#url_sel").change(function (){
					        self.response_time_chart(data[0][$(this).val()]);
					    });
		        	}
		        	
		            $("#url_sel").trigger("change");
		            
		        }
		    });
		},
		// 响应时间图表
		response_time_chart : function (data){
        	if (!data || data.length == 0){
        		$("#response_time_chart_div").html("<span style='position: absolute;top:50%; right:50%; transform: translateX(-50%); font-size: 16px;font-weight: bold;'>暂无数据</span>")
        		return false
        	}
            var legendArray = ['响应时间(ms)'];
            var categoryArray = [];
            var seriesArray = [];
            
            var responseTimeObj = new Object();
            responseTimeObj.name = '响应时间(ms)';
            responseTimeObj.type = "line";
            responseTimeObj.data = [];
            for (var i = 0; i < data.length; i++) {
                categoryArray.push(data[i].ENTER_DATE);
            	responseTimeObj.data.push(data[i].TIME);
            }
            seriesArray.push(responseTimeObj);

            plot.lineRender($("#response_time_chart_div") ,{
                legend : legendArray,
                category :categoryArray,
                series : seriesArray,
                grid: {
                    left: '6%',
                    right: '8%',
                    bottom: '3%',
                    containLabel: true
                },
                axisLabelFormatter : function (value){
					return value.substr(5)
				}
            });
		}
	}
})