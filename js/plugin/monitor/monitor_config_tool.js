define(['js/plugin/tab/tab.js'],function (tab){
	var msg = {
		repeat : "记录重复！",
		noSelect : "未选中任何记录!",
		select : "请选择记录。",
		selectOne : "请选择一条记录。",
		selectOnlyOne : "只允许选择一条记录。",
		chooseTableSpace : "请选择表空间。",
		testSuccess : "配置测试成功！",
		testFail : "配置测试失败！",
		delSuccess : "删除成功！",
		operate : "操作成功！",
		blank : "该项输入的值不能为空。",
		noDisk : "暂无磁盘数据。",
		noZone : "暂无分区数据。",
		noTableSpace : "暂无表空间数据。"
	};

	var procBaseLineHeader = [
								{text:'进程名称',name:"procName" ,width:22},
								{text:'进程路径',name:"procPath" ,tip:true ,width:23},
								{text:'进程数量',name:"procNum" ,width:11},
								{text:'关注状态',name:"atteStatus" ,width:11 ,render:function (txt){
									return (txt == 1? "关注" : "不关注");
								}},
								{text:'运行状态',name:"runStatus" ,width:11 ,render:function (txt){
									return (txt == 1? "运行" : "未运行");
								}},
								{text:'基线时间',name:"enterDate" ,width:22}
							  ];

	var portBaseLineHeader = [
								{text:'端口名称',name:"portName"},
								{text:'关注状态',name:"atteStatus" ,render:function (txt){
									return (txt == 1? "关注" : "不关注");
								}},
								{text:'运行状态',name:"runStatus" ,render:function (txt){
									return (txt == 1? "运行" : "未运行");
								}},
								{text:'基线时间',name:"enterDate"}
							 ];
	var diskBaseLineHeader = [
								{text:'磁盘名称',name:"diskName"},
								{text:'关注状态',name:"atteStatus" ,render:function (txt){
									return (txt == 1? "关注" : "不关注");
								}},
								{text:'运行状态',name:"runStatus" ,render:function (txt){
									return (txt == 1? "运行" : "未运行");
								}},
								{text:'基线时间',name:"enterDate"}
							 ];
	var fileBaseLineHeader = [
								{text:'数据文件名称',name:"dbFileName"},
								{text:'关注状态',name:"atteStatus" ,render:function (txt){
									return (txt == 1? "关注" : "不关注");
								}},
								{text:'基线时间',name:"enterDate"}
							 ];
	var webBaseLineHeader = [
								{text:'WEB程序名称',name:"warName"},
								{text:'关注状态',name:"atteStatus" ,render:function (txt){
									return (txt == 1? "关注" : "不关注");
								}},
								{text:'基线时间',name:"enterDate"}
							 ];

	var step4CertChanged = false;

	//通用：实例操作-删除按钮
	function instance_remove(rowData ,rowEl) 
	{
		g_dialog.operateConfirm(index_delete_confirm_msg ,{
			saveclick : function (el){
				rowEl.remove();
				g_dialog.operateAlert(el ,msg.delSuccess);
			}
		});
	}

	// 通用：凭证信息表单的disabled属性增删
	function dis(el) 
	{
		/** arguments: 
			* 1.[el]：目标父节点元素,必填参数，dom对象或数组
			* 2.[type]：目标节点类型,选填参数，字符串或数组，默认为input
			* 3.r(reverse)：属性开关, 默认false为添加disabled属性
			**/
		var a = arguments;
		0===a.length && console.log("ERROR: dis(el,[type,r]) 参数缺失.");
		var el=(a[0].constructor!=Array) ? [el] : el,type=["input"],r=false;
		if (2 === a.length) 
		{
			if ("boolean" === typeof a[1]) 
			{
				r = a[1];
			} 
			else 
			{
				type = (Array != a[1].constructor) ? [a[1]] : a[1];
			}
		}
		if (3 === a.length) 
		{
			type = Array != a[1].constructor ? [a[1]] : a[1];
			r = a[2];
		}
		for (var i = 0; i < el.length; i++) {
			for (var j = 0; j < type.length; j++) {
				el[i].find(type[j]) && (r ? el[i].find(type[j]).removeAttr("disabled") : el[i].find(type[j]).attr("disabled","disabled"));
			}
		}
	}

	// 通用：凭证信息测试
	function certTest(dom,type,correct) 
	{
		/**
			* arguments:
			* 1.dom: 被测div
			* 2.type: 凭证类型 ssh,telnet,snmp
			* 3.correct(){}: 参数矫正
			**/
			var div=dom,getter="[data-test="+type+"]",
				url={
					"ssh":"AssetOperation/doTestSsh",
					"telnet":"AssetOperation/doTestTelnet",
					"snmp":"AssetOperation/doTestSnmp",
					"wmi":"AssetOperation/doTestWmi"
				};

			div.find(getter).click(function(){
				var paramObj = div.umDataBind("serialize");
				paramObj.snmpWCommunity = paramObj.writeCommunity || "";
				correct && correct(paramObj);
				g_dialog.dialog('<div class="p10 tc" style="height:100px;line-height:80px;" id="test_alert"></div>' ,{
					width : "400px",
					title : "测试结果",
					isDetail : true,
					init : function(el){
						um_ajax_post({
							url : url[type],
							paramObj : paramObj,
							isLoad : true,
							maskObj : el.find("[class=modal-body]"),
							successCallBack : function (data){
								el.find("[id=test_alert]").html(data && data);
							}
						});
					}
				});
			});
	}

	// 通用：snmpVersion  change事件
	function snmpVerChange(el) 
	{
		var snmpVer = el.find("[data-id=snmpVersion]");
		var snmpv1 = el.find("[data-getter=v1]");
		var snmpv2 = el.find("[data-getter=v2]");
		var snmpv3 = el.find("[data-getter=v3]");
		
		snmpVer.change(function(){

			if($(this).val()=="")
			{
				snmpv1.hide();
				snmpv2.hide();
				snmpv3.hide();
			}
			if($(this).val()=="1")
			{
				dis(snmpv1,true);// 去掉snmpv1中input的disabled属性
				snmpv1.show();
				snmpv2.hide();
				snmpv3.hide();
				dis([snmpv2,snmpv3],["input","select"]);// 为snmpv2，snmpv3中的input和select添加disabled属性
			} 
			if($(this).val()=="2") 
			{
				snmpv1.hide();
				dis(snmpv2,true);
				snmpv2.show();
				snmpv3.hide();
				dis([snmpv1,snmpv3],["input","select"]);
			}
			if($(this).val()=="3") 
			{
				snmpv1.hide();
				snmpv2.hide();
				dis([snmpv1,snmpv2]);
				dis(snmpv3,["input","select"],true);
				snmpv3.show();
			}
		});
		snmpVer.trigger("change");
		//el.find("[data-store=connectType]") ? (el.find("[data-store=connectType]").val() == "SNMP" && snmpVer.trigger("change")) : snmpVer.trigger("change");
		
	
	}

	// 表空间 阈值双击计算
	function tablethresholdCalc(trData) 
	{
		function validate(){
			if(!/^[1-9][0-9]?$/.test(Number(trData.find("td").eq("2").find("div").html()))) 
			{
				var TrData = trData;
				g_dialog.dialog("输入格式不正确，请输入1-99的整数。",{
					width : "400px",
					isConfirmAlarm : true,
					saveclick : function(){
						TrData.find("td").eq("2").find("div").html("<input>");
						TrData.find("td").eq("2").find("input").focus();
						TrData.find("td").eq("2").find("input").blur(function (){
						TrData.find("td").eq("2").find("div").html($(this).val());
						TrData.data("data").tablethreshold = $(this).val();
						validate();
						var res = Math.round(TrData.data("data").tableSize*(1-Number(TrData.find("td").eq("2").find("div").html())/100));
						TrData.find("td").eq("3").find("div").html(res);
						return;
						});
					}
				});
				return false;
			} 
			else 
			{
				var res = Math.round(trData.data("data").tableSize*(1-Number(trData.find("td").eq("2").find("div").html())/100));
				trData.find("td").eq("3").find("div").html(res);
				return;
			}
		}
		validate();
	}

	// 表空间 剩余空间大小双击计算
	function tableLeftSizeCalc(trData) 
	{
		function validate(){
			if(!/^[1-9][0-9]*$/.test(Number(trData.find("td").eq("3").find("div").html())) || Number(trData.find("td").eq("3").find("div").html()) >= trData.data("data").tableSize) 
			{
				var TrData = trData;
				g_dialog.dialog("输入格式不正确，表空间大小为"+trData.data("data").tableSize+"M。",{
					width : "400px",
					isConfirmAlarm : true,
					saveclick : function(){
						TrData.find("td").eq("3").find("div").html("<input>");
						TrData.find("td").eq("3").find("input").focus();
						TrData.find("td").eq("3").find("input").blur(function (){
							TrData.find("td").eq("3").find("div").html($(this).val());
							TrData.data("data").tableLeftSize = $(this).val();
							validate();
							var res = Math.round(100-100*(Number(TrData.find("td").eq("3").find("div").html())/TrData.data("data").tableSize));
							TrData.find("td").eq("2").find("div").html(res);
							return true;
						});
					}
				});
				return false;
			} 
			else 
			{
				var resul = Math.round(Number(100-100*(Number(trData.find("td").eq("3").find("div").html())/Number(trData.data("data").tableSize))));
				trData.find("td").eq("2").find("div").html(resul);
				return;
			}
		}
		validate();
	}

	// 分区 阈值双击计算
	function moduleValueCalc(trData) 
	{
		function validate(){
			if(!/^[1-9][0-9]?$/.test(Number(trData.find("td").eq("2").find("div").html()))) 
			{
				var TrData = trData;
				g_dialog.dialog("输入格式不正确，请输入1-99的整数。",{
					width : "400px",
					isConfirmAlarm : true,
					saveclick : function(){
						TrData.find("td").eq("2").find("div").html("<input>");
						TrData.find("td").eq("2").find("input").focus();
						TrData.find("td").eq("2").find("input").blur(function (){
							TrData.find("td").eq("2").find("div").html($(this).val());
							TrData.data("data").value = $(this).val();
							validate();
							var res = Math.round(TrData.data("data").lastTime*(1-Number(TrData.find("td").eq("2").find("div").html())/100));
							TrData.find("td").eq("3").find("div").html(res);
							return;
						});
					}
				});
				return false;
			} 
			else 
			{
				var res = Math.round(trData.data("data").lastTime*(1-Number(trData.find("td").eq("2").find("div").html())/100));
				trData.find("td").eq("3").find("div").html(res);
				return;
			}
		}
		validate();
	}

	// 分区 剩余空间大小双击计算
	function performNameCalc(trData) 
	{
		function validate(){
			if(!/^[1-9][0-9]*$/.test(Number(trData.find("td").eq("3").find("div").html())) || Number(trData.find("td").eq("3").find("div").html()) >= trData.data("data").lastTime) 
			{
				var TrData = trData;
				g_dialog.dialog("输入格式不正确，分区空间为"+trData.data("data").lastTime+"M。",{
					width : "400px",
					isConfirmAlarm : true,
					saveclick : function(){
						TrData.find("td").eq("3").find("div").html("<input>");
						TrData.find("td").eq("3").find("input").focus();
						TrData.find("td").eq("3").find("input").blur(function (){
							TrData.find("td").eq("3").find("div").html($(this).val());
							TrData.data("data").performName = $(this).val();
							validate();
							var res = Math.round(100-100*(Number(TrData.find("td").eq("3").find("div").html())/TrData.data("data").lastTime));
							TrData.find("td").eq("2").find("div").html(res);
							return;
						});
					}
				});
				return false;
			} 
			else 
			{
				var resul = Math.round(100-100*(Number(trData.find("td").eq("3").find("div").html())/trData.data("data").lastTime));
				trData.find("td").eq("2").find("div").html(resul);
				return;
			}
		}
		validate();
	}

	// 主机类监控器 修改 可选进程下拉框render,需在对应监控的html模板中添加div，参考linux.html
	function progressSel(el,opt)
	{
		el.find("[data-show=edit]").show();
			var selectUl = el.find("[data-id=process_ul]");
			var selectData = opt ? opt.detail.preProcessGridStore : [];
			var selectLi = [];
			for (var i = 0; i < selectData.length; i++) {
				selectLi.push('<li class="p5 bbd"><i style="color:#ddd;" class="icon-circle f12 mr5"></i><span>'+selectData[i].imageName+'</span></li>');
			}
			selectUl.append(selectLi.join(""));
			selectUl.find("i").click(function(){
				var selectText = $(this).next().html();
				selectUl.find("i").removeClass("icon-checked");
				$(this).toggleClass("icon-checked");
				el.find("[data-flag=faultModule]").val("").val(selectText);
			});
			selectUl.slimscroll();
	}

	// 基线数据的封装
	function baseLineMap(el_btn ,opt ,storeKey ,i)
	{
		if (!i)
		{
			i = 0;
		}
		var array = [];
		if (opt.detail.monitorStore[i])
		{
			array = opt.detail.monitorStore[i][storeKey];
		}
		el_btn.data("data" ,array);
		var dataMap = new HashMap();
		var dataArrayTmp = el_btn.data("data");
		if (dataArrayTmp)
		{
			for (var i = 0; i < dataArrayTmp.length; i++) {
				dataMap.put(dataArrayTmp[i].rowId ,dataArrayTmp[i]);
			}
		}
		el_btn.data("map" ,dataMap);
	}

	/**
		* 监控器名_init : 指标信息初始化,进入第五步指标信息界面时触发
		* 监控器名_step4 : 凭证信息回显与表单测试功能，进入第四步凭证信息界面时触发
		* 监控器名_leave_step4 : 凭证信息数据封装,监控器最后提交时触发
		* 监控器名_step5_test ： 第五步界面中测试按钮数据封装，不包括第五步弹出框中的测试按钮
		*/

	return {
		msg:msg,
		step4CertChanged:step4CertChanged,
		ORACLE_init : function (el, opt)
		{
			var self = this;
			var url = {
				queryTableSpaceName : "monitorConfig/queryTableSpaceName",
				test : "monitorConfig/doTest"
			};
			var header = {
				h1 : [
					{text : "表空间名", name : "tableSpaceName"},
					{text : "阈值(%)", name : "tablethreshold", dbclick : true,
					tdBlur : function(trData){
							tablethresholdCalc(trData);
					}},
					{text : "剩余大小(M)", name : "tableLeftSize", dbclick : true,
					tdBlur : function(trData){
							tableLeftSizeCalc(trData);
					},
					render : function(trObj ,data){
						var res = Math.round(Number(data.tableSize)*(1-(Number(data.tablethreshold)/100)));
						return res;
					}},
					{text : "总大小(M)" ,name : "tableSize"}
				],
				h2 : [
					{text : "不监控表空间名", name : "tableSpaceName"},
					{text : "阈值(%)", name : "tablethreshold"},
					{text : "剩余大小(M)", name : "tableLeftSize"},
					{text : "总大小(M)" ,name : "tableSize"}
				],
				nu : [
					{text:"数据库实例名",name:"monitorDatabaseName"},
					{text:"端口",name:"monitorPort"},
					{text:"用户名",name:"monitorUserName",render:function (txt){
						return Encrypt(txt)
					}},
					{text:"连接数使用率阈值(%)",name:"connectUseRate"}
				]
			};
			var oper = {
				nu : [
							{icon:"rh-icon rh-edit",text:"修改",aclick:instance_edit},
							{icon:"rh-icon rh-delete",text:"删除",aclick:instance_remove}
						]
			};
			var tableTemp = {
				g_tableSize : [],
				tableSpaceName : []
			};
			var detailData = opt && opt.detail;
			var monitorId_pre = "";
			var instanceFlag = "upd";
			var instanceName;

			init();
			event_init();

			function event_init() 
			{
				var databaseDataStr = "";
				//新增按钮
				el.find("#database_add_btn").click(function(){
					instanceFlag = "add";
					instance_edit();
				});

				//批量删除
				el.find("#database_del_btn").click(function(){
					g_grid.getData(el.find("[data-id=database-nu]"),{chk:true}).length === 0 
						? g_dialog.operateAlert(el ,msg.noSelect ,"error") 
						: g_grid.removeData(el.find("[data-id=database-nu]"));
				});
			}

			function init() 
			{ 
				var detailStore = [];
				if (opt) 
				{ 
					monitorId_pre = detailData.monitorStore[0].monitorId.split("_")[0];
					for (var i = 0; i < detailData.monitorStore.length; i++) {
						detailStore.push(detailData.monitorStore[i]);
						detailStore[i].opFlag = "upd";
						detailStore[i].serviceName = "";
						detailStore[i].vip = "";
					} 
					if (opt.detail.monitorStore[0].dbUser == "1") 
					{
						el.find("[data-check=dbUser_checkbox]").attr("checked",true);
					}
					baseLineMap(el.find("[data-btn=setFileBaseLineHidden]").eq(0) ,opt ,"hostFileBaseLineDataStore" ,0);
					baseLineMap(el.find("[data-btn=setFileBaseLineHidden]").eq(1) ,opt ,"hostFileBaseLineDataStore" ,1);
				}
				var Ddata = opt ? detailStore : [];
				g_grid.render(el.find("[data-id=database-nu]") ,{
					data : Ddata,
					header : header.nu,
					oper : oper.nu,
					operWidth : "100px",
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
			}

			function instance_edit(rowData ,trObj)
			{
				var trIndex;
				if (trObj)
				{
					trIndex = trObj.index();
				}
				else
				{
					var tmpArray = g_grid.getData(el.find("[data-id=database-nu]") ,{chk:false});
					trIndex = tmpArray.length;
				}
				
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_22.html",
					success : function (data) 
					{
						var title = rowData ? "修改数据库信息" : "添加数据库信息";
						g_dialog.dialog($(data).find("[data-id=monitor_index_edit]") ,{
							width : "1050px",
							title : title,
							init : init,
							saveclick : save,
							top : "6%",
							autoHeight : true
						});
					}
				});

				var el_up_table;
				var el_down_table;
				var el_up_table_data_array;
				var el_down_table_data_array;
				var el_table_data_tmp;

				function init(el) 
				{
					var data_l = [];
					var data_r = [];
					if(rowData) 
					{
						instanceName = rowData.monitorDatabaseName;
						rowData.tablethreshold = rowData.unifyThreshold;
						el.umDataBind("render" ,rowData);
						if(rowData.connectType == -1)
						{
							el.find("[data-type=closeAlarmCheck]").click();
							el.find("[data-id=connectType]").attr("disabled","disabled");
							el.find("[data-id=connectType]").val("");
						} 
						else 
						{
							el.find("[data-type=openAlarmCheck]").click();
							el.find("[data-id=connectType]").removeAttr("disabled");
						} 
						if (rowData.dbUser == "1") 
						{
							el.find("[data-check=dbUser_checkbox]").attr("checked",true);
						}
						var ts = (rowData.tsvalues == null ? "" : rowData.tsvalues).split("|");
						var  dataD = [];
						for (var i = 0; i < ts.length; i++) {
							var rowD = ts[i].split(",");
							var tableSize = Math.round(Number(Number(rowD[2]) / (1-Number(rowD[1])/100)));
							dataD.push({tableSpaceName : rowD[0],tablethreshold : rowD[1],tableLeftSize : rowD[2],tableSize:rowD[3]});
						}
						data_l = dataD;
						var unTs = rowData.unTsvalues.split("|");
						var  dataDu = [];
						for (var i = 0; i < unTs.length; i++) {
							var rowDu = unTs[i].split(",");
							var tableSize = Math.round(Number(Number(rowDu[2]) / (1-Number(rowDu[1])/100)));
							dataDu.push({tableSpaceName : rowDu[0],tablethreshold : rowDu[1],tableLeftSize : rowDu[2],tableSize:rowDu[3]});
						}
						data_r = dataDu;
						opType = "edit";

						rowData.tsvalues ? "" : (data_l = []);
						rowData.unTsvalues ? "" : (data_r = []);
					} 
					databaseDataStr = (el.find("[data-id=temp_database_instance]").val() === "" || el.find("[data-id=temp_database_instance]").val() === undefined) ? "" : el.find("[data-id=temp_database_instance]").val() + "~";
					g_grid.render(el.find("[data-id=tableSpaceName]") ,{
						data : data_l,
						header : header.h1,
						paramObj : null,
						isLoad : false,
						tdDbClick : true,
						hideSearch : true,
						paginator : false
					});
					g_grid.render(el.find("[data-id=nottableSpaceName]") ,{
						data : data_r,
						header : header.h2,
						paramObj : null,
						isLoad : false,
						hideSearch : true,
						paginator : false
					});	
					//密码过期提醒启用否
					el.find("[data-type=openAlarmCheck]").click(function(){
							el.find("[data-id=connectType]").removeAttr("disabled");
					}); 
					el.find("[data-type=closeAlarmCheck]").click(function(){
							el.find("[data-id=connectType]").attr("disabled","disabled");
							el.find("[data-id=connectType]").val("");
					}); 
					el.find("[data-check=dbUser_checkbox]").click(function(){
						if($("[data-check=dbUser_checkbox]:checked").length>0) 
						{
							el.find("[data-id=dbUser]").val('1');
						} 
						else 
						{
							el.find('[data-id=dbUser]').val('0');
						}
					});
					//查询表空间
					el.find("[data-id=querytable]").click(function(){
						el.find("[data-id=tablethreshold]").blur();
						el.find("[data-id=monitorUserName]").blur();
						if (!g_validate.validate(el.find("[data-id=tablethreshold]")) || !g_validate.validate(el.find("[data-id=monitorUserName]"))) 
						{
							return false;
						}
						var databaseData = {
							monitorType : $("[data-id=temp_type]").val(),
							scCmd : $("[data-store=connectType]").val(),
							notMonitoredEntity : $("[data-id=temp_monitored_asset]").val(),
							monitorUserName : Encrypt(el.find("[data-id=monitorUserName]").val()),
							monitorPassWord : Encrypt(el.find("[data-id=monitorPassWord]").val()),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							serviceName : "",
							monitorAgent : $("[data-id=monitorAgent]").val(),
							vip : "",
						  tablethreshold : el.find("[data-id=tablethreshold]").val()
						}; 
						um_ajax_get({
							url : url.queryTableSpaceName,
							maskObj : "body",
							paramObj : databaseData,
							successCallBack : function(data) 
							{
								if (+data.length === 0) 
								{
									g_dialog.dialog(msg.noTableSpace,{
										width: "320px",
										isConfirmAlarm : true,
										saveclick : function(){}
									});
									return false;
								}
								var tempData = data;
								for (var i = 0; i < tempData.length; i++) {
									tempData[i].tablethreshold = el.find("[data-id=tablethreshold]").val();
								}
								g_grid.removeData(el.find("[data-id=tableSpaceName]"), {});
								g_grid.removeData(el.find("[data-id=nottableSpaceName]"), {});
								g_grid.addData(el.find("[data-id=tableSpaceName]"), tempData);
								createTableStr();
							},
							failTip : false,
							failCallBack : function(data) 
							{
								g_dialog.dialog(msg.noTableSpace,{
										width: "320px",
										isConfirmAlarm : true,
										saveclick : function(){}
									});
							}
						});
					});

					// 清空表空间
					el.find("[data-id=cleartable]").click(function(){
								g_grid.removeData($("[data-id=tableSpaceName]") ,{});
								g_grid.removeData($("[data-id=nottableSpaceName]") ,{});
					});

					el_up_table = el.find("[data-id=tableSpaceName]");
					el_down_table = el.find("[data-id=nottableSpaceName]");


					// 左移代码
					el.find("[data-id=move_left]").click(function(){
						var moveData = g_grid.getData(el.find("[data-id=nottableSpaceName]") ,{chk:true});
						var dataLeft = g_grid.getData(el.find("[data-id=tableSpaceName]"));
						if (moveData.length === 0) 
						{
							g_dialog.operateAlert(el_up_table ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else 
						{
							g_grid.removeData(el.find("[data-id=nottableSpaceName]"));
							g_grid.addData(el.find("[data-id=tableSpaceName]") ,moveData);
							createTableStr();
						}
					});

					// 右移代码
					el.find("[data-id=move_right]").click(function (){
						var moveData = g_grid.getData(el.find("[data-id=tableSpaceName]") ,{chk:true});
						if (0===moveData.length) 
						{
							g_dialog.operateAlert(el_up_table ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else 
						{
							g_grid.removeData(el.find("[data-id=tableSpaceName]"));
							g_grid.addData(el.find("[data-id=nottableSpaceName]") ,moveData);
							createTableStr();
						}
					});

					//左移按钮
					el.find("[data-id=move_left1]").click(function(){
						var moveData = g_grid.getData(el.find("[data-id=nottableSpaceName]") ,{chk:true});
						var dataLeft = g_grid.getData(el.find("[data-id=tableSpaceName]"));
						if (moveData.length === 0) 
						{
							g_dialog.operateAlert(el.find("[data-id=monitor_index_edit]") ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else 
						{
							for (var i = 0; i < moveData.length; i++) {
								dataLeft.unshift(moveData[i]);
							}
							g_grid.removeData(el.find("[data-id=nottableSpaceName]"));
							g_grid.addData(el.find("[data-id=tableSpaceName]") ,moveData);
							tsvalues = g_grid.getData(el.find("[data-id=tableSpaceName]"));
							unTsvalues = g_grid.getData(el.find("[data-id=nottableSpaceName]"));
							var temp_tsvalues = "";
							var temp_untsvalues = "";
							for (var m = 0; m < tsvalues.length; m++) {
								temp_tsvalues += tsvalues[m].tableSpaceName+","+tsvalues[m].tablethreshold+","+tsvalues[m].tableLeftSize+"|";
							}
							tsvalues = temp_tsvalues.substring(0,temp_tsvalues.length-1);
							for (var n = 0; n < unTsvalues.length; n++) {
								temp_untsvalues += unTsvalues[n].tableSpaceName+","+unTsvalues[n].tablethreshold+","+unTsvalues[n].tableLeftSize+"|";
							}
							unTsvalues = temp_untsvalues.substring(0,temp_untsvalues.length-1);
							var tempVal = el.find("[data-id=temp_table_space]").val();
							var tempValN = el.find("[data-id=temp_not_table_space]").val();
							var tsvalues_inp = tempVal === "" ? "" : tempVal + "%";
							var unTsvalues_inp = tempValN === "" ? "" : tempValN + "%";
							el.find("[data-id=temp_table_space]").val(tsvalues_inp+tsvalues);
							el.find("[data-id=temp_not_table_space]").val(unTsvalues_inp+unTsvalues);
						}
					});

					//右移按钮
					el.find("[data-id=move_right1]").click(function(){
						var moveData = g_grid.getData(el.find("[data-id=tableSpaceName]") ,{chk:true});
						if (0===moveData.length) 
						{
							g_dialog.operateAlert(el.find("[data-id=monitor_index_edit]") ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else 
						{
							g_grid.removeData(el.find("[data-id=tableSpaceName]"));
							g_grid.addData(el.find("[data-id=nottableSpaceName]") ,moveData);
							tsvalues = g_grid.getData(el.find("[data-id=tableSpaceName]"));
							unTsvalues = g_grid.getData(el.find("[data-id=nottableSpaceName]"));
							var temp_tsvalues = "";
							var temp_untsvalues = "";
							for (var m = 0; m < tsvalues.length; m++) {
								temp_tsvalues += tsvalues[m].tableSpaceName+","+tsvalues[m].tablethreshold+","+tsvalues[m].tableLeftSize+"|";
							}
							tsvalues = temp_tsvalues.substring(0,temp_tsvalues.length-1);
							for (var n = 0; n < unTsvalues.length; n++) {
								temp_untsvalues += unTsvalues[n].tableSpaceName+","+unTsvalues[n].tablethreshold+","+unTsvalues[n].tableLeftSize+"|";
							}
							unTsvalues = temp_untsvalues.substring(0,temp_untsvalues.length-1);
							var tempVal = $("[data-id=temp_table_space]").val();
							var tempValN = $("[data-id=temp_not_table_space]").val();
							var tsvalues_inp = tempVal === "" ? "" : tempVal + "%";
							var unTsvalues_inp = tempValN === "" ? "" : tempValN + "%";
							$("[data-id=temp_table_space]").val(tsvalues_inp+tsvalues);
							$("[data-id=temp_not_table_space]").val(unTsvalues_inp+unTsvalues);
						}
					});

					// 设置文件基线
					el.find("[data-btn=setFileBaseLine]").click(function (){
						var databaseData = {
							monitorType : $("[data-id=temp_type]").val(),
							scCmd : $("[data-store=connectType]").val(),
							notMonitoredEntity : $("[data-id=temp_monitored_asset]").val(),
							monitorUserName : Encrypt(el.find("[data-id=monitorUserName]").val()),
							monitorPassWord : Encrypt(el.find("[data-id=monitorPassWord]").val()),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							serviceName : "",
							monitorAgent : $("[data-id=monitorAgent]").val(),
							vip : "",
						  	tablethreshold : el.find("[data-id=tablethreshold]").val(),
						  	edIp : $("[data-id=temp_monitored_asset_ip]").val()
						};
						self.baseLineDialog($("[data-btn=setFileBaseLineHidden]").eq(trIndex) ,{
							url : "monitorConfig/queryOracleDatafile",
							atteIndex : 2,
							paramObj : databaseData,
							header : fileBaseLineHeader,
							searchKey : ['dbFileName']
						});
					});

					//测试按钮点击事件
					el.find("[data-id=test_btn]").click(function() {
						var testData = {
							agentId :  $("[data-id=monitorAgent]").val(),
							assetIds : $("[data-id=temp_monitored_asset]").val(),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPassWord : Encrypt(el.find("[data-id=monitorPassWord]").val()),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							monitorType : "ORACLE",
							monitorUserName : Encrypt(el.find("[data-id=monitorUserName]").val())
						};
						um_ajax_post({
							url : url.test,
							paramObj : {teststore : testData},
							maskObj : "body",
							successCallBack : function(data) 
							{
								g_dialog.operateConfirm(data.teststore[0].result ,{
									title : "测试结果",
									saveclick : function (){}
								});
							}
						});
					});
				}

				function save(el ,saveObj) 
				{
					if(!g_validate.validate($('[data-id=monitor_index_edit]')))
					{
						return false;
					}
					createTableStr();
					var gridData = g_grid.getIdArray($("[data-id=database-nu]") ,{attr:"monitorDatabaseName"});
					if (instanceFlag=="upd") 
					{
						for (var i = 0; i < gridData.length; i++) {
							if (gridData[i] == el.find("[data-id=monitorDatabaseName]").val()) 
							{
								if (instanceName==gridData[i]) 
								{
									gridData[i] = "";
								}
							}
						}
					}
					if (gridData.indexOf(el.find("[data-id=monitorDatabaseName]").val()) != -1) 
					{
						g_dialog.operateAlert(el ,"数据库名重复。","error");
						return false;
					}
					var databaseData = saveObj;
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.serviceName = "";
					databaseData.monitorAgent = $("[data-id=monitorAgent]").val();
					databaseData.vip = "";
					databaseData.unifyThreshold = saveObj.tablethreshold;
					databaseData.tablethreshold = saveObj.tablethreshold;
					databaseData.tsvalues = $("[data-id=temp_table_space]").val();
					databaseData.unTsvalues = $("[data-id=temp_not_table_space]").val();
					databaseData.monitorId = opt ? (monitorId_pre + "_" + $("[data-id=monitorDatabaseName]").val()) : "";

					g_dialog.hide("monitor_index_edit");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[data-id=database-nu]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[data-id=database-nu]") ,[databaseData]);
					}
					instanceFlag = "upd";
				}

				// 生成str
				function createTableStr()
				{
					var tmp = [];
					var tableTmp = [];
					el_up_table_data_array = g_grid.getData(el_up_table ,{});
					el_down_table_data_array = g_grid.getData(el_down_table ,{});

					tableTmp = [];
					for (var i = 0; i < el_up_table_data_array.length; i++) {
						tmp = [];
						el_table_data_tmp = el_up_table_data_array[i];
						tmp.push(el_table_data_tmp.tableSpaceName);
						tmp.push(el_table_data_tmp.tablethreshold);
						tmp.push(el_table_data_tmp.tableLeftSize);
						tmp.push(el_table_data_tmp.tableSize);
						tableTmp.push(tmp.join(","));
					}

					$("[data-id=temp_table_space]").val(tableTmp.join("|"));
						
					tableTmp = [];
					for (var i = 0; i < el_down_table_data_array.length; i++) {
						tmp = [];
						el_table_data_tmp = el_down_table_data_array[i];
						tmp.push(el_table_data_tmp.tableSpaceName);
						tmp.push(el_table_data_tmp.tablethreshold);
						tmp.push(el_table_data_tmp.tableLeftSize);
						tmp.push(el_table_data_tmp.tableSize);
						tableTmp.push(tmp.join(","));
					}

					$("[data-id=temp_not_table_space]").val(tableTmp.join("|"));
				}
			}
		},
		ORACLE_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].scCmd]:0);
			dis(el.find("[data-box=tab-div]"));
			g_mask.mask(el.find("[data-box=tab-div]"));
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						dis(sshDiv);
						dis(telnet,true);
					} 
					else 
					{
						dis(sshDiv,true);
						dis(telnetDiv);
					}
				} 
				else
				{
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([sshDiv,telnetDiv]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if (opt.flag == "upd" && opt.detail.monitorStore[0].scCmd=="SSH2") 
				{
					el.find("[data-name=open]").prop("checked",true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv,true);
					dis(telnetDiv);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].scCmd=="TELNET") 
				{
					el.find("[data-name=open]").prop("checked",true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv);
					dis(telnetDiv,true);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].scCmd=="-1") 
				{
					el.find("[data-name=open]").prop("checked",false);
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
				telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.monitorPort = paramObj.consolePort;
				paramObj.monitorUserName = paramObj.trustName;
				paramObj.monitorPassWord = paramObj.trustPassWord;
				delete paramObj.consolePort;
				delete paramObj.trustName;
				delete paramObj.trustPassWord;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ORACLE_leave_step4 : function(el) 
		{
			// if(opt && 0===el.find("[data-id=data-list]").length) 
			// {
			// 	console.log(opt);
			// 	return;
			// }
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if($(this).find("[data-name=open]").is(":checked")) 
				{
					if (connectType=="SSH2") 
					{
						certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
					}
					if (connectType=="TELNET") 
					{
						certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
					}
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
					certStore[i].scCmd = connectType;
				} 
				else 
				{
					certStore = [{"trustName":"-1","trustPassWord":"","consolePort":"","commandPrompt":"","loginPrompt":"","passwordPrompt":"","scCmd":"-1"}];
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				}
			});
			return certStore;
		},
		DM_DB_init : function (el ,opt){
			var self = this;
			var url = {
				queryTableSpaceName : "monitorConfig/queryTableSpaceName",
				test : "monitorConfig/doTest"
			};
			var header = {
				h1 : [
					{text : "表空间名", name : "tableSpaceName"},
					{text : "阈值(%)", name : "tablethreshold", dbclick : true,
					tdBlur : function(trData){
							tablethresholdCalc(trData);
					}},
					{text : "剩余大小(M)", name : "tableLeftSize", dbclick : true,
					tdBlur : function(trData){
							tableLeftSizeCalc(trData);
					},
					render : function(trObj ,data){
						var res = Math.round(Number(data.tableSize)*(1-(Number(data.tablethreshold)/100)));
						return res;
					}},
					{text : "总大小(M)" ,name : "tableSize"}
				],
				h2 : [
					{text : "不监控表空间名", name : "tableSpaceName"},
					{text : "阈值(%)", name : "tablethreshold"},
					{text : "剩余大小(M)", name : "tableLeftSize"},
					{text : "总大小(M)" ,name : "tableSize"}
				],
				nu : [
					{text:"数据库实例名",name:"monitorDatabaseName"},
					{text:"端口",name:"monitorPort"},
					{text:"用户名",name:"monitorUserName",render:function (txt){
						return Encrypt(txt)
					}}
				]
			};
			var oper = {
				nu : [
							{icon:"icon-pencil",text:"修改",aclick:instance_edit},
							{icon:"icon-trash",text:"删除",aclick:instance_remove}
						]
			};
			var tableTemp = {
				g_tableSize : [],
				tableSpaceName : []
			};
			var detailData = opt && opt.detail;
			var monitorId_pre = "";
			var instanceFlag = "upd";
			var instanceName;

			init();
			event_init();

			function event_init() 
			{
				var databaseDataStr = "";
				//新增按钮
				el.find("#database_add_btn").click(function(){
					instanceFlag = "add";
					instance_edit();
				});

				//批量删除
				el.find("#database_del_btn").click(function(){
					g_grid.getData(el.find("[data-id=database-nu]"),{chk:true}).length === 0 
						? g_dialog.operateAlert(el ,msg.noSelect ,"error") 
						: g_grid.removeData(el.find("[data-id=database-nu]"));
				});
			}

			function init() 
			{ 
				var detailStore = [];
				if (opt) 
				{ 
					monitorId_pre = detailData.monitorStore[0].monitorId.split("_")[0];
					for (var i = 0; i < detailData.monitorStore.length; i++) {
						detailStore.push(detailData.monitorStore[i]);
						detailStore[i].opFlag = "upd";
						detailStore[i].serviceName = "";
						detailStore[i].vip = "";
					} 
					if (opt.detail.monitorStore[0].dbUser == "1") 
					{
						el.find("[data-check=dbUser_checkbox]").attr("checked",true);
					}
					baseLineMap(el.find("[data-btn=setFileBaseLineHidden]").eq(0) ,opt ,"hostFileBaseLineDataStore" ,0);
					baseLineMap(el.find("[data-btn=setFileBaseLineHidden]").eq(1) ,opt ,"hostFileBaseLineDataStore" ,1);
				}
				var Ddata = opt ? detailStore : [];
				g_grid.render(el.find("[data-id=database-nu]") ,{
					data : Ddata,
					header : header.nu,
					oper : oper.nu,
					operWidth : "100px",
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
			}

			function instance_edit(rowData ,trObj)
			{
				var trIndex;
				if (trObj)
				{
					trIndex = trObj.index();
				}
				else
				{
					var tmpArray = g_grid.getData(el.find("[data-id=database-nu]") ,{chk:false});
					trIndex = tmpArray.length;
				}
				
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_25.html",
					success : function (data) 
					{
						var title = rowData ? "修改数据库信息" : "添加数据库信息";
						g_dialog.dialog($(data).find("[data-id=monitor_index_edit]") ,{
							width : "700px",
							title : title,
							init : init,
							saveclick : save,
							top : "6%",
							//autoHeight : true
						});
					}
				});

				var el_up_table;
				var el_down_table;
				var el_up_table_data_array;
				var el_down_table_data_array;
				var el_table_data_tmp;

				function init(el) 
				{
					var data_l = [];
					var data_r = [];
					if(rowData) 
					{
						instanceName = rowData.monitorDatabaseName;
						rowData.tablethreshold = rowData.unifyThreshold;
						el.umDataBind("render" ,rowData);
						if(rowData.connectType == -1)
						{
							el.find("[data-type=closeAlarmCheck]").click();
							el.find("[data-id=connectType]").attr("disabled","disabled");
							el.find("[data-id=connectType]").val("");
						} 
						else 
						{
							el.find("[data-type=openAlarmCheck]").click();
							el.find("[data-id=connectType]").removeAttr("disabled");
						} 
						if (rowData.dbUser == "1") 
						{
							el.find("[data-check=dbUser_checkbox]").attr("checked",true);
						}
						var ts = (rowData.tsvalues == null ? "" : rowData.tsvalues).split("|");
						var  dataD = [];
						for (var i = 0; i < ts.length; i++) {
							var rowD = ts[i].split(",");
							var tableSize = Math.round(Number(Number(rowD[2]) / (1-Number(rowD[1])/100)));
							dataD.push({tableSpaceName : rowD[0],tablethreshold : rowD[1],tableLeftSize : rowD[2],tableSize:rowD[3]});
						}
						data_l = dataD;
						var unTs = rowData.unTsvalues.split("|");
						var  dataDu = [];
						for (var i = 0; i < unTs.length; i++) {
							var rowDu = unTs[i].split(",");
							var tableSize = Math.round(Number(Number(rowDu[2]) / (1-Number(rowDu[1])/100)));
							dataDu.push({tableSpaceName : rowDu[0],tablethreshold : rowDu[1],tableLeftSize : rowDu[2],tableSize:rowDu[3]});
						}
						data_r = dataDu;
						opType = "edit";

						rowData.tsvalues ? "" : (data_l = []);
						rowData.unTsvalues ? "" : (data_r = []);
					} 
					databaseDataStr = (el.find("[data-id=temp_database_instance]").val() === "" || el.find("[data-id=temp_database_instance]").val() === undefined) ? "" : el.find("[data-id=temp_database_instance]").val() + "~";
					g_grid.render(el.find("[data-id=tableSpaceName]") ,{
						data : data_l,
						header : header.h1,
						paramObj : null,
						isLoad : false,
						tdDbClick : true,
						hideSearch : true,
						paginator : false
					});
					g_grid.render(el.find("[data-id=nottableSpaceName]") ,{
						data : data_r,
						header : header.h2,
						paramObj : null,
						isLoad : false,
						hideSearch : true,
						paginator : false
					});	
					//密码过期提醒启用否
					el.find("[data-type=openAlarmCheck]").click(function(){
							el.find("[data-id=connectType]").removeAttr("disabled");
					}); 
					el.find("[data-type=closeAlarmCheck]").click(function(){
							el.find("[data-id=connectType]").attr("disabled","disabled");
							el.find("[data-id=connectType]").val("");
					}); 
					el.find("[data-check=dbUser_checkbox]").click(function(){
						if($("[data-check=dbUser_checkbox]:checked").length>0) 
						{
							el.find("[data-id=dbUser]").val('1');
						} 
						else 
						{
							el.find('[data-id=dbUser]').val('0');
						}
					});
					//查询表空间
					el.find("[data-id=querytable]").click(function(){
						el.find("[data-id=tablethreshold]").blur();
						el.find("[data-id=monitorUserName]").blur();
						if (!g_validate.validate(el.find("[data-id=tablethreshold]")) || !g_validate.validate(el.find("[data-id=monitorUserName]"))) 
						{
							return false;
						}
						var databaseData = {
							monitorType : $("[data-id=temp_type]").val(),
							scCmd : $("[data-store=connectType]").val(),
							notMonitoredEntity : $("[data-id=temp_monitored_asset]").val(),
							monitorUserName : el.find("[data-id=monitorUserName]").val(),
							monitorPassWord : el.find("[data-id=monitorPassWord]").val(),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							serviceName : "",
							monitorAgent : $("[data-id=monitorAgent]").val(),
							vip : "",
						  tablethreshold : el.find("[data-id=tablethreshold]").val()
						}; 
						um_ajax_get({
							url : url.queryTableSpaceName,
							maskObj : "body",
							paramObj : databaseData,
							successCallBack : function(data) 
							{
								if (+data.length === 0) 
								{
									g_dialog.dialog(msg.noTableSpace,{
										width: "320px",
										isConfirmAlarm : true,
										saveclick : function(){}
									});
									return false;
								}
								var tempData = data;
								for (var i = 0; i < tempData.length; i++) {
									tempData[i].tablethreshold = el.find("[data-id=tablethreshold]").val();
								}
								g_grid.removeData(el.find("[data-id=tableSpaceName]"), {});
								g_grid.removeData(el.find("[data-id=nottableSpaceName]"), {});
								g_grid.addData(el.find("[data-id=tableSpaceName]"), tempData);
								createTableStr();
							},
							failTip : false,
							failCallBack : function(data) 
							{
								g_dialog.dialog(msg.noTableSpace,{
										width: "320px",
										isConfirmAlarm : true,
										saveclick : function(){}
									});
							}
						});
					});

					// 清空表空间
					el.find("[data-id=cleartable]").click(function(){
								g_grid.removeData($("[data-id=tableSpaceName]") ,{});
								g_grid.removeData($("[data-id=nottableSpaceName]") ,{});
					});

					el_up_table = el.find("[data-id=tableSpaceName]");
					el_down_table = el.find("[data-id=nottableSpaceName]");

					//测试按钮点击事件
					el.find("[data-id=test_btn]").click(function() {
						var testData = {
							agentId :  $("[data-id=monitorAgent]").val(),
							assetIds : $("[data-id=temp_monitored_asset]").val(),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPassWord : el.find("[data-id=monitorPassWord]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							monitorType : "DM_DB",
							monitorUserName : el.find("[data-id=monitorUserName]").val()
						};
						um_ajax_post({
							url : url.test,
							paramObj : {teststore : testData},
							maskObj : "body",
							successCallBack : function(data) 
							{
								g_dialog.operateConfirm(data.teststore[0].result ,{
									title : "测试结果",
									saveclick : function (){}
								});
							}
						});
					});
				}

				function save(el ,saveObj) 
				{
					if(!g_validate.validate($('[data-id=monitor_index_edit]')))
					{
						return false;
					}
					createTableStr();
					var gridData = g_grid.getIdArray($("[data-id=database-nu]") ,{attr:"monitorDatabaseName"});
					if (instanceFlag=="upd") 
					{
						for (var i = 0; i < gridData.length; i++) {
							if (gridData[i] == el.find("[data-id=monitorDatabaseName]").val()) 
							{
								if (instanceName==gridData[i]) 
								{
									gridData[i] = "";
								}
							}
						}
					}
					if (gridData.indexOf(el.find("[data-id=monitorDatabaseName]").val()) != -1) 
					{
						g_dialog.operateAlert(el ,"数据库名重复。","error");
						return false;
					}
					var databaseData = saveObj;
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.serviceName = "";
					databaseData.monitorAgent = $("[data-id=monitorAgent]").val();
					databaseData.vip = "";
					databaseData.unifyThreshold = saveObj.tablethreshold;
					databaseData.tablethreshold = saveObj.tablethreshold;
					databaseData.tsvalues = $("[data-id=temp_table_space]").val();
					databaseData.unTsvalues = $("[data-id=temp_not_table_space]").val();
					databaseData.monitorId = opt ? (monitorId_pre + "_" + $("[data-id=monitorDatabaseName]").val()) : "";

					g_dialog.hide("monitor_index_edit");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[data-id=database-nu]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[data-id=database-nu]") ,[databaseData]);
					}
					instanceFlag = "upd";
				}

				// 生成str
				function createTableStr()
				{
					var tmp = [];
					var tableTmp = [];
					el_up_table_data_array = g_grid.getData(el_up_table ,{});
					el_down_table_data_array = g_grid.getData(el_down_table ,{});

					tableTmp = [];
					for (var i = 0; i < el_up_table_data_array.length; i++) {
						tmp = [];
						el_table_data_tmp = el_up_table_data_array[i];
						tmp.push(el_table_data_tmp.tableSpaceName);
						tmp.push(el_table_data_tmp.tablethreshold);
						tmp.push(el_table_data_tmp.tableLeftSize);
						tmp.push(el_table_data_tmp.tableSize);
						tableTmp.push(tmp.join(","));
					}

					$("[data-id=temp_table_space]").val(tableTmp.join("|"));
						
					tableTmp = [];
					for (var i = 0; i < el_down_table_data_array.length; i++) {
						tmp = [];
						el_table_data_tmp = el_down_table_data_array[i];
						tmp.push(el_table_data_tmp.tableSpaceName);
						tmp.push(el_table_data_tmp.tablethreshold);
						tmp.push(el_table_data_tmp.tableLeftSize);
						tmp.push(el_table_data_tmp.tableSize);
						tableTmp.push(tmp.join(","));
					}

					$("[data-id=temp_not_table_space]").val(tableTmp.join("|"));
				}
			}
		},
		TOMCAT_init : function (el, opt) 
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}]
			};
			init();
			function init() 
			{
				var data = opt ? opt.detail.urlStore : [];
				g_grid.render(el.find("[id=grid-he]") ,{
					data : data,
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
				opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
			}

			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (el.find("[data-flag=url_flag]").val()=="")
				{
					g_validate.setError(el.find("[data-flag=url_flag]"), msg.blank);
					return false;
				} 
				else 
				{
					g_validate.setError(el.find("[data-flag=url_flag]"), "");
				}
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val("");
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
				
			});
		},
		TOMCAT_step5_test : function (el) 
		{
			var teststore =
			{
				teststore : 
						{
							"agentId": el.find("[data-id=monitorAgent]").val(),
							"assetIds": el.find("[data-id=temp_monitored_asset]").val(),
							"commandPrompt": "",
							"connectType": "",
							"consoleIp": "",
							"context": "",
							"loginPrompt": "",
							"monitorDatabaseName": "",
							"monitorPassWord": "",
							"monitorPort": el.find("[data-id=monitorPort]").val(),
							"monitorType": "TOMCAT",
							"monitorUserName": "",
							"passwordPrompt": "",
							"trustPassWord": ""
						}
			};
			return teststore;
		},
		TONGWEB_init : function (el, opt) 
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}]
			};
			init();
			function init() 
			{
				var data = opt ? opt.detail.urlStore : [];
				g_grid.render(el.find("[id=grid-he]") ,{
					data : data,
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
				opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
			}
			el.find("[data-id=version]").change(function (){
				if ($(this).val() == "TONGWEB6")
					el.find("[data-id=commandPrompt]").val("server")
				else if ($(this).val() == "TONGWEB5")
					el.find("[data-id=commandPrompt]").val("jmxrmi")
			})
			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (el.find("[data-flag=url_flag]").val()=="")
				{
					g_validate.setError(el.find("[data-flag=url_flag]"), msg.blank);
					return false;
				} 
				else 
				{
					g_validate.setError(el.find("[data-flag=url_flag]"), "");
				}
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val("");
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
			});
		},
		TONGWEB_step5_test : function (el) 
		{
			var teststore =
			{
				teststore : 
						{
							"agentId": el.find("[data-id=monitorAgent]").val(),
							"assetIds": el.find("[data-id=temp_monitored_asset]").val(),
							"commandPrompt": el.find("[data-id=commandPrompt]").val(),
							"connectType": "",
							"consoleIp": "",
							"context": "",
							"loginPrompt": "",
							"monitorDatabaseName": "",
							"monitorPassWord": el.find("[data-id=monitorPassWord]").val(),
							"monitorPort": el.find("[data-id=monitorPort]").val(),
							"monitorType": el.find("[data-id=version]").val(),
							"monitorUserName": el.find("[data-id=monitorUserName]").val(),
							"passwordPrompt": "",
							"trustPassWord": ""
						}
			};
			return teststore;
		},
		LINUX_init : function (el, opt) 
		{
			var self = this;
			var header = {
				al : [
							{text:"被监控分区",name:"performModule"},
							{text:"阈值(%)",name:"value", dbclick : true
							, tdBlur : function(trData){
									moduleValueCalc(trData);
							}},
							// {text:"剩余空间(M)",name:"performName", dbclick : true
							// , tdBlur : function(trData){
							// 		performNameCalc(trData);
							// }
							// ,render : function(trObj ,data){
							// 	var res = Math.round(Number(data.lastTime)*(1-(Number(data.value)/100)));
							// 	return res;
							// }},
							{text:"剩余空间(M)",name:"performName", dbclick : true}
						],
				ar : [
							{text:"不被监控分区",name:"performModule"},
							{text:"阈值(%)",name:"value"},
							{text:"剩余空间(M)",name:"performName"}
						],
				i : [
							{text:"脚本全路径",name:"name"},
							{text:"脚本参数",name:"value"}
						],
				u : [
							{text:"已配置进程",name:"faultModule"}
						]
			};
			var tableTemp = {
				g_tableSize : [],
				tableSpaceName : []
			};
			init();
			event_init();
			function init() 
			{
				var data = {
					al : [],
					ar : [],
					i : [],
					u : []
				};
				if (opt) 
				{
					el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
					if (opt.detail.monitorStore[0].monitorDatabaseName == 1) {
						el.find("[id=detail_store_form]").find("[name=monitorDatabaseName]").click()
					}
					data.al = opt.detail.monitorPerformGridStore;
					data.ar = opt.detail.monitorUnPerformGridStore;
					data.i = opt.detail.monitorScriptGridStore;
					data.u = opt.detail.faultStore;
					// 可选进程下拉框
					progressSel(el,opt);

					baseLineMap(el.find("[data-btn=setProcessBaseLine]") ,opt ,"hostProcessBaseLineDataStore");
					baseLineMap(el.find("[data-btn=setPortBaseLine]") ,opt ,"hostPortBaseLineDataStore");
					baseLineMap(el.find("[data-btn=setDiskBaseLine]") ,opt ,"hostDiskBaseLineDataStore");
				}
				g_validate.init(el);
				g_grid.render(el.find("[id=grid-al]") ,{
					data : data.al,
					header : header.al,
					paramObj : null,
					tdDbClick : true,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-ar]") ,{
					data : data.ar,
					header : header.ar,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-i]") ,{
					data : data.i,
					header : header.i,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-u]") ,{
					data : data.u,
					header : header.u,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				
				var selFlag = true;
				var hostCodeSelWidth = el.find("[data-id=hostCode]").width();
				el.find("[data-id=hostCode]").click(function(){
					el.find("[data-name=hostCodeSel]").width(hostCodeSelWidth+40).show();
					selFlag = true;
				});
				el.find("[data-name=hostCodeSel]").find("li").each(function(){
					$(this).click(function(){
						el.find("[data-id=hostCode]").val("").val($(this).html());
						g_validate.setError(el.find("[data-id=hostCode]"), "");
						el.find("[data-name=hostCodeSel]").hide();
						selFlag = false;
					});
				});
				el.find("[data-id=hostCode]").blur(function(){
					selFlag && el.oneTime(500,function(){
						el.find("[data-name=hostCodeSel]").hide();
					});
				});

				$("[data-name=block1]").show();
				$("[data-name=block2]")[$("[data-store=connectType]").val()=="SNMP"?"hide":"show"]();
				$("[data-name=block3]")[$("[data-store=connectType]").val()=="SNMP"?"hide":"show"]();
			}
			function event_init()
			{
				function getQueryData()
				{
					var databaseData = $("[data-getter=cert]").umDataBind("serialize");
					databaseData.readCommunity = databaseData.snmpCommunity;
					databaseData.connectType = $("[data-store=connectType]").val();
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.edId = $("[data-id=temp_monitored_asset]").val();
					databaseData.agentId = $("[data-id=monitorAgent]").val();
					databaseData.tablethreshold = databaseData.unifyThreshold;
					databaseData.username = (databaseData.monitorUserName 
											?  databaseData.monitorUserName
											:  databaseData.snmpUserName)
					databaseData.password = (databaseData.monitorPassWord 
											? databaseData.monitorPassWord
											: databaseData.snmpPassWord)
					databaseData.port = databaseData.monitorPort || databaseData.snmpPort;
					databaseData.value = el.find("[data-id=unifyThreshold]").val();
					console.log(databaseData)
					return databaseData;
				}
				//获取所有分区    剩余空间=lasttime*（1-阈值）   剩余空间：performName  阈值:value
				el.find("[data-id=querytable]").click(function()
				{
					var databaseData = getQueryData();
					um_ajax_get({
						url : "monitorConfig/queryDiskName",
						maskObj : "body",
						paramObj : databaseData,
						successCallBack : function(data)
						{ 
							if (+data.monitorPerformGridStore.length == 0)
							{
								g_dialog.dialog(msg.noZone,{
									width :  "320px",
									isConfirmAlarm : true,
									saveclick : function(){}
								}); 
								return false;
							}
							var dataVo = data.monitorPerformGridStore;
							g_grid.removeData($("[id=grid-al]") ,{});
							g_grid.removeData($("[id=grid-ar]") ,{});
							g_grid.addData($("[id=grid-al]"), dataVo);
						},
						failTip : false,
						failCallBack : function(data) 
						{
							g_dialog.dialog(msg.noZone,{
									width :  "320px",
									isConfirmAlarm : true,
									saveclick : function(){}
								}); 
						}
					});
				});	

				// 清空分区
				el.find("[data-id=cleartable]").click(function(){
							g_grid.removeData($("[id=grid-al]") ,{});
							g_grid.removeData($("[id=grid-ar]") ,{});
				});

				//被监控分区 左移 右移 url_add url_remove
				//右移事件
				el.find("[data-id=url_add]").click(function() 
				{
					var urlArray = g_grid.getData(el.find("[id=grid-al]") ,{chk:true});
					if (urlArray.length == 0) 
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-ar]") ,urlArray);
					g_grid.removeData(el.find("[id=grid-al]"));
				});

				// 左移事件
				el.find("[data-id=url_remove]").click(function() 
				{
					var data = g_grid.getData(el.find("[id=grid-ar]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else
					{
						g_grid.addData(el.find("[id=grid-al]") ,data);
						g_grid.removeData(el.find("[id=grid-ar]"));
					}
				});

				// 脚本全路径 左移 右移 script_add script_remove
				//右移事件
				el.find("[data-id=script_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=script]"))){
						return false;
					}
					var scriptPathArray = g_grid.getIdArray(el.find("[id=grid-i]") ,{attr:"name"});
					var valueArray = g_grid.getIdArray(el.find("[id=grid-i]") ,{attr:"value"});
					if (el.find("[data-flag=name]").val()=="")
					{
						g_validate.setError(el.find("[data-flag=name]"), msg.blank);
						return false;
					}
					if (scriptPathArray.indexOf(el.find("[data-flag=name]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-i]") ,[{
						name : $("[data-flag=name]").val(),
						value : $("[data-flag=value]").val()
					}]);
					$("[data-flag=name]").val("");
					$("[data-flag=value]").val("");
				});

				// 左移事件
				el.find("[data-id=script_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-i]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=name]").val(data[0].name);
						el.find("[data-flag=value]").val(data[0].value);
						g_grid.removeData(el.find("[id=grid-i]"));
					}
				});
				// 已配置进程 左移 右移 progress_add progress_remove
				//右移事件
				el.find("[data-id=fault_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=fault]"))){
						return false;
					}
					var progressArray = g_grid.getIdArray(el.find("[id=grid-u]") ,{attr:"faultModule"});
					if (progressArray.indexOf(el.find("[data-flag=faultModule]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					if (el.find("[data-flag=faultModule]").val() == "") 
					{
						g_validate.setError(el.find("[data-flag=faultModule]"), msg.blank);
						return false;
					} 
					else 
					{
						g_validate.setError(el.find("[data-flag=faultModule]"), "");
					}
					g_grid.addData(el.find("[id=grid-u]") ,[{
						faultModule : $("[data-flag=faultModule]").val()
					}]);
					$("[data-flag=faultModule]").val("");
				});

				// 左移事件
				el.find("[data-id=fault_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-u]") ,{chk:true});
					if (data.length === 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=faultModule]").val(data[0].faultModule);
						g_grid.removeData(el.find("[id=grid-u]"));
					}
				});

				// 设置进程基线
				el.find("[data-btn=setProcessBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setProcessBaseLine]") ,{
						url : "monitorFetch/queryProcessList",
						atteIndex : 4,
						paramObj : databaseData,
						header : procBaseLineHeader,
						searchKey : ['procName' ,'procPath']
					});
				});

				// 设置端口基线
				el.find("[data-btn=setPortBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setPortBaseLine]") ,{
						url : "monitorFetch/queryPortList",
						atteIndex : 2,
						paramObj : databaseData,
						header : portBaseLineHeader,
						searchKey : ['portName']
					});
				});
				// 设置磁盘基线
				el.find("[data-btn=setDiskBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setDiskBaseLine]") ,{
						url : "monitorFetch/queryDiskMontList",
						atteIndex : 2,
						paramObj : databaseData,
						header : diskBaseLineHeader,
						searchKey : ['diskName']
					});
				});
			}
		},
		LINUX_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1, "SNMP":2};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(telnetDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(sshDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis([sshDiv,telnetDiv]);
						g_validate.clear(sshDiv);
						g_validate.clear(telnetDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
						snmpDiv.find("[data-id=snmpPort]").val() == "" && snmpDiv.find("[data-id=snmpPort]").val("161");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				}
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				}
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					dis([sshDiv,telnetDiv]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
						dis([snmpv2,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
						dis([snmpv1,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
						dis([snmpv1,snmpv2]);
					}
				}	
				sshDiv.find("[data-id=monitorPort]").val()=== "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() === "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpDiv.find("[data-id=snmpPort]").val() === "" && snmpDiv.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		LINUX_leave_step4 : function(el,opt) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		TOMCAT_HA_init : function (el, opt) 
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}]
			};
			init();
			function init() 
			{
				g_grid.render(el.find("[id=grid-he]") ,{
					data : [],
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
			}
		},
		MYSQL_init : function (el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				el.find("[data-id=temp_monitored_asset]").val(opt.detail.monitorDeviceStore[0].edId);
			}
		},
		MYSQL_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "MYSQL",
		        "monitorUserName": Encrypt(el.find("[data-id=monitorUserName]").val()),
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		POSTGRESQL_init : function (el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				el.find("[data-id=temp_monitored_asset]").val(opt.detail.monitorDeviceStore[0].edId);
			}
		},
		POSTGRESQL_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": el.find("[name=commandPrompt]:checked").val(),
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "POSTGRESQL",
		        "monitorUserName": Encrypt(el.find("[data-id=monitorUserName]").val()),
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		REDIS_init : function (el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				el.find("[data-id=temp_monitored_asset]").val(opt.detail.monitorDeviceStore[0].edId);
			}
		},
		REDIS_step5_test : function (el)
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "REDIS",
		        "monitorUserName": Encrypt(el.find("[data-id=monitorUserName]").val()),
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		MONGODB_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				el.find("[data-id=temp_monitored_asset]").val(opt.detail.monitorDeviceStore[0].edId);
			}
		},
		MONGODB_step5_test : function (el)
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "MONGODB",
		        "monitorUserName": Encrypt(el.find("[data-id=monitorUserName]").val()),
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		COMMON_URL_init : function (el, opt)
		{
			require(['/js/plugin/urltoken/urltoken.js'] , function (urltoken){
				var el_url_table = el.find("[data-id=url_table]");

				el_url_table.data("deleteArray" ,[]);

				var header = {
					url_table_header : [
											{text:'请求URL',name:"urlAddress"},
											{text:'请求方式',name:"checkRequest" ,render:function (txt){
												return (txt == "0" ? "get" : "post")
											}},
											{text:'连接方式',name:"connectType"},
											{text:'端口',name:"monitorPort"}
										],
					correctKeyWord : [{text:"白名单",name:"correctKeyWord"}],
					errorKeyWord : [{text:"黑名单",name:"errorKeyWord"}],
					paramList : [{text:"参数名称",name:"paramName"},{text:"参数值",name:"paramValue"}]
				};

				var oper = {
					url_table_oper : [
							{icon:"rh-icon rh-edit",text:"修改",aclick:url_edit_template_init},
							{icon:"rh-icon rh-delete",text:"删除",aclick:url_delete}
						 ]
				};

				var data = {
								correctKeyWord : [],
								errorKeyWord : [],
								param : []
							};
				init();
				function init()
				{
					var url_table_data = [];
					var commonUrlDataStore = [];

					// 令牌radio事件
					el.find("[name=proofRadio]").click(function (){
						if ($(this).val() == "1")
						{
							el.find("[id=token_div]").show();
						}
						else
						{
							el.find("[id=token_div]").hide();
							el_url_table.data("proofId" ,"");
							el.find("[id=token_name]").text("");
						}
					});

					if (opt && opt.detail && opt.detail.monitorStore[0])
					{
						url_table_data = opt.detail.monitorStore[0].commonUrlDataStore;
						commonUrlDataStore = opt.detail.monitorStore[0].commonUrlDataStore;
						var proofArray = opt.detail.monitorStore[0].proofId.split(",");
						proofArray[1] && el.find("[id=token_name]").text(proofArray[1]);
						!proofArray[0] && el.find("[name=proofRadio][value=0]").click();
						proofArray[0] && el.find("[name=proofRadio][value=1]").click();
						proofArray[0] && el_url_table.data("proofId" ,proofArray[0]);
					}
					g_grid.render(el_url_table ,{
						data : url_table_data,
						header : header.url_table_header,
						oper : oper.url_table_oper,
						operWidth : "100px",
						paramObj : null,
						paginator : false,
						hideSearch : true,
						isLoad : true,
						maskObj : "body",
						cbf : function (){
							var trObjArray = g_grid.getTrObj(el_url_table);
							trObjArray.each(function (i){
								$(this).data("monitorDetailStore" ,commonUrlDataStore[i])
								$(this).data("monitorPerformGridStore" ,commonUrlDataStore[i].correctKeywordList);
								$(this).data("monitorFaultGridStore" ,commonUrlDataStore[i].errorKeywordList);
								$(this).data("monitorParamGridStore" ,commonUrlDataStore[i].requestParamList);
							});
						}
					});
					el.oneTime(500 ,function (){
						el.find("[id=token_info_div]").show();
					});
					
				}
				// 令牌配置事件
				el.find("[id=token_btn]").click(function (){
					urltoken.dialogList({
						cbf : function (proofId ,proofName){
							el_url_table.data("proofId" ,proofId);
							el.find("[id=token_name]").text(proofName);
						}
					});
				});

				// url新增事件
				el.find("[id=url_add_btn]").click(function (){
					url_edit_template_init();
				});

				// 批量删除事件
				el.find("[id=url_del_btn]").click(function(){
					var dataArray = g_grid.getData(el_url_table ,{chk:true});
					if (dataArray.length == 0 )
					{
						g_dialog.operateAlert(el ,msg.noSelect ,"error");
					}
					else
					{
						var deleteArray = el_url_table.data("deleteArray");
						var idArray = g_grid.getIdArray(el_url_table , {chk:true ,attr:"url_config_id"});
						for (var i = 0; i < idArray.length; i++) {
							idArray[i] && deleteArray.push(idArray[i]);
						}
						el_url_table.data("deleteArray" ,deleteArray);
						g_grid.removeData(el_url_table);
					}
				});

				function url_edit_template_init(rowData ,trObj)
				{
					var trIndex;
					data = {
								correctKeyWord : [],
								errorKeyWord : [],
								param : []
							};
					if (trObj)
					{
						trIndex = trObj.index();
						data.correctKeyWord = trObj.data("monitorPerformGridStore");
						data.errorKeyWord = trObj.data("monitorFaultGridStore");
						data.param = trObj.data("monitorParamGridStore");
					}
					else
					{
						var tmpArray = g_grid.getData(el_url_table ,{chk:false});
						trIndex = tmpArray.length;
					}
					$.ajax({
						type: "GET",
						url: "tpl/monitor_config/common_url.html",
						success :function(eldata)
						{
							g_dialog.dialog($(eldata).find("[id=url_edit_template]"),{
								width:"960px",
								init:init,
								title:"URL监控",
								saveclick:save_click,
								autoHeight:"autoHeight"
							});

							function init(el)
							{
								//el.find("[data_tmp=detail_store_form]").attr("id" ,"detail_store_form");

								g_grid.render(el.find("[data-id=correctKeyWordList]") ,{
									data : data.correctKeyWord,
									header : header.correctKeyWord,
									paramObj : null,
									hideSearch : true,
									paginator : false
								});
								g_grid.render(el.find("[data-id=errorKeyWordList]") ,{
									data : data.errorKeyWord,
									header : header.errorKeyWord,
									paramObj : null,
									hideSearch : true,
									paginator : false
								});
								g_grid.render(el.find("[data-id=paramList]") ,{
									data : data.param,
									header : header.paramList,
									paramObj : null,
									hideSearch : true,
									paginator : false
								});

								//白名单右移事件
								el.find("[data-form=correctKeyWord]").find("[data-id=move_right]").click(function(){
									if (el.find("[data-id=correctKeyWord]").val() != "") 
									{
										g_validate.setError(el.find("[data-id=correctKeyWord]"), "");
										var processArray = g_grid.getIdArray(el.find("[data-id=correctKeyWordList]") ,{attr:"correctKeyWord"});
										if (processArray.indexOf(el.find("[data-id=correctKeyWord]").val()) != -1)
										{
											g_dialog.operateAlert(el ,msg.repeat ,"error");
											return false;
										}
										g_grid.addData(el.find("[data-id=correctKeyWordList]") ,[{
											correctKeyWord : el.find("[data-id=correctKeyWord]").val()
										}]);
										el.find("[data-id=correctKeyWord]").val("");
									}
									else 
									{
										g_validate.setError(el.find("[data-id=correctKeyWord]"), msg.blank);
										return false;
									}
								});

								//白名单左移事件
								el.find("[data-form=correctKeyWord]").find("[data-id=move_left]").click(function(){
									var data = g_grid.getData(el.find("[data-id=correctKeyWordList]") ,{chk:true});
									if (0===data.length)
									{
										g_dialog.operateAlert(el ,msg.select ,"error");
									}
									else
									{
										g_grid.removeData(el.find("[data-id=correctKeyWordList]"));
										el.find("[data-id=correctKeyWord]").val(data[0].correctKeyWord);
									}
								});

								//黑名单右移事件
								el.find("[data-form=errorKeyWord]").find("[data-id=move_right]").click(function(){
									if (""!==el.find("[data-id=errorKeyWord]").val()) 
									{
										g_validate.setError(el.find("[data-id=errorKeyWord]"), "");
										var processArray = g_grid.getIdArray(el.find("[data-id=errorKeyWordList]") ,{attr:"errorKeyWord"});
										if (processArray.indexOf(el.find("[data-id=errorKeyWord]").val()) != -1)
										{
											g_dialog.operateAlert(el ,msg.repeat ,"error");
											return false;
										}
										g_grid.addData(el.find("[data-id=errorKeyWordList]") ,[{
											errorKeyWord : el.find("[data-id=errorKeyWord]").val()
										}]);
										el.find("[data-id=errorKeyWord]").val("");
									}
									else 
									{
										g_validate.setError(el.find("[data-id=errorKeyWord]"), msg.blank);
										return false;
									}
								});

								//黑名单左移事件
								el.find("[data-form=errorKeyWord]").find("[data-id=move_left]").click(function(){
									var data = g_grid.getData(el.find("[data-id=errorKeyWordList]") ,{chk:true});
									if (0===data.length)
									{
										g_dialog.operateAlert(el ,msg.select ,"error");
									}
									else
									{
										g_grid.removeData(el.find("[data-id=errorKeyWordList]"));
										el.find("[data-id=errorKeyWord]").val(data[0].errorKeyWord);
									}
								});

								//参数右移事件
								el.find("[data-form=paramList]").find("[data-id=move_right]").click(function(){
									if (el.find("[data-id=paramName]").val() != "" && el.find("[data-id=paramValue]").val() != "") 
									{
										g_validate.setError(el.find("[data-id=paramName]"), "");
										g_validate.setError(el.find("[data-id=paramValue]"), "");
										var paramNameArray = g_grid.getIdArray(el.find("[data-id=paramList]") ,{attr:"paramName"});
										var paramValueArray = g_grid.getIdArray(el.find("[data-id=paramList]") ,{attr:"paramValue"});
										if (paramNameArray.indexOf(el.find("[data-id=paramName]").val()) != -1 || paramValueArray.indexOf(el.find("[data-id=paramValue]").val()) != -1)
										{
											g_dialog.operateAlert(el ,msg.repeat ,"error");
											return false;
										}
										g_grid.addData(el.find("[data-id=paramList]") ,[{
											paramName : el.find("[data-id=paramName]").val(),
											paramValue : el.find("[data-id=paramValue]").val()
										}]);
										el.find("[data-id=paramName]").val("");
										el.find("[data-id=paramValue]").val("");
									}
									else if (el.find("[data-id=paramName]").val()=="")
									{
										g_validate.setError(el.find("[data-id=paramName]"), msg.blank);
										return false;
									}
									else 
									{
										g_validate.setError(el.find("[data-id=paramValue]"), msg.blank);
										return false;
									} 
								});

								//参数左移事件
								el.find("[data-form=paramList]").find("[data-id=move_left]").click(function(){
									var data = g_grid.getData(el.find("[data-id=paramList]") ,{chk:true});
									if (data.length == 0)
									{
										g_dialog.operateAlert(el ,msg.select ,"error");
									}
									else
									{
										g_grid.removeData(el.find("[data-id=paramList]"));
										el.find("[data-id=paramName]").val(data[0].paramName);
										el.find("[data-id=paramValue]").val(data[0].paramValue);
									}
								});

								index_form_init(el);
							    g_validate.init(el);
								el.find("[data-id=connectType]").change(function(){
									if (el.find("[data-id=connectType]").val() == "http") 
									{
										el.find("[data-id=monitorPort]").val("80");
									} 
									else 
									{
										el.find("[data-id=monitorPort]").val("443");
									}
								});

								el.find("[data-id=connectType]").trigger("change");

								if (trObj) 
								{
									el.find("[data_tmp=detail_store_form]").umDataBind("render" ,trObj.data("monitorDetailStore"));

									data.correctKeyWord = trObj.data("monitorPerformGridStore");
									data.errorKeyWord = trObj.data("monitorFaultGridStore");
									data.param = trObj.data("monitorParamGridStore");
									//$("[data-id=temp_monitor_id]").val(opt.detail.monitorStore[0].monitorId);
								}
							}
							function save_click(el)
							{
								var databaseData = el.find("[data_tmp=detail_store_form]").umDataBind("serialize")
								if (!g_validate.validate(el.find("[data_tmp=detail_store_form]"))) 
								{
									g_dialog.operateAlert(el,"请完善信息。","error");
									return false;
								}
								if (rowData) 
								{
									g_grid.updateData(el_url_table ,{trObj:trObj ,data:databaseData});
								} 
								else 
								{
									g_grid.addData(el_url_table,[databaseData]);
									trObj = g_grid.getTrObj(el_url_table ,{index:trIndex});
								}
								if (opt && opt.detail && opt.detail.monitorStore[0])
								{
									databaseData.monitorId = opt.detail.monitorStore[0].monitorId;
								}
								trObj.data("monitorDetailStore" ,databaseData);
								trObj.data("monitorPerformGridStore" ,g_grid.getData($("[data-id=correctKeyWordList]")));
								trObj.data("monitorFaultGridStore" ,g_grid.getData($("[data-id=errorKeyWordList]")));
								trObj.data("monitorParamGridStore" ,g_grid.getData($("[data-id=paramList]")));
								g_dialog.hide(el);
							}
						}
					});
				}

				function url_delete(rowData ,trObj)
				{
					var deleteArray = el_url_table.data("deleteArray");
					deleteArray.push(rowData.url_config_id);
					trObj.remove();
				}
			})
		},
		COMMON_URL_step5_test : function (el)
		{
			//$("[name=proofRadio]:checked").val()
			var vo = {
				correctKeywordStore : g_grid.getData($("[data-id=correctKeyWordList]")),
				monitorDetailStore : el.find("[id=detail_store_form]").umDataBind("serialize"),
				requestParamStore : g_grid.getData($("[data-id=paramList]")),
				teststore : {
					"agentId": el.find("[data-id=monitorAgent]").val(),
					"assetIds": el.find("[data-id=temp_monitored_asset]").val(),
					"commandPrompt": "",
					"connectType": $("[data-id=connectType]").eq(1).val(),
					"consoleIp": "",
					"context": "",
					"loginPrompt": "",
					"monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
					"monitorPassWord": "",
					"monitorPort": $("[data-id=monitorPort]").eq(1).val(),
					"monitorType": "COMMON_URL",
					"monitorUserName": "",
					"passwordPrompt": "",
					"trustPassWord": "",
					"errorCodeOption":$("[data-id=errorCodeOption]").eq(1).val(),
					"errorCodeValue":$("[data-id=errorCodeValue]").eq(1).val(),
					"proxyIp":$("[data-id=proxyIp]").eq(1).val(),
					"proxyPort":$("[data-id=proxyPort]").eq(1).val(),
					"proxyUserName":Encrypt($("[data-id=proxyUserName]").eq(1).val()),
					"proxyPassWord":Encrypt($("[data-id=proxyPassWord]").eq(1).val()),
					"checkRequest":$("[data-id=checkRequest]").eq(1).val(),
					"urlAddress": $("[data-id=urlAddress]").eq(1).val(),
					"checkContent" : $("[data-id=checkContent]").val()
				},
			};
			for (var i = 0; i < vo.correctKeywordStore.length; i++) {
				vo.correctKeywordStore[i]["_s"] = false;
				vo.correctKeywordStore[i]["_t"] = 1;
			}
			for (var i = 0; i < vo.requestParamStore.length; i++) {
				vo.requestParamStore[i]["_s"] = false;
				vo.requestParamStore[i]["_t"] = 1;
			} 
			vo.monitorDetailStore["_o"] = {};
			vo.monitorDetailStore["_t"] = 3;
			vo.monitorDetailStore["monitorId"] = el.find("[data-id=temp_monitor_id]").val();
			vo.monitorDetailStore["recordCount"] = 1;
			return vo;
		},
		WEBSPHERE_CLUSTER_init : function (el, opt)
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}]
			};
			init();
			function init() 
			{
				g_grid.render(el.find("[id=grid-he]") ,{
					data : [],
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
			}

			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val();
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
				
			});
		},
		WEBSPHERE_init : function (el, opt)
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}],
				data : opt ? opt.detail.urlStore : []
			};
			init();
			function init() 
			{
				g_grid.render(el.find("[id=grid-he]") ,{
					data : gridArg.data,
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				index_form_init(el);
				g_validate.init(el);
			}
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
			el.find("[data-id=errorCodeOption]").trigger("change");

			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val("");
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
				
			});
		},
		WEBSPHERE_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": el.find("[data-id=connectType]").val(),
		        "consoleIp": "",
		        "context": el.find("[data-id=commandPrompt]").val(),
		        "loginPrompt": "",
		        "monitorDatabaseName": "",
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "WEBSPHERE",
		        "monitorUserName": Encrypt(el.find("[data-id=monitorUserName]").val()),
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		WEBSPHERE_HA_init : function (el, opt)
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}]
			};
			init();
			function init() 
			{
				g_grid.render(el.find("[id=grid-he]") ,{
					data : [],
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
			}

			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val("");
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
				
			});
		},
		WEBLOGIC_init : function (el, opt)
		{
			var self = this;
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}],
				data : opt ? opt.detail.urlStore : []
			};
			opt && el.find("[id=detail_store_form]").umDataBind("render",opt.detail.monitorStore[0]);
			opt && baseLineMap(el.find("[data-btn=setWebBaseLine]") ,opt ,"webBaseLineDataStore");
			init();
			function init() 
			{ 
				g_grid.render(el.find("[id=grid-he]") ,{
					data : gridArg.data,
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				$("[data-name=for_open]")[$("[data-name=open]").is(":checked")?"show":"hide"]();
				index_form_init(el);
				g_validate.init(el);
			}

			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				if (el.find("[data-flag=url_flag]").val() == "") 
				{
					g_validate.setError(el.find("[data-flag=url_flag]") ,msg.blank);
					return false;
				} 
				else 
				{
					g_validate.setError(el.find("[data-flag=url_flag]") ,"");
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val("");
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length === 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
			});

			var monitorServerGridObj;

			var gridArg2_data = [];

			var gridLeftArg2_data = [];

			if (opt && opt.detail && opt.detail.monitorServerGridStore
					&& opt.detail.monitorServerGridStore.length > 0)
			{
				monitorServerGridObj = opt.detail.monitorServerGridStore[0];
				if (monitorServerGridObj && monitorServerGridObj.srcIpOrInterface)
				{
					var array = monitorServerGridObj.srcIpOrInterface.split("|");
					var left_tmp = array[0].split(",");
					var right_tmp = array[1].split(",");
					if (left_tmp && left_tmp[0])
					{
						for (var i = 0; i < left_tmp.length; i++) {
							gridLeftArg2_data.push({srcIpOrInterface:left_tmp[i]});
						}
					}
					if (right_tmp && right_tmp[0])
					{
						for (var i = 0; i < right_tmp.length; i++) {
							gridArg2_data.push({srcIpOrInterface:right_tmp[i]});
						}
					}
				}
			}

			var gridArg2 = {
				header : [{text:"服务器名称" ,name:"srcIpOrInterface"}],
				data : gridArg2_data
			};

			var gridLeftArg2 = {
				header : [{text:"服务器名称" ,name:"srcIpOrInterface"}],
				data : gridLeftArg2_data
			};

			init2();
			function init2() 
			{
				var left_grid = el.find("[id=grid-server-left]");
				var right_grid = el.find("[id=grid-server]");
				g_grid.render(el.find("[id=grid-server]") ,{
					data : gridArg2.data,
					header : gridArg2.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});

				g_grid.render(el.find("[id=grid-server-left]") ,{
					data : gridLeftArg2.data,
					header : gridLeftArg2.header,
					paramObj : null,
					hideSearch : true,
					paginator : false,
					cbf : function (){
						getServerTableStr();
					}
				});

				//获取服务器名称
				el.find("[id=server_name_btn]").click(function (){
					um_ajax_get({
						url : "monitorConfig/queryWeblogicServerNames",
						//url : "globalremind/getGlobalRemindCount",
						paramObj : self.WEBLOGIC_step5_test($("#sfxxdj_div")),
						successCallBack : function (data){
							var array = [];
							for (var i = 0; i < data.length; i++) {
								array.push({srcIpOrInterface:data[i]});
							}
							g_grid.removeData(left_grid ,{chk:false});
							g_grid.removeData(right_grid ,{chk:false});
							g_grid.addData(left_grid ,array);
							getServerTableStr();
						}
					});
				});

				//右移事件
				el.find("[data-id=server_add]").click(function(){
					var data = g_grid.getData(left_grid ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(left_grid ,msg.selectOne ,"error");
					}
					else
					{
						g_grid.addData(right_grid ,data);
						g_grid.removeData(left_grid);
						getServerTableStr();
					}
				});

				// 左移事件
				el.find("[data-id=server_remove]").click(function (){
					var data = g_grid.getData(right_grid ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(right_grid ,msg.selectOne ,"error");
					}
					else
					{
						g_grid.addData(left_grid ,data);
						g_grid.removeData(right_grid);
						getServerTableStr();
					}
				});

				// 生成字符串
				function getServerTableStr()
				{
					var left_id_array = g_grid.getIdArray(left_grid ,{attr:"srcIpOrInterface"});
					var right_id_array = g_grid.getIdArray(right_grid , {attr:"srcIpOrInterface"});
					var tableStr = left_id_array.join(",") + "|" + right_id_array.join(",");
					left_grid.data("data" ,tableStr);
				}

				// 设置web程序基线
				el.find("[data-btn=setWebBaseLine]").click(function (){
					self.baseLineDialog(el.find("[data-btn=setWebBaseLine]") ,{
						url : "monitorConfig/queryWeblogicWarList",
						atteIndex : 2,
						paramObj : self.WEBLOGIC_step5_test($("#sfxxdj_div")),
						header : webBaseLineHeader,
						searchKey : ['warName']
					});
				});
			}
			
		},
		WEBLOGIC_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].consoleIp]:0);
			dis(el.find("[data-box=tab-div]"));
			g_mask.mask(el.find("[data-box=tab-div]"));
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						dis(sshDiv);
						dis(telnet,true);
					} 
					else 
					{
						dis(sshDiv,true);
						dis(telnetDiv);
					}
				} 
				else
				{
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([sshDiv,telnetDiv]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="SSH2") 
				{
					el.find("[data-name=open]").prop("checked",true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv,true);
					dis(telnetDiv);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="TELNET") 
				{
					el.find("[data-name=open]").prop("checked",true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv);
					dis(telnetDiv,true);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="-1") 
				{
					el.find("[data-name=open]").prop("checked",false);
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
				telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		WEBLOGIC_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if($(this).find("[data-name=open]").is(":checked")) 
				{
					if (connectType=="SSH2") 
					{
						certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
					}
					if (connectType=="TELNET") 
					{
						certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
					}
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
					certStore[i].consoleIp = connectType;
				} 
				else 
				{
					certStore = [{"trustName":"","trustPassWord":"","consolePort":"","commandPrompt":"","loginPrompt":"","passwordPrompt":"","consoleIp":"-1"}];
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				}
			});
			return certStore;
		},
		WEBLOGIC_step5_test : function (el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "WEBLOGIC";
			vo.teststore.connectType = el.find("[data-id=connectType]").val();
			vo.teststore.context = "";
			vo.teststore.monitorPassWord = Encrypt(el.find("[data-id=monitorPassWord]").val());
			vo.teststore.monitorPort = el.find("[data-id=monitorPort]").val();
			vo.teststore.monitorUserName = Encrypt(el.find("[data-id=monitorUserName]").val());
			vo.teststore.version = el.find("[data-id=version]").val();
			return vo;
		},
		ARRAY_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
		},
		ARRAY_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ARRAY_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		H3C_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
			if (opt.detail.monitorStore[0].arpFlag == "1")
				el.find("[data-id=arpFlag]").prop("checked" ,"checked")
			if (opt.detail.monitorStore[0].dbUser == "1")
				el.find("[data-id=dbUser]").prop("checked" ,"checked")
			if (opt.detail.monitorStore[0].dbPass == "1")
				el.find("[data-id=dbPass]").prop("checked" ,"checked")
		},
		H3C_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				opt.detail.monitorStore && el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				opt.detail.monitorSnmpStore && snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
            el.find("[data-name=open]").trigger("change");
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		H3C_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2")
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET")
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="" || connectType=="SNMP")
				{
					certStore.push({});
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				certStore[i].snmpVo.edId = certStore[i].edId;
			});
			return certStore;
		},
		NE_HUAWEI_init : function(el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		NE_HUAWEI_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				opt.detail.monitorStore && el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				opt.detail.monitorSnmpStore && snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NE_HUAWEI_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				certStore[i].snmpVo.edId = certStore[i].edId;
			});
			return certStore;
		},
		NE_HUAWEI_step5_test : function (el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "NE_HUAWEI";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		SANGFORFW_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		SANGFORFW_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && (Object.keys(opt.detail).length > 0) && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		SANGFORFW_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore.push({
					connectType : "SNMP",
					edId :  $("[data-id=temp_monitored_asset]").val().split(",")[i],
					snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")
				})
				// certStore[i].snmpVo.edId = certStore[i].edId;
				// certStore[i].connectType = "SNMP";
				// certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				// certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				// certStore[i].snmpVo.edId = certStore[i].edId;
			});
			return certStore;
		},
		SANGFORFW_step5_test : function (el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "NE_HUAWEI";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		IBM_STORAGE_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
		},
		IBM_STORAGE_step4 : function(el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			dis(telnetDiv);
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
				}
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				}
				sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		IBM_STORAGE_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		IBM_STORAGE_DS5020_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
		},
		HW_OCEANSTOR_init : function (el ,opt){
		},
		HW_OCEANSTOR_step4 : function (el ,opt){
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		HW_OCEANSTOR_9000_init : function (el ,opt){
		},
		HW_OCEANSTOR_9000_step4 : function (el ,opt){
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
        TE40_init:function(el,opt){

        },
        TE40_step4:function(el,opt){
        	var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);
			el.find("[data-id=snmpVersion]").trigger('change')

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
        },
        TONGLINK_init:function(el,opt){

        },
        TONGLINK_step4:function(el,opt){
        	
        },
        SNGFORAD_init:function(el,opt)
        {
        	index_form_init(el);
			g_validate.init(el);
        	opt && el.umDataBind("render", opt.detail.monitorStore[0]);
        },
        SNGFORAD_step4:function(el,opt){
        	var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);
			el.find("[data-id=snmpVersion]").trigger('change')


			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
        },
        SNGFORAD_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = connectType;
			});
			return certStore;
		},
        SANGFOR_init:function(el,opt)
        {
        	index_form_init(el);
			g_validate.init(el);
        	opt && el.umDataBind("render", opt.detail.monitorStore[0]);
        },
        SANGFOR_step4:function(el,opt){
        	var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);
			el.find("[data-id=snmpVersion]").trigger('change')


			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
        },
        SANGFOR_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = connectType;
			});
			return certStore;
		},
		HDS_RAID_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
		},
		HDS_RAID_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		HDS_RAID_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		NETAPP_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		NETAPP_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NETAPP_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = connectType;
			});
			return certStore;
		},
		APC_UPS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
		},
		APC_UPS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		APC_UPS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		PING_init : function (el, opt) 
		{
			var gridArg = {
				header : [{text:"IP地址" ,name:"urlAddress"},
						  {text:"超时时间(s)",name:"timeOut"},
						  {text:"TTL(跳数)",name:"tryTtl"}]
			};
			var dataPing = opt ? opt.detail.pingUrlStore : [];
			if (dataPing[0])
				el.find("#ping_info").umDataBind("render" ,dataPing[0])
		},
		PING_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": el.find("[data-id=commandPrompt]").val(),
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "PING",
		        "monitorUserName": "",
		        "passwordPrompt": "",
		        "trustPassWord": "",
		        "pingCount":$("[data-flag=pingCount]").val()
					}
			};
			return teststore;
		},
		COMMON_JMX_init : function (el, opt)
		{
			var gridArg = {
				header : [{text:"已配置MBean域" ,name:"mBean"}],
				data : opt ? opt.detail.monitorStore : []
			};
			init();
			function init() 
			{
				g_grid.render(el.find("[id=grid-mbean]") ,{
					data : gridArg.data,
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
				if (opt) 
				{
					el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				}
			}

			//右移事件
			el.find("[data-id=mbean_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-mbean]") ,{attr:"mBean"});
				if (el.find("[data-flag=mbean_flag]").val()=="")
				{
					g_validate.setError(el.find("[data-flag=mbean_flag]"), msg.blank);
					return false;
				} 
				else 
				{
					g_validate.setError(el.find("[data-flag=mbean_flag]"), "");
				}
				if (processArray.indexOf(el.find("[data-flag=mbean_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-mbean]") ,[{
					mBean : $("[data-flag=mbean_flag]").val()
				}]);
				$("[data-flag=mbean_flag]").val("");
			});
			
			// 左移事件
			el.find("[data-id=mbean_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-mbean]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=mbean_flag]").val(data[0].mBean);
					g_grid.removeData(el.find("[id=grid-mbean]"));
				}
				
			});
		},
		COMMONTCP_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			el.find("[data-id=consoleIp]").change(function(){
				var tisVal = $(this).val();
				if (tisVal == "HTTP") 
				{
					el.find("[data-id=monitorPort]").val("80");
				}
				if (tisVal == "SMTP") 
				{
					el.find("[data-id=monitorPort]").val("25");
				}
				if (tisVal == "POP3") 
				{
					el.find("[data-id=monitorPort]").val("110");
				}
				if (tisVal == "NNTP") 
				{
					el.find("[data-id=monitorPort]").val("119");
				}
				if (tisVal == "自定义") 
				{
					el.find("[data-id=monitorPort]").val("");
				}
			});
			el.find("[data-id=consoleIp]").trigger("change");
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
			}
		},
		COMMONTCP_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": "",
		        "consoleIp": el.find("[data-id=consoleIp]").val(),
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": "",
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "COMMONTCP",
		        "monitorUserName": "",
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		NGINX_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			el.find("[data-id=consoleIp]").change(function(){
				var tisVal = $(this).val();
				if (tisVal == "HTTP") 
				{
					el.find("[data-id=monitorPort]").val("80");
				}
				if (tisVal == "HTTPS") 
				{
					el.find("[data-id=monitorPort]").val("443");
				}
			});
			el.find("[data-id=consoleIp]").trigger("change");
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
			}
		},
		NGINX_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
				        "agentId": el.find("[data-id=monitorAgent]").val(),
				        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
				        "commandPrompt": "",
				        "connectType": "",
				        "consoleIp": el.find("[data-id=consoleIp]").val(),
				        "context": el.find("[data-id=consoleIp]").val(),
				        "loginPrompt": "",
				        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
				        "monitorPassWord": el.find("[data-id=monitorPassWord]").val(),
				        "monitorPort": el.find("[data-id=monitorPort]").val(),
				        "monitorType": "NGINX",
				        "monitorUserName": el.find("[data-id=monitorUserName]").val(),
				        "passwordPrompt": "",
				        "trustPassWord": ""
					}
			};
			return teststore;
		},
		SECWORLD_init: function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			}	
		},
		SECWORLD_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		SECWORLD_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		COMMON_SNMP_init : function (el, opt)
		{
			var paramArg = {
				header : [
			              {text:"变量名" ,name:"varName"},
						  {text:"OID字段" ,name:"oidField"},
						  {text:"字段类型" ,name:"oidFieldType" ,render:function (txt){
						  		if (txt == "1")
						  			return "字符型"
						  		else if (txt == "2")
						  			return "数字型"
						  		else
						  			return "----"
						  }},
						  {text:"显示名称" ,name:"oidShowName"},
						  {text:"显示模式" ,name:"showMode" ,render:function (txt){
						  	if(txt=="1") return "列表";
						  	if(txt=="2") return "图表";
						  	//return txt
						  }},
						  {text:"是否存储" ,name:"storageStatus",render:function(txt){
                              if(txt=="1") return "是"
                              if(txt=="0") return "否"
						  }},
					],
				oper : [
							{icon:"rh-icon rh-edit" ,text:"修改" ,aclick:instance_edit},
							{icon:"rh-icon rh-delete" ,text:"删除" ,aclick:instance_remove}
					]
			};
			init();
			event_init();
			function init() 
			{
				g_grid.render(el.find("[id=oid_info_list_div]") ,{
					data : [],
					header : paramArg.header,
					oper : paramArg.oper,
					operWidth : "100px",
					paramObj : null,
					hideSearch : true,
					paginator : true,
					allowCheckBox : false,
					cbf : function (){
						if (opt && opt.detail && opt.detail.commonSnmpOidStore)
							g_grid.addData(el.find("[id=oid_info_list_div]") ,opt.detail.commonSnmpOidStore)
					}
				});
				g_validate.init(el);
			}
			function event_init() 
			{
				el.find("#oid_add_btn").click(function(){
					instance_edit();
				});
			}

			function instance_edit(rowData ,trObj) 
			{
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_20.html",
					success : function (data) 
					{
						g_dialog.dialog($(data).find("[data-id=oid_add_div]") ,{
							width : "900px",
							title : "Oid信息",
							init : init,
							autoHeight : "autoHeight",
							saveclick : save
						});
					}
				});
				function init(el) 
				{
					if (!opt)
						el.find("#__mask").remove()
					var number_sel_array = [{id:"-1" ,text:"----"},{id:"0" ,text:"  < "},{id:"1" ,text:"  == "},
											{id:"2" ,text:"  > "},{id:"3" ,text:"  != "},{id:"4" ,text:"  >= "},{id:"5" ,text:"  <= "}]
					var char_sel_array = [{id:"-1" ,text:"----"},{id:"0" ,text:"startWith"},{id:"1" ,text:"endWith"},
											{id:"2" ,text:"contains"},{id:"3" ,text:"equals"}]
					el.find("[data-id=showMode]").addClass("disabled");

					var varList =g_grid.getData($("#oid_info_list_div"));						
					for(var i=0;i<varList.length;i++)
					{
						if(varList[i].oidFieldType!=-1)
						{
							$(".varList").find("select").append("<option value='"+varList[i].varName+"'>"+varList[i].varName+"</option>");
						}
						
					}
					

					el.find("[data-id=oidFieldType]").change(function(){
						el.find("[data-id=showMode]").val(el.find("[data-id=oidFieldType]").val()==1?"列表":"图表");
						el.find("[data-id=perfThresholdOper]").empty()
						el.find("[data-id=faultThresholdOper]").empty()
						el.find("[data-id=performValue]").removeAttr("validate")
						el.find("[data-id=failValue]").removeAttr("validate")
						$("#perf_wrap_div").show()
						if ($(this).val() == "-1"){
							el.find("[data-id=perfThresholdOper]").select2({data: [{id:"-1" ,text:"----"}],width:"100%",minimumResultsForSearch:-1});
							el.find("[data-id=faultThresholdOper]").select2({data: [{id:"-1" ,text:"----"}],width:"100%",minimumResultsForSearch:-1});
						}
						if ($(this).val() == "1"){
							el.find("[data-type=num]").hide()
							el.find("[data-id=perfThresholdOper]").select2({data: char_sel_array,width:"100%",minimumResultsForSearch:-1});
							el.find("[data-id=faultThresholdOper]").select2({data: char_sel_array,width:"100%",minimumResultsForSearch:-1});
							$("#perf_wrap_div").hide()
							$("#perf_wrap_div").umDataBind("reset")
						}
						if ($(this).val() == "2"){
							el.find("[data-type=num]").show()
							el.find("[data-id=performValue]").attr("validate" ,"number")
							el.find("[data-id=failValue]").attr("validate" ,"number")
							el.find("[data-id=perfThresholdOper]").select2({data: number_sel_array,width:"100%",minimumResultsForSearch:-1});
							el.find("[data-id=faultThresholdOper]").select2({data: number_sel_array,width:"100%",minimumResultsForSearch:-1});
						}
					});
					el.find("[data-id=varType]").change(function(){
						g_validate.reset(el)
						if($(this).val()=="1")
						{
							$("#complexExpress").hide();
							$("#simpleExpress").show();
							$(".varList").hide();
							$(".varList").attr("disabled" ,"disabled")
						    $(".varList").find("select").removeAttr("validate");
						    // $(".varList").find("select").empty();
						    $(".oidField").addClass("required");
							$("[data-id=oidField]").attr("validate","required");

						}
						if($(this).val()=="2")
						{
							$("#complexExpress").show();
							$("#simpleExpress").hide();
							$(".varList").show();
							$(".varList").removeAttr("disabled" ,"disabled")
							$(".varList").find("select").attr("validate","required");
							$(".oidField").removeClass("required");
							$("[data-id=oidField]").removeAttr("validate");

						}
					})
					el.find("[data-id=varType]").trigger("change");
                    el.find("[data-id=oidFieldType]").trigger("change");
					if (rowData) 
					{ 
						el.umDataBind("render" ,rowData);
						el.find("[data-id=oidFieldType]").trigger("change");
						el.umDataBind("render" ,rowData);
						el.find("[data-id=perfThresholdOper]").trigger("change");
						el.find("[data-id=faultThresholdOper]").trigger("change");
						el.find("[data-id=varType]").trigger("change");
						if(rowData.varType==2)
						{
							if(rowData.varList)
							{
								el.find("[data-id=varList]").val(rowData.varList.split(","))
							    el.find("[data-id=varList]").trigger("change");
							}
						
						}
						el.find("[data-id=showMode]").val(rowData.oidFieldType==1?"列表":"图表");
						opType = "edit";
					}
				}
				function save(el ,saveObj)
				{
				
					if(!g_validate.validate(el.find('[data-id=oid_add_div]')))
					{
						return false;
					}
                    if(saveObj.varType==2)
                    {
                    	saveObj.varList=saveObj.varList.join(",");
                    }

					var databaseData = el.find('[data-id=oid_add_div]').umDataBind("serialize");
					if(saveObj.varType==2)
					{
						databaseData.varList = databaseData.varList.join(",");
					}					
					g_dialog.hide("oid_add_div");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[id=oid_info_list_div]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[id=oid_info_list_div]") ,[databaseData]);
					}
				}
			}
		},
		COMMON_SNMP_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		COMMON_SNMP_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		COMMONSCRIPT_init : function (el, opt)
		{
			var header = {
				grid_script_list_header : [
						  {text:"脚本名称" ,name:"scriptName"},
						  {text:"脚本命令" ,name:"scriptContent"}
					]
			};
			var oper = {
				grid_script_list_oper : [
							{icon:"icon-pencil" ,text:"修改" ,aclick:instance_edit},
							{icon:"icon-trash" ,text:"删除" ,aclick:instance_remove}
					]
			};
			init();
			event_init();
			function init() 
			{
				var scriptData = opt ? opt.detail.commonScriptStore : [];
				g_grid.render(el.find("[id=script_list_div]") ,{
					data : scriptData,
					header : header.grid_script_list_header,
					oper : oper.grid_script_list_oper,
					operWidth : "100px",
					paramObj : null,
					hideSearch : true,
					allowCheckBox : false,
					paginator : false
				});
				g_validate.init(el);
			}

			function event_init() 
			{
				el.find("#script_config_btn").click(function(){
					instance_edit();
				});
			}

			function instance_edit(rowData ,trObj) 
			{
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_21.html",
					success : function (data) 
					{
						g_dialog.dialog($(data).find("[data-id=script_config_div]") ,{
							width : "700px",
							title : "添加脚本配置信息",
							init : init,
							saveclick : save
						});
					}
				});
				function init(el) 
				{
					if (rowData) 
					{
						el.umDataBind("render" ,rowData);
						opType = "edit";
					}
					el.find("textarea").blur(function(){
						var errmsg = $(this).val()!=="" ? "" : "不能为空。";
						g_validate.setError($(this) ,errmsg);
					});
				}
				function save(el ,saveObj)
				{
					if(!g_validate.validate(el.find('[data-id=script_config_div]')))
					{
						return false;
					}
					if (el.find("[data-id=eventType]").val() === "0" && !/^\d+$/.test(el.find("[data-id=keyword]").val())) 
					{
						g_dialog.operateAlert(el,"如果选择性能事件，请关键字填写数字类型。","error");
						return false;
					}
					el.find("[data-id=monitorId]").val(opt?rowData.monitorId:"");
					var databaseData = el.find('[data-id=script_config_div]').umDataBind("serialize");
					g_dialog.hide("script_config_div");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[id=script_list_div]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[id=script_list_div]") ,[databaseData]);
					}
				}
			}
		},
		COMMONSCRIPT_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			dis([sshDiv,telnetDiv]);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		COMMONSCRIPT_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		COMMONDB_init : function (el, opt)
		{
			var header = {
				grid_sql_list_header : [
						  {text:"查询SQL名称" ,name:"sqlName"},
						  {text:"查询SQL" ,name:"t_monitor_master"}
					],
				grid_line_name_header : [
							{text:"列名称",name:"lineName"},
							{text:"类型",name:"colunmType"},
							{text:"长度",name:"colunmSize"}
					]
			};
			var oper = {
				grid_sql_list_oper : [
							{icon:"icon-pencil",text:"修改",aclick:instance_edit},
							{icon:"icon-trash",text:"删除",aclick:instance_remove}
					]
			};
			var url = {
				grid_line_name_url : "monitorConfig/queryLineName"
			};
			init(el);
			event_init();
			function init(el) 
			{
				g_grid.render(el.find("[id=sql_list_div]") ,{
					data : [],
					header : header.grid_sql_list_header,
					oper : oper.grid_sql_list_oper,
					operWidth : "100px",
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				el.find("[id=sql_list_div]").height(el.find("[class=actionBar]").offset().top - el.find("[id=table_oper]").offset().top - 50);
				//周期类型
				el.find("[data-id=timerStatus]").change(function(){
					var status = $(this).val();
					var tarEl = el.find("[data-name=cycleTime]");
					if (status == 0) 
					{
						tarEl.show();
					}
					if (status == 1) 
					{
						tarEl.hide();
					}
				});
				el.find('[data-value=typeWeek]').click(function(event)
				{
					$(this).val("00:00:00")
				});
				//设定周期的变换事件
				el.find("select[data-id=monitorCycleType]").change(function ()
				{
					var tmp = $(this).val();
					// 先把option全部清除
					el.find("select[data-id=period]").find("option").remove();
					el.find("select[data-id=period]").trigger("change");

					if (tmp == "1")
					{
						el.find("select[data-id=period]").attr("disabled","disabled");
					}
					if (tmp == "2")
					{
						el.find("select[data-id=period]").removeAttr("disabled");
						// 添加周一至周日
						el.find("select[data-id=period]").append('<option value="1">星期日</option>');
						el.find("select[data-id=period]").append('<option value="2">星期一</option>');
						el.find("select[data-id=period]").append('<option value="3">星期二</option>');
						el.find("select[data-id=period]").append('<option value="4">星期三</option>');
						el.find("select[data-id=period]").append('<option value="5">星期四</option>');
						el.find("select[data-id=period]").append('<option value="6">星期五</option>');
						el.find("select[data-id=period]").append('<option value="7">星期六</option>');
					}
					if (tmp == "3")
					{
						el.find("select[data-id=period]").removeAttr("disabled");
						// 添加1-28天
						for (var i = 1; i < 29; i++)
						{
							el.find("select[data-id=period]").append('<option value="'+i+'">'+i+'日</option>');
						}
					}
					el.find("select[data-id=period]").trigger("change");
				});
				index_form_init(el);
				g_validate.init(el);
			}
			function event_init() 
			{
				el.find("#add_sql_btn").click(function(){
					instance_edit();
				});
			}

			function instance_edit(rowData ,trObj) 
			{
				var opType;
				var title = rowData ? "修改SQL语句信息" : "添加SQL语句信息";
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_23.html",
					success : function (data) 
					{
						g_dialog.dialog($(data).find("[data-id=add_sql_div]") ,{
							width : "900px",
							title : title,
							init : init,
							top : "6%",
							saveclick : save
						});
					}
				});
				function init(el) 
				{
					if (rowData) 
					{
						el.umDataBind("render" ,rowData);
						opType = "edit";
					}
					// 查询SQL列名称
					$("[data-id=queryColunmNameBtn]").click(function(){
						line_name_query();
					});
				}
				function save(el ,saveObj)
				{
					if(!g_validate.validate(el.find('[id=detail_store_form]')))
					{
						return false;
					}
					var databaseData = el.find('[data-id=add_sql_div]').umDataBind("serialize");
					g_dialog.hide("add_sql_div");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[id=sql_list_div]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[id=sql_list_div]") ,[databaseData]);
					}
				}
			}

			function line_name_query() 
			{
				// 渲染列表
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_23.html",
					success : function (data) 
					{
						var temEl = $(data);
						g_dialog.dialog(temEl.find("[data-id=line_name]") ,{
							width : "600px",
							title : "列名信息",
							init : init,
							saveclick : save
						});
						function init() 
						{
							var param = {
								monitorType : "COMMONDB",
								lineNamestore : {
									loginPrompt: el.find("[data-id=loginPrompt]").val(),
									monitorAgent: $("[data-id=base_info]").umDataBind("serialize").monitorAgent,
									monitorDatabaseName: el.find("[data-id=monitorDatabaseName]").val(),
									monitorPassWord: el.find("[data-id=monitorPassWord]").val(),
									monitorPort: el.find("[data-id=monitorPort]").val(),
									monitorUserName: el.find("[data-id=monitorUserName]").val(),
									notMonitoredEntity: $("[data-id=temp_monitored_asset]").val(),
									serviceName: "",
									sql: $("[data-id=t_monitor_master]").val(),
									vip: ""
								}
							};
							// 空参提示
							var arg = param.lineNamestore;
							if (arg.notMonitoredEntity == "" || arg.monitorUserName == "" || arg.monitorPassWord == "" || arg.monitorDatabaseName == "" || arg.monitorPort == "" || arg.sql == "") 
							{
								g_dialog.operateAlert(el ,"获取列名称信息必须填写被监控资产名称、用户名、密码、数据库名、端口和查询SQL信息。" ,"error");
							}
							um_ajax_post({
								url : url.grid_line_name_url,
								paramObj : param,
								successCallBack : function (data) 
								{
									var Data = data.lineNamestore;
									g_grid.render($("[id=line_name_div]") ,{
										data : Data,
										header : header.grid_line_name_header,
										paramObj : null,
										hideSearch : true,
										paginator : false
									});
								}
							});
						}

						function save(el ,saveObj) 
						{
							var selData = g_grid.getData(el.find("[id=line_name_div]"),{chk:true}); 
							if (selData.length == 0) 
							{
								g_dialog.operateAlert(el ,msg.noSelect ,"error");
								return false;
							}
							if (selData.length > 1) 
							{
								g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
								return false;
							}
							g_dialog.hide(el);
							$("[data-id=colunmName]").val(selData[0].lineName);
						}
					}
				});

			}
		},
		WEBSERVICE_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
			}
		},
		WEBSERVICE_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": "",
		        "monitorPassWord": "",
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "WEBSERVICE",
		        "monitorUserName": "",
		        "passwordPrompt": "",
		        "trustPassWord": "",
		        url : el.find("[data-id=url]").val()
					}
			};
			return teststore;
		},
		SYBASE_init : function (el, opt)
		{
			// 没写完的，参考oracle
			var grid_height = el.find("#um_step_5").height()-el.find("#form_memory").height()-el.find('#table_oper').height();
			var header = {
				grid_database_list_header : [
						  {text:"数据库名" ,name:""},
						  {text:"端口" ,name:""},
						  {text:"用户名" ,name:""},
						  {text:"连接数使用率阈值(%)" ,name:""},
						  {text:"会话数阈值(个)" ,name:""},
						  {text:"数据库锁数量阈值(个)" ,name:""}
					]
			};
			var instanceFlag = "upd";
			var instanceName;
			init();
			event_init();
			function init() 
			{
				g_grid.render(el.find("[data-id=database-nu]") ,{
					data : [],
					header : header.grid_database_list_header,
					paramObj : null,
					hideSearch : true,
					paginator : true
				});
				el.find('[data-id=database-nu]').height(grid_height);
				g_validate.init(el);
			}
			function event_init() 
			{
				el.find("#database_add_btn").click(function(){
					instanceFlag = "add";
					instance_edit();
				});
			}

			function instance_edit(rowData ,trObj) 
			{
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_8.html",
					success : function (data) 
					{
						g_dialog.dialog($(data).find("[data-id=monitor_index_edit]") ,{
							width : "900px",
							title : "添加数据库信息",
							init : init,
							saveclick : save
						});
					}
				});
				function init(el) 
				{

				}
				function save(el)
				{

				}
			}
		},
		APACHE_init : function (el, opt)
		{
			var gridArg = {
				header : [{text:"URL地址" ,name:"urlAddress"}],
				data : opt ? opt.detail.urlStore : []
			};
			init();
			function init() 
			{
				g_grid.render(el.find("[id=grid-he]") ,{
					data : gridArg.data,
					header : gridArg.header,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_validate.init(el);
				if (opt) 
				{
					el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				}
			}

			//右移事件
			el.find("[data-id=url_add]").click(function(){
				if (!g_validate.validate(el.find("#app_url"))){
					return false;
				}
				var processArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
				if (el.find("[data-flag=url_flag]").val()=="")
				{
					g_validate.setError(el.find("[data-flag=url_flag]"), "不能为空。");
					return false;
				}
				if (processArray.indexOf(el.find("[data-flag=url_flag]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[id=grid-he]") ,[{
					urlAddress : $("[data-flag=url_flag]").val()
				}]);
				$("[data-flag=url_flag]").val("");
			});

			// 左移事件
			el.find("[data-id=url_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-he]") ,{chk:true});
				if (data.length == 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=url_flag]").val(data[0].urlAddress);
					g_grid.removeData(el.find("[id=grid-he]"));
				}
			});
		},
		APACHE_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
				        "agentId": el.find("[data-id=monitorAgent]").val(),
				        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
				        "commandPrompt": el.find("[data-id=commandPrompt]").val(),
				        "connectType": "",
				        "consoleIp": el.find("[data-id=consoleIp]").val(),
				        "context": "",
				        "loginPrompt": "",
				        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
				        "monitorPassWord": el.find("[data-id=monitorPassWord]").val(),
				        "monitorPort": el.find("[data-id=monitorPort]").val(),
				        "monitorType": "APACHE",
				        "monitorUserName": el.find("[data-id=monitorUserName]").val(),
				        "passwordPrompt": "",
				        "trustPassWord": ""
					}
			};
			return teststore;
		},
		NE_CISCO_step4 : function (el ,opt){
			var sshDiv = el.find("[data-getter=ssh]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NE_CISCO_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		DBAPP_NESSUS_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis([telnetDiv],["input","select"]);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis([sshDiv],["input","select"]);
						g_validate.clear(sshDiv);
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv],["input","select"]);
				}
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv],["input","select"]);
				}
				sshDiv.find("[data-id=monitorPort]").val()=== "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() === "" && telnetDiv.find("[data-id=monitorPort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DBAPP_NESSUS_leave_step4 : function(el,opt) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DBAPP_NESSUS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		DBAPP_LOGGER_step4 : function (el, opt) 
		{

			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis([telnetDiv],["input","select"]);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis([sshDiv],["input","select"]);
						g_validate.clear(sshDiv);
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv],["input","select"]);
				}
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv],["input","select"]);
				}
				sshDiv.find("[data-id=monitorPort]").val()=== "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() === "" && telnetDiv.find("[data-id=monitorPort]").val("23");
			}

			opt.detail && Object.keys(opt.detail).length > 0 && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DBAPP_LOGGER_leave_step4 : function(el,opt) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DBAPP_LOGGER_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		MAIPU_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
		},
		MAIPU_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		MAIPU_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		RUIJIE_RSR_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render", opt.detail.monitorStore[0]);
		},
		RUIJIE_RSR_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		RUIJIE_RSR_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		ZTE_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
		},
		ZTE_step4 : function(el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = snmpDiv.find("[data-getter=v1]");
			var snmpv2 = snmpDiv.find("[data-getter=v2]");
			var snmpv3 = snmpDiv.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1, "SNMP":2};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(telnetDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(sshDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis([sshDiv,telnetDiv]);
						g_validate.clear(sshDiv);
						g_validate.clear(telnetDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
						dis([sshDiv,telnetDiv,snmpv2,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
						dis([sshDiv,telnetDiv,snmpv1,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
						dis([sshDiv,telnetDiv,snmpv1,snmpv2]);
					}
				} 
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ZTE_leave_step4 : function(el) 
		{
			var certStore = [];
			var connectType = el.find("[data-store=connectType]").val(); 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType == "SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = connectType;
			});
			return certStore;
		},
		ZTE_step5_test : function (el) 
		{
			var teststore =
			{
				teststore : 
						{
							"agentId": el.find("[data-id=monitorAgent]").val(),
							"assetIds": el.find("[data-id=temp_monitored_asset]").val(),
							"commandPrompt": "",
							"connectType": "",
							"consoleIp": "",
							"context": "",
							"loginPrompt": "",
							"monitorDatabaseName": "",
							"monitorPassWord": "",
							"monitorPort": el.find("[data-id=monitorPort]").val(),
							"monitorType": "ZTE",
							"monitorUserName": "",
							"passwordPrompt": "",
							"trustPassWord": ""
						}
			}

			return teststore;
		},
		ANCHIVA_SWG_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		ANCHIVA_SWG_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ANCHIVA_SWG_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		ANCHIVA_WAF_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		ANCHIVA_WAF_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ANCHIVA_WAF_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		CISCO_ASA_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		CISCO_ASA_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		CISCO_ASA_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DBAPP_USM_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		DBAPP_USM_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DBAPP_USM_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		ANYBACK_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		ANYBACK_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ANYBACK_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DBAPPWEB_FW_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		DBAPPWEB_FW_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DBAPPWEB_FW_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DBAPP_DAS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		DBAPP_DAS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DBAPP_DAS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DPTECH_FW_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		DPTECH_FW_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DPTECH_FW_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		DPTECH_IPS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		DPTECH_IPS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		DPTECH_IPS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		LEADSEC_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		LEADSEC_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		LEADSEC_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		LENOVOIDS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		LENOVOIDS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		LENOVOIDS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		LENOVOVPN_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		LENOVOVPN_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		LENOVOVPN_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		NSFOCUS_SAS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		NSFOCUS_SAS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
						dis([snmpv2,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
						dis([snmpv1,snmpv2]);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NSFOCUS_SAS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		NSFOCUS_RSAS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		NSFOCUS_RSAS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NSFOCUS_RSAS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		NETEYE_FIREWALL_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		NETEYE_FIREWALL_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis(el.find("[data-box=tab-div]"));
			g_mask.mask(el.find("[data-box=tab-div]"));
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						dis(sshDiv);
						dis(telnetDiv,true);
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						dis(sshDiv,true);
						dis(telnetDiv);
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				el.find("[data-name=open]").is(":checked") && sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				el.find("[data-name=open]").is(":checked") && telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NETEYE_FIREWALL_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				certStore[i].snmpVo.edId = certStore[i].edId;
			});
			return certStore;
		},
		NETEYE_FIREWALL_step5_test : function (el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "NE_HUAWEI";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		NETKEEPER_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorDetailStore);
			}
		},
		NETKEEPER_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": "",
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": "",
		        "monitorPassWord": "",
		        "monitorPort": "",
		        "monitorType": "NETKEEPER",
		        "monitorUserName": "",
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		RUIJIE_FIREWALL_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		RUIJIE_FIREWALL_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		RUIJIE_FIREWALL_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		RISING_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		RISING_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		RISING_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		TOPSECAV_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		TOPSECAV_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		TOPSECAV_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		TOPSECFW_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		TOPSECFW_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && (Object.keys(opt.detail).length > 0) && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		TOPSECFW_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				certStore[i].snmpVo.edId = certStore[i].edId;
			});
			return certStore;
		},
		TOPSECFW_step5_test : function (el)
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "NE_HUAWEI";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		TOPSECWAF_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		TOPSECWAF_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && (Object.keys(opt.detail).length > 0) && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		TOPSECWAF_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				certStore[i].snmpVo.edId = certStore[i].edId;
			});
			return certStore;
		},
		TOPSECWAF_step5_test : function (el)
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "NE_HUAWEI";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		NE_HUAWEIFW_init : function(el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
			el.find("[data-id=cpuUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=cpuGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=cpuGetTimes]").removeAttr("disabled").val("3");
				}
			});
			el.find("[data-id=memoryUseRate]").change(function(){
				if($(this).val() === "") 
				{
					el.find("[data-id=memoryGetTimes]").attr("disabled" ,"disabled").val("");
				} 
				else
				{
					el.find("[data-id=memoryGetTimes]").removeAttr("disabled").val("3");
				}
			});
		},
		NE_HUAWEIFW_step4 : function (el, opt)
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && (Object.keys(opt.detail).length > 0) && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NE_HUAWEIFW_step5_test : function (el)
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "NE_HUAWEI";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		TOPSEC_IDS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		TOPSEC_IDS_step4 : function (el, opt)
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		TOPSEC_IDS_leave_step4 : function (el)
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUS_LOAD_init : function (el ,opt){
		},
		VENUS_LOAD_step4 : function (el ,opt){
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_FW_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUS_FW_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_FW_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUS_UTM_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUS_UTM_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_UTM_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUS_WAF_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUS_WAF_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_WAF_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUS_ADM_DDOS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUS_ADM_DDOS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_ADM_DDOS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUS_NSAS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUS_NSAS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUS_NSAS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		VENUST_IDS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VENUST_IDS_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		VENUST_IDS_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		AIX_init : function (el, opt)
		{
			var self = this;
			var header = {
				al : [
							{text:"被监控分区",name:"performModule"},
							{text:"阈值(%)",name:"value", dbclick : true
							, tdBlur : function(trData){
									moduleValueCalc(trData);
							}},
							// {text:"剩余空间(M)",name:"performName", dbclick : true
							// , tdBlur : function(trData){
							// 		performNameCalc(trData);
							// }
							// ,render : function(trObj ,data){
							// 	var res = Math.round(Number(data.lastTime)*(1-(Number(data.value)/100)));
							// 	return res;
							// }},
							{text:"剩余空间(M)",name:"performName"}
						],
				ar : [
							{text:"不被监控分区",name:"performModule"},
							{text:"阈值(%)",name:"value"},
							{text:"剩余空间(M)",name:"performName"}
						],
				i : [
							{text:"脚本全路径",name:"name"},
							{text:"脚本参数",name:"value"}
						],
				u : [
							{text:"已配置进程",name:"faultModule"}
						],
				server : [
							{text:"JavaCore文件路径",name:"srcIpOrInterface"}
						]
			};
			var tableTemp = {
				g_tableSize : [],
				tableSpaceName : []
			};
			init();
			event_init();
			function init() 
			{
				var data = {
					al : [],
					ar : [],
					i : [],
					u : [],
					server : []
				};
				if (opt) 
				{
					opt.detail.monitorStore[0].rcCmd = opt.detail.monitorStore[0].rcCmd==null ? "" : opt.detail.monitorStore[0].rcCmd.split(";");
					opt.detail.monitorStore[0].scCmd = opt.detail.monitorStore[0].scCmd==null ? "" : opt.detail.monitorStore[0].scCmd.split(";");
					el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
					data.al = opt.detail.monitorPerformGridStore;
					data.ar = opt.detail.monitorUnPerformGridStore;
					data.i = opt.detail.monitorScriptGridStore;
					data.u = opt.detail.faultStore;
					data.server = opt.detail.monitorServerGridStore;
					// 可选进程下拉框
					progressSel(el,opt);

					baseLineMap(el.find("[data-btn=setProcessBaseLine]") ,opt ,"hostProcessBaseLineDataStore");
					baseLineMap(el.find("[data-btn=setPortBaseLine]") ,opt ,"hostPortBaseLineDataStore");
					baseLineMap(el.find("[data-btn=setDiskBaseLine]") ,opt ,"hostDiskBaseLineDataStore");
				}
				g_validate.init(el);
				g_grid.render(el.find("[id=grid-al]") ,{
					data : data.al,
					header : header.al,
					paramObj : null,
					tdDbClick : true,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-ar]") ,{ 
					data : data.ar,
					header : header.ar,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-i]") ,{
					data : data.i,
					header : header.i,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-u]") ,{
					data : data.u,
					header : header.u,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-server]") ,{
					data : data.server,
					header : header.server,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				var selFlag = true;
				var hostCodeSelWidth = el.find("[data-id=hostCode]").width();
				el.find("[data-id=hostCode]").click(function(){
					el.find("[data-name=hostCodeSel]").width(hostCodeSelWidth+40).show();
					selFlag = true;
				});
				el.find("[data-name=hostCodeSel]").find("li").each(function(){
					$(this).click(function(){
						el.find("[data-id=hostCode]").val("").val($(this).html());
						g_validate.setError(el.find("[data-id=hostCode]"), "");
						el.find("[data-name=hostCodeSel]").hide();
						selFlag = false;
					});
				});
				el.find("[data-id=hostCode]").blur(function(){
					selFlag && el.oneTime(500,function(){
						el.find("[data-name=hostCodeSel]").hide();
					});
				});

				if (el.find("[data-store=connectType]").val()=="SNMP") 
				{
					el.find("[data-view=hide_when_SNMP]").hide();
				} 
				else 
				{
					el.find("[data-view=hide_when_SNMP]").show();
				}
			}
			function event_init() 
			{
				function getQueryData()
				{
					var databaseData = $("[data-getter=cert]").umDataBind("serialize");
					databaseData.connectType = $("[data-store=connectType]").val();
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.edId = $("[data-id=temp_monitored_asset]").val();
					databaseData.agentId = $("[data-id=monitorAgent]").val();
					databaseData.tablethreshold = databaseData.unifyThreshold;
					databaseData.readCommunity = Encrypt($("[data-id=snmpCommunity]").val());
					databaseData.username = (databaseData.monitorUserName 
											?  databaseData.monitorUserName
											:  databaseData.snmpUserName)
					databaseData.password = (databaseData.monitorPassWord 
											? databaseData.monitorPassWord
											: databaseData.snmpPassWord)
					databaseData.port = databaseData.monitorPort || databaseData.snmpPort;
					databaseData.value = el.find("[data-id=unifyThreshold]").val();
					return databaseData;
				}
				// 错误类型  错误源
				var errTyp = el.find("[data-id=rcCmd]");
				var errSor = el.find("[data-id=scCmd]");
				errTyp.change(function(){
					if($(this).val()!=null) 
					{
						errSor.attr("validate","required");
					} 
					else 
					{
						errSor.removeAttr("validate");
					}
				});
				errSor.change(function(){
					if($(this).val()!=null) 
					{
						errTyp.attr("validate","required");
					} 
					else 
					{
						errTyp.removeAttr("validate");
					}
				});
				errTyp.trigger("change");
				errSor.trigger("change");

				//获取所有分区
				el.find("[data-id=querytable]").click(function() 
				{
					var databaseData = getQueryData();
					um_ajax_get({
						url : "monitorConfig/queryDiskName",
						paramObj : databaseData,
						maskObj : "body",
						successCallBack : function(data) 
						{ 
							if (data.monitorPerformGridStore.length == 0) 
							{
								g_dialog.dialog("分区获取失败",{
									width : "320px",
									isConfirmAlarm : true,
									saveclick : function(){}
								}); 
								return false;
							}
							var tempData = [];
							var dataVo = data.monitorPerformGridStore;
							for (var i = 0; i < data.length; i++) {
								temp = {performModule : dataVo[i].performModule ,value : el.find("[data-id=tablethreshold]").val(), performName : LeftSizeCalculate(dataVo[i]),lastTime:dataVo[i].lastTime};
								tableTemp.g_tableSize.push(dataVo[i].value);
								tableTemp.performModule.push(dataVo[i].performModule);
								tempData.push(temp);
							}
							g_grid.removeData($("[id=grid-al]") ,{});
							g_grid.removeData($("[id=grid-ar]") ,{});
							g_grid.addData($("[id=grid-al]"), dataVo);
						},
						failTip : false,
						failCallBack : function(){
							g_dialog.dialog("分区获取失败",{
									width : "320px",
									isConfirmAlarm : true,
									saveclick : function(){}
								}); 
						}
					});

					function LeftSizeCalculate(trData) 
					{
						var _threshold = el.find("[data-id=unifyThreshold]").val();
						var _tableSpaceName = trData.performModule;
						var _tableSize = trData.tableSize;
						var res = Math.round(_tableSize*(1-Number(_threshold)/100));
						return res;
					}
				});	

				// 清空分区
				el.find("[data-id=cleartable]").click(function(){
							g_grid.removeData($("[id=grid-al]") ,{});
							g_grid.removeData($("[id=grid-ar]") ,{});
				});

				//被监控分区 左移 右移 monitor_add monitor_remove
				//右移事件
				el.find("[data-id=monitor_add]").click(function() 
				{
					var urlArray = g_grid.getData(el.find("[id=grid-al]") ,{chk:true});
					if (urlArray.length == 0) 
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-ar]") ,urlArray);
					g_grid.removeData(el.find("[id=grid-al]"));
				});

				// 左移事件
				el.find("[data-id=monitor_remove]").click(function() 
				{
					var data = g_grid.getData(el.find("[id=grid-ar]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					// else if (data.length > 1)
					// {
					// 	g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					// }
					else
					{
						g_grid.addData(el.find("[id=grid-al]") ,data);
						g_grid.removeData(el.find("[id=grid-ar]"));
					}
				});

				// 脚本全路径 左移 右移 script_add script_remove
				//右移事件
				el.find("[data-id=script_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=script]"))){
						return false;
					}
					var scriptPathArray = g_grid.getIdArray(el.find("[id=grid-i]") ,{attr:"name"});
					var valueArray = g_grid.getIdArray(el.find("[id=grid-i]") ,{attr:"value"});
					if (el.find("[data-flag=name]").val()=="")
					{
						g_validate.setError(el.find("[data-flag=name]"), msg.blank);
						return false;
					}
					if (scriptPathArray.indexOf(el.find("[data-flag=name]").val()) != -1 )
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-i]") ,[{
						name : $("[data-flag=name]").val(),
						value : $("[data-flag=value]").val()
					}]);
					$("[data-flag=name]").val("");
					$("[data-flag=value]").val("");
				});

				// 左移事件
				el.find("[data-id=script_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-i]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=name]").val(data[0].name);
						el.find("[data-flag=value]").val(data[0].value);
						g_grid.removeData(el.find("[id=grid-i]"));
					}
				});
				// 已配置进程 左移 右移 progress_add progress_remove
				//右移事件
				el.find("[data-id=fault_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=fault]"))){
						return false;
					}
					var progressArray = g_grid.getIdArray(el.find("[id=grid-u]") ,{attr:"faultModule"});
					if (progressArray.indexOf(el.find("[data-flag=faultModule]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					if (el.find("[data-flag=faultModule]").val() == "") 
					{
						g_validate.setError(el.find("[data-flag=faultModule]"), msg.blank);
						return false;
					}
					g_grid.addData(el.find("[id=grid-u]") ,[{
						faultModule : $("[data-flag=faultModule]").val()
					}]);
					$("[data-flag=faultModule]").val("");
				});

				// 左移事件
				el.find("[data-id=fault_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-u]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=faultModule]").val(data[0].faultModule);
						g_grid.removeData(el.find("[id=grid-u]"));
					}
				});
				// JavaCore文件路径 左移 右移 server_add server_remove
				//右移事件
				el.find("[data-id=server_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=server]"))){
						return false;
					}
					var progressArray = g_grid.getIdArray(el.find("[id=grid-server]") ,{attr:"srcIpOrInterface"});
					if (progressArray.indexOf(el.find("[data-flag=srcIpOrInterface]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					if (el.find("[data-flag=srcIpOrInterface]").val() == "") 
					{
						g_validate.setError(el.find("[data-flag=srcIpOrInterface]"), msg.blank);
						return false;
					}
					g_grid.addData(el.find("[id=grid-server]") ,[{
						srcIpOrInterface : $("[data-flag=srcIpOrInterface]").val()
					}]);
					$("[data-flag=srcIpOrInterface]").val("");
				});

				// 左移事件
				el.find("[data-id=server_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-server]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=srcIpOrInterface]").val(data[0].srcIpOrInterface);
						g_grid.removeData(el.find("[id=grid-server]"));
					}
				});

				// 设置进程基线
				el.find("[data-btn=setProcessBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setProcessBaseLine]") ,{
						url : "monitorFetch/queryProcessList",
						atteIndex : 4,
						// paramObj : {
						// 				edId:$("[data-id=temp_monitored_asset]").val(),
						// 				agentId:$("[data-id=monitorAgent]").val(),
						// 				username:$("[data-id=monitorUserName]").val(),
						// 				password:$("[data-id=monitorPassWord]").val(),
						// 				connectType:"SSH2",
						// 				monitorType:$("[data-id=temp_type]").val(),
						// 				port:$("[data-id=monitorPort]").val()
						// 		   },
						paramObj : databaseData,
						header : procBaseLineHeader,
						searchKey : ['procName' ,'procPath']
					});
				});

				// 设置端口基线
				el.find("[data-btn=setPortBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setPortBaseLine]") ,{
						url : "monitorFetch/queryPortList",
						atteIndex : 2,
						// paramObj : {
						// 				edId:$("[data-id=temp_monitored_asset]").val(),
						// 				agentId:$("[data-id=monitorAgent]").val(),
						// 				username:$("[data-id=monitorUserName]").val(),
						// 				password:$("[data-id=monitorPassWord]").val(),
						// 				connectType:"SSH2",
						// 				monitorType:$("[data-id=temp_type]").val(),
						// 				port:$("[data-id=monitorPort]").val()
						// 		   },
						paramObj : databaseData,
						header : portBaseLineHeader,
						searchKey : ['portName']
					});
				});
				// 设置磁盘基线
				el.find("[data-btn=setDiskBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setDiskBaseLine]") ,{
						url : "monitorFetch/queryDiskMontList",
						atteIndex : 2,
						paramObj : {
										edId:$("[data-id=temp_monitored_asset]").val(),
										agentId:$("[data-id=monitorAgent]").val(),
										username:$("[data-id=monitorUserName]").val(),
										password:$("[data-id=monitorPassWord]").val(),
										connectType:"SSH2",
										monitorType:$("[data-id=temp_type]").val(),
										port:$("[data-id=monitorPort]").val()
								   },
						paramObj : databaseData,
						header : diskBaseLineHeader,
						searchKey : ['diskName']
					});
				});
			}	
		},
		AIX_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1, "SNMP":2};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			snmpVer.attr("disabled","disabled");
			dis([sshDiv,telnetDiv,snmpv1,snmpv2,snmpv3],["input",'select']);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val(22);
						dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(telnetDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val(23);
						dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(sshDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis([sshDiv,telnetDiv]);
						g_validate.clear(sshDiv);
						g_validate.clear(telnetDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		AIX_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		PORT_MONITOR_init : function (el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			el.find("[data-id=port_type]").change(function (){
				if ($(this).val() == "1")
					$("#__type").show(),el.find("[data-id=monitorDatabaseName]").attr("readonly" ,"readonly")
				else
					$("#__type").hide(),el.find("[data-id=monitorDatabaseName]").removeAttr("readonly")
			})
			$("#__type").find("input").click(function (){
				var __tmp = $("#__type").umDataBind("serialize").__t
				el.find("[data-id=monitorDatabaseName]").val(__tmp.split(",").join(";"))
			})
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		PORT_MONITOR_step5_test : function (el) 
		{
			var teststore =
			{
				teststore : 
					{
						"agentId": el.find("[data-id=monitorAgent]").val(),
						"assetIds": el.find("[data-id=temp_monitored_asset]").val(),
						"commandPrompt": "",
						"connectType": "",
						"consoleIp": "",
						"context": "",
						"loginPrompt": "",
						"monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
						"monitorPassWord": "",
						"monitorPort": "",
						"monitorType": "PORT_MONITOR",
						"monitorUserName": "",
						"passwordPrompt": "",
						"trustPassWord": ""
					}
			}
			return teststore;
		},
		WINDOWS_init : function (el, opt)
		{
			var self = this;
			var header = {
				al : [
							{text:"被监控磁盘",name:"performModule"},
							{text:"阈值(%)",name:"value", dbclick : true
							, tdBlur : function(trData){
									moduleValueCalc(trData);
							}},
							// {text:"剩余空间(M)",name:"performName", dbclick : true
							// 	, tdBlur : function(trData){
							// 			performNameCalc(trData);
							// 	}
							// 	,render : function(trObj ,data){
							// 		var res = Math.round(Number(data.lastTime)*(1-(Number(data.value)/100)));
							// 		return res;
							// 	}
							// },
							{text:"剩余空间(M)",name:"performName"}
						],
				ar : [
							{text:"不被监控磁盘",name:"performModule"},
							{text:"阈值(%)",name:"value"},
							{text:"剩余空间(M)",name:"performName"}
						],
				i : [
							{text:"脚本全路径",name:"name"},
							{text:"脚本参数",name:"value"}
						],
				u : [
							{text:"已配置进程",name:"faultModule"}
						]
			};
			var tableTemp = {
				g_tableSize : [],
				tableSpaceName : []
			};
			init();
			event_init();
			function init() 
			{
				if (opt) 
				{
					el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
					progressSel(el,opt);
					baseLineMap(el.find("[data-btn=setProcessBaseLine]") ,opt ,"hostProcessBaseLineDataStore");
					baseLineMap(el.find("[data-btn=setPortBaseLine]") ,opt ,"hostPortBaseLineDataStore");
					baseLineMap(el.find("[data-btn=setDiskBaseLine]") ,opt ,"hostDiskBaseLineDataStore");
				}
				var data = {
					al : opt ? opt.detail.monitorPerformGridStore : [],
					ar : opt ? opt.detail.monitorUnPerformGridStore : [],
					i : opt ? opt.detail.monitorScriptGridStore : [],
					u : opt ? opt.detail.faultStore : []
				};
				g_validate.init(el);
				g_grid.render(el.find("[id=grid-al]") ,{
					data : data.al,
					header : header.al,
					paramObj : null,
					tdDbClick : true,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-ar]") ,{
					data : data.ar,
					header : header.ar,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-i]") ,{
					data : data.i,
					header : header.i,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				g_grid.render(el.find("[id=grid-u]") ,{
					data : data.u,
					header : header.u,
					paramObj : null,
					hideSearch : true,
					paginator : false
				});
				
				var selFlag = true;
				var hostCodeSelWidth = el.find("[data-id=hostCode]").width();
				el.find("[data-id=hostCode]").click(function(){
					el.find("[data-name=hostCodeSel]").width(hostCodeSelWidth+40).show();
					selFlag = true;
				});
				el.find("[data-name=hostCodeSel]").find("li").each(function(){
					$(this).click(function(){
						el.find("[data-id=hostCode]").val("").val($(this).html());
						g_validate.setError(el.find("[data-id=hostCode]"), "");
						el.find("[data-name=hostCodeSel]").hide();
						selFlag = false;
					});
				});
				el.find("[data-id=hostCode]").blur(function(){
					selFlag && el.oneTime(500,function(){
						el.find("[data-name=hostCodeSel]").hide();
					});
				});
				if ($("[data-store=connectType]").val() == "TRAY") 
				{
					$("[data-name=block1]").show();
					$("[data-name=block2]").show();
					$("[data-name=block3]").show();
				}
				else if ($("[data-store=connectType]").val() == "WMI")
				{
					$("[data-name=block2]").hide();
					$("[data-name=block3]").show();
					$("[data-name=block1]").show();
				}
				else
				{
					$("[data-name=block1]").show();
					$("[data-name=block2]").hide();
					$("[data-name=block3]").hide();
				}
			}
			function event_init() 
			{
				function getQueryData()
				{
					var databaseData = $("[data-getter=cert]").umDataBind("serialize");
					databaseData.connectType = $("[data-store=connectType]").val();
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.edId = $("[data-id=temp_monitored_asset]").val();
					databaseData.agentId = $("[data-id=monitorAgent]").val();
					databaseData.readCommunity = Encrypt($("[data-getter=v"+databaseData.snmpVersion+"]").find("[data-id=snmpCommunity]").val())
					databaseData.tablethreshold = databaseData.unifyThreshold;
					databaseData.username = (databaseData.monitorUserName 
											?  databaseData.monitorUserName
											:  databaseData.snmpUserName)
					databaseData.password = (databaseData.monitorPassWord 
											? databaseData.monitorPassWord
											: databaseData.snmpPassWord)
					databaseData.port = databaseData.monitorPort || databaseData.snmpPort;
					databaseData.value = el.find("[data-id=unifyThreshold]").val();
					return databaseData;
				}
				//获取所有磁盘
				el.find("[data-id=querytable]").click(function() 
				{
					var databaseData = getQueryData();
					um_ajax_get({
						url : "monitorConfig/queryDiskName",
						paramObj : databaseData,
						maskObj : "body",
						successCallBack : function(data)
						{
							// var tempData = [];
							var dataVo = data.monitorPerformGridStore;
							if (+dataVo.length === 0) 
							{
								g_dialog.dialog(msg.noDisk,{
									width: "320px",
									isConfirmAlarm : true,
									saveclick: function(){}
								});
								return false;
							}
							// for (var i = 0; i < data.length; i++) {
							// 	temp = {tableSpaceName : dataVo[i].tableSpaceName ,tablethreshold : el.find("[data-id=tablethreshold]").val(), tableLeftSize : LeftSizeCalculate(dataVo[i]),lastTime:dataVo[i].lastTime};
							// 	tableTemp.performName.push(dataVo[i].performName);
							// 	tableTemp.tableSpaceName.push(dataVo[i].tableSpaceName);
							// 	tempData.push(temp);
							// } 
							g_grid.removeData($("[id=grid-al]") ,{});
							g_grid.removeData($("[id=grid-ar]") ,{});
							// g_grid.addData($("[id=grid-al]"), tempData);
							g_grid.addData($("[id=grid-al]"), dataVo);
						},
						failTip : false,
						failCallBack : function(data) 
						{
							g_dialog.dialog(msg.noDisk,{
									width: "320px",
									isConfirmAlarm : true,
									saveclick: function(){}
								});
						}
					});

					// function LeftSizeCalculate(trData) 
					// {
					// 	var _threshold = el.find("[data-id=tablethreshold]").val();
					// 	var _tableSpaceName = trData.tableSpaceName;
					// 	var _tableSize = trData.performName;
					// 	var res = Math.round(_tableSize*(1-Number(_threshold)/100));
					// 	return res;
					// }
				});	

				// 清空分区
				el.find("[data-id=cleartable]").click(function(){
							g_grid.removeData($("[id=grid-al]") ,{});
							g_grid.removeData($("[id=grid-ar]") ,{});
				});

				//被监控磁盘 左移 右移 url_add url_remove
				//右移事件
				el.find("[data-id=url_add]").click(function() 
				{
					var urlArray = g_grid.getData(el.find("[id=grid-al]") ,{chk:true});
					if (urlArray.length == 0) 
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-ar]") ,urlArray);
					g_grid.removeData(el.find("[id=grid-al]"));
				});

				// 左移事件
				el.find("[data-id=url_remove]").click(function() 
				{
					var data = g_grid.getData(el.find("[id=grid-ar]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					// else if (data.length > 1)
					// {
					// 	g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					// }
					else
					{
						g_grid.addData(el.find("[id=grid-al]") ,data);
						g_grid.removeData(el.find("[id=grid-ar]"));
					}
				});

				// 脚本全路径 左移 右移 progress_add progress_remove
				//右移事件
				el.find("[data-id=script_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=script]"))){
						return false;
					}
					var progressArray = g_grid.getIdArray(el.find("[id=grid-i]") ,{attr:"name"});
					if (progressArray.indexOf(el.find("[data-flag=name]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					if (el.find("[data-flag=name]").val() == "") 
					{
						g_validate.setError(el.find("[data-flag=name]"), msg.blank);
						return false;
					}
					g_grid.addData(el.find("[id=grid-i]") ,[{
						name : $("[data-flag=name]").val(),
						value : $("[data-flag=value]").val()
					}]);
					$("[data-flag=name]").val("");
					$("[data-flag=value]").val("");
				});

				// 左移事件
				el.find("[data-id=script_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-i]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=name]").val(data[0].name);
						el.find("[data-flag=value]").val(data[0].value);
						g_grid.removeData(el.find("[id=grid-i]"));
					}
				});

				// 已配置进程 左移 右移 progress_add progress_remove
				//右移事件
				el.find("[data-id=fault_add]").click(function(){
					if (!g_validate.validate(el.find("[data-block=fault]"))){
						return false;
					}
					var progressArray = g_grid.getIdArray(el.find("[id=grid-u]") ,{attr:"faultModule"});
					if (progressArray.indexOf(el.find("[data-flag=faultModule]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					if (el.find("[data-flag=faultModule]").val() == "") 
					{
						g_validate.setError(el.find("[data-flag=faultModule]"), msg.blank);
						return false;
					}
					g_grid.addData(el.find("[id=grid-u]") ,[{
						faultModule : $("[data-flag=faultModule]").val()
					}]);
					$("[data-flag=faultModule]").val("");
				});

				// 左移事件
				el.find("[data-id=fault_remove]").click(function (){
					var data = g_grid.getData(el.find("[id=grid-u]") ,{chk:true});
					if (data.length == 0)
					{
						g_dialog.operateAlert(el ,msg.selectOne ,"error");
					}
					else if (data.length > 1)
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
					}
					else
					{
						el.find("[data-flag=faultModule]").val(data[0].fault);
						g_grid.removeData(el.find("[id=grid-u]"));
					}
				});

				// 设置进程基线
				el.find("[data-btn=setProcessBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setProcessBaseLine]") ,{
						url : "monitorFetch/queryProcessList",
						atteIndex : 4,
						// paramObj : {
						// 				edId:$("[data-id=temp_monitored_asset]").val(),
						// 				agentId:$("[data-id=monitorAgent]").val(),
						// 				username:$("[data-id=monitorUserName]").val(),
						// 				password:$("[data-id=monitorPassWord]").val(),
						// 				connectType:"WMI",
						// 				monitorType:$("[data-id=temp_type]").val(),
						// 				port:$("[data-id=monitorPort]").val()
						// 		   },
						paramObj : databaseData,
						header : procBaseLineHeader,
						searchKey : ['procName' ,'procPath']
					});
				});

				// 设置端口基线
				el.find("[data-btn=setPortBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setPortBaseLine]") ,{
						url : "monitorFetch/queryPortList",
						atteIndex : 2,
						// paramObj : {
						// 				edId:$("[data-id=temp_monitored_asset]").val(),
						// 				agentId:$("[data-id=monitorAgent]").val(),
						// 				username:$("[data-id=monitorUserName]").val(),
						// 				password:$("[data-id=monitorPassWord]").val(),
						// 				connectType:"WMI",
						// 				monitorType:$("[data-id=temp_type]").val(),
						// 				port:$("[data-id=monitorPort]").val()
						// 		   },
						paramObj : databaseData,
						header : portBaseLineHeader,
						searchKey : ['portName']
					});
				});
				// 设置磁盘基线
				el.find("[data-btn=setDiskBaseLine]").click(function (){
					var databaseData = getQueryData();
					self.baseLineDialog(el.find("[data-btn=setDiskBaseLine]") ,{
						url : "monitorFetch/queryDiskMontList",
						atteIndex : 2,
						// paramObj : {
						// 				edId:$("[data-id=temp_monitored_asset]").val(),
						// 				agentId:$("[data-id=monitorAgent]").val(),
						// 				username:$("[data-id=monitorUserName]").val(),
						// 				password:$("[data-id=monitorPassWord]").val(),
						// 				connectType:"WMI",
						// 				monitorType:$("[data-id=temp_type]").val(),
						// 				port:$("[data-id=monitorPort]").val()
						// 		   },
						paramObj : databaseData,
						header : diskBaseLineHeader,
						searchKey : ['diskName']
					});
				});
			}
		},
		WINDOWS_step4 : function (el, opt) 
		{
			var wmiDiv = el.find("[data-getter=wmi]");
			// var trayDiv = el.find("[data-getter=tray]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = snmpDiv.find("[data-id=snmpVersion]");
			var snmpv1 = snmpDiv.find("[data-getter=v1]");
			var snmpv2 = snmpDiv.find("[data-getter=v2]");
			var snmpv3 = snmpDiv.find("[data-getter=v3]");
			// var typeIndex = {"WMI":0, "TRAY":1, "SNMP":2};
			var typeIndex = {"WMI":0, "SNMP":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("WMI");
						dis(wmiDiv,true);
						// trayDiv.find("input").attr("disabled","disabled");
						// g_validate.clear(trayDiv);
						dis([snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis(wmiDiv);
						g_validate.clear(wmiDiv);
						// trayDiv.find('input').attr("disabled","disabled");
						// g_validate.clear(trayDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				wmiDiv.umDataBind("render" ,opt.Vos[index].wmi);
				// trayDiv.umDataBind("render" ,opt.Vos[index].tray);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "WMI") 
				{
					dis(wmiDiv,true);
					wmiDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				wmiDiv.find("[data-id=monitorPort]").val() == "" && wmiDiv.find("[data-id=monitorPort]").val("135");
				// trayDiv.find("[data-id=monitorPort]").val() == "" && trayDiv.find("[data-id=monitorPort]").val("37179");
				snmpv1.find("[dta-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[dta-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[dta-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);
			certTest(wmiDiv,"wmi",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.connectType = "WMI";
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		WINDOWS_leave_step4 : function (el) 
		{
			el.find("[data-id=temp_certificate_type]").val(el.find("[data-id=connectType]").val());
			var connectType = el.find("[data-store=connectType]").val();
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="WMI") 
				{
					certStore.push($(this).find("[data-getter=wmi]").umDataBind("serialize"));
				}
				if (connectType=="TRAY") 
				{
					certStore.push($(this).find("[data-getter=tray]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
					certStore[i].snmpVo.connectType = connectType;
				}
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = connectType;
			});
			return certStore;
		},
		WINDOWS_step5_test : function (el) 
		{
			var vo = el.find("[data-getter=cert]").umDataBind("serialize");
			vo.agentId = el.find("[data-id=monitorAgent]").val();
			vo.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.monitorType = "WINDOWS";
			vo.monitorDatabaseName = "";
			return {teststore : vo};
		},
		DB2_init : function (el, opt) 
		{
			var url = {
				queryTableSpaceName : "monitorConfig/queryTableSpaceName",
				test : "monitorConfig/doTest"
			};
			var header = {
				h1 : [
					{text : "表空间名", name : "tableSpaceName"},
					{text : "阈值(%)", name : "tablethreshold", dbclick : true
					, tdBlur : function(trData){
							tablethresholdCalc(trData);
					}},
					{text : "剩余大小(M)", name : "tableLeftSize", dbclick : true
					, tdBlur : function(trData){
							tableLeftSizeCalc(trData);
					}
					,render : function(trObj ,data){
						var res = Math.round(Number(data.tableSize)*(1-(Number(data.tablethreshold)/100)));
						return res;
					}}
				],
				h2 : [
					{text : "不监控表空间名", name : "tableSpaceName"},
					{text : "阈值(%)", name : "tablethreshold"},
					{text : "剩余大小(M)", name : "tableLeftSize"}
				],
				nu : [
					{text:"数据库名",name:"monitorDatabaseName"},
					{text:"端口",name:"monitorPort"},
					{text:"用户名",name:"monitorUserName",render:function (txt){
						return Encrypt(txt)
					}},
					{text:"连接数使用率阈值(%)",name:"connectUseRate"}
				]
			};
			var oper = {
				nu : [
					{icon:"icon-pencil",text:"修改",aclick:instance_edit},
					{icon:"icon-trash",text:"删除",aclick:instance_remove}
				]
			};
			var tableTemp = {
				g_tableSize : [],
				tableSpaceName : []
			};
			var detailData = opt && opt.detail;
			var monitorId_pre = "";
			var instanceFlag = "upd";
			var instanceName;

			init();
			event_init();

			function event_init() 
			{
				var databaseDataStr = "";
				//新增按钮
				el.find("#database_add_btn").click(function(){
					instanceFlag = "add";
					instance_edit();
				});

				//批量删除
				el.find("#database_del_btn").click(function(){
					g_grid.getData(el.find("[data-id=database-nu]"),{chk:true}).length === 0 
						? g_dialog.operateAlert(el ,msg.noSelect ,"error") 
						: g_grid.removeData(el.find("[data-id=database-nu]"));
				});

			}

			function init() 
			{ 
				var detailStore = [];
				if (opt) 
				{ 
					monitorId_pre = detailData.monitorStore[0].monitorId.split("_")[0];
					for (var i = 0; i < detailData.monitorStore.length; i++) {
						detailStore.push({
							monitorUserName : detailData.monitorStore[i].monitorUserName,
							monitorPassWord : detailData.monitorStore[i].monitorPassWord,
							monitorDatabaseName : detailData.monitorStore[i].monitorDatabaseName,
							monitorPort : detailData.monitorStore[i].monitorPort,
							sessionCount : detailData.monitorStore[i].sessionCount,
							locksCount : detailData.monitorStore[i].locksCount,
							connectUseRate : detailData.monitorStore[i].connectUseRate,
							processCount : detailData.monitorStore[i].processCount,
							openAlarm : detailData.monitorStore[i].openAlarm,
							connectType : detailData.monitorStore[i].connectType,
							tablethreshold : detailData.monitorStore[i].tablethreshold,
							tsvalues : detailData.monitorStore[i].tsvalues,
							unTsvalues : detailData.monitorStore[i].unTsvalues,
							opFlag : "upd", 
							monitorAgent : detailData.monitorStore[i].monitorAgent,
							monitorType : detailData.monitorStore[i].monitorType,
							serviceName : "",
							unifyThreshold : detailData.monitorStore[i].unifyThreshold,
							monitorId : detailData.monitorStore[i].monitorId,
							vip : ""
						});
					} 
					if (opt.detail.monitorStore[0].dbUser == "1") 
					{
						el.find("[data-check=dbUser_checkbox]").attr("checked",true);
					}
				}
				var Ddata = opt ? detailStore : [];
				g_grid.render(el.find("[data-id=database-nu]") ,{
					data : Ddata,
					header : header.nu,
					oper : oper.nu,
					operWidth : "100px",
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					// dbClick : instance_edit,
					maskObj : "body"
				});

				//测试按钮点击事件
				el.find("[data-id=test_btn]").click(function() {
					var testData = $("[data-id=monitor_index_edit]").umDataBind("serialize");
					testData.agentId = el.find("[data-id=monitorAgent]").val();
					testData.assetIds = el.find("[data-id=temp_monitored_asset]").val();
					testData.monitorType = "DB2";
					
					um_ajax_post({
						url : url.test,
						maskObj : "body",
						paramObj : {teststore : testData},
						successCallBack : function(data) 
						{
							g_dialog.operateConfirm(data.teststore[0].result ,{
								saveclick : function (){}
							});
						}
					});
				});

			}

			function instance_edit(rowData ,trObj) 
			{
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_22.html",
					success : function (data) 
					{
						var title = rowData ? "修改数据库信息" : "添加数据库信息";
						g_dialog.dialog($(data).find("[data-id=monitor_index_edit]") ,{
							width : "900px",
							title : title,
							init : init,
							saveclick : save,
							autoHeight : true
						});
					}
				});

				function init(el) 
				{
					opt || el.find("[data-id=monitorPort]").val("50000");
					el.find("[data-show=hide_in_db2]").remove();
					el.find("#database_name").html("数据库名");
					var data_l = [];
					var data_r = [];
					if(rowData) 
					{
						instanceName = rowData.monitorDatabaseName;
						rowData.tablethreshold = rowData.unifyThreshold;
						el.umDataBind("render" ,rowData);
						if (rowData) 
						{
							if(rowData.connectType == -1)
							{
								el.find("[data-type=closeAlarmCheck]").click();
								el.find("[data-id=connectType]").attr("disabled","disabled");
								el.find("[data-id=connectType]").val("");
							} 
							else 
							{
								el.find("[data-type=openAlarmCheck]").click();
								el.find("[data-id=connectType]").removeAttr("disabled");
							}
							opType = "edit";
						}
						if (rowData.dbUser == "1") 
						{
							el.find("[data-check=dbUser_checkbox]").attr("checked",true);
						}
						if (rowData.tsvalues)
						{
							var ts = rowData.tsvalues.split("|");
							ts.pop(); 
							var  dataD = [];
							for (var i = 0; i < ts.length; i++) {
								var rowD = ts[i].split(",");
								var tableSize = Math.round(Number(Number(rowD[2]) / (1-Number(rowD[1])/100)));
								dataD.push({tableSpaceName : rowD[0],tablethreshold : rowD[1],tableLeftSize : rowD[2],tableSize:tableSize});
							}
							data_l = dataD;
							var unTs = rowData.unTsvalues.split("|");
							unTs.pop(); 
							var  dataDu = [];
							for (var i = 0; i < unTs.length; i++) {
								var rowDu = unTs[i].split(",");
								var tableSize = Math.round(Number(Number(rowDu[2]) / (1-Number(rowDu[1])/100)));
								dataDu.push({tableSpaceName : rowDu[0],tablethreshold : rowDu[1],tableLeftSize : rowDu[2],tableSize:tableSize});
							}
							data_r = dataDu; 
						}
						
					} 
					databaseDataStr = (el.find("[data-id=temp_database_instance]").val() === "" || el.find("[data-id=temp_database_instance]").val() === undefined) ? "" : el.find("[data-id=temp_database_instance]").val() + "~";
					g_grid.render(el.find("[data-id=tableSpaceName]") ,{
						data : data_l,
						header : header.h1,
						paramObj : null,
						isLoad : false,
						tdDbClick : true,
						hideSearch : true,
						paginator : false
					});
					g_grid.render(el.find("[data-id=nottableSpaceName]") ,{
						data : data_r,
						header : header.h2,
						paramObj : null,
						isLoad : false,
						hideSearch : true,
						paginator : false
					});	
					//密码过期提醒启用否
					el.find("[data-type=openAlarmCheck]").click(function(){
							el.find("[data-id=connectType]").removeAttr("disabled");
					}); 
					el.find("[data-type=closeAlarmCheck]").click(function(){
							el.find("[data-id=connectType]").attr("disabled","disabled");
							el.find("[data-id=connectType]").val("");
					}); 
					el.find("[data-check=dbUser_checkbox]").click(function(){
						if($("[data-check=dbUser_checkbox]:checked").length>0) 
						{
							el.find("[data-id=dbUser]").val('1');
						} 
						else 
						{
							el.find('[data-id=dbUser]').val('0');
						}
					});
					//查询表空间
					el.find("[data-id=querytable]").click(function(){
						el.find("[data-id=tablethreshold]").blur();
						el.find("[data-id=monitorUserName]").blur();
						if (!g_validate.validate(el.find("[data-id=tablethreshold]")) || !g_validate.validate(el.find("[data-id=monitorUserName]"))) 
						{
							return false;
						}
						var databaseData = {
							monitorType : $("[data-id=temp_type]").val(),
							notMonitoredEntity : $("[data-id=temp_monitored_asset]").val(),
							monitorUserName : el.find("[data-id=monitorUserName]").val(),
							monitorPassWord : el.find("[data-id=monitorPassWord]").val(),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							serviceName : "",
							monitorAgent : $("[data-id=monitorAgent]").val(),
							vip : "",
						 tablethreshold : el.find("[data-id=tablethreshold]").val()
						}; 
						um_ajax_get({
							url : url.queryTableSpaceName,
							maskObj : "body",
							paramObj : databaseData,
							successCallBack : function(data) 
							{
								if (+data.length === 0) 
								{
									g_dialog.dialog(msg.noTableSpace,{
										width : "320px",
										isConfirmAlarm : true,
										saveclick : function(){}
									});
									return false;
								}
								var tempData = data;
								for (var i = 0; i < tempData.length; i++) {
									tempData[i].tablethreshold = el.find("[data-id=tablethreshold]").val();
								}
								// var tempData = [];
								// for (var i = 0; i < data.length; i++) {
								// 	temp = {tableSpaceName : data[i].tableSpaceName ,tablethreshold : el.find("[data-id=tablethreshold]").val(), tableLeftSize : LeftSizeCalculate(data[i]),tableSize:data[i].tableSize};
								// 	tableTemp.g_tableSize.push(data[i].tableSize);
								// 	tableTemp.tableSpaceName.push(data[i].tableSpaceName);
								// 	tempData.push(temp);
								// }
								g_grid.removeData(el.find("[data-id=tableSpaceName]"), {});
								g_grid.removeData(el.find("[data-id=nottableSpaceName]"), {});
								// g_grid.addData(el.find("[data-id=tableSpaceName]"), tempData);
								g_grid.addData(el.find("[data-id=tableSpaceName]"), data);
							},
							failTip : false,
							failCallBack : function(data) 
							{
								g_dialog.dialog(msg.noTableSpace,{
										width : "320px",
										isConfirmAlarm : true,
										saveclick : function(){}
									});
							}
						});

						// function LeftSizeCalculate(trData) 
						// {
						// 	var _threshold = el.find("[data-id=tablethreshold]").val();
						// 	var _tableSpaceName = trData.tableSpaceName;
						// 	var _tableSize = trData.tableSize;//hou
						// 	var res = Math.round(_tableSize*(1-Number(_threshold)/100));
						// 	return res;
						// }
					});

					// 清空分区
					el.find("[data-id=cleartable]").click(function(){
								g_grid.removeData($("[data-id=tableSpaceName]") ,{});
								g_grid.removeData($("[data-id=nottableSpaceName]") ,{});
					});

					//左移按钮
					el.find("[data-id=move_left]").click(function(){
						var moveData = g_grid.getData(el.find("[data-id=nottableSpaceName]") ,{chk:true});
						var dataLeft = g_grid.getData(el.find("[data-id=tableSpaceName]"));
						if (moveData.length === 0) 
						{
							g_dialog.operateAlert(el.find("[data-id=monitor_index_edit]") ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else 
						{
							for (var i = 0; i < moveData.length; i++) {
								dataLeft.unshift(moveData[i]);
							}
							g_grid.removeData(el.find("[data-id=nottableSpaceName]"));
							g_grid.addData(el.find("[data-id=tableSpaceName]") ,moveData);
							tsvalues = g_grid.getData(el.find("[data-id=tableSpaceName]"));
							unTsvalues = g_grid.getData(el.find("[data-id=nottableSpaceName]"));
							var temp_tsvalues = "";
							var temp_untsvalues = "";
							for (var m = 0; m < tsvalues.length; m++) {
								temp_tsvalues += tsvalues[m].tableSpaceName+","+tsvalues[m].tablethreshold+","+tsvalues[m].tableLeftSize+"|";
							}
							tsvalues = temp_tsvalues.substring(0,temp_tsvalues.length-1);
							for (var n = 0; n < unTsvalues.length; n++) {
								temp_untsvalues += unTsvalues[n].tableSpaceName+","+unTsvalues[n].tablethreshold+","+unTsvalues[n].tableLeftSize+"|";
							}
							unTsvalues = temp_untsvalues.substring(0,temp_untsvalues.length-1);
							var tempVal = el.find("[data-id=temp_table_space]").val();
							var tempValN = el.find("[data-id=temp_not_table_space]").val();
							var tsvalues_inp = tempVal === "" ? "" : tempVal + "%";
							var unTsvalues_inp = tempValN === "" ? "" : tempValN + "%";
							el.find("[data-id=temp_table_space]").val(tsvalues_inp+tsvalues);
							el.find("[data-id=temp_not_table_space]").val(unTsvalues_inp+unTsvalues);
						}
					});

					//右移按钮
					el.find("[data-id=move_right]").click(function(){
						var moveData = g_grid.getData(el.find("[data-id=tableSpaceName]") ,{chk:true});
						if (moveData.length === 0) 
						{
							g_dialog.operateAlert(el.find("[data-id=monitor_index_edit]") ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else 
						{
							g_grid.removeData(el.find("[data-id=tableSpaceName]"));
							g_grid.addData(el.find("[data-id=nottableSpaceName]") ,moveData);
							tsvalues = g_grid.getData(el.find("[data-id=tableSpaceName]"));
							unTsvalues = g_grid.getData(el.find("[data-id=nottableSpaceName]"));
							var temp_tsvalues = "";
							var temp_untsvalues = "";
							for (var m = 0; m < tsvalues.length; m++) {
								temp_tsvalues += tsvalues[m].tableSpaceName+","+tsvalues[m].tablethreshold+","+tsvalues[m].tableLeftSize+"|";
							}
							tsvalues = temp_tsvalues.substring(0,temp_tsvalues.length-1);
							for (var n = 0; n < unTsvalues.length; n++) {
								temp_untsvalues += unTsvalues[n].tableSpaceName+","+unTsvalues[n].tablethreshold+","+unTsvalues[n].tableLeftSize+"|";
							}
							unTsvalues = temp_untsvalues.substring(0,temp_untsvalues.length-1);
							var tempVal = $("[data-id=temp_table_space]").val();
							var tempValN = $("[data-id=temp_not_table_space]").val();
							var tsvalues_inp = tempVal === "" ? "" : tempVal + "%";
							var unTsvalues_inp = tempValN === "" ? "" : tempValN + "%";
							$("[data-id=temp_table_space]").val(tsvalues_inp+tsvalues);
							$("[data-id=temp_not_table_space]").val(unTsvalues_inp+unTsvalues);
						}
					});

					//测试按钮点击事件
					el.find("[data-id=test_btn]").click(function() {
						var testData = {
							agentId : $("[data-id=monitorAgent]").val(),
							assetIds : $("[data-id=temp_monitored_asset]").val(),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPassWord : el.find("[data-id=monitorPassWord]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							monitorType : el.find("[data-id=temp_type]").val(),
							monitorUserName : el.find("[data-id=monitorUserName]").val()
						};
						um_ajax_post({
							url : url.test,
							paramObj : {teststore : testData},
							maskObj : "body",
							successCallBack : function(data) 
							{
								g_dialog.operateConfirm(data.teststore[0].result ,{
									saveclick : function (){}
								});
							}
						});
					});
				}

				function save(el ,saveObj) 
				{
					if(!g_validate.validate($('[data-id=monitor_index_edit]')))
					{
						return false;
					}
					var gridData = g_grid.getIdArray($("[data-id=database-nu]") ,{attr:"monitorDatabaseName"});
					if (instanceFlag=="upd") 
					{
						for (var i = 0; i < gridData.length; i++) {
							if (gridData[i] == el.find("[data-id=monitorDatabaseName]").val()) 
							{
								if (instanceName==gridData[i]) 
								{
									gridData[i] = "";
								}
							}
						}
					}
					if (gridData.indexOf(el.find("[data-id=monitorDatabaseName]").val()) != -1) 
					{

						g_dialog.operateAlert(el ,"数据库名重复。","error");
						return false;
					}
					var databaseData = saveObj;
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.serviceName = "";
					databaseData.monitorAgent = $("[data-id=monitorAgent]").val();
					databaseData.vip = "";
					databaseData.unifyThreshold = saveObj.tablethreshold;
					databaseData.tablethreshold = saveObj.tablethreshold;
					databaseData.tsvalues = $("[data-id=temp_table_space]").val();
					databaseData.unTsvalues = $("[data-id=temp_not_table_space]").val();
					databaseData.monitorId = opt ? (monitorId_pre + "_" + $("[data-id=monitorDatabaseName]").val()) : "";

					g_dialog.hide("monitor_index_edit");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[data-id=database-nu]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[data-id=database-nu]") ,[databaseData]);
					}
					instanceFlag = "upd";
				}
			}
		},
		SQLSERVER_init : function (el, opt) 
		{
			var url = {
				queryTableSpaceName : "monitorConfig/queryTableSpaceName",
				test : "monitorConfig/doTest"
			};
			var header = {
				h2 : [
					{text : "表空间名", name : "unTsvalues"},
					{text : "阈值(%)", name : "unifyThreshold", dbclick : true}
				],
				main : [
							{text:"数据库名",name:"monitorDatabaseName"},
							{text:"端口",name:"monitorPort"},
							{text:"用户名",name:"monitorUserName",render:function (txt){
								return Encrypt(txt)
							}},
							{text:"连接数使用率阈值(%)",name:"connectUseRate"},
							{text:"数据库锁数量阈值(个)",name:"locksCount"}
				]
			};
			var oper = {
				main : [
							{icon:"icon-pencil",text:"修改",aclick:instance_edit},
							{icon:"icon-trash",text:"删除",aclick:instance_remove}
						]
			};
			var detailData = opt && opt.detail;
			var monitorId_pre = "";
			var instanceFlag = "upd";
			var instanceName;

			init();
			event_init();

			function event_init() 
			{
				var databaseDataStr = "";
				//新增按钮
				el.find("#database_add_btn").click(function(){
					instanceFlag = "add";
					instance_edit();
				});

				//批量删除
				el.find("#database_del_btn").click(function(){
					g_grid.getData(el.find("[data-id=database-nu]"),{chk:true}).length === 0 
						? g_dialog.operateAlert(el ,msg.noSelect ,"error") 
						: g_grid.removeData(el.find("[data-id=database-nu]"));
				});

			}

			function init() 
			{ 
				var detailStore = [];
				if (opt) 
				{ 
					monitorId_pre = detailData.monitorStore[0].monitorId.split("_")[0];
					for (var i = 0; i < detailData.monitorStore.length; i++) {
						detailStore.push({
							monitorUserName : detailData.monitorStore[i].monitorUserName,
							monitorPassWord : detailData.monitorStore[i].monitorPassWord,
							monitorDatabaseName : detailData.monitorStore[i].monitorDatabaseName,
							monitorPort : detailData.monitorStore[i].monitorPort,
							sessionCount : detailData.monitorStore[i].sessionCount,
							locksCount : detailData.monitorStore[i].locksCount,
							connectUseRate : detailData.monitorStore[i].connectUseRate,
							processCount : detailData.monitorStore[i].processCount,
							tsvalues : detailData.monitorStore[i].tsvalues,
							unTsvalues : detailData.monitorStore[i].unTsvalues,
							opFlag : "upd", 
							monitorAgent : detailData.monitorStore[i].monitorAgent,
							monitorType : detailData.monitorStore[i].monitorType,
							serviceName : "",
							unifyThreshold : detailData.monitorStore[i].unifyThreshold,
							vip : "",
							configStatus : detailData.monitorStore[i].configStatus,
							monitorId : detailData.monitorStore[i].monitorId
						});
					} 
					el.find("[data-id=version]").val(detailData.monitorStore[0].version);
				}
				var Ddata = opt ? detailStore : [];
				g_grid.render(el.find("[data-id=database-nu]") ,{
					data : Ddata,
					header : header.main,
					oper : oper.main,
					operWidth : "100px",
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					dbClick : instance_edit,
					maskObj : "body"
				});
			}

			function instance_edit(rowData ,trObj)
			{
				var opType;
				$.ajax({
					type : "GET",
					url : "tpl/monitor/index/monitor_index_tpl_24.html",
					success : function (data) 
					{
						var title = rowData ? "修改数据库信息" : "添加数据库信息";
						g_dialog.dialog($(data).find("[data-id=monitor_index_edit]") ,{
							width : "900px",
							title : title,
							init : init,
							saveclick : save,
							top : "3%"
						});
					}
				});

				function init(el)
				{
					var data_l = [];
					var data_r = [];
					if(rowData) 
					{
						instanceName = rowData.monitorDatabaseName;
						rowData.tablethreshold = rowData.unifyThreshold;
						el.umDataBind("render" ,rowData);
						var ts = rowData.tsvalues.split("|");
						ts.pop();
						var  dataD = [];
						for (var i = 0; i < ts.length; i++) {
							var rowD = ts[i].split(",");
							dataD.push({unTsvalues : rowD[0],unifyThreshold : rowD[1]});
						}
						data_r = dataD; 
						if(rowData.configStatus == 1) 
						{
							el.find("[data-id=configStatus]").attr("checked", true);
							g_grid.removeData($("[data-id=tableSpaceName]") ,{});
							el.find("[data-id=unTsvalues]").val("");
							el.find("[data-id=unifyThreshold]").val("80");
							g_validate.setError(el.find("[data-id=unTsvalues]") ,"");
						} 
						else 
						{
							el.find("[data-id=configStatus]").attr("checked", false);
							el.find("[data-id=unTsvalues]").blur(function(){
								if (el.find("[data-id=unTsvalues]").val()+[] === "") 
								{
									g_validate.setError(el.find("[data-id=unTsvalues]") ,"不能为空");
									return false;
								} 
								else 
								{
									g_validate.setError(el.find("[data-id=unTsvalues]") ,"");
								}
							});
							el.find("[data-id=unTsvalues]").removeAttr("disabled");
						}
						
						opType = "edit";
					} 
					databaseDataStr = (el.find("[data-id=temp_database_instance]").val() === "" || el.find("[data-id=temp_database_instance]").val() === undefined) ? "" : el.find("[data-id=temp_database_instance]").val() + "~";

					g_grid.render(el.find("[data-id=tableSpaceName]") ,{
						data : data_r,
						header : header.h2,
						paramObj : null,
						isLoad : false,
						hideSearch : true,
						paginator : false
					});	

					// 统一配置
					el.find("[data-id=configStatus]").change(function(){
						if(el.find("[data-id=configStatus]").is(":checked")) 
						{
							el.find("[data-id=unTsvalues]").attr("disabled" ,"disabled");
							g_grid.removeData($("[data-id=tableSpaceName]") ,{});
							el.find("[data-id=unTsvalues]").val("");
							el.find("[data-id=unifyThreshold]").val("80");
							g_validate.setError(el.find("[data-id=unTsvalues]") ,"");
						} 
						else 
						{
							el.find("[data-id=unTsvalues]").blur(function(){
								if (el.find("[data-id=unTsvalues]").val()+[] === "") 
								{
									g_validate.setError(el.find("[data-id=unTsvalues]") ,"不能为空");
									return false;
								} 
								else 
								{
									g_validate.setError(el.find("[data-id=unTsvalues]") ,"");
								}
							});
							el.find("[data-id=unTsvalues]").removeAttr("disabled");
						}
					});
					el.find("[data-id=configStatus]").trigger("change");
					if (rowData)
					{
						el.find("[data-id=unifyThreshold]").val(rowData.unifyThreshold);
					}

					//左移按钮
					el.find("[data-id=move_left]").click(function(){
						var moveData = g_grid.getData(el.find("[data-id=tableSpaceName]") ,{chk:true});
						if (moveData.length === 0) 
						{
							g_dialog.operateAlert(el ,msg.chooseTableSpace ,"error");
							return false;
						} 
						else if (moveData.length > 1) 
						{
							g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
						}
						else 
						{
							el.find("[data-id=unTsvalues]").val(moveData[0].unTsvalues);
							el.find("[data-id=unifyThreshold]").val(moveData[0].unifyThreshold);
							g_grid.removeData($("[data-id=tableSpaceName]"));
						}
					});

					//右移按钮
					el.find("[data-id=move_right]").click(function(){
						if(el.find("[data-id=configStatus]").is(":checked")) 
						{
							return false;
						}
						var tableArray = g_grid.getIdArray(el.find("[data-id=tableSpaceName]") ,{attr:"unifyThreshold"});
						if (tableArray.indexOf(el.find("[data-id=unifyThreshold]").val()) != -1)
						{
							g_dialog.operateAlert(el ,msg.repeat ,"error");
							return false;
						}
						g_grid.addData(el.find("[data-id=tableSpaceName]") ,[{
							unTsvalues : el.find("[data-id=unTsvalues]").val(),
							unifyThreshold : el.find("[data-id=unifyThreshold]").val()
						}]);
						el.find("[data-id=unTsvalues]").val("");
						el.find("[data-id=unifyThreshold]").val("");
					});

					//测试按钮点击事件
					el.find("[data-id=test_btn]").click(function() {
						var testData = {
							agentId : $("[data-id=monitorAgent]").val(),
							assetIds : $("[data-id=temp_monitored_asset]").val(),
							monitorDatabaseName : el.find("[data-id=monitorDatabaseName]").val(),
							monitorPassWord : el.find("[data-id=monitorPassWord]").val(),
							monitorPort : el.find("[data-id=monitorPort]").val(),
							monitorType : $("[data-id=version]").val(),
							monitorUserName : el.find("[data-id=monitorUserName]").val()
						};
						um_ajax_post({
							url : url.test,
							paramObj : {teststore : testData},
							maskObj : "body",
							successCallBack : function(data) 
							{
								var Data = data.teststore[0].result || "";
								g_dialog.operateConfirm(Data ,{
									title : "测试结果",
									saveclick : function (){}
								});
							}
						});
					});
				}

				function save(el ,saveObj) 
				{
					if(el.find("[data-id=configStatus]").is(":checked") ? !g_validate.validate($('[data-id=monitor_index_edit]')) : !g_validate.validate($("[data-validate=checked]")))
					{
						return false;
					}
					var gridData = g_grid.getIdArray($("[data-id=database-nu]") ,{attr:"monitorDatabaseName"});
					if (instanceFlag=="upd") 
					{
						for (var i = 0; i < gridData.length; i++) {
							if (gridData[i] == el.find("[data-id=monitorDatabaseName]").val()) 
							{
								if (instanceName==gridData[i]) 
								{
									gridData[i] = "";
								}
							}
						}
					}
					if (gridData.indexOf(el.find("[data-id=monitorDatabaseName]").val()) != -1) 
					{

						g_dialog.operateAlert(el ,"数据库名重复。","error");
						return false;
					}
					var tableData = g_grid.getData(el.find("[data-id=tableSpaceName]"));
					if (!el.find("[data-id=configStatus]").is(":checked") && +tableData.length === 0) 
					{
						g_dialog.operateAlert(el ,"请添加单一配置的表空间信息。","error");
						return false;
					}
					var tableDataList = [];
					var databaseData = saveObj;
					// el.find("[data-id=sqlserverVersion]").val($("[data-id=version]").val());
					for (var i = 0; i < tableData.length; i++) {
						tableDataList.push(tableData[i].unTsvalues+","+tableData[i].unifyThreshold);
					}
					$("[data-id=temp_table_space]").val(tableDataList.join("|"));
					// databaseData.tsvalues = tableDataList.join("|")
					databaseData.monitorType = $("[data-id=temp_type]").val();
					databaseData.serviceName = "";
					databaseData.monitorAgent = $("[data-id=monitorAgent]").val();
					databaseData.vip = "";
					databaseData.tablethreshold = saveObj.unifyThreshold;
					databaseData.unifyThreshold = saveObj.unifyThreshold;
					databaseData.tsvalues = $("[data-id=temp_table_space]").val();
					databaseData.configStatus = el.find("[data-id=configStatus]").is(":checked") ? "1" : "2";
					databaseData.monitorId = opt ? (monitorId_pre + "_" + $("[data-id=monitorDatabaseName]").val()) : "";

					g_dialog.hide("monitor_index_edit");
					if (opType === "edit") 
					{
						trObj.data("data" ,databaseData);
						g_grid.updateData($("[data-id=database-nu]") ,{trObj:trObj ,data:databaseData});
					} 
					else 
					{
						g_grid.addData($("[data-id=database-nu]") ,[databaseData]);
					}
					instanceFlag = "upd";
				}
			}
		},
		IIS6_init : function(el, opt) 
		{
			var arg = {
				grid1_header : [
					{text:"名称",name:"performModule"},
					{text:"阈值",name:"value"}
				],
				grid2_header : [
					{text:"名称",name:"performModule"},
					{text:"阈值",name:"value"}
				],
				grid3_header : [
					{text:"名称",name:"performModule"},
					{text:"阈值",name:"value"}
				],
				gridhe_header : [
					{text:"URL地址" ,name:"urlAddress"}
				],
			};
			var userCfg = el.find("[data-name=userCfg]");
			var noUserCfg = el.find("[data-name=noUserCfg]");
			var linkCfg = el.find("[data-name=linkCfg]");
			var urlCfg = el.find("[data-name=urlCfg]");

			init();
			event();

			function init() {
				if (opt) 
				{
					opt.detail.monitorDetailStore.userConfigStatus = opt.detail.monitorDetailStore.userRateCfgBox == "2" ? "2" : "1";
					opt.detail.monitorDetailStore.noConfigStatus = opt.detail.monitorDetailStore.noUserRateCfgBox == "2" ? "2" : "1";
					opt.detail.monitorDetailStore.linkConfigStatus = opt.detail.monitorDetailStore.linkRateCfgBox == "2" ? "2" : "1";
					el.find("[id=detail_store_form]").umDataBind("render",opt.detail.monitorDetailStore);
					el.find("[data-bind=bind]").umDataBind("render",opt.detail.monitorDetailStore);
					//没做完回显的

				}
				var Ddata1 = opt ? opt.detail.userUseGridStore : [];
				g_grid.render(el.find("[id=grid-1]") ,{
					data : Ddata1,
					header : arg.grid1_header,
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
				var Ddata2 = opt ? opt.detail.noUserUseGridStore : [];
				g_grid.render(el.find("[id=grid-2]") ,{
					data : Ddata2,
					header : arg.grid2_header,
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
				var Ddata3 = opt ? opt.detail.linkGridStore : [];
				g_grid.render(el.find("[id=grid-3]") ,{
					data : Ddata3,
					header : arg.grid3_header,
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
				var Ddatahe = opt ? opt.detail.urlStore : [];
				g_grid.render(el.find("[id=grid-he]") ,{
					data : Ddatahe,
					header : arg.gridhe_header,
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
			}

			function event() {
				userCfg.find("[name=userConfigStatus]").change(function(){
					var val = userCfg.find("[name=userConfigStatus]:checked").val();
					if(val=="1") 
					{
						userCfg.find("[data-id=singleUserUseRate]").removeAttr("disabled");
						userCfg.find("[data-id=userName]").val("").attr("disabled","disabled");
						userCfg.find("[data-id=userUseRate]").val("").attr("disabled","disabled");
						g_grid.removeData(userCfg.find("[id=grid-1]"),{});
					} 
					if (val=="2") 
					{
						userCfg.find("[data-id=singleUserUseRate]").val("").attr("disabled","disabled");
						userCfg.find("[data-id=userName]").removeAttr("disabled");
						userCfg.find("[data-id=userUseRate]").removeAttr("disabled");
					}
				});
				userCfg.find("[name=userConfigStatus]").trigger("change");

				noUserCfg.find("[name=noConfigStatus]").change(function(){
					var val = noUserCfg.find("[name=noConfigStatus]:checked").val();
					if(val=="1") 
					{
						noUserCfg.find("[data-id=singleNoUserUseRate]").removeAttr("disabled");
						noUserCfg.find("[data-id=noUserName]").val("").attr("disabled","disabled");
						noUserCfg.find("[data-id=noUserUseRate]").val("").attr("disabled","disabled");
						g_grid.removeData(noUserCfg.find("[id=grid-2]"),{});
					} 
					if (val=="2") 
					{
						noUserCfg.find("[data-id=singleNoUserUseRate]").val("").attr("disabled","disabled");
						noUserCfg.find("[data-id=noUserName]").removeAttr("disabled");
						noUserCfg.find("[data-id=noUserUseRate]").removeAttr("disabled");
					}
				});
				noUserCfg.find("[name=noConfigStatus]").trigger("change");

				linkCfg.find("[name=linkConfigStatus]").change(function(){
					var val = linkCfg.find("[name=linkConfigStatus]:checked").val();
					if(val=="1") 
					{
						linkCfg.find("[data-id=linkRate]").removeAttr("disabled");
						linkCfg.find("[data-id=linkName]").val("").attr("disabled","disabled");
						linkCfg.find("[data-id=linkValue]").val("").attr("disabled","disabled");
						g_grid.removeData(linkCfg.find("[id=grid-3]"),{});
					} 
					if (val=="2") 
					{
						linkCfg.find("[data-id=linkRate]").val("").attr("disabled","disabled");
						linkCfg.find("[data-id=linkName]").removeAttr("disabled");
						linkCfg.find("[data-id=linkValue]").removeAttr("disabled");
					}
				});
				linkCfg.find("[name=linkConfigStatus]").trigger("change");

				// userCfg右移
				userCfg.find("[data-id=userCfg_add]").click(function(){
					if (userCfg.find("[name=userConfigStatus]:checked").val()=="1" || !g_validate.validate(userCfg)) 
					{
						return false;
					} 
					else 
					{
						if (""==userCfg.find("[data-id=userName]").val()) 
						{
							g_validate.setError(userCfg.find("[data-id=userName]"),"不能为空。");
							return;
						} 
						else 
						{
							g_validate.setError(userCfg.find("[data-id=userName]"),"");
						}
						if ("" == userCfg.find("[data-id=userUseRate]").val()) 
						{
							g_validate.setError(userCfg.find("[data-id=userUseRate]"),"不能为空。");
							return;
						} 
						else 
						{
							g_validate.setError(userCfg.find("[data-id=userUseRate]"),"");
						}
					}
					var userArray1 = g_grid.getIdArray(el.find("[id=grid-1]") ,{attr:"performModule"});
					if (userArray1.indexOf(userCfg.find("[data-id=userName]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					var userArray2 = g_grid.getIdArray(el.find("[id=grid-1]") ,{attr:"value"});
					if (userArray2.indexOf(userCfg.find("[data-id=userUseRate]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-1]") ,[{
						performModule : userCfg.find("[data-id=userName]").val(),
						value : userCfg.find("[data-id=userUseRate]").val()
					}]);
					userCfg.find("[data-id=userName]").val("");
					userCfg.find("[data-id=userUseRate]").val("");
				});
				// userCfg左移
				userCfg.find("[data-id=userCfg_remove]").click(function(){
					var moveData = g_grid.getData(userCfg.find("[id=grid-1]") ,{chk:true});
					if (moveData.length === 0) 
					{
						g_dialog.operateAlert(el ,msg.chooseTableSpace ,"error");
						return false;
					} 
					else if (moveData.length > 1) 
					{
						g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
					}
					else 
					{
						userCfg.find("[data-id=userName]").val(moveData[0].performModule);
						userCfg.find("[data-id=userUseRate]").val(moveData[0].value);
						g_grid.removeData($("[id=grid-1]"));
					}
				});
				// noUserCfg右移
				noUserCfg.find("[data-id=noUserCfg_add]").click(function(){
					if (noUserCfg.find("[name=noConfigStatus]:checked").val()=="1" || !g_validate.validate(noUserCfg)) 
					{
						return false;
					}
					else 
					{
						if (""==noUserCfg.find("[data-id=noUserName]").val()) 
						{
							g_validate.setError(noUserCfg.find("[data-id=noUserName]"),"不能为空。");
							return;
						} 
						else 
						{
							g_validate.setError(noUserCfg.find("[data-id=noUserName]"),"");
						}
						if ("" == noUserCfg.find("[data-id=noUserUseRate]").val()) 
						{
							g_validate.setError(noUserCfg.find("[data-id=noUserUseRate]"),"不能为空。");
							return;
						} 
						else 
						{
							g_validate.setError(noUserCfg.find("[data-id=noUserUseRate]"),"");
						}
					}
					var noUserArray1 = g_grid.getIdArray(el.find("[id=grid-2]") ,{attr:"performModule"});
					if (noUserArray1.indexOf(noUserCfg.find("[data-id=noUserName]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					var noUserArray2 = g_grid.getIdArray(el.find("[id=grid-2]") ,{attr:"value"});
					if (noUserArray2.indexOf(noUserCfg.find("[data-id=noUserUseRate]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-2]") ,[{
						performModule : noUserCfg.find("[data-id=noUserName]").val(),
						value : noUserCfg.find("[data-id=noUserUseRate]").val()
					}]);
					noUserCfg.find("[data-id=noUserName]").val("");
					noUserCfg.find("[data-id=noUserUseRate]").val("");
				});
				// noUserCfg左移
				noUserCfg.find("[data-id=noUserCfg_remove]").click(function(){
					var moveData = g_grid.getData(noUserCfg.find("[id=grid-2]") ,{chk:true});
					if (moveData.length === 0) 
					{
						g_dialog.operateAlert(el ,msg.chooseTableSpace ,"error");
						return false;
					} 
					else if (moveData.length > 1) 
					{
						g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
					}
					else 
					{
						noUserCfg.find("[data-id=noUserName]").val(moveData[0].performModule);
						noUserCfg.find("[data-id=noUserUseRate]").val(moveData[0].value);
						g_grid.removeData($("[id=grid-2]"));
					}
				});
				// linkCfg右移
				linkCfg.find("[data-id=linkCfg_add]").click(function(){
					if (linkCfg.find("[name=linkConfigStatus]:checked").val()=="1" || !g_validate.validate(linkCfg)) 
					{
						return false;
					}
					else 
					{
						if (""==linkCfg.find("[data-id=linkName]").val()) 
						{
							g_validate.setError(linkCfg.find("[data-id=linkName]"),"不能为空。");
							return;
						} 
						else 
						{
							g_validate.setError(linkCfg.find("[data-id=linkName]"),"");
						}
						if ("" == linkCfg.find("[data-id=linkValue]").val()) 
						{
							g_validate.setError(linkCfg.find("[data-id=linkValue]"),"不能为空。");
							return;
						} 
						else 
						{
							g_validate.setError(linkCfg.find("[data-id=linkValue]"),"");
						}
					}
					var linkArray1 = g_grid.getIdArray(el.find("[id=grid-3]") ,{attr:"performModule"});
					if (linkArray1.indexOf(linkCfg.find("[data-id=linkName]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					var linkArray2 = g_grid.getIdArray(el.find("[id=grid-3]") ,{attr:"value"});
					if (linkArray2.indexOf(linkCfg.find("[data-id=linkValue]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-3]") ,[{
						performModule : linkCfg.find("[data-id=linkName]").val(),
						value : linkCfg.find("[data-id=linkValue]").val()
					}]);
					linkCfg.find("[data-id=linkName]").val("");
					linkCfg.find("[data-id=linkValue]").val("");
				});
				// linkCfg左移
				linkCfg.find("[data-id=linkCfg_remove]").click(function(){
					var moveData = g_grid.getData(linkCfg.find("[id=grid-3]") ,{chk:true});
					if (moveData.length === 0) 
					{
						g_dialog.operateAlert(el ,msg.chooseTableSpace ,"error");
						return false;
					} 
					else if (moveData.length > 1) 
					{
						g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
					}
					else 
					{
						linkCfg.find("[data-id=linkName]").val(moveData[0].performModule);
						linkCfg.find("[data-id=linkValue]").val(moveData[0].value);
						g_grid.removeData($("[id=grid-3]"));
					}
				});
				//urlCfg右移
				urlCfg.find('[data-id=url_add]').click(function(){
					if (!g_validate.validate(urlCfg)) 
					{
						return false;
					}
					if(urlCfg.find("[data-id=url]").val()=="") 
					{
						g_validate.setError(urlCfg.find("[data-id=url]"),msg.blank);
						return false;
					} 
					else 
					{
						g_validate.setError(urlCfg.find("[data-id=url]"),"");
					}
					var urlArray = g_grid.getIdArray(el.find("[id=grid-he]") ,{attr:"urlAddress"});
					if (urlArray.indexOf(urlCfg.find("[data-id=url]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=grid-he]") ,[{
						urlAddress : urlCfg.find("[data-id=url]").val()
					}]);
					urlCfg.find("[data-id=url]").val("");
				});
				//urlCfg左移
				urlCfg.find("[data-id=url_remove]").click(function(){
					var moveData = g_grid.getData(urlCfg.find("[id=grid-he]") ,{chk:true});
					if (moveData.length === 0) 
					{
						g_dialog.operateAlert(el ,msg.chooseTableSpace ,"error");
						return false;
					} 
					else if (moveData.length > 1) 
					{
						g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
					}
					else 
					{
						urlCfg.find("[data-id=url]").val(moveData[0].urlAddress);
						g_grid.removeData($("[id=grid-he]"));
					}
				});			
			}
		},
		IIS6_step4 : function(el, opt) 
		{
			var wmiDiv = el.find("[data-getter=wmi]");
			tab.tab(el.find("[data-box=tab-div]") ,{
				oper : [
					function(){
						el.find("[data-store=connectType]").val("WMI");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				wmiDiv.umDataBind("render" ,opt.Vos[index].wmi);
				if (opt.flag == "upd") 
				{
					wmiDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				}
				wmiDiv.find("[data-id=monitorPort]").val() == "" && wmiDiv.find("[data-id=monitorPort]").val("135");
			}
			opt.detail && dataRender();
			certTest(wmiDiv,"wmi",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.connectType = "WMI";
			});
		},
		IIS6_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push($(this).find("[data-getter=wmi]").umDataBind("serialize"));
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "WMI";
			});
			return certStore;
		},
		IIS6_step5_test : function(el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "IIS6";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		NSFOCUS_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		NSFOCUS_step4 : function(el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NSFOCUS_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		NSFOCUS_IPS_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		NSFOCUS_IPS_step4 : function(el, opt) 
		{	
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NSFOCUS_IPS_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		NETENTSEC_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		NETENTSEC_step4 : function(el, opt) 
		{	
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NETENTSEC_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		NETENTAUDIT_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		NETENTAUDIT_step4 : function(el, opt) 
		{	
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		NETENTAUDIT_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		IBM_FC_SWITCH_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
		},
		IBM_FC_SWITCH_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		IBM_FC_SWITCH_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({edId : $("[data-id=temp_monitored_asset]").val().split(",")[i],snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "SNMP";
			});
			return certStore;
		},
		BROCADE_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
		},
		BROCADE_step4 : function(el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1, "SNMP":2};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis([sshDiv,telnetDiv]);
						g_validate.clear(sshDiv);
						g_validate.clear(telnetDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
						snmpDiv.find("[data-id=snmpPort]").val() == "" && snmpDiv.find("[data-id=snmpPort]").val("161");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					dis([sshDiv,telnetDiv]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
						dis([snmpv2,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
						dis([snmpv1,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
						dis([snmpv1,snmpv2]);
					}
				}	
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpDiv.find("[data-id=snmpPort]").val() === "" && snmpDiv.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		BROCADE_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		SANGFORSAS_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			if (opt) 
			{
				el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
				if (opt.detail.monitorStore[0].arpFlag == "1") 
				{
					el.find("[data-id=arpFlag]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].rcCmd == "1") 
				{
					el.find("[data-id=rcCmd]").attr("checked",true);
				}
				if (opt.detail.monitorStore[0].scCmd == "1") 
				{
					el.find("[data-id=scCmd]").attr("checked",true);
				}
			} 
		},
		SANGFORSAS_step4 : function(el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1, "SNMP":2};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			dis([sshDiv,telnetDiv]);
			tab.tab(el.find("[data-box=tab-div]") ,{
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis([sshDiv,telnetDiv]);
						g_validate.clear(sshDiv);
						g_validate.clear(telnetDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
						snmpDiv.find("[data-id=snmpPort]").val() == "" && snmpDiv.find("[data-id=snmpPort]").val("161");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET")
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP")
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					dis([sshDiv,telnetDiv]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
						dis([snmpv2,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
						dis([snmpv1,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
						dis([snmpv1,snmpv2]);
					}
				}	
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpDiv.find("[data-id=snmpPort]").val() === "" && snmpDiv.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		SANGFORSAS_leave_step4 : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		APUSIC_SERVER_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.find("[id=detail_store_form]").umDataBind("render" ,opt.detail.monitorStore[0]);
		},
		APUSIC_SERVER_step5_test : function(el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "APUSIC_SERVER";
			vo.teststore.monitorUserName = Encrypt(el.find("[data-id=monitorUserName]").val());
			vo.teststore.monitorPassWord = Encrypt(el.find("[data-id=monitorPassWord]").val());
			vo.teststore.monitorPort = el.find("[data-id=consolePort]").val();
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		ORACLERAC_init : function(el, opt) 
		{
			var arg = {
				header : [
					{text:"表空间名",name:"performModule"},
					{text:"阈值(%)",name:"value"}
				]
			};
			var gridBlock = el.find("[data-name=monitorPerformGridBlock]");

			init();
			event();

			function init() {
				if (opt) 
				{
					opt.detail.monitorStore.configStatus = opt.detail.monitorStore[0].configStatus == "1" ? "1" : "2";
					el.find("[id=detail_store_form]").umDataBind("render",opt.detail.monitorStore[0]);
					el.find("[data-bind=bind]").umDataBind("render",opt.detail.monitorStore[0]);
				}
				var Ddata = opt ? opt.detail.monitorPerformGridStore : [];
				g_grid.render(el.find("[id=monitorPerformGrid]") ,{
					data : Ddata,
					header : arg.header,
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
			}

			function event() {
				gridBlock.find("[name=configStatus]").change(function(){
					var val = gridBlock.find("[name=configStatus]:checked").val();
					if(val=="1") 
					{
						gridBlock.find("[data-id=unifyThreshold]").removeAttr("disabled");
						gridBlock.find("[data-flag=performModule]").val("").attr("disabled","disabled");
						gridBlock.find("[data-flag=value]").val("").attr("disabled","disabled");
						g_grid.removeData(gridBlock.find("[id=monitorPerformGrid]"),{});
					} 
					if (val=="2") 
					{
						gridBlock.find("[data-id=unifyThreshold]").val("").attr("disabled","disabled");
						gridBlock.find("[data-flag=performModule]").removeAttr("disabled");
						gridBlock.find("[data-flag=value]").removeAttr("disabled");
					}
				});
				gridBlock.find("[name=configStatus]").trigger("change");

				// userCfg右移
				gridBlock.find("[data-id=userCfg_add]").click(function(){
					if (gridBlock.find("[name=configStatus]:checked").val()=="1" || !g_validate.validate(gridBlock)) 
					{
						return false;
					}
					var userArray1 = g_grid.getIdArray(el.find("[id=monitorPerformGrid]") ,{attr:"performModule"});
					if (userArray1.indexOf(gridBlock.find("[data-flag=performModule]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					var userArray2 = g_grid.getIdArray(el.find("[id=monitorPerformGrid]") ,{attr:"value"});
					if (userArray2.indexOf(gridBlock.find("[data-flag=value]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					g_grid.addData(el.find("[id=monitorPerformGrid]") ,[{
						performModule : gridBlock.find("[data-flag=performModule]").val(),
						value : gridBlock.find("[data-flag=value]").val()
					}]);
					gridBlock.find("[data-flag=performModule]").val("");
					gridBlock.find("[data-flag=value]").val("");
				});
				// userCfg左移
				gridBlock.find("[data-id=userCfg_remove]").click(function(){
					var moveData = g_grid.getData(gridBlock.find("[id=monitorPerformGrid]") ,{chk:true});
					if (moveData.length === 0) 
					{
						g_dialog.operateAlert(el ,msg.chooseTableSpace ,"error");
						return false;
					} 
					else if (moveData.length > 1) 
					{
						g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
					}
					else 
					{
						gridBlock.find("[data-flag=performModule]").val(moveData[0].performModule);
						gridBlock.find("[data-flag=value]").val(moveData[0].value);
						g_grid.removeData($("[id=monitorPerformGrid]"));
					}
				});
			}
		},
		ORACLERAC_step4 : function(el, opt) 
		{
			$("[data-id=data-list]").css({"padding-bottom":"250px"});
			$("[data-name=tipMsg-ORACLERAC]").show();
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			// var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[opt.index].scCmd]:0);
			dis([sshDiv,telnetDiv]);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : 0,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			function dataRender(){
				// var index = opt.index && opt.index;
				opt.Vos!=undefined && opt.Vos[0] && (opt.Vos[0].ssh.trustName=opt.Vos[0].ssh.monitorUserName,opt.Vos[0].ssh.trustPassWord=opt.Vos[0].ssh.monitorPassWord,opt.Vos[0].ssh.consolePort=opt.Vos[0].ssh.monitorPort,sshDiv.umDataBind("render" ,opt.Vos[0].ssh));
				opt.Vos!=undefined && opt.Vos[0] && (opt.Vos[0].telnet.trustName=opt.Vos[0].telnet.monitorUserName,opt.Vos[0].telnet.trustPassWord=opt.Vos[0].telnet.monitorPassWord,opt.Vos[0].telnet.consolePort=opt.Vos[0].telnet.monitorPort,telnetDiv.umDataBind("render" ,opt.Vos[0].telnet));
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
				telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
				sshDiv.find("input").addClass("disabled");
				telnetDiv.find("input").addClass("disabled");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = $("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = $("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		ORACLERAC_leave_step4 : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				var connectType = $(this).find("[data-store=connectType]").val();
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].scCmd = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		ORACLERAC_step5_test : function(el) 
		{
			var vo = {teststore : el.find("[data-flag=col-div]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorDatabaseName = "";
			vo.teststore.monitorType = "ORACLERAC";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		KINGBASE_init : function(el, opt) 
		{
			var arg = {
				header : [
					{text:"表空间名",name:"performModule"},
					{text:"阈值(%)",name:"value"}
				]
			};
			var gridBlock = el.find("[data-name=monitorPerformGridBlock]");
			event();
			init();
			

			function init() {
				if (opt) 
				{
					opt.detail.monitorStore.configStatus = opt.detail.monitorStore[0].configStatus == "1" ? "1" : "2";
					el.find("[id=detail_store_form]").umDataBind("render",opt.detail.monitorStore[0]);
					el.find("[data-bind=bind]").umDataBind("render",opt.detail.monitorStore[0]);
				}
				var Ddata = opt ? opt.detail.monitorPerformGridStore : [];
				g_grid.render(el.find("[id=monitorPerformGrid]") ,{
					data : Ddata,
					header : arg.header,
					paramObj : null,
					paginator : false,
					hideSearch : true,
					isLoad : true,
					maskObj : "body"
				});
			}

			function event() {
				gridBlock.find("[name=configStatus]").change(function(){
					var val = gridBlock.find("[name=configStatus]:checked").val();
					if(val=="1") 
					{
						gridBlock.find("[data-id=unifyThreshold]").removeAttr("disabled");
						gridBlock.find("[data-flag=performModule]").val("").attr("disabled","disabled");
						gridBlock.find("[data-flag=value]").val("").attr("disabled","disabled");
						g_grid.removeData(gridBlock.find("[id=monitorPerformGrid]"),{});
					} 
					if (val=="2") 
					{
						gridBlock.find("[data-id=unifyThreshold]").val("").attr("disabled","disabled");
						gridBlock.find("[data-flag=performModule]").removeAttr("disabled");
						gridBlock.find("[data-flag=value]").removeAttr("disabled");
					}
				});
				gridBlock.find("[name=configStatus]").trigger("change");

				// userCfg右移
				gridBlock.find("[data-id=userCfg_add]").click(function(){
					if (gridBlock.find("[name=configStatus]:checked").val()=="1" || !g_validate.validate(gridBlock)) 
					{
						return false;
					}
					var userArray1 = g_grid.getIdArray(el.find("[id=monitorPerformGrid]") ,{attr:"performModule"});
					if (userArray1.indexOf(gridBlock.find("[data-flag=performModule]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					var userArray2 = g_grid.getIdArray(el.find("[id=monitorPerformGrid]") ,{attr:"value"});
					if (userArray2.indexOf(gridBlock.find("[data-flag=value]").val()) != -1)
					{
						g_dialog.operateAlert(el ,msg.repeat ,"error");
						return false;
					}
					if (!gridBlock.find("[data-flag=performModule]").val() || !gridBlock.find("[data-flag=value]").val())
					{
						g_dialog.operateAlert(el ,"请填写表空间和域名。" ,"error");
						return false
					}
					g_grid.addData(el.find("[id=monitorPerformGrid]") ,[{
						performModule : gridBlock.find("[data-flag=performModule]").val(),
						value : gridBlock.find("[data-flag=value]").val()
					}]);
					gridBlock.find("[data-flag=performModule]").val("");
					gridBlock.find("[data-flag=value]").val("");
				});
				// userCfg左移
				gridBlock.find("[data-id=userCfg_remove]").click(function(){
					var moveData = g_grid.getData(gridBlock.find("[id=monitorPerformGrid]") ,{chk:true});
					if (moveData.length === 0) 
					{
						g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
						return false;
					} 
					else if (moveData.length > 1) 
					{
						g_dialog.operateAlert(el, msg.selectOnlyOne ,"error");
					}
					else 
					{
						gridBlock.find("[data-flag=performModule]").val(moveData[0].performModule);
						gridBlock.find("[data-flag=value]").val(moveData[0].value);
						g_grid.removeData($("[id=monitorPerformGrid]"));
					}
				});
			}
		},
		KINGBASE_step5_test : function(el) 
		{
			var vo = {teststore : el.find("[data-id=monitor_index]").umDataBind("serialize")};
			vo.teststore.agentId = el.find("[data-id=monitorAgent]").val();
			vo.teststore.assetIds = el.find("[data-id=temp_monitored_asset]").val();
			vo.teststore.consoleIp = "";
			vo.teststore.monitorType = "KINGBASE";
			vo.teststore.readCommunity = vo.teststore.snmpCommunity;
			return vo;
		},
		JUNIPER_init : function (el, opt)
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		JUNIPER_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		JUNIPER_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		MICRPATCH_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		MICRPATCH_step5_test : function (el) 
		{

		},
		SYMAN_NBU_init : function (el, opt) 
		{
			g_validate.init(el);
			g_grid.render(el.find("[id=grid-u]") ,{
				data : opt ? opt.detail.faultStore : [],
				header : [{text:"已配置进程",name:"faultModule"}],
				paramObj : null,
				hideSearch : true,
				paginator : false
			});
			// 已配置进程 左移 右移 progress_add progress_remove
			//右移事件
			el.find("[data-id=fault_add]").click(function(){
				if (!g_validate.validate(el.find("[data-block=fault]"))){
					return false;
				}
				var progressArray = g_grid.getIdArray(el.find("[id=grid-u]") ,{attr:"faultModule"});
				if (progressArray.indexOf(el.find("[data-flag=faultModule]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				if (el.find("[data-flag=faultModule]").val() == "") 
				{
					g_validate.setError(el.find("[data-flag=faultModule]"), msg.blank);
					return false;
				} 
				else 
				{
					g_validate.setError(el.find("[data-flag=faultModule]"), "");
				}
				g_grid.addData(el.find("[id=grid-u]") ,[{
					faultModule : $("[data-flag=faultModule]").val()
				}]);
				$("[data-flag=faultModule]").val("");
			});

			// 左移事件
			el.find("[data-id=fault_remove]").click(function (){
				var data = g_grid.getData(el.find("[id=grid-u]") ,{chk:true});
				if (data.length === 0)
				{
					g_dialog.operateAlert(el ,msg.selectOne ,"error");
				}
				else if (data.length > 1)
				{
					g_dialog.operateAlert(el ,msg.selectOnlyOne ,"error");
				}
				else
				{
					el.find("[data-flag=faultModule]").val(data[0].faultModule);
					g_grid.removeData(el.find("[id=grid-u]"));
				}
			});
		},
		SYMAN_NBU_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].consoleIp]:0);
			dis(el.find("[data-box=tab-div]"));
			g_mask.mask(el.find("[data-box=tab-div]"));
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						dis(sshDiv);
						dis(telnet,true);
					} 
					else 
					{
						dis(sshDiv,true);
						dis(telnetDiv);
					}
				} 
				else
				{
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([sshDiv,telnetDiv]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="SSH2") 
				{
					el.find("[data-name=open]").prop("checked",true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv,true);
					dis(telnetDiv);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="TELNET") 
				{
					el.find("[data-name=open]").prop("checked",true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv);
					dis(telnetDiv,true);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="-1") 
				{
					el.find("[data-name=open]").prop("checked",false);
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
				telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		SYMAN_NBU_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if($(this).find("[data-name=open]").is(":checked")) 
				{
					if (connectType=="SSH2") 
					{
						certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
					}
					if (connectType=="TELNET") 
					{
						certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
					}
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
					certStore[i].consoleIp = connectType;
				} 
				else 
				{
					certStore = [{"trustName":"","trustPassWord":"","consolePort":"","commandPrompt":"","loginPrompt":"","passwordPrompt":"","consoleIp":"-1"}];
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				}
			});
			return certStore;
		},
		HP_RAID_step4 : function (el, opt) 
		{
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		HP_RAID_leave_step4 : function (el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		EMC_VMAX_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		EMC_VMAX_step4 : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].consoleIp]:0);
			dis(el.find("[data-box=tab-div]"));
			g_mask.mask(el.find("[data-box=tab-div]"));
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						dis(sshDiv);
						dis(telnet,true);
					} 
					else 
					{
						dis(sshDiv,true);
						dis(telnetDiv);
					}
				} 
				else
				{
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([sshDiv,telnetDiv]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="SSH2") 
				{
					el.find("[data-name=open]").prop("checked",true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv,true);
					dis(telnetDiv);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="TELNET") 
				{
					el.find("[data-name=open]").prop("checked",true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv);
					dis(telnetDiv,true);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].consoleIp=="-1") 
				{
					el.find("[data-name=open]").prop("checked",false);
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
				telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		EMC_VMAX_leave_step4 : function (el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if($(this).find("[data-name=open]").is(":checked")) 
				{
					if (connectType=="SSH2") 
					{
						certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
					}
					if (connectType=="TELNET") 
					{
						certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
					}
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
					certStore[i].consoleIp = connectType;
				} 
				else 
				{
					certStore = [{"trustName":"","trustPassWord":"","consolePort":"","commandPrompt":"","loginPrompt":"","passwordPrompt":"","consoleIp":"-1"}];
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				}
			});
			return certStore;
		},
		IPMI_init : function (el ,opt){
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		JDK_init : function (el ,opt){
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
	    },
	    RESIN_init : function (el ,opt){
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VMWARE_init : function(el, opt) 
		{
			index_form_init(el);
			g_validate.init(el);
			opt && el.umDataBind("render", opt.detail.monitorStore[0]);
		},
		VMWARE_step5_test : function (el) 
		{
			var teststore = 
			{
				teststore :
					{
		        "agentId": el.find("[data-id=monitorAgent]").val(),
		        "assetIds": el.find("[data-id=temp_monitored_asset]").val(),
		        "commandPrompt": el.find("[data-id=commandPrompt]").val(),
		        "connectType": "",
		        "consoleIp": "",
		        "context": "",
		        "loginPrompt": "",
		        "monitorDatabaseName": el.find("[data-id=monitorDatabaseName]").val(),
		        "monitorPassWord": Encrypt(el.find("[data-id=monitorPassWord]").val()),
		        "monitorPort": el.find("[data-id=monitorPort]").val(),
		        "monitorType": "VMWARE",
		        "monitorUserName": Encrypt(el.find("[data-id=monitorUserName]").val()),
		        "passwordPrompt": "",
		        "trustPassWord": ""
					}
			};
			return teststore;
		},
		TERMINAL_init : function (){

		},
		baseLineDialog : function (el_btn,opt){
			var header = opt.header;
			var url = opt.url;
			var pEl = el_btn;
			var atteIndex = opt.atteIndex;
			$.ajax({
				type: "GET",
				url: "js/plugin/monitor/monitor.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find('[id=query_baseline_template]').html(),{
						width : "1000px",
						title : "基线查看",
						initAfter : initAfter,
						saveclick : saveclick,
						top: "1%",
						autoHeight:true
					});

					function initAfter(el)
					{
						// 获取
						el.find("[id=get]").click(function (){
							query_baseline(true);
						});
						// 关注
						el.find('[id=follow]').click(function(event) {
							var keyNo = g_grid.getIdArray(el.find("[id=query_baseline_table]") ,{chk:true,attr:"keyNo"});
							if (keyNo.length == 0)
							{
								g_dialog.operateAlert(el ,"请至少选择一条记录!" ,"error");
								return false;
							}

							el.find("[id=query_baseline_table]").find("[data-id=um-grid-table-div]").find("table").find("tr").each(function (i){
								if ($(this).find("[data-id=check_inp]").is(":checked"))
								{
									$(this).data("data").atteStatus = 1;
									$(this).find("td").eq(atteIndex).find("div").html("关注");
								}
							});
						});
						// 取消关注
						el.find('[id=Rfollow]').click(function(event) {
							var keyNo = g_grid.getIdArray(el.find("[id=query_baseline_table]") ,{chk:true,attr:"keyNo"});
							if (keyNo.length == 0)
							{
								g_dialog.operateAlert(el ,"请至少选择一条记录!" ,"error");
								return false;
							}
							el.find("[id=query_baseline_table]").find("[data-id=um-grid-table-div]").find("table").find("tr").each(function (i){
								if ($(this).find("[data-id=check_inp]").is(":checked"))
								{
									$(this).data("data").atteStatus = 0;
									$(this).find("td").eq(atteIndex).find("div").html("不关注");
								}
							});
						});

						query_baseline(false);

						//查看基线
						function query_baseline(urlFlag)
						{
							var gridParam = {
												header : header,
												url : url,
												paramObj:opt.paramObj,
												hideSearch : true,
												paginator : false,
												showCount : true,
												allowCheckBox : true,
												autoHeight:true,
												cacheSearch : true,
												searchInp : $("[id=search_inp]"),
												searchKey : opt.searchKey,
												cbf:function (){
													if (urlFlag)
													{
														var dataMap = new HashMap();
														var dataArrayTmp = g_grid.getData(el.find("[id=query_baseline_table]") ,{chk:false});
														for (var i = 0; i < dataArrayTmp.length; i++) {
															dataMap.put(dataArrayTmp[i].rowId ,dataArrayTmp[i]);
														}
														pEl.data("map" ,dataMap);
													}
												}
											}
							if (!urlFlag)
							{
								var data = pEl.data("data");

								if (data && data.length > 0)
								{
									delete gridParam.url;
									gridParam.data = data;
								}
								else
								{
									delete gridParam.url;
									gridParam.data = [];
								}
							}

							g_grid.render(el.find("[id=query_baseline_table]"),gridParam);
						}
					}

					function saveclick(el)
					{
						var data = g_grid.getData(el.find("[id=query_baseline_table]") ,{chk:false});
						var dataMap = pEl.data("map");
						!dataMap && (dataMap = new HashMap());
						for (var i = 0; i < data.length; i++)
						{
							dataMap.put(data[i].rowId ,data[i]);
						}
						pEl.data("data" ,dataMap.values());
						g_dialog.hide(el);
					}
				}
			});
		},
		C_SSH_SNMP_TELNET_INIT : function (el,opt){
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1, "SNMP":2};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(telnetDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(sshDiv);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis([sshDiv,telnetDiv]);
						g_validate.clear(sshDiv);
						g_validate.clear(telnetDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
						snmpDiv.find("[data-id=snmpPort]").val() == "" && snmpDiv.find("[data-id=snmpPort]").val("161");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				}
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv,snmpv1,snmpv2,snmpv3],["input","select"]);
				}
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					dis([sshDiv,telnetDiv]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
						dis([snmpv2,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
						dis([snmpv1,snmpv3],["input","select"]);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
						dis([snmpv1,snmpv2]);
					}	
				}	
				sshDiv.find("[data-id=monitorPort]").val()=== "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() === "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpDiv.find("[data-id=snmpPort]").val() === "" && snmpDiv.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		C_SSH_SNMP_TELNET_LEAVE : function (el,opt){
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		C_SSH_TELNET_INIT : function (el,opt){
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val()=="" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis([telnetDiv],["input","select"]);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis([sshDiv],["input","select"]);
						g_validate.clear(sshDiv);
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2")
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([telnetDiv],["input","select"]);
				}
				if(opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis([sshDiv],["input","select"]);
				}
				sshDiv.find("[data-id=monitorPort]").val()=== "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() === "" && telnetDiv.find("[data-id=monitorPort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		C_SSH_TELNET_LEAVE : function (el,opt){
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		C_SNMP_INIT : function (el,opt){
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		C_SNMP_LEAVE : function (el,opt){
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
				certStore[i].snmpVo.edId = certStore[i].edId;
				certStore[i].connectType = "SNMP";
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
			});
			return certStore;
		},
		C_WMI_SNMP_INIT : function (el,opt){
			var wmiDiv = el.find("[data-getter=wmi]");
			// var trayDiv = el.find("[data-getter=tray]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = snmpDiv.find("[data-id=snmpVersion]");
			var snmpv1 = snmpDiv.find("[data-getter=v1]");
			var snmpv2 = snmpDiv.find("[data-getter=v2]");
			var snmpv3 = snmpDiv.find("[data-getter=v3]");
			// var typeIndex = {"WMI":0, "TRAY":1, "SNMP":2};
			var typeIndex = {"WMI":0, "SNMP":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("WMI");
						dis(wmiDiv,true);
						// trayDiv.find("input").attr("disabled","disabled");
						// g_validate.clear(trayDiv);
						dis([snmpv1,snmpv2,snmpv3],["input","select"]);
						g_validate.clear(snmpDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("SNMP");
						dis(wmiDiv);
						g_validate.clear(wmiDiv);
						// trayDiv.find('input').attr("disabled","disabled");
						// g_validate.clear(trayDiv);
						snmpVer.removeAttr("disabled");
						snmpVer.trigger("change");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				wmiDiv.umDataBind("render" ,opt.Vos[index].wmi);
				// trayDiv.umDataBind("render" ,opt.Vos[index].tray);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "WMI") 
				{
					dis(wmiDiv,true);
					wmiDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SNMP") 
				{
					snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
					{
						dis(snmpv1,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
					{
						dis(snmpv2,true);
					}
					if (opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
					{
						dis(snmpv3,["input","select"],true);
					}
				} 
				wmiDiv.find("[data-id=monitorPort]").val() == "" && wmiDiv.find("[data-id=monitorPort]").val("135");
				// trayDiv.find("[data-id=monitorPort]").val() == "" && trayDiv.find("[data-id=monitorPort]").val("37179");
				snmpv1.find("[dta-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[dta-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[dta-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);
			certTest(wmiDiv,"wmi",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.connectType = "WMI";
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		C_WMI_SNMP_LEAVE : function (el,opt){
			el.find("[data-id=temp_certificate_type]").val(el.find("[data-id=connectType]").val());
			var connectType = el.find("[data-store=connectType]").val();
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="WMI") 
				{
					certStore.push($(this).find("[data-getter=wmi]").umDataBind("serialize"));
				}
				if (connectType=="TRAY") 
				{
					certStore.push($(this).find("[data-getter=tray]").umDataBind("serialize"));
				}
				if (connectType=="SNMP") 
				{
					certStore.push({snmpVo : $(this).find("[data-getter=snmp]").umDataBind("serialize")});
					certStore[i].snmpVo.edId = certStore[i].edId;
					certStore[i].snmpVo.connectType = connectType;
				}
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = connectType;
			});
			return certStore;
		},
		C_SNMPMUST_SSH_TELNET_INIT : function (el,opt){
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var snmpDiv = el.find("[data-getter=snmp]");
			var snmpVer = el.find("[data-id=snmpVersion]");
			var snmpv1 = el.find("[data-getter=v1]");
			var snmpv2 = el.find("[data-getter=v2]");
			var snmpv3 = el.find("[data-getter=v3]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			$("[data-flag=multipleValidate]").val(1);
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].connectType]:0);
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						el.find("[data-store=connectType]").val("TELNET");
					} 
					else 
					{
						el.find("[data-store=connectType]").val("SSH2");
					}
				} 
				else
				{
					g_mask.mask(el.find("[data-box=tab-div]"));
					el.find("[data-store=connectType]").val("");
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([snmpv2,snmpv3],["input","select"]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				snmpDiv.umDataBind("render" ,opt.Vos[index].snmp);
				opt.detail.monitorStore && el.find("[data-store=connectType]").val(opt.detail.monitorStore[0].connectType);
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "SSH2") 
				{
					dis(sshDiv,true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				if (opt.flag == "upd" && el.find("[data-store=connectType]").val() == "TELNET") 
				{
					dis(telnetDiv,true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					el.find("[data-name=open]").click();
				} 
				opt.detail.monitorSnmpStore && snmpDiv.umDataBind("render" ,opt.detail.monitorSnmpStore[0]);	
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="1") 
				{
					dis(snmpv1,true);
				}
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="2") 
				{
					dis(snmpv2,true);
				}
				if (opt.flag == "upd" && opt.detail.monitorSnmpStore[0].snmpVersion=="3") 
				{
					dis(snmpv3,["input","select"],true);
				}
				sshDiv.find("[data-id=monitorPort]").val() == "" && sshDiv.find("[data-id=monitorPort]").val("22");
				telnetDiv.find("[data-id=monitorPort]").val() == "" && telnetDiv.find("[data-id=monitorPort]").val("23");
				snmpv1.find("[data-id=snmpPort]").val() == "" && snmpv1.find("[data-id=snmpPort]").val("161");
				snmpv2.find("[data-id=snmpPort]").val() == "" && snmpv2.find("[data-id=snmpPort]").val("161");
				snmpv3.find("[data-id=snmpPort]").val() == "" && snmpv3.find("[data-id=snmpPort]").val("161");
			}
			opt.detail && dataRender();
			snmpVerChange(el);

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
			certTest(snmpDiv,"snmp",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		C_SNMPMUST_SSH_TELNET_LEAVE : function (el,opt){
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if (connectType=="" || connectType == "SNMP")
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="SSH2") 
				{
					certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
				}
				if (connectType=="TELNET") 
				{
					certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
				}
				// certStore.forEach(function (tmp){
				// 	tmp.connectType = connectType;
				// 	tmp.edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				// 	tmp.snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				// 	tmp.snmpVo.edId = certStore[i].edId;
				// })

				certStore[i].connectType = connectType;
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].snmpVo = $(this).find("[data-getter=snmp]").umDataBind("serialize");
				certStore[i].snmpVo.edId = certStore[i].edId;
				
			});
			return certStore;
		},
		C_WMI_INIT : function(el, opt) 
		{
			var wmiDiv = el.find("[data-getter=wmi]");
			tab.tab(el.find("[data-box=tab-div]") ,{
				oper : [
					function(){
						el.find("[data-store=connectType]").val("WMI");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				wmiDiv.umDataBind("render" ,opt.Vos[index].wmi);
				if (opt.flag == "upd") 
				{
					wmiDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				}
				wmiDiv.find("[data-id=monitorPort]").val() == "" && wmiDiv.find("[data-id=monitorPort]").val("135");
			}
			opt.detail && dataRender();
			certTest(wmiDiv,"wmi",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.connectType = "WMI";
			});
		},
		C_WMI_LEAVE : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push($(this).find("[data-getter=wmi]").umDataBind("serialize"));
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "WMI";
			});
			return certStore;
		},
		C_TRAY_INIT : function(el, opt) 
		{
			var wmiDiv = el.find("[data-getter=wmi]");
			tab.tab(el.find("[data-box=tab-div]") ,{
				oper : [
					function(){
						el.find("[data-store=connectType]").val("WMI");
					}
				]
			});
			function dataRender(){
				var index = opt.index && opt.index;
				wmiDiv.umDataBind("render" ,opt.Vos[index].wmi);
				if (opt.flag == "upd") 
				{
					wmiDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
				}
				wmiDiv.find("[data-id=monitorPort]").val() == "" && wmiDiv.find("[data-id=monitorPort]").val("135");
			}
			opt.detail && dataRender();
			certTest(wmiDiv,"wmi",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.connectType = "WMI";
			});
		},
		C_TRAY_LEAVE : function(el) 
		{
			var certStore = []; 
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				certStore.push($(this).find("[data-getter=wmi]").umDataBind("serialize"));
				certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				certStore[i].connectType = "WMI";
			});
			return certStore;
		},
		C_SSH_TELNET_SWITCH_INIT : function (el, opt) 
		{
			var sshDiv = el.find("[data-getter=ssh]");
			var telnetDiv = el.find("[data-getter=telnet]");
			var typeIndex = {"SSH2":0, "TELNET":1};
			var tabIndex = opt.flag && (opt.flag=="upd"?typeIndex[opt.detail.monitorStore[0].scCmd]:0);
			dis(el.find("[data-box=tab-div]"));
			g_mask.mask(el.find("[data-box=tab-div]"));
			tab.tab(el.find("[data-box=tab-div]") ,{
				index : tabIndex,
				oper : [
					function(){
						el.find("[data-store=connectType]").val("SSH2");
						dis(sshDiv,true);
						sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
						dis(telnetDiv);
						g_validate.clear(telnetDiv);
					},
					function(){
						el.find("[data-store=connectType]").val("TELNET");
						dis(sshDiv);
						g_validate.clear(sshDiv);
						dis(telnetDiv,true);
						telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
					}
				]
			});
			el.find("[data-name=open]").change(function(){
				if($(this).is(":checked")) 
				{
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
					if(el.find("[data-store=connectType]").val()=="TELNET") 
					{
						dis(sshDiv);
						dis(telnet,true);
					} 
					else 
					{
						dis(sshDiv,true);
						dis(telnetDiv);
					}
				} 
				else
				{
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				g_validate.clear(sshDiv);
				g_validate.clear(telnetDiv);
			});
			el.find("[data-name=open]").trigger("change");
			dis([sshDiv,telnetDiv]);
			function dataRender(){
				var index = opt.index && opt.index;
				sshDiv.umDataBind("render" ,opt.Vos[index].ssh);
				telnetDiv.umDataBind("render" ,opt.Vos[index].telnet);
				if (opt.flag == "upd" && opt.detail.monitorStore[0].scCmd=="SSH2") 
				{
					el.find("[data-name=open]").prop("checked",true);
					sshDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv,true);
					dis(telnetDiv);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].scCmd=="TELNET") 
				{
					el.find("[data-name=open]").prop("checked",true);
					telnetDiv.umDataBind("render" ,opt.detail.monitorStore[0]);
					dis(sshDiv);
					dis(telnetDiv,true);
					g_mask.maskRemove(el.find("[data-box=tab-div]"));
				}
				if (opt.flag == "upd" && opt.detail.monitorStore[0].scCmd=="-1") 
				{
					el.find("[data-name=open]").prop("checked",false);
					dis([sshDiv,telnetDiv]);
					g_mask.mask(el.find("[data-box=tab-div]"));
				}
				sshDiv.find("[data-id=consolePort]").val() == "" && sshDiv.find("[data-id=consolePort]").val("22");
				telnetDiv.find("[data-id=consolePort]").val() == "" && telnetDiv.find("[data-id=consolePort]").val("23");
			}
			opt.detail && dataRender();

			// 凭证信息测试按钮
			certTest(sshDiv,"ssh",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
				paramObj.monitorPort = paramObj.consolePort;
				paramObj.monitorUserName = paramObj.trustName;
				paramObj.monitorPassWord = paramObj.trustPassWord;
				delete paramObj.consolePort;
				delete paramObj.trustName;
				delete paramObj.trustPassWord;
			});
			certTest(telnetDiv,"telnet",function(paramObj){
				paramObj.monitorAgentId = el.find("[data-id=monitorAgent]").val();
				paramObj.test_ip = g_grid.getData($("[data-id=data-list]"))[0].edIp;
			});
		},
		C_SSH_TELNET_SWITCH_LEAVE : function(el) 
		{
			var certStore = []; 
			var connectType = el.find("[data-store=connectType]").val();
			var cert_div = el.find("[data-flag=col-div]");
			cert_div.each(function(i){
				if($(this).find("[data-name=open]").is(":checked")) 
				{
					if (connectType=="SSH2") 
					{
						certStore.push($(this).find("[data-getter=ssh]").umDataBind("serialize"));
					}
					if (connectType=="TELNET") 
					{
						certStore.push($(this).find("[data-getter=telnet]").umDataBind("serialize"));
					}
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
					certStore[i].scCmd = connectType;
				} 
				else 
				{
					certStore = [{"trustName":"-1","trustPassWord":"","consolePort":"","commandPrompt":"","loginPrompt":"","passwordPrompt":"","scCmd":"-1"}];
					certStore[i].edId = $("[data-id=temp_monitored_asset]").val().split(",")[i];
				}
			});
			return certStore;
		},
	}
});