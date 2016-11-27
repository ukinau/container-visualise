var TextCanvasModel = function(text){
  BaseCanvasModel.call(this)
  this.color = 'rgb(0, 0, 0)'
  this.font = "20px sans-serif"
  this.content = text
  this.globalAlpha = 1.0
  this.is_bold = true
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

  if(this.is_bold){
    ctx.strokeText(this.content, this.possitionX, this.possitionY)
  }
  ctx.fillText(this.content, this.possitionX, this.possitionY)

  ctx.font = tmp_font
  ctx.globalAlpha = tmp_globalAlpha
  ctx.fillStyle = tmp_fillStyle
  ctx.lineWidth = tmp_lineWidth
}
TextCanvasModel.prototype.get_px_width = function(){
  return (Number(this.font.match(/([0-9].)px/)[1])/1.7) * this.content.length
}
//TODO
TextCanvasModel.prototype.get_px_height = function(){
  return Number(this.font.match(/([0-9].)px/)[1])
}

inherits(TextCanvasModel, BaseCanvasModel)
