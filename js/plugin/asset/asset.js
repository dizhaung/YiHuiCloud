define(['/js/plugin/tab/tab.js' ,'inputdrop' ,
		'/js/plugin/tree/tree.js',
		'/js/plugin/asset/interface.js'] ,function (tab ,inputdrop ,tree, interface){

	var version_map = new HashMap();
	version_map.put("1" ,"SNMP V1");
	version_map.put("2" ,"SNMP V2c");
	version_map.put("3" ,"SNMP V3");

	var authWay_map = new HashMap();
	authWay_map.put("" ,"");
	authWay_map.put("1" ,"SHA");
	authWay_map.put("2" ,"MD5");

	var encryptionWay_map = new HashMap();
	encryptionWay_map.put("" ,"");
	encryptionWay_map.put("1" ,"3DES");
	encryptionWay_map.put("2" ,"AES128");
	encryptionWay_map.put("3" ,"AES192");
	encryptionWay_map.put("4" ,"AES256");
	encryptionWay_map.put("5" ,"DES");

	// 资产详情url
	var right_asset_detail_url = "AssetOperation/queryAssetDetail";
	// 表单树类型
	var form_tree_url = "AssetOperation/queryDialogTreeList";
	// codeList
	var form_codeList_url = "rpc/getCodeList";
	// 自定义属性
	var form_custom_attr_url = "AssetOperation/queryCustomProperty";
	// 获取IP列表
	var form_asset_ip_conflict_url = "AssetOperation/doBatchAssetIpConflict";
	// 资产批量修改
	var asset_batch_UpdAsset_url = "AssetOperation/batchUpdAsset";

	return {
		detailDialog : function (opt)
		{
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset.html",
				success :function(data)
				{
					g_dialog.dialog(data,{
						width:"900px",
						init:init,
						initAfter:initAfter,
						title : "资产详细信息",
						isDetail:true,
						top:"6%"
						//autoHeight : "autoHeight"
					});

					function init(el){
						tab.tab(el.find("[id=tab]"),{oper : [null,null,null,function (){
							change_record_list(el ,opt.id);
						}]});						

						el.find("[data-id=snmpVersion]").change(function (){
							var id = $(this).val();
							if (id == "1" || id == "2")
							{
								el.find("[id=snmp_v1]").show();
								el.find("[id=snmp_v3]").hide();
							}
							else
							{
								el.find("[id=snmp_v1]").hide();
								el.find("[id=snmp_v3]").show();
							}
						});
					}

					function initAfter(el){
						um_ajax_get({
							url : "AssetOperation/queryAssetDetail",
							paramObj : {edId : opt.id ,mainIp : opt.mainIp},
							maskObj : "body",
							successCallBack : function (data){
								$("#asset_div").umDataBind("render" ,data.assetStore);
								el.find("[data-id=cpu]").html(data.assetStore.cpu);
								$("#asset_append_div").umDataBind("render" ,data.assetAppendStore);
								$("#tab_snmp").umDataBind("render" ,data.assetSnmpStore);
								if (data.assetSnmpStore.snmpCommunity && data.assetSnmpStore.snmpCommunity.length != 0)
								{
									el.find("[data-id=snmpCommunity]").text(data.assetSnmpStore.snmpCommunity.replace(/./g ,"*"));
								}
								if (data.assetSnmpStore.snmpWCommunity && data.assetSnmpStore.snmpWCommunity.length != 0)
								{
									el.find("[data-id=snmpWCommunity]").text(data.assetSnmpStore.snmpWCommunity.replace(/./g ,"*"));
								}
								el.find("[data-id=authWay]").text(data.assetSnmpStore.authWay?authWay_map.get(data.assetSnmpStore.authWay):"");
								el.find("[data-id=encryptionWay]").text(data.assetSnmpStore.encryptionWay?encryptionWay_map.get(data.assetSnmpStore.encryptionWay):"");
								if(data.assetSnmpStore.authPwd && data.assetSnmpStore.authPwd.length != 0)
								{
									el.find("[data-id=authPwd]").text(data.assetSnmpStore.authPwd.replace(/.*/g ,"*"));
								}
								
								if(data.assetSnmpStore.encryptionPwd && data.assetSnmpStore.encryptionPwd.length != 0)
								{
									el.find("[data-id=encryptionPwd]").text(data.assetSnmpStore.encryptionPwd.replace(/.*/g ,"*"));
								}
								$("#tab_telnet").umDataBind("render" ,data.telnetStore);
								$("#tab_ssh").umDataBind("render" ,data.sshStore);
								$("#lend_out_div").umDataBind("render" ,data.borrowStore);
								//$("#custom_div").umDataBind("render" ,data.costomPropertyStore);
								custom_div_render();
								function custom_div_render(){
									var el_form_custom_attr = $("#custom_div").find("form");
				    		 		var tmpObj;
				    		 		var isRequired = "";
				    		 		data.propertyStore = data.costomPropertyStore;
				    		 		for (i = 0; i < data.propertyStore.length; i++)
				    		 		{
				    		 			
				    		 			tmpObj = data.propertyStore[i];
				    		 			isRequired = (tmpObj.nullable == "1" ? "" : "required");
				    		 			 //第0行 2行
				    		 			 if (i%2 == 0)
				    		 			 {
											el_form_custom_attr.append('<div class="form-group" data-group="'+i+'">'
												+'<label class="col-lg-3 control-label tr">'+tmpObj.columnName+'：</label>'
												+'<label class="col-lg-3 control-label tl">'+tmpObj.dataValue+'</label></div>');
											
				    		 			 }
				    		 			 if ((i+1)%2 == 0)
				    		 			 {
				    		 			 	el_form_custom_attr.find("[data-group="+(i-1)+"]").append('<label class="col-lg-2 control-label tr">'+tmpObj.columnName+'：</label>'
												+'<label class="col-lg-3 control-label tl">'+tmpObj.dataValue+'</label>');
				    		 			 }
				    		 			isRequired = "";
				    		 		}
								}
								
			    		 		el.find("[data-id=snmpVersion]").change();
								el.find("[data-id=snmpVersion]").attr("disabled" ,"disabled");
								el.find("[data-id=snmp]").css("margin-top" ,"6px");
								el.find("[data-id=snmp]").html(el.find("[data-id=snmpVersion]").find("option:selected").text());
							}
						});

					}
				}
			});
		},
		assetElDialog : function (opt){
			g_dialog.elDialog({
				url: "js/plugin/asset/asset_new.html",
				title : opt.title ? opt.title : "资产详情页",
				cbf: function(){
					var el = $(".umElDialog-content");
					el.find("[data-id=snmpVersion]").change(function (){
						var id = $(this).val();
						if (id == "1" || id == "2")
						{
							el.find("[id=snmp_v1]").show();
							el.find("[id=snmp_v3]").hide();
						}
						else
						{
							el.find("[id=snmp_v1]").hide();
							el.find("[id=snmp_v3]").show();
						}
					});
					um_ajax_get({
						url : "AssetOperation/queryAssetDetail",
						paramObj : {edId : opt.id ,mainIp : opt.mainIp},
						maskObj : "body",
						successCallBack : function (data){
							$("#asset_div").umDataBind("render" ,data.assetStore);
							el.find("[data-id=cpu]").html(data.assetStore.cpu);
							$("#asset_append_div").umDataBind("render" ,data.assetAppendStore);
							$("#tab_snmp").umDataBind("render" ,data.assetSnmpStore);
							if (data.assetSnmpStore.snmpCommunity && data.assetSnmpStore.snmpCommunity.length != 0)
							{
								el.find("[data-id=snmpCommunity]").text(data.assetSnmpStore.snmpCommunity.replace(/./g ,"*"));
							}
							if (data.assetSnmpStore.snmpWCommunity && data.assetSnmpStore.snmpWCommunity.length != 0)
							{
								el.find("[data-id=snmpWCommunity]").text(data.assetSnmpStore.snmpWCommunity.replace(/./g ,"*"));
							}
							el.find("[data-id=authWay]").text(data.assetSnmpStore.authWay?authWay_map.get(data.assetSnmpStore.authWay):"");
							el.find("[data-id=encryptionWay]").text(data.assetSnmpStore.encryptionWay?encryptionWay_map.get(data.assetSnmpStore.encryptionWay):"");
							if(data.assetSnmpStore.authPwd && data.assetSnmpStore.authPwd.length != 0)
							{
								el.find("[data-id=authPwd]").text(data.assetSnmpStore.authPwd.replace(/.*/g ,"*"));
							}
							
							if(data.assetSnmpStore.encryptionPwd && data.assetSnmpStore.encryptionPwd.length != 0)
							{
								el.find("[data-id=encryptionPwd]").text(data.assetSnmpStore.encryptionPwd.replace(/.*/g ,"*"));
							}
							$("#tab_telnet").umDataBind("render" ,data.telnetStore);
							$("#tab_ssh").umDataBind("render" ,data.sshStore);
							$("[data-id=monitorPassWord]").text("***");
							// $("#lend_out_div").umDataBind("render" ,data.borrowStore);
							//$("#custom_div").umDataBind("render" ,data.costomPropertyStore);
							custom_div_render();
							function custom_div_render(){
								var el_form_custom_attr = $("#custom_div").find("form");
			    		 		var tmpObj;
			    		 		var isRequired = "";
			    		 		data.propertyStore = data.costomPropertyStore;
			    		 		for (i = 0; i < data.propertyStore.length; i++)
			    		 		{
			    		 			
			    		 			tmpObj = data.propertyStore[i];
			    		 			isRequired = (tmpObj.nullable == "1" ? "" : "required");
			    		 			 //第0行 2行
			    		 			 if (i%2 == 0)
			    		 			 {
										el_form_custom_attr.append('<div class="form-group" data-group="'+i+'">'
											+'<label class="col-lg-3 control-label tr">'+tmpObj.columnName+'：</label>'
											+'<label class="col-lg-3 control-label tl">'+tmpObj.dataValue+'</label></div>');
										
			    		 			 }
			    		 			 if ((i+1)%2 == 0)
			    		 			 {
			    		 			 	el_form_custom_attr.find("[data-group="+(i-1)+"]").append('<label class="col-lg-2 control-label tr">'+tmpObj.columnName+'：</label>'
											+'<label class="col-lg-3 control-label tl">'+tmpObj.dataValue+'</label>');
			    		 			 }
			    		 			isRequired = "";
			    		 		}
							}
							
		    		 		el.find("[data-id=snmpVersion]").change();
							el.find("[data-id=snmpVersion]").attr("disabled" ,"disabled");
							el.find("[data-id=snmp]").css("margin-top" ,"6px");
							el.find("[data-id=snmp]").html(el.find("[data-id=snmpVersion]").find("option:selected").text());
						}
					});
				}
			})
		},
		queryDialog : function (opt){
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=query_template]"),{
						width:"1000px",
						init:init,
						initAfter:initAfter,
						saveclick:save_click,
						title:"资产查询"
					});
				}
			});
			function init(el)
			{
				el.find("[name=ipRadioStatus]").click(function (){
					if ($(this).val() == "0")
					{
						el.find("[id=ipRadioStatusStartIp]").removeAttr("disabled");
						el.find("#ipRadioStatusEndIp").removeAttr("disabled");
						el.find("#ipRadioStatusIpv6").attr("disabled" ,"disabled");
						el.find("#ipRadioStatusIpv6").val("");
					}
					else
					{
						el.find("#ipRadioStatusStartIp").attr("disabled" ,"disabled");
						el.find("#ipRadioStatusEndIp").attr("disabled" ,"disabled");
						el.find("#ipRadioStatusIpv6").removeAttr("disabled");
						el.find("#ipRadioStatusStartIp").val("");
						el.find("#ipRadioStatusEndIp").val("");
					}
				});
			}
			function initAfter(el)
			{
				g_formel.sec_biz_render({secEl:el.find("[id=securityDomain]"),chkboxType:{ "Y": "ps", "N": "ps" }});
		    	g_formel.sec_biz_render({bizEl:el.find("[id=bussinessDomain]"),chkboxType:{ "Y": "ps", "N": "ps" }});
		    	g_formel.sec_biz_render({assetTypeEl:el.find("[id=assetType]"),chkboxType:{ "Y": "ps", "N": "ps" }});

		    	g_formel.code_list_render({
									   	   		key : "osCodeList",
									   	   		osCodeEl : el.find("[data-id=osType]")
									   	    });

			}
			function save_click(el ,saveObj)
			{
				opt.saveclick && opt.saveclick(saveObj,opt.selfEl);
				g_dialog.hide(el);
			}
		},
		assetListDialog : function (opt){
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset_tpl.html",
				success: function(data) {
					g_dialog.dialog($(data).find("[id=asset_list_tpl]"), {
						width: "830px",
						title:"资产列表",
						init: init,
						saveclick: save
					});
				}
			});
			function init(el){
				g_grid.render($("#table_1"), {
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
											secEl : el.find("div")
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
					url: "AssetOperation/queryAsset",
					allowCheckBox: true,
					paramObj:{noIpFlag:"0"},
					hideSearch:false,
					checkType : "radio"
				});
			}
			function save(el){
				var data = g_grid.getData(el.find("#table_1") ,{chk:true})
				if (data.length == 0)
				{
					g_dialog.operateAlert(null ,"请选择一条资产。" ,"error")
					return false
				}
				opt.cbf && opt.cbf(data)
				g_dialog.hide(el)
			}
		},
		assetEditDialog : function(opt){
			var self = this
			var rowData = opt.rowData;
			var type = opt.type;
			var cbf = opt.cbf;
			var snmpMap = new HashMap();
			right_asset_detail_url = "AssetOperation/queryAssetDetail";
			if (opt.detailUrl)
			{
				right_asset_detail_url = opt.detailUrl;
			}

			g_dialog.elDialog({
				url : "module/monitor_info/asset_info/oper_asset_tpl.html",
				selector : "#asset_add_tpl",
				title: "资产编辑",
				cssName : "monitorElDialog",
				cbf : function (){
					init($("#asset_add_tpl").parent())
					initAfter($("#asset_add_tpl").parent())
				},
				back_cbf : function (){
					g_dialog.elDialogHide()
					opt.backCbf()
				}
			})

			function init(el){
				g_validate.init(el)
				if (type == "batch")
				{
					batch_add_init(el,function(){
						var ip_info = ip_mac_data_get(el.find("[id=base_info_div]"));
						if (ip_info.mainIp) {
			  	  			el.find("[data-val*=test_ip]").find("option").remove();
			  	  			testIpSelRender(el ,"test_ip1" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip2" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip3" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip4" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip5" ,ip_info.mainIp);
			  	  		}
					})
					el.find("#ip_mac_div").remove()

				} else {
					el.find("#ip_range_div").remove()
				}
				el.find(".__content.__kv").css("opacity" ,"0");

				el.delegate('.other-info-expand', 'click',function(){
					el.find("#other_info_div").show()
					$(this).removeClass("other-info-expand")
					$(this).addClass("other-info-close")
				})
				el.delegate('.other-info-close', 'click',function(){
					el.find("#other_info_div").hide()
					$(this).addClass("other-info-expand")
					$(this).removeClass("other-info-close")
				})
				el.delegate('.extend-info-expand', 'click',function(){
					el.find("#extend_info_div").show()
					$(this).removeClass("extend-info-expand")
					$(this).addClass("extend-info-close")
				})
				el.delegate('.extend-info-close', 'click',function(){
					el.find("#extend_info_div").hide()
					$(this).addClass("extend-info-expand")
					$(this).removeClass("extend-info-close")
				})

				index_create_asset_status_select_el(el.find("[data-id=edTempStatus]"));
				el.find("[name=snmpStatus]").click(function(){
					if($(this).is(":checked"))
					{
						el.find("[id=snmp_mask]").hide();
					}
					else{
						el.find("[id=snmp_mask]").show();
						g_validate.reset(el.find("[id=snmp_info]"))
					}
				});

				el.find("[data-id=snmpVersion]").change(function (){
					var id = $(this).val();
					el.find("[id=snmp_info]").show();
					if (id == "1" || id == "2")
					{
						dis(el.find("[id=snmp_v1]"),["input","select"],true);// 去掉snmpv1中input,select的disabled属性
						el.find("[id=snmp_v1]").show();
						el.find("[id=snmp_v3]").hide();
						dis(el.find("[id=snmp_v3]"),["input","select"]);// 为snmpv3中的input和select添加disabled属性
					}
					else if (id == "")
					{
						el.find("[id=snmp_info]").hide();
						dis(el.find("[id=snmp_info]"),["input","select"])
					}
					else
					{
						el.find("[id=snmp_v1]").hide();
						el.find("[id=snmp_v3]").show();
						dis(el.find("[id=snmp_v1]"),["input","select"]);
						dis(el.find("[id=snmp_v3]"),["input","select"],true);
					}
					el.find("[data-id=securityLevel]").trigger("change")
				});

				el.find("[data-id=securityLevel]").change(function(){
					var authWay = el.find("[data-id=authWay]");
					var authPwd = el.find("[data-id=authPwd]");
					var encryptionWay = el.find("[data-id=encryptionWay]");
					var encryptionPwd = el.find("[data-id=encryptionPwd]");

					if($(this).val() == '1'){
						authWay.val(-1);
						authWay.trigger('change');
						authWay.attr("disabled" ,"disabled");
						authPwd.val('');
						authPwd.attr("disabled" ,"disabled");
						encryptionWay.val(-1)
						encryptionWay.trigger("change");
						encryptionWay.attr("disabled" ,"disabled");
						encryptionPwd.val('');
						encryptionPwd.attr("disabled" ,"disabled");
					}else if($(this).val() == '2'){
						authWay.removeAttr("disabled");
						authPwd.removeAttr("disabled");
						encryptionWay.val(-1)
						encryptionWay.trigger("change");
						encryptionWay.attr("disabled" ,"disabled");
						encryptionPwd.val('');
						encryptionPwd.attr("disabled" ,"disabled");
					}else if($(this).val() == '3'){
						authWay.removeAttr("disabled");
						authPwd.removeAttr("disabled");
						encryptionWay.removeAttr("disabled");
						encryptionPwd.removeAttr("disabled");
					}else {

					}
				});

				el.find('[data-id=authWay]').change(function (){
					if($(this).val()== '-1' || !$(this).val()){
						el.find('[data-id=authPwd]').val('');
						el.find('[data-id=authPwd]').attr("disabled" ,"disabled");
					}else {
						el.find('[data-id=authPwd]').removeAttr("disabled");
					}
				});

				el.find('[data-id=encryptionWay]').change(function (){
					if($(this).val()== '-1' || !$(this).val()){
						el.find('[data-id=encryptionPwd]').val('');
						el.find('[data-id=encryptionPwd]').attr("disabled" ,"disabled");
					}else {
						el.find('[data-id=encryptionPwd]').removeAttr("disabled");
					}
				});

				el.find("[data-type=test_btn]").click(function (){
					snmp_telnet_ssh2_test(el ,$(this).attr("data-url") ,$(this).attr("data-tab"));
				});

				el.find("[data-id=assetValue]").change(function (){
					if ($(this).val() != "")
					{
						g_validate.clear([$(this)]);
					}
				});

				//提交
				el.find("#save_btn").click(function(){
					save_click(el)
				})
			}

			function initAfter(el){
				
				var el_form_base_info = el.find("[id=base_info_div]")
	  	  		
	  	  		el_form_base_info.find("[data-id=osType]").change(function(){
	  	  			if (el_form_base_info.find("[data-id=osType]").val() == "107")
		  	  		{
		  	  			el.find("[data-id=tab-ul]").find("li").eq(1).hide();
		  	  			el.find("[data-id=tab-ul]").find("li").eq(2).hide();
		  	  			el.find("[data-id=tab-ul]").find("li").eq(3).show();
		  	  			el.find("[data-id=tab-ul]").find("li").eq(4).hide();
		  	  		} else {
		  	  			el.find("[data-id=tab-ul]").find("li").eq(1).show();
		  	  			el.find("[data-id=tab-ul]").find("li").eq(2).show();
		  	  			el.find("[data-id=tab-ul]").find("li").eq(3).hide();
		  	  			el.find("[data-id=tab-ul]").find("li").eq(4).hide();
		  	  		}
	  	  		})
	  	  		
	  	  		el.find('select').trigger('change');
	  	  		setTimeout(function (){
	  	  			g_dialog.waitingAlert();
	  	  		} ,0)
	  	  		
	  	  		// 第一层
			    um_ajax_get({
			 	    url: form_tree_url,
				    isLoad: false,
				    successCallBack:function (data){
				        // 渲染业务域
					    inputdrop.renderTree(el.find('[id=bussinessDomainId]') ,data.businessDomainTreeStore);
					    // 渲染安全域
					    inputdrop.renderTree(el.find('[id=securityDomainId]') ,data.securityDomainTreeStore ,{contentWidth : 10});
					    // 渲染资产类型
					    inputdrop.renderTree(el.find('[id=assetTypeId]') ,data.assetTypeTreeStore ,{enableChk:false});
					    //渲染业务系统
					     inputdrop.renderTree(el.find('[id=bussinessSystemId]') ,data.bussinessSystemTreeStore ,{contentWidth : 10,searchBox:true});
					    tab.tab(el.find("[id=tab]") ,{
					    	oper:[]
					    });

					    // 第二层
					    um_ajax_get({
					    	url: form_codeList_url,
					    	isLoad: false,
					    	paramObj : {key:"assetModelCodeList,osCodeList,factoryManageList,snmpCodelist,computerRoomLocationList"},
					    	successCallBack:function (data){
					    		var data2 = data.assetModelCodeList;
					    		for (var i = 0; i < data2.length; i++) {
					    			data2[i].id = data2[i].codevalue;
					    			data2[i].text = data2[i].codename;
					    		}
					    		el.find("[data-id=assetModel]").select2({
					    			data:data2,width:"100%"
					    		});

					    		var data1 = data.osCodeList;
					    		for (var i = 0; i < data1.length; i++) {
					    			data1[i].id = data1[i].codevalue;
					    			data1[i].text = data1[i].codename;
					    		}
					    		el.find("[data-id=osType]").select2({
					    			data:data1,width:"100%"
					    		});

					    		var data3 = (data.factoryManageList?data.factoryManageList:[]);
					    		for (var i = 0; i < data3.length; i++) {
					    			data3[i].id = data3[i].supCode;
					    			data3[i].text = data3[i].supName;
					    		}
					    		data3.insert(0 ,{id:"-1" ,text:"---"});
					    		el.find("[data-id=supplierId]").select2({
					    			data:data3,width:"100%"
					    		});

					    		var data4 = data.snmpCodelist;
					    		for (var i = 0; i < data4.length; i++) {
					    			data4[i].id = data4[i].codevalue;
					    			data4[i].text = data4[i].codename;
					    			snmpMap.put(data4[i].id ,data4[i]);
					    		}
					    		data4.insert(0 ,{id:"-1",text:"---"});
					    		el.find("[data-id=snmpName]").select2({
					    			data:data4,width:"100%"
					    		});

					    		initSnmpEvent(el ,rowData ,snmpMap);

					    		inputdrop.renderTree(el.find('[id=locationCb]') ,data.computerRoomLocationList ,{
					    									pId:"pldNo",
					    									label:"ldName",
					    									id:"ldNo",
					    									enableChk:false
					    							});

			    		 		// 第四层
			    		 		if (rowData)
								{
									um_ajax_get({
										url : right_asset_detail_url,
										paramObj : {edId : rowData.edId ,mainIp:rowData.mainIp},
										isLoad : false,
										successCallBack : function (data){
											g_dialog.waitingAlertHide();
											index_form_init($("#asset_add_tpl"))
											dialog_asset_render(el ,data ,type)
											el.find(".__content.__kv").css("opacity" ,"1");
										}
									});
								}
								if (!rowData)
								{	
									g_dialog.waitingAlertHide();
									index_form_init($("#asset_add_tpl"))
									el.find(".__content.__kv").css("opacity" ,"1");

								}

					    	}
					    });
					    //添加的时候获取责任人列表
					    um_ajax_get({
							url: "AssetOperation/queryResponsePerson",
					    	isLoad: false,
					    	successCallBack:function (data){
					    		for (var i = 0; i < data.length; i++) {
									el.find("[data-id=liablePersonId]").append('<option value="'+data[i].userId+'">'+data[i].userName+'</option>');
								}
								// el.find("[data-id=liablePersonId]").on('select2:selecting', function (evt) {
								//   	if (el.find("[data-id=liablePersonId]").val() && el.find("[data-id=liablePersonId]").val().length >= 2)
								//   	{
								//   		return false;
								//   	}
								// });
					    	}
					    });
				    }
			    });

				// 资产价值开关
		  		el.find("[name=isComputeRisk]").click(function (){
					var tmp = $(this).val();
					if (tmp == "1"){
						el.find("[data-id=assetValue]").removeAttr("disabled");
					}
					else if (tmp == "0"){
						el.find("[data-id=assetValue]").attr("disabled","disabled");
						g_validate.clear([$("[data-id=assetValue]")]);
					}
				});

			    el.find("[id=ip_mac_add_i]").click(function (){
					ip_mac_add(el.find("[id=ip_mac_table]"),false, false, function(){
						var ip_info = ip_mac_data_get(el.find("[id=base_info_div]"));
						if (ip_info.mainIp) {
			  	  			el.find("[data-val*=test_ip]").find("option").remove();
			  	  			testIpSelRender(el ,"test_ip1" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip2" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip3" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip4" ,ip_info.mainIp);
			  	  			testIpSelRender(el ,"test_ip5" ,ip_info.mainIp);
			  	  		}
					});
			    });

			    el.find("[id=asset_find]").click(function (){
			    	var ip_info = ip_mac_data_get(el.find("[id=base_info_div]"));
			    	var bussinessDomainId = el.find("[data-id=bussinessDomainId]").val();
			    	var securityDomainId = el.find("[data-id=securityDomainId]").val();
			    	if (!ip_info.mainIp)
			    	{
			    		g_dialog.operateAlert(el ,"请选择主IP" ,"error")
			    		return false;
			    	}
					um_ajax_get({
						url : "AssetOperation/findAssetByIp",
						paramObj : {bussinessDomainId:bussinessDomainId,
									securityDomainId:securityDomainId,
									mainIp:ip_info.mainIp},
						maskObj : "body",
						successCallBack : function (data){
							g_dialog.operateAlert()
							if (data.assetStore && data.assetStore.osType)
							{
								el.find("[data-id=osType]").val(data.assetStore.osType);
								el.find("[data-id=osType]").trigger("change");
							}
							if (data.assetStore && data.assetStore.assetTypeId)
							{
								inputdrop.setDataTree(el.find("[id=assetTypeId]") ,data.assetStore.assetTypeId);
							}
							if (data.assetStore && data.assetStore.mainMac)
							{
								$("[class*=rh-icon-star]").not("[class*=gc]")
														.closest('tr').find("td").eq(1).html(data.assetStore.mainMac);
							}
						}
					});
			    });
			}

			function save_click(el){
				if (type == "batch") {
					el.find("[data-id=batchIpRange]").val(ip_range_create(el.find("#ip_range_div")));
					if (!el.find("[data-id=batchIpRange]").val()) {
						g_dialog.operateAlert(el ,"请选择IP" ,"error");
						return false
					}
				}
				if (!g_validate.validate(el)) {
	  		  	  	g_dialog.operateAlert(null ,"请完善信息。" ,"error")
	  		  	  	return false
	  		  	}
	  		  	oper_asset_save(el ,type,cbf ,opt.updateUrl);
			}
		},
		batchEditDialog : function (opt){
			var title = "资产批量修改";
			if(opt.title)
			{
				title = opt.title;
			}
			$.ajax({
					type: "GET",
					url: "module/monitor_info/asset_info/oper_asset_tpl.html",
					success :function(data)
					{
						g_dialog.dialog($(data).find("[id=asset_batch_update]"),{
							width:"650px",
							init:init,
							initAfter:initAfter,
							saveclick:save_click,
							title:title,
							autoHeight:true,
						});
						function init(el)
						{	
							g_validate.init($("#asset_batch_update"));
							el.find("[name=check_all]").click(function(){
								if($(this).is(":checked"))
						   		{
						   			el.find("[type=checkbox]").not("[name=check_all]").prop("checked","checked");
						   			el.find("[data-id=assetValue]").attr("validate","required");
						   			el.find("[id=assetTypeId]").find("input").eq(0).attr("validate","required");
						   			el.find("[id=securityDomainId]").find("input").eq(0).attr("validate","required");
						   			el.find("[id=bussinessDomainId]").find("input").eq(0).attr("validate","required");
						   			el.find("[data-id=osType]").attr("validate","required");
									el.find("[data-id=liablePersonId]").attr("validate","required");
									el.find("[id=bussinessSystemId]").find("input").eq(0).attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[type=checkbox]").not("[name=check_all]").removeAttr("checked");
						   			el.find("[data-id=assetValue]").removeAttr("validate");
						   			g_validate.clear([$("[data-id=assetValue]")]);
									el.find("[id=assetTypeId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=assetTypeId]")]);
									el.find("[id=securityDomainId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=securityDomainId]")]);
									el.find("[id=bussinessDomainId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=bussinessDomainId]")]);
									el.find("[data-id=osType]").removeAttr("validate");
						   			g_validate.clear([$("[data-id=osType]")]);
									el.find("[data-id=liablePersonId]").removeAttr("validate");
						   			g_validate.clear([$("[data-id=liablePersonId]")]);
						   			el.find("[id=bussinessSystemId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=bussinessSystemId]")]);
						   		}
							});

					  		el.find("[name=isComputeRisk]").click(function (){
								var tmp = $(this).val();
								if (tmp == "1"){
									el.find("[data-id=assetValue]").removeAttr("disabled");
								}
								else if (tmp == "0"){
									el.find("[data-id=assetValue]").attr("disabled","disabled");
									g_validate.clear([$("[data-id=assetValue]")]);
								}
							});

							el.find("[data-flag*=assetValue]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[data-id=assetValue]").attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[data-id=assetValue]").removeAttr("validate");
						   			g_validate.clear([$("[data-id=assetValue]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });
							
						   el.find("[data-flag=assetTypeId]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[id=assetTypeId]").find("input").eq(0).attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[id=assetTypeId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=assetTypeId]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });

						   el.find("[data-flag=securityDomainId]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[id=securityDomainId]").find("input").eq(0).attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[id=securityDomainId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=securityDomainId]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });

						   el.find("[data-flag=bussinessDomainId]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[id=bussinessDomainId]").find("input").eq(0).attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[id=bussinessDomainId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=bussinessDomainId]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });

						   el.find("[data-flag=bussinessSystemId]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[id=bussinessSystemId]").find("input").eq(0).attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[id=bussinessSystemId]").find("input").eq(0).removeAttr("validate");
						   			g_validate.clear([$("[id=bussinessSystemId]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });

						   el.find("[data-flag=osType]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[data-id=osType]").attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[data-id=osType]").removeAttr("validate");
						   			g_validate.clear([$("[data-id=osType]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });

						   el.find("[data-flag=liablePersonId]").click(function(){
						   		if($(this).is(":checked"))
						   		{
						   			el.find("[data-id=liablePersonId]").attr("validate","required");
						   		}
						   		else
						   		{
						   			el.find("[data-id=liablePersonId]").removeAttr("validate");
						   			g_validate.clear([$("[data-id=liablePersonId]")]);
						   			el.find("[name=check_all]").removeAttr("checked");
						   		}
						   });

						   el.find("[data-id=assetValue]").change(function (){
						   });

						   opt.init && opt.init(el);
						}

						function initAfter(el)
						{
							g_dialog.waitingAlert(el);
					  		um_ajax_get({
					  			url : form_tree_url,
					  			isLoad : false,
					  			successCallBack : function (data){
					  				// 资产类型
					  				inputdrop.renderTree(el.find("[id=assetTypeId]"),data.assetTypeTreeStore ,{enableChk:false});
					  				// 安全域
							  		inputdrop.renderTree(el.find("[id=securityDomainId]"),data.securityDomainTreeStore,{contentWidth:1});
									//业务域
									inputdrop.renderTree(el.find("[id=bussinessDomainId]"),data.businessDomainTreeStore,{contentWidth:1});
									//业务系统
									inputdrop.renderTree(el.find("[id=bussinessSystemId]"),data.bussinessSystemTreeStore,{contentWidth:1, searchBox:true});
					  				// 操作系统类型
									um_ajax_get({
							  			url : form_codeList_url,
							  			paramObj : {key : "osCodeList"},
							  			isLoad : false,
							  			successCallBack : function (data){
							  				var dataList = data.osCodeList;
								    		for (var i = 0; i < dataList.length; i++) {
								    			el.find("[data-id=osType]").append('<option value="'+dataList[i].codevalue+'">'+dataList[i].codename+'</option>');
								    		}
								    		el.find("[data-id=osType]").trigger("change");
								    		//批量修改渲染责任人列表
								    		um_ajax_get({
												url: "AssetOperation/queryResponsePerson",
										    	isLoad: false,
										    	successCallBack:function (data){
										    		for (var i = 0; i < data.length; i++) {
														el.find("[data-id=liablePersonId]").append('<option value="'+data[i].userId+'">'+data[i].userName+'</option>');
													}
										    	}
										    });
								    		g_dialog.waitingAlertHide(el);
							  			}
							  		});
					  			}
					  		});	
						}

						function save_click(el,saveObj)
						{
							var data = el.find("[data-flag]:checked").length;
							if (data == 0)
							{
								g_dialog.operateAlert(el ,"请至少选择一项修改!" ,"error");
								return false;
							}

							var el_table = opt.elTable?opt.elTable:$("#table_div");

							var data = g_grid.getData(el_table ,{chk:true});

							el.find("[data-flag]:checked").each(function ()
							{
								var attrStr = $(this).attr("data-flag");
								var attrArray = attrStr.split(",");
								for (var i = 0; i < attrArray.length; i++) {
									for (var j = 0; j < data.length; j++){
										data[j][attrArray[i]] = saveObj[attrArray[i]];
									}
								}
							});
						    
							// 校验
							if (!g_validate.validate(el))
							{
							 	return false;
							}

							// 组装edid
							var buffer = [];

							for (var i = 0; i < data.length; i++) {
								buffer.push(data[i].edId);
								
								//组装责任人
								if(el.find("[data-flag=liablePersonId]").is(":checked"))
								{
									data[i].liablePersonId = el.find("[data-id=liablePersonId]").val().join(",");
								}
								
							}
							
							var flag_url = asset_batch_UpdAsset_url;
							if (opt.url)
							{
								flag_url = opt.url;
							}

							um_ajax_post({
								url : flag_url,
								paramObj : {assetStore:data,monitorIdVsEdId:buffer.join(",")},
								maskObj : el,
								successCallBack : function (){
									g_dialog.hide(el);
									// 弹出成功提示
									g_dialog.operateAlert();
									opt && opt.cbf && opt.cbf();
								}
							});
					    }
					}
					
				});
		},
		/** 资产接口流量 */
		assetFlowDialog : function (opt){
			opt.autoHeight = true;
			opt.isDialog = true;
			opt.noportClick = true;
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=flow_template]"),{
						width:"960px",
						initAfter:initAfter,
						title : "接口面板详细信息",
						isDetail:true,
						top:"6%"
					});
					function initAfter(el)
					{
						assetFlowRender(el ,opt);
					}
				}
			});
		},
		/**
			assetFlowDiv
			param : el
					opt {mainIp:"" ,assetId:"" ,monitorId:""}
		*/
		assetFlowDiv : function (el ,opt){
			opt.autoHeight = true;
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset_tpl.html",
				success : function (data){
					el.html("");
					el.append($(data).find("[id=flow_template]").html());
					el.find("[id=table_flow_div]").parent().css("width" ,"100%");
					assetFlowRender(el ,opt);
				}
			});
		},
		/** 用户导入导出初始化 */
		user_init : function (opt){
			var self = this
			$("#import_btn").click(function (){
				self.user_import_init()
			});

			$("#export_btn").click(function (){
				var idArray = g_grid.getIdArray($("#table_div") ,{attr:"userId" ,chk:"true"});
				window.location.href = index_web_app + 'user/exportExcel'+ "?exportuserIds="+idArray.join(",");
			});

			$("#import_template_download_btn").click(function (){
				window.location.href = index_web_app + "user/downImportTemplate";
			});
		},
		/** 用户导入 */
		user_import_init : function (){
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=import_template]"),{
						"width":"600px",
						title:"导入用户",
						"init":init,
						isDetail:true
					});
				}
			});

			function init(el){
				index_create_upload_el(el.find("[id=ptMap]"));

				var el_form = el.find("form");

				el.find("[id=import_tpl_btn]").click(function (){
					if (!el.find("[id=ptMap]").val())
					{
						g_dialog.operateAlert(el ,"请选择文件" ,"error");
						return false;
					}
					um_ajax_file(el_form ,{
						url : "user/userImport",
						maskObj : el,
						successCallBack : function (data){
							if(data.uploadMessage){
								g_dialog.operateAlert(el,data.uploadMessage,'error');
							}else {
								g_dialog.operateAlert(el);
								g_dialog.waitingAlertHide(el)
							}
							g_grid.refresh($("#table_div"));
							g_grid.removeData(el_table,{deleteAll:true});
							g_grid.addData(el_table ,data.errorList);
						}
					});
				});

				var el_table = el.find("[class=table_div]");
				g_grid.render(el_table ,{
					data:[],
					header:[
							{text:"",name:"t",width:3,hideSearch:"hide"},
							{text:"行号" ,name:"rowNum",align:"left"},
							{text:"错误信息" ,name:"message",align:"left"},
						   ],
					paginator : false,
					hideSearch : true,
					allowCheckBox:false
				});
			}
		},
		/** 角色配置 */
		role_config_init : function (rowData){
			$.ajax({
				type: "GET",
				url: "js/plugin/asset/asset_tpl.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=role_user_config_template]"),{
						width:"960px",
						init:init,
						initAfter:initAfter,
						title:"人员配置",
						saveclick:save_click
					});
				}
			});

			var checked_user_array = []
			var left_table
			var right_table

			function init(el){
				left_table = el.find("[id=left_table]");
				right_table = el.find("[id=right_table]");

				g_grid.render(left_table,{
					 data:[],
					 header:[{text:'系统人员',name:"label",align:"left"}],
					 gridCss : "um-grid-style",
					 paginator : false,
					 hideSearch : true
				});

				g_grid.render(right_table,{
					 data:[],
					 header:[{text:'已选人员',name:"label",align:"left"}],
					 gridCss : "um-grid-style",
					 paginator : false,
					 hideSearch : true
				});
				el.find("[id=chevron-right]").click(function (){
					var data = g_grid.getData(left_table ,{chk:true});
					if (data.length == 0) {
						g_dialog.operateAlert(el, "请至少选择一条记录", "error")
						return false
					}
					g_grid.removeData(left_table);
					g_grid.addData(right_table ,data);
					for (var i = 0; i < data.length; i++) {
						checked_user_array.push(data[i])
					}
				});

				el.find("[id=chevron-left]").click(function (){
					var data = g_grid.getData(right_table ,{chk:true});
					if (data.length == 0) {
						g_dialog.operateAlert(el, "请至少选择一条记录", "error")
						return false
					}
					g_grid.removeData(right_table);
					if ($("[data-id=depart]").val() != "") {
						g_grid.addData(left_table ,data);
					}
					checked_user_array = array_com_del(checked_user_array, data, "dif", "id")
				});
			}

			function initAfter(el)
			{
				var roleId = rowData?rowData.roleId:"";
				um_ajax_post({
					url : "role/queryUserTree",
					paramObj : {roleId : roleId},
					maskObj : "body",
					successCallBack : function (userList){
						for (var i = 0; i < userList.length; i++) {
							userList[i]._s && checked_user_array.push(userList[i])
						}
						g_grid.addData(right_table ,checked_user_array);
					}
				})
				um_ajax_get({
			    	url : "organizationmanager/queryTreeChildrenList",
			    	isLoad : false,
			    	successCallBack : function (data){
			    		for (var i = 0; i < data.length; i++) {
			    			data[i].id = data[i].domaId
			    			data[i].parentID = data[i].pdomaId
			    			data[i].label = data[i].domaName
			    		}
	    				data.insert(0 ,{id:"-1" ,label:"部门"});
			    		tree.render($("#depart") ,{
			 				zNodes : data,
			 				zTreeOnClick : function (event, treeId, treeNode){
			 					if (treeNode.id == "-1") {
			 						g_dialog.operateAlert(el,"请选择部门","error")
			 					// 	g_grid.removeData(left_table ,{checked:false});
									// g_grid.removeData(right_table ,{checked:false});
									// g_grid.addData(right_table ,checked_user_array);
			 					} else {
					   				form_user_config_tree_render(el ,rowData ,treeNode.id)
					   			}
					   		}
					    })
			    		tree.expandSpecifyNode($("#depart") ,"-1");
			    	}
				})
			}

			function save_click(el)
			{
				if (checked_user_array.length == 0) {
					g_dialog.operateAlert(el, "请选择人员进行配置", "error")
					return false
				}
				console.log(checked_user_array)
				var userIdArray = []
				for (var i = 0; i < checked_user_array.length; i++) {
					userIdArray.push(checked_user_array[i].id)
				}
				um_ajax_post({
					url : "role/rolesUserConfig",
					paramObj : {roleId : rowData.roleId ,users : userIdArray.join(",")},
					successCallBack : function (){
						g_dialog.hide(el);
						g_dialog.operateAlert();
						g_grid.refresh($("#table_div"))
					}
				});
			}

			function form_user_config_tree_render(el ,rowData ,userDept)
			{
				var roleId = (rowData?rowData.roleId:"");

				um_ajax_post({
					url : "role/queryUserTree",
					paramObj : {roleId : roleId ,userDept:userDept},
					maskObj : "body",
					successCallBack : function (data){
						g_grid.removeData(left_table ,{checked:false});
						g_grid.removeData(right_table ,{checked:false});
						var left_init_array = []
						var right_init_array = []
						for (var i = 0; i < data.length; i++) {
							if(data[i]._s){
								right_init_array.push(data[i])
							} else {
								left_init_array.push(data[i])
							}
						}
						var src_checked = array_com_del(left_init_array, checked_user_array, "same","id")
						var to_checked = array_com_del(right_init_array, checked_user_array, "dif","id")
						if (src_checked.length > 0) {
							g_grid.addData(left_table ,array_com_del(left_init_array, src_checked, "dif","id"));
							g_grid.addData(right_table ,right_init_array);
							g_grid.addData(right_table ,src_checked);
						}
						else if (to_checked.length > 0) {
							g_grid.addData(left_table, left_init_array);
							g_grid.addData(left_table ,to_checked);
							g_grid.addData(right_table ,array_com_del(right_init_array, to_checked, "dif", "id"));
						} else {
							g_grid.addData(left_table ,left_init_array);
							g_grid.addData(right_table ,right_init_array);
						}
					}

				});
			}

			function array_com_del(array1,array2,type, label){
				var tempArray1 = [];//临时数组1
				var tempArray2 = [];//临时数组2
				var tempArray3 = [];

				for(var i=0;i<array2.length;i++){
				    tempArray1[array2[i][label]]=true;//将数array2 中的元素label值作为tempArray1 中的键，值为true；
				}

				for(var i=0;i<array1.length;i++){
				    if(!tempArray1[array1[i][label]]){
				        tempArray2.push(array1[i]);//过滤array1 中与array2 相同的元素；
				    } else {
				    	tempArray3.push(array1[i]);
				    }

				} 
				if (type == "dif") {
					return tempArray2
				} else {
					return tempArray3
				}
				
			}
		}
	}
	
	function oper_asset_save(el ,type, cbf ,updateUrl)
	{
		// 资产创建
		var index_oper_asset_create_url = "AssetOperation/addAsset";
		// 资产更新
		var index_oper_asset_update_url = "AssetOperation/updAsset";
		// 资产批量创建
		var index_oper_asset_batch_create_url = "AssetOperation/batchAddAsset";

		var flag_url = index_oper_asset_create_url;

		var el_form_base_info = el.find("[id=base_info_div]").not("#extend_info_div")
		var el_form_expand_info = el.find("[id=extend_info_div]")
		var el_form_test_info = el.find("[id=test_info_div]")

		// 封装基本信息
		var form_obj1 = el_form_base_info.umDataBind("serialize");

		var ip_info = ip_mac_data_get(el_form_base_info);
		form_obj1.ipAdrStr = ip_info.ipStr;
		form_obj1.mainIp = ip_info.mainIp;
		form_obj1.snmpStatus = (el_form_test_info.find("[name=snmpStatus]").is(":checked")?1:0);

		//step0存在则为批量增加
		if (type == "batch")
		{
			flag_url = index_oper_asset_batch_create_url;
		}
		//edId值不为空则为更新操作
		if (el.find("[data-id=edId]").val() != "")
		{
			flag_url = index_oper_asset_update_url;
		}

		// 封装扩展信息
		var form_obj2 = el_form_expand_info.umDataBind("serialize");

		// 封装snmp测试信息
		var assetSnmpStore = new Object()
		var _t = el_form_test_info.find("[id=snmp_v1]").is(":hidden")
					?el_form_test_info.find("[id=snmp_v3]")
					:el_form_test_info.find("[id=snmp_v1]")
		// assetSnmpStore = _t.umDataBind("serialize");
		// assetSnmpStore = $.extend(el_form_test_info.find("[id=snmp_common]").umDataBind("serialize") ,assetSnmpStore);
		// assetSnmpStore.snmpVersion = el_form_test_info.find("[data-id=snmpVersion]").val()
		var assetSnmpStore = el_form_test_info.find("[id=tab_snmp]").umDataBind("serialize");
		// 封装TELNET测试信息
		var telnetStore = el_form_test_info.find("[id=tab_telnet]").umDataBind("serialize");
		// 封装SSH2测试信息
		var sshStore = el_form_test_info.find("[id=tab_ssh]").umDataBind("serialize");
		// 封装WMI信息
		var wmiStore = el_form_test_info.find("[id=tab_WMI]").umDataBind("serialize");
		// 封装托盘信息
		var trayStore = el_form_test_info.find("[id=tab_tpcx]").umDataBind("serialize");

		// 封装外借信息
		var form_obj4 = {};

		// 封装自定义属性
		var costomPropertyList = [];

		if (updateUrl)
		{
			flag_url = updateUrl;
		}

		// form_obj1.responsiblePerson = $("[data-id=userId]").find("option:selected").text();
		if(form_obj1.liablePersonId)
		{
			form_obj1.liablePersonId = form_obj1.liablePersonId.join(",");
		}
		um_ajax_post({
			url : flag_url,
			paramObj : {
						  assetStore : form_obj1,
						  assetAppendStore : form_obj2,
						  assetSnmpStore : assetSnmpStore,
						  telnetStore : telnetStore,
						  sshStore : sshStore,
						  wmiStore : wmiStore,
						  trayStore : trayStore,
						  borrowStore : form_obj4,
						  costomPropertyStore : costomPropertyList
						},
			maskObj : "body",
			successCallBack : function (data){
				g_dialog.operateAlert();
				g_dialog.hide(el);
				cbf && cbf();
			}
		})
	}

	function dialog_asset_render(el ,data ,type){
		el.data("snmpData" ,data.assetSnmpStore);
		var el_form_base_info = el.find("[id=base_info_div]")
		var el_form_expand_info = el.find("[id=extend_info_div]")
		var el_form_test_info = el.find("[id=test_info_div]");
		// 渲染基本信息
		if (data.assetStore.supplierId == "")
			data.assetStore.supplierId = "-1"
		el_form_base_info.umDataBind("render" ,data.assetStore);
		if (data.assetStore.bussinessDomainId)
		{
			inputdrop.setDataTree(el_form_base_info.find("[id=bussinessDomainId]") ,data.assetStore.bussinessDomainId);
		}
		if (data.assetStore.securityDomainId)
		{
			inputdrop.setDataTree(el_form_base_info.find("[id=securityDomainId]") ,data.assetStore.securityDomainId);
		}
		if (data.assetStore.bussinessSystemId)
		{
			inputdrop.setDataTree(el_form_base_info.find("[id=bussinessSystemId]") ,data.assetStore.bussinessSystemId);
		}
		if (data.assetStore.assetTypeId)
		{
			inputdrop.setDataTree(el_form_base_info.find("[id=assetTypeId]") ,data.assetStore.assetTypeId);
		}

		if (data.assetStore.locationCb)
		{
			inputdrop.setDataTree(el_form_base_info.find("[id=locationCb]") ,data.assetStore.locationCb);
		}
		
		for (var i = 0; i < data.ipStore.length; i++)
		{
			ip_mac_add(el.find("[id=ip_mac_table]") ,data.ipStore[i], i);
			var ip_info = ip_mac_data_get(el_form_base_info);
  	  		if (ip_info.mainIp) {
  	  			el.find("[data-val*=test_ip]").find("option").remove();
  	  			testIpSelRender(el ,"test_ip1" ,ip_info.mainIp);
  	  			testIpSelRender(el ,"test_ip2" ,ip_info.mainIp);
  	  			testIpSelRender(el ,"test_ip3" ,ip_info.mainIp);
  	  			testIpSelRender(el ,"test_ip4" ,ip_info.mainIp);
  	  			testIpSelRender(el ,"test_ip5" ,ip_info.mainIp);
  	  		}
		}

		//渲染责任人
		if (data.assetStore.liablePersonId){
			el.find("[data-id=liablePersonId]").val(data.assetStore.liablePersonId.split(","));
		}

		el.find("[data-type=select]").trigger('change');
		// 渲染资产扩展信息
		el_form_expand_info.umDataBind("render" ,data.assetAppendStore);

		if (type != "backup")
		{
			el_form_test_info.find("[id=tab_telnet]").umDataBind("render" ,data.telnetStore);
			el_form_test_info.find("[id=tab_ssh]").umDataBind("render" ,data.sshStore);
			el_form_test_info.find("[id=tab_WMI]").umDataBind("render" ,data.wmiStore);
			el_form_test_info.find("[id=tab_tpcx]").umDataBind("render" ,data.trayStore);
		}
		
		if (data.assetStore.snmpStatus == "1") {
			el_form_test_info.find("[name=snmpStatus]").click();
			// 渲染凭证信息 snmp
			el_form_test_info.find("[data-id=snmpVersion]").val(data.assetSnmpStore.snmpVersion?data.assetSnmpStore.snmpVersion:"1");
			el_form_test_info.find("[data-id=snmpVersion]").trigger("change");
			el_form_test_info.find("[id=snmp_info]").umDataBind("render" ,data.assetSnmpStore);	
			if(data.assetSnmpStore.securityLevel == -1 || !data.assetSnmpStore.securityLevel){
				el_form_test_info.find("[data-id=securityLevel]").val(1);	
			}
			el_form_test_info.find("[data-id=securityLevel]").trigger("change");
			el_form_test_info.find("[data-id=encryptionWay]").val(data.assetSnmpStore.encryptionWay)
			el_form_test_info.find("[data-id=encryptionWay]").trigger("change")
		}

		//资产价值开关
		if(data.assetStore.isComputeRisk==0){
			el.find("[name=isComputeRisk]").click();
		}
	}

	function step0_init(el)
	{
		var el_ip_range_div = el.find("[id=ip_range_div]");
		var el_start_ip = el.find("[id=step0_startIp]");
		var el_end_ip = el.find("[id=step0_endIp]");
		var el_um_step_0 = el.find("[id=um_step_0]");
		var el_um_step_form_0 = el.find("[id=um_step_form_0]");
		var el_step0_ipList = el.find("[id=step0_ipList]");
		el.find("[id=ip_get_btn]").click(function (){
			if (g_validate.validate(el_um_step_form_0))
			{
				var startIPArray = el_start_ip.val().split(".");
				var endIPArray = el_end_ip.val().split(".");
				if (startIPArray[0] == endIPArray[0]
						&& startIPArray[1] == endIPArray[1]
							&& startIPArray[2] == endIPArray[2])
				{
					var startIp = parseInt(startIPArray[3]);
					var endIp = parseInt(endIPArray[3]);

					if (startIp > endIp)
					{
						g_dialog.operateAlert(el_um_step_0 ,"起始IP不能大于结束IP" ,"error");
						return false;
					}
					else
					{
						el.find("[id=step0_ipInfo_span]")
								.text(startIPArray[0] + "." + startIPArray[1] + "." + startIPArray[2]);
						var count = endIp - startIp;
						el_step0_ipList.html("");
						for (var i=0;i<=count;i++)
						{
							el_step0_ipList.append('<li>'+(startIp+i)+'</li>');
						}
					}
					var saveObj = el_um_step_0.umDataBind("serialize");
					var obj = new Object();
					um_ajax_get({
						url : form_asset_ip_conflict_url,
						paramObj : saveObj,
						successCallBack : function (data){
							for (var i = 0; i < data.length; i++) {
								(data[i].conflict == 1) && el_step0_ipList.find("li").eq(i).addClass("disable");
							}
						}
					});
				}
				else
				{
					g_dialog.operateAlert(el_um_step_0 ,"请输入同一网段" ,"error");
				}
			}
		});
		el.delegate("[id=step0_ipList] li" ,"click" ,function (){
			if (!$(this).hasClass("disable"))
			{
				$(this).toggleClass("nochk");
			}
		});
	}

	function batch_add_init(el,cbf){
		var el_start_ip = el.find("[id=step0_startIp]");
		var el_end_ip = el.find("[id=step0_endIp]");
		var base_info_div = el.find("[id=base_info_div]");
		var batch_add_div = el.find("[data-flag=batch_add]");
		var el_step0_ipList = el.find("[id=step0_ipList]");
		el.find("[id=ip_get_btn]").click(function (){
			if (g_validate.validate(batch_add_div))
			{
				var startIPArray = el_start_ip.val().split(".");
				var endIPArray = el_end_ip.val().split(".");
				if (startIPArray[0] == endIPArray[0]
						&& startIPArray[1] == endIPArray[1]
							&& startIPArray[2] == endIPArray[2])
				{
					var startIp = parseInt(startIPArray[3]);
					var endIp = parseInt(endIPArray[3]);

					if (startIp > endIp)
					{
						g_dialog.operateAlert(base_info_div ,"起始IP不能大于结束IP" ,"error");
						return false;
					}
					else
					{
						el.find("[id=step0_ipInfo_span]")
								.text(startIPArray[0] + "." + startIPArray[1] + "." + startIPArray[2]);
						var count = endIp - startIp;
						el_step0_ipList.html("");
						for (var i=0;i<=count;i++)
						{
							el_step0_ipList.append('<li>'+(startIp+i)+'</li>');
						}
						el.find(".expande-vertical-top").show()
						el_step0_ipList.show()
					}
					var saveObj = batch_add_div.umDataBind("serialize");
					var obj = new Object();
					um_ajax_get({
						url : form_asset_ip_conflict_url,
						paramObj : saveObj,
						successCallBack : function (data){
							for (var i = 0; i < data.length; i++) {
								(data[i].conflict == 1) && el_step0_ipList.find("li").eq(i).addClass("disable");
							}
							cbf && cbf()
						}
					});
				}
				else
				{
					g_dialog.operateAlert(base_info_div ,"请输入同一网段" ,"error");
				}
			}
		});
		el.delegate("[id=step0_ipList] li" ,"click" ,function (){
			if (!$(this).hasClass("disable"))
			{
				$(this).toggleClass("nochk");
			}
		});
		el.delegate(".expande-vertical-top" ,"click" ,function (){
			$(this).removeClass("expande-vertical-top")
			$(this).addClass("expande-vertical-down")
			el_step0_ipList.hide()
		});
		el.delegate(".expande-vertical-down" ,"click" ,function (){
			$(this).removeClass("expande-vertical-down")
			$(this).addClass("expande-vertical-top")
			el_step0_ipList.show()
		});
	}

	function ip_range_create(el)
	{
		var el_ipList = el.find("[id=step0_ipList]").find("li").not("[class*=disable]").not("[class*=nochk]");
		if (el_ipList.size() == 0)
		{
			return "";
		}
		var buffer = [];
		var ip_three = el.find("[id=step0_ipInfo_span]").text();
		el_ipList.each(function (){
			buffer.push(ip_three + "." + $(this).html());
		});
		return buffer.join(",");
	}

	function ip_mac_add(el ,data, index, cbf)
	{	
		!index?index=0:index;
		var buffer = [];
		var id = new Date().getTime() + "" +index;
		buffer.push('<tr id="'+id+'">');
		buffer.push('<td style="text-align:center;width:41.9%;">');
		buffer.push('<div class="prel"><input type="text" class="form-control input-sm" validate="required,IP"/><div>');
		buffer.push('</td>');
		buffer.push('<td style="text-align:center;width:41.9%;">');
		buffer.push('<div class="prel"><input type="text" class="form-control input-sm" validate="mac"/><div>');
		buffer.push('</td>');
		buffer.push('<td style="vertical-align: middle">');
		buffer.push('<i class="rh-icon-ok" title="确认" style="margin-right:5px;"></i>');
		buffer.push('<i class="rh-icon-delete" title="删除"></i>');
		buffer.push('</td>');
		buffer.push('</tr>');
		el.append(buffer.join(""));

		if (data)
		{
			var trObj = el.find("[id="+id+"]");
			trObj.find("td").eq(0).html(data.ip);
			trObj.find("td").eq(1).html(data.mac);
			var icon = trObj.find("[class*=rh-icon-ok]");
			icon.removeClass("rh-icon-ok");
			icon.addClass("rh-icon-star");
			icon.addClass("gc");
			icon.attr("title" ,"设置为主IP");
			if (data.keyIp == "1")
			{
				icon.removeClass("gc");
				icon.attr("title" ,"已设置为主IP");
			}
		}

		el.find('[id='+id+']').find("[class*=rh-icon-ok]").click(function (){
			var self = this
			var form = $(self).closest('tr');
			if (g_validate.validate(form))
			{
				_t(form)
				el.find('[class*=rh-icon-star]').unbind("click")
				el.find('[class*=rh-icon-star]').click(function(){
					var form1 = $(this).closest('tr');
					var msg = "";
					if (!$(this).hasClass('gc'))
					{
						return false;
					}
					mainIp_validate(form1.find("td").eq(0).html() ,function (){
						msg = "已更改主IP";
						g_dialog.operateAlert(null ,msg);
						el.find("[class*=rh-icon-star]").addClass("gc");
						el.find("[class*=rh-icon-star]").attr("title","设置为主IP")
						form1.find("[class*=rh-icon-star]").removeClass('gc');
						form1.find("[class*=rh-icon-star]").attr("title","已设置为主IP")
						cbf && cbf()
					})
					
				});
				if (el.find("[class*=rh-icon-star]").size() == 1)
				{
					mainIp_validate(form.find("td").eq(0).html() ,function (){
						form.find("[class*=rh-icon-star]").eq(0).removeClass("gc");
						form.find("[class*=rh-icon-star]").eq(0).attr("title" ,"已设置为主IP");
						cbf && cbf()
					})
				}
			}
		});

		el.find('[id='+id+']').find("[class*=rh-icon-delete]").click(function (){
			$(this).closest('tr').remove();
		});
		
		el.find('[id='+id+']').find("input").each(function (){
			g_validate.initEvent($(this));
		});

		function _t(form)
		{
			form.find("input").each(function (){
				$(this).parent().after($(this).val());
				$(this).parent().remove();
				var icon = form.find("[class*=rh-icon-ok]");
				icon.removeClass("rh-icon-ok");
				icon.addClass("rh-icon-star");
				icon.addClass("gc");
				icon.attr("title" ,"设置为主IP");
			});
		}
	}

	function ip_mac_data_get(el)
	{
		if ($("#step0_ipList").size() > 0)
		{
			var ip_info = $("#step0_ipInfo_span").text();
			var ipArray = [];
			$("#step0_ipList").find("li").each(function (){
				ipArray.push(ip_info+"."+$(this).html());
			})
			return {mainIp:ipArray.join(",") ,ipStr:"" ,ipv4:""};
		}
		else
		{
			var ipInfo = [];
			var buffer = [];
			var ipv4 = [];
			var mainIp = el.find("[class*=rh-icon-star]").not("[class*=gc]").closest("tr").find("td").eq(0).html();
			el.find("[class*=rh-icon-star]").each(function (){
				ipInfo = [];
				$(this).hasClass("gc")?ipInfo.push("0"):ipInfo.push("1");
				ipInfo.push($(this).closest("tr").find("td").eq(0).html());
				ipInfo.push($(this).closest("tr").find("td").eq(1).html());
				buffer.push(ipInfo.join("-"));
				ipv4.push($(this).closest("tr").find("td").eq(0).html());
			});
			return {mainIp:mainIp ,ipStr:buffer.join(",") ,ipv4:ipv4};
		}
	}

	function mainIp_validate(ip ,cbf)
	{
		um_ajax_get({
			url : "AssetOperation/checkIpConflict",
			paramObj : {mainIp : ip ,securityDomainId : $("[data-id=securityDomainId]").val()},
			successCallBack : function (data){
				cbf()
			}
		})
	}

	function snmp_telnet_ssh2_test(el ,url ,tabId)
	{
		var el_form_test_info = el.find("[id=test_info_div]");
		// 封装snmp测试信息
		var obj = new Object()

		if (tabId == "tab_snmp")
		{
			if (!g_validate.validate(el_form_test_info.find("[id=snmp_common]")))
				return false;
			var _t = el_form_test_info.find("[id=snmp_v1]").is(":hidden")
						?el_form_test_info.find("[id=snmp_v3]")
						:el_form_test_info.find("[id=snmp_v1]")
			if (!g_validate.validate(_t))
				return false;
			obj = _t.umDataBind("serialize");
			obj = $.extend(el_form_test_info.find("[id=snmp_common]").umDataBind("serialize") ,obj);
			obj.snmpVersion = el_form_test_info.find("[data-id=snmpVersion]").val()
		}
		else
		{
			if (!g_validate.validate(el_form_test_info.find("[id="+tabId+"]")))
				return false;
			obj = el_form_test_info.find("[id="+tabId+"]").umDataBind("serialize");
		}

		obj.bussinessDomainId = el.find("[data-id=bussinessDomainId]").val();
		obj.securityDomainId = el.find("[data-id=securityDomainId]").val();
		um_ajax_post({
			url : url,
			paramObj : obj,
			maskObj : "body",
			successCallBack : function (data){
				g_dialog.dialog('<div>'+data+'</div>',{
					width:"300px",
					title:"测试结果",
					isDetail:true
				});
			}
		});
	}

	function assetFlowRender(el ,opt)
	{
		var tmp_data
		var el_table_flow_empty_div = el.find("#table_flow_empty_div")
		if (opt.autoHeight)
		{
			el.find("[id=table_flow_div_outer]").css("height" ,"auto");
		}
		if (opt.isDialog)
		{
			el.find("[data-id=modal-title]").text(el.find("[data-id=modal-title]").text() + "(资产IP："+opt.mainIp+")")
		}
	
		var port_div = el.find("[id=port_div]");
		var color;
		var header = [
						{text:"接口索引",name:"interfaceInd"},
						{text:"接口名称",name:"interfaceName"},
						{text:"接口状态",name:"currentStatusName"},
						{text:"管理状态",name:"adminStatusName"},
						{text:"入口流速",name:"portalFlux"},
						{text:"出口流速",name:"exportFlux"},
						{text:"入口<br>错包数",name:"portalError"},
						{text:"出口<br>错包数",name:"exportError"},
						{text:"入口<br>丢包数",name:"portalLoss"},
						{text:"出口<br>丢包数",name:"exportLoss"},
						{text:"入口流量",name:"fluxIn",sortKey:"fluxInSort",sortBy:"int"},
						{text:"出口流量",name:"fluxOut",sortKey:"fluxOutSort",sortBy:"int"},
						{text:"总流量",name:"totalFlux",sortKey:"totalFluxSort",sortBy:"int"},
						{text:"所属vlan",name:"vlanName",render:function (txt){
							return (txt ? txt : "---");
						}}
					 ];
		um_ajax_get({
			url : "interfaceInfo/queryMonitorInterface",
			paramObj : {edId : opt.assetId ,interfaceFlag : 0 ,monitorId:opt.monitorId},
			maskObj : el,
			successCallBack : function (data){
				tmp_data = data.list
				g_grid.render(el.find("[id=table_flow_div]"),{
					header:header,
					data:data.list,
					allowCheckBox:false,
					hideSearch:true,
					paginator:false,
					dbThLine:true,
					autoHeight:opt.autoHeight,
					gridCss : "um-grid-style",
					hasBorder : false,
					showCount : true,
					wholly : true,
					cacheSearch : true,
					searchInp : el.find("[id=table_flow_search_inp]"),
					searchKey : ['interfaceInd','interfaceName'],
					cbf : function (){
						var el_title = el.closest(".m-panel").find(".m-panel-title")
						el_title.css("position" ,"relative")
						el_title.find(".msg").remove()
						if (tmp_data.length > 0)
							el_title.append('<span class="msg r mr10">最后更新时间：'+tmp_data[0].enterDate+'</span>')
					}
				});
				var data = data.list;
				// var data = [{},{},{},{}]
				if (data && data.length > 0)
					el_table_flow_empty_div.hide(),el.find("[id=table_flow_search_inp]").show();
				else
					el_table_flow_empty_div.show(),el.find("[id=table_flow_search_inp]").hide();
				var panel_width
				if ($("#interface_info").size() > 0)
					panel_width = $("#interface_info").offset().left + $("#interface_info").width();
				else
					panel_width = el.width();
				data && data[0] && $("#interface_panel_head").text('接口面板(资产IP：'+data[0].interfaceIp+')');
				var id_list = [];
				for (var i = 0; i < data.length; i++) {
					if (data[i].currentStatus == "1" && data[i].adminStatus == "1")
						color = "green";
					else
						color = "red";
					id_list.push(data[i].interfaceInd);
					port_div.append('<div class="icon-png flow-'+color+' l prel" id="'+data[i].interfaceInd+'" data-flag="port" style="margin: 5px 9px 5px 0px" title="点击进入端口详细信息"></div>');
				}

				var tip = el.find("[data-name=interfaceTip]");
				el.find("[data-flag=port]").hover(function(){
					var index = id_list.indexOf($(this).attr("id"));
					tip.umDataBind("render",data[index]);
					tip.appendTo(this);
					if ((panel_width - $(this).offset().left) < 400)
					{
						tip.addClass("panel-tip-right");
						tip.removeClass("panel-tip-left");
					}
					else
					{
						tip.addClass("panel-tip-left");
						tip.removeClass("panel-tip-right");
					}
					tip.show();
				},function(){
					tip.hide();
					return false;
				});

				el.find("[data-flag=port]").click(function(){
					if (opt.noportClick) {
						return false
					}
					var id = $(this).attr("id");
					// window.open("#/monitor_info/monitor_obj/interface_info?hideMenu=1&&assetId="+opt.assetId+"&interfaceId="+id+"&monitorId="+opt.monitorId);
					var obj = new Object()
					obj.assetId = opt.assetId
					obj.interfaceId = id
					obj.monitorId = opt.monitorId
					g_dialog.elDialog({
						url: "js/plugin/asset/interface_info_new.html",
						title : "流量详情页",
						bgcontainer : $(".monitor-show"),
						cbf: function(){
							interface.interface_render(obj)
						}
					})
				});
			}
		});
	}

	/** 
		工具函数
	*/
	function change_record_list(el ,edId)
	{

		var change_record_url = "AssetOperation/queryAssetChangeLog";
		var change_record_header = [
						{text:'变更项目',name:"changeProperty"},
						{text:'变更类型',name:"changeType"},
						{text:'原始内容',name:"oldValue"},
						{text:'变更内容',name:"newValue"},
						{text:'修改人',name:"persion"},
						{text:'修改日期',name:"updateDate"}
				   ];
		g_grid.render(el.find("[id=change_record_div]"),{
			url:change_record_url,
			header:change_record_header, 
	 		paramObj : {edId : edId},
			dbClick : detail_template_init,
			allowCheckBox:false
		});
	}

	/** 
		工具函数
	*/
	function detail_template_init(rowData)
	{
		$.ajax({
			type: "GET",
			url: "/js/plugin/asset/asset_tpl.html",
			success :function(data)
			{
				g_dialog.dialog($(data).find("[id=change_record_detail_template]"),{
					width:"450px",
					init:init,
					saveclick:save_click,
					isDetail:true,
					title:"变更记录详细信息"
				});
			}
		});

		function init(el)
		{
			el.umDataBind("render" ,rowData);
		}

		function save_click(el)
		{
			g_dialog.hide(el);
		}
	}

	function initSnmpEvent(el ,rowData ,snmpMap)
	{
		var el_form_test_info = el.find("[id=test_info_div]");
		el.find("[data-id=snmpName]").change(function (){
			if ($(this).val() == "-1")
			{
				if (rowData)
				{
				}
				else
				{
				}
			}
			else
			{
				var obj = snmpMap.get($(this).val());
				el_form_test_info.find("[data-id=snmpVersion]").val(obj.snmpVersion);
				el_form_test_info.find("[data-id=snmpVersion]").trigger("change");
				el_form_test_info.find("[id=snmp_info]").umDataBind("render" ,obj);
				var securityLevelEl = el.find('[data-id=securityLevel]');
				if(obj.authWay == '-1' || !obj.authWay){
					securityLevelEl.val(1);
				}else if(obj.encryptionWay == '-1' || !obj.encryptionWay){
					securityLevelEl.val(2);
				}else {
					securityLevelEl.val(3);
				}
				securityLevelEl.trigger('change');
			}
			el.find('[data-id=authWay]').trigger('change');
			el.find('[data-id=encryptionWay]').trigger('change');
		});
	}

	function testIpSelRender(el ,str ,mainIp)
	{
		var ipArray = mainIp.split(",");
		var data = [];
		for (var i = 0; i < ipArray.length; i++) {
			data.push({id:ipArray[i] ,text:ipArray[i]});
		}
		el.find("[data-val="+str+"]").select2({
		  data: data,
		  width:"100%",
		  minimumResultsForSearch:"-1"
		});
	}

	function getAssetCodeType(treeNode){
		var el_asset_code_form_group = $("#asset_code_form_group")
		if (treeNode.isAutocomleteCode == 1)
		{
			el_asset_code_form_group.hide()
			el_asset_code_form_group.find("[data-id=assetCode]").removeAttr("validate")
		}
		else
		{
			el_asset_code_form_group.show()
			el_asset_code_form_group.find("[data-id=assetCode]").attr("validate" ,"required")
		}
	}

	function getAssetNameType(treeNode ,resultObj,el){
		var el_asset_name_form_group = $("#asset_name_form_group");
		var el_person_form_group = $("#person_form_group");
		var el_manager_form_group = $('#manager_form_group');
		var el_company_form_group = $("#company_form_group");
		var el_input = el_asset_name_form_group.find("input");
		var el_person_input = el_person_form_group.find('select');
		var el_manager_input = el_manager_form_group.find('select');
		var el_company_input = el_company_form_group.find('input');
		var el_persion_select =  el ? el.find("#persion_select"):$('#persion_select');
		var el_manager_select =  el ? el.find("#manager_select"):$('#manager_select');
		um_ajax_post({
  			url : "EquipmentTypeAccount/queryOwnCustomField",
  			paramObj : {deviceType:treeNode.id},
  			isLoad : false,
  			successCallBack : function (data){
  				var data1 = _.filter(data ,function (tmp){
		  	  					return tmp.fieldLabel == '资产名称'
		  	  				})
  				if (data1.length > 0)
  				{
  					el_asset_name_form_group.show()
  					el_input.attr("validate" ,"required")
  					el_input.attr("data-id" ,data1[0].fieldName)
  					if (resultObj){
  						el_asset_name_form_group.umDataBind("render" ,resultObj)
  					}
  				}
  				else
  				{
  					el_asset_name_form_group.hide()
  					el_input.removeAttr("validate")
  				}

  				var data2 = _.filter(data ,function (tmp){
		  	  					return tmp.fieldLabel == '厂商'
		  	  				})
  				if (data2.length > 0)
  				{
  					el_company_form_group.show()
  					if (data2[0].fieldNullable == "1")
  						el_company_form_group.find("label").removeClass("required") && el_company_input.removeAttr("validate")
  					else
  						el_company_input.attr("validate" ,"required")
  					el_company_input.attr("data-id" ,data2[0].fieldName)
  					if (resultObj){
  						el_company_form_group.umDataBind("render" ,resultObj)
  					}
  				}
  				else
  				{
  					el_company_form_group.hide()
  					el_company_input.removeAttr("validate")
  				}

  				var data3 = _.filter(data ,function (tmp){
		  	  					return tmp.fieldLabel == '使用人'
		  	  				})
  				if (data3.length > 0)
  				{
  					el_person_form_group.show()
  					if (data3[0].fieldNullable == "1")
  						el_person_form_group.find("label").removeClass("required") && el_person_input.removeAttr("validate")
  					else
  						el_person_input.attr("validate" ,"required")
  					el_person_input.attr("data-id" ,data3[0].fieldName)
  					var val = el ? el.find('[data-id=depart]').val() : $('[data-id=depart]').val();
  					if(val){
  						um_ajax_post({
  							url : 'user/queryUserList',
  							paramObj : {userDept : val, orderBy : 'user_fullname', order : 'asc'},
  							successCallBack : function (userData){
  								userData.unshift({text : '-----',id : '-1'});
  								for(var i=0;i<userData.length;i++){
  									userData[i].userName && userData[i].userAccount && (userData[i].text = userData[i].userName +' ('+userData[i].userAccount+')');
  								}
  								el_persion_select.select2({
  									width:'100%',
  									data:userData
  								})
  								if (resultObj){
  									el_person_form_group.umDataBind("render" ,resultObj)
  									el_persion_select.trigger('change')
  								}
  							}
  						})
  					}
  					if (resultObj){
  						el_person_form_group.umDataBind("render" ,resultObj)
  					}
  				}
  				else
  				{
  					el_person_form_group.hide()
  					el_person_input.removeAttr("validate")
  				}

  				var data4 = _.filter(data ,function (tmp){
		  	  					return tmp.fieldLabel == '责任人'
		  	  				})
  				if (data4.length > 0)
  				{
  					el_manager_form_group.show()
  					if (data4[0].fieldNullable == "1")
  						el_manager_form_group.find("label").removeClass("required") && el_manager_input.removeAttr("validate")
  					else
  						el_manager_input.attr("validate" ,"required")
  					el_manager_input.attr("data-id" ,data4[0].fieldName)
  					var val = el ?  el.find('[data-id=depart]').val():$('[data-id=depart]').val();
  					if(val){
  						um_ajax_post({
  							url : 'user/queryUserList',
  							paramObj : {userDept : val,orderBy : 'user_fullname', order : 'asc'},
  							successCallBack : function (userData){
  								userData.unshift({text : '-----',id : '-1'});
  								for(var i=0;i<userData.length;i++){
  									userData[i].userName && userData[i].userAccount && (userData[i].text = userData[i].userName +' ('+userData[i].userAccount+')');
  								}
  								el_manager_select.select2({
  									width:'100%',
  									data:userData
  								})
  								if (resultObj){
  									el_manager_form_group.umDataBind("render" ,resultObj)
  									el_manager_select.trigger('change')
  								}
  							}
  						})
  					}
  					if (resultObj){
  						el_manager_form_group.umDataBind("render" ,resultObj)
  					}
  				}
  				else
  				{
  					el_manager_form_group.hide()
  					el_manager_input.removeAttr("validate")
  				}
  			}
  		})		
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
});