// call all the required packages
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");

const dirpath = path.join(__dirname, "uploads");
const readdir = util.promisify(fs.readdir);

// SET STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}-${Date.now()}`);
  }
});

const upload = multer({ storage });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/images", express.static("uploads"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/imagelist", async (req, res) => {
  let fileList = [];

  try {
    fileList = await readdir(dirpath);
  } catch (err) {
    console.log("Unable to scan dir.", err);
  }

  if (fileList === undefined) {
    console.log("fileList undefined");

    const link = "http://localhost:3000/imagelist";

    res.send(`undefined. home? <a href="${link}">${link}</a>`);
  } else {
    let list = [];

    const prefix = "http://localhost:3000/images/";

    fileList.forEach(el => {
      list.push(`
        <li>
          <p><a href="${prefix.concat(el)}">${el}</a></p>
          <img src="${prefix.concat(el)}" style="width:600px;"/>
        </li>
      `);
    });

    const link = "http://localhost:3000";

    res.send(`
      <a href="${link}">${link}</a>
      <a href="${link}/imagelist">${link}/imagelist</a>
      <ul>
        ${list.join("")}
      </ul>
    `);
  }
});

// Single file upload
app.post("/uploadfile", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

// Uploading Multiple Files
app.post("/uploadmultiple", upload.array("myFiles", 12), (req, res, next) => {
  const files = req.files;
  if (!files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(files);
});

app.listen(3000, () =>
  console.log("Server started on port http://localhost:3000")
);
