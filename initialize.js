// initialize.js
(function() {
    var basePath = 'https://marjani-mmj.github.io/sida-krp/';
    var scripts = [
        'core.js',
        'section-daftsrNatayej.js',
        'section-sarbarg.js',
        'section-rookeshKoli.js',
        'section-rookeshPayeei.js',
        'section-polomp.js',
        'section-amarKoli.js',
        'section-reportTosifi.js',
        'panel-reportTosifi.js',
        'photo-replacer.js'           // ← فایل جدید
    ];

    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = basePath + src;
            script.onload = resolve;
            script.onerror = function() {
                console.error('Failed to load:', src);
                reject();
            };
            document.body.appendChild(script);
        });
    }

    scripts.reduce(function(promise, script) {
        return promise.then(function() {
            return loadScript(script);
        });
    }, Promise.resolve())
    .then(function() {
        console.log('همه ماژول‌ها بارگذاری شدند.');
    })
    .catch(function() {
        console.error('خطا در بارگذاری اسکریپت‌ها.');
    });
})();
