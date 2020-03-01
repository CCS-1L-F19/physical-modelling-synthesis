class KarplusChordProcessor extends AudioWorkletProcessor {

    prev = 0; // last sample from previous 128 sample batch

    process(inputs, outputs, parameters) {
        const input = inputs[0][0]; // input 0, channel 0
        const output = outputs[0][0];
        
        for(let i = 0; i < input.length; i++) {
            output[i] = (input[i] + this.prev) / 2;
            this.prev = input[i];
        }
        return true;
    }
}
  
registerProcessor('karplus-chord-processor', KarplusChordProcessor)