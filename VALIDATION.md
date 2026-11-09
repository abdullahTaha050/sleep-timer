# Doğrulama kaydı — 0.1.0

9 Kasım 2026

## Geçen kontroller

- Refactor sonrası `npm test`: **12 test, 0 hata**. Bunlar 8 zamanlayıcı birim testi, 23 senaryo içeren Netflix DOM entegrasyon testi ve 3 platform/mimari testidir.
- Zamanlayıcı: duraklat/devam et, geciken tick, yeni süre seçme, iptal, bekleme, tek seferlik bitiş ve yeniden başlatma.
- DOM: sağ grubun başına ekleme, tek buton, seçenekler, menü aç/kapat durumları, geri sayım, yükleme ve sarma beklemeleri, süre sonunda duraklatma, iptal, buton/grup yeniden oluşturma, video değişimi, video sonu, sayfadan ayrılma ve SPA/geri-ileri önbelleği ile geri dönme.
- Kullanıcının paylaştığı gerçek HTML'in yalnızca DOM yapısında platform seçicileri kontrol edildi: ana video ve beş butonlu sağ kontrol grubu doğru bulundu. HTML içindeki betikler çalıştırılmadı ve bu dosya kaynak paketine eklenmedi.
- İçerik betiklerinin JavaScript sözdizimi kontrol edildi.
- 16, 48 ve 128 piksel ikonlar üretildi; 128 piksel ikon görsel olarak kontrol edildi.
- İkinci sentetik platformda farklı domain/URL kimliği, DOM, yerleşim çapası, özel duraklatma, geçici oynatıcı kaybı ve video elemanının değişmesi ortak çekirdekle doğrulandı. Desteklenmeyen domain ve hatalı/tekrarlı adaptör kaydı da test edildi.
- Kullanıcı refactor öncesindeki saniyelik testlerin gerçek Netflix üzerinde düzgün çalıştığını bildirdi.

## Bu kontrollerin sınırı

DOM testleri Happy DOM üzerinde, kontrollü saat ve simüle edilmiş medya durumları ile çalışır. Popover API'sinin aç/kapat durumu testte modellenir; bu model yerleşimi, gerçek tarayıcı odağını, tam ekranı veya Netflix'in kendi oynatıcı mantığını doğrulamaz.

Önceki yerel tarayıcı önizlemesi bu çalışma ortamının URL erişim politikası tarafından engellendi. Agent tarafından canlı Netflix testi veya görsel ekran görüntüsü doğrulaması yapılmadı. Kullanıcının başarılı testi refactor öncesine aittir; yeni yapı ve `rem` ölçüleri için README'deki deneme adımları tekrar uygulanabilir.

## Bilinen kapsam sınırı

Videonun kalan süresini aşan seçimi video sonuna kısaltma ve sonraki bölümün otomatik başlamasını engelleme bu sürüme dahil değildir. Bu davranış ürün kararlarında sonraki aşama olarak kayıtlıdır.
