/** 
	插件名称  :  validate
	插件功能  :  表单验证器
*/

define(function (){

	// var tip = $('<div class="tooltip top animated"style="top: -30px; left: 20px;position: absolute;">'
	// 	  		+ '<div class="tooltip-inner" data-id="tooltip-inner"></div>'
	// 	  		+ '<div class="tooltip-arrow"></div>'
	// 			+ '</div>');

	var tip = $('<div class="err-div" title="" data-placement="left"><span class="bg-icon-span bg-icon-info" style="width:17px;height:23px"></span></i></div>');

	return {
		init:function (el){

			// Get IE version
	        var ieVersion = (function() {
	            var v = 3, div = document.createElement('div'), a = div.all || [];
	            while (div.innerHTML = '<!--[if gt IE '+(++v)+']><br><![endif]-->', a[0]) {}
	            return v > 4 ? v : !v;
	        }());

			var changeEvent = 
					(ieVersion === 9 || !('oninput' in el)) ? 'keyup' : 'input';
			
			var validate;
			var error_msg;

			el.find("[validate]").each(function (){
				if (
					  ($(this).attr("type") == "text" || $(this).attr("type") == "password") 
					  && !($(this).hasClass("no-event"))
					  && $(this).attr("data-type") !="date"
					)
				{
					$(this).blur(function (){
						$("[class*=tooltip]").remove();
						validate = $(this).attr("validate");
						validator(validate ,$(this));
					});
				}
			});
		},

		clear:function (elArray){
			if (elArray instanceof Array) 
			{
				for (var i=0;i<elArray.length;i++)
				{
					elArray[i].removeClass("form-invalid");
					elArray[i].parent().find("[class*=err-div]").remove();
					elArray[i].parent().find("[class*=form-invalid]").removeClass("form-invalid");
				}
			} 
			else 
			{
				elArray.find("input").removeClass("form-invalid");
				elArray.find("select").removeClass("form-invalid");
				elArray.parent().find("[class*=err-div]").remove();
				elArray.parent().find("[class*=form-invalid]").removeClass("form-invalid");
			}

		},

		reset:function (el){
			el.find("[class*=form-invalid]").removeClass("form-invalid");
			el.find("[class*=err-div]").remove();
		},

		initEvent:function (el){
			el.blur(function (){
				validate = $(this).attr("validate");
				validator(validate ,$(this));
			});
		},

		setError:function (el ,msg){
			setError(el ,msg);
		},

		// 内部方法
		validate:function (el){
			var flag = true;
			el.find("[validate]").each(function (){
				validate = $(this).attr("validate");
				if (flag)
				{
					flag = validator(validate ,$(this));
				}
				else
				{
					validator(validate ,$(this));
				}
				
			});
			return flag;
		},

		// ip校验，代码段不允许重复
		ipIsRepeat : function (startIp ,endIp, ipArray){
			var ip_startNum = ip2int(startIp);
			var ip_endNum = ip2int(endIp);
			var startIpNum;
			var endIpNum;
			var flag = true;
			for (var i = 0; i < ipArray.length; i++) {
				startIpNum = ipArray[i].startIp;
				endIpNum = ipArray[i].endIp;
				if (flag)
				{
					if (ip_startNum > startIpNum && ip_startNum < endIpNum)
					{
						flag = false;
					}
					if (ip_endNum > startIpNum && ip_endNum < endIpNum)
					{
						flag = false;
					}
				}
			}
			return flag;
		},

		// ip校验   1.起始不能大于结束     2.需要再同一个网段
		ipValidate : function (startIpEl ,endIpEl, ipArray, noSameArea){
			var error_msg = "";
			var flag =  true;
			var startIp = startIpEl.val();
			var endIp = endIpEl.val();
			var startIPArray = startIp.split(".");
			var endIPArray = endIp.split(".");
			if (startIPArray.length == 4 && endIPArray.length == 4)
			{

				if (!noSameArea &&(startIPArray[0] != endIPArray[0] || startIPArray[1] != endIPArray[1]) )
				{
					error_msg = "起始IP、结束IP必须同一网段";
				} 
				else
				{
					if (ip2int(startIp) > ip2int(endIp))
					{
						error_msg = "起始IP不能大于结束IP";
					}
				}
			}
			if (error_msg != "")
			{
				flag = false;
				setError(endIpEl ,error_msg)
			}
			return flag;
		},

		// ip校验   1.起始不能大于结束    
		ipValValidate : function (startIpEl ,endIpEl, ipArray){
			var error_msg = "";
			var flag =  true;
			var startIp = startIpEl.val();
			var endIp = endIpEl.val();
			var startIPArray = startIp.split(".");
			var endIPArray = endIp.split(".");
			if (startIPArray.length == 4 && endIPArray.length == 4)
			{
				if (ip2int(startIp) > ip2int(endIp))
				{
					error_msg = "起始IP不能大于结束IP";
				}
			}
			if (error_msg != "")
			{
				flag = false;
				setError(endIpEl ,error_msg)
			}
			return flag;
		},

		// ipv4校验   1.起始和结束必填 
		ipv4Validate : function (startIpEl ,endIpEl, ipArray){
			var error_msg = "";
			var error_el;
			var flag =  true;
			var startIp = startIpEl.val();
			var endIp = endIpEl.val();
			if ((startIp == "" && endIp != "") || (startIp != "" && endIp == ""))
			{
				if (startIp == "") 
				{
					error_msg = "起始IP不能为空";
					error_el = startIpEl;
				}
				else
				{
					error_msg = "结束IP不能为空";
					error_el = endIpEl;
				}
			}
			if (error_msg != "")
			{
				flag = false;
				setError(error_el ,error_msg)
			}
			return flag;
		},

		// ip校验
		ipIsNotBetween : function (ipEl ,startIpEl ,endIpEl ,errorMsg){
			var error_msg = "";
			var flag =  true;
			var ip = ipEl.val();
			var startIp = startIpEl.val();
			var endIp = endIpEl.val();
			if (ip >= startIp && ip <= endIp)
			{
				error_msg = errorMsg;
			}
			if (error_msg != "")
			{
				flag = false;
				setError(ipEl ,error_msg)
			}
			return flag;
		},

		//文件后缀校验
		fileSuffixLimit : function(str ,suffix ,allow ,allowNull){
			var error_msg = "";
			var tis = str.split(",");
			var suffixes = suffix.replace(/\,/g , "|");
			var flag = true;
			var suffixValidate = allow ? new RegExp('^.+\.('+suffixes+')$') : new RegExp('^.+(?!\.('+suffixes+'))$');
			for (var i = 0; i < tis.length; i++) 
			{
				if (tis[i] == "") 
				{
					if (allowNull != true) {
						error_msg = "请选择要上传的文件。";
						flag = false;
					}
				} 
				else if(!suffixValidate.test(tis[i])) 
				{
					error_msg = allow ? "只允许上传后缀名为"+suffix+"的文件！" : "不允许上传后缀名为"+suffix+"的文件！";
					flag = false;
				}
			}
			return {flag:flag,msg:error_msg};
		}
	};


	function validator(validate ,tis){
		var error_msg = "";
		// 如果是disabled ，直接退出
		if (tis.attr("disabled"))
		{
			tis.removeClass("form-invalid");
			tis.parent().find("[class*=err-div]").remove();
			return true;
		}

		// 验证是否为空
		if (validate.indexOf("required") >=0)
		{
			if ($.trim(tis.val()) == "" || (tis.is("select") && tis.val() == "-1"))
			{
				error_msg = "不能为空";
				flag = false;
			}
		}

		// 验证ip地址合法性
		if (validate.indexOf("IP") >=0) 
		{
			var ipValidate = /^((([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}))$/
			if(tis.val() != "" && !ipValidate.test(tis.val()))
			{  
				error_msg = "ip格式不正确";
				flag = false;
			} 
		}
        //判断相等(规则:equalTo:data-id)
        if (validate.indexOf('equalTo') >= 0) {
            var sameReg=/^equalTo:\S+/;
            if(tis.val() !="" && !sameReg.test(tis.val()))
            {
            	var  value = tis.val().trim();
	        	var  item = validate.split(":")[1];
	        	var  itemValue = $("[data-id="+item+"]").val().trim();
	        	if(value != itemValue)
	        	{
	        		error_msg = "两次输入结果不一致";
					flag = false;
	        	}
            }
        }

        // 判断大于
        if (validate.indexOf('greaterThan') >= 0)
        {
        	var __Reg=/^greaterThan:\S+/;
        	if(tis.val() !="" && !__Reg.test(tis.val()))
            {
            	var value = tis.val().trim();
	        	var item = validate.split(":")[1];
	        	var itemValue = $("[data-id="+item+"]").val().trim();
	        	if(value <= itemValue)
	        	{
	        		error_msg = tis.attr("data-title") + "必须大于" + $("[data-id="+item+"]").attr("data-title")
					flag = false;
	        	}
            }
        }

        // 判断小于
        if (validate.indexOf('smallerThan') >= 0)
        {
        	var __Reg=/^smallerThan:\S+/;
        	if(tis.val() !="" && !__Reg.test(tis.val()))
            {
            	var value = tis.val().trim();
	        	var item = validate.split(":")[1];
	        	var itemValue = $("[data-id="+item+"]").val().trim();
	        	if(value && itemValue && parseFloat(value) >= parseFloat(itemValue))
	        	{
	        		error_msg = tis.attr("data-title") + "必须小于" + $("[data-id="+item+"]").attr("data-title")
					flag = false;
	        	}
            }
        }

		// 验证ipv4地址合法性
		if (validate.indexOf("ipv4") >=0)
		{
			var ipValidate =  /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;  
	           
     		if(tis.val() != "" && !ipValidate.test(tis.val()))
			{  
				error_msg = "ipv4格式不正确。";
				flag = false;
			} 
		}
        // 验证ipv地址All合法性
		if (validate.indexOf("ipAll") >=0)
		{
			var  ipAll=/(^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$)|(^(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))\s?-\s?(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))$)/;  		
                   
     		if(tis.val() != "" && !ipAll.test(tis.val()))
			{  
				error_msg = "ipv4格式不正确。";
				flag = false;
			} 
		}
		// 验证ipv6地址合法性
		if (validate.indexOf("ipv6") >=0)
		{
			// var ipValidate =  /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;  
			// if(tis.val() != "" && !ipValidate.test(tis.val()))
			// {  
			// 	error_msg = "ipv6格式不正确。";
			// 	flag = false;
			// } 

			var val = tis.val()

		    if (tis.val() != "" && val.indexOf("::") == -1)
		    {   //全称匹配
		       var exp = /^(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/i;
		       if (val.match(exp)) {
		  	   }else {
		  	  	error_msg = "ipv6格式不正确。";
				flag = false;
		  	   }
		    }
		   
		   if (val.indexOf("::") != -1 && val.split(":").length < 9)
		   { 
		        //简写匹配
		        var exp = /^(?::|(?:[a-f0-9]{1,4}:)+):(?:(?:[a-f0-9]{1,4}:)*[a-f0-9]{1,4})?$/i;
		        if (val.match(exp)) {
		  	    } else {
		  	  	  error_msg = "ipv6格式不正确。";
				  flag = false;
		  	    }
		    }
		}

		// 验证mac地址合法性
		if (validate.indexOf("mac") >=0)
		{
			var macValidate = /[A-F\d]{2}[:-][A-F\d]{2}[:-][A-F\d]{2}[:-][A-F\d]{2}[:-][A-F\d]{2}[:-][A-F\d]{2}$/;
			var macValidate1 = /[A-F\d]{4}[:-][A-F\d]{4}[:-][A-F\d]{4}$/;
			if(tis.val() != "" && !macValidate.test(tis.val()) && !macValidate1.test(tis.val())) 
			{  
				error_msg = "mac地址格式不正确。";
				flag = false;
			} 
		}

		// 验证整数合法性
		if (validate.indexOf("number") >=0)
		{
			var numberValiate = /^[0-9]*$/;
			if(tis.val() != "" && !numberValiate.test(tis.val()))
			{  
				error_msg = "必须为非负整数。";
				flag = false;
			} 
		}

		if (validate.indexOf("biggerThan") >=0) 
		{
			var validateList = validate.split(",");
			var num;
			for (var i = 0; i < validateList.length; i++) {
				if(validateList[i].indexOf("biggerThan")>=0){
					num = validateList[i].substring(10,validateList[i].length);
				}
			}
			if (tis.val() != "" && tis.val() <= num) 
			{
				error_msg = "必须为大于"+num+"的整数";
				flag = false;
			}
		}

		if (validate.indexOf("min") >=0) 
		{
			var validateList = validate.split(",");
			var num;
			for (var i = 0; i < validateList.length; i++) {
				if(validateList[i].indexOf("min")>=0){
					num = validateList[i].substring(3,validateList[i].length);
				}
			}
			if (tis.val() != "" && tis.val() < num) 
			{
				error_msg = "必须为不小于"+num+"的整数";
				flag = false;
			}
		}

		// 验证必须为XXX的倍数
		if(validate.indexOf("number_9600") >=0)
		{
			if((tis.val() != "") && (parseInt(tis.val())%9600!=0))
			{
				error_msg = "必须为9600的倍数。";
				flag = false;
			}
		}

		// 验证邮箱合法性
		if (validate.indexOf("email") >=0)
		{  
			var emailValiate = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			if(tis.val() != "" && !emailValiate.test(tis.val()))
			{  
				error_msg = "Email格式不正确。";
				flag = false;
			} 
		}

		// 验证座机合法性
		if (validate.indexOf("tel") >=0)
		{  
			// var telValiate = /^(\d{3,4}-)?\d{7,8}$/;
			var telValiate = /^[0-9\(\)\-]{1,20}$/;
			if(tis.val() != "" && !telValiate.test(tis.val()))
			{  
				error_msg = "电话格式不正确。";
				flag = false;
			} 
		}

		// 验证手机合法性
		if (validate.indexOf("phone") >=0)
		{  
			var phoneValiate = /^((00|\+)?86-)?1\d{10}$/;
			if(tis.val() != "" && !phoneValiate.test(tis.val()))
			{  
				error_msg = "手机号码格式不正确。";
				flag = false;
			} 
		}

		//验证电话号码合法性（包含固话、手机、区号和分机号）
		if (validate.indexOf("TelePhone") >=0) 
		{
			var telephoneValidate = /^((((00|\+)?86-)?1\d{10})|[0-9\(\)\-]{1,20})$/;
			if (tis.val() != "" && !telephoneValidate.test(tis.val()))
			{
				error_msg = "电话号码格式不正确。";
				flag = false;
			}
		}

		//验证传真号码合法性
		if (validate.indexOf("fax") >=0) 
		{
			var faxValidate = /^(\d{3,4}-)?\d{7,8}$/;
			if (tis.val() != "" && !faxValidate.test(tis.val())) 
			{
				error_msg = "传真格式为:XXX-12345678或XXXX-1234567或XXXX-12345678";
				flag = false;
			}
		}

		// 验证时间是否正确
		if (validate.indexOf('time') >=0)
		{
			var timeValiate = /^(([0-1]\d)|(2[0-4])):[0-5]\d$/;
			if(tis.val() != "" && !timeValiate.test(tis.val()))
			{  
				error_msg = "格式为hh:mm";
				flag = false;
			} 
		}

		// 验证时分秒是否正确
		if (validate.indexOf('Hms') >=0)
		{			
			var timeValiate = /^(([0-1]\d)|(2[0-3])):[0-5]\d:[0-5]\d$/;
			if(tis.val() != "" && !timeValiate.test(tis.val()))
			{  
				error_msg = "格式为HH:mm:ss";
				flag = false;
			} 
		}

		//时间比较，当前值大于传入元素值则返回true
		if (validate.indexOf('dateCompareWith') >=0) 
		{
			var dataId;
			for (var i = 0; i < validate.split(",").length; i++) {
				if(validate.split(",")[i].indexOf("dateCompareWith") != "-1") 
				 	dataId = validate.split(",")[i].substring(15,validate.split(",")[i].length);
			}
			if ($("[data-id="+dataId+"]").val())
				tis.val() == "" || !g_moment($("[data-id="+dataId+"]").val()).isBefore(tis.val()) && (error_msg = "当前时间需大于起始时间。",flag = false);
		}

		// 验证端口是否正确
		if (validate.indexOf('port') >=0)
		{
			var numberValiate = /^[0-9]*$/;
			if (-1==tis.val().indexOf(";")) 
			{
				if(tis.val() != "" && !numberValiate.test(tis.val()))
				{  
					error_msg = "必须为整数，且多个端口用英文分号(;)分隔。";
					flag = false;
				}
				else
				{
					if (tis.val() > 65535 || tis.val() <0)
					{
						error_msg = "区间为0-65535。";
						flag = false;
					}
				}
			} 
			else 
			{
				var arr = tis.val().split(";");
				for (var i = 0; i < arr.length; i++) {
					if(arr[i] != "" && !numberValiate.test(arr[i]))
					{  
						error_msg = "必须为整数";
						flag = false;
					}
					else
					{
						if (arr[i] > 65535 || arr[i] <0)
						{
							error_msg = "区间为0-65535。";
							flag = false;
						}
					}
				}
			}
			
		}

		//验证URL合法性
		if (validate.indexOf('url') >=0) 
		{
			// var urlValidate = /(((^https?:(?:\/\/))?(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:(www)?.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
			var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
		  		+ "+(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
		        + "("
			        + "([0-9]{1,3}.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
			        + "|" // 允许IP和DOMAIN（域名）
			        + "([0-9a-zA-Z_!~*'()-]+.)+" // 域名- www.
			        + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-z]." // 二级域名
			        + "[a-zA-Z]{2,6}" // first level domain- .com or .museum
		        + ")" 
		        + "(:[0-9]{1,5})?" // 端口- :80
		        + "("
			        + "(/*)|" // a slash isn't required if there is no file name
			        + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/*"
		        + ")"
		        + "$";
		  var urlValidate = new RegExp(strRegex);
			if (tis.val() != "" && !urlValidate.test(tis.val())) 
			{
				error_msg = "url格式不正确,如：http://www.xxx.com/";
				flag = false;
			} 
			if (tis.val() != "" && urlValidate.test(tis.val())) 
			{
				var valArr = tis.val().split("://");
				var tmpVal = valArr[1];
				var mhp = tmpVal.indexOf(":");
				if(mhp!=-1){
					var xxp = tmpVal.indexOf("/");
					var port = parseInt(tmpVal.substring(mhp + 1,xxp));
					if(port < 1 || port > 65535){
						error_msg = "url格式不正确,如：http://www.xxx.com/";
						flag = false;
					}
				}
			}
		}
		//验证邮件服务器合法性
		if (validate.indexOf('emSever') >=0) 
		{
			// var urlValidate = /(((^https?:(?:\/\/))?(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:(www)?.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
			var strRegex = "^(https?://)?" 
		        + "("
			        + "([0-9]{1,3}.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
			        + "|" // 允许IP和DOMAIN（域名）
			        + "([0-9a-zA-Z_!~*'()-]+.)+" // 域名- www.
			        + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-z]." // 二级域名
			        + "[a-zA-Z]{2,6}" // first level domain- .com or .museum
		        + ")" 
		        + "("
			        + "(/*)|" // a slash isn't required if there is no file name
			        + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/*"
		        + ")"
		        + "$";
		  var urlValidate = new RegExp(strRegex);
			if (tis.val() != "" && !urlValidate.test(tis.val())) 
			{
				error_msg = "请填入正确的域名或IP。";
				flag = false;
			}
		}

		//整数范围,包含首尾值,如between1~9
		if (validate.indexOf('between') >=0) 
		{
			var validateList = validate.split(",");
			var arg,start,end;
			for (var i = 0; i < validateList.length; i++) {
				if (validateList[i].indexOf('between') >=0) 
				{
					arg = validateList[i].substring(7,validateList[i].length).split("~");
					start = arg[0];
					end = arg[1];
				}
			}
			var numberValiate = /^\-?[0-9]*$/;
			if (tis.val()=="") {
				//使between与required松耦合
			}else if(tis.val() != "" && !numberValiate.test(tis.val()))
			{  
				error_msg = "必须为整数。";
				flag = false;
			} 
			else 
			{
				if (tis.val()<Number(start) || tis.val()>Number(end)) 
				{
					error_msg = "区间为"+start+"~"+end;
					flag = false;
				}
			}
		}

		//验证任意类型长度
		if(validate.indexOf('lengthSection')>=0){
			var validateList = validate.split(",");
			var arg,lowerNum,upperNum;
			for (var i = 0; i < validateList.length; i++) {
				if (validateList[i].indexOf('lengthSection')==0) {
					arg = validateList[i].substring(13,validateList[i].length).split("-");
					lowerNum = arg[0];
					upperNum = arg[1];
				}
			}
			var numberValiate = /^[0-9]*$/;
			if(numberValiate.test(lowerNum)&&numberValiate.test(upperNum)&&Number(upperNum)>=Number(lowerNum)){
				if (tis.val().length>=lowerNum&&tis.val().length<=upperNum) {
					//符合验证标准
				}else {
					if (upperNum==lowerNum) {
						error_msg = "长度应为" + lowerNum;
						flag = false;
					}else if(lowerNum==0||tis.val().length>upperNum){
						error_msg = "最大长度为" + upperNum;
						flag = false;
					}else if(tis.val().length < lowerNum){
						error_msg = "最小长度为" + lowerNum;
						flag = false;
					}else {
						error_msg = "长度应为"+ lowerNum + "-" +upperNum;
						flag = false;
					}
				}
			}
		}

		//浮点数限定，带精确度 eg. float2 精确度为2的浮点数
		if (validate.indexOf('float') >=0) 
		{
			validateList = validate.split(",");
			for (var j = 0; j < validateList.length; j++) {
				if (validateList[j].indexOf('float') >=0) 
				{
					arg = validateList[j].substring(5,validateList[j].length);
				}
			}
			var accuracy = "";
			for (var m = 1; m <= arg; m++) {
				accuracy += "\\d{"+m+"}"+"|";
			}
			accuracy = "("+accuracy.substring(0,accuracy.length-1)+")";
			var floatValidate = new RegExp("^([1-9]\\d*|0)(\\."+accuracy+")?$");
			if(tis.val() != "" && !floatValidate.test(tis.val())) 
			{
				error_msg = "小数点后最多"+arg+"位.";
				flag = false;
			}
		}

		//限定字符
		if (validate.indexOf('stringLimit') >=0) 
		{
			validateList = validate.split(",");
			for (var i = 0; i < validateList.length; i++) {
				if (validateList[i].indexOf('stringLimit') >=0) 
				{
					arg = validateList[i].substring(11,validateList[i].length);
				}
			}
			var strValidate,msg;
			switch (arg) 
			{
				case "": // stringLimit
					strValidate = /^([a-zA-Z]|[\u4e00-\u9fa5]|[0-9])+((\w|[-])*([a-zA-Z]|[\u4e00-\u9fa5]|[0-9])+)*$/;
					msg = '只允许输入汉字、字母、数字、"_"、"-"符号，且"_"和"-"只能位于中间位置。';
					break;
				case "0": // stringLimit0
					strValidate = /^([a-zA-Z]|[\u4e00-\u9fa5]|[0-9])+((\w|[-.]|\s)*([a-zA-Z]|[\u4e00-\u9fa5]|[0-9])+)*$/;
					msg = '只允许输入汉字、字母、数字、空格、"_"、"-"、"."符号，且空格、"_"、"-"和"."只能位于中间位置。';
					break;
				case "1": // stringLimit1
					strValidate = /^([a-zA-Z]|[0-9])+((\w|[-.])*([a-zA-Z]|[0-9])+)*$/;
					msg = '只允许输入字母、数字、"_"、"-"、"."符号，且"_"、"-"和"."只能位于中间位置。';
					break;
				case "2": // stringLimit2
					strValidate = /^([a-zA-Z0-9\_\-\@\.])+$/;
					msg = '只允许输入字母、数字和"_""-""@""."符号。';
					break;
				case "3": // stringLimit3
					strValidate = /^([a-zA-Z]|[\u4e00-\u9fa5])+(([a-zA-Z]|[_]|[\u4e00-\u9fa5])*([a-zA-Z]|[\u4e00-\u9fa5])+)*$/;
					msg = '只允许输入英文字符，中文字符及下划线，且下划线只能位于中间位置。';
					break;
			}
			if (tis.val() != "" && !strValidate.test(tis.val())) 
			{
				error_msg = msg;
				flag = false;
			}
		}

		//匹配有理数
		if (validate.indexOf('rationalNumber') >=0) 
		{
			var rationalValidate = /^\-?[0-9]+(\.[0-9]*)?$/;
			if (tis.val() != "" && !rationalValidate.test(tis.val())) 
			{
				error_msg = "必须为数字。";
				flag = false;
			}
		}

		//限制整数部分与小数部分位数
		if (validate.indexOf('FloatBit') >=0) 
		{
			validateList = validate.split(",");
			for (var j = 0; j < validateList.length; j++) {
				if (validateList[j].indexOf('FloatBit') >=0) 
				{
					limitArg = validateList[j].substring(8,validateList[j].length).split(".");
				}
			}
			//var limitArg = validate.substring(8,validate.length).split(".");
			var integer = limitArg[0];
			var decimal = limitArg[1];
			var floatBitValidate = new RegExp('^[0-9]{1,'+integer+'}(\\.[0-9]{1,'+decimal+'})?$');
			if(tis.val() != "" && !floatBitValidate.test(tis.val())) 
			{
				error_msg = "该输入项数字的整数部分最多只能为"+integer+"位,小数部分最多只能为"+decimal+"位。";
				//error_msg= "格式不正确"
				flag = false;
			}
		}

		//匹配一非负正向区间
		if (validate.indexOf('range') >=0) 
		{
			var str1 = $.trim(tis.val().split("-")[0]);
			var str2 = $.trim(tis.val().split("-")[1]);
			var rangeValidate = /^\d+(\.\d+)?-\d+(\.\d+)?$/;
			if (tis.val() != "" && !rangeValidate.test(tis.val())) 
			{
				error_msg = "格式为‘非负数1-非负数2’。";
				flag = false;
			} 
			else if (str1>str2) 
			{
				error_msg = "第二个数不能小于第一个数。";
				flag = false;
			}
		}

		//全路径校验
		if (validate.indexOf('path') >= 0) 
		{
			// var winPath = /^[a-zA-Z]:[\\/]((?! )(?![^\\/]*\s+[\\/])([\w -]|[\u4e00-\u9fa5])+[\\/])*(?! )(?![^.]+\s+\.)([\w -]|[\u4e00-\u9fa5])+$/;
			// var lnxPath = /^([\/][\w-]+)*$/;
			var winPath = new RegExp("^[a-zA-Z]+:\\\\");
			var lnxPath =  new RegExp("^/+([0-9a-zA-Z_]*/?)*"); 
			if (tis.val() != "" && !winPath.test(tis.val()) && !lnxPath.test(tis.val())) 
			{
				var ind = validate.indexOf('path');
				error_msg = "pathL" === validate.substr(ind,5) ? '路径格式不正确。如："/user"':'路径格式不正确。如："C:\\windows\\system32"';
				flag = false;
			}
		}

		//校验密码合法性
		if (validate.indexOf('password') >=0) 
		{
			if (tis.val() == "") 
			{
				error_msg = "不能为空";
				flag = false;
			}
			// else if (tis.val().length < 10) 
			// {
			// 	error_msg = "密码长度至少10位。";
			// 	flag = false;
			// } 
			else if (true) {
				var ls = 0;
		 		if(tis.val().match(/([a-z])+/) || tis.val().match(/([A-Z])+/)){
		     		ls++;
		  		}
		 		if(tis.val().match(/([0-9])+/)){
					ls++;  
		 		}
		  		if(tis.val().match(/[_.@]+/)){
					ls++;
		    	}
		    	if(ls < 2){
					error_msg = "密码必须为数字、字母、和特殊符号任意2种组合。";
					flag = false;
		    	}
		    	if(!/^[0-9a-zA-Z_.@]*$/.test(tis.val())) 
				{
					error_msg = '只允许输入数字，字母，"_"，"."或"@"。';
					flag = false;
				}
			}
			// if (tis.val().length < 6) 
			// {
			// 	error_msg = "密码长度至少6位。";
			// 	flag = false;
			// } 
			// else 
			// {
			// 	if(!/^[0-9a-zA-Z_.@]*$/.test(tis.val())) 
			// 	{
			// 		error_msg = '只允许输入数字，字母，"_"，"."或"@"。';
			// 		flag = false;
			// 	}
			// }
		}

		if(validate.indexOf('oldDate')>=0){
			var value = tis.val().trim();
			if(value.length==10){
				value += ' 00:00:00';
			}else if(value.length==7){
				value += '-01 00:00:00';
			}
			var currentdate = new Date();
			var valuedate = new Date(value);

			if(currentdate.getTime()<valuedate.getTime()){
				error_msg = "该日期不能大于当前日期";
				flag = false;
			}
		}

		setError(tis ,error_msg);

		return (error_msg == ""?true:false);
	}

	function setError(tis ,error_msg)
	{
		var tmp = tip.clone();
		//tmp.css("opacity" ,0);
		tis.parent().find("[class*=err-div]").remove();

		if (tis.is(":hidden"))
		{
			tis.parent().removeClass("form-invalid");
		}

		var inp_width;
		var el_width;
		var diff_width;
		if (error_msg != "")
		{
			if ($(tis).is("select"))
			{
				tmp.css("right" ,"30px");
				tis.parent().find("[class*=select2-selection]").addClass("form-invalid");
			}
			else if (tis.is(":hidden")){
				tis.parent().addClass("form-invalid");
			}
			else
			{
				inp_width = parseInt(tis.css("width"));
				el_width = parseInt(tis.parent().css("width"));
				diff_width = el_width - inp_width - parseInt(tis.parent().css("padding-left"));
				tmp.css("right" ,(diff_width + 15) + "px");
				tis.addClass("form-invalid");
			}
			tis.after(tmp);
			tmp.attr("title" ,error_msg);
			tmp.tooltip();
			
		}
		else
		{
			if ($(tis).is("select"))
			{
				tis.parent().find("[class*=select2-selection]").removeClass("form-invalid");
			}
			else
			{
				tis.removeClass("form-invalid");
			}
			tmp.remove();
		}
	}

	function ip2int(ip)
	{
	    var num = 0;
	    ip = ip.split(".");
	    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
	    num = num >>> 0;
	    return num;
	}

	function int2iP(num)
	{
	    var str;
	    var tt = new Array();
	    tt[0] = (num >>> 24) >>> 0;
	    tt[1] = ((num << 8) >>> 24) >>> 0;
	    tt[2] = (num << 16) >>> 24;
	    tt[3] = (num << 24) >>> 24;
	    str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
	    return str;
	}


});