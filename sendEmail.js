import nodemailer from "nodemailer";

const Email = (contenidomail) => {
  let transpoter = nodemailer.createTransport({
    host: "email-smtp.us-east-1.amazonaws.com",
    port: "465",
    auth: {
      user: "AKIAXXSD7U6D54L4SBGJ",
      pass: "BAYOqvqaqs8xI4ZsAqYjQRG0xTpLhXC3Sb+A0YBXbewX",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // let transpoter = nodemailer.createTransport({
  //   host: "mail.eduaprendes.com",
  //   port: "465",
  //   auth: {
  //     user: "admin@eduaprendes.com",
  //     pass: "Javieroca123-",
  //   },
  //   tls: {
  //     rejectUnauthorized: false,
  //   },
  // });
  transpoter.sendMail(contenidomail, (err, info) => {
    if (err) {
      console.log(err);
      return;
    }
  });
};

// send email
const EmailSender = ({ totalPrice, _id, userName, email }) => {
  const contenidomail = {
    from: "Ecommers🛍️ admin@eduaprendes.com",
    to: email,
    subject: "Message From Shoeshop Store",
    html: `
        <div style="width: 100%; background-color: #f3f9ff; padding: 5rem 0">
        <div style="max-width: 700px; background-color: white; margin: 0 auto">
          <div style="width: 100%; background-color: #00efbc; padding: 20px 0">
         <img
              src="https://res.cloudinary.com/zpune/image/upload/v1652256707/random/favicon_hybtfj.png"
              style="width: 100%; height: 70px; object-fit: contain"
            /></a> 
          
          </div>
          <div style="width: 100%; gap: 10px; padding: 30px 0; display: grid">
            <p style="font-weight: 800; font-size: 1.2rem; padding: 0 30px">
              Form Shoeshop Store
            </p>
            <div style="font-size: .8rem; margin: 0 30px">
              <p>Hola <b>${userName}</b>, hemos recibido tu notificacion de pago de la compra  : ${_id}  por un monto total de ${totalPrice} </p>
              <p> Procederemos a confirmar el pago, pronto te notificaremos .</p>
              
            </div>
          </div>
        </div>
      </div>
        `,
  };

  Email(contenidomail);
};

export default EmailSender;
