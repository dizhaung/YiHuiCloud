define(['/js/plugin/event/event.js'] ,function (pevent){
	return {

		fault_event_list : function (opt){
			var el_grid = opt.elGrid || $("#event_table")
			var fault_event_list_url = "faultAlarmEvent/queryFaultEventList";
            var fault_event_list_header = [
			      {text:"事件名称" ,name:"faultName" ,align:"left" ,tip:true ,tipInfo:"faultModule"},
			      {text:"当前状态",
						name:"currentStatus",
						align:"left",
						render: function(text) {
							return (text == "1" ? "正常" : "异常");
						},
						searchRender:function (el){
							var data = [
											{text:"----" ,id:"-1"},
					  						{text:"正常" ,id:"1"},
					  						{text:"异常" ,id:"0"}
								  		];
							g_formel.select_render(el ,{
								data : data,
								name : "currentStatus"
							});
						}
				  },
			      {text:"状态" , align:"left", name:"faultStatus",render: function(text) {
						return dict_event_status[text].name
				  }},
			      {text:"事件类型" ,align:"left" ,name:"className"},
			      {text:"最新发生时间" ,align:"left" ,name:"enterDate"},
			      {text:"恢复时间" ,align:"left" ,name:"updateDate"}
		    ];
		    var fault_event_list_oper = [{icon:"rh-icon rh-event-rela-view",text:"查看事件关联信息",aclick:view_event_relation}];

		    //opt.param.faultStatus = '1,3';
		    opt.param.inpuDate = $("#query_time_label").text()
			g_grid.render(el_grid ,{
				url : fault_event_list_url,
				header : fault_event_list_header,
				oper : fault_event_list_oper,
				operWidth : '60px;',
				paramObj : opt.param,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				paginator : false,
				showCount : true,
				showTip : {
					render : function (rowData){
						g_dialog.rightDialog({
							width : "800px",
							render : function (el_form ,el_mask){
								$.ajax({
									type: "GET",
									url: "module/sec_manage/event_analy/fault_event_analy_tpl.html",
									success: function(data) {
										el_form.append($(data).find("[id=detail_template]").html());
										// el_form.find("[id=detailmore_btn]").remove();
										el_form.find('[data-id=monitorName]').css({color:"rgba(0,0,0,0.85)",cursor:"auto"})
										el_form.find("[id=detailmore_btn]").click(function() {
											$.ajax({
												type: "GET",
												url: "module/sec_manage/event_analy/fault_event_analy_tpl.html",
												success: function(data) {
													g_dialog.dialog($(data).find("[id=detailmore_template]"), {
														width: "600px",
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
													paramObj : {faultAlarmStore:{faultNO:rowData.faultNO}},
													isLoad : true,
													maskObj : "body",
													allowCheckBox: false,
													hideSearch : true
												});
											}
										});
										um_ajax_get({
											url : "faultAlarmEvent/queryFaultEventDetail",
											paramObj : {faultNO:rowData.faultNO},
											isLoad : false,
											maskObj : "body",
											successCallBack : function(data){
												el_form.umDataBind("render", data.faultAlarmStore[0]);
												el_form.find("[data-id = faultLevel]").text(data.faultAlarmStore[0].faultLevel);
												el_mask.hide();
											}
										});
									}
								});
							}
						});
					}
				},
				queryBefore : function (queryObj){
					queryObj = $.extend(queryObj ,opt.param);
				}
			});
		},
		perform_event_list : function (opt){
			var el_grid = opt.elGrid || $("#event_table")
			var perform_event_list_url = "performanceEvent/queryPerformanceEventList";
			var perform_event_list_header = [
			      {text:"事件名称" ,name:"perfName" ,tip:true ,align:"left",tipInfo:"perfModule"},
			      {text:"当前状态",
						name:"currentStatus",
						align:"left",
						render: function(text) {
							return (text == "1" ? "正常" : "异常");
						},
						searchRender:function (el){
							var data = [
											{text:"----" ,id:"-1"},
					  						{text:"正常" ,id:"1"},
					  						{text:"异常" ,id:"0"}
								  		];
							g_formel.select_render(el ,{
								data : data,
								name : "currentStatus"
							});
						}
				  },
			      {text:"状态" ,name:"perfStatus",align:"left",render: function(text) {
						return dict_event_status[text].name
				  }},
			      {text:"事件类型" ,align:"left",name:"className"},
			      {text:"最新发生时间" ,align:"left",name:"enterDate"},
			      {text:"恢复时间" ,align:"left",name:"updateDate"}
		   	];
			var perform_event_list_oper = [{icon:"rh-icon rh-event-rela-view",text:"查看事件关联信息",aclick:view_event_relation}];

			//opt.param.perfStatus = "1,3";
			opt.param.inpuDate = $("#query_time_label").text()
			g_grid.render(el_grid ,{
				url : perform_event_list_url,
				header : perform_event_list_header,
				oper : perform_event_list_oper,
				operWidth : '60px;',
				paramObj : opt.param,
				gridCss : "um-grid-style",
				hasBorder : false,
				hideSearch : true,
				paginator : false,
				showCount : true,
				showTip : {
					render : function (rowData){
						g_dialog.rightDialog({
							width : "800px",
							render : function (el_form ,el_mask){
								$.ajax({
									type: "GET",
									url: "module/sec_manage/event_analy/perform_event_analy_tpl.html",
									success: function(data) {
										el_form.append($(data).find("[id=perform_detail_template]").html());
										el_form.find('[data-id=monitorName]').css({color:"rgba(0,0,0,0.85)",cursor:"auto"})
										$("#detailmore_btn").click(function (){
											$.ajax({
												type: "GET",
												url: "module/sec_manage/event_analy/perform_event_analy_tpl.html",
												success :function(data)
												{
													g_dialog.dialog($(data).find("[id=detailmore_template]"),{
														width:"600px",
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
													paramObj : {performanceStore:{performanceNo:rowData.performanceNo}},
													isLoad : true,
													maskObj : "body",
													allowCheckBox : false,
													hideSearch : true
												});

											}
										});

										um_ajax_get({
											url : "performanceEvent/queryPerformanceEventDetail",
											paramObj : {performanceStore : {performanceNo:rowData.performanceNo}},
											isLoad : false,
											maskObj : "body",
											successCallBack : function(data){
												el_form.umDataBind("render", data[0]);
												el_form.find("[data-id =perfLevel]").text(data[0].perfLevel);
												el_mask.hide();
											}
										});
									}
								});
							}
						});
					}
				},
				queryBefore : function (queryObj){
					queryObj = $.extend(queryObj ,opt.param);
				}
			});
		},
		event_ignore : function (opt) {
			var el_grid = opt.elGrid || $("#event_table")
			var self = this
			var monitorId = opt.param.monitorId
			var attr
			var ignore_url
			if (opt.type == "fault_event_list") {
				attr = "faultNO"
				ignore_url = "faultAlarmEvent/doIgnore"
			}
			else if(opt.type == "perform_event_list"){
				attr = "performanceNo"
				ignore_url = "performanceEvent/doPerformanceEventIgnore"
			}
			pevent.ignore({
				gridEl : el_grid,
				attr : attr,
				ignore_url : ignore_url,
				cb: function() {
					self[opt.type]({
						param : {monitorId : monitorId,
								 flag : 1 ,
								 inpuDate:g_moment().format("YYYY-MM-DD HH:mm:ss")}
					})
				}
			});
		},
		event_create : function(opt) {
			var el_grid = opt.elGrid || $("#event_table")
			var self = this
			var monitorId = opt.param.monitorId
			var descKey 
			var eventIdKey
			var eventTypeVal
			var eventNameKey
			if (opt.type == "fault_event_list") {
				descKey = "faultModule"
				eventIdKey = "faultNO"
				eventTypeVal = "2"
				eventNameKey = "faultName"
			}
			else if(opt.type == "perform_event_list"){
				descKey = "perfModule"
				eventIdKey = "performanceNo"
				eventTypeVal = "3"
				eventNameKey = "perfName"
			}
			pevent.createWorkOrder({
				gridEl : el_grid,
				descKey : descKey,
				eventIdKey : eventIdKey,
				eventTypeVal : eventTypeVal,
				eventNameKey : eventNameKey,
				cbf: function() {
					self[opt.type]({
						param : {monitorId : monitorId,
								 flag : 1 ,
								 inpuDate:g_moment().format("YYYY-MM-DD HH:mm:ss")}
					})
				}
			});
		}

	}
})

var list_detail_header = [
						  {text: '',name: "t" ,width:3},
						  {text: '首次发生时间',name: "enterDate" ,align:"left"},
						  {text: '最新发生时间',name: "lastDate" ,align:"left"},
						  {text: '更新时间',name: "updateDate" ,align:"left"},
						  {text: '恢复时间',name: "recoveryDate" ,align:"left"}];

function view_event_relation(rowData){
	var keyProperty = rowData.keyProperty;
	var eventNo;
	eventNo = rowData[keyProperty];
	var num=0;
	um_ajax_get({
		url : 'monitorIgnore/queryEventRalationNum',
		paramObj : {eventNo : eventNo},
		isAsync : false,
		successCallBack : function (data){
			num = data.num;
		}
	});
	if(num!=0){
		window.open('#/sys_manage/monitor_config/event_relation?eventNo='+eventNo+'&keyProperty='+keyProperty+'&hideMenu=1');
	}else {
		g_dialog.operateAlert(null,'监控器没有该事件类型的关联','error');
	}
}