/**
  Allegro: Modular, visual editor for PmWiki
  Written by (c) Petko Yotov 2017-2022   www.pmwiki.org/Petko

  This text is written for PmWiki; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version. See pmwiki.php for full details
  and lack of warranty.
*/


document.addEventListener('DOMContentLoaded', function(){


  
  tap('#getmeta', function(e){
    var field = dqs('#refurl')
    var refurl = field.value.trim().replace(/\#.*$/, '');
    if(! refurl) return;
    
    var url = location.href.replace(/\#.*$/, '') 
      + '?action=ref&url='+ue(refurl);
  
    field.disabled = true;
    this.disabled = true;
      
    fe4('json', url, function(obj){
      field.disabled = false;
      e.target.disabled = false;
      if(!obj || !obj.found) return temporarilyChangeValue(e.target, 'Failed');
        
      echo("all", obj.all);
      echo("found", obj.found);
      temporarilyChangeValue(e.target, 'Done.');
      for(var i in obj.found) {
        var el = field.form.querySelector('[name="ptv_'+i+'"]');
        if(el) {
          el.value = obj.found[i];
          temporarilyHighlight(el, 20);
        }
      }
      
    });
    
  })
  
});


