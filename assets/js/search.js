// Unified live search with keyboard navigation and accessible listbox semantics.
document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('mainSearch');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    const tools = [
        ['القاموس العربي العربي','معاني الكلمات والجذور والمرادفات والأضداد','tools/arabic-dictionary.html','أداة'],
        ['حاسبة الميزانية','احسب مصاريفك الشهرية والسنوية','tools/budget-calculator.html','أداة'],
        ['أدوات النصوص','عداد الكلمات وتنسيق النصوص للبحوث','tools/text-tools.html','أداة'],
        ['حاسبة المعدل','احسب معدل السداسي بدقة','tools/average-calculator.html','أداة'],
        ['الآلة الحاسبة الذكية','احسب المعادلات واحفظ النتائج والمعادلات في المتصفح مع إمكانية التعديل والحذف وإعادة الاستخدام','tools/calculator.html','أداة'],
        ['المعدل السنوي','احسب المعدل السنوي','tools/semester-calculator.html','أداة'],
        ['حساب النسبة','حساب النسبة المئوية','tools/percentage-calculator.html','أداة'],
        ['مؤقت بومودورو','نظم وقت دراستك','tools/pomodoro.html','أداة'],
        ['إنشاء CV','أنشئ سيرتك الذاتية','tools/cv-builder.html','أداة'],
        ['إنشاء QR Code','تحويل نص أو رابط إلى رمز استجابة سريعة','tools/qr-generator.html','أداة'],
        ['أدوات PDF','أدوات للتعامل مع ملفات PDF','tools/pdf-tools.html','أداة'],
        ['ضغط الصور','تصغير حجم الصور','tools/image-compressor.html','أداة'],
        ['الخريطة الجامعية','الجامعات والإقامات والمدارس على الخريطة','tools/maps.html','أداة'],
        ['محول الوحدات','تحويل الطول والوزن والحجم والحرارة والزمن','tools/unit-converter.html','أداة'],
        ['مولد جدول الدراسة','أنشئ جدولك الأسبوعي ونظم حصصك','tools/study-schedule.html','أداة'],
        ['حساب الأيام بين تاريخين','احسب المدة بالأيام والأسابيع','tools/date-difference.html','أداة'],
        ['حاسبة الترتيب والنقاط','احسب مجموع النقاط والمتوسط الموزون','tools/points-ranking.html','أداة']
    ].map(([name,description,url,type])=>({name,description,url,type}));
    let index=[...tools];
    const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[إأآا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').trim();
    const addItems=(items,type,mapper)=>{if(!Array.isArray(items))return;items.forEach(item=>{const mapped=mapper(item);if(mapped&&mapped.name)index.push({...mapped,type});});};
    try{
        const base=CONFIG.getUrl('data/');
        const [uR,rR,eR,pR]=await Promise.all([fetch(`${base}universities.json`),fetch(`${base}residences.json`),fetch(`${base}ecoles.json`),fetch(`${base}platforms.json`)]);
        const [universities,residences,ecoles,platforms]=await Promise.all([uR.ok?uR.json():null,rR.ok?rR.json():null,eR.ok?eR.json():null,pR.ok?pR.json():null]);
        addItems(universities?.universities,'جامعة',u=>({name:u.name,description:[u.wilaya,...(u.specialties||[]),u.description].filter(Boolean).join(' • '),url:u.officialUrl||'universities/index.html'}));
        addItems(residences?.residences,'إقامة',r=>({name:r.name,description:[r.wilaya,r.gender==='female'?'إناث':r.gender==='male'?'ذكور':''].filter(Boolean).join(' • '),url:'residences/index.html'}));
        addItems(ecoles,'كلية / مدرسة',e=>({name:e.name,description:[e.wilaya,...(e.specialties||[]),...(e.services||[])].filter(Boolean).join(' • '),url:e.officialUrl||'ecoles/index.html'}));
        addItems(platforms?.platforms,'خدمة',p=>({name:p.name,description:p.description,url:p.officialUrl||'platforms/index.html'}));
    }catch(error){console.warn('Unified search data loading failed:',error);}
    const uniqueIndex=Array.from(new Map(index.map(item=>[`${item.type}|${item.name}|${item.url}`,item])).values());
    const getIcon=type=>({'جامعة':'fa-building-columns','كلية / مدرسة':'fa-school','إقامة':'fa-building','خدمة':'fa-globe','أداة':'fa-calculator'}[type]||'fa-magnifying-glass');
    const escapeHtml=value=>String(value||'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
    let activeIndex=-1;
    const hideResults=()=>{searchResults.style.display='none';searchInput.setAttribute('aria-expanded','false');searchInput.removeAttribute('aria-activedescendant');activeIndex=-1;};
    const updateActive=()=>{const options=[...searchResults.querySelectorAll('[role="option"]')];options.forEach((option,i)=>option.setAttribute('aria-selected',String(i===activeIndex)));if(activeIndex>=0&&options[activeIndex]){options[activeIndex].scrollIntoView({block:'nearest'});searchInput.setAttribute('aria-activedescendant',options[activeIndex].id);}else searchInput.removeAttribute('aria-activedescendant');};
    const renderResults=query=>{
        const normalizedQuery=normalize(query);
        if(normalizedQuery.length<2){searchResults.style.display='none';searchResults.innerHTML='';hideResults();return;}
        const terms=normalizedQuery.split(/\s+/).filter(Boolean);
        const matches=uniqueIndex.map(item=>{const haystack=normalize(`${item.name} ${item.description}`);const matchedTerms=terms.filter(term=>haystack.includes(term)).length;const nameMatch=normalize(item.name).includes(normalizedQuery);return{item,score:matchedTerms*10+(nameMatch?20:0)};}).filter(result=>result.score>0).sort((a,b)=>b.score-a.score||a.item.name.localeCompare(b.item.name,'ar')).slice(0,8);
        activeIndex=-1;searchResults.style.display='block';searchInput.setAttribute('aria-expanded','true');
        if(!matches.length){searchResults.innerHTML='<div class="search-result-empty" role="status"><i class="fa-solid fa-magnifying-glass"></i> لا توجد نتائج مطابقة</div>';return;}
        searchResults.innerHTML=matches.map(({item},i)=>`<a id="search-option-${i}" class="search-result-item" role="option" aria-selected="false" href="${escapeHtml(CONFIG.getUrl(item.url))}"><span class="search-result-icon"><i class="fa-solid ${getIcon(item.type)}" aria-hidden="true"></i></span><span class="search-result-content"><strong>${escapeHtml(item.name)}</strong><small><span class="search-result-type">${escapeHtml(item.type)}</span>${item.description?` · ${escapeHtml(item.description).slice(0,110)}`:''}</small></span><i class="fa-solid fa-arrow-left search-result-arrow" aria-hidden="true"></i></a>`).join('');
    };
    searchInput.addEventListener('input',event=>renderResults(event.target.value));
    searchInput.addEventListener('keydown',event=>{const options=searchResults.querySelectorAll('[role="option"]');if(event.key==='Escape'){hideResults();return;}if(searchResults.style.display==='none'||!options.length)return;if(event.key==='ArrowDown'){event.preventDefault();activeIndex=(activeIndex+1)%options.length;updateActive();}else if(event.key==='ArrowUp'){event.preventDefault();activeIndex=(activeIndex-1+options.length)%options.length;updateActive();}else if(event.key==='Enter'&&activeIndex>=0){event.preventDefault();options[activeIndex].click();}});
    document.addEventListener('click',event=>{if(!event.target.closest('.search-box'))hideResults();});
});
