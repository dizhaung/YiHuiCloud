define(['/js/plugin/plot/plot.js',
		'/js/plugin/dashboard/dashboardutil.js',
		"css!/js/plugin/dashboard/dashboard.css"] ,function (plot ,dashboardutil){

	var gridster = null;

	var index_reData

	var this_params

	var panel_str = '<li class="gridster_panel"><div class="gridster_div"><div class="__oper"><span class="__title title-color"></span><span class="__opt"><ul><li class="__edit">编辑</li><li class="__delete">删除</li></ul></span></div><div class="body desc-color"></div></div></li>'

	var pie_color_map = new HashMap()
	pie_color_map.put('正常' ,'#3bc35f')
	pie_color_map.put('运行中' ,'#3bc35f')
	pie_color_map.put('性能' ,'#f9b94d')
	pie_color_map.put('故障' ,'#fb6469')
	pie_color_map.put('已停止' ,'#fb6469')
	pie_color_map.put('未知' ,'#d2d2d2')
	pie_color_map.put('离线' ,'#d2d2d2')
	pie_color_map.put('已停止' ,'#d2d2d2')
	pie_color_map.put('凭证' ,'#2fa2e9')
	pie_color_map.put('其他' ,'#2fa2e9')

	return {
		init : function (option){
			if (gridster)
				gridster.destroy()
			gridster = 
				$(".gridster ul").gridster({
			        widget_base_dimensions: ['auto', 10],
			        autogenerate_stylesheet: true,
			        min_cols: 1,
			        max_cols: 12,
			        max_rows: 100,
			        widget_margins: [1, 1],
			        resize: {
			            enabled: option.enabled,
			            resize: function (e, ui, $widget) {
				           var __t = $($widget[0]).find("[_echarts_instance_]").data("chart")
				           if (__t)
				           		__t.resize()
				        }
				    }
				}).data('gridster');

			this_params = index_query_param_get();
			return gridster
		},
		grid_from_serialize : function (type ,id){
			var self = this
			um_ajax_post({
				url :"DashboardConfig/queryDashboardConfig",
				paramObj:{type:type ,id:id},
				isLoad : false,
				successCallBack : function(reData){
					index_reData = reData[0]
					if (!index_reData || !index_reData.configJson){
						$(".empty").show()
						return false
					}
					$(".empty").hide()
					$.each(JsonTools.decode(index_reData.configJson), function () {
		                gridster.add_widget('<li class="gridster_panel" data-id="'+this.data_id+'" data-type="'+this.data_type+'" data-name="'+this.data_name+'"><div class="gridster_div"><div class="__oper"><span class="__title title-color"></span><span class="__opt"><ul><li class="__edit">编辑</li><li class="__delete">删除</li></ul></span></div><div class="body desc-color"></div></div></li>', this.size_x, this.size_y, this.col, this.row);
		            });
		            $("[class*=gridster_panel]").each(function (){
		            	self.switch_panel_render({panelType:$(this).attr("data-type") ,dataId:$(this).attr("data-id") ,panel_name:$(this).attr("data-name")} ,$(this))
		            })
				}
			});
		},
		add_widget : function (){
			gridster.add_widget.apply(gridster, [panel_str, 3, 15])
		},
		remove_widget : function (target){
			gridster.remove_widget.apply(gridster, target)
		},
		remove_all : function (){
			gridster.remove_all_widgets()
		},
		serialize : function (){
             
            var flag =true;

			var __tmp = gridster.serialize();
	    	for (var i = 0; i < __tmp.length; i++) {
	    		var __el_li = $("[data-col="+__tmp[i].col+"][data-row="+__tmp[i].row+"][data-sizex="+__tmp[i].size_x+"][data-sizey="+__tmp[i].size_y+"]")
	    		__tmp[i].data_id = __el_li.attr("data-id")
	    		__tmp[i].data_type = __el_li.attr("data-type")
	    		__tmp[i].data_name = __el_li.attr("data-name")

                if(!__tmp[i].data_id)
                {
                	flag =false ;
                	break;
                }
	    	}
            


	    	index_reData.configJson = JsonTools.encode(__tmp)

	    	um_ajax_post({
			     paramObj : index_reData,
			     url :"DashboardConfig/updDashboardConfig",
				 successCallBack : function(reData){
					g_dialog.operateAlert(null ,"操作成功！");
				}
			});
		},
		switch_panel_render : function (saveObj ,el_panel){
			if (saveObj.panelType == 1)
			{
				pie_render(el_panel,saveObj);
			}
			else if (saveObj.panelType == 2)
			{
			
				bar_render(el_panel,saveObj);		
					
			}
			else if (saveObj.panelType == 3)
			{
				
				line_render(el_panel,saveObj);
			}
			else if (saveObj.panelType == 4)
			{
				
				gauge_render(el_panel,saveObj);
			}
			else if (saveObj.panelType == 5)
			{

				table_render(el_panel,saveObj);
			}
			else if(saveObj.panelType == 6)
			{
				overview_render(el_panel,saveObj);
			}
			else  if(saveObj.panelType == 7)
			{
				metrix_render(el_panel,saveObj);
			}
			else if(saveObj.panelType == 8)
			{

			}
			el_panel.find("[class*=__title]").text(saveObj.panel_name);
		}
	}

	// 折线图
	function line_render(el_panel,saveObj)
	{
		var el_panel_body = el_panel.find("[class*=body]");	

		if(el_panel_body.find("div").length==0)
		{       
			el_panel_body.append('<div class="w-all h-all"></div>');
		}	
		else{
			el_panel_body.find("div").empty();
		}	    
		 um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   paramObj:{id:saveObj.dataId,flag:this_params.type},
		   isLoad : false,
		   successCallBack : function(reData){     
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","7px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             return false;
		      }
		      var dataComponentConfigJson = $.parseJSON(reData[0].configJson);
		      if(dataComponentConfigJson.isTime=="1")
		      {
	             el_panel.find("[class=pabs]").remove();
		      	 if(saveObj.flag==null)
		      	 {
	                el_panel.find("[class=pabs]").remove();
		      	 	saveObj.flag='day';
		      	 	dayToYearRender(el_panel,saveObj,line_render);	      	 	
		      	 }
		      	 else
		      	 {
		      	 	dayToYearRender(el_panel,saveObj,line_render);	   
		      	 }
		      	 
		      }
		      if(dataComponentConfigJson.isVercital=="false")
		      {
		      	   dataComponentConfigJson.isVercital="";
		      }	     
		     var datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson);
		     var category = [];
		     var data = [];   
		     var paramArray =  datasourceConfigJson.param ? datasourceConfigJson.param.split(","):[];	
			 var paramObj={};
			for(var i=0;i<paramArray.length;i++)
			{
				var pArray=paramArray[i].split(":");
                paramObj[pArray[0]]=pArray[1];
			}
		     if(dataComponentConfigJson.monitorId)
		     {
	             um_ajax_post({
				   url :'metaMonitor/queryData',
				   maskObj : el_panel.find("[class*=custom_panel]"),
				   paramObj:{id:reData[0].datasourceId,
	                      monitorId:dataComponentConfigJson.monitorId,
	                      monitorType:dataComponentConfigJson.monitorTypeId,
	                      time:"2017-05-03 00:00:00,2017-05-04 00:00:00"

				   },			 
				   successCallBack : function(rData){              
		              for(var i=0;i<rData.length;i++)
		              {
		              	category.push(rData[i][dataComponentConfigJson.aAxis.xAxis]);
		              	data.push(rData[i][dataComponentConfigJson.aAxis.yAxis]);
		              }
				      plot.lineRender(el_panel_body.find("div") ,{
							category :category,
							series :[
								        {
								            name:dataComponentConfigJson.colums[dataComponentConfigJson.aAxis.yAxis],
								            type:'line',
								            data:data,							           
								        }
								]
						});
				    }
				});
		     }
		     else
		     {
		     	um_ajax_post({
				   url :datasourceConfigJson.query,
				   maskObj : el_panel.find("[class*=custom_panel]"),
				   paramObj:saveObj.flag? {flag:saveObj.flag}:paramObj,			 
				   successCallBack : function(rData){			      	      
		              var color_array = ['rgb(58, 186, 246)' ,'rgb(246, 96, 81)' ,'rgb(255, 218, 47)'];
	                  if(rData.length>0)
	                  {
	                      if(rData[0].lineName)
	                      {
	                         	var legendArray = [];
								var categoryArray = [];
								var seriesArray = [];
								for (var i = 0; i < rData.length; i++) {
									if (rData[i].lineName != "总量" && rData[i].lineName != "配置事件" && rData[i].lineName !="安全事件" )
									{
										legendArray.push(rData[i].lineName);
										var seriesObj = new Object();
										seriesObj.name = rData[i].lineName;
										seriesObj.type = "line";
										seriesObj.data = [];
										seriesObj.itemStyle = new Object();
										seriesObj.itemStyle.normal = new Object();
										seriesObj.itemStyle.normal.color = color_array[i];
										for (var j = 0; j < rData[i].items.length; j++) {
											seriesObj.data.push(rData[i].items[j][dataComponentConfigJson.aAxis.yAxis]);						
											categoryArray.push(rData[i].items[j][dataComponentConfigJson.aAxis.xAxis]);
										}
										seriesArray.push(seriesObj);
									}
								}
								plot.lineRender(el_panel_body.find("div") ,{
									legend : legendArray,
									category :categoryArray,
									series : seriesArray,
									delay : true
								});
	                      }
	                      else
	                      {
	                      	    for(var i=0;i<rData.length;i++)
					            {
					              	category.push(rData[i][dataComponentConfigJson.aAxis.xAxis]);
					              	data.push(rData[i][dataComponentConfigJson.aAxis.yAxis]);
					            }
						        plot.lineRender(el_panel_body.find("div") ,{
									category :category,
									series :[
										        {
										            name:dataComponentConfigJson.colums[dataComponentConfigJson.aAxis.yAxis],
										            type:'line',
										            data:data,							           
										        }
										]
				                });
	                      }
	                  }

				    }
				});
		     }
	    	 
		   }

		});
	}

	// 饼图
	function pie_render(el_panel,saveObj)
	{
		el_panel.find("[class=pabs]").remove();
		var el_panel_body = el_panel.find("[class*=body]");
		if(el_panel_body.find("div").length==0)
			el_panel_body.append('<div class="w-all h-all"></div>');
		else
			el_panel_body.find("div").empty();
	    var  dataComponentConfigJson={};
	    var  datasourceConfigJson ={};
	    var  flag=true;
	    var color_array = ['#95dd75','#f8b551','#77e0ef','#80c269','#c3cffe','#9fc5f7','#f19ec2','#3860fc','#eb6877','#50c4fd','#ff7e1f']
	    var __color_array = []
	    um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   paramObj:{id:saveObj.dataId},
		   isLoad:false,
		   successCallBack : function(reData)
		   {
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","7px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             flag=false;
		      }
		      else
		      {
	               dataComponentConfigJson =$.parseJSON(reData[0].configJson);
	               datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson);
		      }
		      var paramArray = datasourceConfigJson.param ? datasourceConfigJson.param.split(","):[];	
			 var paramObj={};
			for(var i=0;i<paramArray.length;i++)
			{
				var pArray=paramArray[i].split(":");
                paramObj[pArray[0]]=pArray[1];
			}
		      if(!flag) return false;
				var legend=[];
				var data=[];
				um_ajax_post({
				   url :datasourceConfigJson.query,
				   paramObj:paramObj,
				   isLoad:false,	
				   maskObj : el_panel.find("[class*=custom_panel]"),		 
				   successCallBack : function(rData){
			           for(var i=0;i<rData.length;i++)
			           {
							rData[i].value = rData[i][dataComponentConfigJson.aAxis.yAxis];
							rData[i].name = rData[i][dataComponentConfigJson.aAxis.xAxis];
							pie_color_map.get(rData[i].name) && __color_array.push(pie_color_map.get(rData[i].name))
							legend.push(rData[i][dataComponentConfigJson.aAxis.xAxis]);
			           }
			           var __t = __color_array.concat(color_array)
			       	    data=rData;
				       	mychart=plot.pieRender(el_panel_body.find("div") ,{
							name :  dataComponentConfigJson.colums[dataComponentConfigJson.aAxis.xAxis],
							legend :legend,
							data : data,
							center:["60%" ,"50%"],
							legendConfig: {
						        top: 20,
						    },
							labelSetting : 
							     {normal:
									  {
									  	show:true ,
									  	position:'outside',
						                formatter: '{b}|{c}'
						              },
					           },
					        labelLineSetting:{
					        	normal:{
					        		show:true
					        	}
					        }, 
					        grid: {
								right: '20',
								bottom: '3%',
								containLabel: false
							},
					        radius:['40%','50%'], 
							color_array : __t,
											         		   
						});
		        
				    }
				}); 		
		   }
		});
	}

	// 柱状图
	function bar_render(el_panel,saveObj)
	{
		el_panel.find("[class=pabs]").remove();
		var el_panel_body = el_panel.find("[class*=body]");
		if(el_panel_body.find("div").length==0)
		{       
			el_panel_body.append('<div class="w-all h-all"></div>');
		}	
		else{
			el_panel_body.find("div").empty();
		}
		 var category=[];
		 var data=[];
		 um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   isLoad : false,
		   paramObj:{id:saveObj.dataId},
		   successCallBack : function(reData){	
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","7px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             return false;
		      }
		      var dataComponentConfigJson = $.parseJSON(reData[0].configJson);
		      if(dataComponentConfigJson.isVercital=="false")
		      {
		      	  dataComponentConfigJson.isVercital="";
		      }	  
		   	  var datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson); 
               
               var paramArray = datasourceConfigJson.param ? datasourceConfigJson.param.split(","):[];	
				var paramObj={};
				for(var i=0;i<paramArray.length;i++)
				{
					var pArray=paramArray[i].split(":");
	                paramObj[pArray[0]]=pArray[1];
				}
		      um_ajax_post({
				   url :datasourceConfigJson.query,
				   paramObj:paramObj,
				   maskObj : el_panel.find("[class*=custom_panel]"),	 
				   successCallBack : function(rData){	  
				    if(dataComponentConfigJson.isVercital=="true")
				      {
				      	rData.sort(function(a,b){
				      		return a[dataComponentConfigJson.aAxis.yAxis]-b[dataComponentConfigJson.aAxis.yAxis];
				      	})
				      }   	 	
		              for(var i=0;i<rData.length;i++)
		              {
		              	        	
		              	 category.push(rData[i][dataComponentConfigJson.aAxis.xAxis]);
		              	 data.push(rData[i][dataComponentConfigJson.aAxis.yAxis]);
		              }
		              
		              if(saveObj.panel_name.lastIndexOf("资产事件")>-1)
		              {
	                      var legend = ['故障事件','性能事件','安全事件'];
	                      var farray= [];
	                      var parray= [];
	                      var sarray= [];
	                      var sumarray=[];
	                      for(var i=0;i<rData.length;i++)
	                      {
	                      	 farray.push(rData[i].fcnt);
	                      	 parray.push(rData[i].pcnt);
	                      	 sarray.push(rData[i].scnt);
	                         sumarray.push(rData[i].esum);
	                      }
	                      var series=[];
	                      var sumseries= new Object();
	                      var fseries=new Object();
	                      var pseries=new Object();
	                      var sseries=new Object();
	                      
	                      sumseries.name = '总计';
	                      sumseries.type = 'bar';
	                      sumseries.barGap='-100%',
	                      sumseries.barWidth = '30%';
	                      var  label= { normal: {show: true,position: ['101%', '0%']}};
	                      sumseries.label=label;

	                      sumseries.data=sumarray;   
	                      series.push(sumseries);

	                      fseries.name='故障事件';
	                      fseries.type='bar';
	                      fseries.data=farray;   
	                      fseries.stack='总量'  
	                      fseries.barWidth = '30%';                 
	                      var itemStyle =new Object();                      
	                      var normal={};
	                      itemStyle.normal=normal;
	                      normal.color='#f66051'                        
	                      fseries.itemStyle=itemStyle;
	                      series.push(fseries);

	                   
	                      pseries.name='性能事件';
	                      pseries.type='bar';
	                      pseries.data=parray;
	                      pseries.stack='总量'            
	                      var itemStyle =new Object();                      
	                      var normal={};
	                      itemStyle.normal=normal;
	                      normal.color='#ffda2f'                        
	                      pseries.itemStyle=itemStyle;
	                      series.push(pseries);


	                      sseries.name='安全事件';
	                      sseries.type='bar';
	                      sseries.stack='总量'            
	                      sseries.data=sarray;
	                      var itemStyle =new Object();                      
	                      var normal={};
	                      itemStyle.normal=normal;
	                      normal.color='#3abaf6'                        
	                      sseries.itemStyle=itemStyle;
	                      series.push(sseries);
	                    
	                      mychart = plot.barRender(el_panel_body.find("div") ,{
	                      	    legend : legend,
								category : category,
								isVercital:dataComponentConfigJson.isVercital,
								series : series
						  });             

		              }
		              else
		              {
	                       mychart = plot.barRender(el_panel_body.find("div") ,{
							category : category,
							isVercital:dataComponentConfigJson.isVercital,
							series : [
								        {
								            name:dataComponentConfigJson.colums[dataComponentConfigJson.aAxis.yAxis],
								            type:'bar',
								            data:data,
								            label:{
								            	normal:{
								            		show:true,
								            		position:'outside'
								            	}
								            }
								        }
									 ]
						});
		              }
		           	            
				   }
			  });
			}
	    });	
	}
	//刻度仪表盘
	function gauge_render(el_panel,saveObj)
	{
	    el_panel.find("[class=pabs]").remove();
		var el_panel_body = el_panel.find("[class*=body]");
		if(el_panel_body.find("div").length==0)
		{       
			el_panel_body.append('<div class="w-all h-all"></div>');
		}	
		else{
			el_panel_body.find("div").empty();
		}
	    var  dataComponentConfigJson={};
	    var  datasourceConfigJson ={};
	    var  flag=true;
	    um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   paramObj:{id:saveObj.dataId},
		   isLoad:false,
		   successCallBack : function(reData)
		   {	
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","7px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             flag=false;
		      }
		      else
		      {
	               dataComponentConfigJson =$.parseJSON(reData[0].configJson);
	               datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson);
		      }
		      if(!flag) return false;
		      var colums=datasourceConfigJson.colomns.split(",");
			  var ccolums=dataComponentConfigJson.colums;          

			  var header=[];
	          for(var i=0;i<colums.length;i++)
			  {
					var json={};
					json.text=ccolums[colums[i]];
					json.name=colums[i];			
					header.push(json);
			  }
			  var series=[];
		      var ser={detail: {formatter:'{value}%'}};		    
			  um_ajax_post({
			    url :datasourceConfigJson.query,
			    isLoad:false,
			    maskObj : el_panel.find("[class*=custom_panel]"),		 
			    successCallBack : function(rData){			     	
		            ser.name=saveObj.panel_name;
		            ser.type="gauge";
		            ser.data=[{value: rData[header[0].name], name:header[0].text}];
		            series.push(ser);	          
		            mychart=plot.dashBoardRender(el_panel_body.find("div") ,{series:series});
			    }
			});			
				 
		    }
		});
	}
	//表格
	function table_render(el_panel,saveObj)
	{
	    el_panel.find("[class=pabs]").remove();
		var el_panel_body = el_panel.find("[class*=body]");	
		if(el_panel_body.find("div").length==0)
		{       
			el_panel_body.append('<div class="w-all h-all"  style="padding:5px 20px"></div>');
		}	
		else{
			el_panel_body.find("div").empty();
		}
	    var  dataComponentConfigJson={};
	    var  datasourceConfigJson ={};
	    var  flag=true;
	    um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   paramObj:{id:saveObj.dataId,flag:this_params.type},
		   isLoad:false,
		   successCallBack : function(reData)
		   {	
		   	
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","7px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             flag=false;
		      }
		      else
		      {
	               dataComponentConfigJson =$.parseJSON(reData[0].configJson);
	               datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson);
		      }
		      if(!flag) return false;
				var header=[];
			    var colums=null;
			    var ccolums=dataComponentConfigJson.colums;
			    if(dataComponentConfigJson.monitorId)
			    {
			    	colums=reData[0].monitorFieldName.split(",");
			    }
			    else
			    {
			    	colums=datasourceConfigJson.colomns.split(",");
			    }
				for(var i=0;i<colums.length;i++)
				{
					var json={};
					json.text=ccolums[colums[i]];
					json.name=colums[i];
					json.align="left";
					header.push(json);
				}		


        	    var paramArray = datasourceConfigJson.param ? datasourceConfigJson.param.split(","):[];	
				var paramObj={};
				for(var i=0;i<paramArray.length;i++)
				{
					var pArray=paramArray[i].split(":");
	                paramObj[pArray[0]]=pArray[1];
				}
           
				var eventDetailType 
				if (saveObj.panel_name == "最新故障事件" ) 
					eventDetailType = "fault_event_detail"
				else if (saveObj.panel_name == "最新性能事件" ) 
					eventDetailType = "perform_event_detail"

				 if(paramObj.pageSize)
				 {
				 	
				 	el_panel.find("[class*=__title]").text(saveObj.panel_name+"(TOP"+paramObj.pageSize+")");
				 }
				
	        	 g_grid.render(el_panel_body.find("div") ,{
					url:datasourceConfigJson.query,
					paramObj:paramObj,
					maskObj :el_panel.find("[class*=custom_panel]"),
					header:header,
					paginator:false,
					allowCheckBox:false,
					hideSearch:true,
					hasBorder : false,
					gridHeight:"100%",
					gridCss:"um-grid-style",
					dbClick:dashboardutil[eventDetailType]
			     });		
			   
			
		    }
		});
	}
	//概览图
	function overview_render(el_panel,saveObj)
	{
		el_panel.find("[class=pabs]").remove();
		var el_panel_body = el_panel.find("[class*=body]");
		if(el_panel_body.find("div").length==0)
		{       
			el_panel_body.append('<div class="w-all h-all"></div>');
		}	
		else{
			el_panel_body.find("div").empty();
		}
	    var  dataComponentConfigJson={};
	    var  datasourceConfigJson ={};
	    var  flag=true;
	    um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   paramObj:{id:saveObj.dataId},
		   isLoad:false,
		   successCallBack : function(reData)
		   {	
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","7px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             flag=false;
		      }
		      else
		      {
	               dataComponentConfigJson =$.parseJSON(reData[0].configJson);
	               datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson);
		      }
		      if(!flag) return false;
		       if(saveObj.dataId=='8001')
		       {
		           var opt = {el:el_panel_body.find("div")};             
		           plot.barometerRender(opt);
		       }
		       else
		       {	       	  
					if(datasourceConfigJson.type=="2")
					{	
					   el_panel.find(".__oper").css("top" ,"13px")
					   if(datasourceConfigJson.param)
			            {
			               	  window.tempTopo=$.parseJSON(datasourceConfigJson.param);
			            }	           
						$.ajax({
							type: "GET",
							url: datasourceConfigJson.query+"?time="+new Date(),
							success :function(data)
							{
								el_panel_body.html(data);
							}
					   });
					}
					else
					{
						um_ajax_post({
						   url :datasourceConfigJson.query,
						   maskObj : el_panel.find("[class*=custom_panel]"),
						   isLoad:false,
						   successCallBack : function(rData){    
						        var sum=0;
						        var fault=0;
						        var  per=0;
						        var  sec= 0;
						        for(var i=0;i<rData.length;i++)
						        {
	                                   sum+=rData[i].eventCount;
	                                   if(rData[i].eventName.lastIndexOf("故障")>-1)
	                                   {
	                                   	  fault=rData[i].eventCount
	                                   }
	                                   else if (rData[i].eventName.lastIndexOf("性能")>-1) 
	                                   { 
	                                       per=rData[i].eventCount;	                                   }
	                                   else if(rData[i].eventName.lastIndexOf("安全")>-1)
	                                   {
	                                       sec= rData[i].eventCount;
	                                   }
						        }

						        if(saveObj.panel_name.lastIndexOf("故障")>-1)
						        {
	                                 el_panel_body.css("padding","7px").find("div").css({"text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle;font-size:40px;font-weight:bold;color:#f05864">'+fault+'</span>'
									 +'<span style="display:table-cell;vertical-align:middle;"><img style="display:inline-block" src="/module/monitor_info/__shandong_bigscreen/indexicon/fault.png" ></span>');
						        }
						        else if(saveObj.panel_name.lastIndexOf("性能")>-1)
						        {
	                                  el_panel_body.css("padding","7px").find("div").css({"text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle;font-size:40px;font-weight:bold;color:#f2bc47">'+per+'</span>'
	                                  	+'<span style="display:table-cell;vertical-align:middle;"><img src="/module/monitor_info/__shandong_bigscreen/indexicon/performance.png" ></span>');
						        }
						        else if(saveObj.panel_name.lastIndexOf("安全")>-1)
						        {
	                                 el_panel_body.css("padding","7px").find("div").css({"text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle;font-size:40px;font-weight:bold;color:#429ee2">'+sec+'</span>'
						        	 	+'<span style="display:table-cell;vertical-align:middle;"><img src="/module/monitor_info/__shandong_bigscreen/indexicon/security.png" ></span>');
						        } 
						        else{
						        	 el_panel_body.css("padding","7px").find("div").css({"text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle;font-size:40px;font-weight:bold;color:#46d343">'+sum+'</span>'
						        	 	+'<span style="display:table-cell;vertical-align:middle;"><img src="/module/monitor_info/__shandong_bigscreen/indexicon/sum.png" ></span>');
						        }
					           
					      }
					    });			
					}	
				 
				 
		       }     

				
		    }
		});
	}
	//计数器（单值）
	function metrix_render(el_panel,saveObj)
	{
	    el_panel.find("[class=pabs]").remove();
		var el_panel_body = el_panel.find("[class*=body]");
		if(el_panel_body.find("div").length==0)
		{       
			el_panel_body.append('<div class="w-all h-all"></div>');
		}	
		else{
			el_panel_body.find("div").empty();
		}
	    var  dataComponentConfigJson={};
	    var  datasourceConfigJson ={};
	    var  flag=true;
	    um_ajax_post({
		   url :"DataComponent/queryDataComponentById",
		   paramObj:{id:saveObj.dataId},
		   isLoad:false,
		   successCallBack : function(reData)
		   {	
		      if(reData.length==0) 
		      {
	             el_panel_body.css("padding","0 7px 10px").find("div").css({"background-color":"#EEEEEE","text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle"><i class="icon-exclamation-sign mr3" style="font-size:18px"></i>数据组件已删除</span>');
	             flag=false;
		      }
		      else
		      {
	               dataComponentConfigJson =$.parseJSON(reData[0].configJson);
	               datasourceConfigJson = $.parseJSON(reData[0].datasourceConfigJson);
		      }
		      if(!flag) return false;
		      var colums=datasourceConfigJson.colomns.split(",");
			  var ccolums=dataComponentConfigJson.colums;          
             var paramArray =  datasourceConfigJson.param ? datasourceConfigJson.param.split(","):[];	
			 var paramObj={};
			for(var i=0;i<paramArray.length;i++)
			{
				var pArray=paramArray[i].split(":");
                paramObj[pArray[0]]=pArray[1];
			}
			  var header=[];
	          for(var i=0;i<colums.length;i++)
			  {
					var json={};
					json.text=ccolums[colums[i]];
					json.name=colums[i];			
					header.push(json);
			  }			
			  um_ajax_post({
			    url :datasourceConfigJson.query,
			    isLoad:false,
			    maskObj : el_panel.find("[class*=custom_panel]"),		 
			    successCallBack : function(rData){     	      
		        	el_panel_body.parent().find(".__title").css("font-size","12px")
		            el_panel_body.css("padding","0 7px 10px").find("div").css({"text-align":"center","display":"table"}).append('<span style="display:table-cell;vertical-align:middle;font-size:40px;">'+rData[header[0].name]+'<span style="font-size:12px;margin-left:3px">'+dataComponentConfigJson.unit+'</span></span>');
			    	el_panel_body.addClass("title-color")
			    }
			});			
				 
		    }
		});
	}

	function dayToYearRender(el,saveObj,fn)
	{
		var divel = $('<div class="pabs" style="display:inline;font-weight:normal;right:50px"></div>');
		var sel = $('<select data-type="select"></select>');	
		divel.append(sel);
		el.find("[class=oper]").after(divel);        
		sel.append('<option value="day">最近一天</option>');
		sel.append('<option value="week">最近一周</option>');
		sel.append('<option value="month">最近一月</option>');
		sel.append('<option value="season">最近一季度</option>');
		sel.append('<option value="year">最近一年</option>');
		sel.val(saveObj.flag);
	    index_form_init(el.find("[class=pabs]"));
	  
		sel.change(function (){
			saveObj.flag=$(this).val();
			fn(el,saveObj);
		});
	}
})