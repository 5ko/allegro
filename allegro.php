<?php if (!defined('PmWiki')) exit();
/**
  Allegro: Modular, visual editor for PmWiki
  Written by (c) Petko Yotov 2017-2023   www.pmwiki.org/Petko

  This text is written for PmWiki; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published
  by the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version. See pmwiki.php for full details
  and lack of warranty.
  
  
  
  TODO: now:
  * Editor: preview a calc form before inserting it
 
  TODO: Later
  * i18n - UI 
  * Translatable Calculator forms
  * Documentation
  * Talk/Forum
  
  * Create new namespace mostly done, TODO: update perms
  * Allegro module: add wikilib.d
  
  MAYBE: later:
  * Make all video covers the same size?
  * Attachtable + sortable uploads
  * CleanUp
  * Lazy Image Loading?
  
*/
$RecipeInfo['Allegro']['Version'] = '20230503';

Markup("allegro", '<&amp;amp;', "/\\(:allegro( .*?)?:\\)\n?(.*?)\n?\\(:allegroend:\\)/is", 'FmtAllegro');

# sidebar, tree, subpages
Markup("allegro-pages", 'directives', "/\\(:allegro-pages(.*?):\\)/i", 'FmtAllegroLinks'); 

# Show changes since reviewed version.
include_once("$FarmD/scripts/pagerev.php");
Markup("allegro-reviewdiff", 'directives', "/\\(:allegro-reviewdiff(.*?):\\)/i", 'FmtAllegroRevDiff'); 

SDVA($HandleActions, array(
  'awatermark' => 'HandleAllegroWatermark',
  'aedit' => 'HandleAllegroEdit',
  'anew' => 'HandleAllegroNew',
  'anamespace' => 'HandleAllegroNamespace',
  'adelete' => 'HandleAllegroDelete',
  'aupload' => 'HandleAllegroUpload',
  'areview' => 'HandleAllegroReview',
  'atag' => 'HandleAllegroTags',
  'avideocover' => 'HandleAllegroVideoCover',
  'amath' => 'HandleAllegroUploadMath',
));

SDVA($HandleAuth, array(
  'aedit' => 'edit',
  'aupload' => 'upload',
  'atag' => 'read',
  'adelete' => 'attr',
  'anamespace' => 'admin',
  'avideocover' => 'edit',
));

SDVA($AllegroData, array( ));

SDVA($Allegro, array(
  'PubDirUrl' => $ModuleDirUrl,
  'DisableSkinParts' => 'Left Header Footer Action Title',
  'NextPageNameFmt' => '%s.%04d',
  'DataDir' => "$WorkDir/.allegro",
  'AnonymousNewPagePat' => '-*',
  'EnableSubpages'=>1,
  'EnableUpload'=>1,
  'EnableTitle'=>1,
  'TagCloud' => array(
    'fmt'=> "<a class='taglink' style=\"font-size:%.3Fem;\" title=\"$[%d pages]\" 
      href=\"{\$PageUrl}?action=atag&amp;t=%s\">%s</a> ",
    'order'=>'alpha',
    'count'=>-1,
    'min' => 1,
    'minfontsize'=> .9,
    'maxfontsize'=> 1.8,
  ),
  'allegro2wiki' =>array( '`' => '&#96;', '´' => '&#180;'),
  'allegro2wiki2' =>array( 
    '<h2>'  => '`!', '</h2>' => '!´',
    '<h3>'  => '`?', '</h3>' => '?´',
    '<div>' => '`<', '</div>' => '<´',
    '<gallery>' => '`=', '</gallery>' => '=´',
    '<aside>' => '`~', '</aside>' => '~´',
    '<blockquote>'  => '`>', '</blockquote>' => '>´',
    '<ol><li>'  => '`#', '</li></ol>' => '#´',
    '<ul><li>'  => '`*', '</li></ul>' => '*´',
    '</li><li>'  => '`-',
    '<sup>'  => '`^', '</sup>' => '^´',
    '<sub>'  => '`_', '</sub>' => '_´',
    '<em>'  => '`/', '</em>' => '/´',
    '<strong>'  => '`+', '</strong>' => '+´',
    '&nbsp;' => '`.', '<br>'  => '`\\',
  ),
));

SDVA($Allegro['allegro2wiki'], $Allegro['allegro2wiki2']);

SDVA($Allegro['PostProcessFunctions'], array(
  'AllegroLoadForms' => 1,
  'AllegroInlineComments' => 2,
  'AllegroLinkTags' => 3, // after AllegroInlineComments
//   'AllegroLinearSections'=> 6,
//   'AllegroTimeStamps' => 4, 
  'AllegroTrails' => 99, 
));

$AllegroLinkFmt = array(&$LinkPageSelfFmt, &$LinkPageExistsFmt, &$LinkPageCreateFmt);
foreach($AllegroLinkFmt as &$fmt) {
  $fmt = preg_replace("/<a /", "$0data-status='{\$Status}' data-group='\$Group' ", $fmt, 1);
}

$ModuleHeaderFmt[] = "$ModuleDirUrl/dqsa-lib.js allegro.css allegro.js allegro-ref.js";
$ModuleHeaderFmt[] = array("$ModuleDirUrl/allegro-forms.js", 'data-dirurl'=>$Allegro['PubDirUrl']);


if(MatchNames($pagename, $Modules['allegro']['FormsGroup'].".*")) {
  # Needs to be on CDN or put languages to modules/js-lib
  # Also actually loaded from pmwiki-ace.js if needed
  $HTMLHeaderFmt['ace'] = '<script data-src="https://cdn.jsdelivr.net/npm/ace-builds@1.12.3/src-noconflict/ace.min.js"></script>';
  $ModuleHeaderFmt[] = "$ModuleDirUrl/pmwiki-ace.js pmwiki-ace.css";
}

$HTMLHeaderFmt['libcalcform'] = '<script src="$PageUrl?action=libcalc"></script>';



SDVA($CustomSyntax, array(
  'Allegro' => 'InterMap  (Attach|Youtube|Vimeo|Math)(\\d+x\\d+)?:',
  'Allegro,2' => '<joinline   escaped   /`[-+<>#*!?\\/ ^_\\\\]|[-+<>#*!?\\/ ^_]´/g',
));



$FmtPV['$ReviewBy'] = '@$page["reviewby"]';
$FmtPV['$ReviewTime'] = '@$page["reviewtime"]';
$FmtPV['$ReviewText'] = '@$page["reviewtext"]';
$FmtPV['$AllegroNextPageName'] = 'AllegroNextPageName($pn)';
$FmtPV['$Status'] = '$page["status"]??"draft"';
$FmtPV['$Level'] = 'AllegroPageLevel($group, $name)';
$FmtPV['$TopLevelPage'] = 'AllegroPageLevel($group, $name, 1)';

$Conditions['hassubpages'] = 'AllegroCondSubpages($pagename)';
function AllegroCondSubpages($pagename) {
  list($g, $n) = explode('.', $pagename);
  
  $data = AllegroData($g);
  $apage = @$data[$n];
  if($apage && isset($data['=subpages'][$n])) return count($data['=subpages'][$n]);
  return false;
}

function AllegroPageLevel($group, $name, $parent=false) {
  $data = AllegroData($group);
  $apage = @$data[$name];
  
  $level = 0;
  $parents = [];
  while(@$apage['parent'] && ++$level) {
    array_unshift($parents, $group.'.'.$apage['parent']);
    $apage = @$data[$apage['parent']];
  }
  
  if($parent) {
    $lastparent = @$parents[$parent];
    if($lastparent) return $lastparent;
    return "$group.$name";
  }
  return $level;
}

SDV($QualifyPatterns["/(\\(:allegro)(( .*?)?:\\)\n?(.*?)\n?\\(:allegroend:\\))/is"],
    'cb_qualifyallegro');
function cb_qualifyallegro($m) {
  extract($GLOBALS["tmp_qualify"]); 
  return "{$m[1]} qualifypagename=$pagename{$m[2]}";
}

function FmtAllegroRevDiff($m) {
  global $DiffFunction, $FmtV;
  extract($GLOBALS['MarkupToHTML']);
  $text = strval(@$FmtV['$PageSourceText']);
  $rtext = PageVar($pagename, '$ReviewText');
  $diff = $DiffFunction($text, $rtext);
  return KeepBlock(DiffHTML($pagename, $diff).$FmtV['$SubpagesReordered']);
}

function FmtAllegro($m) {
  global $Allegro, $Now, $AllegroInPage;
  $AllegroInPage = 1; # used in conditionals
  
  extract($GLOBALS['MarkupToHTML']);
  
  $args = ParseArgs($m[1]);
  $html = trim(htmlspecialchars_decode($m[2]));
  
  $pn = isset($args['qualifypagename'])? $args['qualifypagename']:$pagename;
  
  $html = wiki2html($pn, $html);

  if(@$args['editor']) {
    $html = @"<div class='allegro-editor'>
      <trix-editor class='trix-content' input='allegrotext' placeholder='{$args['placeholder']}'></trix-editor>
      </div>";
    return KeepBlock($html);
  }
  else {
    asort($Allegro['PostProcessFunctions']);
    
    foreach($Allegro['PostProcessFunctions'] as $fn=>$pos) {
      if($pos>0) $html = $fn($pn, $html, $args);
    }
    
    $pagestatus = PageTextVar($pn, 'Status');
    
    $html = "<div class='trix-content allegro-content' data-status='$pagestatus'>$html</div>";
    
    $out = KeepBlock($html);
    if(!@$args['qualifypagename'])
      $out = "(:include Site.ReviewHeader:)\n$out\n(:allegro-pages mode=subpages:)\n";
    
    return PRR($out);
  }
}


function AllegroOneDetail($summ, $content, $htype, $open) {
//   $summ = preg_replace('!^<(h[23])>%#([-\\w]+)%\\s*!i', '<$1 id="$2">', $summ);
  if(preg_match('!^<h[23] id="(.*?)">!i', $summ, $m)) {
    $detid = " id=\"d--{$m[1]}\"";
  }
  else $detid = '';
  
  return "<details$detid data-type='$htype' $open><summary>$summ</summary>$content</details>";
}

