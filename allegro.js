/**
  Allegro: Modular, visual editor for PmWiki
  Written by (c) Petko Yotov 2017-2022   www.pmwiki.org/Petko

  This text is written for PmWiki; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version. See pmwiki.php for full details
  and lack of warranty.
*/

var Allegro = {};

// This would only be used if enabled
window.MathJax = {
  options: {
    enableMenu: false 
  },
  startup: {
		typeset: false,
  }
};

function targetBlank(e) {
  var a = e.target.closest('a');
  if(a && a.host && a.host !== window.location.host) {
    sa(a, "target", "_blank");
    sa(a, "rel", "noreferrer noopener nofollow");
  }
}
// TODO; i18n for the markup
function maketables() {
  function makesimpletable(ol) {
    var out = '', out2 = '';
    var rows = ol.children;
    var el = document.createElement('span');
    
    var classnames = [];
    
    for(var r=1; r<rows.length; r++) {
      var row = rows[r].innerHTML.replace(/((\s|\n)*<br[\s\/]*>(\s|\n)*)+$/, '');
      if(row.charAt(0)=="|") row = " "+row;
      
      var colnb = 0;
      ih2 = (row+'|').replace(/([^|]+)(\|+)/g, function(a, text, border){
        var colspan = border.length>1? ' colspan="'+border.length+'"' : '';
        var tag = r==1? 'th' : 'td';
        
        var cname = '';
        el.innerHTML = text;
        if(r == 1) {
          var a = el.textContent.match(/^(\s*)(\S(?:[\s\S]*?\S)?)(\s*)$/);
          if(a) {
            if(a[1].length && a[3].length) cname = 'center';
            else if(a[1].length) cname = 'right';
            else cname = 'left';
          }
          if(cname) cname = ' class="'+cname+'"';
          for(var b=0; b<border.length; b++) {
            classnames.push(cname);
          }
        }
        else {
          cname = classnames[colnb];
          colnb += border.length;
        }
        return '    <'+tag+colspan+cname+'>'
          +el.innerHTML.replace(/^(\s|\&nbsp;)+|(\s|\&nbsp;)+$/g, '')
          +'</'+tag+'>\n';
      });
      var cnt = '';
      out2 += '  <tr>'+cnt+ih2+'  </tr>\n'
    }
    if(!out2) return;
    out2 = out2.replace(/^(\s*<tr>[\s\S]*?<\/tr>)([\s\S]*)$/, '<thead>$1</thead><tbody>$2</tbody>');
    var tclass = "simpletable";
    var a = rows[0].textContent.match(/^\s*\[(?:TAB|TABLE|TABELLE)\]\s*(.*?)$/);
    if(a) {
      var b = a[1].match(/\.([-.\w]+)/);
      if(b) tclass += ' ' + b[1].split(/\./g).join(' ');
    }
    
    if(rows.length>8) tclass += " filterable";
    if(rows.length>4 && !tclass.match(/nosort/)) tclass += " sortable";
    out = '<div class="allegrotablewrap"><table class="'+tclass+'">\n'+out2+'</table></div>\n';
    adjae(ol, out);
    var newtable = ol.nextSibling.firstChild;
    var thead = newtable.querySelector('thead')
    if(thead && thead.textContent.replace(/\s+/, '') === '') {
      thead.style.display = 'none';
    }
    if(tclass.indexOf('filterable')>0) { makeFilterable(newtable); }
    
    ol.parentNode.removeChild(ol);
  }
  
  var ul_items = dqsa('.allegro-content > ul > li:first-child, .allegro-content details > ul > li:first-child');
  for(var i=0; i<ul_items.length; i++) {
    var tc = ul_items[i].textContent
    if(tc.match(/^\s*\[TAB\]\s*(.*?)$/)) makesimpletable(ul_items[i].parentNode);
    else if(tc.match(/^\s*\[FILTER\]\s*(.*?)$/)) {
      ul_items[i].style.display = 'none';
      makeFilterable(ul_items[i].parentNode);
    }
  }
  
}

// TODO; i18n for "Close frame"
function makevideos(){
  function tapvid(e) {
    var _this = (this.tagName == 'A') ? this: this.parentNode;
    var url = _this.dataset.embedUrl;
    if(! url) return
    
    e.preventDefault();
    e.stopPropagation();
    
    var frname = _this.dataset.mapdir ? ' name="appmapframe"' : '';
    
    adjbb(_this,
      '<iframe class="ytframe" width="720" height="405" '+frname+' src="'
      +url+'" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>'
      +'<a rel="none" class="closevideo" href="#">Close frame</a>'
    );
    _this.parentNode.querySelector('.closevideo')
      .addEventListener('click', closevid);
  }
  function closevid(e){
    e.preventDefault();
    var p = this.parentNode;
    var x = p.querySelectorAll('iframe, a.add-ical, a.get-directions');
    for(var i=0; i<x.length; i++) x[i].parentNode.removeChild(x[i]);
    this.parentNode.removeChild(this);
  }
  
  
  var qs = '.allegro-content figure img[src*="/uploads/"][src*="--"][src$=".jpg"]';
  
  var x = dqsa(qs);
  for(var i=0; i<x.length; i++) {
    var a = x[i].src.match(/\/(youtube|vimeo|ted)--(.*)\.jpg$/);
    if(!a) continue;

    var url = false, prov = false;
    
    if(a[1] == 'youtube') {
      var url = 'https://www.youtube-nocookie.com/embed/'+a[2]+'?rel=0&autoplay=1';
      prov = 'YouTube';
    }
    else if(a[1] == 'vimeo') {
      var id = a[2].replace(/__.*$/g, '');
      url = "https://player.vimeo.com/video/"+id+"?title=0&byline=0&portrait=0&autoplay=1";
      prov = 'Vimeo';
    }
    else if(a[1] == 'ted') {
      var id = a[2];
      url = "https://embed.ted.com/talks/"+id+"?autoplay=1";
      prov = 'TED';
    }
    
    if(!url) continue;
    
    x[i].parentNode.dataset.embedProvider = prov;
    x[i].parentNode.dataset.embedUrl = url;
    var fig = x[i].closest('figure');
    var capt = fig.querySelector('figcaption');
    if(capt) fig.appendChild(capt);
    
  }
  tap("a[data-embed-url]", tapvid);
  
  var videolinks = dqsa('.allegro-content figure a[href*="uploads/"][href$=".mp4"]');
  for(var i=0; i<videolinks.length; i++) {
    var v = '<video controls="controls" preload="none" allowfullscreen="allowfullscreen" poster="'
      +videolinks[i].href+'.jpg"><source src="' +videolinks[i].href +'"></video>';
    var ul = videolinks[i].closest('ul');
    if(ul && ul.firstChild 
      && ul.firstChild.textContent.trim().toLowerCase() == '[video]') {
        adjbb(ul, v);
      }
    else {
      adjbb(videolinks[i], v);
      
    }
    videolinks[i].closest('figure').classList.add('allegrovideo');
  }
  
  
  // TODO; other audio formats
  var qs = '.allegro-content figure.attachment-file--mp3 a[href$=".mp3"], .allegro-content figure.attachment-file--m4a a[href$=".m4a"]';
  var x = dqsa(qs);
  for(var i=0; i<x.length; i++) {
    var ul = x[i].closest('ul');
    if(ul && ul.firstChild 
      && ul.firstChild.textContent.trim().toLowerCase() == '[video]'
      && ul.previousElementSibling && ul.previousElementSibling.nodeName == 'VIDEO') {
      var s = document.createElement('source');
      s.src = x[i].href;
      s.type = 'audio/mpeg'; // FIXME
      ul.previousElementSibling.appendChild(s);
    }
    else
      adjbb(x[i], '<audio src="'+x[i].href+'" preload="metadata" controls></audio>');
  }
  
  
  // mediaplay() is in dqsa-lib.js
  aE('.allegro-content audio, .allegro-content video', 'play', mediaplay); 
  mkmediajump();
}

