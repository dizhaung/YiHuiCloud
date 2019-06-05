/** 
	插件名称  :  timepicker
	插件功能  :  时间选择器
*/
define(function (){
	return {
		time:function (el ,opt){
			el.after('<span class="input-group-btn"><button class="btn btn-default btn-date" type="button"><i class="glyphicon glyphicon-calendar"></i></button></span>');

			// 默认时间格式
			var time_param = {
				startView : 2,
				minView : 1,
				format : "yyyy-mm-dd hh:00:00",
				container : el.parent()
			}

			if (opt && opt.type)
			{
				if (opt.type == "ymd")
				{
					time_param.minView = 2;
					time_param.format = "yyyy-mm-dd";
				}

				if (opt.type == "day")
				{
					time_param.minView = 2;
					time_param.format = "yyyy-mm-dd 00:00:00";
				}

				if (opt.type == "minute")
				{
					time_param.minView = 0;
					time_param.format = "yyyy-mm-dd hh:ii:00";
				}

				if (opt.type == "year")
				{
					time_param.minView = 3;
					time_param.startView = 3;
					time_param.format = "yyyy-mm";
				}
			}
			if (opt && opt.bodyContainer)
			{
				time_param.container = "body";
			}
			if (el.attr("container") == "body")
			{
				time_param.container = "body";
			}

			el.datetimepicker({
				language: 'fr',
				autoclose: 1,
				startView: time_param.startView,
				minView: time_param.minView,
				forceParse: 0,
				format: time_param.format,
				container: time_param.container,
				position: opt.position,
				todayBtn: true
		    });

			if (el.next())
			{
			    el.next().click(function (){
			    	el.datetimepicker("show");
			    });
			}

		},
		// 获取上个季度的时间范围
		getPrevQuarterDay : function (){
			var date =  new Date();
			var year = new Date().getFullYear();
			var nowMonth = new Date().getMonth() + 1;
			var quarterStartMonth;
			var quarterEndMonth;
			if(nowMonth<=3)
			{ 
				year = year-1;
				quarterStartMonth = 10;
				quarterEndMonth = 12;
			} 
			if(3<nowMonth && nowMonth<=6)
			{ 
				quarterStartMonth = 1;
				quarterEndMonth = 3;
			} 
			if(6<nowMonth && nowMonth<=9)
			{ 
				quarterStartMonth = 4;
				quarterEndMonth = 6;
			} 
			if(nowMonth>9)
			{ 
				quarterStartMonth = 7;
				quarterEndMonth = 9;
			}
			var endDay = g_moment(year + "-" + quarterEndMonth, "YYYY-MM").daysInMonth();
			return {
					  start : year + "-" + quarterStartMonth + "-01",
					  end : year + "-" + quarterEndMonth + "-" + endDay,
				   }
		},
		getPrevQuarter : function (){
			var date =  new Date();
			var year = new Date().getFullYear();
			var nowMonth = new Date().getMonth() + 1;
			var quarterStartMonth;
			var quarterEndMonth;
			if(nowMonth<=3)
			{ 
				return 4;
			} 
			if(3<nowMonth && nowMonth<=6)
			{ 
				return 1;
			} 
			if(6<nowMonth && nowMonth<=9)
			{ 
				return 2;
			} 
			if(nowMonth>9)
			{ 
				return 3;
			}
		},
		getQuarterRange : function (quarter){
			if(quarter==1){
				return {
					startDate : "01-01",
					endDate : "03-31"
				};
			}else if(quarter==2){
				return {
					startDate : "04-01",
					endDate : "06-30"
				};
			}else if(quarter==3){
				return {
					startDate : "07-01",
					endDate : "09-30"
				};
			}else if(quarter==4){
				return {
					startDate : "10-01",
					endDate : "12-31"
				};
			}else {
				return undefined;
			}
		},
		getCurrentDate : function (){
			return new Date()
		},
		getCurrentWeek  : function (){
			//起止日期数组    
	        var startStop = new Array();  
	        //获取当前时间    
	        var currentDate = this.getCurrentDate();  
	        //返回date是一周中的某一天    
	        var week = currentDate.getDay();  
	        //返回date是一个月中的某一天    
	        var month = currentDate.getDate();  
	  
	        //一天的毫秒数    
	        var millisecond = 1000 * 60 * 60 * 24;  
	        //减去的天数    
	        var minusDay = week != 0 ? week - 1 : 6;  
	        //alert(minusDay);    
	        //本周 周一    
	        var monday = new Date(currentDate.getTime() - (minusDay * millisecond));  
	        //本周 周日    
	        var sunday = new Date(monday.getTime() + (6 * millisecond));  
	        //添加本周时间    
	        startStop.push(monday); //本周起始时间    
	        //添加本周最后一天时间    
	        startStop.push(sunday); //本周终止时间    
	        //返回    
	        return startStop;
		},
		getCurrentMonth : function (){
			//起止日期数组    
	        var startStop = new Array();  
	        //获取当前时间    
	        var currentDate = this.getCurrentDate();  
	        //获得当前月份0-11    
	        var currentMonth = currentDate.getMonth();  
	        //获得当前年份4位年    
	        var currentYear = currentDate.getFullYear();  
	        //求出本月第一天    
	        var firstDay = new Date(currentYear, currentMonth, 1);  

	        //当为12月的时候年份需要加1    
	        //月份需要更新为0 也就是下一年的第一个月    
	        if (currentMonth == 11) {  
	            currentYear++;  
	            currentMonth = 0; //就为    
	        } else {  
	            //否则只是月份增加,以便求的下一月的第一天    
	            currentMonth++;  
	        }  
	  
	  
	        //一天的毫秒数    
	        var millisecond = 1000 * 60 * 60 * 24;  
	        //下月的第一天    
	        var nextMonthDayOne = new Date(currentYear, currentMonth, 1);  
	        //求出上月的最后一天    
	        var lastDay = new Date(nextMonthDayOne.getTime() - millisecond);  
	  
	        //添加至数组中返回    
	        startStop.push(firstDay);  
	        startStop.push(lastDay);  
	        //返回    
	        return startStop;
		},
		getQuarterSeasonStartMonth : function (month){
			var quarterMonthStart = 0;  
	        var spring = 1; //春    
	        var summer = 4; //夏    
	        var fall = 7;   //秋    
	        var winter = 10; //冬    
	        //月份从0-11    
	        if (month < 4) {  
	            return "01-04";  
	        }  
	  
	        if (month < 7) {  
	            return "04-07";  
	        }  
	  
	        if (month < 10) {  
	            return "07-10";  
	        }  
	  
	        return "10-12";
		}

	}
});