// Javascript for FRONTAL LOBE
// Standard Full Screen canvas set up 
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

  context.fillStyle = "white";
}

// CONNECT AUDIO ELEMENT
// access the audio element + create audio context + place in context
const audioElement = document.querySelector('audio');
const audioContext = new AudioContext();
const audioTrack = audioContext.createMediaElementSource(audioElement);
const gainNode = new GainNode(audioContext, {gain: 0.5});

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
	"I could... if I finish my work!",
	"you don't really want to go...",
	"make sure you confirm the night before",
	"surprised they still want to hang out with you!",
	"it's going to be rude if you cancel!",
	"they are just hanging out with you to be nice...",
	"no way they actually still want to hang out with you",
	"you have to watch that episode before you see them",
	"remember the embarrassing thing you said last time you hung out?",
	"last time u flaked, you have to go!",
	"if you don't show up they'll never talk to u again",
	"you have to finish your homework before you go",
	"remember to be polite!",
	"be normal so they invite you again",
]; 

// Select for CSS background color / image / create image scale
const background = document.querySelector("body");
const image = document.querySelector("img"); 
const imgScale = 1; 

// CREATE INTRUSTIVE THOUGHT OBJECTS
// Thought Array
let thoughtArray = [];

class thoughtObject{
	constructor(){
		this.text = thoughts[Math.floor(Math.random()*thoughts.length)];
		this.xPos = Math.floor(Math.random()*width);
		this.yPos = Math.floor(Math.random()*height);
		this.size = Math.floor(Math.random()*30)+20;

		this.opacity = 1.0;
		this.fadeOut = 0.01;
	}

	display(){
		context.globalAlpha = this.opacity;

		context.textBaseline = 'middle';
		context.textAlign = 'center'; 
		context.fillStyle = `rgba(255, 255, 255, ${this.opacity}`;
		context.font = `${this.size}px Sono, monospace`;
		context.fillText(this.text, this.xPos, this.yPos);
	}

	fade(amount) {
		if (this.opacity > 0) {
			this.opacity -= amount;
			if (this.opacity < 0) {
				this.opacity = 0;
			}
		}
	}
}

function newThought(){
	// When newThought() is called, create a new thought object and place it into the array
	let thought = new thoughtObject();
	thoughtArray.push(thought);
}

// Establish animation set up
let fps = 60;
let previousTime = performance.now();
let frameInterval = Math.floor(1000 / fps);
let deltaTimeMultiplier = 1;
let delta_time = 0;

let thoughtCount = 0;

let secondAnimation = false;

// function to call the animation of re-occuring thought objects
function fadeThought(currentTime){	
	deltaTime = currentTime - previousTime;
	deltaTimeMultiplier = deltaTime / frameInterval;
	previousTime = currentTime;

	// control speed of thoughts popping up
	if (thoughtCount%10==0) {
		newThought();
	}
	thoughtCount+=1;
	
	// clear all previous iterations
	context.clearRect(0,0, width, height);

	// Fade though out time
	thoughtArray.forEach((thought)=>{
		thought.display();

		thought.fade(thought.fadeOut * deltaTimeMultiplier);
		if (thought.opacity <= 0){
			thoughtArray.shift(); 
		}
	});

	// if thought array == 150 thoughts, then cancel animation frame move onto the next animation
	if (thoughtArray.length==150){
		secondAnimation = true;
		context.save(); 
		requestAnimationFrame(sleepTime);
	}

	// before second animation 
	if (secondAnimation==false){
		requestAnimationFrame(fadeThought);
	}
}

// SECOND ANIMATION BEGINS
let secondOpacity = 0.0;

// Function to fade all thoughts + fill screen to black  
function sleepTime(currentTime){	
	deltaTime = currentTime - previousTime;
	deltaTimeMultiplier = deltaTime / frameInterval;
	previousTime = currentTime;

	context.clearRect(0,0,width,height);

	if (secondOpacity <= 1){
		// Make all thoughts fade away
		thoughtArray.forEach((thought)=>{
			thought.fade(thought.fadeOut * deltaTimeMultiplier );
			if (thought.opacity <= 0){
				thoughtArray.shift(); 
			}
			thought.display();
		
		});
		secondOpacity += .01 * deltaTimeMultiplier;
		context.fillStyle = `rgba(255, 255, 255, ${secondOpacity})`;
		context.fillRect(0,0,width,height);

	} else {
		context.globalAlpha = 1;
		context.fillStyle = `rgba(255, 0, 0, ${secondOpacity})`;
		context.fillRect(0, 0, width,height);

		audioElement.play(); 

		context.textBaseline = 'middle';
		context.textAlign = 'center'; 
		context.fillStyle = `rgba(255, 255, 255, 1)`;
		context.font = `30px Sono, monospace`;
		context.fillText("don't go. it's not worth it.", width/2, height/2);

	} 
	// INSERT NEXT ANIMATION HERE????? 
	requestAnimationFrame(sleepTime);
}
// SECOND ANIMATION END  


// On load, initialize set up and background image
window.addEventListener('load', () => {
    setup();  
});

// on click, create animation
window.addEventListener('pointerdown', () => {
	if (secondAnimation == false){
		window.requestAnimationFrame(fadeThought);
	}
});

// Resize set up
window.addEventListener('resize', () => {
    setup();
});
