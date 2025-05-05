// OCCIPITAL LOBE WITH OBJECTS
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
	"watch your step",
	"one, two, one, two, one, two, one, two, one, two...",
	"lol did you lock your door",
	"your apartment is flooding you forgot to turn off the water",
	"someone is going through your room right now",
	"call your mom",
	"call your grandma",
	"is this even the right way",
	"you got hit by a car",
	"someone just stabbed you in another life",
	"don't miss your bus idiot",
	"ur gonna drop ur coffee",
	"that caffiene is going to ruin your day",
	"check if ur nose is bleeding",
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
		this.fadeOut = 0.009;
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

let video = document.querySelector("video");

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
		video.pause(); // stop video
		requestAnimationFrame(sleepTime); // begin second animation
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
			thought.fade(thought.fadeOut * deltaTimeMultiplier / 2);
			if (thought.opacity <= 0){
				thoughtArray.shift(); 
			}
			thought.display();
		});
		context.fillStyle = `rgba(255, 0, 0, ${secondOpacity})`;
		context.fillRect(0,0,width,height);
		secondOpacity += .001;
	} else {
		context.fillStyle = `rgba(255, 0, 0, 1)`;
		context.fillRect(0,0,width,height);

		audioElement.pause();

		context.textBaseline = 'middle';
		context.textAlign = 'center'; 
		context.fillStyle = `rgba(255, 255, 255, 1)`;
		context.font = `30px Sono, monospace`;
		context.fillText("go home. it's not worth it.", width/2, height/2);

	}
	requestAnimationFrame(sleepTime);
}
// SECOND ANIMATION END 

// On load, initialize set up and background image
window.addEventListener('load', () => {
	audioElement.play(); 
    setup();  
});

// on click, create animation + increase volume each click
window.addEventListener('pointerdown', () => {
	if (secondAnimation == false){
		window.requestAnimationFrame(fadeThought);
		gainNode.gain.value += .1;
	}
});

// Resize set up
window.addEventListener('resize', () => {
    setup();
});