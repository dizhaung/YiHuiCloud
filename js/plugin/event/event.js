/** 
	插件名称 : event
	功能描述 : 封装事件信息的相关操作
	参数     : 
				
	示例     :  
*/

define(['/js/plugin/inputdrop/inputdrop.js' ,'/js/plugin/tab/tab.js' ,'/js/plugin/plot/plot.js','/js/lib/charts/echarts.min.js'] ,function(inputdrop ,tab ,plot,echarts){

	var currentStatusMap = new HashMap();
	currentStatusMap.put("1", "正常");
	currentStatusMap.put("0", "异常");
	currentStatusMap.put("正常", "正常");
	currentStatusMap.put("异常", "异常");
	var faultLevelMap = new HashMap();
	faultLevelMap.put("0", "很高");
	faultLevelMap.put("1", "高");
	faultLevelMap.put("2", "中");
	faultLevelMap.put("3", "低");
	faultLevelMap.put("4", "很低");
	faultLevelMap.put("很高", "很高");
	faultLevelMap.put("高", "高");
	faultLevelMap.put("中", "中");
	faultLevelMap.put("低", "低");
	faultLevelMap.put("很低", "很低");
	var faultStatusMap = new HashMap();
	faultStatusMap.put("1", "未处理");
	faultStatusMap.put("2", "忽略");
	faultStatusMap.put("3", "处理中");
	faultStatusMap.put("4", "已处理");
	faultStatusMap.put("未处理", "未处理");
	faultStatusMap.put("忽略", "忽略");
	faultStatusMap.put("已处理", "已处理");
	faultStatusMap.put("处理中", "处理中");

	var current_header = [];

	return {
		/** 
			函数名 : ignore
			参数   : opt{
							gridEl
							attr
							ignore_url
							cb
						}
		*/
		ignore: function(opt) {
			var gridEl = opt.gridEl;

			var rowData = g_grid.getData(gridEl, {
				chk: true
			});
			if (rowData.length == 0) {
				g_dialog.operateAlert(gridEl, "请选择要忽略的事件。", "error");
				return false;
			}

			if(opt.attr == "faultNO" || opt.attr == "performanceNo")
			{
				for (var i = 0; i < rowData.length; i++) {
					var status;
					if(opt.attr == "faultNO")
					{
						status = rowData[i].faultStatus;
					}
					else if(opt.attr == "performanceNo")
					{
						status = rowData[i].perfStatus;
					}
					if(status == "3")
					{
						g_dialog.operateAlert(gridEl ,"处理中的事件不可被忽略。" ,"error");
						return false;
					}
				}
			}

			var id = "ignore_template";
			if (opt.ignoreType && opt.ignoreType == "sync") 
			{
				id = "ignore_sync_template";
			}
			$.ajax({
				type: "GET",
				url: "js/plugin/event/event.html",
				success: function(data) {
					g_dialog.dialog($(data).find("[id="+id+"]"), {
						width: "450px",
						saveclick: save_click,
						title:"忽略"
					});
				}
			});

			function save_click(el, saveObj) {
				saveObj.eventId =
					g_grid.getIdArray(gridEl, {
						chk: true,
						attr: opt.attr
					}).join(",");
				if(opt.key)
				{
					key = opt.key;
					saveObj[key] = saveObj.eventId;
				}
				if (opt.ignoreType && opt.ignoreType == "sync") 
				{
					if (el.find("[name=synchronization]").is(":checked"))
					{
						saveObj.synchronization = 1;
					}
					else
					{
						saveObj.synchronization = 0;
					}
				}
				um_ajax_post({
					url: opt.ignore_url,
					paramObj: saveObj,
					maskObj: "body",
					successCallBack: function(data) {
						g_dialog.hide(el);
						g_dialog.operateAlert(gridEl, "操作成功");
						opt.cb && opt.cb();
					}
				});
			}
		},
		/** 
			函数名 : faultEventIgnore
			参数   : opt{
							gridEl
							attr
							ignore_url
							cb
						}
		*/
		faultEventIgnore : function (opt){
			!opt.attr && (opt.attr = "faultNO");
			opt.ignore_url = "faultAlarmEvent/doIgnore";
			this.ignore(opt);
		},
		/** 
			函数名 : performEventIgnore
			参数   : opt{
							gridEl
							attr
							ignore_url
							cb
						}
		*/
		performEventIgnore : function (opt){
			!opt.attr && (opt.attr = "performanceNo");
			opt.ignore_url = "performanceEvent/doPerformanceEventIgnore";
			this.ignore(opt);
		},
		/** 
			函数名 : deployEventIgnore
			参数   : opt{
							gridEl
							attr
							ignore_url
							cb
						}
		*/
		deployEventIgnore : function (opt){
			!opt.attr && (opt.attr = "deploy_NO");
			opt.ignore_url = "deployEvent/doIgnore";
			this.ignore(opt);
		},
		/** 
			函数名 : ignoreAll
			参数   : opt{
							gridEl
							lgnore_all_url
							cb
						}
		*/
		ignoreAll: function(opt) {
			var gridEl = opt.gridEl;
			$.ajax({
				type: "GET",
				url: "js/plugin/event/event.html",
				success: function(data) {
					g_dialog.dialog($(data).find("[id=ignore_all_template]"), {
						width: "450px",
						title: "忽略全部",
						saveclick: save_click
					});
				}
			});

			function save_click(el ,saveObj) {
				saveObj.alarmStore = gridEl.children().data("queryObj");
				if (opt.queryObjStr) 
				{
					saveObj.alarmStore = opt.queryObjStr;
				}
				um_ajax_post({
					url: opt.lgnore_all_url,
					paramObj: saveObj,
					maskObj: el,
					successCallBack: function(data) {
						opt.cb && opt.cb();
						g_dialog.hide(el);
						g_dialog.operateAlert(null, "操作成功");
					}
				});
			}
		},
		/** 
			函数名 : createWorkOrder
			参数   : opt{
							gridEl
							descKey    faultModule  perfModule   depl_MODULE  faultModule
							eventIdKey
							eventTypeKey
						}
		*/
		createWorkOrder : function (opt){
			var gridEl = opt.gridEl;
			var dataArray = g_grid.getData(gridEl ,{chk:true});
			console.info("dataArray:  ",dataArray);
			if (dataArray.length == 0)
			{
				g_dialog.operateAlert(gridEl ,index_select_one_at_least_msg ,"error");
				return false;
			}
			if(opt.eventTypeVal == "2" || opt.eventTypeVal == "3" || opt.eventTypeVal == "1" || opt.eventTypeVal == "13" || opt.eventTypeVal == "101" || opt.eventTypeVal == "102")
			{
				for (var i = 0; i < dataArray.length; i++) {
					var status;
					if(opt.eventTypeVal == "2")
					{
						status = dataArray[i].faultStatus;
						console.info("status",status);
					}
					else if(opt.eventTypeVal == "3")
					{
						status = dataArray[i].perfStatus;
					}
					else if(opt.eventTypeVal == "1"){
						status = dataArray[i].stateId;
					}else if(opt.eventTypeVal == "13"){
						status = dataArray[i].eventStatusBak;
					}else if(opt.eventTypeVal == "16"){
						status = dataArray[i].faultStatus;
					}else if(opt.eventTypeVal == "17"){
						status = dataArray[i].perfStatus;
					}

					if(status != "1")
					{
						g_dialog.operateAlert(gridEl ,"只有未处理事件可生成工单。" ,"error");
						return false;
					}
				}
			}	
            
            um_ajax_get({
				url : "querySessionUser",
				isLoad : false,
				successCallBack : function(data){
					if(data.systemOption){
							var itsmEnable = data.systemOption['itsm_enable'];
							if(itsmEnable=="1")
							{
								var syncList = [];
								for(var i = 0; i < dataArray.length; i++){
									var temp = dataArray[i];
									var obj = {
										eventType : opt.eventTypeVal,
										eventId : temp[opt.eventIdKey],
										title : temp[opt.eventNameKey],
										message : temp[opt.descKey]
									}
									syncList.push(obj);
								}
								g_dialog.operateConfirm("确定同步ITIL工单？",{
									saveclick : function (){
										um_ajax_post({
											url : 'workflow/syncWorkOrder',
											paramObj : {syncAlarmEvent : syncList},
											successCallBack : function (data){
												g_dialog.operateAlert();

												opt.cbf && opt.cbf();
											}
										});
									}
								});
							}
							else
							{
								var tmp = [];
								for (var i = 0; i < dataArray.length; i++) {
								   tmp.push(dataArray[i][opt.eventIdKey]);
								}
							    window.location.href = "#/oper_workorder/workorder_handle/workorder_detail?id=socsjczlc&eventStr="+tmp.join(",")+"&eventType="+opt.eventTypeVal;
							}
					}
					else
					{
						var tmp = [];
						for (var i = 0; i < dataArray.length; i++) {
						   tmp.push(dataArray[i][opt.eventIdKey]);
						}
					    window.location.href = "#/oper_workorder/workorder_handle/workorder_detail?id=socsjczlc&eventStr="+tmp.join(",")+"&eventType="+opt.eventTypeVal;
					}
				}
			});
			

			// var tmp = [];
			// for (var i = 0; i < dataArray.length; i++) {
			// tmp.push(dataArray[i][opt.eventIdKey]);
			// }
			// window.location.href = "#/oper_workorder/workorder_handle/workorder_detail?id=socsjczlc&eventStr="+tmp.join(",")+"&eventType="+opt.eventTypeVal;
		},
		/** 
			函数名 : faultEventDetail
			参数   : opt{
						}
		*/
		faultEventDetail : function (opt,view){
			var self = this
			var list_detail_header = [
									  {text: '',name: "t" ,width : 3},
								      {text: '首次发生时间',name: "enterDate" ,align:"left"},
									  {text: '最新发生时间',name: "lastDate" ,align:"left"},
									  {text: '更新时间',name: "updateDate" ,align:"left"},
									  {text: '恢复时间',name: "recoveryDate" ,align:"left"}];

			$.ajax({
				type: "GET",
				url: "module/sec_manage/event_analy/fault_event_analy_tpl.html",
				success: function(data) {
					g_dialog.dialog($(data).find("[id=detail_template]"), {
						width: "660px",
						init: init,
						title:"故障事件详细信息",
						hideDefaultBtn:true,
						autoHeight:true,
						btn_array:[
					 				{id:"email_btn",class:"dialog-save",text:"同步资产信息",aClick:function (el){
					 					__viewEventUpdate(opt.faultNO ,'fault',function (){
					 						g_dialog.hide(el)
					 						self.faultEventDetail(opt,true)
					 					})
					 				}}
			 		   		      ]
					});
				}
			});

			function init(el) {
				if (view) {
					g_dialog.operateAlert(el,"同步成功。")
				}
				um_ajax_get({
					url : "faultAlarmEvent/queryFaultEventDetail",
					paramObj : {faultNO:opt.faultNO},
					isLoad : true,
					maskObj : "body",
					successCallBack : function(data){
						$(el).umDataBind("render", data.faultAlarmStore[0]);
						el.find("[data-id=faultLevel]").append("<span class='detail-event-level' style='background-color:"+dict_level_name_bgcolor[data.faultAlarmStore[0].faultLevel]+";'>"+data.faultAlarmStore[0].faultLevel+"</span>")
						el.find("[data-id=monitorName]").click(function(){
							data.faultAlarmStore[0].edId = data.faultAlarmStore[0].edID
							self.monitorDetail(data.faultAlarmStore[0])
						})
						if(data.faultAlarmStore[0].currentStatus == "故障")
						{
							el.find("[data-id=currentStatus]").text("异常");
						}
						else
						{
							return;
						}
					}
				});

				el.find("[id=detailmore_btn]").click(function() {
					$.ajax({
						type: "GET",
						url: "module/sec_manage/event_analy/fault_event_analy_tpl.html",
						success: function(data) {
							g_dialog.dialog($(data).find("[id=detailmore_template]"), {
								width: "800px",
								init: init,
								title : "故障事件历史发生时间",
								isDetail: true,
								top:"8%"
							});
						}
					});

					function init(el) {
						g_grid.render(el.find('[id=table_in_query_detailmore]'), {
							header: list_detail_header,
							url: "faultAlarmEvent/queryFaultHisEventDetail",
							paramObj : {faultAlarmStore:{faultNO:opt.faultNO}},
							isLoad : true,
							maskObj : "body",
							allowCheckBox: false,
							hideSearch : true
						});

					}
				});
			}	
		},
		faultEventDialogDetail : function(opt){
			var self = this
			var list_detail_header = [
									  {text: '',name: "t" ,width : 3},
								      {text: '首次发生时间',name: "enterDate" ,align:"left"},
									  {text: '最新发生时间',name: "lastDate" ,align:"left"},
									  {text: '更新时间',name: "updateDate" ,align:"left"},
									  {text: '恢复时间',name: "recoveryDate" ,align:"left"}];
			g_dialog.elDialog({
				url: "module/sec_manage/event_analy/fault_event_analy_new_tpl.html",
				title : "故障事件详情",
				cbf: function(){
					var el = $(".umElDialog-content")
					init(el)
				},
				back_after_cbf : function (){
					g_grid.resizeSup($("#table_div"))
				}
			})
			function init(el) {
				detail_render()
				function detail_render(){
					$(el).umDataBind("reset")
					um_ajax_get({
						url : "faultAlarmEvent/queryFaultEventDetail",
						paramObj : {faultNO:opt.faultNO},
						isLoad : true,
						maskObj : "body",
						successCallBack : function(data){
							$(el).umDataBind("render", data.faultAlarmStore[0]);
							el.find("[data-id=faultLevel]").html("")
							el.find("[data-id=faultLevel]").append("<span class='detail-event-level' style='background-color:"+dict_level_name_bgcolor[data.faultAlarmStore[0].faultLevel]+";'>"+data.faultAlarmStore[0].faultLevel+"</span>")
							el.find("[data-id=monitorName]").click(function(){
								data.faultAlarmStore[0].edId = data.faultAlarmStore[0].edID
								self.monitorDetail(data.faultAlarmStore[0])
							})
							if(data.faultAlarmStore[0].currentStatus == "故障")
							{
								el.find("[data-id=currentStatus]").text("异常");
							}
							else
							{
								return;
							}
						}
					});
				}
				
				el.find("[id=detailmore_btn]").click(function() {
					$.ajax({
						type: "GET",
						url: "module/sec_manage/event_analy/fault_event_analy_tpl.html",
						success: function(data) {
							g_dialog.dialog($(data).find("[id=detailmore_template]"), {
								width: "800px",
								init: init,
								title : "故障事件历史发生时间",
								isDetail: true,
								top:"8%"
							});
						}
					});

					function init(el) {
						g_grid.render(el.find('[id=table_in_query_detailmore]'), {
							header: list_detail_header,
							url: "faultAlarmEvent/queryFaultHisEventDetail",
							paramObj : {faultAlarmStore:{faultNO:opt.faultNO}},
							isLoad : true,
							maskObj : "body",
							allowCheckBox: false,
							hideSearch : true
						});

					}
				});
				el.find("#synchron_btn").click(function(){
					__viewEventUpdate(opt.faultNO ,'fault',function (){
 						g_dialog.operateAlert(null,"同步成功。")
 						detail_render()
 					})
				})
			}
		},
		/** 
			函数名 : performEventDetail
			参数   : opt{
						}
		*/
		performEventDetail : function (opt, view){
			var self = this
			var list_detail_header = [
									   {text:'性能值',name:"value"},
									   {text:'首次发生时间',name:"enterDate" ,"align":"left"},
									   {text: '最新发生时间',name: "lastDate" ,"align":"left"}, 
									   {text: '更新时间',name: "updateDate" ,"align":"left"}, 
									   {text:'恢复时间',name:"recoveryDate" ,"align":"left"}
									 ];
			$.ajax({
				type: "GET",
				url: "module/sec_manage/event_analy/perform_event_analy_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=perform_detail_template]"),{
						width:"660px",
						init:init,
						title:"性能事件详细信息",
						hideDefaultBtn:true,
						autoHeight:true,
						btn_array:[
					 				{id:"email_btn",class:"dialog-save",text:"同步资产信息",aClick:function (el){
					 					__viewEventUpdate(opt.performanceNo ,'perform',function (){
					 						g_dialog.hide(el)
					 						self.performEventDetail(opt, true)
					 					})
					 				}}
			 		   		      ]
					});
				}
			});

			function init(el){
				if (view) {
					g_dialog.operateAlert(el,"同步成功。")
				}
				um_ajax_get({
					url : "performanceEvent/queryPerformanceEventDetail",
					paramObj : {performanceStore : {performanceNo:opt.performanceNo}},
					isLoad : true,
					maskObj : "body",
					successCallBack : function(data){
						$(el).umDataBind("render" ,data[0]);
						el.find("[data-id=perfLevel]").append("<span class='detail-event-level' style='background-color:"+dict_level_name_bgcolor[data[0].perfLevel]+";'>"+data[0].perfLevel+"</span>");
						if(data[0].monitorName == "" || data[0].monitorName == null)
						{
							el.find("[data-id=monitorName]").text("接口监控器");
							el.find("[data-id=monitorName]").css({"color":"rgba(0,0,0,0.85)","cursor":"text"})
							el.find("[data-id=monitorName]").removeAttr("title")
						}
						else
						{
							el.find("[data-id=monitorName]").click(function(){
								self.monitorDetail(data[0])
							})
							return;
						}
					}
				});

				$("#detailmore_btn").click(function (){
					$.ajax({
						type: "GET",
						url: "module/sec_manage/event_analy/perform_event_analy_tpl.html",
						success :function(data)
						{
							g_dialog.dialog($(data).find("[id=detailmore_template]"),{
								width:"800px",
								init:init,
								title : "性能事件历史发生时间",
								isDetail:true,
								top:"8%"
							});
						}
					});
					function init (el){
						g_grid.render(el.find('[id=table_in_query_detailmore]'),{
							header : list_detail_header,
							url : "performanceEvent/queryPerformanceHisEventDetail",
							paramObj : {performanceStore:{performanceNo:opt.performanceNo}},
							isLoad : true,
							maskObj : "body",
							allowCheckBox : false,
							hideSearch : true
						});

					}
				});
			}		
		},
		performEventDialogDetail : function(opt){
			var self = this
			var list_detail_header = [
									   {text:'性能值',name:"value"},
									   {text:'首次发生时间',name:"enterDate" ,"align":"left"},
									   {text: '最新发生时间',name: "lastDate" ,"align":"left"}, 
									   {text: '更新时间',name: "updateDate" ,"align":"left"}, 
									   {text:'恢复时间',name:"recoveryDate" ,"align":"left"}
									 ];
			g_dialog.elDialog({
				url: "module/sec_manage/event_analy/perform_event_analy_new_tpl.html",
				title : "性能事件详情",
				cbf: function(){
					var el = $(".umElDialog-content")
					init(el)
				},
				back_after_cbf : function (){
					g_grid.resizeSup($("#table_div"))
				}
			})
			function init(el) {
				detail_render()
				function detail_render(){
					$(el).umDataBind("reset")
					um_ajax_get({
						url : "performanceEvent/queryPerformanceEventDetail",
						paramObj : {performanceStore : {performanceNo:opt.performanceNo}},
						isLoad : true,
						maskObj : "body",
						successCallBack : function(data){
							$(el).umDataBind("render" ,data[0]);
							el.find("[data-id=perfLevel]").html("")
							el.find("[data-id=perfLevel]").append("<span class='detail-event-level' style='background-color:"+dict_level_name_bgcolor[data[0].perfLevel]+";'>"+data[0].perfLevel+"</span>");
							if(data[0].monitorName == "" || data[0].monitorName == null)
							{
								el.find("[data-id=monitorName]").text("接口监控器");
								el.find("[data-id=monitorName]").css({"color":"rgba(0,0,0,0.85)","cursor":"text"})
								el.find("[data-id=monitorName]").removeAttr("title")
							}
							else
							{
								el.find("[data-id=monitorName]").click(function(){
									self.monitorDetail(data[0])
								})
								return;
							}
						}
					});
				}

				$("#detailmore_btn").click(function (){
					$.ajax({
						type: "GET",
						url: "module/sec_manage/event_analy/perform_event_analy_tpl.html",
						success :function(data)
						{
							g_dialog.dialog($(data).find("[id=detailmore_template]"),{
								width:"800px",
								init:init,
								title : "性能事件历史发生时间",
								isDetail:true,
								top:"8%"
							});
						}
					});
					function init (el){
						g_grid.render(el.find('[id=table_in_query_detailmore]'),{
							header : list_detail_header,
							url : "performanceEvent/queryPerformanceHisEventDetail",
							paramObj : {performanceStore:{performanceNo:opt.performanceNo}},
							isLoad : true,
							maskObj : "body",
							allowCheckBox : false,
							hideSearch : true
						});

					}
				});

				el.find("#synchron_btn").click(function(){
 					__viewEventUpdate(opt.performanceNo ,'perform',function (){
 						g_dialog.operateAlert(null,"同步成功。")
 						detail_render()
 					})
				})
			}
		},
		/** 
			函数名 : deployEventDetail
			参数   : opt{
						}
		*/
		deployEventDetail : function (opt){
			$.ajax({
				type: "GET",
				url: "module/sec_manage/event_analy/deploy_event_analy_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=deploy_detail_template]"),{
						width:"800px",
						init:init,
						title:"配置事件详细信息",
						isDetail:true,
						top:"14%"
					});
				}
			});

			function init(el){
				um_ajax_get({
					url : "deployEvent/queryDeployEventDetail",
					paramObj : {DEPLOY_NO:opt.deploy_NO},
					isLoad : true,
					maskObj : "body",
					successCallBack : function(data){
						$(el).umDataBind("render" ,data[0]);
						el.find("[data-id=event_STATUS]").html(faultStatusMap.get(data[0].event_STATUS));
					}
				});
			}		
		},
		/** 
			函数名 : vulnerEventDetail
			参数   : opt{
						}
		*/
		vulnerEventDetail : function (opt,type){
			var self = this;
			$.ajax({
				type: "GET",
				url: "module/sec_manage/event_analy/vulner_event_analy_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=detail_template]"),{
						width:"1000px",
						init:init,
						title:"脆弱性事件查看",
						isDetail:true,
						top:"5%"
					});
				}
			});

			function init(el)
			{
				if(type)
				{
					el.find("[id=table_oper]").remove();
				}
				var dialog_table_url = "vul/finish/queryEdDetails";
				var dialog_table_header = [
					{text:'漏洞IP',name:"vul_ipv"},
					{text:'漏洞名称',name:"vul_NAME"},
					{text:'受影响操作系统',name:"os_affected_name"},
					{text:'发生时间',name:"enter_DATE"},
					{text:'CVE编号',name:"cve"},
					{text:'BUGTRAQ编号',name:"bugtraq"},
					{text:'漏洞状态',name:"status"}
			   	];

				event_init();

				list_init();

				function list_init()
				{
					g_grid.render(el.find("[id=detail_list]"),{
						url:dialog_table_url,
						header:dialog_table_header, 
				 		paramObj : {ed_id:opt.ed_id ,statusFlag:"undefined"},
				 		isLoad : true,
						maskObj:"body",
				 		dbClick : vulner_event_detailmore
					});

					function vulner_event_detailmore(rowData)
					{
						$.ajax({
							type: "GET",
							url: "module/sec_manage/event_analy/vulner_event_analy_tpl.html",
							success :function(data)
							{
								g_dialog.dialog($(data).find("[id=detailmore_template]"),{
									width:"800px",
									init:init,
									title:"漏洞详细信息",
									isDetail:true,
									top:"0"
								});
							}
						});

						function init(aEl)
						{
							um_ajax_get({
								url : "vul/finish/queryVulAssetInfo",
								paramObj : {foundID:rowData.base_id},
								isLoad : true,
								maskObj : "body",
								successCallBack : function(data){
									aEl.umDataBind("render",data[0]);
								}
							});
						}
					}
				}

				function event_init()
				{
					el.find("[id=export_excel_btn]").click(function(){
						var idArray = g_grid.getIdArray($("#detail_list") ,{chk:true,attr:"base_id"});
						window.location.href = index_web_app + "vul/finish/exportExcel?eventIds=" + idArray.join(",");
					});

					el.find("[id=ignore_btn]").click(function(){
						self.ignore({
							gridEl : el.find("[id=detail_list]"),
							attr : "base_id",
							key : "ignoreIDs",
							ignore_url : "vul/finish/doIgnore",
							cb: function() {
								list_init();
							}
						});
					});
				}
			}	
		},
		/** 
			函数名 : secEventDetail
			参数   : opt{
						}
		*/
		secEventDetail : function (opt){
			var rowData = opt;
			$.ajax({
				type: "GET",
				url: "module/sec_manage/event_analy/sec_event_analy_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=sec_event_detail_template]"),{
						width:"660px",
						init:init,
						isDetail:true,
						title:"安全事件详细信息",
						autoHeight:"autoHeight"
					});

					function init(el){
						tab.tab($("#tab") ,{
							oper : [tab1_click ,tab2_click,tab3_click ,tab4_click]
						});

						function tab1_click(){
							um_ajax_post({
								url : "siem/securityWatchEvent/querySecurityEventDetail",
								paramObj : {eventId : rowData.eventId},
								maskObj : "body",
								successCallBack : function (data){
									el.find("[id=form1]").umDataBind("render" ,data);
									um_ajax_post({
										url : "siem/securityWatchEvent/queryAlramDetail",
										paramObj : {alarmId : rowData.eventId},
										successCallBack : function (data){
											$("#sec_policy_div").umDataBind("render" ,data);
										}
									});
								}
							});
						}

						function tab2_click(){
							g_grid.render(el.find("[id=ori_alarm_log_table_div]"),{
								header:[
										  {text:'',name:"t",width:3,hideSearch:"hide"},
										  {text:'日志描述',name:"logDesc" ,width:77,align:"left"},
										  {text:'发生时间',name:"startDate" ,width:20,align:"left"}
										 ],
								paginator : false,
								url : "siem/securityWatchEvent/queryLogger",
								paramObj : {eventId:rowData.eventId ,fromIp:rowData.fromIp,pageSize:50},
								allowCheckBox:false,
								hideSearch : true,
								dbIndex : 1,
								dbClick : function (rowData){
									g_dialog.dialog('<div><label id="log_info" style="word-break: break-all;"></label><div>' ,{
											title:"日志描述",
											width:"500px",
											isDetail : true,
											initAfter:function (el){
												el.find("#log_info").text(rowData.logDesc);
											}
										})
								}
							});
						}

						function tab3_click(){
							um_ajax_post({
								url : "siem/securityWatchEvent/queryDataMap",
								paramObj : {eventId : rowData.eventId},
								successCallBack : function (data){
									var jsonObj = JsonTools.decode(data.jsonStr);
									var chart_data = jsonObj.datas;
									var legendArray = [];
									if (chart_data)
									{
										for (var i=0;i<chart_data.length;i++)
										{
											chart_data[i].data = chart_data[i].value;
											chart_data[i].name = chart_data[i].lable;
											legendArray.push(chart_data[i].name);
										}
										plot.pieRender($("#alarm_sample_analy_chart_div") ,{
											legend:legendArray,
											data : chart_data,
											center : ["70%" ,"50%"]
										});
									}
									
									g_grid.render(el.find("[id=alarm_sample_analy_table_div]"),{
										header:[
												  {text:'样本名称',name:"pattenName" ,width:20},
												  {text:'原始日志',name:"message" ,width:30 ,render:function (txt){
												  		if (txt && txt.length > 30)
												  		{
												  			return txt.substr(0 ,30) + "...";
												  		}
												  }},
												  {text:'',name:"" ,width:5},
												  {text:'设备事件描述',name:"alarmDevDesc" ,width:45}
												 ],
										data:data.resultList,
										paginator : false,
										allowCheckBox:false,
										hideSearch:true,
										dbIndex:1,
										dbClick:function (rowData){
											g_dialog.dialog('<div><label id="log_info" style="word-break: break-all;"></label><div>' ,{
												title:"原始日志",
												width:"500px",
												isDetail:true,
												initAfter:function (el){
													el.find("#log_info").text(rowData.message);
												}
											})
										}
									});
								}
							});
						}

						function tab4_click(){
							um_ajax_post({
								url : "siem/securityWatchEvent/queryAttMap",
								paramObj : {eventId : rowData.eventId},
								successCallBack : function (data){
									$("#radar_div").empty();
									if(typeof data == 'string')
										data = JsonTools.decode(data)
									var node = data.ipTo.map(function(item,index){
										if(item.ip === '未知'){

										}else 
										return {name : item.ip,x:0,y:0,id:item.ip,symbolSize:30,
											value:1,
											label: {
												normal: {
													show:true
												}
											}
										}
									}).concat(data.ipFrom.map(function(item){
										if(item.ip === '未知'){

										}else 
										return {name : item.ip,x:0,y:0,id:item.ip,symbolSize:30,
											value:1,
											label: {
												normal: {
													show:true
												}
											}
										}
									}))
									for(var i=0;i<node.length;i++){
										if(!node[i]){
											node.splice(i,1);
											i--;
										}
									}
									var link = data.line.map(function(item,index){
										if(item.ip === '未知' || item.toIp === '未知'){
											
										}else 
										return {source : item.ip,target : item.toIp}
									})
									for(var i=0;i<link.length;i++){
										if(!link[i]){
											link.splice(i,1);
											i--;
										}
									}
									console.log(node)
									console.log(link)
									var echarts = plot.getEcharts()
									var mychart = echarts.init($("#radar_div")[0])
									var option = {
										tooltip : {
											formatter: '{b}'
										},
										animationDurationUpdate: 1500,
										animationEasingUpdate: 'quinticInOut',
										series : [
										{
											type: 'graph',
											layout: 'circular',
											circular: {
												rotateLabel: true
											},
											roam: true,
											label: {
												normal: {
													position: 'right',
													formatter: '{b}'
												}
											},
											edgeSymbol: ['circle', 'arrow'],
											edgeSymbolSize: [4, 10],
											data: node,
											links: link,
											lineStyle: {
												normal: {
													width: 2,
													color: 'source',
													curveness: 0.3
												}
											}
										}
										]
									};
									mychart.setOption(option);
								}
							});
						}
					}
				}
			});
		},
		secEventDialogDetail : function(opt){
			var rowData = opt;
			g_dialog.elDialog({
				url: "module/sec_manage/event_analy/sec_event_analy_new_tpl.html",
				title : "安全事件详情",
				cbf: function(){
					var el = $(".umElDialog-content")
					init(el)
				},
				back_after_cbf : function (){
					g_grid.resizeSup($("#table_div"))
				}
			})

			function init(el){
				el.find(".umElDialog-content-tab").find("li").click(function(){
					var index = $(this).index()
					if (index == 0) {
						um_ajax_post({
							url : "siem/securityWatchEvent/querySecurityEventDetail",
							paramObj : {eventId : rowData.eventId},
							maskObj : "body",
							successCallBack : function (data){
								el.find("[data-id=message]").text(data.message)
								delete data.message
								data.srcPort = (data.srcPort == 0 ? "N/A" : data.srcPort)
								data.dstPort = (data.dstPort == 0 ? "N/A" : data.dstPort )
								el.find("[id=form1]").umDataBind("render" ,data);
								el.find("[id=form2]").umDataBind("render" ,data);
								el.find("[data-id=levelId]").html("<span class='detail-event-level' style='background-color:"+dict_level_name_bgcolor[data.levelId]+";'>"+data.levelId+"</span>")
								um_ajax_post({
									url : "siem/securityWatchEvent/queryAlramDetail",
									paramObj : {alarmId : rowData.eventId},
									successCallBack : function (data){
										$("#sec_policy_div").umDataBind("render" ,data);
									}
								});
							}
						});
					}
					if (index == 1) {
						g_grid.render(el.find("[id=ori_alarm_log_table_div]"),{
							header:[
									  {text:'',name:"t",width:3,hideSearch:"hide"},
									  {text:'日志描述',name:"logDesc" ,width:77,align:"left"},
									  {text:'发生时间',name:"startDate" ,width:20,align:"left"}
									 ],
							paginator : false,
							url : "siem/securityWatchEvent/queryLogger",
							paramObj : {eventId:rowData.eventId ,fromIp:rowData.fromIp,pageSize:50},
							allowCheckBox:false,
							hideSearch : true,
							dbIndex : 1,
							autoHeight:true,
							dbClick : function (rowData){
								g_dialog.dialog('<div><label id="log_info" style="word-break: break-all;"></label><div>' ,{
									title:"日志描述",
									width:"500px",
									isDetail : true,
									initAfter:function (el){
										el.find("#log_info").text(rowData.logDesc);
									}
								})
							}
						});
					}
					if (index == 2) {
						var option = {
							tooltip : {
								trigger: 'item'
							},
							color : ['#3290fc','#f7cc30','#3cc35f','#31c3c1','#31c3c1','#ffb340','#546570','rgba(149,206,252,0.8)','rgba(254,225,108,0.8)','rgba(128,214,236,0.8)','rgba(56,253,181,0.8)','rgba(174,108,255,0.8)'],
							legend: {
								orient: 'vertical',
								left : "3%",
						        right: "30%",
						        top:"20%",
								textStyle: {
									color: '#aab2fe',
									fontSize: 14,
								},
								itemGap: 14,
								itemHeight: 14,
								data: []
							},
							grid: {
								left: '1%',
								containLabel: true
							},
							calculable : true,
							series : [
							{
								type: 'pie',
								radius : ['58%', '90%'],
								center: ['65%', '50%'],
								data: [],
								label : {
						            normal: {
						                show:false
						            }
						        },
						        itemStyle: {
						            normal: {
						                borderWidth: 3,
						                borderColor: '#fff'
						            },
						            emphasis: {
						                borderWidth: 0,
						                shadowBlur: 5,
						                shadowOffsetX: 0,
						                shadowColor: 'rgba(0, 0, 0, 0.2)'
						            }
						        }
							}
							
							]
						}
						var mychart = echarts.init(document.getElementById('alarm_sample_analy_chart_div'));
						um_ajax_post({
							url : "siem/securityWatchEvent/queryDataMap",
							paramObj : {eventId : rowData.eventId},
							successCallBack : function (data){
								var jsonObj = JsonTools.decode(data.jsonStr);
								var chart_data = jsonObj.datas;
								var legendArray = [];
								if (chart_data)
								{
									for (var i=0;i<chart_data.length;i++)
									{
										chart_data[i].data = chart_data[i].value;
										chart_data[i].name = chart_data[i].lable;
										legendArray.push(chart_data[i].name);
									}
									option.legend.data = legendArray
									option.series[0].data = chart_data
					    			mychart.setOption(option)
								}
								g_grid.render(el.find("[id=alarm_sample_analy_table_div]"),{
									header:[
											  {text:'样本名称',name:"pattenName" ,width:20},
											  {text:'原始日志',name:"message" ,width:30 ,render:function (txt){
											  		if (txt && txt.length > 30)
											  		{
											  			return txt.substr(0 ,30) + "...";
											  		}
											  }},
											  {text:'',name:"" ,width:5},
											  {text:'设备事件描述',name:"alarmDevDesc" ,width:45}
											 ],
									data:data.resultList,
									paginator : false,
									allowCheckBox:false,
									hideSearch:true,
									dbIndex:1,
									autoHeight:true,
									dbClick:function (rowData){
										g_dialog.dialog('<div><label id="log_info" style="word-break: break-all;"></label><div>' ,{
											title:"原始日志",
											width:"500px",
											isDetail:true,
											initAfter:function (el){
												el.find("#log_info").text(rowData.message);
											}
										})
									}
								});
							}
						});
					}
					if (index == 3) {
						um_ajax_post({
							url : "siem/securityWatchEvent/queryAttMap",
							paramObj : {eventId : rowData.eventId},
							successCallBack : function (data){
								$("#radar_div").empty();
								if(typeof data == 'string')
									data = JsonTools.decode(data)
								var node = data.ipTo.map(function(item,index){
									if(item.ip === '未知'){

									}else 
									return {name : item.ip,x:0,y:0,id:item.ip,symbolSize:30,
										value:1,
										label: {
											normal: {
												show:true
											}
										}
									}
								}).concat(data.ipFrom.map(function(item){
									if(item.ip === '未知'){

									}else 
									return {name : item.ip,x:0,y:0,id:item.ip,symbolSize:30,
										value:1,
										label: {
											normal: {
												show:true
											}
										}
									}
								}))
								for(var i=0;i<node.length;i++){
									if(!node[i]){
										node.splice(i,1);
										i--;
									}
								}
								var link = data.line.map(function(item,index){
									if(item.ip === '未知' || item.toIp === '未知'){
										
									}else 
									return {source : item.ip,target : item.toIp}
								})
								for(var i=0;i<link.length;i++){
									if(!link[i]){
										link.splice(i,1);
										i--;
									}
								}
								console.log(node)
								console.log(link)
								var echarts = plot.getEcharts()
								var mychart = echarts.init($("#radar_div")[0])
								var option = {
									tooltip : {
										formatter: '{b}'
									},
									animationDurationUpdate: 1500,
									animationEasingUpdate: 'quinticInOut',
									series : [
									{
										type: 'graph',
										layout: 'circular',
										circular: {
											rotateLabel: true
										},
										roam: true,
										label: {
											normal: {
												position: 'right',
												formatter: '{b}'
											}
										},
										edgeSymbol: ['circle', 'arrow'],
										edgeSymbolSize: [4, 10],
										data: node,
										links: link,
										lineStyle: {
											normal: {
												width: 2,
												color: 'source',
												curveness: 0.3
											}
										}
									}
									]
								};
								mychart.setOption(option);
							}
						});
					}
				})
				el.find(".umElDialog-content-tab").find("li").eq(0).click()
			}
		},
		/** 
			函数名 : faultEventList
		*/
		faultEventList : function (opt,analy)
		{
			var self = this;
			var list_header_map = new HashMap();
			list_header_map.put("faultNameCol", {
				text: '事件名称',
				align:"left",
				name: "faultName"
			});
			list_header_map.put("currentStatusCol", {
				text: '当前状态',
				name: "currentStatus",
				align:"center",
				width:6,
				render: function(text) {
					return (text == "1" ? "<span style='color:#1abc9c'>正常</span>" : "<span style='color:#ec7063'>异常</span>");
				},
				searchRender:function (el){
					var data = [
									{text:"----" ,id:"-1"},
									{text:"异常" ,id:"0"},
			  						{text:"正常" ,id:"1"}
						  		];
					g_formel.select_render(el ,{
						data : data,
						name : "currentStatus",
						initVal : "0"
					});
				}
			});
			list_header_map.put("edNameCol", {
				text: '资产名称',
				align:"left",
				name: "edName"
			});

			list_header_map.put("faultNOCol", {
				text: '事件编号',
				align:"left",
				name: "faultNO"
			});
			list_header_map.put("classNameCol", {
				text: '事件类型',
				name: "className",
				align:"left",
				searchRender: function (el){
					var searchEl = $('<select class="form-control input-sm" search-data="className"></select>');
			  		el.append(searchEl);
			   	    g_formel.code_list_render({
			   	   		key : "faultclass",
			   	   		faultEventTypeEl : searchEl
			   	    });
				}
			});
			list_header_map.put("faultLevelCol", {
				text: '事件等级',
				name: "faultLevel",
				align:"center",
				render: function(text) {
					var level;
					switch (parseInt(text)) {
						case 1:
							level = "高";
							break;
						case 2:
							level = "中";
							break;
						case 3:
							level = "低";
							break;
						case 4:
							level = "很低";
							break;
						default:
							break;
					}
					return '<i style="font-size:20px"></i><span class="dib prel level" style="background-color:'+dict_level_name_bgcolor[level]+';text-align:center;">'
									+level+'</span>';
				},
				searchRender: function (el){
					var data = [
									{text:"----" ,id:"-1"},
			  						{text:"很高" ,id:"0"},
			  						{text:"高" ,id:"1"},
			  						{text:"中" ,id:"2"},
			  						{text:"低" ,id:"3"},
			  						{text:"很低" ,id:"4"},
						  		];
					g_formel.select_render(el ,{
						data : data,
						name : "faultLevel"
					});
				}
			});
			list_header_map.put("sdomainNameCol", {
				text: '安全域',
				name: "sdomainName",
				align:"left",
				searchRender: function (el){
					var searchEl = $('<div class="inputdrop" id="sdomainId"></div>');
			  		el.append(searchEl);
			   	    g_formel.sec_biz_render({
			   	   		secEl : searchEl
			   	    });
				}
			});
			list_header_map.put("bdomainNameCol", {
				text: '业务域',
				name: "bdomainName",
				align:"left",
				searchRender: function (el){
					var searchEl = $('<div class="inputdrop" id="bdomainId"></div>');
			  		el.append(searchEl);
			   	    g_formel.sec_biz_render({
			   	   		bizEl : searchEl
			   	    });
				}
			});
			list_header_map.put("firstEnterDateCol", {
				text: '首次发生时间',
				name: "firstEnterDate",
				align:"left",
				searchRender: function (el){
					index_render_div(el ,{type:"date",startKey:"startDate" ,endKey:"endDate"});
				}
			});
			list_header_map.put("enterDateCol", {
				text: '最新发生时间',
				name: "enterDate",
				align:"left",
				hideSearch: true
			});
			list_header_map.put("updateDateCol", {
				text: '恢复时间',
				name: "updateDate",
				align:"left",
				hideSearch: true
			});
			list_header_map.put("faultModuleCol", {
				text: '事件描述',
				name: "faultModule",
				align:"left",
				render: function (txt){
					var txtTmp = txt;
					if (txt && txt.length > 40)
					{
						txtTmp = txt.substr(0,40) + "...";
					}
					return '<span style="opacity:1;padding-right:20px;" title="'+txt+'">'+txtTmp+'</span>'
				}
			});
			list_header_map.put("ipvAddressCol", {
				text: '资产IP',
				align:"left",
				name: "ipvAddress",
				searchRender : function (el){
					index_render_div(el ,{type:"ip"});
				}
			});
			list_header_map.put("faultStatusCol", {
				text: '处理状态',
				name: "faultStatus",
				align:"center",
				width:6,
				render: function(text) {
					var status;
					switch (parseInt(text)) {
						case 1:
							status = "未处理";
							break;
						case 2:
							status = "忽略";
							break;
						case 3:
							status = "处理中";
							break;
						case 4:
							status = "已处理";
							break;
						default:
							break;
					}
					return status;
				},
				searchRender:function(el){
					var data = [
									{text:"未处理" ,id:"1"},
			  						{text:"忽略" ,id:"2"},
			  						{text:"处理中" ,id:"3"},
			  						{text:"已处理" ,id:"4"}
						  		];
					g_formel.multipleSelect_render(el ,{
						data : data,
						name : "faultStatus",
						allowAll : true,
						initVal : "1,3"
					});
				}
			});
			list_header_map.put("trueOverNumsCol" ,{text:'发生次数',name:"trueOverNums",align:"left",hideSearch:true});
			list_header_map.put("continueTimeCol" ,{text:'持续时间',name:"continueTime",align:"left",hideSearch:true});
			// 先去调用getcol
			um_ajax_get({
				url: "faultAlarmEvent/queryFaultColumeIds",
				isLoad: false,
				successCallBack: function(data) {
					var dataArray = data.split(",");
					// 组装header
					var header = [{text:'',name:"t",width:3,hideSearch:"hide"}];
					current_header.length = 0;
					for (var i = 0; i < dataArray.length; i++) {
						if (list_header_map.get(dataArray[i])) {
							header.push(list_header_map.get(dataArray[i]));
							current_header.push(dataArray[i]);
						}
					}
					g_grid.render($("#table_div"), {
						header: header,
						paramObj :  (opt&&opt.pObj) ? opt.pObj:{currentStatus : 0 ,faultStatus : "1,3"},//默认查询异常状态
						queryBefore : function (paramObj){
							if($("#vague_hidden").val() == "1")
							{
								paramObj = {};
								paramObj = {searchFlag:"2" ,keyWords:$('#vague_div').val()};
							}
							$("#vague_hidden").val("0");
						},
						url: "faultAlarmEvent/queryFaultEventList",
						allowCheckBox: true,
						dbClick: event_record_dbclick,
						dbIndex:1,
						hideSearch:true,
						autoHeight : true,
						resizeFlag : false,
						cbf:function (){
							$("#table_div").oneTime(500 ,function (){
								g_grid.resizeSup($("#table_div"))
							})
						}
					});
				}
			});

			function event_record_dbclick(rowData){
				if (analy) {
					self.faultEventDialogDetail(rowData)
				} else{
					self.faultEventDetail(rowData);
				}
				
			}
		},
		/** 
			函数名 : performEventList
		*/
		performEventList : function (opt,analy){
			var self = this;
			//组装表头
			var list_header_map = new HashMap();
			list_header_map.put("perfNameCol" ,{text:'事件名称',name:"perfName",align:"left"});
			list_header_map.put("currentStatusCol" ,{text:'当前状态',name:"currentStatus" ,align:"center",width:6,render:function(text){
							  		return (text=="1"?"<span style='color:#1abc9c'>正常</span>":"<span style='color:#ec7063'>异常</span>");
								}});
			list_header_map.put("perfModuleCol" ,{text:'事件描述',name:"perfModule",align:"left",render: function (txt){
													 return '<span style="opacity:1;padding-right:20px;">'+txt+'</span>'
												 }});
			list_header_map.put("valueCol" ,{text:'性能值',name:"value",align:"left",hideSearch:true});
			list_header_map.put("edNameCol" ,{text:'资产名称',name:"edName",align:"left"});
			list_header_map.put("performanceNoCol" ,{text:'事件编号',name:"performanceNo",align:"left"});
			list_header_map.put("classNameCol" ,{text:'事件类型',name:"className",align:"left"});
			list_header_map.put("perfLevelCol" ,{text:'事件等级',name:"perfLevel",render:function(text){
								var level;
							  	switch(parseInt(text)){
							  		case 1 : level="高"; break;
							  		case 2 : level="中"; break;
							  		case 3 : level="低"; break;
							  		case 0 : level="很高"; break;
							  		default:break;
							  	}
							  	return '<i style="font-size:20px"></i><span class="dib prel level" style="background-color:'+dict_level_name_bgcolor[level]+';text-align:center;">'
									+level+'</span>';
							  }});
			list_header_map.put("bdomainNameCol" ,{text:'业务域',name:"bdomainName",align:"left"});
			list_header_map.put("sdomainNameCol" ,{text:'安全域',name:"sdomainName",align:"left"});
			list_header_map.put("ipvAddressCol", {text: '资产IP',align:"left",name: "ipvAddress"});
			list_header_map.put("firstEnterDateCol" ,{text:'首次发生时间',name:"firstEnterDate",align:"left"});
			list_header_map.put("enterDateCol" ,{text:'最新发生时间',name:"enterDate",align:"left",hideSearch:"true"});
			list_header_map.put("updateDateCol" ,{text:'恢复时间',name:"updateDate",align:"left",hideSearch:"true"});
			list_header_map.put("perfStatusCol" ,{text:'处理状态',name:"perfStatus" ,align:"center",width:6,render:function(text){
							  	var status;
							  	switch(parseInt(text)){
							  		case 1: status="未处理"; break;
							  		case 2: status="忽略"; break;
							  		case 3: status="处理中"; break;
							  		case 4: status="已处理"; break;
							  		default :break;
							  	}
							  	return status;
							  }});
			list_header_map.put("trueOverNumsCol" ,{text:'发生次数',name:"trueOverNums",align:"left",hideSearch:true});
			list_header_map.put("continueTimeCol" ,{text:'持续时间',name:"continueTime",align:"left",hideSearch:true});
			um_ajax_get({
				url : "performanceEvent/queryProformanColumeIds",
				isLoad : false,
				successCallBack : function(data){
					var dataArray = data.split(",");
					// 组装header
					var header = [{text:'',name:"t",width:3,hideSearch:"hide"}];
					for (var i = 0; i < dataArray.length; i++) {
						if (list_header_map.get(dataArray[i])){
							header.push(list_header_map.get(dataArray[i]));
							current_header.push(dataArray[i]);
						}
					}
					g_grid.render($("#table_div"),{
						header:header,
						url:"performanceEvent/queryPerformanceEventList",
						paramObj : (opt && opt.pObj) ? opt.pObj : {currentStatus : 0 ,perfStatus : "1,3"},
						queryBefore : function (paramObj){
						},
						allowCheckBox : true,
						dbClick : event_record_dbclick,
						dbIndex:1,
						hideSearch:true,
						autoHeight :true,
						resizeFlag : false,
						cbf:function (){
							$("#table_div").oneTime(200 ,function (){
								g_grid.resizeSup($("#table_div"))
							})
						}
					});
				}
			});

			function event_record_dbclick(rowData){
				if (analy) {
					self.performEventDialogDetail(rowData)
				} else{
					self.performEventDetail(rowData);
				}
			}
		},
		/** 
			函数名 : deployEventList
		*/
		deployEventList : function (opt){
			var self = this;
			var list_header_map = new HashMap();
			list_header_map.put("depl_NAMECol", {
				text: '事件名称',
				align:"left",
				name: "depl_NAME"
			});
			list_header_map.put("ed_IDCol", {
				text: '资产名称',
				align:"left",
				name: "ed_ID"
			});
			list_header_map.put("monitorNameCol", {
				text: '监控器名称',
				align:"left",
				name: "monitorName"
			});
			list_header_map.put("enter_DATECol", {
				text: '最新发生时间',
				name: "enter_DATE",
				align:"left",
				hideSearch:"true"
			});
			list_header_map.put("update_dateCol", {
				text: '恢复时间',
				name: "update_date",
				align:"left",
				hideSearch:"true"
			});
			list_header_map.put("depl_COUNTCol", {
				text: '数量',
				name: "depl_COUNT",
				align:"left",
				sortBy:"int",
				hideSearch:true
			});
			list_header_map.put("depl_MODULECol", {
				text: '事件描述',
				name: "depl_MODULE",
				align:"left",
				render:function (txt){
					if (txt && txt.length > 40)
					{
						txt = txt.substr(0,40) + "...";
					}
					return '<span style="opacity:1;padding-right:20px;">'+txt+'</span>'
				},
				tip: true
			});
			list_header_map.put("ipvAddressCol", {
				text: '资产IP',
				align:"left",
				name: "ipvAddress",
				searchRender : function (el){
					index_render_div(el ,{type:"ip"});
				}
			});
			// 先去调用getcol
			um_ajax_get({
				url: "deployEvent/queryDeployColumeIds",
				isLoad: false,
				successCallBack: function(data) {
					if (!data)
					{
						data = "depl_NAMECol,ed_IDCol,monitorNameCol,enter_DATECol,depl_COUNTCol";
					}
					var dataArray = data.split(",");
					// 组装header
					var header = [{text:'',name:"t",width:3,hideSearch:"hide"}];
					for (var i = 0; i < dataArray.length; i++) {
						if (list_header_map.get(dataArray[i])) {
							header.push(list_header_map.get(dataArray[i]));
							current_header.push(dataArray[i]);
						}
					}
					g_grid.render($("#table_div"), {
			 			header:header,
			 			url:"deployEvent/queryDeployEventList",
			 			maskObj : "#content_div",
			 			allowCheckBox : true,
			 			dbClick : sec_event_record_dbclick,
			 			dbIndex:1,
						cbf:function (){
							var queryObj = $("[class=um-grid-search-tr]").umDataBind("serialize" ,"search-data");
							$("#table_div").children().data("queryObj" ,queryObj);
						}
					});
				}
			});

		 	function sec_event_record_dbclick(rowData){
				self.deployEventDetail(rowData);
			}
		},
		/** 
			函数名 : vulnerEventList
		*/
		vulnerEventList : function (opt){
			var list_header = [
			 					{text:'资产名称',name:"ed_name"},
			 					{text:'未处理漏洞数量',name:"unhandledVulNum"},
			 					{text:'全部漏洞数量',name:"totalVulNum"},
			 					{text:'变化趋势',name:"newFoundText"}
							  ];
			g_grid.render($("#table_div"),{
		 			header:list_header,
		 			url:"vul/finish/queryFinishEdList",
		 			maskObj : "body",
		 			allowCheckBox : true,
					hideSearch : true,
		 			dbClick : vulner_event_record_dbclick,
		 			cbf:function (){
						$("#table_div").children().data("queryObj" ,current_query_obj);
					}
			});
			function vulner_event_record_dbclick(rowData)
			{
				pevent.vulnerEventDetail(rowData);
			}
		},
		/** 
			函数名 : secEventList
		*/
		secEventList : function (opt,analy){
			var self = this;
			var list_header_map = new HashMap();
			list_header_map.put("eventName", {
				text: '事件名称',
				align:"left",
				name: "eventName"
			});
			list_header_map.put("kindName", {
				text: '类型',
				align:"left",
				name: "kindName"
			});
			list_header_map.put("levelId", {
				text: '事件等级',
				align:"center",
				name: "levelId",
				render : function (txt){
					return '<i style="font-size:20px"></i><span class="dib prel level" style="background-color:'+dict_level_name_bgcolor[faultLevelMap.get(txt)]+';text-align:center;">'
									+faultLevelMap.get(txt)+'</span>';
				}
			});
			list_header_map.put("eventCount", {
				text: '聚合数量',
				name: "eventCount",
				sortBy:"int"
			});
			list_header_map.put("srcIpv", {
				text: '源IP',
				align:"left",
				name: "srcIpv"
			});
			list_header_map.put("srcIpAddr", {
				text: '源IP名称',
				align:"left",
				name: "srcIpAddr"
			});
			list_header_map.put("dstIpv", {
				text: '目的IP',
				align:"left",
				name: "dstIpv"
			});
			list_header_map.put("dstIpAddr", {
				text: '目的IP名称',
				align:"left",
				name: "dstIpAddr"
			});
			list_header_map.put("atDate", {
				text: '聚合开始时间',
				align:"left",
				name: "atDate"
			});
			list_header_map.put("upDate", {
				text: '聚合结束时间',
				align:"left",
				name: "upDate"
			});
			list_header_map.put("deviceTypeName", {
				text: '发生源设备类型',
				align:"left",
				name: "deviceTypeName"
			});
			list_header_map.put("fromIpv", {
				text: '发生源设备IP',
				align:"left",
				name: "fromIpv"
			});
			list_header_map.put("srcPort", {
				text: '源端口',
				name: "srcPort"
			});
			list_header_map.put("dstPort", {
				text: '目的端口',
				name: "dstPort"
			});
			list_header_map.put("securityName", {
				text: '业务域',
				align:"left",
				name: "securityName"
			});
			list_header_map.put("stateId", {
				text: '处理状态',
				align:"center",
				name: "stateId",
				render : function (txt){
					return faultStatusMap.get(txt);
				}
			});
			list_header_map.put("protocol", {
				text: '协议',
				align:"left",
				name: "protocol"
			});
			list_header_map.put("eventId", {
				text: '事件编号',
				name: "eventId"
			});
			var gridObj = {};
			if (opt && opt.pObj) {
				gridObj = opt.pObj
			}
			else if(opt && opt.searchObj) {
				gridObj = opt.searchObj
			}
			// 先去调用getcol
			um_ajax_get({
				url : "siem/securityWatchEvent/querySecEventColumeIds",
				isLoad : false,
				successCallBack : function (data){
					var dataArray = data.split(",");
					// 组装header
					var header = [{text:'',name:"t",width:3,hideSearch:"hide"}];
					for (var i = 0; i < dataArray.length; i++) {
						if (list_header_map.get(dataArray[i])) {
							header.push(list_header_map.get(dataArray[i]));
							current_header.push(dataArray[i]);
						}
					}
					g_grid.render($("#table_div") ,{
						header : header,
						paramObj: gridObj,
						queryBefore : function (paramObj){
							if (opt && opt.searchObj)
							{
								return opt.searchObj;
							}
						},
						url : "siem/securityWatchEvent/querySecurityEventList",
						allowCheckBox : true,
						dbClick: event_record_dbclick,
						dbIndex:1,
						hideSearch: "false",
						autoHeight :true,
						resizeFlag : false,
						cbf:function (){
							var queryObj = $("[class=um-grid-search-tr]").umDataBind("serialize" ,"search-data");
							$("#table_div").children().data("queryObj" ,queryObj);
							$("#table_div").oneTime(200 ,function (){
								g_grid.resizeSup($("#table_div"))
							})
						}
					})
				}
			});

			function event_record_dbclick(rowData){
				if (analy) {
					self.secEventDialogDetail(rowData)
				} else{
					self.secEventDetail(rowData);
				}
			}
		},
		/** 
			函数名 : dialogList
			参数   : opt{url,  --- 不传为默认
						header, --- 不传为默认
						paramObj
						},
					flag:"2" 故障事件    "3" 性能事件 ，"13" 配置事件,
					oper:true   ---显示操作栏
 		*/
		dialogList :function(opt,flag,oper){
			var self = this;
			var title;
			var url;
			var header;
			if(flag == "2")
			{
			    header = [
							{text:"事件名称" ,name:"faultName"},
							{text:"当前状态" ,name:"currentStatus" ,render:function (txt){
								if (txt == "0")
								{
									return "异常";
								}
								else
								{
									return "正常";
								}
							}},
							{text:"事件模块" ,name:"faultModule"},
							{text:"发生时间" ,name:"firstEnterDate"},
							{text:"恢复时间" ,name:"updateDate"}
						 ];
				url = "faultAlarmEvent/queryFaultEventList";
			}
			else if(flag == "3")
			{
				header = [
						{text:"事件名称" ,name:"perfName"},
						{text:"当前状态" ,name:"currentStatus" ,render:function (txt){
							if (txt == "0")
							{
								return "异常";
							}
							else
							{
								return "正常";
							}
						}},
						{text:"事件模块" ,name:"perfModule"},
						{text:"性能值" ,name:"value"},
						{text:"发生时间" ,name:"firstEnterDate"},
						{text:"恢复时间" ,name:"updateDate"}
					 ];
				url = "performanceEvent/queryPerformanceEventList";
			}
			else if(flag == "13")
			{
				var header = [
					{text:"事件名称" ,name:"depl_NAME"},
					{text:"资产名称" ,name:"ed_ID"},
					{text:"监控器名称" ,name:"monitor_ID"},
					{text:"发生时间" ,name:"enter_DATE"},
					{text:"数量" ,name:"depl_COUNT"},
					{text:"状态" ,name:"event_STATUS"},
					{text:"事件内容" ,name:"depl_MODULE" ,render:function (txt){
						if (txt && txt.length > 10)
						{
							return txt.substr(0,10) + "...";
						}
						else
						{
							return txt;
						}
					},tip:true}
				 ];
				 url = "deployEvent/queryDeployEventList";
			}
			if(flag == "2")
			{
				title = "故障事件";
			}
			else if(flag == "3")
			{
				title = "性能事件";
			}
			else if(flag == "13")
			{
				title = "配置事件";
			}
			$.ajax({
				type: "GET",
				url: "module/monitor_info/monitor_obj/asset_monitor_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=table_template]"),{
						width:"900px",
						init:init,
						initAfter:initAfter,
						isDetail:true,
						title:title
					});
				}
			});
			function init(el)
			{
				if(oper)
				{
					el.find("[id=table_oper]").show();
				}
				
				el.find("[id=ignore_btn]").click(function (){
					var attr;
					var ignore_url;
					if(flag == "2")
					{
						attr = "faultNO";
						ignore_url = "faultAlarmEvent/doIgnore";
					}
					else if(flag == "3")
					{
						attr = "performanceNo";
						ignore_url = "performanceEvent/doPerformanceEventIgnore";
					}
					else if(flag == "13")
					{
						attr = "deploy_NO";
						ignore_url = "deployEvent/doIgnore";
					}
					self.ignore({
						gridEl: el.find("[id=table_div]"),
						attr: attr,
						ignore_url: ignore_url,
						cb: function() {
							g_dialog.operateAlert(el);
							g_grid.render(el.find("[id=table_div]") ,{
								url : url,
								header : header,
								paramObj : opt.paramObj,
								hideSearch:true,
								dbClick:event_record_dbclick
							});
						}
					});
				});
				el.find("[id=create_btn]").click(function (){
					var descKey;
					var eventIdKey;
					var eventTypeVal;
					var eventNameKey;
					if(flag == "3"){
						descKey = "perfModule";
						eventIdKey = "performanceNo";
						eventTypeVal = "3";
						eventNameKey = "perfName";
					}
					else if(flag == "2"){
						descKey = "faultModule";
						eventIdKey = "faultNO";
						eventTypeVal = "2";
						eventNameKey = "faultName";
					}
					else if(flag == "13"){
						descKey = "depl_MODULE";
						eventIdKey = "deploy_NO";
						eventTypeVal = "13";
						eventNameKey = "depl_NAME";
					}
					self.createWorkOrder({
						gridEl : el.find("[id=table_div]"),
						descKey : descKey,
						eventIdKey : eventIdKey,
						eventTypeVal : eventTypeVal,
						eventNameKey : eventNameKey,
						cbf: function() {
							g_dialog.operateAlert(el);
							g_grid.render(el.find("[id=table_div]") ,{
								url : url,
								header : header,
								paramObj : opt.paramObj,
								hideSearch:true,
								dbClick:event_record_dbclick
							});
						}
					});
					
				});
			}

			function initAfter(el)
			{
				if(opt.url)
				{
					url = opt.url;
				}
				if(opt.header)
				{
					header = opt.header;
				}
				g_grid.render(el.find("[id=table_div]") ,{
					url : url,
					header : header,
					paramObj : opt.paramObj,
					hideSearch:true,
					dbClick:event_record_dbclick,
					paginator : false,
					showCount : true
				});
			}
			function event_record_dbclick(rowData) {
				if(flag == "3"){
					self.performEventDetail(rowData);
				}
				else if(flag == "2"){
					self.faultEventDetail(rowData);
				}
				else if(flag == "13"){
					self.deployEventDetail(rowData);
				}
			}
		},
		/** 
			函数名 : eventCustomCol
			参数   : tplUrl
					 colQueryUrl
					 customColumnsUrl
					 cbf
					 type

		*/
		eventCustomCol : function (opt){
			var eventCol = {
				"fault" : [
							{id:"faultNameCol",label:"事件名称"},{id:"currentStatusCol",label:"当前状态"},
							{id:"faultModuleCol",label:"事件描述"},{id:"edNameCol",label:"资产名称"},
							{id:"classNameCol",label:"事件类型"},{id:"faultLevelCol",label:"事件等级"},
							{id:"bdomainNameCol",label:"业务域"},{id:"sdomainNameCol",label:"安全域"},
							{id:"firstEnterDateCol",label:"首次发生时间"},{id:"enterDateCol",label:"最新发生时间"},
							{id:"updateDateCol",label:"恢复时间"},{id:"faultStatusCol",label:"处理状态"},
							{id:"ipvAddressCol",label:"资产IP"},{id:"faultNOCol",label:"事件编号"},
							{id:"trueOverNumsCol",label:"发生次数"},{id:"continueTimeCol",label:"持续时间"}
						  ],
				"perform" : [
							{id:"perfNameCol",label:"事件名称"},{id:"currentStatusCol",label:"当前状态"},
							{id:"perfModuleCol",label:"事件描述"},{id:"valueCol",label:"性能值"},
							{id:"edNameCol",label:"资产名称"},{id:"classNameCol",label:"事件类型"},
							{id:"perfLevelCol",label:"事件等级"},{id:"bdomainNameCol",label:"业务域"},
							{id:"sdomainNameCol",label:"安全域"},{id:"firstEnterDateCol",label:"首次发生时间"},
							{id:"enterDateCol",label:"最新发生时间"},{id:"updateDateCol",label:"恢复时间"},
							{id:"perfStatusCol",label:"处理状态"},{id:"ipvAddressCol",label:"资产IP"},
							{id:"performanceNoCol",label:"事件编号"},{id:"trueOverNumsCol",label:"发生次数"},
							{id:"continueTimeCol",label:"持续时间"}

						  ],
				"sec" : [
							{id:"eventName",label:"事件名称"},{id:"kindName",label:"类型"},
							{id:"levelId",label:"事件等级"},{id:"eventCount",label:"聚合数量"},
							{id:"srcIpv",label:"源IP"},{id:"srcIpAddr",label:"源IP名称"},
							{id:"dstIpv",label:"目的IP"},{id:"dstIpAddr",label:"目的IP名称"},
							{id:"atDate",label:"聚合开始时间"},{id:"upDate",label:"聚合结束时间"},
							{id:"deviceTypeName",label:"发生源设备类型"},{id:"fromIpv",label:"发生源设备IP"},
							{id:"srcPort",label:"源端口"},{id:"dstPort",label:"目的端口"},
							{id:"securityName",label:"安全域"},{id:"stateId",label:"状态"},
							{id:"protocol",label:"协议"},{id:"eventId",label:"事件编号"}
						]
			}
			$.ajax({
					type: "GET",
					url: "js/plugin/event/event.html",
					//url: opt.tplUrl,
					success: function(data) {
						g_dialog.dialog($(data).find("[id=custom_template]"), {
							width: "630px",
							initAfter: initAfter,
							title: "自定义列",
							saveclick: save
						});
					}
			});

			function initAfter(el) {
				um_ajax_get({
					//url: list_query_url,
					url: opt.colQueryUrl,
					maskObj: el,
					successCallBack: function(data) {
						var el_event = el.find("#col_list_div")
						var sortable
						if (!data)
						{
							data = "depl_NAMECol,ed_IDCol,monitorNameCol,enter_DATECol,depl_COUNTCol";
						}
						var event_col_list = eventCol[opt.typeName]
						var event_include_col = []
						var data_array = data.split(",")
						for (var i = 0; i < data_array.length; i++) {
							event_include_col.push(
								_.find(event_col_list ,function (tmp){return data_array[i] == tmp.id})
							)
						}
						var event_exclude_col = _.filter(event_col_list ,function (tmp){
							return data.indexOf(tmp.id) < 0
						})
						for (var i = 0; i < event_include_col.length; i++) {
							el_event.append('<div class="col-lg-4">' +
									        	'<div class="checkbox animated">' +
													  '<label class="i-checks">' +
													    '<input type="checkbox" checked name="ids" value="'+event_include_col[i].id+'"><i></i>' +
													  '</label>' +
													  '<span class="__sort">'+event_include_col[i].label+'</span>' +
												'</div>' +
									       '</div>')
						}
						for (var i = 0; i < event_exclude_col.length; i++) {
							el_event.append('<div class="col-lg-4">' +
									        	'<div class="checkbox animated">' +
													  '<label class="i-checks">' +
													    '<input type="checkbox" name="ids" value="'+event_exclude_col[i].id+'"><i></i>' +
													  '</label>' +
													  '<span class="__sort">'+event_exclude_col[i].label+'</span>' +
												'</div>' +
									       '</div>')
						}
						el_event.find("[type=checkbox]").eq(0).attr("data-id" ,"ids")
						var el_btn = el.find("#sort_btn")
						el_btn.click(function (){
							if (el_event.find(".mask").size() > 0)
							{
								el_btn.text("排序")
								el_event.find(".mask").remove()
								sortable.destroy()
							}
							else
							{
								el_btn.text("确认")
								el_event.find(".checkbox").after('<div class="mask"></div>')
								sortable = new Sortable(document.getElementById("col_list_div") ,{handle: ".col-lg-4"});
							}

						})
						// el.umDataBind("renderCheckBox", el, {
						// 	value: data.split(","),
						// 	name: "ids"
						// })
					}
				})
			}

			function save(el, saveObj) {
				var idArray = saveObj.ids.split(",");
				if (idArray.length == 0 || idArray[0] == "") {
					g_dialog.operateAlert(el, "请至少选择一项。", "error");
					return false;
				}
				if (idArray.length > 8) {
					g_dialog.operateAlert(el, "最多只能选择八项", "error");
					return false;
				}
				//saveObj.type = "2";
				saveObj.type = opt.type;
				um_ajax_post({
					//url: custom_columns_url,
					url: opt.customColumnsUrl,
					paramObj: saveObj,
					maskObj: el,
					successCallBack: function(data) {
						g_dialog.hide(el);
						g_dialog.operateAlert(null, "操作成功");
						opt.cbf && opt.cbf();
					}
				})
			}
		},
		eventExport : function (opt){
			var obj = new Object();
			for (var i = 0; i < current_header.length; i++) {
				if (opt.nocol) 
				{
					obj[current_header[i].substr(0 ,current_header[i].length)] = 1;
				}
				else
				{
					obj[current_header[i].substr(0 ,current_header[i].length-3)] = 1;
				}
			}
			var idArray = g_grid.getIdArray($("#table_div") ,{chk:true,attr:opt.attr});
			window.location.href = index_web_app + opt.url + "?eventIds=" + idArray.join(",") + "&title=" + encodeURI(JsonTools.encode(obj)) + "&queryStr=" + encodeURI(opt.queryObjStr);
		},
		monitorDetail : function(opt){
			var monitorTypeId = opt.monitorTypeId;
			if (opt.version == "LINUX_SNMP")
			{
				monitorTypeId = "LINUX_SNMP";
			}
			if (opt.version == "WINDOWS_SNMP")
			{
				monitorTypeId = "WINDOWS_SNMP";
			}
			var url = "#/monitor_info/monitor_obj/monitor_info_bak?monitorTypeId="
										+monitorTypeId+"&monitorId="+opt.monitorId+"&monitorName="+opt.monitorName+"&regionId="+(opt.regionId==null?"":opt.regionId)
										+"&assetId="+opt.edId+"&hideMenu=1"+"&queryByMonitor=1";
			url = encodeURI(url);
		    url = encodeURI(url);
			window.open(url);
		}
	}

	function __viewEventUpdate(eventNo ,type ,cbf){
		var url
		var paramObj = {}
		if (type == "fault")
			url = "faultAlarmEvent/updateViewEvent",paramObj.faultNO = eventNo
		if (type == "perform")
			url = "performanceEvent/updateViewEvent",paramObj.performanceNo = eventNo
		um_ajax_get({
			url : url,
			paramObj : paramObj,
			successCallBack : function (data){
				cbf()
			}
		})
	}

});