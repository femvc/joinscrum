/*!
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */

//Define the global Chart Variable as a class.
window.Chart = function(context){

	var chart = this;
	
	
	//Easing functions adapted from Robert Penner's easing equations
	//http://www.robertpenner.com/easing/
	

	//Variables global to the chart
	var width = context.canvas.width;
	var height = context.canvas.height;


	//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
	if (window.devicePixelRatio) {
		context.canvas.style.width = width + 'px';
		context.canvas.style.height = height + 'px';
		context.canvas.height = height * window.devicePixelRatio;
		context.canvas.width = width * window.devicePixelRatio;
		context.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	
	this.Bar = function(data, options){
		chart.Bar.defaults = {
			scaleOverride : true, 
			
            scaleSteps : 20, 
			scaleStepWidth : 5, 
			scaleStartValue : 0, 
			
            scaleLineColor : 'rgba(0, 0, 0, .1)', 
			scaleLineWidth : 1, 
			
            scaleShowLabels : true, 
			scaleLabel : '<%=value%>', 
			scaleFontFamily : "'Arial'", 
			scaleFontSize : 12, 
			scaleFontStyle : 'normal', 
			scaleFontColor : '#666', 
			
            scaleShowGridLines : true, 
			scaleGridLineColor : 'rgba(0, 0, 0, .05)', 
			scaleGridLineWidth : 1, 
			
            barShowStroke : true, 
			barStrokeWidth : 2, 
            
            yline: 'left'
		};		
		// var config = (options) ? mergeChartConfig(chart.Bar.defaults, options) : chart.Bar.defaults;
        var config = chart.Bar.defaults;
		
		return new Bar(data, config, context);		
	}
	
	var clear = function(c){
		c.clearRect(0, 0, width, height);
	};

	
	var Bar = function(data, config, ctx){
		var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, 
            valueBounds, labelTemplateString, valueHop, widestXLabel, 
            xAxisLength, yAxisPosX, xAxisPosY, barWidth, rotateLabels = 90;
			
		calculateDrawingSizes();
		
		valueBounds = getValueBounds();
		//Check and set the scale
		labelTemplateString = (config.scaleShowLabels)? config.scaleLabel : '';
		calculatedScale = {
            steps : config.scaleSteps, 
            stepValue : config.scaleStepWidth, 
            graphMin : config.scaleStartValue, 
            labels : []
        }
        
        populateLabels(labelTemplateString, calculatedScale.labels, calculatedScale.steps, 
                       config.scaleStartValue, config.scaleStepWidth);
		
		
		scaleHop = Math.floor(scaleHeight/calculatedScale.steps);
		calculateXAxisSize();
		//animationLoop(config, drawScale, drawBars, ctx);
        clear(ctx);
        drawBars(1);
		drawScale();
		
		function drawBars(animPc){
			ctx.lineWidth = config.barStrokeWidth;
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.strokeStyle = data.datasets[i].strokeColor;
					
                    var barOffset = yAxisPosX + valueHop*j + barWidth*i + config.barValueSpacing + 
                                    config.barDatasetSpacing*i + config.barStrokeWidth*i;
					
					ctx.beginPath();
					ctx.moveTo(barOffset, xAxisPosY);
					ctx.lineTo(barOffset, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)+(config.barStrokeWidth/2));
					ctx.lineTo(barOffset + barWidth, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)+(config.barStrokeWidth/2));
					ctx.lineTo(barOffset + barWidth, xAxisPosY);
					if(config.barShowStroke){
						ctx.stroke();
					}
					ctx.closePath();
					ctx.fill();
                    
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'black'; //data.datasets[i].strokeColor;
					ctx.fillText(data.datasets[i].data[j], barOffset + barWidth/2, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)+(config.barStrokeWidth/2)-5);
				}
			}
			
		}
		function drawScale(){
			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(width-widestXLabel/2+5, xAxisPosY);
			ctx.lineTo(width-(widestXLabel/2)-xAxisLength-5, xAxisPosY);
			ctx.stroke();
			
			
			if (rotateLabels > 0){
				ctx.save();
				ctx.textAlign = 'right';
			}
			else {
				ctx.textAlign = 'center';
			}
			ctx.fillStyle = config.scaleFontColor;
			
            for (var i=0; i<data.labels.length; i++){
				ctx.save();
				if (rotateLabels > 0){
					ctx.translate(yAxisPosX + i*valueHop, xAxisPosY + config.scaleFontSize);
					ctx.rotate(-(rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0, 0);
					ctx.restore();
				}
				
				else{
					ctx.fillText(data.labels[i], yAxisPosX + i*valueHop + valueHop/2, xAxisPosY + config.scaleFontSize+3);					
				}

				ctx.beginPath();
                
                var yline = config.yline == 'center' ? valueHop/2 : config.yline == 'left' ? valueHop : 0;
				ctx.moveTo(yAxisPosX + (i+1) * valueHop  - yline, xAxisPosY+3);
				
				//Check i isnt 0, so we dont go over the Y axis twice.
                ctx.lineWidth = config.scaleGridLineWidth;
                ctx.strokeStyle = config.scaleGridLineColor;					
                ctx.lineTo(yAxisPosX + (i+1) * valueHop - yline, 5);
				
                ctx.stroke();
			}
			
			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX, xAxisPosY+5);
			ctx.lineTo(yAxisPosX, 5);
			ctx.stroke();
			
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
			for (var j=0; j<calculatedScale.steps; j++){
				ctx.beginPath();
				ctx.moveTo(yAxisPosX-3, xAxisPosY - ((j+1) * scaleHop));
				if (config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(yAxisPosX + xAxisLength + 5, xAxisPosY - ((j+1) * scaleHop));					
				}
				else{
					ctx.lineTo(yAxisPosX-0.5, xAxisPosY - ((j+1) * scaleHop));
				}
				
				ctx.stroke();
				if (config.scaleShowLabels){
					ctx.fillText(calculatedScale.labels[j], yAxisPosX-8, xAxisPosY - ((j+1) * scaleHop));
				}
			}
			
			
		}
		function calculateXAxisSize(){
			var longestText = 1;
			//if we are showing the labels
			if (config.scaleShowLabels){
				ctx.font = config.scaleFontStyle + ' ' + config.scaleFontSize+'px ' + config.scaleFontFamily;
				for (var i=0; i<calculatedScale.labels.length; i++){
					var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
					longestText = (measuredText > longestText)? measuredText : longestText;
				}
				//Add a little extra padding from the y axis
				longestText +=10;
			}
			xAxisLength = width - longestText - widestXLabel;
			valueHop = Math.floor(xAxisLength/(data.labels.length));	
			
			barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;
			
            valueHop = 30;
            barWidth = 20;

            config.barValueSpacing = 0;
            config.barDatasetSpacing = 10;
            

			yAxisPosX = width-widestXLabel/2-xAxisLength;
			xAxisPosY = scaleHeight + config.scaleFontSize/2 + 6;				
		}		
		function calculateDrawingSizes(){
			maxSize = height;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			ctx.font = config.scaleFontStyle + ' ' + config.scaleFontSize+'px ' + config.scaleFontFamily;
			
            widestXLabel = 1;
			for (var i=0; i<data.labels.length; i++){
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = textLength > widestXLabel ? textLength : widestXLabel;
			}
            
			if (valueHop < widestXLabel){
				rotateLabels = 45;
				if (valueHop < Math.cos(rotateLabels) * widestXLabel){
					rotateLabels = 90;
					maxSize -= widestXLabel; 
				}
				else {
					maxSize -= Math.sin(rotateLabels) * widestXLabel;
				}
			}
			else {
				maxSize -= config.scaleFontSize;
			}
			
			//Add a little padding between the x line and the text
			maxSize -= 5;
			
			
			labelHeight = config.scaleFontSize;
			
			maxSize -= labelHeight;
			//Set 5 pixels greater than the font size to allow for a little padding from the X axis.
			
			scaleHeight = maxSize;
			
			//Then get the area above we can safely draw on.
			
		}		
		
        function getValueBounds() {
			var upperValue = Number.MIN_VALUE;
			var lowerValue = Number.MAX_VALUE;
			for (var i=0; i<data.datasets.length; i++){
				for (var j=0; j<data.datasets[i].data.length; j++){
					if ( data.datasets[i].data[j] > upperValue) { upperValue = data.datasets[i].data[j] };
					if ( data.datasets[i].data[j] < lowerValue) { lowerValue = data.datasets[i].data[j] };
				}
			};
	        
			var maxSteps = Math.floor((scaleHeight / (labelHeight*0.66)));
			var minSteps = Math.floor((scaleHeight / labelHeight*0.5));
			
			return {
				maxValue : upperValue, 
				minValue : lowerValue, 
				maxSteps : maxSteps, 
				minSteps : minSteps
			};
			
	        
		}
	}
	
	function calculateOffset(val, calculatedScale, scaleHop){
		var outerValue = calculatedScale.steps * calculatedScale.stepValue;
		var adjustedValue = val - calculatedScale.graphMin;
		var scalingFactor = CapValue(adjustedValue/outerValue, 1, 0);
		return (scaleHop*calculatedScale.steps) * scalingFactor;
	}
	
    

    //Populate an array of all the labels by interpolating the string.
    function populateLabels(labelTemplateString, labels, numberOfSteps, graphMin, stepValue) {
        if (labelTemplateString) {
            //Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
            for (var i = 1; i < numberOfSteps + 1; i++) {
                labels.push((graphMin + (stepValue * i)).toFixed(getDecimalPlaces(stepValue)));
            }
        }
    }
	
	//Max value from array
	function Max( array ){
		return Math.max.apply( Math, array );
	};
	//Min value from array
	function Min( array ){
		return Math.min.apply( Math, array );
	};
	
	//Is a number function
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	//Apply cap a value at a high or low number
	function CapValue(valueToCap, maxValue, minValue){
		if(isNumber(maxValue)) {
			if( valueToCap > maxValue ) {
				return maxValue;
			}
		}
		if(isNumber(minValue)){
			if ( valueToCap < minValue ){
				return minValue;
			}
		}
		return valueToCap;
	}
	function getDecimalPlaces (num){
		var numberOfDecimalPlaces;
		if (num%1!=0){
			return num.toString().split('.')[1].length
		}
		else{
			return 0;
		}
		
	} 
	
	function mergeChartConfig(defaults, userDefined){
		var returnObj = {};
	    for (var attrname in defaults) { returnObj[attrname] = defaults[attrname]; }
	    for (var attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }
	    return returnObj;
	}
	
}


