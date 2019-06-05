define(['/js/plugin/plot/plot.js' ,'timepicker'] ,function (plot ,timepicker){
	return {
		interface_render : function(opt){
			var urlParamObj = index_query_param_get();
			urlParamObj = $.extend(urlParamObj, opt)
			view_init();

			event_init();

			$("#time_range_sel").change();

			flow_chart_render();

			avg_chart_render();

			detail_info_get();

			function view_init()
			{
				index_form_init($("#query_form1"));
			}

			function event_init()
			{
				var start_day;
				var end_day;
				$("#time_range_sel").change(function (){
					if ($(this).val() == "cDay")
					{
						$("#start_date").text(g_moment().format("YYYY-MM-DD 00:00:00"))
						$("#end_date").text(g_moment().format("YYYY-MM-DD 23:59:59"))
					}

					if ($(this).val() == "cWeek")
					{
						$("#start_date").text(g_moment(timepicker.getCurrentWeek()[0]).format("YYYY-MM-DD 00:00:00"))
						$("#end_date").text(g_moment(timepicker.getCurrentWeek()[1]).format("YYYY-MM-DD 23:59:59"))
					}

					if ($(this).val() == "cMonth")
					{
						$("#start_date").text(g_moment(timepicker.getCurrentMonth()[0]).format("YYYY-MM-DD 00:00:00"))
						$("#end_date").text(g_moment(timepicker.getCurrentMonth()[1]).format("YYYY-MM-DD 23:59:59"))
					}

					if ($(this).val() == "day")
					{
						start_day = g_moment().subtract(1, 'days').format("YYYY-MM-DD");
						$("#start_date").text(start_day + " 00:00:00");
						$("#end_date").text(start_day + " 23:59:59");
					}
					if ($(this).val() == "week")
					{
						var d = getPreviousWeekStartEnd();
						$("#start_date").text(d.start + " 00:00:00");
						$("#end_date").text(d.end + " 23:59:59");
					}
					if ($(this).val() == "month")
					{
						var prev_month_firstday_str = g_moment().subtract(1, 'months').format("YYYY-MM") + "-01";
						var current_month_firstday_str = g_moment().format("YYYY-MM") + "-01";
						$("#start_date").text(prev_month_firstday_str + " 00:00:00");
						$("#end_date").text(g_moment(current_month_firstday_str).subtract(1, 'days').format("YYYY-MM-DD") + " 23:59:59");
					}
				});

				$("#start_btn").jeDate({
				    format: 'YYYY-MM-DD hh:mm:ss',
				    isTime:true,
				    choosefun:function(elem, val) {
						$("#start_date").text(val);
				    },
				    okfun:function(elem, val) {
						$("#start_date").text(val);
				    }
				});

				$("#end_btn").jeDate({
				    format: 'YYYY-MM-DD hh:mm:ss',
				    isTime:true,
				    choosefun:function(elem, val) {
						$("#end_date").text(val);
				    },
				    okfun:function(elem, val) {
						$("#end_date").text(val);
				    }
				});

				$("#query_btn").click(function (){
					flow_chart_render();
				});
			}

			function detail_info_get()
			{
				um_ajax_get({
					url : "interfaceInfo/queryInterface",
					paramObj : {edId : urlParamObj.assetId ,interfaceInd : urlParamObj.interfaceId ,monitorId:urlParamObj.monitorId},
					successCallBack : function (data){
						$("#detail_form").umDataBind("render" ,data[0]);
						$("[data-id=linkEdName]").text(data[0].linkEdName?data[0].linkEdName:"没有配置");
						$("[data-id=currentStatus]").text(data[0].currentStatus==1?"UP":"DOWN");
					}
				});
			}

			function flow_chart_render()
			{
				// 起止时间校验
				var start_date = $("#start_date").text();
				var end_date = $("#end_date").text();
				if (""===start_date) 
				{
					g_validate.setError($("#start_date"), "不能为空。");
					return false;
				} 
				else 
				{
					g_validate.setError($("#start_date"), "");
				}
				if (""===end_date) 
				{
					g_validate.setError($("#end_date"), "不能为空。");
					return false;
				} 
				else 
				{
					g_validate.setError($("#end_date"), "");
				}
				var start_int = Date.parse(new Date(start_date))/1000;
				var end_int = Date.parse(new Date(end_date))/1000;
				if (start_int > end_int) 
				{
					g_validate.setError($("#end_date"), "终止时间应当晚于起止时间。");
					return false;
				} 	
				g_validate.setError($("#end_date"), "");

				um_ajax_get({
					url : "interfaceInfo/queryInterfaceInfo",
					paramObj : {
								  edId : urlParamObj.assetId ,interfaceInd : urlParamObj.interfaceId,monitorId:urlParamObj.monitorId,
								  startTime : $("#start_date").text(),endTime:$("#end_date").text()
							   },
					successCallBack : function (data){
						chart_render($("#flow_flux_enter_chart_div") ,$("#flow_flux_export_chart_div"),data.jsonStringFluxMap ,"端口流速信息");
						chart_render($("#flow_error_enter_chart_div") ,$("#flow_error_export_chart_div") ,data.jsonStringErrorMap ,"端口错误信息");
						chart_render($("#flow_loss_enter_chart_div") ,$("#flow_loss_export_chart_div") ,data.jsonStringLossMap ,"端口丢包信息");
					}
				});
			}

			function avg_chart_render()
			{
				um_ajax_get({
					url : "interfaceInfo/queryAveSpeed",
					isLoad : false,
					paramObj : {
								  edId : urlParamObj.assetId ,interfaceInd : urlParamObj.interfaceId ,monitorId:urlParamObj.monitorId
							   },
					successCallBack : function (data){
						chart_render($("#avg_enter_chart_div") ,$("#avg_export_chart_div") ,data.jsonStringSpeedMap ,"平均流速");
					}
				});
			}


			function getPreviousWeekStartEnd(date)
			{
				var date = new Date() || date, day, start, end, dayMSec = 24 * 3600 * 1000;
				today = date.getDay() - 1;
				end = date.getTime() - today * dayMSec;
				start = end - 7 * dayMSec;
				end = date.getTime() - (today + 1) * dayMSec;
				return {start : getFormatTime(start), end : getFormatTime(end)};
				function getFormatTime(time){
					date.setTime(time);
					return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
				}
			}

			function chart_render(el1 , el2, chartData)
			{
				var el
				var datas = chartData.datas;
				//入口
				var legend1 = [];
				var category = [];
				var series1 = [];

				//出口
				var legend2 = [];
				var category = [];
				var series2 = [];

				for (var i = 0; i < datas.length; i++) {
					if (datas[i].lineName.indexOf("入口") > -1 ) {
						legend1.push(datas[i].lineName);
						var tmp = datas[i].items;
						var obj = new Object();
						obj.name = datas[i].lineName;
						obj.type = "line";
						//obj.areaStyle = {normal: {}};
						obj.data = [];
						for (var j = 0; j < tmp.length; j++) {
							obj.data.push(tmp[j].value);
						};
						series1.push(obj);
					} else if(datas[i].lineName.indexOf("出口") > -1 ){
						legend2.push(datas[i].lineName);
						var tmp = datas[i].items;
						var obj = new Object();
						obj.name = datas[i].lineName;
						obj.type = "line";
						//obj.areaStyle = {normal: {}};
						obj.data = [];
						for (var j = 0; j < tmp.length; j++) {
							obj.data.push(tmp[j].value);
						};
						series2.push(obj);
					}
					
					
				};
				if (datas && datas.length > 0)
				{
					for (var i = 0; i < datas[0].items.length; i++) {
						if(datas[0].items[i].lable.length>10)
							datas[0].items[i].lable += ':00';
						category.push(datas[0].items[i].lable);
					};
				}

				plot.lineRender(el1 ,{
					grid: {
						left: '3%',
						right: '6%',
						bottom: '3%',
						top: 40,
						containLabel: true
					},
					legend : legend1,
					category : category,
					series : series1,
					tooltipFormatter : function (param){
						if (param[0].name.length >7) {
							return param[0].name.substr(5) + "</br>" + param[0].seriesName + " : " + param[0].value;	
						} else {
							return param[0].name + "</br>" + param[0].seriesName + " : " + param[0].value;
						}
					},
					axisLabelFormatter : function (value, index){
						if (value)
						{
							if (value.length > 7) {
								return value.substr(5);
							} else {
								return value
							}
						}
						else
						{
							return "";
						}
					},
					lineStyle : true,
			        color_array : ['#2d8ff9']
				});
				plot.lineRender(el2 ,{
					grid: {
						left: '3%',
						right: '6%',
						bottom: '3%',
						top: 40,
						containLabel: true
					},
					legend : legend2,
					category : category,
					series : series2,
					tooltipFormatter : function (param){
						if (param[0].name.length >7) {
							return param[0].name.substr(5) + "</br>" + param[0].seriesName + " : " + param[0].value;	
						}else {
							return param[0].name + "</br>" + param[0].seriesName + " : " + param[0].value;
						}
					},
					axisLabelFormatter : function (value, index){
						if (value)
						{
							if (value.length > 7) {
								return value.substr(5);
							} else {
								return value
							}
						}
						else
						{
							return "";
						}
					},
					lineStyle : true,
			        color_array : ['#8be08e']
				});

			}
		}
	}
})