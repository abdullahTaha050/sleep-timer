# Kod yapısı

Eklentinin ortak davranışı `core/` ve `ui/` içinde; siteye özgü bilgi `adapters/` içindedir. Şimdilik yalnızca Netflix adaptörü dağıtılır. HBO, Prime Video ve Disney+ için temel hazırdır; bu sitelerde destek varmış gibi davranılmaz.

| Dosya | Sorumluluk |
|---|---|
| `extension/content.js` | Kayıtlı adaptörlerden mevcut siteye uyanı seçer, tek bir controller başlatır. |
| `extension/core/platform-registry.js` | Adaptör kaydı, arayüz kontrolü ve domain eşleştirmesi. |
| `extension/core/player-controller.js` | Video kimliği, DOM yenilenmesi, süre seçimi, bitiş, sayfa yaşam döngüsü ve kaynak temizliği. Site seçicisi içermez. |
| `extension/core/media-binding.js` | HTML video olayları, duraklat/bekle/devam et, eski video dinleyicilerini kaldırma ve ortak duraklatma işlemi. |
| `extension/core/timer.js` | DOM'dan bağımsız, test edilebilir süre hesabı. |
| `extension/adapters/netflix.js` | Netflix domain'i, izleme kimliği, ana video ve sağ kontrol grubunu bulma. |
| `extension/ui/timer-ui.js` | Ortak Shadow DOM butonu, popover menü, seçenekler, kalan süre ve odak işlemleri. |
| `extension/ui/styles.js` | Ortak görünüm. İkon ve buton boyutları `rem` tabanlı CSS değişkenleriyle yönetilir. |
| `extension/shared/config.js` | Dakika/saniye seçenekleri, zamanlama aralıkları ve controller durum mesajları. |

## Akış

`content → registry → adapter + controller → media-binding / timer / UI`

Video olayları `media-binding` üzerinden sayacı günceller. Süre bittiğinde controller, adaptör özel bir işlem sunuyorsa onu; sunmuyorsa ortak `video.pause()` işlemini kullanır. Menü ve zamanlayıcı kodu yeni siteler için kopyalanmaz.

Chrome içerik betikleri `manifest.json` sırasıyla yüklenir. Modüller içerik betiğinin izole dünyasındaki tek `StreamSleepTimer` ad alanını paylaşır; siteye bir global API açılmaz. Eklentiyi çalıştırmak için derleme veya üçüncü taraf çalışma zamanı bağımlılığı gerekmez.

## Platform adaptörünün sözleşmesi

| Alan | Beklenen davranış |
|---|---|
| `id` | Benzersiz platform adı. |
| `matches(location)` | Bu adaptörün ilgili domain'i destekleyip desteklemediği. |
| `getPlaybackKey({document, location})` | Aktif izleme için kararlı bir string kimlik; izleme sayfası değilse `null`. Kimlik URL yolu, sorgu parametresi veya oynatıcı DOM'undan türetilebilir. Kontroller geçici kaybolunca aynı kimliği korumalıdır. |
| `findPlayer({document, location})` | Oynatıcı bulunamazsa `null`; bulunursa `{video, mount}`. Video ana içerik olmalıdır. Kontroller henüz yoksa `mount: null` kullanılabilir. |
| `mount.container` | Butonun bağlanacağı DOM elemanı. |
| `mount.before` | İsteğe bağlı yerleşim çapası. Belirtilmezse grubun başı, eleman verilirse o elemanın önü, `null` ise grubun sonu. |
| `pause(video)` | İsteğe bağlı, senkron platform işlemi. Başarı durumunda `true` döndürmeli; oynatmayı asla başlatmamalı. Yoksa ortak HTML video duraklatması kullanılır. |
| `appearance` | İsteğe bağlı `iconSize`, `controlSize`, `controlPadding` değerleri. Oransal `rem` değerleriyle siteye uyarlanabilir. |

Yeni adaptör dosyası kendisini `StreamSleepTimer.platforms.register(...)` ile kaydeder. Manifest'teki betik listesine `content.js` öncesinde eklenir; ilgili domain ancak gerçek destek doğrulandıktan sonra `matches` listesine eklenir.

## Boyutlar

Ortak ikon `2.125rem`, buton `2.75rem`, iç boşluk `.3125rem` değerlerini kullanır. Aktiflik noktası ve buton köşesi de `rem` ile ölçeklenir. Böylece ikon/buton oranı korunur. 16px kök yazı boyutunda bunlar önceki 34/44/5px ölçülerine eşittir; farklı kök yazı boyutlarında birlikte ölçeklenir. Menü ölçüleri bu değişiklikte korunmuştur.

## Testler

`npm test`, saf zamanlayıcıyı, Netflix yapısındaki 23 senaryoyu, desteklenmeyen domain'i, adaptör kayıt doğrulamasını ve ikinci bir sentetik platformu kapsar. İkinci platform testi farklı URL kimliği, farklı buton yerleşimi, özel duraklatma, video elemanının değişmesi ve geçici kaybolması, eski dinleyicilerin temizlenmesi ve çift başlatmayı kontrol eder.

DOM testleri ve yerel demo betik sırasını doğrudan manifest'ten okur. Sahte platform yalnızca test dosyalarında bulunur; dağıtılan eklentiye veya manifest izinlerine eklenmez.
