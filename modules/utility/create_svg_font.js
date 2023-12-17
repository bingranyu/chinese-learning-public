export {create_svg_font};
import {RemToPixels} from "./utility.js";

var coord_param_sort = function(a, b){
  var arrA = a.name.split('');
  var arrB = b.name.split('');
  var keyA2 = parseInt(arrA[1]);
  var keyB2 = parseInt(arrB[1]);

  // Compare the 2 keys
  if (keyA2 < keyB2) return -1;
  if (keyA2 > keyB2) return 1;
  return arrA[0].localeCompare(arrB[0]);
};



var create_svg_font = function(font_str,param={}){
	this.font_str = font_str;
	this.charcode = font_str.charCodeAt(0).toString(16);
	var default_param = {"wh":100,"color":"#000","bgcol":null,"n_stroke":"all"};
	this.param = $.extend( {},default_param, param);
	this.back_canvas = document.createElement("canvas");
	this.back_canvas.setAttribute('width', this.param.wh);
	this.back_canvas.setAttribute('height', this.param.wh);
	this.font_ratio = this.param.wh/2000;
	this.back_ctx = this.back_canvas.getContext('2d');
	if(typeof this.param.wh == "string"){
		if(/rem$/.test(this.param.wh)){
			this.param.wh = RemToPixels(parseInt(this.param.wh.replace("rem","")));
		};
	};
	// get info
	let xmlurl = "./data/svg/"+this.charcode.toUpperCase() +".svg";
	var _self = this;
	_self.fontxml;
	_self.deffered_obj = $.ajax({type: "GET",'url':xmlurl,dataType: "xml"}).done(function(xml){
		_self.fontxml = xml;
		_self.strokelist = [..._self.fontxml.querySelectorAll(`:scope ${'Stroke'}`)];
		_self.outlinelist = _self.strokelist.map((v)=>v.querySelector(`:scope ${'Outline'}`));
		_self.tracklist = _self.strokelist.map((v)=>v.querySelector(`:scope ${'Track'}`));
	});
	// draw
	this.deffered_obj.done(function(){
		// draw Font
		if(_self.param.n_stroke=="all"){
			_self.SingleOutline(_self.strokelist.length,true);
		}else{
			_self.SingleOutline(_self.param.n_stroke,false);
		};
	});
};

// Canvas與xml tag的對照表
create_svg_font.prototype.GetMappingFn = function(ctx){
	var _self = this;
	return {
		'moveto':function(args){ctx.moveTo(...args.map((v)=>v*_self.font_ratio))},
		'lineto':function(args){ctx.lineTo(...args.map((v)=>v*_self.font_ratio))},
		'quadto':function(args){ctx.quadraticCurveTo(...args.map((v)=>v*_self.font_ratio))},
		'cubicto':function(args){ctx.bezierCurveTo(...args.map((v)=>v*_self.font_ratio))}
	};
};

// 筆畫繪製
create_svg_font.prototype.SingleOutline = function(outline_idx,cum=false,clear=true,color=null){
	var _self = this;
	if(cum){
		var outline = _self.outlinelist.slice(0,outline_idx+1);
	}else{
		var outline = [_self.outlinelist[outline_idx]];
	};
	
	if(color===null){
		color = _self.param.color;
	};
	
	var mapfn = _self.GetMappingFn(_self.back_ctx);
	if(clear){
		_self.back_ctx.clearRect(0, 0, _self.back_canvas.width, _self.back_canvas.height);
	};

	// draw BG
	if(_self.param.bgcol != null){
		_self.back_ctx.fillStyle = _self.param.bgcol ;
		_self.back_ctx.fillRect(0, 0, _self.back_canvas.width, _self.back_canvas.height);
	};
	_self.back_ctx.beginPath();
	outline.map((v)=>[...v.children]).flat().forEach(function(v){
		let val = [...v.attributes].filter(function(t){return /^(x|y)[0-9]{0,1}/i.test(t.name);}).sort(coord_param_sort).map((s)=>parseFloat(s.value));
		mapfn[v.tagName.toLowerCase()](val);
	});
	_self.back_ctx.closePath();
	_self.back_ctx.fillStyle = color;
	_self.back_ctx.fill();
	
	return _self.back_canvas;
};

