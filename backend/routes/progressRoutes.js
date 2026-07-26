const express = require('express');
   const router = express.Router();
   const verifyToken = require('../middleware/authMiddleware');
   const { 
     logWeight, 
     getProgressHistory, 
     getBMI,
     uploadProgressPhoto,
     getProgressPhotos
   } = require('../controllers/progressController');

   router.post('/log-weight', verifyToken, logWeight);
   router.get('/history', verifyToken, getProgressHistory);
   router.get('/bmi', verifyToken, getBMI);
   router.post('/upload-photo', verifyToken, uploadProgressPhoto);
   router.get('/photos', verifyToken, getProgressPhotos);

   module.exports = router;