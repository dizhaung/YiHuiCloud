define(['/js/plugin/monitor/monitorInfo.js'] ,function (monitorInfo){
	return {
		// 基本信息
		base_info : function (paramObj){
			um_ajax_get({
		        url : "monitorview/security/nsfocusIds/queryNsfocusIdsBaseInfoTotal",
		        paramObj : paramObj,
		        isLoad : false,
		        successCallBack : function (data){
		        	$("#base_info_monitor_div").umDataBind("render" ,data.monitorbaseinfo);
            		$("#base_info_asset_div").umDataBind("render" ,data.assetinfo);
            		$("#hardware_info_ul").empty()
            		$("#hardware_info_ul").append('<li class="active" data-action="temp">温度</li>')
            		$("#hardware_info_ul").append('<li data-action="volts">电压</li>')
            		$("#hardware_info_ul").append('<li data-action="cpu" SUGON DELL>处理器</li>')
            		$("#hardware_info_ul").append('<li data-action="mem" SUGON DELL>内存</li>')
            		$("#hardware_info_ul").append('<li data-action="drive" HUAWEI DELL>驱动器槽</li>')
            		$("#hardware_info_ul").append('<li data-action="power_Unit" SUGON INSPUR DELL>电源模块</li>')
            		$("#hardware_info_ul").append('<li data-action="power_Supply"  HUAWEI SUGON DELL>电源供电</li>')
            		$("#hardware_info_ul").append('<li data-action="fan" HUAWEI>风扇</li>')
            		$("#hardware_info_ul").append('<li data-action="watts" HUAWEI>功率</li>')
            		if (data.monitorbaseinfo.dbName == "HUAWEI")
            		{
            			$("[HUAWEI]").remove()
            			$("#hardware_info_ul").append('<li data-action="cpu_run">处理器性能</li>')
            			$("#hardware_info_ul").append('<li data-action="disk">磁盘</li>')
            			$("#hardware_info_ul").append('<li data-action="mezz">智能卡</li>')
            			$("#hardware_info_ul").append('<li data-action="system">系统</li>')
            			$("#hardware_info_ul").append('<li data-action="log">日志</li>')
            			$("#hardware_info_ul").append('<li data-action="other">其他</li>')
            		}
            		if (data.monitorbaseinfo.dbName == "SUGON")
            		{
            			$("[SUGON]").remove()
            			$("#hardware_info_ul").append('<li data-action="amps">电流</li>')
            			$("#hardware_info_ul").append('<li data-action="other">其他</li>')
            		}
            		if (data.monitorbaseinfo.dbName == "INSPUR")
            		{
            			$("[INSPUR]").remove()
            			$("#hardware_info_ul").append('<li data-action="event">禁用事件日志记录</li>')
            			$("#hardware_info_ul").append('<li data-action="watchdog">看门狗</li>')
            			$("#hardware_info_ul").append('<li data-action="me_fw_status">管理子系统监控信息</li>')
            			$("#hardware_info_ul").append('<li data-action="bmc_boot_up">微控制器/协处理器</li>')
            		}
            		if (data.monitorbaseinfo.dbName == "DELL")
            		{
            			$("[DELL]").remove()
            			$("#hardware_info_ul").append('<li data-action="other">其他</li>')
            		}
            		__hardware_info_render(paramObj)
		        }
		    });
		},

		// 温度
		temperature_list : function (el ,paramObj){
			var temperature_list_url="monitorview/hardware/impi/queryIpmiTemperature";
			var temperature_list_header = [
					                        {text:"CPU内核" ,name:"cpuCoreRem"},
					                        {text:"CPU温度(℃)" ,name:"cpuTemperature"},
					                        {text:"获取时间" ,name:"updateDate"}
					                     ];
		    g_grid.render(el ,{
		        url : temperature_list_url,
		        header : temperature_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		// 风扇
		fan_list : function (el ,paramObj){
			var fan_list_url="monitorview/hardware/impi/queryIpmiFan";
			var fan_list_header = [
			                        {text:"风扇名称" ,name:"fanName"},
			                        {text:"风扇速度(RPM)" ,name:"fanSpeed"},
			                        {text:"获取时间" ,name:"updateDate"}
			                     ];
		    g_grid.render(el ,{
		        url : fan_list_url,
		        header : fan_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},

		// 电源
		power_list : function (el ,paramObj){
			var power_list_url="monitorview/hardware/impi/queryIpmiPower";
			var power_list_header = [
				                        {text:"电源名称" ,name:"powerName"},
				                        {text:"电源功率(W)" ,name:"powerValue"},
				                        {text:"获取时间" ,name:"updateDate"}
				                     ];
		    g_grid.render(el ,{
		        url : power_list_url,
		        header : power_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		// 电压
		voltage_list : function (el ,paramObj){
			var voltage_list_url="monitorview/hardware/impi/queryIpmiVoltage";
			var voltage_list_header = [
					                        {text:"3.3V" ,name:"sys_3V"},
					                        {text:"5V" ,name:"sys_5V"},
										    {text:"12V" ,name:"sys_12V"},
										    {text:"获取时间" ,name:"updateDate"}
				                       ];
		    g_grid.render(el ,{
		        url : voltage_list_url,
		        header : voltage_list_header,
		        paramObj : paramObj,
		        gridCss : "um-grid-style",
		        hasBorder : false,
		        hideSearch : true,
		        allowCheckBox : false
		    });
		},
		quote_list : function (el ,paramObj){
			__quote_list(el ,paramObj)
		}
	}

	function __hardware_info_render(urlParamObj){

		var el_ul = $("#hardware_info_div").find("ul")
	    el_ul.find("li").unbind("click")

	    el_ul.find("li").click(function (){
	        $(this).siblings().removeClass("active")
	        $(this).addClass("active")
	        urlParamObj.sensor_type = $(this).attr("data-action")
	        __quote_list($("#hardware_info_table") ,urlParamObj)
	    })


	    urlParamObj.sensor_type = "temp"
	    __quote_list($("#hardware_info_table") ,urlParamObj)
	}

	function __quote_list(el ,paramObj)
	{
		var list_url="monitorview/hardware/impi/queryIpmiInfo";
		var list_header = [
		                        {text:"传感器" ,name:"sensor_name"},
		                        {text:"状态" ,name:"sensor_status"},
							    {text:"读值" ,name:"read_value"},
							    {text:"不可逆低阈" ,name:"irreversible_low_valve"},
							    {text:"严重低阈" ,name:"serious_low_valve"},
							    {text:"非严重低阈" ,name:"unserious_low_valve"},
							    {text:"非严重高阈" ,name:"unserious_high_valve"},
							    {text:"严重高阈" ,name:"serious_high_valve"},
							    {text:"不可逆高阈" ,name:"irreversible_high_valve"}
	                       ];
	    g_grid.render(el ,{
	        url : list_url,
	        header : list_header,
	        paramObj : paramObj,
	        gridCss : "um-grid-style",
	        hasBorder : false,
	        hideSearch : true,
	        allowCheckBox : false
	    });
	}
})