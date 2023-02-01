/**
  Allegro: Modular, visual editor for PmWiki
  Written by (c) Petko Yotov 2017-2022   www.pmwiki.org/Petko

  This text is written for PmWiki; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version. See pmwiki.php for full details
  and lack of warranty.
*/

function halt(msg) {
  return { MESSAGE: msg };
}


var echo = console.log;
// echo("Loading worker...")

const { E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2, abs, acos, acosh,
  asin, asinh, atan, atan2, atanh, cbrt, ceil, cos, cosh, exp, expm1, 
  floor, hypot, log, log10, log1p, log2, max, min, pow, random, round, 
  sign, sin, sinh, sqrt, tan, tanh, trunc } = Math;
const ln = Math.log;
const pow10 = function(x){ return Math.pow(10, x); };

var AllegroFormTemplate = function($, active) {
  "use strict";
  
  
  /*InputVars*/
  
  var $$ = {}, disabled = {}, outputDone = false, MESSAGE = false;
  
  try {
    /*Formulas*/
    
    /*Logic*/
  }
  catch(e) {
    return { MESSAGE: e};
  }
  
  if(MESSAGE) $$.MESSAGE = MESSAGE;
  
  if(! outputDone) {
    /*OutputVars*/
    
  }
  
  if(!$.toPrecision && ! $$.toPrecision && typeof toPrecision == 'number' && !isNaN(toPrecision)) {
    $$.toPrecision = toPrecision;
  }
  
  return $$;
}

var Forms = {};

function createForm(data) {
  // {  }
}



onmessage = function(e) {
  
  var data = e.data;
  var obj = data.obj;
  if(typeof Forms[obj.id] == 'function') {
//     echo({exists: 'function'});
    var results = Forms[obj.id].call(obj, data.$, data.active);
    if(!results.$) results.$ = data.$;
    if(!results.WorkerTimeout) results.WorkerTimeout = data.WorkerTimeout;
    
    
    return postMessage({results});
  }
  
  echo({doesntexist: 'creating'});
  
  
  var template = AllegroFormTemplate.toString().split(/\n+/g).slice(1, -1).join('\n');
  
  
//   echo(obj);
  
  var formulas = '';
  for(var n in obj.formulas) {
    formulas += "if(active != '"+n+"') { "+n+" = "+sanitizeJS(obj.formulas[n])+"; }\n";
  }
  
  var InputVars = [];
  var OutputVars = '';
  for(var i = 0; i<obj.fieldnames.length; i++) {
    var n = obj.fieldnames[i];
    OutputVars += '      if('+n+' !== $.'+n+' && typeof $$.'+n+' == "undefined") $$.'+n+' = '+n + ';\n';
    InputVars.push(n, 'orig_'+n);
  }
  InputVars = 'var { ' + InputVars.join(', ') + '} = $; \n';
  
  var Logic = template.allegroSplice('/*Logic*/', sanitizeJS(obj.code))
    .allegroSplice("/*InputVars*/", InputVars)
    .allegroSplice("/*OutputVars*/", OutputVars.trim())
    .allegroSplice("/*Formulas*/", formulas.trim())
    ;
  
  try {
    var func = new Function('$', 'active', Logic);
    Forms[obj.id] = func;
    results = 'success';
  }
  catch(e) {
    var results = e;
  }
//   echo({beforereturning: results});
  postMessage({results});
  
  
  
  
}















String.prototype.allegroSplice = function(needle, replacement) {
  var startpos = this.indexOf(needle);
  if(startpos<0) return this;
  return this.slice(0, startpos) + replacement + this.slice(startpos + needle.length);
}

function sanitizeJS(code) {
  return code.replace(/\b(eval|[wW]indow|top|self|parent|document|open|dqsa?|sa|adj[ba][be]|aE|tap|addEventListener|any|hide|show|fe4p?|xupload|fetch|XMLHttpRequest|[Ll]ocation|alert|prompt|confirm|[Hh]istory|__proto__|prototype)\b/g, 'disabled.$1');
}


Number.prototype.pow = function(n) {
  return Math.pow(this, n);
}

Number.prototype.root = function(n) {
  if(n==0 || isNaN(n)) n = 2;
  return Math.pow(this, 1/n);
}

Array.prototype.unique = function() {
  return [...new Set(this)];
}

