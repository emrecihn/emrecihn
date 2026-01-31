# Heybeli Store – Uçtan Uca Tasarım, Mimari ve MVP Planı

## 1) Sayfa/Screens Listesi + Kullanıcı Akışları

### Storefront (Müşteri)
**Ana sayfalar**
- Ana sayfa (banner/slider, öne çıkan kategoriler, kampanyalar, çok satanlar)
- Kategori listeleme (filtre/sıralama)
- Arama (sonuç + öneriler/oto-complete opsiyonel)
- Ürün detay (varyant, stok, görsel zoom, teslimat, iade)
- Sepet
- Checkout (misafir/üye, adres, kargo, ödeme, kupon)
- Hesabım (profil, adresler, siparişler, iade talebi, dijital indirme)
- Dijital ürün teslim/indirme sayfası (token ile erişim)
- Kurumsal: Hakkımızda, İletişim, SSS
- Yasal: KVKK/Gizlilik, Mesafeli Satış, İade/Değişim, Kargo Politikası
- Blog (liste + detay)

**RTL/Çoklu dil ekranları**
- TR/EN/AR dil seçici
- AR için RTL layout + RTL tipografi/sıralama

### Admin Panel
- Giriş (2FA opsiyonel)
- Dashboard (özet metrikler)
- Ürün yönetimi (ürün, varyant, stok, dijital varlık)
- Kategori ağacı yönetimi
- Marka yönetimi
- Sipariş yönetimi (durum, ödeme, iade)
- Kargo yönetimi (etiket/track, durum güncelleme)
- Müşteri yönetimi
- Kampanyalar (kupon, ücretsiz kargo barajı)
- Toplu ürün yükleme (Excel import + hata raporu)
- İçerik/Banner/Blog yönetimi
- Raporlar
- Kullanıcı/Rol/Yetki yönetimi
- Admin aksiyon logları

### Müşteri Akışları
**Browse → Cart → Checkout → After-sales**
1. Ana sayfa → kategori/arama → ürün detay
2. Varyant seçimi + stok kontrol → sepete ekle
3. Sepet → kupon uygula → checkout
4. Checkout: misafir/üye seçimi → adres → kargo → ödeme → sipariş oluştur
5. After-sales: sipariş takibi, iade talebi, dijital ürün indirme

### Admin Akışları
**Ürün ekleme → stok → sipariş → kargo → rapor**
1. Ürün oluştur → varyantlar → stok girişleri
2. Sipariş alındı → ödeme durumu güncelle
3. Kargo entegrasyonu ile gönderi oluştur → takip numarası
4. Kargo durumlarını webhook/polling ile güncelle
5. Raporlar → ciro/sipariş/iade analizi

---

## 2) Veri Modeli (PostgreSQL Odaklı)

Aşağıdaki modeller “çoklu dil”, “fiziksel + dijital ürün” ve “kargo adaptörü” yapısını destekler.

### Temel Tablolar ve İlişkiler
- **Users** (müşteri + admin)
  - id, email, phone, password_hash (nullable), is_guest, locale, created_at
  - Index: email unique, phone
- **Roles**, **Permissions**, **RolePermissions**, **UserRoles**
  - RBAC için
  - Index: role_id, permission_id
- **Products**
  - id, type (physical|digital), brand_id, status, base_price, currency, sku_base, slug, is_active
  - Index: slug unique, type, brand_id
- **ProductTranslations**
  - product_id, locale (tr|en|ar), title, description, meta_title, meta_desc
  - Index: (product_id, locale) unique
- **Categories**
  - id, parent_id (tree), slug, is_active, sort_order
  - Index: parent_id, slug unique
- **CategoryTranslations**
  - category_id, locale, name, description, meta_title, meta_desc
  - Index: (category_id, locale) unique
- **Brands**, **BrandTranslations**
- **ProductCategory** (many-to-many)
  - product_id, category_id
  - Index: (product_id, category_id) unique
- **ProductImages**
  - product_id, url, sort_order, alt_text
- **ProductVariants**
  - id, product_id, sku, price_override, weight, dimensions, barcode
  - Index: product_id, sku unique
- **VariantOptions**
  - variant_id, option_name (color/size), option_value
  - Index: variant_id
- **StockMovements**
  - variant_id, type (in|out|reserve|release|adjust), quantity, order_id, created_at
  - Index: variant_id, order_id, created_at

### Sipariş/Ödeme/Kargo
- **Orders**
  - id, user_id (nullable for guest), status, payment_status, currency, total, shipping_total, discount_total
  - shipping_address_json, billing_address_json, locale
  - Index: user_id, status, created_at
- **OrderItems**
  - order_id, product_id, variant_id, qty, unit_price, total
  - Index: order_id, product_id, variant_id
- **Payments**
  - order_id, method (card|cod|bank_transfer), status, provider_ref, amount
  - Index: order_id, status
