function DrawObjectWithEvent(name, options){
  if(options['type'] == 'team'){
    options['color'] = '#C9C9AB'
    options['text-font'] = '20px sans-serif'
  }else if(options['type'] == 'component'){
    options['color'] = '#88856A'
    options['text-font'] = '20px sans-serif'
  }else{
    options['color'] = '#DBBE32'
    options['text-font'] = '16px sans-serif'
  }
  var dCanvas = new SquareWithTitle(name, options)
  var dObj = new DrawObject(name, dCanvas, options)
  if(dObj.options['type'] == 'container'){
    dObj.event_function_register("mousedown", clickHandler)
    dObj.event_function_register("mousedown:clear", clickClearHandler)
    dObj.event_function_register("dragging", draggingHandler)
    dObj.event_function_register("dragging:clear", draggingClearHandler)
    dObj.event_function_register("mousemove", mouseMoveHandler)
    dObj.event_function_register("mousemove:clear", mouseMoveClearHandler)
    dObj.canvas.title.is_bold = false
  }
  pallet.add_object(dObj)
  return dObj
}

function mouseMoveHandler(_this, eventName, eventInfo){
  _this.canvas.lineFlag = true
  _this.canvas.lineColor = '#ffffff'
  _this.canvas.lineWidth = 5
  connectionHighLight(_this, eventName, eventInfo)
  pallet.render()
}
function mouseMoveClearHandler(_this, eventName, eventInfo){
  _this.canvas.lineFlag = false
  connectionUnHighLight(_this, eventName, eventInfo)
  pallet.render()
}

function clickHandler(_this, eventName, eventInfo){
  moveStart(_this, eventName, eventInfo)
  showTextBox(_this)
}
function clickClearHandler(_this, eventName, eventInfo){
  hideTextBox(_this)
}
function draggingHandler(_this, eventName, eventInfo){
  move(_this, eventName, eventInfo)
}
function draggingClearHandler(_this, eventName, eventInfo){
  clearMove(_this, eventName, eventInfo)
  hideTextBox(_this)
  showTextBox(_this)
}


function showTextBox(_this){
  if(_this.options['textboxDrawObject']){
    return
  }
  if(!_this.options['description']){
    _this.options['description'] = "empty description"
  }
  var content = _this.id + '\n' + _this.options['description']
  var textbox =  new TextboxSquare(pallet.ctx, content)
  textbox.possitionX = _this.canvas.get_possitionX_end()
  textbox.possitionY = _this.canvas.get_possitionY_end()

  textbox.width = 300
  textbox.height = 200
  textbox.color = "rgb(250, 250, 250)"
  textbox.globalAlpha = 0.8
  textbox.text.font = "20px sans-serif"
  textbox.text.is_bold = false
  textbox.z_index = 99
  textbox.z_index_fixed = true

  var drawObject = new DrawObject()
  drawObject.canvas = textbox
  _this.options['textboxDrawObject'] = drawObject
  pallet.add_object(drawObject)
  pallet.render()
}
function hideTextBox(_this){
  if(_this.options['textboxDrawObject']){
    pallet.remove_object(_this.options['textboxDrawObject'])
    _this.options['textboxDrawObject'] = null
    pallet.render() 
  }
  console.log('hide')
}


function connectionHighLight(_this, eventName, _){
  var connections = _this.connections
  for(var i=0; i<connections.length; i++){
    if(_this == connections[i].from){
      connections[i].highlight({"color": "blue", "lineWidth": 3})
    }else{
      connections[i].highlight({"color": "red", "lineWidth": 3})
    }
  }
  pallet.render()
}
function connectionUnHighLight(_this, eventName, _){
  var connections = _this.connections
  for(var i=0; i<connections.length; i++){
    connections[i].unHighlight()
  }
  pallet.render()
}


function moveStart(_this, eventName, eventInfo){
  _this['clicked'] = true
  _this['moveStartPoint'] = eventInfo
  _this['originalCordinate'] = [_this.canvas.possitionX, _this.canvas.possitionY]
}
function move(_this, eventName, eventInfo){
  _this.canvas.possitionX = _this['originalCordinate'][0] + Number(eventInfo['x']) - Number(_this['moveStartPoint']['x'])
  _this.canvas.possitionY = _this['originalCordinate'][1] + Number(eventInfo['y']) - Number(_this['moveStartPoint']['y'])
  pallet.render()
}
function clearMove(_this, eventName, eventInfo){
  _this['clicked'] = false
  _this['moveStartPoint'] = null
  _this['originalCordinate'] = [_this.canvas.possitionX, _this.canvas.possitionY]
}
