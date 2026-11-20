# Katkıda bulunma

Hata bildiriminde Chrome ve eklenti sürümünü, normal/tam ekran durumunu, seçilen süreyi ve tekrar üretme adımlarını yazın. Tam sayfa HTML dökümlerini paylaşmak yerine gerekli oynatıcı elemanlarının sadeleştirilmiş örneğini kullanın; hesap bilgilerini ve oturum verilerini eklemeyin.

## Değişiklikler

1. Depoyu fork edip bir dal açın.
2. `npm ci --ignore-scripts` ve `npm test` çalıştırın.
3. `npm run demo` ile davranışı inceleyin; ilgili değişikliği gerçek desteklenen platformda da deneyin.
4. Pull request'te problemi, yeni davranışı ve doğrulama sonucunu açıklayın. Gerçek platformda test edilmediyse açıkça belirtin.

Katkılar projenin MIT lisansı altında sunulur. Mağazadaki sürüme eklenmeden önce proje sahibi tarafından incelenir.

## Commit mesajları

Proje, mevcut Release Please akışıyla uyumlu Conventional Commits biçimini kullanır. Commitizen ve `cz-conventional-changelog` yalnızca geliştirme bağımlılığıdır; global kurulum gerekmez ve eklenti paketine dahil edilmez.

1. Bağımlılıkları `npm ci --ignore-scripts` ile kurun.
2. Değişiklikleri inceleyip yalnızca ilgili dosyaları `git add <dosya>` ile hazırlayın.
3. `npm run commit` çalıştırın; tür, isteğe bağlı kapsam, kısa açıklama ve varsa uyumsuz değişiklik/issue bilgilerini doldurun. Soruları tamamlamak hazırlanan dosyalarla gerçek bir commit oluşturur; push yapmaz.

Örnek mesajlar:

```text
feat(popup): add extension toggle
fix(netflix): preserve timer when controls rebuild
chore(tooling): add Commitizen
docs: explain local installation
```

Kapsam için `popup`, `netflix`, `hbo`, `prime-video`, `i18n`, `timer` veya `tooling` gibi değişen alanı kullanabilirsiniz; zorunlu değildir. Türü değişikliğin etkisine göre seçin: yeni özellik için `feat`, hata düzeltmesi için `fix`, geliştirme araçları için `chore`, belge değişiklikleri için `docs`. Geriye uyumsuz değişiklik varsa ilgili soruya evet deyip açıklamasını girin; adaptör mesaj gövdesine `BREAKING CHANGE:` ekler.

Commitizen mesaj hazırlamayı kolaylaştırır; doğrudan `git commit` ile yazılan mesajları zorunlu olarak denetleyen bir hook değildir. Bu kurulum commitlint denetimi veya Git hook’u yapılandırmaz.

Sürüm artırma, changelog ve release işlemlerini mevcut Release Please yönetir. `feat` ve `fix` mesajları ile uyumsuz değişiklik bilgisi bu akışın girdisidir; yalnızca `chore` veya `docs` değişiklikleri genellikle tek başına yeni sürüm oluşturmaz. Sürüm dosyalarını Commitizen için elle artırmayın. PR squash ile birleştiriliyorsa **son squash commit mesajının** da Conventional Commits biçiminde olduğundan emin olun; PR başlığını bu biçimde yazmak bunu kolaylaştırır.

Kaynaklar: [Commitizen yerel kurulum](https://github.com/commitizen/cz-cli#optional-install-and-run-commitizen-locally), [Release Please commit biçimi](https://github.com/googleapis/release-please#how-should-i-write-my-commits).

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

`.agents/skills/stream-sleep-timer/SKILL.md` dosyasındaki kesinleşmiş kararları ve ertelenmiş kapsamı okuyun. 0.4.0 Netflix ve HBO Max bölüm sonu algılamasını içerir. HBO geri sayım iptal kontrolü henüz gözlenmedi; Sonraki Bölüm düğmesine basılmaz, ortak durdurma koruması kullanılır. Prime Video süre desteği paylaşılan HTML ile uygulanmıştır; bölüm sonu sinyali ve canlı oynatma henüz doğrulanmadı. Özel süre girişi ve Disney+ henüz uygulanmamıştır.
