const nodemailer = require("nodemailer");
module.exports = async function verificacionCorreo(correoUsuario, usuario){
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "airlitygti@gmail.com", // generated ethereal user
      pass: "pruebasgti", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Airlity" <airlitygti@gmail.com>', // sender address
    to: correoUsuario, // list of receivers
    subject: "Hola, "+usuario.nombreUsuario, // Subject line
    //text: "Hello world?", // plain text body
    html: "<p>Entra en el enlace para verificar la cuenta: <a href='http://localhost:3000/verificar?token="+usuario.signInVerification+"'>Link</a></p>", // html body
  }, (error, response)=>{
      if(error){
          console.log(error)
      }else{
        console.log(response)
      }
  });
}
/*var Imap = require('node-imap'),
    inspect = require('util').inspect;

var imap = new Imap({
  user: 'airlitygti@gmail.com',
  password: 'pruebasgti',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    var f = imap.seq.fetch('1:3', {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
      struct: true
    });
    f.on('message', function(msg, seqno) {
      console.log('Message #%d', seqno);
      var prefix = '(#' + seqno + ') ';
      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
          console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
        });
      });
      msg.once('attributes', function(attrs) {
        console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
      });
      msg.once('end', function() {
        console.log(prefix + 'Finished');
      });
    });
    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });
    f.once('end', function() {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();*/