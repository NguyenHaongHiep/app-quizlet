import { Course, StudySet } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-eng',
    code: 'ENG201',
    name: 'Tiếng Anh Học Thuật & IELTS',
    description: 'Từ vựng học thuật (Academic Word List), thành ngữ và cấu trúc trọng tâm band 6.5 - 8.0.',
    icon: 'Languages',
    color: '#4F46E5', // Indigo
    semester: 'Học kỳ 1 - 2026',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-phi',
    code: 'PHI101',
    name: 'Triết học Mác - Lênin',
    description: 'Học phần lý luận chính trị: Các quy luật biện chứng duy vật, phạm trù, thực tiễn và nhận thức.',
    icon: 'BookOpen',
    color: '#DC2626', // Red
    semester: 'Học kỳ 1 - 2026',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-mat',
    code: 'MAT102',
    name: 'Đại số Tuyến tính & Toán cao cấp',
    description: 'Không gian véctơ, ma trận khả nghịch, định thức, hệ phương trình tuyến tính và chéo hóa ma trận.',
    icon: 'Binary',
    color: '#0284C7', // Sky Blue
    semester: 'Học kỳ 1 - 2026',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'course-eco',
    code: 'ECO101',
    name: 'Kinh tế học Vi mô',
    description: 'Nguyên lý kinh tế học, cơ chế thị trường, cung cầu, độ co giãn và thặng dư sản xuất - tiêu dùng.',
    icon: 'TrendingUp',
    color: '#059669', // Emerald
    semester: 'Học kỳ 2 - 2026',
    createdAt: '2026-09-01T08:00:00Z',
  }
];

