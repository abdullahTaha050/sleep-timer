# Sleep Timer — Netflix ve HBO Max

Netflix ve HBO Max web oynatıcılarının sağ kontrol grubuna uyku zamanlayıcısı ekleyen Chrome eklentisi. YouTube'dan bağımsızdır. Netflix veya HBO Max ile bağlantılı ya da bu platformlar tarafından onaylanmış bir ürün değildir. HBO desteği 0.3.0'da eklenmiş ve kullanıcı süre desteğinin canlıda çalıştığını bildirmiştir. 0.4.0 HBO bölüm sonu algılamasını ekler; bölüm sonu özelliği yerel DOM testlerinden geçmiştir, canlı doğrulama bekler. Önceki 0.3.1 hizalama düzeltmesinin görsel doğrulaması da beklenmektedir.

## Chrome'a yükleme

1. Bu depoyu indirin veya klonlayın. ZIP indirdiyseniz önce açın.
2. Chrome adres çubuğunda `chrome://extensions` açın.
3. **Geliştirici modu** seçeneğini açın.
4. **Paketlenmemiş öğe yükle** seçeneğiyle bu projenin **`extension`** klasörünü seçin. `manifest.json` bu klasörün doğrudan içinde olmalıdır.
5. Açık Netflix veya HBO Max sekmesini yenileyin ve bir video açın.
6. Sağdaki kontrol grubunun başında bulunan **ay simgesine** tıklayın.

Paketlenmiş `sleep-timer-extension-0.4.2.zip` dosyasını kullanıyorsanız ZIP'i açıp doğrudan `manifest.json` dosyasının bulunduğu klasörü seçin. Bu yayın paketinde test süreleri görünmez; yerel test için deponun `extension` klasörünü yükleyin. Normal kullanıcı kurulumu için Node.js, npm veya derleme gerekmez.

Resmî yükleme açıklaması: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

## Davranış

- Menü, bildirimler, erişilebilirlik etiketleri ve eklenti açıklaması Chrome arayüz dilini izler: Türkçe için Türkçe, diğer diller için İngilizce. Netflix/HBO profil dili bu seçimi değiştirmez. Tarayıcı dilini değiştirdikten sonra gerekiyorsa Chrome'u yeniden başlatın ve izleme sekmesini yenileyin.
- Süre seçenekleri: Kapalı, 10, 15, 20, 30, 45 ve 60 dakika; her iki platformda ayrıca **Bölüm sonunda**.
- Yalnızca yerel geliştirme sürümünde **Test süreleri** bölümünde 5, 10 ve 30 saniye seçenekleri bulunur. Yayın paketinde bu bölüm oluşturulmaz.
- **Bölüm sonunda**, platformun görünür bölüm sonu geçiş ekranı algılandığında durdurur. Dosyanın son saniyesini veya sabit bir jenerik süresini beklemez.
- Dakika/saniye seçimlerinde süre dolması veya bölüm sonu geçiş ekranından hangisi önce gelirse ilgili sekmenin ana videosu duraklatılır. Uzun seçimde sayısal süreyi önceden tahmin edip değiştirmek yerine bölüm sonu sinyali üst sınır olur.
- Netflix’te algılanan geçiş ekranında **Jeneriği İzle** kontrolüne basılarak geri sayımın iptali denenir. Bu sırada oynatmanın yeniden başlamasına karşı duraklatma koruması açık kalır.
- Video duraklatıldığında, yükleme beklediğinde veya sarma işlemi sürerken sayaç bekler.
- Oynatma devam ettiğinde sayaç kaldığı süreden devam eder.
- Süre, oynatma sırasında geçen gerçek zamandır. Örneğin 2× hızda 10 dakika seçmek yaklaşık 10 dakika oynatmayı sayar; video zaman çizgisindeki 20 dakikayı. İleri/geri sarma kalan süreyi doğrudan değiştirmez.
- Kalan süre menüde görünür; butondaki küçük yeşil nokta aktif zamanlayıcıyı belirtir.
- Durdurulduğunda iki butonlu küçük bir bildirim görünür. Süre dolduğunda soldaki mavi buton seçilen süreyi gösterir (ör. **10 dakika daha**): bildirimi kapatır, videoyu oynatır ve aynı süreyi baştan başlatır. Bölüm sonu, video bitişi veya bölüm değişiminde **Devam et** korumayı kaldırıp zamanlayıcı kurmadan oynatır. **Zamanlayıcıyı kapat** yalnızca korumayı kaldırır, videoyu başlatmaz. Kapalı seçimi de iptal eder. Başka süre seçmek yeni bir zamanlayıcı kurar.
- Kontrol çubuğu yeniden oluşturulduğunda aynı videonun sayacı korunur.
- Koruma açıkken aynı sayfa oturumunda başka bölüme geçilirse yeni video da duraklatılır. Kullanıcının manuel bölüm değiştirmesi de bu kurala dahildir; serbestçe devam etmek için önce korumayı kapatın.
- Sayfa yenilenince veya izleme sayfasından çıkılınca koruma sıfırlanır. Sekmeler bağımsızdır.

