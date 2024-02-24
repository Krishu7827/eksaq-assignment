const AWS = require('aws-sdk')

require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const { AudioModel } = require('./Audio.Schema');

require('dotenv').config()



const saveAudio = async (req, res) => {

    try {
        /** Set Credentials for S3 Service */
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
        })
        /** Get audio file from Multer **/
        const audioFile = req.file
        const audioFileName = `${Date.now()}_${audioFile.originalname}`

        /** Upload audio file directly to S3 **/
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: audioFileName,
            Body: audioFile.buffer,
            ContentType: audioFile.mimetype /** Use audio file mimetype **/
        };

        const data = await s3.upload(params).promise();
        console.log('File uploaded successfully:', data.Location)

        /** Save audio data to MongoDB **/
        const audio = new AudioModel({
            title: req.query.title,
            audioUrl: data.Location,
            audioFileName: audioFileName
        });
        await audio.save();

        /** Send response **/
        res.json({ message: 'Audio saved successfully' });
    } catch (error) {
        console.error('Error saving audio:', error);
        res.status(500).json({ message: error })
    }
};

const getAllAudios = async (req, res) => {
    try {
        const audios = await AudioModel.find().sort({ createdAt: -1 });
        res.json(audios)
    } catch (error) {
        console.error('Error fetching audios:', error);
        res.status(500).json({ message: 'Internal server error' })
    }
};


/** Create an instance of AWS Transcribe service **/
const transcribeService = new AWS.TranscribeService();

/** Function to transcribe audio from S3 bucket URL **/
const transcribeAudio = async (req, res) => {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
        region: 'ap-south-1' // specify the region where your S3 bucket is located
    });

    try {
        const { audioUrl } = req.body;
        console.log(audioUrl);

        // Start transcription job
        const transcribeService = new AWS.TranscribeService();
        const transcriptionParams = {
            TranscriptionJobName: 'YourTrnsciptionme', // provide a unique name for the transcription job
            LanguageCode: 'en-US', // specify the language of the audio
            Media: {
                MediaFileUri: audioUrl // specify the S3 URL of the audio file
            },
          
        };

        const transcriptionData = await transcribeService.startTranscriptionJob(transcriptionParams).promise();
        console.log('Transcription job started:', transcriptionData.TranscriptionJob.TranscriptionJobName);

        // Function to check transcription job status
        const checkJobStatus = async () => {
            const jobName = transcriptionData.TranscriptionJob.TranscriptionJobName;
            const jobData = await transcribeService.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
            console.log(jobData)
            return jobData.TranscriptionJob.TranscriptionJobStatus;
        };

        // Wait for transcription job to complete
        let jobStatus = await checkJobStatus();
        while (jobStatus !== 'COMPLETED') {
            console.log('Transcription job status:', jobStatus);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
            jobStatus = await checkJobStatus();
        }

        // Once job is completed, get the transcript
        console.log(jobStatus)
        const transcriptUrl = transcriptionData.TranscriptionJob.Transcript.TranscriptFileUri;

        const transcriptData = await fetch(transcriptUrl);
        const transcript = await transcriptData.json();

        // Send transcript to client
        res.json({ transcript });
    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { saveAudio, getAllAudios,transcribeAudio }
