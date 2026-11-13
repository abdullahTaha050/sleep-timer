# Kod yapısı

Eklentinin ortak davranışı `core/` ve `ui/` içinde; siteye özgü bilgi `adapters/` içindedir. Netflix ve HBO Max adaptörleri dağıtılır. HBO Max adaptörü paylaşılan HTML ile uygulanmış ve DOM simülasyonunda test edilmiştir; kullanıcı 0.3.0 süre desteğinin canlıda çalıştığını bildirmiştir. 0.3.1 dikey hizalama düzeltmesi görsel doğrulama bekler. Prime Video ve Disney+ henüz desteklenmez.

| Dosya | Sorumluluk |
|---|---|
| `extension/content.js` | Kayıtlı adaptörlerden mevcut siteye uyanı seçer, tek bir controller başlatır. |
| `extension/core/platform-registry.js` | Adaptör kaydı, arayüz kontrolü ve domain eşleştirmesi. |
| `extension/core/player-controller.js` | Video kimliği, DOM yenilenmesi, süre seçimi, bitiş, sayfa yaşam döngüsü ve kaynak temizliği. Site seçicisi içermez. |
| `extension/core/media-binding.js` | HTML video olayları, duraklat/bekle/devam et, eski video dinleyicilerini kaldırma ve ortak duraklatma işlemi. |
| `extension/core/timer.js` | DOM'dan bağımsız, test edilebilir süre hesabı. |
| `extension/core/playback-guard.js` | Ortak kapalı / bekliyor / durduruldu durumları. Durdurma kararı, kullanıcı açıkça bırakana kadar korunur. |
| `extension/adapters/netflix.js` | Netflix domain'i, izleme kimliği, ana video ve sağ kontrol grubunu bulma. |
| `extension/adapters/hbo.js` | HBO Max domain ve izleme yolu, ana video, normal sağ kontrol grubu ve platforma özel boyutlar. |
| `extension/ui/timer-ui.js` | Ortak Shadow DOM butonu, popover menü, seçenekler, kalan süre ve odak işlemleri. |
| `extension/ui/stop-notice.js` | Kontroller kaybolsa da erişilebilen durdurma bildirimi, Devam et ve korumayı kapatma. |
| `extension/ui/styles.js` | Ortak görünüm. İkon ve buton boyutları `rem` tabanlı CSS değişkenleriyle yönetilir. |
| `extension/shared/config.js` | Dakika/saniye seçenekleri, zamanlama aralıkları ve çevrilmiş controller durum mesajları. |
| `extension/shared/i18n.js` | Chrome i18n API erişimi; seçilen kataloğun dil etiketi, RTL yönü ve dinamik değerlerin yön izolasyonu. Config ve UI'dan önce yüklenir. |
| `extension/_locales/*/messages.json` | 23 dil/bölge için menü, bildirim, erişilebilirlik ve manifest çevirileri. Varsayılan dil İngilizcedir; çalışma zamanında ağ isteği veya harici kütüphane gerekmez. `languageCode` kataloğun BCP 47 dil etiketidir. |

## Akış

`content → registry → adapter + controller → media-binding / timer / UI`

Video olayları `media-binding` üzerinden sayacı günceller. Süre bittiğinde controller, adaptör özel bir işlem sunuyorsa onu; sunmuyorsa ortak `video.pause()` işlemini kullanır. Menü ve zamanlayıcı kodu yeni siteler için kopyalanmaz.

0.2.0'da controller, süre dolduğunda, bölüm sonu sinyali geldiğinde, doğal video bitişinde veya koruma etkinken video kimliği değiştiğinde guard'ı durdurulmuş duruma geçirir. Yeniden oynatma olaylarında ve periyodik kontrollerde video duraklatılır. Yeni video elemanının `play` olayı capture aşamasında da izlenir. Netflix'e ait seçiciler yalnızca adaptörde bulunur.

Guard, iptal kontrolüne basılmadan önce etkinleştirilir; iptal tıklaması videoyu yeniden oynatırsa koruma zaten aktiftir. Bir sinyal için bir, bir koruma oturumunda en fazla üç iptal tıklaması denenir. Durdurma bildiriminin soldaki eylemi süre dolmasında `guard.selection` içindeki tam süreyi yeniden kurar, bildirimi kapatıp oynatmayı başlatır. Diğer durdurma nedenlerinde Devam et korumayı kaldırıp zamanlayıcı kurmadan oynatır. Yeniden kurulan süre de bölüm sonuyla sınırlıdır. Oynatma reddedilirse sayaç bekler; eski oynatma isteğinin geç reddi yeni seçimin mesajını değiştirmez. Kapalı eylemi oynatmaz.

Chrome içerik betikleri `manifest.json` sırasıyla yüklenir. Modüller içerik betiğinin izole dünyasındaki tek `StreamSleepTimer` ad alanını paylaşır; siteye bir global API açılmaz. Eklentiyi çalıştırmak için derleme veya üçüncü taraf çalışma zamanı bağımlılığı gerekmez.

## Platform adaptörünün sözleşmesi