String.prototype.isReserved = function() {
  const rx = /^(Array|Date|Infinity|Math|NaN|Number|Object|String|abstract|abstract|alert|all|anchors?|anchor|area|arguments|assign|await|blur|boolean|break|button|byte|case|catch|char|checkbox|class|clearInterval|clearTimeout|clientInformation|closed?|confirm|const|constructor|continue|crypto|debugger|decodeURI(Component)?|default|defaultStatus|delete|do|document|double|elements?|else|embeds?|encodeURI(Component)?|enum|escape|eval|event|export|extends|false|fileUpload|final|finally|float|focus|for|forms?|frameRate|frames?|function|goto|hasOwnProperty|hidden|history|if|images?|implements|import|in|innerHeight|innerWidth|instanceof|int|interface|isFinite|isNaN|isPrototypeOf|layers?|length|let|link|location|long|mimeTypes|name|native|navigate|navigator|new|null|offscreenBuffering|onblur|onclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmouseover|onmouseup|onsubmit|open|opener|option|outerHeight|outerWidth|packages?|page[XY]Offset|parent|parseFloat|parseInt|password|pkcs11|plugin|private|prompt|propertyIsEnum|protected|prototype|public|radio|reset|return|screen[XY]|scroll|secure|select|self|setInterval|setTimeout|short|static|status|submit|super|switch|synchronized|taint|text|textarea|this|throws?|toString|top|transient|true|try|typeof|undefined|unescape|untaint|valueOf|var|void|volatile|while|window|with|yield|disabled)([ \t].*)?$/mg;
  
  const myrx = /^(E|LN10|LN2|LOG10E|LOG2E|PI|SQRT1_2|SQRT2|abs|acos|acosh|asin|asinh|atan|atan2|atanh|cbrt|ceil|cos|cosh|exp|expm1|floor|hypot|log|log10|log1p|log2|max|min|pow|random|round|sign|sin|sinh|sqrt|tan|tanh|trunc|ln|pow10|MESSAGE|HALT|halt|outputDone|AllegroForms|afConfig|AllegroFormTemplates)([ \t].*)?$/mg;
  
  if(! this.match(rx) && ! this.match(myrx)) return false;
  
  var matches = [];
  var x = this.replace(rx, function(a, a1){
    matches.push(a1);
    return '';
  });
  var x = this.replace(myrx, function(a, a1){
    matches.push(a1);
    return '';
  });
  return matches.unique();
}

function toKelvin(t, scale) {
  scale = scale? scale.trim().toUpperCase().charAt(0) : 'C';
  var k;
  if(scale == 'K') k = t;
  else if(scale == 'F') k = (t + 459.67) / 1.8;
  else if(scale == 'R') k = t / 1.8;
  else if(scale == 'C') k = t+273.15;
  return Math.max(k, 0);
}

function deg2rad(deg) { return deg * Math.PI / 180; }
function rad2deg(rad) { return rad * 180 / Math.PI; }

function minmax(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function rint(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function zpad(n) {
  if (n<10) return '0'+n;
  return '' + n;
}


function rnd(x, n) {
  n = n || 0;
  var pwr = Math.pow(10, n);
  return Math.round(x*pwr)/pwr;
}

function percent(x, n){
  return (x*100).toFixed(n) + '%';
}

Number.prototype.rnd = function(n) {
  return rnd(this, n);
}

function isN() {
  for(var i=0; i<arguments.length; i++) {
    if(typeof arguments[i] != 'number' || isNaN(arguments[i])) return false;
  }
  return true;
}

function cntN() {
  var cnt = 0;
  for(var i=0; i<arguments.length; i++) {
    if(isN(arguments[i])) cnt++;
  }
  return cnt;
}

function LinearConversion($, active, obj) {
  if(!obj) obj = this;
  var $$ = {}, scales = obj.scales;
  
  if(!scales[active]) {
    if(obj.prevActive) active = obj.prevActive;
    else return {};
  }
  var scale = scales[active];
  
  obj.prevActive = active;
  
  if(isNaN($[active])) $[active] = 0;
  
  var value = $[active];
  
  var basevalue = obj.inverseScale
    ? value*scale
    : value/scale;
    
  for(var n in scales) {
    if(n==active) continue;
    if(!scales.hasOwnProperty(n)) continue;
    if(!scale) continue; // div_0
    var r = obj.inverseScale
      ? basevalue/scales[n]
      : basevalue*scales[n]; 
    $$[n] = r;
  }
  return $$;
}




// echo("Worker loaded!")


