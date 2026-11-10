import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import mongoose from "mongoose";
import request from "supertest";
import sharp from "sharp";
import { MongoMemoryReplSet } from "mongodb-memory-server";
let repl, app, User, Movie, RefreshToken, AccountToken, WatchlistItem, AuditEvent, Review, issueEmailVerificationToken, issuePasswordResetToken;
let ada, deniz, adaCsrf, denizCsrf, movieId, temp, previousCwd;
const password = "Movie_API_test_parola_2026!";
const messages = [];
let smtp, scanner, scannerMode = "clean", smtpFail = false;
const listen = server => new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const close = server => new Promise(resolve => server.close(resolve));
const mutate = (agent, csrf, method, url, body) => agent[method](url).set("X-CSRF-Token", csrf).send(body);
before(async () => {
 // Daima geçici veritabanı: geliştiricinin .env dosyası veya gerçek MongoDB adresi kullanılmaz.
 repl = await MongoMemoryReplSet.create({ replSet: { count: 1, args: process.platform === "win32" ? [] : ["--nounixsocket"] }, binary: { version: "7.0.14" } });
 smtp = createServer(socket => {
  socket.setEncoding("utf8"); socket.write("220 localhost ESMTP\r\n");
  let buffer = "", data = false, mail = [];
  socket.on("data", chunk => {
   buffer += chunk;
   while (buffer.includes("\r\n")) {
    const end = buffer.indexOf("\r\n"), line = buffer.slice(0,end); buffer = buffer.slice(end+2);
    if (data) { if (line === ".") { data = false; messages.push(mail.join("\n")); socket.write(smtpFail ? "451 test failure\r\n" : "250 queued\r\n"); mail = []; } else mail.push(line); }
    else if (/^DATA/i.test(line)) { data = true; socket.write("354 send data\r\n"); }
    else if (/^QUIT/i.test(line)) { socket.end("221 bye\r\n"); }
    else if (/^EHLO/i.test(line)) socket.write("250-localhost\r\n250 SIZE 5242880\r\n");
    else socket.write("250 OK\r\n");
   }
  });
 });
 const smtpPort = await listen(smtp);
 scanner = createServer(socket => {
  let buffer = Buffer.alloc(0);
  socket.on("data", chunk => {
   buffer = Buffer.concat([buffer, chunk]);
   if (buffer.length >= 14) {
    const size = buffer.readUInt32BE(10);
    if (buffer.length >= size+18) socket.end(scannerMode === "clean" ? "stream: OK\0" : "stream: Eicar-Test-Signature FOUND\0");
   }
  });
 });
 const scannerPort = await listen(scanner);
 Object.assign(process.env, {
  NODE_ENV: "test", MONGODB_URL: repl.getUri(), CORS_ORIGIN: "http://localhost:5173", APP_BASE_URL: "http://localhost:5173",
  SESSION_SECRET: randomBytes(48).toString("hex"), JWT_ACCESS_SECRET: randomBytes(48).toString("hex"), CSRF_SECRET: randomBytes(48).toString("hex"),
  LOG_LEVEL: "silent", RATE_LIMIT_LIMIT: "10000", SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtpPort), SMTP_USER: "", SMTP_PASS: "",
  EMAIL_FROM: "test@example.com", SUPPORT_EMAIL_TO: "support@example.com", AVATAR_STORAGE: "local", CLAMAV_HOST: "127.0.0.1", CLAMAV_PORT: String(scannerPort),
 });
 previousCwd = process.cwd(); temp = await mkdtemp(path.join(tmpdir(), "movie-api-test-")); process.chdir(temp);
 await mongoose.connect(repl.getUri(), { dbName: "movie_api_test" });
 ({ app } = await import("../src/server.js"));
 ({ User } = await import("../src/db/models/user.js")); ({ Movie } = await import("../src/db/models/movie.js"));
 ({ RefreshToken } = await import("../src/db/models/refreshToken.js")); ({ AccountToken } = await import("../src/db/models/accountToken.js"));
 ({ WatchlistItem } = await import("../src/db/models/watchlistItem.js")); ({ AuditEvent } = await import("../src/db/models/auditEvent.js"));
 ({ Review } = await import("../src/db/models/review.js"));
 ({ issueEmailVerificationToken, issuePasswordResetToken } = await import("../src/services/accountTokens.js"));
 await Promise.all(Object.values(mongoose.models).map(model => model.init()));
 ada = request.agent(app); deniz = request.agent(app);
 adaCsrf = (await ada.get("/auth/csrf")).body.csrfToken; denizCsrf = (await deniz.get("/auth/csrf")).body.csrfToken;
});
after(async () => {
 await mongoose.disconnect(); if (repl) await repl.stop();
 if (smtp) await close(smtp); if (scanner) await close(scanner);
 if (previousCwd) process.chdir(previousCwd); if (temp) await rm(temp, { recursive:true, force:true });
});
test("Sağlık ve dokümantasyon yolları", async () => {
 assert.equal((await request(app).get("/health")).status,200);
 assert.equal((await request(app).get("/docs/")).status,200);
});
test("CSRF eksik, bozuk ve yanlış kaynağa sahip istekleri reddeder", async () => {
 assert.equal((await ada.post("/auth/register").send({})).status,403);
 assert.equal((await mutate(ada,"bad","post","/auth/register",{})).status,403);
 assert.equal((await ada.post("/auth/register").set("X-CSRF-Token",adaCsrf).set("Origin","https://evil.example").send({})).status,403);
});
test("Hatalı kayıt 400; kayıt 201; parola hash'i yanıt içinde bulunmaz", async () => {
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/register",{ name:"A", email:"bad", password:"short" })).status,400);
 for (const [agent,csrf,name] of [[ada,adaCsrf,"Ada"],[deniz,denizCsrf,"Deniz"]]) {
  const r = await mutate(agent,csrf,"post","/auth/register",{ name,email:`${name.toLowerCase()}@example.com`,password });
  assert.equal(r.status,201,JSON.stringify(r.body)); assert.ok(!JSON.stringify(r.body).includes("passwordHash"));
 }
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/register",{ name:"Ada",email:"ada@example.com",password })).status,409);
});
test("Var olmayan hesap ve yanlış parola aynı 401 yanıtını verir", async () => {
 const one=await mutate(ada,adaCsrf,"post","/auth/jwt/login",{ email:"ada@example.com",password:"wrong" });
 const two=await mutate(ada,adaCsrf,"post","/auth/jwt/login",{ email:"nobody@example.com",password:"wrong" });
 assert.equal(one.status,401);assert.equal(two.status,401);assert.deepEqual(one.body,two.body);
});
test("JWT giriş, anonim 401 ve yönetici olmayan hesaba 403", async () => {
 for (const [agent,csrf,email] of [[ada,adaCsrf,"ada@example.com"],[deniz,denizCsrf,"deniz@example.com"]]) {
  const r=await mutate(agent,csrf,"post","/auth/jwt/login",{ email,password });assert.equal(r.status,200,JSON.stringify(r.body));
  assert.ok(r.headers["set-cookie"].every(x=>x.includes("HttpOnly")));
 }
 assert.equal((await request(app).get("/users/me")).status,401);
 assert.equal((await ada.get("/users/me")).status,200);assert.equal((await ada.get("/admin/access-check")).status,403);
});
test("Doğrulanmamış kullanıcı film oluşturamaz; doğrulama tokenı tek kullanımlıktır", async () => {
 assert.equal((await mutate(ada,adaCsrf,"post","/movies",{title:"Interstellar",releaseYear:2014,voteAverage:8})).status,403);
 const user=await User.findOne({email:"ada@example.com"});const raw=await issueEmailVerificationToken(user._id);
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/verify-email",{token:raw})).status,200);
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/verify-email",{token:raw})).status,400);
});
test("Film oluşturma, sahiplik, herkese açık katalog ve kişisel liste", async () => {
 const r=await mutate(ada,adaCsrf,"post","/movies",{title:"Interstellar",releaseYear:2014,voteAverage:8});assert.equal(r.status,201,JSON.stringify(r.body));movieId=r.body.data._id;
 assert.equal((await mutate(deniz,denizCsrf,"patch",`/movies/${movieId}`,{title:"Hacked"})).status,404);
 assert.equal((await Movie.findById(movieId)).title,"Interstellar");
 assert.equal((await mutate(ada,adaCsrf,"patch",`/movies/${movieId}`,{voteAverage:9})).status,200);
 assert.equal((await request(app).get("/movies")).body.data.length,1);
 assert.equal((await deniz.get("/users/me/movies")).body.data.length,0);
 assert.equal((await ada.get("/users/me/movies")).body.data.length,1);
 assert.equal((await request(app).get("/movies/bad-id")).status,400);
});
test("Eşzamanlı izleme listesi isteği tek kayıt üretir; kişisel liste sızmaz", async () => {
 const results=await Promise.all([mutate(ada,adaCsrf,"post",`/watchlist/${movieId}`,{}),mutate(ada,adaCsrf,"post",`/watchlist/${movieId}`,{})]);
 assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);assert.equal(await WatchlistItem.countDocuments(),1);
 assert.equal((await deniz.get("/watchlist")).body.data.length,0);assert.equal((await ada.get("/watchlist")).body.data.length,1);
 assert.equal((await mutate(deniz,denizCsrf,"delete",`/watchlist/${movieId}`,{})).status,404);assert.equal(await WatchlistItem.countDocuments(),1);
 assert.equal((await ada.get("/watchlist?limit=900")).status,400);
});
test("Review doğrulaması, tekil indeks ve puan ortalaması", async () => {
 assert.equal((await mutate(ada,adaCsrf,"post",`/movies/${movieId}/reviews`,{rating:99})).status,400);
 assert.equal((await mutate(ada,adaCsrf,"post",`/movies/${movieId}/reviews`,{rating:9,text:"İyi bir film"})).status,201);
 assert.equal((await mutate(ada,adaCsrf,"post",`/movies/${movieId}/reviews`,{rating:7})).status,409);
 const r=await request(app).get(`/movies/${movieId}/reviews/stats`);assert.equal(r.body.data.ratingAverage,9);assert.equal(r.body.data.ratingCount,1);
});
test("Profil güncellemesi yalnız izinli alanları kabul eder", async () => {
 assert.equal((await mutate(ada,adaCsrf,"patch","/users/me",{role:"admin"})).status,400);
 const r=await mutate(ada,adaCsrf,"patch","/users/me",{bio:"Film meraklısı"});assert.equal(r.status,200);assert.equal(r.body.data.bio,"Film meraklısı");assert.equal((await User.findOne({email:"ada@example.com"})).role,"user");
});
test("Avatar gerçek görsel doğrulaması, boyut ve tür sınırları", async () => {
 const png=await sharp({create:{width:30,height:30,channels:3,background:"navy"}}).png().toBuffer();
 let r=await ada.post("/users/me/avatar").set("X-CSRF-Token",adaCsrf).attach("avatar",png,{filename:"test.png",contentType:"image/png"});assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal((await request(app).get(r.body.data.avatarUrl)).status,200);
 r=await ada.post("/users/me/avatar").set("X-CSRF-Token",adaCsrf).attach("avatar",Buffer.from("fake"),{filename:"fake.png",contentType:"image/png"});assert.equal(r.status,400);
 r=await ada.post("/users/me/avatar").set("X-CSRF-Token",adaCsrf).attach("avatar",Buffer.alloc(2*1024*1024+1),{filename:"big.png",contentType:"image/png"});assert.equal(r.status,413);
});
test("Destek: doğrulanmamış hesap, hatalı mesaj ve istemcinin alıcı değiştirmesi reddedilir", async () => {
 assert.equal((await mutate(deniz,denizCsrf,"post","/support/requests",{message:"Yeterince uzun mesaj"})).status,403);
 assert.equal((await mutate(ada,adaCsrf,"post","/support/requests",{message:"kısa"})).status,400);
 assert.equal((await mutate(ada,adaCsrf,"post","/support/requests",{message:"Yeterince uzun mesaj",to:"evil@example.com"})).status,400);
});
test("Destek: dosyasız mesaj ve taranmış ek SMTP test sunucusuna gönderilir", async () => {
 await resetSupportLimit();
 const before=messages.length;
 assert.equal((await mutate(ada,adaCsrf,"post","/support/requests",{message:"İzleme listemde bir sorun var."})).status,200);
 assert.equal(messages.length,before+2);assert.ok(messages[before].includes("support@example.com"));
 const png=await sharp({create:{width:20,height:20,channels:3,background:"red"}}).png().toBuffer();
 const r=await ada.post("/support/requests").set("X-CSRF-Token",adaCsrf).field("message","Sorunun ekran görüntüsü ektedir.").attach("attachment",png,{filename:"test.png",contentType:"image/png"});assert.equal(r.status,200,JSON.stringify(r.body));
 assert.ok(messages.at(-2).includes("Content-Disposition: attachment"));assert.ok(!messages.at(-1).includes("Content-Disposition: attachment"));
});
test("Destek: zararlı ek, yanlış dosya türü, SMTP hatası ve rate limit", async () => {
 await resetSupportLimit();
 const png=await sharp({create:{width:20,height:20,channels:3,background:"red"}}).png().toBuffer();
 scannerMode="infected";
 let r=await ada.post("/support/requests").set("X-CSRF-Token",adaCsrf).field("message","Tarama denemesi uzun açıklama.").attach("attachment",png,{filename:"test.png",contentType:"image/png"});assert.equal(r.status,422);scannerMode="clean";
 r=await ada.post("/support/requests").set("X-CSRF-Token",adaCsrf).field("message","Tür denemesi uzun açıklama.").attach("attachment",Buffer.from("fake"),{filename:"fake.png",contentType:"image/png"});assert.equal(r.status,415);
 smtpFail=true;r=await mutate(ada,adaCsrf,"post","/support/requests",{message:"SMTP hatası denemesi açıklama."});assert.equal(r.status,500);smtpFail=false;
 r=await mutate(ada,adaCsrf,"post","/support/requests",{message:"Limit denemesi açıklama."});assert.equal(r.status,429);
});
test("Dosya tarama hizmeti kapalıysa ek gönderimi durur", async () => {
 await resetSupportLimit();
 const oldPort=process.env.CLAMAV_PORT;process.env.CLAMAV_PORT="0";
 const png=await sharp({create:{width:20,height:20,channels:3,background:"red"}}).png().toBuffer();
 const r=await ada.post("/support/requests").set("X-CSRF-Token",adaCsrf).field("message","Tarama hizmeti kapalı senaryosu.").attach("attachment",png,{filename:"test.png",contentType:"image/png"});
 process.env.CLAMAV_PORT=oldPort;assert.equal(r.status,503);
});
test("E-posta değişikliği parola ister, yeni adresi doğrular ve eski yetkileri iptal eder", async () => {
 const agent=request.agent(app);const csrf=(await agent.get("/auth/csrf")).body.csrfToken;
 const email="emailchange@example.com";
 await mutate(agent,csrf,"post","/auth/register",{name:"Email Test",email,password});
 await mutate(agent,csrf,"post","/auth/jwt/login",{email,password});
 assert.equal((await mutate(agent,csrf,"post","/users/me/email-change",{newEmail:"changed@example.com",password:"wrong"})).status,401);
 const changeUser=await User.findOne({email});
 const oldReset=await issuePasswordResetToken(changeUser._id);
 const before=messages.length;
 assert.equal((await mutate(agent,csrf,"post","/users/me/email-change",{newEmail:"changed@example.com",password})).status,202);
 // Nodemailer metni base64 veya quoted-printable kodlayabilir; ham tokenı test göndericisinin MIME metninden ayrıştırırız.
 const message=messages[before];const body=message.split("\n\n").slice(1).join("\n");
 const decoded=/Content-Transfer-Encoding: base64/i.test(message) ? Buffer.from(body.replace(/\s/g,""),"base64").toString() : body.replace(/=\n/g,"").replace(/=([0-9A-F]{2})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
 const token=decoded.match(/[A-Za-z0-9_-]{43}/)?.[0];assert.ok(token,"E-posta değişiklik kodu bulunmalı");
 assert.equal((await mutate(agent,csrf,"post","/users/me/email-change/confirm",{token})).status,200);
 assert.equal((await agent.get("/users/me")).status,401);
 assert.equal((await User.findOne({email:"changed@example.com"})).isEmailVerified,true);
 assert.equal(await AccountToken.countDocuments({userId:changeUser._id,usedAt:null}),0);
});
test("Süresi dolan e-posta ve reset belirteçleri reddedilir", async () => {
 const user=await User.findOne({email:"ada@example.com"});
 const token=await issuePasswordResetToken(user._id);
 await AccountToken.updateMany({userId:user._id,type:"password_reset"},{ $set:{expiresAt:new Date(Date.now()-1000)} });
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/reset-password",{token,password})).status,400);
});
test("Refresh rotation ve eski tokenın yeniden kullanımında bütün aile iptali", async () => {
 const login=await mutate(ada,adaCsrf,"post","/auth/jwt/login",{email:"ada@example.com",password});
 const old=login.headers["set-cookie"].find(c=>c.startsWith("refreshToken=")).split(";")[0];
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/refresh",{})).status,200);
 const cookies=(await ada.get("/auth/csrf")).headers["set-cookie"].map(c=>c.split(";")[0]);
 const csrf=(await ada.get("/auth/csrf")).body.csrfToken;
 const replay=await request(app).post("/auth/refresh").set("Cookie",[...cookies,old]).set("X-CSRF-Token",csrf).send({});
 assert.equal(replay.status,401,JSON.stringify(replay.body));assert.equal((await mutate(ada,adaCsrf,"post","/auth/refresh",{})).status,401);
});
test("Parola yenileme genel yanıt, tek kullanımlı reset ve eski JWT reddi", async () => {
 await mutate(ada,adaCsrf,"post","/auth/jwt/login",{email:"ada@example.com",password});
 const yes=await mutate(ada,adaCsrf,"post","/auth/forgot-password",{email:"ada@example.com"});
 const no=await mutate(ada,adaCsrf,"post","/auth/forgot-password",{email:"nobody@example.com"});
 assert.equal(yes.status,202);assert.deepEqual(yes.body,no.body);
 const user=await User.findOne({email:"ada@example.com"});const raw=await issuePasswordResetToken(user._id);
 const payload={token:raw,password:password+"new"};assert.equal((await mutate(ada,adaCsrf,"post","/auth/reset-password",payload)).status,200);
 assert.equal((await mutate(ada,adaCsrf,"post","/auth/reset-password",payload)).status,400);assert.equal((await ada.get("/users/me")).status,401);
});
test("Session giriş yolu çalışır; hesap kapatma session/JWT/refresh haklarını iptal eder", async () => {
 const agent=request.agent(app);const csrf=(await agent.get("/auth/csrf")).body.csrfToken;
 assert.equal((await mutate(agent,csrf,"post","/auth/login",{email:"ada@example.com",password:password+"new"})).status,200);
 assert.equal((await agent.get("/users/me")).status,200);
 assert.equal((await mutate(agent,csrf,"delete","/users/me",{})).status,204);assert.equal((await agent.get("/users/me")).status,401);
 assert.equal((await mutate(agent,csrf,"post","/auth/jwt/login",{email:"ada@example.com",password:password+"new"})).status,401);
 assert.equal(await Movie.countDocuments(),1);assert.equal(await WatchlistItem.countDocuments(),1);
});
test("Logout refresh kaydını iptal eder ve çerezleri temizler", async () => {
 assert.equal((await mutate(deniz,denizCsrf,"post","/auth/logout",{})).status,204);
 assert.equal((await deniz.get("/users/me")).status,401);
 assert.equal((await mutate(deniz,denizCsrf,"post","/auth/refresh",{})).status,401);
});
test("Audit gerçek kayıt içerir; ham parola ve token saklamaz", async () => {
 const events=await AuditEvent.find().lean();assert.ok(events.length>0);
 assert.ok(!JSON.stringify(events).includes(password));assert.ok(!JSON.stringify(events).includes("passwordHash"));
});

async function resetSupportLimit() {
 const { supportRateLimit } = await import("../src/middlewares/supportRateLimit.js");
 await supportRateLimit.resetKey((await User.findOne({email:"ada@example.com"}))._id.toString());
}
