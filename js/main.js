// ОБЛОЖКИ КНИГ: укажите путь к своему изображению для каждой книги.
// Например: 'images/my-cover.jpg' или 'books/covers/space.png'.
// Положите изображения в папку сайта по указанному пути. Если файл не найден,
// останется исходная нарисованная обложка.
const BOOK_COVER_IMAGES = {
  'kosmicheskaya-odisseya': 'images/cover-kosmicheskaya-odisseya.jpg',
  'zametki-o-zhizni': 'images/cover-zametki-o-zhizni.jpg',
  'novaya-istoriya': 'images/cover-novaya-istoriya.jpg'
};

document.querySelectorAll('.book-cover[data-cover-id]').forEach(cover => {
  const src = BOOK_COVER_IMAGES[cover.dataset.coverId];
  if (!src) return;
  const img = new Image();
  img.className = 'book-cover-image';
  img.alt = 'Обложка книги';
  img.onload = () => { cover.classList.add('has-image'); cover.prepend(img); };
  img.src = src;
});

const tabs=[...document.querySelectorAll('.tab')];const panels=[...document.querySelectorAll('.panel')];tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.setAttribute('aria-selected',String(t===tab)));panels.forEach(p=>p.classList.toggle('active',p.id===tab.dataset.tab));window.scrollTo({top:document.querySelector('.tabs-wrap').offsetTop,behavior:'smooth'});}));
async function loadPosts(){
  let posts=[];
  try { const response=await fetch('content/posts.json'); if(!response.ok) throw new Error('Не удалось загрузить content/posts.json'); const data=await response.json(); posts=Array.isArray(data.posts)?data.posts:[]; }
  catch(error){ console.warn('Не удалось загрузить записи блога.',error); }
  const blogGrid=document.getElementById('blogGrid'),blogList=document.querySelector('.blog-list'),articleView=document.getElementById('articleView');
  if(!posts.length)return;
  blogGrid.innerHTML=posts.map((post,index)=>'<button class="blog-card" data-post="'+index+'"><div class="blog-card-top"><span>'+escapeHTML(post.category||'Заметки')+'</span><span>'+escapeHTML(post.date||'')+'</span></div><h3>'+escapeHTML(post.title||'Без названия')+'</h3><p>'+escapeHTML(post.lead||'')+'</p><div class="blog-card-bottom"><span>Читать запись</span><span class="blog-arrow">↗</span></div></button>').join('');
  function openPost(index){const post=posts[index];if(!post)return;document.getElementById('articleMeta').textContent=(post.category||'Заметки')+' · '+(post.date||'');document.getElementById('articleTitle').textContent=post.title||'';document.getElementById('articleLead').textContent=post.lead||'';document.getElementById('articleBody').innerHTML=post.body||'';blogList.classList.add('hidden');articleView.classList.add('open');}
  blogGrid.querySelectorAll('.blog-card').forEach(card=>card.addEventListener('click',()=>openPost(Number(card.dataset.post))));
  document.getElementById('articleBack').addEventListener('click',()=>{articleView.classList.remove('open');blogList.classList.remove('hidden');});
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
loadPosts();
document.getElementById('blogGrid'),blogList=document.querySelector('.blog-list'),articleView=document.getElementById('articleView');blogGrid.innerHTML=posts.map((post,index)=>'<button class="blog-card" data-post="'+index+'"><div class="blog-card-top"><span>'+post.category+'</span><span>'+post.date+'</span></div><h3>'+post.title+'</h3><p>'+post.lead+'</p><div class="blog-card-bottom"><span>Читать запись</span><span class="blog-arrow">↗</span></div></button>').join('');function openPost(index){const post=posts[index];if(!post)return;document.getElementById('articleMeta').textContent=post.category+' · '+post.date;document.getElementById('articleTitle').textContent=post.title;document.getElementById('articleLead').textContent=post.lead;document.getElementById('articleBody').innerHTML=post.body;blogList.classList.add('hidden');articleView.classList.add('open');}document.querySelectorAll('.blog-card').forEach(card=>card.addEventListener('click',()=>openPost(Number(card.dataset.post))));document.getElementById('articleBack').addEventListener('click',()=>{articleView.classList.remove('open');blogList.classList.remove('hidden');});
const filters=[...document.querySelectorAll('.filter')];const cards=[...document.querySelectorAll('.photo-card')];const photoCards=cards.filter(card=>card.closest('#photos'));const drawingCards=cards.filter(card=>card.closest('#drawings'));filters.forEach(f=>f.addEventListener('click',()=>{filters.forEach(x=>x.classList.toggle('active',x===f));photoCards.forEach(card=>card.hidden=f.dataset.filter!=='all'&&card.dataset.category!==f.dataset.filter);}));
const lightbox=document.getElementById('lightbox');const artTarget=document.getElementById('lightboxArt');const caption=document.getElementById('lightboxCaption');let currentPhotoIndex=0;let lightboxCards=photoCards;function visibleCards(){return lightboxCards.filter(card=>!card.hidden);}function showPhoto(index){const visible=visibleCards();if(!visible.length)return;currentPhotoIndex=(index+visible.length)%visible.length;const card=visible[currentPhotoIndex];artTarget.innerHTML=card.querySelector('svg').outerHTML;caption.textContent=card.dataset.title+' · '+(currentPhotoIndex+1)+' из '+visible.length;}function openPhoto(card){lightboxCards=card.closest('#drawings')?drawingCards:photoCards;lightbox.classList.add('open');document.body.style.overflow='hidden';showPhoto(visibleCards().indexOf(card));}cards.forEach(card=>card.addEventListener('click',()=>openPhoto(card)));document.getElementById('prevPhoto').addEventListener('click',()=>showPhoto(currentPhotoIndex-1));document.getElementById('nextPhoto').addEventListener('click',()=>showPhoto(currentPhotoIndex+1));function closeBox(){lightbox.classList.remove('open');document.body.style.overflow='';artTarget.innerHTML='';}document.getElementById('closeLightbox').addEventListener('click',closeBox);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeBox();});document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeBox();if(e.key==='ArrowLeft')showPhoto(currentPhotoIndex-1);if(e.key==='ArrowRight')showPhoto(currentPhotoIndex+1);});
document.querySelectorAll('.book .download').forEach(link=>link.addEventListener('click',event=>{if(link.dataset.ready==='true'){delete link.dataset.ready;return;}event.preventDefault();const book=link.closest('.book');book.classList.add('opening');window.setTimeout(()=>{book.classList.remove('opening');link.dataset.ready='true';link.click();},720);}));
