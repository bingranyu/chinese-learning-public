export {predict,Warmup_check}


let IMAGENET_CLASSES = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ'];


const modelJSON = "/model/bopomofo_classifier/model.json";

const IMAGE_SIZE = 28;
const TOPK_PREDICTIONS = 10;

let bopomofo_symbol_net;


const bopomofoWarmup = async () => {
	console.log('Loading model...');
	bopomofo_symbol_net = await tf.loadLayersModel(modelJSON );
	// Warmup the model. This isn't necessary, but makes the first prediction
	console.log('Warmup model ...');
	bopomofo_symbol_net.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 1])).dispose();
	console.log('Warmup completed ...');
}


async function predict(imgElement) {
	console.log("Predicting...");
	const startTime1 = performance.now();
	let startTime2;
	const logits = tf.tidy(() => {
		// tf.browser.fromPixels() returns a Tensor from an image element.
		const img = tf.cast(tf.browser.fromPixels(imgElement,1).resizeBilinear([28,28]), 'float32');
		const normalized = img.div(255);
		// Reshape to a single-element batch so we can pass it to predict.
		const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 1]);

		startTime2 = performance.now();
		// Make a prediction through bopomofo_symbol_net.
		return bopomofo_symbol_net.predict(batched);
	});
	// Convert logits to probabilities and class names.
	const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);
	const totalTime1 = performance.now() - startTime1;
	const totalTime2 = performance.now() - startTime2;
	console.log(`Done in ${Math.floor(totalTime1)} ms ` +
      `(not including preprocessing: ${Math.floor(totalTime2)} ms)`);
	return classes;
}

async function getTopKClasses(logits, topK) {
	const values = await logits.data();
	const valuesAndIndices = [];
	for (let i = 0; i < values.length; i++) {
		valuesAndIndices.push({value: values[i], index: i});
	}
	valuesAndIndices.sort((a, b) => {
		return b.value - a.value;
	});
	const topkValues = new Float32Array(topK);
	const topkIndices = new Int32Array(topK);
	for (let i = 0; i < topK; i++) {
		topkValues[i] = valuesAndIndices[i].value;
		topkIndices[i] = valuesAndIndices[i].index;
	}
	const topClassesAndProbs = [];
	for (let i = 0; i < topkIndices.length; i++) {
		topClassesAndProbs.push({
			className: IMAGENET_CLASSES[topkIndices[i]],
			probability: topkValues[i]
		})
		}
	return topClassesAndProbs;
}

// Warmup 後執行各種任務(也可以掛在EventListener)
var Warmup_check = bopomofoWarmup();
Warmup_check.then(()=>{
	// Make a prediction through the locally hosted img.
	let t = document.createElement('img');
	t.setAttribute("src","bo.png");
	t.setAttribute("width","28");
	t.setAttribute("height","28");
	//document.querySelector("body").append(t);
	//const boElement = document.getElementById('bo');
	//console.log(t);

	if (t.complete && t.naturalHeight !== 0) {
		predict(t).then((data)=>{
			console.log(data);
		});
		//boElement.style.display = '';
	}else {
		t.onload = () => {
			predict(t).then((data)=>{
				console.log(data);
				t.onload = null;
			});
			
			//catElement.style.display = '';
		}
	}
});


