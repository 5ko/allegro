/**
  Allegro: Modular, visual editor for PmWiki
  Written by (c) Petko Yotov 2017-2022   www.pmwiki.org/Petko

  This text is written for PmWiki; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version. See pmwiki.php for full details
  and lack of warranty.
*/
var AllegroForms = AllegroForms || {};
var AllegroTranslateForms = AllegroTranslateForms || {
  currentForm: []
};
var afConfig = afConfig || {};


var afPubDirUrl = document.currentScript.dataset.dirurl;
echo({afPubDirUrl});

var AllegroFormTemplates = {
  basic: function($, active) {
    "use strict";
    const { E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2, abs, acos, acosh,
      asin, asinh, atan, atan2, atanh, cbrt, ceil, cos, cosh, exp, expm1, 
      floor, hypot, log, log10, log1p, log2, max, min, pow, random, round, 
      sign, sin, sinh, sqrt, tan, tanh, trunc } = Math;
    const ln = Math.log;
    const pow10 = function(x){ return Math.pow(10, x); };
    
    
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
}

function sanitizeJS(code) {
  return code.replace(/\b(eval|[wW]indow|top|self|parent|document|open|dqsa?|sa|adj[ba][be]|aE|tap|addEventListener|any|hide|show|fe4p?|xupload|XMLHttpRequest|[Ll]ocation|alert|prompt|confirm|[Hh]istory|__proto__|prototype|constructor)\b/g, 'disabled.$1');
}


String.prototype.allegroSplice = function(needle, replacement) {
  var startpos = this.indexOf(needle);
  if(startpos<0) return this;
  return this.slice(0, startpos) + replacement + this.slice(startpos + needle.length);
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

function doNothing() {
  return undefined;
}

function halt(msg) {
  return { HALT: msg };
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

function copynode(el) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('copy');
}

function mkFormTable(name, dataarr, translatevalues) {
  
  if(dataarr.hasOwnProperty('headers') && dataarr.hasOwnProperty('firstcol')) {
    if(typeof dataarr.headers == 'string') dataarr.headers = dataarr.headers.split(/\|/g);
    if(typeof dataarr.firstcol == 'string') dataarr.firstcol = dataarr.firstcol.split(/\|/g);
    var data = [ dataarr.headers ];
    for(var cell of dataarr.firstcol) {
      var r = [ cell ];
      for(var c=1; c<dataarr.headers.length; c++) {
        r.push('');
      }
      data.push(r);
    }
  }
  else {
    var data = dataarr;
  }
  var rows = [];
  
  for(var r = 0; r<data.length; r++) {
    var cells = [];
    var tag = r? 'td':'th';
    for(var c=0; c<data[r].length; c++) {
      var role = name + '_' + r + '_' + c;
      var datarole = ` data-role="${role}"`;
      var cname = (r && c)? ' class="afcell"' : '';
      var val = data[r][c];
      if(translatevalues) val = labelMarkupToHTML(val);
      cells.push(`<${tag} ${datarole} ${cname} >${val}</${tag}>`);
    }
    rows.push('<tr>'+cells.join('\n')+'</tr>');
  }
  
  var out = `<table class="simpletable aftable-${name}">
    <thead>${rows.shift()}</thead>
    <tbody>${rows.join('\n')}</tbody></table>`;
  return out;
}







function labelMarkupToHTML(str) { // maybe translate here?
  
  str = str.trim();
  if(!str) return str;
  var has_i18n = false;
  str = str.replace(/\$\[(.*?)\]/g, function(a, a1){
    has_i18n = true;
    AllegroTranslateForms.currentForm.push(a1);
    return a1;
  });
  
  if(!has_i18n) AllegroTranslateForms.currentForm.push(str);
  
  var html = str
    .replace(/'''''([\s\S]*?)'''''/g, '<strong><em>$1</em></strong>')
    .replace(/'''([\s\S]*?)'''/g, '<strong>$1</strong>')
    .replace(/''([\s\S]*?)''/g, '<em>$1</em>')
    .replace(/_\{(.*?)\}/g, '<sub>$1</sub>')
    .replace(/_(\w)/g, '<sub>$1</sub>')
    .replace(/\^\{(.*?)\}/g, '<sup>$1</sup>')
    .replace(/\^(\w)/g, '<sup>$1</sup>')
    .replace(/\n|\\n|\\\\/g, '<br/>')
  ;
  return html;
}

function parseInputSpect(str, idx) {
  var a = str.match(/^([_a-zA-Z]\w*)?\s*(([\^@?<>=+%$~.]=).*$)/s);
  
  var out = {};
  if(!a) {
    out.type = 'note';
    var el = document.createElement('div');
    el.className = 'note';
    el.innerHTML = str.match(/^[\s-]*$/) ? '' : labelMarkupToHTML(str);
    out.el = el;
    return out;
  }
  
  out.name = a[1] ? a[1] : 'input' + idx;
  var props = a[2].match(/([\^@?<>=+%$~.]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/gs);
  
  var attributes = {
    '?=': 'label',
    '@=': 'type',
    
    '>=': 'min',
    '<=': 'max',
    '.=': 'precision',
    
    '+=': 'step',
    '==': 'value',
    '%=': 'scale',
    
    '^=': 'prefix',
    '$=': 'suffix',
    '~=': 'formula'
  }
  for(var i=0; i<props.length; i++) {
    var prefix = props[i].slice(0,2);
    var attr = attributes[prefix];
    var value = props[i].slice(2).trim();
    if(attr == 'scale') {
      if(value.slice(0,2) == '1/') 
        value = 1/parseFloat(value.slice(2).trim());
      else value = parseFloat(value);
    }
    if(attr.match(/^(min|max|precision)$/)) {
      value = parseFloat(value);
      if(isNaN(value)) continue;
    }
    if(attr.match(/^(step|scale)$/)) {
      value = parseFloat(value);
      if(isNaN(value)) continue;
    }
    out[attr] = value;
  }
  if(!out.type) out.type = 'number';
  if(out.name.charAt(0) === '_') out.readonly = 'readonly';
  if(out.type=='number') {
    var pf = parseFloat(out.value);
    if(!isNaN(pf)) out.value = pf;
    else delete out.value;
  }
  
  var tag = 'input';
  var c = out.type.match(/^area(?:(\d+)[x*](\d+))?/);
  var size = out.type.match(/^([a-z]+)(\d+)$/);
  if(c) {
    tag = 'textarea';
    out.cols = c[1] ? c[1] : 40;
    out.rows =  c[1] ? c[2] : 3;
  }
  else if(size) {
    out.type = size[1];
    out.size = size[2];
  }
  if(out.type == 'html') {
    tag = 'div';
  }
  if(out.type == 'table') {
    tag = 'div';
    out.html = mkFormTable(out.name, {headers:out.label, firstcol:out.prefix, footers:out.suffix}, true);
    delete out.label;
    delete out.prefix;
    delete out.suffix;
  }
  if(out.type == 'copy') {
    out.type = 'button';
    out.name = 'copyResults';
    if(!out.value) out.value = labelMarkupToHTML('Copy results');
  }

  var el = document.createElement(tag);
  if(out.html) el.innerHTML = out.html;

  if(out.type.match(/^\*(checkbox|radio)$/)) {
    el.setAttribute('checked', 'checked');
    out.type =  out.type.slice(1);
  }
  
  var attrs = 'type value name max min step rows cols size readonly'.split(/\s+/g);
  for(var i=0; i<attrs.length; i++) {
    if(out.hasOwnProperty(attrs[i])) {
      var dataattr = tag == 'div'? 'data-'+attrs[i] : attrs[i];
      el.setAttribute(dataattr, out[attrs[i]]);
    } 
  }
  if(out.hasOwnProperty('value') && tag == "textarea") {
    el.value = out.value;
  }
  if(out.scale) el.dataset.scale = out.scale;
  
  
  if(out.prefix) out.prefix = labelMarkupToHTML(out.prefix);
  
  if(out.type.match(/^(button|reset)$/)) el.className = 'inputbutton';
  else if(out.type == 'html') el.className = 'inputhtml';
  else if(out.type == 'table') el.className = 'inputtable';
  else el.className =  'inputbox';
  
  if(out.type.match(/^(reset|button)$/)) {
    if(!out.value) {
      if(out.label) {
        out.value = out.label;
        delete out.label;
      }
      else if(out.name) {
        out.value = out.name;
      }
    }
  }
  if(!out.label && out.type.match(/^(number|text)$/)) out.label = out.name;
  if(out.label == '-') delete out.label;
  if(out.label && out.label != '' ) out.label = labelMarkupToHTML(out.label);
  
  if(out.type == 'number') {
    // accepts decimal separators both comma and dot
    el.setAttribute('lang', 'de');
    if(!out.step)
      el.setAttribute('step', 'any');
  }

  out.el = el;
  
  return out;
}

function caseInsensitiveFindForm(container, formid) {
  var lcid = formid.toLowerCase();
  for(var id in container) {
    if(lcid == id.toLowerCase()) return container[id];
  }
  return null;
}

workerUrl = afPubDirUrl + '/allegro-forms-worker.js';

fe4('text', workerUrl, function(w){
  const blob = new Blob([w], { type: "application/javascript" });
  workerUrl = URL.createObjectURL(blob);
});




function mkAllegroForm(formid) {
  
  echo({AllegroForms, formid, ciff: caseInsensitiveFindForm(AllegroForms, formid)});
  
  if(!caseInsensitiveFindForm(AllegroForms, formid)) {
    var conf = caseInsensitiveFindForm(afConfig, formid);
    if(! conf) return false;
    
    var o = {};
    o.initialEvent = conf.Event +  "";
//     echo(conf);
    if(typeof conf.Precision == 'number') o.toPrecision = conf.Precision;
    if(conf.Layout) o.cname = conf.Layout;
    if(conf.Fields) o.inputs = conf.Fields.trim().replace(/^#.*$/mg, '')
      .replace(/\n{2,}/g, "\n").replace(/\n /g, " ");
    
    if(conf.Event == 'linear')
      o.oninput = LinearConversion;
    
    else if(conf.Event == 'inverse') {
      o.oninput = LinearConversion;
      o.inverseScale = 1;
    }
    else { // oninput, onbtnclick
      
      var tplfunc = conf.LogicTemplate && AllegroFormTemplates[conf.LogicTemplate]
        ? AllegroFormTemplates[conf.LogicTemplate]
        : AllegroFormTemplates.basic;
    
      var template = tplfunc.toString().split(/\n+/g).slice(1, -1).join('\n');
      
      
      o[conf.Event] = true;
      o.Logic = {ev:conf.Event, code:template.allegroSplice('/*Logic*/', sanitizeJS(conf.Logic))};
      o.code = conf.Logic;
    }
    o.initialEvent = conf.Event;
    AllegroForms[formid] = o;
  }
  
  
  function inputFocus(e) {
    var parent = this.closest('div.input');
    if(!parent) return;
    if(e.type == 'focus') {
      parent.classList.add('focused');
      this.select();
    }
    else parent.classList.remove('focused');
  }
  
  function setvalues(results, formpart) {
//     echo('in setvalues', results);
    if(results.MESSAGE) {
      var msg = (typeof results.MESSAGE == 'object')
        ? results.MESSAGE.name + ': ' +  results.MESSAGE.message
        : results.MESSAGE
      form.querySelector('.alert [data-role="allegroalert"]').innerHTML = labelMarkupToHTML(msg);
      form.querySelector('.alert').classList.remove('hidden');
    }
    if(formpart) {
      var is_part = 1;
    }
    else {
      var is_part = 0;
      formpart = form;
    }
    var unset = {}, unsetcount = 0;
    for(var n in results) {
      var r = results[n];
      if(formpart.elements[n])
        formpart.elements[n].value = r;
      else {
        var role = formpart.querySelector('[data-role="'+n+'"],[data-name="'+n+'"]');
        if(role) {
          if(typeof r =='object' && r.hasOwnProperty('title') && r.hasOwnProperty('value') ) {
            var h = HSC(r.value).replace(/&amp;/g, '&'), 
                t = HSC(r.title);
            role.innerHTML = `<span title="${t}">${h}</span>`;
          }
          else {
//             echo(r);
            role.innerHTML = HSC(r.toString());
          }
        }
        else {
          unset[n] = results[n];
          unsetcount ++;
        }
      }
    }
    if(! unsetcount || is_part || !obj.otheroutputs) {return;}
    var elements = document.querySelectorAll(obj.otheroutputs)
    for(var i=0; i<elements.length; i++ ) {
      var part = elements[i];
      setvalues(unset, part); 
    }
  }
  
  
  function getvalues() {
    var inputs = form.querySelectorAll('input');
    var out = { };
    var errors = [];
    for(var i=0; i<inputs.length; i++) {
      if(inputs[i].type.match(/^(button|reset)$/)) continue;
      if(inputs[i].type.match(/^(checkbox|radio)$/) && !inputs[i].checked) continue;
      out['orig_'+inputs[i].name] = inputs[i].value;
      if(obj.toDecimal) out[inputs[i].name] = new Decimal(inputs[i].value);
      else {
        var fl = parseFloat(inputs[i].value);
        if(isN(fl)) {
          out[inputs[i].name] = fl;
        }
        else out[inputs[i].name] = inputs[i].value;
      }
    }
    return out;
  }
  
  
  function validfield(el) {
    if(el.type != 'number') return;
    if(el.value === "" && el.validationMessage === "") { // ?
      return el.classList.remove('invalid');
    }
    
    var val = parseFloat(el.value), min=parseFloat(el.min), max=parseFloat(el.max);
    if(isNaN(val) || (isN(min) && val<min) || (isN(max) && val>max) ) {
      echo({val, min, max})
      return el.classList.add('invalid');
    }
    
    return el.classList.remove('invalid');
  }
  
  function onEvent(e){
    var active = e.active || e.target.name;
    if(e.target) validfield(e.target);
    if(form.querySelector('.invalid')) {
      return setvalues({MESSAGE: "Some fields have incorect or out-of-range values."});
    }
    
    var values = Object.freeze(getvalues());
    if(e.func) var fn = e.func;
    else var fn = e.type == 'input' ? obj.oninput : obj.onbtnclick;
    
    if(obj.initialEvent.match(/^(linear|inverse)$/)) {
      var results = fn.call(obj, values, active);
      return setroundedvalues(results, values)
    }
    if(obj.Worker) {
      Work(values, active);
    }
    else {
      
    }

  }
  
  
  function mkWorker(){
    obj.Worker = new Worker(workerUrl);
    obj.Worker.onmessage = function(e) {
      var results = e.data.results;
      if(results === 'success') return; // on creation
      
      
      if(results.WorkerTimeout) {
//         echo("clearing: "  + results.WorkerTimeout);
        clearTimeout(results.WorkerTimeout);
      }
      
      
      
      var $ = results.$ ? results.$ : {};
      
      setroundedvalues(results, $);
    }
    obj.Worker.onerror = function(e) {
      echo({workerError: e});
    }
    obj.Worker.postMessage({obj: obj.serialised});
    
  }
  function Work(values, active) {
    let t = setTimeout(function(){
      if(!obj.Worker) return;
                       
      echo("terminating: "  + t);
      obj.Worker.terminate();
      obj.Worker = false;
      
      setvalues({MESSAGE: "Calculation terminated because it took too long (infinite loop?). Please contact support."});
    }, 3000);
    
    obj.Worker.postMessage({
      $: values, 
      active: active,
      obj: obj.serialised,
      WorkerTimeout: t,
    });
  }
  
  function setroundedvalues(results, values) {
    var tp = -1;
    if(isN(results.toPrecision)) tp = results.toPrecision;
    else if(isN(values.toPrecision)) tp = values.toPrecision;
    else if(isN(obj.toPrecision)) tp = obj.toPrecision;
    
    for(var i in results) if(isN(results[i])) {
      if(i=='toPrecision') continue;
      if(isN(obj.roundResults[i]) && obj.roundResults[i]>=0) 
        results[i] = rnd(results[i], obj.roundResults[i]);
      else if(tp>=0) results[i] = rnd(results[i], tp);
    }
    setvalues(results);
  }
  
  
  function copyResults(e) {
    var fields = form.querySelectorAll(':scope > div.input, :scope > div.note, :scope > div.table');
    var div = document.createElement('div');
    var data = [ ['Field', 'Value'] ];
    for(var field of fields) {
      if(field.classList.contains('note')) data.push([field.innerHTML, '']);
      else if(field.classList.contains('table')) {
        var rows = field.querySelectorAll('tr');
        for(var r of rows) {
          var out = [];
          for(var cell of r.children) {
            out.push(cell.innerHTML);
          }
          data.push(out);
        }
      }
      else if(field.classList.contains('input')) {
        var input = field.querySelector('input');
        if(input.type.match(/^(checkbox|radio)$/) && !input.checked) continue; 
        var label = field.querySelector('label');
        data.push([label.innerHTML, input.value]);
      }
    }
    var results = mkFormTable('copyResults', data, false);
    div.innerHTML = results;
    form.appendChild(div);
    copynode(div);
    form.removeChild(div);
    temporarilyChangeValue(this, 'Copied!');
  }
  
  
  var obj = AllegroForms[formid];
  obj.id = formid;
  obj.scales = {};
  obj.formulas = {};
  obj.roundResults = {};
  obj.fieldnames = [];
  
  obj.Worker = false;
  obj.WorkerTimeout = [];
  
  var form = document.createElement('form');
  form.id = 'f'+formid;
  form.className = 'allegro-calc';
  if(obj.cname) form.className  += " "+obj.cname;
  

  var alert = document.createElement('div');
  alert.className = 'alert frame hidden';
  alert.innerHTML = '<span data-role="allegroalert"></span>'
    + ' <span class="allegro-close-alert">OK</span>';
  alert.querySelector('.allegro-close-alert').addEventListener('click', function(e){
    this.parentNode.classList.toggle('hidden');
  });
  form.appendChild(alert);

  
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(obj.onbtnclick) onEvent(e);
  });
  
  form.addEventListener('keydown', function(e){
    if(e.key == 'Enter') {
      e.preventDefault();
      if(obj.onbtnclick) onEvent(e);
    }
  });

  
  function addElement(inputstr, i) {
    var d = document.createElement('div');
    
    var input = parseInputSpect(inputstr, i);
    
    if(input.type == 'config') {
      obj[input.name] = input.value;
      return;
    }
    
    inputtypes[input.type] = 1;
    
    
    if(input.type == 'note') {
      form.appendChild(input.el);
      return;
    }
    
    if(input.scale) {
      obj.scales[input.name] = input.scale;
    }
    if(input.formula) {
      obj.formulas[input.name] = input.formula;
    }
    if(input.precision) {
      obj.roundResults[input.name] = input.precision;
    }
    
    var el = input.el;
    // not input.name, can have multiple with the same name, eg radios
    el.id = form.id + '--' + i; 
    
    if(input.type == 'html') d.className = 'divhtml';
    else if(input.type == 'table') d.className = 'table';
    else d.className = input.type.match(/^(button|reset)$/) 
      ? 'button' : 'input';
    if(input.readonly) d.classList.add('readonly')
  
    if(input.label) {
      var l = document.createElement('label');
      l.setAttribute('for', el.id);
      l.innerHTML = input.label;
      if(!input.type.match(/^(checkbox|radio)$/)) d.appendChild(l);
    }
    if(input.prefix) {
      var l = document.createElement('span');
      l.className = 'prefix'
      l.innerHTML = input.prefix;
      d.appendChild(l);
    }
    
    if(input.name && input.type.match(/^(number|text|checkbox|radio)$/)) {
      if(input.name.isReserved()) {
        if(!obj.ERROR) obj.ERROR = "";
        obj.ERROR += "Keyword <b>"+input.name+"</b> is reserved and cannot be used as a field name. \n";
      }
      else obj.fieldnames.push(input.name);
      
    }
    
    if(input.type == 'button' && input.name == 'copyResults') {
      el.addEventListener('click', copyResults);
    }
    else if(input.type == 'button' && obj.onbtnclick) {
      el.addEventListener('click', onEvent);
    }
    else { // focus inputbox
      el.addEventListener('focus', inputFocus);
      el.addEventListener('blur', inputFocus);
      
    }
    if(input.type == 'hidden') {
      form.appendChild(el);
    }
    else {
      form.appendChild(d);
      d.appendChild(el);
    }
    if(input.label && input.type.match(/^(checkbox|radio)$/)) d.appendChild(l);
    
  }
  
  var inputtypes = {  };
  
  AllegroTranslateForms.currentForm = [];
    
  if(obj.html) {
    if(typeof obj.html == 'function') {
      obj.html(form);
    }
    else if(typeof obj.html == 'string') form.innerHTML = obj.html;
    else if(typeof obj.html == 'object') form.appendChild(obj.html);
    
  }
  else {
    if(typeof obj.inputs == "string") {
      obj.inputs = obj.inputs.split(/\n/g);
    }
    
    
    for(var i=0; i<obj.inputs.length; i++) {
      addElement(obj.inputs[i], i);
    }
    if(!inputtypes.button && obj.onbtnclick) {
      echo("adding button")
      addElement('@=button ==Calculate', ++i);
    }
    if(!inputtypes.reset && !obj.noreset) {
      addElement('@=reset ==Reset', ++i);
    }
  }
  
  if(obj.Logic && obj.Logic.code) {
    
    var formulas = '';
    for(var n in obj.formulas) {
      formulas += "if(active != '"+n+"') { "+n+" = "+sanitizeJS(obj.formulas[n])+"; }\n";
    }
    
    
    var InputVars = 'var { ' + obj.fieldnames.join(', ') + ', '
    + 'orig_' + obj.fieldnames.join(', orig_') + '} = $; \n';
    
    var OutputVars = '';
    for(var i = 0; i<obj.fieldnames.length; i++) {
      var n = obj.fieldnames[i];
      OutputVars += '      if('+n+' !== $.'+n+' && typeof $$.'+n+' == "undefined") $$.'+n+' = '+n + ';\n';
    }
    var logic = obj.Logic.code.allegroSplice("/*InputVars*/", InputVars)
      .allegroSplice("/*OutputVars*/", OutputVars.trim())
      .allegroSplice("/*Formulas*/", formulas.trim())
      ;
        
    try {
      var func = new Function('$', 'active', logic);
      obj[obj.Logic.ev] = func;
      
      if(inputtypes.html && !obj.oncreate) {
        var ev = { active: 'onCreate', func: func };
        onEvent(ev);
      }
    }
    catch(e) {
      obj.ERROR = e;
    }
  }
  
  if(obj.oninput) form.addEventListener('input', onEvent);
  
  if(obj.oncreate) obj.oncreate(form, obj);
  
  if(obj.ERROR) {
    setvalues({MESSAGE:obj.ERROR}, false);
  }
  
  var strings = dqs('#libcalcform [name="ptv_Strings"]');
  if(strings) {
    strings.value = AllegroTranslateForms.currentForm.unique().join('\n');
  }
  if(!obj.initialEvent.match(/^(linear|inverse)$/)) {
    obj.serialised = JSON.parse(JSON.stringify(obj));
    mkWorker();
  }
  
  return form;
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
  
  var value = new Decimal($[active]);
  
  var basevalue = obj.inverseScale
    ? value.times(scale)
    : value.dividedBy(scale);
    
  for(var n in scales) {
    if(n==active) continue;
    if(!scales.hasOwnProperty(n)) continue;
    if(!scale) continue; // div_0
    var r = obj.inverseScale
      ? basevalue.dividedBy(scales[n])
      : basevalue.times(scales[n]); 
    $$[n] = parseFloat(r.toDecimalPlaces(19).toString());
  }
  return $$;
}



document.addEventListener('DOMContentLoaded', function(){
  
  function insertForm(figure) {
    var id = figure.textContent.trim().replace(/[^\w]+/g, '');
    var form = mkAllegroForm(id);
    echo({id, form});
    if(form) 
      return figure.parentNode.insertBefore(form, figure);
        
    figure.innerHTML = '<a class="createlinktext" href="/Forms/'+id+'">'+id+'</a>';
    figure.title = "Form doesn't exist yet.";
  }
  
  
  var forms = dqsa('.allegro-content figure[data-trix-content-type="allegro/form"],#libcalcformPreview, .libcalcformPreview');
  for(var i=0; i<forms.length; i++) {
    insertForm(forms[i]); 
  }
  
  function changeFType(e){
    this.dataset.val = this.value;
  }
  
  var select = dqs('#libcalcftype');
  if(select) {
    changeFType.call(select, {});
    aE('#libcalcftype', 'change', changeFType);
  }
  
  aE('#libcalcform [name="ptv_Fields"]', 'change', function(e){
    var reserved = this.value.isReserved();
    if(!reserved) {
      this.removeAttribute('data-annotations');
    }
    else {
      this.dataset.annotations = reserved.length;
      fielderrors.dataset.errors = JSON.stringify(reserved);
    }
//     echo({e:e, v:this.value});
  });
  
  tap('#unsetprecision', function(e){
    this.previousElementSibling.value = '';
    
  });
  
  aE('#libcalcform', 'submit', function(e){    
    var annotations = this.querySelectorAll('[data-annotations]');
    if(annotations.length) {
      e.preventDefault();
    }
    var errors = previewForm(false);
    if(errors) e.preventDefault();
  });
  
  
  function previewForm(e) {
    var anchor = dqs('#libcalcformPreview');
    var formid = anchor.textContent.trim();

    
      
    var fields = 'Layout Fields Event Logic Precision'.split(/ /g);
    
    AllegroForms[formid] = false;
    afConfig[formid] = {};
    
    for(var field of fields) {
      var v = libcalcform['ptv_'+field].value;
      if(field == 'Fields') {
        var a = v.match(/^"(.*)"[ ,]*$/m);
        if(a) {
          v = v.replace(/^"(.*)"[ ,]*$/mg, '$1');
          libcalcform['ptv_'+field].value = v;
        }
      }
      var fv = parseFloat(v);
      afConfig[formid][field] = isNaN(fv) ? v : fv;
    }
    
    
    
//     echo(afConfig[formid]);
    var form2 = mkAllegroForm(formid);
    if(!e && !AllegroForms[formid].ERROR) return false;
    if(form2) {
      var form = anchor.previousElementSibling;
      if(form.nodeName == 'FORM' && form.id != 'libcalcform')
        form.parentNode.removeChild(form);
      
      anchor.parentNode.insertBefore(form2, anchor);
      form2.classList.add('previewed');
      setTimeout(function(){form2.classList.remove('previewed')}, 1000);
      
    }
    return AllegroForms[formid].ERROR ? true: false;
    
    
    
  }
  
  tap('#libcalcform #formpreview', previewForm);
});




var AceCustomHighlight = {
  allegroform: {

    "start" : [
      { token: 'previous_line_continuation', regex: /^[ \t]+/},
      { token: 'comment', regex: /^\s*#.*$/ },
      { token: 'empty_separator', regex: /^ *-+ *$/ },
      
      {
        token: 'field_name_variable', 
        regex: /^[a-zA-Z]\w*(?=\s*[@?<>=+%\^$~.]=)/
      },
      { 
        token: 'read_only_field_name_variable', 
        regex: /^_\w+(?=\s*[@?<>=+%\^$~.]=)/
      },
      { 
        token: ["initial_value.separator", "initial_value"], 
        regex: /(==)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["linear_scale.separator", "linear_scale"], 
        regex: /(%=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["formula.separator", "formula"], 
        regex: /(~=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["result_precision.separator", "result_precision"], 
        regex: /([.]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["increment_step.separator", "increment_step"], 
        regex: /([+]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["minimum_value.separator", "minimum_value"],
        regex: /([>]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["maximum_value.separator", "maximum_value"], 
        regex: /([<]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["field_type.separator", "field_type"], 
        regex: /([@]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      { 
        token: ["prefix.separator", "prefix"], 
        regex: /([\^]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/,
      },
      { 
        token: ["suffix.separator", "suffix"], 
        regex: /([$]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/
      },
      {
        token: ["note"],
        regex: /^((?!.*[?<=>@^]=).*)$/,
//         include: 'inline',
      },
      { 
        token: ["label.separator", "label"], 
        regex: /([?]=)(.*?)(?=[@?<>=+%\^$~.]=|$)/,
        include: 'inline',
      },
      
    ],
  "inline": [
      { token: 'line_break', regex: /\\\\|\\n/ },
      { token: 'table_cell_break', regex: /\|/ },
      { token: 'superscript', regex: /\^\{.*?\}/ },
      { token: 'superscript', regex: /\^[^=]/ },
      { token: 'subscript', regex: /_\{.*?\}/ },
      { token: 'subscript', regex: /_./ },
      { token: 'bold_italic', regex: /'''''/ },
      { token: 'bold', regex: /'''/ },
      { token: 'italic', regex: /''/ },
      { token: "label.separator", regex: /[?]=/, },
      { defaultToken: 'label' },
    ], 
  },
};




