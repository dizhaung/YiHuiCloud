/** 
	插件名称  :  tree
	插件功能  :  树形结构
	参数      :  {
					zNodes : [],
					pId : "",
					label : "",
					zTreeOnClick : function (){},
					onDrop : function (){},
					edit : true/false,
					dragable : true/false,
					chk : true/false,
					expand : true/false,
					showRemoveBtn : true/false,
					showAddBtn : true/false,
					zTreeOnAdd : function (){},
					dropPrev : function (){},
					dropNext : function (){},
					dropInner : function (){},
					beforeRemove : function(treeId, treeNode){},
					onRemove : function (event, treeId, treeNode, isCancel){}
				 }
*/
define(["ztree.core",
		"css!/js/lib/ztree/css/metroStyle.css"] ,function(){

	return{
		render:function (el ,opt){
			var zNodes = opt.zNodes;
	        var setting = {
	            data: {
	                simpleData: {
	                    enable: true
	                },
	                key: {}
	            },
	            edit: {
	            	drag: {
						autoExpandTrigger: false,
						prev: dropPrev,
						inner: dropInner,
						next: dropNext
					},
	                enable: false,
	                showRemoveBtn: false,
					showRenameBtn: false
	            },
				callback: {
					onClick: opt.zTreeOnClick,
					beforeDrag: beforeDrag,
					beforeDrop: beforeDrop,
					beforeDragOpen: beforeDragOpen,
					beforeRemove: opt.beforeRemove,
					beforeExpand: opt.beforeExpand,
					onDrag: onDrag,
					onDrop: onDrop,
					onRemove: opt.onRemove,
					onCheck: opt.zTreeOnCheck,
					beforeEditName: opt.beforeEditName
				},
				view: {
					showTitle : true
				},
				check: {
						enable: false,
				}
			};
			if (opt.edit)
			{
				setting.edit.enable = true;
			}
			if (opt.hideTitle)
			{
				setting.view.showTitle = false;
			}
			if (opt.chk)
			{
				setting.check.enable = true;
			}

			if (opt.showRemoveBtn)
			{
				setting.edit.showRemoveBtn = opt.showRemoveBtn;
			}

			if (opt.showRenameBtn)
			{
				setting.edit.showRenameBtn = opt.showRenameBtn;
			}

			if (opt.showAddBtn)
			{
				setting.view = {
									addHoverDom: addHoverDom,
									removeHoverDom: removeHoverDom
								}
			}

			if (opt.titleKey)
				setting.data.key = {title : opt.titleKey}

			var parentIdStr = (opt.pId == undefined ? "parentID" : opt.pId);
			var labelStr = (opt.label == undefined ? "label" : opt.label);
			var idStr = (opt.id == undefined ? "id" : opt.id);
			for (var i=0;i<zNodes.length;i++)
			{
				zNodes[i].pId = zNodes[i][parentIdStr];
				zNodes[i].parentID = zNodes[i][parentIdStr];
				zNodes[i].name = zNodes[i][labelStr];
				zNodes[i].id = zNodes[i][idStr];
			}

			var tree = $.fn.zTree.init(el, setting, zNodes);

			// 默认展开节点id
			if (opt.expandNode)
			{
				var nodes = tree.getNodesByParam("id",opt.expandNode, null);
				tree.expandNode(nodes[0] ,true ,false);
			}

			el.data("tree" ,tree);

			// 默认选中节点
			if (opt.selectNode)
			{
				this.selectNode(el ,{key:"id" ,value:opt.selectNode});
			}

			if (opt.expand)
			{
				tree.expandAll(true);
			}

			var log, className = "dark", curDragNodes, autoExpandNode;
			function beforeDrag(treeId, treeNodes) {
				className = (className === "dark" ? "":"dark");
				for (var i=0,l=treeNodes.length; i<l; i++) {
					if (treeNodes[i].drag === false) {
						curDragNodes = null;
						return false;
					} else if (treeNodes[i].parentTId && treeNodes[i].getParentNode().childDrag === false) {
						curDragNodes = null;
						return false;
					}
				}
				curDragNodes = treeNodes;
				return true;
			}

			function beforeDrop(treeId, treeNodes, targetNode, moveType) {
				opt.beforeDrop(treeId, treeNodes, targetNode, moveType);
				return targetNode ? targetNode.drop !== false : true;
			}

			function addHoverDom(treeId, treeNode) {
				var aObj = $("#" + treeNode.tId + "_a");
				if ($("#diyBtn_"+treeNode.id).length>0) return;
				var editStr = "<span type='button' class='button add' id='diyBtn_" + treeNode.id
					+ "' title='新建' onfocus='this.blur();'></span>";
				aObj.append(editStr);
				var btn = $("#diyBtn_"+treeNode.id);
				if (btn)
				{
					btn.bind("click" ,function (){
						opt.zTreeOnAdd(treeId, treeNode);
					})
				}
			}
			function removeHoverDom(treeId, treeNode) {
				$("#diyBtn_"+treeNode.id).unbind().remove();
				$("#diyBtn_space_" +treeNode.id).unbind().remove();
			}
			function dropPrev(treeId, nodes, targetNode) {
				if (opt.dropPrev)
				{
					return opt.dropPrev(treeId, nodes, targetNode);
				}
				else
				{
					return true;
				}
				
			}
			function dropInner(treeId, nodes, targetNode) {
				if ((targetNode && targetNode.dropInner === false) 
						|| (targetNode && targetNode.location != null && targetNode.location != "")) {
					return false;
				} else {
					for (var i=0,l=curDragNodes.length; i<l; i++) {
						if (!targetNode && curDragNodes[i].dropRoot === false) {
							return false;
						} else if (curDragNodes[i].parentTId && curDragNodes[i].getParentNode() !== targetNode && curDragNodes[i].getParentNode().childOuter === false) {
							return false;
						}
					}
				}
				return true;
			}
			function dropNext(treeId, nodes, targetNode) {
				if (opt.dropNext)
				{
					return opt.dropNext(treeId, nodes, targetNode);
				}
				else
				{
					return true;
				}
			}

			function beforeDragOpen(treeId, treeNode) {
				autoExpandNode = treeNode;
				return true;
			}

			function onDrag(event, treeId, treeNodes) {
				className = (className === "dark" ? "":"dark");
				opt.onDrag && opt.onDrag(event, treeId, treeNodes);
			}
			function onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
				className = (className === "dark" ? "":"dark");	
				opt.onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy);
			}
		},
		renderCheck:function (el ,opt){
			var zNodes = opt.zNodes;
	        var setting = {
	            data: {
	                simpleData: {
	                    enable: true
	                }
	            },
	            edit: {
	                enable: false
	            },
				callback: {
					onCheck: zTreeOnCheck,
					onClick: zTreeOnClick,
					beforeRemove: opt.beforeRemove
				},
				check: {
						enable: false,
						chkStyle: "checkbox",
						chkboxType: { "Y": "ps", "N": "ps" }
				}
	        };

	        if (opt.enableChk)
	        {
	        	setting.check.enable = true;
	        }

	        if (opt.enableEdit)
	        {
	        	setting.edit.enable = true
	        	setting.edit.showRenameBtn = false
	        }

	        if (opt.chkboxType)
	        {
	        	setting.check.chkboxType = opt.chkboxType;
	        }

	        var parentIdStr = (opt.pId == undefined ? "parentID" : opt.pId);
			var labelStr = (opt.label == undefined ? "label" : opt.label);
			var idStr = (opt.id == undefined ? "id" : opt.id);

			for (var i=0;i<zNodes.length;i++)
			{
				zNodes[i].pId = zNodes[i][parentIdStr];
				zNodes[i].parentID = zNodes[i][parentIdStr];
				zNodes[i].name = zNodes[i][labelStr];
				zNodes[i].label = zNodes[i][labelStr];
				zNodes[i].id = zNodes[i][idStr];
			}

			var tree = $.fn.zTree.init(el, setting, zNodes);
			el.data("tree" ,tree);

			function zTreeOnClick(event, treeId, treeNode)
	        {
	        	if (opt.enableChk){
	        		return false;
	        	}
	        	if (treeNode.id == "roota")
	        	{
	        		return false;
	        	}
	        	if (opt.noSelectVal && opt.noSelectVal == "first-child" && (treeNode.parentID == "roota" || treeNode.parentId == "-1") )
	        	{
	        		return false;
	        	}
	        	if (opt.onlyLastChild && treeNode.children)
	        	{
	        		return false;
	        	}
				var treeObj = $.fn.zTree.getZTreeObj(treeId);
				opt.inpDiv.val(treeNode.name);
				opt.inpHiddenDiv.val(treeNode.id);
				opt.inpDiv.parent().find("[data-id=content]").hide();
				g_validate.clear([opt.inpDiv]);
				opt.treeClick && opt.treeClick(event, treeId, treeNode);
	        }

			function zTreeOnCheck(event, treeId, treeNode) {
				var treeObj = $.fn.zTree.getZTreeObj(treeId);
				//var nodes = treeObj.getNodes();
				var nodes = treeObj.transformToArray(treeObj.getNodes());
				var node;
				var inpVal = "";
				var inpHiddenVal = "";
				opt.inpDiv.val("");
				opt.inpHiddenDiv.val("");
				for (var i=0;i<nodes.length;i++)
				{
					node = nodes[i];
					if (!node.checked)
						continue
					if (setting.check.chkboxType.Y == "ps" && setting.check.chkboxType.N == "ps")
					{
						if (opt.allowCheckAll){
							if (node.label != "全部")
							{
								inpVal = (inpVal + "," + node.name);
								inpHiddenVal = (inpHiddenVal + "," + node.id);
							}
						}
						else{
							if (!node.isParent)
							{
								inpVal = (inpVal + "," + node.name);
								inpHiddenVal = (inpHiddenVal + "," + node.id);
							}
						}	
					}
					else
					{
						inpVal = (inpVal + "," + node.name);
						inpHiddenVal = (inpHiddenVal + "," + node.id);
					}
					opt.inpDiv.val(inpVal.substr(1));
					opt.inpHiddenDiv.val(inpHiddenVal.substr(1));
					g_validate.clear([opt.inpDiv]);
				}
				opt.aCheckCb && opt.aCheckCb(event, treeId, treeNode);
			}
		},
		setCheck : function (el ,nodeIdStr){
			var tree = el.data("tree");
			var nodeIdList = nodeIdStr.split(",");
			var node;
			var buffer = [];
			for (var i = 0; i < nodeIdList.length; i++) {
				node = tree.getNodeByParam("id", nodeIdList[i], null);
				tree.checkNode(node, true, true);
				buffer.push(node.label);
			};
			return buffer;
		},
		selectNode : function (el ,opt){
			var treeObj = el.data("tree");
			var nodes = treeObj.getSelectedNodes();
			if (nodes.length>0) 
			{
				treeObj.cancelSelectedNode(nodes[0]);
			}
			var nodes = treeObj.getNodesByParam(opt.key ,opt.value); 
			if(nodes.length>0)
			{
				treeObj.selectNode(nodes[0]);
			}
			return nodes[0];
		},
		removeNode : function (el ,nodeIdStr){
			var tree = el.data("tree");
			var nodeIdList = nodeIdStr.split(",");
			var node;
			var buffer = [];
			for (var i = 0; i < nodeIdList.length; i++) {
				node = tree.getNodeByParam("id", nodeIdList[i], null);
				tree.removeNode(node);
			};
		},
		expandSpecifyNode : function (el ,nodeIdStr){
			var tree = el.data("tree");
			var nodeIdList = nodeIdStr.split(",");
			var nodeId;
			var nodes;
			for (var i = 0; i < nodeIdList.length; i++) {
				nodeId = nodeIdList[i]
				var nodes = tree.getNodesByParam("id",nodeId, null);
				tree.expandNode(nodes[0] ,true ,false);
			}
		}
	}
});