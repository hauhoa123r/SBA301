export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center py-20 gap-3 text-red-400">
      <p>{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-gray-800"
      >
        Thử lại
      </button>
    </div>
  );
}