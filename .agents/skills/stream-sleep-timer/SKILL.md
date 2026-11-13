---
name: stream-sleep-timer
description: Plan and develop this project's open-source Chrome sleep timer extension for film and series streaming sites. Use for product decisions, interface design, player integration, and community contribution design in this project.
---

# Film ve dizi oynatıcıları için uyku zamanlayıcısı

## Kullanıcının belirlediği çerçeve

- YouTube'dan bağımsız bir Chrome eklentisi geliştirilecek. YouTube uyku zamanlayıcısı yalnızca etkileşim örneğidir.
- Eklenti, desteklenen sitenin oynatıcısına sayfanın DOM yapısı üzerinden bir buton ekleyecek.
- Butonun hedef konumu sağdaki oynatıcı kontrol grubunun en soludur; tüm kontrol çubuğunun en solu değildir.
- Butona basıldığında süre seçenekleri bulunan bir menü açılacak.
- Kullanıcının görseli koyu, yarı saydam bir menü; seçili satırda onay işareti; Kapalı, 10, 15, 20, 30, 45, 60 dakika ve Videonun sonu seçeneklerini örnekliyor. Görsel bir tasarım referansıdır; seçeneklerin tamamı kesinleşmiş MVP gereksinimi değildir.
- Özel süre girişi ilk MVP için zorunlu değildir; sağlam bir MVP sonrasında değerlendirilebilir.
- İlk desteklenecek platform Netflix'tir.
- Video duraklatılınca sayaç da durur; oynatma yeniden başladığında kalan süre üzerinden devam eder.
- Menüde “Video duraklatıldığında sayaç da durur” açıklaması gösterilmez; davranış korunur.
- İkon ve buton boyutları sabit piksel yerine `rem` ile oranlı ölçeklenir.
- Birden fazla platform aynı zamanlayıcı, medya olayları, yaşam döngüsü ve arayüzü kullanır. Kullanıcı HBO HTML'ini paylaşıp desteğin eklenmesini istedi; 0.3.0 HBO Max süre desteğini içerir ve canlı testi kullanıcı yapacaktır. Prime Video ve Disney+ gelecekteki adaylardır.
- İlk testlerde saniye cinsinden kısa süreler de kullanılacak. Bu, son kullanıcı menüsüne kalıcı saniye seçenekleri ekleme kararı değildir.
- Proje GitHub'da açık kaynak olarak paylaşılacak ve topluluk katkılarına açık olacak.
- Kullanıcı konsept görüşmesinden sonra ilk Netflix MVP'sinin uygulanmasını istedi; uygulama aşamasına geçildi.
- Kullanıcıyla kesinleşen kararları bu skill içinde güncel tut; önerileri kabul edilmiş karar gibi kaydetme.

## Henüz kararlaştırılmamış konular

Kalıcı ürün adı ve mağaza markası henüz seçilmedi. Aşağıdaki MVP uygulama tercihleri, kullanıcının tek tek belirttiği şartlar değil, ilk sürüm için seçilen varsayılanlardır; sonraki geri bildirimle güncellenebilir.

## Kesinleşen bölüm sonu davranışı

- Bölüm sonu, jeneriğin tamamının bitmesi değil platformun bölüm sonu geçiş ekranının görünmesidir. Kullanıcı bu davranışı kabul etti ve Netflix Friends geçiş ekranının HTML'ini paylaştı.
- Menüde Bölüm sonunda seçeneği vardır. Dakika/saniye seçildiğinde süre veya bölüm sonu sinyalinden hangisi önce gelirse durdurulur; başka bölüme süre taşınmaz.
- Netflix örneğinde watch-credits-seamless-button (Jeneriği İzle) ve next-episode-seamless-button-draining bulunur. Normal control-next ile karıştırma; gizli kontrolleri tetikleyici sayma.
- Önce durdurma koruması etkinleşir, sonra Jeneriği İzle ile otomatik geçişi iptal etme girişimi yapılır. Statik HTML, bu tıklamanın gerçek Netflix geri sayımını iptal ettiğini kanıtlamaz.
- Koruma etkinken yeni bölüm açılırsa veya oynatma yeniden başlarsa video tekrar duraklatılır. Manuel bölüm değiştirme de korumaya takılır; açık Devam et veya Kapalı ile kullanıcı korumayı kaldırır.
- Süre dolduğunda mevcut soldaki mavi buton (yeni buton eklemeden) son seçilen tam süreyi baştan başlatır, bildirimi kapatır ve oynatmayı sürdürür. Buton seçilen süreyi gösterir: ör. “10 dakika daha” / “5 sn daha”; İngilizce karşılıkları da vardır. Her doluşta tekrar kullanılabilir. Yeniden başlatılan süre duraklatma ve bölüm sonu kurallarına tabidir.
- Bölüm sonu, doğal bitiş ve bölüm değişiminde Devam et korumayı kaldırıp zamanlayıcı kurmadan oynatır. Zamanlayıcıyı kapat / Kapalı yalnızca korumayı kaldırır; oynatmayı başlatmaz.
- İptal tıklaması sinyal başına bir, koruma oturumu başına en fazla üç kez denenir. Başarısızlıkta duraklatma koruması sürer.
- Yeni bölümün hiçbir karesinin başlamayacağı veya izleme ilerlemesinin hiç değişmeyeceği garantisi verme. Koruma sayfa belleğindedir; tam sayfa yenilemede ve izleme sayfasından çıkışta temizlenir.

