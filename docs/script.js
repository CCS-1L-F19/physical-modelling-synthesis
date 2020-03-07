//globals
const noiseTypes = {
    WHITE: "white noise",
    CONSTANT: "constant"
}

const nodeTypes = {
    SOURCE: "source",
    DELAY: "delay",
    LOWPASS_FILTER: "lowpass filter",
    KARPLUS: "karplus"
}

const defaults = {
    lowpass: 5500,
    duration: 50,
    gain: 1,
    noiseType: noiseTypes.WHITE
};

var noiseType = defaults.noiseType;

// canvas

var canvasContext = document.getElementById("canvas").getContext('2d');
canvasContext.canvas.width = window.innerWidth - 43;
canvasContext.canvas.height = window.innerHeight * 0.8;

var canvas = oCanvas.create({
    canvas: "#canvas",
});

// window.onresize = () => {
//     canvasContext.canvas.width = window.innerWidth - 43;
//     canvas.redraw();
// }

var nodeProto = canvas.display.rectangle({
    origin: { x: "center", y: "center" },
    height: 50,
    fill: "#079",
    stroke: "10px #079",
    join: "round"
});

var nodeLabelProto = canvas.display.text({
    x: 0,
    y: 0,
    align: "center",
    origin: {x: "center", y: 20},
    font: "bold 20px sans-serif",
    fill: "#fff"
});

var nodeSubtextProto = canvas.display.text({
    x: 0,
    y: 15,
    origin: { x: "center", y: "center" },
    align: "center",
    font: "15px sans-serif",
    fill: "#fff"
});

var nodes = [];
var durationNodes = [];
var selectedNodes = [];
var currNode = null;
var dragged = false;
var selecting = false;

function createNode(options) {

    var node = nodeProto.clone({
        width: options.width,
        x: options.x,
        y: options.y
    });

    node.startingLines = [];
    node.endingLines = [];
    node.audioNode = options.audioNode;


    var label = nodeLabelProto.clone({
        text: options.labeltext,
        
    });
    node.label = label;

    var subtext = nodeSubtextProto.clone({
        text: options.subtext,
    });
    node.subtext = subtext;


    var clone;

    if(options.modalType !== "none") {
        var modalTemplate = document.getElementById(options.modalType);
        clone = modalTemplate.content.cloneNode(true);
        
        node.modal = clone.firstElementChild;


        if(options.modalType == "delay_modal") {
            var input = clone.getElementById("duration_input");
            input.oninput = () => change_duration(input);
            var slider = clone.getElementById("duration_slider");
            slider.oninput = () => change_duration(slider);
        }
        else if(options.modalType == "filter_modal") {
            var slider = document.getElementById("lowpass_slider");
            var lab = clone.getElementById("lowpass_label");
            slider.oninput = () => change_lowpass_cutoff(slider, lab);
        }

        else if(options.modalType == "chord_modal") {

            var drum_slider = clone.getElementById("drum_slider");
            var drum_label = clone.getElementById("drum_label");
            drum_slider.oninput = () => change_audio_param('b', drum_slider.value / 100, drum_label);

            var loss_slider = clone.getElementById("loss_slider");
            var loss_label = clone.getElementById("loss_label");
            loss_slider.oninput = () => change_audio_param('loss_factor', loss_slider.value / 100, loss_label);

            var stretch_slider = clone.getElementById("stretch_slider");
            var stretch_label = clone.getElementById("stretch_label");
            stretch_slider.oninput = () => change_audio_param('stretch_factor', stretch_slider.value/100, stretch_label);
        } 
        else if(options.modalType == "source_modal") {

            var input = clone.getElementById("duration_input");
            input.oninput = () => change_duration(input);

            var slider = clone.getElementById("duration_slider");
            slider.oninput = () => change_duration(slider);

            var selector = clone.querySelector('select');
            selector.onchange = () => change_noise_type(selector, slider);
        }
        
        var body = document.querySelector('body');
        body.appendChild(clone);
        
    }
    
    function openModal() {
        if(!selecting) {
            if(dragged) {
                dragged = false;
            }
            else {
                currNode = node; 
                if(options.modalType !== "none") {
                    node.modal.style.display = "block";
                }
            }
        }
    }

    function whileDragging() {
        for(var line of node.startingLines) {
            updateLineStart(node, line);
        }
        for(var line of node.endingLines) {
            updateLineEnd(node, line);
        }
    }

    node.bind("click tap", openModal);
    node.dragAndDrop({ changeZindex: true, move: function(){dragged = true; whileDragging();}});
    node.addChild(label);
    node.addChild(subtext);
    canvas.addChild(node);
    return node;
}

