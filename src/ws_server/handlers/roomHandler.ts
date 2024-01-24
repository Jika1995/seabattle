import WebSocket from "ws";
import { Player, Room } from '../utils/types.js';
import { players, rooms } from "../db/db.js";

type RoomData = {
  indexRoom: number
};

export const createRoom = (ws: WebSocket) => {
  const authorPlayer = players.find((player) => player.ws === ws);
  const roomIdx = rooms.length + 1;

  const newRoom: Room = {
    roomId: roomIdx,
    roomUsers: [
      {
        name: authorPlayer.name,
        index: authorPlayer.index
      }
    ]
  }

  rooms.push(newRoom);

  const data = {
    type: "create_room",
    data: "",
    id: 0
  };

  ws.send(JSON.stringify(data));

  updateRoom();
}

export const addToRoom = (data1: string, ws: WebSocket) => {
  const roomData = JSON.parse(data1)

  const player = players.find((player) => player.ws === ws);

  const room = rooms.find((room) => room.roomId === roomData.indexRoom);

  checkAuthor(room, player);

  console.log(room, room.roomUsers);

  if (room.roomUsers.length > 1) return;

  room.roomUsers.push(
    {
      name: player.name,
      index: player.index
    }
  )

  const data = {
    type: "add_user_to_room",
    data: JSON.stringify({
      indexRoom: room.roomId
    }),
    id: 0
  };

  ws.send(JSON.stringify(data));

  updateRoom();
  addGame(room);
}

export const checkAuthor = (room: Room, player: Player) => {
  const isAuthor = room.roomUsers.find(item => player.name === item.name);
  if (isAuthor) return
}

export const addGame = (room: Room) => {

  room.roomUsers.map((user) => {

    players.map((player) => {
      if (player.name === user.name) {
        const data = {
          type: "create_game",
          data: JSON.stringify({
            idGame: room.roomId,
            idPlayer: player.index,
          }),
          id: 0
        };
        player.ws.send(JSON.stringify(data))
      }
    })
  })

}

export const updateRoom = () => {
  const roomWithOneUser = rooms.filter((room) => room.roomUsers.length === 1);

  const data = {
    type: "update_room",
    data: JSON.stringify(roomWithOneUser),
    id: 0
  };

  players.map((user) => user.ws.send(JSON.stringify(data)))
}