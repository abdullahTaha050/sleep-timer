# Sleep Timer — Netflix MVP

Netflix'in web oynatıcısındaki sağ kontrol grubunun başına bir uyku zamanlayıcısı ekleyen Chrome eklentisi. YouTube'dan bağımsızdır. Netflix ile bağlantılı veya Netflix tarafından onaylanmış bir ürün değildir.

## Chrome'a yükleme

1. Bu depoyu indirin veya klonlayın. ZIP indirdiyseniz önce açın.
2. Chrome adres çubuğunda `chrome://extensions` açın.
3. **Geliştirici modu** seçeneğini açın.
4. **Paketlenmemiş öğe yükle** seçeneğiyle bu projenin **`extension`** klasörünü seçin. `manifest.json` bu klasörün doğrudan içinde olmalıdır.
5. Açık Netflix sekmesini yenileyin ve bir video açın.
6. Sağdaki kontrol grubunun başında bulunan **ay simgesine** tıklayın.

Paketlenmiş `sleep-timer-extension-0.2.0.zip` dosyasını kullanıyorsanız ZIP'i açıp doğrudan `manifest.json` dosyasının bulunduğu klasörü seçin. Normal kullanıcı kurulumu için Node.js, npm veya derleme gerekmez.

Resmî yükleme açıklaması: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

## Davranış

- Süre seçenekleri: Kapalı, 10, 15, 20, 30, 45 ve 60 dakika; ayrıca **Bölüm sonunda**.
- Menüdeki **Test süreleri** bölümünde 5, 10 ve 30 saniye seçenekleri bulunur.
- **Bölüm sonunda**, Netflix'in görünür bölüm sonu geçiş ekranı algılandığında durdurur. Dosyanın son saniyesini veya sabit bir jenerik süresini beklemez.
- Dakika/saniye seçimlerinde süre dolması veya bölüm sonu geçiş ekranından hangisi önce gelirse ilgili sekmenin ana videosu duraklatılır. Uzun seçimde sayısal süreyi önceden tahmin edip değiştirmek yerine bölüm sonu sinyali üst sınır olur.
- Algılanan geçiş ekranında **Jeneriği İzle** kontrolüne basılarak geri sayımın iptali denenir. Bu sırada oynatmanın yeniden başlamasına karşı duraklatma koruması açık kalır.
- Video duraklatıldığında, yükleme beklediğinde veya sarma işlemi sürerken sayaç bekler.
- Oynatma devam ettiğinde sayaç kaldığı süreden devam eder.
- Süre, oynatma sırasında geçen gerçek zamandır. Örneğin 2× hızda 10 dakika seçmek yaklaşık 10 dakika oynatmayı sayar; video zaman çizgisindeki 20 dakikayı. İleri/geri sarma kalan süreyi doğrudan değiştirmez.
- Kalan süre menüde görünür; butondaki küçük yeşil nokta aktif zamanlayıcıyı belirtir.
- Durdurulduğunda küçük bir bildirim görünür. **Devam et** korumayı kaldırıp oynatır; **Zamanlayıcıyı kapat** yalnızca korumayı kaldırır, videoyu başlatmaz. Kapalı seçimi de iptal eder. Başka süre seçmek yeni bir zamanlayıcı kurar.
- Kontrol çubuğu yeniden oluşturulduğunda aynı videonun sayacı korunur.
- Koruma açıkken aynı sayfa oturumunda başka bölüme geçilirse yeni video da duraklatılır. Kullanıcının manuel bölüm değiştirmesi de bu kurala dahildir; serbestçe devam etmek için önce korumayı kapatın.
- Sayfa yenilenince veya izleme sayfasından çıkılınca koruma sıfırlanır. Sekmeler bağımsızdır.

## Netflix üzerinde ilk deneme

1. Video oynarken menüden **Test süreleri → 10 sn** seçin; yaklaşık 10 saniye sonra duraklamayı kontrol edin.
2. Yeniden 10 sn seçip birkaç saniye sonra videoyu duraklatın. Menüdeki kalan süreyi not alın; bekleyince değişmemeli. Oynatınca devam etmeli.
3. Bir süre seçip **Kapalı** yapın; video zamanlayıcı nedeniyle durmamalı.
4. Tam ekranda menüyü açın, bir süre seçin ve tam ekrandan çıkın.
5. Kontrollerin gizlenip tekrar görünmesini sağlayın; ay butonu tek kalmalı.
6. **Bölüm sonunda** seçin. Friends'te geçiş kartının çıkmasından birkaç saniye öncesine gidip oynatın. Kart çıktığında video durmalı; geri sayım süresinden daha uzun bekleseniz de dizi akıp gitmemeli.
7. Durdurma bildirimindeki **Devam et** ile oynatmanın geri geldiğini ve **Zamanlayıcıyı kapat** seçiminin kendi başına oynatmayı başlatmadığını kontrol edin.
8. Uzun jenerikli bir bölümde 30 dakika seçip bölüm sonuna yaklaşın; sayaç dolmadan geçiş ekranında durmasını kontrol edin. Otomatik oynatma açık/kapalı ve tam ekran durumlarını ayrı deneyin.
9. Koruma açıkken sonraki bölüme geçiş olursa yeni videonun duraklatıldığını kontrol edin.

