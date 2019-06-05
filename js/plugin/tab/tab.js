/** 
	插件名称  :  tab
	插件功能  :  标签页展示
*/
define(function (){
	return {
		tab : function (el ,opt){
			var oper = opt.oper;
			var index = 0;
			if (opt)
			{
				index = opt.index?opt.index:0;
			}
			el.find("ul[data-id=tab-ul]").find("li").click(function (){

				if ($(this).hasClass("active")){
					return false;
				}
				
				el.find("ul[data-id=tab-ul]").find("li").removeClass("active");
				$(this).addClass("active");

				el.find("div[class*=tab-pane]").removeClass("active");
				el.find("div[class*=tab-pane]").eq($(this).index()).addClass("active");

				if (oper && oper[$(this).index()])
				{
					oper[$(this).index()]();
				}
			});
			el.find("ul[data-id=tab-ul]").find("li").eq(index).click();
		}
	}
});