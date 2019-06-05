/** 
	插件名称  :  plot
	插件功能  :  各种图表生成，饼图，线图，晴雨表
*/
define(['/js/lib/charts/echarts.min.js'] ,function (echarts){

	var color_array = ['#23b7e5' ,'#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'];

	return {
		/** 
			param:  name
					legend
					hideLegend
					data
					grid
					labelSetting
					roseType
		*/
		pieRender:function (el ,opt){
			var myChart = echarts.init(el[0]);
			var __flag = true
			opt.data.forEach(function (tmp){
				if (tmp.value == "0")
					tmp.value = null
				else
					__flag = false
			})
			if (__flag)
			{
				opt.data.forEach(function (tmp){
					tmp.value = "0"
				})
			}
			option = {
			    tooltip: {
			        trigger: 'item',
			        formatter: "{a} <br/>{b}: {c} ({d}%)"
			    },
			    legend: {
			    	icon:'rect',
			        orient: 'vertical',
			        left : "3%",
			        right: "30%",
			        top:"30%",
			        //data:['Test1','Test2']
			        data: opt.legend,
			        selectedMode:false,
			        itemWidth:10,
			        itemHeight:10,
			        textStyle:{color:"#6e7682"}
			    },
			    series: [
			        {
			            name:(opt.name?opt.name:""),
			            type:'pie',
			            //radius: ['50%', '70%'],
			            avoidLabelOverlap: true,
			            label: {
			                normal: {
			                    show: false,
			                    position: 'left'
			                }
			                // emphasis: {
			                //     show: true,
			                //     textStyle: {
			                //         fontSize: '15',
			                //         fontWeight: 'bold'
			                //     }
			                // }
			            },
			            labelLine: {
			                normal: {
			                    show: false
			                }
			            },
			            center:opt.center || ["50%" ,"50%"],
			            data:opt.data,
				            	// [
				             //    	{value:335, name:'Test1'},
				             //    	{value:310, name:'Test2'}
				            	// ]
			        }
			    ],
			    color: color_array,
			    animation:true
			};

			if (opt.hideLegend)
			{
				delete option.legend;
			}

			if (opt.legendConfig)
				option.legend = $.extend(option.legend ,opt.legendConfig)

			if (opt.grid)
			{
				option.grid = opt.grid;
			}

			if (opt.labelSetting)
			{
				option.series[0].label = opt.labelSetting;
			}

			if (opt.labelLineSetting)
			{
				option.series[0].labelLine = opt.labelLineSetting;
			}

			if (opt.centerPosition)
			{
				option.series[0].center = opt.centerPosition;
			}

			if (opt.radius)
			{
				option.series[0].radius = opt.radius;
			}

			if (opt.legendArray)
			{
				option.legend = opt.legendArray;
			}

			if (opt.color_array)
			{
				option.color = opt.color_array;
			}

			if (opt.itemStyle)
			{
				option.series[0].label.normal.show = true;
				option.series[0].label.normal.position = "inner";
				//option.series[0].labelLine.normal.show = true;
				option.series[0].itemStyle = opt.itemStyle;
			}

			if (opt.roseType)
			{
				option.series[0].roseType = opt.roseType;
			}

			if (opt.hideAnimation)
			{
				option.animation = false;
			}

			myChart.setOption(option);

			if (!opt.resizeFlag)
			{
				el.data("chart" ,myChart);

				if (opt.click)
				{
					myChart.on('click', function (params) {
				    	opt.click(params);
					});
				}

				onWindowResize && onWindowResize.add(function (){
					myChart.resize();
				});
			}

			return myChart;
		},

		/** 
			线图
			参数 : category series legend grid title
				   legendStyle legendColor
				   axisLabelRotate	int
				   tooltipFormatter function(){}
				   axisLabelFormatter function(){}
				   color_array []
				   hideYaxis boolean
				   xAxisLabelColor xAxisLineColor
				   yAxisMax yAxisLineColor minInterval
				   splitLineColor
				   hideAnimation

		*/
		lineRender: function (el,opt){
			var myChart = echarts.init(el[0]);

			// if (!opt.lineStyle)
			// {
			// 	for (var i = 0; i < opt.series.length; i++) {
			// 		opt.series[i].areaStyle = {normal: {}};
			// 	}
			// }

			for(var i = 0;i<opt.series.length;i++){
				if(!opt.series[i].showSymbol && !opt.series[i].symbol){
					opt.series[i].showSymbol = false;
					opt.series[i].symbol = 'circle';
					opt.series[i].smooth = false
				}
			}

			option = {
				title: {
					text: ''
				},
				tooltip : {
					trigger: 'axis'
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					top: 40,
					containLabel: true
				},
				xAxis :
				[
					{
						type : 'category',
						axisLabel : {textStyle:{color:"#6e7682"}},
						boundaryGap : false,
						data : opt.category,
						axisLine:{
			            	lineStyle:{
			            		color : '#f1f1f1'
			            	}
			            }
					}
				],
				yAxis : 
				[
					{
						type : 'value',
						axisLabel : {textStyle:{color:"#6e7682"}},
						minInterval: 1,
						max:opt.yAxisMax?opt.yAxisMax:null,
						splitLine: {
					        lineStyle: {
					            color: "#f1f1f1"
					        }
					    },
						axisLine:{
			            	lineStyle:{
			            		color : '#f1f1f1'
			            	}
			            },
					    axisTick: {
				           show:false
				        }
					}
				],
				series : opt.series,
				color: color_array,
				animation:true
			}

			if (opt.legend)
			{
				option.legend = {
						          //data:['邮件营销','联盟广告']
						          data:opt.legend,
						          icon:'circle',
						          itemGap: 20,
						          itemWidth:10,
						          textStyle:{color:"#6e7682"}
							    }
				if (opt.legendStyle)
					option.legend.textStyle = {color:'#fft'}
			}

			if (opt.axisLabelRotate)
				option.xAxis[0].axisLabel.rotate = opt.axisLabelRotate

			if (opt.axisLabelFormatter)
				option.xAxis[0].axisLabel.formatter = opt.axisLabelFormatter

			if (opt.xAxisLabelColor)
				option.xAxis[0].axisLabel = {textStyle:{color:opt.xAxisLabelColor}}

			if (opt.xAxisLineColor)
			{
				option.xAxis[0].axisLine.lineStyle.color = opt.xAxisLineColor
				option.xAxis[0].axisLabel.textStyle.color = opt.xAxisLineColor
			}

			if (opt.yAxisLineColor)
			{
				option.yAxis[0].axisLine.lineStyle.color = opt.yAxisLineColor
				option.yAxis[0].axisLabel.textStyle.color = opt.yAxisLineColor
			}

			if (opt.doubleYaxis)
			{
				var __yaxis = _.extend({} ,option.yAxis[0])
			}

			if (opt.hideYaxis)
			{
				option.yAxis[0].axisLine = {show: false}
				option.yAxis[0].axisLabel = {show: false}
				option.yAxis[0].axisTick = {show: false}
				option.yAxis[0].splitLine = {show: false}
			}

			if (opt.tooltipFormatter)
				option.tooltip.formatter = opt.tooltipFormatter

			if (opt.legendColor)
				option.legend.textStyle.color = opt.legendColor

			if (opt.splitLineColor)
				option.yAxis[0].splitLine = {lineStyle:{color : opt.splitLineColor}}

			if (opt.grid)
				option.grid = opt.grid

			if (opt.title)
				option.title.text = opt.title

			option.color = opt.color_array ? opt.color_array : ['#3290fc','#f7cc30','#3cc35f','#31c3c1','#ec4566','#ffb340','#546570']

			if (opt.hideAnimation)
				option.animation = false
			
			opt.minInterval && (option.yAxis[0].minInterval = opt.minInterval)
			var dataZoom = [
				//最简配置项
				{
					show: true,  //是否 展示
					start: 0,	//开始位置
					end: 100	//结束位置
				},
				//全部配置项
				// {
				//  	type: 'inside',   //default: 'inside'
				// 	show: true,		//是否显示
				//  	disabled: fasle,  //是否可用
				// 	yAxisIndex: 0,	//控制第几个y轴，从0开始，可为数组（轴选项最好只设置一个，多个情况官方文档未说明）
				// 	xAxisIndex: 0,	//控制第几个x轴，从0开始，可为数组(默认值)
				// 	radiusAxis: 0,	//控制第几个radius轴，从0开始，可为数组
				// 	angleAxis: 0,	//控制第几个angle轴，从0开始，可为数组
				// 	filterMode: 'empty',	//是否 影响其它轴的数据范围，默认为 filter，如有多个轴的datazoom次轴datazoom可设置为empty
				// 	start: 94,	//开始位置（百分比）取值范围 0~100
				// 	end: 100,	//结束位置（百分比）取值范围 0~100
				//  	startValue: 0, //(值)
				//  	endValue: 100, //(值)
				// 	minSpan: 0,	//窗口最小范围（百分比）
				// 	maxSpan: 100,  //窗口最大范围（百分比）
				//  	minValueSpan: 0,   //窗口最小范围（值）
				//  	maxValueSpan: 100,   //窗口最大范围（值）
				// 	width: 30,	//宽度
				// 	height: '80%',	//高度
				// 	showDetail: true,	//是否显示detail，即拖拽时候显示详细数值信息。
				// 	showDataShadow: false,	//是否显示数据趋势在datazoom中
				//  	zoomLock: false,  //是否锁定选择区域（或叫做数据窗口）的大小。
				// 	rangeMode:['percent', 'percent'],   //例如 rangeMode: ['value', 'percent']，表示 start 值取绝对数值，end 取百分比。
				// 	left: '93%',	//datazoom显示位置 与 grid类似
				// 	top: '93%',	//datazoom显示位置 与 grid类似
				// 	right: '93%',	//datazoom显示位置 与 grid类似
				// 	bottom: '93%',	//datazoom显示位置 与 grid类似
				// }
			]
			if(opt.dataZoom)
				option.dataZoom = dataZoom

			myChart.setOption(option)

			if (!opt.resizeFlag)
			{
				if (opt.click)
				{
					myChart.on('click', function (params) {
				    	opt.click(params)
					});
				}
				
				el.data("chart" ,myChart)

				onWindowResize && onWindowResize.add(function (){
					if (el.width() == 100)
						return false
					if (opt.delay)
					{
						el.oneTime(500 ,function (){
							myChart.resize();
						});
					}
					else
					{
						myChart.resize();
					}
				})
			}

			return myChart
		},
		/** 
			柱图
			参数 : category
				   series
				   rotate
				   legend
				   color
				   yAxisLineColor
				   xAxisLineColor
		*/
		barRender:function (el ,opt){
			var myChart = echarts.init(el[0]);
			var labelLength = opt.labelLength || 8
			var xAxis = [
					        {
					            type : 'category',
					            //data : ['周一','周二','周三','周四','周五','周六','周日']
					            data : opt.category,
					            nameRotate : 15,
					            axisLabel : {interval:0,textStyle:{fontSize:10,color : '#6e7682'},formatter:function (value){
					            	if (value)
					            		return value.replace(/.{8}(?!$)/g, function (a){return a + '\n'})
					            	else
					            		return value
					            }},
					            axisLine:{
					            	lineStyle:{
					            		color : '#f1f1f1'
					            	}
					            },

					        }
					    ]
			var yAxis = [
					        {
					            type : 'value',
					            nameRotate : 15,
					            minInterval: 1,
					            axisLabel : {textStyle:{color:"#6e7682"}},
					            max:opt.yAxisMax?opt.yAxisMax:null,
					            splitLine : {
					            	show : true,
					            	lineStyle : {
					            		color : 'rgba(0,0,0,0.05)'
					            	}
					            },
					            axisLine:{
					            	lineStyle:{
					            		color : '#f1f1f1'
					            	}
					            },
					            axisTick: {
					            	show : false
					            }
					        }
					    ]

			if (opt.rotate)
				xAxis[0].axisLabel.rotate = opt.rotate;
			if (opt.xAxisLabelInterval)
				xAxis[0].axisLabel.interval = opt.xAxisLabelInterval
			option = {
			    tooltip : {
			        trigger: 'axis',
			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
			        }
			    },
			    grid: {
			        left: '3%',
			        right: '4%',
			        bottom: '3%',
			        containLabel: true
			    },
			    yAxis : yAxis,
			    xAxis : xAxis,
			    series : opt.series,
			    color: color_array,
			    animation: true
					    // [
					    //     {
					    //         name:'邮件营销',
					    //         type:'bar',
					    //         stack: '广告',
					    //         data:[120, 132, 101, 134, 90, 230, 210]
					    //     }
					    // ]

			};
			if (opt.legend)
			{
				option.legend = {
						          //data:['邮件营销','联盟广告']
						          data:opt.legend,
						          textStyle:{color:"#6e7682"}
							    };
			}
			if (opt.isVercital)
			{
				option.yAxis = xAxis;
				option.xAxis = yAxis;
			}
			if (opt.xFormater)
				option.yAxis[0].axisLabel.formatter = opt.xFormater

			if (opt.tipFormater)
				option.tooltip.formatter = opt.tipFormater

			if (opt.color)
				option.color = opt.color

			if (opt.xAxisLineColor)
				option.xAxis[0].axisLine.lineStyle.color = opt.xAxisLineColor

			if (opt.yAxisLineColor)
				option.yAxis[0].axisLine.lineStyle.color = opt.yAxisLineColor

			if (opt.axisLabelFormatter)
				option.xAxis[0].axisLabel.formatter = opt.axisLabelFormatter

			if (opt.splitLineColor)
				option.yAxis[0].splitLine = {lineStyle:{color : opt.splitLineColor}}

			if (opt.grid)
				option.grid = opt.grid

			if (opt.hideAnimation)
				option.animation = false

			if (!opt.barFreeWidth)
				option.series[0].barMaxWidth = "32px"

			// dataZoom: [
			// //最简配置项
			// {
			// 	show: true,  //是否 展示
			// 	start: 94,	//开始位置
			// 	end: 100	//结束位置
			// },
			// //全部配置项
			// {
			//  type: 'inside',   //default: 'inside'
			// 	show: true,		//是否显示
			//  disabled: fasle,  //是否可用
			// 	yAxisIndex: 0,	//控制第几个y轴，从0开始，可为数组（轴选项最好只设置一个，多个情况官方文档未说明）
			// 	xAxisIndex: 0,	//控制第几个x轴，从0开始，可为数组(默认值)
			// 	radiusAxis: 0,	//控制第几个radius轴，从0开始，可为数组
			// 	angleAxis: 0,	//控制第几个angle轴，从0开始，可为数组
			// 	filterMode: 'empty',	//是否 影响其它轴的数据范围，默认为 filter，如有多个轴的datazoom次轴datazoom可设置为empty
			// 	start: 94,	//开始位置（百分比）取值范围 0~100
			// 	end: 100,	//结束位置（百分比）取值范围 0~100
			//  startValue: 0, //(值)
			//  endValue: 100, //(值)
			//	minSpan: 0,	//窗口最小范围（百分比）
			// 	maxSpan: 100,  //窗口最大范围（百分比）
			//  minValueSpan: 0,   //窗口最小范围（值）
			//  maxValueSpan: 100,   //窗口最大范围（值）
			// 	width: 30,	//宽度
			// 	height: '80%',	//高度
			//	showDetail: true,	//是否显示detail，即拖拽时候显示详细数值信息。
			// 	showDataShadow: false,	//是否显示数据趋势在datazoom中
			//  zoomLock: false,  //是否锁定选择区域（或叫做数据窗口）的大小。
			//	rangeMode:['percent', 'percent'],   //例如 rangeMode: ['value', 'percent']，表示 start 值取绝对数值，end 取百分比。
			// 	left: '93%',	//datazoom显示位置 与 grid类似
			// 	top: '93%',	//datazoom显示位置 与 grid类似
			// 	right: '93%',	//datazoom显示位置 与 grid类似
			// 	bottom: '93%',	//datazoom显示位置 与 grid类似
			// }
			// ]
			if(opt.dataZoom){
				option.dataZoom = opt.dataZoom;
			}
			
			myChart.setOption(option);

			if (!opt.resizeFlag)
			{
				if (opt.click)
				{
					myChart.on('click', function (params) {
				    	opt.click(params);
					});
				}

				el.data("chart" ,myChart);

				onWindowResize && onWindowResize.add(function (){
					myChart.resize();
				});
			}
			return myChart;
		},
		dashBoardRender : function (el ,opt){
			var myChart = echarts.init(el[0]);

			option = {
					    tooltip : {
					        formatter: "{a} <br/>{c} {b}"
					    },
					    series : opt.series
					};
			myChart.setOption(option);

			onWindowResize && onWindowResize.add(function (){
				myChart.resize();
			});
		},
		circlifulRender : function (el ,opt){
			require(['/js/lib/charts/circliful/js/jquery.circliful.js',
					'css!/js/lib/charts/circliful/css/jquery.circliful.css'] ,function (){
						el.circliful({
				            animation: 1,
				            animationStep: 5,
				            foregroundBorderWidth: 20,
				            backgroundBorderWidth: 20,
				            percent: parseInt(opt.value),
				            textSize: 60,
				            textStyle: 'font-size: 32px;',
				            textColor: '#666',
				            multiPercentage: 1,
				            percentages: [10, 20, 30]
				        });
					});
		},
		circleCheckRender : function (el ,opt){
		  var circle = {
		    x : 25,
		    y : 25,
		    r : 24,
		    sA : 0,
		    pi : Math.PI,
		    lineWidth : opt.lineWidth || 6,
		    strokeStyle : opt.color || 'rgba(26,26,70,1)'
		  };
		  var line = {
		    x1 : 10,
		    y1 : 25,
		    delt : 10
		  };
		  var ex,ey;
		  var canvas = el;
		  var ctx = canvas.getContext('2d');
		  ctx.lineWidth = circle.lineWidth;
		  ctx.strokeStyle = circle.strokeStyle;
		  ctx.lineCap = 'round';
		  ctx.lineJoin = 'round';
		  ctx.imageSmoothingEnabled = true;
		  ctx.translate(0.5,0.5);
		  ctx.scale(opt.scale ? opt.scale : 1,opt.scale ? opt.scale : 1);
		  
		  function draw(k){
		    ctx.clearRect(0,0,canvas.width,canvas.height);
		    ctx.beginPath();
		    ctx.arc(circle.x,circle.y,circle.r,circle.sA,0.01*k*circle.pi,false);
		    ctx.stroke();
		    ctx.closePath();
		  }
		  var k = 0;
		  var int1 = setInterval(function(){
		    k+=3;
		    draw(k);
		    if(k>=200) 
		      {
		        clearInterval(int1);
		        drawCheck();
		      }
		  },3);

		  function drawC(l){
		    // ctx.restore();
		    ctx.beginPath();
		    ctx.moveTo(line.x1,line.y1);
		    ctx.lineTo(line.x1+l,line.y1+l);
		    ctx.stroke();
		  }

		  function drawD(ex,ey,m){
		    ctx.beginPath();
		    ctx.lineTo(ex+m,ey-m);
		    ctx.stroke();
		    ctx.closePath();
		  }

		  function drawCheck(){
		    var l = 0;
		    var int2 = setInterval(function(){ 
		      l++;
		      drawC(l);
		      if(l==line.delt) 
		        {
		          clearInterval(int2);
		          drawCheck2();
		        }
		    },3);
		  }
		  function drawCheck2(){
		    var m = 0;
		    var int3 = setInterval(function(){
		      m++;
		      drawD(line.x1+line.delt,line.y1+line.delt,m);
		      if(m==20) 
		        {
		          clearInterval(int3);
		        }
		    },3);  
		  }
		},
		circleErrorRender : function (el ,opt){
		  var canvas = el;
		  var ctx = canvas.getContext('2d');
		  var circle = {
		    x : 25,
		    y : 25,
		    r : 24,
		    sA : 0,
		    pi : Math.PI
		  };
		  var line1 = {
		    x1 : 15,
		    y1 : 15,
		    x2 : 35,
		    y2 : 15,
		    delt : 20
		  };
		  var ex,ey;
		  ctx.lineWidth = opt.lineWidth || 6;
		  ctx.strokeStyle = opt.color || 'rgba(26,26,70,1)';
		  ctx.lineCap = 'round';
		  ctx.lineJoin = 'round';
		  ctx.imageSmoothingEnabled = true;
		  ctx.translate(0.5,0.5);
		  ctx.scale(opt.scale ? opt.scale : 1,opt.scale ? opt.scale : 1);
		  
		  function draw(k){
		    ctx.clearRect(0,0,canvas.width,canvas.height);
		    ctx.beginPath();
		    ctx.arc(circle.x,circle.y,circle.r,circle.sA,0.01*k*circle.pi,false);
		    ctx.stroke();
		    ctx.closePath();
		  }
		  function line(l){
		    ctx.beginPath();
		    ctx.moveTo(line1.x1,line1.y1);
		    ctx.lineTo(line1.x1+l,line1.y1+l);
		    ctx.stroke();
		    ctx.closePath();
		  }
		  function line2(l){
		    ctx.beginPath();
		    ctx.moveTo(line1.x2,line1.y2);
		    ctx.lineTo(line1.x2-l,line1.y2+l);
		    ctx.stroke();
		    ctx.closePath();
		    ctx.rotate(90*circle.pi/180);
		  }
		  function drawLine(){
		    var l = 0;
		    var int2 = setInterval(function(){
		      l++;
		      line(l);
		      if(l>=line1.delt)
		        {
		          clearInterval(int2);
		          drawLine2();
		        }
		    },5);
		  }
		  function drawLine2(){
		    var l = line1.delt;
		    var int3 = setInterval(function(){
		      l--;
		      line2(l);
		      if(l<=0)
		        {
		          clearInterval(int3);
		        }
		    },5);
		  }
		  var k = 0;
		  var int1 = setInterval(function(){
		    k+=3;
		    draw(k);
		    if(k>=200) 
		      {
		        clearInterval(int1);
		        drawLine();
		      }
		  },3);
		},
		destroy:function (el){
			echarts.dispose(el);
		},
		getEcharts : function(el){
			return echarts
		},
		barometerRender : function (opt){
			var el = opt.el
			var weatherMap = new HashMap();
			weatherMap.put("1" ,"fine");
			weatherMap.put("2" ,"cloudy");
			weatherMap.put("3" ,"overcase");
			weatherMap.put("4" ,"rain");
			weatherMap.put("5" ,"big_rain");

			//el.find("[data-id=panel_title]").text("全网当前风险");
			if (!opt.hideLoad)
				g_dialog.waitingAlert(el);
			$.ajax({
				type: "GET",
				url: "tpl/barometer.html",
				async: false,
				success :function(data)
				{
					if (el.find("#cloudy_div").size() == 0)
						el.append(data);
					if (opt.type == "bigscreen")
					{
						el.find("#cloudy_div").children().css("width" ,"140px")
						el.find("#cloudy_div").next().css("padding-left" ,"50px")
						el.find("#cloudy_div").next().attr("class" ,"col-xs-8")
						el.find("#weeks_div").find("[class=text-muted]").remove()
						el.find("#weeks_div").children().eq(0).css("padding" ,"0")
					}
					else
					{
						el.css("padding" ,"15px");
					}

					um_ajax_get({
						url : "StatisticsData/getAllSecurityGraph",
						paramObj : {},
						isLoad:false,
						successCallBack : function (data){
							var prel_jsonData = el.data("jsonData")
							var current_jsonData = JsonTools.encode(data)
							if (prel_jsonData == current_jsonData)
							{
								return false
							}
							el.data("jsonData" ,current_jsonData)
							var para = data.para;
							var paraArray = para.split(",");
							var singleParaArray;
							var weatherId;
							for (var i = 0; i < paraArray.length; i++) {
								singleParaArray = paraArray[i].split("_");
								weatherId = el.find("[data-type=weather]").eq(i).attr("id");
								el.find("[data-type=weather]").eq(i).addClass(weatherMap.get(singleParaArray[0]));
								weatherId = el.find("[data-type=weather]").eq(i).parent().attr("title" ,data["risk"+singleParaArray[0]]);
								weatherId = el.find("[data-type=weather]").eq(i).next().text(singleParaArray[1].substr(5));
								if (i == 0)
								{
									$("#cloudy_des").text(data["risk"+singleParaArray[0]]);
									$("#cloudy_level").text(singleParaArray[0] + "级");
								}
							}

							el.find("[id=cloudy_div]").tooltip();
							el.find("[id=weeks_div]").children().tooltip();
							el.find("[id=weather_div]").show();
							g_dialog.waitingAlertHide(el);
						}
					});
				}
			});
		}
	}

	function lineHide(opt) {
        jQuery.each(opt.data, function (i, item) {
            if (item.value == 0) {
                item.itemStyle.normal.labelLine.show = false;
                item.itemStyle.normal.label.show = false;
            }
        });
    }
});