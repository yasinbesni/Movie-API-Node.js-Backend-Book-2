# Bölüm 16 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Session (Oturum) Nedir ve Session ID (Oturum Kimliği) Neden Kullanılır?

## Cookie Geldi. Movie API Şimdi Ada'yı Nasıl Bulacak?

On beşinci bölümde tarayıcının `sid` çerezini saklayıp uygun isteğe ekleyebildiğini gördük. Ada kişisel listesini açmak üzere yeni bir istek gönderiyor. Sunucunun gördüğü bilgiye bakalım:

```http
Cookie: sid=abc123
```

## Örnek 2

`abc123` yalnızca akışı kolay görmek için kullandığımız **uydurma bir örnek**; gerçek bir oturum kimliği böyle kısa ve tahmin edilebilir olmamalı.

Sunucu bu değere bakınca Ada'nın adını sihirli biçimde öğrenemez. Sorulması gereken soru şudur: **“Bu kimliğe karşılık gelen, hâlâ geçerli bir oturum kaydım var mı?”**

## Oturum Kaydı Neyi Hatırlar?

**Session (oturum)**, sunucunun belirli bir girişe ilişkin tuttuğu kayıttır. **Session ID (oturum kimliği)** ise o kaydı bulmaya yarayan anahtardır. Tarayıcının gönderdiği çerezde anahtar bulunur; kullanıcıyla ilişkiyi sunucu kendi kaydında tutar.

Şimdi iki tarafa ayrı ayrı bakalım:

```text
ADA'NIN TARAYICISI              MOVIE API / OTURUM KAYDI

Cookie: sid=abc123   ────────►  abc123 kaydını ara
                                │
                                ├─ kayıt yok / süresi dolmuş → oturum geçersiz
                                │
                                └─ kayıt var → userId: 66f...
                                                ↓
                                             User kaydı: Ada
```

## Örnek 3

İlk durumda yalnızca bir cookie gelmiştir; geçerli bir oturum bulunamadığı için Ada'yı giriş yapmış sayamayız. İkinci durumda sunucu, kimliğin karşılığını bulur ve ilgili kullanıcıyı tanıyabilir. **Kimlik doğrulamak ile Ada'nın istediği veriye erişmeye yetkili olduğunu denetlemek yine ayrı işlerdir.** Örneğin Deniz kendi geçerli oturumuyla Ada'nın özel verisini isteyebilir; bu durumda ayrıca erişim kontrolü gerekir.

Burada neden Ada'nın tüm bilgilerini cookie'ye yazmadığımızı da görebiliriz: Tarayıcıya yalnızca tahmin edilmesi güç bir kimlik vererek oturum içeriğini sunucunun denetiminde tutuyoruz. Gerekirse oturum kaydını silerek o kimliği geçersiz kılabiliriz.

## Aynı Kullanıcının İki Cihazı Olursa?

Ada sabah telefonundan, akşam bilgisayarından Movie API'ye giriş yapsın. Hesap aynı, fakat iki giriş için iki ayrı oturum oluşturabiliriz:

```text
Telefon      sid=A1 ────┐
                        ├──► Ada'nın kullanıcı hesabı
Bilgisayar   sid=B2 ────┘
```
