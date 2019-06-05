/** 
	插件名称 : ABPanel
	功能描述 : 提供A-B面板进行左右选项的拖动
	参数     : 
				left_data  : 数组，允许的对象类型 {text:1,value:1}
				right_data : 同上
	示例     :  abPanel.render(el ,{
					left_data  : [{text:1,value:1}],
					right_data : [{text:1,value:1}]
				})
*/

define(function (){

	var default_opt = {
				left_data : [],
				right_data : []
			}

	return {
		render : function (el ,option){
			var opt = $.extend({} ,default_opt ,option);

			var left_data = opt.left_data;
			var right_data = opt.right_data;

			$.ajax({
				type: "GET",
				url: "js/plugin/ABPanel/abPanel.html",
				success :function(data)
				{
					var abEl = $(data);

					// 渲染数据
					for (var i=0;i<left_data.length;i++)
					{
						abEl.find("[id=sortable1]").append('<li data-value="'+left_data[i].value
																+'">'+left_data[i].text+'</li>');
					}

					for (var i=0;i<right_data.length;i++)
					{
						// abEl.find("[id=sortable2]").append('<li data-value="'+right_data[i].value
						// 										+'">'+right_data[i].text+'<i data-type="position" data-val="down" class="pabs icon-arrow-down" style="right:5px;top:6px;opacity:0.6;display:none"></i>'
						// 										+'<i data-type="position" data-val="top" class="pabs icon-arrow-up" style="right:20px;top:6px;opacity:0.6;display:none"></i></li>');
						abEl.find("[id=sortable2]").append('<li data-value="'+right_data[i].value
																+'">'+right_data[i].text+'</li>');
					}

					el.append(abEl);

					abEl.find("[id=sortable2]").find("li").each(function (){
						$(this).mouseover(function (){
							$(this).find("[data-type=position]").show();
						}).mouseout(function (){
							$(this).find("[data-type=position]").hide();
						});
					});

					abEl.find("[id=sortable2]").find("[data-type=position]").click(function (){
						if ($(this).attr("data-val") == "down")
						{
							var liObj = $(this).closest("li");
							liObj.next().after(liObj);
						}
						else
						{
							var liObj = $(this).closest("li");
							liObj.prev().before(liObj);
						}
						return false;
					});

					// abEl.find("[data-id*=table]").find("li").click(function (){
					// 	$(this).toggleClass("active");
					// });

					abEl.find("[data-id*=table]").on('click' ,"li" ,function (){
						$(this).toggleClass("active");
					})

					var table_left = abEl.find("[data-id=table_left]");
					var table_right = abEl.find("[data-id=table_right]");

					abEl.find('[id=right_btn]').click(function (){
						table_left.find("li[class*=active]").each(function (){
							//table_right.append($(this));
							table_right.html(table_right.html() + '<li data-value="'+$(this).attr("data-value")+'">'+$(this).html()+'</li>')
							$(this).toggleClass("active");
							$(this).remove();
						});
					});

					abEl.find('[id=left_btn]').click(function (){
						table_right.find("li[class*=active]").each(function (){
							table_left.append($(this));
							$(this).toggleClass("active");
						});
					});
				}
			});
		},
		getValue : function (el){
			var buffer = [];
			el.find("[data-id=table_right]").find("li").each(function (){
				buffer.push($(this).attr("data-value"));
			});
			return buffer;
		}
	}
});