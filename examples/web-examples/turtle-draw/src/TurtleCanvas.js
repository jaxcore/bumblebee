import React, { Component } from 'react';
import Color from 'ts-color-class';
global.Color = Color;

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class TurtleCanvas extends Component {
    constructor(props) {
        super();
        this.refCanvasBorder = React.createRef();
        this.refCanvas = React.createRef();
        this.refTurtle = React.createRef();
        this.speed = 2;
        this.reset();
        global.turtle = this;
    }

    redraw() {
        this.clearRect();
        this.proceduresIndex = -1;
        this.angle = 0;
        this.lastPoint = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
        this.resetTurtle();
        this.stopDrawProcedures();
        this.startDrawProcedures();
    }
    
    addProcedure(name, value) {
        let proc = [name, value];
        this.procedures.push(proc);
        this.startDrawProcedures();
    }
    
    stopDrawProcedures() {
        this.proceduresRunning = false;
    }
    
    startDrawProcedures() {
        if (!this.proceduresRunning) {
            if (this.proceduresIndex < this.procedures.length - 1) {
                this.proceduresRunning = true;
                this.nextProcedure();
            }
        }
    }
    
    nextProcedure() {
        this.proceduresIndex++;
        this.runProcedure(this.procedures[this.proceduresIndex]).then(r => {
            if (this.proceduresRunning) {
                if (this.proceduresIndex === this.procedures.length - 1) {
                    this.proceduresRunning = false;
                }
                else {
                    this.nextProcedure();
                }
            }
        });
    }
    
    async runProcedure(proc) {
        const [name, value] = proc;
        console.log('runProcedure', name, value);
        await this[name](value);
    }
    
    async move(distance) {
        let a = Math.PI * (this.angle - 90) / 180;
        let lastPoint = this.lastPoint;
        let totalTime;
        let intervalDistance = 5;
        let intervals = Math.ceil(distance / intervalDistance);
        if (Math.abs(distance) <= 5) {
            intervals = 1;
            totalTime = 0;
        }
        else {
            let dp;
            if (distance > 1000) dp = 1000;
            totalTime = 100 + dp;
        }
        
        let intervalTime = totalTime / intervals;
        return new Promise((resolve, reject) => {
            let i = 0;
            let interval = setInterval(() => {
                let dist = (i / intervals) * distance;
                if (intervals === 1) dist = distance;
                let point = {
                    x: lastPoint.x + dist * Math.cos(a),
                    y: lastPoint.y + dist * Math.sin(a)
                };
                if (this.isDrawing) {
                    this.addPoint(point);
                }
                else {
                    this.lastPoint = point;
                    this.resetTurtle();
                }
                i ++;
                if (i >= intervals) {
                    clearInterval(interval);
                    resolve();
                }
            },intervalTime);
        });
    }
    
    async setRoughness(roughness) {
        this.roughness = roughness;
    }
    async setWidth(width) {
        this.width = width;
    }
    
    async setOpacity(opacity) {
        this.opacity = opacity;
    }
    async setColor(color) {
        this.color = new Color(color).getRGB();
    }
    
    async setDrawing(on) {
        console.log('drawing', on);
        this.isDrawing = !!on;
        this.resetTurtle();
    }
    
    async rotateBy(degrees) {
        if (Math.abs(degrees) > 360) degrees = degrees % 360;
        return this.rotateTo(this.angle + degrees, true);
    }
    async right(degrees) {
        if (typeof degrees === 'undefined' || degrees === null) degrees = 90;
        return this.rotateBy(degrees);
    }
    async left(degrees) {
        if (typeof degrees === 'undefined' || degrees === null) degrees = -90;
        return this.rotateBy(-degrees);
    }
    
    async rotateTo(degrees, relative) {
        if (!relative) {
            degrees = degrees % 360;
            if (degrees < 0) degrees += 360;
        }
        if (degrees === this.angle) {
            return;
        }
        return new Promise((resolve, reject) => {
            let angle = this.angle;
            let diff = degrees - angle;
            let adiff = Math.abs(diff);
            let totalTime;
            if (adiff > 360) totalTime = 1000;
            else totalTime = 100 + (adiff/360) * 900;
            
            let intervalTime = totalTime / adiff;
            let inc = diff > 0? 1 : -1;
            let interval = setInterval(() => {
                angle += inc;
                this.refTurtle.current.style.transform = 'rotate('+angle+'deg) scale(0.5)';
                if (angle === degrees) {
                    if (degrees < 0) degrees += 360;
                    this.angle = degrees;
                    clearInterval(interval);
                    resolve();
                }
            }, intervalTime);
        });
    }
    
    resetTurtle() {
        let lastPoint = this.lastPoint;
        if (!lastPoint) {
            return;
        }
        let tW = 77;
        let tH = 77;
        let l = lastPoint.x - tW/2;
        let t = lastPoint.y - tH/2;
        this.refTurtle.current.style.left = l + 'px';
        this.refTurtle.current.style.top = t + 'px';
        
        this.refTurtle.current.style.opacity = this.isDrawing? '1' : '0.3';
        this.refTurtle.current.src = this.isDrawing? 'turtle.png' : 'turtle-off.png';
    }
    
    setSize(edgeSize) {
        const canvas = this.refCanvas.current;
        const borderSize = 0;
        canvas.style.left = borderSize + 'px';
        canvas.style.top = borderSize + 'px';
        
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;
        
        canvas.width = this.canvasWidth - borderSize*2;
        canvas.height = this.canvasHeight - borderSize*2;
        this.edgeSize = edgeSize;

        const canvasborder = this.refCanvasBorder.current;
        canvasborder.style.left = edgeSize + 'px';
        canvasborder.style.top = edgeSize + 'px';

        canvasborder.style.width = this.canvasWidth + 'px';
        canvasborder.style.height = this.canvasHeight + 'px';
    }

    reset() {
        this.clearRect();
        this.opacity = 0.1;
        this.color = new Color('gray 5').getRGB(); //[0,0,0];
        this.width = 1.5;
        this.roughness = 0.5;
        this.procedures = [];
        this.proceduresIndex = -1;
        this.proceduresRunning = false;
        this.angle = 0;
        this.isDrawing = true;
    }

    clearRect() {
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    componentDidMount() {
        this.props.events.on('clear', () => {
            this.reset();
        });
        const canvas = this.refCanvas.current;
        this.ctx = canvas.getContext('2d');
        this.setSize(0);
        this.redraw();
        this.resetTurtle();
    }

    addPoint(point, skip) {
        console.log('addPoint', point);
        if (this.lastPoint) {
            let c = this.color.join(',');
            let opacity1 = this.opacity * 0.8;
            let opacity2 = this.opacity * 1.2;
            this.stroke(point, this.width, this.width*1.5, 'rgba('+c+','+opacity1+')');
            this.stroke(point, this.width/2, this.roughness, 'rgba('+c+','+opacity2+')');
        }
        
        this.lastPoint = point;
        this.resetTurtle();
    }

    stroke(point, lineWidth, r, color) {
        let { lastPoint } = this;
        const { ctx } = this;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.beginPath();
        
        ctx.moveTo(lastPoint.x - getRandom(0, r), lastPoint.y - getRandom(0, r));
        ctx.lineTo(point.x - getRandom(0, r) + r/2, point.y - getRandom(0, r) + r/2);
        ctx.stroke();
        
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        
        ctx.moveTo(lastPoint.x + getRandom(0, r), lastPoint.y + getRandom(0, r));
        ctx.lineTo(point.x + getRandom(0, r) + r/2, point.y + getRandom(0, r) + r/2);
        ctx.stroke();
    }

    render() {
        return (<div id="sketchcanvasborder" ref={this.refCanvasBorder}>
            <img src="turtle.png" ref={this.refTurtle}/>
            <canvas id="sketchcanvas" ref={this.refCanvas} />
        </div>);
    }
}

export default TurtleCanvas;