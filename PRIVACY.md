# Gizlilik Politikası — Sleep Timer

Güncelleme: 20 Kasım 2026

Sleep Timer, Netflix, HBO Max ve Prime Video web oynatıcılarına yerel bir uyku zamanlayıcısı ekler.

## Yerelde işlenen bilgiler

Eklenti desteklenen platform sayfasının URL yolunu ve oynatıcı DOM yapısını, ana videoyu ve kontrol grubunu bulmak için okur. Oynatma, duraklatma, yükleme, sarma ve bitiş olaylarını; videonun hazır/oynatılıyor durumunu ve kullanıcının seçtiği zamanlayıcı süresini yerel bellekte işler. Sayfa yolundaki video kimliği, video değiştiğinde etkin durdurma korumasını uygulamak için kullanılır.

Bu bilgiler harici bir sunucuya gönderilmez. Eklenti hesap, analiz, reklam, çerez erişimi veya izleme geçmişi kaydı içermez. Kaynak kodda ek ağ isteği bulunmaz.

Bölüm sonu koruması açıkken eklenti, Netflix'in görünür bölüm sonu kontrollerini algılar ve varsa “Jeneriği İzle” düğmesine tıklayarak otomatik geçişi iptal etmeyi dener. Netflix profilindeki otomatik oynatma ayarını değiştirmez. Koruma ve tıklama girişimlerinin durumu yalnızca sayfa belleğinde tutulur.

HBO Max’te görünür Sonraki Bölüm kartı algılandığında video duraklatılır. Sonraki bölüm düğmesine basılmaz; hesap/profil ayarları değiştirilmez. Yeniden oynatma ve yeni video için aynı sayfa belleğindeki durdurma koruması kullanılır.

Prime Video’da açık oynatıcının ana videosu ve detay kimliği yerelde okunur. Görünür bölüm sonu kartı, süre, doğal bitiş veya kimlik değişimiyle durdurma koruması çalışır. Sonraki içerik alanına ve Gizle düğmesine basılmaz; hesap/profil ayarları değiştirilmez.

## Saklama

Zamanlayıcı ve oynatıcı arayüzünün durumu yalnızca mevcut sayfanın belleğinde tutulur; sayfa yenilendiğinde veya kapatıldığında silinir. Popup’taki eklentiyi aç/kapat tercihi (`enabled`) Chrome’un `storage.local` alanında yalnızca bu cihazda saklanır. Bu tercih için `storage` izni kullanılır; Chrome senkronizasyonuna veya harici sunucuya gönderilmez. Eklenti kaldırılınca bu kayıt silinir.

Popup’taki GitHub, geri bildirim ve sürüm notları bağlantıları yalnızca tıklandığında ilgili siteyi yeni sekmede açar. Zamanlayıcı veya ayar verileri bu bağlantılara eklenmez.

## Sayfa erişimi

İçerik betikleri yalnızca `https://www.netflix.com/*`, `https://www.hbomax.com/*` ve `https://www.primevideo.com/*` sayfalarında çalışır. Domain genelinde eşleşme, platformlarda tam sayfa yenilenmeden izleme sayfasına geçişi algılamak içindir. Buton ve video işlemleri Netflix’te `/watch/<kimlik>`, HBO Max’te `/video/watch/<kimlik>`, Prime Video’da `/detail/<kimlik>` veya `/-/<dil>/detail/<kimlik>` sayfalarındaki açık oynatıcıda etkinleşir. Başka siteler, tarayıcı geçmişi, mikrofon ve kamera için izin istenmez.

## Kontrol

Menüdeki **Kapalı** ile o sekmenin zamanlayıcısı iptal edilir. Araç çubuğu popup’ındaki anahtar tüm desteklenen sekmelerde eklentinin zamanlayıcısını, durdurma korumasını ve arayüzünü kapatır; videoyu oynatmaz veya duraklatmaz. Yeniden açıldığında önceki sayaç geri yüklenmez. Chrome'un eklenti yönetiminden eklenti tamamen devre dışı bırakılabilir veya kaldırılabilir. Eklenti güncellemesinin mevcut sekmelere uygulanması için ilgili platform sekmesini yenileyin.


## İletişim

Sleep Timer ücretsiz ve açık kaynaklı bir projedir.

Gizlilik politikasıyla ilgili sorularınız, önerileriniz
veya sorun bildirimleriniz için GitHub üzerinden
bizimle iletişime geçebilirsiniz:

https://github.com/abdullahTaha050/sleep-timer/issues
