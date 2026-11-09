# Gizlilik — Sleep Timer 0.1.0

Güncelleme: 9 Kasım 2026

Sleep Timer, Netflix web oynatıcısına yerel bir uyku zamanlayıcısı ekler.

## Yerelde işlenen bilgiler

Eklenti Netflix sayfasının URL yolunu ve oynatıcı DOM yapısını, ana videoyu ve kontrol grubunu bulmak için okur. Oynatma, duraklatma, yükleme, sarma ve bitiş olaylarını; videonun hazır/oynatılıyor durumunu ve kullanıcının seçtiği zamanlayıcı süresini yerel bellekte işler. Sayfa yolundaki video kimliği, video değiştiğinde sayacı temizlemek için kullanılır.

Bu bilgiler harici bir sunucuya gönderilmez. Eklenti hesap, analiz, reklam, çerez erişimi veya izleme geçmişi kaydı içermez. Kaynak kodda ek ağ isteği bulunmaz.

## Saklama

Zamanlayıcı ve arayüz durumu yalnızca mevcut sayfanın belleğinde tutulur. Eklenti kalıcı depolama veya Chrome senkronizasyonu kullanmaz. Sayfa yenilendiğinde veya kapatıldığında bu durum silinir.

## Sayfa erişimi

İçerik betikleri yalnızca `https://www.netflix.com/*` sayfalarında çalışır. Domain genelinde eşleşme, Netflix'te tam sayfa yenilenmeden izleme sayfasına geçişi algılamak içindir. Buton ve video işlemleri yalnızca `/watch/` sayfalarında etkinleşir. Başka siteler, tarayıcı geçmişi, mikrofon ve kamera için izin istenmez.

## Kontrol

Menüdeki **Kapalı** ile zamanlayıcı iptal edilir. Chrome'un eklenti yönetiminden eklenti devre dışı bırakılabilir veya kaldırılabilir. Yüklü betiğin mevcut sayfadan temizlenmesi için Netflix sekmesini yenileyin.

Bu metin kaynakla birlikte sunulmuştur. Mağaza yayınından önce proje sahibinin güncel iletişim bağlantısı eklenmeli ve metin herkese açık bir URL'de yayımlanmalıdır.
