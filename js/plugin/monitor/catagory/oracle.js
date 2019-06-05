define(['/js/plugin/monitor/monitorInfo.js',
		'/js/plugin/plot/plot.js'] ,function (monitorInfo ,plot){
	return {
		// 基本信息
		base_info_render : function (paramObj){
			um_ajax_get({
		        url : "monitorview/db/oracle/queryOracleMonitorBaseInfo",
		        paramObj : {
		        			  monitorId : $("#instance_sel").val() ,instStatus : 1,
		                      inpuDate:paramObj.time,
		                      assetId:paramObj.assetId
		                   },
		        isLoad : false,
		        successCallBack : function (data){
		            $("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		            if (data.oracleStaticInfo && data.oracleStaticInfo.length > 0)
		            {
		                $("[data-id=version]").text(data.oracleStaticInfo[0].version2);
		                $("[data-id=totalSize]").text(data.oracleStaticInfo[0].totalSize);
		            }
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
				        isLoad : false,
				        successCallBack : function (data1){
				            var selBuff = [];
				            for (var i = 0; i < data1.length; i++) {
				                selBuff.push({id:data1[i].codevalue ,text:data1[i].codename});
				            }
				            
				            $("#instance_sel").select2({
				                  data: selBuff,
				                  width:"100%",
				                  minimumResultsForSearch : -1
				            });

				            self.base_info_render(paramObj)
				            self.instance_info_render()
				            self.table_space_list()
				            self.session_info_list()
				            self.rollback_list()
				            self.sga_info_list()
				            self.counter_info()
							self.buffer_poor_list()
							self.BPHR_chart()
							self.lock_info_list()
							self.total_cost_list()
							self.database_file_list()
				            self.user_access_list()
				            self.process_info_list()
				        }
				    });
		        }
		    });
		},

		instance_info_render : function (){
			um_ajax_get({
		        url : "monitorview/db/oracle/queryOracleStatic",
		        paramObj : {
		        	          monitorId : $("#instance_sel").val() ,flag : 1 ,
		                      inpuDate:$("#query_time_label").text()
		                   },
		        isLoad : false,
		        successCallBack : function (data){
		            $("#instance_div").umDataBind("reset");
		            var obj = $.extend({} ,data.oracleStaticStore ,data.oracleInstanceStore)
		            $("#instance_div").umDataBind("render" ,obj);
		            //$("#component_div").umDataBind("render" ,data.oracleInstanceStore);
		        }
		    });
		},

		table_space_list : function (){
			var table_space_list_url = "monitorview/db/oracle/queryOracleTableSpace";

			var table_space_list_header = [
			                              {text:'',name:"t",width:2,hideSearch:"hide",width:"auto"},
			                              {text:"表空间名称" ,width:"auto",name:"tablespaceName" ,align:"left",bold:"bold",width:"auto"},
			                              {text:"分配总量" ,width:"auto",name:"freePercent" ,width:"auto",render:function (txt,rowData){
			                              		return '<div class="cloud_div" style="height:12px;" title=""><span class="__percent db w-all h-all prel" title="表空间可用大小：'+rowData.free+'M" style="width:100%;background-image: -moz-linear-gradient( 90deg, rgb(123,212,82) 0%, rgb(145,225,102) 100%);background-image: -webkit-linear-gradient( 90deg, rgb(123,212,82) 0%, rgb(145,225,102) 100%);background-image: -ms-linear-gradient( 90deg, rgb(123,212,82) 0%, rgb(145,225,102) 100%)"><span class="db h-all pabs" title="表空间已用大小：'+(rowData.total-rowData.free).toFixed(2)+'M" style="left:0;width:'+(100-txt)+'%;background-image: -moz-linear-gradient( 90deg, #ff4d4f 0%, #f5222d 100%);background-image: -webkit-linear-gradient( 90deg, #ff4d4f 0%, #f5222d 100%);background-image: -ms-linear-gradient( 90deg, #ff4d4f 0%, #f5222d 100%)"></span></span></div>'
			                              }},
			                              {text:"表空间</br>分配大小(M)" ,width:"auto",name:"total",sortBy:"int",width:"auto"},
			                              {text:"表空间</br>分配块数" ,width:"auto",name:"totalBlock",sortBy:"int",width:"auto"},
			                              {text:"表空间</br>可用大小(M)" ,width:"auto",name:"free",sortBy:"int",width:"auto"},
			                              {text:"表空间</br>可用块数" ,width:"auto",name:"freeBlock",sortBy:"int",width:"auto"},
			                              {text:"表空间使用率",width:"auto",name:"freePercent",render:function (value){
			                              		return (100-Number(value)).toFixed(2) + '%';
			                              }},
			                              {text:"是否自增",width:"auto",name:"autoextensible",render:function (value){
			                              		if(value){
			                              			if("NO" == value.toUpperCase()){
			                              				return '否'
			                              			}else if("YES" == value.toUpperCase()){
			                              				return '是'
			                              			}
			                              		}else {
			                              			
			                              		}
			                              }},
			                              {text:"获取时间" ,width:"auto",name:"updateDate",sortBy:"int"},
			                           ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#table_space_div") ,{
		        url : table_space_list_url,
		        header : table_space_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false,
		        paginator : false,
		        showCount : true,
		        dbThLine : true,
		        tableWidth : "1500px",		    
		    });
		},
		table_space_chart : function (){
			var table_space_chart_url = "monitorview/db/oracle/queryOracleTableSpaceHighChart";
			$("#table_space_chart").html("");
		    $("#table_space_chart").height(50);
		    var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
		    um_ajax_get({
		        url : table_space_chart_url,
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            if (!data[0])
		            {
		                return false;
		            }
		            var length = data.length;
		            if (length >= 15)
		            {
		                length = 15;
		            }
		            $("#table_space_chart").height(35 * length);
		            var jsonObj = JsonTools.decode(data[0].jsonStr);
		            var datas = jsonObj.datas;
		            var legendArray = [];
		            var seriesArray = [];
		            for (var i = 0; i < datas.length; i++) {
		                legendArray.push(datas[i].name);
		                seriesArray.push({
		                    name : datas[i].name,
		                    type : "bar",
		                    stack: '表空间',
		                    data: datas[i].items.reverse()
		                });
		            }
		            plot.barRender($("#table_space_chart") ,{
		                legend : legendArray,
		                category : jsonObj.lableArr.reverse(),
		                series : seriesArray,
		                rotate : -30,
		                isVercital : true,
		                grid: {
		                    left: '6%',
		                    right: '4%',
		                    bottom: '15%',
		                    containLabel: true
		                }
		            });
		            $("#table_space_chart_xAxis").show();
		            $("#table_space_chart_yAxis").show();
		        }
		    });
		},
		session_info_list : function (){
			var current_session_url = "monitorview/db/oracle/queryOracleCurrentSession";
			var current_session_header = [
											{text:"会话标识" ,name:"sid"},
											{text:"用户名" ,name:"username"},
											{text:"当前执行命令" ,name:"command"},
											{text:"等待锁地址" ,name:"lockwait", render:function(text){
												if(text==null){
													return '----';
												}
											}},
											{text:"模式用户名" ,name:"schemaname"},
											{text:"会话状态" ,name:"status"},
											{text:"操作系统客户机名" ,name:"machine"},
											{text:"内存使用率" ,name:"memUsedRation", render:function(text){
												if(text!=null){
													return (text * 100).toFixed(2) + "%";
												}
											}},
											{text:"获取时间" ,name:"updateDate"}
										 ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
			g_grid.render($("#session_info_table") ,{
				url : current_session_url,
				header : current_session_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},
		wait_session_list : function (){
			var wait_session_url = "monitorview/db/oracle/queryOracleWaitSession";
			var wait_session_header = [
										{text:"会话标识" ,name:"sid"},
										{text:"会话等待资源(K)" ,name:"event"},
										//{text:"等待时间(ms)" ,name:"waitTime"},
										{text:"等待秒数(s)" ,name:"secondsInWait",sortBy:"int"},
										{text:"等待状态" ,name:"state"},
										{text:"等待客户机名称" ,name:"machine"},
										{text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						   monitorId : $("#instance_sel").val(),
                           flag : 1 ,
                           inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#session_info_table") ,{
				url : wait_session_url,
				header : wait_session_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		rollback_list : function (){
			var rollback_list_url = "monitorview/db/oracle/queryOracleRoll";
			var rollback_list_header = [
										  {text:"段名" ,name:"segName"},
									      {text:"表空间名" ,name:"tablespaceName"},
									      {text:"状态" ,name:"status"},
									      {text:"当前大小" ,name:"curSize"},
									      {text:"初始长度" ,name:"initLength"},
									      {text:"下一个长度" ,name:"nextLength"},
									      {text:"最小长度" ,name:"minLength"},
									      {text:"最大长度" ,name:"maxLength"},
									      {text:"命中率" ,name:"hitRate", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"HWM大小" ,name:"hwmSize"},
									      {text:"收缩" ,name:"shrinks"},
									      {text:"WRAPS" ,name:"wraps"},
									      {text:"扩展" ,name:"extendsInfo"},
									      {text:"获取时间" ,name:"enterDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#rollback_table") ,{
				url : rollback_list_url,
				header : rollback_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		memory_list : function (){
			var rollback_list_url = "monitorview/db/oracle/queryOracleBufferBlock";
			var rollback_list_header = [
										  {text:"物理读取块数" ,name:"physicalReads"},
									      {text:"物理写入块数" ,name:"physicalWrites"},
									      {text:"内存读取块数" ,name:"cacheReads"},
									      {text:"内存写入块数" ,name:"cacheWrites"},
									      {text:"内存扫描块数" ,name:"cacheScans"},
									      {text:"每秒物理</br>读取块数" ,name:"physicalReadsPerSec"},
									      {text:"每秒物理</br>写入块数" ,name:"physicalWritesPerSec"},
									      {text:"每秒内存</br>读入块数" ,name:"cacheReadsPerSec"},
									      {text:"每秒内存</br>写入块数" ,name:"cacheWritesPerSec"},
									      {text:"每秒内存</br>扫描次数" ,name:"cacheScansPerSec"},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#rollback_table") ,{
				url : rollback_list_url,
				header : rollback_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		sga_info_list : function (){
			var sga_info_list_url = "monitorview/db/oracle/queryOracleSGA";
			var sga_info_list_header = [
										  {text:"sga缓冲区名称" ,name:"name"},
									      {text:"缓冲区大小(bytes)" ,name:"buffSize"},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sga_pga_table") ,{
				url : sga_info_list_url,
				header : sga_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		sga_variable_list : function (){
			var sga_variable_list_url = "monitorview/db/oracle/queryOracleSGAVariable";
			var sga_variable_list_header = [
										  {text:"池名称" ,name:"name"},
									      {text:"总量(bytes)" ,name:"total"},
									      {text:"已使用量(bytes)" ,name:"used"},
									      {text:"剩余量(bytes)" ,name:"free"},
									      {text:"使用率" ,name:"pctused", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sga_pga_table") ,{
				url : sga_variable_list_url,
				header : sga_variable_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		redo_log_list : function (){
			var redo_log_list_url = "monitorview/db/oracle/queryOracleRedoRadio";
			var redo_log_list_header = [
										  {text:"名称" ,name:"subName"},
									      {text:"willing-to-wait类型</br>请求次数" ,name:"gets"},
									      {text:"willing-to-wait类型</br>请求失败次数" ,name:"misses"},
									      {text:"immediate类型</br>请求次数" ,name:"immediateGets"},
									      {text:"immediate类型</br>请求失败次数" ,name:"immediateMisses"},
									      {text:"willing-to-wait</br>请求类型的命中率" ,name:"willingToWaitRatio", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"immediate</br>请求类型的命中率" ,name:"immediateRatio", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"获取时间" ,name:"enterDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sga_pga_table") ,{
				url : redo_log_list_url,
				header : redo_log_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		pga_config_list : function (){
			var pga_config_list_url = "monitorview/db/oracle/queryOraclePga";
			var pga_config_list_header = [
										  {text:"pga参数" ,name:"aggPgaTargetParam"},
									      {text:"pga可自动</br>分配大小" ,name:"aggPgaAutoTarget"},
									      {text:"自动模式下</br>最大内存" ,name:"globalMemBound"},
									      {text:"当前使用的</br>pga大小" ,name:"tolPgaInuse"},
									      {text:"当前分配的</br>pga大小" ,name:"tolPgaAllocated"},
									      {text:"当前剩余的</br>pga大小" ,name:"allocatedRemain"},
									      {text:"可释放的</br>pga大小" ,name:"tolPgaFree"},
									      {text:"使用率" ,name:"usageRatio", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"总体使用率" ,name:"totalUsageRaito", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"命中率" ,name:"hitPercent", render : function(text){
									      	if(text !=null)
									      		return text+"%";
									      }},
									      {text:"进程数" ,name:"proCount"},
									      {text:"获取时间" ,name:"enterDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sga_pga_table") ,{
				url : pga_config_list_url,
				header : pga_config_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		counter_info : function(){
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
			um_ajax_get({
		        url : "monitorview/db/oracle/queryOracleCounters",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#counter_div").umDataBind("render" ,data[0]);
		        }
		    });
		},

		cpu_use_info : function(){
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
			um_ajax_get({
		        url : "monitorview/db/oracle/queryOraclePerformance",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            $("#cpu_use_div").umDataBind("render" ,data[0]);
		        }
		    });
		},

		buffer_poor_list : function(){
			var buffer_poor_list_url = "monitorview/db/oracle/queryOracleBufferpool";
			var buffer_poor_list_header = [
										  {text:"缓冲区标识" ,name:"monitorId"},
									      {text:"缓冲池名称" ,name:"name"},
									      {text:"缓冲池最大</br>设置尺寸(B)" ,name:"setMsize"},
									      {text:"替换列表中</br>缓冲区数(B)" ,name:"cnumRepl"},
									      {text:"写入列表中</br>缓冲区数(B)" ,name:"cnumWrite"},
									      {text:"设置获得</br>缓冲区数(B)" ,name:"bufGot"},
									      {text:"设置写入</br>缓冲区数(B)" ,name:"sumWrite"},
									      {text:"设置扫描</br>缓冲区数(B)" ,name:"sumScan"},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#buffer_poor_table") ,{
				url : buffer_poor_list_url,
				header : buffer_poor_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		BPHR_chart : function(){
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
			um_ajax_get({
				url : "monitorview/db/oracle/queryOracleRadio",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					$("#BPHR_chart").html("");
					if (!data[0])
					{
						return false;
					}
					var jsonObj = JsonTools.decode(data[0].jsonString);
					var datas = jsonObj.datas;
					var legendArray = [];
					var seriesArray = [];
					var categoryArray = [];

					for (var i = 0; i < datas.length; i++) {
						var seriesObj = new Object();
						legendArray.push(datas[i].lineName+"（%）");
						seriesObj.name = datas[i].lineName+"（%）";
						seriesObj.type = "line";
						seriesObj.data = [];

						for (var j = 0; j < datas[i].items.length; j++)
						{
							seriesObj.data.push(datas[i].items[j].value);
						}
						seriesArray.push(seriesObj);
					}

					for (var i = 0; i < datas[0].items.length; i++) {
						categoryArray.push(datas[0].items[i].lable);
					}

					plot.lineRender($("#BPHR_chart") ,{
						legend : legendArray,
						category : categoryArray,
						series : seriesArray,
						lineStyle : true,
					    color_array : ['#62cb31' ,'#23b7e5' ,'#f4bc37']
					});
				}
			});
		},

		lock_info_list : function(){
			var lock_info_list_url = "monitorview/db/oracle/queryOracleRawLock";
			var lock_info_list_header = [
										  {text:"持有锁的</br>客户机名称" ,name:"machine"},
									      {text:"持有锁的程序名称" ,name:"program"},
									      {text:"锁的类型" ,name:"type"},
									      {text:"锁的持有模式" ,name:"lmode"},
									      {text:"锁的请求模式" ,name:"request"},
									      {text:"锁的持续时间" ,name:"ctime"},
									      {text:"被锁对象ID" ,name:"obid"},
									      {text:"被锁对象" ,name:"obname"},
									      {text:"被锁对象类型" ,name:"obtype"},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#lock_info_table") ,{
				url : lock_info_list_url,
				header : lock_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		block_lock_info_list : function(){
			var block_lock_info_list_url = "monitorview/db/oracle/queryOracleLock";
			var block_lock_info_list_header = [
										  {text:"持有锁的</br>客户机名称" ,name:"machine"},
									      {text:"持有锁的程序名称" ,name:"program"},
									      {text:"锁的类型" ,name:"type"},
									      {text:"锁的持有模式" ,name:"lmode"},
									      {text:"锁的请求模式" ,name:"request"},
									      {text:"锁的持续时间" ,name:"ctime"},
									      {text:"被锁对象ID" ,name:"obid"},
									      {text:"被锁对象" ,name:"obname"},
									      {text:"被锁对象类型" ,name:"obtype"},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#lock_info_table") ,{
				url : block_lock_info_list_url,
				header : block_lock_info_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		total_cost_list : function(){
			var self = this
			var total_cost_list_url = "monitorview/db/oracle/queryOracleSQLTotal";
			var total_cost_list_header = [
										  {text:"次序" ,width:"auto",name:"elapsedRank"},
									      {text:"子游标</br>数量" ,width:"auto",name:"childNumber",sortBy:"int"},
									      {text:"执行次数" ,width:"auto",name:"executions",sortBy:"int"},
									      {text:"SQL文本" ,width:"auto",name:"sqlText",tip:true,render(txt){
									      		if(txt.length > 9)
									      			 return txt.substr(0, 10)+"..."; 
									      		else
									      			return txt;
									      }},
									      {text:"执行时间(s)" ,name:"elapsedTime",sortBy:"int",width:"auto"},
									      {text:"CPU时间(s)" ,name:"cpuTime",sortBy:"int",width:"auto"},
									      {text:"查询成本" ,name:"optimizerCost",sortBy:"int",width:"auto"},
									      {text:"完成的排序数" ,name:"sorts",sortBy:"int",width:"auto"},
									      {text:"模块名称" ,name:"module",width:"auto"},
									      {text:"子游标被</br>锁住的数量" ,name:"lockedTotal",width:"auto"},
									      {text:"物理读（字节数）" ,name:"physicalReadBytes",width:"auto"},
									      {text:"物理读请求" ,name:"physicalReadRequests",width:"auto"},
									      {text:"物理写（字节数）" ,name:"physicalWriteBytes",width:"auto"},
									      {text:"物理写请求" ,name:"physicalWriteRequests",width:"auto"},
									      {text:"返回行数" ,name:"rowsProcessed",width:"auto"},
									      {text:"磁盘读" ,name:"diskReads",width:"auto"},
									      {text:"直接路径写" ,name:"directWrites",width:"auto"},
									      {text:"解析的计划名称" ,name:"parsingSchemaName",width:"auto"},
									      {text:"最近执行时间" ,name:"lastActiveTime",width:"auto",width:15},
									      {text:"获取时间" ,name:"updateDate" ,width:15}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sql_info_table") ,{
				url : total_cost_list_url,
				header : total_cost_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true,	
				tableWidth : "2100px",
				dbClick:self.sql_detail,
				dbIndex:3
			});
		},

		cpu_cost_list : function(){
			var self = this
			var cpu_cost_list_url = "monitorview/db/oracle/queryOracleSQLCpu";
			var cpu_cost_list_header = [
										  {text:"次序" ,name:"elapsedRank" ,width:"auto"},
									      {text:"子游标数量" ,name:"childNumber",sortBy:"int" ,width:"auto"},
									      {text:"执行次数" ,name:"executions",sortBy:"int" ,width:"auto"},
									      {text:"SQL文本" ,name:"sqlText",tip:true,width:"auto",render(txt){
									      		if(txt.length > 9)
									      		{
									      			 return txt.substr(0, 10)+"..."; 
									      		}
									      		else
									      		{
									      			return txt;
									      		}
									      }},
									      {text:"执行时间(s)" ,name:"elapsedTime",sortBy:"int",width:"auto"},
									      {text:"CPU时间(s)" ,name:"cpuTime",sortBy:"int",width:"auto"},
									      {text:"查询成本" ,name:"optimizerCost",width:"auto"},
									      {text:"完成的排序数" ,name:"sorts",width:"auto"},
									      {text:"模块名称" ,name:"module",width:"auto"},
									      {text:"子游标被</br>锁住的数量" ,name:"lockedTotal",width:"auto"},
									      {text:"物理读（字节数）" ,name:"physicalReadBytes",width:"auto"},
									      {text:"物理读请求" ,name:"physicalReadRequests",width:"auto"},
									      {text:"物理写（字节数）" ,name:"physicalWriteBytes",width:"auto"},
									      {text:"物理写请求" ,name:"physicalWriteRequests",width:"auto"},
									      {text:"返回行数" ,name:"rowsProcessed",sortBy:"int",width:"auto"},
									      {text:"磁盘读" ,name:"diskReads",sortBy:"int",width:"auto"},
									      {text:"直接路径写" ,name:"directWrites",width:"auto"},
									      {text:"解析的计划名称" ,name:"parsingSchemaName",width:"auto"},
									      {text:"最近执行时间" ,name:"lastActiveTime",width:15},
									      {text:"获取时间" ,name:"updateDate",width:"auto",width:15}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sql_info_table") ,{
				url : cpu_cost_list_url,
				header : cpu_cost_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true,	
				tableWidth : "2100px",
				dbClick:self.sql_detail,
				dbIndex:3
			});
		},

		read_cost_list : function(){
			var self = this
			var read_cost_list_url = "monitorview/db/oracle/queryOracleSQLDiskRead";
			var read_cost_list_header = [
										  {text:"次序" ,name:"elapsedRank" ,width:"auto"},
									      {text:"子游标数量" ,name:"childNumber" ,width:"auto"},
									      {text:"执行次数" ,name:"executions",sortBy:"int" ,width:"auto"},
									      {text:"SQL文本" ,name:"sqlText",width:"auto",tip:true,render(txt){
									      		if(txt.length > 9)
									      		{
									      			 return txt.substr(0, 10)+"..."; 
									      		}
									      		else
									      		{
									      			return txt;
									      		}
									      }},
									      {text:"执行时间(s)" ,name:"elapsedTime",sortBy:"int",width:"auto"},
									      {text:"CPU时间(s)" ,name:"cpuTime",sortBy:"int",width:"auto"},
									      {text:"查询成本" ,name:"optimizerCost",width:"auto"},
									      {text:"完成的排序数" ,name:"sorts",sortBy:"int",width:"auto"},
									      {text:"模块名称" ,name:"module",width:"auto"},
									      {text:"子游标被</br>锁住的数量" ,name:"lockedTotal",sortBy:"int",width:"auto"},
									      {text:"物理读（字节数）" ,name:"physicalReadBytes",sortBy:"int",width:"auto"},
									      {text:"物理读请求" ,name:"physicalReadRequests",sortBy:"int",width:"auto"},
									      {text:"物理写（字节数）" ,name:"physicalWriteBytes",sortBy:"int",width:"auto"},
									      {text:"物理写请求" ,name:"physicalWriteRequests",sortBy:"int",width:"auto"},
									      {text:"返回行数" ,name:"rowsProcessed",sortBy:"int",width:"auto"},
									      {text:"磁盘读" ,name:"diskReads",sortBy:"int",width:"auto"},
									      {text:"直接路径写" ,name:"directWrites",sortBy:"int",width:"auto"},
									      {text:"解析的计划名称" ,name:"parsingSchemaName",width:"auto"},
									      {text:"最近执行时间" ,name:"lastActiveTime",width:15},
									      {text:"获取时间" ,name:"updateDate" ,width:"auto",width:15}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#sql_info_table") ,{
				url : read_cost_list_url,
				header : read_cost_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true,	
				tableWidth : "1700px",
				dbClick:self.sql_detail,
				dbIndex:3
			});
		},

		sql_detail : function(rowData){
			var div = "<div class='template' id='detail_template' style='max-height:300px;'>"
			        +"<div class='panel-body no-tb-padder'>"
					+"<form class='bs-example form-horizontal xs-form'>"
					+"<div class='form-group'>"
					+"<label class='col-lg-12 control-label tl' data-id='sqlText'></label>"
					+"</div></form></div></div>";
			g_dialog.dialog(div,{
				width : "450px",
				init : init,
				title : "SQL文本",
				isDetail:true
			});

			function init(el)
			{
				el.umDataBind("render",rowData);
			}
		},

		database_file_list : function(){
			var database_file_list_url = "monitorview/db/oracle/queryOracleDataFile";
			var database_file_list_header = [
										  {text:"数据库文件" ,name:"fileName" ,width:"auto"},
									      {text:"文件状态" ,name:"status" ,width:"auto"},
									      {text:"当前尺寸(MB)" ,name:"bytes" ,width:"auto"},
									      {text:"所属文件空间" ,name:"tablespaceName" ,width:"auto"},
									      {text:"i/o所用时间(ms)" ,name:"avgiotime" ,width:"auto"},
									      {text:"读次数" ,name:"phyrds" ,width:"auto"},
									      {text:"读块数" ,name:"phyblkpd" ,width:"auto"},
									      {text:"每秒读次数" ,name:"phyrdsPerSec" ,width:"auto"},
									      {text:"每秒读块数" ,name:"phyblkrdPerSec" ,width:"auto"},
									      {text:"读时间(ms)" ,name:"readtime",width:"auto",render : function(text){
									      	return text * 10;
									      }},
									      {text:"写次数" ,name:"phywrts" ,width:"auto"},
									      {text:"写块数" ,name:"phyblkwrt" ,width:"auto"},
									      {text:"每秒写次数" ,name:"phywrtsPerSec" ,width:"auto"},
									      {text:"每秒写块数" ,name:"phyblkwrtPerSec" ,width:"auto"},
									      {text:"写时间(ms)" ,width:"auto",name:"writetime",render : function(text){
									      	return text * 10;
									      }},
									      {text:"获取时间" ,name:"updateDate" ,width:15}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#file_info_table") ,{
				url : database_file_list_url,
				header : database_file_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true,
				tableWidth : "2000px"
			});
		},

		reform_log_list : function(){
			var reform_log_list_url = "monitorview/db/oracle/queryOracleLogFile";
			var reform_log_list_header = [
										  {text:"重做日志组标识" ,name:"groupId"},
									      {text:"重做日志成员名" ,name:"member"},
									      {text:"日志成员状态" ,name:"logstatus"},
									      {text:"日志大小(MB)" ,name:"bytes"},
									      {text:"重做日志组成员数" ,name:"members"},
									      {text:"归档状态" ,name:"archived"},
									      {text:"Thread" ,name:"thread"},
									      {text:"Sequence" ,name:"sequence"},
									      {text:"启用时间" ,name:"firstTime"},
									      {text:"日志切换频率(分钟)" ,name:"frequency", render : function(text){
									      	if(text==-1){
									      		return "暂无";
									      	}
									      	return text;
									      }},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#file_info_table") ,{
				url : reform_log_list_url,
				header : reform_log_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		invalid_list : function(){
			var invalid_list_url = "monitorview/db/oracle/queryOracleInvalid";
			var invalid_list_header = [
										  {text:"宿主" ,name:"owner"},
									      {text:"对象名称" ,name:"objectName"},
									      {text:"对象类型" ,name:"objectType"},
									      {text:"创建时间" ,name:"createTime"},
									      {text:"获取时间" ,name:"enterDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#file_info_table") ,{
				url : invalid_list_url,
				header : invalid_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		user_access_list : function(){
			var user_access_list_url = "monitorview/db/oracle/queryOracleAccess";
			var user_access_list_header = [
										  {text:"登录用户名" ,name:"username"},
									      {text:"用户主机名" ,name:"machine"},
									      {text:"用户当前执行sql" ,name:"sqlText", render:function(text){
									      	if(text==null){
									      		return "----";
									      	}
									      	return text;
									      }},
									      {text:"登录时间" ,name:"logonTime"},
									      {text:"主机系统用户" ,name:"osuser"},
									      {text:"客户端连接程序" ,name:"program"},
									      {text:"会话当前状态" ,name:"status"},
									      {text:"获取时间" ,name:"updateDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#user_info_table") ,{
				url : user_access_list_url,
				header : user_access_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		user_work_list : function(){
			var user_work_list_url = "monitorview/db/oracle/queryOracleDBAJobs";
			var user_work_list_header = [
										  {text:"作业名称" ,name:"what", width : 30},
									      {text:"作业编号" ,name:"jobId", width : 10},
									      {text:"最后执行时间" ,name:"lastDate", width : 20},
									      {text:"中断状态" ,name:"broken", width : 10},
									      {text:"连续失败次数" ,name:"failures", width : 10},
									      {text:"获取时间" ,name:"updateDate", width : 20}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#user_info_table") ,{
				url : user_work_list_url,
				header : user_work_list_header,
				paramObj : paramObj,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				allowCheckBox : false,
				dbThLine : true
			});
		},

		process_info_list : function(){
			var process_info_list_url = "monitorview/db/oracle/queryOracleProcess";
			var process_info_list_header = [
										  {text:"名称" ,name:"pname"},
									      {text:"PID" ,name:"pid"},
									      {text:"SPID" ,name:"spid"},
									      {text:"固件所占内存" ,name:"pgaAllocMem"},
									      {text:"已使用内存" ,name:"pgaUsedMem"},
									      {text:"剩余内存" ,name:"pgaFreeableMem"},
									      {text:"内存最大值" ,name:"pgaMaxMem"},
									      {text:"获取时间" ,name:"enterDate"}
									 ];
			var paramObj = {
						  	 monitorId : $("#instance_sel").val(),
							 flag : 1 ,
							 inpuDate:$("#query_time_label").text()
                       }
            g_grid.render($("#process_info_table") ,{
				url : process_info_list_url,
				header : process_info_list_header,
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