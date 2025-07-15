const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/AuthRoutes");
const projectRoutes = require("./routes/ProjectRoutes");
const profileRoutes = require("./routes/ProfileRoutes");

const errorHandler = require("./middleware/errorHandler");

require("./config/passport");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://projectify-punnapareddy-bhaskar-raos-projects.vercel.app",
  "https://projectify-git-main-punnapareddy-bhaskar-raos-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: "Too many authentication attempts, please try again later.",
});

// Apply general rate limiting to all requests
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Session configuration for Passport (required for OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret", // Strong secret for session encryption
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent client-side JavaScript from accessing cookie
      maxAge: 24 * 60 * 60 * 1000, // 24 hours (session expiry)
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // 'None' for cross-site, 'Lax' for same-site
    },
  })
);

// Passport middleware
app.use(passport.initialize()); 
app.use(passport.session()); 

// Apply auth rate limiting to specific routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes); // Example protected route
app.use("/api/profile", profileRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler for any unhandled routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist on this server.`,
  });
});

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1)
  }
};

// Start server function
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      // console.log(
      //   `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
      // );
      // console.log(
      //   `Server URL: ${process.env.SERVER_URL || "http://localhost:5000"}`
      // ); 
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});


