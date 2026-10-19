# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — http

```http
PATCH /users/me
```

### Örnek 2 — js

```js
await User.findByIdAndUpdate(
  req.user._id,
  req.body,
  { new: true },
);
```

### Örnek 3 — json

```json
{
  "role": "admin",
  "isActive": true,
  "authVersion": 0,
  "isEmailVerified": true
}
```

### Örnek 4 — text

```text
name
bio
```

### Örnek 5 — js

```js
bio: {
  type: String,
  trim: true,
  maxlength: 300,
  default: "",
},
```

### Örnek 6 — js

```js
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80),

  bio: Joi.string()
    .trim()
    .max(300),
}).min(1);
```

### Örnek 7 — js

```js
const buildProfileUpdate = (payload) => {
  const update = {};

  if (payload.name !== undefined) {
    update.name = payload.name;
  }

  if (payload.bio !== undefined) {
    update.bio = payload.bio;
  }

  return update;
};
```

### Örnek 8 — text

```text
client ne gönderirse göndersin
↓
server yalnızca izin verilen alanları seçer
```

### Örnek 9 — js

```js
export const updateMyProfile = async (
  userId,
  payload,
) => {
  const update = buildProfileUpdate(payload);

  return User.findByIdAndUpdate(
    userId,
    { $set: update },
    {
      new: true,
      runValidators: true,
    },
  );
};
```

### Örnek 10 — text

```text
/users/me
↓
req.user._id
```

### Örnek 11 — js

```js
export const updateCurrentUser = async (req, res) => {
  const user = await usersService.updateMyProfile(
    req.user._id,
    req.body,
  );

  res.status(200).json({
    data: toPublicUser(user),
  });
};
```

### Örnek 12 — js

```js
router.patch(
  "/me",
  authenticate,
  validateBody(updateProfileSchema),
  updateCurrentUser,
);
```

### Örnek 13 — http

```http
POST /users/me/email-change
```

### Örnek 14 — text

```text
yeni email al
↓
parola veya re-authentication iste
↓
yeni email için doğrulama token'ı üret
↓
doğrulanınca identity email'i değiştir
```
