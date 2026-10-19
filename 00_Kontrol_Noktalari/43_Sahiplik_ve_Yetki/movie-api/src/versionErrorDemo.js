import { env } from "./config/env.js";
import mongoose from "mongoose";

const demoSchema = new mongoose.Schema(
  {
    genres: [String],
  },
  {
    collection: "version_error_demos",
  },
);

const VersionDemo =
  mongoose.models.VersionDemo ||
  mongoose.model("VersionDemo", demoSchema);

const run = async () => {
  let demoId;

  try {
    await mongoose.connect(env.mongodbUrl);

    const created = await VersionDemo.create({
      genres: [
        "Science Fiction",
        "Drama",
        "Adventure",
      ],
    });

    demoId = created._id;

    const movieA = await VersionDemo.findById(demoId);
    const movieB = await VersionDemo.findById(demoId);

    console.log("Başlangıç:", {
      a: movieA.__v,
      b: movieB.__v,
    });

    movieA.genres.splice(0, 1);
    await movieA.save();

    console.log("A kaydedildi:", {
      genres: movieA.genres,
      version: movieA.__v,
    });

    movieB.set("genres.1", "Thriller");

    try {
      await movieB.save();
    } catch (error) {
      console.log("Hata türü:", error.name);
      console.log("Hata mesajı:", error.message);
    }

    const current = await VersionDemo.findById(demoId);

    console.log("MongoDB'deki güncel kayıt:", {
      genres: current.genres,
      version: current.__v,
    });
  } finally {
    if (demoId) {
      await VersionDemo.deleteOne({ _id: demoId });
    }

    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});