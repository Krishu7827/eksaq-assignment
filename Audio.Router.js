
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { saveAudio, getAllAudios,transcribeAudio } = require('./controller');

/**Multer configuration for file upload**/
const upload = multer();

/** Route to save audio **/
router.post('/audio', upload.single('audioFile'), saveAudio);

/** Route to get all audios */
router.get('/audios', getAllAudios);

/** Route to get transcript of audio */
router.post('/transcribe', transcribeAudio);
module.exports = {router};
                               