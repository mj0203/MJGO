var AppMainRewrite = {
	basepx: 12,
	repeatNumber: 0,
	init: function(){
		this.basepx = parseInt($('html').css('font-size'));
		//解析div样式美化
		this.parseDivStyle();
		//解析自定义select标签
		this.parseMySelect();
		//解析input type="radio"样式美化
		this.parseRadio();
		//解析input type="checkbox"样式美化
		this.parseCheckbox();
		//解析自定义formItem标签
		this.parseMyFormItem();
		//解析自定义页面跳转
		this.parseLocation();

		this.repeatNumber += 1;//must last line
	},
	parseLocation: function (){
		if(this.repeatNumber){
			console.info("repeatNumber: "+this.repeatNumber);
			return false;
		}
		let MyLocationNumbers = parseInt(window.localStorage.getItem('MyLocationNumbers')||0);
		if(MyLocationNumbers){
			for(let number=1;number<=MyLocationNumbers;number++){
				window.localStorage.removeItem('MyLocationPage_'+number);
			}
		}
		window.localStorage.setItem('MyLocationNumbers', 1);
		window.localStorage.setItem('MyLocationPage_1', $('#App_Main_Box_Content').html());

		/* MyLocation 跳转 */
		$(document).on('click', 'MyLocation', function(){
			let selfNode = $(this),
				AppMainBoxContentNode = $('#App_Main_Box_Content'),
				AppMainCustomNode = $('#App_Main_Custom'),
				MyLocationNumbers = parseInt(window.localStorage.getItem('MyLocationNumbers')),
				url = selfNode.attr('href')||'';

			if(!url){
				console.warn("href is null");
				return false;
			}
			let res = Fd.dataType('text').url(url).post();
			if(res){
				MyLocationNumbers = parseInt(MyLocationNumbers) + parseInt(1);

				//效果 开启
				AppMainBoxContentNode.css({'opacity': 0});

				var AppMainCtlCode = "<MyLocationBack></MyLocationBack>",
					MyLocationCurrentCode = res+AppMainCtlCode;

				AppMainBoxContentNode.html(MyLocationCurrentCode);
				window.localStorage.setItem('MyLocationPage_'+MyLocationNumbers, MyLocationCurrentCode);

				//效果 结束
				AppMainBoxContentNode.animate({'opacity': 1});

				window.localStorage.setItem('MyLocationNumbers', MyLocationNumbers);

				AppMainRewrite.init();
			}
		});
		/* MyLocation 后退 */
		$(document).on('click', 'MyLocationBack', function(){
			var AppMainBoxContentNode = $('#App_Main_Box_Content'),
				AppMainCustomNode = $('#App_Main_Custom'),
				MyLocationNumbers = parseInt(window.localStorage.getItem('MyLocationNumbers')),
				MyLocationGoNumber = MyLocationNumbers - 1,
				gotoPageHtml = window.localStorage.getItem('MyLocationPage_'+MyLocationGoNumber);

			AppMainBoxContentNode.animate({'marginLeft': '80%', 'opacity': 0}, function(){
				//效果 开启
				AppMainBoxContentNode.css({'marginLeft': 0});

				//返回
				AppMainBoxContentNode.html(gotoPageHtml);

				//效果 结束
				AppMainBoxContentNode.animate({'opacity': 1});

				//修改MyLocation数量
				window.localStorage.setItem('MyLocationNumbers', MyLocationNumbers-1);
				window.localStorage.removeItem('MyLocationPage_'+MyLocationNumbers);

				AppMainRewrite.init();
			});
		});
	},
	/* 自定义FormItem处理 */
	parseMyFormItem: function(){
		$('form').each(function(){
			var selfNode = $(this),
				label_width = selfNode.attr('label_width')||10;

			selfNode.find('MyFormItem').each(function(){
				if($(this).attr('inited')){
					return true;
				}else{
					$(this).attr('inited', 1);
				}
				var selfNode = $(this),
					label_name = selfNode.attr('label')||'',
					sonCode = selfNode.html(),
					newSonCode = '';

				newSonCode += "<label style='width: "+label_width+"rem' litem>"+label_name+"</label>";
				newSonCode += "<div style='margin-left: "+label_width+"rem' ritem>"+sonCode+"</div>";

				selfNode.empty();
				selfNode.html(newSonCode);
				selfNode.animate({'opacity': 1});

				var	ritem_height = selfNode.find('div[ritem]').height();
				var	ritem_height = selfNode.find('div[ritem]').actual('height');
				selfNode.find('label[litem]').css({'height': ritem_height+'px', 'line-height': ritem_height+'px'});
			});
		});
	},
	/* div 样式美化 */
	parseDivStyle: function (){
		//填充div[col] 自动清除浮动
		$('div[col][cb]').each(function(){
			$(this).next('span[cb]').remove();
			$(this).after("<span cb></span>");
		});
		//div[slide] 展开事件
		$('div[slide]').each(function(){
			if($(this).attr('inited')){
				return true;
			}else{
				$(this).attr('inited', 1);
			}
			var origin_height = $(this).height();
			$(this).attr('origin_height', origin_height);

			var dh = parseFloat($(this).attr('dh')),
				dh = (dh ? dh : 3) * AppMainRewrite.basepx,
				dh = dh > origin_height ? origin_height : dh;
			
			if(dh!=origin_height){
				$(this).attr('dh', dh);
				$(this).css({'max-height': dh+'px'});
				$(this).append("<MySlide><span class='downArrow slideArrow'></span></MySlide>");
			}
			$(this).show();
		});

		if(this.repeatNumber){
			console.info("repeatNumber: "+this.repeatNumber);
			return false;
		}
		$(document).on('click', 'MySlide', function(){
			var dh = $(this).parent().attr('dh'),
				origin_height = $(this).parent().attr('origin_height');

			if($(this).parent().attr('opened')>0){
				$(this).parent().animate({"max-height": dh+'px'});
				$(this).find('.slideArrow').removeClass('upArrow');
				$(this).find('.slideArrow').addClass('downArrow');
			}else{
				$(this).parent().animate({"max-height": origin_height+'px'});
				$(this).find('.slideArrow').removeClass('downArrow');
				$(this).find('.slideArrow').addClass('upArrow');
			}
			$(this).parent().attr('opened', $(this).parent().attr('opened')==1?0:1);
		});
	},
	parseMySelect: function (){
		var slideUpAll = function(){
			$('MySelect').find('MyOptions').slideUp("fast");
			$('MySelect').find('MyArrow').removeClass('up');
			$('MySelect').find('MyArrow').addClass('down');
			$('MySelect').prop('opened', 0);
		}
		var makeDefaultSelect = function (MySelectNode){
			var selectedNode = MySelectNode.find('MySelf'),
				selectedValue = selectedNode.attr('value'),
				selectedText = selectedNode.text();
			if(selectedValue && selectedText){
				selectedNode.removeClass("default");

				MySelectNode.find('select option').removeAttr("selected");
				MySelectNode.find('MyOption').removeAttr("selected");

				MySelectNode.find('select option[value="'+selectedValue+'"]').attr('selected', 'selected');
				MySelectNode.find('MyOption[value="'+selectedValue+'"]').attr('selected', 'selected');
				
				return true;
			}
			return false;
		}

		$('MySelect').each(function(){
			var selfNode = $(this);
			if(selfNode.attr('inited')){
				return true;
			}else{
				selfNode.attr('inited', 1);
			}
			var newOriginSelectNodeHtml = selfNode.prop('outerHTML'),
				newOriginSelectNodeHtml = newOriginSelectNodeHtml.replace(/MySelect/ig, 'select'),
				newOriginSelectNodeHtml = newOriginSelectNodeHtml.replace(/MyOption/ig, 'option');

			var	defaultText = selfNode.attr('label') || '请选择',
				newSonCode = '<MySelf class="default" text="" value="">'+defaultText+'</MySelf>';
				newSonCode += '<MyOptions>' +selfNode.html()+ '</MyOptions>';
				newSonCode += '<MyArrow class="down"></MyArrow>';

			selfNode.html(newSonCode);
			selfNode.append(newOriginSelectNodeHtml);
			selfNode.find('select').prepend('<option>'+defaultText+'</option>');

			var selectedNode = selfNode.find('MyOption[selected]:last');
			if(selectedNode.length){
				var selectedValue = selectedNode.attr('value'),
					selectedText = selectedNode.text();

				selfNode.find('MySelf').text(selectedText);
				selfNode.find('MySelf').attr('text', selectedText);
				selfNode.find('MySelf').attr('value', selectedValue);
				makeDefaultSelect(selfNode);
			}
			
			selfNode.css({'opacity': 1});
		});
		if(this.repeatNumber){
			console.info("repeatNumber: "+this.repeatNumber);
			return false;
		}
		$(document).on('click', function(event){
			slideUpAll();
		})
		
		$(document).on('change', 'MySelect[origin] select', function(){
			var selfNode = $(this),
				selfParentBoxNode = selfNode.parent(),
				selectedValue = selfNode.val(),
				selectedText = selfNode.find('option:selected').text();

				selfParentBoxNode.find('MySelf').text(selectedText);
				selfParentBoxNode.find('MySelf').attr('text', selectedText);
				selfParentBoxNode.find('MySelf').attr('value', selectedValue);
				
				makeDefaultSelect(selfParentBoxNode);
		});
		$(document).on('click', 'MySelect', function(event){
			if(typeof $(this).attr('origin')!='undefined')
				return false;

			event.stopPropagation();
			var selfNode = $(this);
			if(selfNode.prop('opened')){
				selfNode.find('MyOptions').slideUp("fast");
				selfNode.find('MyArrow').removeClass('up');
				selfNode.find('MyArrow').addClass('down');
			}else{
				//先禁用全部展开
				slideUpAll();

				//仅展开自身
				selfNode.find('MyArrow').removeClass('down');
				selfNode.find('MyArrow').addClass('up');
				var curMySelectNode = $(this);
				selfNode.find('MyOptions').slideDown("fast", function(){
					let ck = curMySelectNode.find('MyOption[selected]').length;
					if(ck){
						curMySelectNode.find('MyOptions').scrollTop(0);
						let curScrollTop = curMySelectNode.find('MyOptions').scrollTop(),
							selectedPositionSTop = curMySelectNode.find('MyOption[selected]').position().top,
							scrollBoxHeight = curMySelectNode.find('MyOptions').innerHeight()/2,
							curSelectedNodeHeight = curMySelectNode.find('MyOption[selected]').innerHeight()/2;

						curMySelectNode.find('MyOptions').scrollTop(selectedPositionSTop-scrollBoxHeight+curSelectedNodeHeight);
					}
				});
			}
			selfNode.prop('opened', selfNode.prop('opened') ? 0 : 1);
		});
		

		$(document).on('click', 'MySelect MyOption', function(event){
			event.stopPropagation();
			var selfNode = $(this),
				selfParentBoxNode = selfNode.parent().parent();

			var selectedValue = selfNode.attr('value'),
				selectedText = selfNode.text();

			selfParentBoxNode.find('MySelf').attr('value', selectedValue);
			selfParentBoxNode.find('MySelf').text(selectedText);
			selfParentBoxNode.find('MySelf').attr('text', selectedText);

			makeDefaultSelect(selfParentBoxNode);

			slideUpAll();
		});
	},
	parseRadio: function(){
		$('MyRadio').each(function(){
			if($(this).attr('inited')){
				return true;
			}else{
				$(this).attr('inited', 1);
			}

			var selfNode = $(this),
				sonHtml = selfNode.html();

			selfNode.empty();

			var newOutBoxHtml = selfNode.prop('outerHTML'),
				newInHtml = newOutBoxHtml.replace(/<\/MyRadio>/i, ''),
				newInHtml = newInHtml.replace(/MyRadio/i, 'input type="radio"'),
				newInHtml = newInHtml.replace('>', ' style="display: none;" />');
				newInHtml += '<span class="btn"></span><span class="txt">' +sonHtml+ '</span>';

			selfNode.html(newInHtml);
			
			//默认选中
			if(typeof selfNode.attr('checked')!='undefined')
				selfNode.click();
		})
		if(!this.repeatNumber){
			$(document).on('click', 'MyRadio', function(){
				var selfNode = $(this);
				$('MyRadio').find('input').removeAttr('checked');
				$('MyRadio').removeAttr('checked');

				if(!selfNode.find('input').attr('name')){
					console.warn('radio [name] is not found!');
					return false;
				}
				selfNode.attr('checked', 'checked');
				selfNode.find('input').attr('checked', 'checked');
			});
		}
	},
	parseCheckbox: function(){
		var checkedFunc = function(jnode, initDefault){
			if(!jnode.find('input').attr('name')){
				console.warn('checkbox [name] is not found!');
				return false;
			}
			if(initDefault){
				jnode.find('input').attr('checked', 'checked');
			}else{
				if(typeof jnode.attr('checked')!='undefined'){
					jnode.find('input').removeAttr('checked');
					jnode.removeAttr('checked');
				}else{
					jnode.find('input').attr('checked', 'checked');
					jnode.attr('checked', 'checked');
				}
			}
		}
		$('MyCheckbox').each(function(){
			var selfNode = $(this);
			if($(this).attr('inited')){
				return true;
			}else{
				$(this).attr('inited', 1);
			}
			
			var	sonHtml = selfNode.html();
			selfNode.empty();

			var newOutBoxHtml = selfNode.prop('outerHTML'),
				newInHtml = newOutBoxHtml.replace(/<\/MyCheckbox>/i, ''),
				newInHtml = newInHtml.replace(/MyCheckbox/i, 'input type="checkbox"'),
				newInHtml = newInHtml.replace('>', ' style="display: none;" />');
				newInHtml += '<span class="btn"></span><span class="txt">' +sonHtml+ '</span>';

			selfNode.html(newInHtml);
			
			//默认选中
			if(typeof selfNode.attr('checked')!='undefined')
				checkedFunc(selfNode, 'init');
		})
		if(!this.repeatNumber){
			$(document).on('click', 'MyCheckbox', function(){
				checkedFunc($(this));
			});
		}
	}
}
$(function(){
	AppMainRewrite.init();
})