İlk sürümdeki saniyelik zamanlayıcılar kullanıcı tarafından gerçek Netflix üzerinde denenmiş ve çalıştığı bildirilmiştir. **0.2.0 bölüm sonu özelliği DOM simülasyonuyla test edilmiştir; gerçek Netflix davranışı henüz doğrulanmamıştır.** Özellikle “Jeneriği İzle” tıklamasının Netflix'in gerçek geri sayımını iptal ettiği, tam ekran ve yeni bildirim görünümü canlı ortamda denenmelidir.

## MVP sınırları

- Bölüm sonu algılaması paylaşılan Netflix HTML'indeki `watch-credits-seamless-button` ve `next-episode-seamless-button-draining` işaretlerini kullanır. Gizli kontroller dikkate alınmaz; farklı oynatıcı varyasyonları ayrıca doğrulanmalıdır.
- “Jeneriği İzle” tıklaması bir iptal girişimidir; Netflix'in dahili zamanlayıcısına erişilmez. Her görünür sinyal için bir, kurulan koruma boyunca en fazla üç tıklama denenir. Kontrol bulunamazsa da video durdurma koruması çalışır.
- Geçiş kaçırılırsa yeni video duraklatılmaya çalışılır; bu, sonraki bölümün hiçbir karesinin başlamadığı veya Netflix izleme ilerlemesinin değişmediği garantisi değildir. Tam sayfa yüklemesi korumayı sıfırlar. Netflix profil ayarları değiştirilmez.
- Özel süre girişi, kalıcı ayarlar, diğer platformlar ve Türkçe dışındaki arayüzler sonraki aşamadadır.
- Sayaç açık oynatıcı sayfasında çalışır. İşletim sistemi uykusu, askıya alınmış sekme ve tarayıcı zamanlayıcı gecikmeleri için kesin zamanlama garantisi yoktur.
- Netflix'in DOM yapısı değişirse platform uyarlaması güncellenebilir.

## Geliştirme ve test

Eklentinin çalışma zamanında bağımlılığı yoktur. Node.js 20.19+ test araçları içindir.

```sh
npm ci --ignore-scripts
npm test
npm run demo
```

Yerel demo: `http://127.0.0.1:8765/watch/100`

Tarayıcı entegrasyon testi: `http://127.0.0.1:8765/watch/100?test=1`

Demo, yerel canvas görüntüsünü MediaStream olarak bir video elemanında oynatır. Otomatik test sayfası ise medya olaylarını ve saati denetimli şekilde simüle eder. Hiçbiri Netflix'e bağlanmaz. DOM testlerinde kullanılan Happy DOM bağımlılığı eklenti ZIP'ine dahil edilmez; bu testler gerçek tarayıcı düzenini veya DRM oynatmasını doğrulamaz.

```sh
python3 scripts/generate-icons.py
npm run package
```

Paketleme `dist/` içine yüklenebilir eklenti ZIP'i ve kaynak kod ZIP'i üretir. `node_modules`, kullanıcı HTML dökümü ve test bağımlılıkları mağaza paketine girmez.

## Yapı

- `extension/core/`: ortak zamanlayıcı, medya olayları, durdurma koruması, oynatıcı yaşam döngüsü ve platform kaydı.
- `extension/adapters/`: siteye özgü domain, video kimliği ve kontrol yerleşimi. Şimdilik yalnızca Netflix.
- `extension/ui/`: ortak Shadow DOM menüsü, buton, durdurma bildirimi ve stiller. Mevcut ikon `3.1875rem`, buton `4.500rem` değerlerini korur.
- `extension/shared/config.js`: süre seçenekleri ve ortak çalışma ayarları.
- `extension/content.js`: mevcut sitenin adaptörünü seçip uygulamayı başlatır.
- `tests/`: birim testleri, DOM testleri ve bağımsız oynatıcı örneği.
- `.agents/skills/stream-sleep-timer/SKILL.md`: ürün kararları ve ertelenen kapsam.

Adaptör sözleşmesi ve yeni platform ekleme ayrıntıları: [ARCHITECTURE.md](ARCHITECTURE.md).

## Açık kaynak ve yayın

MIT lisansı kullanılmıştır; katkı adımları [CONTRIBUTING.md](CONTRIBUTING.md), veri işleme açıklaması [PRIVACY.md](PRIVACY.md) içindedir. Ürün adı şimdilik çalışma adıdır.

GitHub reposu veya Chrome Web Store kaydı bu teslimatta oluşturulmamıştır. Kaynak klasörünü kendi GitHub reponuza ekleyebilirsiniz. Mağazaya göndermeden önce gerçek Netflix denemesini tamamlayın, mağaza ekran görüntülerini hazırlayın ve gizlilik metnini erişilebilir bir URL'de yayımlayın.
