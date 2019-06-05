define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js'] ,function (monitorInfo, plot, asset){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMysqlMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		mysql_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMysqlStatic",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#data_base_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		// 数据库select框
		instance_sel : function (paramObj){
			var self = this
			paramObj.instStatus = 1;
		    paramObj.monitorTypeNameLanguage = 1;
		    paramObj.edId = paramObj.assetId;
            um_ajax_get({
		        url : "monitorview/db/mysql/queryDBNameList",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var selBuff = [];
		            for (var i = 0; i < data.length; i++) {
		                selBuff.push({id:data[i].dbName ,text:data[i].dbName});
		            }
		            $("#database_sel").select2({
		                  data: selBuff,
		                  width:"100%"
		            });
		            self.data_base_list(paramObj)
		        }
		    });		   
		},
		// 数据库
		data_base_list : function (paramObj){
			var data_base_list_url = "monitorview/db/mysql/queryMySqlTables";

			var data_base_list_header = [
			        //                       	{text:"数据库名" ,name:"dbName" ,searchRender:function (el){
											// 	el.append('<input type="hidden" search-data="monitorTypeId" value="'+urlParamObj.monitorTypeId+'" searchCache/>');
											// 	el.append('<input type="hidden" search-data="monitorId" value="'+urlParamObj.monitorId+'" searchCache/>');
											// 	el.append('<input type="hidden" search-data="regionId" value="'+urlParamObj.regionId+'" searchCache/>');
											// 	el.append('<input type="hidden" search-data="assetId" value="'+urlParamObj.assetId+'" searchCache/>');
											// 	el.append('<input type="hidden" search-data="time" value="'+$("#query_time_label").text()+'" searchCache/>');
											// 	urlParamObj.time = $("#query_time_label").text();
											// 	um_ajax_get({
											// 		url : data_base_sel_url,
											// 		paramObj : urlParamObj,
											// 		successCallBack : function (data){
											// 			var searchEl = $('<select class="form-control input-sm" search-data="dbName"></select>');
											// 	  		el.append(searchEl);
											// 			var selBuff = [];
											//             for (var i = 0; i < data.length; i++) {
											//                 selBuff.push({id:data[i].dbName ,text:data[i].dbName});
											//             }
											//             selBuff.insert(0 ,{id:"-1" ,text:"---"});
											//             searchEl.select2({
											//                   data: selBuff,
											//                   width:"100%"
											//             });
											// 		}
											// 	});
											// }},
											{text:"表的名称" ,name:"tabName"},
											{text:"行的格式" ,name:"rowFormat"},
											{text:"行数" ,name:"rowCount"},
											{text:"索引长度" ,name:"indexLength"},
											{text:"表的类型" ,name:"tabType"},
											{text:"当前大小(B)" ,name:"dataLength"},
											{text:"主键自增大小" ,name:"autoIncrement"},
											{text:"表创建时间" ,name:"createTime",render:function(text){
				                                if(text=="null" || text==null){
				                                    return "----";
				                                }
				                                return text;
				                            }},
											{text:"表获取时间" ,name:"updateTime",render:function(text){
				                                if(text=="null" || text==null){
				                                    return "----";
				                                }
				                                return text;
				                            }},
											{text:"获取时间" ,name:"updateDateT"}
			                           ];
			
		    paramObj.dbName = $("#database_sel").val(),
                       
			g_grid.render($("#data_base_list_div") ,{
		        url : data_base_list_url,
		        header : data_base_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        showCount : true
		    });
		},
		thread_info_list : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMySqlThread",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#thread_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		cache_info_list : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMySqlQcache",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        
		        	var data1=calculateSize($("#cache_info_div"),data[0])
		        	
		            $("#cache_info_div").umDataBind("render" ,data1);
		        }
		    });
		},

		count_info_list : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMySqlCounter",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	
		            $("#count_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		page_info_list : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMySqlPagesLock",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	var data1=calculateSize($("#page_info_div"),data[0])
		            $("#page_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		lock_info_list : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMySqlPagesLock",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#lock_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},
		lock_chart : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/mysql/queryMySqlLock",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var legendArray = ['表直接锁定次数' ,'锁等待次数'];
		            var categoryArray = [];
		            var seriesArray = [];
		            var tableLocksWaitedValueArray = [];
		            var tableLocksImmeValueArray = [];
		            for (var i = 0; i < data.length; i++) {
		                categoryArray.push(data[i].enterDate);
		                tableLocksWaitedValueArray.push(data[i].tableLocksWaited);
		                tableLocksImmeValueArray.push(data[i].tableLocksImme);
		            }
		            var seriesObj = new Object();
		            seriesObj.name = '锁等待次数';		           
		            seriesObj.type = "line";
		            seriesObj.data = tableLocksWaitedValueArray;

		            var seriesObj1 = new Object();
		            seriesObj1.name = '表直接锁定次数';
		            seriesObj1.type = "line";
		            seriesObj1.data = tableLocksImmeValueArray;

                    seriesArray.push(seriesObj1);
		            seriesArray.push(seriesObj);
		          

		            plot.lineRender($("#lock_chart") ,{
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray,
		                lineStyle : true,
		                color_array : ['#62cb31' ,'#23b7e5' ,'#f4bc37']
		            });
		        }
		    });
		}
	}
})
function calculateSize(el,data)
{
    el.find("label").each(function(){
      if($(this).attr("id"))
      {
      	    var  name=$(this).attr("id");
      	    if(Math.floor(Number(data[name])/1024/1024)==0)
			{
		        if(Math.floor(Number(data[name])/1024)!=0)
		        {
		          // $("#"+name+"").text($("#"+name+"").text().replace(/[KM]?B/,"KB"));
				   data[name]=(Number(data[name])/1024).toFixed(2)+"KB"
		        }
			}
			else
			{
				// $("#"+name+"").text($("#"+name+"").text().replace(/[KM]?B/,"MB"));
				 data[name]=(Number(data[name])/1024/1024).toFixed(2)+"MB"
			}
      }
    });
	
	return data;
}