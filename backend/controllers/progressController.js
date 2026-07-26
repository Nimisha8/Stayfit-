const db = require('../config/db');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// ====================== CLOUDINARY SETUP ======================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for photo upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed!'), false);
  }
}).single('photo');

// ====================== BMI HELPERS ======================
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  return parseFloat(bmi);
};

const getBMICategory = (bmi) => {
  if (!bmi) return { category: 'N/A', color: 'gray' };
  if (bmi < 18.5) return { category: 'Underweight', color: 'blue' };
  if (bmi < 25) return { category: 'Normal', color: 'green' };
  if (bmi < 30) return { category: 'Overweight', color: 'orange' };
  return { category: 'Obese', color: 'red' };
};

// ====================== EXISTING FUNCTIONS (KEPT AS-IS) ======================
async function logWeight(req, res) {
  const userId = req.user.userId;
  const { weight, notes } = req.body;

  if (!weight || weight <= 0) {
    return res.status(400).json({ message: 'Please enter a valid weight' });
  }

  try {
    const [[{ today }]] = await db.execute("SELECT CURDATE() as today");

    await db.execute(
      `INSERT INTO progress_logs (user_id, log_date, weight, notes) 
       VALUES (?, ?, ?, ?)`,
      [userId, today, weight, notes || '']
    );

    res.status(201).json({ 
      message: 'Weight logged successfully!',
      date: today 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getProgressHistory(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM progress_logs WHERE user_id = ? ORDER BY log_date DESC',
      [userId]
    );
    res.json({ history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching history' });
  }
}

// ====================== NEW FUNCTIONS ======================

// Upload Progress Photo
async function uploadProgressPhoto(req, res) {
  const userId = req.user.userId;

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No photo uploaded" });

    const { caption } = req.body;

    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'stayfit/progress' },
          (error, cloudinaryResult) => {
            if (error) reject(error);
            else resolve(cloudinaryResult);
          }
        ).end(req.file.buffer);
      });

      const image_url = result.secure_url;

      await db.execute(
        'INSERT INTO progress_photos (user_id, image_url, caption) VALUES (?, ?, ?)',
        [userId, image_url, caption || '']
      );

      res.status(201).json({
        message: "Progress photo uploaded successfully!",
        image_url
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });
}

// Get Progress Photos
async function getProgressPhotos(req, res) {
  const userId = req.user.userId;

  try {
    const [rows] = await db.execute(
      'SELECT id, image_url, caption, logged_at FROM progress_photos WHERE user_id = ? ORDER BY logged_at DESC LIMIT 12',
      [userId]
    );
    res.json({ photos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
// Get the user's current BMI, based on their height + most recent weight log
async function getBMI(req, res) {
  const userId = req.user.userId;

  try {
    const [userRows] = await db.execute(
      'SELECT height_cm FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0 || !userRows[0].height_cm) {
      return res.status(200).json({ hasHeight: false, message: 'Add your height in Profile to see your BMI' });
    }

    const [weightRows] = await db.execute(
      'SELECT weight, log_date FROM progress_logs WHERE user_id = ? ORDER BY log_date DESC, id DESC LIMIT 1',
      [userId]
    );

    if (weightRows.length === 0) {
      return res.status(200).json({ hasHeight: true, hasWeight: false, message: 'Log a weight entry to see your BMI' });
    }

    const heightCm = userRows[0].height_cm;
    const latestWeight = parseFloat(weightRows[0].weight);
    const bmi = calculateBMI(latestWeight, heightCm);
    const { category, color } = getBMICategory(bmi);

    res.status(200).json({
      hasHeight: true,
      hasWeight: true,
      bmi,
      category,
      color,
      weight: latestWeight,
      height_cm: heightCm,
      as_of: weightRows[0].log_date
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error calculating BMI' });
  }
}

// Export all functions
module.exports = { 
  logWeight, 
  getProgressHistory,
  uploadProgressPhoto,
  getProgressPhotos,
  calculateBMI,
  getBMICategory,
  getBMI
};