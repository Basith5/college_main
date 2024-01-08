import multer from "multer";
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder for CSV files
    cb(null, 'storage/');
  },
  filename: (req, file, cb) => {
    // Set the filename for CSV files
    var hrTime = process.hrtime()
    var nanotime = hrTime[0] 
    const filename = nanotime + "_" + file.originalname
    cb(null, filename); // Use the original file name
  },
});

async function getFilePath(file: Express.Multer.File): Promise<string> {
  const folder_name = "storage/"
  await fs.promises.mkdir(folder_name, { recursive: true })
    .catch((error) => {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    });


    var hrTime = process.hrtime()
    var nanotime = hrTime[0] 
    const filename = nanotime + "_" + file.originalname

  return folder_name + filename;
}

const upload = multer({ storage: storage });

export { storage, upload ,getFilePath}