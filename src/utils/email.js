import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user : 'horneatitosshop@gmail.com',
        pass : 'qdvs jwmq xxld ubxc'
    }
});

export default transporter;