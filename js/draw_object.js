/** DrawObject Class
  Args:
    name(str): this object name, this isn't identifier and unique      
    obj({}): 
**/
var DrawObject = function(name, obj){
  // super object, we don't need to specify the x,y,width...
  this.super_draw_object = null
  this.super_draw_margin = 28
  this.children_draw_objects = []
  this.name = name
  this.options = obj

  /**
    {
      "top": {
        [x, y]: [],
        [x1, y]: []
      }
    }
  **/
  this.connecting_points = {
    "top":{},
    "down":{},
    "left":{},
    "right":{} 
  }
  this.connecting_points_space = 10 // point <10> point <10>
  this.connections = []

  this.event_functions = {
    "mousedown": null,
    "mousedown:clear": null,
    "mousemove": null,
    "mousemove:clear": null
  }
  this.canvas = new SquareWithTitle(name)
  if(obj){
    var d_option_list = [["x", "possitionX"],
                       ["y", "possitionY"],
                       ["width", "width"],
                       ["height", "height"],
                       ["color", "color"],
                        ["globalAlpha", "globalAlpha"]]
    for(var i=0; i<d_option_list.length; i++){
      if(obj[d_option_list[i][0]]){
        this.canvas[d_option_list[i][1]] = obj[d_option_list[i][0]]
      }
    }
    var text_option_list = [["text-color", "color"],
                            ["text-font", "font"],
                            ["text-globalAlpha", "globalAlpha"]]
    for(var i=0; i<text_option_list.length; i++){
      if(obj[text_option_list[i][0]]){
        this.canvas.title[text_option_list[i][1]] = obj[text_option_list[i][0]]
      }
    }
  }
}

/** configure_super Method
Setting other draw object as super of this
  Args:
    super_object(DrawObejct obj)
**/
DrawObject.prototype.configure_super = function(super_object){
  super_object.children_draw_objects.push(this)
  this.super_draw_object = super_object  
}

/** calculate Method
Calculate and Clarify the possition/width/height and Set the result into 
canvas object and Initialise connecting points and call calculate method of
DrawConnectionObject as well.
**/
DrawObject.prototype.calculate = function(){
  if(this.is_super()){
    for(var i=0; i<this.children_draw_objects.length; i++){
      this.children_draw_objects[i].calculate()   
    }
    this.canvas.possitionX = this.get_mostleft() - this.super_draw_margin
    this.canvas.possitionY = this.get_mosttop() - this.super_draw_margin
    this.canvas.width = this.get_mostright() - this.get_mostleft() + this.super_draw_margin*2
    this.canvas.height = this.get_mostdown() - this.get_mosttop() + this.super_draw_margin*2
    //If this drawObject has child, the title of this should be shown on the top
    this.canvas.title_vertical_align = "top"
    this.canvas.lineFlag = true
  }
  if(!this.canvas.z_index_fixed){
    this.canvas.z_index = this.get_generation()
  }
  // SquareWithTitle is required to be called calculate Method
  // after attribute is updated like possitionX, Y and so on.
  this.canvas.calculate()
  this.init_connecting_points()
  for(var i=0; i<this.connections.length; i++){
    this.connections[i].calculate()
  }
}

/** init_connecting_points Method
using aspect map(*1) canvas returned, generate and set connecting point map(*2)
as attribute of this.

*1: aspect map
{
  "right":{
    "begin": {"x": <possitionX>, "y": possitionY}
    "end": {"x": <possitionX>, "y": possitionY}
  },
  <aspect name>: {
    "begin": {"x": <possitionX>, "y": possitionY}
    "end": {"x": <possitionX>, "y": possitionY}
  }
}

*2: connecting point map
{
  "right":{
    [0, 0]:[drawObject, drawObject],
  },
  <aspect name>:{
    [x, y]:[drawObject,]
  }
}
**/
DrawObject.prototype.init_connecting_points = function(){
  var aspects =  this.canvas.get_aspects()
  for(var aspect_name in aspects){
    var points = []  
    if(aspect_name === 'right' || aspect_name === 'left'){
      var y_begin = aspects[aspect_name]['begin']['y']
      var y_end = aspects[aspect_name]['end']['y']
      for(var temp_point=y_begin; temp_point<y_end; temp_point+=this.connecting_points_space){
        var point = [aspects[aspect_name]['begin']['x']]
        point.push(temp_point)
        points.push(point)
      }
    }else{
      var x_begin = aspects[aspect_name]['begin']['x']
      var x_end = aspects[aspect_name]['end']['x']
      for(var temp_point=x_begin; temp_point<x_end; temp_point+=this.connecting_points_space){
        var point = [aspects[aspect_name]['begin']['y']]
        point.unshift(temp_point)
        points.push(point)
      }
    }    
    this.connecting_points[aspect_name] = {}
    for(var i=0; i<points.length; i++){
      this.connecting_points[aspect_name][points[i]] = []
    }
  }    
}

/** is_super Method
judge if this have any draw object as child
  Return:
    is_super(Bool): True or False
**/
DrawObject.prototype.is_super = function(){
  return this.children_draw_objects.length > 0
}


