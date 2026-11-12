/* Kể bên người — trang nghe audio kèm script.
   Dữ liệu các đoạn nằm trong tracks.json (xem README.md). */

/* true: đoạn chưa có file âm thanh (src: null) sẽ phát một tiếng nền thử để kiểm tra giao diện.
   Đặt false khi chạy thật: đoạn chưa có file sẽ mờ đi và không bấm được. */
var DEMO_TONE=true;

fetch('tracks.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
.then(function(d){bysStart(d.tracks)})
.catch(function(e){var r=document.getElementById('rows');if(r)r.innerHTML='<div class="empty">> không tải được tracks.json. Hãy mở trang qua máy chủ (không mở trực tiếp file).</div>';console.error(e)});

function bysStart(TR){
var $=function(s){return document.querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var NOISE='#%@*+=-:.01/\\';

var UI={
 vi:{title:'Kể bên người',search:'> tìm đoạn...',searchAl:'Tìm đoạn',empty:'> không có đoạn nào khớp.',prev:'Đoạn trước',play:'Phát / dừng',next:'Đoạn sau',scriptAl:'Xem toàn bộ script',script:'Script',listAl:'Về danh sách',list:'Danh sách',randAl:'Phát ngẫu nhiên đoạn khác',rand:'Phát ngẫu nhiên',scriptBox:'Script'},
 en:{title:'By your side',search:'> search tracks...',searchAl:'Search tracks',empty:'> no matching track.',prev:'Previous track',play:'Play / pause',next:'Next track',scriptAl:'Show full script',script:'Script',listAl:'Back to track list',list:'Track list',randAl:'Play a random track',rand:'Shuffle',scriptBox:'Script'}
};
function lang(){return (document.documentElement.lang||'vi').slice(0,2)}
function U(k){var d=UI[lang()]||UI.vi;return d[k]!==undefined?d[k]:UI.vi[k]}
/* nội dung đoạn có thể là chuỗi/mảng, hoặc {vi:..., en:...} */
function T(v){if(v==null)return '';if(typeof v==='string'||Array.isArray(v))return v;var l=lang();return v[l]||v.vi||v[Object.keys(v)[0]]||''}

/* ===== danh sách ===== */
var played={};try{played=JSON.parse(localStorage.getItem('bys-played')||'{}')}catch(e){}
function fmt(s){s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
var rowsEl=$('#rows'),rowEls=[],bgImg=$('#bgimg'),defaultBg=bgImg?bgImg.src:'';
function applyBgFocus(idx){
  var FOCUS=[
    {desk:'36% 22%',tab:'0% 22%',mob:'3% 22%',shiftTab:'-16vw'},
    {desk:'52% 35%',tab:'50% 34%',mob:'54% 34%',shiftTab:'0px'},
    {desk:'42% 24%',tab:'0% 24%',mob:'14% 24%',shiftTab:'-8vw'},
    {desk:'50% 38%',tab:'32% 38%',mob:'43% 38%',shiftTab:'0px'},
    {desk:'48% 28%',tab:'21% 28%',mob:'35% 26%',shiftTab:'0px'}
  ];
  var def={desk:'68% 28%',tab:'64% 26%',mob:'65% 24%',shiftTab:'0px'};
  var f=idx>=0&&idx<FOCUS.length?FOCUS[idx]:def;
  document.documentElement.style.setProperty('--bg-pos-desk',f.desk);
  document.documentElement.style.setProperty('--bg-pos-tab',f.tab);
  document.documentElement.style.setProperty('--bg-pos-mob',f.mob);
  document.documentElement.style.setProperty('--bg-shift-tab',f.shiftTab);
}
document.documentElement.style.setProperty('--img','url("'+defaultBg+'")');
applyBgFocus(-1);
var THUMBS=[[27,22,100],[55,34,100],[35,24,100],[53,38,100],[48,28,100]];
function buildRows(q,focusTrack){
  rowsEl.innerHTML='';rowEls=[];q=(q||'').toLowerCase();var want=null;
  TR.forEach(function(t,i){
    if(q&&(T(t.name)+' '+T(t.desc)).toLowerCase().indexOf(q)<0&&String(i+1).indexOf(q)<0)return;
    var thUrl=t.thumb||t.bg;
    var b=document.createElement('button'),c=THUMBS[i%THUMBS.length],ts=thUrl?"--bi:url('"+thUrl+"');--bs:cover;--bp:"+c[0]+'% '+c[1]+'%':'--bs:'+c[2]+'%;--bp:'+c[0]+'% '+c[1]+'%';
    b.type='button';b.className='row'+(played[i]?' done':'');
    b.innerHTML='<span class="thw" style="'+ts+'"><span class="th"><i class="c"></i></span></span><span class="tt"><span class="hd"><span class="no">'+String(i+1).padStart(2,'0')+'</span><span class="nm"></span></span></span><span class="du">'+(t.dur>0?fmt(t.dur):'')+'</span>';
    b.querySelector('.nm').textContent=T(t.name);if(!(DEMO_TONE||t.src)){b.disabled=true;b.classList.add('soon')}
    b.addEventListener('click',function(){select(i)});
    rowsEl.appendChild(b);rowEls.push(b);if(i===focusTrack)want=b;
  });
  if(!rowEls.length){var e=document.createElement('div');e.className='empty';e.textContent=U('empty');rowsEl.appendChild(e)}
  rowsEl.scrollTop=want?Math.max(0,want.offsetTop-rowsEl.clientHeight/2+want.offsetHeight/2):0;
}
rowsEl.addEventListener('keydown',function(e){
  if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
  e.preventDefault();var k=Math.max(0,Math.min(rowEls.length-1,rowEls.indexOf(document.activeElement)+(e.key==='ArrowDown'?1:-1)));
  if(rowEls[k])rowEls[k].focus();
});
$('#q').addEventListener('input',function(){buildRows(this.value)});

/* ===== đa ngôn ngữ: đọc <html lang>; khi đổi ngôn ngữ, gọi document.dispatchEvent(new Event('langchange')) ===== */
function nextPlayable(i,d){var n=TR.length,k=0;i=((i%n)+n)%n;while(k++<n&&!DEMO_TONE&&!TR[i].src)i=(i+d+n)%n;return k>n?-1:i}
function applyUI(){
  [].forEach.call(document.querySelectorAll('[data-ui]'),function(e){e.textContent=U(e.dataset.ui)});
  [].forEach.call(document.querySelectorAll('[data-ph]'),function(e){e.placeholder=U(e.dataset.ph)});
  [].forEach.call(document.querySelectorAll('[data-al]'),function(e){e.setAttribute('aria-label',U(e.dataset.al))});
  [].forEach.call(document.querySelectorAll('[data-ti]'),function(e){e.title=U(e.dataset.ti)});
}
document.addEventListener('langchange',function(){applyUI();buildRows($('#q').value,cur);if(cur>=0){$('#ntitle').textContent=T(TR[cur].name);buildScript()}});
applyUI();
buildRows();

/* ===== âm thanh ===== */
var AC,master,an,FD,TD,au=$('#au'),fileEl=false,synth=null,vol=1.0;
function ctx(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=0;an=AC.createAnalyser();an.fftSize=256;an.smoothingTimeConstant=.7;
  FD=new Uint8Array(an.frequencyBinCount);TD=new Uint8Array(an.fftSize);master.connect(an);an.connect(AC.destination)}if(AC.state==='suspended')AC.resume();return AC}
function synthStart(i){
  var c=ctx(),base=[110,98,123.5,87.3][i%4],g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(),o1=c.createOscillator(),o2=c.createOscillator();
  o1.type='sine';o1.frequency.value=base;o2.type='triangle';o2.frequency.value=base*1.5+.6;
  lfo.frequency.value=.11+(i%5)*.012;lg.gain.value=.3;g.gain.value=.5;lfo.connect(lg);lg.connect(g.gain);o1.connect(g);o2.connect(g);g.connect(master);
  var buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=buf.getChannelData(0),lp=0,k;
  for(k=0;k<d.length;k++){lp=lp*.97+(Math.random()*2-1)*.03;d[k]=lp*7}
  var ns=c.createBufferSource(),bp=c.createBiquadFilter(),ng=c.createGain(),l2=c.createOscillator(),l2g=c.createGain();
  ns.buffer=buf;ns.loop=true;bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.6;ng.gain.value=.45;l2.frequency.value=.2;l2g.gain.value=.35;
  l2.connect(l2g);l2g.connect(ng.gain);ns.connect(bp);bp.connect(ng);ng.connect(master);
  var all=[o1,o2,lfo,ns,l2];all.forEach(function(n){n.start()});synth=all;
}
function synthStop(){if(synth){synth.forEach(function(n){try{n.stop()}catch(e){}});synth=null}}
function fade(v,s){if(!AC)return;var t=AC.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(v,t+s)}

/* ===== trạng thái phát ===== */
var cur=-1,playing=false,sT=0,last=0,auto=true;
function curTime(){return fileEl?au.currentTime:sT}
function curDur(){return fileEl&&isFinite(au.duration)&&au.duration>0?au.duration:(TR[cur].dur>0?TR[cur].dur:40)}
var IC={play:'<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'};
var tcurEl=$('#tcur'),tdurEl=$('#tdur'),fillEl=$('#fill'),knobEl=$('#knob'),pulseEl=$('#pulse'),stageEl=$('#stage'),sweepEl=$('#sweep'),ntitleEl=$('#ntitle'),bplayEl=$('#bplay');

function setPlaying(p){
  playing=p;
  bplayEl.innerHTML=p?IC.pause:IC.play;
  if(p){
    last=performance.now();
    if(fileEl){
      au.muted=false;
      au.volume=1.0;
      var pr=au.play();
      if(pr!==undefined)pr.catch(function(e){console.warn('Audio play error:',e)});
    }else{
      fade(vol*.7,.8);
    }
    ensureRaf();
  }else{
    if(fileEl)au.pause();
    fade(0,.3);
  }
}
function select(i){
  if(i<0)i=TR.length-1;if(i>=TR.length)i=0;i=nextPlayable(i,(cur<0||i>=cur)?1:-1);if(i<0)return;
  stopAll();cur=i;fileEl=false;sT=0;lastFormattedSec=-1;lastPercent=-1;
  var tBg=TR[i].bg||TR[i].thumb||defaultBg;if(bgImg&&tBg&&bgImg.src!==tBg)bgImg.src=tBg;if(tBg)document.documentElement.style.setProperty('--img','url("'+tBg+'")');applyBgFocus(i);
  stageEl.classList.add('play');sweepEl.classList.remove('go');void sweepEl.offsetWidth;sweepEl.classList.add('go');
  ntitleEl.textContent=T(TR[i].name);
  buildScript();setBarH();tdurEl.textContent=fmt(curDur());
  if(TR[i].src){
    fileEl=true;
    synthStop();
    au.src=TR[i].src;
    au.muted=false;
    au.volume=1.0;
    attachFile();
  }else{
    fileEl=false;
    au.pause();
    synthStart(i);
  }
  setPlaying(true);
}

function stopAll(){synthStop();if(fileEl){au.pause()}playing=false;fade(0,.2);if(!isScrubbing){cancelAnimationFrame(rafId);isRafRunning=false}}
function back(){stopAll();var lc=cur;cur=-1;if(bgImg&&defaultBg&&bgImg.src!==defaultBg)bgImg.src=defaultBg;if(defaultBg)document.documentElement.style.setProperty('--img','url("'+defaultBg+'")');applyBgFocus(-1);stageEl.classList.remove('play');buildRows($('#q').value,lc)}
function markPlayed(){if(cur>=0&&!played[cur]){played[cur]=1;try{localStorage.setItem('bys-played',JSON.stringify(played))}catch(e){}}}

/* file thật: đặt đường dẫn vào src của từng đoạn trong TR */
function attachFile(){
  if(au){
    au.muted=false;
    au.volume=1.0;
  }
}
au.addEventListener('ended',function(){onEnd()});
au.addEventListener('error',function(){console.warn('Không tải được file âm thanh:',au.src);setPlaying(false)});

function onEnd(){markPlayed();if(auto)select(cur+1);else{setPlaying(false)}}

/* ===== vòng lặp ===== */
var amp=0,rafId=0,isRafRunning=false,lastFormattedSec=-1,lastPercent=-1;

function ensureRaf(){
  if(!isRafRunning){
    isRafRunning=true;
    last=performance.now();
    rafId=requestAnimationFrame(frame);
  }
}

function frame(now){
  if(cur>=0){
    var d=curDur();
    if(playing&&!fileEl){sT+=(now-last)/1000;if(sT>=d){sT=d;onEnd()}}
    last=now;
    if(cur>=0){
      if(!isScrubbing){
        var t=curTime(),dNow=curDur(),sec=Math.floor(t);
        if(sec!==lastFormattedSec){lastFormattedSec=sec;tcurEl.textContent=fmt(t)}
        var p=dNow?Math.min(1,t/dNow):0;
        if(Math.abs(p-lastPercent)>0.0008){
          lastPercent=p;
          var pct=(p*100).toFixed(2)+'%';
          fillEl.style.width=pct;
          knobEl.style.left=pct;
        }
      }
      if(curTime()>8)markPlayed();
      // biên độ
      if(AC&&playing&&!fileEl){an.getByteFrequencyData(FD);an.getByteTimeDomainData(TD);var sum=0,v;for(v=0;v<TD.length;v++){var x=(TD[v]-128)/128;sum+=x*x}amp=Math.min(1,Math.sqrt(sum/TD.length)*5);
        }else if(fileEl&&playing){amp=0.25+0.1*Math.sin(now/500)}else{amp*=.88}
      pulseEl.style.opacity=reduce?0:(.18+amp*.6)*(playing?1:0)
    }
  }
  if(playing||isScrubbing||amp>0.01){
    rafId=requestAnimationFrame(frame);
  }else{
    isRafRunning=false;
  }
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
requestAnimationFrame(frame);

/* ===== script nằm bên trái, không khung ===== */
var sbody=$('#sbody');
function buildScript(){
  sbody.innerHTML='';
  var descText=T(TR[cur].desc);
  if(descText){
    var d=document.createElement('div');
    d.className='desc-lead';
    d.textContent=descText;
    sbody.appendChild(d);
  }
  T(TR[cur].script).forEach(function(t){var p=document.createElement('p');p.textContent=t;sbody.appendChild(p)});
  sbody.scrollTop=0;
}
function setBarH(){$('.ui').style.setProperty('--barh',$('#bar').offsetHeight+'px')}
function showScript(o){$('#stage').classList.toggle('noscript',!o);$('#bscript').classList.toggle('on',o);$('#bscript').setAttribute('aria-pressed',o)}
$('#bscript').addEventListener('click',function(){showScript($('#stage').classList.contains('noscript'))});
addEventListener('resize',setBarH);showScript(true);setBarH();

/* ===== điều khiển ===== */
$('#bplay').innerHTML=IC.play;
$('#bplay').addEventListener('click',function(){if(cur<0)return;if(!playing&&!fileEl&&sT>=curDur())sT=0;setPlaying(!playing)});
$('#bprev').addEventListener('click',function(){if(curTime()>4){seekTo(0)}else select(cur-1)});
$('#bnext').addEventListener('click',function(){select(cur+1)});
$('#back').addEventListener('click',back);
$('#brand').addEventListener('click',function(){var pl=TR.map(function(t,i){return i}).filter(function(i){return i!==cur&&(DEMO_TONE||TR[i].src)});if(pl.length)select(pl[Math.floor(Math.random()*pl.length)])});

var isScrubbing=false,seekEl=$('#seek');
function seekTo(t){
  if(cur<0)return;
  var dur=curDur(),cl=Math.max(0,Math.min(dur,t));
  if(fileEl){
    try{au.currentTime=cl}catch(e){}
    au.muted=false;
    au.volume=1.0;
    if(playing&&au.paused){au.play().catch(function(){})}
  }else{sT=cl}
  var p=dur>0?cl/dur:0,pct=(p*100).toFixed(2)+'%';
  fillEl.style.width=pct;
  knobEl.style.left=pct;
  tcurEl.textContent=fmt(cl);
  lastPercent=p;
  lastFormattedSec=Math.floor(cl);
}

function getTimeFromPointer(e){
  var r=seekEl.getBoundingClientRect();
  if(!r.width)return 0;
  var fr=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  return fr*curDur();
}

function updateScrubVisual(t){
  var dur=curDur(),cl=Math.max(0,Math.min(dur,t)),p=dur>0?cl/dur:0,pct=(p*100).toFixed(2)+'%';
  fillEl.style.width=pct;
  knobEl.style.left=pct;
  tcurEl.textContent=fmt(cl);
  lastPercent=p;
  lastFormattedSec=Math.floor(cl);
}

seekEl.addEventListener('pointerdown',function(e){
  if(cur<0)return;
  isScrubbing=true;
  seekEl.classList.add('scrubbing');
  try{seekEl.setPointerCapture(e.pointerId)}catch(err){}
  var t=getTimeFromPointer(e);
  updateScrubVisual(t);
  seekTo(t);
  ensureRaf();
});

var lastScrubSeek=0;
seekEl.addEventListener('pointermove',function(e){
  if(!isScrubbing)return;
  var t=getTimeFromPointer(e);
  updateScrubVisual(t);
  var now=performance.now();
  if(fileEl){
    if(now-lastScrubSeek>75){
      lastScrubSeek=now;
      try{au.currentTime=t}catch(err){}
    }
  }else{sT=t}
});

function endScrub(e){
  if(!isScrubbing)return;
  isScrubbing=false;
  seekEl.classList.remove('scrubbing');
  try{seekEl.releasePointerCapture(e.pointerId)}catch(err){}
  var t=getTimeFromPointer(e);
  seekTo(t);
}

seekEl.addEventListener('pointerup',endScrub);
seekEl.addEventListener('pointercancel',endScrub);


addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'&&e.target.type!=='range')return;
  if(cur<0)return;
  if(e.key===' '){e.preventDefault();$('#bplay').click()}
  else if(e.key==='ArrowRight')seekTo(curTime()+5);
  else if(e.key==='ArrowLeft')seekTo(curTime()-5);
  else if(e.key==='Escape')back();
});
}
