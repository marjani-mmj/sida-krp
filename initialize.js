// initialize.js
(function() {
    'use strict';
    var basePath = 'https://marjani-mmj.github.io/sida-krp/';

    var criticalScripts = [
        'core.js',
        'section-daftsrNatayej.js',
        'section-sarbarg.js',
        'section-rookeshKoli.js',
        'section-rookeshPayeei.js',
        'section-polomp.js',
        'section-amarKoli.js',
        'section-reportTosifi.js',
        'panel-reportTosifi.js'
    ];

    var optionalScripts = [
        'photo-replacer.js'   // اگر نباشد، فقط قابلیت عکس کار نمی‌کند
    ];

    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = basePath + src + '?_=' + Date.now();
            script.onload = function() { console.log('✅', src); resolve(); };
            script.onerror = function() {
                console.warn('⚠️ بارگذاری نشد:', src);
                reject();
            };
            document.body.appendChild(script);
        });
    }

    // بارگذاری اسکریپت‌های ضروری (اگر یکی خراب شود، متوقف می‌شویم)
    criticalScripts.reduce(function(promise, script) {
        return promise.then(function() { return loadScript(script); });
    }, Promise.resolve())
    .then(function() {
        console.log('✅ ماژول‌های اصلی بارگذاری شدند.');
        // بارگذاری اختیاری‌ها (حتی اگر خطا دهند، ادامه می‌دهیم)
        return Promise.allSettled(optionalScripts.map(function(s) { return loadScript(s); }));
    })
    .then(function() {
        console.log('✅ همه ماژول‌ها (اصلی + اختیاری) پایان یافتند.');
    })
    .catch(function(err) {
        console.error('❌ خطای بحرانی در ماژول‌های اصلی:', err);
    });
})();
