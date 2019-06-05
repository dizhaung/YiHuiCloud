define(function (){
	return {
			render : function (el ,options)
			{
				// 默认属性  
		        var defaults =  
		        {  
		            // 长度最低支持110像素  
		            width : 110,  
		            // 高度默认20像素  
		            height : 30,  
		            // 在键盘按下时用来存储未输入前的值  
		            currValue : '',  
		            // 原有值，就是从数据库中读取到的值  
		            value : '',
		            validate : false
		        }
		          
		        // 传递的参数
		        var options = $.extend(defaults, options);

		        // 输入控件代码  
		        var html = '';
		        html += '<div class="ipinput_div">';
		        html += '<input type="hidden" data-id="'+el.attr("id")+'"/>';
		        html += '<input type="text" id="ti_hour" class="ipinput_input" maxlength=2/>';  
		        html += '<span class="ipinput_separator">:</span>';  
		        html += '<input type="text" id="ti_minute" class="ipinput_input" maxlength=2/>';  
		        html += '<span class="ipinput_separator">:</span>';  
		        html += '<input type="text" id="ti_second" class="ipinput_input" maxlength=2/>';
		        html += '<div class="mask" style="background-color:#ddd"></div>'
		        html += '</div>';

		        el.append(html);

		        var el_hour_inp = el.find("[id=ti_hour]");
		        var el_minute_inp = el.find("[id=ti_minute]");
		        var el_second_inp = el.find("[id=ti_second]");
		        var el_hidden_inp = el.find("input[type=hidden]");

		        if (options.validate)
		        {
		        	el_hidden_inp.attr("validate" ,"required,Hms");
		        }

		        if (options.initVal)
		        {
		        	this.setData(el ,options.initVal);
		        }

		        // 输入框绑定键盘按下事件  
		        el.find('.ipinput_input').keydown(function(event)  
		        {  
		            keydown(event ,this);  
		        });  
		          
		        // 输入框绑定键盘按下弹起事件  
		        el.find('.ipinput_input').keyup(function(event)
		        {
		        	$(this).oneTime(100 ,function (){
		        		keyup(event ,this);
		        	});
		        });  
		          
		        // 输入框失去焦点事件  
		        el.find('.ipinput_input').click(function()  
		        {  
		            $(this).select(); 
		        });

		        el.find('.ipinput_input').blur(function()  
		        {  
		        	if (el_hour_inp.val().length ==1 )
		        	{
		        		el_hour_inp.val("0" + el_hour_inp.val())
		        	}
		        	if (el_minute_inp.val().length ==1 )
		        	{
		        		el_minute_inp.val("0" + el_minute_inp.val())
		        	}
		        	if (el_second_inp.val().length ==1 )
		        	{
		        		el_second_inp.val("0" + el_second_inp.val())
		        	}
		            el_hidden_inp.val(el_hour_inp.val() + ":" + el_minute_inp.val() + ":" + el_second_inp.val());
		        });

		        // 判断参数是否为空  
			    var isEmpty = function(obj)  
			    {  
			        if(null == obj)  
			        {
			            return true;  
			        }  
			        else if(undefined == obj)  
			        {
			            return true;  
			        }
			        else  
			        {  
			            return false;  
			        }  
			    };
		        // 键盘按下事件  
			    var keydown = function(event ,tis)  
			    {

			        // 当前输入的键盘值  
			        var code = event.keyCode;

			        // 除了数字键、删除键、小数点之外全部不允许输入  
			        if((code < 48 && 8 != code && 37 != code && 39 != code)   
			            || (code > 57 && code < 96)   
			            || (code > 105 && 110 != code && 190 != code))  
			        {  
			            return false;
			        }
			        // 先存储输入前的值，用于键盘弹起时判断值是否正确  
			        options.currValue = $(tis).val();  
			    }

		        // 键盘弹起事件  
			    var keyup = function(event ,tis)  
			    {  
			        // 当前值
			        var value = $(tis).val();

			        var code = event.keyCode;

			        var id = $(tis).attr("id");

			        // 除了数字键、删除键、小数点之外全部不允许输入  
			        if((code < 48 && 8 != code && 37 != code && 39 != code)   
			            || (code > 57 && code < 96)   
			            || (code > 105 && 110 != code && 190 != code))  
			        {
			        	$(tis).val("");
			            return false;
			        }

			        // 后移
			        if (code == 39)
			        {
			        	if (id == "ti_hour")
			        	{
			        		el_minute_inp.focus();
			                el_minute_inp.select();
			                return false;
			        	}
			        	if (id == "ti_minute")
			        	{
			        		el_second_inp.focus();
			                el_second_inp.select();
			                return false;
			        	}
			        }

			        // 前移
			        if (code == 37)
			        {
			        	if (id == "ti_minute")
			        	{
			        		el_hour_inp.focus();
			                el_hour_inp.select();
			                return false;
			        	}
			        	if (id == "ti_second")
			        	{
			        		el_minute_inp.focus();
			                el_minute_inp.select();
			                return false;
			        	}			        	
			        }

			        if(!isEmpty(value))  
			        {  
			            value = parseInt(value);

			            // 当前输入框的ID  
			            var id = $(tis).attr("id"); 
			            
			            if ( 
			            	  (id == "ti_hour" && value >23)
			            		|| (id == "ti_minute" && value >59)
			            	  		|| (id == "ti_second" && value >59)
			               )  
			            {  
			                $(tis).val(options.currValue);  
			            }
			            else if ($(tis).val().length == 2)
			            {
			                // 如果是第一个框则第二个框获的焦点  
			                if("ti_hour" == id && !isEmpty(value))
			                {  
			                    el_minute_inp.focus();
			                    el_minute_inp.select();
			                }  
			                // 如果是第二个框则第三个框获的焦点  
			                else if("ti_minute" == id && !isEmpty(value))  
			                {  
			                    el_second_inp.focus();
			                    el_second_inp.select();
			                    el.find("[class=err-div]").remove();
			                }  
			            }  
			        }  
			    }
			},
			setData : function (el ,data)
			{
				var el_hour_inp = el.find("[id=ti_hour]");
		        var el_minute_inp = el.find("[id=ti_minute]");
		        var el_second_inp = el.find("[id=ti_second]");

		        if (!data)
				{
					el_hour_inp.val("");
		        	el_minute_inp.val("");
		        	el_second_inp.val("");
		        	return false;
				}

		        var array = data.split(":");
		        el_hour_inp.val(array[0]);
		        el_minute_inp.val(array[1]);
		        el_second_inp.val(array[2]);
			},
			setDisabled : function (el)
			{
				el.find("input").val("");
				el.find("input[type=hidden]").attr("disabled" ,"disabled");
				el.children().addClass("disabled");
				el.children().removeClass("form-invalid");
				el.find("[class=err-div]").remove();
				el.find("[class=mask]").show();
			},
			cancelDisabled : function (el){
				el.children().removeClass("disabled");
				el.children().removeClass("form-invalid");
				el.find("input[type=hidden]").removeAttr("disabled");
				el.find("[class=err-div]").remove();
				el.find("[class=mask]").hide();
			}
	}
});