## MVP uygulama tercihleri

- Kapalı, 10/15/20/30/45/60 dakika ve Bölüm sonunda seçenekleri sunulur. Özel süre girişi sonraki aşamadadır.
- Süre bitince ilgili sekmenin ana videosunu duraklatmak; diğer sekmeleri etkilememek.
- Kalan süreyi menüde göstermek; Kapalı ile iptal, başka süre seçimiyle yeniden başlatma sunmak.
- Ortak zamanlayıcı ve menü mantığını platforma özgü oynatıcı uyarlamalarından ayırmak.
- Sunucu, hesap veya analitik gerektirmeyen; yalnızca desteklenen siteler için gerekli izinleri kullanan bir MVP hazırlamak.
- Kaynak paketinde MIT lisansı kullanıldı; kullanıcı ayrıca bir lisans tercihi bildirmedi.
- Çalışma adı Sleep Timer; Türkçe menü.
- Video oynatılırken geçen gerçek süre sayılır; oynatma hızının değiştirilmesi veya ileri/geri sarma kalan süreyi doğrudan değiştirmez. Duraklatma, yükleme beklemesi ve sarma sırasında sayaç bekler.
- Sayfa yenileme ve izleme sayfasından çıkma sayacı ve korumayı temizler. Video bitişi ve koruma etkinken başka videoya geçiş durdurma korumasını etkinleştirir. Kontrol çubuğunun yeniden oluşturulması sayacı iptal etmez.
- Saniyelik 5/10/30 seçenekleri yalnızca yerel geliştirme sürümünde ayrı bir Test süreleri bölümündedir. Kullanıcı 13 Kasım 2026'da mağaza sürümünde görünmemesini istedi. `shared/build.js` yerelde açık, `npm run package` ile üretilen eklenti ZIP'inde kapalıdır; kaynak ZIP'i geliştirme ayarını korur. Bölüm yayın sürümünde DOM'a eklenmez. Yerel kaynak dosyası paketleme sırasında değiştirilmez.
- 0.2.0, görünür bölüm sonu sinyalini süreye üst sınır olarak uygular; sayısal bitiş süresi tahmin etmez. Gerçek Netflix geri sayım iptali henüz canlı doğrulanmadı.

## Netflix uyarlaması ve doğrulama

- Paylaşılan HTML'de ana video `[data-uia="player"] [data-uia="video-canvas"] video` altında bulunur; kontroller `[data-uia="controls-standard"]` altındadır.
- Sağ kontrol grubu örnekte `control-next`, `control-episodes`, `control-audio-subtitle`, `control-speed`, `control-fullscreen-enter` butonlarını içerir. Uyku butonu bu grubun başına eklenir.
- Üretilmiş CSS sınıf adlarına veya Türkçe buton metinlerine bağımlı seçim yapma.
- Kullanıcının tam HTML dökümünü kaynak depoya veya dağıtım paketine ekleme; testler için kişisel veri içermeyen sadeleştirilmiş yapı kullan.
- Kullanıcı ilk sürümün saniyelik testlerini gerçek Netflix üzerinde denediğini ve düzgün çalıştığını bildirdi. Bu bildirim refactor öncesine aittir.
- 0.2.0 için 26 test geçti: 8 zamanlayıcı, 24 senaryolu bir Netflix DOM testi, 13 bölüm sonu testi ve 4 platform/mimari testi. Yeni bölüm sonu HTML yapısında seçiciler ve tıklama girişimi de simülasyonda kontrol edildi. Canlı Netflix, geri sayım iptali, görsel düzen ve tam ekran doğrulaması agent tarafından yapılmadı.

## HBO Max uyarlaması — 0.4.0

