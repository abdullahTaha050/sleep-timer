# Doğrulama kaydı

## 23 dil / bölge desteği — 13 Kasım 2026

- Görseldeki 23 dil/bölge için 27 kullanıcı metni ve katalog dil etiketi tamamlandı. Türkçe ve İngilizce korunarak 21 katalog eklendi; Portekizce ve Çince bölgesel varyantları ayrıdır.
- `npm test`: **115 test, 0 hata**. Katalog anahtarları ve yer tutucuları, açıklama uzunluğu, bölgesel katalog/temel dil/İngilizce seçimi, menü/bildirim metinleri, erişilebilirlik etiketleri ve tekrar butonu kontrol edildi. Arapça, Farsça, İbranice ve Urduca için `dir=rtl` ve sayısal sürelerin yön izolasyonu doğrulandı.
- Paket testi 23 kataloğun gerçek yayın ZIP'ine eksiksiz girdiğini ve tüm dillerde test sürelerinin gizli kaldığını doğrular. Yerel sürümde test süreleri korunur. `npm run package` dağıtım paketlerini üretir.
- Testler Chrome i18n API taklidi ve Happy DOM kullanır. Gerçek Chrome dil seçimi, görsel yerleşim, tam ekran ve canlı Netflix/HBO testi yapılmadı. Çeviriler ana dili konuşan editörlerce ayrıca incelenmedi.

## Yerel test süreleri / yayın paketi — 13 Kasım 2026, 0.4.2

- `npm test`: **80 test, 0 hata**. Yeni paket testi gerçek paketleme betiğini geçici klasörde çalıştırır; yayın ZIP'indeki betiklerle Türkçe ve İngilizce menüyü oluşturur. Test bölümü ve 5/10/30 saniye seçenekleri yoktur; dakika seçimi, menünün açılıp kapanması ve bölüm sonu seçeneği korunur.
- Yerel eklenti ve kaynak ZIP'inde test süreleri kalır. Paketleme yerel ayar dosyasını değiştirmez; iki ZIP'e de `node_modules` girmez. `npm run package` yayın ve kaynak paketlerini üretir.
- Doğrulama yerel DOM simülasyonu ve ZIP içerik kontrolüdür; gerçek Chrome Web Store kurulumu veya canlı Netflix/HBO testi yapılmadı.

## Önceki kayıtlar — 0.4.0

11 Kasım 2026

## Süreyi yeniden başlatma

- Yeni buton eklenmedi; mevcut soldaki mavi buton süre dolduğunda seçilen dakika/saniyeyi gösterip aynı süreyi baştan başlatır, bildirimi kapatır ve oynatmayı dener. Diğer durdurma nedenlerinde Devam et davranışı korunur.
- `npm test`: **79 test, 0 hata**. 16 yeni test; iki platformda son seçimi, art arda tekrarları, bekleme/duraklatma süresini, ikinci kez durmayı, kapatmayı, kontrol/video yenilenmesini, senkron/asenkron oynatma hatalarını, eski hata yanıtlarını, sayfadan çıkışı ve bölüm sonu sınırını kapsar. Türkçe/İngilizce buton metinleri de doğrulandı.
- Bunlar yerel DOM ve medya simülasyonlarıdır. Canlı Netflix/HBO, görsel yerleşim ve tam ekran doğrulanmadı; tarayıcı erişimi denenmedi.

## Türkçe / İngilizce arayüz

- `npm test`: **63 test, 0 hata**. 10 yeni test; Türkçe ve İngilizce bölgesel dil kodları, desteklenmeyen dillerde İngilizce, menü/durum/bildirim/erişilebilirlik metinleri ve çeviri yer tutucularını kapsar.
- Netflix ve HBO fixture'larında İngilizce geri sayım, duraklatma, süre dolması ve Devam et akışı geçti. Önceki menü dışındaki ilk tıklamayı tüketme testleri de geçti.
- Chrome i18n API'si testlerde yerel katalogları okuyan bir taklitle çalıştırıldı. Gerçek Chrome dil seçimi, görsel metin yerleşimi ve canlı Netflix/HBO doğrulanmadı.

## HBO bölüm sonu — 0.4.0

