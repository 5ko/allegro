/**
  Ace - Highlight textareas for PmWiki
  Written by (c) Petko Yotov 2022    www.pmwiki.org/petko

  This text is written for PmWiki; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation version 2.
*/

var AceCustomHighlight = AceCustomHighlight || {};

function loadHLT(ace) {
  var oop = ace.require("ace/lib/oop");
  var TextMode = ace.require("ace/mode/text").Mode;
  var TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules;

  var custModes = {};
  for(var name in AceCustomHighlight) {
    
    var rules = function(){
      this.$rules = AceCustomHighlight[name];
      this.normalizeRules();
    };
    
    oop.inherits(rules, TextHighlightRules);

    var Mode = function() {
        this.HighlightRules = rules;
    };
    oop.inherits(Mode,TextMode);

    (function() {
        this.$id = "ace/mode/"+name;
    }).call(Mode.prototype);
    custModes[name] = new Mode;
  }
  
  return custModes;

}

function loadTooltips(ace, editor) {
//   echo('loadTooltips', ace, editor);
  var dom = ace.require("ace/lib/dom");
  var oop = ace.require("ace/lib/oop");
  var event = ace.require("ace/lib/event");
  var Range = ace.require("ace/range").Range;
  var Tooltip = ace.require("ace/tooltip").Tooltip;

  function TokenTooltip (editor) {
      if (editor.tokenTooltip)
          return;
      Tooltip.call(this, editor.container);
      editor.tokenTooltip = this;
      this.editor = editor;

      this.update = this.update.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseOut = this.onMouseOut.bind(this);
      event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
      event.addListener(editor.renderer.content, "mouseout", this.onMouseOut);
  }

  oop.inherits(TokenTooltip, Tooltip);

  (function(){
    this.token = {};
    this.range = new Range();
      
    this.update = function() {
      this.$timer = null;
      
      var r = this.editor.renderer;
      if (this.lastT - (r.timeStamp || 0) > 1000) {
        r.rect = null;
        r.timeStamp = this.lastT;
        this.maxHeight = window.innerHeight;
        this.maxWidth = window.innerWidth;
      }

      var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
      var offset = (this.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
      var row = Math.floor((this.y + r.scrollTop - canvasPos.top) / r.lineHeight);
      var col = Math.round(offset);

      var screenPos = {row: row, column: col, side: offset - col > 0 ? 1 : -1};
      var session = this.editor.session;
      var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);
      var token = session.getTokenAt(docPos.row, docPos.column);

      if (!token && !session.getLine(docPos.row)) {
        token = {
          type: "",
          value: "",
          state: session.bgTokenizer.getState(0)
        };
      }
      if (!token) {
        session.removeMarker(this.marker);
        this.hide();
        return;
      }

      var tokenText = token.type.replace(/[._]/g, ' ').replace(/(^\w| \w)/g, function(a){return a.toUpperCase();});
      
      if (token.state)
        tokenText += "|" + token.state;
      if (token.merge)
        tokenText += "\n  merge";
      if (token.stateTransitions)
        tokenText += "\n  " + token.stateTransitions.join("\n  ");

      if (this.tokenText != tokenText) {
        this.setText(tokenText);
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.tokenText = tokenText;
      }

      this.show(null, this.x, this.y);

      this.token = token;
      session.removeMarker(this.marker);
      this.range = new Range(docPos.row, token.start, docPos.row, token.start + token.value.length);
      this.marker = session.addMarker(this.range, "ace_bracket", "text");
    };
    
    function omm(e) {
      this.x = e.clientX;
      this.y = e.clientY;
      if (this.isOpen) {
        this.lastT = e.timeStamp;
        this.setPosition(this.x, this.y);
      }
      if (!this.$timer)
        this.$timer = setTimeout(this.update, 100);
    }
    
    this.onMouseMove = omm;

    this.onMouseOut = function(e) {
      if (e && e.currentTarget.contains(e.relatedTarget))
        return;
      this.hide();
      this.editor.session.removeMarker(this.marker);
      this.$timer = clearTimeout(this.$timer);
    };

    this.setPosition = function(x, y) {
      if (x + 10 + this.width > this.maxWidth)
        x = window.innerWidth - this.width - 10;
      if (y > window.innerHeight * 0.75 || y + 20 + this.height > this.maxHeight)
        y = y - this.height - 30;

      Tooltip.prototype.setPosition.call(this, x + 10, y + 20);
    };

    this.destroy = function() {
      this.onMouseOut();
      event.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
      event.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
      delete this.editor.tokenTooltip;
    };

  }).call(TokenTooltip.prototype);
  
  return TokenTooltip;
}


function debounce(func, timeout = 200){
  let start;
  return function(...args) {
    clearTimeout(start);
    start = setTimeout(function(){ func.apply(this, args); }, timeout);
  };
}

document.addEventListener('DOMContentLoaded', function(){
  var fields = document.querySelectorAll('textarea[data-ace]');
  if(!fields.length) return;
                          
  var echo = console.log;
  
  var acescript = document.querySelector('script[data-src$="/ace.min.js"], script[data-src$="/ace.js"]');
  
  var customModes = {};
  
  acescript.onload = function() {
    var basePath = acescript.src.replace(/[^\/]+$/, '');
    ace.config.set('basePath', basePath);
    customModes = loadHLT(ace);
    
    for(var i=0; i<fields.length; i++) ace_one(fields[i]);
    
  }
  acescript.src = acescript.dataset.src;
  

  
  function ace_one(field) {
    
    var p = field.closest('p');
    if(p) {
      var div2 = document.createElement('div');
      if(p.className) div2.className = p.className;
      p.parentNode.insertBefore(div2, p);
      while(p.firstChild) {
        div2.appendChild(p.firstChild);
      }
    }
    var mode = field.dataset.ace;
    var div = document.createElement('div');
    div.textContent = field.value;
    
    var rect = field.getBoundingClientRect();
    div.style.width = '100%';
    div.style.height = 1.1*field.rows + 'em';
    
    

    field.parentNode.insertBefore(div, field);
    
    var editor = ace.edit(div);
    editor.session.on('changeMode', function(e, session){
      if (session.getMode().$id === "ace/mode/javascript") {
        if (!!session.$worker) {
          session.$worker.send("setOptions", [{
            esversion: 9,
            esnext: false,
          }]);
        }
      }
    });
    editor.setTheme("ace/theme/textmate");
    if(customModes[mode]) {
      var nmode = customModes[mode];
    }
    else nmode = "ace/mode/"+mode;
    var options = {
      mode: nmode,
      wrap: 'free',
      minLines: 3,
//       maxLines: 18,
      indentedSoftWrap: true,
      useSoftTabs: true,
      tabSize: 2,
      navigateWithinSoftTabs: true,
    };
    if(field.placeholder) options.placeholder = field.placeholder;
    editor.setOptions(options);
    
    editor.resize();

    if(field.dataset.tooltips) {
      var tt = loadTooltips(ace, editor);
      new tt(editor);
    }

    editor.session.on('change', function(delta) {
      field.value = editor.getValue();
      evt = new Event("change");
      field.dispatchEvent(evt);
    });
  
    
    editor.session.on('changeAnnotation', function(x) {
      var annotations = editor.session.getAnnotations();
      if(annotations.length) {
        field.dataset.annotations = annotations.length;
      }
      else {
        field.removeAttribute('data-annotations');
      }
    });
    field.editor = editor;
    
    new ResizeObserver(debounce(function(e){
      editor.resize();
    })).observe(div);
    
    

  }
  
  
});
