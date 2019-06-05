var g_grid;
var g_mask;
var g_dialog;
var g_validate;
var g_moment;
var g_monitor;
var g_formel;
var g_topo;

var index_delete_confirm_msg = "确认删除此记录么？";

var index_batch_delete_confirm_msg = "确认删除选中记录么？";

var index_select_one_at_least_msg = "请至少选择一条记录";

var index_app_version = ""

var index_slimScroll_event_map = new HashMap();

var index_user_info = new Object()

var index_system_title

var index_is_encrypt
var index_encrypt_key

//判断IE9 返回布尔值
var index_is_IE9 = /^.*MSIE\x20{1}9(?=\.[0-9]+){1}(?=.*Trident\/[5-9].0).*$/.test(navigator.userAgent);

//function isIE11(){ if((/Trident\/7\./).test(navigator.userAgent))return true; else return false;}

var index_is_IE11 = /Trident\/7\./.test(navigator.userAgent)

// 防止dialog重复点击
var index_dialog_is_lock = false;

// 定时器池
index_interval_1 = null;
index_interval_2 = null;
index_interval_3 = null;
index_interval_4 = null;
index_interval_5 = null;
index_interval_6 = null;

var index_urlParamObj = index_query_param_get();

var index_document_keydown=function(e)
{ //这里给function一个事件参数命名为e，叫event也行，随意的，e就是IE窗口发生的事件。
    var key = e.which; //e.which是按键的值
    if (key == 13) {
        return false;
    }
}

$(document).ready(function (){

	$("#SkinCSS").attr('href','/css/darkblue/app.css');

	if (index_urlParamObj.hideMenu == "1")
		$("[class*=pg-left-menu-outer]").remove();

	// IE9时添加IE9hack.css
	if (index_is_IE9) 
		$("#IE9hackCSS").attr('href','/css/ie9hack.css');

	// 页面布局初始化
	index_initLayout();

	// 窗口大小改变事件
	$(window).resize(function() {
		$(this).stopTime();
		$(this).oneTime(100 ,function (){
			index_initLayout();
		});
	});

	// 插件全局初始化
	require(['/js/plugin/grid/grid.js',
			 '/js/plugin/mask/mask.js',
			 '/js/plugin/dialog/dialog.js',
			 '/js/plugin/menu/menu.js',
			 '/js/plugin/validate/validate.js',
			 '/js/lib/fullcalendar/js/moment.min.js',
			 '/js/plugin/monitor/monitor.js',
			 '/js/plugin/formel/formel.js',
			 '/js/plugin/topo/topo.js',
			 '/js/lib/underscore.js'] ,function (grid ,mask ,dialog ,menu ,validate ,moment ,monitor ,formel ,topo,underscore){

		g_grid = grid;
		g_mask = mask;
		g_dialog = dialog;
		g_validate = validate;
		g_moment = moment;
		g_monitor = monitor;
		g_formel = formel;
		g_topo = topo;

		// 初始化菜单
		menu.render($("#menu") ,{
			url : "data/menu.json"
			//url : "sysconfig/menuconfig/queryUserMenuTree?random="+Math.random()
		});

		$("body").css("opacity" ,"1");
	});
});

function index_initLayout(flag)
{
	var window_height = $(window).height();
	var pg_header = $("[class=pg-header]:visible").height();
	$("#pg-container").height(window_height - pg_header);
	$("#pg-content").height($("#pg-container").height() - index_getPadderMargin($("#pg-content")));
	$("#content_div").height(
								$("#pg-content").height()
											- index_getHeightWithPadderMargin($("#menu-index")) 
											- index_getPadderMargin($("#content_div"))
							);
	$("#table_wrap").height(
						$("#content_div").height()
							- index_getHeightWithPadderMargin($("#table_oper"))
							- index_getHeightWithPadderMargin($("ul[class=pagination]"))
							- index_getHeightWithPadderMargin($("div[class*=search-div]"))
							- 68
					  );
}

function index_getPadderMargin(el){
	if (el.size() == 0)
	{
		return 0;
	}
	else
	{
		return parseInt(el.css("padding-top")) + parseInt(el.css("padding-bottom"))
		     + parseInt(el.css("margin-top")) + parseInt(el.css("margin-bottom"));
	}

}

function index_getHeightWithPadderMargin(el){
	if (el.size() == 0 || el.is(":hidden"))
	{
		return 0;
	}
	else
	{
		return el.height() + parseInt(el.css("padding-top")) + parseInt(el.css("padding-bottom"))
				+ parseInt(el.css("margin-top")) + parseInt(el.css("margin-bottom"));
	}

}

function index_getPadderMarginHeight(el)
{
	if (el.size() == 0 || el.is(":hidden"))
	{
		return 0;
	}
	else
	{
		return parseInt(el.css("padding-top")) + parseInt(el.css("padding-bottom"))
						+ parseInt(el.css("margin-top")) + parseInt(el.css("margin-bottom"));
	}
}