/** get_mostleft Method
find most left possitionX amond children, this method **don't** investigate
grandchild and more. only do against children.

  Return:
    possitionX(int): most left x coordinate
**/
DrawObject.prototype.get_mostleft = function(){
  var mostleft = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mostleft == null) mostleft = child.canvas.possitionX
    if (child.canvas.possitionX < mostleft) {
      mostleft = child.canvas.possitionX
    }
  }
  return mostleft
}

/** get_mostright Method
find most right possitionX among children, this method **don't** investigate
grandchild and more, only do against children

  Return:
    possitionX(int): most right x coordinate
**/
DrawObject.prototype.get_mostright = function(){
  var mostright = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mostright == null) mostright = child.canvas.get_possitionX_end()
    if (child.canvas.get_possitionX_end() > mostright) {
      mostright = child.canvas.get_possitionX_end()
    }
  }
  return mostright
}

/** get_mosttop Method
find most top possitionY among children, this method **don't** investigate
grandchild and more, only do against children

  Return:
    possitionY(int): most top y coordinate
**/
DrawObject.prototype.get_mosttop = function(){
  var mosttop = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mosttop == null) mosttop = child.canvas.possitionY
    if (child.canvas.possitionY < mosttop) {
      mosttop = child.canvas.possitionY
    }
  }
  return mosttop
}

/** get_mostdown Method
find most down possitionY among children, this method **don't** investigate
grandchild and more, only do against children

  Return:
    possitionY(int): most down y coordinate
**/
DrawObject.prototype.get_mostdown = function(){
  var mostdown = null
  for(var i=0; i<this.children_draw_objects.length; i++){
    var child = this.children_draw_objects[i]  
    if (mostdown == null) mostdown = child.canvas.get_possitionY_end()
    if (child.canvas.get_possitionY_end() > mostdown) {
      mostdown = child.canvas.get_possitionY_end()
    }
  }
  return mostdown
}

/** get_generation Method
get a children number of me from the top parent
  Return:
    generation(int)
*/
DrawObject.prototype.get_generation = function(){
  if(this.super_draw_object == null){
    return 0
  }else{
    var super_gen = this.super_draw_object.get_generation()
    return super_gen + 1
  }
}

/** get_connecting_point Method
get the connecting point the other object should connect to, and
set the obejct into connecting maps as the status of connectiong

  Args:
    hintDrawObj(DrawObj): the drawObject to be wanted to connect to

  Retrun:
    connecting_point(Array[x, y])
**/
DrawObject.prototype.get_connecting_point = function(hintDrawObj){
  var aspect_name = this.which_aspect_is_closer(hintDrawObj)
  var current_connecting = this.connecting_points[aspect_name]
  var candidate_point = null
  var candidate_array  = []
  for(var point in current_connecting){
    // decode
    point = point.split(',')
    if (candidate_point == null) {
      candidate_point = point
      candidate_array = current_connecting[point]
    }
    if (candidate_array.length > current_connecting[point].length){
      candidate_point = point
      candidate_array = current_connecting[point]
    }
  }
  candidate_array.push(hintDrawObj)
  return candidate_point //[x, y] array
}

/** which_aspect_is_closer Method
find out the other obejct is classified into 4 aspects as closer
  Args:
    comparedObj(drawObject)

  Return:
    aspect(str): 'left' or 'right' or 'top' or 'down'
**/
DrawObject.prototype.which_aspect_is_closer = function(comparedObj){
  var LEFT = 'left'
  var RIGHT = 'right'
  var TOP = 'top'
  var DOWN = 'down'

  var source_pX_end = this.canvas.get_possitionX_end()
  var source_pY_end = this.canvas.get_possitionY_end()

  var vartical_distance = null
  var horizontal_distance = null  
  var X = null
  var Y = null
  if(comparedObj.canvas.possitionX>this.canvas.possitionX){
    X = RIGHT
    horizontal_distance = comparedObj.canvas.possitionX - source_pX_end
    //The vartical_distance is minus, which means this object is wrapping
  }else{
    X = LEFT
    horizontal_distance = this.canvas.possitionX - comparedObj.canvas.possitionX
  }
  if(comparedObj.canvas.possitionY>this.canvas.possitionY){
    Y = DOWN
    vartical_distance = comparedObj.canvas.possitionY - source_pY_end
    //The vartical_distance is minus, which means this object is wrapping
  }else{
    Y = TOP
    vartical_distance = this.canvas.possitionY - comparedObj.canvas.possitionY
  }
  if(vartical_distance > horizontal_distance){
    return Y
  }else{
    return X
  }  
}

DrawObject.prototype.add_connection = function(drawConObj){
  this.connections.push(drawConObj)
}

DrawObject.prototype.add_connection_to = function(drawObject){
  drawConObj = new DrawConnectionObject(this, drawObject)
  this.add_connection(drawConObj)
  drawObject.add_connection(drawConObj)
  return drawConObj
}

DrawObject.prototype.event_handler = function(eventName, event_info){
  if(this.event_functions[eventName]){
    this.event_functions[eventName](this, eventName, event_info)
  }else{
    //console.log(this.name)
    //console.log(this.event_functions)
  }
}

DrawObject.prototype.event_function_register = function(eventName, event_function){
  this.event_functions[eventName] = event_function
}