function connectPair(n1, n2) {
    if(n1.audioNode) {
        n1.audioNode.connect(n2.audioNode);
    }

    var line = drawLineBetween(n1, n2);
    n1.startingLines.push(line);
    n2.endingLines.push(line);
}

function drawLineBetween(n1, n2) {
    var line = canvas.display.line({
        start: {x: n1.x, y: n1.y},
        end: {x: n2.x, y: n2.y},
    });
    
    canvas.addChild(line);
    line.zIndex = "back";
    return line;
}

function updateLineStart(node, line) {
    line.start = {x: node.x, y: node.y};
    canvas.redraw();
}  

function updateLineEnd(node, line) {
    line.end = {x: node.x, y: node.y};
    canvas.redraw();
}


// Audio init

var bufferLength = defaults.duration;



const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
console.log("is secure: " + window.isSecureContext)

function generateBuffer(len, noiseType) {

    var audioBuffer = new AudioBuffer({numberOfChannels: 1, length: len, sampleRate: audioCtx.sampleRate});
    var buffer = audioBuffer.getChannelData(0);
    switch(noiseType) {
        
        case noiseTypes.WHITE:
            for(var i = 0; i < buffer.length; i++) {
                buffer[i] = 2 * Math.round(Math.random()) - 1;
            }
            break;
        case noiseTypes.CONSTANT:
            for(var i = 0; i < buffer.length; i++) {
                buffer[i] = 1;
            }
            break;
    }
    return audioBuffer;
}
async function audioSetup() {
    await audioCtx.audioWorklet.addModule('karplus-chord-processor.js');
}
audioSetup().then(() => {

    var karplus = new AudioWorkletNode(audioCtx, 'karplus-chord-processor');
    
    var delay = new DelayNode(audioCtx, {delayTime: defaults.duration / audioCtx.sampleRate});
    // var gain = new GainNode(audioCtx, {gain: 2 * defaults.gain});
    var filter = new BiquadFilterNode(audioCtx, {type: 'lowpass', frequency: defaults.lowpass, Q: 0});
    var merge = new ChannelMergerNode(audioCtx, {numberOfInputs: 2});
    var split = new ChannelSplitterNode(audioCtx, {numberOfOutputs: 2});

    var sourceBufferNode = createNode({width: 200, x: 150, y: 50, labeltext: "Source (" + defaults.duration + " samples)", subtext: "type: " + defaults.noiseType, audioNode: null, modalType: "source_modal"});
    durationNodes.push(sourceBufferNode);
    var mergeNode = createNode({width: 100, x: 500, y: 50, labeltext: "Merge", subtext: "", audioNode: merge, modalType: "none"});
    var delayNode = createNode({width: 200, x: 500, y: 300, labeltext: "Delay", subtext: "Delay: " + defaults.duration + " samples", audioNode: delay, modalType: "delay_modal"});
    durationNodes.push(delayNode);
    // var filterNode = createNode({width: 200, x: 300, y: 150, labeltext: "Lowpass Filter", subtext: "cutoff frequency: " + defaults.lowpass + " hz", audioNode: filter, modalType: "filter_modal"});
    var karplusNode = createNode({width: 200, x: 300, y: 150, labeltext: "Karplus-Strong Filter", subtext: "", audioNode: karplus, modalType: "chord_modal"});
    var destNode = createNode({width: 150, x: 850, y: 50, labeltext: "Destination", subtext: "", audioNode: split, modalType: "none"});

    nodes.push(sourceBufferNode, mergeNode, delayNode, karplusNode, destNode);
    

    connectPair(mergeNode, delayNode);
    // connectPair(gainNode, delayNode);
    connectPair(delayNode, karplusNode);
    connectPair(karplusNode, mergeNode);
    // connectPair(delayNode, filterNode);
    // connectPair(filterNode, mergeNode);
    connectPair(mergeNode, destNode);
    connectPair(sourceBufferNode, mergeNode);


    canvas.redraw();

    const startButton = document.getElementById("start");

    
    document.body.onkeyup = function(e){
        if(e.keyCode == 32){
            start();
        }
    }
    startButton.onclick = start;
    
    function start() {

        audioCtx.resume();
        var buffer = generateBuffer(bufferLength, noiseType);
        var source = new AudioBufferSourceNode(audioCtx, {buffer: buffer}); // creates a source to play the pluck buffer from 
        
        source.connect(merge);        
        split.connect(audioCtx.destination);
        source.start();

        // setTimeout(() => {
        //     pluckSource.stop(); 
        //     },
        //     1000);
    }

    // const stopButton = document.getElementById("stop");
    //  stopButton.onclick = function() {
    //     console.log("stop");
    //     pluckSource.disconnect();
    //     merge.disconnect();
    //     delay.disconnect();
    //     gain.disconnect();
    //     filter.disconnect();
    //     split.disconnect();
    //     pluckSource.stop();  
    // }
});

