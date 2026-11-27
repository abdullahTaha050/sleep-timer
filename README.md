# Sleep Timer

Netflix, HBO Max ve Prime Video için ücretsiz, açık kaynaklı bir Chrome uyku zamanlayıcısı. Oynatıcıdaki ay simgesinden bir süre seçin veya izlediğiniz bölümün sonunda duraklatın.

## Özellikler

- **Süre seçenekleri:** 10, 15, 20, 30, 45 ve 60 dakika.
- **Bölüm sonunda durdurma:** Platformun bölüm sonu geçiş kartı göründüğünde oynatmayı duraklatır. Süre seçiliyse, süre dolması veya bölüm sonundan hangisi önce gelirse uygulanır.
- **Oynatmaya bağlı sayaç:** Duraklatma, yükleme ve ileri/geri sarma sırasında bekler; oynatma başlayınca kaldığı yerden devam eder.
- **Tek dokunuşla süreyi tekrarlama:** Süre dolduğunda aynı süreyi yeniden başlatıp izlemeye devam edebilirsiniz.
- **Oynatıcıya entegre menü:** Sağ kontrol grubundaki ay simgesi üzerinden süre seçimi ve kalan süre takibi.
- **Genel aç/kapat anahtarı:** Chrome araç çubuğundan tüm desteklenen sekmeler için eklentiyi yönetin.
- **23 dil ve bölge:** Chrome arayüz diline uyumlu metinler ve sağdan sola yazılan diller için RTL desteği.
- **Yerel çalışma:** Hesap, sunucu veya analitik hizmeti gerektirmez.

## Desteklenen platformlar

| Platform | Desteklenen alan adı | Süre zamanlayıcısı | Bölüm sonunda |
|---|---|---|---|
| Netflix | `www.netflix.com` | ✓ | ✓ |
| HBO Max | `www.hbomax.com` | ✓ | ✓ |
| Prime Video | `www.primevideo.com` | ✓ | ✓ |

Destek, bu alan adlarındaki web oynatıcıları içindir. Amazon mağaza siteleri ve diğer alan adları kapsam dışındadır.

## Kurulum

Chrome 120 veya üzeri gerekir. Eklentiyi kullanmak için Node.js, npm veya derleme gerekmez.

1. Eklenti ZIP paketini açın ya da bu depoyu indirip kaynak dosyalarını çıkarın.
2. Chrome adres çubuğunda `chrome://extensions` sayfasını açın.
3. **Geliştirici modu** seçeneğini etkinleştirin.
4. **Paketlenmemiş öğe yükle** düğmesine basın. Eklenti paketinde `manifest.json` dosyasının bulunduğu klasörü; kaynak koddan kuruyorsanız `extension` klasörünü seçin.
5. Açık yayın platformu sekmelerini yenileyin ve bir video açın.

Güncelleme sonrasında aynı sayfadaki **Yeniden yükle** düğmesini kullanın ve oynatıcı sekmelerini yenileyin.

## Kullanım

Oynatıcının sağ kontrol grubundaki **ay simgesine** tıklayın. Bir süre veya **Bölüm sonunda** seçeneğini seçin. Etkin zamanlayıcı simgedeki yeşil noktayla belirtilir; kalan süre menüde görünür. Başka bir süre seçmek sayacı baştan başlatır.

Oynatma durdurulduğunda bildirimde şu eylemler sunulur:

| Eylem | Sonuç |
|---|---|
| **10 dakika daha** gibi bir süre düğmesi | Süre dolduktan sonra aynı süreyi yeniden kurar ve oynatmayı sürdürür. |
| **Devam et** | Bölüm sonu, video bitişi veya içerik değişiminden sonra zamanlayıcı kurmadan oynatmayı sürdürür. |
| **Zamanlayıcıyı kapat** | Zamanlayıcıyı ve duraklatma korumasını kaldırır; videoyu oynatmaz. |

Menüdeki **Kapalı** seçeneği de zamanlayıcıyı iptal eder. Chrome araç çubuğundaki Sleep Timer anahtarı ise tüm desteklenen sekmelerde eklentiyi açar veya kapatır. Bu tercih cihazda saklanır; yeniden açıldığında önceki sayaçlar geri yüklenmez.

### Sayacın çalışma biçimi

Sayaç, video oynatılırken geçen gerçek zamanı ölçer. Oynatma hızını değiştirmek veya videoda ileri/geri gitmek kalan süreyi doğrudan değiştirmez. Örneğin 2× hızda seçilen 10 dakika, 10 dakikalık oynatma süresidir.

**Bölüm sonunda**, jeneriğin tamamen bitmesini değil platformun bölüm sonu geçiş kartını esas alır. Durdurma koruması, otomatik yeniden oynatma veya aynı sayfa oturumunda başka içeriğe geçiş sırasında videoyu duraklatır. Manuel bölüm değiştirme de bu kapsamdadır; izlemeyi sürdürmek için **Devam et** veya **Kapalı** kullanın.

