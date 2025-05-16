const paths = {
    candidateResume: {
        path: "/public/resume",
        allowedFileTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg", "application/pdf"],
        error: "Only pdf, word and image type file is required"
    },
    candidateDocuments: {
        path: "/public/documents",
        allowedFileTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg", "application/pdf"],
        error: "Only pdf, word and image type file is required"
    },
    policyMedia: {
        path: "/public/policies",
        allowedFileTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg", "application/pdf"],
        error: "Only pdf, word and image type file is required"
    },
    templateImage: {
        path: "/public/templateImage",
        allowedFileTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg", "application/pdf"],
        error: "Only image, word and image type file is required"
    },
    attendanceImage: {
        path: "/public/attendance",
        allowedFileTypes: ["image/png", "image/jpeg", "application/octet-stream"],
        error: "Only image type file is required"
    },
    holidayData: {
        path: "/public/holiday",
        allowedFileTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        error: "Only xlsx type file is required"
    },
    uploadPostsFiles: {
        path: "/public/posts",
        allowedFileTypes: ["application/pdf","image/png","image/jpg","video/mp4","text/csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream"
        ],
        error: "Only JPG, PNG, JPEG, MP4, PDF, XLSX, PPTX and DOCX file required"
    },

    uploadTravelAndClaimBill: {
        path: "/public/travel_claim",
        allowedFileTypes: ["application/pdf","image/png","image/jpg","video/mp4","text/csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream"
        ],
        error: "Only image type file is required"
    },

    employeeInvestmentProof:{
        path:"/public/payroll_employee_investment_proof",
        allowedFileTypes: ["application/pdf","image/png","image/jpg","video/mp4","text/csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream"
        ],
        error: "Only image type file is required"
    },

    bulkUploadEmployee:{
        path:"/public/bulk_upload_employee",
        allowedFileTypes: ["application/pdf","image/png","image/jpg","video/mp4","text/csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream"
        ],
        error: "Only image type file is required"
    },

    clientLogo:{
        path:"/src/public/client_logo",
        allowedFileTypes: ["application/pdf","image/png","image/jpg","video/mp4","text/csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream","image/jpeg"
        ],
        error: "Only image type file is required"
    }




}



module.exports = {
    paths,
}