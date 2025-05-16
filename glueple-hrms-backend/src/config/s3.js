// const Aws = require("aws-sdk");
// const clientModel = require("../modules/view/model/clients.model");
// const multer = require("multer");
// const AWS = require("aws-sdk");
// const path = require("path");
// const fs = require("fs");


// const addImageInS3 = async()=>{
//     const getS3Data = await clientModel.find({org_code:"QD100"});
//     let s3bucket = new Aws.S3({
//         accessKeyId: getS3Data.accessKeyId,
//         secretAccessKey: getS3Data.secretAccessKey,
//         Bucket: 'glueple'
//     });
// }






// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Allowed File Types
const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];

// Multer config - memory storage for S3 upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!allowedFileTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  },
});

// Main Upload Handler Middleware
const uploadHandler = (fieldName, s3Folder = "uploads") => [
  upload.single(fieldName),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const fileName = `${Date.now()}_${file.originalname}`;

      // S3 upload parameters
      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${s3Folder}/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      // Try to upload to S3
      try {
        const s3Res = await s3.upload(s3Params).promise();
        req.uploadedFile = {
          storage: "s3",
          location: s3Res.Location,
          key: s3Res.Key,
        };
      } catch (s3Err) {
        // Fallback to local upload
        console.warn("S3 upload failed:", s3Err.message);

        const localFolderPath = path.join(__dirname, "..", "backup", s3Folder);
        createFolder(localFolderPath);

        const localFilePath = path.join(localFolderPath, fileName);
        fs.writeFileSync(localFilePath, file.buffer);

        req.uploadedFile = {
          storage: "local",
          location: localFilePath,
          key: fileName,
        };
      }

      next();
    } catch (err) {
      console.error("Upload error:", err.message);
      res.status(500).json({ error: "Upload failed" });
    }
  },
];



module.exports={
    uploadHandler
}