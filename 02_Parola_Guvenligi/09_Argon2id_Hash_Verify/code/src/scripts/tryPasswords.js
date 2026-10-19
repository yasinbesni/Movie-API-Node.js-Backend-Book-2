import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

const password = "uzun-bir-deneme-parolasi";

const firstHash = await hashPassword(password);
const secondHash = await hashPassword(password);

console.log("Hash'ler eşit mi?", firstHash === secondHash);
console.log("Doğru parola:", await verifyPassword(firstHash, password));
console.log(
  "Yanlış parola:",
  await verifyPassword(firstHash, "yanlis-deneme-parolasi"),
);