- **Shipments**
  - order_id, carrier_code, tracking_number, status, shipped_at, delivered_at
  - Index: order_id, tracking_number, status
- **ShipmentEvents**
  - shipment_id, status, payload_json, occurred_at
  - Index: shipment_id, occurred_at

### Dijital Ürün
- **DigitalAssets**
  - product_id, variant_id (nullable), storage_key, file_name, file_size, checksum
  - Index: product_id, variant_id
- **DigitalDownloads**
  - order_id, product_id, variant_id, download_count, last_download_at
- **DownloadTokens**
  - token, order_id, product_id, expires_at, max_downloads, used_count
  - Index: token unique, expires_at

### Kampanya / Kupon
- **Coupons**
  - code, type (percent|fixed), value, start_at, end_at, min_cart_total, max_usage
  - Index: code unique
- **CouponRules**
  - coupon_id, rule_type (category|brand|product), rule_value

### İçerik
- **BlogPosts**
  - slug, status, published_at, author_id
  - Index: slug unique, status
- **BlogTranslations**
  - blog_post_id, locale, title, content, meta_title, meta_desc
  - Index: (blog_post_id, locale) unique
- **Banners**
  - position, image_url, link_url, active_from, active_to

### Loglama
- **AdminAuditLogs**
  - admin_user_id, action, entity_type, entity_id, payload_json, created_at
  - Index: admin_user_id, created_at

**Index önerileri**
- Ürün arama için: `Products(status, is_active)` + full-text arama için `ProductTranslations` üzerinde `GIN` index.
- Kategori filtreleme için: `ProductCategory(category_id, product_id)` index.
- Sipariş filtreleme için: `Orders(status, payment_status, created_at)` composite index.

---

## 3) API Endpoint Listesi (REST)

### Auth
- `POST /auth/login` (müşteri)
- `POST /auth/register` (opsiyonel)
- `POST /auth/guest` (misafir checkout token)
- `POST /admin/auth/login`
- `POST /admin/auth/logout`
- `POST /auth/refresh`

### Ürün/Kategori/Arama
- `GET /catalog/categories`
- `GET /catalog/categories/:slug`
- `GET /catalog/products?category=&q=&filters=&sort=&page=`
- `GET /catalog/products/:slug`
- `GET /catalog/brands`

### Sepet/Checkout
- `POST /cart`
- `GET /cart`
- `PUT /cart/items/:id`
- `DELETE /cart/items/:id`
- `POST /checkout`
- `POST /checkout/apply-coupon`

### Ödeme
- `POST /payments/initiate` (kart)
- `POST /payments/cod` (kapıda ödeme)
- `POST /payments/bank-transfer` (havale/EFT)
- `GET /payments/:id/status`

### Sipariş/İade
- `GET /orders`
- `GET /orders/:id`
- `POST /orders/:id/return-request`

### Kargo Entegrasyonu (Adapter)
- `POST /shipments` (create shipment)
- `GET /shipments/:id` (tracking)
- `POST /shipments/webhook/:carrier` (status updates)

### Dijital İndirme
- `POST /downloads/token` (sipariş sonrası token üretimi)
- `GET /downloads/:token` (token doğrulama + indirme)
- `POST /downloads/:token/log` (indirme log)

### Admin CRUD + Raporlar
- `GET /admin/products` / `POST /admin/products` / `PUT /admin/products/:id`
- `POST /admin/products/import` (Excel upload)
- `GET /admin/products/import/:id/report`
- `GET /admin/orders` / `PUT /admin/orders/:id/status`
- `POST /admin/shipments/:orderId` (kargo oluştur)
- `GET /admin/customers`
- `GET /admin/coupons` / `POST /admin/coupons`
- `GET /admin/reports/sales`
- `GET /admin/content/banners` / `POST /admin/content/banners`
- `GET /admin/blog` / `POST /admin/blog`
- `GET /admin/roles` / `POST /admin/roles`

---

## 4) Rol/Yetki Matrisi (Rol → İzinler)

| Rol | Ürün | Sipariş | Kargo | Kampanya | İçerik | Rapor | Kullanıcı/Rol |
|---|---|---|---|---|---|---|---|
| Super Admin | Tüm CRUD | Tüm CRUD | Tüm CRUD | Tüm CRUD | Tüm CRUD | Tüm erişim | Yönetim |
| Ürün Sorumlusu | Ürün/variant/stock CRUD | Görüntüle | Yok | Yok | Görüntüle | Yok | Yok |
| Sipariş Sorumlusu | Görüntüle | Güncelle | Kargo oluştur/güncelle | Yok | Yok | Görüntüle | Yok |
| İçerik Sorumlusu | Yok | Yok | Yok | Yok | Banner/Blog CRUD | Yok | Yok |
| Rapor Sorumlusu | Görüntüle | Görüntüle | Görüntüle | Görüntüle | Görüntüle | Tüm erişim | Yok |

