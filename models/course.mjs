import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  thumbnail: { type: String, required: false },
});

const chapterSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, index: true }, // Ensures unique chapter numbers
  title: { type: String, required: true },
  videos: [videoSchema], // Array of videos inside each chapter
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    chapters: [chapterSchema], // Array of chapters
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
