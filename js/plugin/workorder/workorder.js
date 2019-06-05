define(['inputdrop' ,'js/plugin/asset/asset.js' ,'tree','/js/plugin/tab/tab.js',"/js/plugin/timepicker/timepicker.js"], function(inputdrop ,asset ,tree,tab,timepicker) {

	return {
		notice_user_dialog : function (){
			$.ajax({
				type: "GET",
				url: "js/plugin/workorder/workorder.html",
				success: function(data) {
					g_dialog.dialog($(data).find("[id=notice_template]"), {
						width: "1000px",
						init: init,
						initAfter: initAfter,
						top : "0",
						title : "通知交流",
						isDetail : true,
						btn_array:[
					 				{id:"email_btn",class:"dialog-email",text:"邮件",aClick:email_notice_init},
					 				{id:"phone_btn",class:"dialog-phone",text:"电话",aClick:phone_notice_init},
					 				{id:"message_btn",class:"dialog-message",text:"短信",aClick:message_notice_init}
			 		   		      ]
					});
				}
			});

			var header = [
							{text:"姓名" ,name:"name",align:'left'} ,
							{text:"性别" ,name:"sex",align:'left',render:function (tdTxt,rowData){
					  			if (rowData.sex == 1)
					  			{
					  				return "男";
					  			}
					  			else if(rowData.sex == 2)
					  			{
					  				return "女";
					  			}
					  		}},
						  	{text:"办公电话" ,name:"telephone",align:'left'} ,
						  	{text:"手机" ,name:"mobile",align:'left'},
						  	{text:"邮箱" ,name:"email",align:'left'} 
						  ];
			var el_table_top;
			var el_table_bottom;
			var eventSTR;
			try{
				eventSTR = $("[data-id=eventStr]").val().split(",").join("_");
			}catch(e){

			};
			(eventSTR == "") && (eventSTR = "null");
			var eventType = $("[data-id=eventType]").val();

			function init(el){
				el_table_top = el.find("[id=table_top]");
				el_table_bottom = el.find("[id=table_bottom]");

				g_grid.render(el_table_top ,{
					data:[],
					header:header,
					hideSearch : true,
					paginator : false
				});

				g_grid.render(el_table_bottom ,{
					data:[],
					header:header,
					hideSearch : true,
					paginator : false
				});

				el.find("[id=accordion_icon]").find("i").click(function (){
					el.find("[id=accordion_icon]").find("i").removeClass("icon-active");
					$(this).addClass("icon-active");
					var self = this;
					um_ajax_post({
						url : $(this).attr("data-url"),
						isLoad : true,
						maskObj : el,
						paramObj : {flag:"1"},
						successCallBack:function (data){
							if ($(self).html() != "角色") {
								data.push({domaId:"roota" ,pdomaId:"-2" ,domaName:$(self).html()});
								for (var i = 0; i < data.length; i++) {
									if (data[i].pdomaId == -1) {
										data[i].pdomaId = "roota"
									} 
									data[i].id = data[i].domaId  
									data[i].parentID = data[i].pdomaId  
									data[i].label = data[i].domaName 
									
								}
							} else{
								data.push({id:"roota" ,pId:"-2" ,label:$(self).html()});
							}
			 				tree.render($("#left_tree") ,{
			 					zNodes : data,
			 					zTreeOnClick : function (event, treeId, treeNode){
			 						g_grid.removeData(el_table_top ,{});

			 						var domainId = treeNode.id;
			 						var flag = "user";

			 						if ($(self).attr("data-key"))
									{
										flag = "";
									}
			 						
			 						var userGroupGridStore = [];
			 						var dataArray = g_grid.getData(el_table_bottom);
			 						for(var i = 0; i < dataArray.length; i++)
			 						{
			 							userGroupGridStore.push({staffId:dataArray[i].staffId});
			 						}
			 						um_ajax_post({
										url : "workflow/notify/queryStaffList",
										paramObj : {domaId:domainId,flag:flag,userGroupGridStore:userGroupGridStore},
										isLoad : true,
										maskObj : el,
										successCallBack:function (data){
											g_grid.addData(el_table_top ,data);
										}
									});
			 					},
			 					expandNode : "roota"
			 				});
			 				current_treeType = $(self).attr("data-type");
						}
					});
				});

				el.find("[id=up_btn]").click(function (){
					var downDataArray = g_grid.getData(el_table_bottom ,{chk:true});
					if (downDataArray.length == 0)
					{
						g_dialog.operateAlert(el ,index_select_one_at_least_msg ,"error");
						return false;
					}
					g_grid.removeData(el_table_bottom);
					g_grid.addData(el_table_top ,downDataArray);
				});

				el.find("[id=down_btn]").click(function (){
					var upDataArray = g_grid.getData(el_table_top ,{chk:true});
					if (upDataArray.length == 0)
					{
						g_dialog.operateAlert(el ,index_select_one_at_least_msg ,"error");
						return false;
					}
					g_grid.removeData(el_table_top);
					g_grid.addData(el_table_bottom ,upDataArray);
				});
			}

			function initAfter(el){
				el.find("[id=accordion_icon]").find("i").eq(0).click();
			}
	
			function email_notice_init(el)
			{
				var data = g_grid.getData(el_table_bottom);
				if(data.length == 0)
				{
					g_dialog.operateAlert(el_table_bottom ,"请选择待通知人员。" ,"error");
					return false;
				}
				var eArray = g_grid.getIdArray(el_table_bottom,{attr:"email"});
				if(eArray.indexOf("") > -1)
				{
					var tmp = [];
					for (var i = 0; i < data.length; i++) {
						if(data[i].email == "")
						{
							tmp.push(data[i].name);
						}
					}
					var user = tmp.join(",");
					g_dialog.operateAlert(el_table_bottom ,user+" 未配置电子邮箱，不能发送邮件。" ,"error");
					return false;
				}
				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=email_notice_template]"), {
							width: "700px",
							top : "8%",
							init: init,
							title : "邮件交流",
							isDetail : true,
							btn_array:[{id:"post_btn",class:"dialog-post",text:"发送",aClick:email_post}]
						});
					}
				});

				var extMap = new HashMap();

				function init(aEl)
				{
					var nameArray = [];
					var staffIdArray = [];
					var emailArray = [];
					for(var i = 0; i < data.length; i++)
					{
						nameArray.push(data[i].name);
						staffIdArray.push(data[i].staffId);
						emailArray.push(data[i].email);
					}
					var name = nameArray.join(";");
					var staffId = staffIdArray.join(";")
					var email = emailArray.join(";");
					aEl.find("[data-id=mainDeliveryName]").text(name);
					aEl.find("[data-id=mainDelivery]").val(staffId);
					aEl.find("[id=email]").text(email);

					um_ajax_post({
						url : "NotifyController/queryInitInfo",
						paramObj : {type:"email"},
						isLoad : true,
						maskObj : "body",
						successCallBack:function (data){
							g_formel.selectEl_render(aEl.find("[data-id=carbonCopy]"),{
								data:data.assetUserGroupStore,
								text:"codename",
								id:"codevalue"
							});
							g_formel.selectEl_render(aEl.find("[data-id=emailTemplateName]"),{
								data:data.emailTemplateStore,
								text:"codename",
								id:"codevalue"
							});

							for (var i = 0; i < data.emailTemplateStore.length; i++) {
								extMap.put(data.emailTemplateStore[i].codevalue,
												data.emailTemplateStore[i].ext);
							}

							aEl.find("[data-id=emailTemplateName]").change(function(){
								aEl.find("[data-id=notifyContent]").val(extMap.get($(this).val()));
							});
						}
					});
					
					um_ajax_post({
						url : "EventControllerService/queryEventList4Notify",
						paramObj : {eventStore:{eventStr:eventSTR,eventType:eventType}},
						isLoad : true,
						maskObj : "body",
						successCallBack:function (data){
							aEl.find("[data-id=notifyContent]").val(data.eventStore.mailNotifyDesc);
						}
					});
				}

				function email_post(aEl)
				{
					var type = "email";
					submit(el,aEl,type);
				}
			}

			function phone_notice_init(el)
			{
				var data = g_grid.getData(el_table_bottom);
				if(data.length == 0)
				{
					g_dialog.operateAlert(el ,"请选择待通知人员。" ,"error");
					return false;
				}
				var mArray = g_grid.getIdArray(el_table_bottom,{attr:"mobile"});
				var pArray = g_grid.getIdArray(el_table_bottom,{attr:"telephone"});
				if(mArray.indexOf("") > -1 &&  pArray.indexOf("") > -1)
				{
					var tmp = [];
					for (var i = 0; i < data.length; i++) {
						if(data[i].mobile == "" && data[i].telephone == "")
						{
							tmp.push(data[i].name);
						}
					}
					var user = tmp.join(",");
					g_dialog.operateAlert(el_table_bottom ,user+" 未配置联系电话，不能电话通知。" ,"error");
					return false;
				}
				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=phone_notice_template]"), {
							width: "700px",
							top : "9%",
							init: init,
							title : "电话交流",
							isDetail : true,
							btn_array:[{id:"post_btn",class:"dialog-post",text:"确认",aClick:phone_post}]
						});
					}
				});

				function init(aEl)
				{
					var nameArray = [];
					var staffIdArray = [];
					var phoneArray = [];
					var mobileArray = [];
					for(var i = 0; i < data.length; i++)
					{
						nameArray.push(data[i].name);
						staffIdArray.push(data[i].staffId);
						phoneArray.push(data[i].telephone);
						mobileArray.push(data[i].mobile)
					}
					var name = nameArray.join(";");
					var staffId = staffIdArray.join(";");
					var phone = phoneArray.join(";");
					var mobile = mobileArray.join(";");
					aEl.find("[data-id=mainDeliveryName]").text(name);
					aEl.find("[data-id=mainDelivery]").val(staffId);
					aEl.find("[data-id=telephone]").text(phone);
					aEl.find("[data-id=mobile]").text(mobile);
				}

				function phone_post(aEl)
				{
					var type = "phone";
					submit(el,aEl,type);
				}
			}

			function message_notice_init(el)
			{
				var data = g_grid.getData(el_table_bottom);
				if(data.length == 0)
				{
					g_dialog.operateAlert(el_table_bottom ,"请选择待通知人员。" ,"error");
					return false;
				}
				var mArray = g_grid.getIdArray(el_table_bottom,{attr:"mobile"});
				if(mArray.indexOf("") > -1)
				{
					var tmp = [];
					for (var i = 0; i < data.length; i++) {
						if(data[i].mobile == "")
						{
							tmp.push(data[i].name);
						}
					}
					var user = tmp.join(",");
					g_dialog.operateAlert(el_table_bottom ,user+" 未配置手机号码，不能发送短信。" ,"error");
					return false;
				}
				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=message_notice_template]"), {
							width: "700px",
							top : "12%",
							init: init,
							title : "短信交流",
							isDetail : true,
							btn_array:[{id:"post_btn",class:"dialog-post",text:"发送",aClick:message_post}]
						});
					}
				});

				function init(aEl)
				{
					var nameArray = [];
					var staffIdArray = [];
					
					var mobileArray = [];
					for(var i = 0; i < data.length; i++)
					{
						nameArray.push(data[i].name);
						staffIdArray.push(data[i].staffId);
						mobileArray.push(data[i].mobile)
					}
					var name = nameArray.join(";");
    				var staffId = staffIdArray.join(";")
					var mobile = mobileArray.join(";");
					aEl.find("[data-id=mainDeliveryName]").text(name);
					aEl.find("[data-id=mainDelivery]").val(staffId);
					aEl.find("[data-id=mobile]").text(mobile);

					um_ajax_post({
						url : "EventControllerService/queryEventList4Notify",
						paramObj : {eventStore:{eventStr:eventSTR,eventType:eventType}},
						isLoad : true,
						maskObj : "body",
						successCallBack:function (data){
							aEl.find("[data-id=notifyContent]").val(data.eventStore.smsNotifyDesc);
						}
					});
				}

				function message_post(aEl)
				{
					var type = "sms";
					submit(el,aEl,type);
				}
			}

			function submit(el,aEl,type)
			{
				if (!g_validate.validate(aEl))
				{
					return false;
				}
				var saveObj = aEl.umDataBind("serialize");

				saveObj.processInstanceID = $("[data-id=procInstanceId]").val();

				if(type == "email")
					saveObj.notifyMethod = "email";
				else if(type == "phone")
					saveObj.notifyMethod = "phone";
				else if(type == "sms")
					saveObj.notifyMethod = "sms";
				
				saveObj.chkBox = "0";
				saveObj.uploadFile = "";
				aEl.find("[name=jsonString]").val(JsonTools.encode(saveObj));

				um_ajax_file(aEl.find("form") ,{
					url : "NotifyController/addNotifyRecord",
					paramObj : {},
					isLoad : true,
					maskObj : "body",
					successCallBack:function (data){
						g_dialog.operateAlert();
						g_dialog.hide(aEl);
						g_dialog.hide(el);
						notice_list_addData(saveObj.processInstanceID);
					}
				});
			}

			function notice_list_addData(processInstanceID)
			{
				um_ajax_post({
					url : "EventController/queryNotify",
					paramObj : {queryStore:{procInstID:processInstanceID}},
					isLoad : true,
					maskObj : "body",
					successCallBack:function (data){
						g_grid.removeData($(notice_table_div),{});
						g_grid.addData($(notice_table_div) ,data.queryStore);
					}
				});
			}	
		},
		/** 
			封装资产输入框
		*/
		assetInput: function(el ,opt) {
			var position = opt.position || "top"
			el.wrap('<div class="prel"></div>');
			var el_asset_input = el;
			el.after('<i class="icon-search" style="position:absolute; bottom: 10px;right:5px;font-size:15px;opacity:0.4"></i>');
			var el_icon_search = el.next();
			if (el_asset_input.hasClass("noEdit"))
			{
				el_icon_search.hide();
			}
			var el_asset_table;
			el_icon_search.click(function() {
				if($(this).prev().hasClass("disable"))
					return false;

				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=asset_template]"), {
							width: "830px",
							top:"10%",
							title:"资产名称",
							init: init,
							saveclick: save,
							autoHeight:true
						});
					}
				});

				function init(el) {
					el_asset_table = el.find('[id=table_in_asset]');

					g_grid.render(el_asset_table, {
						header: [
							{text:'',name:"t",width:3,hideSearch:"hide"},
							{
								text: '资产名称',
								align:"left",
								name: "assetName"
							},
							{
								text: '资产类型',
								align:"left",
								name: "assetTypeName",
								searchRender:function (el){
									el.append('<div class="inputdrop" id="assetTypeId"></div>');
									g_formel.sec_biz_render({
										assetTypeEl : el.find("div")
									});
								}
							}, {
								text: '安全域',
								align:"left",
								name: "securityDomainName",
								searchRender:function (el){
									el.append('<div class="inputdrop" id="securityDomainId"></div>');
									g_formel.sec_biz_render({
										secEl : el.find("div"),
										secWidth : "300px"
									});
								}
							}, {
								text: '业务域',
								align:"left",
								name: "bussinessDomainName",
								searchRender:function (el){
									el.append('<div class="inputdrop" id="bussinessDomainId"></div>');
									g_formel.sec_biz_render({
										bizEl : el.find("div")
									});
								}
							},{
								text: 'IP',
								align:"left",
								name: "mainIp",
								searchRender:function (el){
								   index_render_div(el ,{type:"ip"});
								}
						}],
						url: opt.url ? opt.url : "AssetOperation/queryAsset",
						paramObj: {noEdIds : el_asset_input.find("[data-type=id_inp]").val()},
						allowCheckBox: true,
						checkType:el_asset_input.hasClass("single") ? "radio":"checkbox",
						isLoad:"true",
						maskObj:"body",
						hideSearch:false,
						autoHeight:true,
						queryBefore:function (paramObj){
							paramObj = paramObj || {}
							return $.extend(paramObj ,
											{noEdIds:el_asset_input.find("[data-type=id_inp]").val()})
						}
					});

					//查询
					el.find("[id=asset_query_btn]").click(function() {
						asset.queryDialog({
							saveclick : function (dataList){
								g_grid.addData(el_asset_table ,[{edName:"123"}]);
							}
						});
					});
				}

				function save(el, saveObj) {
					var data = g_grid.getData(el_asset_table ,{chk:true});
					//var idKey = "assetName";
					var idKey = "edId";

					if (opt && opt.idKey)
					{
						idKey = opt.idKey;
					}
					for (var i = 0; i < data.length; i++) {
						data[i].id = data[i][idKey];
						data[i].text = data[i].assetName;
					}
					if (data.length == 0)
					{
						g_dialog.operateAlert(el_asset_table ,index_select_one_at_least_msg ,"error");
						return false;
					}
					if (el_asset_input.hasClass("single"))
					{
						if (data.length != 1)
						{
							g_dialog.operateAlert(el_asset_table ,"请只选择一条资产记录。" ,"error");
							return false;
						}
						inputdrop.initSelect(el_asset_input);
					}
					$("[assetIp]").val(data[0].mainIp);
					g_dialog.hide(el);
					el_asset_input.data("data" ,[])
					inputdrop.addDataSelect(el_asset_input ,{
							data : data
					});
					g_validate.clear([el_asset_input.find("[validate]")]);
					opt.cbf && opt.cbf(data)
				}
			});
			var data = [];
			if (opt && opt.data)
			{
				data = opt.data;
			}
			if (opt && opt.required)
			{
				el_asset_input.attr("required" ,"");
			}
			inputdrop.renderSelect(el_asset_input ,{
												data : data,
												allowCheckBox : false,
												hideRemove : false,
												hideRemoveAll : true,
												isSingle : true,
												position : position,
												height : "150px",
												singleRemoveCbf : function(){
													$("[assetIp]").val("")
												}
											});
		},

		assetInputForMonitor: function(el ,opt) {
			var position = opt.position || "top"
			if (el.parent().hasClass("asset-wrap")) {
				var elParent = el.parent().parent()
				el.parent().remove()
				elParent.append(el)
			}
			el.wrap('<div class="prel"></div>');
			var el_asset_input = el;
			el.after('<i class="icon-search" style="position:absolute; bottom: 10px;right:5px;font-size:15px;opacity:0.4"></i>');
			var el_icon_search = el.next();
			if (el_asset_input.hasClass("noEdit"))
			{
				el_icon_search.hide();
			}
			var el_asset_table;
			el_icon_search.click(function() {
				if($(this).prev().hasClass("disable"))
					return false;

					$.ajax({
						type: "GET",
						url: "js/plugin/workorder/workorder.html",
						success: function(data) {
							g_dialog.dialog($(data).find("[id=asset_template]"), {
								width: "830px",
								top:"10%",
								title:"资产名称",
								init: init,
								saveclick: save,
								autoHeight:true
							});
						}
					});

					function init(el) {
						el_asset_table = el.find('[id=table_in_asset]');
						var __varArray = []
						var __val = el_asset_input.find("[data-type=id_inp]").val()
						__val = __val.split(",")
						__val.forEach(function (tmp){
							__varArray.push(tmp.split("|")[0])
						})
						g_grid.render(el_asset_table, {
							header: [
								{name:"",text:"" ,hideSearch:"hide",width:3},
								{text:'资产名称',name:"entityName",width:17,align:"left",searchRender : function(el){
									el.append('<input type="text" search-data="entityName" class="form-control input-sm" />');
									el.append('<input type="hidden" search-data="monitorType" searchCache/>');
									el.find("[search-data=monitorType]").val($("[data-id=temp_type]").val());
								}},
								{text:'IP',name:"ipvAddress",align:"left",width:20,searchRender:function (el){
								  		index_render_div(el ,{type:"ip"});
								   }},
								{text:'资产类型',name:"entityType" ,width:20,align:"left",searchRender : function (el){
								   	   var assetTypeEl = $('<div class="inputdrop" id="entityType"></div>');
								   	   g_formel.sec_biz_render({
								   	   		assetTypeEl : assetTypeEl
								   	   });
								   	   el.append(assetTypeEl);
								   }},

								{text:'安全域',name:"securityName" ,width:20,align:"left",searchRender : function (el){
								   	   var secEl = $('<div class="inputdrop" id="securityName"></div>');
								   	   g_formel.sec_biz_render({
								   	   		secEl : secEl
								   	   });
								   	   el.append(secEl);
								   }},
								{text:'业务域',name:"businessName" ,width:20,align:"left",searchRender : function (el){
								   	   var bizEl = $('<div class="inputdrop" id="businessName"></div>');
								   	   g_formel.sec_biz_render({
								   	   		bizEl : bizEl
								   	   });
								   	   el.append(bizEl);
								   }},
							],
							url: "monitorConfig/queryNoMonitoreDeviceList",
							paramObj: {
										noEdIds:__varArray.join(","),monitorType:opt.monitorType,ignoreRecordLimit:1
									  },
							allowCheckBox: true,
							isLoad:"true",
							maskObj:"body",
							hideSearch:false,
							autoHeight:true
						});

						//查询
						el.find("[id=asset_query_btn]").click(function() {
							asset.queryDialog({
								saveclick : function (dataList){
									g_grid.addData(el_asset_table ,[{entityName:"123"}]);
								}
							});
						});
					}

					function save(el, saveObj) {
						var data = g_grid.getData(el_asset_table ,{chk:true});
						//var idKey = "assetName";
						var idKey = "edId";

						if (opt && opt.idKey)
						{
							idKey = opt.idKey;
						}
						for (var i = 0; i < data.length; i++) {
							data[i].id = data[i][idKey] + "|" + data[i].ipvAddress
							data[i].text = data[i].entityName;
						}
						if (data.length == 0)
						{
							g_dialog.operateAlert(el_asset_table ,index_select_one_at_least_msg ,"error");
							return false;
						}
						if (el_asset_input.hasClass("single"))
						{
							if (data.length != 1)
							{
								g_dialog.operateAlert(el_asset_table ,"请只选择一条资产记录。" ,"error");
								return false;
							}
							inputdrop.initSelect(el_asset_input);
						}
						$("[assetIp]").val(data[0].mainIp);
						g_dialog.hide(el);
						el_asset_input.data("data" ,[])
						inputdrop.addDataSelect(el_asset_input ,{
							data : data
						});
						g_validate.clear([el_asset_input.find("[validate]")]);
					}
				});
				var data = [];
				if (opt && opt.data)
				{
					data = opt.data;
				}
				if (opt && opt.required)
				{
					el_asset_input.attr("required" ,"");
				}
				if (el.find("[data-t=name_inp]").size() != 0) {
					el.html("")
				}
				inputdrop.renderSelect(el_asset_input ,{
					data : data,
					allowCheckBox : false,
					hideRemove : false,
					hideRemoveAll : true,
					isSingle : true,
					position : position,
					height : "150px",
					singleRemoveCbf : function(){
						$("[assetIp]").val("")
					}
				});
		},

		workorder_init : function (step,opt){
			var opt = opt?opt:{};
			var data = opt.data?opt.data:{};

			var el_div = $("#workorder_div");
			if (opt.el)
			{
				el_div = opt.el;
				$("#workorder_div").data("el" ,opt.el);
			}
			el_div.data("opt" ,opt);
			var el_form = el_div.find("[id="+step.split("_")[1]+"]");
			el_div.data("data" ,data);

			var self = this;
			if (el_div.find("[asset]").size() > 0)
			{
				el_div.find("[asset]").each(function (){
					var dataArray = [];
					if (Object.keys(data).length > 0)
					{
						try
						{
							var idArray = data[$(this).attr("id")].split(",");
							var nameArray = data[$(this).attr("id")+"name"].split(",");

							for (var i = idArray.length - 1; i >= 0; i--) {
								dataArray.push({id:idArray[i] ,text:nameArray[i]});
							}
						}catch(e){

						}
					}
					
					self.assetInput(
							$(this) ,{
										data:dataArray
									 }
							);
					$(this).find("input").eq(0).attr("data-id" ,$(this).attr("id")+"name");
				});
			}

			if(!(opt && opt.type == "detail"))
			{
				el_form.find("[class=mask]").remove();
				if(step == "sjczlc_step1" || step == "socsjczlc_step1")
				{
					el_div.find("[id=step2]").find("[class=mask]").remove();
					el_div.find("[id=step2]").append('<div class="mask"></div>');
				}
				if(step == "zhsqlc_step1" || step == "zhsqlc_step2")
				{
					el_div.find("[id=step3]").find("[class=mask]").remove();
					el_div.find("[id=step3]").append('<div class="mask"></div>');
				}

				if (el_form.find("[sysDate]").size() > 0)
				{
					um_ajax_get({
						url : "dutyperson/querySysdate",
						isLoad : false,
						successCallBack : function(data){
							
							el_form.find("[sysDate]").text(data.sysdate);
							el_form.find("[sysDate]").val(data.sysdate);
						}
					});
				}

				if (el_form.find("[sessionUser]").size() > 0)
				{
					um_ajax_get({
						url : "querySessionUser",
						successCallBack : function(data){
							
							el_form.find("[sessionUser]").text(data.user.userAccount+'('+data.user.userName+')');
							el_form.find("[sessionUser]").val(data.user.userAccount+'('+data.user.userName+')');
							el_form.find("[sessionUser]").next().val(data.user.userId);
						}
					});
				}

				g_validate.init(el_form);
			}

			else
			{
				if(opt.style == "see")
				{
					el_div.find("[class=mask]").css("opacity","0.3");
				}
				else
				{
					el_form.find("[class=mask]").css("opacity" ,"0.3");
				}
			}

			index_form_init(el_div);

			var workOrderName = step.split("_")[0];
			var currentStepNum = step.split("_")[1].substr(4);

			if (currentStepNum == 0)
			{
				return false;
			}

			for (var i = 1; i <= currentStepNum; i++) 
			{
				try{
					eval("this."+workOrderName+"_step"+i+"_init()");
				}catch(e){

				}
			}
		},
		workorder_render : function (step ,data){
			var el_div = $("#workorder_div");

			el_div.find("select").trigger("change");
		},
		// 已办工单查看 ----------
		done_workorder : function(opt,style){
			var self = this;
			var id = opt.id;
			var tplName = opt.tplName;
			var processInstanceID = opt.processInstanceID;
			var approveUser=opt.approveUser;
			var title = opt.title ? opt.title : "已办工单查看";
			(style && style == "see") && (title = "案例来源表单查看");
			if(style && style == "case")
			{
				title = "工单监控";
				var caseStatus = opt.caseStatus;
				var workOrderStatus = opt.workOrderStatus;
				var procStatus = opt.procStatus;
			}

			var dialogParam = {
				width : "930px",
				init:init,
				initAfter:initAfter,
	 		    title:title,
	 		    isDetail:true,
	 		    autoHeight:"autoHeight"
			};

			$.ajax({
				type: "GET",
				url: "module/oper_workorder/workorder_handle/todo_work_tpl.html",
				success :function(data)
				{
					if(style && style == "case" && id.split("_")[0] == "socsjczlc" && caseStatus == "0" && workOrderStatus != "2")
					{
						dialogParam["btn_array"] = [
							{id:"general_case_btn",class:"dialog-create-workorder",text:"生成案例",aClick:general_case_init}
						];
						g_dialog.dialog($(data).find("[id=tab]"),dialogParam);
					}
					else
					{
						g_dialog.dialog($(data).find("[id=tab]"),dialogParam);
					}
				}
			});

			function init(el)
			{
				tab.tab(el.find("[id=tab]"),{oper : [null,null]});
				if(style && style == "see") {
					el.find("[id=tab]").find("li:eq(1)").remove();
					el.find("[id=tab]").find("li:eq(1)").remove();
				};
				el.find("[id=workorder_div]").data("step" ,id);
				el.find("[id=workorder_div]").data("tplName",tplName);
				el.find("[id=workorder_div]").data("procInstanceId",processInstanceID);
				el.data("step" ,id);
				el.data("tplName",tplName);

				$.ajax({
					type: "GET",
					url: "tpl/workorder/"+id.split("_")[0]+".html",
					success :function(data)
					{
						el.find("[id=workorder_div]").html($(data).find("[data-type=workorder]").html());
                        try{
                            eval("self."+id.split("_")[0]+".step_init")(el,{actTmpId:id,meLiActivitiIsEndData:true,processInstanceID:processInstanceID},self);
                        }catch(e){}
					}
				});
			}

			function initAfter(el)
			{
				um_ajax_get({
					url : "workflow/queryHisWorkflowOrderDetail",
					paramObj : {procInsId:processInstanceID},
					maskObj : "body",
					successCallBack : function (data){
						delete data['${wf_applicant}'];
						var obj = new Object();
						obj.type = "detail";
						obj.data = data;
						if(style)
						{
							obj.style = "see";
							if(style == "see")
							{
								obj.el=el;
							}
						}
						self.workorder_init(id ,obj);
						el.umDataBind("render" ,data);
						self.workorder_render(id ,data);
                        try{
                            el.data("workData",data);//绑定数据
                            eval("self."+id.split("_")[0]+".step_init_after")(el,{actTmpId:id,meLiActivitiIsEndData:true,processInstanceID:processInstanceID},self,{});
                        }catch(e){}
					}
				});
                load_his_deal(el);
				if(!(style && style == "see"))
				{
					var flag = 1;
					// (style && style == "case" && workOrderStatus == "1" && procStatus == "0") && (flag = 3);
					el.find("[id=img]").attr("src",index_web_app+"workflow/getFlowDiagram?procInstId="+processInstanceID+"&flag="+flag+"&date="+new Date().getTime());
				}
			}
			
			//加载历史处理
			function load_his_deal(el){
				var hisDiv=el.find("#his_table_div");
				var curDiv=el.find("#cur_table_div");
				var hisTab=el.find("[data-id=tab-ul]").find("li:eq(2)");

				var his_tab_click=function(){
	                g_grid.resizeSup(hisDiv);
	                g_grid.resizeSup(curDiv);
				}
                var tempConfig1={
                    header:[
                        {align:"center",text:"当前节点",name:"actName"},
                        {align:"center",text:"开始时间",name:"startTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"节点处理人",name:"userName"}
                    ],
                    operWidth : "100px",
                    paginator : false,
                    allowCheckBox:false,
                    data : [],
                    hasBorder : true,
                    hideSearch :true
                };
                var tempConfig={
                    header:[
                        {align:"center",text:"处理节点",name:"actName"},
                        {align:"center",text:"开始时间",name:"startTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"处理时间",name:"endTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"处理人",name:"assigneeName"},
                        {align:"center",text:"操作",name:"operName"}
                    ],
                    operWidth : "100px",
                    paginator : false,
                    allowCheckBox:false,
                    data : [],
                    hasBorder : true,
                    hideSearch :true
                };
                g_grid.render(curDiv,tempConfig1);
                g_grid.render(hisDiv,tempConfig);
                g_dialog.waitingAlert(el.find("#workflow_do_his"));
	            um_ajax_get({
	            	url: "workflow/queryHisActivitys/"+processInstanceID,
	                paramObj: {},
	                maskObj: "#workflow_do_his",
	                successCallBack: function (data) {
	                	curDiv.data("curData",data.cList);
	                    hisDiv.data("hisData",data.hList);
	                	try{
	                		eval("self."+id.split("_")[0]+".his_data_init")(el,{actTmpId:id,meLiActivitiIsEndData:true,processInstanceID:processInstanceID,approveUser:approveUser},self,{},data);
						}catch(e){
	                        try{
	                        	//如果未定义相关数据处理
	                            if(e.message.toLowerCase().indexOf("not defined")>=0||e.message.toLowerCase().indexOf("not a function")){
	                                // hisDiv.oneTime(1000,function(){
	                                	g_grid.addData(curDiv,data.cList);
									// });
                                    // hisDiv.oneTime(1000,function(){
	                                	if(data.hList&&data.hList.length>0){
                                            data.hList[data.hList.length-1].userName=approveUser;
										}
	                                	g_grid.addData(hisDiv,data.hList);
									// });
	                                hisTab.unbind("click",his_tab_click);
	                                hisTab.bind("click",his_tab_click);
	                            }
	                        }catch(e2){
	                        	console.log(e);
							}
						}
                        g_dialog.waitingAlert(el.find("#workflow_do_his"));
	                }
	            });
			}
			
			function general_case_init(el)
			{
				$.ajax({
					type: "GET",
					url: "module/oper_workorder/workflow_manage/workorder_tpl.html",
					success :function(data)
					{
						g_dialog.dialog($(data).find("[id=general_case_template]"),{
							width:"600px",
							init:init,
				 		    title:"生成案例",
				 		    top : "6%",
							saveclick:save_click
						});
					}
				});
				function init(aEl)
				{
					var caseTitle = el.find("[data-id=wf_step1_wfname]").val();
					var eventType = el.find("[data-id=eventType]").val();
					var eventStr = el.find("[data-id=eventStr]").val();
					var procInstID = el.find("[data-id=procInstanceId]").val();
					aEl.find("[name=caseTitle]").val(caseTitle); 
					aEl.find("[name=eventType]").val(eventType);
					aEl.find("[name=eventStr]").val(eventStr);
					aEl.find("[name=procInstID]").val(procInstID);
					um_ajax_get({
						url : "WorkOrderMonitorController/queryConfigInfo",
						maskObj : "body",
						isLoad : "true",
						successCallBack : function(data){
							aEl.umDataBind("render",data.maxstore[0]);
							g_formel.appendix_render(aEl.find("[id=appendixgroup]") ,{});
						}
					});
				}

				function save_click(aEl)
				{
					var maxObj = new Object();
					maxObj.maxUpLoadFileNum = aEl.find("[data-id=maxUpLoadFileNum]").text();
					maxObj.maxUpLoadFileSize = aEl.find("[data-id=maxUpLoadFileSize]").text();
					aEl.find("[name=maxdsjson]").val(JsonTools.encode(maxObj));

					g_formel.appendix_render($("[id=appendixgroup]") ,{
						method : "getUploadStrArray"
					});

					var uploadStr = $("[id=appendixgroup]").data("uploadStrArray").join("|");
					aEl.find("[name=uploadStr]").val(uploadStr);

					um_ajax_file(aEl.find("form") ,{
						url : "WorkOrderMonitorController/newCase",
						paramObj : {},
						isLoad : true,
						maskObj : "body",
						successCallBack:function (data){
							g_dialog.operateAlert("body");
							g_dialog.hide(aEl);
							g_dialog.hide(el);
							opt.cbf && opt.cbf();
						}
					});
				}
			}
		},
		//-----------已办工单查看

		// 库存外借流程 ----------
		kcwjlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.assetBorrow.controller.AssetBorrow";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "kcwjlc";

				var obj = new Object();
				obj.assetborrowStep1Apply = saveObj;
				obj.curstep = "assetborrowStep1Apply";
				obj.procDefID = "kcwjlc:1:140004";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "asset_admeasure";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				})
			}
		},
		// -------------库存外借流程

		// 事件处置流程 ----------
		sjczlc_step1_init : function(){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var data = el_div.data("data")?el_div.data("data"):{};
			var noticeStore = data.noticeStore?data.noticeStore:[];
			var procInstanceId = el_div.data("procInstanceId");
			var step = el_div.data("step");
			var opt = el_div.data("opt");

			var self = this;

			form_init();

			notice_list();

			event_init();

			function form_init()
			{
				var secVal = data?data.securityDomianId:"";
				var bizVal = data?data.bussinessDomianId:"";
				g_formel.sec_biz_render({
											secEl:$("[id=securityDomianId]"),
											secVal:secVal
										});
				g_formel.sec_biz_render({
											bizEl:$("[id=bussinessDomianId]"),
											bizVal:bizVal
										});
				if(step)
				{
					$("[data-id=procInstanceId]").val(procInstanceId);
				}
			    else
			    {	
			    	var time = g_moment().format('ddd MM DD YYYY HH:mm:ss');
					var int = parseInt(500*Math.random());
					var processInstanceID = "3rd_faultEvent_"+time+"_"+int;
					$("[data-id=procInstanceId]").val(processInstanceID);
			    	el_form.find("[data-id=eventType]").change(function(){
			    		var eventType = $(this).val();
			    		var eventtype;
			    		(eventType == "1") && (eventtype = "aggrEvent");
						(eventType == "2") && (eventtype = "faultEvent");
						(eventType == "3") && (eventtype = "perfEvent");
						(eventType == "13") && (eventtype = "deployEvent");
						(eventType == "14") && (eventtype = "vulTaskEvent");
						(eventType == "5") && (eventtype = "ralationEvent");
						processInstanceID = "3rd_"+eventtype+"_"+time+"_"+int;
						$("[data-id=procInstanceId]").val(processInstanceID);
			    	});
			    }	
			}

			function event_init()
			{
				el_form.find("[id=notice_btn]").click(function(){
					self.notice_user_dialog();
				});

				el_form.find("[id=email_associate_btn]").click(function(){
					email_associate();
				});
			}

			function notice_list()
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				var gridParam = {
					header : [
							  {text:'',name:"t",width:3,hideSearch:"hide"},
							  {text:'通知人',name:"userName",width:22,align:"left"},
							  {text:'被通知人',name:"mainDelivery",width:25,align:"left"},
							  {text:'通知方式',name:"notifyMethod",width:25,align:"left"},
							  {text:'通知时间',name:"notifyTime",width:25,align:"left"}
							  ],
					data : noticeStore,
					isLoad : false,
					allowCheckBox : false,
					hideSearch : true,
					paginator:false,
					dbClick : notice_detail_init,
					dbIndex:1
				};

				if( step && step.split("_")[1] == "step2" && (opt.type != "detail"))
				{
					$("#step1").find("[class=mask]").remove();
					$("#one").append('<div class="mask"></div>');
					// gridParam["oper"] = [
					// 						{icon:"rh-icon rh-edit" ,text:"修改" ,aclick:phone_update ,isShow:function (data){
					// 							return (data.notifyMethod == "电话");
					// 						}},
					// 					];
					// gridParam["operWidth"] = "80px";					
				}

				g_grid.render($("#notice_table_div"),gridParam);
			}

			function phone_update(rowData)
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=phone_update_template]"), {
							width: "600px",
							top : "6%",
							init: init,
							title : "电话通知修改",
							saveclick : save_click
						});
					}
				});

				function init(aEl)
				{
					var obj = new Object();
					obj.notifyID = rowData.notifyID;
					obj.procInstID = procInstID;
					obj.notifyType = "phone";
					obj.type = "modify";
					obj.pagetype = "edit";
					obj.notifiedUserID = rowData.notifiedUserID
					um_ajax_get({
						url : "NotifyController/queryNotifyDetail",
						paramObj : obj,
						isLoad : true,
						maskObj : "body",
						successCallBack:function (data){
							var mainDeliveryArray = [];
							var phoneArray = [];
							var mobileArray = [];

							for(var i = 0;i < data.notifydetailstore.length;i++)
							{
								var data1 = data.notifydetailstore[i];
								mainDeliveryArray.push(data1.mainDelivery);
								phoneArray.push(data1.phone);
								mobileArray.push(data1.mobile);	
							}
							var mainDelivery = mainDeliveryArray.join(";");
							var phone = phoneArray.join(";");
							var mobile = mobileArray.join(";");
							aEl.find("[data-id=mainDelivery]").text(mainDelivery);
							aEl.find("[data-id=phone]").text(phone);
							aEl.find("[data-id=mobile]").text(mobile);
							aEl.find("[data-id=userName]").text(data.notifydetailstore[0].userName);
							aEl.find("[data-id=notifyTime]").text(data.notifydetailstore[0].notifyTime);
							aEl.find("[data-id=notifyContent]").text(data.notifydetailstore[0].notifyContent == null ? "" : data.notifydetailstore[0].notifyContent);
						}
					});
				}

				function save_click(aEl,saveObj)
				{
					var obj = new Object();
					obj.notifyID = rowData.notifyID;
					obj.processInstanceID = procInstID;
					obj.notifyContent = saveObj.notifyContent;

					um_ajax_post({
						url : "NotifyController/updRecord",
						paramObj : obj,
						successCallBack : function(data){
							g_dialog.operateAlert("body");
							g_dialog.hide(aEl);
							notice_list_refresh();
						}

					});
				}
			}
			
			function notice_detail_init(rowData)
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				var title;
				var width = "700px";
				if(rowData.notifyMethod == "邮件")
				{
					title = "邮件通知详情";
					width = "600px";
				}
				else if(rowData.notifyMethod == "电话")
				{
					title = "电话通知详情";
				}
				else if(rowData.notifyMethod == "短信")
				{
					title = "短信通知详情";
				}

				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=notice_detail_template]"), {
							width: width,
							top : "6%",
							init: init,
							initAfter : initAfter,
							title : title,
							isDetail : true
						});
					}
				});

				function init(aEl)
				{
					if(rowData.notifyMethod == "邮件")
					{
						aEl.find("[id=phone_sms_div]").remove();
					}
					else
					{
						aEl.find("[id=email_div]").remove();
						g_grid.render(aEl.find("[id=table_in_notice_detail]"),{
							 header : [
							          {text:'',name:"t",width:3,hideSearch:"hide"},
									  {text:'通知人',name:"userName",width:"15",align:'left'},
									  {text:'被通知人',name:"mainDelivery",width:"15",align:'left'},
									  {text:'通知时间',name:"notifyTime",width:"30",align:'left'},
									  {text:'通知内容',name:"notifyContent",align:'left'}
									  ],
							 data : [],
							 allowCheckBox : false,
							 hideSearch : true
						});
					}
				}

				function initAfter(aEl)
				{
					um_ajax_post({
						url : "NotifyController/queryNotifyDetail",
						paramObj :{notifyID:rowData.notifyID,notifiedUserID:rowData.notifiedUserID, procInstID:procInstID,notifyType:rowData.notifyMethodEn},
						isLoad : false,
						isDetail : true,
						maskObj : "body",
						successCallBack : function(data){
							if(rowData.notifyMethod == "邮件")
							{
								um_ajax_get({
									url : "InBoxController/queryAppendixByEmail",
									paramObj : {emailCode : rowData.notifyID},
									isLoad : true,
									maskObj : "body",
									successCallBack : function(data1){
										aEl.umDataBind("render" ,data.notifydetailstore[0]);
										aEl.find("[data-id=email]").html(data.notifydetailstore[0].email);
										aEl.find("[data-id=notifyContent]").html(data.notifydetailstore[0].notifyContent);
										for (var i = 0; i < data1.length; i++) {
							 				var app_div;
											app_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+data1[i].appendixPath+'" data-flag="appendix" data-id="'+data1[i].appendixCode+'">'
						 							+data1[i].appendixName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
							 				aEl.find("[id=appendixList]").append(app_div);
							 			}
										aEl.find("[data-flag=appendix]").click(function(){
											var url = $(this).attr("id");
											um_ajax_get({
												url : "InBoxController/queryAppendixExist",
												paramObj : {appendixCode : $(this).attr("data-id")},
												isLoad : true,
												maskObj : "body",
												successCallBack : function(data){
													window.location.href = url;
												}
											});
										});
							 				
									}
								});
							}
							else 
							{
								g_grid.addData(aEl.find("[id=table_in_notice_detail]") ,data.notifydetailstore);	
							}		
						}
					});
				}
			}
			
			function email_associate()
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=email_template]"), {
							width: "700px",
							top : "8%",
							init: init,
							title : "往来邮件关联",
							btn_array:[	
								{id:"associate_btn",class:"dialog-associate",text:"关联",aClick:associate}
				 		   		      ],
							isDetail : true
						});

						function init(aEl)
						{
							g_grid.render(aEl.find("[id=table_in_query_email]"),{
								 header : [
								 				{text:'',name:"t",width:3,hideSearch:"hide"},
											    {text:'主题',name:"emailTitle",align:'left'},
											    {text:'发件人',name:"emailFrom",align:'left'},
											    {text:'日期',name:"emailDate",align:'left'},
											    {text:'',name:"radio" ,width:10,render:function(txt ,rowData){
											   		return '<input type="radio" name="email_btn" value=""/><div style="display:none">'+rowData.emailCode+','+rowData.emailDate+','+rowData.emailFrom+','+rowData.emailTitle+','
											   		// +rowData.emailDescription
											   		+'</div>';
										        }}
										  ],
								 url:"InBoxController/preInboxList",
								 paramObj : {procInstID:procInstID},
								 allowCheckBox : false,
								 isLoad : true,
								 maskObj: "body",
								 hideSearch : true
							});		
						}

						function associate(aEl)
						{
							var tmp = aEl.find("[name=email_btn]:checked").next().html().split(",");
							var obj = new Object();
							obj.procInstID = procInstID;
							obj.emailID = tmp[0];
							obj.emailDate = tmp[1];
							obj.emailFrom = tmp[2];
							obj.emailTitle = tmp[3];
							obj.emailContent = tmp[4];
							um_ajax_post({
								url : "NotifyController/addEmailAssociateRecord",
								paramObj : obj,
								maskObj : aEl,
								successCallBack : function (data){
									g_dialog.operateAlert();
									g_dialog.hide(aEl);
									notice_list_refresh();
								}
							});
						}
					}
				});
			}

			function notice_list_refresh()
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				um_ajax_post({
					url : "EventController/queryNotify",
					paramObj : {queryStore:{procInstID:procInstID}},
					isLoad : true,
					maskObj : "body",
					successCallBack:function (data){
						g_grid.removeData($(notice_table_div),{});
						g_grid.addData($(notice_table_div) ,data.queryStore);
					}
				});
			}

			if(opt.type == "detail")
			{
				this.sjczlc_step2_init();
			}
		},
		sjczlc_step2_init : function(){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step2]");
			var data = el_div.data("data");
			var procInstanceId = el_div.data("procInstanceId");
			var opt = el_div.data("opt");

			event_init();

			upload_attachments_init();

			function event_init()
			{
				el_form.find("[id=aprresult]").click(function(){
					if($(this).is(":checked"))
					{
						el_form.find("[data-id=wf_step2_aprresult]").val("0");
					}
					else
					{
						el_form.find("[data-id=wf_step2_aprresult]").val("1");
					}
				});
			}

			function upload_attachments_init()
			{
				el_form.find("[id=upload_btn]").click(function(){
					var dialogParam = {
						init:init,
					};
					$.ajax({
						type: "GET",
						url: "tpl/workorder/upload_tpl.html",
						success :function(data)
						{
							if(opt.type == "detail")
							{
								dialogParam["width"] = "459px";
								dialogParam["title"] = "附件查看";
								dialogParam["isDetail"] = true;
								g_dialog.dialog($(data).find("[id=appendix_show_template]"),dialogParam);
							}
							else
							{
								dialogParam["width"] = "600px";
								dialogParam["title"] = "附件信息";
								dialogParam["saveclick"] = save_click;
								g_dialog.dialog($(data).find("[id=upload_template]"),dialogParam);
							}
						}
					});

					function init(aEl)
					{
						if(opt.type == "detail")
						{
							um_ajax_get({
								url : "GeneralController/queryAppendixInfo",
								paramObj : {procInstID : procInstanceId},
								isLoad : true,
								maskObj :"body",
								successCallBack : function(data){
									var appendixstore = data.appendixstore;
						 			for (var i = 0; i < appendixstore.length; i++) {
						 				var app_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+appendixstore[i].attachPath+'" data-flag="appendix">'
						 							+appendixstore[i].attachName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
						 				aEl.find("[id=appendixgroup]").append(app_div);
						 				event_init();
						 				function event_init()
						 				{
						 					aEl.find("[data-flag=appendix]").click(function(){
												var url = $(this).attr("id");
												window.location.href = url;
											});
						 				}
						 			}
								}
							});
						}
						else
						{
							aEl.find("[name=procInstID]").val(procInstanceId);
							um_ajax_get({
								url : "GeneralController/queryAppendixInfo",
								paramObj : {procInstID : procInstanceId},
								isLoad : true,
								maskObj :"body",
								successCallBack : function(data){
									aEl.umDataBind("render",data.maxstore[0]);
									aEl.find("[name=maxUploadSize]").val(data.maxstore[0].maxUpLoadFileSize);
									g_formel.appendix_render(aEl.find("[id=appendixgroup]") ,{
										data : data.appendixstore,
										key : "attachName",
										url : "attachPath",
										procInstID :procInstanceId
									});
									aEl.find("a").click(function(){
										window.location.href = index_web_app+"GeneralController/download?param="+JsonTools.encode({fileName:$(this).html(),procInstID:procInstanceId});
									});
								}
							});
						}		
					}

					function save_click(aEl)
					{
						g_formel.appendix_render($("[id=appendixgroup]") ,{
							method : "getUploadStrArray"
						});

						var delAppendixIdStr = $("[id=appendixgroup]").data("delStrArray" ).join("|");
						aEl.find("[name=delAppendixIdStr]").val(delAppendixIdStr);

						var uploadStr = $("[id=appendixgroup]").data("uploadStrArray").join("|");
						aEl.find("[name=uploadStr]").val(uploadStr);

						um_ajax_file(aEl.find("form") ,{
							url : "GeneralController/updGeneralAppendixs",
							paramObj : {},
							isLoad : true,
							maskObj : "body",
							successCallBack:function (data){
								g_dialog.operateAlert("body");
								g_dialog.hide(aEl);
							}
						});
					}
				});
			}
		},
		sjczlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.event.controller.UnEventController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "sjczlc";
				saveObj.noticeStore = [];
				var data2 = g_grid.getData(el_form.find("[id=notice_table_div]"));
				for (var i = 0; i < data2.length; i++) {
					saveObj.noticeStore.push(
						data2[i]
					);
				}

				var obj = new Object();
				obj.eventHandleStep1Apply = saveObj;
				obj.curstep = "eventHandleStep1Apply";
				obj.procDefID = "sjczlc:1:117504";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "3rd_part_event";
				obj.tmpProcInstId = el_form.find("[data-id=procInstanceId]").val();
				obj.eventType = saveObj.eventType;

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------事件处置流程

		// 值班人员变更流程 ----------
		zbrybglc_step1_init : function(){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var data = el_div.data("data");
			um_ajax_get({
				url : "dutyperson/queryDutyDateList",
				isLoad : false,
				successCallBack : function(data1){
					g_formel.selectEl_render(el_form.find("[offDate]"),{
						data:data1.date_codelist,
						text:"codename",
						id:"codevalue",
						val:data.wf_step1_offdate
					});
				}
			});

			el_form.find("[offDate]").change(function(){
				var offdate = el_form.find("[offDate]").val();
				um_ajax_post({
					url : "dutyperson/queryPersonList",
					isLoad : false,
					paramObj : {date:offdate},
					successCallBack : function (data1){
						el_form.find("[offPeople]").find("option").remove();
						
						g_formel.selectEl_render(el_form.find("[offPeople]"),{
							data:data1.person_codelist,
							text:"codename",
							id:"codevalue",
							val:data.wf_step1_offpeople
						});
					}
				});
			});	
		},
		zbrybglc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";

			var dateId = el_form.find("[offDate]").val();
			var personId = el_form.find("[offPeople]").val();
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				um_ajax_post({
					url : "dutyperson/checkDuplicate",
					isLoad : "true",
					maskObj : "body",
					paramObj : {date:dateId,person:personId},
					successCallBack:function(data){
						if(data.flag == true)
						{
							g_dialog.operateAlert(el_form,"该调休人在您选中日期已有其它工单调休记录，请重新选择调休人。","error");
						}
						else
						{
							submit();
						}
					}
				});

				function submit()
				{
					var saveObj = el_form.umDataBind("serialize");
					saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.dutyPersonReplace.controller.DutyPersonReplaceController";
					saveObj.htmlFormKeyClassMethod = "startProcess";
					saveObj.formFile = "zbrybglc";

					var obj = new Object();
					obj.dutyModifyStep1Apply = saveObj;
					obj.curstep = "dutyModifyStep1Apply";
					obj.procDefID = "zbrybglc:1:125004";
					obj.proInsId = "";
					obj.businessKey = "";
					obj.type = "config_change_event";

					um_ajax_post({
						url : url,
						isLoad : "true",
						maskObj : "body",
						paramObj : {workflowinfo:obj},
						successCallBack : function(){
							g_dialog.operateAlert();
							window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
						}
					});
				}
			}
		},
		// -------------值班人员变更流程

		// 系统升级流程 ----------
		xtsjlc_step1_init : function (){
			var el_div = $("#workorder_div");
			var opt = el_div.data("opt");

			if(opt.type == "detail")
			{
				this.xtsjlc_step2_init();
			}
		},
		xtsjlc_step2_init : function(){
			var el_div = $("#workorder_div");
			var opt = el_div.data("opt");

			if(opt.type == "detail")
			{
				this.xtsjlc_step3_init();
			}
		},
		xtsjlc_step3_init : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step3]");

			select_init();
			function select_init()
			{
				var el_object_type = el_form.find("[data-id=objectType]");
				el_object_type.append('<option value="1">病毒库</option>');
				el_object_type.append('<option value="2">规则库</option>');
				el_object_type.append('<option value="3">引擎</option>');
				el_object_type.append('<option value="4">其他</option>');
				el_object_type.trigger("change");
			}
		},
		xtsjlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.systemUpgrade.controller.SystemUpgradeController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "xtsjlc";

				var obj = new Object();
				obj.systemUpdateStep1Apply = saveObj;
				obj.curstep = "systemUpdateStep1Apply";
				obj.procDefID = "xtsjlc:1:130004";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------系统升级流程

		// 综合申请流程 ----------
		zhsqlc_step1_init : function(){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var data = el_div.data("data");
			var opt = el_div.data("opt");
			console.log(opt);
			um_ajax_get({
				url : "MultiApplicationController/queryCodeList",
				isLoad : false,
				successCallBack : function(data1){
					g_formel.selectEl_render(el_form.find("[data-id=objectType]"),{
						data:data1.apptype_codelist,
						text:"codename",
						id:"codevalue",
						val:data.objectType
					});
				}
			});
			if(opt.type == "detail")
			{
				this.zhsqlc_step3_init();
			}
		},
		zhsqlc_step2_init : function(){
			var opt = el_div.data("opt");
			if(opt.type == "detail")
			{
				this.zhsqlc_step3_init();
			}
		},
		zhsqlc_step3_init : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step3]");
			var data = el_div.data("data");
			var opt = el_div.data("opt");
			var procInstanceId = el_div.data("procInstanceId");

			upload_attachments_init();
			function upload_attachments_init()
			{
				el_form.find("[id=upload_btn]").click(function(){
					var dialogParam = {
						init:init,
					};
					$.ajax({
						type: "GET",
						url: "tpl/workorder/upload_tpl.html",
						success :function(data)
						{
							if(opt.type == "detail")
							{
								dialogParam["width"] = "459px";
								dialogParam["title"] = "附件查看";
								dialogParam["isDetail"] = true;
								g_dialog.dialog($(data).find("[id=appendix_show_template]"),dialogParam);
							}
							else
							{
								dialogParam["width"] = "600px";
								dialogParam["title"] = "附件信息";
								dialogParam["saveclick"] = save_click;
								g_dialog.dialog($(data).find("[id=upload_template]"),dialogParam);
							}
						}
					});

					function init(aEl)
					{
						if(opt.type == "detail")
						{
							um_ajax_get({
								url : "GeneralController/queryAppendixInfo",
								paramObj : {procInstID : procInstanceId},
								isLoad : true,
								maskObj :"body",
								successCallBack : function(data){
									var appendixstore = data.appendixstore;
						 			for (var i = 0; i < appendixstore.length; i++) {
						 				var app_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+appendixstore[i].attachPath+'" data-flag="appendix">'
						 							+appendixstore[i].attachName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
						 				aEl.find("[id=appendixgroup]").append(app_div);
						 				event_init();
						 				function event_init()
						 				{
						 					aEl.find("[data-flag=appendix]").click(function(){
												var url = $(this).attr("id");
												window.location.href = url;
											});
						 				}
						 			}
								}
							});
						}
						else
						{
							aEl.find("[name=procInstID]").val(procInstanceId);
							um_ajax_get({
								url : "GeneralController/queryAppendixInfo",
								paramObj : {procInstID : procInstanceId},
								isLoad : true,
								maskObj :"body",
								successCallBack : function(data){
									aEl.umDataBind("render",data.maxstore[0]);
									aEl.find("[name=maxUploadSize]").val(data.maxstore[0].maxUpLoadFileSize);
									g_formel.appendix_render(aEl.find("[id=appendixgroup]") ,{
										data : data.appendixstore,
										key : "attachName",
										url : "attachPath",
										procInstID :procInstanceId
									});
								}
							});
						}	
					}

					function save_click(aEl)
					{
						g_formel.appendix_render(aEl.find("[id=appendixgroup]") ,{
							method : "getUploadStrArray"
						});

						var delAppendixIdStr = aEl.find("[id=appendixgroup]").data("delStrArray" ).join("|");
						aEl.find("[name=delAppendixIdStr]").val(delAppendixIdStr);

						var uploadStr = aEl.find("[id=appendixgroup]").data("uploadStrArray").join("|");
						aEl.find("[name=uploadStr]").val(uploadStr);

						um_ajax_file(aEl.find("form") ,{
							url : "GeneralController/updGeneralAppendixs",
							paramObj : {},
							isLoad : true,
							maskObj : "body",
							successCallBack:function (data){
								g_dialog.operateAlert("body");
								g_dialog.hide(aEl);
							}
						});
					}
				});
			}	
		},
		zhsqlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.multiapplication.controller.MultiApplicationController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "zhsqlc";

				var obj = new Object();
				obj.comprehensiveApplicationStep1Apply = saveObj;
				obj.curstep = "comprehensiveApplicationStep1Apply";
				obj.procDefID = "zhsqlc:1:120004";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				})
			}
		},
		// -------------综合申请流程

		// 配置变更事件处置流程 ----------
		pzbgsjczlc_step1_init : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");

			el_form.find("[data-id=objectType]").change(function(){
				var val = $(this).val();
				var newversionnum = el_form.find("[data-id=wf_step1_newversionnum]");
				if(val == "1")
				{
					newversionnum.removeAttr("disabled");	
				}
				else
				{
					newversionnum.attr("disabled","disabled");
					newversionnum.val("");
				}
			});
		},
		pzbgsjczlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.configChangeEvent.controller.ConfigChangeEventController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "pzbgsjczlc";

				var obj = new Object();
				obj.configModifyEventHandleStep1Apply = saveObj;
				obj.curstep = "configModifyEventHandleStep1Apply";
				obj.procDefID = "pzbgsjczlc:1:122504";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				})
			}
		},
		// -------------配置变更事件处置流程

		// 安全策略变更事件处置流程 ----------
		aqclbgczlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.configChangeEvent.controller.ConfigChangeEventController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "aqclbgczlc";

				var obj = new Object();
				obj.safeStrategyModifyHandleStep1Apply = saveObj;
				obj.curstep = "safeStrategyModifyHandleStep1Apply";
				obj.procDefID = "aqclbgczlc:1:127504";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------安全策略变更事件处置流程

		// 资产回收流程 ----------
		zchslc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.assetReclaim.controller.AssetReclaimController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "zchslc";

				var obj = new Object();
				obj.assetRecycleStep1Apply = saveObj;
				obj.curstep = "assetRecycleStep1Apply";
				obj.procDefID = "zchslc:1:267504";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "asset_admeasure";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------资产回收流程

		// 资产申请流程 ----------
		zcsqlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.objectType_name = el_form.find("[data-id=objectType] option:selected").text();
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.deviceApplication.controller.DeviceApplicationController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "zcsqlc";

				var obj = new Object();
				obj.assetApplyStep1Apply = saveObj;
				obj.curstep = "assetApplyStep1Apply";
				obj.procDefID = "zcsqlc:1:132504";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------资产申请流程
		// 资产入库流程 ----------
		zcrklc_step1_init : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var data = el_div.data("data")?el_div.data("data"):{};
			var assetStore = data.assetStore?data.assetStore:[];

			event_init();

			zcrklc_list();

			function event_init()
			{	
				el_form.find("[id=add_btn]").click(function(){
					edit_tpl_init();
				});		
			}

			function zcrklc_list()
			{
				g_grid.render(el_div.find("[id=asset_list_div]"),{
					header:[	
							  {text:'',name:"t",width:3,hideSearch:"hide"},
							  {text:'资产名称',name:"assetName",align:"left",width:20},
							  {text:'资产编号',name:"assetCode",align:"left",width:19},
							  {text:'资产类型',name:"assetTypeName",align:"left",width:19},
							  {text:'生产厂商',name:"supplierName",align:"left",width:20},
							  {text:'操作系统类型',name:"osTypeName",align:"left",width:19}
							],
					oper:[
							{icon:"rh-icon rh-edit" ,text:"修改" ,aclick:edit_tpl_init},
							{icon:"rh-icon rh-delete" ,text:"删除" ,aclick:asset_del}
						 ],
					data:assetStore,
					operWidth:"100px",
					hideSearch:true,
					isLoad:false,
					allowCheckBox : false,
					paginator : false
				});
			}

			function edit_tpl_init(rowData,trObj)
			{
				var title_msg = "资产添加";
				if (rowData)
				{
					title_msg = "资产修改";
				}
				$.ajax({
					type: "GET",
					url: "tpl/workorder/zcrklc_tpl.html",
					success :function(data)
					{
						g_dialog.dialog($(data).find("[id=asset_edit_template]"),{
							width:"450px",
							init:init,
							title:title_msg,
							saveclick:save_click
						});
					}
				});

				function init(el)
				{
					var assetTypeVal = rowData?rowData.assetTypeId:"";
					var osCodeVal = rowData?rowData.osType:"";
					var supplierVal = rowData?rowData.supplierId:"";
					g_formel.sec_biz_render({
												assetTypeEl : el.find("[data-id=assetTypeId]"),
												assetTypeVal : assetTypeVal
											});
					g_formel.code_list_render({
										   	   		key : "osCodeList,factoryManageList",
										   	   		osCodeEl : el.find("[data-id=osType]"),
										   	   		osCodeVal : osCodeVal,
										   	   		supplierEl : el.find("[data-id=supplierId]"),
										   	   		supplierVal : supplierVal
										   	   });
					if(rowData)
					{				
						el.umDataBind("render" ,rowData);
					}
				}

				function save_click(el ,saveObj)
				{
					if (g_validate.validate(el))
					{
						g_dialog.hide(el);

						var obj = new Object();
						obj = saveObj;
						obj.assetTypeName = el.find("[data-id=assetTypeId] input:eq(0)").val();
						obj.osTypeName = el.find("[data-id=osType] option:selected").text();
						obj.supplierName = el.find("[data-id=supplierId] option:selected").text();

						var buffer = [];
						buffer.push(obj);

						if(rowData)
						{
							g_grid.updateData(el_div.find("[id=asset_list_div]"),{
								trObj:trObj,data:obj
							});

							return false;
						}

						g_grid.addData(el_div.find("[id=asset_list_div]") ,buffer);
					}
				}
			}

			function asset_del(rowData,trObj)
			{
				trObj.remove();			
			}	
		},
		zcrklc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			var data = g_grid.getData(el_form.find("[id=asset_list_div]"));

			if (!g_validate.validate(el_form))
			{
				return false;
			} else if(data.length == 0){
				g_dialog.operateAlert(el_div,"请新增资产","error")
				return false
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.assetinstorage.controller.AssetInController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "zcrklc";
				saveObj.assetStore = [];
				for (var i = 0; i < data.length; i++) {
					saveObj.assetStore.push(
						data[i]
					);
				}

				var obj = new Object();
				obj.assetWarehousingStep1Apply = saveObj;
				obj.curstep = "assetWarehousingStep1Apply";
				obj.procDefID = "zcrklc:1:105004";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";
				obj.assetStore = saveObj.assetStore;

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------资产入库流程

		// 设备配置变更流程 ----------
		sbpzbglc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.deviceConfigChange.controller.DeviceConfigChangeController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "sbpzbglc";

				var obj = new Object();
				obj.deviceConfigModifyStep1Apply = saveObj;
				obj.curstep = "deviceConfigModifyStep1Apply";
				obj.procDefID = "sbpzbglc:1:107504";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------设备配置变更流程

		// 资产分配流程 ----------
		zcfplc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.assetAdmeasure.controller.AssetAdmeasureController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "zcfplc";

				var obj = new Object();
				obj.assetAssignStep1Apply = saveObj;
				obj.curstep = "assetAssignStep1Apply";
				obj.procDefID = "zcfplc:1:95004";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "asset_admeasure";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------资产分配流程

		// 设备巡检流程 ----------
		sbxjlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.devicePatrol.controller.DevicePatrolController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "sbxjlc";

				var obj = new Object();
				obj.devicePatrolStep1Apply = saveObj;
				obj.curstep = "devicePatrolStep1Apply";
				obj.procDefID = "sbxjlc:1:110004";
				obj.proInsId = "";
				obj.businessKey = "";
				obj.type = "config_change_event";

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
					}
				});
			}
		},
		// -------------设备巡检流程

		// 资产报废流程 ----------
		zcbflc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var edId = el_form.find("[data-id=wf_step1_assetname]").val();

				um_ajax_post({
					url : "AssetRepair/checkEdWorkFlowType",
					paramObj : {edId:edId},
					isLoad : false,
					successCallBack : function (data){
						if(data.str == "1")
						{
							var saveObj = el_form.umDataBind("serialize");
							saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.deviceScrap.controller.DeviceScrapController";
							saveObj.htmlFormKeyClassMethod = "startProcess";
							saveObj.formFile = "zcbflc";

							var obj = new Object();
							obj.assetDiscardStep1Apply = saveObj;
							obj.curstep = "assetDiscardStep1Apply";
							obj.procDefID = "zcbflc:1:100004";
							obj.proInsId = "";
							obj.businessKey = "";
							obj.type = "config_change_event";

							um_ajax_post({
								url : url,
								paramObj : {workflowinfo:obj},
								successCallBack : function(){
									g_dialog.operateAlert();
									window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
								}
							});
						}
						else
						{
							g_dialog.operateAlert("body",data.str ,"error");
						}
					}
				});
			}
		},
		// -------------资产报废流程

		// 资产待修流程 ----------
		zcdxlc_step1_init : function (){
			this.zcdxlc_step3_init();
		},
		zcdxlc_step3_init : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step3]");

			event_init();

			function event_init()
			{
				el_form.find("[data-id=wf_step3_servicetype]").change(function(){
					var tmp = $(this).val();
					var servicecompany = el_form.find("[data-id=wf_step3_servicecompany]");
					if (tmp == "2")
					{
						servicecompany.removeAttr("disabled");
						servicecompany.attr("validate","required");
					}	
					else
					{
						servicecompany.attr("disabled","disabled")
						servicecompany.removeAttr("validate");
						servicecompany.val("");
						g_validate.clear([servicecompany]);
					}
				});	
			}
				
			this.zcdxlc_step4_init();	
		},
		zcdxlc_step4_init : function (){
			var el_div = $("#workorder_div");
			var step = el_div.data("step");
			var data = el_div.data("data");
			var opt = el_div.data("opt");
			var procInstanceId = el_div.data("procInstanceId");

			if (!$("#workorder_div").data("hasInit"))
			{
				zcdxlc_list();
			}

			function zcdxlc_list()
			{
				var i=0;
				var gridParam = {
					header:[
								{text:'',name:"t",width:3,hideSearch:"hide"},
							    {text:'资产名称',name:"edName",align:'left'},
							    {text:'资产编号',name:"edId",align:'left'},
							    {text:'责任人',name:"responsible",align:'left'},
							    {text:'',name:"edStatus",align:'left',render:function (tdTxt,rowData){
							  		i++;
							  		if(step == "zcdxlc_step4" && opt.type != "detail")
							  		{
							  			var buffer = [];
								  		buffer.push('<input type="radio" name="edStatus'+i+'" value="1">');
								  		buffer.push('<span style="margin-left:3px;">已修好</span>');
								  		buffer.push('<input type="radio" name="edStatus'+i+'" value="0" checked style="margin-left:7px;">');
								  		buffer.push('<span style="margin-left:3px;">未修好</span>');
								  		return buffer.join("");
							  		}
							  		else 
							  		{
							  			if (rowData.edStatus == 0)
							  			{
							  				return "闲置";
							  			}
							  			else if (rowData.edStatus == 1)
							  			{
							  				return "使用中";
							  			}
							  			else if (rowData.edStatus == 2)
							  			{
							  				return "待维修";
							  			}
							  			else if (rowData.edStatus == 3)
							  			{
							  				return "维修";
							  			}
							  			else if (rowData.edStatus == 4)
							  			{
							  				return "送修";
							  			}
							  			else if (rowData.edStatus == 5)
							  			{
							  				return "外借";
							  			}
							  			else if (rowData.edStatus == 6)
							  			{
							  				return "分配";
							  			}
							  			else if (rowData.edStatus == 7)
							  			{
							  				return "待报废";
							  			}
							  			else if (rowData.edStatus == 8)
							  			{
							  				return "报废";
							  			}
							  			else if (rowData.edStatus == 9)
							  			{
							  				return "库房";
							  			}
							  		}							  		
							    }}
							],
					url : "AssetRepair/queryWorkFlowVsEdInfoList",
					paramObj : {procInstID:procInstanceId},
					isLoad : false,
					allowCheckBox : false,
					hideSearch : true
				};

				$("#workorder_div").data("hasInit" ,true);

				if (step != "zcdxlc_step4" && step != "zcdxlc_step5" && opt.type != "detail")
				{
					delete gridParam["url"];
					gridParam["data"] = [];
				}

				g_grid.render(el_div.find("#table_in_workorder"),gridParam);
			}
		},
		zcdxlc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{   
				var edId = el_form.find("[data-id=wf_step1_assetname]").val();

				um_ajax_post({
					url : "AssetRepair/checkEdWorkFlowType",
					paramObj : {edId:edId},
					isLoad : false,
					successCallBack : function (data){
						if(data.str == "1")
						{
							var saveObj = el_form.umDataBind("serialize");
							saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.assetRepair.controller.AssetRepair";
							saveObj.htmlFormKeyClassMethod = "startProcess";
							saveObj.formFile = "zcdxlc";

							var obj = new Object();
							obj.assetRepairedStep1Apply = saveObj;
							obj.curstep = "assetRepairedStep1Apply";
							obj.procDefID = "zcdxlc:1:322504";
							obj.proInsId = "";
							obj.businessKey = "";
							obj.type = "config_change_event";

							um_ajax_post({
								url : url,
								paramObj : {workflowinfo:obj},
								successCallBack : function(){
									g_dialog.operateAlert();
									window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
								}
							});
						}
						else
						{
							g_dialog.operateAlert("body",data.str ,"error");
						}
					}
				});
			}
		},
		// -------------资产待修流程

		// 在用资产调配流程 ----------
		zyzcdplc_step1_init : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var data = el_div.data("data");

			event_init();

			el_form.find("[name=operationSystem][value="+data.operationSystem+"]").click();

			function event_init()
			{
				el_form.find("[name=operationSystem]").click(function(){
					if($(this).val() == "1")
					{
						inputdrop.setDisable(el_form.find("[id=assetDst]"));
						el_form.find("[id=assetDst]").children().val("");
						el_form.find("[id=assetDst]").find("ul").html("");
					}
					else
					{
						inputdrop.setEnable(el_form.find("[id=assetDst]"));
					}
				});	
			}
		},
		zyzcdplc_step1_submit : function (){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url = "workflow/createAndStartProcInst";
			var check_url = "AssetRepair/checkEdWorkFlowType";
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var assetId = el_form.find("[data-id=wf_step1_assetname]").val();
				var aimassetId = el_form.find("[data-id=assetDst]").val();

				um_ajax_post({
					url : check_url,
					paramObj : {edId:assetId},
					isLoad : false,
					successCallBack : function (data){
						if(data.str == "1")
						{
							if(aimassetId)
							{
								um_ajax_post({
									url : check_url,
									paramObj : {edId:aimassetId},
									isLoad : false,
									successCallBack : function (data1){
										if(data1.str == "1")
										{
											submit();
										}
										else
										{
											g_dialog.operateAlert(el_div,"目的资产："+data1.str ,"error");
										}
									}
								});
							}
							else
							{
								submit();
							}	
						}
						else
						{
							g_dialog.operateAlert(el_div,"调配资产："+data.str ,"error");
						}
					}
				});

				function submit()
				{
					var saveObj = el_form.umDataBind("serialize");
					saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.assetDeploy.controller.AssetDeployController";
					saveObj.htmlFormKeyClassMethod = "startProcess";
					saveObj.formFile = "zyzcdplc";

					var obj = new Object();
					obj.usedAssetAssignStep1Apply = saveObj;
					obj.curstep = "usedAssetAssignStep1Apply";
					obj.procDefID = "zyzcdplc:1:342504";
					obj.proInsId = "";
					obj.businessKey = "";
					obj.type = "config_change_event";

					um_ajax_post({
						url : url,
						paramObj : {workflowinfo:obj},
						successCallBack : function(){
							g_dialog.operateAlert();
							window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
						}
					});
				}
			}
		},
		// -------------在用资产调配流程

		//SOC事件处置流程----------
		socsjczlc_step1_init : function(){
			var el_div = $("#workorder_div");
			if ($("#workorder_div").data("el"))
			{
				el_div = $("#workorder_div").data("el");
			}
			var el_form = el_div.find("[id=step1]");
			var data = el_div.data("data")?el_div.data("data"):{};
			var eventStore = data.eventStore?data.eventStore:[];
			var noticeStore = data.noticeStore?data.noticeStore:[];
			var step = el_div.data("step");
			var procInstanceId = el_div.data("procInstanceId");
			var workItemID = el_div.data("workItemID");
			var tplName = el_div.data("tplName");
			var opt = el_div.data("opt");
			var self = this;

			form_init();

			event_init();

			fault_event_list();

			notice_list();

			function form_init()
			{
				if(step)
				{
					el_form.find("[data-id=procInstanceId]").val(procInstanceId);
					g_formel.sec_biz_render({
												secEl:el_form.find("[id=securityDomianId]"),
												secVal:data.securityDomianId
											});

					g_formel.sec_biz_render({
												bizEl:el_form.find("[id=bussinessDomianId]"),
												bizVal:data.bussinessDomianId
											});
					var eventType = data.eventType;
					if (eventType == "1") 
					{
						var CheckboxGroupArray = data.CheckboxGroup.split(",");
						for (var i = 0; i < CheckboxGroupArray.length; i++) {
							el_form.find("[name=CheckboxGroup][value="+CheckboxGroupArray[i]+"]").prop("checked","checked");
						}
					}
					else
					{
						el_form.find("[id=sec_alarm_div]").remove();
					}
				}
			    else
			    {	
			    	var urlParamObj = index_query_param_get();
					var eventType = urlParamObj.eventType;
					if (eventType != "1") 
					{
						el_form.find("[id=sec_alarm_div]").remove();
					}

					el_form.find("[data-id=eventStr]").val(urlParamObj.eventStr);
					el_form.find("[data-id=eventType]").val(eventType);

					var time = g_moment().format('ddd MM DD YYYY HH:mm:ss');
					var int = parseInt(500*Math.random());

					var eventtype;
					(eventType == "1") && (eventtype = "aggrEvent");
					(eventType == "2") && (eventtype = "faultEvent");
					(eventType == "3") && (eventtype = "perfEvent");
					(eventType == "13") && (eventtype = "deployEvent");
					(eventType == "14") && (eventtype = "vulTaskEvent");
					(eventType == "5") && (eventtype = "ralationEvent");

					var processInstanceID = eventtype+"_"+time+"_"+int;
					el_form.find("[data-id=procInstanceId]").val(processInstanceID);

					um_ajax_get({
						url : "EventController/queryDomainByEvent",
						paramObj : {queryStore:{eventIdStr:urlParamObj.eventStr,eventType:eventType}},
						isLoad : false,
						successCallBack : function(data1){
							
							g_formel.sec_biz_render({
														secEl:el_form.find("[id=securityDomianId]"),
														secVal:data1.store.sdStr
													});
							g_formel.sec_biz_render({
														bizEl:el_form.find("[id=bussinessDomianId]"),
														bizVal:data1.store.bdStr
													});
							console.log(data1)
							um_ajax_get({
								url : "EventController/queryAssetObject",
								paramObj : {assetlistStore:{edIds:data1.store.edStr}},
								isLoad : false,
								successCallBack : function(data2){
									for(i = 0;i < data2.assetlistStore.length;i ++)
									{
										data2.assetlistStore[i].text = 
													data2.assetlistStore[i].codename;
										data2.assetlistStore[i].id = 
													data2.assetlistStore[i].codevalue;
									}

									inputdrop.addDataSelect(el_form.find("[id=wf_step1_assetname]") ,{
											data : data2.assetlistStore,
									});
								}
							});
						}
					});
				}
			}

			function event_init()
			{
				el_form.find("[id=case_btn]").click(function(){
					related_case();
				});

				el_form.find("[id=notice_btn]").click(function(){
					self.notice_user_dialog();
				});

				el_form.find("[id=email_associate_btn]").click(function(){
					email_associate();
				});
			}

			function related_case()
			{
				var procInstID = el_form.find("[data-id=procInstanceId]").val();
				var eventSTR = el_form.find("[data-id=eventStr]").val().split(",").join("_");
				var eventType = el_form.find("[data-id=eventType]").val();

				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=email_template]"), {
							width: "700px",
							top : "8%",
							init: init,
							title : "相关案例查看",
							isDetail : true
						});	
					}
				});

				function init(aEl)
				{
					var obj = new Object();
					obj.procInstID = procInstID;
					obj.eventStr = eventSTR;
					obj.eventType = eventType;
					obj.casestore = {};
					step && (obj.eventStr = "null");

					g_grid.render(aEl.find("[id=table_in_query_email]"),{
						header : [		
										{text:'',name:"t",width:3,hideSearch:"hide"},
									    {text:'案例名称',name:"title",align:"left"},
									    {text:'生成时间',name:"createDate",align:"left"},
									    {text:'案例描述',name:"desc",align:"left"}
								  ],
						url : "WorkOrderMonitorController/getCaseList",
						paramObj : obj,
						dbClick : case_detail_init,
						dbIndex:1,
						allowCheckBox : false,
						isLoad : true,
						maskObj : "body",
						hideSearch : true
					});

					function case_detail_init(rowData)
					{
						$.ajax({
							type: "GET",
							url: "js/plugin/workorder/workorder.html",
							success: function(data) {
								g_dialog.dialog($(data).find("[id=case_detail_template]"), {
									width: "450px",
									top : "6%",
									init: init,
									title : "案例详细信息",
									isDetail : true
								});	
							}
						});	

						function init(bEl)
						{
							um_ajax_get({
								url : "CaseAnalyse/queryDetailInfo",
								paramObj : {caseId : rowData.caId},
								isLoad : true,
								maskObj : "body",
								successCallBack : function(data){
									bEl.umDataBind("render",data[0]);
									var eventVOList = data[0].eventVOList;
						 			for (var i = 0; i < eventVOList.length; i++) {
						 				var list_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+eventVOList[i].eventId+'" data-flag="event">'
						 							+eventVOList[i].eventName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
						 				bEl.find("[id=eventVOList]").append(list_div);
						 			}
						 			var appendixList = data[0].appendixList;
						 			for (var i = 0; i < appendixList.length; i++) {
						 				var app_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+appendixList[i].appendixPath+'" data-flag="appendix">'
						 							+appendixList[i].appendixName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
						 				bEl.find("[id=appendixList]").append(app_div);
						 			}
						 			var work_div = '<a href="javascript:void(0);" id="'+data[0].procId+'" data-flag="work">'
						 							+data[0].procName
						 							+'</a>'
						 			bEl.find("[id=procName]").append(work_div);
						 			event_init();
						 			function event_init()
						 			{
						 				require(['/js/plugin/event/event.js'] ,function (pevent){
						 					bEl.find("[data-flag=event]").click(function(){				 					
												var eventId = $(this).attr("id");
												var obj = new Object();
												if(eventType == "1") 
												{
													obj.eventId = eventId;
													pevent.secEventDetail(obj);
												}
												else if(eventType == "2") 
												{
													obj.faultNO = eventId;
													pevent.faultEventDetail(obj);
												}
												else if(eventType == "3") 
												{
													obj.performanceNo = eventId;
													pevent.performEventDetail(obj);
												}
												else if(eventType == "13") 
												{
													obj.deploy_NO = eventId;
													pevent.deployEventDetail(obj);
												}
												else if(eventType == "14") 
												{
													obj.ed_id = eventId;
													pevent.vulnerEventDetail(obj);
												}
												else if(eventType == "5") 
												{
													obj.rcEventId = eventId;
													pevent.relationEventDetail(obj);
												}
											});
										});

										bEl.find("[data-flag=appendix]").click(function(){
											var url = $(this).attr("id");
											window.location.href = url;
										});

										bEl.find("[data-flag=work]").click(function(){
											var obj = new Object();
											obj.processInstanceID = $(this).attr("id");
											obj.id = "socsjczlc_step1";
											(eventType == "1") && (obj.tplName = "安全事件");
											(eventType == "2") && (obj.tplName = "故障事件");
											(eventType == "3") && (obj.tplName = "性能事件");
											(eventType == "13") && (obj.tplName = "配置事件");
											(eventType == "14") && (obj.tplName = "脆弱性事件");
											(eventType == "5") && (obj.tplName = "智能关联事件");
											var style = "see";
											self.done_workorder(obj,style);
										});
						 			}									
								}
							});
						}
					}
				}
			}

			function fault_event_list()
			{
				var gridParam = {
					allowCheckBox : false,
					isLoad : false,
					hideSearch : true,
					paginator:false,
					dbClick : fault_detail_init,
					dbIndex:1
				};

				var eventType;
				var eventSTR;

				if(tplName)
				{
					(tplName == "安全事件") && (eventType = "1");
					(tplName == "故障事件") && (eventType = "2");
					(tplName == "性能事件") && (eventType = "3");
					(tplName == "脆弱性事件") && (eventType = "14");
					(tplName == "配置事件") && (eventType = "13");
					(tplName == "智能关联事件") && (eventType = "5");
				}
				else
				{
					eventSTR = el_form.find("[data-id=eventStr]").val().split(",").join("_");
					eventType = el_form.find("[data-id=eventType]").val();
				}
				if(eventType == "1")
				{
					gridParam["header"] = [
						{text:'',name:"t",width:3,hideSearch:"hide"},
						{text:'事件名称',name:"eventName",align:"left"},
					    {text:'类型',name:"eventName",align:"left"},
					    {text:'等级',name:"levelId",align:"left",render:function (text){
						  	var msg;
						  	if (text == 0) msg = "很高";
						  	else if(text == 1) msg = "高";
						  	else if(text == 2)  msg = "中";
						  	else if(text == 3) msg = "低";
						  	else if(text == 4) msg = "很低";
						  	return msg;
					    }},
					    {text:'源IP',name:"srcIpv",align:"left"},
					    {text:'目的IP',name:"dstIpv",align:"left"},
					    {text:'时间',name:"atDate",align:"left"},
					    {text:'发生源设备IP',name:"fromIpv",align:"left"}
					];
					grid_render();
				}
				else if(eventType == "2")
				{
					gridParam["header"] = [
						{text:'',name:"t",width:3,hideSearch:"hide"},
						{text:'事件名称',name:"faultName",align:"left"},
					    {text:'事件类型',name:"className",align:"left"},
					    {text:'设备名称',name:"edName",align:"left"},
					    {text:'发生时间',name:"enterDate",align:"left"},
					    {text:'恢复时间',name:"updateDate",align:"left"}
					];
					grid_render();
				}
				else if(eventType == "3")
				{
					gridParam["header"] = [
						{text:'',name:"t",width:3,hideSearch:"hide"},
						{text:'事件名称',name:"perfName",align:"left"},
					    {text:'事件类型',name:"className",align:"left"},
					    {text:'设备名称',name:"edName",align:"left"},
					    {text:'发生时间',name:"enterDate",align:"left"},
					    {text:'恢复时间',name:"updateDate",align:"left"}
					];
					grid_render();
				}
				else if(eventType == "13")
				{
					gridParam["header"] = [
						{text:'',name:"t",width:3,hideSearch:"hide"},
						{text:'事件名称',name:'depl_NAME',align:"left"},
						{text:'资产名称',name:'ed_ID',align:"left"},
						{text:'监控器名称',name:'monitor_ID',align:"left"},
						{text:'发生时间',name:'enter_DATE',align:"left"},
						{text:'数量',name:'depl_COUNT',align:"left",width:15}
					];
					grid_render();
				}
				else if(eventType == "14")
				{
					gridParam["header"] = [
						{text:'',name:"t",width:3,hideSearch:"hide"},
						{text:'资产名称',name:'ed_name',align:"left"},
						{text:'全部漏洞数量',name:'totalVulNum',align:"left"}
					];
					grid_render();
				}
				else if(eventType == "5")
				{
					gridParam["header"] = [
						{text:'',name:"t",width:3,hideSearch:"hide"},
						{text:'事件名称',name:'eventName',align:"left"},
						{text:'事件等级',name:'levelId',align:"left",render:function (text){
						  	var msg;
						  	if (text == 0) msg = "很高";
						  	else if(text == 1) msg = "高";
						  	else if(text == 2)  msg = "中";
						  	else if(text == 3) msg = "低";
						  	else if(text == 4) msg = "很低";
						  	return msg;
					    }},
						{text:'发生时间',name:'eventDate',align:"left"}
					];
					grid_render();
				}

				function grid_render()
				{
					if(step)
					{
						gridParam["data"] = eventStore;
						g_grid.render(el_form.find("#case_table_div"),gridParam);
					}
					else
					{
						gridParam["url"] = "EventControllerService/queryWorkorderEventList";
						gridParam["paramObj"] = {eventStore:{eventStr:eventSTR,eventType:eventType,procInstID:""}};
						g_grid.render(el_form.find("#case_table_div"),gridParam);
					}
				}
				
				function fault_detail_init(rowData)
				{
					var type = eventType;
					require(['/js/plugin/event/event.js'] ,function (pevent){
						(eventType == 1) && pevent.secEventDetail(rowData);
						(eventType == 2) && pevent.faultEventDetail(rowData);
						(eventType == 3) && pevent.performEventDetail(rowData);
						(eventType == 13) && pevent.deployEventDetail(rowData);
						(eventType == 14) && pevent.vulnerEventDetail(rowData,type);
						(eventType == 5) && pevent.relationEventDetail(rowData);
					});					
				}
			}

			function notice_list()
			{
				var procInstID = el_form.find("[data-id=procInstanceId]").val();
				var gridParam = {
					header : [
							  {text:'',name:"t",width:3,hideSearch:"hide"},
							  {text:'通知人',name:"userName",width:22,align:'left'},
							  {text:'被通知人',name:"mainDelivery",width:25,align:'left'},
							  {text:'通知方式',name:"notifyMethod",width:25,align:'left'},
							  {text:'通知时间',name:"notifyTime",width:25,align:'left'}
							  ],
					data : noticeStore,
					isLoad : false,
					allowCheckBox : false,
					hideSearch : true,
					paginator:false,
					dbClick : notice_detail_init,
					dbIndex:1
				};

				if( step && step.split("_")[1] == "step2" && (opt.type != "detail"))
				{
					el_div.find("#step1").find("[class=mask]").remove();
					el_form.find("#one").append('<div class="mask"></div>');
					el_form.find("#two").append('<div class="mask"></div>');
					// gridParam["oper"] = [
					// 						{icon:"rh-icon rh-edit" ,text:"修改" ,aclick:phone_update ,isShow:function (data){
					// 							return (data.notifyMethod == "电话");
					// 						}},
					// 					];
					// gridParam["operWidth"] = "80px";					
				}

				g_grid.render(el_form.find("#notice_table_div"),gridParam);

				function phone_update(rowData)
				{
					$.ajax({
						type: "GET",
						url: "js/plugin/workorder/workorder.html",
						success: function(data) {
							g_dialog.dialog($(data).find("[id=phone_update_template]"), {
								width: "600px",
								top : "6%",
								init: init,
								title : "电话通知修改",
								saveclick : save_click
							});
						}
					});

					function init(aEl)
					{
						var obj = new Object();
						obj.notifyID = rowData.notifyID;
						obj.procInstID = procInstID;
						obj.notifyType = "phone";
						obj.type = "modify";
						obj.pagetype = "edit";
						obj.notifiedUserID = rowData.notifiedUserID

						um_ajax_get({
							url : "NotifyController/queryNotifyDetail",
							paramObj : obj,
							isLoad : true,
							maskObj : "body",
							successCallBack:function (data){
								var mainDeliveryArray = [];
								var phoneArray = [];
								var mobileArray = [];

								for(var i = 0;i < data.notifydetailstore.length;i++)
								{
									var data1 = data.notifydetailstore[i];
									mainDeliveryArray.push(data1.mainDelivery);
									phoneArray.push(data1.phone);
									mobileArray.push(data1.mobile);	
								}
								var mainDelivery = mainDeliveryArray.join(";");
								var phone = phoneArray.join(";");
								var mobile = mobileArray.join(";");
								aEl.find("[data-id=mainDelivery]").text(mainDelivery);
								aEl.find("[data-id=phone]").text(phone);
								aEl.find("[data-id=mobile]").text(mobile);
								aEl.find("[data-id=userName]").text(data.notifydetailstore[0].userName);
								aEl.find("[data-id=notifyTime]").text(data.notifydetailstore[0].notifyTime);
								aEl.find("[data-id=notifyContent]").text(data.notifydetailstore[0].notifyContent == null ? "" : data.notifydetailstore[0].notifyContent);
							}
						});	
					}

					function save_click(aEl,saveObj)
					{
						var obj = new Object();
						obj.notifyID = rowData.notifyID;
						obj.processInstanceID = procInstID;
						obj.notifyContent = saveObj.notifyContent;

						um_ajax_post({
							url : "NotifyController/updRecord",
							paramObj : obj,
							successCallBack : function(data){
								g_dialog.operateAlert("body");
								g_dialog.hide(aEl);
								notice_list_refresh();
							}

						});
					}
				}
			}

			function notice_detail_init(rowData)
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				var title;
				var width = "700px";
				if(rowData.notifyMethod == "邮件")
				{
					title = "邮件通知详情";
					width = "600px";
				}
				else if(rowData.notifyMethod == "电话")
				{
					title = "电话通知详情";
				}
				else if(rowData.notifyMethod == "短信")
				{
					title = "短信通知详情";
				}

				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=notice_detail_template]"), {
							width: width,
							top : "6%",
							init: init,
							initAfter : initAfter,
							title : title,
							isDetail : true
						});
					}
				});

				function init(aEl)
				{
					if(rowData.notifyMethod == "邮件")
					{
						aEl.find("[id=phone_sms_div]").remove();
					}
					else
					{
						aEl.find("[id=email_div]").remove();
						g_grid.render(aEl.find("[id=table_in_notice_detail]"),{
							 header : [
							          {text:'',name:"t",width:3,hideSearch:"hide"},
									  {text:'通知人',name:"userName",width:"15",align:"left"},
									  {text:'被通知人',name:"mainDelivery",width:"15",align:"left"},
									  {text:'通知时间',name:"notifyTime",width:"30",align:"left"},
									  {text:'通知内容',name:"notifyContent",align:"left"}
									  ],
							 data : [],
							 allowCheckBox : false,
							 hideSearch : true
						});
					}
				}

				function initAfter(aEl)
				{
					um_ajax_post({
						url : "NotifyController/queryNotifyDetail",
						paramObj :{notifyID:rowData.notifyID,notifiedUserID:rowData.notifiedUserID, procInstID:procInstID,notifyType:rowData.notifyMethodEn},
						isLoad : false,
						isDetail : true,
						maskObj : "body",
						successCallBack : function(data){
							if(rowData.notifyMethod == "邮件")
							{
								um_ajax_get({
									url : "InBoxController/queryAppendixByEmail",
									paramObj : {emailCode : rowData.emailID},
									isLoad : true,
									maskObj : "body",
									successCallBack : function(data1){
										aEl.umDataBind("render" ,data.notifydetailstore[0]);
										aEl.find("[data-id=email]").html(data.notifydetailstore[0].email);
										aEl.find("[data-id=notifyContent]").html(data.notifydetailstore[0].notifyContent);
										for (var i = 0; i < data1.length; i++) {
							 				var app_div;
											app_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+data1[i].appendixPath+'" data-flag="appendix" data-id="'+data1[i].appendixCode+'">'
						 							+data1[i].appendixName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
							 				aEl.find("[id=appendixList]").append(app_div);
							 			}
										aEl.find("[data-flag=appendix]").click(function(){
											var url = $(this).attr("id");
											um_ajax_get({
												url : "InBoxController/queryAppendixExist",
												paramObj : {appendixCode : $(this).attr("data-id")},
												isLoad : true,
												maskObj : "body",
												successCallBack : function(data){
													window.location.href = url;
												}
											});
										});		
									}
								});
							}
							else 
							{
								g_grid.addData(aEl.find("[id=table_in_notice_detail]") ,data.notifydetailstore);	
							}		
						}
					});
				}
			}
			
			function email_associate()
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				$.ajax({
					type: "GET",
					url: "js/plugin/workorder/workorder.html",
					success: function(data) {
						g_dialog.dialog($(data).find("[id=email_template]"), {
							width: "700px",
							top : "8%",
							init: init,
							title : "往来邮件关联",
							btn_array:[
						 				   {id:"associate_btn",class:"dialog-associate",text:"关联",aClick:associate}
				 		   		      ],
							isDetail : true
						});

						function init(aEl)
						{
							g_grid.render(aEl.find("[id=table_in_query_email]"),{
								 header : [
								 				{text:'',name:"t",width:3,hideSearch:"hide"},
											    {text:'主题',name:"emailTitle",align:"left"},
											    {text:'发件人',name:"emailFrom",align:"left"},
											    {text:'日期',name:"emailDate",align:"left"},
											    {text:'',name:"radio" ,width:10,align:"left",render:function(txt ,rowData){
											   		return '<input type="radio" name="email_btn" value=""/><div style="display:none">'+rowData.emailCode+','+rowData.emailDate+','+rowData.emailFrom+','+rowData.emailTitle+','
											   		// +rowData.emailDescription
											   		+'</div>';
										        }}
										  ],
								 url:"InBoxController/preInboxList",
								 paramObj : {procInstID:procInstID},
								 allowCheckBox : false,
								 isLoad : true,
								 maskObj: "body",
								 hideSearch : true
							});		
						}

						function associate(aEl)
						{
							var tmp = aEl.find("[name=email_btn]:checked").next().html().split(",");
							var obj = new Object();
							obj.procInstID = procInstID;
							obj.emailID = tmp[0];
							obj.emailDate = tmp[1];
							obj.emailFrom = tmp[2];
							obj.emailTitle = tmp[3];
							obj.emailContent = tmp[4];
							um_ajax_post({
								url : "NotifyController/addEmailAssociateRecord",
								paramObj : obj,
								maskObj : aEl,
								successCallBack : function (data){
									g_dialog.operateAlert();
									g_dialog.hide(aEl);
									notice_list_refresh();
								}
							});
						}
					}
				});
			}

			function notice_list_refresh()
			{
				var procInstID = $("[data-id=procInstanceId]").val();
				um_ajax_post({
					url : "EventController/queryNotify",
					paramObj : {queryStore:{procInstID:procInstID}},
					isLoad : true,
					maskObj : "body",
					successCallBack:function (data){
						g_grid.removeData($(notice_table_div),{});
						g_grid.addData($(notice_table_div) ,data.queryStore);
					}
				});
			}

			if(opt.type == "detail")
			{
				this.socsjczlc_step2_init();
			}
		},
		socsjczlc_step2_init : function(){
			var el_div = $("#workorder_div");
			if ($("#workorder_div").data("el"))
			{
				el_div = $("#workorder_div").data("el");
			}
			var el_form = el_div.find("[id=step2]");
			var data = el_div.data("data");
			var procInstanceId = el_div.data("procInstanceId");
			var opt = el_div.data("opt");

			event_init();

			upload_attachments_init();

			function event_init()
			{
				el_form.find("[id=aprresult]").click(function(){
					if($(this).is(":checked"))
					{
						el_form.find("[data-id=wf_step2_aprresult]").val("0");
					}
					else
					{
						el_form.find("[data-id=wf_step2_aprresult]").val("1");
					}
				});
			}

			function upload_attachments_init()
			{
				el_form.find("[id=upload_btn]").click(function(){

					var dialogParam = {
						init:init,
					};
					$.ajax({
						type: "GET",
						url: "tpl/workorder/upload_tpl.html",
						success :function(data)
						{
							if(opt.type == "detail")
							{
								dialogParam["width"] = "459px";
								dialogParam["title"] = "附件查看";
								dialogParam["isDetail"] = true;
								g_dialog.dialog($(data).find("[id=appendix_show_template]"),dialogParam);
							}
							else
							{
								dialogParam["width"] = "600px";
								dialogParam["title"] = "附件信息";
								dialogParam["saveclick"] = save_click;
								g_dialog.dialog($(data).find("[id=upload_template]"),dialogParam);
							}
						}
					});

					function init(aEl)
					{
						var procInstanceId = el_div.find("[data-id=procInstanceId]").val();
						if(opt.type == "detail")
						{
							um_ajax_get({
								url : "GeneralController/queryAppendixInfo",
								paramObj : {procInstID : procInstanceId},
								isLoad : true,
								maskObj :"body",
								successCallBack : function(data){
									var appendixstore = data.appendixstore;
						 			for (var i = 0; i < appendixstore.length; i++) {
						 				var app_div = '<div class="form-group">'
						 							+'<label class="col-lg-12 control-label tl">'
						 							+'<a href="javascript:void(0);" id="'+appendixstore[i].attachPath+'" data-flag="appendix">'
						 							+appendixstore[i].attachName
						 							+'</a>'
						 							+'</label>'
						 							+'</div>';
						 				aEl.find("[id=appendixgroup]").append(app_div);
						 				event_init();
						 				function event_init()
						 				{
						 					aEl.find("[data-flag=appendix]").click(function(){
												var url = $(this).attr("id");
												window.location.href = url;
											});
						 				}
						 			}
								}
							});
						}
						else
						{
							aEl.find("[name=procInstID]").val(procInstanceId);
							um_ajax_get({
								url : "GeneralController/queryAppendixInfo",
								paramObj : {procInstID : procInstanceId},
								isLoad : true,
								maskObj :"body",
								successCallBack : function(data){
									aEl.umDataBind("render",data.maxstore[0]);
									aEl.find("[name=maxUploadSize]").val(data.maxstore[0].maxUpLoadFileSize);
									g_formel.appendix_render(aEl.find("[id=appendixgroup]") ,{
										data : data.appendixstore,
										key : "attachName",
										url : "attachPath",
										procInstID :procInstanceId
									});
								}
							});
						}
						
					}

					function save_click(aEl)
					{
						g_formel.appendix_render(aEl.find("[id=appendixgroup]") ,{
							method : "getUploadStrArray"
						});

						var delAppendixIdStr = aEl.find("[id=appendixgroup]").data("delStrArray" ).join("|");
						aEl.find("[name=delAppendixIdStr]").val(delAppendixIdStr);

						var uploadStr = aEl.find("[id=appendixgroup]").data("uploadStrArray").join("|");
						aEl.find("[name=uploadStr]").val(uploadStr);

						um_ajax_file(aEl.find("form") ,{
							url : "GeneralController/updGeneralAppendixs",
							paramObj : {},
							isLoad : true,
							maskObj : "body",
							successCallBack:function (data){
								g_dialog.operateAlert("body");
								g_dialog.hide(aEl);
							}
						});
					}
				});
			}
		},
		socsjczlc_step1_submit : function(){
			var el_div = $("#workorder_div");
			var el_form = el_div.find("[id=step1]");
			var url="workflow/createAndStartProcInst";

			var eventSTR = $("[data-id=eventStr]").val().split(",").join("_");
			var eventType = $("[data-id=eventType]").val();
			
			if (!g_validate.validate(el_form))
			{
				return false;
			}
			else
			{  
				var saveObj = el_form.umDataBind("serialize");
				saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.event.controller.EventController";
				saveObj.htmlFormKeyClassMethod = "startProcess";
				saveObj.formFile = "socsjczlc";
				saveObj.eventStore = [];
				var data1 = g_grid.getData(el_form.find("[id=case_table_div]"));
				for (var i = 0; i < data1.length; i++) {
					saveObj.eventStore.push(
						data1[i]
					);
				}
				saveObj.noticeStore = [];
				var data2 = g_grid.getData(el_form.find("[id=notice_table_div]"));
				for (var i = 0; i < data2.length; i++) {
					saveObj.noticeStore.push(
						data2[i]
					);
				}

				var obj = new Object();
				obj.devicePatrolStep1Apply = saveObj;
				obj.curstep = "devicePatrolStep1Apply";
				obj.procDefID = "socsjczlc:1:355004";
				obj.tmpProcInstId = el_form.find("[data-id=procInstanceId]").val();
				obj.businessKey = "";
				obj.type = "event";
				obj.eventStr = eventSTR;
				obj.eventType = eventType;

				um_ajax_post({
					url : url,
					paramObj : {workflowinfo:obj},
					successCallBack : function(){
						g_dialog.operateAlert();
						window.history.go(-1);
					}
				});
			}
		},
		//-------------SOC事件处置流程
		//应用系统运维问题登记流程
		yyxtywwtdjlc:{
			//获取表单非d禁用状态的信息
			getNoDisabledFormData:function (formDiv) {
                var self = formDiv;
                var prefix =  "";
                var attrPrefix = "data-id";
                var obj = new Object();
                var attrName = "";
                var parentObj=null;
                formDiv.find('input:not(:disabled)').each(function (){
                    attrName = $(this).attr(attrPrefix);
                    if (attrName)
                    {
                        parentObj=$(this).parent();
                        obj[prefix + attrName] = $(this).val().trim();
                        if(parentObj.hasClass("inputdrop")&&parentObj.hasClass("disabled")){
                        	delete obj[prefix + attrName];
						}
                        // radio时的操作
                        if ($(this).attr("type") == "radio")
                        {
                            obj[prefix + attrName] = $(self).find("[name="+attrName+"]:checked").val();
                        }
                        // checkbox时的操作
                        if ($(this).attr("type") == "checkbox")
                        {
                            var chk_value = []
                            $(self).find('input[name="'+attrName+'"]:checked').each(function(){
                                chk_value.push($(this).val());
                            });
                            obj[prefix + attrName] = chk_value.join(",");
                        }
                        // 需要加密的数据
                        if (!isNaN($(this).attr("encrypt")) && $(this).val())
                        {
                            obj[prefix + attrName] = Encrypt($(this).val().trim());
                        }
                    }
                });
                formDiv.find('textarea').each(function (){
                    if($(this).attr("disabled")==null||typeof($(this).attr("disabled"))=="undefined"){
                        attrName = $(this).attr(attrPrefix);
                        if (attrName)
                        {
                            obj[prefix + attrName] = $(this).val();
                        }
                    }
                });
                formDiv.find('select:not(:disabled)').each(function (){
                    attrName = $(this).attr(attrPrefix);
                    if (attrName)
                    {
                        if ($(this).val() == -1)
                        {
                            obj[prefix + attrName] = "";
                        }
                        else
                        {
                            obj[prefix + attrName] = $(this).val();
                        }

                    }

                });
                formDiv.find('label[data-id]').each(function (){
                    attrName = $(this).attr(attrPrefix);
                    if (attrName)
                    {
                        obj[prefix + attrName] = $(this).text();
                    }
                });
                return obj;
            },
			//初始化涉及系统
			init_sjxt:function (el,selectData,workorder) {
				var sjxt=el.find("#sjxt");
				sjxt.html("");
                um_ajax_post({
                    url: "involveSystem/systems",
                    paramObj: {userNotNull:true,systemPath:"18_"},
                    maskObj: el,
                    successCallBack: function (data) {
                        inputdrop.renderTree(sjxt,data,{enableChk:false,onlyLastChild:false,pId:"pId",label:"systemName",id:"systemId",systemUsers:"systemUsers"});
                        if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0){
                        	inputdrop.setDataTree(sjxt,selectData);                        	
                        }
                    }
                });
            },
            //初始化问题分类
			init_wtfl:function (el,selectData,workorder) {
				var wtfl=el.find("#wtfl");
				wtfl.html("");
                um_ajax_post({
                    url: "wQuestionClassify/treeClassifys",
                    paramObj: {isUse:"0"},
                    maskObj: el,
                    successCallBack: function (data) {
                        inputdrop.renderTree(wtfl,data,{enableChk:false,onlyLastChild:true,pId:"pId",label:"classifyName",id:"classifyId"});
                        if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0){
                        	inputdrop.setDataTree(wtfl,selectData);                        	
                        }
                    }
                });
            },
            //初始化处理方式
            init_clfs:function (el,selectData,workorder) {
            	var clfs=el.find("#clfs");
            	clfs.html("");
                um_ajax_post({
                    url: "wProcessMode/treeModes",
                    paramObj: {isUse:"0"},
                    maskObj: el,
                    successCallBack: function (data) {
                        inputdrop.renderTree(clfs,data,{enableChk:false,onlyLastChild:true,pId:"pId",label:"modeName",id:"modeId"});
                        if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0)
                        	inputdrop.setDataTree(clfs,selectData);
                    }
                });
            },
			//初始化申请日期
            init_shenQingDate:function(el,workorder){
            	var shenQingDate=$("#workorder_div").find("[data-id=shenQingDate]");//初始化申请日期
            	shenQingDate.val(g_moment().format("YYYY-MM-DD HH:mm:ss"));
				timepicker.time(shenQingDate,{position:"absolute",type:"minute"});
            },
			//初始化运维人员
            init_ywry:function(el,selectData,workorder){
            	var ywry=el.find("#ywry");
            	var userIds = index_user_info.id;
            	if(selectData!=null&&selectData!="undefined"){
            		userIds = selectData;
            	}
                um_ajax_post({
                    url: "involveSystem/selectUserByIds",
                    paramObj: {userIds:userIds},
                    maskObj: el,
                    successCallBack: function (data) {
                        ywry.html("");
                		inputdrop.renderTree(ywry,data,{enableChk:false,onlyLastChild:true,pId:"pId",label:"userName",id:"userId"});
                		if(data!=null&&data.length==1){
                			inputdrop.setDataTree(ywry,data[0].userId);
                		}
                    }
                });
            },
            //初始化预计解决日期
            init_yjjjrq:function(el,selectData,workorder){
                var yjjjrq=$("#workorder_div").find("[data-id=yjjjrq]");//初始化预计解决日期
				if(!yjjjrq){
                    timepicker.time(yjjjrq,{position:"absolute",type:"ymd"});
				}
                if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0)
                    yjjjrq.val(selectData);
            },
            //初始化实际完成日期
            init_sjwcrq:function(el,selectData,workorder){
                var sjwcrq=$("#workorder_div").find("[data-id=sjwcrq]");//初始化实际完成日期
                if(!sjwcrq){
                    timepicker.time(sjwcrq,{position:"absolute",type:"ymd"});
                }
                if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0)
                    sjwcrq.val(selectData);
            },
			//初始化用户和部门
			init_user_group:function (el,departData,userData,workorder) {
                var departId=el.find("#departId");
                var applyUser=el.find("#applyUser");
                departId.html("");
                um_ajax_post({
                    url: "dailyOperation/selectDeptAUsers",
                    paramObj: {roleType:"3"},
                    maskObj: el,
                    successCallBack: function (data) {
                        inputdrop.renderTree(departId,data,{
                        	enableChk:false,onlyLastChild:false,pId:"pId",label:"groupName",id:"groupId",
							//树选择事件
                            treeClick:function (event, treeId, treeNode) {
                                var tempId=treeNode.id;
                                loadUser(treeNode.groupUsers);
							}});
                        var tempGroupUsers=null;
                        for(var i=0;i<data.length;i++){
                            //设置默认值
                            tempGroupUsers=data[i].groupUsers;
                            if(departData==null&&userData==null){
                                try{
                                    for(var j=0;j<tempGroupUsers.length;j++){
                                    	if(tempGroupUsers[j].codevalue==index_user_info.id){//如果用户属于这个组
											departData=data[i].groupId;
                                            userData=index_user_info.id;
										}
                                    }
                                }catch(e){}
							}
                        }
                        if(departData!=null&&typeof(departData)!="undefined"&&departData.length>0){
                        	try{
                                inputdrop.setDataTree(departId,departData);
							}catch(e){}
                            for(var i=0;i<data.length;i++){
                            	if(departData==data[i].groupId){
                            		loadUser(data[i].groupUsers);
                            		if(userData!=null&&typeof(userData)!="undefined"&&userData.length>0){
                                        tempGroupUsers=data[i].groupUsers;
										try{
                                            inputdrop.setDataTree(applyUser,userData);
										}catch(e){}
									}
								}
							}
                        }
                    }
                });
                //加载用户
                function loadUser(data){
                    applyUser.html("");
					inputdrop.renderTree(applyUser,data,{enableChk:false,label:"codename",id:"codevalue"});
				}
            },
			// 初始化流程附件上传
            init_attachment:function(el,optType,procInstanceId,rowData){
                var workFlowFile_div=el;
                var form_div=workFlowFile_div.find("#query_workFlowFile");
                var fjlbDiv = el.find("#fjlb");
                fileDomInit(el.find("[id=tjfj]"));
                if(procInstanceId!=null&&typeof (procInstanceId)!="undefined"&&typeof (procInstanceId)!=""){
                    upload_attachments_init(false);
				}
				// 查询已经下载好的文件
                function upload_attachments_init(reload){
                    um_ajax_get({
                        url : "WorkFlowFile/queryWorkFlowFile",
                        paramObj : {procInstID : procInstanceId},
                        isLoad : true,
                        maskObj :"body",
                        successCallBack : function(data){
                            var appendixstore = data.appendixstore;
                            var appendix_add_btn = el.find("[id=appendix_add_btn]");
                            if(appendixstore!=null&&typeof (appendixstore)!="undefined"&&appendixstore.length>0){
                                showFileTable(appendixstore,reload);
                                if(!reload)
                                	fjlbDiv.removeClass("hide");
							}else{
                                if(rowData&&rowData.meLiActivitiIsEndData){
                                    workFlowFile_div.hide();
                                }
								fjlbDiv.addClass("hide");
							}
                        }
                    });
				}
				// 渲染上传附件
				function fileDomInit(el){
                    // 渲染附件按钮
                    el.append('<div id="appendix_add_btn"><i class="icon-plus"></i></div>');
                    // 渲染附件上传
                    el.append('<div id="appendix_upload_div"></div>');
                    var appendix_add_btn = el.find("[id=appendix_add_btn]");
                    var el_appendix_upload_div = el.find("[id=appendix_upload_div]");
                    // 新增一条附件上传的元素
                    appendix_add_btn.click(function (){
                        var id = new Date().getTime();
                        var buffer = [];
                        buffer.push('<div class="form-group" id="'+id+'">');
                        buffer.push('<div class="col-lg-10"><div data-type="ptMap" id="'+id+'pt" name="'+id+'" class="upload"></div></div>');
                        buffer.push('<div class="col-lg-2"><i class="icon-trash" style="line-height:36px;font-size:14px"></i></div>');
                        buffer.push('</div>');
                        el_appendix_upload_div.append(buffer.join(""));
                        var tisEl = el_appendix_upload_div.find("[id="+id+"]");
                        index_create_upload_el(tisEl.find("[data-type=ptMap]"));
                        tisEl.find("[class=icon-trash]").click(function (){
                            tisEl.remove();
                        });
                    });

				}
                //展示附件表格
				function showFileTable(appendixstore,reload){
                    var tempConfig={
                        header:[
                            {align:"center",text:"附件名称",name:"fileName",render:function (text,data) {
                                return "<a href=\"javascript:void(0);\" onclick=\"window.open('"+index_web_app+"WorkFlowFile/download?fileId="+data.fileId+"');\" data-placement=\"right\" data-toggle=\"tooltip\" title=\"点击下载\">"+data.fileName+"</a>";
                            }},
                            {align:"center",text:"附件大小",name:"fileSize"},
                            {align:"center",text:"上传用户",name:"uploadUserName"},
                            {align:"center",text:"上传时间",name:"uploadTime"}
                        ],
                        paginator : false,
                        allowCheckBox:false,
                        data : [],
                        hasBorder : true,
                        hideSearch :true,
						oper: [
							{icon:"rh-icon rh-delete" ,text:"删除" ,aclick:todo_del_handle,isShow:function(data){
								return data.uploadUserId == index_user_info.id;
							}}
						],
						operWidth : "30px"
                    };
                    if(!reload)
                    	g_grid.render(fjlbDiv,tempConfig);
                    g_grid.removeData(fjlbDiv,true);
                    if(appendixstore.length>0){
                        fjlbDiv.oneTime(1000,function(){
                            g_grid.addData(fjlbDiv,appendixstore);
                            fjlbDiv.find("[data-toggle='tooltip']").tooltip();
                            g_grid.resize(fjlbDiv);
                        });
                    }
				}
				//刪除流程附件
				function todo_del_handle(rowData){
					if(rowData.uploadUserId != index_user_info.id){
                        g_dialog.operateAlert(null ,"没有权限删除别人上传的附件" ,"error");
					}
                    g_dialog.operateConfirm("确认删除附件吗？" ,{
                        saveclick:function(){
                            um_ajax_post({
                                url:"WorkFlowFile/updWorkFlowFile",
								paramObj:{fileId:rowData.fileId,delAppendixIdStr:"-1"},
                                successCallBack:function(data){
                                    g_dialog.operateAlert(null ,"删除成功！");
                                    upload_attachments_init(true);
                                }
                            });
                        }
                    });
				}
            },
			//流程附件提交
			file_submit:function(procInstID,dialogEl){
                var el = null;
                if(dialogEl)
                	el=dialogEl.find("#query_workFlowFile");
                else
                    el = $("#query_workFlowFile");
                var array = [];
                el.find("[data-id=up_name]").each(function (){
                    array.push($(this).val());
                });
				um_ajax_file(el ,{
					url : "WorkFlowFile/updWorkFlowFile",
					paramObj : {uploadUserId:index_user_info.id,uploadStr:array,procInstID:procInstID},
					isLoad : true,
					maskObj : "body",
					successCallBack:function (data){
						g_dialog.operateAlert("body");
						g_dialog.hide(el);
					}
				});
			},
			//开始执行初始化
            step_init:function (el,rowData,workorder,obj) {
                workorder.yyxtywwtdjlc.init_attachment(el.parent().find("#workFlowFile"),"",rowData.processInstanceID,rowData);
            	var id=rowData.actTmpId;
                var func_name=id.split("_")[1];
                var temp_func=func_name+"_init";//初始化
                var container_div=el.find("#workorder_div");
                var form_div=container_div.find("#query_form");
                var hidden_steps=el.find("#hidden_steps");
                $("[data-id=shenQingDate]").attr("readonly","readonly");
                try{
                	if(!rowData.meLiActivitiIsEndData)
                        eval(temp_func)();//初始化
					else
						endEvent_init();//调用查看详细
                }catch(e){}
                //第一步初始化（申请）
                function step1_init(){
                    $("[data-id=shenQingDate]").removeAttr("readonly");
                	workorder.yyxtywwtdjlc.init_sjxt(el,null,workorder);//初始化涉及系统
                	workorder.yyxtywwtdjlc.init_user_group(el,null,null,workorder);//初始化用户和组选择
                	workorder.yyxtywwtdjlc.init_shenQingDate(el,workorder);//初始化申请日期
                }
                //运维执行人-问题处理中初始化
                function yunweiDeal_init(){
                    form_div.append(hidden_steps.find("#step2"));
                	var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");                	
                    completeBtn.unbind("click");
                    form_div.find("[data-id=sxms]").attr("disabled",true);
                    form_div.find("div.inputdrop").addClass("disabled");
                    form_div.find("#ywry").addClass("disabled");
                    form_div.find("[data-id=shyj]").addClass("disabled");
                    form_div.find("#clfs").removeClass("disabled");
                    form_div.find("#wtfl").removeClass("disabled");
                    form_div.find("label.i-checks").find("[name=ldsh]").parent("label").addClass("disabled");
                    form_div.find("label.i-checks").find("[name=wtdj]").eq(0).attr("checked",true);
                    var step2=form_div.find("#step2");
                    var step1=form_div.find("#step1");
                    //点击完成后
                    completeBtn.click(function () {
                    	var required = form_div.find("#wtfl,#clfs").parent().prev("label").attr('class');
                    	if(required.indexOf("required")<0){
                    		form_div.find("#wtfl,#clfs").parent().prev("label").addClass("required");
                            form_div.find("[data-id=sjwcrq]").parent().parent().prev("label").addClass("required");
                    	}
                    	var ldsh = $("[name=ldsh]:checked").val();
                    	if(ldsh == "1"){
                    		g_dialog.operateAlert(null ,"当前，领导对你的方案不通过，请提交审核！" ,"error");
                    		completeBtn.hide();
                    		return;
                    	}
                    	if(!g_validate.validate(step1))
                    		return;
                        if(!g_validate.validate(step2))
                            return;
                        var tempData=workorder.yyxtywwtdjlc.get_step_data(el,func_name);
                        tempData.msg="wc";
                        tempData.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.yyxtywwtdj.controller.YYXTYWWTDJController";
                        tempData.htmlFormKeyClassMethod="yunweiModify";
                        workorder.yyxtywwtdjlc.exeRunProcess(workorder,el,tempData,rowData,obj,{
                            operHisParams:{extraData:tempData.bz}
                        });
                    });
                }
                //信息部门领导-审批中
                function leadershipApproval_init(){
                	el.find(".modal-footer [data-id=save]").text("确认").remove();
                	form_div.find("[data-id=sxms]").attr("disabled",true);
                	form_div.find("div.inputdrop").addClass("disabled");
                	form_div.append(hidden_steps.find("#step2"));
                	form_div.find("#ywry").addClass("disabled");
                	form_div.find("[data-id=jjfa]").addClass("disabled");
                	form_div.find("[data-id=yyfx]").addClass("disabled");
                	form_div.find("#wtfl").addClass("disabled");
                	form_div.find("#clfs").addClass("disabled");
                	form_div.find("[data-id=bz]").addClass("disabled");
                    form_div.find("[data-type=date]").attr("data-type","");
                    form_div.find("[data-id=yjjjrq]").addClass("disabled");
                    form_div.find("[data-id=sjwcrq]").addClass("disabled");
                    form_div.find("[name=wtdj]").addClass("disabled");
                    form_div.find("[data-id=bz]").parent().parent().hide();
                    form_div.find("label.i-checks").find("[name=ldsh]").parent("label").removeClass("disabled");
                    form_div.find("label.i-checks").find("[name=ldsh]").parent().prev("label").addClass("required");
                    form_div.find("[data-id=sjwcrq]").parent().parent().prev("label").removeClass("required");
                    form_div.find("label.i-checks").find("[name=ldsh]").eq(0).attr("checked",true);
                    form_div.find("label.i-checks").find("[name=wtdj]").parent("label").addClass("disabled");
                	form_div.find("#wtfl,#clfs").parent().prev("label").removeClass("required");
                }
                
                /**
				 * 结束流程只能查看详细
                 */
                function endEvent_init() {
                	try{
                        var completeBtn=el.find(".modal-footer [data-id=save]");
                        completeBtn.hide();
                        completeBtn.unbind("click");
					}catch(e){}
                    form_div.append(hidden_steps.children());
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks,#departId,#applyUser,#sjxt,#wtfl,#clfs,#ywry").addClass("disabled");
                    $("#dsc").addClass("hide");
                    form_div.find("[data-id=yjjjrq]").addClass("disabled");
                    form_div.find("[data-id=sjwcrq]").addClass("disabled");
                    form_div.find("[data-id=bz]").parent().parent().hide();
                }
            },
            //初始化之后
            step_init_after:function(el,rowData,workorder,obj){
                var processDatas=el.data("workData");
                var temp_sjxt_data=null,temp_group_data=null,temp_user_data=null,temp_ywry_data=null,temp_wtfl_data=null,temp_clfs_data=null,temp_yjjjrq_data=null,temp_sjwcrq_data=null;
                if(processDatas.sjxt!=null&&typeof(processDatas.sjxt)!="undefined")
                    temp_sjxt_data=processDatas.sjxt;
                if(processDatas.departId!=null&&typeof(processDatas.departId)!="undefined")
                    temp_group_data=processDatas.departId;
                if(processDatas.applyUser!=null&&typeof(processDatas.applyUser)!="undefined")
                    temp_user_data=processDatas.applyUser;
                if(processDatas.ywry!=null&&typeof(processDatas.ywry)!="undefined")
                	temp_ywry_data=processDatas.ywry;
                if(processDatas.wtfl!=null&&typeof(processDatas.wtfl)!="undefined")
                	temp_wtfl_data=processDatas.wtfl;
                if(processDatas.clfs!=null&&typeof(processDatas.clfs)!="undefined")
                	temp_clfs_data=processDatas.clfs;
                if(processDatas.yjjjrq!=null&&typeof(processDatas.yjjjrq)!="undefined")
                    temp_yjjjrq_data=processDatas.yjjjrq;
                if(processDatas.sjwcrq!=null&&typeof(processDatas.sjwcrq)!="undefined")
                    temp_sjwcrq_data=processDatas.sjwcrq;
                //初始化配件选项
				el.oneTime(100,function () {
                    if(processDatas.fitting!=null&&typeof(processDatas.fitting)!="undefined"&&processDatas.fitting.length>0)
                        el.umDataBind("renderCheckBox",el,{name:"fitting",value:processDatas.fitting.split(",")});
                    workorder.yyxtywwtdjlc.init_sjxt(el,temp_sjxt_data,workorder);
                    workorder.yyxtywwtdjlc.init_user_group(el,temp_group_data,temp_user_data,workorder);
                    if(!rowData.meLiActivitiIsEndData){
                        workorder.yyxtywwtdjlc.init_ywry(el,temp_ywry_data,workorder);
                    }
                    if(temp_ywry_data!=null && typeof (temp_ywry_data)!="undefined"){
                        workorder.yyxtywwtdjlc.init_ywry(el,temp_ywry_data,workorder);
					}
                    workorder.yyxtywwtdjlc.init_wtfl(el,temp_wtfl_data,workorder);
                    workorder.yyxtywwtdjlc.init_clfs(el,temp_clfs_data,workorder);
                    workorder.yyxtywwtdjlc.init_yjjjrq(el,temp_yjjjrq_data,workorder);
                    workorder.yyxtywwtdjlc.init_sjwcrq(el,temp_sjwcrq_data,workorder);

                });
				var tjBtn=el.find(".modal-footer [data-type=custom]").eq(1);
				var ldshinit = el.find("[name=ldsh]:checked").val();
                if(ldshinit == "0"){
            		tjBtn.hide();
            	}
                el.find("[data-id=bz]").val("");
            },
            //开始流程提交
            start_submit:function (el,workorder) {
            	var el_form = el.find("[id=step1]");
                if(!g_validate.validate(el_form))
                    return;
            	var treeObj = el.find("#sjxt").find("ul").data("tree");
            	treeObj = treeObj.getSelectedNodes();
            	var tempUsers=treeObj[0].systemUsers;
            	if(tempUsers==null||typeof(tempUsers)=="undefined"||tempUsers.length<=0){
                    g_dialog.operateAlert(null ,"签收用户数据获取失败！" ,"error");
                    return;
				}
                var saveObj=el_form.umDataBind("serialize");
                var url="workflow/createAndStartProcInst";
                saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.yyxtywwtdj.controller.YYXTYWWTDJController";
                saveObj.htmlFormKeyClassMethod = "startProcess";
                saveObj.formFile = "yyxtywwtdj";
                saveObj.yunweiUser=tempUsers;
                saveObj.wf_step1_wfname="应用系统运维问题登记工单";
                var obj = new Object();
                var operHisParams = {};
                // operHisParams.userId = saveObj.applyUser;
                operHisParams.operName = "提交工单";
                obj.assetApplyStep1Apply = saveObj;
                obj.curstep = "assetApplyStep1Apply";
                obj.procDefID = "yyxtywwtdjlc:2:170004";
                obj.proInsId = "";
                obj.businessKey = "";
                obj.type = "event";
                obj.operHisParams = operHisParams;
                um_ajax_post({
                    url : url,
                    paramObj : {workflowinfo:obj},
					maskObj:"body",
                    successCallBack : function(data){
                        workorder.yyxtywwtdjlc.file_submit(data);
                        window.location.href = "#/oper_workorder/workorder_handle/workorder_apply";
                    }
                });
            },
            //获取每个步骤的数据
            get_step_data:function(el,func_name){
                var temp_func=func_name+"_data";//初始化
                var container_div=el.find("#workorder_div");
                var form_div=container_div.find("#query_form");
                try{
                	var tempResData=eval(temp_func)();
                	try{
                        delete tempResData.serviceLevel;
					}catch(e){}
                    return tempResData;//初始化
                }catch(e){}

                /**
                 * 获取运维人员---问题处理中表单数据
                 */
                function yunweiDeal_data(){
                    var step2Div=form_div.find("#step2");
                    var step1Div=form_div.find("#step1");
                    var tempData=step2Div.umDataBind("serialize");
                    var oneData=step1Div.umDataBind("serialize");
                    tempData.departId=oneData.departId;
                    tempData.applyUser=oneData.applyUser;
                    tempData.shenQingDate=oneData.shenQingDate;
                    tempData.sjxt=oneData.sjxt;
                    tempData.sxms=oneData.sxms;
                    return tempData;
                }
                /**
				 * 获取信息部门领导-审批中表单数据
                 */
				function leadershipApproval_data(){
                    var step2Div=form_div.find("#step2");
                    var tempData=step2Div.umDataBind("serialize");
                    return tempData;
				}
            },
            //根据当前信息获取按钮获取按钮
            getButtons:function (rowData,obj,workorder) {
                var id=rowData.actTmpId;
                var tempButtons=[
                ];
                var nowNode=null;
                if(id.split("_").length>1)
                    nowNode=id.split("_")[1];
                switch(nowNode){
                    case "yunweiDeal":
                        tempButtons.push({id:"btn_daiban",class:"dialog-rea-handle",text:"转派",aClick:daiban});
                        tempButtons.push({id:"btn_tjsh",class:"",text:"提交审核",aClick:tjsh});
                        break;
                    case "leadershipApproval":
                        tempButtons.push({id:"btn_spwc",class:"",text:"完成审核",aClick:spwc});
                        break;
                }
                tempButtons.push({id:"btn_lionry_save",class:"",text:"保存",aClick:saveForm});
                function daiban(el) {
                    var tempData=workorder.yyxtywwtdjlc.get_step_data(el,nowNode);
                    tempData.ywry="";
                    tempData.firstClaimUser=index_user_info.id;
                    g_dialog.dialog("<ul id='daiban_tree' class='ztree'></ul>",{
                        width:"450px",
                        title:"工作转派",
						init:function (inel) {
                        	var temp_tree=inel.find("#daiban_tree");
                            um_ajax_post({
                                url : "dailyOperation/selectGroupsAUsers",
                                paramObj : {roleType:3},
								maskObj:inel,
                                successCallBack : function (data){
                                	var nowData=data;
                                	var tempGroups=null;
                                	var addGroups=[];
                                	var innerData=[];
                                    for(var i=0;i<nowData.length;i++){
                                        if(nowData[i].groupUsers==null||typeof(nowData[i].groupUsers)=="undefined"||nowData[i].groupUsers.length<=0){
                                            continue;
                                        }
                                        if(nowData[i].groupName&&nowData[i].groupName.indexOf("台帐")<0){
                                            innerData.push(nowData[i]);
                                        }
                                    }
                                	for(var i=0;i<innerData.length;i++){
                                        innerData[i].meIsGroup=true;
                                        tempGroups=innerData[i].groupUsers;
										for(var j=0;j<tempGroups.length;j++){
											tempGroups[j].groupId=tempGroups[j].codevalue;
											tempGroups[j].groupName=tempGroups[j].codename;
                                            tempGroups[j].meIsGroup=false;
                                            tempGroups[j].pId=innerData[i].groupId;
											addGroups.push(tempGroups[j]);
										}
									}
									for(var i=0;i<addGroups.length;i++){
                                        innerData.push(addGroups[i]);
									}
                                    tree.render(temp_tree,{
                                        zNodes : innerData,
                                        edit : false,
                                        expand : true,
                                        id  : "groupId",
                                        pId : "pId",
                                        label : "groupName",
                                        chk:true
                                    });
                                }
                            });
                        },
                        saveclick:function (inel) {
                            var temp_tree=inel.find("#daiban_tree");
                            var innerTree=temp_tree.data("tree");
                            var tempNodes=innerTree.getCheckedNodes(true);
                            if(tempNodes==null||typeof(tempNodes)=="undefined"||tempNodes.length<=0){
                                g_dialog.operateAlert(null ,"请选择转派人员" ,"error");
                            	return;
							}
                            var tempStr="";
                            for(var i=0;i<tempNodes.length;i++){
                            	if(!tempNodes[i].meIsGroup){
                                    tempStr+=","+tempNodes[i].groupId;
                                }
							}
							if(tempStr.length==0){
                                g_dialog.operateAlert(null ,"选择的数据为空" ,"error");
                                return;
							}
							tempStr=tempStr.substring(1);//截取字符串
                            tempData.yunweiUser=tempStr;
                            g_dialog.hide(inel);
                            workorder.yyxtywwtdjlc.file_submit(rowData.processInstanceID,el);
                            um_ajax_post({
                                url : "workflowManager/workFlowInvokeOnly",
                                paramObj : {
                                	taskId:rowData.workItemID,
                                	userIds:tempStr,
                                	htmlFormKeyClass:"com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController",
                            		htmlFormKeyClassMethod:"daiBanUsers",
                                	variables:tempData,
                                    operHisParams:{operName:"转派工作",extraData:tempData.bz}
                                },
                                maskObj : "body",
                                successCallBack : function (data){
                                    g_dialog.operateAlert();
                                    g_dialog.hide(el);
                                    obj.todo_work_list();
                                }
                            });
                        }
					});
                }
                //保存表单信息
                function saveForm(el){
                    var container_div=el.find("#workorder_div");
                    g_dialog.operateConfirm("确认要保存吗？" , {
                        saveclick: function () {
                        	var variables=workorder.yyxtywwtdjlc.getNoDisabledFormData(container_div);
                            um_ajax_post({
                                url : "workflow/saveProcVariable/"+rowData.processInstanceID,
                                paramObj : variables,
                                maskObj : "body",
                                successCallBack : function (data){
                                    g_dialog.operateAlert();
                                    g_dialog.hide(el);
                                    obj.todo_work_list();
                                }
                            });
                        }
                    });
				}
                //提交审核
                function tjsh(el) {
                	var container_div=el.find("#workorder_div");
                	var form_div=container_div.find("#query_form");
                	form_div.find("#wtfl,#clfs").parent().prev("label").removeClass("required");
                	form_div.find("[data-id=sjwcrq]").parent().parent().prev("label").removeClass("required");
                    var step2=form_div.find("#step2");
                    g_validate.clear(step2);
                    var step1=form_div.find("#step1");
                    var yjjjrq=form_div.find("[data-id=yjjjrq]").parent();
                    var yyfx=form_div.find("[data-id=yyfx]").parent();
                    var jjfa=form_div.find("[data-id=jjfa]").parent();
                	if(!g_validate.validate(step1))
                		return;
                    if(!g_validate.validate(yjjjrq))
                        return;
                    if(!g_validate.validate(yyfx))
                        return;
                    if(!g_validate.validate(jjfa))
                        return;
                    g_dialog.operateConfirm("确认要提交给领导审核吗？" ,{
                        saveclick : function (){
		                	var tempData=workorder.yyxtywwtdjlc.get_step_data(el,nowNode);
		                    var leadershipUser = "";
	                    	um_ajax_post({
                                url : "YYXTYWWTDJ/selectXXBLD",
                                paramObj : {
                                	domaAbbreviation : "XXZYB"
                                },
                                maskObj : "body",
                                successCallBack : function (data){
                                	leadershipUser = data;
		                    		 if(leadershipUser == ""){
		 		                    	//g_dialog.operateAlert(null ,"获取信息部领导失败，请联系管理员添加信息部领导" ,"error");
		 		                    	//return;
                                         leadershipUser = "119b2b1502f941278ac5b0a9fa487e60";
		 		                    }
		 		                    tempData.leadershipUser=leadershipUser;
		 		                    tempData.msg="tjsp";
		 		                    workorder.yyxtywwtdjlc.exeRunProcess(workorder,el,tempData,rowData,obj,{
		 		                    	operHisParams:{operName:"提交审核",extraData:tempData.bz}
		 		                    });
                                }
                            });
                        }
                    });
                }
                //审批完成
                function spwc(el){
                	var tempData=workorder.yyxtywwtdjlc.get_step_data(el,nowNode);
                    tempData.msg="tjsp";
                    workorder.yyxtywwtdjlc.exeRunProcess(workorder,el,tempData,rowData,obj,{
		 		        operHisParams:{operName:"完成审核",extraData:tempData.shyj}
		 		    });
                }
                return tempButtons;
            },
            //运行流程
            exeRunProcess:function(workorder,el,tempData,rowData,todoObj,reqData){
            	if(reqData==null||typeof(reqData)=="undefined")
            		reqData={};
                var obj ={};
                $.extend(true,obj,reqData);
                //如果不存在运行过后需要调用的类，则设置为更新到达时间调用类
                if(tempData.htmlFormKeyClass==null||typeof(tempData.htmlFormKeyClass)=="undefined"||tempData.htmlFormKeyClass.length<=0){
                	tempData.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.yyxtywwtdj.controller.YYXTYWWTDJController";
				}
                obj.variables = tempData;
                obj.taskId = rowData.workItemID;
                obj.procInsId = rowData.processInstanceID;
                um_ajax_post({
                    url : "workflow/execute",
                    paramObj : obj,
                    maskObj : "body",
                    successCallBack : function (data){
                        g_dialog.operateAlert();
                        g_dialog.hide(el);
                        todoObj.todo_work_list();
                        workorder.yyxtywwtdjlc.file_submit(rowData.processInstanceID,el);
                    }
                });
            },
            //浏览历史操作记录
            his_data_init:function (el,rowData,workorder,obj,data) {
                var hisDiv=el.find("#his_table_div");
                var curDiv=el.find("#cur_table_div");
                var hisTab=el.find("[data-id=tab-ul]").find("li:eq(2)");

                var his_tab_click=function(){
                    g_grid.resizeSup(hisDiv);
                    g_grid.resizeSup(curDiv);
                }
                var tempConfig1={
                    header:[
                        {align:"center",text:"当前节点",name:"actName"},
                        {align:"center",text:"开始时间",name:"startTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"节点处理人",name:"userName"},
                        {align:"center",text:"备注",name:"memo"}
                    ],
                    operWidth : "100px",
                    paginator : false,
                    allowCheckBox:false,
                    data : [],
                    hasBorder : true,
                    hideSearch :true
                };
                var tempConfig={
                    header:[
                        {align:"center",text:"处理节点",name:"actName"},
                        {align:"center",text:"处理时间",name:"endTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"处理人",name:"assigneeName"},
                        {align:"center",text:"处理意见",name:"extraData"},
                        {align:"center",text:"操作",name:"operName"}
                    ],
                    operWidth : "100px",
                    paginator : false,
                    allowCheckBox:false,
                    data : [],
                    hasBorder : true,
                    hideSearch :true
                };
                var hisData=data.hList;
                var cData=data.cList;
                if(cData==null||typeof(cData)=="undefined")
                    cData=[];
                if(hisData==null||typeof(hisData)=="undefined")
                    hisData=[];

                show_data(hisData,cData);
                function show_data(showDatas,cData) {
                    g_grid.render(curDiv,tempConfig1);
                    g_grid.render(hisDiv,tempConfig);
                    if(showDatas.length>0){
                        hisDiv.oneTime(1000,function(){
                            try{
                                if(showDatas.length>0)
                                    showDatas[showDatas.length-1].userName=rowData.approveUser;
                            }catch(e){}
                            g_grid.addData(hisDiv,showDatas);
                        });
                    }
                    if(cData.length>0){
                        hisDiv.oneTime(1000,function(){
                            g_grid.addData(curDiv,cData);
                        });
                    }
                    hisTab.unbind("click",his_tab_click);
                    hisTab.bind("click",his_tab_click);
                }
            }
        },
		//日常运维流程
        richangyunwei:{
			tempObj:{
				//一线用户组id
				firstGroupId:"8"
			},
			//初始化服务目录
			init_service_catalog:function (el,selectData,workorder) {
                var serviceCatalog=el.find("#serviceMulu");
                serviceCatalog.html("");
                um_ajax_post({
                    url: "wServiceCatalog/treeCatalogs",
                    paramObj: {isUse:"0"},
                    maskObj: el,
                    successCallBack: function (data) {
                        inputdrop.renderTree(serviceCatalog,data,{enableChk:false,onlyLastChild:true,pId:"pId",label:"catalogName",id:"catalogId"});
                        if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0)
                        	inputdrop.setDataTree(serviceCatalog,selectData);
                    }
                });
            },
			init_user_group:function (el,departData,userData,workorder) {
                var departId=el.find("#departId");
                var applyUser=el.find("#applyUser");
                var telPhone=el.find("[data-id=telPhone]");
                var baoXiuAsset=el.find("[id=baoXiuAsset]");
                departId.html("");
                um_ajax_post({
                    url: "dailyOperation/selectGroupsAUsers",
                    paramObj: {roleType: "3"},
                    maskObj: el,
                    successCallBack: function (data) {
                        for(var i=0;i<data.length;i++) {
                            if (data[i].groupId == workorder.richangyunwei.tempObj.firstGroupId) {
                                $("#workorder_div").data("firstUsers", data[i].groupUsers);
                            }
                        }
                    }
                });
                um_ajax_post({
                    url: "dailyOperation/selectDeptAUsers",
                    paramObj: {roleType:"3"},
                    maskObj: el,
                    successCallBack: function (data) {
                        inputdrop.renderTree(departId,data,{
                        	enableChk:false,onlyLastChild:false,pId:"pId",label:"groupName",id:"groupId",
							//树选择事件
                            treeClick:function (event, treeId, treeNode) {
                                var tempId=treeNode.id;
                                loadUser(treeNode.groupUsers);
							}});
                        var tempGroupUsers=null;
                        var phoneData=null;
                        for(var i=0;i<data.length;i++){
                            if(data[i].groupId==workorder.richangyunwei.tempObj.firstGroupId){
                                $("#workorder_div").data("firstUsers",data[i].groupUsers);
                            }
                            //设置默认值
                            tempGroupUsers=data[i].groupUsers;
                            if(departData==null&&userData==null){
                                try{
                                    for(var j=0;j<tempGroupUsers.length;j++){
                                    	if(tempGroupUsers[j].codevalue==index_user_info.id){//如果用户属于这个组
											departData=data[i].groupId;
                                            userData=index_user_info.id;
										}
                                    }
                                }catch(e){}
							}
                        }
                        if(departData!=null&&typeof(departData)!="undefined"&&departData.length>0){
                        	try{
                                inputdrop.setDataTree(departId,departData);
							}catch(e){}
                            for(var i=0;i<data.length;i++){
                            	if(departData==data[i].groupId){
                            		loadUser(data[i].groupUsers);
                            		if(userData!=null&&typeof(userData)!="undefined"&&userData.length>0){
                                        tempGroupUsers=data[i].groupUsers;
                            			for(var j=0;j<tempGroupUsers.length;j++){
                            				if(tempGroupUsers[j].codevalue==userData){
                            					if(tempGroupUsers[j].userPhone!=null&&typeof(tempGroupUsers[j].userPhone)!="undefined")
                                                    phoneData=tempGroupUsers[j].userPhone;
                            					break;
											}
										}
										try{
                                            inputdrop.setDataTree(applyUser,userData);
                                            baoXiuAsset.trigger("begin_load_data_with");
										}catch(e){}
									}
								}
								if(data[i].groupId==workorder.richangyunwei.tempObj.firstGroupId){
                                    $("#workorder_div").data("firstUsers",data[i].groupUsers);
								}
							}
							//默认选择当前用户的电话
							if(phoneData!=null)
                                telPhone.val(phoneData);
                        }
                    }
                });
                //加载用户
                function loadUser(data){
                    applyUser.html("");
					inputdrop.renderTree(applyUser,data,{enableChk:false,label:"codename",id:"codevalue",treeClick:function (event, treeId, treeNode) {
                        baoXiuAsset.trigger("begin_load_data");
                        if (treeNode.userPhone != null && typeof(treeNode.userPhone) != "undefined" && treeNode.userPhone.length > 0)
                            telPhone.val(treeNode.userPhone);
                        else
                            telPhone.val("");
                    }});
				}
            },
			//初始化资产选择
			init_asset_select:function (el,assetData,workorder,readonly) {
                var baoXiuAsset=el.find("[id=baoXiuAsset]");
                var assetDataCache={};//资产数据缓存
                asset_select_init();//资产选择初始化
                //资产选择初始化
                function asset_select_init(){
                    el.find('input:radio[name=deviceType]').change(function () {
                        loadAsset(null);
                    });
                    loadAsset(assetData);
                }
                //加载数据
                baoXiuAsset.on("begin_load_data",function () {
                	loadAsset(null);
                });
                //加载数据
                baoXiuAsset.on("begin_load_data_with",function () {
                    loadAsset(assetData);
                });
                inputdrop.renderTree(baoXiuAsset,[],{enableChk:true,pId:"pId",label:"meShowName",id:"meId",
			                            renderStyle : "label",
                    					readonly:readonly,
								    	labelClick : function (param){
								    		asset.ledgerDetailDialog(param)
								    	},
								  		aCheckCb : function (event, treeId, treeNode){
								  			console.log(treeNode)
								  			inputdrop.renderSpanLabel(el.find('[id=baoXiuAsset]') ,[
								  										{id:treeNode.ASSETCODE,label:treeNode.meShowName,checked:treeNode.checked}])
								  		}});

                //加载资产树
                function loadAsset(nowData){
                    //baoXiuAsset.html("");
                    inputdrop.clearTree(el.find('[id=baoXiuAsset]'))
                    var deviceTypeV=el.find('input:radio[name=deviceType]:checked').val();
                    var deviceMap={"0":"终端","1":"终端","3":"终端","2":"外设","-1":"外设"};
                    var nowKey=deviceTypeV;
                    var nowApplyUser=el.find("[data-id=applyUser]").val();
                    if(nowApplyUser!=null&&typeof(nowApplyUser)!="undefined"&&nowApplyUser.length>0){
                    	nowKey+=nowApplyUser;
					}else{
                    	return;
					}
                    //如果有缓存
                    if(assetDataCache[nowKey]!=null&&typeof(assetDataCache[nowKey])!="undefined"){
            //             inputdrop.renderTree(baoXiuAsset,assetDataCache[nowKey],{enableChk:true,pId:"pId",label:"meShowName",id:"meId",
            //             				renderStyle : "label",
								    // 	labelClick : function (param){
								    // 		asset.ledgerDetailDialog(param)
								    // 	},
								  		// aCheckCb : function (event, treeId, treeNode){
								  		// 	inputdrop.renderSpanLabel(el.find('[id=baoXiuAsset]') ,[
								  		// 								{id:treeNode.meId,label:treeNode.meShowName,checked:treeNode.checked}])
								  		// }});
                        	inputdrop.addDataTree(baoXiuAsset,assetDataCache[nowKey]);
                        if(nowData!=null)
                            inputdrop.setDataTree(baoXiuAsset,nowData);
                    }else{
                        um_ajax_post({
                            url: "dailyOperation/selectAsset",
                            paramObj: {assetTypeIds: deviceTypeV,userId:nowApplyUser},
                            maskObj : el,
                            successCallBack: function (data) {
                                var tempData=data;
                                if(tempData==null||typeof(tempData)=="undefined")
                                    tempData=[];
                                if(tempData.length>0){
                                    for(var i=0;i<tempData.length;i++){
                                        try{
                                            tempData[i].meId=tempData[i].ASSETCODE+tempData[i].EDID+tempData[i].ASSETTYPEID;
                                            // tempData[i].meShowName=tempData[i].assetCode+"("+tempData[i].assetName+")";
                                            tempData[i].meShowName=tempData[i].ASSETCODE;
                                        }catch(e){
                                            tempData[i].meShowName=tempData[i].ASSETCODE;
                                        }
                                    }
                                }
                                assetDataCache[nowKey]=tempData;
                                inputdrop.addDataTree(baoXiuAsset,tempData);
                                if(nowData!=null)
                                    inputdrop.setDataTree(baoXiuAsset,nowData);
                            }
                        });
                    }
                }
            },
			//加载设备类型
			loadDeviceType:function(el,workorder){
                var deviceTypeContainer=el.find("[selfAttr=deviceType]");
                deviceTypeContainer.html("");
                um_ajax_post({
                    isAsync:false,
                    paramObj:{name:"终端"},
                    url:"dailyOperation/selectAssetTypes",
                    successCallBack:function(data){
                    	if(!data||data.length<=0){
                            g_dialog.operateAlert(null ,"获取终端组设备类型失败！" ,"error");
                            return;
						}
						var tempStr=null;
						for(var i=0;i<data.length;i++){
							tempStr="<label class=\"i-checks\" style='padding-left:28px;'>";
							tempStr+="<input type=\"radio\" value=\""+data[i].deviceType+"\" name=\"deviceType\" data-id=\"deviceType\"";
							if(i==0){
								tempStr+=" checked";
							}
							tempStr+="/>";
							tempStr+="<i></i>"+data[i].deviceTypeName+"</label>"
                    		deviceTypeContainer.append(tempStr);
						}
					}
				});
			},
            //开始流程初始化
            step_init:function (el,rowData,workorder,obj) {
                var id=rowData.actTmpId;
                var func_name=id.split("_")[1];
                var temp_func=func_name+"_init";//初始化
                var container_div=el.find("#workorder_div");
                var form_div=container_div.find("#query_form");
                var hidden_steps=el.find("#hidden_steps");
                var baoXiuAsset=el.find("[id=baoXiuAsset]");
                var departId=el.find("[id=departId]");
                var applyUser=el.find("[id=applyUser]");
                //加载设备类型
				workorder.richangyunwei.loadDeviceType(el,workorder);
				if(func_name!="step1"){
					el.find("[selfAttr=deviceType] label.i-checks").addClass("disabled");
				}
                try{
                	if(!rowData.meLiActivitiIsEndData)
                        eval(temp_func)();//初始化
					else
						endEvent_init();//调用查看详细
					if(func_name=="yunweiDeal")
                        el.find("#yunwei_tips").show();
					else
                        el.find("#yunwei_tips").hide();
                }catch(e){}
				//初始化服务目录
				if(id!=null&&typeof(id)!="undefined"&&id.indexOf("step1")>=0){
                	el.oneTime(300,function () {
                        workorder.richangyunwei.init_service_catalog(el,null,workorder);//初始化目录选择
                        workorder.richangyunwei.init_user_group(el,null,null,workorder);//初始化用户和组选择
                        workorder.richangyunwei.init_asset_select(el,null,workorder,false);//初始化资产选择
                    });
                }else if(func_name.indexOf("yunweiDeal")!=0){
					el.find("#departId,#applyUser,#serviceMulu").addClass("disabled");
				}
                //第一步初始化（申请）
                function step1_init(){
                    var temp_obj=el.find("[id="+func_name+"]");
                    var baoxiuDate=temp_obj.find("[data-id=baoXiuDate]");
                    var server_time,arriveDate=temp_obj.find("[data-id=arriveDate]");
                    var telPhone=temp_obj.find("[data-id=telPhone]"),serviceMulu=temp_obj.find("[id=serviceMulu]");
                    baoxiuDate.val(g_moment().format("YYYY-MM-DD HH:mm:ss"));
                    arriveDate.val(g_moment().format("YYYY-MM-DD HH:mm:ss"));
                    // timepicker.time(baoxiuDate,{position:"absolute"});
                }

                /**
                 * 一线处理初始化
                 */
                function yunweiDeal_init(){
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");
                    completeBtn.unbind("click");
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks").addClass("disabled");
                    // form_div.find("[selfAttr=deviceType] label.i-checks").removeClass("disabled");
                    el.find("#departId,#applyUser").addClass("disabled");
                    form_div.append(hidden_steps.find("#step2"));
                    var step2=form_div.find("#step2");
                    var step1=form_div.find("#step1");
                    //点击完成后
                    completeBtn.click(function () {
                    	if(!g_validate.validate(step1))
                    		return;
                        if(!g_validate.validate(step2))
                            return;
                        var tempData=workorder.richangyunwei.get_step_data(el,func_name);
                        tempData.firstChoose="2";
                        tempData.firstClaimUser=index_user_info.id;
                        tempData.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController";
                        tempData.htmlFormKeyClassMethod="oneLineModify";
                        workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj);
                    });
                }

                /**
                 * 二线处理初始化
                 */
                function otherGroupDeal_init(){
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");
                    completeBtn.unbind("click");
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks").addClass("disabled");
                    form_div.append(hidden_steps.find("#step2"));
                    var step2=form_div.find("#step2");
                    completeBtn.click(function () {
                        if(!g_validate.validate(step2))
                            return;
                        var tempData=workorder.richangyunwei.get_step_data(el,func_name);
                        workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj);
                    });
                }

                /**
                 * 一线审核初始化
                 */
                function yunweiDealFirstCheck_init(){
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");
                    completeBtn.unbind("click");
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks,#departId,#applyUser,#serviceMulu,#baoXiuAsset").addClass("disabled");
                    form_div.append(hidden_steps.find("#step2"));
                    var step2=form_div.find("#step2");
                    completeBtn.click(function () {
                        if(!g_validate.validate(step2))
                            return;
                        var tempData=workorder.richangyunwei.get_step_data(el,func_name);
                        workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj);
                    });
                }

                /**
                 * 第三方处理初始化
                 */
                function yunweiDealThird_init(){
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");
                    completeBtn.unbind("click");
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks,#departId,#applyUser,#serviceMulu").addClass("disabled");
                    form_div.append(hidden_steps.find("#step2"));
                    var step2=form_div.find("#step2");
                    //点击完成后
                    completeBtn.click(function () {
                        if(!g_validate.validate(step2))
                            return;
                        var tempData=workorder.richangyunwei.get_step_data(el,func_name);
                        workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj);
                    });
                }

                /**
                 * 用户确认初始化
                 */
                function applierCheck_init(){
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("确认完成");
                    form_div.append(hidden_steps.find("#step2"));
                    completeBtn.unbind("click");
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks").addClass("disabled");
                    form_div.find("[data-id=serviceLevel]").parent().parent().remove();
                    form_div.append(hidden_steps.find("#step3"));
                    var step3=form_div.find("#step3");
                    //点击完成后
                    completeBtn.click(function () {
                        if(!g_validate.validate(step3))
                            return;
                        var tempData=workorder.richangyunwei.get_step_data(el,func_name);
                        workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj);
                    });
                }

                /**
				 * 结束流程只能查看详细
                 */
                function endEvent_init() {
                	try{
                        var completeBtn=el.find(".modal-footer [data-id=save]");
                        completeBtn.hide();
                        completeBtn.unbind("click");
					}catch(e){}
                    form_div.append(hidden_steps.children());
                    form_div.find("[data-id]").attr("disabled",true);
                    form_div.find("label.i-checks,#departId,#applyUser,#serviceMulu").addClass("disabled");
                }
            },
            //初始化之后
            step_init_after:function(el,rowData,workorder,obj){
                var id=rowData.actTmpId;
                var func_name=null;
                try{
                    func_name=id.split("_")[1];
				}catch(e){}
                var processDatas=el.data("workData");
                var temp_catalog_data=null,temp_group_data=null,temp_user_data=null,temp_asset_data=null;
                if(processDatas.serviceMulu!=null&&typeof(processDatas.serviceMulu)!="undefined")
                    temp_catalog_data=processDatas.serviceMulu;
                if(processDatas.departId!=null&&typeof(processDatas.departId)!="undefined")
                    temp_group_data=processDatas.departId;
                if(processDatas.applyUser!=null&&typeof(processDatas.applyUser)!="undefined")
                    temp_user_data=processDatas.applyUser;
                if(processDatas.baoXiuAsset!=null&&typeof(processDatas.baoXiuAsset)!="undefined")
                    temp_asset_data=processDatas.baoXiuAsset;
                //初始化配件选项
				el.oneTime(100,function () {
                    if(processDatas.fitting!=null&&typeof(processDatas.fitting)!="undefined"&&processDatas.fitting.length>0)
                        el.umDataBind("renderCheckBox",el,{name:"fitting",value:processDatas.fitting.split(",")});
                    workorder.richangyunwei.init_service_catalog(el,temp_catalog_data,workorder);
                    workorder.richangyunwei.init_user_group(el,temp_group_data,temp_user_data,workorder);
                    workorder.richangyunwei.init_asset_select(el,temp_asset_data,workorder,true);
                });
            },
            //获取每个步骤的数据
            get_step_data:function(el,func_name){
                var temp_func=func_name+"_data";//初始化
                var container_div=el.find("#workorder_div");
                var form_div=container_div.find("#query_form");
                try{
                	var tempResData=eval(temp_func)();
                	try{
                        delete tempResData.serviceLevel;
					}catch(e){}
                    return tempResData;//初始化
                }catch(e){}

                /**
                 * 获取一线处理的表单数据
                 */
                function yunweiDeal_data(){
                    var step2Div=form_div.find("#step2");
                    var step1Div=form_div.find("#step1");
                    var tempData=step2Div.umDataBind("serialize");
                    var oneData=step1Div.umDataBind("serialize");
                    oneData.deviceType=step1Div.find('input:radio[name=deviceType]:checked').val();
                    tempData.departId=oneData.departId;
                    tempData.applyUser=oneData.applyUser;
                    tempData.serviceMulu=oneData.serviceMulu;
                    tempData.deviceType=oneData.deviceType;
                    tempData.baoXiuAsset=oneData.baoXiuAsset;
                    tempData.telPhone=oneData.telPhone;
                    return tempData;
                }

                /**
				 * 获取第三方处理表单数据
                 */
                function yunweiDealThird_data(){
                    var step2Div=form_div.find("#step2");
                    var tempData=step2Div.umDataBind("serialize")
                    return tempData;
				}

                /**
				 * 用户确认获取数据
                 */
				function applierCheck_data(){
                    var step2Div=form_div.find("#step3");
                    var tempData=step2Div.umDataBind("serialize")
                    return tempData;
				}

                /**
				 * 二线处理获取数据
                 */
				function otherGroupDeal_data(){
                    var step2Div=form_div.find("#step2");
                    var tempData=step2Div.umDataBind("serialize")
                    return tempData;
				}

                /**
				 * 一线审核获取数据
                 */
				function yunweiDealFirstCheck_data(){
                    var step2Div=form_div.find("#step2");
                    var tempData=step2Div.umDataBind("serialize")
                    return tempData;
				}
            },
            //开始流程提交
            start_submit:function (el,workorder) {
            	var tempFirstUsers=$("#workorder_div").data("firstUsers");
            	if(tempFirstUsers==null||typeof(tempFirstUsers)=="undefined"||tempFirstUsers.length<=0){
                    g_dialog.operateAlert(null ,"一线用户数据获取失败！" ,"error");
                    return;
				}
				var tempFirst=tempFirstUsers[0].codevalue;
            	for(var i=1;i<tempFirstUsers.length;i++){
                    tempFirst+=","+tempFirstUsers[i].codevalue;
				}
                var el_form = el.find("[id=step1]");
                if(!g_validate.validate(el_form))
                    return;
                var operHisParams={};
                var saveObj=el_form.umDataBind("serialize");
                var url="workflow/createAndStartProcInst";
                saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController";
                saveObj.htmlFormKeyClassMethod = "startProcess";
                saveObj.formFile = "richangyunwei";
                // saveObj.yunweiFirstsUsers="e30c04d4d98e433fb6519eb1f3ab9329,5945b262c81b4274aa4a0c9eaef2ab6a";
                saveObj.yunweiFirstsUsers=tempFirst;
                saveObj.wf_step1_wfname="桌面服务请求";
                // saveObj.applierCheckUsers=saveObj.applyUser;//第一个确认的人
                saveObj.applierCheckUsers="a93af6b1287449d987133148449c85cf";//第一个确认的人
                saveObj.autoApplierCheckDuration="P1D";//设置结束时间
                // operHisParams.userId=saveObj.applyUser;
                operHisParams.operName="提交工单";
                var obj = new Object();
                obj.assetApplyStep1Apply = saveObj;
                obj.curstep = "assetApplyStep1Apply";
                obj.procDefID = "richangyunwei:7:415004";
                obj.proInsId = "";
                obj.businessKey = "";
                obj.type = "event";
                obj.operHisParams=operHisParams;
                um_ajax_post({
                    url : url,
                    paramObj : {workflowinfo:obj},
					maskObj:"body",
                    successCallBack : function(){
                        g_dialog.operateAlert();
                        window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
                    }
                });
            },
            //根据当前信息获取按钮获取按钮
            getButtons:function (rowData,obj,workorder) {
                var id=rowData.actTmpId;
                var tempButtons=[
                ];
                var nowNode=null;
                if(id.split("_").length>1)
                    nowNode=id.split("_")[1];
                switch(nowNode){
                    case "yunweiDeal":
                        tempButtons.push({id:"btn_daiban",class:"dialog-rea-handle",text:"转派",aClick:daiban});
                        tempButtons.push({id:"btn_guaqi",class:"",text:"挂起",aClick:guaqi});
                        break;
                    case "applierCheck":
                        tempButtons.push({id:"btn_guaqi",class:"",text:"驳回",aClick:bohui});
                        break;
					case "otherGroupDeal":
                        tempButtons.push({id:"btn_guaqi",class:"dialog-rea-handle",text:"转派",aClick:thisTaskTransfer});
						break;
                }

                //当前节点转派
                function thisTaskTransfer(el) {
                    transfer(el,true);
                }

                //转派，是否当前任务
                function transfer(el,isThisTask){
                    var tempData=workorder.richangyunwei.get_step_data(el,nowNode);
                    tempData.firstChoose="3";//第一步选择挂起
                    tempData.firstClaimUser=index_user_info.id;
                    tempData.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController";
                    tempData.htmlFormKeyClassMethod="oneLineModify";
                    if(isThisTask)
                        tempData.htmlFormKeyClassMethod="daiBanUsers";
                    g_dialog.dialog("<ul id='daiban_tree' class='ztree'></ul>",{
                        width:"450px",
                        title:"工作转派",
                        init:function (inel) {
                            var temp_tree=inel.find("#daiban_tree");
                            um_ajax_post({
                                url : "dailyOperation/selectGroupsAUsers",
                                paramObj : {roleType:3},
                                maskObj:inel,
                                successCallBack : function (data){
                                    var nowData=data;
                                    var tempGroups=null;
                                    var addGroups=[];
                                    var innerData=[];
                                    for(var i=0;i<nowData.length;i++){
                                        if(nowData[i].groupUsers==null||typeof(nowData[i].groupUsers)=="undefined"||nowData[i].groupUsers.length<=0){
                                            continue;
                                        }
                                        if(nowData[i].groupName&&nowData[i].groupName.indexOf("台帐")<0){
                                            innerData.push(nowData[i]);
                                        }
                                    }
                                    for(var i=0;i<innerData.length;i++){
                                        innerData[i].meIsGroup=true;
                                        tempGroups=innerData[i].groupUsers;
                                        for(var j=0;j<tempGroups.length;j++){
                                            tempGroups[j].groupId=tempGroups[j].codevalue;
                                            tempGroups[j].groupName=tempGroups[j].codename;
                                            tempGroups[j].meIsGroup=false;
                                            tempGroups[j].pId=innerData[i].groupId;
                                            addGroups.push(tempGroups[j]);
                                        }
                                    }
                                    for(var i=0;i<addGroups.length;i++){
                                        innerData.push(addGroups[i]);
                                    }
                                    tree.render(temp_tree,{
                                        zNodes : innerData,
                                        edit : false,
                                        expand : true,
                                        id  : "groupId",
                                        pId : "pId",
                                        label : "groupName",
                                        chk:true
                                    });
                                }
                            });
                        },
                        saveclick:function (inel) {
                            var temp_tree=inel.find("#daiban_tree");
                            var innerTree=temp_tree.data("tree");
                            var tempNodes=innerTree.getCheckedNodes(true);
                            if(tempNodes==null||typeof(tempNodes)=="undefined"||tempNodes.length<=0){
                                g_dialog.operateAlert(null ,"请选择转派人员" ,"error");
                                return;
                            }
                            var tempStr="";
                            for(var i=0;i<tempNodes.length;i++){
                                if(!tempNodes[i].meIsGroup){
                                    tempStr+=","+tempNodes[i].groupId;
                                }
                            }
                            if(tempStr.length==0){
                                g_dialog.operateAlert(null ,"选择的数据为空" ,"error");
                                return;
                            }
                            tempStr=tempStr.substring(1);//截取字符串
                            tempData.otherGroupUsers=tempStr;
                            g_dialog.hide(inel);
                            if(!isThisTask){
                                workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj,{
                                    operHisParams:{operName:"一线转派"}
								});
							}else{
                            	var tempClass=tempData.htmlFormKeyClass;
                            	var tempMethod=tempData.htmlFormKeyClassMethod;
                            	delete tempData.htmlFormKeyClass;
                            	delete tempData.htmlFormKeyClassMethod;
                                um_ajax_post({
                                    url : "workflowManager/workFlowInvokeOnly",
                                    paramObj : {
                                    	taskId:rowData.workItemID,userIds:tempStr,
                                        htmlFormKeyClass:tempClass,
                                        htmlFormKeyClassMethod:tempMethod,
										variables:tempData,
                                        operHisParams:{operName:"二线转派"}
                                    },
                                    maskObj : "body",
                                    successCallBack : function (data){
                                        g_dialog.operateAlert();
                                        g_dialog.hide(el);
                                        obj.todo_work_list();
                                    }
                                });
							}
                        }
                    });
				}

				//转派
                function daiban(el) {
                	transfer(el,false);
                }
                //挂起
                function guaqi(el) {
                    g_dialog.operateConfirm("确认要挂起吗？" ,{
                        saveclick : function (){
                            var tempData=workorder.richangyunwei.get_step_data(el,nowNode);
                            tempData.firstChoose="1";//第一步选择挂起
                            tempData.firstClaimUser=index_user_info.id;
                            tempData.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController";
                            tempData.htmlFormKeyClassMethod="oneLineModify";
                            workorder.richangyunwei.exeRunProcess(el,tempData,rowData,obj,{
                                operHisParams:{operName:"挂起"}
							});
                        }
                    });
                }

                //驳回到一线处理人接手的人
                function bohui(el){
                    g_dialog.operateConfirm("确认要驳回吗？" ,{
                        saveclick : function (){
                            var saveObj=new Object();
                            saveObj.taskId=rowData.workItemID;
                            saveObj.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController";
                            saveObj.htmlFormKeyClassMethod="jumpToFirstActivity";
                            saveObj.operHisParams={operName:"用户驳回"}
                            um_ajax_post({
                                url : "workflowManager/workFlowInvokeOnly",
                                paramObj : saveObj,
                                maskObj : "body",
                                successCallBack : function (data){
                                    g_dialog.operateAlert();
                                    g_dialog.hide(el);
                                    obj.todo_work_list();
                                }
                            });
                        }
                    });
                }
                return tempButtons;
            },
            //运行流程
            exeRunProcess:function(el,tempData,rowData,todoObj,reqData){
            	if(reqData==null||typeof(reqData)=="undefined")
            		reqData={};
                var obj ={};
                $.extend(true,obj,reqData);
                //如果不存在运行过后需要调用的类，则设置为更新到达时间调用类
                if(tempData.htmlFormKeyClass==null||typeof(tempData.htmlFormKeyClass)=="undefined"||tempData.htmlFormKeyClass.length<=0){
                	tempData.htmlFormKeyClass="com.rh.soc.workflow.workflowmanage.form.dailyOperation.controller.DailyOperationController";
                	tempData.htmlFormKeyClassMethod="setArriveTime";
				}
                obj.variables = tempData;
                obj.taskId = rowData.workItemID;
                obj.procInsId = rowData.processInstanceID;
                um_ajax_post({
                    url : "workflow/execute",
                    paramObj : obj,
                    maskObj : "body",
                    successCallBack : function (data){
                        g_dialog.operateAlert();
                        g_dialog.hide(el);
                        todoObj.todo_work_list();
                    }
                });
            }
        },
        persontransfer:{
			tempObj:{
				//idmAd节点父级别ID
				idmad_Id:{id:"e496da46bd804926a541f2804c96024e",path:"20_22_"},
				//权限分配，并发任务父级别ID
                authorityTransfer_parentId:{id:"03d12ba3d6cb4f0b8ada36b8776424ad",path:"20_24_"},
				//顶级别path
				rootPath:"20_",
				//数据缓存配置
                dataCache:{
                    //职能
                    userPosts:{
                        //url地址
                        url:"functionManage/treeFunctions",
                        //配置
                        opts:{enableChk:false,onlyLastChild:false,id:"funId",label:"funName"},
                        //数据
                        datas:null
                    },
                    departs:{
                        url:"dailyOperation/selectGroupsAUsers",
                        opts:{enableChk:false,id:"groupId",label:"groupName",pId:"pId"},
                        datas:null
                    }
                },
				dataCacheFunction:function(dataEl,selectData,storeName,paramsObj,objData,dataCache,workorder,el) {
                    try{
                        if(storeName==null||typeof(storeName)=="undefined"||storeName.length<=0)
                            return;
                        if(dataCache[storeName]==null||typeof(dataCache[storeName])=="undefined")
                            return;
                        //如果已经有缓存了
                        if(dataCache[storeName].datas!=null&&typeof(dataCache[storeName].datas)!="undefined"&&dataCache[storeName].datas.length>0){
                            workorder.persontransfer.render_tree(dataEl,dataCache[storeName].datas,dataCache[storeName].opts,selectData);
                        }else{//没有缓存就请求缓存
                            um_ajax_post({
                                url : dataCache[storeName].url,
                                paramObj : paramsObj,
                                maskObj : el,
                                successCallBack : function (data){
                                    if(data!=null&&typeof(data)!="undefined"){
                                        var tempData=data;
                                        if(objData!=null&&typeof(objData)!="undefined"&&objData.length>0){
                                            tempData=tempData[objData];
                                            if(!(tempData!=null&&typeof(tempData)!="undefined")){
                                                tempData=[];
                                            }
                                        }
                                        dataCache[storeName].datas=tempData;
                                    }else{
                                        dataCache[storeName].datas=[];
                                    }
                                    workorder.persontransfer.render_tree(dataEl,dataCache[storeName].datas,dataCache[storeName].opts,selectData);
                                }
                            });
                        }
                    }catch(e){
                    	console.log(e);
					}
                }
			},
		    //初始化树
		    render_tree:function (el,datas,opts,selectData) {
		        inputdrop.renderTree(el,datas,opts);
		        if(selectData!=null&&typeof(selectData)!="undefined"&&selectData.length>0)
		            inputdrop.setDataTree(el,selectData);
            },
			//初始化处理
            step_init:function (el,rowData,workorder,obj) {
            	var workorder_div=$("#workorder_div"),workorder_form=workorder_div.find("#query_form");
            	var transferType=workorder_div.find("input:radio[name=transferType]"),hidden_steps=el.find("#hidden_steps");
            	var typeForm=workorder_form.find("[selfAttr=typeForm]"),transferDate=workorder_form.find("[data-id=transferDate]");
				var actTmpId=rowData.actTmpId;
				var nodeName=actTmpId.split("_")[1];
                var hasData=actTmpId!=null&&typeof(actTmpId)!="undefined"&&actTmpId.indexOf("step1")<0;
                if(hasData){
                    workorder_form.find("[data-type=date]").attr("data-type","");
                    workorder_form.find("[data-id]").attr("disabled",true);
                    workorder_form.find("label.i-checks").addClass("disabled");
                    el.css({width:"1000px"});
					workorder_form.append(hidden_steps.find("#step2"));
				}else{
                    timepicker.time(transferDate,{position:"absolute",type:"ymd"});
				}
                //数据缓存
                var dataCache=workorder.persontransfer.tempObj.dataCache;
				try{
                    if(!rowData.meLiActivitiIsEndData)
						eval(nodeName+"_init")();
					else
						endEvent_init();
				}catch(e){}
                //树形数据缓存函数
                var dataCacheTree=workorder.persontransfer.tempObj.dataCacheFunction;

				init_trigger();

            	//初始化事件
            	function init_trigger() {
                    transferType.change(function () {
                        typeForm.html("");
                        //设置当前显示的内容
                        typeForm.append(hidden_steps.find("[selfAttr=transferType"+$(this).val()+"]").clone().children());
                        var processDatas=el.data("workData");
                        var booExistData=processDatas!=null&&typeof(processDatas)!="undefined";
                        if(!booExistData)
                        	processDatas={};
                        if(hasData){
                            typeForm.find("[data-type=date]").attr("data-type","");
                            typeForm.find("[data-id]").attr("disabled",true);
                            typeForm.find("label.i-checks,div.inputdrop").addClass("disabled");
						}
                        var thisVal=$(this).val();
                        switch($(this).val()){
                            case "0":
                            case "1":
                                //部门
                                // dataCacheTree(typeForm.find("#inDepartId"+$(this).val()),processDatas["inDepartId"+thisVal],"departs",{roleType:3},null,dataCache,workorder,el);
                                //职务
                                // dataCacheTree(typeForm.find("#userPost"+$(this).val()),processDatas["userPost"+thisVal],"userPosts",{},null,dataCache,workorder,el);
                                if($(this).val()=="0")
                                    break;
                                //调出部门
                                // dataCacheTree(typeForm.find("#outDepartId"+$(this).val()),processDatas["outDepartId"+thisVal],"departs",{roleType:3},null,dataCache,workorder,el);
                                //原职务
                                // dataCacheTree(typeForm.find("#oldUserPost"+$(this).val()),processDatas["oldUserPost"+thisVal],"userPosts",{},null,dataCache,workorder,el);
                                break;
                            case "2":
                                break;
                            case "3":
                                // dataCacheTree(typeForm.find("#outDepartId"+$(this).val()),processDatas["outDepartId"+thisVal],"departs",{roleType:3},null,dataCache,workorder,el);
                                break;
                        }
						if(hasData){
                            typeForm.find(".col-lg-3").addClass("col-lg-4").removeClass("col-lg-3");
                        }
                        if(booExistData){
                            typeForm.umDataBind(processDatas);
                        }
                    });
                    if(!hasData){
                        typeForm.append(hidden_steps.find("[selfAttr=transferType0]").clone().children());
                    }
                    if(!hasData){
                        typeForm.oneTime(100,function () {
                            // dataCacheTree(typeForm.find("#inDepartId0"),null,"departs",{roleType:3},null,dataCache,workorder,el);
                            //职务
                            // dataCacheTree(typeForm.find("#userPost0"),null,"userPosts",{},null,dataCache,workorder,el);
                        });
                    }
                }

                /**
				 * 第一步初始化
                 */
                function step1_init() {
                    var tempStep1=el.find("#step1");
                    try{
                        tempStep1.find("[data-id=userName]").removeAttr("validate");
                        tempStep1.find("[data-id=userName]").parent().prev().removeClass("required");
					}catch(e){}
                    //IDM/AD用户
                    var tempIdmADUsers=[];
                    //transfer用户
                    var tempTransferAuthSystems=[];
                    um_ajax_post({
                        url : "involveSystem/systems",
                        paramObj : {userNotNull:true,systemPath:workorder.persontransfer.tempObj.rootPath,isUse:"0"},
                        maskObj:"body",
                        successCallBack : function(data){
                        	if(data!=null&&typeof(data)!="undefined"&&data.length>0){
                        		for(var i=0;i<data.length;i++){
                        			if(workorder.persontransfer.tempObj.idmad_Id.id==data[i].systemId){
                        				tempIdmADUsers.push(data[i]);
									}
									if(workorder.persontransfer.tempObj.authorityTransfer_parentId.id==data[i].pId){
                        				tempTransferAuthSystems.push(data[i]);
									}
								}
							}
							if(tempIdmADUsers.length==0)
                                g_dialog.operateAlert(el ,"IDM/AD节点未配置" ,"error");
                        	if(tempTransferAuthSystems.length==0)
                                g_dialog.operateAlert(el ,"权限调整未配置" ,"error");
                            tempStep1.data("systemUserData",{idmad:tempIdmADUsers,transferAuthSystem:tempTransferAuthSystems});
                        }
                    });
                }

                /**
				 * IDM/AD节点初始化
                 */
                function  idmad_init() {
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");
                    var step1=workorder_form.find("#step1");
                    var step1UserName=step1.find("[data-id=userName]");
                    step1UserName.attr("disabled",false);
                    var step2=workorder_form.find("#step2");
                    completeBtn.unbind("click");
                    //执行流程
                    completeBtn.click(function () {
                        var processDatas = el.data("workData");
                        if(!g_validate.validate(step1UserName.parent()))
                        	return;
                        if(processDatas){
                        	var tempData=step2.umDataBind("serialize");
                        	tempData.userName=step1UserName.val();
                        	//运行流程
                        	workorder.persontransfer.exeRunProcess(el,tempData,rowData,obj);
						}
                    });
                }

                /**
				 * 权限调配-并发任务
                 */
                function authorityTransfer_init() {
                    var completeBtn=el.find(".modal-footer [data-id=save]").text("完成");
                    var step2=el.find("#step2");
                    completeBtn.unbind("click");
                    completeBtn.click(function () {
                        var processDatas = el.data("workData");
                        if(processDatas){
                        	var tempData={};
                        	var selectOne=step2.find("input[data-id=system"+step2.data("nowSystemId")+"]");
                        	if(selectOne!=null&&typeof(selectOne)!="undefined"&&selectOne.length>0){
                        		var tempName=selectOne.attr("data-id");
                                var tempValue=selectOne.val();
                                var tempData={};
                                tempData[tempName]=tempValue;
                        		workorder.persontransfer.exeRunProcess(el,tempData,rowData,obj)
							}
                        }
                    });
                }

                /**
                 * 结束流程只能查看详细
                 */
                function endEvent_init() {
                    try{
                        var completeBtn=el.find(".modal-footer [data-id=save]");
                        completeBtn.hide();
                        completeBtn.unbind("click");
                    }catch(e){}
                    workorder_form.find("[data-id]").attr("disabled",true);
                    workorder_form.find("label.i-checks").addClass("disabled");
                }
            },
			//初始化后处理
            step_init_after:function(el,rowData,workorder,obj) {
                var workorder_div=$("#workorder_div"),workorder_form=workorder_div.find("#query_form");
                var hidden_steps=el.find("#hidden_steps")
                var processDatas = el.data("workData");
                var transferType=el.find("input:radio[name=transferType][value="+processDatas.transferType+"]");
                transferType.trigger("change");
                var actTmpId=rowData.actTmpId;
                var nodeName=actTmpId.split("_")[1];

				try{
                    if(!rowData.meLiActivitiIsEndData)
						eval(nodeName+"_after")();
					else
						endEvent_after();
				}catch(e){}


                /**
				 * IDM/AD after
                 */
				function idmad_after() {
                    init_system_div(null);
                }

                /**
				 * 权限调整，并发任务
                 */
                function authorityTransfer_after(){
                	var step2=workorder_form.find("#step2");
                    um_ajax_post({
                        url: "personTransfer/selectTaskVariables/"+rowData.workItemID,
                        paramObj: {},
                        maskObj: el,
                        successCallBack: function (data) {
                        	try{
                                step2.data("nowSystemId",data.authorityTransferOneUser);
							}catch(e){}
                            init_system_div(data.authorityTransferOneUser);
                        }
                    });
				}
                //初始化系统div
                function init_system_div(nowId){
                    var systems=processDatas.authorityTransferUsers;
                    var tempSystemStr="";
                    var systemDiv=el.find("#step2").find("[selfAttr=list]");
                    var idm_ad_array=[
                    	// {
                     //    systemId:"lionryIDM",
                     //    systemName:"IDM"
					// },
					// {
                     //    systemId:"lionryAD",
                     //    systemName:"AD"
					// },
					// {
					// 	systemId:"lionrywaiwangums",
					// 	systemName:"外网UMS"
					// },
					{
                        systemId:"lionryIDMADwaiwangums",
                        systemName:"IDM/AD/外网UMS"
					}];
                    if(systems!=null&&systems.length>0){
                        tempSystemStr=systems[0];
                        for(var i=1;i<systems.length;i++){
                            tempSystemStr+=","+systems[i];
                        }
                        var tempAdjustData={};
						try{
                            tempAdjustData=processDatas;
						}catch(e){}
                        um_ajax_post({
                            url : "involveSystem/selectByIds",
                            paramObj : {ids:tempSystemStr},
                            maskObj:"body",
                            successCallBack : function(data){
                                if(data!=null&&typeof(data)!="undefined"&&data.length>0){
                                	data=idm_ad_array.concat(data);
                                    var tempOne=null;
                                    var oneDiv=hidden_steps.find("[selfAttr=step2_list_one]");
                                    var tempStoredData=null;
                                    for(var i=0;i<data.length;i++){
                                        tempOne=oneDiv.clone();
                                        tempOne.find(".control-label").text(data[i].systemName);
                                        tempOne.find("input.form-control").attr("data-id","system"+data[i].systemId);
                                        tempStoredData=tempAdjustData["system"+data[i].systemId];
                                        if(tempStoredData!=null&&typeof(tempStoredData)!="undefined"&&tempStoredData.length>0)
                                            tempOne.find("[data-id=system"+data[i].systemId+"]").val(tempStoredData);
                                        //如果当前ID不等于此id，则禁用
                                        if((nowId!=null&&typeof(nowId)!="undefined"&&nowId!=data[i].systemId)||rowData.meLiActivitiIsEndData)
                                            tempOne.find("input.form-control").attr("disabled",true);
                                        systemDiv.append(tempOne);
                                    }
                                }
                                if(nowId==null&&!rowData.meLiActivitiIsEndData)
                                    systemDiv.find("input.form-control:gt(0)").attr("disabled",true);
                            }
                        });
                    }
				}

                /**
				 * 查看详细后事件
                 */
				function endEvent_after(){
                    init_system_div();
				}
            },
            //根据当前信息获取按钮获取按钮
            getButtons:function (rowData,obj,workorder) {
                var id = rowData.actTmpId;
                var tempButtons = [];
                var nowNode = null;
                if (id.split("_").length > 1)
                    nowNode = id.split("_")[1];
                switch (nowNode) {
                }
                return tempButtons;
            },
			//申请流程提交
            start_submit:function (el,workorder) {
            	var tempForm=el.find("#query_form");
            	if(!g_validate.validate(tempForm))
            		return;
            	var systemUserData=el.find("#step1").data("systemUserData");
            	if(systemUserData==null||typeof(systemUserData)=="undefined"){
                    g_dialog.operateAlert(el ,"流程节点未配置" ,"error");
                    return;
                }
                if(systemUserData.idmad.length<=0){
                    g_dialog.operateAlert(el ,"IDM/AD节点未配置" ,"error");
                    return;
				}
                if(systemUserData.transferAuthSystem.length<=0){
                    g_dialog.operateAlert(el ,"权限调整未配置" ,"error");
                    return;
				}

				var tempAuthSystemsUsers={};
                var tempAuthSystems=[];
                var tempUser=null;
                for(var i=0;i<systemUserData.transferAuthSystem.length;i++){
                    tempAuthSystems.push(systemUserData.transferAuthSystem[i].systemId);
                    tempUser=systemUserData.transferAuthSystem[i].systemUsers;
                    tempAuthSystemsUsers[systemUserData.transferAuthSystem[i].systemId]=tempUser;
				}
                var operHisParams={"operName":"申请人员转单"};
                var saveObj=tempForm.umDataBind("serialize");
                var url="workflow/createAndStartProcInst";
                saveObj.htmlFormKeyClass = "com.rh.soc.workflow.workflowmanage.form.personTransfer.controller.PersonTransferController";
                saveObj.htmlFormKeyClassMethod = "startProcess";
                saveObj.formFile = "persontransfer";
                saveObj.wf_step1_wfname="人员转单流程-"+saveObj.userFullName;
                saveObj.wf_step1_applicant_name=index_user_info.userName+"("+index_user_info.userAccount+")";
                saveObj.IMADCandidateUsers=systemUserData.idmad[0].systemUsers;
                saveObj.authorityTransferUsers=tempAuthSystems;
                saveObj.authoritySystemUserMap=JSON.stringify(tempAuthSystemsUsers);
                var obj = new Object();
                obj.assetApplyStep1Apply = saveObj;
                obj.curstep = "assetApplyStep1Apply";
                obj.procDefID = "persontransfer:2:90004";
                obj.proInsId = "";
                obj.businessKey = "";
                obj.type = "event";
                obj.operHisParams=operHisParams;
                um_ajax_post({
                    url : url,
                    paramObj : {workflowinfo:obj},
                    maskObj:"body",
                    successCallBack : function(){
                        g_dialog.operateAlert();
                        window.location.href = "#/oper_workorder/workorder_handle/workorder_apply"
                    }
                });
            },
			//运行流程
			exeRunProcess:function(el,tempData,rowData,todoObj,reqData){
				if(reqData==null||typeof(reqData)=="undefined")
					reqData={};
				var obj ={};
				$.extend(true,obj,reqData);
				obj.variables = tempData;
				obj.taskId = rowData.workItemID;
				obj.procInsId = rowData.processInstanceID;
				um_ajax_post({
					url : "workflow/execute",
					paramObj : obj,
					maskObj : "body",
					successCallBack : function (data){
						g_dialog.operateAlert();
						g_dialog.hide(el);
						todoObj.todo_work_list();
					}
				});
			},
			//浏览历史操作记录
            his_data_init:function (el,rowData,workorder,obj,data) {
                var hisDiv=el.find("#his_table_div");
                var curDiv=el.find("#cur_table_div");
                var hisTab=el.find("[data-id=tab-ul]").find("li:eq(2)");

                var his_tab_click=function(){
                    g_grid.resizeSup(hisDiv);
                    g_grid.resizeSup(curDiv);
                }
                var tempConfig1={
                    header:[
                        {align:"center",text:"当前节点",name:"actName"},
                        {align:"center",text:"开始时间",name:"startTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"节点处理人",name:"userName"},
                        {align:"center",text:"备注",name:"memo"}
                    ],
                    operWidth : "100px",
                    paginator : false,
                    allowCheckBox:false,
                    data : [],
                    hasBorder : true,
                    hideSearch :true
                };
                var tempConfig={
                    header:[
                        {align:"center",text:"处理节点",name:"actName"},
                        {align:"center",text:"开始时间",name:"startTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"处理时间",name:"endTime",render:function (text,data) {
                            return text;
                        }},
                        {align:"center",text:"处理人",name:"assigneeName"},
                        {align:"center",text:"操作",name:"operName"},
						{align:"center",text:"备注",name:"memo"}
                    ],
                    operWidth : "100px",
                    paginator : false,
                    data : [],
                    hasBorder : true,
                    hideSearch :true
                };
                var hisData=data.hList;
                var cData=data.cList;
                if(cData==null||typeof(cData)=="undefined")
                    cData=[];
                if(hisData==null||typeof(hisData)=="undefined")
                    hisData=[];
                var tempExecutions=[];
                var indexArray=[];
				for(var i=0;i<cData.length;i++){
					if(cData[i].actId=="persontransfer_authorityTransfer"){
						tempExecutions.push(cData[i].executionId);
						indexArray.push({idx:i,type:"c"});
					}
				}
				for(var i=0;i<hisData.length;i++){
					if(hisData[i].actId=="persontransfer_authorityTransfer"){
						tempExecutions.push(hisData[i].executionId);
						indexArray.push({idx:i,type:"his"});
					}
				}
                if(tempExecutions.length>0){
                    var executions=tempExecutions[0];
                    for(var i=1;i<tempExecutions.length;i++){
                        executions+=","+tempExecutions[i];
                    }
                    var tempReqData={executions:executions,procInstId:rowData.processInstanceID};
                    um_ajax_post({
                        url : "personTransfer/hisExecutionTransfers",
                        paramObj : tempReqData,
                        maskObj : "body",
                        successCallBack : function (resData){
                            try{
                                for(var i=0;i<resData.length;i++){
                                	switch(indexArray[i].type){
										case "his":
                                            hisData[indexArray[i].idx].memo=resData[i].systemName;
											break;
										case "c":
                                            cData[indexArray[i].idx].memo=resData[i].systemName;
											break;
									}
                                }
                            }catch(e){}
                            show_data(hisData,cData);
                        }
                    });
                }else{
                    show_data(hisData,cData);
                }

				function show_data(showDatas,cData) {
                    g_grid.render(curDiv,tempConfig1);
                    g_grid.render(hisDiv,tempConfig);
                    if(showDatas.length>0){
                        hisDiv.oneTime(1000,function(){
                        	try{
                        		if(showDatas.length>0)
                        			showDatas[showDatas.length-1].userName=rowData.approveUser;
							}catch(e){}
                            g_grid.addData(hisDiv,showDatas);
                        });
                    }
                    if(cData.length>0){
                        hisDiv.oneTime(1000,function(){
                            g_grid.addData(curDiv,cData);
                        });
                    }
                    hisTab.unbind("click",his_tab_click);
                    hisTab.bind("click",his_tab_click);
                }
            }
		}
	}
});