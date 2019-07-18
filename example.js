const Connection = require('./');

const con = new Connection();

const go = async() => {

  console.log(new Date, 'connecting...');
  await con.connect();
  console.log(new Date, 'connected');
  const channelId = await con.subscribe('XBT/USD', 'book', {depth: 100});
  console.log(new Date, 'subscribed');
  con.on('channel:' + channelId, console.log);
}

go();