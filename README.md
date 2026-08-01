# 🔒 Slock - Güvenli Şifreli Metin Editörü

<p align="center">
  <img src="https://img.shields.io/badge/Electron-v33.4-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Security-AES--256--GCM-10B981?style=for-the-badge&logo=letsencrypt&logoColor=white" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/License-MIT-blue.style=for-the-badge" alt="License" />
</p>

**Slock**, hassas metin belgelerinizi askeri düzeyde **AES-256-GCM** şifreleme ile koruyan, modern bir masaüstü metin düzenleyicisidir. Dışarıdan bakıldığında şık ve minimalist bir kod/metin editörü gibi görünür; ancak dosyalarınızı doğrudan şifrelenmiş (`.slock`) formatta saklar ve doğru anahtar şifre girilmeden içeriğin okunmasına veya değiştirilmesine izin vermez.

---

## 🌟 Öne Çıkan Özellikler

- **🔒 Askeri Düzeyde Kimlik Doğrulamalı Şifreleme (AEAD)**: `AES-256-GCM` algoritması ile verilerin hem gizliliği korunur hem de veri bütünlüğü (tamper verification) sağlanır.
- **🔑 Güçlü Anahtar Türetme (KDF)**: OWASP standartlarına uygun `PBKDF2-HMAC-SHA512` algoritması, 32-byte kriptografik rastgele tuz (salt) ve **600.000 iterasyon** ile kaba kuvvet (brute-force) saldırılarına karşı tam koruma sağlar.
- **🎨 Modern Dark Mode Editör Arayüzü**:
  - Dinamik satır numaraları gutter'ı
  - Canlı karakter, kelime ve satır sayaçları
  - Gerçek zamanlı şifre mukavemet göstergesi (Password Strength Meter)
  - Şifre göster/gizle göz butonu
  - Yalın buton araç çubuğu (`Yeni`, `Dosya Aç`, `Şifrele & Kaydet`)
  - Klavye kısayolları (`Ctrl+N`, `Ctrl+O`, `Ctrl+S`)
- **🛡️ Kenar Durum (Edge-Case) ve Bellek Güvenliği**:
  - Şifreleme işlemlerinden hemen sonra türetilmiş anahtar bellekten tamamen silinir (`Buffer.fill(0)`).
  - Şifreli dosya kurcalandığında veya hatalı anahtar girildiğinde cryptographic exception maskelenir.
  - Kaydedilmemiş değişiklikleri koruma mekanizması (Unsaved Guard).

---

## 📐 Mimari ve SOLID Prensipleri

Slock, sürdürülebilir, test edilebilir ve temiz kod (Clean Code) standartlarına tam uyumlu katmanlı bir mimari üzerine inşa edilmiştir:

```
src/
├── shared/                   # Ortak Veri Tipleri & Sabitler
│   ├── types.ts              # IPC & Şifreleme Veri Sözleşmeleri
│   └── constants.ts          # Kriptografik Sabitler
├── main/                     # Electron Ana Süreci (Node.js)
│   ├── main.ts               # Uygulama Yaşam Döngüsü & Güvenlik Politikaları
│   ├── preload.cjs           # Güvenli CommonJS contextBridge IPC Köprüsü
│   ├── services/             # İş Mantığı Servisleri
│   │   ├── crypto/           # AES-256-GCM & PBKDF2 Şifreleme Modülleri
│   │   ├── file/             # Dosya G/Ç ve Güvenlik Limitleri
│   │   └── dialog/           # Yerel Dosya İletişim Pencereleri
│   └── ipc/                  # IPC Çağrı Yönlendiricileri (Composition Root)
└── renderer/                 # Arayüz Süreci (Vite + TypeScript + HTML/CSS)
    ├── index.html            # UI İskeleti
    ├── styles/               # CSS Tasarım Sistemi & Modallar
    └── src/                  # UI Bileşenleri & Kontrolcüler
```

---

## 🔒 Güvenlik Modeli ve Önlemleri

| Güvenlik Katmanı | Kullanılan Teknoloji / Yöntem | Açıklama |
| :--- | :--- | :--- |
| **Şifreleme Algoritması** | `AES-256-GCM` | 256-bit gizlilik ve 128-bit Kimlik Doğrulama Etiketi (Auth Tag) |
| **Anahtar Türetimi (KDF)** | `PBKDF2-HMAC-SHA512` | 600.000 Iteration, 32-byte Cryptographic Salt |
| **İnterpole Rastgelelik** | `crypto.randomBytes` | Her şifrelemede benzersiz 12-byte IV (Nonce) üretimi |
| **Bellek Temizliği** | `Buffer.fill(0)` | Hassas key buffer'ları işlem sonrasında bellekten sıfırlanır |
| **Electron İzolasyonu** | `contextIsolation: true` | Preload bridge üzerinden Renderer sürecine güvenli izolasyon |
| **İçerik Güvenlik Politikası** | `Content-Security-Policy` | Dışarıdan betik çalıştırılması (XSS) engellenmiştir |

---

## 🚀 Kurulum ve Yerel Geliştirme

### Gereksinimler
- **Node.js**: v20+ veya üzeri
- **npm**: v9+ veya üzeri

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Kriptografik Güvenlik Testlerini Çalıştırın
```bash
npm run test:crypto
```

### 3. Geliştirici Modunda Çalıştırın
```bash
npm run dev
```

---

## 📦 Masaüstü Uygulaması (Build / Package) Oluşturma

Slock uygulamasını bir Windows yükleyicisi (`.exe`) veya taşınabilir tek dosya uygulama (Portable `.exe`) olarak derlemek için aşağıdaki komutları kullanabilirsiniz:

### Windows Kurulum Dosyası (`.exe` Yükleyici) Oluşturma:
```bash
npm run package
```

### Taşınabilir Windows Uygulaması (Portable `.exe`) Oluşturma:
```bash
npm run package:portable
```

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Yeni metin belgesi oluşturur |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Şifreli `.slock` dosyasını seçer ve şifre çözme penceresini açar |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Mevcut metni anahtar şifre ile şifreler ve kaydeder |

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
