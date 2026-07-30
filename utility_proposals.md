# 🔥 Ondol — Premium Utility Enhancement Proposals

Aşağıdaki özellikler, Ondol'u GIWA Chain ekosistemindeki en kapsamlı ve en premium builder aracına dönüştürmek için tasarlanmıştır. Her bir özellik **GASOK builder programına uygunluk**, **teknik fizibilite**, ve **kullanıcı etkisi** açısından değerlendirilmiştir.

---

## Tier 1 — High Impact, Feasible Now

### 1. 🐳 Whale Alert Monitor
**Ne yapar**: Büyük transfer işlemlerini (configurable threshold) otomatik olarak tespit eder ve dashboard'da canlı bildirim olarak gösterir.
- GIWA Blockscout API'nin `/transactions` endpoint'inden otomatik filtreleme
- Toast notification sistemi ile "🐳 Whale Alert: 500 ETH transferred" gibi uyarılar
- Son büyük transferlerin timeline görünümü
- **Neden önemli**: Ekosistem aktivitesini izlemeyi premium yapar, hiçbir GIWA projesi bunu yapmıyor

### 2. 💧 Integrated Faucet Claim
**Ne yapar**: Kullanıcılar doğrudan Ondol içinden testnet ETH talep edebilir — ayrı bir site açmaya gerek kalmaz.
- `https://faucet.giwa.io` API'sine entegrasyon
- MetaMask wallet bağlantısı ile tek tıkla claim
- Claim geçmişi ve cooldown timer gösterimi
- **Neden önemli**: Developer deneyimini çok geliştirir, builder programı için kritik utility

### 3. 📊 Token & Contract Analytics
**Ne yapar**: Herhangi bir ERC-20 token veya verified contract için detaylı analytics dashboard.
- Holder dağılımı (top 10 holder chart)
- Transfer hacmi zaman serisi
- Contract interaction sıklığı
- **Neden önemli**: DeFi/RWA track'i için kritik — token projeleri bunu kullanır

---

## Tier 2 — Medium Effort, High Differentiation

### 4. 📌 Watchlist & Bookmarks
**Ne yapar**: Kullanıcılar önemli adresleri, kontratları ve TX hash'lerini favorilere ekleyebilir.
- LocalStorage'da persistent bookmark sistemi
- Adres etiketleme (label) — "My Deployer", "Liquidity Pool" gibi
- Favorilerdeki adreslerin aktivite özeti dashboard'u
- **Neden önemli**: Kullanıcı bağlılığını artırır, tekrar kullanımı teşvik eder

### 5. 🏗️ One-Click Contract Deployer
**Ne yapar**: Basit Solidity kontratlarını doğrudan browser'dan GIWA Sepolia'ya deploy edebilme.
- Template kontratlar (ERC-20, ERC-721, Simple Storage)
- MetaMask ile wallet bağlantısı ve deploy transaction imzalama
- Deploy sonrası otomatik AI güvenlik taraması
- **Neden önemli**: Builder programı için en güçlü utility — yeni geliştiricileri çeker

### 6. 📡 RPC Health Monitor
**Ne yapar**: GIWA Sepolia RPC endpoint'lerinin gerçek zamanlı sağlık durumu.
- Latency ping testi (ms cinsinden)
- Block sync status
- Uptime istatistikleri
- **Neden önemli**: Developer tools bölümüne premium bir ekleme, güvenilirlik göstergesi

---

## Tier 3 — Advanced, Future Roadmap

### 7. 🖼️ NFT Gallery & Explorer
**Ne yapar**: GIWA Chain üzerinde mint edilen NFT'leri görsel galeri olarak gösterir.
- ERC-721/1155 metadata ve görsel rendering
- Collection bazlı filtreleme
- Mint geçmişi timeline
- **Neden önemli**: Consumer/Social track'i için önemli

### 8. 🔔 Custom Alert Rules Engine
**Ne yapar**: Kullanıcılar özel kurallar tanımlayabilir (örn: "X adresine transfer geldiğinde bildir").
- Rule builder UI (address + event type + threshold)
- Browser notification API entegrasyonu
- Email webhook opsiyonu (gelecekte)
- **Neden önemli**: Profesyonel trading/monitoring tool seviyesine çıkarır

---

## Önerilen Uygulama Sırası

> [!TIP]
> En fazla etkiyi en kısa sürede elde etmek için önerilen sıralama:

| Sıra | Özellik | Tahmini Süre | GASOK Track Uyumu |
|------|---------|--------------|-------------------|
| 1 | Whale Alert Monitor | ~2 saat | DeFi/RWA, Mass Adoption |
| 2 | Watchlist & Bookmarks | ~1.5 saat | Consumer/Social |
| 3 | Token Analytics | ~2.5 saat | DeFi/RWA |
| 4 | Faucet Integration | ~1 saat | GIWA-Native |
| 5 | RPC Health Monitor | ~1 saat | AI/Web3 |

> [!IMPORTANT]
> Hangi özellikleri eklememi istersin? Birden fazla seçebilirsin. "Proceed" butonuna basarsan, tablodaki ilk 5 özelliği sırasıyla implement edeceğim.
