export default function ConfirmModal({ title, children, onClose, onConfirm, confirmText = "Xác nhận", cancelText = "Hủy" }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 shadow-2xl border border-gray-800">
        <div className="flex justify-between mb-5">
          <h2 className="font-bold text-xl">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="text-gray-300">
          {children}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-800 px-4 py-3 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
