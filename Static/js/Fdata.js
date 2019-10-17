var Fd = {
	httpSuccessCode: 10000,
	options : {
		'url': '#',
		'dataType': 'json',
		'type': 'POST',
		'async': false,
		'data': {},
		'loading': false,
	},
	init : function (){
		this.rebak();
		$(document).ajaxStart(function(e, xhr, opt){
			console.log('ajaxStart');
		}).ajaxSend(function(e, xhr, opt){
			console.log('ajaxSend');
			xhr.setRequestHeader("F-Mark", "F");
			xhr.setRequestHeader("F-Time", new Date().getTime());
		}).ajaxSuccess(function(e, xhr, opt){
			console.log('ajaxSuccess');
		}).ajaxComplete(function(e, xhr, opt){
			console.log('ajaxComplete');
			if(xhr.status==200 && typeof xhr.responseJSON=='object' && xhr.responseJSON.status!='undefined'){
				if(xhr.responseJSON.code==80000){
					if(typeof xhr.responseJSON.data!='undefined' && typeof typeof xhr.responseJSON.data.login_url!='undefined'){
						var login_url = xhr.responseJSON.data.login_url;
					}else{
						var login_url = '/login/index';
					}
					Flayer.tips('请登录', {'ok': [null, function(){
						location.href = login_url;
					}]});
				}
			}
		}).ajaxStop(function(e, xhr, opt){
			console.log('ajaxStop');
		});
	},
	url : function (url){
		this.options.url = url;
		return this;
	},
	dataType : function (type){
		this.options.dataType = type;
		return this;
	},
	data : function (data){
		this.options.data = data;
		return this;
	},
	async : function (){
		this.options.async = true;
		return this;
	},
	loading: function (){
		this.options.loading = true;
		return this;
	},
	post : function (fn){
		var loadingLayerId = 0;
		if(this.options.loading){
			if(this.options.async){
				if(typeof Flayer=='object'){
					loadingLayerId = Flayer.tips('loading', 100000);
				}
			}else{
				console.warn('if need loading, async must is true!');
			}
		}

		var result = '';
		$.ajax({
			type: this.options.type,
			url: this.options.url,
			async: this.options.async,
			data: this.options.data,
			dataType: this.options.dataType,
			success: function (res){
				if(loadingLayerId){
					Flayer.close(loadingLayerId);
				}
				if(typeof fn == 'function')
					fn(res);
				else
					result = res;
			},
			error: function (err){
				console.log('error');
				console.error(err);
			}
		});

		this.rebak();
		return result;
	},
	rebak: function(){
		if(typeof this.bak_options=='undefined'){
			this.bak_options = {};
			for(let i in this.options){
				this.bak_options[i] = this.options[i];
			}
		}else{
			for(let i in this.bak_options){
				this.options[i] = this.bak_options[i];
			}
		}
	},
	success: function (res){
		if(typeof res.code !='undefined' && res.code==this.httpSuccessCode)
			return true;
		else
			return false;
	},
	emsg: function(res){
		return typeof res.message != 'undefined' ? res.message : '';
	}
}
$(function(){
	Fd.init();
});