function um_ajax_get(options)
{
	options.type = 'GET';
	um_ajax(options);
}

function um_ajax_post(options)
{
	options.type = 'POST';
	um_ajax(options);
}

function um_ajax(options)
{
	var defaultOpt = {
		type : "GET",
		successCallBack : null,
		failCallBack : null,
		failTip : true,
		isAsync : true,
		isLoad : true,
		paramObj : null,
		maskObj : '#pg-container',
		//maskObj : 'body',
		server : null
	}

	var options = $.extend(defaultOpt, options);
	// 是否使用遮罩
	if (options.isLoad)
	{
		g_dialog.waitingAlert(options.maskObj);
	}

	if (!options.paramObj)
	{
		options.paramObj = new Object();
	}

	// currentPageNum pageSize  默认1 和 1000
	if (!options.paramObj.currentPageNum)
	{
		options.paramObj.currentPageNum = 1;
	}
	if (!options.paramObj.pageSize)
	{
		options.paramObj.pageSize = 1000;
	}

	var web_app = index_web_app;
	options.server && (web_app = options.server);

	$.ajax({
		async: options.isAsync,
		type: options.type,
		url: web_app + options.url,
		dataType: "json",
		timeout : 120000, //超时时间设置，单位毫秒
		data:{param:JsonTools.encode(options.paramObj),date:new Date().getTime()},
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(request) {
                        request.setRequestHeader("token", sessionStorage.soc_token);
                    },
		 headers: {
	         login_token: sessionStorage.soc_token
	    },
		success :function(data)
		{
			if (data.resultCode == 0)
			{
				if (options.successCallBack)
				{
					//options.successCallBack(JsonTools.decode(filterXSS(JsonTools.encode(data.resultObj))));
					options.successCallBack(data.resultObj);
				}
			}
			else
			{
				if (data.resultCode == "502")
				{
					if (index_urlParamObj.userToken){
						um_ajax_post({
							url : "reLogin?token=" + /*$.base64.encode(*/index_urlParamObj.userToken/*)*/,
							paramObj : {},
							successCallBack : function (){
								
							}
						})
					}
					else{
						window.location.href = "/login.html";
					}
				}
				if (data.resultCode == "508")
				{
					window.location.href = "/index.html#/" + data.url;
				}
				if (data.resultCode == "600")
				{
					var url = "/login.html?type=license&msg="+data.resultObj.errorMessage + "&serialNum=" + data.resultObj.serialNum
					url = encodeURI(url)
					url = encodeURI(url)
					window.location.href = url
				}
				if (options.failCallBack)
				{
					options.failCallBack();
				}
				var msg = (data.resultMsg?data.resultMsg:"操作失败");
				if (options.failTip)
				{
					g_dialog.operateAlert(options.maskObj,msg,"error");
				}
			}
			if (options.isLoad)
			{
				g_dialog.waitingAlertHide(options.maskObj);
			}
		},
		error :function(e){
			console.log(e);
			if (e.status == 200 && (e.statusText == "OK" || e.statusText == "parsererror") )
			{
				options.successCallBack(e.responseText);
			}
			if (options.isLoad)
			{
				g_dialog.waitingAlertHide(options.maskObj);
			}
			if(e.statusText == "timeout")
			{
				g_dialog.operateAlert(options.maskObj,"响应超时!","error");
				g_dialog.waitingAlertHide(options.maskObj);
			}
			if(index_urlParamObj.userToken){
				window.location.reload()
			}
			if (e.status == 500)
			{
				g_dialog.operateAlert(null,"服务端错误！","error");
			}
		}
	});
}

function um_ajax_file(form ,opt)
{
	var defaultOpt = {
		successCallBack : null,
		failCallBack : null,
		isLoad : true,
		paramObj : null,
		maskObj : '#pg-container'
	}   
	var opt = $.extend(defaultOpt, opt);

	if (opt.isLoad)
	{
		g_dialog.waitingAlert(opt.maskObj);
	}
	form.ajaxSubmit({
		url : index_web_app + opt.url,
		type : "post",
		dataType : "json",
		data : {param:JsonTools.encode(opt.paramObj)},
		xhrFields: {
			withCredentials: true
		},
		success : function (data){
			if (data.resultCode == 0)
			{
				if (opt.successCallBack)
				{
					opt.successCallBack(data.resultObj);
				}
			}
			else
			{
				if (opt.failCallBack)
				{
					opt.failCallBack();
				}
				g_dialog.operateAlert(opt.maskObj,data.resultMsg ,"error");
			}
			if (opt.isLoad)
			{
				g_dialog.waitingAlertHide(opt.maskObj);
			}
		},
		error : function (){
			if (opt.isLoad)
			{
				g_dialog.waitingAlertHide(opt.maskObj);
			}
			
		}
	});
}

