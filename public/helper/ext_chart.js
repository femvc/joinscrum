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
    
    this.Line = function(data, options){
        chart.Line.defaults = {
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
            
            yline: 'center', 
            ylineShow: true, 
            
            paddingLeft: 5,
            
            pointLabelFontFamily : "'Arial'",
            pointLabelFontStyle : "normal",
            pointLabelFontSize : 12,
            pointLabelFontColor : "#666",
            pointDot : true,
            pointDotRadius : 3,
            pointDotStrokeWidth : 1
        };        
        // var config = (options) ? mergeChartConfig(chart.Bar.defaults, options) : chart.Bar.defaults;
        var config = chart.Line.defaults;
        
        return new Line(data, config, context);
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
            
            yline: 'right', 
            ylineShow: false, 
            
            paddingLeft: 5
        };        
        // var config = (options) ? mergeChartConfig(chart.Bar.defaults, options) : chart.Bar.defaults;
        var config = chart.Bar.defaults;
        
        return new Bar(data, config, context);        
    }
    
    var clear = function(c){
        c.clearRect(0, 0, width, height);
    };

    var Line = function(data, config, ctx){
        var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, 
            valueBounds, labelTemplateString, valueHop, realHopSpace, widestXLabel, 
            xAxisLength, yAxisPosX, xAxisPosY, barWidth, marginLeft = 0, rotateLabels = 0;
            
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
        drawScale();
        drawLines(1);
        
        function drawLines(animPc){
            ctx.lineWidth = config.barStrokeWidth;
            var x, y;
            for (var i=0; i<data.datasets.length; i++){
                ctx.fillStyle = data.datasets[i].fillColor;
                ctx.strokeStyle = data.datasets[i].strokeColor;
                ctx.beginPath();
                for (var j=0; j<data.datasets[i].data.length; j++){
                    var barOffset = yAxisPosX + valueHop*j;
                    x = barOffset + valueHop/2;
                    y = xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)+(config.barStrokeWidth/2);
                    if (j === 0) {
                        ctx.moveTo(x, y);
                    }
                    else {
                        ctx.lineTo(x, y);
                        
                        //ctx.bezierCurveTo(xPos(j-0.5), yPos(i, j-1), xPos(j-0.5), yPos(i, j), xPos(j), yPos(i, j));
                    }
                    
                    ctx.stroke();
                    
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'black'; //data.datasets[i].strokeColor;
                    ctx.fillText(data.datasets[i].data[j], barOffset + barWidth/2, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)+(config.barStrokeWidth/2)-6);
                }
                
                //ctx.closePath();
                //ctx.fill();
                
                if(config.pointDot){
                    ctx.fillStyle = data.datasets[i].pointColor;
                    ctx.strokeStyle = data.datasets[i].pointStrokeColor;
                    ctx.lineWidth = config.pointDotStrokeWidth;
                    for (var k=0; k<data.datasets[i].data.length; k++){
                        ctx.beginPath();
                        x = yAxisPosX + (valueHop*k)  + valueHop/2;
                        y = xAxisPosY - animPc*(calculateOffset(data.datasets[i].data[k],calculatedScale,scaleHop));
                        ctx.arc(x, y, config.pointDotRadius, 0, Math.PI*2, true);
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            }
            
            function yPos(dataSet,iteration){
                return xAxisPosY - animPc*(calculateOffset(data.datasets[dataSet].data[iteration],calculatedScale,scaleHop));            
            }
            function xPos(iteration){
                return yAxisPosX + (valueHop * iteration);
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
            
            ctx.fillStyle = config.scaleFontColor;
            
            for (var i=0; i<data.labels.length; i++){
                ctx.save();
                
                ctx.translate(yAxisPosX + i*valueHop + valueHop/2, 
                    xAxisPosY + config.scaleFontSize + 3);
                
                if (valueHop < widestXLabel/Math.cos(rotateLabels)) {
                    ctx.rotate(-(rotateLabels * (Math.PI/180)));
                    ctx.textAlign = 'left';
                    ctx.fillText(data.labels[i], -10, 3);
                }
                else {
                    ctx.textAlign = 'center';
                    ctx.fillText(data.labels[i], 0, 0);
                }
                ctx.restore();
                
                ctx.beginPath();
                    
                if (config.ylineShow) {
                    var ylineLeft = config.yline == 'center' ? valueHop/2 : config.yline == 'left' ? valueHop : 0;
                    ctx.moveTo(yAxisPosX + marginLeft + (i+1) * valueHop  - ylineLeft + config.paddingLeft, xAxisPosY+3);
                    
                    //Check i isnt 0, so we dont go over the Y axis twice.
                    ctx.lineWidth = config.scaleGridLineWidth;
                    ctx.strokeStyle = config.scaleGridLineColor;                    
                    ctx.lineTo(yAxisPosX + marginLeft + (i+1) * valueHop - ylineLeft + config.paddingLeft, 5);
                }
                
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
            var longestYLabelText = 1;
            //if we are showing the labels
            if (config.scaleShowLabels){
                ctx.font = config.scaleFontStyle + ' ' + config.scaleFontSize+'px ' + config.scaleFontFamily;
                
                for (var i=0; i<calculatedScale.labels.length; i++){
                    var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
                    longestYLabelText = (measuredText > longestYLabelText)? measuredText : longestYLabelText;
                }
                //Add a little extra padding from the y axis
                longestYLabelText +=10;
            }
            xAxisLength = width - longestYLabelText - widestXLabel;
            
            config.barValueSpacing = 7;
            config.barDatasetSpacing = 0;
            
            valueHop = Math.floor(xAxisLength/(data.labels.length));
            //
            valueHop = valueHop > 60 ? 60 : valueHop;
            
            barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;
            //
            barWidth = barWidth < 5 ? 5 : barWidth;
            barWidth = barWidth > 30 ? 30 : barWidth;
            
            realHopSpace = (valueHop - barWidth - config.barDatasetSpacing)/2;
                    
            
            //valueHop = 30;
            //barWidth = 5;
            
            yAxisPosX = width - widestXLabel/2 - xAxisLength;
            xAxisPosY = scaleHeight + config.scaleFontSize/2 + 6;

            marginLeft = (xAxisLength - valueHop*(data.labels.length+1))/2;
            marginLeft = marginLeft < 0 ? 0 : marginLeft;
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
            
            rotateLabels = 315;
            maxSize -= Math.sin(rotateLabels) * widestXLabel;
            widestXLabel = Math.cos(rotateLabels) * widestXLabel;
            
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
    };
    
    var Bar = function(data, config, ctx){
        var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, 
            valueBounds, labelTemplateString, valueHop, realHopSpace, widestXLabel, 
            xAxisLength, yAxisPosX, xAxisPosY, barWidth, marginLeft = 0, rotateLabels = 0;
            
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
        drawScale();
        drawBars(1);
        
        function drawBars(animPc){
            ctx.lineWidth = config.barStrokeWidth;
            for (var i=0; i<data.datasets.length; i++){
                for (var j=0; j<data.datasets[i].data.length; j++){
                    ctx.fillStyle = data.datasets[i].fillColor;
                    ctx.strokeStyle = data.datasets[i].strokeColor;
                    
                    var barOffset = yAxisPosX + marginLeft + valueHop*j + barWidth*i + config.barDatasetSpacing*i 
                        + config.barStrokeWidth*i + config.paddingLeft 
                        + (realHopSpace > config.barValueSpacing ? realHopSpace : config.barValueSpacing);
                    
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
                    ctx.fillText(data.datasets[i].data[j], barOffset + barWidth/2, xAxisPosY - animPc*calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)+(config.barStrokeWidth/2)-6);
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
            
            ctx.fillStyle = config.scaleFontColor;
            
            for (var i=0; i<data.labels.length; i++){
                ctx.save();
                
                ctx.translate(yAxisPosX + marginLeft + i*valueHop + config.paddingLeft + valueHop/2, 
                    xAxisPosY + config.scaleFontSize + 3);
                
                if (valueHop < widestXLabel/Math.cos(rotateLabels)) {
                    ctx.rotate(-(rotateLabels * (Math.PI/180)));
                    ctx.textAlign = 'left';
                    ctx.fillText(data.labels[i], -10, 3);
                }
                else {
                    ctx.textAlign = 'center';
                    ctx.fillText(data.labels[i], 0, 0);
                }
                ctx.restore();
                
                ctx.beginPath();
                    
                if (config.ylineShow) {
                    var ylineLeft = config.yline == 'center' ? valueHop/2 : config.yline == 'left' ? valueHop : 0;
                    ctx.moveTo(yAxisPosX + marginLeft + (i+1) * valueHop  - ylineLeft + config.paddingLeft, xAxisPosY+3);
                    
                    //Check i isnt 0, so we dont go over the Y axis twice.
                    ctx.lineWidth = config.scaleGridLineWidth;
                    ctx.strokeStyle = config.scaleGridLineColor;                    
                    ctx.lineTo(yAxisPosX + marginLeft + (i+1) * valueHop - ylineLeft + config.paddingLeft, 5);
                }
                
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
            var longestYLabelText = 1;
            //if we are showing the labels
            if (config.scaleShowLabels){
                ctx.font = config.scaleFontStyle + ' ' + config.scaleFontSize+'px ' + config.scaleFontFamily;
                
                for (var i=0; i<calculatedScale.labels.length; i++){
                    var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
                    longestYLabelText = (measuredText > longestYLabelText)? measuredText : longestYLabelText;
                }
                //Add a little extra padding from the y axis
                longestYLabelText +=10;
            }
            xAxisLength = width - longestYLabelText - widestXLabel;
            
            config.barValueSpacing = 7;
            config.barDatasetSpacing = 0;
            
            valueHop = Math.floor(xAxisLength/(data.labels.length));
            //
            valueHop = valueHop > 60 ? 60 : valueHop;
            
            barWidth = (valueHop - config.scaleGridLineWidth*2 - (config.barValueSpacing*2) - (config.barDatasetSpacing*data.datasets.length-1) - ((config.barStrokeWidth/2)*data.datasets.length-1))/data.datasets.length;
            //
            barWidth = barWidth < 5 ? 5 : barWidth;
            barWidth = barWidth > 30 ? 30 : barWidth;
            
            realHopSpace = (valueHop - barWidth - config.barDatasetSpacing)/2;
                    
            
            //valueHop = 30;
            //barWidth = 5;
            
            yAxisPosX = width - widestXLabel/2 - xAxisLength;
            xAxisPosY = scaleHeight + config.scaleFontSize/2 + 6;

            marginLeft = (xAxisLength - valueHop*(data.labels.length+1))/2;
            marginLeft = marginLeft < 0 ? 0 : marginLeft;
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
            
            rotateLabels = 315;
            maxSize -= Math.sin(rotateLabels) * widestXLabel;
            widestXLabel = Math.cos(rotateLabels) * widestXLabel;
            
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
    };
    
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


