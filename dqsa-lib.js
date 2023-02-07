 /**
  DQSA-Lib: Shortcut Vanilla JavaScript library for everyday usage
  Written by (c) Petko Yotov 2017-2022   www.pmwiki.org/Petko

  This text is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version. See licence for full details
  and lack of warranty.
*/

const echo = console.log;
const dbg = console.log;

function dqs(str)  { return document.querySelector(str); }
function dqsa(str) { return document.querySelectorAll(str); }
function adjbb(el, html) { if (el) el.insertAdjacentHTML('beforebegin', html); }
function adjbe(el, html) { if (el) el.insertAdjacentHTML('beforeend',   html); }
function adjab(el, html) { if (el) el.insertAdjacentHTML('afterbegin',  html); }
function adjae(el, html) { if (el) el.insertAdjacentHTML('afterend',    html); }
function ue(x) { return encodeURIComponent(x); }
function ga(el, attr) { return el.getAttribute(attr); }
function sa(el, attr, val) { return el.setAttribute(attr, val); }
function HSC(x) { return x.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function isHidden(el) {
  return (el.offsetParent === null);
}

Node.prototype.getStyle = function(prop) {
  const cs = window.getComputedStyle(this, null);
  return cs.getPropertyValue(prop);
}

function lastday(d) { var y = d.getFullYear(), m=d.getMonth(); return new Date(y, m+1, 0).getDate(); }

function rnd(x, n) {
  n = n || 0;
  var pwr = Math.pow(10, n);
  return Math.round(x*pwr)/pwr;
}

Number.prototype.rnd = function(n) {
  return rnd(this, n);
}

function rint(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function pf(x) {return parseFloat(x);}
function tap(el, fn) {
  aE(el, 'click', fn);
}

function aE(el, ev, fn) {
  if(typeof el == 'string') el = dqsa(el);
  if(typeof el != 'object') el = [ el ];
  if(typeof ev != 'object') ev = ev.split(/[, ]+/g);
  el = any(el);
  for(var i=0; i<el.length; i++) {
    for(var j=0; j<ev.length; j++)
      el[i].addEventListener(ev[j], fn);
  }
}

function rE(el, ev, fn) {
  if(typeof el == 'string') el = document.querySelectorAll(el);
  if(typeof el != 'object') el = [ el ];
  for(var i=0; i<el.length; i++) {
    el[i].removeEventListener(ev, fn, false);
  }
}

function any(el) {
  if(typeof el == 'string') el = dqsa(el);
  if(typeof el != 'object') el = [ el ];
  return el;
}

function minmax(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function hide(el) {
  el = any(el);
  for(var i=0; i<el.length; i++) {
    el[i].classList.add('hide');
  }
}

function show(el) {
  el = any(el);
  for(var i=0; i<el.length; i++) {
    el[i].classList.remove('hide');
  }
}

function zpad(n) {
  if (n<10) return '0'+n;
  return '' + n;
}

function normalize_fname(fname) { // prevent overwriting "image.png"
  var x = fname;
  var a = x.match(/^image\.(png|jpe?g)/i);
  if(a) {
    var d = new Date();
    var r = rint(13330, 46655).toString(36) + d.getMilliseconds().toString(36);
    x = d.getFullYear()+''+zpad(d.getMonth()+1) +''+zpad(d.getDate())
      +'_'+zpad(d.getHours()) +''+zpad(d.getMinutes())+''+zpad(d.getSeconds())
      +'_'+ r + '.' + a[1]
      ;
  }
  return x;
}

function fe4(rtype, url, opt, fn) {
  if(!rtype || !url) return;
  if(typeof opt == "function") {
    fn = opt; opt = {};
  }
  else if (opt == 'post') {
    opt = { method:'post' };
  }
  fetch(url, opt)
  .then(function(r){
    if(! r.ok) return null;
    else if(rtype == 'text') return r.text();
    else if(rtype == 'json') return r.json();
    else if(rtype == 'blob') return r.blob();
  })
  .then(fn)
  .catch(function(error){fn(null);});
}

function fe4p(rtype, url, data, fn){
  var form = new FormData;
  for(var i in data) form.append(i, data[i]);
  fe4(rtype, url, {
    method: 'post',
    body: form
    }, fn);
}

function xupload(url, obj, callback) {
  var data = new FormData;
  for(var i in obj) {
    data.append(i, obj[i]);
  }

  var xhr = new XMLHttpRequest;
  
  xhr.upload.addEventListener("progress", function(event) {
    var progress = event.loaded / event.total * 100;
    callback({ rtype: "progress", resp: progress });
  });

  xhr.addEventListener("load", function(event) {
    try {
      var resp = JSON.parse(xhr.response);
    }
    catch(e) { var resp = xhr.response; }
    callback({ rtype: "success", resp: resp });
  });
  
  xhr.addEventListener("abort", function(event) {
    callback({ rtype: "abort", resp: xhr.response });
  });
  
  xhr.addEventListener("cancel", function(event) {
    callback({ rtype: "cancel", resp: xhr.response });
  });

  xhr.open("POST", url, true);
  xhr.send(data);
}

// Jets.js
var makeFilterableCnt = 0;
function makeFilterable(el){
  if(el) var lists = [el];
  else var lists = dqsa('ul.filterable,ol.filterable,table.filterable');
  
  echo({el, lists});
  
  for(var i=0; i<lists.length; i++) {
    let list = lists[i];
    if(list.dataset.jets) continue;
    // 1-7 rows/items : no filtering
    var items = (list.tagName == 'TABLE') 
      ? list.querySelectorAll('tr')
      : list.children;
    if(items.length<8) continue;
    
    if(list.tagName == 'OL') {
      for(var j=0; j<items.length; j++) {
        if(!items[j].getAttribute('value'))
          items[j].setAttribute('value', j+1);
      }
    }
    
    makeFilterableCnt++;
    
    var placeholder = (list.tagName == 'TABLE')? "Filter table" : "Filter list";
    if(list.dataset.inputfilter) {
      var searchqs = list.dataset.inputfilter;
    }
    else {
      var searchqs = '[data-jets="input'+makeFilterableCnt+'"]'
      var input = '<input type="search" class="inputbox noprint" placeholder="'+placeholder+'" size="30" data-jets="input'+makeFilterableCnt+'"/>'
      adjbb(list, input);
    }
    list.dataset.jets = 'content'+makeFilterableCnt;
    
    var tbody = (list.tagName == 'TABLE')? " tbody": '';

    var x = new Jets({
      searchTag: searchqs,
      contentTag: '[data-jets="content'+makeFilterableCnt+'"]'+tbody
    });
//     prefixDividers(list);
  }
  if(el) return x;
}

function mediaplay(e) {
  var qs = 'audio,video';
  var x = dqsa(qs);
  for(var i=0; i<x.length; i++) {
    if(x[i] !== this && !x[i].paused) x[i].pause();
  }
}

function temporarilyChangeValue(el, tempvalue, seconds) {
  
  if(tempvalue) {
    el.style.width = el.getStyle('width');
    var oldvalue = el.value;
    el.value = tempvalue;
  }
  
  el.classList.add('highlighted');
  var delay = (seconds)? seconds*1000 : 3000;
  
  setTimeout(function(){
    if(tempvalue) el.value = oldvalue;
    el.classList.remove('highlighted');
  }, delay);
}

function temporarilyHighlight(el, delay) {
  return temporarilyChangeValue(el, null, delay);
}

function showPasswords() {
  var x = dqsa('input[type="password"]');
  if(!x.length) return;
  for(var i=0; i<x.length; i++) {
    var span = document.createElement('span');
    span.className = 'showpassword';
    span.style.cursor = 'pointer';
    span.style.marginLeft = '.3em';
    span.title = 'Show password for 10 seconds';
    span.innerHTML = '👀';
    x[i].insertAdjacentElement('afterend', span);
  }
  aE('form', 'submit', function(e){
    var eyes = this.querySelectorAll('input[type="text"]+span.showpassword');
    for(var i=0; i<eyes.length; i++) {
      eyes[i].previousElementSibling.type = 'password';
    }
  });
  tap('input[type="password"]+span.showpassword', function(e){
    let pass = this.previousElementSibling;
    pass.type = pass.type=='password'? 'text': 'password';
    var i = parseInt(pass.dataset.timeout);
    if(i) clearTimeout(i);
    if(pass.type=='text') {
      pass.dataset.timeout = setTimeout(function(){
        pass.type = 'password';
        pass.dataset.timeout = '';
      }, 10000);
    }
  });
}

document.addEventListener('DOMContentLoaded', function(e){
  showPasswords();
  aE('audio,video', 'play', mediaplay);
  makeFilterable();
  tap('a[href="#window-print"]', function(e){
    e.preventDefault();
    window.print();
  });
});