function connectNodes(nodes) {

}

function change_lowpass_cutoff(slider, label) {
    document.getElementById("lowpass_label").innerHTML = "Lowpass Cutoff: " + slider.value;
    currNode.audioNode.frequency.setValueAtTime(slider.value, audioCtx.currentTime);
    currNode.subtext.text = "cutoff frequency: " + slider.value + " hz";
    canvas.redraw();
}

function change_duration(slider) {

    var labels = document.getElementsByClassName("sample_label");
    for(var i = 0; i < labels.length; i++) {
        labels[i].innerHTML = slider.value + " samples";
    }
    var sliders = document.getElementsByClassName("duration_slider");
    for(var i = 0; i < sliders.length; i++) {
        sliders[i].value = slider.value;
    }
    for(var durationNode of durationNodes) {
        if(durationNode.audioNode) {
            durationNode.audioNode.delayTime.setValueAtTime(slider.value / audioCtx.sampleRate, audioCtx.currentTime);
            durationNode.subtext.text = "delay: " + slider.value + " samples";
        }
        else {
            durationNode.label.text = "Source (" + slider.value + " samples)";
        }
    }
    bufferLength = slider.value;

    canvas.redraw();
}

 function change_noise_type(selector, slider) {
    
    var key = Object.keys(noiseTypes).find(key => noiseTypes[key] === selector.value);
    noiseType = noiseTypes[key];
    currNode.subtext.text = "type: " + noiseType;
    pluckBuffer = new AudioBuffer({numberOfChannels: 1, length: slider.value, sampleRate: audioCtx.sampleRate});
    canvas.redraw();
}

function change_audio_param(param, value, label) {
    const audioParam = currNode.audioNode.parameters.get(param);
    audioParam.setValueAtTime(value, audioCtx.currentTime);
    label.innerHTML = value;
}

window.onclick = function(event) {
    if(currNode){
        if (event.target == currNode.modal) {
            closeModal(currNode.modal);
        }
    }
}

var addNode = document.getElementById("add_node");
var nodeSelector = document.getElementById("node_selector");
addNode.onclick = function() {
    var nodeType = nodeTypes[Object.keys(nodeTypes).find(key => nodeTypes[key] === nodeSelector.value)];
    switch(nodeType) {
        case nodeTypes.SOURCE:
            var n = createNode({width: 200, x: 100, y: 100, labeltext: "Source (" + defaults.duration + " samples)", subtext: "type: " + defaults.noiseType, audioNode: null, modalType: "source_modal"});
            durationNodes.push(n);
            break;
        case nodeTypes.DELAY:
            createNode({width: 200, x: 100, y: 100, labeltext: "Delay", subtext: "Delay: " + defaults.duration + " samples", audioNode: delay, modalType: "delay_modal"});
            durationNodes.push(n);
            break;
        case nodeTypes.LOWPASS_FILTER:
            createNode({width: 200, x: 100, y: 100, labeltext: "Lowpass Filter", subtext: "cutoff frequency: " + defaults.lowpass + " hz", audioNode: filter, modalType: "filter_modal"});
            break;
        case nodeTypes.KARPLUS:
            createNode({width: 200, x: 100, y: 100, labeltext: "Karplus-Strong Filter", subtext: "", audioNode: karplus, modalType: "chord_modal"});
            break;
    }

    canvas.redraw();
}

function closeModal(modal) {
    modal.style.display = "none";
}

$(document).ready(function(){
    $('button#select').click(function(){
        selecting = !selecting;
        $(this).toggleClass("down");
    });
});