import express from "express";
import Course from "../models/course.mjs";
import { authenticateToken } from "../middleware/auth.mjs";

const router = express.Router();

/**
 * Get all courses (User must be paid)
 */
router.get("/",  async (req, res) => {
  try {
    // if (req.user.role !== "user" || !req.user.isPaid) {
    //   return res
    //     .status(403)
    //     .json({ message: "Access Denied.Payment required." });
    // }

    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Add a new course (Admin Only)
 */
router.post("/", async (req, res) => {
  // if (req.user.role !== "admin")
  //   return res.status(403).json({ message: "Access Denied" });

  try {
    const { title, description, chapters } = req.body;
    const newCourse = new Course({ title, description, chapters });
    await newCourse.save();
    res.status(201).json({ message: "Course added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


/**
 * Get all courses with their chapters (Admin Only)
 */
router.get("/getcourses",  async (req, res) => {
  try {
    // Fetch all courses and populate chapters
    const courses = await Course.find().select('title description chapters');
    
    // If no courses are found
    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    // Return the courses
    res.status(200).json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

/**
 * Add a chapter to a course (Admin Only)
 */
router.post("/:courseId/chapter", async (req, res) => {
  // if (req.user.role !== "admin")
  //   return res.status(403).json({ message: "Access Denied" });

  try {
    const { number, title } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.chapters.push({ number, title, videos: [] });
    await course.save();

    res.status(201).json({ message: "Chapter added successfully" });
  } catch (err) {
    console.error("Error adding chapter:", err); 
    res.status(500).json({ message: "Internal server error" });
  }
});


router.put("/:courseId/chapter/:chapterNumber/title",
  async (req, res) => {
    const { title } = req.body; // assuming the title is sent in the request body

    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access Denied" });

    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const chapter = course.chapters.find(
        (ch) => ch.number === parseInt(req.params.chapterNumber)
      );
      if (!chapter)
        return res.status(404).json({ message: "Chapter not found" });

      chapter.title = title; // updating the chapter title
      await course.save();

      res.json({ message: "Chapter title updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Remove a chapter from a course (Admin Only)
 */
router.delete(
  "/:courseId/chapter/:chapterNumber",
  
  async (req, res) => {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access Denied" });

    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      course.chapters = course.chapters.filter(
        (ch) => ch.number !== parseInt(req.params.chapterNumber)
      );
      await course.save();

      res.json({ message: "Chapter removed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Add a video to a chapter (Admin Only)
 */
router.post(
  "/:courseId/chapter/:chapterNumber/video",
  
  async (req, res) => {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access Denied" });

    try {
      const { url, title, description, thumbnail } = req.body;
      console.log('Received payload:', req.body);
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const chapter = course.chapters.find(
        (ch) => ch.number === parseInt(req.params.chapterNumber)
      );
      if (!chapter)
        return res.status(404).json({ message: "Chapter not found" });

      chapter.videos.push({ url, title, description, thumbnail });
      await course.save();

      res.status(201).json({ message: "Video added successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


/**
 * Edit the title of a video in a chapter (Admin Only)
 */
router.put(
  "/:courseId/chapter/:chapterNumber/video/:videoId",
  async (req, res) => {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access Denied" });

    const { title } = req.body;  // Expecting the new title in the body

    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const chapter = course.chapters.find(
        (ch) => ch.number === parseInt(req.params.chapterNumber)
      );
      if (!chapter) return res.status(404).json({ message: "Chapter not found" });

      const video = chapter.videos.find(
        (v) => v._id.toString() === req.params.videoId
      );
      if (!video) return res.status(404).json({ message: "Video not found" });

      // Update the title of the video
      video.title = title;

      await course.save();

      res.json({ message: "Video title updated successfully", video });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Remove a video from a chapter (Admin Only)
 */
router.delete(
  "/:courseId/chapter/:chapterNumber/video/:videoId",
  
  async (req, res) => {
    // if (req.user.role !== "admin")
    //   return res.status(403).json({ message: "Access Denied" });

    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const chapter = course.chapters.find(
        (ch) => ch.number === parseInt(req.params.chapterNumber)
      );
      if (!chapter)
        return res.status(404).json({ message: "Chapter not found" });

      chapter.videos = chapter.videos.filter(
        (video) => video._id.toString() !== req.params.videoId
      );
      await course.save();

      res.json({ message: "Video removed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Get chapter from video
 */

router.get("/:courseId/chapters", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({ chapters: course.chapters });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


/**
 * Get all videos from a chapter
 */
router.get("/:courseId/chapter/:chapterNumber/videos", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; 

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const chapter = course.chapters.find(
      (ch) => ch.number === parseInt(req.params.chapterNumber)
    );
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedVideos = chapter.videos.slice(startIndex, endIndex);

    res.json({
      totalVideos: chapter.videos.length,
      totalPages: Math.ceil(chapter.videos.length / limit),
      currentPage: parseInt(page),
      videos: paginatedVideos,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


/**
 * Get course details (title, description, total chapters)
 */
router.get("/:courseId/details", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select(
      "title description chapters"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({
      title: course.title,
      description: course.description,
      totalChapters: course.chapters.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/videos/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    // Find the course that contains the video
    const course = await Course.findOne({ "chapters.videos._id": videoId });

    if (!course) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Find the video in the course
    let foundVideo = null;
    course.chapters.forEach((chapter) => {
      chapter.videos.forEach((video) => {
        if (video._id.toString() === videoId) {
          foundVideo = video;
        }
      });
    });

    if (!foundVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(foundVideo);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export default router;


