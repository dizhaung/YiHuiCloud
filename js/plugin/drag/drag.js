define(function (){

	return{
		drag : function (el ,opt){
			var default_opt = {
				num_per_row : 2
			};
			var opt = $.extend(default_opt ,opt);
			$("[class*=grid-drable-head]").mousedown(function (e){
				var $parent_drag_div;
				var $drag_div;
				var _x;
				var _y;
				var difference_x;
				var difference_y;
				var num_per_row = opt.num_per_row;
				var unit_current = $(this).closest("[class*=grid-drable-div]");
				var unit_current_parent = unit_current.parent();
				var unit_width = unit_current.width() + 30;
				var unit_height = unit_current.height() + 20;
				var $unit_list = unit_current.closest("[data-id=grid-drable-row]").find("[class*=grid-drable-div]");
				var unit_num = $unit_list.size();
				var unit_index = unit_current.closest("[class*=col-md]").index();

				unit_current.css("opacity" ,"0.5");
				unit_current.css("z-index" ,"2000");

				_x = e.pageX;
				_y = e.pageY;

				$(document).on('mousemove.rc' ,function (e){
					difference_x = e.pageX - _x;
					difference_y = e.pageY - _y;

					unit_current.css("left" ,difference_x);
					unit_current.css("top" ,difference_y);
				});

				$(document).one('mouseup' ,function (e){
					$(document).off('mousemove.rc');

					var x_index = Math.round(difference_x/unit_width);
					var y_index = Math.round(difference_y/unit_height);

					if (!x_index && !y_index)
					{
						unit_current.css("left" , 0);
						unit_current.css("top" , 0);
						unit_current.css("opacity" ,"1");
						unit_current.css("z-index" ,"1");
						return;
					}

					var target_index = unit_index + x_index + y_index*num_per_row;

					var target_unit = $unit_list.eq(target_index);

					var target_unit_parent = $unit_list.eq(target_index).parent();

					// 载入动画
					unit_current.css("left" , 0);
					unit_current.css("top" , "10px");
					unit_current.css("opacity" ,"0.5");
					unit_current.css("z-index" ,"1");

					target_unit_parent.append(unit_current);
					unit_current.animate({
						"opacity": 1,
						"top": 0},
						"slow", function() {
						/* stuff to do after animation is complete */
					});

					// 载入动画
					target_unit.css("left" , "30px");
					target_unit.css("top" , 0);
					target_unit.css("opacity" ,0);
					unit_current_parent.append(target_unit);
					target_unit.animate({
						"opacity": 1,
						"left": 0},
						"slow", function() {
						/* stuff to do after animation is complete */
					});
				
				});
			});
		},
		ulDrag : function (el ,opt){
			var default_opt = {
				num_per_row : 1
			};
			var opt = $.extend(default_opt ,opt);
			el.find("ul").each(function (){
				$(this).wrap('<div></div>');
			});
			el.find("ul").mousedown(function (e){
				var el_ul = $(this);
				var $parent_drag_div;
				var $drag_div;
				var _x;
				var _y;
				var difference_x;
				var difference_y;
				var num_per_row = opt.num_per_row;

				var unit_current_parent = el_ul.parent();

				var $unit_list = el.find("ul");
				var unit_num = el.find("ul").size();
				var unit_index = el_ul.parent().index();

				var unit_width = el_ul.width();
				var unit_height = el_ul.height() + 10;

				el_ul.css("opacity" ,"0.5");
				el_ul.css("z-index" ,"2000");

				_x = e.pageX;
				_y = e.pageY;

				$(document).on('mousemove.rc' ,function (e){
					difference_x = e.pageX - _x;
					difference_y = e.pageY - _y;

					el_ul.css("top" ,difference_y);
				});

				$(document).one('mouseup' ,function (e){
					$(document).off('mousemove.rc');
					var x_index = Math.round(difference_x/unit_width);
					var y_index = Math.round(difference_y/unit_height);

					if (!x_index && !y_index)
					{
						el_ul.css("top" , 0);
						el_ul.css("opacity" ,"1");
						el_ul.css("z-index" ,"1");
						return;
					}

					var target_index = unit_index + x_index + y_index*num_per_row;

					var target_unit = $unit_list.eq(target_index);

					var target_unit_parent = $unit_list.eq(target_index).parent();

					// 载入动画
					el_ul.css("top" , "10px");
					el_ul.css("opacity" ,"0.5");
					el_ul.css("z-index" ,"1");

					target_unit_parent.append(el_ul);
					el_ul.animate({
						"opacity": 1,
						"top": 0},
						"fast", function() {
					});

					// 载入动画
					target_unit.css("top" , 0);
					target_unit.css("opacity" ,0);
					unit_current_parent.append(target_unit);
					target_unit.animate({
						"opacity": 1,
						"left": 0},
						"fast", function() {
					});
				});
			});
		},
		scrollTop : function (el){
			var flag = true;
			$("body").append('<div id="scrollDiv" class="pabs animated fadeIn icon-png oper-goTop"style="width:50px;height:50px;right:26px;bottom:30px;display:none"></div>');
			el.on('scroll',function(){
				if (flag)
				{
					el.oneTime(300 ,function (){
				    	flag = true;
				    	if (el.scrollTop() < 50)
				    	{
				    		$("#scrollDiv").hide();
				    		$("#monitor_quota_div").append($("#monitor_quota_info_div"));
				    		$("#monitor_quota_info_div").removeAttr("style");
				    		$("#monitor_quota_info_div").addClass("monitor_quota_info_div");
				    		$("#monitor_quota_info_outer_div").removeClass("prel w-all h-all");
				    		$("#monitor_quota_info_outer_div").removeAttr("style");
				    	}
				    	else
				    	{
				    		$("#scrollDiv").show();
				    		$("body").append($("#monitor_quota_info_div"));
				    		$("#monitor_quota_info_div").removeClass("monitor_quota_info_div");
				    		$("#monitor_quota_info_div").css("position" ,"absolute");
				    		$("#monitor_quota_info_div").css("width" ,"210px");
				    		$("#monitor_quota_info_div").css("top" ,"50px");
				    		$("#monitor_quota_info_div").css("bottom" ,"15px");
				    		$("#monitor_quota_info_div").css("left" ,"10px");
				    		$("#monitor_quota_info_outer_div").addClass("prel w-all h-all");
				    		$("#monitor_quota_info_outer_div").css("overflow-y" ,"auto");
				    	}
				    });
				    flag = false;
				}
			});
			$("#scrollDiv").click(function (){
				el.animate({scrollTop:"0px"} ,500 ,function(){});
			});
		},
		customDrag : function (dragEl,moveEl ,opt){
			var default_opt = {
				num_per_row : 2
			};
			var opt = $.extend(default_opt ,opt);
			
			$(dragEl).mousedown(function (e){
				var $parent_drag_div;
				var $drag_div;
				var _x;
				var _y;
				var difference_x;
				var difference_y;
				var unit_current = $(moveEl);

				// unit_current.css("opacity" ,"0.5");
				// unit_current.css("z-index" ,"2000");
				var _left = parseInt(moveEl.css("left"));
				var _right = parseInt(moveEl.css("right"));
				var _top = parseInt(moveEl.css("top"));

				_x = e.pageX;
				_y = e.pageY;

				$(document).on('mousemove.rc' ,function (e){
					difference_x = e.pageX - _x;
					difference_y = e.pageY - _y;

					if(_left){
						unit_current.css("left" ,difference_x+_left);
					}else if(_right){
						unit_current.css("right" ,_right-difference_x);
					}else {
						unit_current.css("left" ,difference_x);
					}
					if(_top){
						unit_current.css("top" ,difference_y+_top);
					}else {
						unit_current.css("top" ,difference_y);
					}
				});

				$(document).one('mouseup' ,function (e){
					$(document).off('mousemove.rc');
				
				});
			});
		}
	}

});