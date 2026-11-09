# Katkıda bulunma

Hata bildiriminde Chrome ve eklenti sürümünü, normal/tam ekran durumunu, seçilen süreyi ve tekrar üretme adımlarını yazın. Tam sayfa HTML dökümlerini paylaşmak yerine gerekli oynatıcı elemanlarının sadeleştirilmiş örneğini kullanın; hesap bilgilerini ve oturum verilerini eklemeyin.

## Değişiklikler

1. Depoyu fork edip bir dal açın.
2. `npm ci --ignore-scripts` ve `npm test` çalıştırın.
3. `npm run demo` ile davranışı inceleyin; ilgili değişikliği gerçek desteklenen platformda da deneyin.
4. Pull request'te problemi, yeni davranışı ve doğrulama sonucunu açıklayın. Gerçek platformda test edilmediyse açıkça belirtin.

Katkılar projenin MIT lisansı altında sunulur. Mağazadaki sürüme eklenmeden önce proje sahibi tarafından incelenir.

## Yeni platform ekleme

Önce ortak zamanlayıcıyı değiştirmeden `extension/netflix.js` benzeri bir uyarlama hazırlayın. Uyarlama ana video elemanını, butonun ekleneceği sağ kontrol grubunu ve video kimliğini bulmalı; idempotent bir duraklatma işlemi sağlamalıdır. Aynı sayfadaki önizleme videolarını veya reklamları ana video sanmamalıdır.

Yeni domain'i manifest'e yalnızca destek gerçekten doğrulandıktan sonra ekleyin. Genel `<all_urls>` izni eklemeyin. Otomatik üretilmiş CSS sınıfları yerine anlamlı DOM işaretlerini tercih edin. Platform uyarlamaları ve çalıştırılan diğer kodlar eklenti paketinin içinde bulunmalıdır.

Buton yerleşimi, tek örnek kalması, oynatıcının yeniden oluşturulması, tam ekran, duraklat/devam et, yükleme beklemesi, video değişimi ve süre dolmasını doğrulayın. Bir platformda doğrulanan davranışı diğerlerine varsaymayın.

## Ürün kararları

`.agents/skills/stream-sleep-timer/SKILL.md` dosyasındaki kesinleşmiş kararları ve ertelenmiş kapsamı okuyun. Bölüm sonunda durdurma, otomatik sonraki bölümü engelleme ve özel süre girişi mevcut MVP'ye dahil değildir.
