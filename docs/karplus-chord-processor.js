class KarplusChordProcessor extends AudioWorkletProcessor {

    static get parameterDescriptors () {
        return [{
          name: 'loss_factor',
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: 'a-rate'
        },
        {
            name: 'stretch_factor',
            defaultValue: .5,
            minValue: 0,
            maxValue: 1,
            automationRate: 'a-rate'
          }, 
          {
            name: 'b',
            defaultValue: 1,
            minValue: 0,
            maxValue: 1,
            automationRate: 'a-rate'
          }]
    }

    prev = 0; // last sample from previous 128 sample batch
    
    process(inputs, outputs, parameters) {
        const stretch = parameters['stretch_factor'][0];
        const loss = parameters['loss_factor'][0];
        const b = parameters['b'][0];

        const input = inputs[0][0]; // input 0, channel 0
        const output = outputs[0][0];
        var sign;
        for(let i = 0; i < input.length; i++) {
            sign = -1;
            if(Math.random() < b) {
                sign = 1;
            }
            output[i] = 2 * sign * loss * ((1 - stretch) * input[i] + stretch * this.prev);
            this.prev = input[i];
        } 
        return true;
    }
}
  
registerProcessor('karplus-chord-processor', KarplusChordProcessor)