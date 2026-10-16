import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Question, QuestionType } from '../types';

export interface ParsedQuestionResult {
  questions: Question[];
  errors: string[];
  totalRows: number;
  fileName: string;
}

/**
 * Robust file parsing for Excel (.xlsx, .xls), CSV (.csv), JSON (.json), and TXT (.txt)
 */
export async function parseUploadedFile(file: File): Promise<ParsedQuestionResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else if (extension === 'csv') {
    return parseCsvFile(file);
  } else if (extension === 'json') {
    return parseJsonFile(file);
  } else if (extension === 'txt') {
    return parseTxtFile(file);
  } else {
    throw new Error(`Định dạng file .${extension} không được hỗ trợ. Vui lòng chọn .xlsx, .csv, .json hoặc .txt`);
  }
}

/**
 * Phân tích file Excel (.xlsx, .xls) qua XLSX library
 */
async function parseExcelFile(file: File): Promise<ParsedQuestionResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('File Excel rỗng, không tìm thấy trang tính (Sheet).');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return extractQuestionsFromRecords(rawRows, file.name);
}

/**
 * Phân tích file CSV (.csv) sử dụng PapaParse (RFC 4180 compliant)
 * Giải quyết triệt để lỗi lệch cột khi có dấu phẩy nằm trong nội dung giải thích,
 * dấu ngoặc kép bọc chuỗi (quoted strings) và ngắt dòng bên trong ô văn bản.
 */
async function parseCsvFile(file: File): Promise<ParsedQuestionResult> {
  const text = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          if (results.errors && results.errors.length > 0) {
            console.warn('PapaParse warnings/errors:', results.errors);
          }

          if (!results.data || results.data.length === 0) {
            throw new Error('File CSV không có dữ liệu hoặc không chứa dòng tiêu đề hợp lệ.');
          }

          const parsed = extractQuestionsFromRecords(results.data, file.name);
          resolve(parsed);
        } catch (err: any) {
          reject(err);
        }
      },
      error: (err: Error) => {
        reject(new Error(`Lỗi phân tích file CSV: ${err.message}`));
      }
    });
  });
}

/**
 * Phân tích file JSON (.json)
 */
async function parseJsonFile(file: File): Promise<ParsedQuestionResult> {
  const text = await file.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Cấu trúc file JSON không hợp lệ (sai cú pháp JSON).');
  }

  const rawRows = Array.isArray(data) ? data : data.questions || data.items || [];
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    throw new Error('File JSON không chứa mảng câu hỏi hợp lệ.');
  }

  return extractQuestionsFromRecords(rawRows, file.name);
}

/**
 * Phân tích file TXT (.txt)
 */
async function parseTxtFile(file: File): Promise<ParsedQuestionResult> {
  const text = await file.text();
  return parsePastedText(text, file.name);
}

/**
 * SMART "PASTE & GENERATE" PARSER
 * Phân tích văn bản thô từ ghi chú, danh sách từ vựng, tài liệu hoặc câu hỏi trắc nghiệm
 * Tự động nhận diện nhiều định dạng phổ biến:
 * 1. Phân cách bằng ký tự: Term - Definition, Term : Definition, Term => Definition, Term \t Definition
 * 2. Cấu trúc câu hỏi trắc nghiệm: Question ... A. ... B. ... C. ... D. ... Answer: ... Explanation: ...
 * 3. Cấu trúc Q&A: Q: ... A: ... Exp: ... Tip: ...
 */
