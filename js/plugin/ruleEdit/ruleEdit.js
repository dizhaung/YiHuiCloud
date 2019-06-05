define(["css!/js/plugin/ruleEdit/ruleEdit.css"] ,function (){
	var filedData
	var el

	var STR_SEL_LIST = [
							{id:"startWith" ,text:"startWith"},
							{id:"endWith" ,text:"endWith"},
							{id:"indexOf" ,text:"indexOf"},
							{id:"match" ,text:"match"}
					   ]

	var NUMBER_SEL_LIST = [
							{id:"in" ,text:"in"},
							{id:"between" ,text:"between"},
							{id:"eq" ,text:"=="},
							{id:"gt" ,text:">"},
							{id:"ge" ,text:">="},
							{id:"lt" ,text:"<"},
							{id:"le" ,text:"<="},
							{id:"ne" ,text:"!="}
						  ]
	return {
		init : function (aEl ,opt){
			el = aEl
			el.addClass("um-rule")
			filedData = opt.filedData
			this.renderData(opt.ruleData)
		},
		getData : function (){
			var result_json = ""
			var result_tmp_json = ""
			var result_obj = new Object()
			result_obj.expression = new Object()
			result_obj.expression.OR = []
			el.find(".um-rule-block").each(function (){
				var __blockObj = new Object()
				result_obj.expression.OR.push(__blockObj)
				__blockObj.AND = []
				result_tmp_json = ""
				$(this).find(".um-rule-condition-inner").each(function (){
					if ($(this).find("select").size() > 0){
						var __tmp = new Object()
						result_tmp_json = result_tmp_json
													+ $(this).find("select").eq(0).val()
													+ ' ' + $(this).find("select").eq(1).find("option:selected").text()
													+ ' ' + $(this).find("[inp]").val()
													+ ' AND '
						__tmp.key = $(this).find("select").eq(0).val()
						__tmp.opType = $(this).find("select").eq(1).val()
						__tmp.value = $(this).find("[inp]").val()
						__blockObj.AND.push(__tmp)
					}
				})
				result_json = result_json + result_tmp_json.substr(0 ,result_tmp_json.length - 5) + " OR "
			})
			return {
				result_json : result_json.substr(0 ,result_json.length - 4),
				result_obj : result_obj
			}
		},
		renderData : function (data){
			if (!data)
			{
				__block_add(el)
				return false
			}
			// var data = {
			// 				expression:{
			// 							   OR:[
			// 								       {
			// 								    	  AND:[
			// 								    		     {key:"engineId" ,opType:"startWith" ,value:"789"},
			// 								    		     {key:"domain" ,opType:"endWith" ,value:"123"}
			// 								    	      ]
			// 								       }
			// 							      ]
			// 						    }
			//		   }
			var ORList = data.expression.OR
			ORList.forEach(function (ORTmp){
				var __tmp_block = __block_add(el)
				var ANDList = ORTmp.AND
				ANDList.forEach(function (ANDTmp){
					__condition_add(__tmp_block ,null ,ANDTmp)
				})
			})
		}
	}

	// 添加一个查询区域
	function __block_add(el)
	{
		var el_block = $('<div class="um-rule-block"><i class="icon-minus-sign icon-animate __remove"></i></div>').appendTo(el)
		var el_relation = $('<div class="um-rule-relation"><div class="__splitline"></div><div class="__text">或</div></div>').appendTo(el)
		el_relation.find("[class*=__text]").click(function (){
			if (el_relation.hasClass("active"))
				return false
			el_relation.addClass("active")
			__block_add(el)
		})
		el_block.find(".__remove").click(function (){
			if (el_block.index() == 0)
				return false
			// 如果是最后一个
			if (el_block.index() != (el.find(".um-rule-block").size() - 1))
				el_block.prev().removeClass("active")
			el_block.next().remove()
			el_block.remove()
		})
		__condition_add(el_block ,'add_btn')
		return el_block
	}

	// 添加一条查询
	function __condition_add(el_block ,type ,paramData){
		var el_condition = $('<div class="um-rule-condition"></div>')
		var condition_size = el_block.find("[class=um-rule-condition]").size()

		el_condition.appendTo(el_block)

		el_condition.append('<div class="um-rule-condition-splitline"></div>')

		var el_inner = $('<div class="um-rule-condition-inner"></div>').appendTo(el_condition)

		if (type == 'add_btn'){
			__condition_add_btn_render(el_block ,el_inner)
			return false
		}

		el_inner.append('<div class="__addDiv">且</div><div class="__sel_div"><select data-type="select" canSearch></select></div>'
						+'<div class="__sel_div"><select data-type="select"></select></div><div class="__sel_div">'
						+'<input class="form-control input-sm" inp/></div><i class="icon-minus-sign"></i>')
		
		el_inner.find(".icon-minus-sign").click(function (){
			$(this).closest(".um-rule-condition").remove()
		})

		__create_sel_data(el_inner.find("select").eq(0) ,filedData ,"key" ,"name" ,true ,el_inner)

		if (paramData)
		{
			el_inner.find("select").eq(0).val(paramData.key)
			el_inner.find("select").eq(0).trigger("change")
			el_inner.find("select").eq(1).val(paramData.opType)
			el_inner.find("select").eq(1).trigger("change")
			el_inner.find("[inp]").val(paramData.value)
		}

		index_form_init(el_inner)
	}

	function __condition_add_btn_render(el_block ,el_inner){
		el_inner.append('<div class="__addDiv">且</div><div class="__addBtnDiv"><i class="icon-plus"></i></div>')
		el_inner.find(".__addBtnDiv").click(function (){
			__condition_add(el_block)
		})
	}

	// 组装select数据
	function __create_sel_data(selEl ,data ,id ,text ,type ,el_inner){
		data.forEach(function (tmp){
			selEl.append('<option value="'+tmp[id]+'" data-type="'+tmp.type+'">'+tmp[text]+'</option>')
		})

		if (type)
		{
			selEl.change(function (){
				__create_operator_sel_data(selEl.find("option:selected").attr("data-type") ,el_inner)
			})
			selEl.change()
		}
	}

	// 组装运算符select
	function __create_operator_sel_data(type ,el_inner){
		el_inner.find("select").eq(1).empty()
		if (type == "LONG")
			__create_sel_data(el_inner.find("select").eq(1) ,NUMBER_SEL_LIST ,"id" ,"text")
		else
			__create_sel_data(el_inner.find("select").eq(1) ,STR_SEL_LIST ,"id" ,"text")
		el_inner.find("select").eq(1).trigger("change")
	}

	// 校验规则
	function __validate()
	{

	}

})