function AllegroOneSection($summ, $content, $htype, $open) {
  if(preg_match('!^<h[23] id="(.*?)">!i', $summ, $m)) {
    $detid = " id=\"d--{$m[1]}\"";
  }
  else $detid = '';
  
  return "<details$detid data-type='$htype' $open><summary>$summ</summary>$content</details>";
}

function AllegroInlineComments($pagename, $html, $opt) {
  static $canedit = null;
  if(is_null($canedit)) $canedit = CondAuth($pagename, 'edit');
  
  if($canedit) {
    return preg_replace('!<aside>!', '<span class="flipcomment">💬</span>$0', $html);
  }
  else return preg_replace('!<aside>.*?</aside>!', '', $html);
}

function AllegroLoadForms($pagename, $html, $opt) {
  preg_match_all('!<figure[^>]*\\sdata-trix-content-type="allegro/form"[^>]*>(\\w+)!s', $html, $m);
  $list = $m[1];
  if(count($list)) {
    $list = implode(',', $list);
    AllegroLoadFormsHeader($pagename, $list);
  }
  return $html;
}
function AllegroLoadFormsHeader($pagename, $list) {
  global $HTMLHeaderFmt;
  $url = PageVar($pagename, '$PageUrl') . "?action=libcalc&amp;list=$list";
  $HTMLHeaderFmt['LoadForms'] = "<script src='$url'></script>";
}

function AllegroTrails($pagename, $html, $opt) {
  global $Allegro, $AllegroData;
  list($g, $n) = explode('.', $pagename);
  
  $data = AllegroData($g);
  
  $me = isset($data[$n])? $data[$n]: [];
  $parentname = @$data[$n]['parent'];
  if(!$parentname) return $html; // homepage
  
  $parent = @$data[$parentname];
  if(!$parent) return $html; // orphan?
  
  $subpages = array_values(preg_grep('/^Template/', 
    (array)@$data['=subpages'][$parentname], PREG_GREP_INVERT));
  
  $pos = array_search($n, $subpages);
  if($pos === false)  return $html; // bug?
  
  $out2 = '';
  
  if($pos) {
    $pn = $subpages[$pos-1];
    $out2 .= AllegroTrailLink($data, $g, $pn, 'prevlink');
  }
  
  $out2 .= AllegroTrailLink($data, $g, $parentname, 'parentlink');
  
  if($pos<count($subpages)-1) {
    $pn = $subpages[$pos+1];
    $out2 .= AllegroTrailLink($data, $g, $pn, 'nextlink');
  }
  
  $trail = "<div class='frame allegrotrail'>$out2</div>";
  
  return $html.$trail;
}

function AllegroTrailLink($data, $g, $pn, $cname) {
  $title = $data[$pn]['title'];
  $status = $data[$pn]['status'];
  $htitle = PHSC($title, ENT_QUOTES, null, false);
  $url = PageVar("$g.$pn", '$PageUrl');
  
  $out = '';
  if($cname == 'prevlink') {
    $out .= "<a class='allegrotrail-arrow' title='$htitle' href='$url'>&larr;</a>";
  }
  $out .= "<a class='allegrotrail-$cname wikilink' data-status='$status' title='$htitle' href='$url'>$htitle</a>";
  if($cname == 'nextlink') {
    $out .= "<a class='allegrotrail-arrow' title='$htitle' href='$url'>&rarr;</a>";
  }
  return $out;
}

function AllegroLinkTags($pagename, $html, $opt=false) {
  global $url_cb_alinktags;
  list($g, $n) = explode('.', $pagename);
  $hpn = MakePageName("$g.$g", "$g.");
  $url_cb_alinktags = PageVar($hpn, '$PageUrl');
  $html = PRCB('!<a href="Tag:(.*?)".*?>!', 'cb_alinktags', $html);
  return $html;
}
function cb_alinktags($m) {
  global $url_cb_alinktags;
  $decoded = html_entity_decode($m[1]);
  $encoded = urlencode(AllegroFold($decoded));
  return "<a class='taglink' href=\"$url_cb_alinktags?action=atag&amp;t=$encoded\">";
}

function AllegroFold($x) {
  global $StrFoldFunction;
  $x = $StrFoldFunction(trim($x));
  return $x;
}


function AllegroCollapseSections2($html, $level, $open) {
  global $PmTOC;
  $parts = preg_split("!(<(h[2{$level}])>.*?</\\2>)!", $html, -1, PREG_SPLIT_DELIM_CAPTURE);
  $html2 = $parts[0];
  if($level == 3) {
    if(count($parts) >= $PmTOC['MinNumber'])
      $html2 .= '<div class="PmTOCdiv"></div>';
  }
  for($i=1; $i<count($parts); $i+=3) {
    $htype=$parts[$i+1];
    $summ=$parts[$i];
    $content = $parts[$i+2];
    if($level == 3 && $htype =="h2") $html2 .= "$summ$content";
    else $html2 .= AllegroOneDetail($summ, $content, $htype, $open);
  }
  
  return $html2;
  
}

function AllegroCollapseSections($pagename, $html, $opt) {
  global $Allegro;
  $open = @$opt['h2'] == 'collapsed'? '':'open';
  $html = AllegroCollapseSections2($html, 3, $open);
  
  $open = @$opt['h1'] == 'collapsed'? '':'open';
  $html = AllegroCollapseSections2($html, 2, $open);
  
  return $html;
}

function AllegroSectionsSections2($html, $level) {
  $parts = preg_split("!(<(h[2{$level}])[^>]*>.*?</\\2>)!", $html, -1, PREG_SPLIT_DELIM_CAPTURE);
  $html2 = $parts[0];
  for($i=1; $i<count($parts); $i+=3) {
    $htype=$parts[$i+1];
    $summ=$parts[$i];
    $content = $parts[$i+2];
    if($level == 3 && $htype =="h2") $html2 .= "$summ$content";
    else $html2 .= "<section>$summ$content</section>";
  }
  return $html2;
}

function AllegroSectionsSections($pagename, $html) {
  $html = AllegroSectionsSections2($html, 3);
  $html = AllegroSectionsSections2($html, 2);
  return $html;
}

function AllegroLinearSections($pagename, $html) {
  $parts = preg_split("!(<(h[23])[^>]*>.*?</\\2>)!s", $html, -1, PREG_SPLIT_DELIM_CAPTURE);
  $out = "";
  for($i=0; $i<count($parts); $i++) {
    if(substr($parts[$i], 0, 2) == "<h") {
      $out .= $parts[$i++];
      continue;
    }
    $out .= "<section>{$parts[$i]}</section>";
  };
  return $out;
}

function AllegroSortSubpages($a, $b) {
  $delta = $a[0] - $b[0];
  if($delta) return $delta;
  return strnatcasecmp($a[1], $b[1]);
}

function a_is_orphan($g, $data, $nn, $hnn) {
  if($nn == $hnn) return false;
  if(!$nn || !$data[$nn]) return true;
  return a_is_orphan($g, $data, @$data[$nn]['parent'], $hnn);
}

function AllegroData($g, $save = false){
  global $Allegro, $AllegroData;
  $fname = "{$Allegro['DataDir']}/$g.pages.json";
  
  
  
  if(!isset($AllegroData[$g])) {
    $AllegroData[$g] = array();
    
    $data = AllegroJD('[]', $fname);
    
    $grouplist = ListPages("$g.*,-*.RecentChanges,-*.SideBar,-*.GroupHeader,-*.GroupFooter,-*.GroupAttributes");
    
    $skip = strlen($g) + 1;
    
    $namelist = array();
    foreach($grouplist as $pn) {
      $namelist[] = substr($pn, $skip);
    }
    
    # add orphans
    foreach($namelist as $nn) {
      if(!isset($data[$nn])) {
        $data[strval($nn)] = array('title'=>PageVar("$g.$nn", '$Title'));
      }
    }
    
    # resolve the actual homepage
    $hpn = MakePageName("$g.$g", "$g.");
    list($hgg, $hnn) = explode('.', $hpn);
    
    // rm deleted
    $data2 = array('=homename' => $hnn, '=subpages'=>[], '=orphan'=>[]);
    
    foreach($data as $nn=>&$a) {
      if(in_array($nn, $namelist)) {
        if(! @$a['status']) $a['status'] = 'draft';
        if(isset($a['tags'])) $a['tags'] = array_values($a['tags']);
        $data2[strval($nn)] = $a;
        @$data2['=subpages'][strval(@$a['parent'])][] = $nn;
        
        if(a_is_orphan($g, $data, $nn, $hnn)) $data2['=orphan'][] = $nn;
      }
    }
    foreach($data2['=subpages'] as $nn=>&$a) {
      $b = [];
      if(isset($data2[$nn]['sporder'])) {
        $c = explode(' ', $data2[$nn]['sporder']);
      }
      else $c = [];
      foreach($a as $sn) {
        $idx = array_search($sn, $c);
        if($idx === false) $idx = 99999999;
        $b[$sn] = [$idx, $data2[$sn]['title']];
        
      }
      uasort($b, 'AllegroSortSubpages');
      $a = array_keys($b);
    }
    $data = $data2;
    
    $data['=tree'] = AllegroSubtree($data, $hnn);
    
    $data['=tags'] = $data['=untags'] = $data['=templates'] = array();
    $max = 0;
    foreach($data as $pn=>&$a) {
      $pn = strval($pn);
      if(strlen($pn) && $pn[0]=='=') continue;
      
      $max = max($max, intval($pn, 10));
      
      if(! @$a['tags']) {
        $data['=untags'][] = $pn;
        continue;
      }
      foreach((array)$a['tags'] as $tag) {
        @$data['=tags'][$tag][] = $pn;
      }
    }
    $data['=nextpagename'] = sprintf($Allegro['NextPageNameFmt'], $g, $max + 1);
    $data['=group'] = $g;
    $AllegroData[$g] = $data;
  }
  if($save) {
    $data = $AllegroData[$g];
    $keys = preg_grep('/^=/', array_keys($data));
    foreach($keys as $k) unset($data[$k]);
    AllegroJE($data, $fname);
  }
  return $AllegroData[$g];
}

function AllegroHiddenPages($nn, &$data) {
  $a = &$data[$nn];
  if(@$a['hidden']) return true;

  if(@$a['title'] && $a['title'][0]==='.') {
    $a['hidden'] = true; 
    return true;
  }
  
  if(@$a['parent']) {
    $hidden = AllegroHiddenPages($a['parent'], $data);
    if($hidden) $a['hidden'] = true;
    return $hidden;
  }
  return false;
}

