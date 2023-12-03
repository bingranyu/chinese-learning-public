export{multiplyMatrices,matrixTranspose2D,RemToPixels,getScroll,bopomofo_template,on_end_method,zip};function multiplyMatrices(m1,m2){var result=[];for(var i=0;i<m1.length;i++){result[i]=[];for(var j=0;j<m2[0].length;j++){var sum=0;for(var k=0;k<m1[0].length;k++){sum+=m1[i][k]*m2[k][j];}
result[i][j]=sum;}}
return result;}
function matrixTranspose2D(m){return m[0].map((_,colIndex)=>m.map(row=>row[colIndex]));}
function RemToPixels(rem){return rem*parseFloat(getComputedStyle(document.documentElement).fontSize);}
var getScroll=function(){if(window.pageYOffset!=undefined){return[pageXOffset,pageYOffset];}else{var sx,sy,d=document,r=d.documentElement,b=d.body;sx=r.scrollLeft||b.scrollLeft||0;sy=r.scrollTop||b.scrollTop||0;return[sx,sy];}}
var bopomofo_template=[(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: ${s*0.25}px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.35}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.25}px;left: ${s*0.3}px;"></div>
</div>`,(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: ${s*0.15}px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.25}px;left: 0px;"></div>
	<div class="bopomo_symbol2" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.55}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.4}px;left: ${s*0.3}px;"></div>
</div>`,(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: 0px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.1}px;left: 0px;"></div>
	<div class="bopomo_symbol2" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.4}px;left: 0px;"></div>
	<div class="bopomo_symbol3" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.7}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.55}px;left: ${s*0.3}px;"></div>
</div>`];var play_list_audio=function(audio_list){var wordlist=JSON.parse(JSON.stringify(audio_list));var loop_play_audio=function(){var fpath=wordlist.shift()
var audio=new Audio(fpath);if(wordlist.length>0){audio.addEventListener("ended",function(){loop_play_audio();});}
audio.play();}
loop_play_audio();}
var on_end_method=function(){var onArgs=Array.prototype.slice.call(arguments);var originalFunction=this.__proto__[onArgs[0]];var givenCallback=onArgs[1];var callbackArgs=onArgs.slice(2);this.__proto__[onArgs[0]]=function(){var args=Array.prototype.slice.call(arguments);originalFunction.apply(this,args);givenCallback.apply(this,callbackArgs);}}
var zip=rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));