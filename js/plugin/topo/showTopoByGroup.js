define([index_web_app_name + 'js/plugin/topo/topo.js'],function (topo){
	function render(el,ids,olel){

		for(var i=0;i<ids.length;i++){
			var canvasId = createDom(el,i);
			var topoId = ids[i];
			topo.initBigScreenShowByTopoId(topoId,canvasId);
			var li;
			if(i==0){
				li = '<li data-target="#myCarousel" data-slide-to="'+i+'" class="active"></li>';
			}else {
				li = '<li data-target="#myCarousel" data-slide-to="'+i+'" ></li>';
			}
			olel.append(li);
		}
	}

	function createDom(el,i){
		var canvasId = 'topo_canvas_' + Math.floor(Math.random()*1000);
		var html = $('<div class="w-all h-all item" style="" id="" data-page="'+canvasId+'">\
		<canvas id="'+canvasId+'" width="800px" height="600px">\
		\
		</canvas>\
		</div>');
		el.append(html);
		if(i==0){
			html.addClass('active');
		}
		return canvasId;
	}

	return {
		render : render
	}
})