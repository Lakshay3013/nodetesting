const multer = require('multer');
const path = require("path");
const { paths } = require("../config/multerConstants");
const { createFolder } = require("../helpers/fileHandler");

const uploadCandidateResume = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.candidateResume?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.candidateResume?.error);
            } else {
                createFolder(`.${paths?.candidateResume?.path}/`);
                cb(null, `${path.resolve()}${paths?.candidateResume?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.candidateResume?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.candidateResume?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const uploadPolicies = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.policyMedia?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.policyMedia?.error);
            } else {
                createFolder(`.${paths?.policyMedia?.path}/`);
                cb(null, `${path.resolve()}${paths?.policyMedia?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.policyMedia?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.policyMedia?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const uploadTemplateImage = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.templateImage?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.templateImage?.error);
            } else {
                createFolder(`.${paths?.templateImage?.path}/`);
                cb(null, `${path.resolve()}${paths?.templateImage?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.templateImage?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.templateImage?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const uploadAttendanceImage = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.attendanceImage?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.attendanceImage?.error);
            } else {
                createFolder(`.${paths?.attendanceImage?.path}/`);
                cb(null, `${path.resolve()}${paths?.attendanceImage?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.attendanceImage?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.attendanceImage?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const uploadHolidayData = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.holidayData?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.holidayData?.error);
            } else {
                createFolder(`.${paths?.holidayData?.path}/`);
                cb(null, `${path.resolve()}${paths?.holidayData?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.holidayData?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.holidayData?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const uploadPostsFiles = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.uploadPostsFiles?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.uploadPostsFiles?.error);
            } else {
                createFolder(`.${paths?.uploadPostsFiles?.path}/`);
                cb(null, `${path.resolve()}${paths?.uploadPostsFiles?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.uploadPostsFiles?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.uploadPostsFiles?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});


const uploadTravelClaimBills = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.uploadTravelAndClaimBill?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.uploadTravelAndClaimBill?.error);
            } else {
                createFolder(`.${paths?.uploadTravelAndClaimBill?.path}/`);
                cb(null, `${path.resolve()}${paths?.uploadTravelAndClaimBill?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.uploadTravelAndClaimBill?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.uploadTravelAndClaimBill?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});


const uploadTravelClaimBill = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.uploadTravelAndClaimBill?.allowedFileTypes?.includes(file.mimetype)) {
                return cb(new Error("Invalid file type"), false);
            }
            createFolder(`.${paths?.uploadTravelAndClaimBill?.path}/`);
            cb(null, `${path.resolve()}${paths?.uploadTravelAndClaimBill?.path}`);
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".").pop(); // Fix: Get correct extension
            cb(null, `${Date.now()}.${ext}`);
        },
    }),
});

const uploadCandidateDocuments = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.candidateDocuments?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.candidateDocuments?.error);
            } else {
                createFolder(`.${paths?.candidateDocuments?.path}/`);
                cb(null, `${path.resolve()}${paths?.candidateDocuments?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.candidateDocuments?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.candidateDocuments?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const employeeInvestmentProof = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.employeeInvestmentProof?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.employeeInvestmentProof?.error);
            } else {
                createFolder(`.${paths?.employeeInvestmentProof?.path}/`);
                cb(null, `${path.resolve()}${paths?.employeeInvestmentProof?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.employeeInvestmentProof?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.employeeInvestmentProof?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const bulkUploadEmployee = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.bulkUploadEmployee?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.bulkUploadEmployee?.error);
            } else {
                createFolder(`.${paths?.bulkUploadEmployee?.path}/`);
                cb(null, `${path.resolve()}${paths?.bulkUploadEmployee?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.bulkUploadEmployee?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.bulkUploadEmployee?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
});

const clientLogo = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (!paths?.clientLogo?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.clientLogo?.error);
            } else {
                createFolder(`.${paths?.clientLogo?.path}/`);
                cb(null, `${path.resolve()}${paths?.clientLogo?.path}`);
            }
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".")[1];
            if (!paths?.clientLogo?.allowedFileTypes?.includes(file.mimetype)) {
                cb(paths?.clientLogo?.error);
            } else {
                cb(null, `${Date.now()}.${ext}`);
            }
        },
    }),
})

const uploadProfile = multer({})


module.exports = {
    uploadCandidateResume,
    uploadPolicies,
    uploadTemplateImage,
    uploadAttendanceImage,
    uploadHolidayData,
    uploadPostsFiles,
    uploadTravelClaimBill,
    uploadCandidateDocuments,
    employeeInvestmentProof,
    bulkUploadEmployee,
    clientLogo,
    uploadProfile
};