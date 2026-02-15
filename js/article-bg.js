(function(){
  var pool=[
    '/img/article-bg-1.svg',
    '/img/article-bg-2.svg',
    '/img/article-bg-3.svg',
    '/img/article-bg-4.svg',
    '/img/article-bg-5.svg'
  ];
  var pick=pool[Math.floor(Math.random()*pool.length)];
  var style=document.createElement('style');
  style.textContent='\n  .article-bg-layer{position:fixed;inset:0;z-index:-1;background-size:cover;background-position:center;opacity:.9;pointer-events:none;}\n  .page-container{position:relative;}\n  ';
  document.head.appendChild(style);
  var layer=document.createElement('div');
  layer.className='article-bg-layer';
  layer.style.backgroundImage='url("'+pick+'")';
  document.body.insertBefore(layer, document.body.firstChild);
})();
