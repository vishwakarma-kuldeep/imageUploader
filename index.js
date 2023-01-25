// require("dotenv").config();
// const express = require("express");
// const app = express();

// const bodyParser = require("body-parser");
// const cors = require("cors");
// const multer = require("multer");
// // Normalize Port for Deployment
// const PORT = process.env.PORT || 3000;
// const uploadFileRoute = require("./apiRoute");
// const NormalizePort = (port) => {
//   const parsedPort = parseInt(port, 10);
//   if (isNaN(parsedPort)) {
//     return port;
//   }
//   if (parsedPort >= 0) {
//     return parsedPort;
//   }
//   return false;
// };

// // Setup server port
// const port = NormalizePort(PORT);

// // Use Node.js body parsing middleware
// app.use(bodyParser.json({
//     limit: "500mb",
// }));
// app.use(
//   bodyParser.urlencoded({
//       extended: true,
//       limit: "500mb",
//   })
// );

// // Enable CORS
// app.use(cors({
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
// }));
// app.use(multer().any());

// // Set development server
// if (process.env.NODE_ENV === "development") {
//   const morgan = require("morgan");
//   app.use(morgan("dev"));
// }

// // Set production server
// if (process.env.NODE_ENV === "production") {
//   const helmet = require("helmet");
//   app.use(helmet());
// }

// // Set base route
// app.use("/api", uploadFileRoute);

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const cors = require("cors");
const multer = require("multer");
const upload = require("./aws");
const aws = require("aws-sdk");
const cron = require("node-cron");
const { default: axios } = require("axios");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
var s3 = new aws.S3({ apiVersion: "2006-03-01" });

app.use(bodyParser.json({
    limit: "500mb",
}));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "500mb",
  })
);
app.use(multer().any());

app.post("/upload", async (req, res) => {
    console.log("==================================== req.files  ================================")
  try {
    
    console.log(req.files[0]);
  //   console.log("Ho Gaya Upload ")
  //   let params = {
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Key: req.files[0].originalname,
  //     ContentType: req.files[0].mimetype,
  //   };
  //   // cron.schedule("* */1 * * * *", async () => {
  //      console.log("Running a task every minute");
  //     const uploadId = await new Promise((resolve, reject) =>
  //     s3.createMultipartUpload(params, (err, uploadData) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         return resolve(uploadData.UploadId);
  //       }
  //     })
  //     );
  //     console.log("UploadId: ", uploadId);
  //     console.log("Running a task every second");
  //     const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
  //     const CHUNKS_COUNT = Math.floor(req.files[0].size / CHUNK_SIZE) + 1;
  //     let promisesArray = [];
  //     let start, end, blob;

  //     for (let index = 1; index < CHUNKS_COUNT + 1; index++) {

  //       start = (index - 1) * CHUNK_SIZE;
  //       end = index * CHUNK_SIZE;
  //       blob =
  //         index < CHUNKS_COUNT
  //           ? req.files[0].buffer.slice(start, end)
  //           : req.files[0].buffer.slice(start);

  //       let params1 = {
  //         Bucket: process.env.AWS_BUCKET_NAME,
  //         Key: req.files[0].originalname,
  //         PartNumber: index,
  //         UploadId: uploadId,
  //       };

  //       const presignedUrl = await new Promise((resolve, reject) =>
  //         s3.getSignedUrl("uploadPart", params1, (err, presignedUrl) => {
  //           if (err) {
  //             reject(err);
  //           } else {
  //             return resolve(presignedUrl);
  //           }
  //         })
  //       );

  //       // Send part aws server
  //       let uploadResp = axios.put(presignedUrl, blob, {
  //         headers: {
  //           "Content-Type": req.files[0].mimetype,
  //         },
  //       });
  //       promisesArray.push(uploadResp);
  //     }

  //     let resolvedArray = await Promise.all(promisesArray);

  //     let uploadPartsArray = [];
  //     resolvedArray.forEach((resolvedPromise, index) => {
  //       uploadPartsArray.push({
  //         ETag: resolvedPromise.headers.etag,
  //         PartNumber: index + 1,
  //       });
  //     });
  //     let params2 = {
  //       Bucket: process.env.AWS_BUCKET_NAME,
  //       Key: req.files[0].originalname,
  //       MultipartUpload: {
  //         Parts: uploadPartsArray,
  //       },
  //       UploadId: uploadId,
  //     };
  //     console.log(params2);
  //     const data = await new Promise((resolve, reject) =>
  //       s3.completeMultipartUpload(params2, (err, data) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           return resolve(data);
  //         }
  //       })
  //     );
  //     console.log(data.Location);
  //     res.send(data.Location);
  //   // });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error saving file.");
  }
});
 app.post("/save", async (req, res) => {
  try {
    console.log(req.files, req.file);
    var urls = [];
    // const data =
    //   "https://meta-unite-server.s3.ap-south-1.amazonaws.com/news/881D5CE2-1486-4F22-AB45-EA54EBE5DFFD.jpg";

    // // get extension of file
    // const extension = data.split(".")[data.split(".").length - 1];
    // console.log(extension);
    if (req.files) {
      const files = req.files;
      let job;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        job = cron.schedule("* */1 * * * *", async () => {
        const result = await upload.uploadFile(file, req.url.split("/")[1]);
          urls.push(result);
          if (urls.length === files.length) {
            job.stop();
            return res.status(200).send(urls);
          }
        });
        
      }
    }
    return res.status(200).send(urls);
  } catch (error) {
    console.log(error)
    console.log(error.message);
    res.status(500).send("Error saving file.");
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