| Alan | Beklenen davranış |
|---|---|
| `id` | Benzersiz platform adı. |
| `matches(location)` | Bu adaptörün ilgili domain'i destekleyip desteklemediği. |
| `getPlaybackKey({document, location})` | Aktif izleme için kararlı bir string kimlik; izleme sayfası değilse `null`. Kimlik URL yolu, sorgu parametresi veya oynatıcı DOM'undan türetilebilir. Kontroller geçici kaybolunca aynı kimliği korumalıdır. |
| `findPlayer({document, location})` | Oynatıcı bulunamazsa `null`; bulunursa `{video, mount, root?}`. `root`, tam ekran içinde de durdurma bildiriminin bağlanacağı kapsayıcıdır; yoksa videonun ebeveyni kullanılır. Kontroller henüz yoksa `mount: null` kullanılabilir. |
| `mount.container` | Butonun bağlanacağı DOM elemanı. |
| `mount.before` | İsteğe bağlı yerleşim çapası. Belirtilmezse grubun başı, eleman verilirse o elemanın önü, `null` ise grubun sonu. |
| `pause(video)` | İsteğe bağlı, senkron platform işlemi. Başarı durumunda `true` döndürmeli; oynatmayı asla başlatmamalı. Yoksa ortak HTML video duraklatması kullanılır. |
| `appearance` | İsteğe bağlı `iconSize`, `controlSize`, `controlPadding` değerleri. Oransal `rem` değerleriyle siteye uyarlanabilir. |
| `getEpisodeEnd({document, location, video})` | İsteğe bağlı. Görünür bölüm sonu ekranında `{signal, cancelButton}` döndürür; yoksa `null`. `signal` o ekrana ait kararlı bir DOM elemanıdır. Sürekli görünen sıradan sonraki bölüm kontrolünü kullanmayın. Bu metot varsa menüde Bölüm sonunda görünür. |
| `cancelAutoplay(boundary)` | İsteğe bağlı, senkron. Platformun yerleşik geçiş iptal kontrolüne basmayı dener. Dönen `true` yalnızca girişim yapıldığını bildirir; iptal başarısı garantisi değildir. HTML'den veya gerçek testten doğrulanmamış düğmelere basmayın. |

Yeni adaptör dosyası kendisini `StreamSleepTimer.platforms.register(...)` ile kaydeder. Manifest'teki betik listesine `content.js` öncesinde eklenir; ilgili domain ancak gerçek destek doğrulandıktan sonra `matches` listesine eklenir. Bu geliştirmede kullanıcı HBO canlı testini kendisi yapacağını belirttiği için gözlenen domain 0.3.0 deneme paketine eklenmiştir; canlı doğrulama beklediği açıkça kaydedilir.

## HBO Max kapsamı

`www.hbomax.com/video/watch/<kimlik>` yolu kararlı kimlik sağlar; sorgu parametreleri kimliği değiştirmez. `playerContainer` içindeki `VideoElement` ana videodur. Buton yalnızca `playback_controls` içindeki `control_footer` sağ grubuna eklenir; aynı HTML'deki gizli `QuickCatchupOverlay` altındaki kopya kontrollere eklenmez. Üretilmiş sınıflara ve çevrilmiş metinlere bağımlılık yoktur.

0.4.0 adaptörü `getEpisodeEnd` sunar: mevcut videonun oynatıcısındaki `up_next → player-ux-up-next-container → player-ux-up-next-button` yapısında görünür düğmeyi sinyal sayar. Geometri, eleman ve atalarının gizlilik/CSS durumları kontrol edilir. Menüde Bölüm sonunda görünür; süre seçimi de bu sinyalle sınırlanır. Yeni HTML otomatik oynatma kapalı durumunu gösterir ve iptal kontrolü içermez; `cancelButton: null` döner, `cancelAutoplay` yoktur. Sonraki bölüm düğmesine basılmaz. Ortak guard yeniden oynatmayı/yeni videoyu duraklatır. Kart ve doğal bitiş kaçırılırken aynı URL'de içerik değişimini belirleyen ek sinyal henüz yoktur.

## Boyutlar

İkon `3.1875rem`, buton `4.500rem`, iç boşluk `.46875rem` değerlerini kullanır. Aktiflik noktası ve buton köşesi de `rem` ile ölçeklenir. Netflix boyutları korunur. HBO adaptörü başlangıç ölçüleri olarak ikon `1.5rem`, buton `2.75rem`, iç boşluk `.625rem` kullanır; gerçek yerleşim canlı test bekler.

Butonun dış kapsayıcısı flex satırında `align-self:center`, satır içi düzende `vertical-align:middle` kullanır; `line-height:0` metin satırından gelen boşluğu kaldırır. İkon ve tıklama alanı boyutları değişmez.

## Testler

0.4.0 için 48 test geçer. HBO için 22 test; görünür bölüm sonu kartı, gizli/ilgisiz kartları eleme, süre üst sınırı, iptal düğmesi olmadan koruma, sağ grup/çift kontrol ayrımı, süre ve medya beklemeleri, kontrol/video yenilenmesi, URL geçişi, doğal bitiş, iptal/devam ve sayfadan çıkış senaryolarını sadeleştirilmiş fixture ile kapsar.

`npm test`, saf zamanlayıcıyı, Netflix yapısındaki 24 senaryoyu, bölüm sonu korumasını, desteklenmeyen domain'i, adaptör kayıt doğrulamasını ve ikinci bir sentetik platformu kapsar. Diğer platform testi farklı URL kimliği, yerleşim, özel duraklatma, bölüm sonu sinyali ve iptali, video elemanı değişimi, dinleyici temizliği ve çift başlatmayı kontrol eder.

Netflix'in gerçek geri sayımı fixture tarafından taklit edilir; yerel testlerin geçmesi gerçek Netflix'te otomatik geçiş iptalinin doğrulandığı anlamına gelmez. Bilinmeyen bölüm sonu varyantları, askıya alınan sekme, tam sayfa gezinme ve platform yarışı için kesintisiz garanti verilmez.

DOM testleri ve yerel demo betik sırasını doğrudan manifest'ten okur. Sahte platform yalnızca test dosyalarında bulunur; dağıtılan eklentiye veya manifest izinlerine eklenmez.