function um_ajax_html(opt)
{
	$.ajax({
		type: "GET",
		url: opt.url,
		success :function(data)
		{
			if (opt.selector)
				opt.successCallBack($(data).find(opt.selector))
			else
				opt.successCallBack($(data))
		}
	});
}

function index_query_param_get()
{ 
	var url = window.location.hash.substr(1);
	var tmp = url.indexOf("?");
	url = url.substr(tmp);
	var theRequest = new Object(); 
	var tmpVal;
	if (url.indexOf("?") != -1)
	{ 
		var str = url.substr(1); 
		strs = str.split("&"); 
		for(var i = 0; i < strs.length; i ++)
		{
			tmpVal = unescape(strs[i].split("=")[1]);
			if (tmpVal == "undefined" || !tmpVal)
			{
				tmpVal = "";
			}
			theRequest[strs[i].split("=")[0]]=filterXSS(tmpVal);
		}
	}
	if ($("[data-id=monitorId]").val() != "" && $("[data-id=monitorId]").val() != undefined)
	{
		theRequest.monitorId = $("[data-id=monitorId]").val();
	}

	if ($("[data-id=param-assetId]").val() != "" && $("[data-id=param-assetId]").val() != undefined)
	{
		theRequest.assetId = $("[data-id=param-assetId]").val();
	}

	if ($("[data-id=param-monitorTypeId]").val() != "" && $("[data-id=param-monitorTypeId]").val() != undefined)
	{
		theRequest.monitorTypeId = $("[data-id=param-monitorTypeId]").val();
	}
	return theRequest;
}

function index_init(search_remove_cb)
{
	index_form_init($(".ant-body"))
	// 高级搜索点击事件
	// 默认高度为两行的高度，如需更改，需要在页面自己定义
	var __advanced_expand_height = "140px"
	if ($("#index_advanced_expand_height_inp").size() == 1)
		__advanced_expand_height = $("#index_advanced_expand_height_inp").val()
	$("#advanced_expand_btn").click(function (){
		if ($("#vague_div").css("opacity") == "1"){
			$("#vague_div").css("opacity" ,0)
			$("#advanced_expand_div").css({"overflow" : "visible" ,"height" : __advanced_expand_height})
			$(this).find("i").attr("class" ,"icon-chevron-up")
		}
		else
		{
			$("#vague_div").css("opacity" ,1)
			$("#advanced_expand_div").css({"overflow" : "hidden" ,"height" : "0"})
			$(this).find("i").attr("class" ,"icon-chevron-down")
		}

			
	})
	index_initLayout();
}


if (index_urlParamObj.hideResize != 1)
{
	var onWindowResize = function(){
	    //事件队列
	    var queue = [],
	 
	    indexOf = Array.prototype.indexOf || function(){
	        var i = 0, length = this.length;
	        for( ; i < length; i++ ){
	            if(this[i] === arguments[0]){
	                return i;
	            }
	        }
	        return -1;
	    };
	 
	    var isResizing = {}, //标记可视区域尺寸状态， 用于消除 lte ie8 / chrome 中 window.onresize 事件多次执行的 bug
	    lazy = true, //懒执行标记
	 
	    listener = function(e){ //事件监听器
	        var h = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight,
	            w = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth;
	 
	        if( h === isResizing.h && w === isResizing.w){
	            return;
	 
	        }else{
	            e = e || window.event;
	         
	            var i = 0, len = queue.length;
	            for( ; i < len; i++){
	                queue[i].call(this, e);
	            }
	 
	            isResizing.h = h,
	            isResizing.w = w;
	        }
	    }
	 
	    return {
	        add: function(fn){
	            if(typeof fn === 'function'){
	                if(lazy){ //懒执行
	                    if(window.addEventListener){
	                        window.addEventListener('resize', listener, false);
	                    }else{
	                        window.attachEvent('onresize', listener);
	                    }
	 
	                    lazy = false;
	                }
	 
	                queue.push(fn);
	            }else{  }
	 
	            return this;
	        },
	        remove: function(fn){
	            if(typeof fn === 'undefined'){
	                queue = [];
	            }else if(typeof fn === 'function'){
	                var i = indexOf.call(queue, fn);
	 
	                if(i > -1){
	                    queue.splice(i, 1);
	                }
	            }
	            return this;
	        },
	        execute: function (){
	        	for (var i = 0; i < queue.length; i++) {
	        		queue[i]();
	        	}
	        }
	    };
	}.call(this);
}


