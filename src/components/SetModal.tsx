import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { StudySet, Course } from '../types';

interface SetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  courses: Course[];
  initialSet?: StudySet | null;
  defaultCourseId?: string | null;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#DC2626', // Red
  '#0284C7', // Sky
  '#059669', // Emerald
  '#7C3AED', // Purple
  '#EA580C', // Orange
];

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
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?.id || '');
  const [color, setColor] = useState('#4F46E5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSet) {
      setTitle(initialSet.title);
      setDescription(initialSet.description);
      setCourseId(initialSet.courseId);
      setColor(initialSet.color || '#4F46E5');
    } else {
      setTitle('');
      setDescription('');
      setCourseId(defaultCourseId || courses[0]?.id || '');
      setColor('#4F46E5');
    }
    setError(null);
  }, [initialSet, defaultCourseId, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bộ thẻ.');
      return;
    }
    if (!courseId) {
      setError('Vui lòng chọn học phần tương ứng.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      courseId,
      color,
      icon: 'Layers',
      questions: initialSet ? initialSet.questions : []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialSet ? 'Chỉnh sửa bộ thẻ' : 'Tạo bộ thẻ ôn tập mới'}
              </h3>
              <p className="text-xs text-slate-500">
                Nhóm các câu hỏi ôn tập theo chuyên đề hoặc chương
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề bộ thẻ *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Chương 2: Phép biện chứng duy vật"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thuộc học phần nào *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả bộ thẻ
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Tổng hợp các câu trắc nghiệm trọng tâm thi giữa kỳ..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Màu sắc thẻ
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
            >
              {initialSet ? 'Lưu thay đổi' : 'Tạo bộ thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
