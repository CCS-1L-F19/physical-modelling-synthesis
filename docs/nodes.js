(function() {

    function FilterNode(label, cutoff) {
        this.Container_constructor();
        this.label = label;
        this.cutoff = cutoff;
        // this.audioNode = audioCtx.
    
        this.setup();
    }
    var p = createjs.extend(FilterNode, createjs.Container);
    

    
    p.setup = function() {
        var name = new createjs.Text(this.label, "20px Arial", "#000");
        name.textBaseline = "top";
        name.textAlign = "center";
    
        this.cutoffText = new createjs.Text("Cutoff frequency:" + this.cutoff, "12px Arial", "#000");
        this.cutoffText.textBaseline = "top";
        this.cutoffText.textAlign = "center";
        
        var width = Math.max(name.getMeasuredWidth(), this.cutoffText.getMeasuredWidth()) + 30;
        var height = name.getMeasuredHeight() + this.cutoffText.getMeasuredHeight()+30;
        
        name.x = width/2;
        name.y = 10;
    
        this.cutoffText.x = width/2;
        this.cutoffText.y = name.y + 30;
        
        var background = new createjs.Shape();
        background.graphics.beginStroke("Black").drawRoundRect(0, 0, width, height, 10);
        
        this.addChild(background, name);
        this.addChild(background, this.cutoffText);

        this.on("click", this.handleClick);
        this.cursor = "pointer";
    };
    
    p.handleClick = function (event) {
        this.cutoffText.text = "clicked";
    };
    
    window.FilterNode = createjs.promote(FilterNode, "Container");
}());

(function() {

    function InputNode(duration, type) {
        this.Container_constructor();
        this.duration = duration;
        this.type = type;
    
        this.setup();
    }
    var p = createjs.extend(InputNode, createjs.Container);
    
    p.setup = function() {
        var name = new createjs.Text("Input Node (length = " + this.duration + ")", "20px Arial", "#000");
        name.textBaseline = "top";
        name.textAlign = "center";
    
        this.typeLabel = new createjs.Text("Wave type:" + this.type, "12px Arial", "#000");
        this.typeLabel.textBaseline = "top";
        this.typeLabel.textAlign = "center";
        
        var width = Math.max(name.getMeasuredWidth(), this.typeLabel.getMeasuredWidth()) + 30;
        var height = name.getMeasuredHeight() + this.typeLabel.getMeasuredHeight()+30;
        
        name.x = width/2;
        name.y = 10;
    
        this.typeLabel.x = width/2;
        this.typeLabel.y = name.y + 30;
        
        var background = new createjs.Shape();
        background.graphics.beginStroke("Black").drawRoundRect(0, 0, width, height, 10);
        
        this.addChild(background, name);
        this.addChild(background, this.typeLabel);

        this.on("click", this.handleClick);
        this.cursor = "pointer";
    };
    
    p.handleClick = function (event) {

    };
    
    window.InputNode = createjs.promote(InputNode, "Container");
}());
    
(function() {

    function DelayNode(duration) {
        this.Container_constructor();
        this.duration = duration;
    
        this.setup();
    }
    var p = createjs.extend(DelayNode, createjs.Container);
    
    p.setup = function() {
        this.name = new createjs.Text("Delay Node (length = " + this.duration + ")", "20px Arial", "#000");
        this.name.textBaseline = "top";
        this.name.textAlign = "center";
    
        
        var width = this.name.getMeasuredWidth() + 30;
        var height = this.name.getMeasuredHeight() + 20;
        
        this.name.x = width/2;
        this.name.y = 10;
        
        var background = new createjs.Shape();
        background.graphics.beginStroke("Black").drawRoundRect(0, 0, width, height, 10);
        
        this.addChild(background, this.name);

        this.on("click", this.handleClick);
        this.cursor = "pointer";
    };
    
    p.handleClick = function (event) {

    };
    
    window.DelayNode = createjs.promote(DelayNode, "Container");
}());

(function() {

    function LabelNode(label) {
        this.Container_constructor();
        this.label = label;
    
        this.setup();
    }
    var p = createjs.extend(LabelNode, createjs.Container);
    
    p.setup = function() {
        var name = new createjs.Text(this.label, "20px Arial", "#000");
        name.textBaseline = "top";
        name.textAlign = "center";
    
        
        var width = name.getMeasuredWidth() + 30;
        var height = name.getMeasuredHeight() + 20;
        
        name.x = width/2;
        name.y = 10;
        
        var background = new createjs.Shape();
        background.graphics.beginStroke("Black").drawRoundRect(0, 0, width, height, 10);
        
        this.addChild(background, name);

        this.cursor = "pointer";
    };
    
    window.LabelNode = createjs.promote(LabelNode, "Container");
}());
    