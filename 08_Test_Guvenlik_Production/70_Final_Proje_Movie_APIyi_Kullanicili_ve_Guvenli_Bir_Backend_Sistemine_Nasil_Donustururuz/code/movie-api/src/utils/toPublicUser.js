export const toPublicUser = (user) => ({
 id: user._id, name: user.name, email: user.email, bio: user.bio ?? "",
 avatarUrl: user.avatarUrl ?? "", isEmailVerified: user.isEmailVerified,
 role: user.role, createdAt: user.createdAt,
});
