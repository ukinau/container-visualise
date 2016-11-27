/** DrawConnectionObject Class

**/
var DrawConnectionObject = function(from, to){
  this.from = from
  this.to = to
  this.canvas = new ArrowConnection()
  this.unHighlight()
  this.options = {}
}

DrawConnectionObject.prototype.calculate = function(){
      //[x, y] array
  this.canvas.begin_possition = this.from.get_connecting_point(this.to)
  this.canvas.end_possition = this.to.get_connecting_point(this.from)
}

DrawConnectionObject.prototype.highlight = function(options){
  this.canvas.strokeStyle = "black"
  this.canvas.globalAlpha = 0.6
  this.canvas.lineWidth = 3
  if(options["color"]){
    this.canvas.strokeStyle = options["color"]
  }
  if(options["globalAlpha"]){
    this.canvas.globalAlpha = options["globalAlpha"]
  }
  if(options["lineWidth"]){
    this.canvas.lineWidth = options["lineWidth"]
  }
}

DrawConnectionObject.prototype.unHighlight = function(){
  this.canvas.strokeStyle = "black"
  this.canvas.globalAlpha = 0.6
  this.canvas.lineWidth = 3
}
