(function($){ 
	
	// 对外公布的方法
    var methods =
    {
    	// 数据序列化
	    serialize: function(attrPrefix ,prefix)
	    {
	    	var self = this;
	    	prefix = (prefix == undefined ? "" : prefix);
	    	attrPrefix = (attrPrefix == undefined ? "data-id" : attrPrefix);
	    	var obj = new Object();
	    	var attrName = "";
	    	$(this).find('input:not(:disabled)').each(function (){
	    		attrName = $(this).attr(attrPrefix);
	    		if (attrName)
	    		{
					obj[prefix + attrName] = $(this).val().trim();
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
	    	$(this).find('textarea').each(function (){
	    		attrName = $(this).attr(attrPrefix);
	    		if (attrName)
	    		{
	    			obj[prefix + attrName] = $(this).val();
	    		}
	    	});
	    	$(this).find('select:not(:disabled)').each(function (){
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
	    	$(this).find('label[data-id]').each(function (){
	    		attrName = $(this).attr(attrPrefix);
	    		if (attrName)
	    		{
	    			obj[prefix + attrName] = $(this).text();
	    		}
	    	});
	    	return obj;
	    },

	    // 拼接查询字符串
	    queryStr: function (prefix)
	    {
	    	prefix = (prefix == undefined ? "" : prefix);

	    	var queryStr = "";

	    	var queryValueEl = "";

	    	var queryValue = "";

	    	var tmpStr = "";

	    	$(this).find("[queryStr]").each(function (){

	    		queryValueEl = $(this).closest("[class=form-group]").find("[queryValue]");

	    		queryValue = queryValueEl.val();

	    		if (queryValue)
	    		{

	    			if ($(this).html() == "IPV4")
	    			{
						var startIp = $(this).closest("[class=form-group]").find("[queryValue]").eq(0).val();
	    				var endIp = $(this).closest("[class=form-group]").find("[queryValue]").eq(1).val();
	    				if (startIp)
	    				{
							tmpStr = '<span style="font-weight:600;margin:0 10px">起始ip</span>' 
			    					+ '<span title="'+startIp+'">'+startIp+'</span>';
	    				}
	    				if (endIp)
	    				{
							tmpStr = tmpStr + '<span style="font-weight:600;margin:0 10px">终止ip</span>' 
			    					+ '<span title="'+endIp+'">'+endIp+'</span>';
	    				}
	    			}
	    			// select框
	    			else if(queryValueEl.is("select"))
	    			{
	    				if (queryValue == -1)
	    				{
							tmpStr = undefined;
	    				}
	    				else
	    				{
							tmpStr = '<span style="font-weight:600;margin:0 10px">'+$(this).html()+'</span>' 
											+ '<span title="'+queryValue+'">'+ queryValueEl.find("option:selected").text()+'</span>';
	    				}
	    				
	    			}
	    			// 正常input框
	    			else
	    			{
						queryValueAbbr = queryValue.length > 16 ? queryValue.substr(0,16) + "..." : queryValue;
						tmpStr = '<span style="font-weight:600;margin:0 10px">'+$(this).html()+'</span>' 
									   + '<span title="'+queryValue+'">'+queryValueAbbr+'</span>';
	    			}

		    		tmpStr && (queryStr = queryStr + tmpStr);
	    		}
	    	});
	    	return queryStr;
	    },
	    //数据回显
	    render: function(obj ,prefix)
	    {
	    	var self = this
	    	prefix = (prefix == undefined ? "" : prefix);
	    	if (!obj)
	    	{
	    		return false;
	    	}
	    	for (var attrName in obj)
	    	{

	    		$(this).find("input[data-id="+attrName+"][type=text]").val(obj[attrName]);
	    		$(this).find("input[data-id="+attrName+"][type=password]").val(obj[attrName]);
	    		$(this).find("input[data-id="+attrName+"][type=hidden]").val(obj[attrName]);
	    		$(this).find("select[data-id="+attrName+"]").val(obj[attrName]);
	    		$(this).find("textarea[data-id="+attrName+"]").val(obj[attrName]);
	    		$(this).find("label[data-id="+attrName+"]").text(beautyNull(obj[attrName]));
	    		$(this).find("span[data-id="+attrName+"]").text(beautyNull(obj[attrName]));
	    		if ($(this).find("label[data-id="+attrName+"][encrypt]").text())
	    		{
	    			$(this).find("label[data-id="+attrName+"][encrypt]").text(Encrypt(beautyNull(obj[attrName])));
	    		}
	    		if ($(this).find("input[data-id="+attrName+"][encrypt]").val())
	    		{
	    			$(this).find("input[data-id="+attrName+"][encrypt]").val(Encrypt(obj[attrName]));
	    		}
	    		$(this).find("a[data-id="+attrName+"]").text(beautyNull(obj[attrName]));
	    		$('input:radio[name='+attrName+'][value="'+obj[attrName]+'"]').attr("checked",'checked');

	    		if ($(self).find("input:checkbox[data-id="+attrName+"]").size() > 0)
	            {
	                var valueList = null;
	                try{
                        valueList=obj[attrName].split(",");
					}catch(e){valueList=null}
					if(valueList!=null){
                        $(self).find('input:checkbox[name="'+attrName+'"]').each(function (){
                            for (var i = 0; i < valueList.length; i++){
                                if ($(this).val() == valueList[i])
                                    $(this).attr("checked",'checked')
                            }
                        })
                    }
	            }

	    	}

			function beautyNull(str)
			{
				if (str == null || str == undefined)
				{
					return "";
				}
				return str;
			}
	    },

	    renderCheckBox:function (el ,opt){
	    	var valueList = opt.value;
	    	el.find('input:checkbox[name="'+opt.name+'"]').each(function (){
	    		for (var i = 0; i < valueList.length; i++) {
	    			if ($(this).val() == valueList[i])
	    			{
	    				$(this).attr("checked",'checked');
	    			}
	    		}
	    	});
	    },

	    // 数据重置
	    reset : function ()
	    {
	    	var self = this;
	    	this.find("input").not("[searchCache]").not("[type=radio]").each(function (){
	    		$(this).val("");
	    	});
	    	this.find("label[data-id]").text("");
	    	this.find("select").each(function (){
	    		if ($(this).attr("initVal") && $(this).attr("initVal") != "undefined")
	    		{
	    			$(this).val($(this).attr("initVal"));
	    		}
	    		else
	    		{
	    			$(this).val("-1");
	    		}
	    	});
	    	this.find("select").trigger("change");
	    	self.find("[class=inputdrop]").each(function (){
	    		var el_inpdrop = $(this);
	    		$(this).find("input[type=text]").val("");
				$(this).find("input[type=hidden]").val("");
				$(this).find("ul").find("[data-type*=chk]").removeAttr("checked");
				if ($(this).attr("initVal"))
				{
					$(this).find("input[type=hidden]").val($(this).attr("initVal"));
					require(['/js/plugin/inputdrop/inputdrop.js'] ,function (inputdrop){
						inputdrop.setDataSelect(el_inpdrop ,el_inpdrop.attr("initVal"));
					});
				}
				var treeObj = $(this).find("ul").data("tree");
				if (treeObj)
				{
					treeObj.checkAllNodes(false);
				}
	    	});
	    }

    };
	
	$.fn.umDataBind = function(options ,prefix){
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        return null;
	};
})(jQuery);