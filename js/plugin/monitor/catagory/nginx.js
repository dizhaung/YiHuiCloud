define(['/js/plugin/monitor/monitorInfo.js',
	    '/js/plugin/plot/plot.js'] ,function (monitorInfo, plot){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/middleware/nginx/queryNginxMonitorBaseInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
		        }
		    });
		},
		nginx_info : function (paramObj){
          um_ajax_get({
		        url : "monitorview/middleware/nginx/queryNginxInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#nginx_info").umDataBind("render" ,data[0]);
		        }
		    });
		},
		response_time_chart: function (paramObj) {

			um_ajax_get({
		        url : "monitorview/middleware/nginx/queryNginxDynamicInfo",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		            var legendArray = [];
		            var categoryArray = [];
		            var seriesArray = [];
		            var  repsonseTime =new Object();
		            var  activeConnection =new Object();
                    var  requestPersecond=new Object();
                    var  requestWriting=new Object();
                    var  requestWaiting=new Object();
                    var  requestHeading=new Object();

		            repsonseTime.data=[];
		            activeConnection.data=[];
                    requestPersecond.data=[];
                    requestWriting.data=[];
                    requestWaiting.data=[];
                    requestHeading.data=[];

                    repsonseTime.name="响应时间(毫秒)";
                    repsonseTime.type="line";
                   

                    activeConnection.name="活动连接数";
                    activeConnection.type="line";

                    requestPersecond.name="每秒请求数";
                    requestPersecond.type="line";

                    requestWriting.name="写请求数";
                    requestWriting.type="line";

                    requestWaiting.name="等待请求数";
                    requestWaiting.type="line";

                    requestHeading.name="读请求数";
                    requestHeading.type="line";

	                for(var i=0;i<data.length;i++)
	                 {
                          categoryArray.push(data[i].enterDate);                         
                          repsonseTime.data.push(data[i].responseTime)                         
                          activeConnection.data.push(data[i].activeConnection);
                        
                          if(data[i].requestPersecond=="-1")
                          {
                          	  requestPersecond.data.push(0);
                          }
                          else
                          {
                          	  requestPersecond.data.push(data[i].requestPersecond);
                          }
                          requestWriting.data.push(data[i].requestWriting);
                          requestWaiting.data.push(data[i].requestWaiting);
                          requestHeading.data.push(data[i].requestHeading);
	                 }
	                 seriesArray.push(repsonseTime);
	                 console.log(legendArray);
	                 legendArray.push(repsonseTime.name);
		             plot.lineRender($("#response_time_chart"), {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });
		            seriesArray=[];
		            legendArray.push(activeConnection.name);
                    seriesArray.push(activeConnection);
                      plot.lineRender($("#active_connection_chart"), {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });
                     seriesArray=[];
                     seriesArray.push(requestPersecond);
                        legendArray.push(requestPersecond.name);
                      plot.lineRender($("#request_perSecond_chart"), {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });
                     seriesArray=[];
                     seriesArray.push(requestWriting);
                       legendArray.push(requestWriting.name);
                      plot.lineRender($("#request_writing_chart"), {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });
                    seriesArray=[];
                     seriesArray.push(requestWaiting);
                       legendArray.push(requestWaiting.name);
                      plot.lineRender($("#request_waiting_chart"), {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });
                    seriesArray=[];
                     seriesArray.push(requestHeading);
                       legendArray.push(requestHeading.name);
                      plot.lineRender($("#request_reading_chart"), {
		                legend : legendArray,
		                category :categoryArray,
		                series : seriesArray
		            });


		        }
		    }); 
		}
	}
})