- Kullanıcı 11 Kasım 2026'da HBO HTML'ini paylaşarak desteğin geliştirilmesini ve testlerin çalıştırılmasını istedi; canlı testi kendisi yapacak.
- Paylaşılan HTML'de gözlenen origin/yol `www.hbomax.com/video/watch/<kimlik>`; manifest erişimi yalnızca bu HBO domain'ine genişletildi. `max.com` ve diğer alt domain'ler eklenmedi.
- Ana video `[data-testid="playerContainer"] video[data-testid="VideoElement"]`; sağ grup yalnızca `playback_controls` içindeki `control_footer` altında bulunur. Buton ses kontrolünün önüne eklenir. Gizli `QuickCatchupOverlay` aynı kontrollere sahip olduğundan genel footer araması kullanılmaz.
- İlk HTML'de `up_next` boş/gizliydi. Kullanıcının daha sonra paylaştığı bölüm sonu HTML'inde `up_next → player-ux-up-next-container → player-ux-up-next-button` görünürdür. 0.4.0'da `getEpisodeEnd` bu yapıyı mevcut videonun oynatıcısında, görünürlük kontrolüyle algılar; HBO menüsünde Bölüm sonunda sunulur ve dakika/saniye süreleri de kartla sınırlanır.
- Yeni örnekte “Otomatik oynatma kapalı” yazıyor; geri sayımı iptal eden ayrı kontrol yok. Sonraki Bölüm düğmesi oynatmayı başlatır: asla iptal kontrolü olarak tıklama. `cancelButton: null` döner; `cancelAutoplay` yoktur. Ortak guard video yeniden oynarsa veya yeni video gelirse duraklatmayı sürdürür. Kart ve doğal bitiş kaçırılırken URL değişmeden içerik değişimi için ek kimlik sinyali henüz yoktur.
- HBO adaptörünün başlangıç boyutları ikon `1.5rem`, buton `2.75rem`, iç boşluk `.625rem`; Netflix ve ortak stil değerleri korunur. Boyutlar canlı görsel doğrulama bekler.
- Kullanıcı 0.3.0 HBO süre desteğinin canlıda çalıştığını bildirdi; ay ikonunun diğer kontrollerden aşağıda kaldığı ekran görüntüsünü paylaştı. Bölüm sonu geliştirmesinden önce hizalama düzeltmesini istedi. 0.3.1'de ortak buton kapsayıcısına `align-self:center`, `vertical-align:middle` ve `line-height:0` eklendi; ikon/buton ölçüleri korunur. Yerel tarayıcı önizlemesi URL politikası tarafından engellendi; bu hizalama düzeltmesi henüz görsel/canlı doğrulanmadı.
- 38 otomatik test geçti; 12'si HBO için kişisel veri içermeyen fixture kullanır. Paylaşılan orijinal HTML ayrıca bellekte, sayfa betikleri ve ağ kapalı olarak kontrol edildi; depoya/pakete kopyalanmadı. Bunlar gerçek HBO/DRM, otomatik geçiş, tam ekran veya görsel doğrulama değildir.
- 0.4.0'da 48 test geçti; 22'si HBO testidir. 10 yeni test bölüm sonu algılama ve koruma senaryolarını kapsar. Yeni döküm bellekte kontrol edildi; yalnızca sadeleştirilmiş fixture depoya eklendi. Gerçek HBO bölüm sonu ve otomatik oynatma davranışı kullanıcı canlı testini bekler.
- Kullanıcı HBO/tarayıcı erişim denemesi yapılmamasını ve yalnızca kod tarafındaki testlerin çalıştırılmasını istedi; canlı kontrolleri kendisi yapacak. Bu talep yerel tarayıcı önizlemesine ilişkin önceki genel yönergelerden önceliklidir.
- Menü dışına tıklamanın yalnızca menüyü kapatması ayrı bir öneridir; kullanıcı şimdilik uygulanmamasını ve yalnızca bölüm sonu özelliğinin geliştirilmesini istedi.

## Arayüz tasarım ilkeleri

