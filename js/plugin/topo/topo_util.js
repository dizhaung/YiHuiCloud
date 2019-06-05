define(['jtopo'],function (jtopo){
  //节点配置项
  var option = {
    'assetNode' : {
      imgurl : '/img/draw/newNode.svg',
      drag : false,
      dblclick : false,
      switch : false,
      click : true,
      monitorType : ['LINUX'],
      type : 'assetNode',
      name : '资产节点',
      tip : '点击添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'textNode' : {
      imgurl : '/img/draw/text.svg',
      drag : false,
      dblclick : false,
      switch : false,
      click : true,
      monitorType : ['LINUX'],
      type : 'textNode',
      name : '文字节点',
      tip : '点击添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'freeLine' : {
      imgurl : '/img/draw/newLink.svg',
      drag : false,
      dblclick : false,
      switch : false,
      click : true,
      monitorType : ['LINUX'],
      type : 'freeLine',
      name : '自由线段',
      tip : '点击添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'linkSwitch' : {
      imgurl : '/img/draw/newLink.svg',
      drag : false,
      dblclick : false,
      switch : false,
      click : true,
      monitorType : ['LINUX'],
      type : 'linkSwitch',
      name : '连线开关',
      tip : '开启/关闭连线状态',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'appSystem' : {
      imgurl : '/img/draw/appSystem.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'appSystem',
      name : '应用系统',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'os' : {
      imgurl : '/img/draw/os.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'os',
      name : '操作系统',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'middleware' : {
      imgurl : '/img/draw/middleware.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'middleware',
      name : '中间件',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'database' : {
      imgurl : '/img/draw/database.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'database',
      name : '数据库',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'netDevice' : {
      imgurl : '/img/draw/netDevice.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'netDevice',
      name : '网络设备',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'securityDevice' : {
      imgurl : '/img/draw/securityDevice.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'securityDevice',
      name : '安全设备',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'storeDevice' : {
      imgurl : '/img/draw/storeDevice.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'storeDevice',
      name : '存储设备',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'appsoftware' : {
      imgurl : '/img/draw/appsoftware.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'appsoftware',
      name : '应用软件',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'generalAgreement' : {
      imgurl : '/img/draw/generalAgreement.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'generalAgreement',
      name : '通用协议',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'vmware' : {
      imgurl : '/img/draw/vmware.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'vmware',
      name : '虚拟化',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'commonMonitor' : {
      imgurl : '/img/draw/commonMonitor.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'commonMonitor',
      name : '通用监控器',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'hardware' : {
      imgurl : '/img/draw/hardware.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'hardware',
      name : '硬件',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'loadBalancing' : {
      imgurl : '/img/draw/loadBalancing.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'loadBalancing',
      name : '负载均衡',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'securityEvent' : {
      imgurl : '/img/draw/securityEvent.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'securityEvent',
      name : '安全事件',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'linkEvent' : {
      imgurl : '/img/draw/linkEvent.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'linkEvent',
      name : '链路事件',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
    'topoM' : {
      imgurl : '/img/draw/topoM.svg',
      drag : true,
      dblclick : true,
      switch : false,
      click : false,
      monitorType : ['LINUX'],
      type : 'topoM',
      name : '拓扑模块',
      tip : '双击/拖拽添加',
      dragAction : function(){},
      dblclickAction : function(){},
      switchAction : function(){},
      clickAction : function(){}
    },
  };

  return {
    //获取对应类型的节点配置
    getNodeTypeOption : function (type){
      if(!type)
        return option;
      else
        return option[type];
    },
    //为对应类型（type）的节点对应的操作（operate）添加处理函数（fn）
    setAction : function (type,operate,fn){
      for(var i=0;i<operate.length;i++){
        fn[i]&&option[type]&&option[type][operate[i]+'Action']&&(option[type][operate[i]+'Action'] = fn[i])
      }
    },
    //用节点配置生成div对象，附带操作响应
    createNodeTypeItemDiv : function(option){
      var div = $('<div class="topo-tool-item" data-wenk="'+option.tip+'" data-wenk-pos="top" style="padding:0px;"><img src="" height="42px" width="42px"></img></div>');
      div.append('<span data-id="'+option.type+'" style="color:#fff;">'+ option.name +'</span>');
      div.data('option',option)
      div.find('img').prop('src',option.imgurl);
      if(option.dblclick){
        div.dblclick(option.dblclickAction);
      }
      if(option.drag){
        div.find('img').bind("dragstart",function (ev){
          return true;
        }).bind("dragend",option.dragAction);
      }
      if(option.switch){
        div.click(function (ev){
          var status = $(this).data('status');
          status = !status;
          $(this).data('status',status);
          if(status){
            $(this).css('background-color','#212121');
            canvas.on('mouseover.switch',option.switchAction);
          }else {
            $(this).css('background-color','');
            canvas.off('.switch');
          }
        });
      }
      if(option.click){
        div.click(option.clickAction);
      }
      return div;
    },
    getSquareBox : function(nodes){
      var  box = {padding : 20};
      JTopo.layout.AutoBoundLayout()(box,nodes);
      return box;
    },
    guid : function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },
    objToArray:function(obj){
      if(!(obj instanceof Array)){
        var temp = obj;
        obj = new Array();
        obj.push(temp);
      }
      return obj;
    },
    queryNode : function (scene,canvas,queryFun){
      var that = this;
      $.ajax({
        type : "GET",
        url : "tpl/node/node_tpl.html",
        success : function (data){
          g_dialog.dialog($(data).find("[id=query]"),{
            width:"400px",
            title:"查询节点",
            init:init,
            saveclick:save_click
          });
          function init(el){

          }
          function save_click(el,saveObj){
            scene.cancleAllSelected();
            var nodes;
            queryFun ? (nodes = scene.findElements(function (node){
              return queryFun(node,saveObj)
            })) :
            (nodes = scene.findElements(function (node){
              if(node.name.indexOf(saveObj.name) != -1){
                return true;
              }else {
                return false;
              }
            }));
            if(nodes.length == 0){
              g_dialog.operateAlert(null,'未查询到匹配节点','error');
            }else {
              for(var i=0;i<nodes.length;i++){
                nodes[i].selected = true;
                scene.addToSelected(nodes[i]);
              }
              var box = that.getSquareBox(nodes);
              var x = box.x;
              var y = box.y;
              var sx = canvas.width/2;
              var sy = canvas.height/2;
              scene.translateX = 0-x+sx;
              scene.translateY = 0-y+sy;
            }

            g_dialog.hide(el);
          }
        }
      });
    },
    alignFunction : function(type,scene){
      var nodes = scene.selectedElements;
      var left = 0;
      var right = 0;
      var up = 0;
      var down = 0;

      for(var i=0;i<nodes.length;i++){
        if(left == 0 || left > nodes[i].x){
          left = nodes[i].x;
        }
        if(right == 0 || right < nodes[i].x){
          right = nodes[i].x;
        }
        if(up == 0 || up > nodes[i].y){
          up = nodes[i].y;
        }
        if(down == 0 || down < nodes[i].y){
          down = nodes[i].y;
        }
      }
      for(var i=0;i<nodes.length;i++){

        if(type == "left"){
          nodes[i].x = left;
        }
        else if(type == "right"){
          nodes[i].x = right;
        }
        else if(type == "up"){
          nodes[i].y = up;
        }
        else if(type == "down"){
          nodes[i].y = down;
        }
      }
    }
  }
});