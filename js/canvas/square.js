var SquareCanvasModel = function(text){ 
  BaseCanvasModel.call(this)
	this.color = 'rgb(155, 187, 89)'
  this.globalAlpha = 1.0
  this.radius = 15
  this.text = {}
  this.text.canvas = new TextCanvasModel(text)
}
SquareCanvasModel.prototype.calculate = function(){
  // center align
  var blank = this.width - this.text.canvas.get_px_width()
  var m_l = 0
  if(blank > 0){
    m_l = blank/2
  }
  this.text.canvas.possitionX = this.possitionX + m_l
  this.text.canvas.possitionY = this.possitionY + 20
  this.text.canvas.z_index = this.z_index
  this.lineWidth = 3
}
SquareCanvasModel.prototype.draw = function(ctx){
	// draw square
  var tmp_globalAlpha = ctx.globalAlpha 
  var tmp_lineWidth = ctx.lineWidth
  var tmp_fillStyle = ctx.fillStyle

	ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
	ctx.fillStyle = this.color
	//ctx.fillRect(this.possitionX, this.possitionY, this.width, this.height)
  // Rounded square
  ctx.beginPath();
  ctx.moveTo(this.possitionX+this.radius, this.possitionY);
  ctx.lineTo(this.possitionX+this.width - this.radius, this.possitionY);
  ctx.quadraticCurveTo(this.possitionX+this.width, this.possitionY,
                       this.possitionX+this.width, this.possitionY+this.radius);

  ctx.lineTo(this.possitionX+this.width,
             this.possitionY+this.height-this.radius);
  ctx.quadraticCurveTo(this.possitionX+this.width,
                       this.possitionY+this.height,
                       this.possitionX+this.width-this.radius,
                       this.possitionY+this.height);
  ctx.lineTo(this.possitionX+this.radius, this.possitionY+this.height);
  ctx.quadraticCurveTo(this.possitionX, this.possitionY+this.height, 
                       this.possitionX, this.possitionY+this.height-this.radius);
  ctx.lineTo(this.possitionX, this.possitionY+this.radius);
  ctx.quadraticCurveTo(this.possitionX, this.possitionY,
                       this.possitionX+this.radius, this.possitionY);
  ctx.fill();
  ctx.stroke();

	ctx.globalAlpha = 1.0
	this.calculate()
	this.text.canvas.draw(ctx)
  ctx.globalAlpha = tmp_globalAlpha 
  ctx.lineWidth = tmp_lineWidth
  ctx.fillStyle = tmp_fillStyle
}

SquareCanvasModel.prototype.get_aspects = function(){
  results = {
    "right":{
      "begin":{"x":this.get_possitionX_end(), "y":this.possitionY},
      "end":{"x":this.get_possitionX_end(), "y":this.get_possitionY_end()}
      //TODO formula for calculating the connecting point like followings
      //{"x": function(x, sp){return x}, "y": function(y, sp){return y + sp }}
    },
    "left":{
      "begin":{"x": this.possitionX, "y":this.possitionY},
      "end": {"x": this.possitionX, "y": this.get_possitionY_end()}
    },
    "top":{
      "begin":{"x": this.possitionX, "y":this.possitionY},
      "end": {"x": this.get_possitionX_end(), "y":this.possitionY} 
    },
    "down":{
      "begin": {"x": this.possitionX, "y": this.get_possitionY_end()},
      "end": {"x": this.get_possitionX_end(), "y": this.get_possitionY_end()}
    }
  }
  return results
}
inherits(SquareCanvasModel, BaseCanvasModel)
