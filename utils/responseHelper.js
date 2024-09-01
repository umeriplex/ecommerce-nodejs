// utils/responseHelper.js
function sendResponse(res, statusCode, success, message, data) {
    const response = {
      statusCode,
      success,
      message
    };
  
    if (data !== undefined) {
      response.data = data;
    }
  
    return res.status(statusCode).json(response);
  }
  
  module.exports = sendResponse;
  