// AdSense Loader - Lazy, Non-intrusive
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const settings = await fetchAppJSON(CONFIG.API.SETTINGS);

        if (settings && settings.ads && settings.ads.enabled && settings.ads.publisherId) {
            // Setup dynamic AdSense script
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.ads.publisherId}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);

            // Note: Ad slots must exist in the HTML (e.g. <ins class="adsbygoogle" ...></ins>)
            // We use a MutationObserver or timeout to push ads safely without CLS
            setTimeout(() => {
                const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
                if(ads.length > 0) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) {
                        console.error('AdSense Error:', e);
                    }
                }
            }, 1000); // Small delay to let content load first
        }
    } catch(e) {
        console.log("Ads loading skipped or failed.");
    }
});
