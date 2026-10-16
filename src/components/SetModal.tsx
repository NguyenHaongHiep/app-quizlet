import React, { useState, useEffect } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';
import { StudySet, Course } from '../types';

interface SetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'questions'>) => void;
  courses: Course[];
  initialSet?: StudySet | null;
  defaultCourseId?: string | null;
}

export const SetModal: React.FC<SetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  initialSet,
  defaultCourseId
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSet) {
      setTitle(initialSet.title);
      setDescription(initialSet.description);
      setCourseId(initialSet.courseId);
    } else {
      setTitle('');
      setDescription('');
      setCourseId(defaultCourseId || courses[0]?.id || '');
    }
    setError(null);
  }, [initialSet, defaultCourseId, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên bộ thẻ học tập.');
      return;
    }
    if (!courseId && courses.length > 0) {
      setError('Vui lòng chọn học phần tương ứng.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      courseId: courseId || 'AUTO_DEFAULT'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1F28]/35 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        style={{
          boxShadow: '0 24px 60px rgba(91, 45, 255, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
        className="bg-white rounded-3xl border border-black/[0.06] w-full max-w-md overflow-hidden my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.05] flex items-center justify-between bg-[#FCFAF6]">
          <div className="flex items-center gap-3">
            <div
              style={{ boxShadow: '0 6px 16px rgba(91, 45, 255, 0.25)' }}
              className="w-9 h-9 rounded-2xl bg-[#5B2DFF] text-white flex items-center justify-center shrink-0"
            >
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-flow-serif text-lg font-normal text-[#1F1F28]">
                {initialSet ? 'Chỉnh sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Bộ câu hỏi trắc nghiệm & flashcard ôn thi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-black/5 text-[#8E8E93] hover:text-[#1F1F28] flex items-center justify-center transition-colors cursor-pointer border border-black/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
              Tên bộ thẻ học tập *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Từ vựng Tuần 1, Ôn thi Giữa kỳ..."
              className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
              Học phần trực thuộc *
            </label>
            {courses.length === 0 ? (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl text-xs text-sky-800 dark:text-sky-300">
                <span className="font-semibold">Tự động khởi tạo:</span> Tài khoản của bạn chưa có môn học nào. Hệ thống sẽ tự động tạo học phần <code className="font-mono bg-sky-100 dark:bg-sky-900 px-1 rounded">[GEN101] Học phần Chung</code> để gắn bộ thẻ này vào.
              </div>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20 cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
              Mô tả ngắn
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt nội dung trọng tâm của bộ câu hỏi này..."
              className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.05]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-[#1F1F28] bg-[#FCFAF6] hover:bg-[#F3EFE6] border border-black/[0.06] rounded-full transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="px-6 py-2.5 text-xs font-semibold text-white rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {initialSet ? 'Lưu thay đổi' : 'Tạo bộ thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
