import { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Save } from 'lucide-react';
import axiosInstance from '../../../../../../api/axios';

export default function DocumentModal({ isOpen, onClose, lessonId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newDoc, setNewDoc] = useState({ title: '', file_url: '' });
  const [error, setError] = useState(null);

  // Simulated fetch of documents for the lesson when modal opens
  useEffect(() => {
    if (isOpen && lessonId) {
      const fetchDocuments = async () => {
        try {
          setLoading(true);
          // Assuming an endpoint exists or will exist:
          // const res = await axiosInstance.get(`/lessons/${lessonId}/documents`);
          // setDocuments(res.data);
          
          // For now, simulate empty or mock data since we don't know the exact API
          setDocuments([]); 
          setError(null);
        } catch (err) {
          setError('Không thể tải tài liệu');
        } finally {
          setLoading(false);
        }
      };
      fetchDocuments();
    }
  }, [isOpen, lessonId]);

  if (!isOpen) return null;

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.title.trim() || !newDoc.file_url.trim()) {
      setError('Cần nhập tiêu đề và URL tệp');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      // API call to add document
      // const res = await axiosInstance.post(`/lessons/${lessonId}/documents`, newDoc);
      // setDocuments([...documents, res.data]);
      
      // Simulation
      const addedDoc = { id: Date.now(), ...newDoc };
      setDocuments([...documents, addedDoc]);
      setNewDoc({ title: '', file_url: '' });
    } catch (err) {
      setError('Không thể thêm tài liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      // API call to delete document
      // await axiosInstance.delete(`/lessons/${lessonId}/documents/${docId}`);
      
      // Simulation
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (err) {
      setError('Không thể xóa tài liệu');
    }
  };

  const inputCls =
    'w-full px-4 py-2 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-2xl shadow-black/40 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-borderSoft flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-info/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-info" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-textPrimary">Quản lý tài liệu</h2>
              <p className="text-xs text-brand-mutedText/60 mt-0.5">Thêm hoặc xóa tài nguyên cho bài học này</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-mutedText hover:text-brand-textPrimary hover:bg-brand-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          
          {error && (
            <div className="p-3 bg-status-danger/10 text-status-danger text-sm rounded-lg border border-status-danger/20">
              {error}
            </div>
          )}

          {/* Document List */}
          <div>
            <h3 className="text-sm font-semibold text-brand-textSecondary mb-3">Tài liệu đã đính kèm</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-info border-t-transparent" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-brand-borderSoft rounded-lg bg-brand-dark/20 text-brand-mutedText/60 text-sm">
                Chưa có tài liệu nào được đính kèm.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-brand-dark/40 rounded-lg border border-brand-borderSoft/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-brand-info flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-brand-textPrimary truncate">{doc.title}</p>
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-brand-accentSoft hover:underline truncate block">
                          {doc.file_url}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 text-brand-mutedText hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Form */}
          <div className="border-t border-brand-borderSoft pt-5">
            <h3 className="text-sm font-semibold text-brand-textSecondary mb-3">Thêm tài liệu mới</h3>
            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Tiêu đề tài liệu"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="URL tệp hoặc liên kết"
                  value={newDoc.file_url}
                  onChange={(e) => setNewDoc({ ...newDoc, file_url: e.target.value })}
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newDoc.title.trim() || !newDoc.file_url.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-brand-surface hover:bg-brand-elevated text-brand-textPrimary rounded-lg border border-brand-borderSoft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-textPrimary border-t-transparent" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Thêm tài liệu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
