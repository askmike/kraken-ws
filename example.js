const Connection = require('./');

const con = new Connection();

const go = async() => {

  console.log(new Date, 'connecting...');
  await con.connect();
  console.log(new Date, 'connected');
  const channelId = await con.subscribe('XMR/EUR', 'book', {depth: 10});
  console.log(new Date, 'subscribed');
  con.on('channel:' + channelId, (data) => console.log(JSON.stringify(data)));
}

go();