export function parsePastedText(rawText: string, sourceName = 'Văn bản dán nhanh'): ParsedQuestionResult {
  const cleaned = rawText.trim();
  if (!cleaned) {
    return { questions: [], errors: ['Văn bản trống, vui lòng nhập nội dung.'], totalRows: 0, fileName: sourceName };
  }

  const lines = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const questions: Question[] = [];
  const errors: string[] = [];

  // Kiểm tra xem văn bản có phải dạng câu hỏi trắc nghiệm theo khối không (chứa A. B. hoặc Q: / Question:)
  const hasQuizBlocks = lines.some(l => /^(câu\s*\d+|q\d*|question\d*):/i.test(l) || /^[A-D][\.\)]\s+/i.test(l));
  const hasQnABlocks = lines.some(l => /^[Qq]:\s*/i.test(l)) && lines.some(l => /^[Aa]:\s*/i.test(l));

  if (hasQuizBlocks) {
    // Parser Dạng 1: Khối câu hỏi trắc nghiệm A, B, C, D
    let currentPrompt = '';
    let currentOptions: string[] = [];
    let currentAns = '';
    let currentExp = '';
    let currentTip = '';

    const pushCurrentBlock = () => {
      if (currentPrompt && (currentAns || currentOptions.length > 0)) {
        questions.push(buildParsedQuestion(currentPrompt, currentOptions, currentAns, currentExp, currentTip, questions.length));
      }
      currentPrompt = '';
      currentOptions = [];
      currentAns = '';
      currentExp = '';
      currentTip = '';
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Bắt đầu một câu hỏi mới
      if (/^(câu\s*\d+|q\d*|question\d*):/i.test(line)) {
        pushCurrentBlock();
        currentPrompt = line.replace(/^(câu\s*\d+|q\d*|question\d*):\s*/i, '');
      } else if (/^[A-D][\.\)]\s+/i.test(line)) {
        currentOptions.push(line.replace(/^[A-D][\.\)]\s+/i, ''));
      } else if (/^(đáp án|answer|ans|đáp án đúng):\s*/i.test(line)) {
        currentAns = line.replace(/^(đáp án|answer|ans|đáp án đúng):\s*/i, '');
      } else if (/^(giải thích|explanation|exp|lý do):\s*/i.test(line)) {
        currentExp = line.replace(/^(giải thích|explanation|exp|lý do):\s*/i, '');
      } else if (/^(mẹo nhớ|tip|mnemonic|mẹo):\s*/i.test(line)) {
        currentTip = line.replace(/^(mẹo nhớ|tip|mnemonic|mẹo):\s*/i, '');
      } else if (!currentPrompt) {
        currentPrompt = line;
      } else if (currentOptions.length === 0 && !currentAns) {
        // Nối thêm vào đề bài nếu chưa xuất hiện lựa chọn
        currentPrompt += ' ' + line;
      }
    }
    pushCurrentBlock();
  } else if (hasQnABlocks) {
    // Parser Dạng 2: Khối Q&A (Q: ... A: ... Exp: ... Tip: ...)
    let currentPrompt = '';
    let currentAns = '';
    let currentExp = '';
    let currentTip = '';

    const pushQnA = () => {
      if (currentPrompt && currentAns) {
        questions.push(buildParsedQuestion(currentPrompt, [currentAns], currentAns, currentExp, currentTip, questions.length));
      }
      currentPrompt = '';
      currentAns = '';
      currentExp = '';
      currentTip = '';
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^[Qq]:\s*/i.test(line)) {
        pushQnA();
        currentPrompt = line.replace(/^[Qq]:\s*/i, '');
      } else if (/^[Aa]:\s*/i.test(line)) {
        currentAns = line.replace(/^[Aa]:\s*/i, '');
      } else if (/^(giải thích|exp|explanation):\s*/i.test(line)) {
        currentExp = line.replace(/^(giải thích|exp|explanation):\s*/i, '');
      } else if (/^(mẹo|tip|mnemonic):\s*/i.test(line)) {
        currentTip = line.replace(/^(mẹo|tip|mnemonic):\s*/i, '');
      }
    }
    pushQnA();
  } else {
    // Parser Dạng 3: Mỗi dòng là một thẻ (Phân cách bởi Tab, Dấu gạch ngang, Dấu hai chấm, hoặc Dấu mũi tên)
    // Ví dụ:
    // Tenant - Người thuê nhà - Thường ký hợp đồng với chủ trọ - Mẹo: Ten = 10 người thuê
    // Ubiquitous : Có mặt ở khắp nơi : Smartphones are ubiquitous
    lines.forEach((line, index) => {
      // Xác định delimiter phù hợp nhất trên dòng này
      let parts: string[] = [];

      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else if (line.includes(' - ')) {
        parts = line.split(' - ').map(p => p.trim());
      } else if (line.includes(' : ')) {
        parts = line.split(' : ').map(p => p.trim());
      } else if (line.includes(' => ')) {
        parts = line.split(' => ').map(p => p.trim());
      } else if (line.includes(' | ')) {
        parts = line.split(' | ').map(p => p.trim());
      } else if (line.includes(' // ')) {
        parts = line.split(' // ').map(p => p.trim());
      } else if (line.includes('-') && !line.startsWith('-')) {
        parts = line.split('-').map(p => p.trim());
      } else if (line.includes(':') && !line.startsWith(':')) {
        parts = line.split(':').map(p => p.trim());
      }

      if (parts.length >= 2 && parts[0] && parts[1]) {
        const prompt = parts[0];
        const answer = parts[1];
        const explanation = parts[2] || `Định nghĩa: ${answer}`;
        const memoryTip = parts[3] || '';

        questions.push({
          id: `q-paste-${Date.now()}-${index}`,
          type: 'multiple_choice',
          prompt,
          correctAnswer: answer,
          options: [answer],
          explanation,
          example: '',
          memoryTip
        });
      } else {
        errors.push(`Dòng ${index + 1}: Không tìm thấy dấu phân cách (-, :, hoặc tab) giữa câu hỏi và đáp án.`);
      }
    });
  }

  // Chuẩn hóa 4 lựa chọn trắc nghiệm mượt mà
  normalizeMultipleChoiceOptions(questions);

  return {
    questions,
    errors,
    totalRows: lines.length,
    fileName: sourceName
  };
}

