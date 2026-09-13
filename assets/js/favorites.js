document.addEventListener('DOMContentLoaded', () => {
    const grid=document.getElementById('favoritesGrid'), search=document.getElementById('favoritesSearch'), tabs=document.querySelectorAll('.favorite-tab:not(#clearFavorites)'), modal=document.getElementById('favoriteModal'), form=document.getElementById('favoriteForm'), cancel=document.getElementById('cancelFavoriteEdit');
    const typeLabels={tools:'الأدوات',universities:'الجامعات',schools:'المدارس والمعاهد',residences:'الإقامات'}; let activeType='all',editingId=null;
    const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    const getFavorites=()=>StorageApp.getFavorites();
    function setCount(id,n){const e=document.getElementById(id);if(e)e.textContent=n;}
    function render(){
        const all=getFavorites(),term=(search?.value||'').trim().toLowerCase();
        const filtered=all.filter(item=>{const ok=activeType==='all'||item.type===activeType;const text=`${item.title||''} ${item.description||''} ${item.type||''}`.toLowerCase();return ok&&(!term||text.includes(term));});
        setCount('countAll',all.length);setCount('countTools',all.filter(x=>x.type==='tools').length);setCount('countUniversities',all.filter(x=>x.type==='universities').length);setCount('countSchools',all.filter(x=>x.type==='schools').length);setCount('countResidences',all.filter(x=>x.type==='residences').length);
        if(!filtered.length){grid.innerHTML=`<div class="favorites-empty"><i class="fa-regular fa-star"></i><h2>لا توجد مفضلات هنا</h2><p>${term?'جرّب كلمة بحث أخرى.':'أضف الأدوات أو الجامعات أو المدارس أو الإقامات التي تحتاج إليها باستمرار.'}</p></div>`;return;}
        grid.innerHTML=filtered.map(item=>`<article class="favorite-card"><div class="favorite-card-head"><div class="favorite-icon"><i class="fa-solid fa-star"></i></div><div class="favorite-info"><h3>${esc(item.title)}</h3><p>${esc(item.description||item.url||'')}</p><span class="favorite-type">${esc(typeLabels[item.type]||item.type||'مفضلة')}</span></div></div><div class="favorite-actions"><a href="${esc(item.url||'#')}">فتح</a><button type="button" data-edit="${esc(item.id)}">تعديل</button><button type="button" class="delete-btn" data-delete="${esc(item.id)}">حذف</button></div></article>`).join('');
    }
    function openEdit(id){const item=getFavorites().find(x=>x.id===id);if(!item)return;editingId=id;document.getElementById('editTitle').value=item.title||'';document.getElementById('editDescription').value=item.description||'';document.getElementById('editType').value=item.type||'tools';document.getElementById('editUrl').value=item.url||'';modal.classList.add('active');document.getElementById('editTitle').focus();}
    function closeEdit(){editingId=null;modal.classList.remove('active');form.reset();}
    grid.addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)openEdit(edit.dataset.edit);if(del){const item=getFavorites().find(x=>x.id===del.dataset.delete);if(item&&confirm(`هل تريد حذف «${item.title}» من المفضلة؟`)){StorageApp.removeFavorite(item.id);render();}}});
    tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));tab.classList.add('active');activeType=tab.dataset.type;render();}));
    search?.addEventListener('input',render);cancel?.addEventListener('click',closeEdit);modal?.addEventListener('click',e=>{if(e.target===modal)closeEdit();});
    form?.addEventListener('submit',e=>{e.preventDefault();if(!editingId)return;const favs=getFavorites(),i=favs.findIndex(x=>x.id===editingId);if(i<0)return;favs[i]={...favs[i],title:document.getElementById('editTitle').value.trim(),description:document.getElementById('editDescription').value.trim(),type:document.getElementById('editType').value,url:document.getElementById('editUrl').value.trim()};localStorage.setItem('student_dz_favorites',JSON.stringify(favs));closeEdit();render();});
    document.getElementById('clearFavorites')?.addEventListener('click',()=>{if(getFavorites().length&&confirm('هل تريد حذف جميع المفضلات؟')){localStorage.setItem('student_dz_favorites','[]');activeType='all';tabs.forEach(x=>x.classList.remove('active'));document.querySelector('.favorite-tab[data-type="all"]')?.classList.add('active');render();}});
    render();
});
