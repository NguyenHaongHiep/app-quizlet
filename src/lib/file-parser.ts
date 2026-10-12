import * as XLSX from 'xlsx';
import { Question, QuestionType } from '../types';

export interface ParsedQuestionResult {
  questions: Question[];
  errors: string[];
  totalRows: number;
  fileName: string;
}

/**
 * Trình phân tích file thông minh (Excel, CSV, JSON, TXT)
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
 * Phân tích file Excel (.xlsx, .xls)
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
 * Phân tích file CSV (.csv)
 */
async function parseCsvFile(file: File): Promise<ParsedQuestionResult> {
  const text = await file.text();
  const workbook = XLSX.read(text, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return extractQuestionsFromRecords(rawRows, file.name);
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
 * Phân tích file văn bản TXT (.txt) theo dạng dòng hoặc định dạng Quizlet (Tab-separated)
 */
async function parseTxtFile(file: File): Promise<ParsedQuestionResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const questions: Question[] = [];
  const errors: string[] = [];

  // Kiểm tra xem có phải định dạng phân cách bởi Tab (Thuật ngữ \t Định nghĩa) không
  let tabCount = 0;
  lines.forEach(l => {
    if (l.includes('\t')) tabCount++;
  });

  if (tabCount > 0) {
    // Dạng Tab-separated
    lines.forEach((line, index) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        questions.push({
          id: `q-txt-${Date.now()}-${index}`,
          type: 'multiple_choice',
          prompt: parts[0],
          correctAnswer: parts[1],
          options: [parts[1]], // Sẽ được bổ sung lựa chọn giả lập nếu cần
          explanation: parts[2] || `Khái niệm chuẩn: "${parts[1]}"`,
          example: parts[3] || '',
          memoryTip: parts[4] || ''
        });
      } else {
        errors.push(`Dòng ${index + 1}: Thiếu ký tự phân cách Tab giữa câu hỏi và đáp án.`);
      }
    });
  } else {
    // Dạng dòng hỏi - đáp theo khối
    // Q: ... A: ... B: ... C: ... D: ... Ans: ...
    let currentPrompt = '';
    let currentOptions: string[] = [];
    let currentAns = '';
    let currentExp = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(câu\s*\d+|q\d*|question\d*):/i.test(line)) {
        if (currentPrompt && (currentAns || currentOptions.length > 0)) {
          questions.push(buildQuestion(currentPrompt, currentOptions, currentAns, currentExp, questions.length));
        }
        currentPrompt = line.replace(/^(câu\s*\d+|q\d*|question\d*):\s*/i, '');
        currentOptions = [];
        currentAns = '';
        currentExp = '';
      } else if (/^[A-D]\.\s*/i.test(line)) {
        currentOptions.push(line.replace(/^[A-D]\.\s*/i, ''));
      } else if (/^(đáp án|answer|ans):\s*/i.test(line)) {
        currentAns = line.replace(/^(đáp án|answer|ans):\s*/i, '');
      } else if (/^(giải thích|explanation|exp):\s*/i.test(line)) {
        currentExp = line.replace(/^(giải thích|explanation|exp):\s*/i, '');
      } else if (!currentPrompt) {
        currentPrompt = line;
      }
    }

    if (currentPrompt && (currentAns || currentOptions.length > 0)) {
      questions.push(buildQuestion(currentPrompt, currentOptions, currentAns, currentExp, questions.length));
    }
  }

  // Chuẩn hóa 4 đáp án cho các câu trắc nghiệm thiếu lựa chọn
  normalizeMultipleChoiceOptions(questions);

  return {
    questions,
    errors,
    totalRows: lines.length,
    fileName: file.name
  };
}

function buildQuestion(prompt: string, options: string[], answer: string, exp: string, index: number): Question {
  let resolvedAnswer = answer;
  // Nếu đáp án là 'A', 'B', 'C', 'D' và có options
  if (['a', 'b', 'c', 'd'].includes(answer.toLowerCase()) && options.length > 0) {
    const idx = ['a', 'b', 'c', 'd'].indexOf(answer.toLowerCase());
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
    explanation: exp || `Đáp án chính xác là: ${resolvedAnswer || options[0] || ''}`,
    example: '',
    memoryTip: ''
  };
}

/**
 * Trích xuất danh sách câu hỏi từ các bản ghi Table/JSON
 */