## HBO Max üzerinde ilk deneme

Destek, paylaşılan HTML'deki `www.hbomax.com/video/watch/<kimlik>` oynatıcısına yöneliktir. Buton sağ kontrol grubunda ses kontrolünün önüne eklenir. `max.com` ve diğer alan adları için erişim eklenmemiştir.

1. `chrome://extensions` üzerinden eklentiyi yeniden yükleyin, istenirse yeni HBO site erişimini etkinleştirin; HBO sekmesini yenileyin.
2. Video oynarken **Test süreleri → 10 sn** seçin; süre bitince video durmalı. Birkaç saniye sonra duraklatıp bekleyin; kalan süre sabit kalmalı ve oynatınca devam etmeli.
3. Süre dolunca soldaki **10 sn daha** butonuna basın: bildirim kapanmalı, video oynamalı ve 10 saniye baştan sayılmalı. İkinci kez dolduğunda yine tekrarlanabilmeli. **Kapalı** ve **Zamanlayıcıyı kapat** oynatmayı başlatmamalı.
4. Normal/tam ekran görünümünü, menüyü, kontrollerin gizlenip dönmesini ve tek ay butonu kalmasını kontrol edin.
5. Sayaç açıkken başka bölüme geçin; aynı sayfa oturumundaki yeni video duraklatılmalı. Ana sayfaya çıkıp geri dönünce sayaç kapalı olmalı.

6. **Bölüm sonunda** seçin ve bölüm sonundaki **Sonraki Bölüm** kartına yaklaşın. Kart görünürken video durmalı; Devam et ile oynatma geri gelmeli, Zamanlayıcıyı kapat kendi başına oynatmamalı.
7. Uzun bir dakika süresi seçip aynı geçişi deneyin; sayaç dolmasa bile kart göründüğünde durmalı. Otomatik oynatma açıksa yeni bölüme geçildiğinde duraklatma korumasını da kontrol edin.

HBO bölüm sonu algılaması, `up_next` içindeki `player-ux-up-next-container` altında görünür `player-ux-up-next-button` arar. Boş/gizli alanlar tetiklemez; metin diline veya geri sayım rakamına bağlı değildir. Paylaşılan örnekte otomatik oynatma kapalıdır ve iptal kontrolü yoktur. Eklenti **Sonraki Bölüm düğmesine basmaz**, HBO geri sayımını iptal ettiğini iddia etmez; ortak duraklatma korumasını kullanır. Kart kaçırılırsa doğal video bitişi veya izleme URL'sinin değişmesi yedek durdurma sinyalidir. URL aynı kalır ve kart/bitiş sinyali de kaçırılırsa içerik değişimi için ek kimlik sinyali yoktur. Gerçek HBO/DRM, otomatik geçiş ve tam ekran testlerini kullanıcı yapacaktır.

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
- Özel süre girişi, kalıcı ayarlar, Prime Video/Disney+ desteği ve Türkçe dışındaki arayüzler sonraki aşamadadır.
- Sayaç açık oynatıcı sayfasında çalışır. İşletim sistemi uykusu, askıya alınmış sekme ve tarayıcı zamanlayıcı gecikmeleri için kesin zamanlama garantisi yoktur.
- Platformların DOM yapısı değişirse platform uyarlaması güncellenebilir.

