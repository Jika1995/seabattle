import { games } from '../db/db.js';
import { Ship } from '../utils/types.js';
import { sendTurn } from './shipHandler.js';
import WebSocket from 'ws';
import { sendWinnersTable } from './playerHandler.js';

type AttackData = {
  gameId: number,
  x: number,
  y: number,
  indexPlayer: number
};

export const attack = (data1: string) => {
  const attackData = JSON.parse(data1)

  const shotResult = getTurn(attackData.gameId, attackData.indexPlayer, attackData.x, attackData.y);

  const { status, whoShots, currentGame, isAllKilled, winnerName } = shotResult;

  const data = {
    type: "attack",
    data: JSON.stringify({
      position: {
        x: attackData.x,
        y: attackData.y,
      },
      currentPlayer: attackData.indexPlayer,
      status,
    }),
    id: 0,
  };

  currentGame.turn = whoShots;

  currentGame.players.forEach((player) => {
    player.ws.send(JSON.stringify(data));
    if (isAllKilled) {
      finishGame(attackData.indexPlayer, player.ws);
      sendWinnersTable()
      return
    }
    sendTurn(whoShots, player.ws);
  });
}

export const randomAttack = (data1: string) => {
  const attackData = JSON.parse(data1)

  const x: number = Math.round(Math.random() * 9);
  const y: number = Math.round(Math.random() * 9);

  const shotResult = getTurn(
    attackData.gameId,
    attackData.indexPlayer,
    x,
    y,
  );
  const { status, whoShots, currentGame, isAllKilled, winnerName } = shotResult;

  const data = {
    type: "attack",
    data: JSON.stringify({
      position: {
        x,
        y,
      },
      currentPlayer: attackData.indexPlayer,
      status,
    }),
    id: 0,
  }

  currentGame.turn = whoShots;

  currentGame.players.forEach((player) => {
    player.ws.send(JSON.stringify(data));
    if (isAllKilled) {
      finishGame(attackData.indexPlayer, player.ws);
      sendWinnersTable()
      return
    }
    sendTurn(whoShots, player.ws);
  });

};

export const getTurn = (gameId: number, playerIdx: number, x: number, y: number) => {
  let status = ''

  const currentGame = games.find((game) => game.gameId === gameId);
  const currentPlayer = currentGame.players.find((player) => player.index === playerIdx);

  const enemy = currentGame.players.find((player) => player.index !== playerIdx);

  if (currentGame.turn !== currentPlayer.index) return

  if (!currentPlayer.enemyCoor) {
    const allEnemyPositions = getShipsCoords(enemy.ships);
    currentPlayer.enemyCoor = allEnemyPositions
  };

  const isAimed = currentPlayer.enemyCoor.find((ship) => {
    return ship.positions.find((coord) => { return coord.x === x && coord.y === y })
  });

  if (!isAimed) {
    status = 'miss'
  } else if (isAimed.toHit === 1) {
    status = 'killed'

    const killedShipPosition = isAimed.positions.find((coord) => coord.x === x && coord.y === y);

    killedShipPosition.killed = true
    isAimed.toHit = isAimed.toHit - 1
  } else {
    isAimed.toHit = isAimed.toHit - 1
    status = 'shot'
  };

  const whoShots = status === 'killed' || status === 'shot' ?
    currentPlayer.index : enemy.index

  const isAllKilled = currentPlayer.enemyCoor.every((ship) => ship.toHit === 0);
  let winnerName = '';
  if (isAllKilled) {
    winnerName = currentPlayer.name
    currentPlayer.wins++
  }

  return { status, whoShots, currentGame, isAllKilled, winnerName }
}

export const getShipsCoords = (enemyShips: Ship[]) => {
  const coorData = []

  enemyShips.map((ship) => {

    if (ship.length === 1) {
      coorData.push({ toHit: 1, positions: [ship.position] })
    } else {
      const shipCoor = [];
      const shipBeginCoor = ship.position;

      shipCoor.push(shipBeginCoor);

      for (let i = 1; i < ship.length; i++) {

        if (ship.direction === false) {
          const shipPartCoor = { x: ship.position.x + i, y: ship.position.y }
          shipCoor.push(shipPartCoor)
        } else {
          const shipPartCoor = { x: ship.position.x, y: ship.position.y + i };
          shipCoor.push(shipPartCoor)
        }
      };

      coorData.push({
        toHit: shipCoor.length,
        positions: shipCoor
      })
    }
  });

  coorData.map((position) => console.log('position', position))
  return coorData
}

export const finishGame = (playerIdx: number, ws: WebSocket) => {

  const data = {
    type: "finish",
    data: JSON.stringify({ winPlayer: playerIdx }),
    id: 0
  };

  ws.send(JSON.stringify(data))
}