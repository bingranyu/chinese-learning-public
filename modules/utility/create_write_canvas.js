export {create_write_canvas};
import {getScroll} from "./utility.js";

// 待增加參數:
// 筆畫粗細
// 筆畫顏色
// 每筆畫動畫效果
// 筆畫間的延遲
var redraw_path = function(path_list, canvas,linewidth=1, strokestyle='#000000'){
	var draw_ctx = canvas.getContext('2d');;
	
	for(var ipath=0;ipath<path_list.length;ipath++){
		draw_ctx.beginPath();
		draw_ctx.moveTo(path_list[ipath][0]["coord"][0], path_list[ipath][0]["coord"][1]);
		for(var icoords=1;icoords<path_list[ipath].length;icoords++){
			draw_ctx.lineTo(path_list[ipath][icoords]["coord"][0], path_list[ipath][icoords]["coord"][1]);
			draw_ctx.strokeStyle = strokestyle;
			draw_ctx.lineWidth=linewidth;
			draw_ctx.stroke();
		};
		draw_ctx.closePath();
	};
	
};

var create_write_canvas = function(param){
	var default_param = {"width":100,"height":100,"stokewidth":null,"strokestyle":"#000000"};
	this.param = $.extend( {},default_param, param);
	if(this.param.stokewidth === null){
		this.param.stokewidth = Math.max(1,this.param.stokeCheckwidth/5);
	};
	this.draw_canvas = document.createElement("canvas");
	this.draw_canvas.setAttribute('width', this.param.width);
	this.draw_canvas.setAttribute('height', this.param.height);	
	this.draw_ctx = this.draw_canvas.getContext('2d');
	this.draw_isIdle = true;
	this.draw_enable = false;
	this.is_eraser = false;
	this.eraser_isIdle = true;
	// 路徑
	this.draw_path = [];
	this.draw_path_onetime = [];
	// callback
	this.draw_start_callback = null;
	this.draw_move_callback = null;
	this.draw_end_callback = null;

	
	var _self = this;
	var mouse_event_ts;
	var drawstart = function(event){
		if(!_self.is_eraser){
			mouse_event_ts = event.timeStamp;
			_self.draw_path_onetime = [];
			if(_self.draw_start_callback!==null){
				_self.draw_start_callback();
			};
			_self.draw_ctx.beginPath();
			
			let scrollxy = getScroll();
			let x = event.pageX - _self.draw_canvas.getBoundingClientRect().left - scrollxy[0];
			let y = event.pageY - _self.draw_canvas.getBoundingClientRect().top - scrollxy[1];
			
			_self.draw_ctx.moveTo(x, y);
			_self.draw_path_onetime.push({"ts":0,"coord":[x,y]});
			if(_self.draw_enable){
				_self.draw_isIdle = false;
			};
		}else{
			if(_self.draw_enable){
				_self.eraser_isIdle = false;
			};
		};
	};
	
	var drawmove = function(event){
		if(!_self.is_eraser){
			if (_self.draw_isIdle) return;
			let scrollxy = getScroll();
			let x = event.pageX - _self.draw_canvas.getBoundingClientRect().left - scrollxy[0];
			let y = event.pageY - _self.draw_canvas.getBoundingClientRect().top - scrollxy[1];
			
			_self.draw_ctx.lineTo(x, y);
			_self.draw_ctx.lineWidth=_self.param.stokewidth;
			_self.draw_ctx.strokeStyle = _self.param.strokestyle;
			_self.draw_ctx.stroke();
			_self.draw_path_onetime.push({"ts":parseInt(event.timeStamp - mouse_event_ts),"coord":[x,y]});
			mouse_event_ts = event.timeStamp;
			if(_self.draw_move_callback!==null){
				_self.draw_move_callback();
			};
		}else{
			if (_self.eraser_isIdle) return;
			let scrollxy = getScroll();
			let x = event.pageX - _self.draw_canvas.getBoundingClientRect().left - scrollxy[0];
			let y = event.pageY - _self.draw_canvas.getBoundingClientRect().top - scrollxy[1];
			
			//判斷是否有接近特定路徑
			var check_path_delete = _self.draw_path.map((v1)=>v1.map(v2=>Math.sqrt((v2["coord"][0]-x)**2+(v2["coord"][1]-y)**2)<5).some((b)=>b===true));
			check_path_delete = check_path_delete.indexOf(true);
			if(check_path_delete!=-1){
				_self.draw_path.splice(check_path_delete, 1);
				_self.draw_ctx.clearRect(0, 0, _self.draw_canvas.width, _self.draw_canvas.height);
				redraw_path(_self.draw_path,_self.draw_canvas,_self.param.stokewidth, _self.param.strokestyle);
			};
		};
	};
	
	var drawend = function(event){
		
		if(!_self.is_eraser){
			if (_self.draw_isIdle) return;
			drawmove(event,_self);
			_self.draw_isIdle = true;
			
			_self.draw_path.push(_self.draw_path_onetime);
			_self.draw_path_onetime = [];
			if(_self.draw_end_callback!==null){
				_self.draw_end_callback();
			};
		}else{
			if (_self.eraser_isIdle) return;
			_self.eraser_isIdle = true;
		};
	};
	
	
	this.draw_canvas.addEventListener('touchstart', function(event) { drawstart(event.touches[0]) }, false);
	this.draw_canvas.addEventListener('touchmove', function(event) { drawmove(event.touches[0]); event.preventDefault(); }, false);
	this.draw_canvas.addEventListener('touchend', function(event) { drawend(event.changedTouches[0]) }, false);  	

	this.draw_canvas.addEventListener('mousedown',function(e){drawstart(e)} , false);
	this.draw_canvas.addEventListener('mousemove',function(e){drawmove(e)} , false);
	this.draw_canvas.addEventListener('mouseup',function(e){drawend(e);} , false);
	this.draw_canvas.addEventListener('mouseout',function(e){drawend(e);} , false);
};

create_write_canvas.prototype.clear = function(){
	this.draw_ctx.clearRect(0, 0, this.draw_canvas.width, this.draw_canvas.height);
	this.draw_path = [];
};

// 根據路徑，重新畫出canvas
// moveTo
// lineTo
// set lineWidth
// stroke