const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email , name)=>{
    sgMail.send({
        to:email,
        from:'rajshah.rutu@gmail.com',
        subject:'Thanks for joining in!',
        text: `Welcome to the App, ${name}. Let me know how you get along with the app`
    })
}

const sendCancelEmail = (email , name)=>{
    sgMail.send({
        to:email,
        from:'rajshah.rutu@gmail.com',
        subject:'Sorry, to see you again !',
        text: `Hey ${name}, is there any thing we have that have kept you on board`
    })
}

module.exports = {
    sendWelcomeEmail , 
    sendCancelEmail
}