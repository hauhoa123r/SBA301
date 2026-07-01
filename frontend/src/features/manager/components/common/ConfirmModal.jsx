export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-6 w-[500px]">
        <div className="flex justify-between mb-5">
          <h2 className="font-bold text-xl">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}