const Joi = require('joi');

const addMRFVacancy = {
	body: Joi.object().keys({
		query_type: Joi.string().required().label('Query Type'),
		_id: Joi.string().optional().allow('').label('MRF ID'),
		type: Joi.string().required().label('Type'),
		department_id: Joi.string().required().label('Department'),
		designation_id: Joi.string().required().label('Designation'),
		position_id: Joi.string().required().label('Position'),
		priority: Joi.string().required().label('Priority'),
		min_qualififcation: Joi.string().required().label('Minimum Qualification'),
		business_impact: Joi.string().required().label('Business Impact'),
		hiring_for: Joi.string().required().label('Location'),
		vacant_position: Joi.number().required().label('Vacant Position'),
		year_of_experience: Joi.string().required().label('Experience'),
		mrf_justification: Joi.string().required().label('MRF Justification'),
		step: Joi.number().required().label('Step'),
		preferred_qualification: Joi.string().optional().allow('').label('Preferred Qualification'),
		learning_development_cost: Joi.object().optional().allow('').label('L & D Cost'),
		type_of_appointment: Joi.object().optional().allow('').label('Appointment Type'),
	}),
};

const addMRFReplacement = {
	body: Joi.object().keys({
		query_type: Joi.string().required().label('Query Type'),
		_id: Joi.string().optional().allow('').label('MRF ID'),
		type: Joi.string().required().label('Type'),
		department_id: Joi.string().required().label('Department'),
		designation_id: Joi.string().required().label('Designation'),
		position_id: Joi.string().required().label('Position'),
		priority: Joi.string().required().label('Priority'),
		emp_id: Joi.string().required().label('EMP ID'),
		step: Joi.number().required().label('Step'),
	}),
};

const addJobDescription = {
	body: Joi.object().keys({
		query_type: Joi.string().required().label('Query Type'),
		_id: Joi.string().required().label('MRF ID'),
		role_summary: Joi.string().required().label('Role Summary'),
		responsiblities: Joi.string().required().label('Responsibilities'),
		domain_knowledge: Joi.string().required().label('Domain Knowledge'),
		step: Joi.number().required().label('Step'),
		training_certificates: Joi.string().optional().allow('').label('Training Certificates'),
		other_skills: Joi.string().optional().allow('').label('Other Skills'),
	}),
};

const addInterviewAuthority = {
	body: {
		query_type: Joi.string().required().label('Query Type'),
		mrf_id: Joi.string().required().label('MRF ID'),
		interview_details: Joi.array().required().label('Interview Details'),
		step: Joi.number().required().label('Step'),
		_id: Joi.string().optional().allow('').label('Interview ID'),
	}
};

const submitDraftMRF = {
	body: {
		query_type: Joi.string().required().label('Query Type'),
		_id: Joi.string().required().label('MRF ID'),
	}
};

const getAllMRF = {
	query: Joi.object().keys({
		query_type: Joi.string().required().label('Query Type'),
		limit: Joi.number().optional().allow(0).label('Limit'),
		page: Joi.number().optional().allow(0).label('Page'),
		type: Joi.string().optional().allow('').label('Submit/Draft'),
		start_date: Joi.string().optional().allow('').label('Start Date'),
		end_date: Joi.string().optional().allow('').label('End Date'),
		applied_for: Joi.string().optional().allow('').label('Applied For'),
		approval_status: Joi.string().optional().allow('').label("Approval Status"),
	}),
};

const getMRFById = {
	query: Joi.object().keys({
		_id: Joi.string().required().label('MRF Id'),
	}),
};

const approveRejectMRF = {
	body: Joi.object().keys({
		_id: Joi.string().required().label('Approver Id'),
		action_type: Joi.string().required().label('Approve/Reject'),
		comment: Joi.string().optional().allow("").label('Comment'),
	}),
};

const getMRFForApproval = {
	query: Joi.object().keys({
		action_type: Joi.string().required().label("Type"),
		limit: Joi.number().optional().allow(0).label('Limit'),
		page: Joi.number().optional().allow(0).label('Page'),
		start_date: Joi.string().optional().allow('').label('Start Date'),
		end_date: Joi.string().optional().allow('').label('End Date'),
	}),
};

const assignMRFToRecruiter = {
	body: Joi.object().keys({
		_id: Joi.string().required().label('MRF Id'),
		recruiter_id: Joi.string().required().label('Recruiter'),
	}),
};

const changeMRFStatus = {
	body: Joi.object().keys({
		_id: Joi.string().required().label('MRF Id'),
		mrf_status: Joi.string().required().label('Status'),
	}),
};

const ijpReferral = {
	body: Joi.object().keys({
		_id: Joi.string().required().label('MRF Id'),
		open_for: Joi.string().required().label('IJP/REF'),
		last_date_to_apply: Joi.date().required().label('Last Date'),
		disbursal_time: Joi.string().optional().allow("").label('Disbursal Time'),
		payment_type: Joi.string().optional().allow("").label('Payment Type'),
		male_payment_value: Joi.number().optional().allow(0).label('Male Payment'),
		diversity_payment_value: Joi.number().optional().allow(0).label('Diversity Payment'),
	}),
};

const getInterviewerList = {
	query: Joi.object().keys({
		designation_id: Joi.string().required().label("Designation ID"),
	}),
};

module.exports = {
	addMRFVacancy,
	addMRFReplacement,
	addJobDescription,
	addInterviewAuthority,
	submitDraftMRF,
	getAllMRF,
	getMRFById,
	approveRejectMRF,
	getMRFForApproval,
	assignMRFToRecruiter,
	changeMRFStatus,
	ijpReferral,
	getInterviewerList,
};