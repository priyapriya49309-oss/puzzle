
import React from 'react';
import { Tile } from '../types';

interface TileComponentProps {
  tile: Tile;
  gridSize: number;
  imageUrl: string;
  onClick: (pos: number) => void;
  disabled: boolean;
}

export const TileComponent: React.FC<TileComponentProps> = ({ 
  tile, 
  gridSize, 
  imageUrl, 
  onClick,
  disabled
}) => {
  if (tile.isEmpty) {
    return (
      <div 
        className="w-full pt-[100%] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700"
      />
    );
  }

  // Calculate background position
  const row = Math.floor(tile.correctPos / gridSize);
  const col = tile.correctPos % gridSize;
  const percentage = 100 / (gridSize - 1);
  const posX = col * percentage;
  const posY = row * percentage;

  return (
    <button
      onClick={() => onClick(tile.currentPos)}
      disabled={disabled}
      className="puzzle-tile relative w-full pt-[100%] rounded-lg overflow-hidden group shadow-lg ring-1 ring-white/10 hover:ring-white/30 active:scale-95 cursor-pointer disabled:cursor-default"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${posX}% ${posY}%`,
      }}
    >
      <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors duration-200" />
      {/* Optional: Position Helper for Debug/Hint */}
      {/* <span className="absolute top-1 left-1 bg-black/50 text-[10px] px-1 rounded">{tile.correctPos + 1}</span> */}
    </button>
  );
};
