/*入口脚本*/
require.config({
    baseUrl: "js/",
    paths: {
        // ABPanel
        "abPanel":"plugin/ABPanel/abPanel",
        // 遮罩
        "mask":"plugin/mask/mask",
        // 弹出框
        "dialog":"plugin/dialog/dialog",
        // 拖拽
        "drag":"plugin/drag/drag",
        // tablegrid
        "tablegrid":"plugin/tablegrid/tablegrid",
        // grid
        "grid":"plugin/grid/grid",
        // asset
        "asset":"plugin/asset/asset",
        // validate
        "validate":"plugin/validate/validate",
        // inputdrop
        "inputdrop":"plugin/inputdrop/inputdrop",
        // monitorTool
        "monitorTool":"plugin/monitor/monitor_config_tool",
        // usercenter
        "usercenter":"plugin/usercenter/usercenter",
        // chart-plot
        "jquery.flot.pie":"lib/charts/flot/jquery.flot.pie.min",
        "plot":"plugin/plot/plot",
        // 日期选择空间
        //"bootstrap-datetimepicker.cn":"lib/bootstrap-datetimepicker/bootstrap-datetimepicker.cn",
        "timepicker":"plugin/timepicker/timepicker",
        // checkbox美化插件
        "bootstrap-switch":"lib/bootstrap-switch/bootstrap-switch",
        // 下拉菜单
        "dropdown": "plugin/dropdown/dropdown",
        //树控件
        "ztree.core":"lib/ztree/jquery.ztree.core",
        "ztree.excheck":"lib/ztree/jquery.ztree.excheck",
        "ztree.exedit":"lib/ztree/jquery.ztree.exedit",
        "tree": "plugin/tree/tree",
        "moment": "lib/fullcalendar/js/moment.min",
        "echarts": "lib/charts/echarts.min",
        //jtopo插件二次开发版
        "jtopo" : "plugin/topo/jtopo-0.4.8-dev",
        //json对象和 xml文本 转换插件
        "Json2xml" : "lib/Json2xml",
        //自定义拓扑对象开始
        "topoCustomNode" : "plugin/topo/customNode",
        "topoCustomLink" : "plugin/topo/customLink",
        "topoCustomFoldLink" : "plugin/topo/customFoldLink",
        "topoCustomTextNode" : "plugin/topo/customTextNode",
        "topoCustomContainer" : "plugin/topo/customContainer",
        "topoCustomNephogram" : "plugin/topo/customNephogram",
        "topoCustomNephogramPublic" : "plugin/topo/customNephogramPublic",
        "topoCustomFlexionalLink" : "plugin/topo/customFlexionalLink"
    },
    waitSeconds: 15,
    shim : {
    }
});