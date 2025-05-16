const baseUrls = {
  python : `http://ub.glueple.com:8000`,
  s3:`http://localhost:5000`
};
const apiUrls = {
  resumeParser: `${baseUrls.python}/resume-upload`,
  s2Url:`${baseUrls.s3}/api/upload-image-base64`
};

module.exports = {
  baseUrls,
  apiUrls,
};