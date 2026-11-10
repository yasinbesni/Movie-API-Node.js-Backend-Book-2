# Bölüm 38 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Rol Tabanlı Yetkilendirme (Role-Based Authorization) Nasıl Kurulur?


## Yönetim İşlemlerini Kim Yapabilecek?

Ada'nın hesabını doğrulayabilsek bile her endpoint'i ona açmıyoruz. Örneğin yönetim için ayrılmış bir yol yalnız `admin` rolüyle kullanılabilir. **Role bakmak, kimlik doğrulamanın yerine geçmez; doğrulanmış kullanıcıya uygulanacak ek bir izin kuralıdır.** `authenticate` sonrasında rol denetimini ayrı bir middleware olarak yerleştireceğiz.

## Deniz'in Yönetim Yolunu Ayıralım

Ada normal kullanıcı, Deniz ise yönetici rolünde. Artık Movie API’nin bu iki rol arasındaki farkı erişim kararında kullanması gerekiyor.

Kullanıcının rolünü (*role*) hesap kaydında tutacağız. Şimdilik iki değer yeterli:

```text
user  → normal kullanıcı
admin → yönetici
```

## Örnek 2

Bu, **rol tabanlı erişim kontrolü (RBAC)** yaklaşımının küçük bir örneği. Henüz karmaşık bir izin sistemi kurmaya ihtiyacımız yok.

## User Modeline Rol Ekleyelim

5. bölümde oluşturduğumuz `src/db/models/user.js` içindeki şemaya, diğer alanların yanına şu alanı ekleyin:

```js
role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},
```

## Örnek 3

Yeni hesaplar varsayılan olarak `user` rolünü alacak. **Neden varsayılan rol `admin` değil?** Ada kendi listesini kullanabilmek için yönetim yetkisine ihtiyaç duymuyor. En az yetki ilkesi gereği yeni hesaba yalnız gerekli hakları tanıyoruz; daha fazla yetki ancak güvenilir bir yönetim işlemiyle verilebilir. **Bu alanı kayıt formuna eklemiyoruz.** 6. bölümdeki Joi sözleşmesi `role` alanını kabul etmiyor; 10. bölümdeki kayıt Service'i de yalnız izin verilen hesap alanlarını yazıyor. Dolayısıyla Ada isteğine `"role": "admin"` ekleyerek kendisini yönetici yapamaz.

Önemli bir ayrıntı: **`default: "user"` ile eski veritabanı kayıtlarının tamamının otomatik güncellendiğini varsaymayalım.** Daha önce açılmış hesaplar varsa rol alanları ayrı kontrol edilmeli ve gerekirse güvenli bir veri geçişi planlanmalı. Buradaki denemeleri ayrı test veritabanında yapacağız.

## Bir Ara Katmanla Kontrol Edelim

Yeni dosya: `src/middlewares/requireRole.js`

```js
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Kimlik doğrulaması gerekli.");
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("Bu işlem için yetkiniz yok.");
      error.status = 403;
      return next(error);
    }

    return next();
  };
};
```

## Örnek 4

Bu fonksiyon önce kullanıcı bilgisinin bulunup bulunmadığına, ardından rolün izin verilen değerler arasında olup olmadığına bakıyor. Rol eksik veya beklenmeyen bir değerse izin vermiyor.

Dikkat edin: `requireRole` JWT doğrulaması yapmıyor. Bu işi 35. bölümdeki `authenticate` zaten yapıyor.

Ada normal kullanıcı, Deniz yönetici olsun. İkisi de geçerli token ile yönetim yoluna gelebilir; **kimlik kontrolü ikisi için de başarılı**, rol kontrolü ise yalnız Deniz için olumlu sonuç verir. `authenticate` çalışmadan `requireRole('admin')` çalıştırmak, güvenilir `req.user` bağlamı olmadan rol aramak demektir. Middleware sırasının güvenlik açısından neden önemli olduğu burada görünür hâle gelir.

## İlk Yönetim Yolumuzu Gerçekten Oluşturalım

Henüz katalog değiştirme işlemine girmeden yalnız erişim kararını görebileceğimiz küçük bir yol ekleyelim. Yeni dosya `src/routers/admin.js`:

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get(
  "/access-check",
  authenticate,
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({ data: { message: "Yönetici erişimi doğrulandı." } });
  },
);

export default router;
```

## Örnek 5

Ardından `src/server.js` içindeki mevcut import'lara şunu ekleyin:

```js
import adminRouter from "./routers/admin.js";
```

## Örnek 6

Mevcut Router kayıtlarının yanına, merkezi `errorHandler` çağrısından **önce** şunu ekleyin:

```js
app.use("/admin", adminRouter);
```

## Örnek 7

Böylece `GET /admin/access-check` yolu ilk kez oluştu. Bu yalnızca bir **erişim kontrolü denemesi**; gerçek bir yönetim işlemi veya kullanıcı verisi döndürmüyor. Bölümü tamamladıktan sonra bu deneme yolunu kaldırabiliriz. Gerçek yönetim uç noktalarını ileride ihtiyaç doğduğunda ayrıca tasarlayacağız.

## Ada ve Deniz ile Deneyelim

Ayrı test veritabanında iki hesap oluşturun. Ada normal kullanıcı olarak kalsın. Deniz'in test hesabına yönetici rolünü **yalnızca güvenilir bir test/seed işlemiyle** verin; herkese açık kayıt endpoint'inden rol atanmasına izin vermeyin.

Aynı JWT girişini kullanarak yeni yola üç farklı istek gönderin:

1. Erişim çerezi olmadan: `401`.
2. Ada'nın erişim çereziyle: `403`.
3. Deniz'in erişim çereziyle: `200`.

Bu örneğin doğru işlemesi için sırayı bozmuyoruz:

```text
authenticate → req.user → requireRole("admin") → yanıt
```
