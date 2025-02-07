const multer = require("multer");
const sharp = require("sharp");

//*
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

exports.upload = multer({ storage: multerStorage, fileFilter: multerFilter });

//* upload.single('image')
//* upload.array('images', 5)
//* upload.fields([{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 3 }])

exports.imageOptions = async ({
  file,
  resize: { width, height, fit },
  format,
  quality,
  dir,
  filename,
}) => {
  await sharp(file)
    .resize(width, height, { fit })
    .toFormat(format)
    .jpeg({ quality })
    .toFile(`${dir}/${filename}`);
};
