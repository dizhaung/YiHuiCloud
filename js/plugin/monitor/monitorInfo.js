
define(['plot','/js/lib/charts/circliful/js/jquery.circliful.js',] ,function (plot,circliful){

	return {
		// 渲染磁盘空间信息
		disk_used_chart : function (el ,opt)
		{
			el.addClass("prel")
			el.css("padding-left" ,"28%")
			var disk_used_url = "monitorview/os/windows/queryTotalDiskDynamicInfoByAttStatus";
			um_ajax_get({
		        url : disk_used_url,
		        paramObj : opt.paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	var diskData = data.Disk
		        	var threshold = data.diskThreshold
		            var buffer = [];
		            var freeSize;
		            var usedSize;
		            var totalSize;
		            var _tmp
		            var color = "#6b72e2"
		            var diskCount =0

		            if (threshold) {
		            	diskData.forEach(function (tmp){
		            		if(tmp.mountName != "TOTAL"){
		            			if(threshold[tmp.mountName]){
		            				if (parseFloat(tmp.diskUsage) >= threshold[tmp.mountName]) {
				            			//color = "#fcb942"
				            		}
		            			}
			            		freeSize = parseFloat(tmp.freeSize);
				                usedSize = parseFloat(tmp.usedSize);
				                totalSize = (freeSize + usedSize).toFixed(2);
				                buffer.push('<div class="col-lg-4">');
				                buffer.push('<div class="disk-info" style="font-size:12px!important; color:#666;">');
				                buffer.push('<span class="disk-name" title="'+tmp.mountName+'" style="display:inline-block; ">'+tmp.mountName+'</span>');
				                buffer.push('<span style="display:inline-block; float:right;">'+(tmp.diskUsage)+'%</span>');
				                buffer.push('<span class="disk-chart"><div style="width:'
				                                    +(tmp.diskUsage)+'%;background-color:'+color+';"></div></span>');
				                buffer.push('<span style="display:inline-block; color:#999;">共'+tmp.totalSize+'GB&nbsp;&nbsp;&nbsp;&nbsp;'+tmp.freeSize+'GB可用</span>');
				                buffer.push('</div></div>');
				                diskCount++
		            		} else {
		            			_tmp = tmp
		            		}
		            	})
		            } else {
		            	diskData.forEach(function (tmp){
		            		if(tmp.mountName != "TOTAL"){
			            		freeSize = parseFloat(tmp.freeSize);
				                usedSize = parseFloat(tmp.usedSize);
				                totalSize = (freeSize + usedSize).toFixed(2);
				                buffer.push('<div class="col-lg-4">');
				                buffer.push('<div class="disk-info" style="font-size:12px!important; color:#666;">');
				                buffer.push('<span class="disk-name" title="'+tmp.mountName+'">'+tmp.mountName+'</span>');
				                buffer.push('<span class="disk-chart"><div style="width:'
				                                    +(tmp.diskUsage)+'%;background-color:'+color+';"></div></span>');
				                buffer.push('<span style="color:#999;">共'+tmp.totalSize+'GB&nbsp;&nbsp;&nbsp;&nbsp;'+tmp.freeSize+'GB可用</span>');
				                buffer.push('</div></div>');
				                diskCount++
		            		} else {
		            			_tmp = tmp
		            		}
		            	})
		            }
		            
		            _tmp = _tmp || {totalSize:0,freeSize:0,diskUsage:0}
		            if (!(diskCount > 3)) {
		            	el.html("<div style='position:relative; top:60px;'>"+buffer.join("")+"</div>");
		            } else{
		            	el.html(buffer.join(""));
		            }
		            el.append('<div class="pabs" style="left:7%;top:-35px;width:179px;height:100%; color:#999; font-size:14px!important;"><div class="w-all h-all df fdc">'
		            			+'<div style="width: 179px;" class="chart-div"></div><div class="tc"><span>总量：</span><span>'+_tmp.totalSize+'GB</span></div><div class="mb5 tc"><span>剩余：</span><span>'+_tmp.freeSize+'GB</span></div></div></div>')
		            el.find(".chart-div").html("")
					el.find(".chart-div").circliful({
			            animation: 1,
			            animationStep: 5,
			            foregroundBorderWidth: 15,
			            backgroundBorderWidth: 15,
			            percent: _tmp.diskUsage,
			            textSize: 10,
			            fontColor:'#666',
			            multiPercentage: 1,
			            percentages: [10, 20, 30],
			            foregroundColor : '#6b72e2',
			            backgroundColor : '#f4f4f4'

			        });
		        }
		    });
		},
		//cpu使用率（圆盘）
		cpu_memo_use_rate_radio : function (opt){
			um_ajax_get({
		        url : opt.url,
		        paramObj : opt.paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var cpuData = data.Cpu;
		            var physicalMemData = data.PhysicalMem;
		            var swapMenData = data.SwapMen;
		            plot.dashBoardRender(opt.use_chart ,{label:"CPU使用率",
		                series:
		                    [
		                        {
		                            name: 'CPU使用率',
		                            type: 'gauge',
		                            z: 3,
		                            min:0,
		                            max:100,
		                            splitNumber: 10,
		                            radius: '95%',
		                            axisLine: {            // 坐标轴线
		                                lineStyle: {       // 属性lineStyle控制线条样式
		                                    width: 5
		                                }
		                            },
		                            axisTick: {            // 坐标轴小标记
		                                length: 15,        // 属性length控制线长
		                                lineStyle: {       // 属性lineStyle控制线条样式
		                                    color: 'auto'
		                                }
		                            },
		                            splitLine: {           // 分隔线
		                                length: 20,         // 属性length控制线长
		                                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
		                                    color: 'auto'
		                                }
		                            },
		                            title : {
		                                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                                    fontWeight: 'bolder',
		                                    fontSize: 20,
		                                    fontStyle: 'italic'
		                                }
		                            },
		                            detail : {
		                            	formatter:'{value}%',
		                                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                                    fontWeight: 'bolder'
		                                }
		                            },
		                            pointer: {
		                                width:3
		                            },
		                            data:[{value: cpuData.cpuUsage ? cpuData.cpuUsage : 0, name: 'CPU'}]
		                        },
		                        {
		                            name: '物理内存使用率',
		                            type: 'gauge',
		                            center: ['25%', '55%'],    // 默认全局居中
		                            radius: '85%',
		                            endAngle:-50,
		                            min:0,
		                            max:100,
		                            splitNumber:10,
		                            axisLine: {            // 坐标轴线
		                                lineStyle: {       // 属性lineStyle控制线条样式
		                                    width: 5
		                                }
		                            },
		                            axisTick: {            // 坐标轴小标记
		                                length:12,        // 属性length控制线长
		                                lineStyle: {       // 属性lineStyle控制线条样式
		                                    color: 'auto'
		                                }
		                            },
		                            splitLine: {           // 分隔线
		                                length:20,         // 属性length控制线长
		                                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
		                                    color: 'auto'
		                                }
		                            },
		                            pointer: {
		                                width:3
		                            },
		                            title: {
		                                offsetCenter: [0, '-30%'],       // x, y，单位px
		                            },
		                            detail: {
		                            	formatter:'{value}%',
		                                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                                    fontWeight: 'bolder'
		                                }
		                            },
		                            data:[{value: physicalMemData.memoryUsage ? physicalMemData.memoryUsage : 0, name: '物理内存'}]
		                        },
		                        {
		                            name: '虚拟内存使用率',
		                            type: 'gauge',
		                            center: ['75%', '55%'],    // 默认全局居中
		                            radius: '85%',
		                            min:0,
		                            max:100,
		                            endAngle:-50,
		                            splitNumber:10,
		                            axisLine: {            // 坐标轴线
		                                lineStyle: {       // 属性lineStyle控制线条样式
		                                    width: 5
		                                }
		                            },
		                            axisTick: {            // 坐标轴小标记
		                                length:12,        // 属性length控制线长
		                                lineStyle: {       // 属性lineStyle控制线条样式
		                                    color: 'auto'
		                                }
		                            },
		                            splitLine: {           // 分隔线
		                                length:20,         // 属性length控制线长
		                                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
		                                    color: 'auto'
		                                }
		                            },
		                            pointer: {
		                                width:3
		                            },
		                            title: {
		                                offsetCenter: [0, '-30%'],       // x, y，单位px
		                            },
		                            detail: {
		                            	formatter:'{value}%',
		                                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                                    fontWeight: 'bolder'
		                                }
		                            },
		                            data:[{value: physicalMemData.virtualMemoryUsage?physicalMemData.virtualMemoryUsage:0, name: '虚拟内存'}]
		                        },
		                    ]
		                });
					//渲染系统负载
					if(opt.one_secend){
						opt.one_secend.text(cpuData.oneuse);
						opt.five_secend.text(cpuData.fiveuse);
						opt.fifteen_secend.text(cpuData.fifteenuse);
					}
		        }
			});
		},
		//cpu使用率
		cpu_use_rate_render : function (opt){
			var self = this
			um_ajax_get({
			        url : opt.url,
			        paramObj : opt.paramObj,
			        isLoad : false,
			        successCallBack : function (data){
			        	var cpuData = data.Cpu;
			        	var cpuThreshold = data.cpuThreshold || {cpuFaultThreshold:0}
			        	opt.one_secend.text(cpuData.oneuse)
			        	opt.five_secend.text(cpuData.fiveuse)
			        	opt.fifteen_secend.text(cpuData.fifteenuse)
			        	$("#cpu_fault_threshold").text(cpuThreshold.cpuFaultThreshold + "%")
			        	$("#cpu_perf_threshold").text(cpuThreshold.cpuPerformanceThreshold + "%")
			        	var color = color_get({val:cpuData.cpuUsage,faultVal:cpuThreshold.cpuFaultThreshold, perfVal:cpuThreshold.cpuPerformanceThreshold})
			        	opt.chart_el.html("")
						opt.chart_el.circliful({
				            animation: 1,
				            animationStep: 5,
				            foregroundBorderWidth: 15,
				            backgroundBorderWidth: 15,
				            percent: cpuData.cpuUsage,
				            textSize: 10,
				            fontColor:'#666',
				            multiPercentage: 1,
				            percentages: [10, 20, 30],
				            //foregroundColor : color,
				            foregroundColor : "#87b1fe",
				            backgroundColor : '#f4f4f4'

				        });
			        }
			})
		},
		// CPU、内存使用率
		cpu_memo_use_rate : function (opt){
			if (!opt.paramObj.chooseEndDate)
				opt.paramObj.chooseEndDate = opt.paramObj.time
			um_ajax_get({
			        url : opt.url,
			        paramObj : opt.paramObj,
			        isLoad : false,
			        successCallBack : function (data){
			            var cpuData = data.Cpu;
			            var physicalMemData = data.PhysicalMem;
			            var swapMenData = data.SwapMen;
			            var legendArray
			            if (opt.type == "cpu")
			            	//legendArray = ['CPU使用率(%)','故障阈值(%)','性能阈值(%)']
			            	legendArray = ['CPU使用率(%)']
			            else
			            	//legendArray = ['物理内存使用率(%)' ,'虚拟内存使用率(%)','故障阈值(%)','性能阈值(%)']
			            	legendArray = ['物理内存使用率(%)' ,'虚拟内存使用率(%)']
			            var categoryArray = [];
			            var seriesArray = [];
			            var color_array = []

			            if (opt.type == "cpu")
			            {
			            	var seriesFaultThresholdObj = new Object()
			            	seriesFaultThresholdObj.name = '故障阈值(%)';
				            seriesFaultThresholdObj.type = "line";
				            seriesFaultThresholdObj.data = [];

				            var seriesPerfThresholdObj = new Object()
			            	seriesPerfThresholdObj.name = '性能阈值(%)';
				            seriesPerfThresholdObj.type = "line";
				            seriesPerfThresholdObj.data = [];

			            	var seriesCpuObj = new Object();
				            seriesCpuObj.name = 'CPU使用率(%)';
				            seriesCpuObj.type = "line";
				            seriesCpuObj.data = [];
				            for (var i = 0; i < cpuData.length; i++) {
				                categoryArray.push(cpuData[i].lable.substr(cpuData[i].lable.indexOf("-")+1));
				                seriesCpuObj.data.push(cpuData[i].value);
				                //seriesFaultThresholdObj.data.push(data.cpuThreshold.cpuFaultThreshold)
				                //seriesPerfThresholdObj.data.push(data.cpuThreshold.cpuPerformanceThreshold)
				            }
				            seriesArray.push(seriesCpuObj);
				            //seriesArray.push(seriesFaultThresholdObj);
				            //seriesArray.push(seriesPerfThresholdObj);
				            color_array = ['#87b1fe' ,'#ff6565','#fcb942']

			            }
			            if (opt.type == "memory")
			            {
			            	var seriesFaultThresholdObj = new Object()
			            	seriesFaultThresholdObj.name = '故障阈值(%)';
				            seriesFaultThresholdObj.type = "line";
				            seriesFaultThresholdObj.data = [];

				            var seriesPerfThresholdObj = new Object()
			            	seriesPerfThresholdObj.name = '性能阈值(%)';
				            seriesPerfThresholdObj.type = "line";
				            seriesPerfThresholdObj.data = [];

			            	var seriesphysicalMemObj = new Object();
				            seriesphysicalMemObj.name = '物理内存使用率(%)';
				            seriesphysicalMemObj.type = "line";
				            seriesphysicalMemObj.data = [];
				            for (var i = 0; i < physicalMemData.length; i++) {
				            	categoryArray.push(physicalMemData[i].lable.substr(physicalMemData[i].lable.indexOf("-")+1));
				                seriesphysicalMemObj.data.push(physicalMemData[i].value);
				                //seriesFaultThresholdObj.data.push(data.memThreshold.memFaultThreshold)
				                //seriesPerfThresholdObj.data.push(data.memThreshold.memPerformanceThreshold)
				            }
				            seriesArray.push(seriesphysicalMemObj);
				            

				            var seriesswapMenObj = new Object();
				            seriesswapMenObj.name = '虚拟内存使用率(%)';
				            seriesswapMenObj.type = "line";
				            seriesswapMenObj.data = [];
				            for (var i = 0; i < physicalMemData.length; i++) {
				                seriesswapMenObj.data.push(physicalMemData[i].valueV);
				            }
				            seriesArray.push(seriesswapMenObj);
				            //seriesArray.push(seriesFaultThresholdObj);
				            //seriesArray.push(seriesPerfThresholdObj);

				            color_array = ['#3ad3b5' ,'#36aee1' ,'#ff6565','#fcb942']
			            }
			            
			            plot.lineRender(opt.line_chart ,{
			                legend : legendArray,
			                legendStyle : true,
			                category :categoryArray,
			                series : seriesArray,
			                lineStyle : true,
			                color_array : color_array,
			                yAxisMax : 100
			            });

			        }
			    });
		},
		// 渲染内存信息
		memory_info_render : function (el ,opt){
			var not_used_val = parseFloat(opt.not_used_val);
			var used_val = parseFloat(opt.used_val);
			var total = not_used_val+used_val;
			var used_rate = (not_used_val + used_val==0) ? 0 : (used_val / (not_used_val + used_val));
			el.find("div").eq(0).html(opt.title+' '+total.toFixed(2)+'G')
			//'#3ad3b5' ,'#36aee1'
			var color = "#3ad3b5";
			
			if (opt.title == "虚拟内存") {
				// var gridColor = color_get({val:opt.used_rate,faultVal:opt.fauleThreshold, perfVal:opt.perfThreshold})
				// if (gridColor) {
				// 	color = gridColor
				// }
				color = "#36aee1"
			}
			else
			{
				$("#mem_fault_threshold").text(opt.fauleThreshold + "%")
				$("#mem_perf_threshold").text(opt.perfThreshold + "%")
			}
			el.find("div").eq(1).html("")
			el.find("div").eq(1).circliful({
	            animation: 1,
	            animationStep: 5,
	            foregroundBorderWidth: 15,
	            backgroundBorderWidth: 15,
	            percent: used_rate*100,
	            decimals:1,
	            textSize: 10,
	            fontColor:'#666',
	            multiPercentage: 1,
	            percentages: [10, 20, 30],
	            foregroundColor : color,
	            //foregroundColor : "#36aee1",
	            backgroundColor : '#f4f4f4'

	        });
		},
		memory_info_render1 : function (el ,opt){
			el.empty()
			var not_used_val = parseFloat(opt.not_used_val);
			var used_val = parseFloat(opt.used_val);
			var total = not_used_val+used_val;
			var used_rate = (not_used_val + used_val==0) ? 0 : (used_val / (not_used_val + used_val));
			var jug_val = 20 - Math.round(opt.used_rate/100 * 20);
			var el_ul = $('<ul style="width:50%;height:160px;margin:0 auto"></ul>');
			el.append(el_ul);
			el.append('<div class="tc" style="height:40px"><p style="margin-bottom:5px">'+opt.title+'：'+total.toFixed(2)+'G</p><p style="margin:0">使用率：'+opt.used_rate+'%</p></div>')
			var color = "#2380a6";
			if (opt.title == "物理内存") {
				var gridColor = color_get({val:opt.used_rate,faultVal:opt.fauleThreshold, perfVal:opt.perfThreshold})
				if (gridColor) {
					color = gridColor
				}
			}
			var txtColor
			for (var i = 0; i < 20; i++) {
				if (jug_val == 0)
				{
					txtColor = color;
				}
				else if (jug_val == 20)
				{
					txtColor = "#c8c6c6";
				}
				else if (i > jug_val || i==19 && used_val > 0)
				{
					txtColor = color;
				}
				else
				{
					txtColor = "#c8c6c6";
				}
				el_ul.append('<li class="mt5" style="height:3px;background-color:'+txtColor+';"></li>');
			}
		},
		// CPU历史记录查询
		cpu_history_dialog : function (urlParamObj){
			um_ajax_html({
				url : "js/plugin/monitor/monitor.html",
				selector : "#query_cmd_history",
				successCallBack : function (data){
					g_dialog.dialog($(data).html() ,{
						title : "历史记录",
						initAfter : initAfter,
						isDetail : true,
						width : "650px",
						autoHeight : true,
						autoHeightValue : "3%"
					})
				}
			})

			function initAfter (el){
				el.find("[disk]").hide()
				el.find("#chooseStartDate").val(g_moment().subtract(1, 'days').format('YYYY-MM-DD HH:00:00'))
				el.find("#chooseEndDate").val(g_moment().format('YYYY-MM-DD HH:00:00'))
				el.find("#time_range_sel").change(function (){
					el.find("#chooseStartDate").val(g_moment().subtract(1, 'days').format('YYYY-MM-DD HH:00:00'))
					el.find("#chooseStartDate").val(g_moment().subtract($(this).val(), 'days').format('YYYY-MM-DD HH:00:00'))
				})

				el.find("#query_btn").click(function (){
					__t()
				})

				function __t()
				{
					if (!__compare(el.find("#chooseStartDate").val() ,el.find("#chooseEndDate").val() ,30 ,el))
						return false
					um_ajax_get({
						url : "monitorview/os/windows/queryCpuUsageTrendInfoByChooseTime",
						paramObj : {
										chooseStartDate:el.find("#chooseStartDate").val(),
										chooseEndDate:el.find("#chooseEndDate").val(),
										monitorId:urlParamObj.monitorId,
										regionId:urlParamObj.regionId
									},
						maskObj : el,
						successCallBack : function (data){
							if (!data || data.Cpu.length == 0)
								return false
							var cpuData = data.Cpu

							var legendArray = ['CPU使用率(%)'];
							var categoryArray = []
							var seriesArray = []
							var seriesCpuObj = new Object();
				            seriesCpuObj.name = 'CPU使用率(%)';
				            seriesCpuObj.type = "line";
				            seriesCpuObj.data = [];

				            // var seriesFaultThresholdObj = new Object()
			            	// seriesFaultThresholdObj.name = '故障阈值(%)';
				            // seriesFaultThresholdObj.type = "line";
				            // seriesFaultThresholdObj.data = [];

				            // var seriesPerfThresholdObj = new Object()
			            	// seriesPerfThresholdObj.name = '性能阈值(%)';
				            // seriesPerfThresholdObj.type = "line";
				            // seriesPerfThresholdObj.data = [];

							for (var i = 0; i < cpuData.length; i++) {
								categoryArray.push(cpuData[i].index)
								seriesCpuObj.data.push(cpuData[i].value)
								//seriesFaultThresholdObj.data.push(data.cpuThreshold.cpuFaultThreshold)
								//seriesPerfThresholdObj.data.push(data.cpuThreshold.cpuPerformanceThreshold)
							}
							seriesArray.push(seriesCpuObj)
							//seriesArray.push(seriesFaultThresholdObj)
							//seriesArray.push(seriesPerfThresholdObj)

							plot.lineRender(el.find("#chart") ,{
								legend : legendArray,
				                category :categoryArray,
				                series : seriesArray,
				                lineStyle : true,
								color_array : ['#87b1fe' ,'#ff6565','#fcb942'],
								axisLabelFormatter : function (value){
									return value.substr(5)
								}
				            });

							g_grid.render(el.find("#grid"),{
								header : [{text:"时间","name":"index"},{text:"CPU使用率(%)","name":"value"}],
								data : cpuData,
								paginator : false,
								showCount : false,
								autoHeight : true,
								allowCheckBox : false,
								hideSearch : true
							})
						}
					})
				}

				__t()
			}
		},
		// 内存历史记录查询
		memory_history_dialog : function (urlParamObj){
			um_ajax_html({
				url : "js/plugin/monitor/monitor.html",
				selector : "#query_cmd_history",
				successCallBack : function (data){
					g_dialog.dialog($(data).html() ,{
						title : "历史记录",
						initAfter : initAfter,
						isDetail : true,
						width : "650px",
						autoHeight : true,
						autoHeightValue : "3%"
					})
				}
			})

			function initAfter (el){
				el.find("[disk]").hide()
				el.find("#chooseStartDate").val(g_moment().subtract(1, 'days').format('YYYY-MM-DD HH:00:00'))
				el.find("#chooseEndDate").val(g_moment().format('YYYY-MM-DD HH:00:00'))
				el.find("#time_range_sel").change(function (){
					el.find("#chooseStartDate").val(g_moment().subtract(1, 'days').format('YYYY-MM-DD HH:00:00'))
					el.find("#chooseStartDate").val(g_moment().subtract($(this).val(), 'days').format('YYYY-MM-DD HH:00:00'))
				})

				el.find("#query_btn").click(function (){
					__t()
				})

				function __t()
				{
					if (!__compare(el.find("#chooseStartDate").val() ,el.find("#chooseEndDate").val() ,30 ,el))
						return false
					um_ajax_get({
						url : "monitorview/os/windows/queryMemUsageTrendInfoByChooseTime",
						paramObj : {
										chooseStartDate:el.find("#chooseStartDate").val(),
										chooseEndDate:el.find("#chooseEndDate").val(),
										monitorId:urlParamObj.monitorId,
										regionId:urlParamObj.regionId
									},
						maskObj : el,
						successCallBack : function (data){
							if (!data || data.Mem.length == 0)
								return false
							var memData = data.Mem

							var legendArray = ['物理内存使用率(%)','虚拟内存使用率(%)'];
							var categoryArray = []
							var seriesArray = []
							var seriesObj = new Object();
				            seriesObj.name = '物理内存使用率(%)';
				            seriesObj.type = "line";
				            seriesObj.data = [];
				            var seriesObj1 = new Object();
				            seriesObj1.name = '虚拟内存使用率(%)';
				            seriesObj1.type = "line";
				            seriesObj1.data = [];

				            // var seriesFaultThresholdObj = new Object()
			            	// seriesFaultThresholdObj.name = '故障阈值(%)';
				            // seriesFaultThresholdObj.type = "line";
				            // seriesFaultThresholdObj.data = [];

				            // var seriesPerfThresholdObj = new Object()
			            	// seriesPerfThresholdObj.name = '性能阈值(%)';
				            // seriesPerfThresholdObj.type = "line";
				            // seriesPerfThresholdObj.data = [];

							for (var i = 0; i < memData.length; i++) {
								categoryArray.push(memData[i].lable)
								seriesObj.data.push(memData[i].value)
								seriesObj1.data.push(memData[i].valueV)
								//seriesFaultThresholdObj.data.push(data.memThreshold.memFaultThreshold)
								//seriesPerfThresholdObj.data.push(data.memThreshold.memPerformanceThreshold)
							}
							seriesArray.push(seriesObj)
							seriesArray.push(seriesObj1)
							// seriesArray.push(seriesFaultThresholdObj)
							// seriesArray.push(seriesPerfThresholdObj)

							plot.lineRender(el.find("#chart") ,{
								legend:legendArray,
				                category :categoryArray,
				                series : seriesArray,
				                lineStyle : true,
								color_array : ['#3ad3b5' ,'#36aee1' ,'#ff6565','#fcb942'],
								axisLabelFormatter : function (value){
									return value.substr(5)
								}
				            });

							g_grid.render(el.find("#grid"),{
								header : [{text:"时间","name":"lable"},{text:"物理内存使用率(%)","name":"value"},{text:"虚拟内存使用率(%)","name":"valueV"}],
								data : memData,
								paginator : false,
								showCount : false,
								autoHeight : true,
								allowCheckBox : false,
								hideSearch : true
							})
						}
					})
				}

				__t()
			}
		},
		// 磁盘历史记录查询
		disk_history_dialog : function (urlParamObj){
			um_ajax_html({
				url : "js/plugin/monitor/monitor.html",
				selector : "#query_cmd_history",
				successCallBack : function (data){
					g_dialog.dialog($(data).html() ,{
						title : "历史记录",
						initAfter : initAfter,
						isDetail : true,
						width : "650px",
						autoHeight : true,
						autoHeightValue : "3%"
					})
				}
			})

			function initAfter (el){
				el.find("#chooseStartDate").val(g_moment().subtract(1, 'days').format('YYYY-MM-DD HH:00:00'))
				el.find("#chooseEndDate").val(g_moment().format('YYYY-MM-DD HH:00:00'))
				el.find("#time_range_sel").change(function (){
					el.find("#chooseStartDate").val(g_moment().subtract(1, 'days').format('YYYY-MM-DD HH:00:00'))
					el.find("#chooseStartDate").val(g_moment().subtract($(this).val(), 'days').format('YYYY-MM-DD HH:00:00'))
				})

				el.find("#query_btn").click(function (){
					__t()
				})

				function __t()
				{
					if (!__compare(el.find("#chooseStartDate").val() ,el.find("#chooseEndDate").val() ,30 ,el))
						return false
					um_ajax_get({
						url : "monitorview/os/windows/queryDiskUsageTrendInfoByChooseTimeForThreshold",
						paramObj : {
										chooseStartDate:el.find("#chooseStartDate").val(),
										chooseEndDate:el.find("#chooseEndDate").val(),
										monitorId:urlParamObj.monitorId,
										regionId:urlParamObj.regionId
									},
						maskObj : el,
						isLoad : true,
						successCallBack : function (data){
							el.find("#disk_sel").empty()
							$.each(data,function(k,v){
								el.find("#disk_sel").append("<option value='"+k+"'>"+k+"</option>")
							})
							el.find("#disk_sel").change(function(){
								var tmp = $(this).val()
								if (!data[tmp])
									return false
								var dataList = data[tmp].data
								var legendArray = tmp == "TOTAL" ? [tmp + "使用率(%)"] : [tmp + "使用率(%)", tmp + "使用率阈值(%)", ]
								var categoryArray = []
								var seriesArray = []

								var tmpObj = new Object()
									tmpObj.type = "line";
									tmpObj.name = tmp + "使用率(%)"
					            	tmpObj.data = [];

				            	var thresholdObj = new Object()
									thresholdObj.type = "line";
					            	thresholdObj.data = [];
				            		thresholdObj.name = tmp + "使用率阈值(%)"
								
								for (var i = 0; i < dataList.length; i++) {
									categoryArray.push(dataList[i].lable)
									tmpObj.data.push(dataList[i].value)
									if (tmp != "TOTAL") {
										thresholdObj.data.push(data[tmp].thresholdvalue)
									}
								}
								seriesArray.push(tmpObj)
								if (tmp != "TOTAL") {
									seriesArray.push(thresholdObj)
								}

								plot.lineRender(el.find("#chart") ,{
									legend:legendArray,
					                category :categoryArray,
					                series : seriesArray,
					                lineStyle : true,
					                color_array:['#23b7e5' ,'#ff6565'],
									axisLabelFormatter : function (value){
										return value.substr(5)
									}
					            });
					             g_grid.render(el.find("#grid"),{
									header : [{text:"时间","name":"lable"},{text:"磁盘名称","name":"tip"},{text:"使用率(%)","name":"value"}],
									data : dataList,
									paginator : false,
									showCount : false,
									autoHeight : true,
									allowCheckBox : false,
									hideSearch : true
								})
							})

							el.find("#disk_sel").val("TOTAL")
							el.find("#disk_sel").trigger("change")
						}
					})
				}
				__t()
			}
		}
	}

	function __sliceArray(array, size) {
	    var result = [];
	    for (var x = 0; x < Math.ceil(array.length / size); x++) {
	        var start = x * size;
	        var end = start + size;
	        result.push(array.slice(start, end));
	    }
	    return result;
	}

	function __compare(startDate ,endDate ,days ,el){
		if (!g_moment(endDate).subtract(31, 'days').isBefore(g_moment(startDate))){
			g_dialog.operateAlert(el ,'开始时间与结束时间间隔不能大于30天' ,'error')
			return false
		}
		return true
	}

	function color_get(opt){
		var val = parseFloat(opt.val)
		var faultVal = parseFloat(opt.faultVal)
		var perfVal = parseFloat(opt.perfVal)
		if (opt.faultVal && opt.perfVal) {
			if (faultVal <= perfVal) {
				return '#3ad3b5'
			} else {
				if(val >= perfVal && val < faultVal){
					return "#fcb942"
				} else if(val >= faultVal) {
					return "#ff6565"
				} else {
					return '#3ad3b5'
				}
			}
		} else if(!faultVal && perfVal){
			if (val >= perfVal) {

				return "#fcb942"
			} else {
				return '#3ad3b5'
			}
		} else if(faultVal && !perfVal){
			if (val >= faultVal) {
				return "#ff6565"
			} else {
				return '#3ad3b5'
			}
		} else{
			return false
		}
	}

});