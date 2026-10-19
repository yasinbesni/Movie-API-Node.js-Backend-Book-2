import mongoose from "mongoose";

const directorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        "Yönetmen adı zorunludur.",
      ],
    },
    birthYear: {
      type: Number,
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: {
      virtuals: true,
    },
  },
);

directorSchema.virtual("age").get(function () {
  if (
    this.birthYear === undefined ||
    this.birthYear === null
  ) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return currentYear - this.birthYear;
});

export const Director =
  mongoose.models.Director ||
  mongoose.model("Director", directorSchema);
