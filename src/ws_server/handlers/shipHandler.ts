import { ShipPosition, ShipType } from "../utils/types"
import WebSocket from 'ws';
import { games, players } from '../db/db.js';

type ShipData = {
  gameId: number,
  ships: [
    {
      position: ShipPosition,
      direction: boolean,
      length: number,
      type: ShipType
    }
  ],
  indexPlayer: number,
}

export const startGame = (data1: string, ws: WebSocket) => {
  const shipData = JSON.parse(data1)

  const game = games.find((game) => game.gameId === shipData.gameId);

  if (!game) {
    const authorPlayer = players.find((player) => player.ws === ws);
    authorPlayer.ships = shipData.ships
    const newGame = {
      gameId: shipData.gameId,
      players: [authorPlayer]
    }

    games.push(newGame)
  } else {
    const secondPlayer = players.find((player) => player.ws === ws);
    secondPlayer.ships = shipData.ships;
    game.players.push(secondPlayer);

    if (game.players.length !== 2) return;

    const whoBegins = Math.round(Math.random() + 1);

    game.players.map((player) => {
      const currentPlayer = players.find((user) => user.name === player.name);
      game.turn = whoBegins;
      const data = {
        type: "start_game",
        data: JSON.stringify({
          ships: JSON.stringify(shipData.ships),
          currentPlayerIndex: currentPlayer.index
        }),
        id: 0
      }

      currentPlayer.ws.send(JSON.stringify(data));
      sendTurn(whoBegins, currentPlayer.ws);
    })
  }

}

export const sendTurn = (playerIdx: number, ws: WebSocket) => {
  const data = {
    type: "turn",
    data: JSON.stringify({ currentPlayer: playerIdx }),
    id: 0
  };

  ws.send(JSON.stringify(data))
}