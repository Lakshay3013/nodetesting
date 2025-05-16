const axios = require('axios');
const endpoints = require("./endPoints");
const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
const moment = require('moment')
const axoisHelper = {};

axoisHelper.getRequest = () => ({ method: 'GET' });
axoisHelper.getRequestWithParams = (data) => ({ method: 'GET', params: data });
axoisHelper.postRequest = (data) => ({ method: 'POST', data });
axoisHelper.postRequestWithParams = (data) => ({ method: 'POST', params: data });

const header = {
  authorization: '',
  apienv: "",
};

axoisHelper.callApi = async (url, options, hearderParams) => {
  let res = null;
  try {
    const headers = { 'Content-Type': 'application/json' };
    const { authorization, contentType } = hearderParams;

    if (authorization) {
      headers.Authorization = authorization;
    }
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    res = await axios({ url, ...options, headers });
    res = await res.data;
    return res;
  } catch (error) {
    res = { error: true, msg: error.message };
    return res;
  }
};

axoisHelper.resumeParser = async (params) => {
    const url = `${endpoints.apiUrls.resumeParser}`;
    const dir = path.join(__dirname, '../../public/resume/'+params?.filename);
    const existingFile = await fs.createReadStream(dir)                             
    let formData = new FormData();
    formData.append("file", existingFile)
    const options = axoisHelper.postRequest(formData);
    let res = await axoisHelper.callApi(url, options,  { "contentType": "multipart/form-data" });
    console.log('--resume parser api--', res);
    return res;
}

axoisHelper.geocodeAddress = async (params) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&sensor=false&key=AIzaSyC-c-tkDWtmP72dm1byIcV8bnfGdTBsnNI`;
  const options = axoisHelper.getRequest();
  let res = await axoisHelper.callApi(url, options, header);
  // console.log('--geocodeAddress--', res, params);
  return res;
}

axoisHelper.saveImageInS3 = async (params) => {
  const url = `${endpoints.apiUrls.s2Url}`;
  const options = axoisHelper.postRequest(params);
  const res = await axoisHelper.callApi(url, options,{"content-type":"application/json"});
  console.log('--save Image--', res);
  return res
}

axoisHelper.getLiveDBdata = async (params) => {
  const url = params.url;
  const options = axoisHelper.getRequest();
  header.authorization = `eyJhbGciOiJIUzI1NiJ9_${moment().format('YYYYMMDD')}`;
  let res = await axoisHelper.callApi(url, options, header);
  // console.log('--getLiveDBdata apiv2--', res, params,url);
  return res;
}

module.exports = axoisHelper;