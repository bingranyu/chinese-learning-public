import {create_svg_font} from "./create_svg_font.js";
import {tonal_marks, bopomo_category} from "./utility.js";
export {create_svg_bopomo};

var create_svg_bopomo = function(bopomo_str,param={}){
	this.bopomo_str = bopomo_str;
	var default_param = {"wh":100,"color":"#000","bgcol":null};
	this.param = $.extend( {},default_param, param);
	this.bopomo_list = this.bopomo_str.split('');
	this.bopomo_symbol = this.bopomo_list.filter((v)=>!tonal_marks.includes(v));
	this.bopomo_tone = this.bopomo_list.filter((v)=>tonal_marks.includes(v));
	this.bopomo_symbol = this.bopomo_symbol.sort((a,b)=>bopomo_category[a]-bopomo_category[b]);
	
	var _self2 = this;
	var bopomo_str_param = JSON.parse(JSON.stringify(_self2.param));
	bopomo_str_param["wh"] = _self2.param["wh"]*0.3;
	this.bopomo_svg_obj = this.bopomo_symbol.map((v)=>new create_svg_font(v,bopomo_str_param));
	this.back_canvas = document.createElement("canvas");
	this.back_canvas.setAttribute('width', this.param['wh']*0.5);
	this.back_canvas.setAttribute('height', this.param['wh']);
	this.back_ctx = this.back_canvas.getContext('2d');
	
	var bopomo_position_start;
	if(this.bopomo_symbol.length==1){
		bopomo_position_start = this.param['wh']*0.35;
	}else if(this.bopomo_symbol.length==2){
		bopomo_position_start = this.param['wh']*0.25;
	}else if(this.bopomo_symbol.length==3){
		bopomo_position_start = this.param['wh']*0.1;
	};
	
	var tmp = bopomo_position_start;
	
	var _self2 = this;
	_self2.defer_arr = _self2.bopomo_svg_obj.map((v)=>v.deffered_obj);
	$.when(..._self2.defer_arr).then(function(){
		for(var i=0;i<_self2.bopomo_symbol.length;i++){
			_self2.back_ctx.drawImage(_self2.bopomo_svg_obj[i].back_canvas, 0, tmp);
			tmp+=_self2.param['wh']*0.3;
		};
	});

	if(_self2.bopomo_tone.length == 1){
		if(_self2.bopomo_tone[0] != '˙'){
			var tone_svg_obj = new create_svg_font(_self2.bopomo_tone[0],{"wh":_self2.param['wh']*0.2});
			tone_svg_obj.deffered_obj.then(function(){
				_self2.back_ctx.drawImage(tone_svg_obj.back_canvas, _self2.param['wh']*0.3, _self2.param['wh']*(0.25 + 0.15*(_self2.bopomo_symbol.length-1)));
			});
		}else{
			var tone_svg_obj = new create_svg_font(_self2.bopomo_tone[0],{"wh":_self2.param['wh']*0.1});
			tone_svg_obj.deffered_obj.then(function(){
				_self2.back_ctx.drawImage(tone_svg_obj.back_canvas, _self2.param['wh']*0.1, bopomo_position_start - _self2.param['wh']*0.1);
			});
		};
		_self2.defer_arr.push(tone_svg_obj.deffered_obj);
		
	};

};
// let t = new create_svg_bopomo("ㄒㄧㄠˇ",{'wh':100});
// t.back_canvas