function AllegroSubtree(&$data, $pn, $prevlevel=-1) {
  $level = $prevlevel+1;
  if(!isset($data['=subpages'][$pn])) return [];
  $sp = $data['=subpages'][$pn];
  $out = [];
  foreach($sp as $nn) {
    $subtree = AllegroSubtree($data, $nn, $level);
    $out[] = [$nn, $subtree];
  }
  return $out;
}

function AllegroSubpageSort($x, $y) {
  $diff = $x['idx'] - $y['idx'];
  if($diff) return $diff;
  return strnatcasecmp($x['title'], $y['title']);
}

function FmtAllegroLst($g, $names, $data, $args, $defaultcname, $defaultlabel) {
  if(@$args['name']) $names = MatchNames($names, $args['name']);
  
  $out = '';
  foreach($names as $nn) {
    if(!@$data[$nn]) continue;
    if($defaultcname != 'allegro-templates' &&  preg_match('/^Template/', $nn)) continue;
    $nt = $data[$nn]['title'] ?? $nn;
    $status = $data[$nn]['status'] ?? 'draft';
    $ntt = Keep($nt);
    $out .= "* [[ $g.$nn\"$ntt\" | $nt ]] \n";
  } 
  if($out || @$args['evenempty'] ) {
    $cname = @$args['cname']? $args['cname'] : $defaultcname;
    
    $label = isset($args['label']) ? $args['label'] : $defaultlabel;
    
    $out = "(:nav class=\"$cname\":)\n$label\n$out(:navend:)\n";
    $out = preg_replace("/\n\n+/", "\n", $out); # no label
    return PRR($out);
  }
  return '';
}

function FmtAllegroLinks($m) {
  global $Allegro, $Now, $InputValues;
  extract($GLOBALS['MarkupToHTML']);
  
  $args = ParseArgs($m[1]);
  
  if(@$args['pagename']) $pagename = MakePageName($pagename, $args['pagename']);
  list($g, $n) = explode('.', $pagename);
  
  if(@$args['group'] && $args['group'] != $g) {
    $g = $args['group'];
  }
  
  $data = AllegroData($g);
  
  if($args['mode'] == 'dictindex') {
    $cname = @$args['cname']? $args['cname'] : 'allegro-dictindex';
    $dict = [];
    foreach($data as $k=>$a) {
      if($k === $n) continue; # current page
      if(!isset($a['title']) || $k[0]=='=' || substr($k, 0, 8)=='Template') continue;
      $dict[$k] = $a['title'];
    }
    asort($dict);
    $dict2 = [];
    foreach($dict as $nn=>$t) {
      $l = mb_substr($t, 0, 1, 'utf-8');
      $p = 
      @$dict2[$l] .= "* [[$g.$nn|$t]]\n";
    }
    $menu = [];
    $list = "";
    foreach($dict2 as $letter=>$text) {
      $menu[] = "[[#dict_{$letter}|{$letter}]]";
      $list .= "* %list avoidbreak id=dict_$letter% {$letter} [-[[#dict_top|&uarr;]]-]"
        ."%item dictheader%\n$text\n[==]\n";
    }
    
    $out = "(:nav class=\"$cname-menu frame\" id=dict_top:)" . implode(' | ', $menu) . " \n(:navend:)(:notoc:)\n\n"
      . "(:nav class=\"$cname\":)\n$list(:nl:)(:navend:)\n";
      
    return PRR($out);
  }
  if($args['mode'] == 'linktree') { # edit form link dialogue
    $out = AllegroTreeList($data, $g);
    
    $cname = @$args['cname']? $args['cname'] : 'allegro-tree';
    
    $out = "(:nav class=\"$cname\":)\n$out(:navend:)\n";
    return PRR($out);
  }
  if($args['mode'] == 'tree') { # homepage, or subtree of a page
    $out = AllegroTreeList($data, $n);
    
    
    $cname = @$args['cname']? $args['cname'] : 'allegro-tree';
    
    $out = "(:nav class=\"$cname\":)\n$out(:navend:)\n";
    return PRR($out);
  }
  if($args['mode'] == 'templates') {
    $tplnames = preg_grep('/^Template/', array_keys($data));
    if(!$tplnames) return '';
    $lasttemplate = 0;
    $sorted = [];
    foreach($tplnames as $v) {
      $currtemplate = intval(substr($v, 8));
      $lasttemplate = max($lasttemplate, $currtemplate);
      $sorted[$v] = $data[$v]['title'];
    }
    asort($sorted);
    $tplnames = array_keys($sorted);
    
    $out = '';
    foreach($tplnames as $nn) {
      $page = RetrieveAuthPage("$g.$nn", "read", true, READPAGE_CURRENT);
      if(preg_match('/\\(:allegro\\b(.*?):\\)(.*?)\\(:allegroend:\\)/s', $page['text'], $mm)) {
        $ttext = wiki2html($pagename, trim($mm[2]));
        if($ttext) {
          $jtext = PHSC($ttext, ENT_QUOTES);
          $label = PHSC(@$page['title'], ENT_QUOTES);
          $out .= "<option data-value='$jtext'>$label</option>";
          
        }
      }
    }
    if($out) {
      $label = isset($args['label']) ? $args['label'] : XL('Select template...');
      return Keep("<select id='allegrotemplate'><option>$label</option>$out</select>");
    }
    return '';
  }
  if($args['mode'] == 'listtemplates') {
    $tplnames = preg_grep('/^Template/', array_keys($data));
    
    $defaultlabel = '$[Templates]';
    $label = $args['label'] ?? $defaultlabel;
    $lasttemplate = 0;
    $sorted = [];
    foreach($tplnames as $v) {
      $currtemplate = intval(substr($v, 8));
      $lasttemplate = max($lasttemplate, $currtemplate);
      $sorted[$v] = $data[$v]['title'];
    }
    asort($sorted);
    $tplnames = array_keys($sorted);
    
    $nexttemplate = "Template".(++$lasttemplate);
    $label .= "\n* [[$g.$nexttemplate?action=aedit| $[Add new template] ]] %list filterable% \n";
    
    return FmtAllegroLst($g, $tplnames, $data, $args, 'allegro-templates', $label);
  }
  if($args['mode'] == 'select') {
    if(!$Allegro['EnableSubpages']) return '';
    $currpage = @$InputValues['newpage'] ? '=new' : $n;
    
    # possibly interlink
    $selectparent = AllegroParentSelect($data, $g, $currpage);
    if($selectparent) {
      $label = isset($args['label']) ? $args['label'] : XL('Parent:');
      return Keep("$label <select name='ptv_Parent'>$selectparent</select><br/>");
    }    
    return '';
  }
  if($args['mode'] == 'subpages') {
    if(!IsEnabled($Allegro['EnableSubpages'], 1)) return "";
    $subpages = (array)@$data['=subpages'][$n];
    $defaultlabel = ($n == $data['=homename'])? '$[Categories]' : '$[Subpages]';
    $label = $args['label'] ?? $defaultlabel;
    return FmtAllegroLst($g, $subpages, $data, $args, 'allegro-subpages', $label);
  }
  if($args['mode'] == 'orphan') {
    $orphan = @$data['=orphan'];
    return FmtAllegroLst($g, $orphan, $data, $args, 'allegro-orphan allegro-tree', 
      '$[Orphan pages (please attach them to an existing parent page or delete them)]');
  }
  if($args['mode'] == 'breadcrumbs') {
    $cname = @$args['cname']? $args['cname'] : 'allegro-breadcrumbs';
    
    if(1 && @$args['talkgroup'] == $g) {
      $an = PageVar($pagename, '$ArticleName');
      return PRR("(:nav class=\"$cname\":)\n* [[$an| $[Article] ]]\n(:navend:)\n");
    }
    
    $parents = array();
    
    $parent = strval(@$data[$n]['parent']);
    if(!$parent) $parent = $data['=homename'];
    while($parent) {
      $parents[] = $parent;
      $next = strval(@$data[$parent]['parent']);
      if($next !== $parent) $parent = $next;
      else break;
    }
    
    $parentgrouplink = '';
    if(preg_match('/^(\\w+)-/', $g, $mpg)) {
      $pg = $mpg[1];
      if(PageExists("$pg.$pg")) {
        $parentgrouplink = "* [[ $pg.$pg | + ]]";
      }
    }
    
    $x = FmtAllegroLst($g, array_reverse($parents), $data, $args, 'allegro-breadcrumbs', $parentgrouplink);
    return $x;
  }
  if($args['mode'] == 'tags') {
    $otag = strval(@$args['tag']);
    if(@$args['request'] && @$_REQUEST['t']) $otag = $_REQUEST['t'];
    $otag = mb_convert_case($otag, MB_CASE_TITLE, "UTF-8");
    $tag = AllegroFold($otag);
    
    if(isset($data['=tags'][$tag])) $list = $data['=tags'][$tag];
    else $list = [];
    
    $list2 = array();
    foreach($list as $pn) {
      if(preg_match('/^Template/', $pn)) continue;
      $list2[$pn] = $data[$pn]['title'];
    }
    asort($list2, SORT_LOCALE_STRING);
    $sorted = array_keys($list2);


    $labelfmt = XL('%1$d page(s) tagged in <allegro-tag>%2$s</allegro-tag>');
    $label = sprintf($labelfmt, count($list), Keep(PHSC($otag, ENT_QUOTES, null, false)));
    
    
    if(count($list))
      return FmtAllegroLst($g, $sorted, $data, $args, 'allegro-tags', $label);
    else return $label;
  }
  if($args['mode'] == 'tagcloud') {
    $hpn = MakePageName("$g.$g", "$g.");
    
    $fmt = FmtPageName($Allegro['TagCloud']['fmt'], $hpn);
  
    $alltags = [];
    foreach($data as $pn=>$a) {
      if(!isset($a['tags'])) continue;
      foreach($a['tags'] as $t) {
        $t = mb_convert_case($t, MB_CASE_TITLE, "UTF-8");
        @$alltags[$t]++;
      }
    }
    if(!count($alltags)) return '';
    $maxcnt = max($alltags);
    $mincnt = min($alltags);
      
    SDVA($args, $Allegro['TagCloud']);

    $order = $args['order'];
    $min = max($mincnt, intval($args['min']));
    $count = intval($args['count']);
    $deltafontsize = $args['maxfontsize']-$args['minfontsize'];
    $min1 = $min-1;
    $max1 = $maxcnt - $min1;
    # we have log($min-$min1, $base) == 0;
    # we need log($max1, $base) == $deltafontsize;
    $base = pow($max1, 1/$deltafontsize);
    
    if($order[0]==='-') {
      $reverse = 1;
      $order = substr($order, 1);
    }
    else $reverse = 0;
      
    if($order == 'locale' || $order == 'alpha')
      ksort($alltags, SORT_LOCALE_STRING);
    
    elseif($order == 'hits') 
      arsort($alltags, SORT_NUMERIC);
    
    if($reverse) $alltags = array_reverse($alltags, true);
    
    $output = '';
    $i = 0;
    foreach ($alltags as $k => $v){
      if($v<$min) continue;
      $w = log($v, $base) + $args['minfontsize'];
      $output .= "<li>". sprintf($fmt, $w, $v, rawurlencode($k), $k) . "</li>";
      if($count>0 && ++$i>=$count) break;
    }
    $output = "<ul class='allegro-tagcloud filterable'>$output</ul>";
    return KeepBlock($output);
  }
}


