const express = require('express')
const app = express()
const port = 3000;


var telegram = require('telegram-bot-api');
var fs = require('fs');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ chats: [] })
    .write()


app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

const WebSocket = require('ws');

const ws = new WebSocket('wss://ws.blockchain.info/inv');

ws.on('open', function open() {
  ws.send('{"op":"unconfirmed_sub"}');
});

ws.on('message', function incoming(data) {
  data  = JSON.parse(data);

  for (let index = 0; index < data.x.out.length; index++) {
      const o = data.x.out[index];
      if(o.value > 10000000000) {
          let val = o.value / 100000000;
          let str = `https://www.blockchain.com/btc/address/${o.addr}`;
          let x = str + "\n\t" + val.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          console.log(x);
          sendMessage(x);
      }
  }
 
});

var api = new telegram({
  token: '1276181578:AAGlO_oMEH3QPrVgzgr1v2H7TECZTG5pYH0',
  updates: {
      enabled: true
  }
});

sendMessage = function(text){
  var items = db.get('chats')
      .map('id')
      .value()
  for (var i in items) {
      api.sendMessage({
          chat_id: items[i],
          text: text
      }, {
          "parse_mode": 'HTML'
      });
  }

}
api.on('message', function (message) {
  console.log("hereererer");

  var id = db.get('chats')
      .find({ id: message.chat.id })
      .value()
  if (!id)
      db.get('chats')
          .push({ id: message.chat.id })
          .write()


});