export const INITIAL_STUDY_SETS: StudySet[] = [
  {
    id: 'set-eng-01',
    courseId: 'course-eng',
    title: 'Từ vựng Học thuật Trọng điểm (Band 7.0+)',
    description: 'Các từ vựng cao cấp thường xuất hiện trong bài đọc Reading & Viết luận Task 2 IELTS.',
    color: '#4F46E5',
    icon: 'Sparkles',
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-10-10T14:30:00Z',
    questions: [
      {
        id: 'q-eng-1',
        type: 'multiple_choice',
        prompt: 'Từ vựng nào đồng nghĩa với "Ubiquitous" (có mặt ở khắp mọi nơi)?',
        options: ['Omnipresent', 'Obscure', 'Ephemeral', 'Pretentious'],
        correctAnswer: 'Omnipresent',
        explanation: '"Ubiquitous" và "Omnipresent" đều là tính từ chỉ trạng thái hiện diện ở khắp mọi nơi cùng một lúc.',
        example: 'Plastic waste has become ubiquitous in our marine ecosystems.',
        memoryTip: 'U-bi: You be everywhere (bạn ở khắp mọi nơi).'
      },
      {
        id: 'q-eng-2',
        type: 'multiple_choice',
        prompt: 'Trong ngữ cảnh học thuật, động từ "Exacerbate" có nghĩa là gì?',
        options: ['Làm trầm trọng thêm vấn đề', 'Giải quyết triệt để', 'Làm giảm nhẹ bớt', 'Cân bằng lại'],
        correctAnswer: 'Làm trầm trọng thêm vấn đề',
        explanation: '"Exacerbate" có nghĩa là làm cho một tình huống xấu, căn bệnh hoặc vấn đề trở nên tồi tệ hơn.',
        example: 'The economic downturn has only exacerbated the housing crisis.',
        memoryTip: 'Exacerbate nghe gần giống "Ex-aggravate" -> làm tăng độ căng thẳng, trầm trọng.'
      },
      {
        id: 'q-eng-3',
        type: 'fill_blank',
        prompt: 'Điền từ còn thiếu vào chỗ trống: "The government should implement policies to _________ (giảm thiểu/làm dịu bớt) the effects of global warming."',
        correctAnswer: 'mitigate',
        options: ['mitigate', 'aggravate', 'deteriorate', 'stimulate'],
        explanation: '"Mitigate" có nghĩa là làm giảm bớt mức độ nghiêm trọng, đau đớn hay nguy hại của sự việc.',
        example: 'Technological innovations can help mitigate greenhouse gas emissions.',
        memoryTip: 'Mitigate: "Miti" gần như Mini -> thu nhỏ, làm giảm tác hại.'
      },
      {
        id: 'q-eng-4',
        type: 'matching',
        prompt: 'Nối các từ vựng học thuật sau với định nghĩa tương ứng:',
        correctAnswer: 'Pragmatic - Thực tế, thực dụng; Ambiguous - Mơ hồ, đa nghĩa; Plausible - Hợp lý, có thể tin được; Prolific - Sinh sôi nhiều, sáng tác dồi dào',
        explanation: 'Đây là 4 tính từ xuất hiện với tần suất cực cao trong các đề thi đọc hiểu học thuật.',
        example: 'A pragmatic approach helps solve complex logistical challenges.',
        memoryTip: 'Pragmatic gắn với Practical; Plausible gắn với Possible/Believable.',
        matchingPairs: [
          { id: 'm1', left: 'Pragmatic', right: 'Thực tế, thực dụng và giải quyết vấn đề hiệu quả' },
          { id: 'm2', left: 'Ambiguous', right: 'Mơ hồ, có thể hiểu theo nhiều nghĩa khác nhau' },
          { id: 'm3', left: 'Plausible', right: 'Có vẻ hợp lý, đáng tin cậy dựa trên lý lẽ' },
          { id: 'm4', left: 'Prolific', right: 'Sản xuất hoặc sáng tác rất nhiều tác phẩm' }
        ]
      },
      {
        id: 'q-eng-5',
        type: 'ordering',
        prompt: 'Sắp xếp các bước chuẩn mực khi viết một đoạn văn lập luận trong IELTS Writing Task 2 (Mô hình PEEL):',
        correctAnswer: 'Point (Nêu luận điểm) -> Explanation (Giải thích chi tiết) -> Evidence/Example (Ví dụ minh chứng) -> Link (Câu liên kết kết luận)',
        orderingItems: [
          'Point (Nêu luận điểm chính của đoạn)',
          'Explanation (Giải thích lý do và cơ chế vận hành)',
          'Evidence/Example (Cung cấp ví dụ thực tế hoặc số liệu)',
          'Link (Liên kết ngược lại với luận đề của toàn bài)'
        ],
        explanation: 'Quy tắc PEEL (Point - Explanation - Example - Link) giúp đoạn văn đạt điểm tuyệt đối tiêu chí Coherence & Cohesion.',
        example: 'Bắt đầu bằng câu chủ đề rõ ràng, sau đó phân tích vì sao nó đúng, đưa ví dụ chứng minh và câu chốt.',
        memoryTip: 'Nhớ từ viết tắt: P - E - E - L (như quả chuối bóc vỏ gọn gàng từng bước).'
      },
      {
        id: 'q-eng-6',
        type: 'multiple_choice',
        prompt: 'Cụm Collocation nào đi với "scrutiny" mang nghĩa "bị kiểm tra/soi xét kỹ lưỡng"?',
        options: ['Come under scrutiny', 'Make under scrutiny', 'Put on scrutiny', 'Take off scrutiny'],
        correctAnswer: 'Come under scrutiny',
        explanation: '"Come under close/intense scrutiny" là thành ngữ cố định diễn tả việc một hành động, chính sách bị dư luận hoặc cơ quan chức năng kiểm tra nghiêm ngặt.',
        example: 'Corporate spending has come under intense scrutiny in recent months.',
        memoryTip: 'Đi tới dưới kính lúp soi xét = Come under scrutiny.'
      }
    ]
  },
  {
    id: 'set-phi-01',
    courseId: 'course-phi',
    title: 'Phép Biện chứng Duy vật & 3 Quy luật Cơ bản',
    description: 'Trọng tâm ôn thi học kỳ Triết học: Quy luật Lượng-Chất, Mâu thuẫn, Phủ định của phủ định.',
    color: '#DC2626',
    icon: 'Compass',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-10-11T16:00:00Z',
    questions: [
      {
        id: 'q-phi-1',
        type: 'multiple_choice',
        prompt: 'Quy luật nào trong phép biện chứng duy vật vạch ra CÁCH THỨC của sự vận động và phát triển?',
        options: [
          'Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến sự thay đổi về chất và ngược lại',
          'Quy luật thống nhất và đấu tranh của các mặt đối lập',
          'Quy luật phủ định của phủ định',
          'Quy luật về sự phù hợp của quan hệ sản xuất với tính chất và trình độ của lực lượng sản xuất'
        ],
        correctAnswer: 'Quy luật chuyển hóa từ những thay đổi về lượng dẫn đến sự thay đổi về chất và ngược lại',
        explanation: 'Quy luật Lượng - Chất chỉ ra CÁCH THỨC (tích lũy dần về lượng đạt đến điểm nút thực hiện bước nhảy biến đổi về chất). Quy luật Mâu thuẫn chỉ ra NGUỒN GỐC, ĐỘNG LỰC. Quy luật Phủ định của phủ định chỉ ra KHUYNH HƯỚNG.',
        example: 'Nước ở áp suất tiêu chuẩn đun từ 20°C lên 99°C chỉ thay đổi về nhiệt độ (lượng). Đến 100°C (điểm nút) xảy ra bước nhảy chuyển thành thể hơi (chất mới).',
        memoryTip: 'Lượng - Chất: Cách thức; Mâu thuẫn: Nguồn gốc; Phủ định: Khuynh hướng.'
      },
      {
        id: 'q-phi-2',
        type: 'multiple_choice',
        prompt: 'Khoảng giới hạn mà trong đó sự thay đổi về lượng CHƯA làm thay đổi căn bản về chất của sự vật được gọi là gì?',
        options: ['Độ', 'Điểm nút', 'Bước nhảy', 'Lượng cực đại'],
        correctAnswer: 'Độ',
        explanation: '"Độ" là phạm trù triết học chỉ sự thống nhất giữa chất và lượng, là khoảng giới hạn mà sự thay đổi về lượng chưa làm thay đổi căn bản về chất.',
        example: 'Nước ở thể lỏng trong khoảng nhiệt độ từ 0°C đến 100°C: Khoảng 0°C - 100°C chính là "Độ" của trạng thái lỏng.',
        memoryTip: 'Độ là khoảng dung sai cho phép biến động mà chất vẫn giữ nguyên bản.'
      },
      {
        id: 'q-phi-3',
        type: 'multiple_choice',
        prompt: 'Thực tiễn đóng vai trò gì đối với nhận thức theo quan điểm của chủ nghĩa duy vật biện chứng?',
        options: [
          'Là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý',
          'Chỉ là phương tiện hỗ trợ việc kiểm tra lý thuyết trừu tượng',
          'Là sản phẩm của nhận thức tinh thần thuần túy',
          'Hoàn toàn độc lập và không liên quan gì tới quá trình tư duy'
        ],
        correctAnswer: 'Là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý',
        explanation: 'Thực tiễn có 4 vai trò quyết định đối với nhận thức: 1. Là cơ sở của nhận thức; 2. Là động lực thúc đẩy nhận thức; 3. Là mục đích cuối cùng của nhận thức; 4. Là tiêu chuẩn duy nhất để kiểm tra chân lý.',
        example: 'Nhờ lao động sản xuất và nghiên cứu lâm sàng (thực tiễn), con người mới nhận thức được cấu trúc virus và điều chế vắc-xin bảo vệ sinh mạng.',
        memoryTip: '4 chữ vàng Thực Tiễn: Cơ sở - Động lực - Mục đích - Tiêu chuẩn chân lý.'
      },
      {
        id: 'q-phi-4',
        type: 'matching',
        prompt: 'Hãy nối các phạm trù triết học với ý nghĩa phương pháp luận tương ứng:',
        correctAnswer: 'Cái chung và Cái riêng - Không được tuyệt đối hóa cái nào; Nguyên nhân và Kết quả - Muốn triệt tiêu hiện tượng phải loại bỏ nguyên nhân; Nội dung và Hình thức - Nội dung quyết định hình thức; Bản chất và Hiện tượng - Phải đi sâu vào bản chất qua nhiều hiện tượng',
        explanation: 'Các cặp phạm trù phản ánh những mối liên hệ phổ biến nhất giữa các sự vật, hiện tượng trong thế giới khách quan.',
        example: 'Xem xét nhiều biểu hiện giá cả tăng vọt (hiện tượng) để nhận định bản chất lạm phát của nền kinh tế.',
        memoryTip: 'Luôn tìm nguyên nhân gốc rễ và chú trọng nội dung bên trong thay vì vỏ bọc.',
        matchingPairs: [
          { id: 'mp1', left: 'Nguyên nhân và Kết quả', right: 'Mối quan hệ nhân quả có tính khách quan, muốn xử lý hiện tượng phải truy nguồn gốc sinh ra nó' },
          { id: 'mp2', left: 'Bản chất và Hiện tượng', right: 'Hiện tượng phản ánh bản chất nhưng có thể bị bóp méo, phải quan sát đa diện để nắm lấy bản chất' },
          { id: 'mp3', left: 'Nội dung và Hình thức', right: 'Nội dung giữ vai trò quyết định, hình thức tác động trở lại kìm hãm hoặc thúc đẩy' },
          { id: 'mp4', left: 'Khả năng và Hiện thực', right: 'Cần dựa vào hiện thực để hành động, đồng thời dự liệu các khả năng trong tương lai' }
        ]
      },
      {
        id: 'q-phi-5',
        type: 'ordering',
        prompt: 'Sắp xếp quá trình nhận thức biện chứng theo luận điểm nổi tiếng của V.I. Lênin:',
        correctAnswer: 'Trực quan sinh động (Nhận thức cảm tính) -> Tư duy trừu tượng (Nhận thức lý tính) -> Thực tiễn (Kiểm nghiệm chân lý)',
        orderingItems: [
          'Từ trực quan sinh động (cảm giác, tri giác, biểu tượng)',
          'Đến tư duy trừu tượng (khái niệm, phán đoán, suy luận)',
          'Đến thực tiễn (áp dụng kiểm nghiệm và cải tạo thế giới)'
        ],
        explanation: '"Từ trực quan sinh động đến tư duy trừu tượng, và từ tư duy trừu tượng đến thực tiễn - đó là con đường biện chứng của sự nhận thức chân lý, của sự nhận thức thực tại khách quan" (V.I. Lênin).',
        example: 'Quan sát táo rơi (cảm tính) -> Xây dựng định luật vạn vật hấp dẫn (lý tính) -> Phóng vệ tinh không gian quỹ đạo chính xác (thực tiễn).',
        memoryTip: 'Cảm giác nhìn thấy -> Suy ngẫm phân tích -> Làm thử kiểm chứng.'
      }
    ]
  },
  {
    id: 'set-mat-01',
    courseId: 'course-mat',
    title: 'Ma trận, Định thức & Không gian Véctơ',
    description: 'Bộ câu hỏi tính toán và lý thuyết then chốt trong Đại số tuyến tính kỳ thi kết thúc học phần.',
    color: '#0284C7',
    icon: 'Cpu',
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-10-09T18:00:00Z',
    questions: [
      {
        id: 'q-mat-1',
        type: 'multiple_choice',
        prompt: 'Nếu ma trận A vuông cấp n có định thức det(A) = 3, thì det(2A) bằng bao nhiêu?',
        options: ['3 · 2ⁿ', '6', '2 · 3ⁿ', '6ⁿ'],
        correctAnswer: '3 · 2ⁿ',
        explanation: 'Theo tính chất của định thức: Nhân một số k vào ma trận cấp n tương đương nhân k vào cả n hàng, do đó det(kA) = kⁿ · det(A). Ở đây k = 2 nên det(2A) = 2ⁿ · det(A) = 3 · 2ⁿ.',
        example: 'Với ma trận cấp 3 (n=3) có det(A)=3: det(2A) = 2³ × 3 = 8 × 3 = 24.',
        memoryTip: 'Hệ số k ra ngoài định thức phải đội mũ bậc n: k -> kⁿ.'
      },
      {
        id: 'q-mat-2',
        type: 'multiple_choice',
        prompt: 'Điều kiện cần và đủ để hệ véctơ {v₁, v₂, ..., vₘ} độc lập tuyến tính là gì?',
        options: [
          'Đẳng thức c₁v₁ + c₂v₂ + ... + cₘvₘ = 0 chỉ xảy ra khi c₁ = c₂ = ... = cₘ = 0',
          'Tồn tại ít nhất một hệ số cᵢ khác 0 sao cho tổ hợp tuyến tính bằng 0',
          'Tất cả các véctơ đều khác véctơ không',
          'Số véctơ m phải bằng số chiều của không gian'
        ],
        correctAnswer: 'Đẳng thức c₁v₁ + c₂v₂ + ... + cₘvₘ = 0 chỉ xảy ra khi c₁ = c₂ = ... = cₘ = 0',
        explanation: 'Hệ độc lập tuyến tính nghĩa là không véctơ nào có thể biểu diễn qua các véctơ còn lại, tổ hợp bằng 0 khi và chỉ khi mọi hệ số đều tầm thường (bằng 0).',
        example: 'Hệ e₁ = (1, 0), e₂ = (0, 1) trong R² là độc lập tuyến tính vì c₁(1, 0) + c₂(0, 1) = (c₁, c₂) = (0, 0) <=> c₁ = c₂ = 0.',
        memoryTip: 'Độc lập = Tự thân = Chỉ toàn số 0 mới cân bằng được.'
      },
      {
        id: 'q-mat-3',
        type: 'fill_blank',
        prompt: 'Điền số thích hợp: Hạng của ma trận đơn vị cấp 4, ký hiệu rank(I₄), bằng ______.',
        correctAnswer: '4',
        options: ['4', '1', '0', '16'],
        explanation: 'Ma trận đơn vị cấp n có n hàng độc lập tuyến tính, định thức det(Iₙ) = 1 ≠ 0, do đó hạng của ma trận luôn đúng bằng cấp n. Với I₄, hạng rank(I₄) = 4.',
        example: 'Ma trận I₄ có 4 số 1 trên đường chéo chính và toàn bộ phần tử khác bằng 0.',
        memoryTip: 'Ma trận đơn vị cấp bao nhiêu thì hạng bấy nhiêu.'
      },
      {
        id: 'q-mat-4',
        type: 'multiple_choice',
        prompt: 'Véctơ x ≠ 0 được gọi là véctơ riêng của ma trận vuông A ứng với giá trị riêng λ nếu thỏa mãn phương trình nào?',
        options: [
          'A·x = λ·x',
          'A·x = λ',
          'det(A - λI) = x',
          'A + λI = x'
        ],
        correctAnswer: 'A·x = λ·x',
        explanation: 'Theo định nghĩa, véctơ riêng x là véctơ mà khi nhân với ma trận A thì chỉ bị co giãn theo tỉ lệ λ mà không đổi phương: A·x = λ·x.',
        example: 'Nếu A kéo dãn véctơ x lên gấp đôi theo cùng phương thì λ = 2 là trị riêng của A.',
        memoryTip: 'A nhân x bằng Lambda nhân x (phép biến đổi chỉ co giãn theo hệ số λ).'
      }
    ]
  },
  {
    id: 'set-eco-01',
    courseId: 'course-eco',
    title: 'Cung - Cầu & Độ co giãn của thị trường',
    description: 'Các khái niệm cơ bản của kinh tế vi mô: đường cầu, đường cung, trạng thái cân bằng và thuế.',
    color: '#059669',
    icon: 'Layers',
    createdAt: '2026-09-15T14:00:00Z',
    updatedAt: '2026-10-08T11:20:00Z',
    questions: [
      {
        id: 'q-eco-1',
        type: 'multiple_choice',
        prompt: 'Khi thu nhập của người tiêu dùng tăng lên, cầu về hàng hóa thứ cấp (inferior goods) sẽ biến động như thế nào?',
        options: [
          'Cầu giảm (đường cầu dịch sang trái)',
          'Cầu tăng (đường cầu dịch sang phải)',
          'Lượng cầu di chuyển dọc theo đường cầu cũ',
          'Cầu không đổi'
        ],
        correctAnswer: 'Cầu giảm (đường cầu dịch sang trái)',
        explanation: 'Hàng hóa thứ cấp là hàng hóa mà khi người tiêu dùng giàu lên, họ sẽ chuyển sang tiêu thụ hàng hóa cao cấp hơn thay thế, dẫn đến nhu cầu về hàng thứ cấp giảm.',
        example: 'Khi sinh viên đi làm có thu nhập cao hơn, họ ăn ít mì gói (hàng thứ cấp) lại và ăn nhiều cơm tiệm chất lượng cao hơn.',
        memoryTip: 'Thứ cấp = Đồ tạm bợ khi nghèo -> Có tiền là giảm tiêu dùng.'
      },
      {
        id: 'q-eco-2',
        type: 'multiple_choice',
        prompt: 'Nếu độ co giãn của cầu theo giá |E_D| > 1 (cầu co giãn nhiều), để tăng tổng doanh thu, doanh nghiệp nên làm gì?',
        options: [
          'Giảm giá bán hàng hóa',
          'Tăng giá bán hàng hóa',
          'Giữ nguyên giá bán',
          'Cắt giảm hoàn toàn sản lượng'
        ],
        correctAnswer: 'Giảm giá bán hàng hóa',
        explanation: 'Khi cầu co giãn nhiều (|E_D| > 1), phần trăm lượng cầu tăng lên sẽ lớn hơn phần trăm giá giảm, do đó Tổng doanh thu TR = P × Q sẽ tăng lên khi giảm giá.',
        example: 'Giảm giá vé máy bay 10% nhưng số lượng khách bay tăng 25% -> Doanh thu hãng bay tăng mạnh.',
        memoryTip: 'Co giãn lớn: Giảm giá thì Lượng mua tăng vọt bù lỗ giá.'
      }
    ]
  }
];
