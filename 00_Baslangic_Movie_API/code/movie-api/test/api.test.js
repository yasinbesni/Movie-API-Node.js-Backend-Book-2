import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
let repl, app, id;
before(async () => {
 repl = await MongoMemoryReplSet.create({ replSet:{count:1,args:process.platform === "win32" ? [] : ["--nounixsocket"]},binary:{version:"7.0.14"} });
 Object.assign(process.env,{NODE_ENV:"test",MONGODB_URL:repl.getUri(),CORS_ORIGIN:"http://localhost:5173",LOG_LEVEL:"silent"});
 await mongoose.connect(repl.getUri());
 ({app}=await import("../src/server.js"));
 await Promise.all(Object.values(mongoose.models).map(model=>model.init()));
});
after(async () => {await mongoose.disconnect();if(repl)await repl.stop();});
test("Sağlık, CORS ve dokümantasyon",async()=>{
 assert.equal((await request(app).get("/health")).status,200);
 assert.equal((await request(app).get("/docs/")).status,200);
 const r=await request(app).get("/movies").set("Origin","http://localhost:5173");
 assert.equal(r.status,200);assert.equal(r.headers["access-control-allow-origin"],"http://localhost:5173");
});
test("Geçersiz film ve kimlik reddedilir",async()=>{
 assert.equal((await request(app).post("/movies").send({title:""})).status,400);
 assert.equal((await request(app).get("/movies/bad-id")).status,400);
});
test("Film oluşturma ve tekil indeks",async()=>{
 const body={title:"Interstellar",releaseYear:2014,voteAverage:8};
 const r=await request(app).post("/movies").send(body);assert.equal(r.status,201);id=r.body.data._id;
 assert.equal((await request(app).post("/movies").send(body)).status,409);
});
test("Film listeleme, güncelleme ve filtre doğrulaması",async()=>{
 assert.equal((await request(app).get("/movies")).body.data.length,1);
 assert.equal((await request(app).patch(`/movies/${id}`).send({voteAverage:9})).status,200);
 assert.equal((await request(app).get(`/movies/${id}`)).body.data.voteAverage,9);
 assert.equal((await request(app).patch(`/movies/${id}`).send({voteAverage:99})).status,400);
});
test("Silme ve bulunamayan kayıt",async()=>{
 assert.equal((await request(app).delete(`/movies/${id}`)).status,200);
 assert.equal((await request(app).get(`/movies/${id}`)).status,404);
});
