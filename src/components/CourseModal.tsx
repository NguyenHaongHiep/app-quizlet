import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { Course } from '../types';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Course, 'id' | 'createdAt'>) => void;
  initialCourse?: Course | null;
}

const PRESET_COLORS = [
  '#5B2DFF', // Lilac Violet (Primary)
  '#C8B4FF', // Soft Lilac
  '#059669', // Emerald
  '#0284C7', // Sky Blue
  '#D97706', // Amber
  '#DC2626', // Crimson Red
  '#EA580C', // Warm Orange
  '#0D9488', // Teal
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('Học kỳ 1 - 2026');
  const [color, setColor] = useState('#5B2DFF');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCourse) {
      setCode(initialCourse.code);
      setName(initialCourse.name);
      setDescription(initialCourse.description);
      setSemester(initialCourse.semester || 'Học kỳ 1 - 2026');
      setColor(initialCourse.color || '#5B2DFF');
    } else {
      setCode('');
      setName('');
      setDescription('');
      setSemester('Học kỳ 1 - 2026');
      setColor('#5B2DFF');
    }
    setError(null);
  }, [initialCourse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Vui lòng nhập mã học phần và tên học phần.');
      return;
    }

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      semester,
      color
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
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-flow-serif text-lg font-normal text-[#1F1F28]">
                {initialCourse ? 'Chỉnh sửa học phần' : 'Thêm học phần mới'}
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Phân loại các bộ thẻ theo môn học đại học
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
              Mã học phần *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: ENG201, PHI101, MAT102"
              className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
              Tên học phần *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tiếng Anh Học Thuật, Triết học Mác - Lênin"
              className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
              Mô tả tóm tắt
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục tiêu môn học, giáo trình, giảng viên..."
              className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
                Học kỳ
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Học kỳ 1 - 2026"
                className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
                Màu sắc nhận diện
              </label>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'scale-110 ring-2 ring-offset-2 ring-[#5B2DFF]' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
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
              {initialCourse ? 'Cập nhật học phần' : 'Tạo học phần mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