Sayaçlar sekme bazında çalışır. Sayfa yenilenince veya oynatıcı sayfasından çıkılınca sıfırlanır; seçilen süre kalıcı olarak saklanmaz. Bilgisayarın uykuya geçmesi veya sekmenin tarayıcı tarafından askıya alınması zamanlamayı etkileyebilir. Platformların oynatıcı değişiklikleri uyumluluk güncellemesi gerektirebilir.

## Dil ve görünüm

Arayüz Chrome’un dilini kullanır; eşleşmeyen dillerde İngilizceye döner. Yayın platformundaki profil dili bu tercihi değiştirmez. Araç çubuğu paneli ve durdurma bildirimi sistemin açık/koyu temasına uyum sağlar.

Desteklenen diller: Almanca, İngilizce, Endonezce, Malayca, Vietnamca, Türkçe, İspanyolca, Fransızca, İtalyanca, Lehçe, Portekizce (Brezilya ve Portekiz), Rusça, İbranice, Urduca, Arapça, Farsça, Hintçe, Tayca, Basitleştirilmiş Çince, Geleneksel Çince, Japonca ve Korece.

## Gizlilik

Oynatıcı durumu ve zamanlayıcı bilgileri sayfa belleğinde işlenir; harici bir sunucuya gönderilmez. Yalnızca genel aç/kapat tercihi cihazdaki Chrome depolamasında tutulur. Eklenti izleme geçmişi kaydetmez ve platform hesap ayarlarını değiştirmez.

Ayrıntılar: [Gizlilik politikası](PRIVACY.md).

## Geliştirme

Geliştirme araçları için Node.js 20.19+ ve Python 3 gerekir. Eklentinin çalışma zamanında harici bağımlılığı yoktur.

```sh
npm ci --ignore-scripts
npm test
npm run demo
```

Yerel demo: [Oynatıcı örneği](http://127.0.0.1:8765/watch/100).

Test paketi; süre hesabını, platform adaptörlerini, bölüm sonu davranışını, menü etkileşimlerini, çevirileri, ayarları ve dağıtım paketini kapsar. DOM testleri sadeleştirilmiş oynatıcı örnekleri ve taklit medya olayları kullanır.

Yerel geliştirme sürümünde **Test süreleri** altında 5, 10 ve 30 saniye seçenekleri bulunur. Bu seçenekler yayın paketine dahil edilmez.

### Paketleme

```sh
npm run package
```

Komut, `dist/` klasöründe manifestteki sürüm numarasıyla iki arşiv üretir:

- `sleep-timer-extension-<sürüm>.zip`: Kurulum ve Chrome Web Store dağıtımı için eklenti dosyaları.
- `sleep-timer-source-<sürüm>.zip`: Kaynak kod ve geliştirme dosyaları.

`node_modules` her iki arşivin dışında tutulur. Yayın paketinde test süreleri kapatılır; yerel kaynak dosyaları değiştirilmez.

### Proje yapısı

| Klasör | İçerik |
|---|---|
| `extension/core/` | Zamanlayıcı, medya olayları ve oynatıcı yaşam döngüsü |
| `extension/adapters/` | Netflix, HBO Max ve Prime Video entegrasyonları |
| `extension/ui/` | Oynatıcı menüsü, ay düğmesi ve durdurma bildirimi |
| `extension/popup/` | Chrome araç çubuğu paneli |
| `extension/shared/` | Ortak ayarlar ve dil desteği |
| `extension/_locales/` | Çeviri katalogları |
| `tests/` | Birim testleri ve sadeleştirilmiş oynatıcı örnekleri |

Adaptör sözleşmesi ve teknik ayrıntılar için [mimari rehberine](ARCHITECTURE.md) bakın.

## Katkı ve geri bildirim

Hata düzeltmeleri, çeviri iyileştirmeleri ve yeni platform katkıları için [katkı rehberini](CONTRIBUTING.md) inceleyin. Commit mesajları `npm run commit` ile hazırlanabilir.

Bir sorun bildirirken Chrome ve eklenti sürümünü, platformu ve tekrar üretme adımlarını ekleyin. Hesap veya oturum bilgileri içeren tam sayfa HTML dökümlerini paylaşmayın.

[Hata bildir / öneri paylaş](https://github.com/abdullahTaha050/sleep-timer/issues) · [Sürüm notları](https://github.com/abdullahTaha050/sleep-timer/releases)

## Lisans

[MIT](LICENSE). Sleep Timer bağımsız bir projedir; Netflix, HBO Max veya Prime Video ile bağlantılı değildir ve bu platformlar tarafından onaylanmamıştır.
