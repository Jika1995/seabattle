import WebSocket from "ws";

export type Player = {
  name: string;
  index: number;
  password: string;
  ws: WebSocket;
  ships?: Ship[];
  enemyCoor?: Coordinate[];
  wins: number;
}

export type Coordinate = {
  toHit: number;
  positions: Position[];
}

export type Position = {
  x: number;
  y: number;
  killed: boolean;
}

export type Room = {
  roomId: number;
  roomUsers: [
    {
      name: string;
      index: number;
    }
  ]
}

export type Game = {
  gameId: number;
  players: Player[];
  turn?: number;
};

export type ShipType = "small" | "medium" | "large" | "huge"

export type ShipPosition = {
  x: number;
  y: number
}

export type Ship = {
  position: ShipPosition;
  direction: boolean;
  length: number,
  type: ShipType,
}
