# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
veri + gizli anahtar
        ↓
    şifreli veri
        ↓
aynı veya ilişkili anahtarla çözme
        ↓
    özgün veri
```

### Örnek 2 — text

```text
Kayıt:   parola ──► Argon2id ──► passwordHash
                                  │
Giriş:   parola ─────► verify ◄───┘
                         │
                   doğru / yanlış
```

### Örnek 3 — text

```text
aynı parola + salt A  → hash A
aynı parola + salt B  → hash B
```

### Örnek 4 — text

```text
name          → Ada
email         → ada@example.com
passwordHash  → Argon2id ile üretilen değer
```
