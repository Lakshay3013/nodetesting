const clientModel = require('../model/clients.model')

const createClient = async(data)=>{
    let createClient = await clientModel.create(data);
    return createClient;

}

const getAllClient = async(filter)=>{
    let result = await clientModel.find(filter).allowDiskUse();
    return result;
}

const getClient = async(filter)=>{
    const result = await clientModel.findOne(filter).lean();
    return result

}

const updateClient = async(filter, update)=>{
const queryRes = await clientModel.findOneAndUpdate(filter, update, {new: true});
return queryRes
}

const deleteClient = async(filter)=>{
    const queryRes = await clientModel.findOneAndDelete(filter);
    return queryRes

}


module.exports={
    createClient,
    getAllClient,
    getClient,
    updateClient,
    deleteClient
}