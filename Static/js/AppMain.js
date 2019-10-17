var AppMain = {
	window_width: 0,
	window_height: 0,
	body_width: 0,
	body_width: 0,
	document_width: 0,
	document_height: 0,

	init: function(){
		this.getSize();
		this.onWindowResize();
	},
	getSize: function(){
		this.window_width = $(window).width(),
		this.window_height = $(window).height(),
		this.body_width = $(document.body).width(),
		this.body_height = $(document.body).height(),
		this.document_width = $(document.documentElement).width(),
		this.document_height = $(document.documentElement).height();
		console.log(this.window_width, this.window_height)
		return this;
	},
	onWindowResize: function(){
		$(window).resize(function(){
			AppMain.getSize();
		});
		return this;
	},
	isMobile: function(){
		return /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent);
	},
	//获取日期时间
	getDate: function(format, tstr){
		if(tstr){
			if(/^\d{10,10}$/.test(tstr)){
				tstr *= 1000;
			}else if(/[-|:|\s|\/]/.test(tstr)){
				tstr = this.getTime(tstr)*1000;
			}
			var date = new Date(tstr);
		}else{
			var date = new Date();
		}
		format = (format ? format : 'Y-m-d H:i:s').replace(/([-|:|\s|\/])/g, "+'$1'+");
		var Y = date.getFullYear(),
			om = date.getMonth(),
			m = om+1,
			m = m<10 ? '0'+m : m,
			od = date.getDate(),
			d = od<10 ? '0'+od : od,
			oh = date.getHours(),
			H = oh+1,
			H = oh<10 ? '0'+oh : oh,
			oi = date.getMinutes(),
			i = oi<10 ? '0'+oi : oi,
			os = date.getSeconds(),
			s = os<10 ? '0'+os : os;
		return eval(format);
	},
	//获取时间戳
	getTime: function(dstr){
		if(dstr){
			dstr = dstr.replace(/([-|:|\s|\/])/g, ',');
			dstr = dstr.split(',');
			var date = new Date(dstr[0],dstr[1]-1,dstr[2],dstr[3],dstr[4],dstr[5]);
		}else{
			var date = new Date();
		}
		return parseInt(date.getTime()/1000);
	}
}
$(function(){
	AppMain.init();
})