function extractQuestionsFromRecords(records: Record<string, any>[], fileName: string): ParsedQuestionResult {
  const questions: Question[] = [];
  const errors: string[] = [];

  records.forEach((row, index) => {
    // Tìm các trường dựa trên tên cột linh hoạt (không phân biệt chữ hoa/thường, có dấu hoặc không dấu)
    const rowKeys = Object.keys(row);
    const getVal = (patterns: string[]): string => {
      for (const pattern of patterns) {
        const foundKey = rowKeys.find(k => {
          const normalized = k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return normalized.includes(pattern);
        });
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    // Tìm câu hỏi / khái niệm
    const prompt = getVal(['cau hoi', 'khai niem', 'term', 'question', 'noi dung', 'de bai', 'tu vung']);
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
      // nếu thiếu chỗ thì thêm vào
      if (options.length < 4) {
        options.push(answer);
      }
    }

    // Nếu chỉ có prompt và answer (như file 2 cột Thuật ngữ - Định nghĩa)
    if (options.length === 0 && answer) {
      options = [answer];
    }

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
 * Đảm bảo mỗi câu trắc nghiệm có đủ 4 lựa chọn bằng cách mượn các đáp án từ câu khác nếu file import chỉ có Thuật ngữ & Định nghĩa
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
    },
    {
      'Câu hỏi': 'Điều kiện để ma trận vuông A khả nghịch (tồn tại ma trận nghịch đảo A⁻¹) là gì?',
      'Lựa chọn A': 'Định thức det(A) ≠ 0',
      'Lựa chọn B': 'Định thức det(A) = 0',
      'Lựa chọn C': 'Hạng của ma trận r(A) < n',
      'Lựa chọn D': 'Tất cả các phần tử trên đường chéo chính bằng 1',
      'Đáp án đúng': 'Định thức det(A) ≠ 0',
      'Giải thích': 'Một ma trận vuông cấp n khả nghịch khi và chỉ khi định thức của nó khác 0 (det(A) ≠ 0), lúc đó ma trận không suy biến.',
      'Ví dụ': 'Cho A = [[2, 0], [0, 3]]. Khi đó det(A) = 6 ≠ 0 => A khả nghịch và A⁻¹ = [[1/2, 0], [0, 1/3]].',
      'Mẹo nhớ': 'Khả nghịch = Không suy biến = Định thức Khác không (Khả - Khác).'
    },
    {
      'Câu hỏi': 'Từ vựng tiếng Anh học thuật: "Ubiquitous" mang ý nghĩa gì?',
      'Lựa chọn A': 'Có mặt ở khắp mọi nơi cùng một lúc (omnipresent)',
      'Lựa chọn B': 'Hiếm gặp và khó tìm thấy',
      'Lựa chọn C': 'Mơ hồ, không rõ ràng',
      'Lựa chọn D': 'Tạm thời, mang tính ngắn hạn',
      'Đáp án đúng': 'Có mặt ở khắp mọi nơi cùng một lúc (omnipresent)',
      'Giải thích': 'Ubiquitous /juːˈbɪk.wə.təs/ là tính từ diễn tả điều gì đó dường như xuất hiện ở khắp mọi nơi, rất phổ biến.',
      'Ví dụ': 'Smartphones have become ubiquitous in daily modern student life.',
      'Mẹo nhớ': 'U-BI-QUITOUS: liên tưởng "You be everywhere" - ở đâu cũng thấy bạn.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Tự động căn chỉnh độ rộng cột
  worksheet['!cols'] = [
    { wch: 45 }, // Câu hỏi
    { wch: 30 }, // Lựa chọn A
    { wch: 30 }, // Lựa chọn B
    { wch: 30 }, // Lựa chọn C
    { wch: 30 }, // Lựa chọn D
    { wch: 32 }, // Đáp án đúng
    { wch: 45 }, // Giải thích
    { wch: 40 }, // Ví dụ
    { wch: 35 }, // Mẹo nhớ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoiMau');
  XLSX.writeFile(workbook, 'UniFlash_File_Cau_Hoi_Mau.xlsx');
}

/**
 * Tải file mẫu CSV (.csv)
 */
export function downloadCsvTemplate() {
  const csvContent = 
`"Câu hỏi","Lựa chọn A","Lựa chọn B","Lựa chọn C","Lựa chọn D","Đáp án đúng","Giải thích","Ví dụ","Mẹo nhớ"
"Thuật ngữ nào chỉ tình trạng giá cả chung tăng liên tục?","Lạm phát","Giảm phát","Đình lạm","Bong bóng kinh tế","Lạm phát","Lạm phát là sự gia tăng mức giá chung kéo dài làm giảm sức mua.","Giá xăng dầu tăng kéo theo giá hàng tiêu dùng tăng","Lạm = thừa thãi, phát = bộc phát giá"
"Quy luật chỉ ra CÁCH THỨC của sự vận động trong Triết học Mác - Lênin?","Quy luật Lượng - Chất","Quy luật Mâu thuẫn","Quy luật Phủ định của phủ định","Quy luật Giá trị","Quy luật Lượng - Chất","Tích lũy về lượng đến điểm nút sẽ tạo bước nhảy đổi về chất","Học đủ 130 tín chỉ để tốt nghiệp cử nhân","Lượng - Chất: Cách thức; Mâu thuẫn: Động lực"
"Định thức det(A) khác 0 là điều kiện để ma trận vuông A:","Có ma trận nghịch đảo (khả nghịch)","Bằng ma trận đơn vị","Có hạng bằng 0","Đối xứng qua đường chéo","Có ma trận nghịch đảo (khả nghịch)","Ma trận vuông cấp n khả nghịch khi và chỉ khi det(A) khác 0","A có det(A)=5 thì tồn tại A mũ -1","Khác 0 là Khả nghịch"`;

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
