const httpStatus = require('http-status');
const catchAsync = require('../../../helpers/catchAsync.js');
const { locationService } = require('../services');
const { successResponse, errorResponse } = require('../../../helpers');
const { messages } = require('../../../config/constants.js');
const { getSessionData, getServiceResFormat } = require('../utils/appHelper.js');
const XLSX = require('xlsx');
const path = require('path');
const mongoose = require('mongoose');
const axoisHelper = require('../../../helpers/axois.js');
const filePath = path.join(__dirname, '..', '..', '..', '..', 'public/');

const createLocation = catchAsync(async (req, res) => {
  const user = getSessionData(req);
  req.body['created_by'] = user?.id;
  const locationData = await locationService.createLocation(req.body);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, locationData, httpStatus.OK);
});

const updateLocation = catchAsync(async (req, res) => {
  const locationData = await locationService.updateLocation({ _id: req.body._id }, { $set: req.body });
  return successResponse(req, res, messages.alert.SUCCESS_UPDATE_DATA, locationData, httpStatus.OK);
});

const deleteLocation = catchAsync(async (req, res) => {
  const locationData = await locationService.deleteLocation({ _id: req.body._id });
  return successResponse(req, res, messages.alert.SUCCESS_DELETE_DATA, locationData, httpStatus.OK);
});

const getLocation = catchAsync(async (req, res) => {
  const locationData = await locationService.queryLocation({ deleted_at: { $eq: null } }, req.query);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, locationData, httpStatus.OK);
});

const getLocationDataList = catchAsync(async (req, res) => {
  const filters = {
    ...req.query,
    is_active: true,
    deleted_at: { $eq: null }
  };
  const locationData = await locationService.getLocationDataList(filters);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, locationData, httpStatus.OK);
});

const uploadData = catchAsync(async (req, res) => {
  const wb = XLSX.readFile(`${filePath}cities.csv`);
  const ws = wb.Sheets["Sheet1"];
  const data = XLSX.utils.sheet_to_json(ws);
  await locationService.saveData(data);
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, {}, httpStatus.OK);
});

const getAllCountriesList = catchAsync(async (req, res) => {
  const countryData = await locationService.getAllCountryList({ deleted_at: { $eq: null } });
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, countryData, httpStatus.OK);
});

const getAllStateFromCountryList = catchAsync(async (req, res) => {
  let country_ids = req.body?.country_id ? req.body?.country_id : [];
  const stateData = await locationService.getAllStateFromCountryList({ deleted_at: { $eq: null }, $or: [{ country_id: { '$in': country_ids } }, { _id: { '$in': country_ids.map(data => mongoose.Types.ObjectId(data)) } }] });
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, stateData, httpStatus.OK);
});

const getCityListFromState = catchAsync(async (req, res) => {
  let state_ids = req.body?.state_id ? req.body?.state_id : [];
  const cityData = await locationService.getCityListFromState({ deleted_at: { $eq: null } , $or: [{ state_id: { '$in': state_ids } }, { _id: { '$in': state_ids.map(data => mongoose.Types.ObjectId(data)) }} ] });
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, cityData, httpStatus.OK);
});

const addAttendanceLocation = catchAsync(async(req, res)=>{
    const user = getSessionData(req);
    const {name, location_name,latitude,longitude, employee_id,attendance_radius} = req.body
    let location_id;
    const getAttendanceLocation = await locationService.getAttendanceLocation({latitude,longitude});
    if(getAttendanceLocation.status){
      location_id = getAttendanceLocation?.data[0]?._id
    }else{
      const addLocation = await locationService.addAttendanceLocation({name,location_name,latitude,longitude,attendance_radius})
      location_id= addLocation?.data?._id
    }
    let addEmployeeLocation = await locationService.addEmployeeLocation({employee_id,location_id,attendance_radius,created_by:user.id})
    return successResponse(req, res, messages.alert.ADD_LOCATION_SUCCESS,addEmployeeLocation, httpStatus.OK)
 
})

const getAttendanceLocation = catchAsync(async(req, res)=>{
  const getLocation = await locationService.getAttendanceLocation({});
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getLocation, httpStatus.OK);
})

const updateMultipleEmployeeLocation = catchAsync(async(req, res)=>{
  const {location_id, employee_details} = req.body
  const updateLocation = await locationService.BulkUploadLocation(location_id,employee_details);
  return successResponse(req, res, messages.alert.SUCCESS_SAVE_DATA, updateLocation, httpStatus.OK)

})

const getAllCity = catchAsync(async(req, res)=>{
  const getAllCity = await locationService.getAllCity({})
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getAllCity, httpStatus.OK)
})

const getAllCityFromCountry = catchAsync(async(req, res)=>{
  const {id}= req.query
  // console.log(typeof id,id,"dddddddddddddd")
  const getCityCountryWise = await locationService.getAllCity({country_id:Number(id)})
  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, getCityCountryWise,httpStatus.OK);
})

const getLocationByLetLog = catchAsync(async (req, res) => {
  const response = getServiceResFormat();
  const { latitude, longitude } = req.query
  const addressByLatLng = await axoisHelper.geocodeAddress({ lat: latitude, lng: longitude });
  let latLngAddress = ''
  if (addressByLatLng?.results?.length) {
    const results = addressByLatLng?.results;
    latLngAddress = results[0]?.formatted_address || '';
    let country
    let countryId

    const addressArr = [];
    if (results[0]?.address_components?.length) {
      for (let i = 0; i < results[0].address_components.length; i++) {
        const addressType = results[0]?.address_components[i]?.types[0] || '';
        if (addressType === 'country') {
          country = results[0].address_components[i]['long_name'];
          countryId = results[0].address_components[i]['short_name'];
        }
        if (!latLngAddress) {
          if (addressType === 'plus_code') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'political') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'locality') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'administrative_area_level_3') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'administrative_area_level_2') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'administrative_area_level_1') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'country') addressArr.push(results[0].address_components[i]['long_name']);
          else if (addressType === 'postal_code') addressArr.push(results[0].address_components[i]['long_name']);
        }
        if (addressArr?.length) {
          latLngAddress = addressArr.join(', ')
        }
      }
    }
    const data = {
      address: latLngAddress,
      country: country,
      country_id:countryId
    }
    response.data = data
  }

  return successResponse(req, res, messages.alert.SUCCESS_GET_DATA, response, httpStatus.OK)

})



module.exports = {
  createLocation,
  updateLocation,
  deleteLocation,
  getLocation,
  getLocationDataList,
  uploadData,
  getAllCountriesList,
  getAllStateFromCountryList,
  getCityListFromState,
  addAttendanceLocation,
  getAttendanceLocation,
  updateMultipleEmployeeLocation,
  getAllCity,
  getAllCityFromCountry,
  getLocationByLetLog,
};