function index_form_init(el)
{
	el.find("[data-type=select]").each(function (){
    	var sel2 = $(this).select2({
    		width : "100%",
    		minimumResultsForSearch: ($(this).attr("canSearch") != undefined ? 1 : -1)
    	});
    	$(this).parent().append('<div class="select2-container-err"><input class="form-control input-sm" style="opacity:0"/></div>');
    	$(this).change(function (){
    		if ($(this).val() != "")
    		{
    			g_validate.clear([$(this)]);
    		}
    	});
    });

    if (el.find("[data-type=date]").size() > 0)
    {
    	var data_position = "bottom";
    	require(['/js/plugin/timepicker/timepicker.js'] ,function (timepicker){
    		el.find("[data-type=date]").each(function (){
    			if ($(this).parent().find(".input-group-btn").size() > 0)
    				return false
    			var self = this;
    			var excute_mouseout_timeout;
    			var el_remove = $('<div class="pabs" style="right:40px;top:6px;z-index:3002;display:none;line-height:14px;"><i class="rh-icon-delete"></i></div>');
    			$(this).after(el_remove)
    			$(this).mouseover(function (){
    				// 控制不执行mouseout
    				clearTimeout(excute_mouseout_timeout);
    				el_remove.show();
    			}).mouseout(function (){
    				excute_mouseout_timeout = setTimeout(function (){
    					el_remove.hide();
    				} ,500);
    			});
    			el_remove.click(function (){
    				$(self).val("");
    				el_remove.hide();
    				clearTimeout(excute_mouseout_timeout);
    			});
    			$(self).addClass("no-write");
				$(self).attr("readonly" ,"readonly");
				$(self).blur(function(){
					if($(self).val() == "")
					{
						if ($(this).attr("format-type") == "ymd")
							$(self).val(g_moment().format('YYYY-MM-DD'));
						else
							$(self).val(g_moment().format('YYYY-MM-DD HH:mm:ss'));
					}
					else
					{
						return;
					}
				});
    			var tmp_data_position = $(this).attr("data-position");
    			var tmp_type = $(this).attr("format-type");
    			data_position = (tmp_data_position || data_position);
    			timepicker.time($(this) ,{
    				position : data_position,
    				type : tmp_type
    			});
    		});
    	});
    }

    if (index_is_encrypt == 1)
    {
    	if (el.find("[userencrypt]").size() > 0)
	    {
	    	el.find("[userencrypt]").each(function (){
	    		$(this).attr("type" ,"password")
	    		$(this).focus(function (){
	    			$(this).attr("type" ,"text")
	    		}).blur(function (){
	    			$(this).attr("type" ,"password")
	    		})
	    	})
	    }

	    if (el.find("[communityencrypt]").size() > 0)
	    {
	    	el.find("[communityencrypt]").each(function (){
	    		$(this).attr("type" ,"password")
	    		$(this).focus(function (){
	    			$(this).attr("type" ,"text")
	    		}).blur(function (){
	    			$(this).attr("type" ,"password")
	    		})
	    	})
	    }
    }

    if (el.find("[clearable]").size() > 0)
    {
    	el.find("[clearable]").each(function (){
    		g_formel.clearable_input_render($(this))
    	})
    }
}

// 生成一个上传元素
function index_create_upload_el(el ,opt)
{
	var id = el.attr("id");
	var buffer= [];
		buffer.push('<input type="file" id="'+id+'" name="'+id+'" data-classinput="form-control inline v-middle input-s" data-classbutton="btn btn-default" data-icon="false"  id="t1" style="position: absolute; clip: rect(0px, 0px, 0px, 0px);" tabindex="-1">')		
		buffer.push('<div class="bootstrap-filestyle input-group">')            
		buffer.push('<input type="text" disabled="" class="form-control" data-id="up_name">')            
		buffer.push('<span class="group-span-filestyle input-group-btn" tabindex="0">')            
		buffer.push('<label class="btn btn-default " for="'+id+'" style="height:34px;">')            
		buffer.push('<span class="glyphicon glyphicon-folder-open"></span> 选择文件')            
		buffer.push('</label></span></div></div>');
	var new_el = $(buffer.join(""));
	el.after(new_el);
	el.remove();
	new_el.change(function (){
		new_el.find("[data-id=up_name]").val($(this).val());
	});

	if (opt)
	{
		var fileTag = document.getElementById(id);
	    fileTag.onchange = function () {
	        var file = fileTag.files[0];
	        var fileReader = new FileReader();
	        fileReader.onloadend = function (e) {
	        	var data = e.target.result;
	            if (fileReader.readyState == fileReader.DONE) {
	                var image = new Image();
	                image.onload=function(){
	                	var width = image.width;
	                	var height = image.height;
	                	opt.cbf && opt.cbf(width ,height ,data)
	                }
	                image.src= data;
	            }
	        };
	        fileReader.readAsDataURL(file);
	    };
	}
	
}