## Geliştirme ve test

Eklentinin çalışma zamanında bağımlılığı yoktur. Node.js 20.19+ ve Python 3 test araçları içindir; paketleme Python 3 kullanır.

```sh
npm ci --ignore-scripts
npm test
npm run demo
```

Yerel demo: `http://127.0.0.1:8765/watch/100`

Tarayıcı entegrasyon testi: `http://127.0.0.1:8765/watch/100?test=1`

`npm test`: 80 test. Bölüm sonu testleri görünür/gizli kartları, süre üst sınırını, yeni videoda korumayı ve Devam et/Kapalı eylemlerini kapsar. Süreyi tekrar başlatma testleri her iki platformda son seçimin korunmasını, art arda tekrarları, duraklatmayı, oynatma hatalarını ve oynatıcı yenilenmesini kapsar. Paket testi geçici klasörde gerçek yayın ZIP'ini üretip Türkçe/İngilizce menülerde test seçeneklerinin bulunmadığını, yerel ve kaynak sürümlerde korunduğunu doğrular.

Demo, yerel canvas görüntüsünü MediaStream olarak bir video elemanında oynatır. Otomatik test sayfası ise medya olaylarını ve saati denetimli şekilde simüle eder. Hiçbiri Netflix veya HBO Max'e bağlanmaz. DOM testlerinde kullanılan Happy DOM bağımlılığı eklenti ZIP'ine dahil edilmez; bu testler gerçek tarayıcı düzenini veya DRM oynatmasını doğrulamaz.

```sh
python3 scripts/generate-icons.py
npm run package
```

Paketleme `dist/` içine yüklenebilir eklenti ZIP'i ve kaynak kod ZIP'i üretir. `node_modules`, kullanıcı HTML dökümü ve test bağımlılıkları mağaza paketine girmez.

Chrome Web Store'a `dist/sleep-timer-extension-0.4.2.zip` dosyasını yükleyin. Paketleyici yalnızca bu ZIP içindeki `shared/build.js` dosyasında test sürelerini kapatır; yerel `extension` klasörünü değiştirmez. Kaynak ZIP'i geliştirme ayarlarını korur ve mağazaya yüklemek için değildir. Yayın ZIP'i yerelde paketlenmemiş olarak yüklense de test seçenekleri kapalı kalır.

## Yapı

- `extension/core/`: ortak zamanlayıcı, medya olayları, durdurma koruması, oynatıcı yaşam döngüsü ve platform kaydı.
- `extension/adapters/`: siteye özgü domain, video kimliği ve kontrol yerleşimi. Netflix ve HBO Max adaptörleri.
- `extension/ui/`: ortak Shadow DOM menüsü, buton, durdurma bildirimi ve stiller. Mevcut ikon `3.1875rem`, buton `4.500rem` değerlerini korur.
- `extension/shared/config.js`: süre seçenekleri ve ortak çalışma ayarları.
- `extension/content.js`: mevcut sitenin adaptörünü seçip uygulamayı başlatır.
- `tests/`: birim testleri, DOM testleri ve bağımsız oynatıcı örneği.
- `.agents/skills/stream-sleep-timer/SKILL.md`: ürün kararları ve ertelenen kapsam.

Adaptör sözleşmesi ve yeni platform ekleme ayrıntıları: [ARCHITECTURE.md](ARCHITECTURE.md).

## Açık kaynak ve yayın

MIT lisansı kullanılmıştır; katkı adımları [CONTRIBUTING.md](CONTRIBUTING.md), veri işleme açıklaması [PRIVACY.md](PRIVACY.md) içindedir. Ürün adı şimdilik çalışma adıdır.

GitHub reposu veya Chrome Web Store kaydı bu teslimatta oluşturulmamıştır. Kaynak klasörünü kendi GitHub reponuza ekleyebilirsiniz. Mağazaya göndermeden önce gerçek Netflix ve HBO Max denemelerini tamamlayın, mağaza ekran görüntülerini hazırlayın ve gizlilik metnini erişilebilir bir URL'de yayımlayın.