/**
 * Xây dựng đối tượng câu hỏi Question chuẩn từ các trường dữ liệu
 */
function buildParsedQuestion(
  prompt: string,
  options: string[],
  answer: string,
  exp: string,
  tip: string,
  index: number
): Question {
  let resolvedAnswer = answer;

  // Nếu đáp án là 'A', 'B', 'C', 'D' và có options tương ứng
  const cleanAns = answer.trim().toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(cleanAns) && options.length > 0) {
    const idx = ['A', 'B', 'C', 'D'].indexOf(cleanAns);
    if (options[idx]) {
      resolvedAnswer = options[idx];
    }
  }

  return {
    id: `q-parsed-${Date.now()}-${index}`,
    type: 'multiple_choice',
    prompt,
    options: options.length >= 2 ? options : (resolvedAnswer ? [resolvedAnswer] : []),
    correctAnswer: resolvedAnswer || (options[0] || ''),
    explanation: exp || `Đáp án chính xác: ${resolvedAnswer || options[0] || ''}`,
    example: '',
    memoryTip: tip || ''
  };
}

/**
 * Trích xuất danh sách câu hỏi từ các bản ghi Table/JSON
 * Đảm bảo mọi trường (prompt, options, correctAnswer, explanation, memoryTip)
 * luôn liên kết chặt chẽ nguyên tử trong từng câu hỏi duy nhất.
 */