// 生成一个资产价值select元素
function index_create_asset_value_select_el(el)
{
	el.select2({
				  data: [
				  			{id: "1",text: "使用中"},
				  			{id: "0",text: "闲置"},
				  			{id: "2",text: "待维修"},
				  			{id: "3",text: "维修"},
				  			{id: "4",text: "送修"},
				  			{id: "5",text: "外借"},
				  			{id: "6",text: "分配"},
				  			{id: "7",text: "待报废"},
				  			{id: "8",text: "报废"},
				  			{id: "9",text: "库房"}
				  		],
				  width:"100%"
				});
	}

// 生成一个资产状态select元素
var index_asset_status_list = [
					  			{id: "1",text: "使用中"},
					  			{id: "0",text: "闲置"},
					  			{id: "2",text: "待维修"},
					  			{id: "3",text: "维修"},
					  			{id: "4",text: "送修"},
					  			{id: "5",text: "外借"},
					  			{id: "6",text: "分配"},
					  			{id: "7",text: "待报废"},
					  			{id: "8",text: "报废"},
					  			{id: "9",text: "库房"}
					  		  ];

var index_asset_status_with_all_list = [
										{id: "-1",text: "---"},
							  			{id: "1",text: "使用中"},
							  			{id: "0",text: "闲置"},
							  			{id: "2",text: "待维修"},
							  			{id: "3",text: "维修"},
							  			{id: "4",text: "送修"},
							  			{id: "5",text: "外借"},
							  			{id: "6",text: "分配"},
							  			{id: "7",text: "待报废"},
							  			{id: "8",text: "报废"},
							  			{id: "9",text: "库房"}
							  		]
function index_create_asset_status_select_el(el)
{
	$(el).oneTime(10 ,function (){
		el.select2({
				  data: index_asset_status_list,
				  width:"100%"
				});
	})
	
}

// 生成codeList
// bdCodeList 业务域
// sdCodeList 安全域
// bsCodeList 业务系统
// deviceTypeCodeList 设备类型
// monitorNodeCodeList 监控节点
// assetModelCodeList 资产类型
// snmpCodelist snmp信息
// osCodeList 操作系统
// initFactoryManageList 厂商列表
// computerRoomLocationList 物理位置列表
function index_codeList_get(opt)
{
	um_ajax_get({
		url : "rpc/getCodeList",
		paramObj : {key:opt.codeKey},
		isLoad : false,
		successCallBack : function (data){
			opt.successCallBack(data[opt.codeKey]);
		}
	});
}

function index_render_div(el ,opt)
{
	if (opt.type == "date")
	{
		index_dialog_time_pick(el ,opt);
	}
	if (opt.type == "ip")
	{
		index_dialog_ip_range(el ,opt);
	}
	if (opt.type == "select")
	{
		index_dialog_select(el ,opt);
	}
	if (opt.type == "range")
	{
		index_dialog_range(el ,opt);
	}
}

function index_dialog_time_pick(searchEl ,opt)
{
	var placeholder = opt.placeholder ? opt.placeholder : ""
	searchEl.append('<input type="text" class="form-control input-sm search-data-date no-write" readonly style="padding-right:5px;" placeholder="'+placeholder+'"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="'+opt.startKey+'"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="'+opt.endKey+'"/>');

	var searchInpEl = searchEl.find("input").not("[type=hidden]");
	var el_start_inp = searchEl.find("input").eq(1);
	var el_end_inp = searchEl.find("input").eq(2);

	var el_dialog = $("#index_template_tem").find("[id=index_time_pick_template]")

	if (opt.formatType)
	{
		el_dialog.find("input").eq(0).attr("format-type" ,opt.formatType)
		el_dialog.find("input").eq(1).attr("format-type" ,opt.formatType)
	}

	searchInpEl.click(function (){
		g_dialog.dialog(el_dialog.html(),{
				width:"500px",
				title:"时间",
				init:init,
				saveclick:save_click
		});

		function init(el)
		{
			el.find("[data-id=modal-body]").css("overflow" ,"visible");
			if (el_start_inp.val())
			{
				console
				el.find("[data-id=start_date]").val(searchInpEl.val().split("  —  ")[0]);
				el.find("[data-id=end_date]").val(searchInpEl.val().split("  —  ")[1]);
			}
		}
		function save_click(el ,saveObj)
		{
			if (!saveObj.start_date && !saveObj.end_date)
			{
				g_dialog.hide(el);
				return false;
			}
			if (saveObj.start_date && !saveObj.end_date)
				saveObj.end_date = saveObj.start_date
			if (saveObj.end_date && !saveObj.start_date)
				saveObj.start_date = saveObj.end_date
			if (saveObj.start_date && saveObj.end_date && (saveObj.start_date > saveObj.end_date))
			{
				g_dialog.dialogTip(el ,{
					msg : "开始时间不能大于结束时间"
				});
				return false;
			}
			searchInpEl.val(saveObj.start_date + "  —  " + saveObj.end_date);
			el_start_inp.val(saveObj.start_date);
			el_end_inp.val(saveObj.end_date);
			g_dialog.hide(el);
			opt.cbf && opt.cbf(saveObj.start_date ,saveObj.end_date)
		}
	});
}

