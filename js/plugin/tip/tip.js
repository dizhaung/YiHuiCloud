/** 
	插件名称 : tip
	功能描述 : 鼠标移入或点击时的提示信息 
*/
define(function (){

	return {
		tip : function(el ,option){
			var tis = this;
			var default_opt = {};
			var opt = $.extend(default_opt ,option);
			var tpl = opt.tpl;
			var default_css = {
				'width':"400px",
				'height':"100%",
				'position':'absolute',
				'background':'rgba(255,255,255,0.97)',
				'padding':'10px',
				'top':"100px",
				'right':'0',
				'z-index':"99999",
				'border-radius':'3px',
				'border':'1px solid rgba(0,0,0,0.6)',
				'-webkit-box-shadow':'3px 3px 5px 5px rgba(0,0,0,0.3)',
				'-moz-box-shadow':'3px 3px 5px 5px rgba(0,0,0,0.3)',
				'-ms-box-shadow':'3px 3px 5px 5px rgba(0,0,0,0.3)',
				'-o-box-shadow':'3px 3px 5px 5px rgba(0,0,0,0.3)',
				'box-shadow':'3px 3px 5px 5px rgba(0,0,0,0.3)',
				'animation':'plugin_tip_slide_to_left 1s',
				'overflow-x':'hidden',
				'overflow-y':'auto'
			};
			var tpl_css = $.extend(default_css ,opt.css);
			tpl.css(tpl_css);
			
			// tis.render(tpl,opt.tipData);
			$("[data-name=tpl]") && tis.hideTip();
			$("body").append(tpl);
			$("[data-name=tpl]").show();
			opt.successCallBack && opt.successCallBack();
			return false;
		},
		hideTip : function(){
			$("[data-name=tpl]").remove();
		},
		render : function(tpl,data){
			var tis = this;
			tpl.umDataBind("render" ,data);
			return false;
		}
	};

});