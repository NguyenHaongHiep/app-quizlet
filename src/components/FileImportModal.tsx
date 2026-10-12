import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAppState } from '../lib/app-state';
import {
  parseUploadedFile,
  ParsedQuestionResult,
  downloadExcelTemplate,
  downloadCsvTemplate,
  downloadJsonTemplate
} from '../lib/file-parser';
import { Question } from '../types';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSetId?: string | null;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  targetSetId
}) => {
  const { studySets, courses, addBulkQuestionsToSet, addStudySet, setActiveSetId } = useAppState();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedQuestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chọn bộ thẻ đích hoặc tạo mới
  const [destinationMode, setDestinationMode] = useState<'existing' | 'new'>(targetSetId ? 'existing' : 'new');
  const [selectedSetId, setSelectedSetId] = useState<string>(targetSetId || (studySets[0]?.id || ''));
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetCourseId, setNewSetCourseId] = useState<string>(courses[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'guide'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await parseUploadedFile(file);
      if (result.questions.length === 0) {
        throw new Error('Không trích xuất được câu hỏi nào từ file. Hãy kiểm tra lại tiêu đề cột.');
      }
      setParseResult(result);
      // Tự động gợi ý tên bộ thẻ mới từ tên file
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewSetTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xử lý file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.questions.length === 0) return;

    if (destinationMode === 'new') {
      const title = newSetTitle.trim() || `Bộ câu hỏi từ ${parseResult.fileName}`;
      const newSet = addStudySet({
        title,
        description: `Nhập từ file ${parseResult.fileName} (${parseResult.questions.length} câu hỏi)`,
        courseId: newSetCourseId || courses[0]?.id || 'course-default',
        color: '#4F46E5',
        questions: parseResult.questions
      });
      setActiveSetId(newSet.id);
    } else {
      if (!selectedSetId) {
        setErrorMessage('Vui lòng chọn bộ thẻ cần thêm câu hỏi.');
        return;
      }
      addBulkQuestionsToSet(selectedSetId, parseResult.questions);
      setActiveSetId(selectedSetId);
    }

    onClose();
    // Reset state
    setParseResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Nhập câu hỏi từ File bên ngoài
              </h2>
              <p className="text-xs text-slate-500">
                Hỗ trợ Excel (.xlsx, .xls), CSV (.csv), JSON và văn bản (.txt)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tải lên &amp; Xem trước dữ liệu
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Hướng dẫn định dạng &amp; Tải file mẫu</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeTab === 'guide' ? (
            <div className="space-y-6 text-sm">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-slate-700">
                <h4 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Nguyên lý tự động nhận diện cột (Smart Parser)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ thống tự động phát hiện các tiêu đề cột tiếng Việt hoặc tiếng Anh (không phân biệt hoa thường). 
                  Bạn có thể chuẩn bị file theo cấu trúc 4 đáp án đầy đủ hoặc cấu trúc đơn giản 2 cột Thuật ngữ - Định nghĩa.
                </p>
              </div>

              {/* Template download cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Tải file mẫu định dạng chuẩn (Template Download)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={downloadExcelTemplate}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 flex items-start gap-3 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Mẫu Excel (.xlsx)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Đầy đủ 4 lựa chọn, giải thích &amp; mẹo nhớ</div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Tải về máy
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={downloadCsvTemplate}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/30 flex items-start gap-3 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-700 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Mẫu CSV (.csv)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Chuẩn UTF-8 mở trên mọi hệ điều hành</div>
                      <div className="text-[11px] text-sky-600 font-medium mt-1.5 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Tải về máy
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={downloadJsonTemplate}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-violet-500 bg-white hover:bg-violet-50/30 flex items-start gap-3 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-violet-100 text-violet-700 group-hover:scale-105 transition-transform">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Mẫu JSON (.json)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Dành cho sinh viên CNTT hoặc tích hợp</div>
                      <div className="text-[11px] text-violet-600 font-medium mt-1.5 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Tải về máy
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column specifications */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 font-semibold text-xs text-slate-700 border-b border-slate-200">
                  Bảng tên cột được hỗ trợ trong Excel / CSV
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 flex items-start gap-4">
                    <span className="font-semibold text-slate-900 w-32 shrink-0">Câu hỏi / Đề bài *</span>
                    <span className="text-slate-600">Tiêu đề cột: <code>Câu hỏi</code>, <code>Question</code>, <code>Thuật ngữ</code>, <code>Term</code></span>
                  </div>
                  <div className="px-4 py-2.5 flex items-start gap-4">
                    <span className="font-semibold text-slate-900 w-32 shrink-0">Lựa chọn A, B, C, D</span>
                    <span className="text-slate-600">Tiêu đề cột: <code>Lựa chọn A</code>, <code>Lựa chọn B</code>,... hoặc <code>A</code>, <code>B</code>, <code>C</code>, <code>D</code></span>
                  </div>
                  <div className="px-4 py-2.5 flex items-start gap-4">
                    <span className="font-semibold text-slate-900 w-32 shrink-0">Đáp án đúng *</span>
                    <span className="text-slate-600">Tiêu đề cột: <code>Đáp án đúng</code>, <code>Correct Answer</code>, <code>Định nghĩa</code> (Có thể ghi nội dung đáp án hoặc chữ cái A, B, C, D)</span>
                  </div>
                  <div className="px-4 py-2.5 flex items-start gap-4">
                    <span className="font-semibold text-slate-900 w-32 shrink-0">Giải thích chi tiết</span>
                    <span className="text-slate-600">Tiêu đề cột: <code>Giải thích</code>, <code>Explanation</code>, <code>Lý do</code></span>
                  </div>
                  <div className="px-4 py-2.5 flex items-start gap-4">
                    <span className="font-semibold text-slate-900 w-32 shrink-0">Ví dụ minh họa</span>
                    <span className="text-slate-600">Tiêu đề cột: <code>Ví dụ</code>, <code>Example</code>, <code>Ứng dụng</code></span>
                  </div>
                  <div className="px-4 py-2.5 flex items-start gap-4">
                    <span className="font-semibold text-slate-900 w-32 shrink-0">Mẹo ghi nhớ</span>
                    <span className="text-slate-600">Tiêu đề cột: <code>Mẹo nhớ</code>, <code>Memory Tip</code>, <code>Mẹo</code></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              {!parseResult && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    Kéo và thả file câu hỏi vào đây, hoặc click để chọn file
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
                    Hỗ trợ tệp bảng tính Excel (.xlsx, .xls), CSV (.csv), JSON hoặc tệp văn bản sao chép từ Quizlet (.txt)
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      Excel / CSV
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs">
                      <FileCode className="w-3.5 h-3.5 text-violet-600" />
                      JSON
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      Text .txt
                    </span>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium">Đang trích xuất dữ liệu câu hỏi từ file...</p>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Lỗi phân tích file</div>
                    <div className="mt-0.5">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Preview extracted questions */}
              {parseResult && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          Đã trích xuất thành công {parseResult.questions.length} câu hỏi
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          Từ file: <span className="font-mono">{parseResult.fileName}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setParseResult(null)}
                      className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline"
                    >
                      Chọn file khác
                    </button>
                  </div>

                  {/* Destination Options */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Vị trí lưu trữ dữ liệu
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setDestinationMode('new')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          destinationMode === 'new'
                            ? 'bg-white border-indigo-600 text-indigo-900 shadow-xs'
                            : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <Layers className="w-4 h-4 text-indigo-600 mt-0.5" />
                        <div>
                          <div className="font-bold">Tạo Bộ thẻ mới</div>
                          <div className="text-[11px] text-slate-500">Tạo bộ thẻ độc lập chứa các câu hỏi này</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDestinationMode('existing')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          destinationMode === 'existing'
                            ? 'bg-white border-indigo-600 text-indigo-900 shadow-xs'
                            : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <Layers className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <div className="font-bold">Thêm vào Bộ thẻ có sẵn</div>
                          <div className="text-[11px] text-slate-500">Bổ sung vào bộ thẻ hiện có trong kho</div>
                        </div>
                      </button>
                    </div>

                    {destinationMode === 'new' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Tên bộ thẻ mới *
                          </label>
                          <input
                            type="text"
                            value={newSetTitle}
                            onChange={(e) => setNewSetTitle(e.target.value)}
                            placeholder="VD: Từ vựng IELTS Unit 1"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Thuộc học phần nào *
                          </label>
                          <select
                            value={newSetCourseId}
                            onChange={(e) => setNewSetCourseId(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            {courses.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.code} - {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Chọn bộ thẻ đích *
                        </label>
                        <select
                          value={selectedSetId}
                          onChange={(e) => setSelectedSetId(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          {studySets.map(s => {
                            const course = courses.find(c => c.id === s.courseId);
                            return (
                              <option key={s.id} value={s.id}>
                                {s.title} ({course?.code || 'Chung'} · {s.questions.length} câu)
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Preview Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Xem trước danh sách câu hỏi ({parseResult.questions.length})
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                          <tr>
                            <th className="px-3 py-2 w-10">#</th>
                            <th className="px-3 py-2">Câu hỏi / Thuật ngữ</th>
                            <th className="px-3 py-2">Đáp án đúng</th>
                            <th className="px-3 py-2">Giải thích</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parseResult.questions.map((q: Question, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                              <td className="px-3 py-2 font-medium text-slate-900 max-w-xs truncate" title={q.prompt}>
                                {q.prompt}
                              </td>
                              <td className="px-3 py-2 text-emerald-700 font-semibold max-w-[180px] truncate" title={q.correctAnswer}>
                                {q.correctAnswer}
                              </td>
                              <td className="px-3 py-2 text-slate-500 max-w-xs truncate" title={q.explanation}>
                                {q.explanation || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Đóng
          </button>

          {parseResult && (
            <button
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
            >
              <span>Xác nhận nhập {parseResult.questions.length} câu hỏi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
