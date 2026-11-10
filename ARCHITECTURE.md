# Kod yapısı

Eklentinin ortak davranışı `core/` ve `ui/` içinde; siteye özgü bilgi `adapters/` içindedir. Şimdilik yalnızca Netflix adaptörü dağıtılır. HBO, Prime Video ve Disney+ için temel hazırdır; bu sitelerde destek varmış gibi davranılmaz.

| Dosya | Sorumluluk |
|---|---|
| `extension/content.js` | Kayıtlı adaptörlerden mevcut siteye uyanı seçer, tek bir controller başlatır. |
| `extension/core/platform-registry.js` | Adaptör kaydı, arayüz kontrolü ve domain eşleştirmesi. |
| `extension/core/player-controller.js` | Video kimliği, DOM yenilenmesi, süre seçimi, bitiş, sayfa yaşam döngüsü ve kaynak temizliği. Site seçicisi içermez. |
| `extension/core/media-binding.js` | HTML video olayları, duraklat/bekle/devam et, eski video dinleyicilerini kaldırma ve ortak duraklatma işlemi. |
| `extension/core/timer.js` | DOM'dan bağımsız, test edilebilir süre hesabı. |
| `extension/core/playback-guard.js` | Ortak kapalı / bekliyor / durduruldu durumları. Durdurma kararı, kullanıcı açıkça bırakana kadar korunur. |
| `extension/adapters/netflix.js` | Netflix domain'i, izleme kimliği, ana video ve sağ kontrol grubunu bulma. |
| `extension/ui/timer-ui.js` | Ortak Shadow DOM butonu, popover menü, seçenekler, kalan süre ve odak işlemleri. |
| `extension/ui/stop-notice.js` | Kontroller kaybolsa da erişilebilen durdurma bildirimi, Devam et ve korumayı kapatma. |
| `extension/ui/styles.js` | Ortak görünüm. İkon ve buton boyutları `rem` tabanlı CSS değişkenleriyle yönetilir. |
| `extension/shared/config.js` | Dakika/saniye seçenekleri, zamanlama aralıkları ve controller durum mesajları. |

## Akış

`content → registry → adapter + controller → media-binding / timer / UI`

Video olayları `media-binding` üzerinden sayacı günceller. Süre bittiğinde controller, adaptör özel bir işlem sunuyorsa onu; sunmuyorsa ortak `video.pause()` işlemini kullanır. Menü ve zamanlayıcı kodu yeni siteler için kopyalanmaz.

0.2.0'da controller, süre dolduğunda, bölüm sonu sinyali geldiğinde, doğal video bitişinde veya koruma etkinken video kimliği değiştiğinde guard'ı durdurulmuş duruma geçirir. Yeniden oynatma olaylarında ve periyodik kontrollerde video duraklatılır. Yeni video elemanının `play` olayı capture aşamasında da izlenir. Netflix'e ait seçiciler yalnızca adaptörde bulunur.

Guard, iptal kontrolüne basılmadan önce etkinleştirilir; iptal tıklaması videoyu yeniden oynatırsa koruma zaten aktiftir. Bir sinyal için bir, bir koruma oturumunda en fazla üç iptal tıklaması denenir. Durdurma bildiriminin Devam et eylemi önce korumayı kaldırır, sonra kullanıcı etkileşimi içinde oynatmayı başlatır. Kapalı eylemi oynatmaz.

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

Yeni adaptör dosyası kendisini `StreamSleepTimer.platforms.register(...)` ile kaydeder. Manifest'teki betik listesine `content.js` öncesinde eklenir; ilgili domain ancak gerçek destek doğrulandıktan sonra `matches` listesine eklenir.

## Boyutlar

İkon `3.1875rem`, buton `4.500rem`, iç boşluk `.46875rem` değerlerini kullanır. Aktiflik noktası ve buton köşesi de `rem` ile ölçeklenir. Mevcut kullanıcı boyut tercihleri bölüm sonu geliştirmesinde değiştirilmemiştir.

## Testler

`npm test`, saf zamanlayıcıyı, Netflix yapısındaki 24 senaryoyu, bölüm sonu korumasını, desteklenmeyen domain'i, adaptör kayıt doğrulamasını ve ikinci bir sentetik platformu kapsar. Diğer platform testi farklı URL kimliği, yerleşim, özel duraklatma, bölüm sonu sinyali ve iptali, video elemanı değişimi, dinleyici temizliği ve çift başlatmayı kontrol eder.

Netflix'in gerçek geri sayımı fixture tarafından taklit edilir; yerel testlerin geçmesi gerçek Netflix'te otomatik geçiş iptalinin doğrulandığı anlamına gelmez. Bilinmeyen bölüm sonu varyantları, askıya alınan sekme, tam sayfa gezinme ve platform yarışı için kesintisiz garanti verilmez.

DOM testleri ve yerel demo betik sırasını doğrudan manifest'ten okur. Sahte platform yalnızca test dosyalarında bulunur; dağıtılan eklentiye veya manifest izinlerine eklenmez.