function index_dialog_ip_range(searchEl ,opt)
{
	var placeholder = "";
	if (opt.placeholder) {
		placeholder = "IP"
	}
	searchEl.append('<div class="prel"><input type="text"  readonly class="form-control input-sm search-data-date no-write" placeholder = "'+placeholder+'" style="background:#fff;" search-data="'+opt.id+'"/><i class="pabs icon-filter icon-animate" style="margin:0;right:5px;top:6px;font-size:15px"></i><div class="pabs ip-remove" style="right: 24px; top: 7px; z-index: 3002; line-height: 14px; display: none;"><i class="rh-icon-delete"></i></div></div>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="startIp"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="endIp"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="ipv6Str"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="ipType"/>');

	var searchInpEl = searchEl.find("input").not("[type=hidden]");
	var searchIconEl = searchEl.find("[class*=icon-filter]");
	var el_start_inp = searchEl.find("input").eq(1);
	var el_end_inp = searchEl.find("input").eq(2);
	var el_ipV6 = searchEl.find("input").eq(3);
	var el_ipType = searchEl.find("input").eq(4);

	opt.startKey && el_start_inp.attr("search-data" ,opt.startKey);
	opt.endKey && el_end_inp.attr("search-data" ,opt.endKey);
	opt.ipv6Key && el_ipV6.attr("search-data" ,opt.ipv6Key);

	searchInpEl.bind('input propertychange', function() {
	    el_start_inp.val($(this).val());
		el_end_inp.val($(this).val());
	});

	searchIconEl.click(function (){
		g_dialog.dialog($("#index_template_tem").find("[id=index_ip_range_template]").html(),{
				width:"650px",
				init:init,
				initAfter:initAfter,
				saveclick:save_click,
				title:"IP范围"
		});

		function init(el)
		{
			g_validate.init(el);
			if (searchInpEl.attr("title"))
			{
				el.find("[data-id=start_ip]").val(searchInpEl.attr("title").split(" - ")[0]);
				el.find("[data-id=end_ip]").val(searchInpEl.attr("title").split(" - ")[1]);
			}
			el.find("[data-id=modal-body]").css("overflow" ,"visible");
			el.find("input[type=radio]").click(function (){
				el.find("[data-tval]").attr("disabled" ,"disabled");
				el.find("[data-tval]").val("");
				el.find("[data-tval="+el.find("input[type=radio]:checked").val()+"]").removeAttr("disabled");
				g_validate.clear([el.find("[data-tval="+el.find("input[type=radio]:not(:checked)").val()+"]")]);
				el.find("[data-id="+("0"===el.find("input[type=radio]:checked").val() ? 'start_ip' : 'ipV6')+"]").focus();
			});

			el.find("input[type=radio][value="+el_ipType.val()+"]").click();
			el.find("input[type=radio][value="+el_ipType.val()+"]").click();

			if (searchInpEl.val().indexOf(":") < 0)
			{
				el.find("[data-id=start_ip]").val(el_start_inp.val());
				el.find("[data-id=end_ip]").val(el_end_inp.val());
			}
			else
			{
				el.find("[data-id=ipV6]").val(el_ipV6.val());
			}
		}
		function initAfter(el) 
		{
			el.find("[data-id=start_ip]").focus();
		}
		function save_click(el ,saveObj)
		{
			if (!g_validate.validate(el))
			{
				return false;
			}
			searchEl.umDataBind("reset")
			if (el.find("input[type=radio]:checked").val() == 0)
			{
				if (!g_validate.ipValidate(el.find("[data-id=start_ip]") ,el.find("[data-id=end_ip]")))
				{
					return false;
				}
				if (saveObj.start_ip && !saveObj.end_ip)
					searchInpEl.val(saveObj.start_ip + " - " + saveObj.start_ip);
				else if (saveObj.end_ip && !saveObj.start_ip)
					searchInpEl.val(saveObj.end_ip + " - " + saveObj.end_ip);
				else
					searchInpEl.val(saveObj.start_ip + " - " + saveObj.end_ip);
				//searchInpEl.val(saveObj.start_ip + " - " + saveObj.end_ip);
				el_start_inp.val(saveObj.start_ip);
				el_end_inp.val(saveObj.end_ip);
				el_ipType.val("0");
			}
			else
			{
				searchInpEl.val(saveObj.ipV6);
				el_ipV6.val(saveObj.ipV6);
				el_ipType.val("1");
			}
			
			searchInpEl.removeAttr("search-data");
			g_dialog.hide(el);
		}
	});
	var excute_mouseout_timeout;
	searchEl.mouseover(function (){
		// 控制不执行mouseout
		clearTimeout(excute_mouseout_timeout);
		searchEl.find(".ip-remove").show();
	}).mouseout(function (){
		excute_mouseout_timeout = setTimeout(function (){
			searchEl.find(".ip-remove").hide();
		} ,500);
	});
	searchEl.find(".ip-remove").click(function (){
		searchEl.find("input").val("");
		$(this).hide();
		clearTimeout(excute_mouseout_timeout);
	});
}

