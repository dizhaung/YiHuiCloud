define([] ,function (){

	var list_url = "proofController/queryProof";

	var add_url = "proofController/addProof";

	var update_url = "proofController/updProof";

	var delete_url = "proofController/delProof";

	var detail_url = "proofController/queryDetailProof";

	var header = [
					{name:"",text:"" ,hideSearch:"hide",width:3},
					{text:'名称',name:"proofName",align:"left",width:20},
					{text:'请求URL',name:"proofUrl",align:"left",width:20 ,tip:true ,render : function (txt){
						return ((txt.length > 20) ? (txt.substr(0,20)+"...") : txt);
					}},
					{text:'请求方式',name:"request_method" ,align:"left",width:17,render : function (txt){
						return (txt==0?"get":"post");
					}},
					{text:'连接方式',name:"connect_type",align:"left",width:20},
					{text:'端口',name:"monitor_port",align:"left",width:20}
				 ];
	var index_oper = [
						{icon:"rh-icon rh-edit" ,text:"修改" ,aclick:edit_template_init},
						{icon:"rh-icon rh-delete" ,text:"删除" ,aclick:proof_delete}
					 ];

	Array.prototype.clone=function(){ return [].concat(this); }

	var urltokenModule = {
		list : function (el_table_div, opt){
			g_grid.render(el_table_div,{
				 header:header,
				 paramObj: opt && opt.param ? opt.param : {},
				 oper: index_oper,
				 operWidth:"100px",
				 hideSearch:true,
				 allowCheckBox:false,
				 url:list_url,
				 autoHeight :true,
				 cbf:function(){
					 $("#table_div .um-grid-table table td.tip").css("color","#666");
				 },
				 dbClick : detail_template_init
			});
		},
		dialogList : function (opt){
			var dialog_data_header = header.clone();
			dialog_data_header.unshift({text:'',name:"t" ,width:10 ,render:function (txt ,rowData){
				return '<div class="radio"><label class="i-checks"><input type="radio" value="'+rowData.proofId+'" data-name="'+rowData.proofName+'" name="proofChk"><i></i></label></div>';
			}});
			g_dialog.dialog('<div id="diaglog_table_div" class="table-div table-list" style="height:400px"></div>',{
				width:"650px",
				initAfter:initAfter,
				title:"令牌配置列表",
				saveclick:save_click,
				top:"6%"
			});

			var el_diaglog_table_div;

			function initAfter(el)
			{
				el_diaglog_table_div = el.find("[id=diaglog_table_div]");
				g_grid.render(el_diaglog_table_div,{
					 header:dialog_data_header,
					 url:list_url,
					 paginator:false,
					 maskObj:el_diaglog_table_div,
					 showCount:true,
					 allowCheckBox:false,
					 hideSearch:true
				});
			}

			function save_click(el)
			{
				var checkedId = el.find("[type=radio]:checked").val();
				var name = el.find("[type=radio]:checked").attr("data-name");
				if (!checkedId)
				{
					g_dialog.operateAlert(el ,index_select_one_at_least_msg ,"error");
					return false;
				}
				opt && opt.cbf && opt.cbf(checkedId ,name);
				g_dialog.hide(el);
			}
		},
		dialogEdit : function (opt){
			var rowData = opt.rowData;
			var el_validateRequestHead_add_btn;
			var el_validateRequestBody_add_btn;
			var title = rowData?"令牌配置修改":"令牌配置新增";
			$.ajax({
				type: "GET",
				url: "js/plugin/urltoken/urltoken.html",
				success :function(data)
				{
					g_dialog.dialog($(data).find("[id=edit_template]"),{
						width:"960px",
						init:init,
						initAfter:initAfter,
						title:title,
						saveclick:save_click,
						autoHeight : "autoHeight"
					});
				}
			});

			function init(el)
			{
				el_validateRequestHead_add_btn = el.find("[id=validateRequestHead_add_btn]");
				el_validateRequestBody_add_btn = el.find("[id=validateRequestBody_add_btn]");
				g_grid.render(el.find("[data-id=paramList]") ,{
								data : [],
								header : [{text:"参数名称",name:"post_or_get_name",align:"left"},{text:"参数值",name:"post_or_get_value",align:"left"}],
								paramObj : null,
								hideSearch : true,
								paginator : false,
								cbf : function (){
									rowData
											? (g_grid.addData(el.find("[data-id=paramList]") ,rowData.proofParam))
											: "";
								}
							});
				param_move_event_init(el);

				el.find("[name*=ischeck]").click(function (){
					($(this).val() == 1) ? el.find('[data-check='+$(this).attr("name")+']').show()
										 : el.find('[data-check='+$(this).attr("name")+']').hide();
					
				});

				el.find("[class=appendix_add_btn]").click(function (){
					requestInfo_inp_add($(this));
				});

				el.on("click" ,"[class=icon-trash]" ,function (){
					$(this).closest("[class=form-group]").remove();
				});
			}
			function initAfter(el)
			{
				if (rowData)
				{
					el.umDataBind("render" ,rowData);
					el.find("select").trigger("change");
					el.find('[name=ischeckcode][value='+rowData.ischeckcode+']').click()
					el.find('[name=ischeckheader][value='+rowData.ischeckheader+']').click()
					el.find('[name=ischeckreponse][value='+rowData.ischeckreponse+']').click()
					requestInfo_inp_render(el_validateRequestHead_add_btn ,rowData.checkheadname);
					requestInfo_inp_render(el_validateRequestBody_add_btn ,rowData.checkresponse);
				}
			}
			function save_click(el ,saveObj)
			{
				var url = (rowData?update_url:add_url);
				if (!g_validate.validate(el))
				{
					return false;
				}
				(saveObj.ischeckheader == 1)
										     ?(saveObj.checkheadname = requestInfo_inp_str_create(el_validateRequestHead_add_btn))
										     :(saveObj.checkheadname = "");
				(saveObj.ischeckreponse == 1)
											 ?(saveObj.checkresponse = requestInfo_inp_str_create(el_validateRequestBody_add_btn))
											 :(saveObj.checkresponse = "");
				saveObj.proofParam = g_grid.getData(el.find("[data-id=paramList]"));

				um_ajax_post({
					url : url,
					paramObj : saveObj,
					maskObj : el,
					successCallBack : function (data){
						g_dialog.hide(el);
						g_grid.refresh($("#table_div"));
					}
				});
			}
		}
	}

	function edit_template_init(rowData)
	{
		urltokenModule.dialogEdit({rowData:rowData});
	}

	function proof_delete(rowData)
	{
		g_dialog.operateConfirm("确认删除此记录么" ,{
			saveclick : function()
			{
				um_ajax_post({
					url : delete_url,
					paramObj : rowData,
					successCallBack : function(data){
						g_grid.refresh($("#table_div"));
						g_dialog.operateAlert(null ,"操作成功！");
					}
				});
			}
		});
	}

	function detail_template_init(rowData)
	{

	}

	function param_move_event_init(el)
	{
		//参数右移事件
		el.find("[data-form=paramList]").find("[data-id=move_right]").click(function(){
			if (el.find("[data-id=paramName]").val() != "" && el.find("[data-id=paramValue]").val() != "") 
			{
				g_validate.setError(el.find("[data-id=paramName]"), "");
				g_validate.setError(el.find("[data-id=paramValue]"), "");
				var paramNameArray = g_grid.getIdArray(el.find("[data-id=paramList]") ,{attr:"post_or_get_name"});
				var paramValueArray = g_grid.getIdArray(el.find("[data-id=paramList]") ,{attr:"post_or_get_value"});
				if (paramNameArray.indexOf(el.find("[data-id=paramName]").val()) != -1 || paramValueArray.indexOf(el.find("[data-id=paramValue]").val()) != -1)
				{
					g_dialog.operateAlert(el ,msg.repeat ,"error");
					return false;
				}
				g_grid.addData(el.find("[data-id=paramList]") ,[{
					post_or_get_name : el.find("[data-id=paramName]").val(),
					post_or_get_value : el.find("[data-id=paramValue]").val()
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
			}
		});
	}

	function requestInfo_inp_add(el_btn ,inpVal)
	{
		var tmpVal = (inpVal?inpVal:"");
		var el_list = el_btn.parent().find("[data-type=list]");
		el_list.append('<div class="form-group"><div class="col-lg-10"><input type="text" class="form-control input-sm" value="'+tmpVal+'"/></div>'
							+'<div class="col-lg-2" style="line-height:30px"><i class="icon-trash"></i></div></div>');
	}

	function requestInfo_inp_render(el_btn ,inpStr)
	{
		if (!inpStr)
		{
			return false;
		}
		var inpArray = inpStr.split(",");
		for (var i = 0; i < inpArray.length; i++) {
			requestInfo_inp_add(el_btn ,inpArray[i]);
		}
	}

	function requestInfo_inp_str_create(el_btn)
	{
		var el_list = el_btn.parent().find("[data-type=list]");
		var inpArray = [];
		el_list.find("input").each(function (){
			inpArray.push($(this).val());
		});
		return inpArray.join(",");
	}

	return urltokenModule;
})