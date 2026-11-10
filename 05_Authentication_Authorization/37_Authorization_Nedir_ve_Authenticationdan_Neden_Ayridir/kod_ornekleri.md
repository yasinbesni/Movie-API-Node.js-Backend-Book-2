# Bölüm 37 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ırarak yeni güvenlik sınırını kuracağız.

## Ada Giriş Yaptı; Bu Her Kapıyı Açar mı?

Ada'nın kendi profilini görüntülemesi için kimliğini doğrulamamız yeterliydi. Şimdi Movie API'nin yönetim tarafını düşünelim: Film kataloğundaki kayıtları herkes görebilir, ama katalog üzerinde yapılacak yönetim işlemlerini herkese açmak istemeyebiliriz.

Ada doğru parolayla giriş yapmış olabilir. Bu, **yönetici işlemi yapma izni olduğu** anlamına gelmez.

Örneğin Ada kendi profilini görüntülemek için `/users/me` yoluna girebilir. Ama yönetim kontrolü için tasarlanan `/admin/access-check` yolunda yalnızca geçerli giriş yapmış olmak yetmez; **yönetici rolü** gerekir. Aynı kullanıcının bir isteği kabul edilirken öteki reddedilebilir. Yetkilendirme tam da bu ikinci kararı verir.

Burada iki sorumuz var:

- **Kimlik doğrulama (authentication):** Bu istek kimden geliyor?
- **Yetkilendirme (authorization):** Bu kişi istenen işlemi yapabilir mi?

35. bölümdeki `authenticate` ilk soruyu cevaplıyor. İkinci sorunun cevabını henüz kodlamadık.

## İki Kullanıcı, Aynı İstek

Ada'nın normal kullanıcı, Deniz'in ise Movie API kataloğunu yöneten kişi olduğunu düşünelim. Yönetim için örnek bir yol tasarladığımızda:

```http
GET /admin/access-check
```

## Örnek 2

eklenen sonuç |
|---|---|---|---|
| Giriş yapmamış biri | Hayır | Kontrol edilemez | `401` |
| Ada (normal kullanıcı) | Evet | Hayır | `403` |
| Deniz (yönetici) | Evet | Evet | `200` |

**Bu yol henüz uygulamamızda yok**; 38. bölümde basit bir kontrol yolu olarak oluşturacağız. Gerçek film silme veya kullanıcı yönetimi işlemi eklemiyoruz.

`401 Unauthorized` adı yanıltıcı olabilir: Bu projede **geçerli kimlik doğrulama bilgisi yok** anlamında kullanacağız. `403 Forbidden` ise kimliğin bilindiğini, ancak izin bulunmadığını anlatır.

Ada ve Deniz aynı endpoint'e istek gönderebilir. Kimlik doğrulaması iki istekte de başarılıysa artık “kimlik belirsiz” değil, **“bu kullanıcı bu hedefte ne yapabilir?”** sorusuna geçeriz. Ada kendi listesi için izin alırken Deniz'in listesini değiştirmesi reddedilebilir. Giriş yapmış olmak ile belirli bir kaynağa erişim hakkı sahibi olmak iki ayrı karar olduğu için her ikisini de sunucu vermelidir.

## Yetki Kararı Sadece Rol Değildir

Bir yönetim işleminde `admin` rolü yeterli bir başlangıç olabilir. Ama Ada'nın ileride oluşturacağı kişisel film listesi için farklı bir sorumuz olacak: “Bu liste Ada'ya mı ait?”

Rol ve sahiplik birbirinin yerine geçmez:

```text
Yönetim alanına girme
→ rol kontrolü

Kişisel bir kaydı değiştirme
→ kaynak sahipliği kontrolü
```
