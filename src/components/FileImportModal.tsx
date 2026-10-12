import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Sparkles
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
  const { studySets, courses, addBulkQuestionsToSet, addStudySet, setActiveSetId, setActiveMode } = useAppState();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedQuestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chọn bộ thẻ đích hoặc tạo mới
  const [destinationMode, setDestinationMode] = useState<'existing' | 'new'>('new');
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetCourseId, setNewSetCourseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'guide'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đảm bảo reset trạng thái chuẩn xác mỗi khi modal được mở ra
  useEffect(() => {
    if (isOpen) {
      if (targetSetId) {
        setDestinationMode('existing');
        setSelectedSetId(targetSetId);
      } else {
        setDestinationMode('new');
        setSelectedSetId(studySets[0]?.id || '');
      }
      setParseResult(null);
      setErrorMessage(null);
      setNewSetTitle('');
      setNewSetCourseId(courses[0]?.id || '');
      setActiveTab('upload');
    }
  }, [isOpen, targetSetId, courses, studySets]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.questions.length === 0) return;

    if (destinationMode === 'existing') {
      if (!selectedSetId) {
        setErrorMessage('Vui lòng chọn bộ thẻ cần thêm câu hỏi vào.');
        return;
      }
      await addBulkQuestionsToSet(selectedSetId, parseResult.questions);
      setActiveSetId(selectedSetId);
    } else {
      if (!newSetTitle.trim()) {
        setErrorMessage('Vui lòng nhập tên cho bộ thẻ mới.');
        return;
      }
      const course = courses.find(c => c.id === newSetCourseId) || courses[0];
      const newSet = await addStudySet({
        title: newSetTitle.trim(),
        description: `Nhập từ file ${parseResult.fileName} (${parseResult.questions.length} câu hỏi)`,
        courseId: course?.id || courses[0]?.id || 'course-eng'
      });
      await addBulkQuestionsToSet(newSet.id, parseResult.questions);
      setActiveSetId(newSet.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1F28]/35 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        style={{
          boxShadow: '0 24px 60px rgba(91, 45, 255, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
        className="bg-white rounded-3xl border border-black/[0.06] w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.05] flex items-center justify-between bg-[#FCFAF6]">
          <div className="flex items-center gap-3">
            <div
              style={{ boxShadow: '0 6px 16px rgba(91, 45, 255, 0.25)' }}
              className="w-10 h-10 rounded-2xl bg-[#5B2DFF] text-white flex items-center justify-center shrink-0"
            >
              <UploadCloud className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-flow-serif text-lg font-normal text-[#1F1F28]">
                Nhập câu hỏi từ file bên ngoài
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Hỗ trợ file Excel (.xlsx), CSV (.csv) và JSON (.json)
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

        {/* Tab Switcher (Pill Style) */}
        <div className="px-6 pt-4 border-b border-black/[0.05] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#5B2DFF] text-[#5B2DFF]'
                : 'border-transparent text-[#8E8E93] hover:text-[#1F1F28]'
            }`}
          >
            Tải lên &amp; Xử lý file
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#5B2DFF] text-[#5B2DFF]'
                : 'border-transparent text-[#8E8E93] hover:text-[#1F1F28]'
            }`}
          >
            Tải file mẫu &amp; Hướng dẫn định dạng
          </button>
        </div>

        {/* Tab 1: Upload and Parse Area */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Drag & Drop Area */}
            {!parseResult ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#5B2DFF] bg-[#EDE8FF]/40 ring-4 ring-[#5B2DFF]/15'
                    : 'border-[#C8B4FF]/60 hover:border-[#5B2DFF] bg-[#FCFAF6] hover:bg-[#F4EFFE]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  style={{ boxShadow: '0 8px 20px rgba(91, 45, 255, 0.25)' }}
                  className="w-14 h-14 mx-auto rounded-full bg-[#5B2DFF] text-white flex items-center justify-center mb-4 transition-transform hover:scale-105"
                >
                  <UploadCloud className="w-7 h-7 stroke-[2]" />
                </div>

                <h4 className="font-flow-serif text-lg font-normal text-[#1F1F28]">
                  Kéo thả file câu hỏi vào đây
                </h4>
                <p className="text-xs text-[#8E8E93] mt-1 max-w-sm mx-auto">
                  hoặc bấm vào khung để chọn file từ máy tính, tablet hoặc điện thoại
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-black/[0.05] rounded-full text-[11px] font-medium text-[#1F1F28]">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel (.xlsx, .xls)
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-black/[0.05] rounded-full text-[11px] font-medium text-[#1F1F28]">
                    <FileText className="w-3.5 h-3.5 text-sky-600" /> CSV (.csv)
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-black/[0.05] rounded-full text-[11px] font-medium text-[#1F1F28]">
                    <FileCode className="w-3.5 h-3.5 text-[#5B2DFF]" /> JSON (.json)
                  </span>
                </div>

                {isProcessing && (
                  <p className="text-xs text-[#5B2DFF] font-semibold mt-4 animate-pulse">
                    Đang phân tích cấu trúc cột và đọc dữ liệu...
                  </p>
                )}
              </div>
            ) : (
              /* Kết quả đọc file thành công */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">
                        Đã trích xuất thành công {parseResult.questions.length} câu hỏi
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        File nguồn: <span className="font-semibold">{parseResult.fileName}</span> ({parseResult.totalRows} dòng dữ liệu)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParseResult(null);
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Chọn file khác
                  </button>
                </div>

                {/* Chọn nơi lưu câu hỏi (Vào bộ thẻ mới hoặc bộ thẻ đã có) */}
                <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-black/[0.06] space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                    Nơi lưu danh sách câu hỏi
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setDestinationMode('new')}
                      style={destinationMode === 'new' ? { backgroundColor: '#5B2DFF', color: '#fff', boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)' } : {}}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        destinationMode === 'new'
                          ? 'border-[#5B2DFF] font-semibold'
                          : 'border-black/[0.06] bg-white text-[#8E8E93] hover:text-[#1F1F28]'
                      }`}
                    >
                      Tạo bộ thẻ mới
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestinationMode('existing')}
                      style={destinationMode === 'existing' ? { backgroundColor: '#5B2DFF', color: '#fff', boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)' } : {}}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        destinationMode === 'existing'
                          ? 'border-[#5B2DFF] font-semibold'
                          : 'border-black/[0.06] bg-white text-[#8E8E93] hover:text-[#1F1F28]'
                      }`}
                    >
                      Thêm vào bộ thẻ đã có
                    </button>
                  </div>

                  {destinationMode === 'new' ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#1F1F28] mb-1">
                          Tên bộ thẻ mới *
                        </label>
                        <input
                          type="text"
                          value={newSetTitle}
                          onChange={(e) => setNewSetTitle(e.target.value)}
                          placeholder="VD: Từ vựng Tuần 1..."
                          className="w-full px-4 py-2.5 text-xs bg-white border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1F1F28] mb-1">
                          Thuộc học phần
                        </label>
                        <select
                          value={newSetCourseId}
                          onChange={(e) => setNewSetCourseId(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-white border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF]"
                        >
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>
                              [{c.code}] {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[#1F1F28] mb-1">
                        Chọn bộ thẻ đích *
                      </label>
                      <select
                        value={selectedSetId}
                        onChange={(e) => setSelectedSetId(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-white border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF]"
                      >
                        {studySets.map(s => {
                          const course = courses.find(c => c.id === s.courseId);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.title} ({course?.code || 'Chung'} - {s.questions.length} câu hiện có)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* Preview 3 câu hỏi đầu tiên */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                    Xem trước các câu hỏi trích xuất ({Math.min(parseResult.questions.length, 3)}/{parseResult.questions.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parseResult.questions.slice(0, 3).map((q, i) => (
                      <div key={i} className="p-3 bg-white border border-black/[0.06] rounded-2xl text-xs space-y-1">
                        <p className="font-semibold text-[#1F1F28]">
                          {i + 1}. {q.prompt}
                        </p>
                        <p className="text-emerald-700">
                          &bull; Đáp án đúng: <span className="font-medium">{q.correctAnswer}</span>
                        </p>
                        {q.explanation && (
                          <p className="text-[#8E8E93] text-[11px]">
                            &bull; Giải thích: {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Template Downloads and Guide */}
        {activeTab === 'guide' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-3">
              <h4 className="font-flow-serif text-base font-normal text-[#1F1F28]">
                Tải file mẫu định dạng chuẩn
              </h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Tải về các file mẫu bên dưới để soạn sẵn câu hỏi trắc nghiệm cùng phần giải thích, ví dụ và mẹo nhớ trên máy tính trước khi upload:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="p-4 rounded-2xl border border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-left transition-all group cursor-pointer"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#1F1F28]">File Excel (.xlsx)</p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">Mẫu bảng tính có tiêu đề cột chuẩn tiếng Việt</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B2DFF] mt-2">
                    <Download className="w-3 h-3" /> Tải về
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="p-4 rounded-2xl border border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-left transition-all group cursor-pointer"
                >
                  <FileText className="w-6 h-6 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#1F1F28]">File CSV (.csv)</p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">Định dạng phân cách dấu phẩy UTF-8</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B2DFF] mt-2">
                    <Download className="w-3 h-3" /> Tải về
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadJsonTemplate}
                  className="p-4 rounded-2xl border border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-left transition-all group cursor-pointer"
                >
                  <FileCode className="w-6 h-6 text-[#5B2DFF] mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#1F1F28]">File JSON (.json)</p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">Dành cho lập trình viên và xuất tự động</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B2DFF] mt-2">
                    <Download className="w-3 h-3" /> Tải về
                  </span>
                </button>
              </div>
            </div>

            {/* Bảng hướng dẫn các cột */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                Cấu trúc các cột bắt buộc và tùy chọn trong file Excel/CSV:
              </span>

              <div className="border border-black/[0.06] rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FCFAF6] text-[#8E8E93] font-semibold border-b border-black/[0.05]">
                    <tr>
                      <th className="p-3">Tên cột gợi ý</th>
                      <th className="p-3">Ý nghĩa</th>
                      <th className="p-3">Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    <tr>
                      <td className="p-3 font-semibold text-[#1F1F28]">Câu hỏi (hoặc Thuật ngữ)</td>
                      <td className="p-3 text-[#8E8E93]">Đề bài câu hỏi / Từ vựng (Bắt buộc)</td>
                      <td className="p-3">Lạm phát là gì?</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#1F1F28]">Đáp án đúng</td>
                      <td className="p-3 text-[#8E8E93]">Nội dung câu trả lời chuẩn xác (Bắt buộc)</td>
                      <td className="p-3">Sự gia tăng mức giá chung liên tục</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#1F1F28]">Lựa chọn A, B, C, D</td>
                      <td className="p-3 text-[#8E8E93]">4 phương án trắc nghiệm</td>
                      <td className="p-3">Các phương án A, B, C, D</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#1F1F28]">Giải thích</td>
                      <td className="p-3 text-[#8E8E93]">Lý do vì sao đáp án đúng</td>
                      <td className="p-3">Theo định nghĩa kinh tế vĩ mô...</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#1F1F28]">Ví dụ</td>
                      <td className="p-3 text-[#8E8E93]">Tình huống ứng dụng thực tế</td>
                      <td className="p-3">Giá bát phở tăng từ 30k lên 40k</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#1F1F28]">Mẹo nhớ</td>
                      <td className="p-3 text-[#8E8E93]">Mẹo ghi nhớ nhanh kiến thức</td>
                      <td className="p-3">Nhớ chữ 'Phát' trong phát tán giá</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-black/[0.05] flex items-center justify-end gap-3 bg-[#FCFAF6]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium text-[#1F1F28] bg-white hover:bg-[#F3EFE6] border border-black/[0.06] rounded-full transition-all cursor-pointer"
          >
            Đóng
          </button>

          {activeTab === 'upload' && parseResult && parseResult.questions.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="px-6 py-2.5 text-xs font-semibold text-white rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Xác nhận nhập {parseResult.questions.length} câu hỏi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
