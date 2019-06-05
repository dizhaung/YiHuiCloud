/** 
	风险等级背景色
*/
var dict_level_name_bgcolor = {
	"很高" :  "rgba(196, 18, 18, 0.85)",
	"高"   :  "rgba(245, 45, 18, 0.85)",
	"中"   :  "rgba(255, 120, 0, 0.85)",
	"低"   :  "rgba(244, 160, 14, 0.85)",
	"很低" :  "rgba(230, 196, 9, 0.85)",
	"未定义" :  "#cfcece",
	"未计算" :  "#cfcece",
	"未知" :  "#cfcece"
};

var dict_level_value_bgcolor = {
	"vhigh" : "rgba(196, 18, 18, 0.85)",
	"high"   : "rgba(245, 45, 18, 0.85)",
	"normal"   : "rgba(255, 120, 0, 0.85)",
	"low"   : "rgba(244, 160, 14, 0.85)",
	"vlow" : "rgba(230, 196, 9, 0.85)"
};

var dict_level_bgcolor = {
	"vhigh" : "#f7636d",
	"high"   : "#f68e56",
	"normal"   : "#f6b856",
	"low"   : "#c0d755",
	"vlow" : "#3bc35f"
};

var dict_monitor_status_key_value = {
	"0" : "正常",
	"1" : "未知",
	"2" : "凭证",
	"3" : "性能",
	"4" : "故障"
}

var dict_monitor_status_color = {
	"正常" : "#3bc35f",
	"性能" : "#f6b856",
	"故障" : "#f7636d",
	"凭证" : "#40a2e7",
	"未知" : "#d2d2d2"
}

var dict_event_color = {
	"配置事件" : "#62cb31",
	"性能事件" : "#f6b856",
	"故障事件" : "#f7636d",
	"安全事件" : "#40a2e7"
}
var dict_monitor_status_key_color = {
	"normal" : "#3bc35f",
	"perf" : "#f6b856",
	"fault" : "#f7636d",
	"proof" : "#40a2e7",
	"unknown" : "#d2d2d2"
}

var dict_tree_icon_bgcolor = {
	"0" : "#43bea6",
	"1" : "#3861fc",
	"2" : "#f9b94d",
	"3" : "#fb6469",
}

var dict_fps_bg_color = {
	"fault" : "#f7636d",
	"perf" : "#f6b856",
	"sec" : "#40a2e7",
	"nor" : "#3bc35f",
	"unknown" : "#d2d2d2"
}

// 风险趋势对象
var risk_tend_id_obj = {
	"3" : {"icon":"risk-circle-arrow-up" ,"name":"上升" ,"color":"#ec7063"},
	"2" : {"icon":"risk-circle-arrow-right" ,"name":"不变" ,"color":""},
	"1" : {"icon":"risk-circle-arrow-down" ,"name":"下降" ,"color":"#1abc9c"}
}

var dict_event_status = {
	"1" : {name:"未处理"},
	"2" : {name:"忽略"},
	"3" : {name:"处理中"},
	"4" : {name:"已处理"}
}

var dict_big_panel = {
	"data" : "数据分析中心",
	"net"  : "网络监控中心",
	"event": "事态监控中心",
	"topo" : "拓扑展示中心",
	"biz"  : "应用监控中心"
}

var dict_fault_event_header = [
									{text:"事件名称",name:"faultName",align:"left"},
									{text:"当前状态",name:"currentStatus",render: function(text) {
										return (text == "1" ? "正常" : "异常");
									},searchRender:function (el){
										var data = [
														{text:"----" ,id:"-1"},
								  						{text:"正常" ,id:"1"},
								  						{text:"异常" ,id:"0"}
											  		];
										g_formel.select_render(el ,{
											data : data,
											name : "currentStatus"
										});
									}},
									{text:"状态",name:"faultStatus",render:function(text){
									  	var status;
									  	switch(parseInt(text)){
									  		case 1: status="未处理"; break;
									  		case 2: status="忽略"; break;
									  		case 3: status="处理中"; break;
									  		case 4: status="已处理"; break;
									  		default :break;
									  	}
									  	return status;
									},searchRender:function(el){
									  var data = [
							  						{text:"未处理" ,id:"-1"},
							  						{text:"忽略" ,id:"2"},
							  						{text:"处理中" ,id:"3"},
							  						{text:"已处理" ,id:"4"}
										  		];
									  g_formel.select_render(el ,{
										  data : data,
										  name : "faultStatus"
									  });
								    }},
									{text:"资产名称",name:"edName",align:"left"},
									{text:"事件类型",name:"className"},
									{text:"事件等级",name:"faultLevel",render: function(text) {
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
										return level;
									},searchRender: function (el){
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
									}},
									{text:"最新发生时间",name:"enterDate",align:"left"},
									{text:"恢复时间",name:"updateDate"}
								];