function AllegroTreeList($data, $nn, $level=0) {
  if(preg_match('/^Template/', $nn)) return '';
  $sp = $data['=subpages'];
  $label = PHSC(@$data[$nn]['title']);
  $indent = str_repeat('*', $level);
  $g = $data['=group'];
  $out = "{$indent}[[$g.$nn|$label]]\n";
//   $out = "{$indent}[[$g.$nn|$label]] (level={{$g}.$nn\$Level} top={{$g}.$nn\$TopLevelPage}) title={{{$g}.$nn\$TopLevelPage}\$Title})\n";
  $level++;
  if(isset($sp[$nn])) foreach($sp[$nn] as $sn) {
    $out .= AllegroTreeList($data, $sn, $level);
  }
  return $out;
}

function AllegroParentSelect($data, $nn, $currentpage=null, $level=0) {
  global $Allegro;
  $currentparent = $currentpage? @$data[$currentpage]['parent'] : false;
  
  # cannot select self or own subpages as parent
  if($nn == $currentpage) return '';
  $sp = $data['=subpages'];
  $label = PHSC($data[$nn]['title']);
  $indent = str_repeat('&nbsp;&nbsp;&nbsp;', $level);
  
  $level++;
  $s = $children = '';
  if($currentparent === $nn) {
    $s = 'selected="selected"';
  }
  foreach((array)@$data['=subpages'][$nn] as $sn) {
    if($sn == $currentpage) continue;
    $children .= AllegroParentSelect($data, $sn, $currentpage, $level);
  }
  $option = "<option value='$nn'$s>$indent$label</option>\n";
  return $option.$children;
}

function AllegroDelAttach($pagename, $upname) {
  global $Now, $UploadFileFmt;
  
  $upname = preg_replace('!^.*\\/!', '', $upname);
  $filepath = FmtPageName("$UploadFileFmt/$upname", $pagename);
  
  if(file_exists($filepath)) {
    @rename($filepath, "$filepath,$Now");
  }
}

function HandleAllegroTags($pagename, $auth = 'read') {
  global $PageStartFmt, $PageEndFmt, $Allegro;
  $page = RetrieveAuthPage($pagename, $auth, true, READPAGE_CURRENT);
  if(!$page) return Abort('?no permissions');
  
  $print = array($PageStartFmt,
    '<div id="wikitext">',
    "markup:(:allegro-pages mode=tags request=1:)\n\n\n$[Back to] [[{*\$Group}/|+]]/\n(:allegro-pages mode=subpages pagename={*\$Group} label='' cname=allegro-menu:)", 
    '', '</div>', $PageEndFmt);// page:Site.AllegroEditForm"
  
  PrintFmt($pagename, $print);
  exit;
}

function HandleAllegroUpload($pagename, $auth = 'upload') {
  global $FmtV, $UploadRedirectFunction;
  $page = AllegroRetrieveNewPage($pagename, $auth, false, READPAGE_CURRENT);
  if(!$page) {
    $FmtV['$upresult'] = 'upresult=permissions';
    return AllegroUploadRedirect($pagename);
  }
  $UploadRedirectFunction = 'AllegroUploadRedirect';
  HandlePostUpload($pagename, $auth);
}

function AllegroUploadRedirect($pagename, $url=false) {
  global $FmtV, $Now, $Allegro;
  header('Content-type: application/json');
  $result = substr($FmtV['$upresult'], 9); # upresult=success
  $out = array(
    'result' => $result
  );
  if($result == "success") {
    $fpath = $FmtV['$filepath'];
    $href = $url = $FmtV['$upurl'];
    
    if(preg_match('/\\.(mp4|webm|mkv)$/', $fpath)) {
      $pubdir = FmtPageName($Allegro['PubDirUrl'], $pagename);
      $url = "$url.jpg";
      $ctype = 'image/jpeg';
    }
    $out['attr'] = array(
      'filename' => $FmtV['$upname'],
      'filesize' => $FmtV['$upsize'],
      'href' => $href,
      'url' => $url,
      'mtime' => $Now,
    );
    if(@$ctype) {
      $out['attr']['contentType'] = $ctype;
      $out['attr']['caption'] = $FmtV['$upname'];
    }
  } 
  echo AllegroJE($out);
}

function HandleAllegroNew(&$pagename, $auth = 'edit') {
}


function AllegroRetrieveNewPage($pagename, $auth, $authprompt=true, $since=0) {
  global $Allegro, $AuthId, $AuthList;
  $m = MatchPageNames($pagename, $Allegro['AnonymousNewPagePat'], false);
  
  if($AuthId || !$m || PageExists($pagename)) 
    return RetrieveAuthPage($pagename, $auth, true, $since);
  
  # new page
  $page = ReadPage($pagename, $since);
  
  $page['passwdedit'] = "id:* ". AnonUserSetPagePerms($pagename);
  
  return $page;
}

# This function enables edit permissions for anonymous users's own pages
function AnonUserSetPagePerms($pagename = null) {
  global $AuthId, $Allegro, $AuthList, $Now;

  $user_id0 = $user_id = @$_COOKIE['known_user'];
  if($AuthId || (!$pagename && !$user_id)) return;
  
  $fname = "{$Allegro['DataDir']}/_AnonUsersPerms.json";
  $users = AllegroJD('{}', $fname);
  if(!$user_id) {
    $user_id = base64_encode(random_bytes(15));  
  }
  if(! isset($users[$user_id])) $users[$user_id] = array();
  if($pagename) {
    $perms = str_replace(".", "_", "@edit_$pagename");
    $users[$user_id][] = $perms;
  }
  $users[$user_id] = array_unique($users[$user_id]);
  pm_session_start();
  foreach($users[$user_id] as $k=>$pageauth) {
    if(is_integer($pageauth)) continue;
    $AuthList[$pageauth] = 1;
    $_SESSION['authlist'][$pageauth] = 1;
  }
  $users[$user_id]['=expires'] = $Now+30*86400;
  
  pmsetcookie('known_user', $user_id, $Now+30*86400, "/");
  
  foreach($users as $uid=>$a) {
    if($a['=expires']<$Now) unset($users[$uid]);
  }
  
  if(!$pagename) return;
  AllegroJE($users, $fname);
  return $perms;
}
@$LogoutCookies[] = 'known_user';



array_unshift($EditFunctions, 'AllegroUpdateReviewStamp');
function AllegroUpdateReviewStamp($pagename, $page, &$new) {
  global $Now;
  if(isset($new['reviewtext'], $new['text'], $new['reviewtime']) 
    && $new['reviewtext']==$new['text']) 
      $new['reviewtime'] = $Now;
}

