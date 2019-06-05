/** 
	插件名称  :  dialog对话框
	插件功能  :  dialog对话框，包含表单弹出，信息提示等。
	参数      :
				 width:"400px",
				 height:"auto",  设置具体的高度可以调价对话框相对于文档的位置
				 left:"30%",
				 btn_array:[],   {id: ,text:  ,aClick}
				 init:function (el){},
				 query_save_click:function (el){}
*/

define(['/js/plugin/mask/mask.js'] ,function (mask){

	var el;

	var buffer = [];
	buffer.push('<div class="umDialog animated fadeInLeft" style="display:none">');
	buffer.push('<div class="modal-dialog w-all">');
	buffer.push('<div class="modal-content">');
	buffer.push('<div class="modal-header">');
	buffer.push('<div class="modal-title"><span data-id="modal-title" style="margin-left:36px;"></span></div>');
	buffer.push('<button data-id="close" class="close" type="button"><span aria-hidden="true" class="dialog_close"></span><span class="sr-only">Close</span></button>');
	buffer.push('</div>');
	buffer.push('<div class="modal-tip"><div class="modal-tip-msg">错误提示：<span></span></div></div>')
	buffer.push('<div class="modal-body" data-id="modal-body">');
	buffer.push('<div data-id="loading" class="loading"></div>');
	buffer.push('</div>');
	buffer.push('<div class="modal-footer" data-id="btn_div" style="display:none; z-index:1000; height:52px;">');
	//buffer.push('<button data-id="close" class="btn ant-btn" type="button" style="padding-left:30px">关闭</button>');
	buffer.push('<button data-id="save" class="btn ant-btn ant-btn-primary">确认</button>');
	buffer.push('</div></div></div>');
	buffer.push('</div>');

	var dialogAlert = $(buffer.join(""));

	var waitingAlert = '<div class="umDialog-waiting"><div class="umDialog-waiting-in-wrap"><div class="sk-rotating-plane" data-id="loading-icon"></div></div></div>';
	var confirmAlert = $(buffer.join(""));

	return {
		dialog:function (htmlContent ,opt){
			var defaults =
			{
				width:"400px",
				height:"auto",
				left:"30%",
				btn_array:[],
				init:function (){},
				title:"",
				query_save_click:function (){},
				top:"",
				isValidateInit:true
			}

			if (index_dialog_is_lock)
			{
				return false;
			}

			index_dialog_is_lock = true;

			var opt = $.extend(defaults, opt); 

			var htmlContentEl = opt.isConfirmAlarm ? '<span>'+htmlContent+'</span>' : $(htmlContent);

			var self = this;

			mask.show(cbf);

			function cbf(){
				var dialog = self.createDialog(htmlContentEl ,opt);

				// 设置拖拽
				self.initDragEvent(dialog.find("[class=modal-header]") ,dialog);
				
				dialog.show();
				
				$("body").oneTime(50 ,function (){
					opt.isValidateInit && g_validate.init(el);
					opt.initAfter && opt.initAfter(dialog);
					index_dialog_is_lock = false;
				});
			}	
		},
		dialogFullScreen : function (htmlContent ,opt){
			var defaults =
			{
				width:"400px",
				height:"auto",
				left:"30%",
				btn_array:[],
				init:function (){},
				title:"",
				query_save_click:function (){}
			}

			var opt = $.extend(defaults, opt);

			var htmlContentEl = $(htmlContent);

			var self = this;

			mask.show(cbf);

			function cbf(){
				var dialog = self.createDialog(htmlContentEl ,opt);
				dialog.css("left" ,"10px");
				dialog.css("right" ,"10px");
				dialog.css("top" ,"10px");
				dialog.css("bottom" ,"10px");
				dialog.css("width" ,"auto");
				if (dialog.width() < 1230){
					dialog.width(1230);
				}
				dialog.find("[class*=modal-dialog]").addClass("h-all");
				dialog.find("[class*=modal-content]").addClass("h-all");
				dialog.find("[class*=modal-footer]").remove();
				dialog.show();
				$("body").oneTime(50 ,function (){
					g_validate.init(el);
					opt.initAfter && opt.initAfter(dialog);
					index_dialog_is_lock = false;
				});
			}
		},
		createDialog:function (htmlContentEl ,opt){
				var self = this;
				el = mask.get();

				var dialog_id = "umDialog" + new Date().getTime();

				el.append(dialogAlert.clone());

				var el_dialog = el.find("[class*=umDialog]");

				el_dialog.attr("data-id" ,dialog_id);

				el_dialog.css("height" ,opt.height);

				el_dialog.css("width" ,opt.width);

				el_dialog.css("left" ,opt.left);

				var el_modal_dialog = el_dialog.find("[class*=modal-dialog]");

				var el_modal_content = el_dialog.find("[class=modal-content]").eq(0);

				var el_modal_header = el_dialog.find("[class*=modal_header]");

				var el_modal_body = el_dialog.find("[data-id=modal-body]");

				var el_modal_title = el_dialog.find("[data-id=modal-title]");

				var el_modal_footer = el_dialog.find("[class*=modal-footer]");

				el_modal_title.html(opt.title = (opt.title.indexOf("添加") > -1 ? opt.title.replace(/添加/ig, '新增') : opt.title));

				if (opt.isConfirmAlarm) 
				{
					el_modal_body.append('<div style="float: left; margin-left: 0; width: 20%; text-align: center; font-size: 42px; height: auto; min-height: 50px; line-height: 50px; color: #e74c3c;"><i class="icon-warning-sign"></i></div>');
					el_modal_body.append('<div style="float: right; margin-right: 0; width: 79%; padding-left: 10px; line-height: 50px;" data-name="confirmAlertRightPanel"></div>');
					el_modal_body.find("[data-name=confirmAlertRightPanel]").append(htmlContentEl);
				} 
				else 
				{
					el_modal_body.append(htmlContentEl);
				} 

				el_modal_body.find("[data-id=loading]").next().hide();

				// 渲染按钮
				var btn_array = opt.btn_array;
				var el_btn_div = el_dialog.find("[data-id=btn_div]");
				var btn_index;
				 if (btn_array.length > 0)
				 {
				 	if (opt.hideDefaultBtn)
				 	{
				 		el_btn_div.empty()
				 	}
					for (var i=0;i<btn_array.length;i++)
					{
						btn_index = i;
						var el_btn = '<button data-type="custom" class="btn ant-btn" >'
												+btn_array[i].text+'</button>';
						el_btn_div.append(el_btn);
					}
					el_btn_div.find("[data-type=custom]").each(function (i){
						$(this).click(function (){
							btn_array[i].aClick(htmlContentEl);
						});
					});
				 }
				 if (opt.isDetail)
				 {
				 	el.find("[data-flag=title-icon]").removeClass("oper-edit").addClass("oper-detail");
				 	el_btn_div.find("[data-id=save]").hide();
				 }
				 if (opt.isConfirmAlarm) 
				 {
				 	el.find("[data-flag=title-icon]").removeClass("oper-edit").addClass("oper-detail");
				 	el.find("[class=modal-header]").hide();
				 	el_btn_div.find("[data-id=close]").hide();
				 }

				// 绑定事件
				var dialog = el.find('div[data-id='+dialog_id+']');

				dialog.find("[data-id=close]").click(function (){
					if (opt.closeType == "hide")
					{
						dialog.parent().hide();
						return  false;
					}
					self.hide(dialog_id);
					opt.closeCbf && opt.closeCbf();
				});

				dialog.find("[data-id=save]").click(function (){
					if (opt.isConfirmAlarm) 
					{
						opt.saveclick && opt.saveclick();
						self.hide(dialog_id);
					}
					var saveObj = opt.isConfirmAlarm ? {} : htmlContentEl.umDataBind("serialize");
					var flag = opt.saveclick(el_dialog ,saveObj);
					if (flag)
					{
						self.hide(dialog_id);
					}
				});
				var left_top = self.getPosition(
									$('[data-id = '+dialog_id+']').width(),
									$('[data-id = '+dialog_id+']').height());

				$('[data-id='+dialog_id+']').css("left" ,left_top.left);

				el.find('div[data-id='+dialog_id+']').css("opacity" ,1);

				el.find('div[data-id='+dialog_id+']').css("top" ,"49px");

				__calcDialogHeight(el.find('div[data-id='+dialog_id+']'))

				if (opt.autoHeight)
				{
					// el_dialog.addClass("pabs");
					// el_dialog.css("bottom" ,"50px");
					// el_dialog.data("autoHeight" ,"autoHeight");
					// el_modal_dialog.addClass("w-all h-all");
					// el_modal_content.addClass("h-all");
					// el_modal_header.addClass("pabs w-all");
					// el_modal_header.css({top: "0",left: "0"});
					// el_modal_body.addClass("pabs w-all");
					// el_modal_body.css({left: "0px", bottom: "52px", top: "47px"});
					// el_modal_footer.addClass("pabs w-all");
					// el_modal_footer.css({left: "0",bottom: "22px" ,height: "30px"});
				}
				if (opt.autoHeightValue)
				{
					// if (opt.autoHeightValue == "auto")
					// {
					// 	opt.autoHeightValue = "10%";
					// }
					// el_dialog.css("top" ,opt.autoHeightValue);
					// el_dialog.css("bottom" ,opt.autoHeightValue);
				}

				// 添加进场动画
				// el.find('div[data-id='+dialog_id+']').animate({opacity:1,top:left_top.top} ,300,function (){
				// 初始化
				opt.init(el_dialog);
				index_form_init(el_dialog);
				el_modal_body.find("[data-id=loading]").hide();
				el_modal_body.find("[data-id=loading]").next().show();
				el_btn_div.show();
				!opt.heigth && el_dialog.css("height" ,"auto");
				onWindowResize.add(function (){
					__calcDialogHeight(el.find('div[data-id='+dialog_id+']'))
				})
				return dialog;
		},
		dialogTip:function (dialog ,opt){
			var el_modal_tip = dialog.find("[class*=modal-tip]");
			var el_modal_tip_height = el_modal_tip.height();
			el_modal_tip.height(0);
			el_modal_tip.find("span").text(opt.msg);
			el_modal_tip.animate({height:"50px"} ,"slow" ,function (){});
		},
		hide:function (dialog_id ,closeType){
			if (typeof dialog_id == 'string')
			{
				mask.hide($("[data-id="+dialog_id+"]").closest("[class=um_mask]"));
			}
			else
			{
				if (closeType == "hide")
				{
					dialog_id.parent().hide();
					//dialog_id.parent().css("z-index" ,"-1");
					return  false;
				}
				mask.hide(dialog_id.closest("[class=um_mask]"));
			}
		},
		operateConfirm:function (htmlContent ,opt){
			var self = this;
			mask.show(function (){
				var el = mask.get();
				el.append(confirmAlert.clone());
				el.find("[data-flag=title-icon]").removeClass("oper-edit").addClass("oper-detail");
				//el.find("[data-flag=title-icon]").remove();
				var dialog_id = "umDialog" + new Date().getTime();
				var el_dialog = el.find("[class*=umDialog]");
				el_dialog.attr("data-id" ,dialog_id);
				el_dialog.find("[data-id=btn_div]").show();
				var el_modal_body = el_dialog.find("[data-id=modal-body]");
				el_dialog.find("[data-id=loading]").remove();
				
				el_modal_body.css("max-height" ,"100px");
				el_modal_body.html('<span>'+htmlContent+'<span>');

				var el_modal_title = el_dialog.find("[data-id=modal-title]");
				el_modal_title.html(opt.title);

				el_dialog.css("width" , opt.width || "300px");

				var left_top = self.getPosition(el_dialog.width(),el_dialog.height());

				el_dialog.css("left" ,left_top.left);

				el_dialog.css("top" ,left_top.top);

				el_dialog.css("opacity" ,1);

				el_dialog.show();

				el_dialog.find("[data-id=close]").click(function (){

					self.hide(dialog_id);
					opt.closeCbf && opt.closeCbf();
				});

				el_dialog.find("[data-id=save]").click(function (){
					opt.saveclick();
					self.hide(dialog_id);
				});
			});
		},
		operateAlert:function (el ,htmlContent ,type ,overtime){
			$('<div class="umDialog-alert"></div>').remove();
			var operateAlert = $('<div class="umDialog-alert"></div>');
			// el = (el == undefined ? "body" : el);
			el = ((el == undefined || $(el).attr("class") == "ant-table") ? "body" : el);
			var spanIcon = '<div><i class="alert-icon-correct"></i></div>';
			
			htmlContent = (htmlContent == undefined ? "操作成功!" : htmlContent);

			var timeout = overtime || 2000

			if (type == "error")
			{
				operateAlert.css({"background-color" :"#fef1f0","border":"1px solid #fca29f"});
				spanIcon = '<div><i class="alert-icon-error"></i></div>';
				timeout = 4500
			}
			else
			{
				operateAlert.css({"background-color" :"#f6ffee","border":"1px solid #b8ec92"});
			}
 
			operateAlert.html(spanIcon + '<div><span style="word-wrap:break-word;">' +htmlContent + "</span></div>");

			$(el).append(operateAlert);

			var left_top = this.getPosition(operateAlert.width(),operateAlert.height(),el);

			if (index_is_IE11)
				operateAlert.css("width" ,"300px");

			// operateAlert.css("left" ,left_top.left);
			$("[class=umDialog-alert]").css("opacity" ,0);
			if (el == "#content_div") {
				operateAlert.animate({top:"0" ,opacity:"1"},500);
			} else {
				operateAlert.animate({top:"48px" ,opacity:"1"},500);
			}
			
			$(this).stopTime();
			$(this).oneTime(timeout ,function (){
				$("[class=umDialog-alert]").animate({top:"-40px" ,"opacity":0},500,function (){
					$("[class=umDialog-alert]").remove();
				});
			});
		},
		waitingAlert:function (elDiv ,opt){
			elDiv = (elDiv == undefined ? "body" : elDiv);

			//$(elDiv).children().css("opacity" ,0)

			if ($(elDiv).data("autoHeight"))
			{
				$(elDiv).children().css("position" ,"relative");
			}
			else
			{
				$(elDiv).css("position" ,"relative");
			}
			
			var el_waitingAlert = $(waitingAlert).clone();

			el_waitingAlert.hide();

			$(elDiv).append(el_waitingAlert);

			// 计算loading图标的大小
			var loading_icon = el_waitingAlert.find("[data-id=loading-icon]");

			if (elDiv != 'body' && elDiv != '#pg-container' && elDiv != '#content_div')
			{
				// loading_icon.css("width" ,(el_waitingAlert.height()/30) + "px");
				// loading_icon.css("height" ,(el_waitingAlert.height()/30) + "px");
				loading_icon.removeClass('sk-rotating-plane')
				loading_icon.removeClass('comp-loading')
				loading_icon.addClass('comp-loading-1')
			}
			else{
				loading_icon.removeClass('sk-rotating-plane')
				loading_icon.removeClass('comp-loading-1')
				loading_icon.addClass('comp-loading')
			}
	
			// 设置背景色
			// el_waitingAlert.css("background-color" ,"inherit");
		
			var el_waitingAlert_p = el_waitingAlert.find("p");

			// var left_top = this.getPosition(el_waitingAlert_p.width(),el_waitingAlert_p.height(),
			// 								el_waitingAlert);
			// el_waitingAlert_p.css({left:left_top.left});

			el_waitingAlert.show();
		},
		waitingAlertHide:function (elDiv){
			elDiv = (elDiv == undefined ? "body" : elDiv);
			$(elDiv).children("[class=umDialog-waiting]").remove();
			//$(elDiv).children().css("opacity" ,1)
		},
		btnHide:function (elDiv ,btnId){
			elDiv.closest('[class*=umDialog]').find('[data-id="'+btnId+'"]').hide();
		},
		getPosition : function (dialogWidth ,dialogHeight ,parentEl){
			if (!parentEl)
			{
				parentEl = window;
			}

			// 获取屏幕宽度
			var windowWidth = $(parentEl).width();
			// 获取屏幕高度
			var windowHeight = $(parentEl).height();
			
			var left = (windowWidth - dialogWidth)/2;

			var top =  (windowHeight - dialogHeight)/4;

			return {'left' : left ,'top' : top};
		},
		initDragEvent : function (dragHandleEl , dragEl)
		{
			var _x;
			var _y;

			var diff_x;
			var diff_y;

			var _left = parseInt(dragEl.css("left"));
			var _top = parseInt(dragEl.css("top"));

			var __document_width = $(document).width()
			var __document_height = $(document).height()

			var __el_width = dragEl.width()
			var __el_height = dragEl.height()

			dragHandleEl.mousedown(function (e){
				e.preventDefault();

				_x = e.pageX;
				_y = e.pageY;

				$(document).on('mousemove.module' ,function (e){

					diff_x = e.pageX - _x;
					diff_y = e.pageY - _y;
					if (_top + diff_y < 20 || _left + diff_x < 20
						|| __el_width + _left + diff_x > __document_width
						|| __el_height + _top + diff_y > (__document_height - 40))
					{
						return false;
					}	
					dragEl.css("left" ,(_left + diff_x) + "px");
					dragEl.css("top" ,(_top + diff_y) + "px");
				});

				$(document).one('mouseup' ,function (e){
					$(document).off('mousemove.module');
					_left = parseInt(dragEl.css("left"));
					_top = parseInt(dragEl.css("top"));
				});
			});
		},
		/** 从页面右侧出现Dialog
			支持 模板渲染 和 指定字段渲染   
			param : opt{
					width
					render
			}
		*/
		rightDialog : function (opt){
			var self = this;
			var defaultOpt = {
				width: "500px"
			};
			var opt = $.extend(defaultOpt, opt);
			var el_dialog;
			var el_dialog_close;
			var el_form;
			var buffer = [];
			if ($("body").find("[class*=umDialog-right-outer]").size() > 0)
			{
				el_dialog = $("body").find("[class*=umDialog-right-outer]");
			}
			else
			{
				el_dialog = $('<div class="umDialog-right-outer tran5"><div class="umDialog-right">'
							+'<div class="umDialog-right-header-outer"><div class="umDialog-right-header">'
							+'信息详情<div class="umDialog-right-header-close"><i class="icon-remove"></i></div>'
							+'</div></div>'
							+'<div class="umDialog-right-content-outer"><div class="umDialog-right-content">'
							+'<form class="bs-example form-horizontal xs-form"></form><div class="mask">'
							+'<div class="pabs w-all tc" style="top:40%"><div class="loadinggif"></div></div></div>'
							+'</div></div>'
							+'</div></div>');	

				el_dialog_close = el_dialog.find("[class=icon-remove]");

				el_dialog.css("width" ,opt.width);
				el_dialog.css("right" ,"-" + opt.width);

				el_dialog.data("opt" ,opt);

				el_dialog_close.click(function (){
					el_dialog.css("right" ,"-" + opt.width);
				});

				$("body").append(el_dialog);
			}

			var delay_time = 500;

			var el_form = el_dialog.find("form");

			var el_mask = el_dialog.find("[class=mask]");

			el_form.html("");

			if (el_dialog.css("right") == "0px")
			{
				delay_time = 0;
			}

			el_mask.show();

			// 载入动画
			el_dialog.oneTime(10 ,function (){
				el_dialog.css("right" ,0);
			});
			// 延迟后加载数据
			el_dialog.oneTime(delay_time ,function (){
				opt.render && opt.render(el_form ,el_mask);
			});
		},
		rightDialogHide : function ()
		{
			var el_dialog;
			var el_dialog_close;

			if ($("body").find("[class*=umDialog-right-outer]").size() > 0)
			{
				el_dialog = $("body").find("[class*=umDialog-right-outer]");

				el_dialog_close = el_dialog.find("[class=icon-remove]");

				var opt = el_dialog.data("opt");

				el_dialog.css("right" ,"-" + opt.width);
			}
		},
		elDialog : function (opt){
			var self = this
			$(".ant-body").hide()
			opt.bgcontainer &&　opt.bgcontainer.hide()
			var el = $("#content_div")
			var el_dialog = $('<div class="umElDialog" style="float:right;"></div>').appendTo(el)
			var el_dialog_title = $('<div class="umElDialog-title"><div class="__content"><a class="__back" href="javascript:void(0);">返回</a><span class="__title">'
										+ opt.title+'</span></div></div>').appendTo(el_dialog)
			var el_dialog_content = $('<div class="umElDialog-content"></div>').appendTo(el_dialog)
			
			el_dialog.data("data" ,opt.data)
			opt.cssName && el_dialog.addClass(opt.cssName)

			um_ajax_html({
				url : opt.url,
				selector : opt.selector,
				successCallBack : function (data){
					el_dialog_content.append(data)
					if (el_dialog_content.find(".ant-footer").size() > 0) {
						$(".umElDialog-content").css("padding-bottom","35px")
					}
					if (el_dialog_content.find(".umElDialog-content-tab").size() > 0)
						__tab_event_init()
					opt.cbf &&  opt.cbf()
				}
				})
			
			el_dialog_title.find(".__back").click(function (){
				opt.bgcontainer && opt.bgcontainer.show()
				if (opt.back_cbf) {
					opt.back_cbf()
					return false
				}
				self.elDialogHide($(this))
				$(".ant-body").show()
				opt.back_after_cbf && opt.back_after_cbf()
			})

			function __tab_event_init(){
				var el_dialog_content_tab = el_dialog_content.find(".umElDialog-content-tab")
				el_dialog_content_tab.find("li").click(function (){
					$(this).addClass("active").siblings().removeClass("active")
					el_dialog_content.find("section").not("[class=ant-footer]").hide()
					el_dialog_content.find("section").eq($(this).index()).show()
				})
				el_dialog_content_tab.find("li").eq(0).click()
			}
		},
		elDialogParam : function (){
			return $("body").find("[class=umElDialog]").data("data")
		},
		elDialogHide : function (elBack){
		    if (elBack)
		    	$(".ant-body").show(),elBack.parent().parent().parent().remove()
		    else
		   		$(".ant-body").show(),$("body").find("[class*=umElDialog]").remove()
		}
	}

	function __calcDialogHeight(dialogEl)
	{
		var window_height = $(window).height()
		var __top = parseInt(dialogEl.css("top"))
		var __header_height = dialogEl.find(".modal-header").height()
		var __footer_height = dialogEl.find(".modal-footer").height()
		var dialog_body_height = window_height - __top*2 - 46 - __footer_height
		dialogEl.find("[data-id=modal-body]").css("max-height" ,dialog_body_height + "px")
	}
});