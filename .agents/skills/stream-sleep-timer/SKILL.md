---
name: stream-sleep-timer
description: Plan and develop this project's open-source Chrome sleep timer extension for film and series streaming sites. Use for product decisions, player integration, and community contribution design in this project.
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
- Birden fazla platform aynı zamanlayıcı, medya olayları, yaşam döngüsü ve arayüzü kullanır. HBO, Prime Video ve Disney+ gelecekteki adaylardır; henüz desteklenmiş sayılmazlar.
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
- Devam et korumayı kaldırıp oynatır. Zamanlayıcıyı kapat / Kapalı yalnızca korumayı kaldırır; oynatmayı başlatmaz.
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
- Saniyelik 5/10/30 seçenekleri menüde ayrı bir Test süreleri bölümündedir.
- 0.2.0, görünür bölüm sonu sinyalini süreye üst sınır olarak uygular; sayısal bitiş süresi tahmin etmez. Gerçek Netflix geri sayım iptali henüz canlı doğrulanmadı.

## Netflix uyarlaması ve doğrulama

- Paylaşılan HTML'de ana video `[data-uia="player"] [data-uia="video-canvas"] video` altında bulunur; kontroller `[data-uia="controls-standard"]` altındadır.
- Sağ kontrol grubu örnekte `control-next`, `control-episodes`, `control-audio-subtitle`, `control-speed`, `control-fullscreen-enter` butonlarını içerir. Uyku butonu bu grubun başına eklenir.
- Üretilmiş CSS sınıf adlarına veya Türkçe buton metinlerine bağımlı seçim yapma.
- Kullanıcının tam HTML dökümünü kaynak depoya veya dağıtım paketine ekleme; testler için kişisel veri içermeyen sadeleştirilmiş yapı kullan.
- Kullanıcı ilk sürümün saniyelik testlerini gerçek Netflix üzerinde denediğini ve düzgün çalıştığını bildirdi. Bu bildirim refactor öncesine aittir.
- 0.2.0 için 26 test geçti: 8 zamanlayıcı, 24 senaryolu bir Netflix DOM testi, 13 bölüm sonu testi ve 4 platform/mimari testi. Yeni bölüm sonu HTML yapısında seçiciler ve tıklama girişimi de simülasyonda kontrol edildi. Canlı Netflix, geri sayım iptali, görsel düzen ve tam ekran doğrulaması agent tarafından yapılmadı.

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
