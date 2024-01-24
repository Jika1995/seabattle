import { WebSocket } from 'ws';
import { players, rooms } from '../db/db.js';
import { Player } from '../utils/types.js';

interface PlayerData {
  name: string;
  password: string;
}

export const checkPlayer = (playerData: PlayerData) => {

  const errorObj = {
    error: false,
    text: ''
  };

  const player = players.find((player) => player.name === playerData.name);

  player ? (errorObj.error = true, errorObj.text = 'Player with this username already exists') : null;

  return errorObj
}

export const register = (data1: string, ws: WebSocket) => {

  const playerData = JSON.parse(data1)
  const errorObj = checkPlayer(playerData);

  let playerIdx = null;

  playerIdx = players.findIndex((player) => player.name === playerData.name);

  if (playerIdx < 0) {
    playerIdx = players.length + 1;

    const newPlayer: Player = {
      name: playerData.name,
      index: playerIdx,
      password: playerData.password,
      ws: ws,
      wins: 0,
    }

    players.push(newPlayer);

  };

  const data = {
    type: "reg",
    data: JSON.stringify({
      name: playerData.name,
      index: playerIdx,
      error: errorObj.error,
      errorText: errorObj.text
    }),
    id: 0
  };

  ws.send(JSON.stringify(data));

}

export const logout = (ws: WebSocket) => {
  const dissUser = players.find((player) => player.ws === ws);
  if (!dissUser) return;

  rooms.forEach((room) => {
    const exitThisRoom = room.roomUsers.find((player) => player.name === dissUser.name);
    if (!exitThisRoom) return;

    const currentWinner = room.roomUsers.find((player) => player.name !== dissUser.name);
    const winnerPlayer = players.find((player) => player.name === currentWinner.name);
    winnerPlayer.wins++
  })

  sendWinnersTable()
};

export const sendWinnersTable = () => {
  const getWinnersTable = players.map((user) => {
    return { name: user.name, wins: user.wins };
  });

  const data = {
    type: "update_winners",
    data: JSON.stringify(getWinnersTable),
    id: 0,
  };

  players.forEach((user) => user.ws.send(JSON.stringify(data)));
};

// export const updateWinners = (winnersName: string, ws: WebSocket) => {
//   const winnerPlayer = players.find((player) => player.name === winnersName);
//   console.log('updateWinners', winnerPlayer)
//   winnerPlayer.wins++

//   sendWinnersTable();
// };