function HandleAllegroEdit(&$pagename, $auth = 'edit') {
  global $UploadMaxSize, $XL, $Allegro, $AllegroData, $Now, $PageStartFmt,
    $PageEndFmt, $WikiDir, $ChangeSummary,
    $InputValues, $AuthId, $Author, $AllegroNewPage, 
    $UploadUrlFmt, $UploadPrefixFmt, $WikiTitle, $UploadExts, $NamePattern;
  
  list($g, $n) = explode('.', $pagename);
  AllegroData($g);
  
  pm_session_start();
  
  
  $page = $page2 = AllegroRetrieveNewPage($pagename, $auth, true);
  if(!$page) {
    unset($_SESSION['AllegroEdit']);
    return Abort('? $[No permissions]');
  }
  if(isset($_POST['allegrotext'])) {
    pmtoken(1, true);
    $posted = 1;
  }
  else {
    RestorePage($pagename, $page2, $page);
    $posted = 0;
  }
  
  $canreview = CondAuth($pagename, 'attr');
  if(!$Allegro['EnableUpload']) {
    $canupload = false;
  }
  else $canupload = $canreview || CondAuth($pagename, 'upload');
  
  $_SESSION['AllegroEdit'][$g] = 1;
  
  $isnew = intval(@$_REQUEST['newpage']);
  
  if(!$isnew && preg_match("/\\(:allegro( .*?)?:\\)\n?(.*?)\n?\\(:allegroend:\\)\\s*/is", strval(@$page['text']), $m)) {
    $args = ParseArgs($m[1]);
    $html = trim($m[2]);
    $GLOBALS["MarkupToHTML"]['pagename'] = $pagename;
    $html = wiki2html($pagename, MarkupEscape($html), true);
    
    $orig = $m[0];
  }
  else {
    $args = array();
    $html = '';
    $orig = '';
  }
  if($isnew) {
    $pagename = AllegroNextPageName($pagename);
    list($g, $n) = explode('.', $pagename);  
  }
  if($posted) {
    
    $pagedata = array();
    
    $parent = MakePageName($pagename, strval(@$_POST['ptv_Parent']));
    if($parent && PageExists($parent)) {
      $parent = PageVar($parent, '$Name');
      $pagedata['parent'] = $parent;
    }
    
    $an = PageVar($pagename, '$ArticleName');
    if(@$_POST['allegrotitle'])
      $title = trim(AllegroSanitizeVar(@$_POST['allegrotitle']));
    elseif($pagename != $an) {
      $title = 'Talk: ' . PageVar($an, '$Title');
    }
    else $title = $n;
    $pagedata['title'] = $title;
    
    $text = allegro2wiki($_POST['allegrotext']);
    
    $markup = "(:allegro:)$text(:allegroend:)";
    
    $new = $page;
    if(@$pagedata['parent']) $new['parent'] = $parent;
    else unset($new['parent']);
    
    if(preg_match_all('/\\[\\[!(.*?)(?:\\|.*?)?\\]\\]/', $text, $atags)) {
      $tags = array_map('AllegroFold', $atags[1]);
      $tags = array_values(array_unique($tags, SORT_STRING));
      
      $pagedata['tags'] = $tags;
      $new['tags'] = AllegroJE($tags); // may have special characters
    }
    
    $new['text'] = strval(@$new['text']);
    if($isnew) {
      $new['text'] = $markup;
    }
    elseif($orig) $new['text'] = str_replace($orig, $markup, $new['text']);
    else  $new['text'] .= $markup;
    
    $sporder = @$_POST['ptv_SPOrder'];
    if($sporder == '=alpha') {
      unset($pagedata['sporder'], $new['sporder']);
      $_POST['ptv_SPOrder'] = '';
    }
    elseif($sporder && preg_match("/($NamePattern)( ($NamePattern))*/", $sporder)) {
      $pagedata['sporder'] = $new['sporder'] = $sporder;
    }
    $status = AllegroSanitizeVar(trim(strval(@$_POST["ptv_Status"])));
    if($status == 'reviewed' && !$canreview) {
      $status = $_POST["ptv_Status"] = 'draft';
    }
    
    $pagedata['status'] = $new['status'] = $status;
    
    
    if(@$Allegro['SavePTV']) {
      $ptvs = explode(',', $Allegro['SavePTV']);
      sort($ptvs);
      foreach($ptvs as $k) {
        $new['text'] = preg_replace("/\n?\\(:$k:.*?:\\)\n?/s", '', $new['text']);
        $v = AllegroSanitizeVar(trim(strval(@$_POST["ptv_$k"])));
        if($v !== '') 
          $new['text'] .= "(:$k:$v:)";
      }
    }
    $new['title'] = $title;
    $new['text'] = rtrim(preg_replace('/\\(:title .*?:\\)/i', '', $new['text']));
    $new['text'] = rtrim($new['text']) . "\n(:title $title:)\n";
    
    
    if($status == 'reviewed') {
      $new['reviewtext'] = $new['text'];
      $new['reviewtime'] = $Now;
      $new['reviewby'] = $AuthId;
    }
    elseif($status == 'pending') {
      $rtext = preg_replace('/\\(:Status:\\S+?:\\)/', '(:Status:reviewed:)', $new['text']);
      if(@$new['reviewtext']==$rtext) {
        $status = 'reviewed';
        $pagedata['status'] = $new['status'] = $status;
        $new['reviewtime'] = $Now;
        $new['text'] = $rtext;
      }
    }
    
    list($g, $n) = explode('.', $pagename);
    
    $new["csum"] = $new["csum:$Now"] = $ChangeSummary;
    Lock(2);
    UpdatePage($pagename, $page, $new);
    AnonUserSetPagePerms($pagename);
    Lock(0);
    
    $AllegroData[$g][$n] = $pagedata;
    AllegroData($g, true);
    
    return Redirect($pagename);
  }
  # ELSE !$posted, show edit form
  
  $InputValues['allegrotext'] = PHSC(preg_replace("!(<(\\/(div|ul|ol|li|blockquote|figure|figcaption|h\\d|pre)|br[\\/\\s]*)>)\\s*!i", "$1", $html), ENT_QUOTES);
  $InputValues['newpage'] = $isnew;
  
  $InputValues['allegroh1'] = @$args['h1'] ? $args['h1'] : '';
  $InputValues['allegroh2'] = @$args['h2'] ? $args['h2'] : '';
  
  $InputValues['allegrotitle'] = PageExists($pagename) ? PageVar($pagename, '$Title') : "";
  $InputValues['author'] = $Author;
  $InputValues['authid'] = $AuthId;
  
  if(@$_REQUEST['restore']) {
    $InputValues['ptv_Status'] = $canreview? "reviewed" : "pending";
  }
  
  $XL['en']['ULnopermissions'] = 'You cannot attach files to this page.';
  $codes = array();
  foreach($XL['en'] as $k=>$v) {
    if(! preg_match('!^(UL|W_|A_)!', $k)) continue;
    $codes[$k] = XL($k);
  }
  
  $uploadurl = FmtPageName("$UploadUrlFmt$UploadPrefixFmt/", $pagename);
  
  $vars = array(
    'PageUrl' => PageVar($pagename, '$PageUrl'),
    'AllegroDirUrl' => $Allegro['PubDirUrl'],
    'FullName' => $pagename,
    'Author' => $Author,
    'UploadUrl' => $uploadurl,
    'WikiTitle' => $WikiTitle,
    'BaseTime' => $Now,
    'UploadMaxSize' => $UploadMaxSize,
    'UploadExts' => array_keys($UploadExts),
    'XL' => $codes,
    'canupload' => $canupload,
  );
  
  $forms = ListPages('Forms.*,-*.Forms,-*.GroupFooter,-*.GroupHeader,-*.GroupAttributes,-*.RecentChanges,-*.PageNotFound,-*.Documentation*');
  sort($forms);
  $vars['Forms'] = preg_replace('/Forms\\./', '', implode(',', $forms));
  $vars['NsMessage'] = XL("Content was modified, but not saved!");
  
  $InputValues['allegrovars'] = PHSC(AllegroJE($vars), ENT_QUOTES);
  
  if(@$AllegroData[$g]['=subpages'][$n]) {
    $sp = preg_grep('/^Template/', $AllegroData[$g]['=subpages'][$n], PREG_GREP_INVERT);
    $sporder = implode(" ", $sp);
    $InputValues['ptv_SPOrder'] = $sporder;
  }

  DisableSkinParts($Allegro['DisableSkinParts']);
  
  $print = array($PageStartFmt,
    '<div class="allegroedit" data-fullname="{$FullName}">
    <div id="wikitext">',
    "markup:(:messages:)\n(:if auth admin:)%rfloat%[[{*\$Name}?action=edit|edit code]]%%(:ifend:)",
    "page:Site.AllegroEditForm", '</div></div>', $PageEndFmt);
  PrintFmt($pagename, $print);
  exit;
}

function AllegroNextPageName($pagename) {
  list($g, $n) = explode('.', $pagename);
  $data = AllegroData($g);
  return $data['=nextpagename'];
}

function AllegroJE($x, $fname = null) {
  global $Allegro;
  $out = json_encode($x, JSON_INVALID_UTF8_IGNORE | JSON_PRETTY_PRINT 
    | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES, 4096); 
  if($fname) {
    Lock(2);
      mkdirp(dirname($fname));
      file_put_contents($fname, $out);
      fixperms($fname);
    Lock(0);
  }
  return $out;
}

function AllegroJD($x, $fname = null) {
  if($fname && file_exists($fname)) {
    Lock(1);
      $x = file_get_contents($fname);
    Lock(0);
  }
  return @json_decode($x, true, 512, JSON_INVALID_UTF8_IGNORE); 
}

function AllegroSanitizeVar($value) { 
  $ra = array(
    "/\r/" => '',
    '/\\(:/' => '( :',
    '/:\\)/' => ': )',
    '/\\$:/' => '$ :',
  );
  return PPRA($ra, $value);
}

function uncomment($txt='') {
  return str_replace(
    [ '[=', '=]',   '[@', '@]',   '(:', ':)'], 
    ['[ =', '= ]', '[ @', '@ ]', '( :', ': )'], 
    $txt);
}

function figure2wiki($m){
  global $pagename;
  list($g, $n) = explode('.', $pagename);
  
  $m[1] = preg_replace('!\\s+!', ' ', $m[1]);
  $args = ParseArgs($m[1], '(?>(\\w[-\\w]*)[=])');
  
  $content = $m[2];
  unset($args['#'], $args['']);
  foreach($args as $k=>&$v) {
    $v = htmlspecialchars_decode($v);
    if(substr($v, 0, 2)=='{"') $v = AllegroJD($v);
  }
  $a = $args['data-trix-attachment'];
  $b = @$args['data-trix-attributes'];
  if(!$b) $b = [];
  
  if($a['contentType'] == 'allegro/form') {
    $c = trim($a['content']);
    $out =  "[[%{$c}]] ";
    return $out;
  }
  
  $a['width'] = round(floatval(@$a['width']));
  $a['height'] = round(floatval(@$a['height']));
  
  $size = ($a['width'] && $a['height'])? "{$a['width']}x{$a['height']}" : '';
  
  if(@$a['filename']) {
    if(preg_match('/^(youtube|vimeo)--(.+?)\\.jpg$/', $a['filename'], $yt)) {
      $caption = @$b['caption']? "|{$b['caption']}" : "";
      $imap = ucfirst($yt[1]);
      return "[[$imap$size:{$yt[2]}$caption]] ";
    }
    if(preg_match('/^(.+?\\.mp4)\\.jpg(\\?r=\\d+)?$/', $a['filename'], $vid)) {
      $caption = @$b['caption']? "|{$b['caption']}" : "";
      $imap = 'Video';
      return "[[$imap$size:{$vid[1]}$caption]] ";
    }
    if(preg_match('/^math--(.+?)\\.svg$/', $a['filename'], $mm)) {
      $input = uncomment(@$a['input']);
      $caption = uncomment(@$b['caption']);
      if($caption>'') $caption = "|$caption";
      return "[[Math$size:{$mm[1]}\"[=$input=]\"$caption]] ";
    }
  }
  
  $url = isset($a['url'])? $a['url'] : @$a['href'];
  
  if(preg_match('!/uploads/([-\w]+)/(.*)$!', $url, $mm)) {
    if(!@$b['caption'] && @$a['filename'] && $a['filename'] != $mm[2]) {
      $b['caption'] = $a['filename']; # attachment caption
    }
    $c = @$b['caption']? uncomment("|{$b['caption']}") : '';
    $i = '';
  
    if(@$a['input'] && substr($mm[2], 0, 6)=='math--') { # Formula
      $i = uncomment($a['input']);
    }
    elseif(@$a['href'] && @$a['url'] && $a['href'] != $a['url']) { # image + custom link
      $i = $a['href'];
    }
    
    $prefix = ($g==$mm[1]) ? '' : "{$mm[1]}./";
    
    if($i) {
      $i = "\"[=$i=]\"";
    }
    $out = "[[Attach$size:$prefix{$mm[2]}$i$c]] ";
    return $out;
  }
  if($a['contentType'] == 'allegro/ref') {
    $add = trim(@$a['text']);
    $c = ($add) ? uncomment("|$add") : '';
    $id = @$a['bibId'] ? $a['bibId']: '-';
    $out =  "[[^$id$c]] ";
    return $out;
  }
  
  $args['--content--'] = $content;
  return "[[??FIGURE??]]";
}

