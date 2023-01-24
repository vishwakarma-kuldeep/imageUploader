const AWS = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;
const fs = require("fs");
const path = require("path");
require("dotenv").config();
// Replace this with your AWS configuration
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;
const S3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  // ${uuid()}-
  const data = await Promise.all(
    params.map((param) => s3.upload(param).promise())
  );
  console.log(data);
  return data;
};

exports.s3Uploadv3 = async (files) => {
  const s3client = new S3Client();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(
    params.map((param) => s3client.send(new PutObjectCommand(param)))
  );
};

// Uploading single file
exports.s3UploadSingle = async (file) => {
  try {
    console.log(first);
    const s3client = new S3Client();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${file.originalname}`,
      Body: file.buffer,
    };
    return await s3client.send(new PutObjectCommand(params));
  } catch (err) {
    console.log("Error in uploading file to s3", err.message);
  }
};
exports.uploadFile = async (file, originalUrl, userId) => {
    try {
       console.log(
         "==================================== Files  AWS File ================================"
        );
        console.log(file);
         console.log(
           "==================================== Complete AWS ================================"
         );
        
    const fileName =
      `${originalUrl}/${userId}/` + file.originalname.replace(/ /g, "-");
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
    };
        const fileUrl = await S3.upload(params).promise();
         console.log(
           "==================================== Files URL at AWS ================================"
        );
        console.log(fileUrl.Location);
        
    return fileUrl.Location;
  } catch (error) {
    console.log("Error in uploading file to s3", error.message);
  }
};