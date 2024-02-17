const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');
const fs = require('fs');
var cron = require('node-cron');

// initial instance
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LocalAuth()
});

client.on('authenticated', (session) => {
    console.log('Authenticated');
    // Save the session object to use it later for multi-device support
  });
client.initialize();

// initialize whatsapp and the example event
client.on('message', msg => {
    if (msg.body == 'P') {
        msg.reply('Assalamualaikum. Ga jawab dosa');
    } else if (msg.body == 'Waalaikum salam') {
      msg.reply('Cakep');
    } else if (msg.body == 'Gambar') {
    	//kirim file gambar
    	msg.reply(MessageMedia.fromFilePath('./files/Capture.png'));
    } else if (msg.body == 'File') {
    	//kirim file gambar
    	msg.reply(MessageMedia.fromFilePath('./files/whatsapp bot.txt'));
    } else if (msg.body == 'Doc') {
      //kirim file gambar
      msg.reply(MessageMedia.fromFilePath('./files/Kuota M2M.xlsx'));
    } else if (msg.body == 'Start') {
      msg.reply('Selamat datang di Whatsapp Bot by Development Fattu');
      msg.reply('Ketik kata-kata berikut : ');
      msg.reply('Gambar');
      msg.reply('File');
      //msg.reply('Doc');
    } else if (msg.body == 'Cek') {
    	msg.reply(MessageMedia.fromFilePath('./files/Capture.png'));
    } else if (msg.body == 'Set') {
      //kirim file gambar
      msg.reply(MessageMedia.fromFilePath('./files/desain web.docx'));
    }
    console.log(`Message received from ${msg.from}: ${msg.body}`);

});

// socket connection
var today  = new Date();
var now = today.toLocaleString();
io.on('connection', (socket) => {
  socket.emit('message', `${now} Connected`);
  console.log('Connected');

  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit('message', `${now} QR Code received`);
      console.log('qr');
    });
  });

  client.on('ready', () => {
    socket.emit('message', `${now} WhatsApp is ready!`);
  });

  client.on('authenticated', (session) => {
    socket.emit('message', `${now} Whatsapp is authenticated!`);
    console.log('authenticated');
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', `${now} Auth failure, restarting...`);
  });

  client.on('disconnected', function() {
    socket.emit('message', `${now} Disconnected`);
    console.log('disconnected');
  });
});

//kirim notif part 2
let whatsappNumbers = [
    //'6285780400040-1591334292@g.us',
    '6285161300036@c.us'
  ];
  
  let notificationMessages = [
  `*BoT Aktif*`
    
  ];

cron.schedule('0 9 * * *', () => { 
    client.sendMessage(whatsappNumbers, `${notificationMessages}`);
    console.log("Sukses ");
  
  });

// send message
app.get('/send-seoa', async (req, res) => {
    //let number = [ '120363145007519334@g.us', ];
    let number = [ '6285780400040-1591334292', ];
    //let number = [ '6285161300036@c.us', ];
    const message = req.query.message;
  
    client.sendMessage(number, message).then(respone => {
      res.status(200).json({
        status: true,
        response: respone
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });

app.get('/send-sast', async (req, res) => {
    let number = [ '120363195232341511', ];
    const message = req.query.message;
  
    client.sendMessage(number, message).then(respone => {
      res.status(200).json({
        status: true,
        response: respone
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });

app.get('/send-bwa', async (req, res) => {
    let number = [ '120363183036242315', ];
    const message = req.query.message;
  
    client.sendMessage(number, message).then(respone => {
      res.status(200).json({
        status: true,
        response: respone
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });

app.get('/logout', (req, res) => {
    if (client) {
        client.destroy();
        res.send('Logged out');
        stepThru();
    } else {
        res.send('Not logged in');
    }
});

server.listen(PORT, () => {
  console.log('App listen on port ', PORT);
});