function link2wiki($m) {
  global $pagename, $ScriptUrl;
  list($g, $n) = explode('.', $pagename);
  
  $attrs = ParseArgs($m[1]);
  $href = trim($attrs['href']);
  if(preg_match('/^javascript:/i', $href)) return '';
  
  $content = ltrim($m[2]);
  if($content != $href) $content2 = " | $content";
  else $content2 = '';
  
  if(strpos($href, $ScriptUrl)===0) {
    $href = substr($href, strlen($ScriptUrl));
  }
  
  if(preg_match('!^/(.+?)/([^/]+)$!', $href, $mm)) {
    if($g == $mm[1]) $href = $mm[2];
    else $href = $mm[1] . '/' .$mm[2];
    $href = preg_replace('!^Profiles/!', '~', $href);
  }
  $tag = false;
  if(preg_match('!^Tag:(.*)!', $href, $mm)) {
    $tag = trim(html_entity_decode($mm[1]));
    if($tag == $content) {
      $out = "[[!$tag]]";
    }
    else $out = "[[!$tag|$content]]";
  }
  else {
    $out = "[[$href$content2]]";
  }
  return $out;
}

function allegro2wiki($in=false) {
  global  $UrlScheme, $Allegro;  
  $out = $in;
  
  $out = strip_tags($out, '<a><sub><sup><em><strong><img><span> <br>'
    . '<div><h2><h3><li><ul><ol><blockquote><aside><figure><figcaption>');
  
  $out = preg_replace('!</(sup|sub|em|strong)>((?:\\s|&nbsp;)*)<\\1>!si', '$2', $out);
  $out = preg_replace('!<(sup|sub|em|strong)>((?:\\s|&nbsp;)*)</\\1>!si', '$2', $out);
  
  $out = preg_replace('!((?: |&nbsp;)+)(</(?:div|h2|h3|li|blockquote|aside)>)!s', ' $2', $out);
  
  $out = preg_replace('!<figcaption([^>]*)>\\s*</figcaption>!s', '', $out);
  
  $out = preg_replace('!</(strong|em)>(<a\\s.*?>|</a>)<\\1>!s', '$2', $out);

  # figure attributes may contain <>
  $out = PRCB('!<figure((?:\\s+[-\\w]+=".*?")+)>(.*?)</figure>!si', 
    'figure2wiki', $out); # before <div>
  
  $out = preg_replace('!<div\\s[^>]*attachment-gallery--(\\d).*?>(.*?)</div>!si', 
    "\n<gallery>$1$2</gallery>", $out);
  
  $out = PRCB('!<a\\s(.*?)>(.*?)</a>!s', 'link2wiki', $out);
  
  $out = str_replace(
    array_keys($Allegro['allegro2wiki']),
    array_values($Allegro['allegro2wiki']), 
    $out);
  
  $out = preg_replace('/(`[-<>!?#*~])/', "\n$1", $out);
  $out = preg_replace('/`\\\\/', "$0\n", $out);
  
  $out = preg_replace('!</?span(.*?)>!s', '', $out);
  
  return $out;
}

function wikifigure2html($a) {
  $b = [];
  $img = $caption = $content = $ext = $ecaption = '';
  if(@$a['filename'])
    $ext = preg_replace('!^.*\\.!', '', $a['filename']);
    
  if(@$a['content']) {
    $b['frozen'] = true;
    $cname = 'content';
    $content = $a['content'];
  }
  elseif(@$a['width'] && @$a['height']) { # picture
    $b['presentation'] = 'gallery';
    if(@$a['caption']) {
      $b['caption'] = $a['caption'];
      $ecaption = ' attachment__caption--edited';
    }
    $cname = "preview attachment-preview--$ext";
    $img = "<img src=\"{$a['url']}\" width=\"{$a['width']}\" height=\"{$a['height']}\">";
    if(preg_match('/\\.mp4\\.jpg$/i', $a['url']))
      $a['href'] = substr($a['url'], 0, -4);
  }
  elseif(@$a['filename']) { # other attachment, office, pdf
    $cname = "file attachment-file--$ext";
    if(!@$a['caption']) $a['caption'] = $a['filename'];
  }
  if(@$a['caption']) {
    $ec = PHSC($a['caption']);
    $caption = "<figcaption class=\"attachment__caption$ecaption\">{$ec}</figcaption>";
  }
  if($img || $caption) {
    $content = "$img$caption";
  }
  if(@$a['href']) $content = "<a href=\"{$a['href']}\">$content</a>";
  
  $attr = "data-trix-attachment=\"".PHSC(AllegroJE($a), ENT_QUOTES)."\"";
  if(count($b)) $attr .= " data-trix-attributes=\"".PHSC(AllegroJE($b), ENT_QUOTES)."\"";
  $attr .= " data-trix-content-type=\"{$a['contentType']}\"";
  $attr .= " class=\"attachment attachment--$cname\"";
  
  $html = "<figure $attr>$content</figure> ";
  if($cname=='content') $html = "<span style=\"background-color: inherit;\">$html</span> ";
  return $html;
}

function wikiattach2html($m, $pagename) {
  global $Allegro, $UploadExts, $FmtV;
  @list($markup, $imap, $w, $h, $fname, $input, $caption) = $m;

  if(@$input) {
    $input = MarkupRestore($input);
    $input = preg_replace('/^\\[=|=\\]$/', '', $input);
  }
  $rand = '';
  if(preg_match('!\\?r=\\d+$!', $fname, $r)) {
    $fname = preg_replace('!\\?r=\\d+$!', '', $fname);
    $rand = $r[0];
  }
  
  $a = $b = [];
  if($imap == 'Math') {
    $a['filename'] = 
    $fname = "math--$fname.svg";
    $a['input'] = $input;
    $url = DownloadUrl($pagename, $fname);
    $a['contentType'] = "allegro/math";
    $a['content'] = "<img src=\"$url\" />";
    return wikifigure2html($a);
  }
  elseif($imap == 'Youtube') {
    $a['href'] = "https://youtu.be/$fname";
    $a['filename'] = "youtube--$fname.jpg";
  }
  elseif($imap == 'Vimeo') {
    $path = preg_replace('/^(\\d+)__([a-d0-9]+)/', '$1/$2', $fname);
    $a['href'] = "https://vimeo.com/$path";
    $a['filename'] = "vimeo--$fname.jpg";
  }
  else $a['filename'] = $fname;
  
  $url = DownloadUrl($pagename, $a['filename']);
  if(preg_match('/\\.mp4\\.jpg$/', $fname)) {
    $url = $FmtV['$LinkDownload'] . $rand;
    $a['href'] = substr($FmtV['$LinkDownload'], 0, -4);
  }
  $ext = '';
  if($imap == 'Video') {
    $a['href'] = $url;
    $url .= '.jpg';
    $ext = 'jpg';
  }
  
  if(!isset($a['href'])) $a['href'] = $url;
  
  if(!$ext) $ext = preg_replace('/^.*\\./', '', $a['filename']);
  $a['contentType'] = $UploadExts[$ext];
    
  if($w || $h) { # attached file, download link
    $a['width'] = intval($w);
    $a['height'] = intval($h);
    $a['url'] = $url;
  }
  if(@$caption) {
    $a['caption'] = $caption;
  }
  return wikifigure2html($a);
}

function wikitag2html($m) {
  $m = array_map('trim', $m);
  $prefix = $m[1];
  $tag = $m[2];
  
  
  if($prefix=='~') {
    if(@$m[3]) $tag .= "|" .$m[3];
    if(!PageExists("Profiles.{$m[2]}")) return $tag;
    return "[[Profiles/$tag]]";
  }
  if($prefix=='%') {
    $a = [
      'contentType' => 'allegro/form',
      'content' => $tag,
    ];
    return wikifigure2html($a);
  }
  
  $text = ltrim($m[3]?? $tag);
  $rtag = PHSC($tag);
  return "<a href=\"Tag:$rtag\">$text</a>";
}


function wikiref2html($m) {
  global $Allegro;
  $id = $m[1];
  $more = strval(@$m[2]);
  $emore = nl2br(PHSC($more));
  $a = [];
  if($more) $a['text'] = $more;
  $ref = mkRefFromId($id);
  if($id == '-' || !$ref) {
    $a['bibId'] = '';
    $ref = $emore;
  }
  else {
    $a['bibId'] = $id;
    if($more) $ref .= ", $emore";
  }
  $a['content'] = "<div>$ref</div>";
  $a['contentType'] = 'allegro/ref';
  
  $out = wikifigure2html($a);
  return $out;
}

function wikilink2html($m, $pagename) {
  
  return MakeLink($pagename,$m[1],@$m[2]);
}

