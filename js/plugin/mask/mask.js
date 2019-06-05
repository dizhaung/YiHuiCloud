/** 
	插件名称  :  mask
	插件功能  :  遮罩
*/
define(function (){

	var el;

	return {
		show:function (cbf){

			el = $('body');

			var buffer = [];
			var mask_id = "mask" + new Date().getTime();
			buffer.push('<div  id="'+mask_id+'" class="um_mask"></div>');
			el.append(buffer.join(""));

			el.find("[id="+mask_id+"]").animate(
				{"background-color": "rgba(0, 0, 0, 0.2)"},
				300, function() {
					if (cbf)
					{
						cbf(el.find("[id="+mask_id+"]"));
					}
			});
		},
		hide:function (maskEl){
			maskEl.remove();
		},
		get:function (){
			return el.find('div[class*=um_mask]').eq(el.find('div[class*=um_mask]').size()-1);
		},
		waiting:function (){
			el = $('body');

			if (el.find("[class*=um_mask]").size() == 0)
			{
				var buffer = [];
				buffer.push('<div data-id="um_mask_waiting" class="um_mask animated umMaskfadeIn" style="display:block"></div>');

				el.append(buffer.join(""));
			}
		},
		mask:function (el){
			if (el.children("[class=mask]").size() > 0)
			{
				return false;
			}
			if (!el.hasClass("prel"))
			{
				el.addClass("prel");
			}
			el.append('<div class="mask"></div>');
		},
		maskRemove:function (el){
			el.children("[class=mask]").remove();
		}
	}
});