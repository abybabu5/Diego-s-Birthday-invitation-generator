const express = require("express");
const { join } = require("path");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");

const router = express.Router();

const uploadFolder = join(__dirname, "../../../public/img/users/");

const upload = multer({}); // creating a multer instance

router.post("/upload", upload.single("image"), async (req, res, next) => {
  // http://localhost:3000/files/upload
  // Multer middleware is taking care of multipart/form-data content-type and is giving me back a req.file object in which I'm gonna find the file and other infos like size or original name
  console.log(req.file.buffer);
  await writeFile(join(uploadFolder, req.file.originalname), req.file.buffer); // I'm taking the buffer (the received file) and I'm writing it on my disk with writeFile(path, buffer)
  res.send("Ok");
});

router.get("/:name/download", async (req, res, next) => {
  // http://localhost:3000/files/image.png/download
  // In real applications find the file path from the :id
  const { name } = req.params;
  // const buffer = await readFile(join(uploadFolder, name));
  // res.send(buffer);
  const stream = createReadStream(join(uploadFolder, name));
  res.setHeader("Content-Disposition", `attachment; filename=${name}`);
  stream.pipe(res);
});

module.exports = router;