- `npm test`: **48 test, 0 hata**. 10 yeni bölüm sonu testi ve güncellenen menü testiyle toplam 22 HBO testi geçer; Netflix testleri de geçti.
- Görünür bölüm sonu kartıyla erken durma; dakika/saniye süresine üst sınır; boş/gizli/inert/yerleşimsiz kartlar; başka oynatıcı ve sıradan kontroller; kart zaten görünürken seçim; Kapalı; kart kaldırıldıktan sonra ve URL henüz değişmeden yeni video başladığında koruma test edildi.
- Normal kontroller yokken bildirim, Devam et ve oynatmadan kapatma; görünürlük değişiminin MutationObserver ile yakalanması test edildi. Sonraki Bölüm düğmesine sıfır tıklama yapıldığı kontrol edildi.
- Kullanıcının yeni HTML dökümü yalnızca bellekte, sayfa kodu ve dış kaynak yüklemeleri kapalı ortamda kontrol edildi. Görünür kart algılandı, simüle edilmiş video durduruldu; aynı kart gizlenince sinyal üretmedi. Döküm depoya veya paketlere eklenmedi; sadeleştirilmiş ayrı fixture kullanıldı.
- Örnek kartta “Otomatik oynatma kapalı” yazıyor. İptal kontrolü bulunmadığından HBO geri sayımını iptal eden bir işlem uygulanmadı. Sonraki Bölüm düğmesi oynatma eylemidir ve tıklanmaz. Otomatik oynatma açıkken farklı bir kart yapısı oluşursa ayrıca HTML örneği gerekir.
- Kullanıcı isteği doğrultusunda yalnızca yerel kod/DOM testleri çalıştırıldı; HBO’ya erişim ve tarayıcı denemesi yapılmadı. Gerçek geri sayım, DRM, tam ekran ve yeni bölüm davranışı kullanıcı canlı testini bekler. Menü dışına tıklama davranışı bu geliştirmede değiştirilmedi.

## HBO hizalama düzeltmesi — 0.3.1

- `npm test`: **38 test, 0 hata**. JavaScript sözdizimi ve `git diff --check` kontrolleri de geçti. DOM testleri görsel hizalamayı ölçmez.
- Kullanıcı 0.3.0 HBO desteğinin canlıda çalıştığını bildirdi; ay ikonunun diğer kontrollerden aşağıda kaldığı ekran görüntüsünü paylaştı. Bu bildirim tam ekran ve tüm geçiş senaryolarının tek tek doğrulandığı anlamına gelmez.
- Buton dış kapsayıcısına `align-self:center`, `vertical-align:middle` ve `line-height:0` eklendi. İkon/buton ölçüleri ve zamanlayıcı davranışı korunur.
- Yerel tarayıcı önizlemesi `net::ERR_BLOCKED_BY_CLIENT` ile engellendi. Düzeltmenin gerçek tarayıcıdaki görsel sonucu veya canlı HBO görünümü doğrulanamadı.

## HBO Max — 0.3.0

- `npm test`: **38 test, 0 hata**. Önceki 26 test ve 12 yeni HBO testi geçti.
- HBO testleri; domain/yol kapsamını, doğru ana videoyu, sağ grupta ses kontrolünün önüne tek buton eklenmesini, gizli QuickCatchupOverlay kopyasını dışlamayı, dakika/saniye menüsünü ve doğrulanmamış bölüm sonu seçeneğinin gösterilmemesini kapsar.
- Süre sonunda duraklatma, duraklatma/yükleme/sarma sırasında bekleme, diğer videoya dokunmama, kontrol çubuğu ve video elemanı yenilenmesi, sorgu parametresi değişiminde süreyi koruma, URL değişiminde koruma, doğal bitiş, Devam et/Kapalı ve ana sayfaya çıkış kontrol edildi.
- Kullanıcının HBO HTML'i ayrıca yalnızca bellekte incelendi. Sayfa betikleri, iframe yüklemesi ve ağ kaynakları kapalı tutularak adaptörün gerçek dökümde doğru video ve kontrol grubunu bulduğu, tek buton eklediği ve simüle edilmiş videoyu duraklattığı kontrol edildi. Orijinal HTML kaynaklara veya paketlere eklenmedi; kalıcı test fixture'ı sadeleştirilmiş ve kişisel verilerden arındırılmıştır.
- HBO'da bölüm sonu kartı ve iptal düğmesi mevcut örnekten doğrulanamadı. `up_next` boş ve gizlidir; Bölüm sonunda seçeneği HBO'da yoktur. URL değişmeden içerik değişimi için ayrı bir kimlik sinyali yoktur.
- **Gerçek HBO oynatması, DRM, kontrol ölçüleri/yerleşimi, tam ekran ve otomatik bölüm geçişi denenmedi.** Canlı testi kullanıcı yapacaktır; adımlar README'deki HBO Max bölümündedir.

## Önceki Netflix doğrulaması — 0.2.0

### Geçen kontroller

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
