export {bopomofo_template};



var bopomofo_template = [(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: ${s*0.25}px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.35}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.25}px;left: ${s*0.3}px;"></div>
</div>`,
(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: ${s*0.15}px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.25}px;left: 0px;"></div>
	<div class="bopomo_symbol bopomo_symbol2" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.55}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.4}px;left: ${s*0.3}px;"></div>
</div>`,
(s)=>`<div style="height: ${s}px;width: ${s*0.5}px;position: relative;">
    <div class="tone_2" style="width: ${s*0.1}px;height: ${s*0.1}px;position: absolute;top: 0px;left: ${s*0.1}px;"></div>
	<div class="bopomo_symbol bopomo_symbol1" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.1}px;left: 0px;"></div>
	<div class="bopomo_symbol bopomo_symbol2" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.4}px;left: 0px;"></div>
	<div class="bopomo_symbol bopomo_symbol3" style="width: ${s*0.3}px;height: ${s*0.3}px;position: absolute;top: ${s*0.7}px;left: 0px;"></div>
	<div class="tone_1" style="width: ${s*0.2}px;height: ${s*0.2}px;position: absolute;top: ${s*0.55}px;left: ${s*0.3}px;"></div>
</div>`];