class KarplusStrongProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0][0]; // input 0, channel 0
        const output = outputs[0][0];
        var prev = 0;
        for(let i = 0; i < input.length; i++) {
            output[i] = (input[i] + prev) / 2;
            prev = input[i];
        }
        return true;
    }
}
  
registerProcessor('karplus-strong-processor', KarplusStrongProcessor)