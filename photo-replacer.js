// photo-replacer.js
(function() {
    'use strict';

    // فقط در صفحهٔ گزارش توصیفی فعال شود
    if (!document.querySelector('.reportTosifiSearch.print-panel')) return;

    /* ---------- سبک‌های مورد نیاز برای رابط کاربری ---------- */
    function injectStyles() {
        if (document.getElementById('photo-replacer-styles')) return;
        var style = document.createElement('style');
        style.id = 'photo-replacer-styles';
        style.textContent = `
            .pr-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 9999999;
                display: flex; align-items: center; justify-content: center;
                font-family: Tahoma, sans-serif;
            }
            .pr-dialog {
                background: white; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.3);
                padding: 24px; text-align: center; min-width: 300px; max-width: 400px;
                animation: prFadeIn 0.3s ease;
            }
            @keyframes prFadeIn { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }
            .pr-dialog h3 { margin: 0 0 16px; color: #333; font-size: 18px; }
            .pr-dialog p { margin: 0 0 20px; color: #666; font-size: 14px; }
            .pr-btn {
                display: inline-block; padding: 10px 20px; margin: 0 8px;
                border: none; border-radius: 8px; font-size: 14px; font-weight: bold;
                cursor: pointer; transition: background 0.2s;
            }
            .pr-btn-primary { background: #0050ef; color: white; }
            .pr-btn-primary:hover { background: #003ecb; }
            .pr-btn-secondary { background: #e9ecef; color: #333; }
            .pr-btn-secondary:hover { background: #ced4da; }
            .pr-progress {
                margin-top: 16px; background: #f1f3f5; border-radius: 8px;
                height: 8px; width: 100%; overflow: hidden;
            }
            .pr-progress-bar {
                height: 100%; background: linear-gradient(90deg, #51cf66, #40c057);
                width: 0%; transition: width 0.3s;
            }
            .pr-success { color: #2b8a3e; font-weight: bold; margin-top: 10px; }
            .pr-error { color: #c92a2a; font-weight: bold; margin-top: 10px; }
        `;
        document.head.appendChild(style);
    }

    /* ---------- تابع کمکی برای خواندن فایل به‌صورت Data URL ---------- */
    function readFileAsDataURL(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /* ---------- مدیریت رابط کاربری ---------- */
    function showFolderSelector() {
        return new Promise(function(resolve, reject) {
            // ایجاد لایهٔ محاوره‌ای زیبا
            var overlay = document.createElement('div');
            overlay.className = 'pr-overlay';
            overlay.innerHTML = `
                <div class="pr-dialog">
                    <h3>📁 انتخاب پوشهٔ عکس‌ها</h3>
                    <p>لطفاً پوشه‌ای را که شامل عکس دانش‌آموزان (با نام کد ملی) است، انتخاب کنید.</p>
                    <div>
                        <button class="pr-btn pr-btn-primary" id="pr-select-btn">انتخاب پوشه</button>
                        <button class="pr-btn pr-btn-secondary" id="pr-cancel-btn">انصراف</button>
                    </div>
                    <div class="pr-progress" style="display:none;" id="pr-progress-container">
                        <div class="pr-progress-bar" id="pr-progress-bar"></div>
                    </div>
                    <div id="pr-message"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            var selectBtn = document.getElementById('pr-select-btn');
            var cancelBtn = document.getElementById('pr-cancel-btn');
            var progressContainer = document.getElementById('pr-progress-container');
            var progressBar = document.getElementById('pr-progress-bar');
            var messageDiv = document.getElementById('pr-message');

            function cleanup() {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }

            cancelBtn.addEventListener('click', function() {
                cleanup();
                reject(new Error('انصراف کاربر'));
            });

            selectBtn.addEventListener('click', function() {
                // غیرفعال‌سازی دکمه‌ها
                selectBtn.disabled = true;
                cancelBtn.disabled = true;
                // ایجاد input فایل (hidden) برای انتخاب پوشه
                var fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.webkitdirectory = true;
                fileInput.style.display = 'none';
                fileInput.addEventListener('change', function() {
                    if (fileInput.files.length === 0) {
                        cleanup();
                        reject(new Error('هیچ فایلی انتخاب نشد'));
                        return;
                    }
                    // نمایش نوار پیشرفت
                    progressContainer.style.display = 'block';
                    resolve({ files: fileInput.files, progressBar: progressBar, messageDiv: messageDiv, cleanup: cleanup });
                });
                document.body.appendChild(fileInput);
                fileInput.click();
                // اگر کاربر دکمهٔ کنسلِ دیالوگ فایل را بزند، دوباره فعال می‌کنیم دکمه‌ها
                window.addEventListener('focus', function onFocus() {
                    setTimeout(function() {
                        if (fileInput.files.length === 0) {
                            selectBtn.disabled = false;
                            cancelBtn.disabled = false;
                            window.removeEventListener('focus', onFocus);
                        }
                    }, 100);
                }, { once: true });
            });
        });
    }

    /* ---------- جایگزینی عکس‌ها ---------- */
    async function processImages(files, progressBar, messageDiv, cleanup) {
        try {
            // ۱. نگاشت کد ملی → فایل تصویر
            var imageMap = {};
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.type.startsWith('image/')) {
                    var nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                    imageMap[nameWithoutExt] = file;
                }
            }

            // ۲. یافتن همهٔ کارت‌های دانش‌آموزان
            var cards = document.querySelectorAll('[ng-repeat="rowItem in dataItems"]');
            var total = cards.length;
            var done = 0;
            var replacedCount = 0;

            for (var j = 0; j < total; j++) {
                var card = cards[j];
                var nationalCode = getNationalCode(card);
                if (nationalCode && imageMap[nationalCode]) {
                    var img = card.querySelector('div.pt-2 img.border.rounded');
                    if (img) {
                        // تبدیل فایل به Data URL برای نمایش
                        var dataUrl = await readFileAsDataURL(imageMap[nationalCode]);
                        img.src = dataUrl;
                        replacedCount++;
                    }
                }
                done++;
                // به‌روزرسانی نوار پیشرفت
                var percent = Math.round((done / total) * 100);
                progressBar.style.width = percent + '%';
                // اجازهٔ رندر شدن تغییرات
                await new Promise(function(r) { setTimeout(r, 10); });
            }

            // ۳. نمایش پیام موفقیت
            messageDiv.innerHTML = `<span class="pr-success">✅ ${replacedCount} عکس با موفقیت جایگزین شد.</span>`;
            // دکمه‌ها را پنهان و دکمهٔ بستن اضافه کنیم
            var selectBtn = document.getElementById('pr-select-btn');
            var cancelBtn = document.getElementById('pr-cancel-btn');
            if (selectBtn) selectBtn.style.display = 'none';
            if (cancelBtn) {
                cancelBtn.textContent = 'بستن';
                cancelBtn.disabled = false;
                cancelBtn.addEventListener('click', cleanup);
            }
        } catch (err) {
            messageDiv.innerHTML = `<span class="pr-error">❌ خطا: ${err.message}</span>`;
            var cancelBtn = document.getElementById('pr-cancel-btn');
            if (cancelBtn) {
                cancelBtn.textContent = 'بستن';
                cancelBtn.disabled = false;
            }
        }
    }

    function getNationalCode(card) {
        var cells = card.querySelectorAll('td');
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].textContent.trim() === 'کد ملی:') {
                var next = cells[i].nextElementSibling;
                if (next && next.classList.contains('btext')) {
                    return next.textContent.trim();
                }
            }
        }
        return null;
    }

    /* ---------- راه‌اندازی ورودی مخفی ---------- */
    function init() {
        injectStyles();

        var header = document.querySelector('.card-main header');
        if (!header) return;

        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'text';
        hiddenInput.setAttribute('autocomplete', 'off');
        hiddenInput.style.cssText = [
            'position: absolute; top: 0; left: 0;',
            'width: 1px; height: 1px;',
            'opacity: 0; border: none; outline: none;',
            'z-index: -1;'
        ].join('');
        header.style.position = 'relative';
        header.appendChild(hiddenInput);

        header.addEventListener('click', function(e) {
            // اگر کلیک روی خود هدر یا فضای خالی باشد، فوکوس به ورودی مخفی
            if (!e.target.closest('button') && !e.target.closest('a') && !e.target.closest('i')) {
                hiddenInput.focus();
            }
        });

        hiddenInput.addEventListener('input', function() {
            if (hiddenInput.value === '8991') {
                hiddenInput.value = '';
                // باز کردن دیالوگ انتخاب پوشه
                showFolderSelector().then(function(result) {
                    processImages(result.files, result.progressBar, result.messageDiv, result.cleanup);
                }).catch(function(err) {
                    console.log('عملیات لغو شد یا خطا:', err);
                });
            }
        });
    }

    // اجرا پس از بارگذاری صفحه
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