var dict_perform_event_header = [
									{text:"事件名称",name:"perfName",align:"left"},
									{text:"当前状态",name:"currentStatus",render: function(text) {
										return (text == "1" ? "正常" : "异常");
									},searchRender:function (el){
										var data = [
														{text:"----" ,id:"-1"},
								  						{text:"正常" ,id:"1"},
								  						{text:"异常" ,id:"0"}
											  		];
										g_formel.select_render(el ,{
											data : data,
											name : "currentStatus"
										});
									}},
									{text:"状态",name:"perfStatus",render:function(text){
									  	var status;
									  	switch(parseInt(text)){
									  		case 1: status="未处理"; break;
									  		case 2: status="忽略"; break;
									  		case 3: status="处理中"; break;
									  		case 4: status="已处理"; break;
									  		default :break;
									  	}
									  	return status;
									  },searchRender:function(el){
										  var data = [
								  						{text:"未处理" ,id:"-1"},
								  						{text:"忽略" ,id:"2"},
								  						{text:"处理中" ,id:"3"},
								  						{text:"已处理" ,id:"4"}
											  		];
										  g_formel.select_render(el ,{
											  data : data,
											  name : "perfStatus"
										  });
							        }},
									{text:"资产名称",name:"edName",align:"left"},
									{text:"事件类型",name:"className"},
									{text:"事件等级",name:"perfLevel",render: function(text) {
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
											default:
												break;
										}
										return level;
									},searchRender: function (el){
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
											name : "perfLevel"
										});
									}},
									{text:"最新发生时间",name:"enterDate",align:"left"},
									{text:"恢复时间",name:"updateDate"}
								];
var dict_sec_event_header = [
								{text:"事件名称",name:"eventName",align:"left"},
								{text:"状态",name:"stateName"},
								{text:"事件类型",name:"kindName"},
								{text:"事件等级",name:"levelId",render: function(text) {
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
										default:
											break;
									}
									return level;
								}},
								{text:"源IP",name:"srcIpv"},
								{text:"目的IP",name:"dstIpv"},
								{text:"聚合开始时间",name:"atDate",align:"left"},
								{text:"发生源设备类型",name:"deviceTypeName"}
							];
var dict_pass_info = {
	"PASS_MAX_DAYS" : "密码最长过期天数",
	"PASS_MIN_DAYS" : "密码最小过期天数",
	"PASS_MIN_LEN" : "密码最小长度",
	"PASS_WARN_AGE" : "密码过期警告天数",
	"maxrepeats" :  "密码字符重复出现的次数",
	"histexpire" :  "用户密码重新使用间隔",
	"histsize" :  "新密码不能和之前几次的相同",
	"minage" :  "最短修改密码的时间",
	"mindiff" :  "新口令与原口令至少要多少字符不相同",
	"minalpha" :  "口令中至少包含的字母数",
	"minother" :  "口令中至少包含特殊字符的个数",
	"minlen" :  "口令的最小长度",
	"loginretries" :  "密码最大输错多少次",
	"maxage" :  "密码的可用时间（周）",
	"maxexpired" :  "密码时间超过maxage后多长时间用户或过期"
}

var dict_key_info = {
	"UPDATETIME" : "获取时间"
}

var event_level_id_text = {
	"-1": "----",
	"0" : "很高",
	"1" : "高",
	"2" : "中",
	"3" : "低",
	"4" : "很低"
}

var event_state_id_text = {
	"1" : "未处理",
	"2" : "忽略",
	"3" : "处理中",
	"4" : "已处理"
}

var dict_ledger_status = {
	"1" : "使用中",
	"2" : "闲置",
	"3" : "废弃"
}

var vmware_status = {
	"running": "运行中",
	"stopped":"已停止",
	"unknown":"未知",
	"hibernated":"已休眠",
	"creating":"创建中或模板正在部署虚拟机或正在导入模板",
	"shutting-down":"删除中",
	"migrating":"迁移中",
	"fault-resuming":"故障恢复中",
	"starting":"启动中",
	"stopping":"停止中",
	"hibernating":"休眠中",
	"pause" : "已暂停",
	"recycling":"回收中"
}