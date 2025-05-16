const { filter } = require('bluebird');
const dropdownMastersSchema = require('../../../models/dropdownMasters.model');
const { getServiceResFormat, getAggregatePagination, getDb } = require('../utils/appHelper');
const dropdownMastersCategorySchema = require('../../../models/dropdownMastersCategory.model');

const saveDropdownData = async (data) => {
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMastersModel = dropdownMastersSchema(db);
    const queryRes = await dropdownMastersModel.create(data);
    if(queryRes){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;
};
const getDropdownDataById = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMastersModel = dropdownMastersSchema(db);
    const queryRes = await dropdownMastersModel.findById(filter);
    if (queryRes) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;
}
 
const queryDropdownData = async (filter, options) => {
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMastersModel = dropdownMastersSchema(db);
    const totalRecords =  await dropdownMastersModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await dropdownMastersModel.aggregate([
        { "$match": filter },
        {
            "$lookup":
            {
                from: "dropdown_master_categories",
                localField: "category_id",
                foreignField: "_id",
                as: "category_details",
            }
        },
        {
            "$set": {
                category_name: { "$arrayElemAt": ["$category_details.name", 0] },
                category_short_name: { "$arrayElemAt": ["$category_details.category_short_name", 0] },
                //  {
                //     "$replaceAll": {
                //         "input": {
                //             "$concat": [
                //                 {
                //                     "$toUpper": {
                //                         "$substrCP": [
                //                             { "$ifNull": ["$category", ""] },
                //                             0,
                //                             1
                //                         ]
                //                     }
                //                 },
                //                 {
                //                     "$substrCP": [
                //                         { "$ifNull": ["$category", ""] },
                //                         1,
                //                         { "$strLenCP": { "$ifNull": ["$category", ""] } }
                //                     ]
                //                 }
                //             ]
                //         },
                //         "find": "_",
                //         "replacement": " "
                //     }
                // },
                input_type_name: {
                    "$replaceAll": {
                        "input": {
                            "$concat": [
                                {
                                    "$toUpper": {
                                        "$substrCP": [
                                            { "$ifNull": ["$input_type", ""] },
                                            0,
                                            1
                                        ]
                                    }
                                },
                                {
                                    "$substrCP": [
                                        { "$ifNull": ["$input_type", ""] },
                                        1,
                                        { "$strLenCP": { "$ifNull": ["$input_type", ""] } }
                                    ]
                                }
                            ]
                        },
                        "find": "_",
                        "replacement": " "
                    }
                }
            }
        },
        {
            "$project":{
                category_details:0
            }
        },
        options?.skips,
        options?.limits
    ]).allowDiskUse();
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if(queryRes && queryRes?.data?.length){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;
};

const queryFilteredDropdownDatas = async (filter) => {
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMastersModel = dropdownMastersSchema(db);
    const queryRes = await dropdownMastersModel.find(filter,{label: "$category_key", value: "$_id", _id: 1, is_active: 1, deleted_at:1, category: 1, category_key: 1, category_value: 1});
    if(queryRes && queryRes?.length){
        res.data = {
            category: filter?.category,
            data: queryRes
        };
    }else{
        res.status = false;
    }
    return res;
}

const updateDropdownData = async (filter, update) => {
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMastersModel = dropdownMastersSchema(db);
    const queryRes = await dropdownMastersModel.updateOne(filter, update);
    if(queryRes?.nModified){
        res.data = queryRes;
    }else{
        res.status = false;
    }
    return res;
}

const saveMasterCategory = async(data)=>{
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMasterCategoryModel = dropdownMastersCategorySchema(db);
    const records = await dropdownMasterCategoryModel.create(data);
    if(records){
        res.data = records;
    }else{
        res.status = false;
    }
    return res
}

const updateMasterCategory = async(filter, update)=>{
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMasterCategoryModel = dropdownMastersCategorySchema(db);
    const records = await dropdownMasterCategoryModel.findOneAndUpdate(filter, { $set: update }, { new: true });
    if(records){
        res.data = records;
    }else{
        res.status = false;
    }
    return res;
}

const deleteMasterCategory = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMasterCategoryModel = dropdownMastersCategorySchema(db);
    const records = await dropdownMasterCategoryModel.deleteOne(filter);
    if(records){
        res.data = records;
    }else{
        res.status = false;
    }
    return res;
}

const getAllMasterCategory = async(filter)=>{
    const res = getServiceResFormat();
    let db = getDb()
  const dropdownMasterCategoryModel = dropdownMastersCategorySchema(db);
    const records = await dropdownMasterCategoryModel.find(filter,{label: "$name", value: "$_id", });
    if(records){
        res.data = records;
    }else{
        res.status = false;
    }
    return res
}

const getMasterCategory = async (filter, options) => {
    const res = getServiceResFormat()
    let db = getDb()
  const dropdownMasterCategoryModel = dropdownMastersCategorySchema(db);
    const totalRecords = await dropdownMasterCategoryModel.find(filter).count();
    options = getAggregatePagination(options, totalRecords);
    const records = await dropdownMasterCategoryModel.aggregate([
        { "$match": filter },
        options?.skips,
        options?.limits,
    ]);
    const queryRes = {
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        totalPages: options?.totalPages,
        data: records
    }
    if (queryRes && queryRes?.data?.length) {
        res.data = queryRes;
    } else {
        res.status = false;
    }
    return res;

}

const queryFilteredDropdownData = async (filter) => {
    const res = getServiceResFormat(); 
    let db = getDb()
  const dropdownMasterCategoryModel = dropdownMastersCategorySchema(db);
    const record = await dropdownMasterCategoryModel.aggregate([
        { 
          $match: filter 
        },
        {
          $lookup: {
            from: "dropdown_masters",
            localField: "_id",
            foreignField: "category_id",
            as: "dropdown_master_details"
          }
        },
        {
          $project: {
            name: 1,
            category_short_name: 1,
            dropdown_master_details: {
              $map: {
                input: "$dropdown_master_details",
                as: "item",
                in: {
                  label: "$$item.category_key",
                  value: "$$item._id",
                  category: "$$item.category",
                  category_key: "$$item.category_key",
                  category_value: "$$item.category_value",
                  is_active: "$$item.is_active",
                  deleted_at: "$$item.deleted_at",
                  _id: "$$item._id"
                }
              }
            }
          }
        }
      ]);
    if(record && record?.length){
        res.data = {
            category: filter?.category,
            data: record
        };
    }else{
        res.status = false;
    }
    return res;
}

module.exports = {
    saveDropdownData,
    queryDropdownData,
    updateDropdownData,
    queryFilteredDropdownData,
    getDropdownDataById,
    saveMasterCategory,
    updateMasterCategory,
    deleteMasterCategory,
    getAllMasterCategory,
    getMasterCategory,
};