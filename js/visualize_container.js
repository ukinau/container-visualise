globals = {
  "infrontObjects": [],
  "modal": null,
  "modalFlag": false
}
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
    options['text-is_bold'] = false
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
  }
  pallet.add_object(dObj)
  return dObj
}

function mouseMoveHandler(_this, eventName, eventInfo){
  if(globals['modalFlag']){
    return false
  }
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
  if(globals['modalFlag']){
    return false
  }
  moveStart(_this, eventName, eventInfo)
  showTextBox(_this)
  var connections = _this.connections
  globals['infrontObjects'].push(_this)
  for(var i=0; i<connections.length; i++){
    if(_this == connections[i].from){
      showTopicOnConnections([connections[i]], {"color": "blue", "lineWidth": 3})
      globals['infrontObjects'].push(connections[i].to)
    }else{
      showTopicOnConnections([connections[i]], {"color": "red", "lineWidth": 3})
      globals['infrontObjects'].push(connections[i].from)
    }
    var sametopic_connections =  find_connection_by_topic(
        connections[i].to.connections, connections[i].options.topics)
    showTopicOnConnections(sametopic_connections, {"color": "green", "lineWidth": 3}, _this)
    for(var j=0; j<sametopic_connections.length; j++){
      sametopic_connections[j].options.pinned = true
      globals['infrontObjects'].push(sametopic_connections[j].to)
    }
    connections[i].options.pinned = true
  }

  var modalBackground = new SquareWithTitle(
      "", {'color': 'rgb(250, 250, 250)', 'globalAlpha': 0.8, 'x': 0, 'y': 0,
           'width': 3000, 'height': 2000})
  modalBackground.z_index = 50
  modalBackground.z_index_fixed = true
  var drawObject = new DrawObject()
  drawObject.canvas = modalBackground
  globals['modal'] = drawObject
  globals['modalFlag'] = true
  pallet.add_object(drawObject)

  for(var i=0; i<globals['infrontObjects'].length;i++){
    globals['infrontObjects'][i].canvas.z_index = 99
    globals['infrontObjects'][i].canvas.z_index_fixed = true
  }

  pallet.render()
}
function clickClearHandler(_this, eventName, eventInfo){
  hideTextBox(_this)

  var connections = _this.connections
  hideTopicOnConnections(connections, true)
  for(var i=0; i<connections.length; i++){
    var sametopic_connections =  find_connection_by_topic(
        connections[i].to.connections, connections[i].options.topics)
    hideTopicOnConnections(sametopic_connections, true)
    for(var j=0; j<sametopic_connections.length; j++){
      sametopic_connections[j].options.pinned = false
    }
    connections[i].options.pinned = false
  }

  pallet.remove_object(globals['modal'])
  globals['modal'] = null
  globals['modalFlag'] = false
  for(var i=0; i<globals['infrontObjects'].length;i++){
    globals['infrontObjects'][i].canvas.z_index_fixed = false
  }
  globals['infrontObjects'] = []

  pallet.render()
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
}


function connectionHighLight(_this, eventName, _){
  var connections = _this.connections
  for(var i=0; i<connections.length; i++){
    if(connections[i].options.pinned){
      continue
    }
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
    if(connections[i].options.pinned){
      continue
    }
    if(!connections[i].options.pinned){
      connections[i].unHighlight()
    }
  }
  pallet.render()
}
function showTopicOnConnections(connections, highlight, except_obj){
  for(var i=0; i<connections.length; i++){
    if(highlight){
      if(connections[i].to != except_obj &&
          connections[i].from != except_obj){
        connections[i].highlight(highlight)
      }
    }
    if(connections[i].options._title && !(connections[i].canvas instanceof ArrowConnectionWithTitle)){
      if(connections[i].from != except_obj && connections[i].to != except_obj){
        var strokeStyle = connections[i].canvas.strokeStyle
        connections[i].canvas = new ArrowConnectionWithTitle(connections[i].options._title)
        connections[i].canvas.title.color = strokeStyle
        connections[i].canvas.title.is_bold = false
      }
    }
    if(highlight){
      if(connections[i].to != except_obj &&
          connections[i].from != except_obj){
        connections[i].highlight(highlight)
      }
    }
  }
}
function hideTopicOnConnections(connections, unHighlight){
  for(var i=0; i<connections.length; i++){
    if(connections[i].options._title && (connections[i].canvas instanceof ArrowConnectionWithTitle)){
      connections[i].canvas = new ArrowConnection()
    }
    if(unHighlight){
      connections[i].unHighlight()
    }
  }
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

//topics: [['op', 'topic'], ['op1', 'topic1']]
function find_connection_by_topic(connections, topics){
  result = []
  if(!topics){
    return result
  }
  for(var i=0; i<connections.length; i++){
    if(!connections[i].options.topics){
      continue
    }
    var flg = false
    for(var j=0; j<connections[i].options.topics.length; j++){
      if(flg){flg = false; break}
      for(var k=0; k<topics.length; k++){
        if(connections[i].options.topics[j][1] == topics[k][1]){
          result.push(connections[i]); flg = true; break
        }
      }
    }
  }
  return result
}
