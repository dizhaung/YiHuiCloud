define(['/js/plugin/inputdrop/inputdrop.js'] ,function (inputdrop){

	var sec_biz_url = "AssetOperation/queryDialogTreeList";

	var code_list_url = "rpc/getCodeList";

	return {
		sec_biz_render : function (opt){
			var contentWidth = opt.contentWidth || 1
			um_ajax_get({
	  			url : sec_biz_url,
	  			isLoad : false,
	  			successCallBack : function (data){
	  				// 渲染业务域
				    opt.bizEl && inputdrop.renderTree(opt.bizEl ,data.businessDomainTreeStore ,{
				    									enableChk:opt.enableChk,initVal:opt.bizVal,
				    									contentWidth:contentWidth,
				    									chkboxType: opt.chkboxType,global:true,width:opt.bizWidth,searchBox:true});
				    // 渲染安全域
				    opt.secEl && inputdrop.renderTree(opt.secEl ,data.securityDomainTreeStore,{
				    									aCheckCb : opt.aCheckCb,enableChk:opt.enableChk,
				    									initVal:opt.secVal,contentWidth:contentWidth,
				    									placeholder:opt.placeholder,
				    									chkboxType: opt.chkboxType,global:true,width:opt.secWidth,searchBox:true});
				    // 渲染资产类型
				    opt.assetTypeEl && inputdrop.renderTree(opt.assetTypeEl ,data.assetTypeTreeStore ,{
				    									enableChk:opt.enableChk,initVal:opt.assetTypeVal,
				    									contentWidth:contentWidth,
				    									chkboxType:opt.chkboxType,global:true,width:opt.secWidth,searchBox:true});
	  			}
	  		});
		},

		code_list_render : function (opt){
			um_ajax_get({
	  			url : code_list_url,
	  			paramObj : {key : opt.key},
	  			isLoad : false,
	  			successCallBack : function (data1){
	  				// 渲染资产型号
	  				if (opt.assetModelEl)
	  				{
	  					var data = data1.deviceTypeCodeList;
			    		for (var i = 0; i < data.length; i++) {
			    			data[i].id = data[i].codevalue;
			    			data[i].text = data[i].codename;
			    		}
			    		opt.assetModelEl.select2({
			    			data:data,width:"100%"
			    		});

			    		if (opt.assetModelVal)
			    		{
			    			opt.assetModelEl.val(opt.assetModelVal);
			    			opt.assetModelEl.trigger("change");
			    		}
	  				}
	  				// 渲染操作系统类型
	  				if (opt.osCodeEl)
	  				{
						var data = data1.osCodeList;
			    		for (var i = 0; i < data.length; i++) {
			    			data[i].id = data[i].codevalue;
			    			data[i].text = data[i].codename;
			    		}
			    		opt.osCodeEl.select2({
			    			data:data,width:"100%"
			    		});

			    		if (opt.osCodeVal)
			    		{
			    			opt.osCodeEl.val(opt.osCodeVal);
			    			opt.osCodeEl.trigger("change");
			    		}
	  				}
	  				// 渲染供应商
	  				if (opt.supplierEl)
	  				{
						var data = data1.factoryManageList;
			    		for (var i = 0; i < data.length; i++) {
			    			data[i].id = data[i].supCode;
			    			data[i].text = data[i].supName;
			    		}
			    		opt.supplierEl.select2({
			    			data:data,width:"100%"
			    		});

			    		if (opt.supplierVal)
			    		{
			    			opt.supplierEl.val(opt.supplierVal);
			    			opt.supplierEl.trigger("change");
			    		}
	  				}
	  				// 渲染代理服务器(多选)
	  				if (opt.agentEl)
	  				{
	  					var data = data1.agentConfigList;
	  					for (var i = 0; i < data.length; i++) {
			    			data[i].id = data[i].appId;
			    			data[i].text = data[i].nodeName;
			    		}
	  					inputdrop.renderSelect(opt.agentEl ,{
	  						data : data,
	  						allowAll : opt.allowAll
	  					});

	  					if (opt.agentVal)
			    		{
			    			opt.agentEl.val(opt.agentVal);
			    			opt.agentEl.trigger("change");
			    		}
	  				}
	  				// 渲染代理服务器(单选)
	  				if (opt.agentSelEl)
	  				{  
	  					var data = data1.agentConfigList;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].appId;
			    			data[i].text = data[i].nodeName;
	  					};
	  					if (opt.agentSelAll) 
	  					{
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					opt.agentSelEl.select2({
									  data: data,
									  width:"100%"
									});

	  					if (opt.agentSelVal)
			    		{
			    			opt.agentSelEl.val(opt.agentSelVal);
			    			opt.agentSelEl.trigger("change");
			    		}
	  				}
	  				// 渲染扫描器(单选)
	  				if (opt.vulScannerTypeEl)
	  				{
						var data = data1.vulScannerType_codelist;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].scancfg_no;
			    			data[i].text = data[i].scancfg_name;
	  					};
	  					data.insert(0 ,{id:"-1" ,text:"---"});
	  					opt.vulScannerTypeEl.select2({
									  data: data,
									  width:"100%",
									  minimumResultsForSearch:-1
									});
	  					if (opt.vulScannerTypeVal)
			    		{
			    			opt.vulScannerTypeEl.val(opt.vulScannerTypeVal);
			    			opt.vulScannerTypeEl.trigger("change");
			    		}
	  				}
	  				// 区域
	  				if (opt.regionEl)
	  				{
						var data = data1.regionCodeList;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].codevalue;
			    			data[i].text = data[i].codename;
	  					};
	  					data.insert(0 ,{id:"-1" ,text:"---"});
	  					opt.regionEl.select2({
									  data: data,
									  width:"100%",
									  minimumResultsForSearch:-1
									});
	  					if (opt.regionVal)
			    		{
			    			opt.regionEl.val(opt.regionVal);
			    			opt.regionEl.trigger("change");
			    		}
	  				}
	  				// 漏洞扫描器
	  				if (opt.scanTaskPolicyEl)
	  				{
						//var data = data1.scanTaskPolicyList;
                        var data = data1.openVasTaskPolicyList;
	  					for (var i = 0; i < data.length; i++) {
			    			data[i].id = data[i].policyID;
			    			data[i].text = data[i].policyName;
			    		}
	  					inputdrop.renderSelect(opt.scanTaskPolicyEl ,{
	  						data : data
	  					});

	  					if (opt.scanTaskPolicyVal)
			    		{
			    			opt.scanTaskPolicyEl.val(opt.scanTaskPolicyVal);
			    			opt.scanTaskPolicyEl.trigger("change");
			    		}
	  				}
	  				// 渲染故障事件类型
	  				if (opt.faultEventTypeEl)
	  				{
	  					var data = data1.faultclass;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].codevalue;
			    			data[i].text = data[i].codename;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					if(opt.screen)
	  					{
	  						data[0] = {id:"-1",text:"使用事件类型筛选"};
	  					}
	  					opt.faultEventTypeEl.select2({
													  data: data,
													  width:"100%"
													});
	  				}
	  				// 渲染性能事件类型
	  				if (opt.performEventTypeEl)
	  				{
	  					var data = data1.perfclass;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].codevalue;
			    			data[i].text = data[i].codename;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					if(opt.screen)
	  					{
	  						data[0] = {id:"-1",text:"使用事件类型筛选"};
	  					}
	  					opt.performEventTypeEl.select2({
													  data: data,
													  width:"100%"
													});
	  				}
	  				// 渲染安全事件类型
	  				if (opt.secEventTypeEl)
	  				{
	  					var data = data1.secEventCtg;
	  					if (!data)
	  						return false
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].eventTypeId;
			    			data[i].text = data[i].eventTypeName;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					opt.secEventTypeEl.select2({
													  data: data,
													  width:"100%"
													});
	  				}
	  				// 渲染安全事件类型(多选)
	  				if (opt.secEventTypeElMul)
	  				{
	  					var data = data1.secEventCtg;
	  					if (!data)
	  						return false
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].eventTypeId;
			    			data[i].text = data[i].eventTypeName;
	  					};
	  					if (!opt.isMultiple)
	  					{
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
					    inputdrop.renderSelect(opt.secEventTypeElMul,{
					    	data:data
					    });
					    if (opt.secEventTypeVal)
			    		{
			    			opt.secEventTypeElMul.val(opt.secEventTypeVal);
			    			opt.secEventTypeElMul.trigger("change");
			    		}
	  				}

	  				// 渲染资产所属类别

	  				if (opt.equipmentEl)
	  				{
	  					var data = data1.equipmentClasslist;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].deviceClassSort;
			    			data[i].text = data[i].deviceClassName;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					opt.equipmentEl.select2({
												  data: data,
												  width:"100%"
												});
	  				}

	  				// 渲染资产所属类别

	  				if (opt.equipmentAccountEl)
	  				{
	  					var data = data1.equipmentClassAccountlist;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].deviceClass;
			    			data[i].text = data[i].deviceClassName;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"0" ,text:"---"});
	  					}
	  					opt.equipmentAccountEl.select2({
												  data: data,
												  width:"100%"
												});
	  				}

	  				if (opt.fieldTypeEl)
	  				{
	  					var data = data1.fieldType;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].id;
			    			data[i].text = data[i].name;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					opt.fieldTypeEl.select2({
												  data: data,
												  width:"100%"
												});
	  				}

	  				// 渲染配置事件类型
	  				if (opt.deployEventTypeEl)
	  				{
	  					var data = data1.deplclass;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].codevalue;
			    			data[i].text = data[i].codename;
	  					};
	  					if(!!opt.isMultiple){

	  					}else {
	  						data.insert(0 ,{id:"-1" ,text:"---"});
	  					}
	  					opt.deployEventTypeEl.select2({
													  data: data,
													  width:"100%"
													});
	  				}
	  				// 渲染用户列表
	  				if (opt.userListEl)
	  				{
	  					var data = data1.allUserList;
	  					for (var i = 0; i < data.length; i++) {
	  						data[i].id = data[i].id;
			    			data[i].text = data[i].userAccount;
	  					};
	  					data.insert(0 ,{id:"-1" ,text:"---"});
	  					opt.userListEl.select2({
												  data: data,
												  width:"100%"
												});
	  				}
	  				// 渲染设备类型
	  				if (opt.deviceTypeEl)
	  				{
	  					var data = data1.deviceAssetTypeSiemTree;
						for (var i = 0; i < data.length; i++)
						{
							data[i].parent = "-1";
						}
						if (!opt.noRoot)
						{
							data.push({id:"root" ,parent:"-1" ,label:"设备类别"});
						}
						var default_opt = {
							pId:"parentID",
							label:"label",
							id:"id",
							enableChk : false,
							onlyLastChild : true,
							height : "210px",
							contentWidth : "1px",
							treeClick : function (event, treeId, treeNode){
								//sample_list_get(treeNode.id)
								opt.deviceTypeCb && opt.deviceTypeCb(treeNode.id)
							},
							initVal:opt.deviceTypeVal,
							searchBox:true
						};
						if (opt.onlyLastChild == false) 
						{
							delete default_opt['enableChk'];
							delete default_opt['onlyLastChild'];
						}
						if (opt.allChildWithNoCheck == true) 
						{
							delete default_opt['onlyLastChild'];
						}
						if (opt.chkboxType)
						{
							default_opt.chkboxType = opt.chkboxType;
						}
						inputdrop.renderTree(opt.deviceTypeEl ,data ,default_opt);
	  				}

	  				opt.cbf && opt.cbf();
	  			}
	  		});
		},
		// 渲染资产价值
		asset_value_render : function (el){
			var data = [
							{id: "-1",text: "---"},
				  			{id: "5",text: "很高"},
				  			{id: "4",text: "高"},
				  			{id: "3",text: "中"},
				  			{id: "2",text: "低"},
				  			{id: "1",text: "很低"}
				  		];
			el.oneTime(10 ,function (){
				el.select2({data:data,width:"100%"});
			});
		},

		// 渲染下拉列表
		select_render : function (el ,opt){
			var searchEl = $('<select class="form-control input-sm" search-data="'+opt.name+'" data-id="'+opt.name+'" initVal="'+opt.initVal+'"></select>');
			el.append(searchEl);
			searchEl.oneTime(10 ,function (){
				searchEl.select2({data:opt.data,width:"100%"});
			});
		},

		// 渲染下拉列表
		selectEl_render : function (selectEl ,opt)
		{
			var data = opt.data;
			var textName = opt.text;
			var IdName = opt.id;
			var val = opt.val;
			for (var i = 0; i < data.length; i++) {
				if (val == data[i][IdName])
				{
					selectEl.append('<option value="'+data[i][IdName]+'" selected>'+data[i][textName]+'</option>');
				}
				else
				{
					selectEl.append('<option value="'+data[i][IdName]+'">'+data[i][textName]+'</option>');
				}
				
			}
			selectEl.trigger("change");
		},

		// 渲染多选下列表
		multipleSelect_render : function (el ,opt){
			var inputdropEl = $('<div class="inputdrop"></div>');
			inputdropEl.attr("id" ,opt.name);
			opt.initVal && inputdropEl.attr("initVal" ,opt.initVal);
			el.append(inputdropEl);
			inputdrop.renderSelect(inputdropEl ,{
				data : opt.data,
				height : "175px",
				allowAll : opt.allowAll
			})
		},

		// 渲染附件上传(最大附件数限制)
		appendix_render : function (el ,opt)
		{
			if (opt.method == "getUploadStrArray")
			{
				getUploadStrArray();
				return false;
			}
			var appendix_limit_count = -1;
			var delStrArray = [];
			var uploadStrArray = [];
			el.data("delStrArray" ,delStrArray);
			el.data("uploadStrArray" ,uploadStrArray);
			// 获取最大附件数
			appendix_limit_count_get();
			// 渲染附件按钮
			el.append('<div id="appendix_add_btn"><i class="icon-plus"></i></div>');
			// 渲染已传附件
			el.append('<div id="has_appendix_div"></div>');
			// 渲染附件上传
			el.append('<div id="appendix_upload_div"></div>');
			var appendix_add_btn = el.find("[id=appendix_add_btn]");
			var el_has_appendix_div = el.find("[id=has_appendix_div]");
			var el_appendix_upload_div = el.find("[id=appendix_upload_div]");

			has_appendix_render();

			appendix_add_btn.click(function (){
				if (appendix_limit_count == -1)
				{
					return false;
				}
				if (adjust_appendix())
				{
					add_appendix_el();
				}
			});
			
			// 渲染已上传的附件
			function has_appendix_render()
			{
				var data = opt.data;
				if (!data)
				{
					return false;
				}
				var buffer = [];
				for (var i = 0; i < data.length; i++) {
					buffer = [];
					buffer.push('<div class="form-group">');
					if(opt.nodownload)
					{
						buffer.push('<div class="col-lg-10" id="'+data[i][opt.id]+'">'
								+data[i][opt.key]
								+'</div>');
					}
					else
					{
						buffer.push('<div class="col-lg-10">'
								+'<a href="javascript:void(0);" id="'+data[i][opt.url]+'" data-flag="appendix">'
								+data[i][opt.key]
								+'</a>'
								+'</div>');
					}
					buffer.push('<div class="col-lg-2"><i class="icon-trash" style="font-size:14px"></i></div>');
					buffer.push('</div>');
					el_has_appendix_div.append(buffer.join(""));
				}
				if(!opt.nodownload)
				{
					el_has_appendix_div.find("[data-flag='appendix']").click(function (){
						var url = $(this).attr("id");
						window.location.href = url;
					});
				}
				el_has_appendix_div.find("[class='icon-trash']").click(function (){
					var array = el.data("delStrArray");
					if(opt.nodownload)
					{
						array.push($(this).parent().prev().attr("id"));
					}
					else
					{
						array.push($(this).parent().prev().children().html());
					}
					el.data("delStrArray" ,array);
					$(this).closest("[class=form-group]").remove();
				});
			}

			// 新增一条附件上传的元素
			function add_appendix_el()
			{
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
			}

			function adjust_appendix()
			{
				// 已有组件数
				var has_appendix_count = el_has_appendix_div.children().size();
				// 上传组件数
				var el_appendix_upload_count = el_appendix_upload_div.children().size();

				if ((has_appendix_count + el_appendix_upload_count) == appendix_limit_count)
				{
					return false;
				}
				else
				{
					return true;
				}
				
			}

			function appendix_limit_count_get()
			{
				var url = "GeneralController/queryAppendixInfo";
				var paramObj = {procInstID : opt.procInstID};
				if(opt.limitUrl)
				{
					url = opt.limitUrl;
					paramObj = {};
				}
				um_ajax_get({
					url : url,
					isLoad : false,
					paramObj : paramObj,
					successCallBack : function (data){
						appendix_limit_count = data.maxstore[0].maxUpLoadFileNum;
					}
				});
			}

			function getUploadStrArray()
			{
				var array = [];
				el.find("[data-id=up_name]").each(function (){
					array.push($(this).val());
				});
				el.data("uploadStrArray" ,array);
			}
		},

		// 渲染定时刷新按钮
		interval_refresh_render : function (el ,opt){
			var el_oper_col = el;
			el.addClass("oper-array");
			var elTable = opt.elTable;
			if (!opt.hideOption)
			{
				var buffer = [];
				buffer.push('<ul class="oper-ul tran" style="right:3px; width:83px;">');
				buffer.push('<li data-val="0">关闭<i class="r"></i></li>');
				buffer.push('<li data-val="1">1分<i class="r"></i></li>');
				buffer.push('<li data-val="5">5分<i class="r"></i></li>');
				buffer.push('<li data-val="10">10分<i class="r"></i></li>');
				buffer.push('<li data-val="30">30分<i class="r"></i></li>');
				buffer.push('</ul>');
				el_oper_col.append(buffer.join(""));
			}
			
			el.click(function (){
				g_grid.refresh(elTable);
				opt.cbf && opt.cbf();
			});
			el.find("li").click(function (){
				$("#index_timer_inp").stopTime();
				var interval = parseInt($(this).attr("data-val"));
				el_oper_col.find("i").removeClass("icon-ok");
				$(this).find("i").addClass("icon-ok");
				if(interval == 0)
				{
					g_dialog.operateAlert(elTable ,"已关闭自动刷新");
					return false;
				}
				else
				{
					g_dialog.operateAlert(elTable ,"已设置页面自动刷新时间为" + interval + "分钟");
				}
				$("#index_timer_inp").everyTime(interval * 1000 *60 ,function (){
					g_grid.refresh(elTable);
					opt.cbf && opt.cbf();
				});
				return false;
			});
		},

		// 周期变换
		// param : first_inp
		//		   second_inp
		//		   third_inp
		//         first_sel_val
		//         second_sel_val
		//         third_sel_val
		cycle_change_render : function (opt){
			// 天  月  周
			// 天:  第二框 disable    第三框  ： hh:mm
			// 月:  第一框 1-28       第三框 : hh:mm
			// 周:  第一框 周一到周日 第三框 : hh:mm
			var cycle_type_array = [
			                        {id:"-1",text:"---"},{id:"1",text:"天"},{id:"2",text:"周"},{id:"3",text:"月"}
			                       ];
			var week_type_array  = [
									{id:1,text:"星期一"},{id:2,text:"星期二"},{id:3,id:"星期三"},
									{id:4,text:"星期四"},{id:5,text:"星期五"},{id:6,id:"星期六"},
									{id:0,text:"星期日"}
								  ];
			var month_type_array = [];
			for (var i = 1; i <= 28; i++) {
				month_type_array.push({text:i,id:i});
			}

			var el_first_sel = opt.first_sel;
			var el_second_sel = opt.second_sel;
			var el_third_sel = opt.third_sel;

			var el_first_sel_val = opt.first_sel_val;
			var el_second_sel_val = opt.second_sel_val;
			var el_third_sel_val = opt.third_sel_val;

			el_first_sel.select2({data:cycle_type_array,width:"100%"});

			el_first_sel.change(function (){
				var tis_val = $(this).val();
				if (tis_val == "-1")
				{
					el_second_sel.attr("disabled" ,"disabled");
				}
				else if (tis_val == "1")
				{
					el_second_sel.select2({data:[],width:"100%"});
				}
				else if (tis_val == "2")
				{
					el_second_sel.select2({data:week_type_array,width:"100%"});
				}
				else if (tis_val =="3")
				{
					el_second_sel.select2({data:month_type_array,width:"100%"});
				}

				if (tis_val == "-1")
				{
					el_third_sel.attr("disabled" ,"disabled");
				}
				else
				{
					el_third_sel.removeAttr("disabled");
				}
			});

			if (el_first_sel_val)
			{
				el_first_sel.val(el_first_sel_val);
				el_first_sel.trigger("change");
			}
			if (el_second_sel_val)
			{
				el_second_sel.val(el_second_sel_val);
				el_second_sel.trigger("change");
			}
		},

		// 表格左右移动
		table_move_render : function (opt){
			var el_left_table = opt.left_table;
			var el_right_table = opt.right_table;

			var el_left_btn = opt.left_btn;
			var el_right_btn = opt.right_btn;

			// 左移
			el_left_btn.click(function (){

			});

			// 右移
			el_right_btn.click(function (){

			});
		},

		vdc_input_drop_render : function (el ,opt){
			opt = opt || {}
			um_ajax_get({
				url : "cloud/ScVdc/queryScVdcInfoListTree",
				isLoad:false,
				successCallBack : function (data){
					for(var i=0;i<data.length;i++)
					{
						data[i].pId="-1"
						data[i].label = data[i].name;
						data[i].parentID = data[i].pId;
					}
					inputdrop.renderTree(el ,data,{
					  	initVal:opt.initVal ? opt.initVal:null,
					  	id:"id",pId:"pId",label:"name",
					  	contentWidth:10,
					  	enableChk:opt.enableChk ? opt.enableChk : false,
					  	rootNode:"-1",
					  	searchBox : true,
					  	placeholder : opt.placeholder ? opt.placeholder : "请选择VDC",
					  	height : "300px",
					  	removeCbf : opt.removeCbf
					 });
				}
		    });
		},

		clearable_input_render : function (el ,opt){
			var el_parent = el.parent()
			var el_remove_i = $('<div class="icon-remove"></div>').appendTo(el.parent())
			if (el_parent.find(".icon-search").size() > 0)
				el_remove_i.css("right" ,"23px")
			el_parent.mouseover(function (){
				el_remove_i.css("opacity" ,"1")
			}).mouseleave(function (){
				el_remove_i.css("opacity" ,"0")
			})
			el_remove_i.click(function (e){
				el.val("")
				opt && opt.cbf && opt.cbf()
				e.stopPropagation()
			})
		},

		percent_span_render : function (percentNum){
			var num = parseInt(percentNum)
			return '<span class="db bdd prel" style="width:40%;height:20px">'
					+'<span class="h-all pabs" style="left:0;top:0;width:'+percentNum
					+';background-color:'+index_cloud_num_color_get(num)+'">'
					+'</span><span class="pabs w-all h-all tc" style="left:0;top:0;line-height:17px;">'+percentNum+'</span></span>'
		},

		tree_expand_collapse_render : function (el ,treeEl, cbf){
			el = el || $(".ant-header").eq(0)
			treeEl = treeEl || $(".ant-body-block").eq(0)
			var el_btn = $('<div class="oper-expand-collapse-div oper-expand"></div>').appendTo(el)
			el_btn.css("left" ,parseInt(treeEl.css("width")) + 15 + "px")
			el_btn.click(function (){
				el_btn.toggleClass("oper-collapse")
				treeEl.toggleClass("collapse")
				g_grid.resizeSup($(".um-grid").parent())

				var __t = $("[_echarts_instance_]").data("chart")
	            if (__t)
	           		__t.resize()
	           	cbf &&　cbf()
			})
		},

		time_selector_disable : function(el,disabled){
			if (el.parent().find(".mask").size() > 0) {
				el.parent().find(".mask").remove()
			}
			if (disabled) {
				el.parent().append("<div class='mask'></div>")
			} else {
				el.closest(".mask").remove()
			}
			
		}
	}

});