function mkmediajump() {
  var medias = dqsa('video,audio');
  var mlen = medias.length;
  var par = dqs('div.allegro-content');
  if(!mlen||!par) return;
  if(!par.textContent.match(/\d:\d\d/)) return;
  
  var ncnt = 0;
  var n, walk=document.createTreeWalker(
      par,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null,
      false
  );
  var matches = [];
  var found = false;
  var mjcnt = 0;
  while (n=walk.nextNode()) {
    if(n.nodeType == 1) {
      if(n.tagName.match(/^(video|audio)$/i)) {
        n.id = 'mj' + mjcnt;
        matches.push(n);
        found = true;
        mjcnt++;
      }
      else if(found && n.tagName.match(/^h[23]$/i)) {
        if(mjcnt == mlen) break; // found all
        found = false;
      }
    }
    else if(found && n.nodeType == 3 
      && n.data.match(/\b(\d\d?:\d\d(:\d\d)?)\b/) 
      && !n.parentNode.closest('a')) {
        matches.push(n);
    }
  }

  if(!matches.length) return;
  var media_id = 0;
  var s = document.createElement('span');
  for(var i=0; i<matches.length; i++) {
    n = matches[i];
    if(n.nodeType == 1) {
      media_id = n.id;
      continue;
    }
    
    var html = n.data.replace(/\b(\d\d?:\d\d(:\d\d)?)\b/g, 
      '<a href="#" data-jump="'+media_id+'">$1</a>');
    n.parentNode.insertBefore(s, n);
    adjbb(s, html);
    s.remove();
    n.remove();
  }
  tap('a[data-jump]', function(e){
    e.preventDefault();
    var v_id = this.dataset.jump;
    var media = document.getElementById(v_id);
    if(!media) return;
    var parts = this.textContent.split(/:/).reverse();
    var sec = 0;
    for(var j=0;j<parts.length;j++) {
      sec += Math.pow(60, j)*parseInt(parts[j], 10);
    }
    media.scrollIntoView();
    media.currentTime = sec;
    media.play();
    media.dispatchEvent(new Event('play'));
  });

}


