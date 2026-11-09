# Sleep Timer — Netflix MVP

Netflix'in web oynatıcısındaki sağ kontrol grubunun başına bir uyku zamanlayıcısı ekleyen Chrome eklentisi. YouTube'dan bağımsızdır. Netflix ile bağlantılı veya Netflix tarafından onaylanmış bir ürün değildir.

## Chrome'a yükleme

1. Bu depoyu indirin veya klonlayın. ZIP indirdiyseniz önce açın.
2. Chrome adres çubuğunda `chrome://extensions` açın.
3. **Geliştirici modu** seçeneğini açın.
4. **Paketlenmemiş öğe yükle** seçeneğiyle bu projenin **`extension`** klasörünü seçin. `manifest.json` bu klasörün doğrudan içinde olmalıdır.
5. Açık Netflix sekmesini yenileyin ve bir video açın.
6. Sağdaki kontrol grubunun başında bulunan **ay simgesine** tıklayın.

Paketlenmiş `sleep-timer-extension-0.1.0.zip` dosyasını kullanıyorsanız ZIP'i açıp doğrudan `manifest.json` dosyasının bulunduğu klasörü seçin. Normal kullanıcı kurulumu için Node.js, npm veya derleme gerekmez.

Resmî yükleme açıklaması: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

## Davranış

- Süre seçenekleri: Kapalı, 10, 15, 20, 30, 45 ve 60 dakika.
- Menüdeki **Test süreleri** bölümünde 5, 10 ve 30 saniye seçenekleri bulunur.
- Süre dolduğunda ilgili sekmenin ana videosu duraklatılır.
- Video duraklatıldığında, yükleme beklediğinde veya sarma işlemi sürerken sayaç bekler.
- Oynatma devam ettiğinde sayaç kaldığı süreden devam eder.
- Süre, oynatma sırasında geçen gerçek zamandır. Örneğin 2× hızda 10 dakika seçmek yaklaşık 10 dakika oynatmayı sayar; video zaman çizgisindeki 20 dakikayı. İleri/geri sarma kalan süreyi doğrudan değiştirmez.
- Kalan süre menüde görünür; butondaki küçük yeşil nokta aktif zamanlayıcıyı belirtir.
- Başka süre seçmek yeniden başlatır; **Kapalı** iptal eder. Süre dolduktan sonra kullanıcı videoyu yeniden oynatabilir.
- Kontrol çubuğu yeniden oluşturulduğunda aynı videonun sayacı korunur.
- Sayfa yenilenince, başka videoya geçilince veya izleme sayfasından çıkılınca sayaç sıfırlanır. Sekmeler bağımsızdır.

## Netflix üzerinde ilk deneme

1. Video oynarken menüden **Test süreleri → 10 sn** seçin; yaklaşık 10 saniye sonra duraklamayı kontrol edin.
2. Yeniden 10 sn seçip birkaç saniye sonra videoyu duraklatın. Menüdeki kalan süreyi not alın; bekleyince değişmemeli. Oynatınca devam etmeli.
3. Bir süre seçip **Kapalı** yapın; video zamanlayıcı nedeniyle durmamalı.
4. Tam ekranda menüyü açın, bir süre seçin ve tam ekrandan çıkın.
5. Kontrollerin gizlenip tekrar görünmesini sağlayın; ay butonu tek kalmalı.
6. Başka videoya geçince zamanlayıcının kapalı olduğunu kontrol edin.

İlk sürümdeki saniyelik zamanlayıcılar kullanıcı tarafından gerçek Netflix üzerinde denenmiş ve çalıştığı bildirilmiştir. Refactor sonrasında otomatik testler yeniden geçmiştir; refactor ve yeni `rem` boyutlarının canlı Netflix kontrolü ayrıca yapılmalıdır. Özellikle tam ekran, klavye etkileşimi ve kontrollerin gizlenmesi yerel DOM simülasyonuyla doğrulanmaz.

## MVP sınırları

- **Videonun sonunda durdurma ve sonraki bölümü engelleme henüz yok.** Seçilen süre mevcut videodan uzunsa bu sürüm otomatik olarak süreyi kısaltmaz. Video bittiğinde veya başka bölüme geçildiğinde sayacı iptal eder; Netflix'in otomatik oynatma ayarını değiştirmez.
- Sonraki aşamada seçilen süre kalan video süresini aştığında otomatik olarak **videonun sonunda durdur** uygulanacak ve sonraki bölümün başlaması engellenecek.
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

- `extension/core/`: ortak zamanlayıcı, medya olayları, oynatıcı yaşam döngüsü ve platform kaydı.
- `extension/adapters/`: siteye özgü domain, video kimliği ve kontrol yerleşimi. Şimdilik yalnızca Netflix.
- `extension/ui/`: ortak Shadow DOM menüsü, buton ve stiller. İkon `2.125rem`, buton `2.75rem` olarak birlikte ölçeklenir.
- `extension/shared/config.js`: süre seçenekleri ve ortak çalışma ayarları.
- `extension/content.js`: mevcut sitenin adaptörünü seçip uygulamayı başlatır.
- `tests/`: birim testleri, DOM testleri ve bağımsız oynatıcı örneği.
- `.agents/skills/stream-sleep-timer/SKILL.md`: ürün kararları ve ertelenen kapsam.

Adaptör sözleşmesi ve yeni platform ekleme ayrıntıları: [ARCHITECTURE.md](ARCHITECTURE.md).

## Açık kaynak ve yayın

MIT lisansı kullanılmıştır; katkı adımları [CONTRIBUTING.md](CONTRIBUTING.md), veri işleme açıklaması [PRIVACY.md](PRIVACY.md) içindedir. Ürün adı şimdilik çalışma adıdır.

GitHub reposu veya Chrome Web Store kaydı bu teslimatta oluşturulmamıştır. Kaynak klasörünü kendi GitHub reponuza ekleyebilirsiniz. Mağazaya göndermeden önce gerçek Netflix denemesini tamamlayın, mağaza ekran görüntülerini hazırlayın ve gizlilik metnini erişilebilir bir URL'de yayımlayın.
