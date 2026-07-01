export default function Pagination({ page, totalPages, setPage }) {
    return (
        <div className="flex gap-3 mt-5 items-center">
            <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="bg-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
                Prev
            </button>

            <span className="text-sm">
                {page + 1} / {totalPages}
            </span>

            <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
}