- Kullanıcı 13 Kasım 2026'da görseldeki 23 dil/bölgenin eklenmesini önceliklendirdi: de, en, id, ms, vi, tr, es, fr, it, pl, pt_BR, pt_PT, ru, he, ur, ar, fa, hi, th, zh_CN, zh_TW, ja, ko. Menü, bildirim, hata, erişilebilirlik ve manifest açıklamaları yerel Chrome kataloglarından gelir; eşleşmeyen dillerde İngilizce kullanılır. Arapça/Farsça/İbranice/Urduca RTL'dir; süre değerleri yön izolasyonuyla korunur. Mavi bildirim butonu solda kalır. Harici çeviri servisi veya çalışma zamanı bağımlılığı ekleme. Commitizen önerisi sonraya bırakıldı; bu görevde commit/release akışı değişmedi.
- Kullanıcı Apple'ın web sitesini tasarım referansı seçti: kısa metinler, belirgin tipografi, ferah boşluklar, sade yüzeyler ve net eylem hiyerarşisi. Referans: https://www.apple.com/ . Apple markasını veya varlıklarını kopyalama.
- Bölüm sonu panelinde tek bir durum başlığı ve iki eylem yeterlidir. Tekrarlayan açıklama, teknik koruma mesajı, pazarlama cümlesi veya ek etiket ekleme. Hata varsa kullanıcının ne yapacağını belirten gerekli yönlendirmeyi koru.
- Birincil eylem süre dolduğunda seçilen süreyi tekrar başlatır (ör. “10 dakika daha”), diğer durdurmalarda “Devam et”tir; ikincil eylem “Zamanlayıcıyı kapat”. Kullanıcı 11 Kasım 2026'da yeni buton eklenmemesini, mevcut soldaki mavi butonun kullanılmasını açıkça istedi. İkinci eylemi belirsiz bir çarpı ikonuna indirgeme; kapatmak oynatmayı başlatmaz.
- Panel kullanıcının sistem/tarayıcı renk tercihini `prefers-color-scheme` ile izler; tercih değişince açık/koyu renkler yenilenir. Netflix sayfasının koyu arka planını kullanıcının tema tercihi sayma.
- Mevcut uygulama ölçüleri başlangıç noktasıdır: 400 px azami genişlik, 24 px iç boşluk ve köşe yarıçapı, 20 px yarı kalın başlık, 44 px asgari buton yüksekliği. Dar alanda eylemler alt alta geçer; metin ve panel taşmaz.
- Yerel sistem yazı tipleri, nötr yüzeyler ve tek bir mavi birincil eylem rengi kullan. Dikkat dağıtan gradyan, parlama, ağır çerçeve veya gereksiz animasyon ekleme; gölgeyi yüzeyi ayıracak kadar tut.
- İkon dekoratifse erişilebilirlik ağacından çıkar. Durum değişikliğini ekran okuyucuya bildir; görünür klavye odağı, açık/koyu temada okunabilir kontrast, azaltılmış hareket ve yüksek kontrast tercihlerini koru.
- Stil değişikliklerini ortak `ui/stop-notice.js` üzerinden yap. Açık/koyu görünümü, dar ekranı ve klavye kullanımını yerel tarayıcı önizlemesinde kontrol et; bunu canlı Netflix doğrulaması olarak sunma.

## Kod mimarisi

- `extension/core/`: zamanlayıcı, medya olayları, controller ve platform kaydı. Platform domain'lerini, URL kalıplarını ve DOM seçicilerini buraya ekleme.
- `extension/adapters/`: platforma özgü `matches`, `getPlaybackKey`, `findPlayer`; gerekirse `pause`, `appearance`, `getEpisodeEnd` ve `cancelAutoplay`.
- `extension/ui/`: ortak menü, buton ve stiller; `extension/shared/config.js`: süreler ve ortak ayarlar.
- `extension/content.js` yalnızca uygun adaptörü seçip controller'ı başlatır.
- Yeni platform için mevcut repodaki `ARCHITECTURE.md` adaptör sözleşmesini oku; ortak çekirdeği kopyalama. Manifest domain erişimini yalnızca doğrulanmış platformlar için genişlet.
- Mevcut ikon `3.1875rem`, buton `4.500rem`, iç boşluk `.46875rem` kullanır. Kullanıcının boyut değişikliklerini koru; platforma özgü oran ayarı `appearance` üzerinden yapılabilir.
- `core/playback-guard.js` ortak durdurma durumunu, `ui/stop-notice.js` ortak Devam et / kapatma bildirimini sağlar. Platform başına kopyalama.

## Sonraki çalışmalarda uygulanacak değerlendirme

Yeni platform desteğini, o platformun gerçek oynatıcısında doğrulanmadan çalışıyor diye sunma. Menü yerleşimi, tam ekran, kontrol çubuğunun gizlenmesi ve yeniden oluşması, bölüm geçişi ve süre sonunda duraklatma davranışını incele. Bunlar ürün kapsamı seçiminin yerine geçmez.

Mağaza hazırlığında güncel resmi Chrome Web Store belgelerini kontrol et. Sayfa erişimi ve yerel veri kullanımını gerçek uygulamaya göre açıkla; ağ üzerinden veri göndermemeyi hiçbir veri işlenmediği iddiasıyla karıştırma.

Bu dosya depoya taşınabilecek bir skill teslimatıdır; global skill kurulumu, GitHub'a yükleme veya mağazada yayımlama yapılmış olduğu anlamına gelmez.
