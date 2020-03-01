class KarplusDrumProcessor extends AudioWorkletProcessor {

    prev = 0; // last sample from previous 128 sample batch

    static get parameterDescriptors () {
        return [{
          name: 'b',
          defaultValue: .3,
          minValue: 0,
          maxValue: 1,
          automationRate: 'a-rate'
        }]
      }

    process(inputs, outputs, parameters) {
        const input = inputs[0][0]; // input 0, channel 0
        const output = outputs[0][0];
        const b = parameters['b'][0];
        var sign = -1;
        if(Math.random() < b) {
            sign = 1;
        }
        for(let i = 0; i < input.length; i++) {
            output[i] = sign * (input[i] + this.prev) / 2;
            this.prev = input[i];
        }
        return true;
    }
}
  
registerProcessor('karplus-drum-processor', KarplusDrumProcessor)