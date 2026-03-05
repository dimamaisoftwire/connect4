"use client";

import { GameState } from "../lib/connect4Controller";

type GameControlsProps = {
  gameState: GameState;
  saveMessage: string;
  isSaving: boolean;
  onNewGame: () => void;
  onSaveGame: () => void;
};

export default function GameControls({
  gameState,
  saveMessage,
  isSaving,
  onNewGame,
  onSaveGame,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <button
        onClick={onNewGame}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
      >
        New Game
      </button>
      {gameState !== "ongoing" && (
        <button
          onClick={onSaveGame}
          disabled={isSaving}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isSaving ? "Saving..." : "Save Result"}
        </button>
      )}
      {saveMessage && (
        <p
          className={`text-center text-sm ${saveMessage.startsWith("✓") ? "text-green-600" : "text-red-600"}`}
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}
