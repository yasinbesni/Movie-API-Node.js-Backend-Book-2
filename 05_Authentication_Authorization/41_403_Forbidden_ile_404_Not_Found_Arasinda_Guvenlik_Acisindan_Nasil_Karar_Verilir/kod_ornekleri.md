# Bölüm 41 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

adı) Arasında Nasıl Karar Veririz?


## İzin Verilmeyen Kaydı İstemciye Nasıl Bildireceğiz?

Sahiplik kuralıyla Ada'nın Deniz'e ait bir kaydı değiştirmesini engelleyebiliyoruz. Ama bu isteğe hangi yanıtı vermeliyiz? `403`, kullanıcının bu işleme izinli olmadığını bildirirken `404`, kaydı bulamadığımızı veya varlığını açıklamadığımızı gösterebilir. **Yanıt seçimi yalnız hata metni değil, dışarıya hangi bilgiyi açığa çıkardığımızla ilgili bir karardır.**

## Ada Yanlış Film Kaydını Açarsa

Ada oturum açtı. Kendi oluşturduğu bir film kaydını değiştirmek için bağlantıyı açıyor; fakat adres çubuğundaki kayıt kimliği yanlış. Aynı bağlantı Deniz'in oluşturduğu özel bir kaydı da gösterebilirdi. Movie API dışarıya ne söylemeli?

Bu sorunun tek bir cevabı yok. Ancak iki ayrı durumu birbirinden ayırmak işimizi kolaylaştırıyor: **işlemi yapma yetkisi** ve **aranan kaydın bu kullanıcı tarafından görülebilir olması**.

HTTP durum kodları yalnızca isteğin sonucunu bildirmez; bazı durumlarda, istememeden bir kaynağın varlığı hakkında bilgi de açığa çıkarabilir.

## Önce 401'i Ayıralım

Ada hiç giriş yapmamışsa ya da erişim belirteci (access token) geçersizse henüz yetki değerlendirmesine geçmeyiz:

```http
401 Unauthorized
```

## Örnek 2

Bu projede `authenticate` ara katmanı (middleware), korunmuş isteklerde kimliği doğrulayamadığında bu yanıtı verir. `401`, adı yüzünden bazen yetki reddiyle karıştırılır; burada önce **kim olduğunu doğrulayamama** durumunu anlatıyor.

## 403 Ne Zaman Anlamlı?

Ada'nın kimliği belli olsun. Ancak yalnız yöneticilerin girebildiği bir yola ulaşmaya çalışsın:

```http
GET /admin/access-check
```

## Örnek 3

38. bölümde bu yolu gerçekten oluşturmuştuk. Ada giriş yapmış olsa bile yönetici rolüne sahip değil. Beklediğimiz yanıt:

```http
403 Forbidden
```

## Örnek 4

**403 (erişim yasak)**, isteğin anlaşıldığı fakat bu işlem için izin verilmediği anlamına gelir. Burada gizlenmesi gereken belirli bir özel kayıt kimliğinden söz etmiyoruz; rol kuralımızı bildiriyoruz.

## 404 Ne Zaman Daha Uygun?

Şimdi Ada'nın kendi oluşturduğu film kaydını güncellediğini düşünelim. Şu anda henüz bu sorguyu çalıştırmadık; 42. bölümde `owner` alanını ekleyince kullanacağız:

```js
const movie = await Movie.findOne({
  _id: movieId,
  owner: req.user._id,
});
```

## Örnek 5

Bu sorgu yalnızca **hem belirtilen kimliğe sahip hem de Ada'nın oluşturduğu** kaydı bulur. Sonuç `null` ise dışarıdaki kişi iki durumdan hangisinin yaşandığını ayıramaz:

```text
Kayıt gerçekten yok.
Kayıt var ama bu kullanıcıya ait değil.
```
