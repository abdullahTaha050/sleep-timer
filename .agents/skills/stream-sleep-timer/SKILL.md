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

## Sonraki aşama için kullanıcı tarafından belirtilen davranış

- Amaç, kullanıcı uyuduktan sonra film veya dizinin akıp gitmesini önlemektir.
- Seçilen süre mevcut videonun bitmesine kalan süreden büyükse zamanlayıcı otomatik olarak videonun sonunda durdurma moduna geçmeli; sonraki bölüm otomatik başlamamalıdır.
- Kullanıcı bu davranışın şimdilik yalnızca not edilmesini kabul etti; bu, ilk MVP'ye hemen ekleme talimatı değildir.
- Önceki, kalan sayacı sonraki bölüme taşıma önerisi kullanıcı tarafından benimsenmedi. Bölümler arasında devam eden sayacı ürün hedefi olarak uygulama.

## MVP uygulama tercihleri

- Kapalı ve 10/15/20/30/45/60 dakika seçenekleriyle başlamak; özel süre ve bölüm sonunda durdurmayı sonraya bırakmak.
- Süre bitince ilgili sekmenin ana videosunu duraklatmak; diğer sekmeleri etkilememek.
- Kalan süreyi menüde göstermek; Kapalı ile iptal, başka süre seçimiyle yeniden başlatma sunmak.
- Ortak zamanlayıcı ve menü mantığını platforma özgü oynatıcı uyarlamalarından ayırmak.
- Sunucu, hesap veya analitik gerektirmeyen; yalnızca desteklenen siteler için gerekli izinleri kullanan bir MVP hazırlamak.
- Kaynak paketinde MIT lisansı kullanıldı; kullanıcı ayrıca bir lisans tercihi bildirmedi.
- Çalışma adı Sleep Timer; Türkçe menü.
- Video oynatılırken geçen gerçek süre sayılır; oynatma hızının değiştirilmesi veya ileri/geri sarma kalan süreyi doğrudan değiştirmez. Duraklatma, yükleme beklemesi ve sarma sırasında sayaç bekler.
- Sayfa yenileme, izleme sayfasından çıkma, video bitişi ve başka videoya geçiş sayacı iptal eder. Aynı videonun kontrol çubuğunun yeniden oluşturulması sayacı iptal etmez.
- Saniyelik 5/10/30 seçenekleri menüde ayrı bir Test süreleri bölümündedir.
- Mevcut sürüm uzun seçimi video sonuna kısaltmaz ve otomatik sonraki bölüm geçişini engellemez. Bu eksikliği gizleme veya tamamlanmış gibi sunma.

## Netflix uyarlaması ve doğrulama

- Paylaşılan HTML'de ana video `[data-uia="player"] [data-uia="video-canvas"] video` altında bulunur; kontroller `[data-uia="controls-standard"]` altındadır.
- Sağ kontrol grubu örnekte `control-next`, `control-episodes`, `control-audio-subtitle`, `control-speed`, `control-fullscreen-enter` butonlarını içerir. Uyku butonu bu grubun başına eklenir.
- Üretilmiş CSS sınıf adlarına veya Türkçe buton metinlerine bağımlı seçim yapma.
- Kullanıcının tam HTML dökümünü kaynak depoya veya dağıtım paketine ekleme; testler için kişisel veri içermeyen sadeleştirilmiş yapı kullan.
- Kullanıcı ilk sürümün saniyelik testlerini gerçek Netflix üzerinde denediğini ve düzgün çalıştığını bildirdi. Bu bildirim refactor öncesine aittir.
- Refactor sonrası 12 test geçti: 8 zamanlayıcı testi, 23 senaryolu Netflix DOM testi ve 3 platform/mimari testi. Agent tarafından canlı Netflix, görsel düzen ve tam ekran doğrulaması yapılmadı.

## Kod mimarisi

- `extension/core/`: zamanlayıcı, medya olayları, controller ve platform kaydı. Platform domain'lerini, URL kalıplarını ve DOM seçicilerini buraya ekleme.
- `extension/adapters/`: platforma özgü `matches`, `getPlaybackKey`, `findPlayer`; gerekirse `pause` ve `appearance`.
- `extension/ui/`: ortak menü, buton ve stiller; `extension/shared/config.js`: süreler ve ortak ayarlar.
- `extension/content.js` yalnızca uygun adaptörü seçip controller'ı başlatır.
- Yeni platform için mevcut repodaki `ARCHITECTURE.md` adaptör sözleşmesini oku; ortak çekirdeği kopyalama. Manifest domain erişimini yalnızca doğrulanmış platformlar için genişlet.
- Ortak ikon `2.125rem`, buton `2.75rem`, iç boşluk `.3125rem` kullanır. Platforma özgü oran ayarı `appearance` üzerinden yapılabilir.

## Sonraki çalışmalarda uygulanacak değerlendirme

Yeni platform desteğini, o platformun gerçek oynatıcısında doğrulanmadan çalışıyor diye sunma. Menü yerleşimi, tam ekran, kontrol çubuğunun gizlenmesi ve yeniden oluşması, bölüm geçişi ve süre sonunda duraklatma davranışını incele. Bunlar ürün kapsamı seçiminin yerine geçmez.

Mağaza hazırlığında güncel resmi Chrome Web Store belgelerini kontrol et. Sayfa erişimi ve yerel veri kullanımını gerçek uygulamaya göre açıkla; ağ üzerinden veri göndermemeyi hiçbir veri işlenmediği iddiasıyla karıştırma.

Bu dosya depoya taşınabilecek bir skill teslimatıdır; global skill kurulumu, GitHub'a yükleme veya mağazada yayımlama yapılmış olduğu anlamına gelmez.
