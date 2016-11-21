var BaseCanvasModel = function(){
  this.possitionX = 0;
  this.possitionY = 0;
  this.width = 0; 
  this.height = 0; 
  this.z_index = 0;
}
BaseCanvasModel.prototype.get_possitionX_end = function(){
  return this.possitionX + this.width
}
BaseCanvasModel.prototype.get_possitionY_end = function(){
  return this.possitionY + this.height
}
BaseCanvasModel.prototype.collision_detect = function(x,y){
  if (this.possitionX < x && x < this.possitionX + this.width){
    if (this.possitionY < y && y < this.possitionY + this.height){
      return true
    }
  }
  return false
}



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

var TextCanvasModel = function(text){
	BaseCanvasModel.call(this)
	this.color = 'rgb(0, 0, 0)'
  this.font = "20px sans-serif"
	this.content = text
	this.globalAlpha = 1.0
  this.lineWidth = 2
}
TextCanvasModel.prototype.draw = function(ctx){
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_fillStyle = ctx.fillStyle
  var tmp_font = ctx.font
  var tmp_lineWidth = ctx.lineWidth

	ctx.globalAlpha = this.globalAlpha
	ctx.fillStyle = this.color
  ctx.font = this.font
  ctx.lineWidth = this.lineWidth

	ctx.strokeText(this.content, this.possitionX, this.possitionY)
	ctx.fillText(this.content, this.possitionX, this.possitionY)

  ctx.font = tmp_font
  ctx.globalAlpha = tmp_globalAlpha
  ctx.fillStyle = tmp_fillStyle
  ctx.lineWidth = tmp_lineWidth
}
TextCanvasModel.prototype.get_px_width = function(){
  return (Number(this.font.match(/([0-9].)px/)[1])/2) * this.content.length
}
//TODO
TextCanvasModel.prototype.get_px_height = function(){
  return (Number(this.font.match(/([0-9].)px/)[1])/2)
}

ConnectionBaseCanvas = function(){
  this.begin_possition = [] // [x, y]
  this.end_possition = [] // [x, y]
  this.globalAlpha = null
  this.strokeStyle = null
  this.lineWidth = null
  this.z_index = 99 //TODO temporally max higher value
}

ConnectionBaseCanvas.prototype.draw = function(ctx){
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_lineWidth = ctx.lineWidth 
  var tmp_strokeStyle = ctx.strokeStyle
  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.strokeStyle

  ctx.beginPath()
  ctx.moveTo(this.begin_possition[0],
             this.begin_possition[1])
  ctx.lineTo(this.end_possition[0],
             this.end_possition[1])
  ctx.stroke()

  ctx.globalAlpha = tmp_globalAlpha
  ctx.lineWidth = tmp_lineWidth
  ctx.strokeStyle = tmp_strokeStyle
}
ConnectionBaseCanvas.prototype.collision_detect = function(x, y){
  return false
}

//TODO
//this class is a little special to need the context of canvas
//because need to calculate the point to start new line
TextBoxCanvas = function(){
  BaseCanvasModel.call(this)

}

inherits(SquareCanvasModel, BaseCanvasModel)
inherits(TextCanvasModel, BaseCanvasModel)
inherits(TextCanvasModel, BaseCanvasModel)

