const paths = {
    candidateResume: {
        path: "/public/resume",
        fileTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg", "application/pdf"],
        error: "Only pdf, word and image type file is required"
    },
}



module.exports = {
    paths,
}