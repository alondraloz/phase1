// Standard Full Screen canvas set up
// On this page, you can control the random good thoughts as they pop up!!!
// They're random but you can click on them 
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

let width;
let height;
let pxScale = window.devicePixelRatio;

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * pxScale;
  canvas.height = height * pxScale;
  context.scale(pxScale, pxScale);
}

// CONNECT AUDIO ELEMENT
// access the audio element + create audio context + place in context
const audioElement = document.querySelector('audio');
const audioContext = new AudioContext();
const audioTrack = audioContext.createMediaElementSource(audioElement);
const gainNode = new GainNode(audioContext, {gain: 0.0});

// create array to analyze audio data and then use it later
const analyzer = new AnalyserNode(audioContext, {smoothingTimeConstant: 0.95, fftSize: 256}); // avg samples for smoother waveform
const bufferLength = analyzer.frequencyBinCount; // (read-only property)
let dataArray = new Uint8Array(bufferLength); // unsigned (positive) integer array

let dataSequence;

// connect audio graph 
audioTrack.connect(gainNode).connect(analyzer).connect(audioContext.destination);
// END OF ESTABLISHING AUDIO

// Intrustive thoughts array
let thoughts = [
	"biking", "sparkling water", 
	"people watching", "sitting on the couch",
	"vanilla yogurt", "skirts in the summer",
	"feeding the birds", "lake michigan",
	"outfit repeating", "mexican food",
	"flat shoes", 
	"singing",
	"playing pool",
	"wandering",
	"orange wine",
	"running in the dark",
	"driving with the windows down",
	"jazz",
]; 

// CREATE OBJECTS WITH INTRUSIVE THOUGHTS 
// Thought Array
let thoughtArray = [];

class thoughtObject{
	constructor(){
		this.text = thoughts[Math.floor(Math.random()*thoughts.length)];
		this.xPos = Math.floor(Math.random()*width);
		this.yPos = 0;
		this.size = Math.floor(Math.random()*30)+20;

		this.opacity = 1.0;
		this.fadeOut = 0.003;
	}

	display(){
		context.globalAlpha = this.opacity;

		context.textBaseline = 'middle';
		context.textAlign = 'center'; 
		context.fillStyle = `rgba(255, 255, 255, ${this.opacity}`;
		context.font = `${this.size}px Sono, monospace`;
		context.fillText(this.text, this.xPos, this.yPos);
	}

	move(amount){
		this.yPos += amount;
	}

	fade(amount) {
		if (this.opacity > 0) {
			this.opacity -= amount;
			if (this.opacity < 0) {
				this.opacity = 0;
			}
		}
	}
} // End of thoughtObject 

function newThought(event){
	// On each click, a random thought will appear at the top of the screen 
	let thought = new thoughtObject();
	thoughtArray.push(thought);

	// display a thought in a random place
	// thought.display();
}
// END OF OBJECT

// Establish animation set up
let fps = 60;
let previousTime = performance.now();
let frameInterval = Math.floor(1000 / fps);
let deltaTimeMultiplier = 1;
let delta_time = 0;

// function to make the text fall down the screen + change colors
function fallThought(currentTime){
	deltaTime = currentTime - previousTime;
	deltaTimeMultiplier = deltaTime / frameInterval;
	previousTime = currentTime;

	// clear all previous iterations
	context.clearRect(0,0, width, height);

	// lower position of the thought + fade
	thoughtArray.forEach((thought)=>{
		thought.move(5 * deltaTimeMultiplier);
		thought.display();

		thought.fade(thought.fadeOut *deltaTimeMultiplier);
		if (thought.opacity <= 0){
			thoughtArray.shift(); 
		}
	});

	requestAnimationFrame(fallThought);
}


// On any click, an intrusive thought will pop up on random x
window.addEventListener('pointerdown', () =>{
	newThought();
	if (gainNode.gain.value <=1){
		gainNode.gain.value += .1;
	}
});

// On load, initialize set up and background image + initialize animation of thoughts falling
window.addEventListener('load', () => {
    setup(); 
    audioElement.play(); 
    window.requestAnimationFrame(fallThought); 
});


window.addEventListener('resize', () => {
    setup();
});