function index_dialog_select(searchEl ,opt)
{
	searchEl.append('<select class="form-control input-sm" search-data="'+opt.name+'"></select>');
	var buffer = [];
	var dataList = opt.data;
	for (var i = 0; i < dataList.length; i++) {
		buffer.push('<option value="'+dataList[i].value+'">'+dataList[i].text+'</option>')
	}
	searchEl.find("select").append(buffer.join(","));
}

function index_dialog_range(searchEl ,opt)
{
	opt.placeholder = opt.placeholder || ""
	searchEl.append('<input type="text" class="form-control input-sm search-data-date" placeholder="'+opt.placeholder+'"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="'+opt.startKey+'"/>');
	searchEl.append('<input type="hidden" class="form-control input-sm" search-data="'+opt.endKey+'"/>');

	var searchInpEl = searchEl.find("input").not("[type=hidden]");
	var el_start = searchEl.find("input").eq(1);
	var el_end = searchEl.find("input").eq(2);
	var title = "风险值";
	if(opt.title)
	{
		title = opt.title;
	}

	searchInpEl.click(function (){
		g_dialog.dialog($("#index_template_tem").find("[id=index_range_template]").html(),{
				width:"500px",
				init:init,
				title:title,
				saveclick:save_click
		});

		function init(el)
		{
			g_validate.init(el);
			el.find("input").eq(0).val(el_start.val());
			el.find("input").eq(1).val(el_end.val());
		}

		function save_click(el)
		{
			var startVal = el.find("input").eq(0).val();
			var endVal = el.find("input").eq(1).val();
			if(startVal && endVal && (parseInt(startVal) > parseInt(endVal)))
			{
				if(opt.title)
				{
					g_dialog.dialogTip(el ,{
					msg : "起始值不能大于结束值。"
					});
				}
				else
				{
					g_dialog.dialogTip(el ,{
						msg : "最小风险值不能大于最大风险值。"
					});
				}
				return false;
			}
			el_start.val(el.find("input").eq(0).val());
			el_end.val(el.find("input").eq(1).val());
			searchInpEl.val(el_start.val() + " 至 " + el_end.val());
			g_dialog.hide(el);
		}
	});
}

function index_ed_monitor_get(urlParamObj ,selElArray ,cb)
{
	g_dialog.waitingAlert();
	var ed_monitor_url = "monitorView/queryEdMonitor";
    urlParamObj.instStatus = 1;
    urlParamObj.monitorTypeNameLanguage = 1;
    urlParamObj.edId = urlParamObj.assetId;
    um_ajax_get({
        url : ed_monitor_url,
        paramObj : urlParamObj,
        isLoad : false,
        successCallBack : function (data){
           index_instance_type_get(data.edmonitorstore[1].monitorId ,selElArray ,cb);
        }
    });
}

function index_instance_type_get(monitorId ,selElArray ,cb)
{
	var instance_type_url = "monitorView/queryInstanceType";
    um_ajax_get({
        url : instance_type_url,
        paramObj : {monitorId:monitorId},
        isLoad : false,
        successCallBack : function (data){
            var selBuff = [];
            for (var i = 0; i < data.length; i++) {
                selBuff.push({id:data[i].codevalue ,text:data[i].codename});
            }
            for (var i = 0; i < selElArray.length; i++) {
            	selElArray[i].select2({
                  data: selBuff,
                  width:"100%"
	            });

	            selElArray[i].change();
            }
            g_dialog.waitingAlertHide();
        }
    });
}

