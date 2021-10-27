import Connection from './index.js';

const con = new Connection();
let counter = 0;

const getBookHeader = (data) => {
  console.log('[header] ', JSON.stringify(data), '\n\n\n')
}

const getBookUpdates = (data) => {
  console.log('[feed] ', JSON.stringify(data))
}

const go = async () => {

  console.log(new Date, 'connecting...');
  await con.connect();
  console.log(new Date, 'connected');
  const channelId = await con.subscribe('XMR/EUR', 'book', { depth: 10 });
  console.log(new Date, `subscribed: ${channelId}`);

  con.once('channel:' + channelId, (data) => {
    getBookHeader(data)
    con.on('channel:' + channelId, (data) => {
      getBookUpdates(data)
    })
  })

}

go();