document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('favoritesGrid');
    const search = document.getElementById('favoritesSearch');
    const tabs = document.querySelectorAll('.favorite-tab');
    const modal = document.getElementById('favoriteModal');
    const form = document.getElementById('favoriteForm');
    const cancel = document.getElementById('cancelFavoriteEdit');
    const typeLabels = { tools:'الأدوات', universities:'الجامعات', schools:'المدارس والمعاهد', residences:'الإقامات' };
    let activeType = 'all';
    let editingId = null;
    const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    const icon = value => value && /^[a-zA-Z0-9 _-]+$/.test(value) ? value : 'fa-star';
    function getFavorites(){ return StorageApp.getFavorites(); }
    function setCount(id,n){ const el=document.getElementById(id); if(el) el.textContent=n; }
    function render(){
        const all = getFavorites();
        const term = (search?.value || '').trim().toLowerCase();
        const filtered = all.filter(item => {
            const typeOk = activeType === 'all' || item.type === activeType;
            const text = `${item.title || ''} ${item.description || ''} ${item.type || ''}`.toLowerCase();
            return typeOk && (!term || text.includes(term));
        });
        setCount('countAll', all.length); setCount('countTools', all.filter(x=>x.type==='tools').length);
        setCount('countUniversities', all.filter(x=>x.type==='universities').length); setCount('countSchools', all.filter(x=>x.type==='schools').length);
        setCount('countResidences', all.filter(x=>x.type==='residences').length);
        if(!filtered.length){ grid.innerHTML = `<div class="favorites-empty"><i class="fa-regular fa-star"></i><h2>لا توجد مفضلات هنا</h2><p>${term ? 'جرّب كلمة بحث أخرى.' : 'أضف الأدوات أو الجامعات أو المدارس أو الإقامات التي تحتاج إليها باستمرار.'}</p></div>`; return; }
        grid.innerHTML = filtered.map(item => `<article class="favorite-card"><div class="favorite-card-head"><div class="favorite-icon"><i class="fa-solid ${esc(icon(item.icon))}"></i></div><div class="favorite-info"><h3>${esc(item.title)}</h3><p>${esc(item.description || item.url || '')}</p><span class="favorite-type">${esc(typeLabels[item.type] || item.type || 'مفضلة')}</span></div></div><div class="favorite-actions"><a href="${esc(item.url || '#')}">فتح</a><button type="button" data-edit="${esc(item.id)}">تعديل</button><button type="button" class="delete-btn" data-delete="${esc(item.id)}">حذف</button></div></article>`).join('');
    }
    function openEdit(id){
        const item = getFavorites().find(x=>x.id===id); if(!item) return;
        editingId = id; document.getElementById('editTitle').value = item.title || ''; document.getElementById('editDescription').value = item.description || '';
        document.getElementById('editType').value = item.type || 'tools'; document.getElementById('editUrl').value = item.url || '';
        modal.classList.add('active'); document.getElementById('editTitle').focus();
    }
    function closeEdit(){ editingId=null; modal.classList.remove('active'); form.reset(); }
    grid.addEventListener('click', e => {
        const edit = e.target.closest('[data-edit]'); const del = e.target.closest('[data-delete]');
        if(edit) openEdit(edit.dataset.edit);
        if(del){ const item=getFavorites().find(x=>x.id===del.dataset.delete); if(item && confirm(`هل تريد حذف «${item.title}» من المفضلة؟`)){ StorageApp.removeFavorite(item.id); render(); } }
    });
    tabs.forEach(tab => tab.addEventListener('click', () => { tabs.forEach(x=>x.classList.remove('active')); tab.classList.add('active'); activeType=tab.dataset.type; render(); }));
    search?.addEventListener('input', render); cancel?.addEventListener('click', closeEdit);
    modal?.addEventListener('click', e => { if(e.target===modal) closeEdit(); });
    form?.addEventListener('submit', e => {
        e.preventDefault(); if(!editingId) return;
        const data={title:document.getElementById('editTitle').value.trim(),description:document.getElementById('editDescription').value.trim(),type:document.getElementById('editType').value,url:document.getElementById('editUrl').value.trim()};
        if(data.title && StorageApp.updateFavorite(editingId,data)){ closeEdit(); render(); }
    });
    document.getElementById('clearFavorites')?.addEventListener('click', () => { if(getFavorites().length && confirm('هل تريد حذف جميع المفضلات؟')){ StorageApp.clearFavorites(); render(); } });
    render();
});
