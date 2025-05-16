const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const employeeDocumentSchema = mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    doc_name: {
        type: String,
        required: true
    },
    file_name: {
        type: String,
        required: true
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

employeeDocumentSchema.plugin(toJSON);
employeeDocumentSchema.plugin(paginate);

/**
 * @typedef employeeDocumentModel
 */
// const employeeDocumentModel = mongoose.model('emp_documents', employeeDocumentSchema);

// module.exports = employeeDocumentModel;

module.exports = (db) => {
  return db.model('emp_documents', employeeDocumentSchema);
};
