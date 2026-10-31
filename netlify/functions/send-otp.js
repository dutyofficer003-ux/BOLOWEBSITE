const sendVerificationEmail = require('./send-verification-email');

exports.handler = async function (event, context) {
    // Forward directly to send-verification-email handler for unified Brevo API behavior
    return sendVerificationEmail.handler(event, context);
};
