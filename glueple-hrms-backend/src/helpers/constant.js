module.exports = {
    OK: {
      code: 200,
      message: "OK",
    },
    CREATED: {
      code: 201,
      message: "CREATED",
    },
    ACCEPTED: {
      code: 202,
      message: "ACCEPTED",
    },
    NON_AUTHORITATIVE_INFORMATION: {
      code: 203,
      message: "NON_AUTHORITATIVE_INFORMATION ",
    },
    NO_CONTENT: {
      code: 204,
      message: "NO_CONTENT",
    },
    RESET_CONTENT: {
      code: 205,
      message: "RESET_CONTENT",
    },
    PARTIAL_CONTENT: {
      code: 206,
      message: "PARTIAL_CONTENT",
    },
    MULTI_STATUS: {
      code: 207,
      message: "MULTI_STATUS",
    },
    ALREADY_REPORTED: {
      code: 208,
      message: "ALREADY_REPORTED ",
    },
    IM_USED: {
      code: 226,
      message: "IM_USED",
    },
    BAD_REQUEST: {
      code: 400,
      message: "BAD_REQUEST",
    },
    UNAUTHORIZED: {
      code: 401,
      message: "UNAUTHORIZED",
    },
    PAYMENT_REQUIRED: {
      code: 402,
      message: "PAYMENT_REQUIRED",
    },
    FORBIDDEN: {
      code: 403,
      message: "ACCESS FORBIDDEN",
    },
    NOT_FOUND: {
      code: 404,
      message: "NOT_FOUND",
    },
    METHOD_NOT_ALLOWED: {
      code: 405,
      message: "METHOD_NOT_ALLOWED",
    },
  
    INTERNAL_SERVER_ERROR: {
      code: 500,
      message: "Something went wrong!",
    },
  
    messageKeys: {
      code_2000: "success",
      code_2001: "User created successfully.",
      code_2002: "Session created.",
      code_2003: "Successful login.",
      code_2004: "Mail sent successfully.",
      code_4000: "Bad Request",
      code_4001: "Invalid credentials.",
      code_4002: "Incomplete data.",
      code_4003: "User already logged in somewhere.",
      code_4004: "Unauthorized access.",
      code_4005: "Invalid CSRF token.",
      code_4006: "Token missing.",
      code_4007: "Invalid Link.",
      code_5000: "An error occured while authentiation.",
      code_5001: "An error occured while creating user.",
      code_5002: "Internal server error.",
      code_5003: "File not uploaded. Error on creating file.",
      code_5004: "Error in reading file.",
    },
    TABLES: {
    },
    ASSET_REQ_STATUS: {
      PENDING: 0,
      ASSIGN: 1,
      APPROVED: 2,
      REJECT: 3,
      REPLACE: 4,
      RELEASE: 5
    },
    SEPARATION_TYPE:{
      RESIGNATION:1,
      OTHERS:2,
    },
  
    DEFAULT_STATUS: { TRUE: 1, FALSE: 0 },
    DEFAULT_BOOLEAN_STATUS: { TRUE: true, FALSE: false },
  
    // ROLES: {Junior_Developer:'Junior Developer', hr_manager:'Hr Manager'},
  
    SMS: {
      OTP: `<%= otp %> is your OTP to forgot password.\nThank you`
    },
  
    simple2Call: {
      accessToken: 'YmhlZW0uc3dhbWlAcWRlZ3JlZXMuY29t',
      routedName: 'QDegree',
      username: 'bheem.swami@qdegrees.com',
      password: 'Simple@2023',
      server: 'conference.simple2call.in',
      apiUrl: 'https://conference.simple2call.in',
    },
    smsCredentials: {
      apiUrl: 'http://sms.smsmenow.in/sendsms.jsp?',
      username: 'qdegree',
      password: '7bc845dab5XX',
      senderId: 'QDSSUR',
    }
  };
  