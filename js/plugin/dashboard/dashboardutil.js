define(['/js/plugin/event/event.js'] ,function (event){
	return {
		fault_event_detail : function (rowData){
			rowData.faultNO = rowData.eventId
			event.faultEventDetail(rowData);
		},
		perform_event_detail : function (rowData){
			rowData.performanceNo = rowData.eventId
			event.performEventDetail(rowData);
		}
	}
})