function index_menuHide(param){
	if($(".pg-header-menu").css("overflow")=="hidden"){
		return false;
	}
	$(".pg-header-menu").css("overflow","hidden");
	$(".pg-header-menu").animate({
		height:"0px"
	},"normal","swing",function (){
		index_initLayout();
		$("#menu-toggle").addClass("menu-toggle-rotate");
		$("#menu-toggle").prop("title","收起个人中心");
		$(window).resize();
		index_initLayout_outHeight();
		param && param.cbf && param.cbf();
	});
	$(".menu-toggle").hide();
	$("#icon_menu_hf").parent().hide();

}
function index_menuShow(){
	if($(".pg-header-menu").css("overflow")!="hidden"){
		return false;
	}
	$(".pg-header-menu").animate({
		height:"50px"
	},"normal","swing",function (){
		index_initLayout();
		$(".pg-header-menu").css("overflow","visible");
		$("#menu-toggle").removeClass("menu-toggle-rotate");
		$("#menu-toggle").prop("title","隐藏菜单");
		$(".menu-toggle").show();
		$(window).resize();
		index_initLayout_outHeight();
	});
	$("#icon_menu_hf").parent().show();
}
function index_initLayout_outHeight(){
	var window_height = $(window).outerHeight();
	var pg_header = $("[class=pg-header]:visible").outerHeight();
	$("#pg-container").outerHeight(window_height - pg_header);
	$("#pg-content").outerHeight($("#pg-container").outerHeight() - index_getPadderMargin($("#pg-content")));
	$("#content_div").outerHeight(
		$("#pg-content").outerHeight()
		- index_getHeightWithPadderMargin($("#menu-index")) 
		- index_getPadderMargin($("#content_div"))
		);
	$("#table_div1").outerHeight(
		$("#content_div").outerHeight()
		- index_getHeightWithPadderMargin($("#table_wrap"))
		- index_getHeightWithPadderMargin($("#table_oper"))
		- index_getHeightWithPadderMargin($("ul[class=pagination]"))
		- index_getHeightWithPadderMargin($("div[class*=search-div]"))
		- index_getPadderMarginHeight($("#table_div_outer"))
		- index_getPadderMarginHeight($("#table_div1"))
		- 0
		);
}
function index_menuToggle_init(){
	$("#user_btn").on("mouseover",function (){
		$("#menu-toggle").find("i").attr("class","rh-icon-up")
		$("#user_pop_div").height("126px")
	}).on("mouseout", function(){
		$("#menu-toggle").find("i").attr("class","rh-icon-down")
		$("#user_pop_div").height("0")
	});
	$("#user_pop_div").on("mouseout", function(){
		$("#user_pop_div").height("0")
	})
}

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

$(document).keydown(index_document_keydown);

function Encrypt(str)
{
	if (index_is_encrypt != 1)
		return str
	if (!str)
		return null
	var monyer = new Array();
	var i, s, str;
	var key = index_encrypt_key
	var t;
	var j;
	for (i = 0; i < str.length; i++)
	{
		j = i % 6;
		monyer += String.fromCharCode(str.charCodeAt(i)^index_encrypt_key.charCodeAt(j));
	}
	return monyer;
}

function index_cloud_color_get(colorVal){
	var background;
	if (colorVal <= 60)
		background = "background-image: -moz-linear-gradient( 90deg, rgb(123,212,82) 0%, rgb(145,225,102) 100%);"
					  +"background-image: -webkit-linear-gradient( 90deg, rgb(123,212,82) 0%, rgb(145,225,102) 100%);"
					  +"background-image: -ms-linear-gradient( 90deg, rgb(123,212,82) 0%, rgb(145,225,102) 100%)";

	else if(colorVal > 60 && colorVal <=80)
		background = "background-image: -moz-linear-gradient( 90deg, rgb(231,148,29) 0%, rgb(239,170,38) 100%, rgb(231,148,29) 100%);"
					  +"background-image: -webkit-linear-gradient( 90deg, rgb(231,148,29) 0%, rgb(239,170,38) 100%, rgb(231,148,29) 100%);"
					  +"background-image: -ms-linear-gradient( 90deg, rgb(231,148,29) 0%, rgb(239,170,38) 100%, rgb(231,148,29) 100%);";

	else
		background = "background-image: -moz-linear-gradient( 90deg, rgb(231,76,60) 0%, rgb(239,94,76) 100%);"
					  +"background-image: -webkit-linear-gradient( 90deg, rgb(231,76,60) 0%, rgb(239,94,76) 100%);"
					  +"background-image: -ms-linear-gradient( 90deg, rgb(231,76,60) 0%, rgb(239,94,76) 100%);";
	return background;
}

function index_cloud_num_color_get(colorVal){
	if (colorVal <= 60)
		return "#95dd75"
	else if(colorVal > 60 && colorVal <=80)
		return "#fcb942"
	else
		return "#ff6565"
}

//全屏
function index_fullScreen(){
    var el = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;      
        if(typeof rfs != "undefined" && rfs) {
            rfs.call(el);
        };
      return;
}
//退出全屏
function index_exitScreen(){
    if (document.exitFullscreen) {  
        document.exitFullscreen();  
    }  
    else if (document.mozCancelFullScreen) {  
        document.mozCancelFullScreen();  
    }  
    else if (document.webkitCancelFullScreen) {  
        document.webkitCancelFullScreen();  
    }  
    else if (document.msExitFullscreen) {  
        document.msExitFullscreen();  
    } 
    if(typeof cfs != "undefined" && cfs) {
        cfs.call(el);
    }
}