function wiki2html($pagename, $in, $edit=false) {
  global $Allegro;
  $out = $in;
  
  $out = preg_replace_callback("/`[<>]|[<>]´/s", "Keep", $out);
  $out = strip_tags($out);
  $out = MarkupRestore($out);
  $out = PRCB(
    '!\\[\\[(Attach|Youtube|Vimeo|Math|Video)(?:(\\d+)x(\\d+))?:(.*?)(?:"(.*?)")?(?:\\|(.*?))?\\]\\]!s',
    'wikiattach2html', $out, $pagename);
    
  $out = PRCB('/\\[\\[(!|%|~)(.*?)(?:\\|(.*?))?\\]\\]/s', 'wikitag2html', $out);
  
  $out = PRCB('!\\[\\[\\^(-|\\d+)(?:\\|(.*?))?\\]\\]!s', 'wikiref2html', $out);
      
  $out = PRCB("/\\[\\[(.*?)\\s*(?:\\|\\s*(.*?))?\\s*\\]\\]/", 'wikilink2html', $out, $pagename);

  $out = str_replace(
    array_values($Allegro['allegro2wiki2']), 
    array_keys($Allegro['allegro2wiki2']),
    $out);
    
  if(!$edit) {    
    $out = PRCB('/@\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12]\\d|3[01])'
      .'T([01]\\d|2[0-3]):([0-5]\\d)(:([0-5]\\d))?Z?/i', 'FmtDateTimeZ', $out);
    $out = preg_replace('!<(h[23])>\\s*#([-a-z0-9]+)!i', '<$1 id="$2">', $out);
  }
  $out = preg_replace('!<gallery>(\\d)(.*)</gallery>!s', 
    '<div class="attachment-gallery attachment-gallery--$1">$2</div>', $out);
  $out = preg_replace('!\\s*(</?(?:ul|ol|div|br|aside|h\\d|blockquote)>)\\s*!', '$1', $out);
  
  return $out;
}



$EditFunctions[] = 'AllegroFormSaveTranslations';
function AllegroFormSaveTranslations($pagename, $page, $new) {
  global $IsPagePosted, $action, $Allegro;
  if(!$IsPagePosted || $action != 'pmform') return;
  
  list($g, $n) = explode('.', $pagename);
  if($g != 'Forms') return;
  
  $formstrings = trim(PageTextVar($pagename, 'Strings'));
  
  $transfname = $Allegro['DataDir']. '/formstrings.json';
  $allstrings = aform_jfile($transfname);
  
  if(@$allstrings[$n] == $formstrings) return;
  
  $allstrings[$n] = $formstrings;
  aform_jfile($transfname, $allstrings);
}

$HandleActions['libcalc'] = 'HandleLibCalc';
function HandleLibCalc($pagename, $auth='read') {
  global $Allegro;
  
  header('Content-Type: application/javascript; charset=UTF-8');
  
  list($g, $n) = explode('.', $pagename);
  $glen = strlen($g);
  
  $listglob = isset($_GET['list'])? $_GET['list'] : $pagename;
  
  $listglob = FixGlob($listglob, '$1Forms.$2');
  
  $list = ListPages($listglob);
  
  $inputrx = [
    '/^#.*$/m' => '',
    "/\n{2,}/" => "\n",
    "/\n /" => " ",
    "/\n+$/" => "",
  ];
  
  $vars = explode(' ', 'Layout Fields Event Logic Precision');
  
  $out = "var afConfig = afConfig || {};\n";
  foreach($list as $pn) {
    $nn = substr($pn, 6); # NOTE: "Form."=6
    $nn = preg_replace('/[^\\w]+/', '', $nn);
    $ar = ['id' => $nn];
    
    foreach($vars as $key) {
      $v = PageTextVar($pn, $key);
      if(is_numeric($v)) $v = floatval($v);
      $ar[$key] = $v;
    }
    
    $json = aform_je($ar);
    $out .= "afConfig['$nn'] = $json;\n\n";
  }
  
  echo $out;
  exit;
}

function aform_je($x) {
  return json_encode($x, JSON_INVALID_UTF8_IGNORE | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES, 4096);
}


function aform_jfile($fname, $data = false) {
  global $AuthId, $Now;
  $id = $AuthId ? $AuthId : '_anon';
  if(is_array($data)) {
    $json = aform_je($data);
    $fnamenew = "$fname,$id";
    Lock(2);
    file_put_contents($fnamenew, $json);
    
    $cmd = "diff -u \"$fname\" \"$fnamenew\" | gzip >> \"$fname.diff.gz\"";
    exec($cmd, $output, $result);
    rename($fnamenew, $fname);
    Lock(0);
  }
  else {
    if(! file_exists($fname)) return [];
    return json_decode(file_get_contents($fname), true);
  }
}



function mkRefFromId($n) {
  static $allstrings;
  if(!@$allstrings) {
    global $Allegro;
    $bibfname = $Allegro['DataDir']. '/biblio.json';
    $allstrings = aform_jfile($bibfname);
  }
  $a = @$allstrings[$n];
  return $a? mkReference($a) : '';
}

$MarkupDirectiveFunctions['listref'] = 'FmtListRef';
function FmtListRef($pagename, $directive, $args, $content = null) {
  global $Allegro;
  
  $bibfname = $Allegro['DataDir']. '/biblio.json';
  $allstrings = aform_jfile($bibfname);
  
  $matches = MatchNames(array_keys($allstrings), $args['name']);
  
  $items = [];
  if(@$args['radio']) {
    $notlisted = XL('Not listed');
    $addnew = XL('Add new');
    $url = PageVar('Bibliography.Bibliography', '$PageUrl');
    
    $items[] = "<li><input name='bib_radio' id='bib_disabled' type='radio' value='' checked>"
      ."<label for='bib_disabled'>Not applicable (or <a target='_blank' href='$url'>$addnew</a>)"
      ."</label></li>";
  }
  
  foreach($matches as $key) {
    $a = $allstrings[$key];
    $item = mkReference($a);
    
    $sortkey = strip_tags($item);
    
    if(@$args['radio']) $item = "<input name='bib_radio' id='bib_$key' type='radio' value='$key'><label for='bib_$key'>$item</label>";
    
    if(@$args['link']) {
      $pn = "Bibliography.$key";
      $url = PageVar($pn, '$PageUrl');
      $item = "<a class='wikilink' href='$url'>✍️</a> $item";
    }
    
    $items["$sortkey-$key"] = "<li>$item</li>";
  }
  ksort($items);
  
  $list = "<ul class='filterable bibliolist'>".implode('', $items)."</ul>";
  return KeepBlock($list);
}

function mkReference($a) {
  $parts = [];
  extract($a);
  if(@$Authors) $parts[] = PHSC($Authors);
  if(@$Title) {
    $t = PHSC($Title);
    if(@$URL) $t = "<a target='_blank' rel='noreferrer noopener nofollow' href='$URL'>$t</a>";
    $parts[] = "\"$t\"";
  }
  
  if(@$IssueTitle) {
    $parts[] = "<em>". PHSC($IssueTitle) . "</em>";
  }
  
  if(@$Publisher) $parts[] = PHSC($Publisher);
  if(@$Location) $parts[] = PHSC($Location);
  
  if(@$DatePub) $parts[] = PSFT('%d/%m/%Y', strtotime($DatePub));
  elseif(@$YearPub) $parts[] = PSFT($YearPub);
  
  if(@$DateVisited) {
    $dv = PSFT(' %d/%m/%Y', strtotime($DateVisited));
    $parts[] = XL('Retrieved') . $dv;
  }
  
  $links = [
    'ISBN' => 'https://www.worldcat.org/search?q=isbn%3A$1',
    'ISSN'=>'https://www.worldcat.org/search?fq=x0:jrnl&q=n2:$1',
    'OCLC'=>'https://www.worldcat.org/search?q=no%3A$1',
    'DOI'=>'https://doi.org/$1',
    'LCCN' => 'https://lccn.loc.gov/$1',
    'Bibcode'=> 'https://ui.adsabs.harvard.edu/abs/$1',
  ];

  foreach($links as $key=>$urlfmt) {
    if(!@$a[$key]) continue;
    $url = PHSC(str_replace('$1', $a[$key], $urlfmt));
    $id =  PHSC($a[$key]);
    
    $parts[] = "$key:<a target='_blank' href='$url'>$id</a>";
  }
  
  return implode(', ', $parts);
}

function HandleAllegroWatermark($pagename) {
  $wm = trim(strval(@$_REQUEST['wm']));
  if(!$wm) $wm = "DRAFT";
  $length = mb_strwidth($wm, 'UTF-8');
  $bsize = 60;
  $fss = max(0, $bsize-300/$length);
  
  $wm = PHSC($wm, ENT_QUOTES);
  
  $fs = intval(@$_REQUEST['fs']);
  
  if(! $fs) $fs = min($bsize, $bsize - round(sqrt($fss)));
  
  $out = <<<EOF
<svg xmlns="http://www.w3.org/2000/svg" height="360" width="360">
  <text xmlns="http://www.w3.org/2000/svg" fill="rgba(128,128,128,.3)" text-anchor="middle" font-family="Arial, Helvetica, sans" 
   font-weight="bold" font-size="{$fs}px" transform="rotate(-45 180 180)" x="50%" y="50%">$wm</text>
</svg>
EOF;
  header("Content-type: image/svg+xml");
  print $out;
  exit;
}

function HandleAllegroNamespace($pagename, $auth = 'admin') {
  global $MessagesFmt;
  $page = RetrieveAuthPage($pagename, $auth, true, READPAGE_CURRENT);
  if(!$page) return Abort('?No permissions.');
  
  $title = AllegroSanitizeVar($_REQUEST['groupname']);
  
  $group = preg_replace('/[^a-zA-Z0-9]+/', '', ucwords($title));
  
  if(!$group) {
    $MessagesFmt[] = '<div style="color:red;">$[Bad name]</div>';
    return HandleBrowse($pagename);
  }
  
  $parent = preg_replace('/[^-a-zA-Z0-9]+/', '', $_REQUEST['parentNS']);
  
  $pn = MakePageName($pagename, "$parent$group.$parent$group");
  
  list($g, $n) = explode('.', $pn);
  $usergroup_base = str_replace('-', '_', $g);
  $parent_base = $parent? preg_replace('/-$/', '', $parent) : '';
  
  
  $page = $new = ReadPage($pn);
  if(isset($page['text'])) return Redirect($pn);
  
  $an = "$g.GroupAttributes";
  
  $attpage = $anew = ReadPage($an);
  
  $content = RetrieveAuthSection('Site.LocalTemplates', '#NamespaceHomeContent');
  
  
  $new['text'] = ltrim(str_replace('$Title', $title, $content));
  
  $new['passwdedit'] = "@attr$usergroup_base";
  if($parent) $new['passwdedit'] .= " @attr$parent_base";
  
  $anew['passwdattr'] = $new['passwdupload'] = $new['passwdedit'];
  $anew['passwdedit'] = $anew['passwdupload'] = "id:* @$usergroup_base";
  
  UpdatePage($an, $attpage, $anew);
  UpdatePage($pn, $page, $new);
  
  Redirect($pn);
}


