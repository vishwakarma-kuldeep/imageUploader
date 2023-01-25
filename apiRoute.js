const router = require("express").Router();
const { uploadFile } = require("./aws");
const cron = require("node-cron");
router.post("/upload", async (req, res) => {
  try {
    let fileUrls = [],
      uploadUrl = [],
      job;
      const files = req.files;
       console.log(
         "==================================== req.files  ================================"
       );
        
    //   console.log(req.files)
    if (files && files.length > 0) {
      const originalUrl = req.originalUrl.toString().split("/")[1];
      if (req.files) {
          const filesData = [];
        req.files.map(async (file) => {
          job = cron.schedule("* */1 * * * *", async () => {
            fileUrls.push(await uploadFile(file, originalUrl,"kuldeep"));
            if (fileUrls.length > 0) {
              for (const file of fileUrls) { 
                if (!filesData.includes(file)) {
                  filesData.push(file);
                }
              } 
            }
          });
        });
        // console.log("==================================== Files Data ================================")
        // console.log(filesData);
        }
    //     const result = await Promise.all(uploadUrl);
        
    //   console.log(result);
      }
       console.log(
         "==================================== Files URL ================================"
       );
      console.log(fileUrls);
    return res.status(200).json("File Uploaded Successfully");
  } catch (error) {
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});

module.exports = router;