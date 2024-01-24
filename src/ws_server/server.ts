import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { attack, randomAttack } from './handlers/gameHandler.js';
import { logout, register } from './handlers/playerHandler.js';
import { addToRoom, createRoom } from './handlers/roomHandler.js';
import { startGame } from './handlers/shipHandler.js';

const wss = new WebSocketServer({ port: 3000 }, () => {
  console.log(`Websocket Server started on 3000`)
});

wss.on('connection', function connection(ws: WebSocket) {
  ws.on('message', function incoming(message: string) {
    try {
      const { type, data } = JSON.parse(message);

      switch (type) {
        case 'reg':
          register(data, ws);
          // console.log(data, ws);
          break;
        case 'create_room':
          createRoom(ws);
          break;
        case 'add_user_to_room':
          addToRoom(data, ws)
          break;
        case 'add_ships':
          startGame(data, ws);
          break;
        case 'attack':
          // console.log('server data attack', data)
          attack(data);
          break;
        case 'randomAttack':
          randomAttack(data);
          break;
        default:
          console.log(`not existing message: ${ type }`);
          break;
      };
    } catch (err) {
      console.error(`error: ${ err }`)
    }
  });

  ws.on('close', () => {
    logout(ws)
  });
});