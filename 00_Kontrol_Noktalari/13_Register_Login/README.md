# Kontrol noktası — 13. bölüm sonrası Register / Login

Bu klasör **birinci kitabın gerçek Movie API final kodundan** başlatıldı ve ikinci kitabın 5, 6, 9, 10, 11 ve 13. bölümlerindeki tam dosya örnekleri eklenerek oluşturuldu. Bu, daha sonraki session veya JWT bölümlerini **içermez**.

- `npm install` komutunu bu klasörde çalıştırın (gerekli `argon2` bağımlılığı eklenmiştir).
- `.env.example` ayarlarını ayrı deneme veritabanı için yapılandırın.
- `npm start` ile çalıştırıp `POST /auth/register` ve `POST /auth/login` isteklerini deneyebilirsiniz.
- Bu paket için yalnızca **statik kod kontrolü** yaptık; gerçek MongoDB bağlantısıyla entegrasyon testi çalıştırılmış değildir.

**Açıklama:** Bu bağımsız kontrol noktası, bölüm klasörlerinin `code/` içerikleriyle karıştırılmamalıdır. Bölüm klasörleri kaynak örnekleri tutar, bu klasör ise 13. bölümün *birleştirilmiş uygulama kodu*dur.