function HandleAllegroReview($pagename, $auth = 'attr') {
  

}

function HandleAllegroDelete($pagename, $auth = 'attr') {
  global $IsPagePosted, $EnableRedirect, $WikiDir, $AllegroData, $ChangeSummary;
  $page = RetrieveAuthPage($pagename, $auth, true, READPAGE_CURRENT);
  if(!$page) return Abort('?No permissions');
  if(!@$_POST['confirm'] || !@$_POST['csum']) 
    return Abort('?Invalid request');
  if(AllegroCondSubpages($pagename))
    return Abort('?Cannot delete page with subpages');
  
  list($g, $n) = explode('.', $pagename);
  AllegroData($g);
  
  $parent = MakePageName($pagename, "$g." . strval(@$AllegroData[$g][$n]['parent']));
  $WikiDir->delete($pagename);
  unset($AllegroData[$g][$n]);
  AllegroData($g, true);
  $IsPagePosted = true;
  $ChangeSummary = XL('Delete') . " \"{$page['title']}\" ($ChangeSummary)";
  PostRecentChanges($pagename,$page,$page);
  return Redirect($parent);
}

$DiffRestoreFmt = "\$SubpagesReordered
<div class='diffrestore'>
  <a href='{\$PageUrl}?action=aedit&amp;restore=\$DiffId' title=\"$[Restore in visual editor]\">$[Restore]</a>
  <a class='restorecode' href='{\$PageUrl}?action=edit&amp;restore=\$DiffId&amp;preview=y' title=\"$[Restore in code editor]\">$[Restore code]</a>
  </div>";

$PageDiffFmt = array(
  "wiki:Site.DeletePageForm",
  "<h2 class='wikiaction'>$[{\$FullName} History]</h2>",
);
$DiffRenderSourceFunction = 'AllegroDiffRenderSource';
$DiffPrepareInlineFunction = 'AllegroDiffPrepare';
$FmtV['$SubpagesReordered'] = '';
function AllegroDiffRenderSource($in, $out, $which) {
  global $pagename, $FmtV;
  $FmtV['$SubpagesReordered'] = '';
  static $g, $data;
  if(is_null($data)) {
    list($g, $n) = explode('.', $pagename);
    $data = AllegroData($g);
  }
  
  $rarr = [
    '!(`[<>\\\\~]|[<>*#\\!?~]´)!' => '',
    '!(`=\\d|=´)!' => '',
    '!(`\\.)!' => ' ',
    '!`-!' => '-',
    '!`\\*!' => '-',
    '!`#!' => '-',
    '!`\\!!' => '[H1]',
    '!`\\?!' => '[H2]',
  ];
  $iin = implode("\n", $in);
  $iout = implode("\n", $out);
  $in = PPRA($rarr, $in);
  $out = PPRA($rarr, $out);
  
  $rendered = DiffRenderSource($in, $out, $which);
  
  $r2 = [
    '!`\\+!' => '<strong>',
    '!\\+´!' => '</strong>',
    '!`/!' => '<em>',
    '!/´!' => '</em>',
    '!`\\^!' => '<sup>',
    '!\\^´!' => '</sup>',
    '!`_!' => '<sub>',
    '!_´!' => '</sub>',
    '!<(ins|del)>(<(strong|em|sup|sub)>)</\\1>(.*?)<\\1>(</\\3></\\1>)!' => '<$1>$2$4$5',
    '!<(ins|del)>(</?(strong|em|sup|sub)>)</\\1>!' => '$2',
//     '!!' => '',
  ];
  $rendered = PPRA($r2, $rendered);
  
  if($which) {
    $mo = $mi = $label = false;
    preg_match('/\\(:SPOrder:(.*?):\\)/', $iout, $mo);
    preg_match('/\\(:SPOrder:(.*?):\\)/', $iin, $mi);
    if($mo) {
      if(!$mi || $mo[1] != $mi[1]) {
        $subpages = explode(' ', $mo[1]);
        $label = '$[Subpages reordered]';
      }
    }
    elseif($mi) {
      $subpages = [];
      $label = '$[&gt; Restored alphabetical order of subpages]';
    }
    if($label) {
      $x = FmtAllegroLst($g, $subpages, $data, ['evenempty'=>1], 'allegro-subpages', $label);
      $FmtV['$SubpagesReordered'] = MarkupToHTML($pagename, $x);
    }
    
  }
  
  return $rendered;
}

function AllegroDiffPrepare($x) {
  return preg_split("/(`[+\\/^_]|[+\\/^_]´|[-@!?#$%^&*()=+\\[\\]{}.'\"\\\\:|,<>_\\/;~\\s])/", 
    $x, -1, PREG_SPLIT_DELIM_CAPTURE);
}

$MarkupDirectiveFunctions['aform'] = 'FmtAllegroForm';
function FmtAllegroForm($pagename, $directive, $args, $content = null) {
  global $HTMLHeaderFmt, $AllegroEmbeddedForms;

  $id = $args['id'];
  if(!isset($AllegroEmbeddedForms)) $AllegroEmbeddedForms = [];
  $AllegroEmbeddedForms[$id] = 1;
  
  
  $list = implode(',', array_keys($AllegroEmbeddedForms));
  AllegroLoadFormsHeader($pagename, $list);
  
  return KeepBlock("<div class='libcalcformPreview'>$id</div>");
}

function HandleAllegroUploadMath($pagename, $auth) {
  global $UploadFileFmt, $FmtV, $Now;
  pm_session_start();
  $page = AllegroRetrieveNewPage($pagename, $auth, true, READPAGE_CURRENT);
  header("Content-Type: application/json");
  if(!$page) {
    echo AllegroJE(array('failure'=>'No permissions'));
    exit;
  }
  $randstamp = base_convert($Now, 10, 36) . base_convert(mt_rand(36,1295), 10, 36);
  $randstamp = preg_replace('/(p|c)(hp|l|gi)/', '$1x$2', $randstamp);
  $upname = "math--$randstamp.svg";
  $filepath = FmtPageName("$UploadFileFmt/$upname", $pagename);
  $svg = trim(strval(@$_POST['svg']));
  
  if(preg_match('!^<svg .*?</svg>$!s', $svg)) {
    file_put_contents($filepath, $svg);
    clearstatcache();
    $url = DownloadUrl($pagename, $upname);
    echo AllegroJE(array('url'=>$url, 'upname'=>$upname));
  }
  else {
    echo AllegroJE(array('failure'=>"Error"));
  }
  exit;
}

function HandleAllegroVideoCover($pagename, $auth) {
  global $Allegro, $UploadFileFmt;
  $img = strval(@$_REQUEST['upname']);
  if(!preg_match('!^(youtube|ted|vimeo)--([-a-zA-Z0-9_]+)\\.jpg$!', $img, $m)) {
    header("Location: {$Allegro['PubDirUrl']}/video-bg.webp");
    exit;
  }
  pm_session_start();
  $page = AllegroRetrieveNewPage($pagename, $auth, true, READPAGE_CURRENT);
  if(!$page) {
    header("Location: {$Allegro['PubDirUrl']}/video-bg.webp");
    exit;
  }
  
  list(, $provider, $vid) = $m;
  
  $vid2 = str_replace('__', '/', $vid);

  $oembedUrls = [
    'youtube' => "https://www.youtube.com/oembed?url=https://youtu.be/$vid",
    'ted' => "https://www.ted.com/services/v1/oembed.json?url=https://www.ted.com/talks/$vid",
    'vimeo' => "https://vimeo.com/api/oembed.json?url=https://vimeo.com/$vid2",
  ];
  
  $ourl = $oembedUrls[$provider];
  
  $upname = MakeUploadName($pagename, $img);
  $path = FmtPageName("$UploadFileFmt/$upname", $pagename);
  
  $get = file_get_contents($ourl);
  $json = @json_decode($get, true);
  $url = @$json['thumbnail_url'];
  if(!$url) {
    return AlegroVideoCoverReject();
  }
  if(file_exists($path)) {
    return AlegroVideoCoverReject("File exists, not re-downloading.");
  }
  
  # ted
  $url = preg_replace('/.(webp|jpg)\\?.*$/', '.$1?w=480', $url);
  # vimeo
  $url = preg_replace('/_\\d+x\\d+\\.(webp|jpg)$/', '.$1?mw=480', $url);

  $w = intval(@$json['width']);
  $h = intval(@$json['height']);
  
  $pic = file_get_contents($url);
  if(!$pic) AlegroVideoCoverReject("Could not get url=$url");
  $im = imagecreatefromstring($pic);
  if($im == false) { return AlegroVideoCoverReject(); }
  
  if($w && $h) {
    $sx = $nw = imagesx($im);
    $sy = $nh = imagesy($im);
    
    $ratio = $w/$h;
    
    if($sx/$sy < $ratio) {
      $nh = round($sx/$ratio);
    }
    elseif($sx/$sy > $ratio) {
      $nw = round($sy*$ratio);
    }
    $rect = ['x' => round(($sx-$nw)/2), 'y' => round(($sy-$nh)/2), 'width' => $nw, 'height' => $nh];
    $im2 = imagecrop($im, $rect);
    if($im2!==false) {
      imagedestroy($im);
      $im = $im2;
    }
  }
  $dir = dirname($path);
  if(! is_dir($dir)) @mkdir($dir);
  
  imagejpeg($im, $path);
  imagedestroy($im);
  
  clearstatcache();
  if(! file_exists($path)) 
    AlegroVideoCoverReject("Apparently pic saved but not exist. path='$path' dir='".dirname($path)."'\n" );

  header('Content-Type: image/jpeg');
  readfile($path);
}

function AlegroVideoCoverReject($msg=false) {
  global $Allegro;
  if($msg) {
    header('Content-Type: text/plain; charset=utf-8');
    echo $msg;
  }
  else {
    $url = "{$Allegro['PubDirUrl']}/video-bg.webp";
    header("Location: $url");
  }
  exit;
}

