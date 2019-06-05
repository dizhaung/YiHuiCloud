/** 
	插件名称  :  menu
	插件功能  :  横向导航栏
	参数      :  {
					url:getMenu.do
				 }
*/
 define(['/js/plugin/usercenter/usercenter.js',
 		"css!/js/plugin/menu/menu.css"],function (usercenter){
 	// 菜单json格式
 	var menuDataArray = [];
 	var menuIdMap = new HashMap();
 	var pathMap = new HashMap();
 	var menuMoveVal = 0;
 	var buffer = [];
	var menuObj;
	var submenu;
	var subsubmenu;
	var urlArray = [];
	var index_urlParamObj = index_query_param_get();
	var btnAuthInit = false
	var btnAuthData
 	return {
 		render : function (el ,opt){
 			var tis = this;
 			buffer.push('<div class="hor-menu" style="margin-right:190px"><div class="hor-menu-left"></div><div class="hor-menu-right"></div>');
 			buffer.push('<ul class="hor-ul" style="height:70px">');

 			um_ajax_get({
 				url : opt.url,
 				maskObj : "body",
 				isLoad :  (index_urlParamObj.hideMenu == "1") ? false : true,
 				server : "/",
 				successCallBack : function(data)
 				{
 					if (!data || data.length == 0)
 						no_role_tip()
 					menuDataArray = data;
 					var countTmp = 0;
		 			for (var i=0;i<menuDataArray.length;i++)
		 			{
		 				menuObj = menuDataArray[i];
		 				if (menuObj.showFlag == 0)
		 				{
		 					continue;
		 				}
		 				menuIdMap.put(menuObj.name ,menuObj);
		 				buffer.push('<li menu_id="'+menuObj.name+'" menu_name="'+menuObj.label+'"><a href="javascript:void(0);">'
		 								+'<div class="first-menu-name">'+menuObj.label+'</div><i class="first-menu-active"></i></a>');
		 				if (menuObj.children)
		 				{
		 					buffer.push('<div class="sub-menu">');
			 				for (var j=0;j<menuObj.children.length;j++)
			 				{
			 					submenu = menuObj.children[j];

			 					if (submenu.href)
			 					{
			 						urlArray.push(submenu.href);
			 						pathMap.put(submenu.href ,submenu.path)
			 					}

			 					for (var k=0;k<submenu.children.length;k++)
			 					{
			 						subsubmenu = submenu.children[k];
			 						urlArray.push(subsubmenu.href);

			 						pathMap.put(subsubmenu.href ,subsubmenu.path);
			 					}

			 				}
			 				buffer.push('</div>');
		 				}

		 				buffer.push('</li>');
		 			}
		 			buffer.push('</ul>');
		 			buffer.push('</div>');
		 			buffer.push('<div id="user_btn" class="prel">');
		 			buffer.push('<div id="user_icon" style="margin-left:11px;">');
		 			buffer.push('</div>');
		 			buffer.push('<span id="user_account"></span>');
		 			buffer.push('<div id="menu-toggle"><i class="rh-icon-down"></i></div>')
		 			buffer.push('</div>');
		 			buffer.push('<div id="menu_itil_div" class="prel" title="工作台" style="display:none;">工作台</div>');
		 			buffer.push('<div id="menu_quota_div" class="prel dn"></div>');
		 			buffer.push('<div id="menu_oc_sel" class="prel dn"><span data-id="__text"></span><i class="rh-icon-down"></i><div class="__list"><div class="__wrap"></div></div></div>');
		 			el.after(buffer.join(''));
		 			el.remove();
 					menuOffsetLeft = $(".hor-ul").width();

 					// 一级菜单的点击事件
 					$("[class=hor-ul]").find("li").click(function (){
 						$("[class=hor-ul]").find("li").removeClass("active");
 						$(this).addClass("active");
 						createMenu($(this).attr("menu_id") ,"autoClick");
 					});

 					// 根据当前url判断选中了第几个一级标题
 					if (getUrl() && pathMap.get(getUrl())){
 						var pathArray = pathMap.get(getUrl()).split("/")
	 					if (pathArray && pathArray.length > 1){
	 						var current_li = $("[class=hor-ul]").find('li[menu_name="'+pathArray[1]+'"]')
		 					$("[class=hor-ul]").find("li").removeClass("active");
							current_li.addClass("active");
							createMenu(current_li.attr("menu_id") ,"autoSelect");
	 					}
 					}

 					// 是否隐藏菜单
					if (index_urlParamObj.hideMenu == "1")
						$("#pg-header").remove();

 					urlArray.push("/ztest/manage/view/view");

		 			// url哈希值改变事件
				    $(window).hashchange(function() {
						goToPage();
				    });

				    // 初始化跳转
				    goToPage();

				    if (index_urlParamObj.hide == "1")
					{
						setTimeout(function (){
							$("#pg-header").hide()
							$("#pg-left-menu-outer").hide()
						} ,0)
					}

					index_menuToggle_init();
 				}
 			});

			$("#menu_col_exp").click(function (){
				$("[class*=pg-left-menu-outer]").toggleClass("icon");
				if ($("[class*=pg-left-menu-outer]").hasClass("icon"))
					$("#pg_left_menu").slimscroll({"destroy":true}),$("#pg_left_menu").removeAttr("style")
				else
					$("#pg_left_menu").slimscroll({"isMenu":true}),
					$("#pg-left-menu-outer").find(".slimScrollDiv").height($("#pg-left-menu-outer").height() - 31)
				onWindowResize && onWindowResize.execute();
			});

			function goToPage(){
				var url = getUrl();
				if (urlArray.indexOf(url) == -1)
				{
		 			for (var i=0;i<menuDataArray.length;i++)
		 			{
		 				menuObj = menuDataArray[i];
		 				if (menuObj.children)
		 				{
			 				for (var j=0;j<menuObj.children.length;j++)
			 				{
			 					submenu = menuObj.children[j];

			 					if (submenu.href)
			 					{
			 						index_user_info.menuId = submenu.href;
			 						url = index_user_info.menuId.substr(1);
			 						break;
			 					}

			 					for (var k=0;k<submenu.children.length;k++)
			 					{
			 						subsubmenu = submenu.children[k];
			 						index_user_info.menuId = subsubmenu.href;
			 						url = index_user_info.menuId.substr(1);
			 						break;
			 					}
			 				}
		 				}
			 		}
			 		url = "/" + url;

					if (!index_is_IE9)
						window.history.pushState("","", "#/" + index_user_info.menuId.substr(1));
					else
						location.hash = "#/" + index_user_info.menuId.substr(1)
				}
				__menuRenderByMenuId(url)
				if (index_urlParamObj.hideMenu != "1")
				{
					index_menuShow();
				}
				
				//设置为透明并移出进场动画
				$("#content_div").css("opacity" ,"0");
				$("#content_div").removeClass("fadeInUp");			
				$.ajax({
					type: "GET",
					url: "module" + url + ".html",
					dataType: "html",
					success :function(data)
					{
						// 移除之前的绑定事件
						$("#pg-header").show();
						$("#pg_left_menu_ul").show();
						$("#pg-left-menu-outer").show();
						$("#pg-content").css("padding" ,"0 0 15px");
						$("#content_div").removeClass("appbgf");
						$("#content_div").addClass("contentbg");
						$("#content_div").css("padding" ,"0");
						$("#content_div").css("overflow-y" ,"auto");
						$("#content_div").css("overflow-x" ,"hidden");
						$("[class*=datetimepicker]").remove()
						$("[class*=select2-container]").remove()
						$(".inputdrop-content").remove()
						$(window).off('.module');
						$(document).off(".module");
						$(document).off(".fd");
						$("body").off(".inputdrop");
						$("body").off(".grid");
						$("body").off(".fd");
						$("#menu_right_oper_div").html("");
						onWindowResize && onWindowResize.remove();
						$(window).slimscroll({} ,true);
						$("#index_timer_inp").stopTime();
						// 渲染页面并添加进场动画
						$("#content_div").html(data);

						// IE9浏览器需要执行下面这句话
						if (index_is_IE9) 
						{
							$("#content_div").css("opacity" ,"1");
						}

						if (index_system_title)
							$("title").html(index_system_title)
						else
							$("title").html("亿慧云")
						// 清理定时器
						window.clearInterval(index_interval_1);
						window.clearInterval(index_interval_2);
						window.clearInterval(index_interval_3);
						window.clearInterval(index_interval_4);
						window.clearInterval(index_interval_5);
						window.clearInterval(index_interval_6);

						// 清除dialog
						$("[class*=um_mask]").remove();

						// 清除waiting
						$("[class*=umDialog-waiting]").remove();
						
						$("body").oneTime(100 ,function (){
							$("#content_div").addClass("fadeInUp");
						});

						// 动画结束了，再执行初始化方法
						$("body").oneTime(500 ,function (){
							createTitle()
							// 页面公共初始化方法
							index_init();
						});
					},
					error : function (){
						$("#pg-header").show();
						$("#pg_left_menu_ul").show();
						$("#pg-left-menu-outer").show();
					}
				});
			}
 		},
 	}

 	function __menuRenderByMenuId(menuId){
		var pathStr = pathMap.get(menuId)
		console.log(pathStr)
		if (pathStr && pathStr.split("/").length > 1){
			var current_li = $("[class=hor-ul]").find('li[menu_name="'+pathStr.split("/")[1]+'"]')
				$("[class=hor-ul]").find("li").removeClass("active");
			current_li.addClass("active");
			createMenu(current_li.attr("menu_id") ,"autoSelect" ,menuId);
		}
	}

	// 生成二级与三级
	function createMenu(menuId ,flag ,tmpMenu)
	{
		if ($("[menu_id="+menuId+"]").attr("menu_name") == "云资源监控")
			$("#menu_oc_sel").show()
		else
			$("#menu_oc_sel").hide()

		var el_pg_left_menu = $("#pg_left_menu");
		var el_pg_left_menu_ul = $("#pg_left_menu_ul");
		el_pg_left_menu_ul.hide();
		var secondMenuArray = menuIdMap.get(menuId).children;
		el_pg_left_menu_ul.html("");
		var buffer = [];
		for (var i = 0; i < secondMenuArray.length; i++) {
			if (secondMenuArray[i].showFlag == 0)
			{
				continue;
			}
			buffer.push('<li><a class="tran prel" href="#'+secondMenuArray[i].href+'"><i class="icon-png menu-icon '+secondMenuArray[i].icon+'" title="'+secondMenuArray[i].label+'"></i>');
			buffer.push('<span>'+secondMenuArray[i].label+'</span><i class="menu-sec-bg"></i>');
			if (secondMenuArray[i].children && secondMenuArray[i].children.length > 0)
			{
				buffer.push('<span class="fold-bold r"><i class="sec-menu-close"></i><i class="sec-menu-open" style="display:none"></i></span>');
			}
			buffer.push('</a>');
			if (secondMenuArray[i].children && secondMenuArray[i].children.length > 0)
			{
				buffer.push('<ul class="thd-menu-ul">');
				for (var j = 0; j < secondMenuArray[i].children.length; j++) {
					if (secondMenuArray[i].children[j].showFlag == 0)
 				{
 					continue;
 				}
					buffer.push('<li><a class="prel" href="#'+secondMenuArray[i].children[j].href+'"><i class="menu-icon-thd"></i>'+secondMenuArray[i].children[j].label+'<i class="menu-thd-bg"></i></a></li>');
				}
				buffer.push('</ul>');
			}
			buffer.push('</li>');
		}
		el_pg_left_menu_ul.append(buffer.join(""));

		// 菜单点击事件
		$("#pg_left_menu_ul > li > a").click(function (){
			var hasThdMenu = ($(this).parent().find("ul").size() > 0 ? true : false);
			// 选到带三级菜单的，应该只把也带三级菜单的隐藏掉
			if (hasThdMenu)
			{
				if ($(this).parent().hasClass("active"))
				{
					$(this).parent().removeClass("active");
				}
				else
				{
					$("#pg_left_menu_ul > li").each(function (){
					if ($(this).find("ul").size() > 0)
						$(this).removeClass("active");
					});
					$(this).parent().addClass("active1");
					$(this).parent().addClass("active");
				}
			}
			else
			{
				$("#pg_left_menu_ul > li").removeClass("active");
				$("#pg_left_menu_ul > li > ul > li").removeClass("active");
				$(this).parent().addClass("active");
			}
			if (hasThdMenu)
				return false;
			window.location = $(this).attr("href") + "?time=" + new Date().getTime();
			return false;
		});

		var el_thd_menu = el_pg_left_menu_ul.find("[class*=thd-menu-ul]");
		el_thd_menu.find("a").click(function (){
			$("#pg_left_menu_ul > li").each(function (){
				if ($(this).find("ul").size() == 0)
					$(this).removeClass("active");
			});
			el_thd_menu.find("li").removeClass("active");
			$(this).parent().addClass("active");
			window.location = $(this).attr("href") + "?time=" + new Date().getTime();
			return false;
		});

		if (index_urlParamObj.hideMenu != "1" && flag == "autoClick")
		{
			if ($("#pg_left_menu_ul > li:first > a").attr("href") == "#null")
			{
				$("#pg_left_menu_ul > li:first > a").click();
				$("#pg_left_menu_ul > li:first > ul > li:first > a").click();
				//window.location = $("#pg_left_menu_ul > li:first > ul > li:first > a").attr("href");
			}
			else
			{
				$("#pg_left_menu_ul > li:first > a").click();
				//window.location = $("#pg_left_menu_ul > li:first > a").attr("href");
			}
		}
		if (index_urlParamObj.hideMenu != "1" && flag == "autoSelect")
		{
			// 找到选中的二级或三级节点
			var tmp_url = getUrl();
			tmp_url?tmp_url:(tmp_url = tmpMenu)
			var tmp_li = $("#pg_left_menu_ul").find('[href="#'+tmp_url+'"]').parent();
			tmp_li.addClass("active");
			tmp_li.parent().closest("li").addClass("active thdActive");
		}

		$("#pg_left_menu").oneTime(100 ,function (){
			//$("#pg_left_menu").slimscroll({} ,true);
			//$("[class*=pg-left-menu-outer]").toggleClass("icon");
			if ($("[class*=pg-left-menu-outer]").hasClass("icon"))
				$("#pg_left_menu").slimscroll({"destroy":true}),$("#pg_left_menu").removeAttr("style")
			else
				$("#pg_left_menu").slimscroll({"destroy":true}),
				$("#pg_left_menu").slimscroll({"isMenu":true}),
				$("#pg-left-menu-outer").find(".slimScrollDiv").height($("#pg-left-menu-outer").height() - 31)
		})

    	createMenuWorkInit();
	}

	function createMenuWorkInit() {
        var el_pg_left_menu_ul = $("#pg_left_menu_ul");
        var as=el_pg_left_menu_ul.find(".fadeInLeft").find("a");
        var indexs=[];
        if(as&&as.length>0){
        	for(var i=0;i<as.length;i++){
        		try{
                    if($(as[i]).attr("href").indexOf("/workorder_handle/todo_work")>=0)
                    	indexs.push(i);
				}catch(e){}
			}
		}
		if(indexs.length>0){
            for(var i=0;i<indexs.length;i++){
                $(as[indexs[i]]).append("<span></span>");
            }
            um_ajax_post({
                url : "workflow/queryCurWorkItemData",
                paramObj:{pageSize:1},
                successCallBack : function (data){
                	var temp_count=0;
                	try{
                		temp_count=data[0].recordCount;
                		if(isNaN(temp_count))
                            temp_count=0;
					}catch(e){
                        temp_count=0;
					}
                	for(var i=0;i<indexs.length;i++){
                		$(as[indexs[i]]).find("span").text("("+temp_count+")");
					}
                }
            });
		}
    }

    function getUrl(){
		var url = window.location.hash.substr(1);
		var tmp = url.indexOf("?");
		if (tmp == -1)
		{
			return url;
		}
		else
		{
			return url.substr(0,tmp);
		}
	}

	// 生成标题label
	function createTitle()
	{
		var __f = $(".hor-ul").find("li.active").text()
		var el_s = $("#pg_left_menu_ul").children(".active")
		var __s = el_s.find("span").text()

		var el_nav = $(".ant-header").find(".__title")
		el_nav.empty()
		el_nav.append('<span>'+__f+'</span>')
		el_nav.append('<i class="ant-icon"></i>')
		el_nav.append('<span>'+__s+'</span>')

		if (el_s.find('ul').size() > 0)
			el_nav.append('<i class="ant-icon"></i>'),el_nav.append('<span>'+el_s.find("ul").find(".active").text()+'</span>')
		el_nav.css({"opacity":"1","transition": "all 0.2s"})
	}

	// 无权限提示
	function no_role_tip(){
		g_dialog.operateConfirm('<div>当前用户尚未配置菜单，请联系管理员配置。</div>' ,{
			title : "登录提示",
			width : "350px",
			saveclick : function (){
				window.location.href = "/login.html"
			},
			closeCbf : function (){
				window.location.href = "/login.html"
			}
		})
	}

 });