require("dotenv").config();
const express = require("express");
const app = express();
const prisma = require("./prisma");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const PORT = 3000;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT = process.env.JWT || "shhh";

const allowedOrigins = [
  "http://localhost:5173",
  "https://yarnia.netlify.app",
]


app.use(express.json());
app.use(require("morgan")("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error("Not allowed by CORS"))
    },

  })
);
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    JWT,
    { expiresIn: "6h" }
  );
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.params.id}${ext}`);
  },
});
const upload = multer({ storage, fileFilter });

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if the user is an admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// API routes go here

// `fetchAllStories`
app.get("/api/stories", async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      include: {
        author: {
          select: { username: true },
        },
        _count: {
          select: {
            bookmarks: true,
            comments: true,
          },
        },
      },
    });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories." });
  }
});

app.get("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params;

  try {
    const story = await prisma.story.findUnique({
      where: { storyId: parseInt(storyId) },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    res.json(story);
  } catch (err) {
    console.error("Error fetching story:", err);
    next(err);
  }
});

app.delete("/api/stories/:storyId", authenticateUser, async (req, res) => {
  const { storyId } = req.params;

  try {
    const deletedStory = await prisma.story.delete({
      where: { storyId: parseInt(storyId) },
    });

    res
      .status(200)
      .json({ message: "Story deleted successfully", deletedStory });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Story not found." });
    }
    console.error("Error deleting story:", error);
    res.status(500).json({ message: "Server error." });
  }
});

app.post("/api/stories", authenticateUser, async (req, res) => {
  const { title, summary, content, genre } = req.body;

  if (!title || !content || !genre) {
    return res
      .status(400)
      .json({ error: "Title, content, and genre are required." });
  }

  try {
    const newStory = await prisma.story.create({
      data: {
        title,
        summary,
        content,
        genre,
        authorId: req.user.id,
        createdAt: new Date(),
      },
    });
    res.status(201).json(newStory);
  } catch (error) {
    console.error("Failed to create story:", error);
    res.status(500).json({ error: "Failed to create story" });
  }
});

// PUT (update) a story by ID
app.put("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params;
  const { title, summary, content } = req.body;

  try {
    if (!title && !content) {
      return res
        .status(400)
        .json({ message: "At least title or content is required." });
    }

    const updatedStory = await prisma.story.update({
      where: { storyId: parseInt(storyId) },
      data: {
        title,
        summary,
        content,
      },
    });

    res.json({ message: "Story updated successfully.", updatedStory });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Story not found." });
    }
    next(err);
  }
});

// GET all comments on individual story
app.get("/api/stories/:storyId/comments", async (req, res, next) => {
  const { storyId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        storyId: parseInt(storyId),
      },
      include: {
        user: {
          select: { username: true },
        },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
});

// POST new comment on individual story
app.post(
  "/api/stories/:storyId/comments",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    try {
      // Create the comment in the database
      const newComment = await prisma.comment.create({
        data: {
          userId: req.user.id,
          storyId: parseInt(storyId),
          content,
        },
      });

      res
        .status(201)
        .json({ message: "Comment added successfully.", newComment });
    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(500).json({ message: "Failed to post comment." });
    }
  }
);

app.delete("/api/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const commentIdInt = parseInt(commentId, 10);
    if (isNaN(commentIdInt)) {
      return res.status(400).json({ error: "Invalid comment ID format" });
    }

    const deletedComment = await prisma.comment.delete({
      where: { commentId: commentIdInt },
    });

    res.status(200).json(deletedComment);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Comment not found" });
    } else {
      console.error("Error deleting comment:", error);
      res
        .status(500)
        .json({ error: "Error deleting comment", details: error.message });
    }
  }
});

// GET all comments by specific user
app.get("/api/users/:userId/comments", async (req, res, next) => {
  const { userId } = req.params;
  try {
    // Fetch comments where the authorId matches the specified user
    const comments = await prisma.comment.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: { story: true },
    });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

app.put("/api/users/me", authenticateUser, async (req, res, next) => {
  const { username, bio } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, bio },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// GET all comments in the database with user information
app.get("/api/comments", authenticateAdmin, async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

// Route to get all bookmarks for a specific user
// Route to get all bookmarks for a specific user
app.get("/api/users/:userId/bookmarks", async (req, res, next) => {
  const { userId } = req.params;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: parseInt(userId) },
      include: {
        story: {
          include: {
            author: { select: { username: true } },
          },
        },
      },
    });

    // Return bookmarks with author information included
    res.json(bookmarks);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({ message: "Failed to fetch bookmarks." });
  }
});

//Route to delete a bookmark from a story
app.delete("/api/users/:userId/bookmarks/:storyId", async (req, res, next) => {
  const { userId, storyId } = req.params;

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_storyId: {
          userId: parseInt(userId),
          storyId: parseInt(storyId),
        },
      },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found." });
    }

    await prisma.bookmark.delete({
      where: {
        userId_storyId: {
          userId: parseInt(userId),
          storyId: parseInt(storyId),
        },
      },
    });

    res.status(200).json({ message: "Bookmark deleted successfully." });
  } catch (err) {
    next(err);
  }
});

app.get("/api/users/:userId/stories/:storyId/bookmark", async (req, res) => {
  const { userId, storyId } = req.params;

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_storyId: {
          userId: parseInt(userId),
          storyId: parseInt(storyId),
        },
      },
    });

    if (!bookmark) {
      return res.status(404).json({ bookmarked: false });
    }

    res.status(200).json({ bookmarked: true });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Route to get all bookmarks for a specific story
app.get("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { storyId } = req.params; // Extract storyId from request params

  try {
    const story = await prisma.story.findUnique({
      where: { storyId: parseInt(storyId) },
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    // Find all bookmarks for the story
    const bookmarks = await prisma.bookmark.findMany({
      where: { storyId: parseInt(storyId) },
      include: {
        user: true,
      },
    });

    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
});

app.post("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { userId, storyId, createdAt } = req.body;

  try {
    if (!userId || !storyId) {
      return res.status(400).json({
        message: "userId and storyId are required",
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: parseInt(userId),
        storyId: parseInt(storyId),
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    res
      .status(201)
      .json({ message: "Bookmark created successfully", bookmark });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Bookmark already exists." });
    }

    next(err);
  }
});

app.get("/api/user/:authorId/bookmarks", async (req, res, next) => {
  const { bookmarkId } = req.params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { bookmarkId: parseInt(bookmarkId) },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Story not found." });
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// === Auth Routes ===

// POST (create) a new user
app.post("/api/auth/register", async (req, res, next) => {
  const { username, email, password, bio, isAdmin = false } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
        isAdmin, // Save the isAdmin field
      },
    });

    // Generate a token for the new user
    const token = generateToken(newUser);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    next(err);
  }
});

// Route to get all users (only accessible to admin users)
app.get("/api/users", authenticateAdmin, async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        isAdmin: true,
        joinedOn: true,
      },
    });

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

app.get("/api/users/:authorId", async (req, res, next) => {
  const { authorId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authorId, 10) },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    next(err);
  }
});

app.delete("/api/users/:authorId", authenticateUser, async (req, res, next) => {
  const { authorId } = req.params;

  try {
    const user = await prisma.user.delete({
      where: { id: parseInt(authorId, 10) },
    });

    if (user) {
      // User deleted successfully
      res.status(204).send();
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/auth/login - Login a user
app.post("/api/auth/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - Get the authenticated user
app.get("/api/auth/me", authenticateUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Get new bookmarks in database

app.get("/api/user/bookmarks", async (req, res, next) => {
  const { bookmarkId } = req.params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { bookmarkId: parseInt(bookmarkId) },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "bookmark not found." });
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// POST /api/stories/:storyId/bookmarks

app.post("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { userId, storyId } = req.body;
  try {
    if (!userId || !storyId) {
      return res.status(400).json({
        message: "userId and storyId are required",
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: parseInt(userId),
        storyId: parseInt(storyId),
        createdAt: new Date(createdAt),
      },
    });

    res
      .status(201)
      .json({ message: "Bookmark created successfully", bookmark });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Bookmark already exists." });
    }

    next(err);
  }
});

// DELETE /api/stories/:storyId/bookmarks

app.delete(
  "/api/stories/:storyId/bookmarks/:bookmarkId",
  async (req, res, next) => {
    const { storyId, bookmarkId } = req.params;

    try {
      const deletedBookmark = await prisma.bookmark.delete({
        where: { bookmarkId: parseInt(bookmarkId) },
      });
      res.status(200).json({ message: "Bookmark deleted successfully." });
    } catch (err) {
      console.error("Error deleting bookmark:", err);
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Bookmark not found." });
      }
      next(err);
    }
  }
);

// GET /api/user/:authorId/bookmarks

app.get("/api/user/:authorId/bookmarks", async (req, res, next) => {
  const { bookmarkId } = req.params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { bookmarkId: parseInt(bookmarkId) },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Story not found." });
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// GET (`${API_URL}/users/${userId}/bookmarks`, {

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/api/users/:userId/stories", async (req, res) => {
  const { userId } = req.params;

  try {
    const stories = await prisma.story.findMany({
      where: { authorId: parseInt(userId, 10) },
    });

    if (!stories.length) {
      return res
        .status(404)
        .json({ message: "No stories found for this user." });
    }

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories." });
  }
});

app.get("/api/users/:userId/comments", async (req, res) => {
  const { userId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { userId: Number(userId) },
      include: { story: true },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user comments" });
  }
});

app.post("/api/upload/profile_pic", (req, res) => {
  const file = req.files.file;
  const filePath = `uploads/${file.name}`;
  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    // Assume the server serves files from the "uploads" directory
    res.json({ img_url: `http://localhost:3000/${filePath}` });
  });
});

// GET all comments on individual story
app.get("/api/stories/:storyId/comments", async (req, res, next) => {
  const { storyId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        storyId: parseInt(storyId),
      },
      include: {
        user: {
          select: { username: true },
        },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
});

app.put("/api/users/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
    });

    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    console.error("Avatar upload error:", error); // ← Watch for this
    res.status(500).json({ error: "Failed to upload avatar", details: error.message });
  }
});

