var Flayer = {
	layer_number: 20000,
	mainBoxNodeName: 'body',//default body
	layerName: 'Flayer',
	opts: {},
	options:{
		'type': 1,
		'title': '提示',
		'ok': ['确定', function(){return true;}],
		'cancel': ['取消', function(){return true;}],
		'time': 2000,
		'content': '',
		'width': '',
		'noheader': false,
		'nofooter': false,
		'url': ''
	},
	init : function (){
		this.clientViewWidth = document.documentElement.clientWidth;
		this.clientViewHeight = document.documentElement.clientHeight;
		
		this.clientScrollWidth = document.documentElement.scrollWidth;
		this.clientScrollHeight = document.documentElement.scrollHeight;
		
		this.maskWidth = this.clientViewWidth;
		this.maskHeight = this.clientViewHeight;
		
		if( this.clientScrollWidth > this.clientViewWidth )
			this.maskWidth = this.clientScrollWidth;
		if( this.clientScrollHeight > this.clientViewHeight )
			this.maskHeight = this.clientScrollHeight;

		this.rebak();
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
	//配置
	config : function (options){
		this.rebak();
		for(var i in this.options){
			if(typeof this.opts[this.layer_number]=='undefined')
				this.opts[this.layer_number] = {};
			this.opts[this.layer_number][i] = this.options[i];
		}
		if(options && typeof options=='object'){
			for(var i in options){
				if(typeof this.options[i]!='undefined')
					this.opts[this.layer_number][i] = options[i];
			}
		}
		var mainNode = this.getMainNode();
		mainNode.attr('number', this.layer_number);
		return this;
	},
	after: function(functionName){
		var FlayerNode = $('#'+this.layerName+this.layer_number),
			FlayerBoxNode = FlayerNode.find('Fbox');

		FlayerBoxNode.css({'min-width': AppMain.isMobile() ? '50%' : '300px'});

		//禁用header
		if(this.opts[this.layer_number].noheader===true){
			FlayerBoxNode.find('Fheader').remove();
		}else{
			if(this.opts[this.layer_number].title)
				FlayerBoxNode.find('Fheader').find('a').text(this.opts[this.layer_number].title);
		}
		//内容区域
		if(this.opts[this.layer_number].content)
			FlayerBoxNode.find('Fcontent').html(this.opts[this.layer_number].content);
		if(this.opts[this.layer_number].width)
			FlayerBoxNode.css({'width': this.opts[this.layer_number].width});
		if(this.opts[this.layer_number].height)
			FlayerBoxNode.css({'height': this.opts[this.layer_number].height});
		//禁用footer
		if(this.opts[this.layer_number].nofooter===true){
			FlayerBoxNode.find('Ffooter').remove();
		}else{
			if(this.opts[this.layer_number].cancel==false)
				FlayerBoxNode.find('Ffooter').find('button[default]').remove();
			else if(typeof this.opts[this.layer_number].cancel[0]=='string')
				FlayerBoxNode.find('Ffooter').find('button[default]').text(this.opts[this.layer_number].cancel[0]);

			if(this.opts[this.layer_number].ok==false)
				FlayerBoxNode.find('Ffooter').find('button[success]').remove();
			else if(typeof this.opts[this.layer_number].ok[0]=='string')
				FlayerBoxNode.find('Ffooter').find('button[success]').text(this.opts[this.layer_number].ok[0]);
		}

		FlayerNode.find('Fmask').css({'zIndex': this.layer_number+1});
		FlayerNode.find('Fbox').css({'zIndex': this.layer_number+2});
		FlayerNode.animate({'opacity': 1}, 'fast');

		if(functionName=='alert'){
			FlayerBoxNode.find('Ffooter').find('button[default]').remove();
			FlayerBoxNode.find('Fcontent').css({'padding': '1rem'});
		}else if(functionName=='confirm'){
			FlayerBoxNode.find('Fcontent').css({'padding': '1rem'});
		}else if(functionName=='tips'){
			FlayerBoxNode.addClass("tips");
			if(this.opts[this.layer_number].time){
				var i = setTimeout(function(){
					var thnumber = FlayerNode.attr('number');
					clearInterval(i);
					if(typeof Flayer.opts[thnumber]!='undefined' && typeof Flayer.opts[thnumber].ok[1]==='function')
						Flayer.opts[thnumber].ok[1]();
					Flayer.close(thnumber);
				}, this.opts[this.layer_number].time);
			}
		}else if(functionName=='loading'){
			FlayerBoxNode.addClass("tips");
			var loadingText = FlayerNode.find("Fcontent").text(),
				curLayerNumber = FlayerNode.attr('number'),
				loopLen = 0
			var loadingI = setInterval(function(){
				if(Flayer.getMainNode(curLayerNumber).length){
					var preT = loadingText.substr(0, loopLen),
						curT = loadingText.substr(loopLen, 1),
						lastT = loadingText.substr(loopLen+1),
						loopText = preT +"<span style='font-weight: bold;color:red'>"+ curT +"</span>"+ lastT

					FlayerNode.find("Fcontent").html(loopText)
					loopLen++
					if(loopLen==loadingText.length){
						loopLen = 0
					}
				}else{
					clearInterval(loadingI)
				}
			}, 200)
		}

		if(typeof AppMainRewrite!='undefined')
			AppMainRewrite.init();

		var calcCenter = function(){
			$(Flayer.layerName).each(function(){
				var FlayerNode = $(this),
					FlayerNodeNumber = FlayerNode.attr('number'),
					FlayerBoxNode = FlayerNode.find('Fbox');

				if(FlayerBoxNode){
					var AppMainWidth = $(Flayer.mainBoxNodeName).outerWidth(),
						clientHeight = $(window).height(),
						layerWidth = FlayerBoxNode.outerWidth(),
						layerHeight = FlayerBoxNode.outerHeight(true);

					if(layerWidth > AppMainWidth){
						FlayerBoxNode.css({'width': AppMainWidth});
					}
					var layerMaxHeight = 80  / 100 * clientHeight;
					if(layerHeight > layerMaxHeight){
						FlayerBoxNode.css({'height': layerMaxHeight});
					}

					layerWidth = FlayerBoxNode.outerWidth();
					layerHeight = FlayerBoxNode.outerHeight(true);
					
					var top = (clientHeight-layerHeight)/2 +'px',
						marginLeft = (AppMainWidth-layerWidth)/2 +'px';

					FlayerBoxNode.css({'top': top, 'margin-left': marginLeft});

					var headerHeight = FlayerBoxNode.find('Fheader').outerHeight(true),
						footerHeight = FlayerBoxNode.find('Ffooter').outerHeight(true);

					console.log('计算高度:', layerHeight, headerHeight, footerHeight)

					FlayerBoxNode.find('Fcontent').css({'height': layerHeight-headerHeight-footerHeight + 'px' });
				}
			});
		}
		calcCenter();
		$(window).resize(function(){
			calcCenter();
		});

		/* 事件开始 */
		FlayerNode.find('Ffooter').find('button[default]').click(function(){
			var number = $(this).parents('Flayer').attr('number');
			if(typeof Flayer.opts[number].cancel[1]=='function'){
				if(Flayer.opts[number].cancel[1]()==false){
					return false;
				}
			}
			Flayer.close(number)
		});
		FlayerNode.find('Ffooter').find('button[success]').click(function(){
			var number = $(this).parents('Flayer').attr('number');
			if(typeof Flayer.opts[number].ok[1]=='function'){
				if(Flayer.opts[number].ok[1]()==false){
					return false;
				}
			}
			Flayer.close(number)
		});
		/* 事件结束 */
		return this.layer_number;
	},
	initLayer: function(){
		this.layer_number++;
		var code = '<Flayer id="'+this.layerName+this.layer_number+'" style="opacity:0">';
			code += 	'<Fmask></Fmask>';
			code += 	'<Fbox>';
			code += 		'<Fheader><a>'+this.options.title+'</a><span></span></Fheader>';
			code += 		'<Fcontent></Fcontent>';
			code += 		'<Ffooter>';
			code +=				'<button default lrgap10>'+this.options.cancel[0]+'</button>';
			code +=				'<button success>'+this.options.ok[0]+'</button>';
			code += 		'</Ffooter>';
			code += 	'</Fbox>';
			code += '</Flayer>';
		$(this.mainBoxNodeName).append(code);
	},
	alert: function(msg, options, fn){
		this.initLayer();
		var opts = {};
		if(typeof options=='function'){
			fn = options;
		}else if(typeof options=='object'){
			opts = options;
		}
		if(typeof fn=='function'){
			opts['ok'] = [this.options.ok[0], options];
		}
		opts['content'] = msg;

		this.config(opts);

		return this.after('alert');
	},
	loading: function(loadingText){
		this.initLayer();
		var options = {
			'content': loadingText ? loadingText : 'loading...'
		}
		options.noheader = true
		options.nofooter = true

		this.config(options);

		return this.after('loading');
	},
	tips: function(msg, options, fn){
		this.initLayer();
		if(typeof options==='function'){
			fn = options;
			options = {'ok':[this.options.ok[0], fn]};
		}else if(typeof options==='number'){
			options = {'time': options};
		}
		if(!options)
			options = {'content': msg};
		else
			options.content = msg;

		options.noheader = true
		options.nofooter = true

		this.config(options);
		
		return this.after('tips');
	},
	confirm: function(msg, options){
		this.initLayer();
		if(!options)
			options = {'content': msg};
		else
			options.content = msg;

		this.config(options);

		return this.after('confirm');
	},
	open: function(options){
		this.initLayer();
		if(!options.content && options.url){
			if(typeof Fd!='undefined')
				options.content = Fd.dataType('text').url(options.url).post();
		}
		this.config(options);

		return this.after('open');
	},
	getMainNode: function(layerNumber){
		return $('#'+this.layerName+(layerNumber ? layerNumber : this.layer_number));
	},
	closeBak: function(mainNode){
		if(!mainNode)
			mainNode = this.getMainNode();
		var number = mainNode.attr('number');
		mainNode.remove();
		delete this.opts[number];
	},
	close: function (id){
		console.log('closeID:', id)
		if(!id){
			id = this.layer_number;
		}
		var layerNode = $('#'+this.layerName + id);
		console.log('#'+this.layerName + id)
		if(layerNode.length){
			$('#'+this.layerName + id).remove();
			delete this.opts[id];
		}else{
			console.warn('layer ID not found!');
		}
	},
	closeAll: function(){
		if(this.layer_number>0){
			for(var number=1;number<=this.layer_number;number++){
				$('#'+this.layerName+number).remove();
			}
			this.opts = {};
		}
	}
};

$(function(){
	Flayer.init();
});