function mkinput(spec) {
  var out;
  var a = spec.match(/^([!]?)(\w+)(?:\#(\w+))?(?:@(\w+))?(?:==(.*?))?(?:\?\?(.*?))?$/);
  if(a) {
    var hide = a[1], type = a[2], id = a[3], role = a[4], value = a[5], placeholder = a[6];
  }
  var cname = (type=='button')? 'button' : 'input';
  
  value = value ? HSC(value) : '';
  placeholder = placeholder ? " placeholder='" + HSC(placeholder) + "'" : '';
  id = id ? " id='" + id + "'" : '';
  
  dth = hide? ' data-trix-method="hideDialog"' : '';
  drole = role? ' data-role="'+role+'"' : '';
  
  var b = type.match(/^area(\d+)x(\d+)$/);
  if(b) {
    
    out = "<textarea "+id+drole+" cols='"+b[1]+"' rows='"+b[2]+"' "+placeholder
    +" class='trix-input trix-input--dialog'>"+value+"</textarea>";
  }
  else {
    out = "<input "+id+dth+drole+" type='"+type+"' "+placeholder
    +"' class='trix-"+cname+" trix-"+cname+"--dialog' value='"+value+"'/>";
    
  }
  return out;
}

var DeletedFormulas = {};

document.addEventListener("trix-attachment-remove", function(e){
  var att = e.attachment.attachment.attributes.values;
  dbg({removed: att});
//   log({removed: e.attachment});
  if(att.filename && att.filename.match(/^math--\w+\.svg$/)) {
    DeletedFormulas[att.filename] = 1;
  }
  
});

function SubmitDeletedFormulas() {
  return;
  var formulas = dqsa('trix-editor figure.attachment--svg img[src*="/math--"]');
  
  var allatt = dqs('trix-editor').editor.composition.getAttachments();
  
  for(var i=0; i<allatt.length; i++) {
    var file = allatt[i].attributes.values;
    delete DeletedFormulas[file.filename];
  }

  var list = '';
  for(var f in DeletedFormulas) {
    list += " " + f;
  }
  dbg(list);
  dqs('#delattach').value = list.trim();
}

document.addEventListener("trix-file-accept", function(e){
  if(!Allegro.canupload) {
    e.preventDefault();
    showInfo(Allegro.XL.ULnopermissions);
    return;
  }
  var file = e.file;
  
  var ext = file.name.replace(/^.*\./, '');

  // message when file is unsupported or too large
  if(Allegro.UploadExts.indexOf(ext)<0) {
    e.preventDefault();
    showInfo(Allegro.XL.ULbadtype.replace(/\$upext/g, ext));
    return;
  }
    
    
   if(file.size > Allegro.UploadMaxSize) {
    e.preventDefault();
    showInfo(Allegro.XL.ULtoobig);
    return;
  }
  
  
});

document.addEventListener("trix-attachment-add", function(e){  
  function uploadFileAttachment(attachment) {
    
    var data = {
      action: 'aupload',
      n: Allegro.FullName,
      "Content-Type": attachment.file.type,
      uploadfile: attachment.file,
      upname: normalize_fname(attachment.file.name),
      author: Allegro.Author
    };
    xupload(Allegro.PageUrl + "?action=aupload", data, ucallback);
  }
  
  function ucallback(x) {
    if(x.rtype == 'progress') {
      e.attachment.setUploadProgress(x.resp);
    }
    else if(x.rtype == 'success') {
      
      var wikiresp = x.resp;
      if(wikiresp.result == 'success') {
        if(wikiresp.attr.filename.match(/^math--\w+\.svg$/)) {
          wikiresp.attr.href = '#';
          if(e.attachment.file.input) {
            wikiresp.attr.input = e.attachment.file.input;
          }
        }
        e.attachment.setAttributes(wikiresp.attr);
      }
      else dbg(x);
    }
  }
  
  
  if (e.attachment.file) {
    dbg(e.attachment.file);
    return uploadFileAttachment(e.attachment);
  }
  var url = e.attachment.attachment.attributes.values.url;
  if(url && url.indexOf(location.origin) !== 0) {
    e.attachment.remove();
  }
  


});

document.addEventListener('trix-before-paste', function (e) {
  if (e.paste.hasOwnProperty('html')){
    var html = e.paste.html;
    html = html.replace(/<table.*?>/isg, '<ul><li>[TAB]</li>')
      .replace(/<tr.*?>/gis, '<li>')
      .replace(/<\/tr.*?>/gis, '  </li>')
      .replace(/<\/table.*?>/gis, '</ul>')
      .replace(/<\/(th|td)\s*>\s*<(th|td)\b.*?>/gis, ' | ')
      .replace(/<\/?(thead|tbody|tfoot|td|th)\b.*?>/gis, '')
      .replace(/<\/?(font)\b.*?>/gis, '')
      .replace(/<p>\s*<\/p>/gis, '<br>')
      .replace(/<a\s+?.*?href=(['"])https?:\/\/www\.google\.com\/search\?(.*?sengpielaudio.*?)\1.*?>(.*?)<\/a>/g, function(a, b, q, t){
        t = t.replace(/<\/?\w+.*?>/gs, '');
        return "<allegro-tag>"+t+"</allegro-tag>";
      })
      .replace(/(●)/g, '')
      .replace(/<ul><li>\[TAB\]<\/li>\s*<li>(.*?)<\/li>\s*<\/ul>/gis, function(a, a1){
        if(a1.match(/<li.*?>/is)) return a;
        return a1;
      })
      .replace(/<(br|li)[\s\/]*>(\s|\&nbsp;)*/gi, '<$1>')
      .replace(/<\/li>\s+<li>/gi, '</li><li>')
      ;
    
    dbg(html);
    
//     html = html.replace(//)
    
    e.paste.html = html;
  }
});

document.addEventListener('trix-paste', function(e){
});



document.addEventListener('trix-before-initialize', function(){
  
  var vars = dqs('#allegrovars');
  try {
    Allegro = JSON.parse(vars.value);
    Allegro.Form = vars.form;
  }
  catch(e) {
    console.error("Could not parse Allegro variables, exiting.");
    return;
  }
  
  if(Trix.Attachment)
    Trix.Attachment.previewablePattern = /^image(\/(gif|png|jpe?g|webp|svg\+xml)|$)/;
  else if(Trix.models && Trix.models.Attachment)
    Trix.models.Attachment.previewablePattern = /^image(\/(gif|png|jpe?g|webp|svg\+xml)|$)/;
  
  Trix.config.blockAttributes.quote.nestable = false;
  
  Trix.config.blockAttributes.code.terminal = true;
  Trix.config.blockAttributes.code.text.plaintext = false;
  Trix.config.blockAttributes.code.breakOnReturn = true;
  Trix.config.blockAttributes.code.breakOnReturn = true;
  
  Trix.config.blockAttributes.default.breakOnReturn = true;
  Trix.config.textAttributes.frozen.style.backgroundColor = "inherit";
  
  Trix.config.blockAttributes.aside = {
    tagName: 'aside',
    terminal: false,
    inheritable: true,
    breakOnReturn: false,
    nestable: false,
//     exclusive: true,
    group: true
  };
  
  
  
  if(Allegro.isForum) { // TODO: forum
    Trix.config.blockAttributes.heading1.tagName = "strong";
  }
  else {
    Trix.config.blockAttributes.heading1.tagName = "h2";
    Trix.config.blockAttributes.heading2 = {
      tagName: 'h3',
      terminal: true,
      breakOnReturn: true,
      group: false
    };
  }
  
  Trix.config.textAttributes.sup = {
    text: { plaintext: true },
    terminal: true,
    breakOnReturn: true,
    inheritable: true,
//     inheritable: false
    tagName: 'sup'
  }
  
  Trix.config.textAttributes.sub = {
    text: { plaintext: true },
    terminal: true,
    breakOnReturn: true,
    inheritable: true,
//     inheritable: false
    tagName: 'sub'
  }
  
  
  Trix.config.textAttributes.tag = {
    tagName: 'allegro-tag',
    text: { plaintext: true },
    terminal: true,
    breakOnReturn: true,
    inheritable: true
  }
  



  
  
  for(var i in Trix.config.textAttributes) {
    Trix.config.textAttributes[i].breakOnReturn = true;
    
  }
  
  
  Trix.config.fileSize.precision = 0;

});

function showInfo(message) {
  var dialog = dqs('[data-trix-dialog="x-info"]');
  dialog.querySelector('.trix-dialog-title').textContent = message;
  dialog.dataset.trixActive = 1;
}


document.addEventListener('trix-initialize', function(){
  
  dbg('trix-initialize');
  
  
  aE([Allegro.Form], 'submit', function(e) {
//     SubmitDeletedFormulas(e);
    Allegro.NsMessage = '';
  });
  
  var hidden = Allegro.Form.querySelectorAll('input[type="text"],input[type="hidden"]');
  for(var i=0; i<hidden.length; i++) {
    hidden[i].initialValue = hidden[i].value;
  }
  
  window.onbeforeunload = function(ev) {
    if(Allegro.NsMessage=="") {return;}
    if (typeof ev == "undefined") {ev = window.event;}

    var tx = Allegro.Form.querySelectorAll('input[type="text"],input[type="hidden"]');
    var changed = 0;
    for(var i=0; i<tx.length; i++) {
      var el = tx[i];
      if(typeof el.initialValue == 'undefined' // fields added later
        || el.name == 'csum'
        || el.value === el.initialValue) continue;
      changed++;
    }
    
    if(changed) {
      if(ev) {ev.returnValue = Allegro.NsMessage;}
      return Allegro.NsMessage;
    }
  }
  
  
  var trix = dqs('trix-editor');
  var editor = trix.editor;
  var composition = trix.editor.composition;
  window.editor = trix.editor;
  
  
  var textbuttons = dqs('.trix-button-group--text-tools');
  var blockbuttons = dqs('.trix-button-group--block-tools');
  var filebuttons = dqs('.trix-button-group--file-tools');
  var dialogs = dqs('.trix-dialogs');
  
  
  
  aE('trix-editor', 'dblclick', function(e){
    var range = editor.getSelectedRange();
    var curratt = editor.composition.getAttachmentAtRange(range);
    if(curratt) {
      att = curratt.attributes.values;
      dbg(att);
      if(att.input) {
        var dialog = dqs('[data-trix-dialog="math"]');
        var input = dialog.querySelector('textarea');
        input.dataset.range = range.join(',');
        var preview = dialog.querySelector('.mathPreview');
        input.value = att.input;
        previewMath('input', input, preview);
        dialog.dataset.trixActive = 1;
      }
      else if(att.filename && att.filename.match(/\.mp4(\.jpg(\\?r=\\d+)?)?$/)) {
        var src = att.href.replace(/\.jpg(\?r=\d+)?$/g, '');
        
        dqs('.trix-dialog--videocover').dataset.trixActive = 1;
        var html = '<video src="' + src + '" controls></video>';
        dqs('.trix-dialog--videocover div.allegro-preview').innerHTML = html;
      }
      else if(att.contentType == 'allegro/ref') {
        var dialog = dqs('[data-trix-dialog="ref"]');
        var input = dialog.querySelector('textarea');
        input.value = att.text;
        var bib_radio = dialog.querySelector('[name="bib_radio"][value="'+att.bibId+'"]');
        if(bib_radio) bib_radio.checked = 1;
      
        dialog.dataset.trixActive = 1;
        
      }
    }
    
  });
  
  
  filebuttons.parentNode.insertBefore(filebuttons, blockbuttons);
  
  function mkbtn(obj) {
    var tagname = obj.tag? obj.tag : 'button';
    var el = document.createElement(tagname);
    el.type = 'button';
    el.tabindex = -1;
    el.className = 'trix-button';
    if(obj.cname) el.className += ' trix-button-' + obj.cname;
    if(obj.attr) el.dataset.trixAttribute = obj.attr;
    if(obj.id) el.id = obj.id;
    if(obj.action) el.dataset.trixAction = obj.action;
    if(obj.title) el.title = obj.title;
    if(obj.method) el.dataset.trixMethod = obj.method;
    if(obj.value) el.value = obj.value;
    if(obj.text) el.innerHTML = ' '+ styleLaTeX(HSC(obj.text)) + ' ';
    if(obj.html) el.innerHTML = ' '+ styleLaTeX(obj.html) + ' ';
    if(obj.appendto) {
      if(!obj.prepend) obj.appendto.appendChild(el);
      else obj.appendto.insertBefore(el, obj.appendto.firstChild);
    }
    return el;
  }
  function mkdialog(obj) {
    var el = document.createElement('div');
    if(obj.id) el.id = obj.id;
    el.className = 'trix-dialog';
    if(obj.cname) el.className += ' trix-dialog-' + obj.cname;
    if(obj.attr) {
      el.dataset.trixDialog = obj.attr;
    }
    var title = obj.title? obj.title : obj.menu ? obj.menu : false;
    
    if(title) el.innerHTML += '<div class="trix-dialog-title">'+title+'</div>';
    if(obj.html) el.innerHTML += '<div class="trix-dialog-content">'+ obj.html + '</div>';
    dialogs.appendChild(el);
    
    if(obj.menu) {
      embedbtn({ cname: obj.cname, action: obj.attr, text: obj.menu });
    }
    
    if(obj.fn) {
      aE(el.querySelectorAll('input, textarea'), 'input', obj.fn);
      aE(el.querySelectorAll('input, textarea'), 'paste', function(e){
        setTimeout(obj.fn(e).bind(this), 50);
      });
      aE(el.querySelectorAll('input[type="button"]'), 'click', fn);
    }
    
  }
  
  function mkdiv(cname, html) {
    var x = document.createElement('div');
    x.className = cname;
    if(html) x.innerHTML = html;
    return x;
  }
  
  function styleLaTeX(str) {
    return str.replace(/LaTeX/g, 
      '<span class="LaTeX">L<span class="A">a</span>T<span class="E">e</span>X</span>');
  }
  
  function mknewdialog(attr, label, title, input, buttons, fn, note, preview) {
    
    if(label)
      embedbtn({ cname: attr, action: attr, text: label });
    
    var dialog = mkdiv('trix-dialog trix-dialog--'+attr);
    dialog.dataset.trixDialog = attr;
    dialogs.appendChild(dialog);
    
    if(label && !title) title = label;
    var x = mkdiv("trix-dialog-title", styleLaTeX(title));
    dialog.appendChild(x);
    
    var content = mkdiv("trix-dialog-content");
    dialog.appendChild(content);
    
    var controls = mkdiv("trix-dialog__link-fields");
    content.appendChild(controls);
    
    if(note) {
      content.appendChild(mkdiv(attr+"Note", note));
    }
    if(preview) {
      preview = mkdiv(attr+'Preview allegro-preview');
      content.appendChild(preview);
    }
    
    if(input) {
      var a = input.match(/^([a-z]+):(.*)$/);
      if(a) var etype = a[1], placeholder = a[2];
      else var etype = 'text', placeholder = input;
        
      if(etype == 'area') {
        input = document.createElement('textarea');
        input.cols = 40;
        input.rows = 2;
      }
      else {
        input = document.createElement('input');
        input.type = etype;
      }
      input.placeholder = placeholder;
      input.className = 'trix-input trix-input--dialog';
      controls.appendChild(input);
      
      if(fn) {
        input.addEventListener('input', function(e){
          if(input.value.trim() === '') {
            if(preview) preview.innerHTML = '';
          }
          else fn('input', input, preview);
        });
        input.addEventListener('paste', function(e){
          setTimeout(function(){
            fn('paste', input, preview);
          }, 50);
        });
      }
    }
    
    
    var controls2 =  mkdiv("trix-button-group");
    controls.appendChild(controls2);
    
    
    for(var i=0; i<buttons.length; i++) {
      a = buttons[i].match(/^(!?)([a-z]+):(.*)$/);
      var hide = a[1];
      var role = a[2];
      var value = a[3];
      var b = document.createElement('input');
      b.type = 'button';
      b.value = value;
      b.dataset.role = role;
      if(hide || role.match(/^(embed|cancel|close)$/)) 
        b.dataset.trixMethod = "hideDialog";
      b.className = 'trix-button trix-button--dialog';
      controls2.appendChild(b);
      
      b.addEventListener('click', function(e){
        var role = this.dataset.role, value = input? input.value : null;
        
        if(!value && role.match(/^(preview|embed)$/) && attr!='ref') {
          e.preventDefault();
          e.stopPropagation();
          if(preview) preview.innerHTML = '';
          return;
        }
      
        if(role.match(/^(cancel|clear)$/)) {
          if(input) input.value = '';
          if(preview) preview.innerHTML = '';
        }
        else if (fn)
          fn(role, input, preview);
        
        if(role=='embed') {
          if(input) input.value = '';
          if(preview) preview.innerHTML = '';          
        }
      });
    }
    
  }
  
//   mknewdialog(attr, label,    title,     input, buttons, fn, note, preview);
  mknewdialog('x-info', false, 'message', false, ['close:Close']);


  
  function embedbtn(obj) {
    var el = mkbtn(obj);
    dqs('#allegroembedmenu .trix-dialog-content').appendChild(el);
  }
  
  mkdialog({
    id: 'allegroembedmenu', cname: 'embed', attr: 'x-embed', 
    title: '<b>Embed in page:</b>', html: ' ' 
  });
  
  var videorx = [
    [/^https?:\/\/youtu\.be\/([^&?]+)([&?].*)?$/i, 'youtube--$1.jpg', 'https://youtu.be/$1', 'https://www.youtube.com/oembed?url='],
    [/^https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)(\&.*)?$/i, 'youtube--$1.jpg', 'https://youtu.be/$1', 'https://www.youtube.com/oembed?url='],
    [/^https?:\/\/www\.youtube(-nocookie)?\.com\/embed\/([^&?\/]*)$/i, 'youtube--$2.jpg', 'https://youtu.be/$1', 'https://www.youtube.com/oembed?url='],
    [/^https?:\/\/vimeo\.com\/(\d+)\/([a-f0-9]+)$/i, 'vimeo--$1__$2.jpg', 'https://vimeo.com/$1/$2', 'https://vimeo.com/api/oembed.json?url='],
    [/^https?:\/\/vimeo\.com\/(\d+)$/i, 'vimeo--$1.jpg', 'https://vimeo.com/$1', 'https://vimeo.com/api/oembed.json?url='],
    [/^https?:\/\/www\.ted\.com\/talks\/([a-z0-9_-]+).*$/i, 'ted--$1.jpg', 'https://www.ted.com/talks/$1', 'https://www.ted.com/services/v1/oembed.json?url=']
  ];
  
  function vidnew(url) {
    
    for(var i=0; i<videorx.length; i++) {
      var search = videorx[i][0];
      
      if(! url.match(search)) {
        continue;
      }
      
      var replace = videorx[i][1];
      var clean = videorx[i][2];
      var oembed = videorx[i][3];
      picname = url.replace(search, replace);
      cleanurl = url.replace(search, clean);
      
      
      var attachment = {
        contentType: "image/jpeg",
        filename: picname,
        href: cleanurl,
        url: Allegro.UploadUrl + picname,
        width: 480
      }
      if(oembed) attachment.oembed = oembed + cleanurl;
                          
      return attachment;
    }
    return false;
  }
  
  function previewVideo(role, input, preview) {
    if(role=='input') return;
    a=1;
    
    var url = input.value;
    var attachment = vidnew(url);
    
    if(!attachment) {
      // TODO: unrecognized url, suggest simple link
      preview.innerHTML = '';
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    fe4('json', attachment.oembed, function(j){
      if(!j) return;
      var picurl = j.thumbnail_url;
      var title = j.title;
      if(role=='embed') {
        attachment.caption = title;
        delete attachment.oembed;
        focusInsertAttach(attachment);
      }
      else { //paste, preview
        preview.innerHTML = '<img src="'+picurl+'"><br>' + HSC(title);
      }
    });
  }
  function focusInsertAttach(obj) {
    trix.focus();
    var att = new Trix.Attachment(obj);
    
    editor.recordUndoEntry("Insert attachment");
    editor.composition.insertAttachment(att);
    if(obj.caption) editor.composition.updateAttributesForAttachment({caption: obj.caption}, att);
  }
  
  function closedialogs(){
    setTimeout(function(){
      var dta = dqsa('trix-toolbar [data-trix-active]');
      for(var i=0; i<dta.length; i++) {
        dta[i].removeAttribute('data-trix-active');
        dta[i].classList.remove('trix-active');
      }
    }, 50);
    editor.selectionManager.unlock();
  }
  
  function previewMath(role, input, preview) {
    if(role=='paste') return; // already in "input"
    var text = input.value;
    
    var options = MathJax.getMetricsFor(preview, true);
    var html = MathJax.tex2svg(text, options);
    var svg = html.firstChild;
    svg.dataset.input = text;
    
    if(role=="input") {
      preview.innerHTML = '';
      preview.appendChild(svg);
    }
    else { // embed
      
      var data = {
        n: Allegro.FullName,
        action: 'amath',
        svg: svg.outerHTML
      };
      
      var url = Allegro.PageUrl + "?action=amath";
      
      fe4p('json', url, data, function(x){
        if(x.url) {
          var att = { 
            content: '<img src="'+x.url+'" />',
            contentType: 'allegro/math',
            filename: x.upname,
            input: text
          };
          if(input.dataset.range) {
            editor.setSelectedRange(input.dataset.range.split(/,/).map(parseFloat));
            editor.deleteInDirection("forward");
          }
          var attachment = new Trix.Attachment(att);
          editor.insertAttachment(attachment);
          input.dataset.range = '';
        }
      });
    }
  }
  
  function previewForm(role, input, preview) {
    dbg({role, input, preview});
    var key = input.value;
    if(AllegroForms[key]) {
      var form = mkAllegroForm(key);
      preview.appendChild(form);
    }
    else {
      preview.innerHTML = "<span style='color: red;'>Under construction.</span>";
//       preview.innerHTML = "<span style='color: red;'>No such form, yet. A placeholder can be inserted now, and the form can be created later.</span>";
    }
  }
  
  function embedForm(role, input, preview) {
    if(role=="preview") return previewForm(role, input, preview);
    if(role!="embed") return;
    var id = input.value.trim()
    var attachment = new Trix.Attachment({ content: id, contentType: 'allegro/form' });
    editor.insertAttachment(attachment);
  }
  
  function setVideoCover(role, input, preview) {
    var video = preview.querySelector('video');
    if(!video) return;
    
    var allatt = dqs('trix-editor').editor.composition.getAttachments();
    var attachment = false;
    for(var i=0; i<allatt.length; i++) {
      var cfile = allatt[i].attributes.values;
      if(cfile.href == video.currentSrc) {
        attachment = allatt[i];
        break;
      }
    }    
    
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var w = video.videoWidth, h = video.videoHeight;
    var cw = Math.min(640, w);
    var ch = cw*h/w;
    
    canvas.width = cw;
    canvas.height = ch;
    context.fillRect(0, 0, cw, ch);
    context.drawImage(video, 0, 0, w, h, 0, 0, cw, ch);
    var fname = video.currentSrc.replace(/^.*\//, '')+'.jpg';
    
    var covertype = 'image/jpeg';
    
    canvas.toBlob(function(blob) {
      
      var file = new File([blob], fname, { type: covertype });
      
      var data = {
        action: 'aupload',
        n: Allegro.FullName,
        "Content-Type": covertype,
        uploadfile: file,
        upname: fname,
        author: Allegro.Author
      };
      xupload(Allegro.PageUrl + "?action=aupload", data, function(x){
        if(x.rtype == 'success') {
          var wikiresp = x.resp;
          var nurl = cfile.url.replace(/\?r=.*$/, '') + '?r=' + rint(100000, 999999);
          var range = editor.getDocument().getRangeOfAttachment(attachment);
          var caption = attachment.previewDelegate.attachmentPiece.attributes.values.caption;
          cfile.url = nurl;
          cfile.width = cw;
          cfile.height = ch;
          if(cfile.caption == cfile.filename) delete cfile.caption;
          
          editor.recordUndoEntry("Update video cover");
          editor.setSelectedRange(range);
          editor.deleteInDirection("forward");
          var att = new Trix.Attachment(cfile);
          editor.composition.insertAttachment(att);
          
          if(caption) editor.composition.updateAttributesForAttachment({caption: caption}, att);
          
        }
      });
    }, covertype, .9);
  }
  
  
  
  function linkToPage(e){
    e.preventDefault();
    var sel = editor.getSelectedRange();
    var pathname = this.pathname
    if(sel[0] == sel[1]) {
      var tc = this.textContent;
      
      editor.insertHTML('<a href="'+this.pathname+'">'+this.innerHTML+'</a>');
      var newrange = sel[0]+tc.length;
      setTimeout(function() { editor.setSelectedRange(newrange);}, 50);
    }
    else {
      editor.activateAttribute("href", pathname);
    }
    
    dqs('#linktopage').open = false;
    closedialogs();
    trix.focus();
  }
  
  function reorderSubpages(e) {
    var ul = e.item.parentNode;
    var items = ul.children;
    var pn = [];
    for(var i=0; i<items.length; i++) {
      pn.push(items[i].querySelector('a').pathname.replace(/^.*\//, ''));
    }
    var x = pn.join(' ');
    dqs('#sporder').value = x;
    
  }
  
  
  function simplebtn(where, attr, title, html, prepend) {
    var obj = {cname: attr, attr: attr, title: title, html: html, appendto: where, prepend:prepend};
    var el = mkbtn(obj);
    return el;
  }
  
  function augmentLinkDialog() {
    var d = dqs('.trix-dialog--link');
    var b = dqs('.trix-dialog--link input[value="Link"]');
    b.value = 'URL';
    b.id = 'linkurlbtn';
    var urlinput = dqs('.trix-dialog--link input[type="url"]');
    urlinput.id = 'urlinput';
    
    var attr = {
      tag: 'input',
      cname: '-dialog',
      value: 'Email',
      title: 'Create email link',
      id: 'linkemailbtn',
      method: "setAttribute"
    }
    var b1 = mkbtn(attr);
    b1.dataset.prefix = "mailto:";
    b.parentNode.insertBefore(b1, b.nextElementSibling);
    
    attr.id = 'linktagbtn';
    attr.value = 'Tag';
    attr.title = 'Create tag link (label, category)';
    var b2 = mkbtn(attr);
    b2.dataset.prefix = "Tag:";
    b.parentNode.insertBefore(b2, b1.nextElementSibling);
    
    
    
    aE('.trix-dialog--link input[data-prefix]', 'mousedown', function(e){
      var prefix = this.dataset.prefix;
      var selection = this.dataset.selection;
      var url = dqs('#urlinput');
      var val = url.value;
      if(!val && selection) val = selection;
      if(val.substring(0, prefix.length) == prefix) return;
      url.value = prefix + val;
    });
    aE('#linkurlbtn', 'mousedown', function(e){
      var url = dqs('#urlinput');
      if(url.value.charAt(0)=='/') {
        url.value = window.location.origin + url.value;
      }
    });
    
    const observer = new MutationObserver(prefillURL);
    observer.observe(d, { attributes: true });
  }
  function prefillURL(){
    var d = dqs('.trix-dialog--link');      
    if(! d.classList.contains('trix-active')) {
      return; // closed dialog
    }
    var range = editor.getSelectedRange();
    var str = editor.getDocument().getStringAtRange(range);
    var url = dqs('#urlinput');
    var linktagbtn = dqs('#linktagbtn');
    var a = str.match(/^\s*(\w[-\w.+]*@[-\w.]+\w|https?:\/\/\S+)/);
    if(a) {
      url.value = a[1];
      linktagbtn.dataset.selection = "";
    }
    else {
      linktagbtn.dataset.selection = str.trim();
    }
    url.value = url.value.replace(/^(mailto|Tag):/, '');
    if(url.value.indexOf(window.location.origin)==0) {
      url.value = url.value.substring(window.location.origin.length);
    }
  }
  
  augmentLinkDialog();
  // Potentially these can be taken from the i18n values
  simplebtn(textbuttons, 'sub', 'Subscript', 'x<sub>2</sub><sup></sup>');
  simplebtn(textbuttons, 'sup', 'Superscript', 'x<sup>2</sup><sub></sub>');
  
  
  if(!Allegro.isForum) {
    // block tools: reverse order
    simplebtn(blockbuttons, 'aside', 'Comment', '<span>[c]</span>', 1);
    simplebtn(blockbuttons, 'quote', 'Frame', '🔲', 1);
    simplebtn(blockbuttons, 'heading2', 'Heading 2', 'H2', 1);
    simplebtn(blockbuttons, 'heading1', 'Heading 1', 'H1', 1);
  }
  
//   var el = 
  simplebtn(filebuttons, 'x-embed', 'Embed calculators, formulas, videos', '&nbsp;➕&nbsp;');
  if(!Allegro.canupload) dqs('.trix-button[data-trix-action="attachFiles"]').style.display = 'none';
  
  
  mknewdialog('v2', 'Video from YouTube or Vimeo', 
              'Embed video from YouTube or Vimeo', 'url:Enter a video URL...', 
              ['preview:Preview', 'embed:Embed', 'cancel:Cancel'], 
              previewVideo, "Only public videos can be embedded.", true);
  
  mknewdialog('math', 'LaTeX formula', 'Embed LaTeX formula', 'area:Type LaTeX formula here', 
              ['embed:Embed', 'cancel:Cancel'], 
              previewMath, '', true);
  
  var area = dqs('.trix-dialog--math textarea');
  area.setAttribute('autocomplete', 'off');
  area.setAttribute('autocorrect', 'off');
  area.setAttribute('autocapitalize', 'off');
  area.setAttribute('spellcheck', 'false');
  
  mknewdialog('forms', 'Calculator form', 
              'Embed calculator form (see documentation)', 'Form name', 
              ['preview:Preview', 'embed:Embed', 'cancel:Cancel'], // 
              embedForm, 'A placeholder will be inserted now; the form will appear after the page is saved.', true);

  
  function embedRef(role, input, preview) {
    if(role=="preview") {};
    if(role!="embed") return;
                          
    var id = '', content = [];

    var selected = dqs('input[name="bib_radio"]:checked');
    if(selected.value) {
      id = selected.value;
      content.push(selected.nextElementSibling.innerHTML.trim());
    }
    var iv = input.value.trim();
    if(iv) content.push(HSC(iv));
                          
    if(!content.length) return;

    content = content.join(', ');
    
    content = '<div>'+content+'</div>';
    var attachment = new Trix.Attachment({ content: content, bibId:id, text:iv, contentType: 'allegro/ref' });
    editor.insertAttachment(attachment);
  }
  
//  //   attr, label, title, input, buttons, fn, note, preview
//   mknewdialog('ref', 'Footnote or bibliographic reference', 
//               'Insert a footnote or a bibliographic reference:', 'area:Type footnote or additon to the selected reference (optional)', 
//               ['embed:Embed', 'cancel:Cancel'], //'preview:Preview', 
//               embedRef, "Note: You need to first <a href='/Bibliography' target='_blank'>create a bibliographic entry</a> before it appears in the list above.", false);
//   
//   var refc = dqs('.trix-dialog--ref .trix-dialog-content');
//   var reflist = dqs('div.allegroedit ul.bibliolist');
//   if(refc && reflist) {
//     refc.parentNode.insertBefore(reflist, refc);
//   }
  
  
  
  mknewdialog('videocover', false, 
              'Pause the video on the frame to be used as cover, then press "Set cover"', 'hidden:', 
              ['!setcover:Video frame cover',  'cancel:Cancel'], 
              setVideoCover, '', true); // '!uploadcover:Attach new cover',
  
  var formKeys = Allegro.Forms? Allegro.Forms.split(/,/g).sort() : [];
  var dl = "<datalist id='formKeys'>"
  for(var i=0; i<formKeys.length; i++) {
    dl += '<option value="'+formKeys[i]+'">';
  }
  dl += '</datalist>';
  var forminput = dqs('.trix-dialog--forms input[type="text"]');
  adjae(forminput, dl);
  sa(forminput, 'list', 'formKeys');
  
  function locallinks() {
    var p = dqs('.trix-dialog--link'), ltp = dqs('#linktopage');
    if(p && ltp) {
      clearInterval(ltpInterval);
      p.appendChild(ltp);
      tap('#linktopage a', linkToPage);
    }
  }
  var ltpInterval = setInterval(locallinks, 200);
  
  tap('#allegroeditform nav.allegro-subpages a', function(e){
    e.preventDefault();
  });
  var spages = dqsa('#allegroeditform nav.allegro-subpages > ul > li');
  if(spages.length>1) {
    new Sortable(spages[0].parentNode, {
      animation: 150,
      onEnd: reorderSubpages
    });
    spages[0].closest('nav').style.display = 'block';
  }
  
  trix.addEventListener('keydown', AllegroKeyDown);
  
  function AllegroKeyDown(e) {    
    if(/^( |Enter|[^-\p{L}])$/u.test(e.key))
      editor.deactivateAttribute('tag');
      editor.deactivateAttribute('sup');
      editor.deactivateAttribute('sub');
  }
  
  aE('#allegrotemplate', 'change', function(e) {
    var item = this.options[this.selectedIndex];
    var content = item.dataset.value;
    if(content) {
      editor.recordUndoEntry("Insert template");
      var length = editor.getDocument().toString().length;
      editor.setSelectedRange([0, length]);
      editor.insertHTML(content);
      
    }
    this.selectedIndex = 0;
    
  });
  

  
}); // 'trix-initialize'

function makereferences() { // DEPRECATED
  var refs = dqsa('.allegro-content figure[data-trix-content-type="allegro/ref"]');
  if(!refs.length) return;
  
  var footnotes = [];
  
  for(var i=0; i<refs.length; i++) {
    var j=i+1;
    var ref = refs[i];
    var content = ref.firstChild.innerHTML;
    var tooltip = ref.firstChild.textContent.trim().replace(/\s+/g, ' ');
    
    if(!ref.firstChild.innerHTML) {
      echo({nochild:ref});
    }
    
    adjbb(ref, '<div class="allegro-ref-wrap">'
      +'<a class="allegro-ref" id="aref-'+j+'" href="#fn-'+j+'" >['+j+']</a>'
      +'<div class="allegro-ref-content">'+content+'</div></div>');
    ref.previousElementSibling.appendChild(ref);
    
    footnotes.push('<li id="fn-'+j+'"><a class="backlink" href="#aref-'+j+'">↑</a> '+content+'</li>');
  }
  if(footnotes.length) {
    var list = '<ol class="footnotes">'+ footnotes.join('') + '</ol>'
    var trail = dqs('.allegro-content .allegrotrail');
    if(trail) adjbb(trail, list);
    else adjbe(dqs('.allegro-content'), list);
  }
}

var ReferenceCount = 0;
var ReferenceList = {};
function makesectionreferences(ul) {
  var cnt = ul.children.length;
  var ol = "<ol class='allegro-reflist filterable'>";
  for(var i=1; i<cnt; i++) {
    ReferenceCount++;
    var item = ul.children[i];
    var tc = item.textContent.trim();
    var ih = item.innerHTML;
    var a = tc.match(/^\[[- \w\p{Letter}]+\]/u);
    var key = '';
    if(a) {
      ih = ih.replace(a[0], '');
      key = a[0];
    }
    else {
      a = tc.match(/^[-\w\p{Letter}]+/u);
      key = '['+a[0]+']';
    }
    if(key) ReferenceList[key] = ReferenceCount;
    
    ol += "<li value='"+ReferenceCount+"' id='cite-note-"+ReferenceCount+"'>"
      + '<span class="ref-backlinks"></span> '
      + ih
      +"</li>";
  }
  ol+= '</ol>'
  adjbb(ul, ol);
  makeFilterable(ul.previousSibling);
}
function makepagereferences() {
  var firstchildren = dqsa('.allegro-content > ul > li:first-child');
  for(var i=0; i<firstchildren.length; i++) {
    if(firstchildren[i].textContent.trim().match(/^\[REF(LISTE?)?\]/))
       makesectionreferences(firstchildren[i].parentNode);
  }
  var sups = dqsa('.allegro-content sup');
  for(var i=0; i<sups.length; i++) {
    var j = i+1;
    var item = sups[i];
    var tc = item.textContent.trim();
    var a = tc.match(/^\[[- \w\p{Letter}]+\]/u);
    if(!a) continue;
    if(!ReferenceList.hasOwnProperty(a[0])) continue;
    
    var ih = item.innerHTML;
    var rid = ReferenceList[a[0]];
    item.innerHTML = ih.replace(a[0], 
      '<a id="ref-note-'+j+'" class="allegro-footnote" href="#cite-note-'+rid+'">['+rid+']</a>');
    
    adjae(item, '<div class="allegro-ref-wrap"><div class="allegro-ref-content"></div></div>');
    var div = item.nextElementSibling;
    var divcontent = div.lastChild;
    div.insertBefore(item, divcontent);
    var refitem = dqs('#cite-note-'+rid);
    divcontent.innerHTML = refitem.innerHTML.replace(/^<span [^>]*ref-backlinks.*?<\/span>\s*/, '');
    
    var backspan = dqs('#cite-note-'+rid+' .ref-backlinks');
    adjbe(backspan, '<a href="#ref-note-'+j+'">^</a>');
    
  }
  var backspans = dqsa('.ref-backlinks');
  for(var i=0; i<backspans.length; i++) {
    var bs = backspans[i];
    var lx = bs.querySelectorAll('a');
    if(lx.length<2) continue;
    var out = [];
    
    for(var j=0; j<lx.length; j++) {
      lx[j].textContent = (j+10).toString(36);
      out.push(lx[j].outerHTML);
    }
    
    out = "^ <sup>" +out.join(', ')+ "</sup>";
    bs.innerHTML = out;
  }
}


function refhover(e) {
  var rect = this.getBoundingClientRect();
  var div = this.querySelector('div.allegro-ref-content');
  var tip = div.getBoundingClientRect();
  var doc = document.body.getBoundingClientRect();
  
  var bw = doc.width, al = rect.left, ah = rect.height, at = rect.top, dh = tip.height, dw = tip.width;
    
  if(at > dh) div.style.top = (-dh) + 'px';
  else  div.style.top = (ah) + 'px';
  
  if(al+dw+5>bw) {
    div.style.left = (bw-al-dw-5) + 'px';
  }
  else  div.style.left = '0px';
  
  var a = this.querySelector('a.allegro-ref, a.allegro-footnote');
  if(!a) return;
  var fnid = ga(a, 'href');
  var fn = dqs(fnid);
  if(fn) fn.classList.add('target');
}


function refout(e) {
  var a = this.querySelector('a.allegro-ref, a.allegro-footnote');
  if(!a) return;
  var fnid = ga(a, 'href');
  var fn = dqs(fnid);
  if(fn) fn.classList.remove('target');
}

function dictindexFilterable(list, i) {
  var placeholder = 'Filter list';
  list.dataset.jets = "dict"+i;
  
  var searchqs = '[data-jets="inputdict'+i+'"]'
  var input = '<input type="search" class="inputbox noprint" placeholder="'+placeholder+'" size="30" data-jets="inputdict'+i+'"/>'
  adjbb(list, input);
  
  var x = new Jets({
    searchTag: searchqs,
    contentTag: '[data-jets=dict'+i+'] ul'
  });
  
  var items = list.querySelectorAll('ul > li:not(:first-child)');
  for(var j=0; j<items.length; j++) {
    var item = items[j];
    var x = item.closest('ul').firstChild;
    x.dataset.jets += " "+item.dataset.jets;    
  }
  
  
}


document.addEventListener('DOMContentLoaded', function(){
  
  dbg('DOMContentLoaded');
  
  var vars = dqs('#allegrovars');
  if(vars) { // "edit" form
    // See event trix-initialize
    
  }
  
  else { // "read": post process result
    
    var dicts = dqsa('nav.allegro-dictindex');
    for(var i=0; i<dicts.length; i++) dictindexFilterable(dicts[i], i); 
    
    maketables();
    makevideos();
    makereferences();
    makepagereferences();
    aE('div.allegro-ref-wrap', 'mouseover', refhover);
    aE('div.allegro-ref-wrap', 'mouseout', refout);
    
    tap('.allegro-content figure.attachment a[href="#"]', function(e){
      e.preventDefault();
    });
    
    tap('.allegro-content', targetBlank);
    tap('.flipcomment', function(e){ this.classList.toggle('checked'); })
  }
  
  tap('input[data-today]', function(e){
    this.form.ptv_DateVisited.value = this.dataset.today;
  });
  
});