function extractQuestionsFromRecords(records: Record<string, any>[], fileName: string): ParsedQuestionResult {
  const questions: Question[] = [];
  const errors: string[] = [];

  records.forEach((row, index) => {
    const rowKeys = Object.keys(row);

    const getVal = (patterns: string[]): string => {
      for (const pattern of patterns) {
        const foundKey = rowKeys.find(k => {
          const normalized = k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return normalized === pattern || normalized.includes(pattern);
        });
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    // Tìm câu hỏi / khái niệm / thuật ngữ
    const prompt = getVal(['thuat ngu', 'cau hoi', 'khai niem', 'term', 'question', 'noi dung', 'de bai', 'tu vung']);
    if (!prompt) {
      errors.push(`Dòng ${index + 2}: Bỏ qua vì không tìm thấy cột Câu hỏi / Thuật ngữ.`);
      return;
    }

    // Tìm các lựa chọn A, B, C, D
    const optA = getVal(['lua chon a', 'dap an a', 'option a', 'a', 'cau a']);
    const optB = getVal(['lua chon b', 'dap an b', 'option b', 'b', 'cau b']);
    const optC = getVal(['lua chon c', 'dap an c', 'option c', 'c', 'cau c']);
    const optD = getVal(['lua chon d', 'dap an d', 'option d', 'd', 'cau d']);

    // Tìm đáp án đúng
    let answer = getVal(['dap an dung', 'dap an', 'dinh nghia', 'answer', 'correct', 'meaning', 'nghia']);

    // Tìm giải thích, ví dụ, mẹo nhớ
    const explanation = getVal(['giai thich', 'ly do', 'explanation', 'huong dan', 'giai']);
    const example = getVal(['vi du', 'example', 'minh hoa', 'ung dung']);
    const memoryTip = getVal(['meo nho', 'meo', 'tip', 'mnemonic', 'ghi nho']);

    // Tìm dạng câu hỏi (nếu có cột chỉ định dạng)
    const typeStr = getVal(['dang', 'kieu', 'type']).toLowerCase();
    let qType: QuestionType = 'multiple_choice';
    if (typeStr.includes('dien') || typeStr.includes('blank') || typeStr.includes('fill')) {
      qType = 'fill_blank';
    } else if (typeStr.includes('noi') || typeStr.includes('match')) {
      qType = 'matching';
    } else if (typeStr.includes('sap xep') || typeStr.includes('order')) {
      qType = 'ordering';
    }

    let options: string[] = [];
    if (optA || optB || optC || optD) {
      options = [optA, optB, optC, optD].filter(Boolean);
    }

    // Nếu người dùng nhập đáp án đúng là "A", "B", "C" hoặc "D"
    const ansKey = answer.trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(ansKey)) {
      if (ansKey === 'A' && optA) answer = optA;
      if (ansKey === 'B' && optB) answer = optB;
      if (ansKey === 'C' && optC) answer = optC;
      if (ansKey === 'D' && optD) answer = optD;
    }

    // Nếu không có đáp án đúng rõ ràng nhưng có optA, mặc định optA là đúng
    if (!answer && options.length > 0) {
      answer = options[0];
    }

    // Nếu có đáp án nhưng chưa nằm trong options
    if (answer && !options.includes(answer) && options.length > 0) {
      if (options.length < 4) {
        options.push(answer);
      }
    }

    // Nếu chỉ có prompt và answer (như file 2 cột Thuật ngữ - Định nghĩa)
    if (options.length === 0 && answer) {
      options = [answer];
    }

    // Khởi tạo câu hỏi nguyên tử: Mọi trường thuộc về đúng câu hỏi đó, không bao giờ tách rời
    questions.push({
      id: `q-parsed-${Date.now()}-${index}`,
      type: qType,
      prompt,
      options,
      correctAnswer: answer || prompt,
      explanation: explanation || `Kiến thức trọng tâm: "${answer || prompt}"`,
      example: example || '',
      memoryTip: memoryTip || ''
    });
  });

  // Tự động sinh thêm phương án nhiễu cho các câu chỉ có 1 đáp án (để làm trắc nghiệm 4 lựa chọn mượt mà)
  normalizeMultipleChoiceOptions(questions);

  return {
    questions,
    errors,
    totalRows: records.length,
    fileName
  };
}

/**
 * Đảm bảo mỗi câu trắc nghiệm có đủ 4 lựa chọn bằng cách mượn các đáp án từ câu khác
 * KHÔNG LÀM THAY ĐỔI CẶP (prompt - correctAnswer - explanation) của từng câu
 */
function normalizeMultipleChoiceOptions(questions: Question[]) {
  const allAnswers = Array.from(new Set(questions.map(q => q.correctAnswer).filter(Boolean)));

  questions.forEach(q => {
    if (q.type === 'multiple_choice') {
      if (!q.options) q.options = [];
      if (!q.options.includes(q.correctAnswer)) {
        q.options.unshift(q.correctAnswer);
      }

      // Nếu ít hơn 4 lựa chọn, lấy thêm từ danh sách các đáp án của bộ câu hỏi
      if (q.options.length < 4 && allAnswers.length > 1) {
        const distractors = allAnswers
          .filter(a => !q.options!.includes(a))
          .sort(() => 0.5 - Math.random())
          .slice(0, 4 - q.options.length);

        q.options.push(...distractors);
      }

      // Xáo trộn 4 đáp án để đáp án đúng không phải lúc nào cũng ở vị trí A
      q.options = shuffleArray([...q.options]);
    }
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Tải file mẫu Excel (.xlsx) chuẩn
 */
export function downloadExcelTemplate() {
  const sampleData = [
    {
      'Câu hỏi': 'Thuật ngữ nào chỉ người thuê nhà / người sử dụng bất động sản theo hợp đồng?',
      'Lựa chọn A': 'Tenant (Người thuê nhà)',
      'Lựa chọn B': 'Landlord (Chủ nhà / Bên cho thuê)',
      'Lựa chọn C': 'Broker (Môi giới bất động sản)',
      'Lựa chọn D': 'Sublessor (Bên cho thuê lại)',
      'Đáp án đúng': 'Tenant (Người thuê nhà)',
      'Giải thích': 'Tenant là người thuê nhà, có quyền sử dụng bất động sản trong thời hạn hợp đồng và trả tiền thuê định kỳ.',
      'Ví dụ': 'The tenant must pay rent on the first day of each month.',
      'Mẹo nhớ': 'Ten = 10 người thuê chung một căn nhà.'
    },
    {
      'Câu hỏi': 'Thuật ngữ nào chỉ chủ sở hữu bất động sản cho người khác thuê?',
      'Lựa chọn A': 'Landlord (Chủ nhà)',
      'Lựa chọn B': 'Tenant (Người thuê nhà)',
      'Lựa chọn C': 'Lessee (Bên thuê)',
      'Lựa chọn D': 'Mortgagee (Bên nhận thế chấp)',
      'Đáp án đúng': 'Landlord (Chủ nhà)',
      'Giải thích': 'Landlord là chủ đất hoặc chủ nhà cho người khác thuê tài sản để thu lợi nhuận.',
      'Ví dụ': 'The landlord is responsible for major structural repairs.',
      'Mẹo nhớ': 'Land (Đất) + Lord (Chúa đất / Chủ sở hữu).'
    },
    {
      'Câu hỏi': 'Thuật ngữ nào chỉ tình trạng giá cả chung của hàng hóa và dịch vụ tăng liên tục theo thời gian?',
      'Lựa chọn A': 'Lạm phát (Inflation)',
      'Lựa chọn B': 'Giảm phát (Deflation)',
      'Lựa chọn C': 'Đình lạm (Stagflation)',
      'Lựa chọn D': 'Khủng hoảng thanh khoản',
      'Đáp án đúng': 'Lạm phát (Inflation)',
      'Giải thích': 'Lạm phát là sự suy giảm sức mua của đồng tiền khi mức giá chung của nền kinh tế tăng lên.',
      'Ví dụ': 'Năm ngoái một ổ bánh mì có giá 15.000đ, năm nay tăng lên 20.000đ do giá nguyên liệu và chi phí tăng.',
      'Mẹo nhớ': 'Lạm = Quá mức/Tràn lan; Phát = Phát sinh/Thổi phồng tiền tệ.'
    },
    {
      'Câu hỏi': 'Trong triết học Mác - Lênin, quy luật nào chỉ ra CÁCH THỨC của sự vận động và phát triển?',
      'Lựa chọn A': 'Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến sự thay đổi về chất và ngược lại',
      'Lựa chọn B': 'Quy luật thống nhất và đấu tranh của các mặt đối lập',
      'Lựa chọn C': 'Quy luật phủ định của phủ định',
      'Lựa chọn D': 'Quy luật giá trị thặng dư',
      'Đáp án đúng': 'Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến sự thay đổi về chất và ngược lại',
      'Giải thích': 'Quy luật Lượng - Chất giải thích cách thức phát triển: tích lũy dần về lượng đạt đến điểm nút sẽ dẫn đến bước nhảy biến đổi về chất.',
      'Ví dụ': 'Sinh viên học tập tích lũy đủ 130 tín chỉ (lượng) sẽ thực hiện bước nhảy tốt nghiệp nhận bằng Kỹ sư/Cử nhân (chất).',
      'Mẹo nhớ': 'Lượng đổi -> Chất đổi = Cách thức; Mâu thuẫn = Nguồn gốc; Phủ định = Khuynh hướng.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 45 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 32 },
    { wch: 45 },
    { wch: 40 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoiMau');
  XLSX.writeFile(workbook, 'UniFlash_File_Cau_Hoi_Mau.xlsx');
}

/**
 * Tải file mẫu CSV (.csv) chuẩn RFC 4180
 */
export function downloadCsvTemplate() {
  const csvContent = 
`"Câu hỏi","Lựa chọn A","Lựa chọn B","Lựa chọn C","Lựa chọn D","Đáp án đúng","Giải thích","Ví dụ","Mẹo nhớ"
"Tenant là gì trong pháp lý bất động sản?","Người thuê nhà (Tenant)","Chủ cho thuê (Landlord)","Nhà môi giới","Bên bảo lãnh","Người thuê nhà (Tenant)","Tenant là người thuê nhà, có quyền sử dụng bất động sản trong thời hạn hợp đồng.","The tenant pays monthly rent.","Ten = 10 người thuê chung"
"Landlord là gì trong pháp lý bất động sản?","Chủ nhà cho thuê (Landlord)","Người thuê nhà (Tenant)","Người quản lý tòa nhà","Khách trọ","Chủ nhà cho thuê (Landlord)","Landlord là người sở hữu bất động sản cho người khác thuê.","The landlord signed the lease agreement.","Land + Lord = Chủ đất"
"Thuật ngữ nào chỉ tình trạng giá cả chung tăng liên tục?","Lạm phát (Inflation)","Giảm phát (Deflation)","Đình lạm","Bong bóng kinh tế","Lạm phát (Inflation)","Lạm phát là sự gia tăng mức giá chung kéo dài làm giảm sức mua.","Giá xăng dầu tăng kéo theo giá hàng tiêu dùng tăng.","Lạm = thừa thãi, phát = bộc phát giá"`;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'UniFlash_File_Mau.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Tải file mẫu JSON (.json)
 */
export function downloadJsonTemplate() {
  const jsonSample = [
    {
      "prompt": "Bộ phận nào trong máy tính được coi là 'bộ não' thực thi các lệnh tính toán?",
      "options": ["CPU (Bộ vi xử lý)", "RAM (Bộ nhớ truy xuất ngẫu nhiên)", "GPU (Bộ xử lý đồ họa)", "ROM"],
      "correctAnswer": "CPU (Bộ vi xử lý)",
      "explanation": "CPU (Central Processing Unit) tiếp nhận dữ liệu đầu vào, xử lý và ra lệnh điều khiển toàn bộ hệ thống.",
      "example": "Chip Apple M3 hoặc Intel Core i7 chịu trách nhiệm xử lý các luồng tính toán của phần mềm.",
      "memoryTip": "C - P - U: Central (Trung tâm) -> Trọng tâm điều hành."
    },
    {
      "prompt": "Trong kinh tế vi mô, đường cầu dốc xuống thể hiện quy luật gì?",
      "options": ["Quy luật cầu (Law of Demand)", "Quy luật cung (Law of Supply)", "Quy luật chi phí cơ hội", "Quy luật lợi tức giảm dần"],
      "correctAnswer": "Quy luật cầu (Law of Demand)",
      "explanation": "Khi giá của một hàng hóa tăng lên (với các yếu tố khác không đổi), lượng cầu về hàng hóa đó sẽ giảm xuống và ngược lại.",
      "example": "Giá vé xem phim tăng từ 70k lên 150k sẽ làm giảm số lượng vé khán giả mua.",
      "memoryTip": "Cầu dốc xuống vì Giá tăng thì Lượng mua tụt dốc."
    }
  ];

  const blob = new Blob([JSON.stringify(jsonSample, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'UniFlash_File_Mau.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
