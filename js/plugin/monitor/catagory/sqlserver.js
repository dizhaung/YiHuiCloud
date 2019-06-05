define(['/js/plugin/monitor/monitorInfo.js','/js/plugin/plot/plot.js'],function (monitorInfo,plot){
	return {
		base_info_render : function(paramObj){
			um_ajax_get({
		        url : "monitorview/db/sqlserver/querySqlserverMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div2").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
                    $("#base_info_asset_div2").umDataBind("render" ,data.assetinfo);
		        } 
		    });
		},

		instance_sel : function (paramObj){
			var self = this
			paramObj.instStatus = 1;
		    paramObj.monitorTypeNameLanguage = 1;
		    paramObj.edId = paramObj.assetId;
		    um_ajax_get({
		        url : "monitorView/queryEdMonitor",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            um_ajax_get({
				        url : "monitorView/queryInstanceType",
				        paramObj : {monitorId:data.edmonitorstore[1].monitorId},
				        successCallBack : function (data1){
				            var selBuff = [];
				            for (var i = 0; i < data1.length; i++) {
				                selBuff.push({id:data1[i].codevalue ,text:data1[i].codename});
				            }
				            $("#instance_sel").select2({
				                  data: selBuff,
				                  width:"100%"
				            });

				            //[{id:1,text:"一"},{id:2,text:"二"}]
				            self.base_info_render(paramObj)
				            self.dataBase_info_list()
				            self.count_info_list()
				            self.regist_chart()
				            self.high_catch_chart()
				            self.catch_info_render()
				            self.lock_info_list()
				        }
				    });
		        }
		    });
		},

		dataBase_info_list : function() {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			var current_database_url = "monitorview/db/sqlserver/queryMsSqlStatic";
			var current_database_header = [
											{text:"数据库名" ,name:"dbName"},
											{text:"数据库路径" ,name:"dbPath"},
											{text:"日志文件路径" ,name:"logPath"},
											{text:"排序规则" ,name:"collactionname"},
											{text:"获取时间" ,name:"updateDateS"}
										 ];
			g_grid.render($("#database_table") ,{
				url : current_database_url,
				header : current_database_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false
			});
		},

		count_info_list : function() {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			um_ajax_get({
		        url : "monitorview/db/sqlserver/queryMsSqlCounter",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            $("#count_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},

		database_config_list : function(){
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			var database_config_list_url = "monitorview/db/sqlserver/queryMsSqlParameter";

			var database_config_list_header = [
											{text:"数据库名" ,name:"dbName"},
											// {text:"活动事务" ,name:"activeTransactions"},
											// {text:"备份、重建操作吞吐量" ,name:"bkpRstroCount"},
											// {text:"每秒被批量拷贝的行数量" ,name:"bulkCopyRows"},
											// {text:"每秒被批量拷贝的数（KB）" ,name:"bulkCopyCount"},
											{text:"所有数据文件总量（KB）" ,name:"dataFileSize"},
											// {text:"已使用数据空间（KB）" ,name:"dataFileUsed"},
											// {text:"每秒读取日志缓存数量" ,name:"logCacheReads"},
											{text:"日志文件大小（KB）" ,name:"logFile"},
											// {text:"已使用日志空间（KB）" ,name:"logFileUsed"},
											// {text:"日志剩余空间（KB）" ,name:"logFileRemain"},
											// {text:"每秒日志刷新等待数" ,name:"logFlushWaitTime"},
											{text:"每秒日志刷新的数量" ,name:"logFlush"},
											// {text:"日志增长数量" ,name:"logGrowths"},
											// {text:"日志收缩数量" ,name:"logShrinks"},
											{text:"当前使用日志比例（%）" ,name:"perlogused"},
											{text:"获取时间" ,name:"updateDateP"}
										 ];
			g_grid.render($("#database_config_table") ,{
				url : database_config_list_url,
				header : database_config_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true,
				showTip : {
					render : function (rowData){
						g_dialog.rightDialog({
							width : "800px",
							render : function (el_form, el_mask){
								$.ajax({
									type: "GET",
									url: "tpl/monitor_classify/sqlserver/detail_tpl.html",
									success: function(data) {
										el_form.append($(data).find("[id=detail_template_div]").html());
										el_form.umDataBind("render", rowData);
										el_mask.hide();
									}
								});
							}
						});
					}
				}
			});
		},

		regist_chart : function(){
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			um_ajax_get({
		        url : "monitorview/db/sqlserver/queryMsSqlLogin",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var items = data;
		            var legendArray = ['SQLServer注册数','SQLServer注销数'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var seriesInObj = new Object();
		            seriesInObj.name = 'SQLServer注册数';
		            seriesInObj.type = "line";
		            seriesInObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].enterDateLn);
		                seriesInObj.data.push(items[i].logins);
		            }
		            seriesArray.push(seriesInObj);

		            var seriesOutObj = new Object();
		            seriesOutObj.name = 'SQLServer注销数';
		            seriesOutObj.type = "line";
		            seriesOutObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                seriesOutObj.data.push(items[i].logouts);
		            }
		            seriesArray.push(seriesOutObj);

		            plot.lineRender($("#regist_chart") ,{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
		    });
		},

		high_catch_chart : function() {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			um_ajax_get({
		        url : "monitorview/db/sqlserver/queryMsSqlCache",
		        paramObj : paramObj,
		        isLoad:false,
		        successCallBack : function (data){
		            var items = data;
		            var legendArray = ['命中率（%）'];
		            var categoryArray = [];
		            var seriesArray = [];
		            
		            var responseObj = new Object();
		            responseObj.name = '命中率（%）';
		            responseObj.type = "line";
		            responseObj.data = [];
		            for (var i = 0; i < items.length; i++) {
		                categoryArray.push(items[i].updateDateC);
		                responseObj.data.push(items[i].cacheHitRadio);
		            }
		            seriesArray.push(responseObj);

		            plot.lineRender($("#high_catch_chart"),{
		                legend : legendArray,
		                category : categoryArray,
		                series : seriesArray
		            });
		        }
		    });
		},

		catch_info_render : function () {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			um_ajax_get({
		        url : "monitorview/db/sqlserver/queryMsSqlBuffer",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	if (index_monitor_version == "SQLSERVER2012")
		        		$("#catch_info_div_t2").show(),$("#catch_info_div_t1").hide()
		        	else
		        		$("#catch_info_div_t2").hide(),$("#catch_info_div_t1").show()
		            $("#catch_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},

		memory_info_render : function() {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			um_ajax_get({
		        url : "monitorview/db/sqlserver/queryMsSqlMemory",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#memory_info_div").umDataBind("render" ,data[0]);
		        }
		    });
		},

		work_info_list : function() {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			var work_info_list_url = "monitorview/db/sqlserver/queryMsSqlJobInfo";

			var work_info_list_header = [
								{text:"作业名称" ,name:"jobName",width:10},
								{text:"步骤编号" ,name:"stepId",width:10},
								{text:"步骤名称" ,name:"stepName",width:10},
								{text:"运行状态" ,name:"runStatus",width:10},
								{text:"持续时间" ,name:"runDuration",width:10},
								{text:"作业信息" ,name:"jobMessage" ,width:30, tip:true ,render:function (txt){
									return  (txt.length > 20 ? (txt.substr(0,20) + "...") : txt);
								}},
								{text:"运行日期" ,name:"runDate",width:10},
								{text:"更新日期" ,name:"enterDate",width:10}
							 ];
			g_grid.render($("#lock_info_table"),{
				url : work_info_list_url,
				header : work_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false
			});
		},

		lock_info_list : function () {
			var paramObj = {
							   monitorId : $("#instance_sel").val(),
	                           flag : 1 ,
	                           inpuDate:$("#query_time_label").text()
	                       }
			var lock_info_list_url = "monitorview/db/sqlserver/queryMsSqlLock";

			var lock_info_list_header = [
								{text:"数据库对象名" ,name:"instanceName"},
								{text:"线程等待锁的</br>平均等待时间（ms）" ,name:"averageWaitTime"},
								{text:"每秒某种锁的</br>请求数量" ,name:"lockRequest"},
								{text:"每秒不能通过</br>自旋锁获得锁次数" ,name:"lockTimeout"},
								{text:"前一秒钟，锁的</br>总等待时间（ms）" ,name:"lockWaitTimes"},
								{text:"前一秒钟，锁请求</br>导致线程等待次数" ,name:"lockaWait"},
								{text:"导致死锁的</br>锁请求数量" ,name:"numberofDeadlocks"},
								{text:"获取时间" ,name:"updateDateLk"}
							 ];
			g_grid.render($("#lock_info_table"),{
				url : lock_info_list_url,
				header : lock_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		}
	}
})