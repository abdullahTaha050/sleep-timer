# Katkıda bulunma

Hata bildiriminde Chrome ve eklenti sürümünü, normal/tam ekran durumunu, seçilen süreyi ve tekrar üretme adımlarını yazın. Tam sayfa HTML dökümlerini paylaşmak yerine gerekli oynatıcı elemanlarının sadeleştirilmiş örneğini kullanın; hesap bilgilerini ve oturum verilerini eklemeyin.

## Değişiklikler

1. Depoyu fork edip bir dal açın.
2. `npm ci --ignore-scripts` ve `npm test` çalıştırın.
3. `npm run demo` ile davranışı inceleyin; ilgili değişikliği gerçek desteklenen platformda da deneyin.
4. Pull request'te problemi, yeni davranışı ve doğrulama sonucunu açıklayın. Gerçek platformda test edilmediyse açıkça belirtin.

Katkılar projenin MIT lisansı altında sunulur. Mağazadaki sürüme eklenmeden önce proje sahibi tarafından incelenir.

## Yeni platform ekleme

Önce [ARCHITECTURE.md](ARCHITECTURE.md) içindeki adaptör sözleşmesini okuyun. `extension/adapters/netflix.js` benzeri bir adaptör hazırlayın; `id`, `matches`, `getPlaybackKey` ve `findPlayer` sağlayıp platform kaydına ekleyin. Ortak zamanlayıcı, medya dinleyicileri ve arayüzü kopyalamayın. Ana videoyu, butonun bağlanacağı grubu ve gerekirse yerleşim çapasını bulun. Aynı sayfadaki önizlemeleri veya reklamları ana video sanmayın.

Standart HTML video duraklatması ortak katmanda hazırdır. Yalnızca platform gerektiriyorsa idempotent `pause(video)` sağlayın. Boyutları uyarlamak için isteğe bağlı `appearance` alanında `rem` değerleri kullanın.

Yeni domain'i manifest'e yalnızca destek gerçekten doğrulandıktan sonra ekleyin. Genel `<all_urls>` izni eklemeyin. Otomatik üretilmiş CSS sınıfları yerine anlamlı DOM işaretlerini tercih edin. Platform uyarlamaları ve çalıştırılan diğer kodlar eklenti paketinin içinde bulunmalıdır.

Adaptör dosyasını manifest'in betik listesine `content.js` öncesinde ekleyin. Testler ve demo aynı listeyi okur. `tests/platforms.test.mjs` dosyasındaki ikinci platform örneği, ortak çekirdeğe site bilgisi eklemeden test yazma örneğidir.

Buton yerleşimi, tek örnek kalması, oynatıcının yeniden oluşturulması, tam ekran, duraklat/devam et, yükleme beklemesi, video değişimi ve süre dolmasını doğrulayın. Bir platformda doğrulanan davranışı diğerlerine varsaymayın.

Bölüm sonu için adaptörde `getEpisodeEnd` ve varsa `cancelAutoplay` sağlayın; görünür bölüm sonu işaretini, sıradan ileri/sonraki bölüm düğmesinden ayırın. Ortak guard ve durdurma bildirimini tekrar yazmayın. İptal kontrolü videoyu yeniden oynatsa veya yeni bölüm başlatsa da guard'ın sürmesini, gizli kartların tetiklememesini, tekrarların sınırlı kalmasını ve Devam et eyleminin korumayı kaldırmasını test edin.

## Çeviri katkıları

Çeviriler `extension/_locales/<locale>/messages.json` dosyalarındadır. İngilizce katalogdaki tüm anahtarları koruyun; `$count$`, `$time$`, `$state$`, `$status$` yer tutucularını ve `placeholders` tanımlarını değiştirmeyin. `languageCode` metin değil, kataloğun BCP 47 kodudur (ör. `pt-BR`, `zh-TW`). Çevirilere HTML eklemeyin; uzun metinleri dar menü ve bildirim alanlarına uygun tutun. Çokluk kuralları farklı dillerde, mevcut süre seçeneklerinin tümüyle doğru çalışan ifadeler veya yerel birim kısaltmaları kullanın.

Yeni bir dil eklenirse test/demo dil listesi ve i18n testlerini de güncelleyin. `npm test` katalog bütünlüğünü, dil yönünü, bildirimleri ve yayın paketini denetler. Bu testler, ana dili konuşan birinin metin incelemesinin ve gerçek tarayıcıda görsel kontrolün yerini tutmaz. Doğrulamanın kapsamını PR'da belirtin.

## Ürün kararları

`.agents/skills/stream-sleep-timer/SKILL.md` dosyasındaki kesinleşmiş kararları ve ertelenmiş kapsamı okuyun. 0.4.0 Netflix ve HBO Max bölüm sonu algılamasını içerir. HBO geri sayım iptal kontrolü henüz gözlenmedi; Sonraki Bölüm düğmesine basılmaz, ortak durdurma koruması kullanılır. Özel süre girişi, Prime Video ve Disney+ henüz uygulanmamıştır.
