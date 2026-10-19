# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
User
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt
```

### Örnek 2 — text

```text
src/db/models/movie.js
```

### Örnek 3 — text

```text
src/db/models/user.js
```

### Örnek 4 — js

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
});
```

### Örnek 5 — js

```js
email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  unique: true,
},
```

### Örnek 6 — js

```js
passwordHash: {
  type: String,
  required: true,
  select: false,
},
```

### Örnek 7 — js

```js
const user = await User.findById(userId);
```

### Örnek 8 — js

```js
const user = await User.findOne({ email }).select("+passwordHash");
```

### Örnek 9 — js

```js
{
  timestamps: true,
}
```

### Örnek 10 — js

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
```

### Örnek 11 — text

```text
User belgesinin yapısı → hazır
Güvenli kayıt endpoint'i → henüz yok
```

### Örnek 12 — text

```text
src/
└── db/
    └── models/
        ├── director.js
        ├── movie.js
        └── user.js
```
