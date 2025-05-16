const fs = require("fs");
const path = require('path');
const Promise = require('bluebird');
const pdf = Promise.promisifyAll(require('html-pdf'));
const moment = require('moment');

const createFolder = (path) => {
  fs.access(path, (error) => {
    if (error) {
      // If current directory does not exist then create it
      fs.mkdir(path, { recursive: true }, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("New Directory created successfully !!");
        }
      });
    } else {
      console.log("Given Directory already exists !!");
    }
  });
}

const removeFile = async (options) => {
  fs.readdir(`${options.directory}`, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      if (file.includes(options.file_name)) {
        fs.unlink(path.join(options.directory, file), (err) => {
          if (err) throw err;
        });
      }
    }
  });
}

const createPDF = async (html, options, otherOptions) => {
  if (otherOptions?.isRemoveFiles) {
    removeFile({ directory: otherOptions.directory, file_name: otherOptions.fileName });
  }
  let res = await pdf.createAsync(html, options);
  console.log('--createPDF--', res.filename);
  return res;
};

const mergePDFFiles = async (fileNames, options) => {
  {
    const { default: PDFMerger } = await import('pdf-merger-js');
    const merger = new PDFMerger();
    const documentsDir = options?.inputDirectory;
    const pdfPaths = fileNames.map((file) => 
      path.join(documentsDir, file
    ));
    for (const filePath of pdfPaths) {
      if (fs.existsSync(filePath)) {
        await merger.add(filePath);
      } else {
        console.error(`File not found: ${filePath}`);
      }
    }
    const outputFileName = `${moment().format('YYYY-MM-DD')}.pdf`;
    const outputPath = path.join(options?.outputDirectory, outputFileName);
    await merger.save(outputPath);
    console.log('PDFs merged successfully.');
    return outputFileName;
  };
}


module.exports = {
  createFolder,
  removeFile,
  createPDF,
  mergePDFFiles,
};