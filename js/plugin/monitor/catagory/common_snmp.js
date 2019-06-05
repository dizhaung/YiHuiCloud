define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/plot/plot.js',] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonsnmp/queryCommonSnmpMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		table_info_render : function(paramObj){
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonsnmp/queryCommonSnmpTable",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("[data-flag=info]").remove()
                    for(var key in data)
                    {
                        if("single"==key)
                         {
                         	 var tt='<div class="m-panel" data-flag="info">'
									   +'<div class="m-panel-title">'
									   +'	<span>单值字符型</span>'
							           +'</div>'
								     +'<div class="m-panel-body base-info-div">'
								     +'  <form class="bs-example form-horizontal xs-form">';							

								  for(var i=0;i<data[key].length;i++)
								  {
								  	 if (data[key][i].storageStatus != "1")
								  	 	continue
								  	 tt+='<div class="form-group">'
								  	    +'        <label class="col-lg-2 control-label">'+data[key][i].displayName+':</label>'
				                   		+'        <label class="col-lg-10 control-label tl">'+data[key][i].oidValue
				                   									+(data[key][i].varUnit?data[key][i].varUnit:"")+'</label>'
				                   		+'        <label class="col-lg-2 control-label">获取时间:</label>'
				                   		+'        <label class="col-lg-4 control-label tl">'+data[key][i].enterDate+'</label>'
								  	    +'</div>';
								  }
								
							  $("#number-panel").before(tt+'</form></div></div>');							  
                         }
                         else
                         {
                             var tt='<div class="m-panel" style="margin-top:10px">'
									+'<div class="m-panel-title">'
									+'	<span>'+data[key][0].displayName+'</span>'
								+'	</div>'
								+'	<div class="m-panel-body base-info-div">'
								+'		<form class="bs-example form-horizontal xs-form">';							

								  for(var i=0;i<data[key].length;i++)
								  {
								  	if (data[key][i].storageStatus != "1")
								  	 	continue
								  	 var __index
								  	 if (data[key][i].sumTableValue == "0")
								  	 	__index = data[key][i].indexName
								  	 else
								  	 	__index = data[key][i].displayName
								  	 tt+='<div class="form-group">'
								  	    +'        <label class="col-lg-2 control-label">'+__index+'</label>'
				                   		+'        <label class="col-lg-10 control-label tl">'+data[key][i].oidValue
				                   									+(data[key][i].varUnit?data[key][i].varUnit:"")+'</label>'
				                   		+'        <label class="col-lg-2 control-label">获取时间:</label>'
				                   		+'        <label class="col-lg-4 control-label tl">'+data[key][i].enterDate+'</label>'
								  	    +'</div>'
								  }
								  tt+='</form>'
										+'	</div>'
										+'</div>';
							  $("#number-panel").before(tt);
                         }                       
						
						
                    }
		        }
		    });
		},
		chart_info_render : function(paramObj){
			var self = this
			um_ajax_get({
		        url : "monitorview/commonmonitor/commonsnmp/queryCommonSnmpChart",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	for (var i = 0; i < data.length; i++) {
		        		if (data[i].storageStatus != "1")
		        			continue
		        		$("#chart_info_div").append('<div id="chart_div'+i+'" class="monitor-chart" style="height:300px"></div>')
		        		if(data[i].type=="multible")
		        		{
                            self.linem_render($("#chart_div"+i+"") ,data[i].items,data[i].lineName ,data[i].varUnit);
		        		}else
		        		{
		        			self.chart_render($("#chart_div"+i+"") ,data[i].items,data[i].lineName ,data[i].varUnit);
		        		}
		        	}
	        		if ($("#chart_info_div").children().size() == 0)
	        			$("#chart_info_div").parent().empty()
		        }
		    });
		},
		chart_render : function(el ,data ,title ,varUnit){
			varUnit = varUnit?"(" + varUnit + ")":""
			title = title + varUnit
			var datas = data;
			var legend = [];
			var category = [];
			var series = [];
			legend.push(title);
			var obj = new Object();
			obj.name = title;
			obj.type = "line";
			obj.data = [];
			for (var j = 0; j < datas.length; j++) {
				category.push(datas[j].label);
				obj.data.push(datas[j].value);
			};
			series.push(obj);

			plot.lineRender(el ,{
				legend : legend,
				category : category,
				series : series,
				grid: {
					left: '6%',
					right: '3%',
					bottom: '10%',
					containLabel: true
				},
				title: title
			});
		},
		linem_render : function(el ,data ,title ,varUnit){
			varUnit = varUnit?"(" + varUnit + ")":""
			var datas = data;
			var legend = [];
			var category = [];
			var series = [];

			for(var key in data)
            {
            	if (datas && datas[key] && datas[key][0])
            	{
            		legend.push(datas[key][0].indexName + varUnit);
	            	var obj = new Object();
					obj.name = datas[key][0].indexName + varUnit
					obj.type = "line";
					obj.data = [];
					var i=0;
					for (var j = 0; j < datas[key].length; j++) {
						if(i==0)
						{
							category.push(datas[key][j].label);
						}					
						obj.data.push(datas[key][j].value);
					};
					series.push(obj);
					i++;
            	}
            }	

			plot.lineRender(el ,{
				legend : legend,
				category : category,
				series : series,
				grid: {
					left: '6%',
					right: '3%',
					bottom: '10%',
					containLabel: true
				},
				title: title
			});
		}
	}
})