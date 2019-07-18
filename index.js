const WebSocket = require('ws');
const crypto = require('crypto');
const EventEmitter = require('events');

class Connection extends EventEmitter {

  constructor(url = 'wss://ws.kraken.com') {
    super();

    this.url = url;
    this.connected = false;

    this.pairs = {};

    this.lastMessageAt = 0;
  }

  disconnect() {
    this.ws.disconnect();
  }

  connect() {

    let readyHook;
    this.onOpen = new Promise(r => readyHook = r);

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.connected = true;
      readyHook();
    }

    this.ws.onerror = e => {
      console.log(new Date, '[KRAKEN] error', e);
    }
    this.ws.onclose = e => {
      console.log(new Date, '[KRAKEN] close', e);
    }

    this.ws.onmessage = this.handleMessage;

    return this.onOpen;
  }

  handleMessage = e => {
    this.lastMessageAt = +new Date;

    const payload = JSON.parse(e.data);

    if(Array.isArray(payload)) {
      this.emit('channel:' + payload[0], payload);
    } else {

      if(payload.event === 'subscriptionStatus' && payload.status === 'subscribed') {

        if(this.pairs[payload.pair]) {
          this.pairs[payload.pair].id = payload.channelID;
          this.pairs[payload.pair].onReady(payload.channelID);
        } else {
          console.log(new Date, '[KRAKEN] received subscription event for unknown subscription', payload);
        }

        return;
      }

      this.emit('message', payload);
    }
  }

  subscribe(pair, subscription, options) {

    let registration;
    if(this.pairs[pair] && this.pairs[pair].subscriptions.includes(subscription)) {
      console.log(new Date, '[KRAKEN] refusing to subscribe to subscription twice', {pair, subscription});
      return;
    }

    let hook;
    let onReady = new Promise(r => hook = r);

    if(!this.pairs[pair]) {
      this.pairs[pair] = {
        subscriptions: [],
        onReady: hook
      };
    }

    this.pairs[pair].subscriptions.push(subscription);

    this._subscribe(pair, subscription, options);

    return onReady;
  }

  _subscribe(pair, subscription, options = {}) {
    this.ws.send(JSON.stringify(
      {
        "event": "subscribe",
        "pair": [ pair ],
        "subscription": {
          "name": subscription,
          ...options
        }
      }
    ));
  }

}

module.exports = Connection;