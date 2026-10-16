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
  ClipboardPaste,
  Sparkles,
  ArrowRight,
  Layers,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useAppState } from '../lib/app-state';
import {
  parseUploadedFile,
  parsePastedText,
  ParsedQuestionResult,
  downloadExcelTemplate,
  downloadCsvTemplate,
  downloadJsonTemplate
} from '../lib/file-parser';
import { sound } from '../lib/sound';

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
  const { studySets, courses, addBulkQuestionsToSet, addStudySet, addCourse, setActiveSetId } = useAppState();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'guide'>('upload');

  // File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileParseResult, setFileParseResult] = useState<ParsedQuestionResult | null>(null);
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);

  // Paste & Generate State
  const [pastedText, setPastedText] = useState('');
  const [pasteParseResult, setPasteParseResult] = useState<ParsedQuestionResult | null>(null);

  // Destination Set Mode
  const [destinationMode, setDestinationMode] = useState<'existing' | 'new'>('new');
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetCourseId, setNewSetCourseId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      if (targetSetId) {
        setDestinationMode('existing');
        setSelectedSetId(targetSetId);
      } else {
        setDestinationMode('new');
        setSelectedSetId(studySets[0]?.id || '');
      }
      setFileParseResult(null);
      setFileErrorMessage(null);
      setPastedText('');
      setPasteParseResult(null);
      setNewSetTitle('');
      setNewSetCourseId(courses[0]?.id || '');
      setActiveTab('upload');
    }
  }, [isOpen, targetSetId, courses, studySets]);

  // Live parse pasted text with a short debounce
  useEffect(() => {
    if (!pastedText.trim()) {
      setPasteParseResult(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const result = parsePastedText(pastedText, 'Dán văn bản trực tiếp');
        setPasteParseResult(result);
        if (!newSetTitle.trim() && result.questions.length > 0) {
          setNewSetTitle(`Bộ thẻ ghi chú (${result.questions.length} câu)`);
        }
      } catch (err: any) {
        console.warn('Lỗi phân tích văn bản:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pastedText]);

  if (!isOpen) return null;

  // File Upload Handlers
  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setFileErrorMessage(null);
    try {
      const result = await parseUploadedFile(file);
      if (result.questions.length === 0) {
        throw new Error('Không trích xuất được câu hỏi nào từ file. Hãy kiểm tra lại tiêu đề cột.');
      }
      setFileParseResult(result);
      sound.playCorrect();
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewSetTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    } catch (err: any) {
      sound.playWrong();
      setFileErrorMessage(err.message || 'Lỗi khi xử lý file.');
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

  // Sample Text Presets for "Paste & Generate"
  const handleInsertSample = (type: 'vocab' | 'quiz' | 'qna') => {
    sound.playClick();
    if (type === 'vocab') {
      setPastedText(
`Tenant - Người thuê nhà - Thường ký hợp đồng thuê có thời hạn với chủ nhà - Mẹo: Ten = 10 người cùng thuê
Landlord - Chủ cho thuê bất động sản - Người sở hữu nhà hoặc đất cho người khác thuê - Mẹo: Land + Lord = Chủ đất
Ubiquitous - Có mặt ở khắp mọi nơi - Smartphones have become ubiquitous in student life
Ephemeral - Phù du, chóng tàn, ngắn ngủi - Fashion trends are often ephemeral - Mẹo: E-phemera = thoáng qua
Mitigate - Giảm nhẹ, làm dịu bớt - Measures to mitigate risk in investment`
      );
      setNewSetTitle('Từ vựng tiếng Anh học thuật');
    } else if (type === 'quiz') {
      setPastedText(
`Câu 1: Thuật ngữ nào chỉ tình trạng mức giá chung tăng liên tục theo thời gian?
A. Lạm phát (Inflation)
B. Giảm phát (Deflation)
C. Đình lạm (Stagflation)
D. Khủng hoảng thanh khoản
Đáp án: A
Giải thích: Lạm phát là sự suy giảm sức mua của đồng tiền khi giá cả tăng liên tục.
Mẹo nhớ: Lạm = Tràn lan, Phát = Thổi bùng giá cả.

Câu 2: Trong triết học Mác - Lênin, quy luật nào chỉ ra CÁCH THỨC của sự phát triển?
A. Quy luật Chuyển hóa Lượng - Chất
B. Quy luật Mâu thuẫn
C. Quy luật Phủ định của phủ định
D. Quy luật Giá trị
Đáp án: A
Giải thích: Tích lũy về lượng đạt điểm nút sẽ tạo bước nhảy biến đổi về chất.
Mẹo nhớ: Lượng - Chất = Cách thức; Mâu thuẫn = Nguồn gốc.`
      );
      setNewSetTitle('Trắc nghiệm Kinh tế & Triết học');
    } else if (type === 'qna') {
      setPastedText(
`Q: CPU là gì trong cấu trúc máy tính?
A: Central Processing Unit - Bộ xử lý trung tâm thực thi các tập lệnh chương trình.
Exp: Đóng vai trò bộ não điều phối mọi linh kiện của máy tính.
Tip: Chữ C viết tắt của Central (Trung tâm).

Q: RAM có đặc tính gì nổi bật?
A: Bộ nhớ tạm thời, dữ liệu bị mất hoàn toàn khi mất nguồn điện (Volatile memory).
Exp: Cho phép CPU truy xuất ngẫu nhiên dữ liệu với tốc độ cực nhanh.
Tip: Random Access = Truy xuất ngẫu nhiên.`
      );
      setNewSetTitle('Kiến trúc máy tính Q&A');
    }
  };

  // Determine current active question result based on tab
  const currentResult = activeTab === 'upload' ? fileParseResult : pasteParseResult;

  // Confirm Import (Supports both File Upload & Text Paste)
  const handleConfirmImport = async () => {
    if (!currentResult || currentResult.questions.length === 0) return;

    sound.playClick();

    if (destinationMode === 'existing') {
      if (!selectedSetId) {
        setFileErrorMessage('Vui lòng chọn bộ thẻ cần thêm câu hỏi vào.');
        return;
      }
      await addBulkQuestionsToSet(selectedSetId, currentResult.questions);
      setActiveSetId(selectedSetId);
    } else {
      if (!newSetTitle.trim()) {
        setFileErrorMessage('Vui lòng nhập tên cho bộ thẻ mới.');
        return;
      }

      let finalCourseId = newSetCourseId;
      if (!finalCourseId) {
        if (courses.length > 0) {
          finalCourseId = courses[0].id;
        } else {
          // Tự động tạo môn học đầu tiên cho tài khoản mới
          const autoCourse = await addCourse({
            code: 'GEN101',
            name: 'Học phần Chung',
            description: 'Học phần tự động khởi tạo khi nạp bộ thẻ',
            color: '#007afc',
            semester: 'Học kỳ 1'
          });
          finalCourseId = autoCourse.id;
        }
      }

      // Gắn câu hỏi trực tiếp khi khởi tạo bộ thẻ để tránh race-condition
      const newSet = await addStudySet({
        title: newSetTitle.trim(),
        description: `Tạo từ ${currentResult.fileName} (${currentResult.questions.length} câu hỏi)`,
        courseId: finalCourseId,
        questions: currentResult.questions
      });
      setActiveSetId(newSet.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18152e] rounded-3xl border border-slate-200/80 dark:border-white/10 w-full max-w-2xl overflow-hidden my-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007afc] text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nạp câu hỏi &amp; Tạo bộ thẻ thông minh
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hỗ trợ file Excel (.xlsx), CSV (.csv chuẩn RFC 4180), hoặc dán trực tiếp ghi chú/từ vựng
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Main Tabs: Upload File, Paste Text, Guide */}
        <div className="px-6 pt-3 border-b border-slate-200/80 dark:border-white/10 flex gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('upload');
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#007afc] text-[#007afc]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Nạp file (Excel / CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('paste');
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#007afc] text-[#007afc]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Dán văn bản (Paste Text)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('guide');
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#007afc] text-[#007afc]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>File mẫu &amp; Hướng dẫn</span>
          </button>
        </div>

        {/* TAB 1: FILE UPLOAD (RFC 4180 PapaParse CSV + Excel) */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
            {fileErrorMessage && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileErrorMessage}</span>
              </div>
            )}

            {!fileParseResult ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#007afc] bg-sky-50 dark:bg-sky-950/40 ring-4 ring-[#007afc]/15'
                    : 'border-slate-300 dark:border-white/20 hover:border-[#007afc] bg-slate-50 dark:bg-white/[0.02] hover:bg-sky-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="w-14 h-14 mx-auto rounded-full bg-[#007afc] text-white flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30 transition-transform hover:scale-105">
                  <UploadCloud className="w-7 h-7 stroke-[2]" />
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kéo thả file CSV hoặc Excel vào đây
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Trình phân tích PapaParse chuẩn RFC 4180 hỗ trợ hoàn hảo chuỗi bọc ngoặc kép, dấu phẩy và ngắt dòng trong phần giải thích.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-sky-600" /> CSV (.csv - PapaParse)
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-xs">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel (.xlsx, .xls)
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-xs">
                    <FileCode className="w-3.5 h-3.5 text-purple-600" /> JSON (.json)
                  </span>
                </div>

                {isProcessing && (
                  <p className="text-xs text-[#007afc] font-semibold mt-4 animate-pulse">
                    Đang xử lý cấu trúc file và đọc dữ liệu...
                  </p>
                )}
              </div>
            ) : (
              /* Kết quả đọc file thành công */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Đã trích xuất chính xác {fileParseResult.questions.length} câu hỏi
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Nguồn: <span className="font-semibold">{fileParseResult.fileName}</span> ({fileParseResult.totalRows} dòng)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileParseResult(null);
                      setFileErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Chọn file khác
                  </button>
                </div>

                {/* Destination configuration */}
                <DestinationSelector
                  destinationMode={destinationMode}
                  setDestinationMode={setDestinationMode}
                  newSetTitle={newSetTitle}
                  setNewSetTitle={setNewSetTitle}
                  newSetCourseId={newSetCourseId}
                  setNewSetCourseId={setNewSetCourseId}
                  selectedSetId={selectedSetId}
                  setSelectedSetId={setSelectedSetId}
                  courses={courses}
                  studySets={studySets}
                />

                {/* Preview Questions */}
                <QuestionsPreview questions={fileParseResult.questions} />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: "PASTE & GENERATE" FLASHCARD PARSER */}
        {activeTab === 'paste' && (
          <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-[#007afc]" />
                  <span>Dán văn bản thô hoặc danh sách từ vựng</span>
                </label>
                {pasteParseResult && pasteParseResult.questions.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Nhận diện: {pasteParseResult.questions.length} câu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hệ thống tự động nhận diện dấu gạch ngang ( - ), hai chấm ( : ), dấu Tab hoặc trắc nghiệm A, B, C, D.
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Mẫu thử:
              </span>
              <button
                type="button"
                onClick={() => handleInsertSample('vocab')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                + Mẫu Từ vựng (Term - Def)
              </button>
              <button
                type="button"
                onClick={() => handleInsertSample('quiz')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                + Mẫu Trắc nghiệm (A, B, C, D)
              </button>
              <button
                type="button"
                onClick={() => handleInsertSample('qna')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                + Mẫu Q&amp;A (Q: ... A: ...)
              </button>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={7}
                placeholder={`Dán nội dung học tập tại đây. Ví dụ:\n\nTenant - Người thuê nhà - Thường ký hợp đồng với chủ trọ - Mẹo: 10 người thuê\nLandlord - Chủ cho thuê bất động sản - Sở hữu tài sản - Mẹo: Land + Lord\n\nHoặc:\nCâu 1: Lạm phát là gì?\nA. Giá cả tăng liên tục\nB. Giá cả giảm\nC. Thất nghiệp tăng\nD. Tiền tệ mạnh lên\nĐáp án: A\nGiải thích: Lạm phát làm suy giảm sức mua.`}
                className="w-full p-4 text-xs font-mono rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#007afc] focus:ring-2 focus:ring-[#007afc]/20 transition"
              />
              {pastedText && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPastedText('');
                    setPasteParseResult(null);
                  }}
                  className="absolute right-3 top-3 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white/60 dark:bg-white/10 text-[10px]"
                >
                  Xóa hết
                </button>
              )}
            </div>

            {/* Destination Configuration */}
            {pasteParseResult && pasteParseResult.questions.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <DestinationSelector
                  destinationMode={destinationMode}
                  setDestinationMode={setDestinationMode}
                  newSetTitle={newSetTitle}
                  setNewSetTitle={setNewSetTitle}
                  newSetCourseId={newSetCourseId}
                  setNewSetCourseId={setNewSetCourseId}
                  selectedSetId={selectedSetId}
                  setSelectedSetId={setSelectedSetId}
                  courses={courses}
                  studySets={studySets}
                />

                {/* Preview Questions */}
                <QuestionsPreview questions={pasteParseResult.questions} />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEMPLATES & GUIDE */}
        {activeTab === 'guide' && (
          <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Tải file mẫu định dạng chuẩn
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tải về các file mẫu bên dưới để soạn sẵn câu hỏi trắc nghiệm cùng phần giải thích, ví dụ và mẹo nhớ trên máy tính trước khi upload:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-left transition-all group cursor-pointer"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">File Excel (.xlsx)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tiêu đề cột tiếng Việt chuẩn</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007afc] mt-2">
                    <Download className="w-3 h-3" /> Tải về
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-left transition-all group cursor-pointer"
                >
                  <FileText className="w-6 h-6 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">File CSV (.csv)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Chuẩn RFC 4180 phân cách dấu phẩy</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007afc] mt-2">
                    <Download className="w-3 h-3" /> Tải về
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadJsonTemplate}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-left transition-all group cursor-pointer"
                >
                  <FileCode className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">File JSON (.json)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dành cho xuất dữ liệu tự động</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007afc] mt-2">
                    <Download className="w-3 h-3" /> Tải về
                  </span>
                </button>
              </div>
            </div>

            {/* Bảng hướng dẫn cấu trúc */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cấu trúc các cột bắt buộc và tùy chọn trong file Excel/CSV:
              </span>

              <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-white/10">
                    <tr>
                      <th className="p-3">Tên cột gợi ý</th>
                      <th className="p-3">Ý nghĩa</th>
                      <th className="p-3">Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Câu hỏi / Thuật ngữ</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">Nội dung câu hỏi hoặc từ vựng mặt trước (Bắt buộc)</td>
                      <td className="p-3">Tenant là gì?</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Đáp án đúng</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">Nội dung đáp án / định nghĩa chuẩn (Bắt buộc)</td>
                      <td className="p-3">Người thuê nhà</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Lựa chọn A, B, C, D</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">Các phương án trắc nghiệm</td>
                      <td className="p-3">A. Người thuê B. Chủ nhà...</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Giải thích</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">Phân tích vì sao đáp án đúng (có thể chứa dấu phẩy tự do)</td>
                      <td className="p-3">Tenant trả tiền thuê nhà định kỳ...</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Mẹo nhớ</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">Mẹo gợi nhớ nhanh kiến thức</td>
                      <td className="p-3">Ten = 10 người thuê</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end gap-3 bg-slate-50/80 dark:bg-black/20">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>

          {currentResult && currentResult.questions.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#007afc] hover:bg-sky-600 rounded-xl hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-500/25"
            >
              <span>Xác nhận tạo bộ thẻ ({currentResult.questions.length} câu)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component: Destination Selector (New Set vs Existing Set)
interface DestinationSelectorProps {
  destinationMode: 'existing' | 'new';
  setDestinationMode: (mode: 'existing' | 'new') => void;
  newSetTitle: string;
  setNewSetTitle: (val: string) => void;
  newSetCourseId: string;
  setNewSetCourseId: (val: string) => void;
  selectedSetId: string;
  setSelectedSetId: (val: string) => void;
  courses: any[];
  studySets: any[];
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  destinationMode,
  setDestinationMode,
  newSetTitle,
  setNewSetTitle,
  newSetCourseId,
  setNewSetCourseId,
  selectedSetId,
  setSelectedSetId,
  courses,
  studySets
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 space-y-4">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
        Nơi lưu danh sách câu hỏi
      </span>

      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setDestinationMode('new');
          }}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            destinationMode === 'new'
              ? 'bg-[#007afc] border-[#007afc] text-white font-bold shadow-md shadow-sky-500/20'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tạo bộ thẻ mới
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setDestinationMode('existing');
          }}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            destinationMode === 'existing'
              ? 'bg-[#007afc] border-[#007afc] text-white font-bold shadow-md shadow-sky-500/20'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Thêm vào bộ thẻ đã có
        </button>
      </div>

      {destinationMode === 'new' ? (
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Tên bộ thẻ mới *
            </label>
            <input
              type="text"
              value={newSetTitle}
              onChange={(e) => setNewSetTitle(e.target.value)}
              placeholder="VD: Từ vựng Luật Bất Động Sản..."
              className="w-full px-4 py-2.5 text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-[#007afc]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Thuộc học phần
            </label>
            <select
              value={newSetCourseId}
              onChange={(e) => setNewSetCourseId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-[#007afc]"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900">
                  [{c.code}] {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Chọn bộ thẻ đích *
          </label>
          <select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-[#007afc]"
          >
            {studySets.map(s => {
              const course = courses.find(c => c.id === s.courseId);
              return (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {s.title} ({course?.code || 'Chung'} - {s.questions.length} câu hiện có)
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
};

// Sub-component: Questions Preview
const QuestionsPreview: React.FC<{ questions: any[] }> = ({ questions }) => {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Xem trước ({Math.min(questions.length, 3)}/{questions.length} câu)
      </span>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {questions.slice(0, 3).map((q, i) => (
          <div key={i} className="p-3 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">
              {i + 1}. {q.prompt}
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              &bull; Đáp án đúng: {q.correctAnswer}
            </p>
            {q.explanation && (
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                &bull; Giải thích: {q.explanation}
              </p>
            )}
            {q.memoryTip && (
              <p className="text-purple-600 dark:text-purple-400 text-[11px]">
                &bull; Mẹo nhớ: {q.memoryTip}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