---

## 5) MVP Planı (2–4 hafta)

### Olmazsa Olmaz MVP Modülleri
- Çoklu dil (TR/EN/AR + RTL)
- Ürün listeleme/filtreleme
- Sepet + Checkout (misafir dahil)
- Ödeme yöntemleri (kart, kapıda, havale/EFT)
- Stok takibi + varyant yönetimi
- Admin panel temel CRUD
- Kargo adaptörü ile 1 firma entegrasyonu
- Dijital ürün teslim (download token)
- Excel import
- Temel raporlar

### Sprint Bazlı Plan
**Sprint 1 (Hafta 1-2)**
- Storefront temel akışları (ana sayfa, kategori, ürün detay, sepet)
- Admin panel ürün CRUD + kategori/marka
- Çoklu dil + RTL altyapısı
- Stok yönetimi temel
**Kabul kriterleri**: ürün eklenebilir, TR/EN/AR içerik görülebilir, RTL çalışır.

**Sprint 2 (Hafta 2-3)**
- Checkout + ödeme yöntemleri
- Sipariş yönetimi + ödeme durumları
- Kargo adaptörü + 1 entegrasyon
- Dijital ürün teslim tokenı
**Kabul kriterleri**: checkout tamamlanır, sipariş oluşur, kargo bilgisi atanır.

**Sprint 3 (Hafta 3-4)**
- Excel import + hata raporu
- Kampanya/kupon
- Raporlar (ciro, sipariş)
- Admin rol/yetki
**Kabul kriterleri**: excel import çalışır, kupon uygulanır.

### v1 / v1.1 / v2
- **v1**: MVP modüller
- **v1.1**: müşteri sadakat/puan sistemi, gelişmiş raporlama, çoklu kargo firması
- **v2**: e-fatura/e-arşiv entegrasyonu, gelişmiş kişiselleştirme, omnichannel

---

## 6) UI/UX Yönergeleri

### Tasarım Yaklaşımı
- Sıcak tonlar (toprak, pastel turuncu, sıcak bej)
- Modern, güven veren; rounded button + soft shadow
- Ürün görselleri ön planda, boşluk (whitespace) dengesi

### Component Listesi
- Header: logo + arama + dil seçici + sepet
- Banner/slider
- Product card
- Filter sidebar
- Variant selector (chips/tiles)
- Stock badge
- Price component (indirimli/normal)
- WhatsApp floating button
- Checkout steps
- Form input + inline validation

### AR RTL Stratejisi
- CSS logical properties (margin-inline, padding-inline)
- Typography RTL destekli fontlar (örn. Cairo, Noto Sans Arabic)
- RTL’de ikon yönleri ters çevrilecek
- Grid ve flex yönleri locale bazlı değiştirilecek

---

## 7) DevOps / Deployment Planı

### Repo / Monorepo
- Öneri: monorepo (pnpm workspaces veya Nx)
  - `/apps/storefront` (Next.js)
  - `/apps/admin` (Next.js)
  - `/apps/api` (NestJS)
  - `/packages/shared` (types, utils)

### Docker Compose Servisleri
- `storefront` (Next.js)
- `admin` (Next.js)
- `api` (NestJS)
- `postgres`
- `redis`
- `nginx` (reverse proxy + SSL)

### Env Değişkenleri
- DB_URL, REDIS_URL
- S3_ENDPOINT, S3_KEY, S3_SECRET
- JWT_SECRET, SESSION_SECRET
- PAYMENT_PROVIDER_KEYS
- SHIPPING_API_KEYS

### Backup
- DB: nightly pg_dump + S3/Offsite
- Storage: S3 lifecycle + versioning

### Logging/Monitoring
- Uygulama logları: stdout + loki/ELK opsiyonel
- Monitoring: uptime checks + basic metrics (Grafana/Prometheus opsiyonel)

---

## 8) Teknoloji Seçimi Gerekçesi

### Next.js SSR/SSG Avantajları
- SEO odaklı: SSR/SSG ile arama motorlarına hazır içerik
- Hız: statik sayfalar + edge caching
- Çoklu dil desteği ile hız ve SEO avantajı birlikte

### WordPress/WooCommerce Kıyas
- WooCommerce hızlı kurulum sunar ancak:
  - Çoklu dil + RTL + dijital ürün + özel kargo adaptörü için ağır özelleştirme gerekir
  - Performans ve ölçeklenebilirlik zorlaşır
  - Güvenlik ve özelleştirme maliyeti artar
- Özel Next.js + NestJS mimarisi:
  - Performans/SEO kontrolü
  - Kargo entegrasyonu ve dijital teslimat gibi iş kurallarında esneklik
  - Uzun vadede ölçeklenebilirlik
