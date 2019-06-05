define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js',
	    '/js/plugin/asset/asset.js',
	    '/js/plugin/tree/tree.js'] ,function (monitorInfo, plot, asset ,tree){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/storage/hwoceanstor/queryHwoceanStorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
		            $("#asset_info_monitor_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		// 存储信息
		storge_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/storage/hwoceanstor/queryHwOceanStorage",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	console.log(data);
		        	$("#storge_info_monitor_div").umDataBind("render" ,data);
		        }
		    });
		},
		// 机柜树
		cabinet_tree : function (paramObj){
		
			paramObj.type = -1
		
			um_ajax_get({
				url : "monitorview/storage/hwoceanstor/queryHwStoreEnclosureTree",
				paramObj : paramObj,
				isLoad : false,
				successCallBack : function (data){
					var _tmp_data = []
					for (var i = 0; i < data.length; i++) {
						if (data[i].isLeaf == 0)
							_tmp_data.push({id:"1a" + i ,pId : data[i].id ,label:"."})
					}
					var data = data.concat(_tmp_data);
					tree.render($("#cabinet_tree") ,{
						zNodes : data,
						pId : "pId",
						beforeExpand : function (treeId, treeNode){
							paramObj.type = treeNode.type
							paramObj.pId = treeNode.pId?treeNode.pId:"-1"
							paramObj.searchId = treeNode.searchId							
							paramObj.id = treeNode.id
							um_ajax_get({
								url : "monitorview/storage/hwoceanstor/queryHwStoreEnclosureTree",
								paramObj : paramObj,
								isLoad : false,
								successCallBack : function (data_1){
									var _tmp_data = []
									for (var i = 0; i < data_1.length; i++) {
										data_1[i].name = data_1[i].label
										if (data_1[i].isLeaf == 0)
											_tmp_data.push({id:"1aa" + i ,pId : data_1[i].id ,label:"."})
									}
									var data_1 = data_1.concat(_tmp_data);
									$("#cabinet_tree").data("tree").removeChildNodes(treeNode)
									$("#cabinet_tree").data("tree").addNodes(treeNode, data_1)
								}
							})
							return false
						},
						zTreeOnClick:init_table
					})
				}
			})

           
			function init_table(event, treeId, treeNode)
			{
			
			  
			    paramObj.searchId =treeNode.searchId;
				if(treeNode.getParentNode()==null)
				{
					
					if(treeNode.type=="24")
					{

						var  diskHeader=[
				                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"diskLocation",align:"left",vertical:"top",width:10},	
							    {text:'容量',name:"diskCapacity",align:"left",vertical:"top",width:10},	
							    {text:'类型',name:"diskType",align:"left",vertical:"top",width:10},	
							    {text:'使用率',name:"diskCapacityUsage",align:"left",vertical:"top",width:10},	
							    {text:'角色',name:"diskRole",align:"left",vertical:"top",width:10},	
							    {text:'健康状态',name:"diskHealthStatus",align:"left",vertical:"top",width:10},	
							    {text:'运行状态',name:"diskRunningStatus",align:"left",vertical:"top",width:10},	
							    {text:'条码',name:"diskBarCode",align:"left",vertical:"top",width:10},	
				         ];

						 g_grid.render($("#table_div1"),{
							 header:diskHeader,
							 paramObj:paramObj,
							 url:"monitorview/storage/hwoceanstor/queryHwStoreDisk",
							 hideSearch: true,
							 allowCheckBox:false,		
							 isLoad : true,
							 maskObj:$("#table_div1")
						    });
					 }
					 if(treeNode.type=="24")
					 {

					 }

				}else
				{


                   var powerHeader=[
                                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"powerLocation",align:"left",vertical:"top",width:8},								   
							    {text:'健康状态',name:"powerHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"powerRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'类型',name:"powerType",align:"left",vertical:"top",width:10},	
							    {text:'SN',name:"powerSerialNumber",align:"left",vertical:"top",width:14},
							    {text:'制造商',name:"powerManufacturer",align:"left",vertical:"top",width:10},
							    {text:'生产日期',name:"powerProduceDate",align:"left",vertical:"top",width:10},
							    {text:'版本',name:"powerVersion",align:"left",vertical:"top",width:10},
                   ];
                   var powerUrl="monitorview/storage/hwoceanstor/queryHwStorePower";
                   var fanHeader=[
                                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"fanLocation",align:"left",vertical:"top",width:20},								   
							    {text:'健康状态',name:"fanHealthStatus",align:"left",vertical:"top",width:20},	
							    {text:'运行状态',name:"fanRuningStatus",align:"left",vertical:"top",width:20},
							    {text:'等级',name:"fanRunningLevel",align:"left",vertical:"top",width:20},	
							 
                   ];
                   var fanUrl="monitorview/storage/hwoceanstor/queryHwStoreFan";
                 
                   var bbuHeader =[
                                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"buuLocation",align:"left",vertical:"top",width:8},								   
							    {text:'健康状态',name:"buuHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"buuRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'类型',name:"buuType",align:"left",vertical:"top",width:10},	
							    {text:'放电次数',name:"buuNumberofdischarges",align:"left",vertical:"top",width:10},	
							    {text:'固件版本',name:"buuFirmwareVersion",align:"left",vertical:"top",width:10},	
							    {text:'所属控器',name:"buuOwningController",align:"left",vertical:"top",width:14},
							    {text:'出厂日期',name:"buuDeliveredon",align:"left",vertical:"top",width:10},
							    {text:'电子标签',name:"buuElectronicLabel",align:"left",vertical:"top",width:20},							  
							 
                   ];
                   var bbuUrl="monitorview/storage/hwoceanstor/queryHwStoreBBU";


                   var sasHeader =[
                                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"portsasLocation",align:"left",vertical:"top",width:8},								   
							    {text:'健康状态',name:"portsasHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"portsasRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'类型',name:"portsasType",align:"left",vertical:"top",width:10},	
							    {text:'工作速率',name:"portsasWorkingRate",align:"left",vertical:"top",width:10},	
							    {text:'WWN',name:"portsasWwn",align:"left",vertical:"top",width:10},	
							    {text:'端口开关',name:"portsasEnabled",align:"left",vertical:"top",width:14},
						
                   ];
                   var sasUrl="monitorview/storage/hwoceanstor/queryHwStorePortsas";
                   
                   var casHeader =[
                                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"expboardLocation",align:"left",vertical:"top",width:10},								   
							    {text:'健康状态',name:"expboardHealthStatus",align:"left",vertical:"top",width:10},	
							    {text:'运行状态',name:"expboardRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'型号',name:"expboardModel",align:"left",vertical:"top",width:10},	
							    {text:'电子标签',name:"expboardLabel",align:"left",vertical:"top",width:20},	
							  
						
                   ];                   
                   var casUrl="monitorview/storage/hwoceanstor/queryHwStoreExpBoard";


                   var conHeader=[

                                {text:'',name:"t",hideSearch:"hide",width:2},
							    {text:'位置',name:"controllerLocation",align:"left",vertical:"top",width:10},								   
							    {text:'健康状态',name:"controllerHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"controllerRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'CPU',name:"controllerCpu",align:"left",vertical:"top",width:18},	
							    {text:'Cache大小',name:"controllerCacheCapacity",align:"left",vertical:"top",width:10},	
							    {text:'角色',name:"controllerRole",align:"left",vertical:"top",width:10},	
							    {text:'CPU使用率(%)',name:"controllerCpuUsage",align:"left",vertical:"top",width:8},
							    {text:'内存使用率(%)',name:"controllerMemoryUsage",align:"left",vertical:"top",width:8},

                   ];
                   var conUrl = "monitorview/storage/hwoceanstor/queryHwStoreController";

                   var manaHeader =[
                           
                                {text:'',name:"t",hideSearch:"hide",width:2},
                                {text:'类型',name:"portethType",align:"left",vertical:"top",width:10},
							    {text:'位置',name:"portethLocation",align:"left",vertical:"top",width:10},								   
							    {text:'健康状态',name:"portethHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"portethRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'IPv4地址',name:"portethIpv4address",align:"left",vertical:"top",width:10},
							    {text:'子网掩码',name:"portethSubnetmask",align:"left",vertical:"top",width:10},
							    {text:'IPv6地址',name:"portethIpv6address",align:"left",vertical:"top",width:10},
							    {text:'工作速率',name:"portethWorkingrate",align:"left",vertical:"top",width:10},			
							    
                   ];
                   var manaUrl="monitorview/storage/hwoceanstor/queryHwStorePortfeth";


                   var iocHeader=[
                       
                                {text:'',name:"t",hideSearch:"hide",width:2},
                               
							    {text:'位置',name:"interfacemoduleLocation",align:"left",vertical:"top",width:10},								   
							    {text:'健康状态',name:"interfacemoduleHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"interfacemoduleRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'型号',name:"interfacemoduleModel",align:"left",vertical:"top",width:10},							   
							    {text:'电子标签',name:"interfacemoduleLabel",align:"left",vertical:"top",width:20},	


                   ];

                   var iocUrl="monitorview/storage/hwoceanstor/queryHwStorePort"

                   var header=[];
                   var url;
                   if (treeNode.type=="ioc")
                   {
                   		if (treeNode.searchId.indexOf("R0") > -1||treeNode.searchId.indexOf("L0")>-1)
                   			$("#table_div1").show(),$("#table_div2").show(),$("#table_div3").show()
                   		else
                   			$("#table_div1").show(),$("#table_div2").show(),$("#table_div3").hide()
                   }
                   else
                   		$("#table_div1").show(),$("#table_div2").hide(),$("#table_div3").hide()

                   if(treeNode.type=="power")
                   {
                   	    header=powerHeader
                   	    url=powerUrl;
                   }
                   else if(treeNode.type=="fan")
                   {
                   	    header=fanHeader
                   	    url=fanUrl;

                   }
                   else if (treeNode.type=="BBU") {

                   	    header=bbuHeader
                   	    url=bbuUrl;
                   }
                   else if(treeNode.type=="sas")
                   {
                   	   header=sasHeader
                   	   url=sasUrl;
                   }
                   else if(treeNode.type=="disk")
                   {
                   	    header=casHeader
                   	    url=casUrl;
                   }
                   else if(treeNode.type=="controller")
                   {
                   	    header=conHeader
                   	    url=conUrl;
                   }
                   else if(treeNode.type=="manage")
                   {
                        header=manaHeader
                   	    url=manaUrl;
                   	   
                   }
                   else if(treeNode.type=="ioc")
                   {
                   	   
                         header=iocHeader
                   	     url=iocUrl;
                   	     if(treeNode.searchId.indexOf("R0") > -1||treeNode.searchId.indexOf("L0")>-1)
                   	     {
                             var codeHeader=[

                                {text:'',name:"t",hideSearch:"hide",width:2},                              
							    {text:'位置',name:"portfcoeLocation",align:"left",vertical:"top",width:10},								   
							    {text:'健康状态',name:"portfcoeHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"portfcoeRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'WWWPN',name:"portfcoeWwn",align:"left",vertical:"top",width:10},
							    {text:'工作速率',name:"portfcoeWorkingrate",align:"left",vertical:"top",width:10},							  
							    {text:'端口开关',name:"portfcoeSfpstatus",align:"left",vertical:"top",width:10}, 

                             ];
                             var coeUrl="monitorview/storage/hwoceanstor/queryHwStorePortfcoe"
                             var ethHeader=manaHeader;
                             var ethUrl =manaUrl
                             g_grid.render($("#table_div2"),{                   	
								 header:codeHeader,
								 paramObj:paramObj,
								 url:coeUrl,
								 hideSearch: true,
								 allowCheckBox:false,		
								 isLoad : true,
								 maskObj:$("#table_div2")
					    	});

                             g_grid.render($("#table_div3"),{                   	
								 header:ethHeader,
								 paramObj:paramObj,
								 url:ethUrl,
								 hideSearch: true,
								 allowCheckBox:false,		
								 isLoad : true,
								 maskObj:$("#table_div3")
					    	});
                   	     }
                   	     else
                   	     {
                   	     	var fcHeader=[
                                   
                                {text:'',name:"t",hideSearch:"hide",width:2},                              
							    {text:'位置',name:"portfcLocation",align:"left",vertical:"top",width:10},								   
							    {text:'健康状态',name:"portfcHealthStatus",align:"left",vertical:"top",width:8},	
							    {text:'运行状态',name:"portfcRunningStatus",align:"left",vertical:"top",width:10},
							    {text:'WWWPN',name:"portfcWwn",align:"left",vertical:"top",width:10},
							    {text:'工作速率',name:"portfcWorkingrate",align:"left",vertical:"top",width:10},
							    {text:'工作模式',name:"portfcWorkingmode",align:"left",vertical:"top",width:10},
							    {text:'端口开关',name:"portfcSfpstatus",align:"left",vertical:"top",width:10}, 
                   	     	 ];
                   	     	 var fcUrl="monitorview/storage/hwoceanstor/queryHwStorePortfc";

                   	     	 g_grid.render($("#table_div2"),{                   	
								 header:fcHeader,
								 paramObj:paramObj,
								 url:fcUrl,
								 hideSearch: true,
								 allowCheckBox:false,		
								 isLoad : true,
								 maskObj:$("#table_div2")
					    	});

                   	     }
                   }
                   g_grid.render($("#table_div1"),{                   	
							 header:header,
							 paramObj:paramObj,
							 url:url,
							 hideSearch: true,
							 allowCheckBox:false,		
							 isLoad : true,
							 maskObj:$("#table_div1")
				    });
				} 
			}
		}
	}
});