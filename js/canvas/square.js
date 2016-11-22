var SquareCanvasModel = function(text){ 
  BaseCanvasModel.call(this)
  this.color = 'rgb(155, 187, 89)'
  this.globalAlpha = 1.0
  this.radius = 15
  this.lineWidth = 3
  this.text = new TextCanvasModel(text)
}
SquareCanvasModel.prototype.calculate = function(){
  // center align
  var blank = this.width - this.text.get_px_width()
  var m_l = 0
  if(blank > 0){
    m_l = blank/2
  }
  this.text.possitionX = this.possitionX + m_l
  this.text.possitionY = this.possitionY + 20
  this.text.z_index = this.z_index
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
  this.text.draw(ctx)
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



//TODO
//this class is a little special to need the context of canvas
//because need to calculate the point to start new line
//Textbox Square
var TextboxSquare = function(ctx, text){
  SquareCanvasModel.call(this, text)
  this.lines = 0
  this.text_turned = [] //TextCanvas
  this.ctx = ctx
  this.text_margin_left = 5
  this.text_margin_top = 3
  this.text_init_margin_top = 20
}

TextboxSquare.prototype.draw = function(ctx){
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_lineWidth = ctx.lineWidth
  var tmp_fillStyle = ctx.fillStyle
  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.fillStyle = this.color

  ctx.fillRect(this.possitionX, this.possitionY, this.width, this.height)
  ctx.strokeRect(this.possitionX, this.possitionY, this.width, this.height)

  ctx.globalAlpha = 1.0
  this.calculate()
  for(var i=0; i<this.text_turned.length; i++){
    this.text_turned[i].draw(ctx)
  }
  ctx.globalAlpha = tmp_globalAlpha
  ctx.lineWidth = tmp_lineWidth
  ctx.fillStyle = tmp_fillStyle
}

TextboxSquare.prototype.calculate = function(){
  this.text.possitionX = this.possitionX + this.text_margin_left
  this.text.possitionY = this.possitionY + this.text_init_margin_top
  this.text.z_index = this.z_index
  this.calculate_turned_text()
  for(var i=0; i<this.text_turned.length; i++){
    this.text_turned[i].possitionY += this.text_turned[i].get_px_height() * i
  }
}

TextboxSquare.prototype.calculate_turned_text = function(){
  this.lines = 0
  this.text_turned = [this.create_copy_of(this.text, "")]

  var temp_font = this.ctx.font
  this.ctx.font = this.text.font

  for(var i=0; i<this.text.content.length; i++){
    var chara = this.text.content.charAt(i)
    if(chara == '\n'){
      this.lines++
      this.text_turned[this.lines] = this.create_copy_of(this.text, "")
    }
    if(this.ctx.measureText(this.text_turned[this.lines].content + chara).width > this.width - this.text_margin_left*2){
      this.lines++
      this.text_turned[this.lines] = this.create_copy_of(this.text, "")
    }
    this.text_turned[this.lines].content += chara
  }
  this.ctx.font = temp_font
}

TextboxSquare.prototype.create_copy_of = function(textCanvas, text){
  var copied = new TextCanvasModel(text)
  copied.color = textCanvas.color
  copied.font = textCanvas.font
  copied.globalAlpha = textCanvas.globalAlpha
  copied.lineWidth = textCanvas.lineWidth
  copied.possitionX = textCanvas.possitionX
  copied.possitionY = textCanvas.possitionY
  copied.z_index = textCanvas.z_index
  copied.is_bold = textCanvas.is_bold
  return copied
}
