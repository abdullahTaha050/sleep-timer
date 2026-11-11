# Gizlilik Politikası — Sleep Timer

Güncelleme: 11 Kasım 2026

Sleep Timer, Netflix ve HBO Max web oynatıcılarına yerel bir uyku zamanlayıcısı ekler.

## Yerelde işlenen bilgiler

Eklenti desteklenen platform sayfasının URL yolunu ve oynatıcı DOM yapısını, ana videoyu ve kontrol grubunu bulmak için okur. Oynatma, duraklatma, yükleme, sarma ve bitiş olaylarını; videonun hazır/oynatılıyor durumunu ve kullanıcının seçtiği zamanlayıcı süresini yerel bellekte işler. Sayfa yolundaki video kimliği, video değiştiğinde etkin durdurma korumasını uygulamak için kullanılır.

Bu bilgiler harici bir sunucuya gönderilmez. Eklenti hesap, analiz, reklam, çerez erişimi veya izleme geçmişi kaydı içermez. Kaynak kodda ek ağ isteği bulunmaz.

Bölüm sonu koruması açıkken eklenti, Netflix'in görünür bölüm sonu kontrollerini algılar ve varsa “Jeneriği İzle” düğmesine tıklayarak otomatik geçişi iptal etmeyi dener. Netflix profilindeki otomatik oynatma ayarını değiştirmez. Koruma ve tıklama girişimlerinin durumu yalnızca sayfa belleğinde tutulur.

HBO Max’te görünür Sonraki Bölüm kartı algılandığında video duraklatılır. Sonraki bölüm düğmesine basılmaz; hesap/profil ayarları değiştirilmez. Yeniden oynatma ve yeni video için aynı sayfa belleğindeki durdurma koruması kullanılır.

## Saklama

Zamanlayıcı ve arayüz durumu yalnızca mevcut sayfanın belleğinde tutulur. Eklenti kalıcı depolama veya Chrome senkronizasyonu kullanmaz. Sayfa yenilendiğinde veya kapatıldığında bu durum silinir.

## Sayfa erişimi

İçerik betikleri yalnızca `https://www.netflix.com/*` ve `https://www.hbomax.com/*` sayfalarında çalışır. Domain genelinde eşleşme, platformlarda tam sayfa yenilenmeden izleme sayfasına geçişi algılamak içindir. Buton ve video işlemleri Netflix’te `/watch/<kimlik>`, HBO Max’te `/video/watch/<kimlik>` sayfalarında etkinleşir. Başka siteler, tarayıcı geçmişi, mikrofon ve kamera için izin istenmez.

## Kontrol

Menüdeki **Kapalı** ile zamanlayıcı iptal edilir. Chrome'un eklenti yönetiminden eklenti devre dışı bırakılabilir veya kaldırılabilir. Yüklü betiğin mevcut sayfadan temizlenmesi için ilgili platform sekmesini yenileyin.


## İletişim

Sleep Timer ücretsiz ve açık kaynaklı bir projedir.

Gizlilik politikasıyla ilgili sorularınız, önerileriniz
veya sorun bildirimleriniz için GitHub üzerinden
bizimle iletişime geçebilirsiniz:

https://github.com/abdullahTaha050/sleep-timer/issues
