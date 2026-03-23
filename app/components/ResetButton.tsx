"use client";

type ResetButtonProps = {
  onReset: () => void;
  disabled?: boolean;
};

export default function ResetButton({ onReset, disabled = false }: ResetButtonProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onReset}
      disabled={disabled}
    >
      New Game
    </button>
  );
}
