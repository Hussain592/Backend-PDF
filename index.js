

const express = require('express');
const multer  = require('multer');
const docxConverter = require('docx-pdf');
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;


if (!fs.existsSync("uplode")) {
  fs.mkdirSync("uplode");
}
if (!fs.existsSync("files")) {
  fs.mkdirSync("files");
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uplode'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".docx") {
      return cb(new Error("Only .docx files are allowed!"));
    }
    cb(null, true);
  }
});


app.get("/", (req, res) => {
  res.send(`
    <h2>DOCX to PDF Converter</h2>
    <form action="/convidefile" method="post" enctype="multipart/form-data">
      <input type="file" name="file" accept=".docx" required />
      <button type="submit">Upload & Convert</button>
    </form>
  `);
});


app.post('/convidefile', upload.single('file'), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).send(" No File uploaded!");
    }

    let outputpath = path.join(__dirname, "files", `${req.file.originalname}.pdf`);

    docxConverter(req.file.path, outputpath, (err, result) => {
      if (err) {
        console.error(" Conversion Error:", err);
        return res.status(500).send("Error converting to PDF");
      }

     
      res.download(outputpath, (err) => {
        if (err) {
          console.error(" Download error:", err);
        } else {
          console.log("✅ File converted & downloaded");
        }
      });
    });

  } catch (error) {
    console.error(" Server Error:", error);
    res.status(500).send("Internal server error");
  }
});


app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});

