# Doğrulama kaydı — 0.2.0

10 Kasım 2026

## Geçen kontroller

- `npm test`: **26 test, 0 hata**. 8 zamanlayıcı testi, 24 senaryo içeren Netflix DOM entegrasyon testi, 13 bölüm sonu testi ve 4 platform/mimari testi.
- Süre, duraklatma, yükleme/sarma beklemesi, iptal, süre değiştirme ve tek seferlik bitiş kontrol edildi.
- Görünür bölüm sonu kartı algılama; sıradan sonraki bölüm ve gizli kartları yok sayma; uzun jenerikte durma; dakika seçimini bölüm sonunda sınırlama; Kapalı iken müdahale etmeme kontrol edildi.
- “Jeneriği İzle” tıklaması sırasında yeniden oynatma, iptal düğmesinin yokluğu, yeni video/URL/oynatıcı kimliği, geçiş sinyali kaçırıldığında koruma ve doğal video bitişi senaryoları test edildi.
- Görünürlük attribute değişimini MutationObserver ile yakalama, tek sinyale tekrar basmama ve yeniden oluşturulan kartlar için üç girişim sınırı doğrulandı.
- Kontroller kaybolduğunda bildirim, Devam et ile korumayı kaldırıp oynatma, Kapalı ile oynatmadan korumayı kaldırma test edildi.
- Netflix dışındaki sentetik adaptörle aynı bölüm sonu ve iptal sözleşmesi doğrulandı.
- Kullanıcının paylaştığı bölüm sonu HTML'inde ana video, iki geçiş kontrolü, yedek buton yerleşimi ve guard işlemi ayrıca DOM simülasyonunda kontrol edildi. Geometri taklit edildi; HTML içindeki Netflix betikleri çalıştırılmadı. Kullanıcı HTML'i depoya veya ZIP'e dahil edilmedi.
- Manifest'teki tüm içerik betiklerinin JavaScript sözdizimi kontrol edildi.

## Kanıtın sınırı

Happy DOM, kontrollü saat ve simüle edilmiş medya olayları kullanıldı. Popover aç/kapat durumu ve kontrol geometrisi testte modellenir. Bu, gerçek tarayıcı yerleşimini, tam ekranı, odağı, DRM oynatmasını veya Netflix'in gerçek geri sayımını doğrulamaz.

Kullanıcı önceki sürümde saniyelik zamanlayıcıları gerçek Netflix üzerinde başarıyla test ettiğini bildirmiştir. **0.2.0 bölüm sonu özelliği henüz gerçek Netflix üzerinde doğrulanmadı.** “Jeneriği İzle” düğmesi bilinen bir aday iptal kontrolüdür; tıklama girişimi yapıldığı doğrulanmıştır, Netflix'in dahili otomatik geçiş sayacını gerçekten iptal ettiği doğrulanmamıştır.

Önceki tarayıcı önizlemesi ortamın URL politikası tarafından engellenmiştir. Bu sürümde canlı Netflix veya tarayıcı ekran görüntüsü testi yapıldığı iddia edilmez.

## Canlı deneme

README'deki bölüm sonu adımlarını Friends ve uzun jenerikli bir bölüm üzerinde; normal/tam ekran, otomatik oynatma açık/kapalı ve dakika/Bölüm sonunda seçenekleriyle deneyin. Geçiş ekranı çıktığında durmalı ve geri sayımdan daha uzun beklenince dizi akıp gitmemelidir. Devam et oynatmalı; Zamanlayıcıyı kapat oynatmadan korumayı bırakmalıdır.

Bilinmeyen Netflix varyasyonları veya kaçırılan geçişte yeni video duraklatılmaya çalışılır. Sonraki bölümün hiçbir karesinin başlamadığı, izleme ilerlemesinin değişmediği veya tam sayfa yüklemesinde korumanın sürdüğü garantisi verilmez.
