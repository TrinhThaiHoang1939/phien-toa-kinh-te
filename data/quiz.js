// Ngân hàng câu hỏi trắc nghiệm, bám sát giáo trình (Chương 4, Mục II–III).
// answer: chỉ số đáp án đúng (0 = phương án đầu tiên). Khi hiển thị, các phương án được xáo trộn.
// cases: các tình huống dùng câu này làm "câu hỏi nhanh" (để trống = chỉ dùng trong Ôn tập nhanh).
window.QUIZ = [
  {
    id: "q01", cases: ["sme"], source: "II.1.a",
    q: "Hình thức tổ chức độc quyền nào mà các xí nghiệp tham gia vẫn độc lập cả về sản xuất và lưu thông, chỉ ký hiệp nghị về giá cả, sản lượng, thị trường?",
    options: ["Cartel", "Syndicate", "Trust", "Consortium"], answer: 0,
    explain: "Cartel là liên minh độc quyền không vững chắc: thành viên vẫn độc lập, chỉ cam kết thực hiện hiệp nghị, nên cartel thường tan vỡ trước kỳ hạn."
  },
  {
    id: "q02", cases: [], source: "II.1.a",
    q: "Các xí nghiệp tham gia syndicate mất tính độc lập ở khâu nào?",
    options: ["Lưu thông hàng hoá (mua, bán)", "Sản xuất", "Cả sản xuất và lưu thông", "Không mất độc lập ở khâu nào"], answer: 0,
    explain: "Trong syndicate, xí nghiệp vẫn độc lập về sản xuất; việc mua, bán do ban quản trị chung đảm nhận để mua rẻ, bán đắt."
  },
  {
    id: "q03", cases: [], source: "II.1.a",
    q: "Ở hình thức độc quyền nào, cả sản xuất và tiêu thụ do một ban quản trị thống nhất quản lý, còn các nhà tư bản tham gia trở thành cổ đông?",
    options: ["Trust", "Cartel", "Syndicate", "Conglomerate"], answer: 0,
    explain: "Trust cao hơn cartel và syndicate: các nhà tư bản tham gia thành cổ đông, nhận lợi nhuận theo cổ phần."
  },
  {
    id: "q04", cases: ["omega"], source: "II.1.b",
    q: "Theo V.I. Lênin, tư bản tài chính là kết quả của sự hợp nhất giữa:",
    options: ["Tư bản ngân hàng của một số ít ngân hàng độc quyền lớn nhất với tư bản của các liên minh độc quyền công nghiệp", "Tư bản thương nghiệp của các công ty buôn bán lớn với tư bản của các liên minh độc quyền công nghiệp", "Tư bản ngân hàng nhà nước với tư bản của các doanh nghiệp vừa và nhỏ trong công nghiệp", "Tư bản của các nhà đầu tư nước ngoài với tư bản của các ngân hàng thương mại trong nước"], answer: 0,
    explain: "Độc quyền hoá trong công nghiệp và ngân hàng xâm nhập vào nhau, làm nảy sinh tư bản tài chính và tầng lớp tài phiệt."
  },
  {
    id: "q05", cases: ["omega"], source: "II.1.b",
    q: "Thực chất của “chế độ tham dự” là gì?",
    options: ["Mua cổ phiếu khống chế công ty mẹ, công ty mẹ khống chế công ty con, công ty con khống chế công ty cháu…", "Mọi cổ đông lớn nhỏ cùng tham dự đại hội và quản lý công ty với quyền biểu quyết ngang nhau", "Nhà nước cử đại diện tham dự hội đồng quản trị để giám sát hoạt động của các tập đoàn tư nhân", "Ngân hàng tham dự vào công ty bằng cách cho vay dài hạn, không nắm giữ cổ phiếu khống chế nào"], answer: 0,
    explain: "Nhờ cách tổ chức móc xích này, tài phiệt dùng một lượng tư bản nhỏ để khống chế, điều tiết một lượng tư bản lớn gấp nhiều lần."
  },
  {
    id: "q06", cases: ["fdi"], source: "II.1.c",
    q: "Xuất khẩu tư bản là:",
    options: ["Xuất khẩu giá trị ra nước ngoài nhằm thu giá trị thặng dư và các nguồn lợi nhuận khác ở nước nhập khẩu tư bản", "Xuất khẩu hàng hoá ra nước ngoài nhằm thu ngoại tệ và mở rộng thị trường tiêu thụ cho sản phẩm trong nước", "Viện trợ không hoàn lại cho các nước đang phát triển nhằm giúp họ xây dựng kết cấu hạ tầng", "Chuyển lợi nhuận thu được ở nước ngoài về chính quốc để tái đầu tư vào sản xuất trong nước"], answer: 0,
    explain: "Xuất khẩu tư bản là đầu tư tư bản ra nước ngoài, thực hiện dưới hình thức đầu tư trực tiếp hoặc gián tiếp."
  },
  {
    id: "q07", cases: [], source: "II.1.c",
    q: "Cho vay để thu lợi tức, mua cổ phiếu, trái phiếu mà nhà đầu tư không trực tiếp quản lý thuộc hình thức nào?",
    options: ["Đầu tư gián tiếp", "Đầu tư trực tiếp", "Xuất khẩu hàng hoá", "Sở hữu nhà nước"], answer: 0,
    explain: "Đầu tư gián tiếp là đầu tư qua cho vay, mua chứng khoán, quỹ đầu tư… mà nhà đầu tư không trực tiếp tham gia quản lý."
  },
  {
    id: "q08", cases: [], source: "II.1.d",
    q: "Theo Lênin, vì sao các nhà tư sản chia nhau thế giới?",
    options: ["Vì sự tập trung đã tới mức buộc họ phải đi vào con đường ấy để kiếm lời", "Vì tính độc ác đặc biệt và tham vọng chính trị của giai cấp tư sản", "Vì nhà nước bắt buộc các doanh nghiệp lớn phải đầu tư ra nước ngoài", "Vì thị trường trong nước đã bị các doanh nghiệp nhỏ chiếm lĩnh hết"], answer: 0,
    explain: "Lênin nhấn mạnh nguyên nhân kinh tế: tích tụ, tập trung tư bản tới mức cao tất yếu dẫn tới phân chia thị trường thế giới."
  },
  {
    id: "q09", cases: ["giai-cuu"], source: "II.2.a",
    q: "Câu nói “Hôm nay là bộ trưởng, ngày mai là chủ ngân hàng; hôm nay là chủ ngân hàng, ngày mai là bộ trưởng” minh hoạ đặc điểm nào?",
    options: ["Sự kết hợp về nhân sự giữa tổ chức độc quyền và nhà nước", "Sự hình thành và phát triển của sở hữu nhà nước tư sản", "Độc quyền nhà nước là công cụ để nhà nước điều tiết kinh tế", "Sự xâm nhập của tư bản ngân hàng vào tư bản công nghiệp"], answer: 0,
    explain: "Đây là đặc điểm thứ nhất của độc quyền nhà nước; sự kết hợp nhân sự được thực hiện qua các đảng phái và các hội chủ xí nghiệp."
  },
  {
    id: "q10", cases: ["giai-cuu"], source: "II.2.b",
    q: "Sở hữu nhà nước trong chủ nghĩa tư bản độc quyền nhà nước, về bản chất, là:",
    options: [
      "Sở hữu tập thể của giai cấp tư sản, phục vụ lợi ích của tư bản độc quyền",
      "Sở hữu toàn dân",
      "Sở hữu của giai cấp công nhân",
      "Một hình thức sở hữu trung lập, đứng ngoài lợi ích giai cấp"
    ], answer: 0,
    explain: "Sở hữu nhà nước có nhiệm vụ ủng hộ và phục vụ lợi ích tư bản độc quyền nhằm duy trì sự tồn tại, phát triển của chủ nghĩa tư bản."
  },
  {
    id: "q11", cases: ["giai-cuu"], source: "II.2.c",
    q: "Cơ chế điều tiết kinh tế của độc quyền nhà nước là sự dung hợp của những cơ chế nào?",
    options: [
      "Thị trường, độc quyền tư nhân và điều tiết của nhà nước",
      "Kế hoạch hoá tập trung và bao cấp",
      "Thị trường tự do hoàn toàn, không có điều tiết",
      "Độc quyền nhà nước thay thế hoàn toàn thị trường"
    ], answer: 0,
    explain: "Đó là cơ chế thị trường có sự điều tiết của nhà nước nhằm phục vụ lợi ích của chủ nghĩa tư bản độc quyền."
  },
  {
    id: "q12", cases: [], source: "II.2.b",
    q: "Đâu là một chức năng của sở hữu nhà nước theo giáo trình?",
    options: ["Tạo điều kiện để tư bản độc quyền di chuyển dễ dàng sang những ngành kinh doanh hiệu quả hơn", "Thu hẹp phạm vi hoạt động của độc quyền tư nhân để bảo vệ các doanh nghiệp vừa và nhỏ", "Phân phối lại tư liệu sản xuất cho người lao động thông qua các doanh nghiệp nhà nước", "Thay thế cơ chế thị trường bằng mệnh lệnh hành chính trong các ngành then chốt"], answer: 0,
    explain: "Ba chức năng: mở rộng sản xuất TBCN; tạo điều kiện di chuyển tư bản giữa các ngành; làm chỗ dựa cho điều tiết kinh tế của nhà nước."
  },
  {
    id: "q13", cases: ["sme"], source: "III.1.a",
    q: "Mục đích chủ yếu của các conglomerate là gì?",
    options: [
      "Thu lợi nhuận từ kinh doanh chứng khoán",
      "Chuyên môn hoá sâu một mặt hàng",
      "Phục vụ đơn đặt hàng quân sự của nhà nước",
      "Gia công linh kiện cho các concern"
    ], answer: 0,
    explain: "Conglomerate kết hợp hàng chục hãng vừa và nhỏ không liên quan về sản xuất; vì vậy phần lớn dễ phá sản hoặc chuyển thành concern."
  },
  {
    id: "q14", cases: ["sme"], source: "III.1.a",
    q: "Hình thức tổ chức độc quyền nào ra đời một phần để đối phó với luật chống độc quyền?",
    options: ["Concern (độc quyền đa ngành)", "Cartel (hiệp nghị giá cả)", "Syndicate (thống nhất mua bán)", "Trust (thống nhất quản lý)"], answer: 0,
    explain: "Concern là tổ chức độc quyền đa ngành; luật chống độc quyền cấm độc quyền 100% mặt hàng trong một ngành, nên độc quyền mở rộng ra nhiều ngành."
  },
  {
    id: "q15", cases: ["sme"], source: "III.1.a",
    q: "Theo giáo trình, nguyên nhân thứ nhất khiến doanh nghiệp vừa và nhỏ phát triển ở các nước tư bản là:",
    options: ["Khoa học – công nghệ cho phép tiêu chuẩn hoá, chuyên môn hoá sâu, hình thành hệ thống gia công", "Luật chống độc quyền đã chia nhỏ các tập đoàn lớn thành nhiều doanh nghiệp độc lập", "Nhà nước cấm các tập đoàn lớn mở rộng sang ngành mới để nhường chỗ cho doanh nghiệp nhỏ", "Người tiêu dùng chuyển sang ưa chuộng sản phẩm thủ công của các xưởng sản xuất nhỏ lẻ"], answer: 0,
    explain: "Hệ thống gia công khiến doanh nghiệp vừa và nhỏ phụ thuộc vào concern, conglomerate — một biểu hiện của độc quyền dưới dạng mới."
  },
  {
    id: "q16", cases: ["omega"], source: "III.1.b",
    q: "“Chế độ ủy nhiệm” bổ sung cho “chế độ tham dự” có nghĩa là:",
    options: ["Đại cổ đông được ủy nhiệm thay mặt các cổ đông nhỏ quyết định phương hướng hoạt động của công ty", "Cổ đông nhỏ được ủy nhiệm lập ban kiểm soát để giám sát và hạn chế quyền của đại cổ đông", "Nhà nước ủy nhiệm cho ngân hàng lớn thay mặt mình quản lý vốn tại các doanh nghiệp", "Hội đồng quản trị ủy nhiệm toàn quyền điều hành cho giám đốc, cổ đông không can thiệp"], answer: 0,
    explain: "Cổ phiếu mệnh giá nhỏ được phát hành rộng rãi, nhưng quyền quyết định vẫn thuộc về các chủ sở hữu lớn."
  },
  {
    id: "q17", cases: ["fdi"], source: "III.1.c",
    q: "Những thập kỷ gần đây, đại bộ phận dòng đầu tư tư bản chảy theo hướng nào?",
    options: [
      "Qua lại giữa các nước tư bản phát triển với nhau",
      "Chủ yếu từ nước phát triển sang nước kém phát triển",
      "Chủ yếu từ nước đang phát triển sang nước phát triển",
      "Chỉ trong nội bộ từng quốc gia"
    ], answer: 0,
    explain: "Các nước phát triển có ngành hàm lượng khoa học – kỹ thuật và vốn cao, lợi nhuận cao; nước đang phát triển có hạ tầng lạc hậu, rủi ro hơn."
  },
  {
    id: "q18", cases: ["fdi"], source: "III.1.c",
    q: "BOT là hình thức đầu tư:",
    options: ["Xây dựng – kinh doanh – chuyển giao", "Xây dựng – chuyển giao", "Mua cổ phiếu – nắm giữ – bán", "Cho vay – thu lãi – gia hạn"], answer: 0,
    explain: "BOT (Build-Operate-Transfer) là hình thức mới của đầu tư trực tiếp, cho thấy xuất khẩu tư bản ngày càng đa dạng."
  },
  {
    id: "q19", cases: ["fdi"], source: "III.1.đ",
    q: "“Chiến lược biên giới mềm” của các cường quốc tư bản là:",
    options: ["Bành trướng “biên giới kinh tế” rộng hơn biên giới địa lý, ràng buộc các nước kém phát triển qua lệ thuộc vốn, công nghệ", "Nới lỏng kiểm soát biên giới để lao động từ các nước đang phát triển tự do di cư sang nước tư bản phát triển", "Xoá bỏ thuế quan giữa các nước trong khu vực để hình thành thị trường chung bình đẳng cho mọi thành viên", "Dùng sức mạnh quân sự trực tiếp để chiếm đóng và chia lại lãnh thổ thuộc địa giữa các cường quốc"], answer: 0,
    explain: "Lệ thuộc về vốn, công nghệ có thể dẫn đến lệ thuộc về chính trị, lúc ngấm ngầm, lúc công khai."
  },
  {
    id: "q20", cases: ["phuc-loi"], source: "III.2.b",
    q: "Theo giáo trình, phúc lợi xã hội cao ở một số nước tư bản phát triển là:",
    options: ["Thành quả đấu tranh bền bỉ của nhân dân tiến bộ, là sự “chuẩn bị vật chất” cho chủ nghĩa xã hội", "Sự thức tỉnh tự nguyện của giai cấp tư sản trước yêu cầu phát triển bền vững của xã hội", "Bằng chứng cho thấy chủ nghĩa tư bản hiện đại đã thay đổi bản chất và được nhân đạo hoá", "Kết quả tự nhiên của cạnh tranh tự do, khi doanh nghiệp buộc phải chia sẻ lợi nhuận"], answer: 0,
    explain: "Giáo trình khẳng định sẽ là sai lầm nếu coi đó là sự nhân đạo hoá của chủ nghĩa tư bản."
  },
  {
    id: "q21", cases: ["phuc-loi"], source: "III.3.b1",
    q: "Mục đích của nền sản xuất tư bản chủ nghĩa chủ yếu vì lợi ích của:",
    options: ["Thiểu số giai cấp tư sản, tư bản độc quyền", "Đông đảo quần chúng nhân dân lao động", "Toàn xã hội một cách bình đẳng như nhau", "Nhà nước với tư cách đại diện xã hội"], answer: 0,
    explain: "Do dựa trên chế độ chiếm hữu tư nhân TBCN về tư liệu sản xuất, phân phối sản phẩm bị chi phối vì lợi ích thiểu số."
  },
  {
    id: "q22", cases: ["phuc-loi", "vinh-vien"], source: "III.3.b4",
    q: "Mâu thuẫn cơ bản của chủ nghĩa tư bản là mâu thuẫn giữa:",
    options: ["Trình độ xã hội hoá ngày càng cao của lực lượng sản xuất với chế độ chiếm hữu tư nhân TBCN về tư liệu sản xuất", "Trình độ phát triển của doanh nghiệp lớn với khả năng cạnh tranh của doanh nghiệp vừa và nhỏ", "Lợi ích của các nước tư bản phát triển với lợi ích của các nước đang phát triển nhận đầu tư", "Tổng cung hàng hoá ngày càng tăng với tổng cầu có khả năng thanh toán trên thị trường"], answer: 0,
    explain: "Chủ nghĩa tư bản không tự giải quyết được mâu thuẫn này, nên sẽ bị thay thế bởi một hình thái kinh tế – xã hội tiến bộ hơn."
  },
  {
    id: "q23", cases: ["vinh-vien"], source: "III.3.a",
    q: "Đâu KHÔNG phải là vai trò tích cực của chủ nghĩa tư bản theo giáo trình?",
    options: [
      "Xoá bỏ phân hoá giàu – nghèo",
      "Thúc đẩy lực lượng sản xuất phát triển nhanh chóng",
      "Chuyển nền sản xuất nhỏ thành nền sản xuất lớn hiện đại",
      "Thực hiện xã hội hoá sản xuất"
    ], answer: 0,
    explain: "Ngược lại, phân hoá giàu – nghèo là một giới hạn của chủ nghĩa tư bản và có xu hướng ngày càng sâu sắc."
  },
  {
    id: "q24", cases: ["vinh-vien"], source: "III.3.b4",
    q: "Về hình thức, quan hệ sở hữu tư bản chủ nghĩa đã vận động theo trình tự nào?",
    options: ["Sở hữu tư nhân → sở hữu tập thể của các nhà tư bản → sở hữu nhà nước tư sản", "Sở hữu nhà nước tư sản → sở hữu tập thể của các nhà tư bản → sở hữu tư nhân", "Sở hữu tập thể của các nhà tư bản → sở hữu tư nhân → sở hữu toàn dân", "Sở hữu tư nhân → sở hữu nhà nước tư sản → sở hữu tập thể của người lao động"], answer: 0,
    explain: "Sự điều chỉnh này phù hợp nhất định với trình độ xã hội hoá của lực lượng sản xuất, nhưng mâu thuẫn cơ bản vẫn tồn tại."
  }
];
