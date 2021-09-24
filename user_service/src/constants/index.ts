const Constants = {
    SMTP_FROM: "antierbanteralpaca@gmail.com",
    PAGE_LIMIT: 20,
    EMAIL_HTML: (data: any) => `<h3>Your <b>OTP</b> for the email verification is: <b>${data}<b></h3>`
};

export default Constants;