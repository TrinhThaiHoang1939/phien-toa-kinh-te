// Danh sách tình huống. Mỗi tình huống xoay quanh một luận điểm lấy từ giáo trình (Chương 4, Mục II–III).
// - prosecution: Công tố viên BẢO VỆ luận điểm (khớp với giáo trình).
// - defense: Luật sư PHẢN BIỆN luận điểm (phản đề, khó hơn).
// - focus: vấn đề vận dụng của từng vòng (vòng 1, 2, 3).
// - sources: mã các đoạn giáo trình liên quan (xem data/corpus.js).
// - hints: gợi ý lập luận cho mỗi bên (hiển thị cho người chơi và dùng cho chế độ thử).
window.CASES = [
  {
    id: "omega",
    focus: ["Hiện tượng của Omega thể hiện đặc điểm kinh tế nào của độc quyền? Tư bản tài chính và tài phiệt là gì?", "Vì sao chỉ với lượng vốn nhỏ, ông K. lại khống chế được khối tư bản lớn gấp nhiều lần?", "Cổ phiếu được phát hành rộng rãi ngày nay làm suy yếu hay củng cố quyền lực của tư bản tài chính?"],
    title: "Tập đoàn Omega và “chế độ tham dự”",
    topic: "Tư bản tài chính, tài phiệt",
    story: "Ông K. chỉ nắm 51% cổ phiếu của Omega Holding (công ty mẹ). Omega nắm cổ phiếu khống chế 12 công ty con; các công ty con lại chi phối hơn 40 “công ty cháu” trong ngân hàng, bảo hiểm, bất động sản và truyền thông. Với số vốn bỏ ra nhỏ, ông K. điều khiển một khối tư bản lớn gấp nhiều lần.",
    claim: "Cấu trúc móc xích của Omega là biểu hiện sự thống trị của tư bản tài chính thông qua “chế độ tham dự”, không đơn thuần là một cách tổ chức đầu tư thông thường.",
    prosecution: "Chứng minh đây là công cụ để một nhóm tài phiệt khống chế khối tư bản lớn và chi phối đời sống kinh tế – xã hội.",
    defense: "Lập luận rằng đây chỉ là mô hình công ty mẹ – con thông thường, giúp huy động vốn; cổ phiếu phát hành rộng rãi đã giúp nhiều người dân trở thành cổ đông.",
    sources: ["II.1.b", "III.1.b"],
    hints: {
      prosecution: [
        "Nhờ móc xích mẹ – con – cháu, một lượng tư bản nhỏ khống chế khối tư bản lớn gấp nhiều lần [II.1.b]",
        "Cổ phiếu mệnh giá nhỏ không xoá quyền chi phối: “chế độ tham dự” được bổ sung bằng “chế độ ủy nhiệm” [III.1.b]",
        "Tài phiệt còn chi phối chính sách đối nội, đối ngoại của nhà nước [II.1.b]"
      ],
      defense: [
        "Cổ phiếu phát hành rộng rãi, nhiều tầng lớp dân cư đã trở thành cổ đông [III.1.b]",
        "Mô hình công ty mẹ – con giúp huy động vốn và phân tán rủi ro, là cách tổ chức kinh doanh phổ biến",
        "Mô hình tập đoàn mẹ – con cũng giúp mở rộng sản xuất, thúc đẩy lực lượng sản xuất phát triển [III.3.a]"
      ]
    },
    judgeQuestion: "“Chế độ ủy nhiệm” làm thay đổi hay củng cố quyền lực của các đại cổ đông? Hãy giải thích bằng giáo trình."
  },
  {
    id: "sme",
    focus: ["Các doanh nghiệp vừa và nhỏ ở nước Z có quan hệ thế nào với các concern? Đó là biểu hiện gì của độc quyền?", "Concern và conglomerate khác nhau thế nào? Vì sao độc quyền đa ngành phát triển?", "Doanh nghiệp vừa và nhỏ có thế mạnh riêng nào? Những thế mạnh đó có làm độc quyền suy yếu không?"],
    title: "“Thời đại của doanh nghiệp nhỏ”",
    topic: "Biểu hiện mới của tích tụ, tập trung tư bản",
    story: "Tại nước Z, số doanh nghiệp vừa và nhỏ tăng gấp ba trong 20 năm. Một nhóm nhà kinh tế tuyên bố: “Độc quyền đã suy yếu, thị trường đã trở lại tự do cạnh tranh.” Tuy nhiên phần lớn các doanh nghiệp này làm gia công linh kiện cho ba tập đoàn đa ngành (concern).",
    claim: "Sự phát triển của doanh nghiệp vừa và nhỏ không chứng minh độc quyền suy yếu; đó là biểu hiện của sự kiểm soát độc quyền dưới hình thức mới.",
    prosecution: "Chứng minh doanh nghiệp vừa và nhỏ phụ thuộc vào concern, conglomerate qua hệ thống gia công, và độc quyền vẫn chi phối.",
    defense: "Lập luận rằng số chủ thể kinh doanh tăng mạnh nghĩa là cạnh tranh tăng lên và vị thế độc quyền đã bị thu hẹp.",
    sources: ["III.1.a", "II.1.a"],
    hints: {
      prosecution: [
        "Hệ thống gia công khiến doanh nghiệp vừa và nhỏ phụ thuộc concern, conglomerate về nhiều mặt [III.1.a]",
        "Qua quan hệ hợp tác, độc quyền lớn mở rộng kiểm soát sản xuất và cả tiến bộ khoa học – công nghệ [III.1.a]",
        "Xu hướng của độc quyền là trở thành công ty xuyên quốc gia và liên minh với nhà nước [III.1.a]"
      ],
      defense: [
        "Doanh nghiệp vừa và nhỏ có thế mạnh riêng: nhạy bén, linh hoạt, dám đầu tư vào ngành mới [III.1.a]",
        "Luật chống độc quyền ở hầu hết các nước tư bản đã hạn chế độc quyền 100% một mặt hàng [III.1.a]",
        "Khi số lượng chủ thể tăng mạnh, cạnh tranh tất yếu gay gắt hơn"
      ]
    },
    judgeQuestion: "Vì sao concern ra đời lại được xem là cách để đối phó với luật chống độc quyền?"
  },
  {
    id: "giai-cuu",
    focus: ["Các gói giải cứu thể hiện đặc điểm nào của độc quyền nhà nước? Bản chất của sở hữu nhà nước là gì?", "Phân tích các chức năng của sở hữu nhà nước qua việc nhà nước nắm cổ phần Citigroup và AIG.", "Vai trò ổn định kinh tế vĩ mô của nhà nước tư sản hiện đại thực chất phục vụ lợi ích của ai?"],
    title: "Gói giải cứu ngân hàng 2008",
    topic: "Độc quyền nhà nước, sở hữu nhà nước",
    story: "Năm 2008–2009, Chính phủ Mỹ bơm 45 tỉ USD và bảo lãnh 301 tỉ USD tài sản độc hại cho Citigroup, giải cứu AIG hai lần với tổng số tiền 150 tỉ USD. Chính phủ Anh tung gói giải cứu ngân hàng thứ hai trị giá khoảng 145 tỉ USD.",
    claim: "Các gói giải cứu là biểu hiện của độc quyền nhà nước: ngân sách được dùng để bảo vệ lợi ích của các tập đoàn tư bản độc quyền.",
    prosecution: "Chứng minh nhà nước tư sản dùng ngân sách và sở hữu nhà nước để phục vụ tư bản độc quyền.",
    defense: "Lập luận rằng giải cứu là để ổn định kinh tế vĩ mô, bảo vệ người gửi tiền và người lao động; nhà nước còn thu về cổ phần.",
    sources: ["III.2.b", "II.2.b", "II.2.c"],
    hints: {
      prosecution: [
        "Trong khủng hoảng, ngân sách được dùng để cứu các tập đoàn lớn khỏi phá sản [III.2.b]",
        "Sở hữu nhà nước là sở hữu tập thể của giai cấp tư sản, phục vụ lợi ích tư bản độc quyền [II.2.b]",
        "Cơ chế điều tiết độc quyền nhà nước là thị trường có điều tiết nhằm phục vụ CNTB độc quyền [II.2.c]"
      ],
      defense: [
        "Nhà nước tư sản hiện đại là nhân tố quyết định ổn định kinh tế vĩ mô [III.2.b]",
        "Đổi lại, nhà nước nắm 36% cổ phần Citigroup và gần 80% cổ phần AIG [III.2.b]",
        "Nếu ngân hàng sụp đổ, người gửi tiền và người lao động chịu thiệt nhiều nhất"
      ]
    },
    judgeQuestion: "Việc nhà nước nắm cổ phần trong ngân hàng sau giải cứu thể hiện chức năng nào của sở hữu nhà nước theo giáo trình?"
  },
  {
    id: "phuc-loi",
    focus: ["Theo giáo trình, phúc lợi xã hội ở các nước tư bản phát triển hình thành từ đâu?", "Mục đích của nền sản xuất tư bản chủ nghĩa có thay đổi không? Dẫn chứng.", "Quan hệ sản xuất TBCN đã được điều chỉnh thế nào, và mâu thuẫn cơ bản còn tồn tại không?"],
    title: "“Chủ nghĩa tư bản đã được nhân đạo hoá”",
    topic: "Biểu hiện mới của độc quyền nhà nước",
    story: "Một bài báo dẫn chứng giáo dục và y tế miễn phí cho toàn dân ở Na Uy, phúc lợi xã hội cao ở nhiều nước châu Âu, rồi kết luận: chủ nghĩa tư bản hiện đại đã tự thay đổi bản chất và trở nên nhân đạo.",
    claim: "Phúc lợi xã hội ở các nước tư bản phát triển không chứng minh chủ nghĩa tư bản đã thay đổi bản chất.",
    prosecution: "Chứng minh phúc lợi là thành quả đấu tranh của nhân dân và là sự “chuẩn bị vật chất”, còn mục đích sản xuất và mâu thuẫn cơ bản vẫn giữ nguyên.",
    defense: "Lập luận rằng quan hệ sản xuất tư bản đã được điều chỉnh mang tính xã hội, thể chế ôn hoà hơn, nên bản chất đã thay đổi.",
    sources: ["III.2.b", "III.3.b1", "III.3.b4", "III.2.a"],
    hints: {
      prosecution: [
        "Giáo trình: phúc lợi là thành quả đấu tranh bền bỉ của nhân dân tiến bộ, không phải sự thức tỉnh của giai cấp tư sản [III.2.b]",
        "Mục đích sản xuất TBCN vẫn chủ yếu vì lợi ích thiểu số giai cấp tư sản [III.3.b1]",
        "Mâu thuẫn cơ bản của chủ nghĩa tư bản vẫn tồn tại [III.3.b4]"
      ],
      defense: [
        "Quan hệ sản xuất TBCN đã được điều chỉnh để mang tính xã hội hơn về hình thức [III.3.b4]",
        "Ưu tiên chi ngân sách cho môi trường, an sinh xã hội đã được luật pháp hoá [III.2.b]",
        "Thể chế kinh tế, chính trị ôn hoà hơn, ít cực đoan hơn trước [III.2.a]"
      ]
    },
    judgeQuestion: "Giáo trình gọi phúc lợi xã hội là “chuẩn bị vật chất của chủ nghĩa xã hội”. Cụm từ này có ý nghĩa gì?"
  },
  {
    id: "fdi",
    focus: ["Dự án BOT thuộc hình thức xuất khẩu tư bản nào? Bản chất của xuất khẩu tư bản là gì?", "Xuất khẩu tư bản ngày nay có những biểu hiện mới nào? Đánh giá nguyên tắc “cùng có lợi”.", "“Chiến lược biên giới mềm” là gì? Nước tiếp nhận đầu tư cần lưu ý điều gì?"],
    title: "Dự án BOT của tập đoàn xuyên quốc gia",
    topic: "Xuất khẩu tư bản, phân chia lãnh thổ ảnh hưởng",
    story: "Tập đoàn xuyên quốc gia T đầu tư một dự án BOT điện gió tại một nước đang phát triển, kèm hợp đồng mua thiết bị và thuê chuyên gia của chính T. Bên ủng hộ gọi đó là hợp tác cùng có lợi; bên phản đối gọi là “thực dân kiểu mới”.",
    claim: "Xuất khẩu tư bản ngày nay, dù có hình thức mới và đề cao cùng có lợi, vẫn là phương thức thu giá trị thặng dư và duy trì sự lệ thuộc của các nước đang phát triển.",
    prosecution: "Chứng minh bản chất xuất khẩu tư bản không đổi, và lệ thuộc về vốn, công nghệ có thể dẫn đến lệ thuộc chính trị.",
    defense: "Lập luận rằng áp đặt thực dân đã được gỡ bỏ, nguyên tắc cùng có lợi được đề cao, nước sở tại được chuyển giao công trình.",
    sources: ["II.1.c", "III.1.c", "III.1.đ", "III.2.c"],
    hints: {
      prosecution: [
        "Bản chất xuất khẩu tư bản là thu giá trị thặng dư ở nước nhập khẩu tư bản [II.1.c]",
        "Xuất khẩu tư bản đan xen với bán hàng hoá, dịch vụ, chất xám [III.1.c]",
        "“Chiến lược biên giới mềm”: lệ thuộc vốn, công nghệ dẫn đến lệ thuộc chính trị [III.1.đ]"
      ],
      defense: [
        "Áp đặt mang tính thực dân đã được gỡ bỏ dần, nguyên tắc cùng có lợi được đề cao [III.1.c]",
        "Dòng vốn ngày nay chủ yếu chảy giữa các nước phát triển; nước đang phát triển cũng xuất khẩu tư bản [III.1.c]",
        "Với BOT, công trình được chuyển giao cho nước sở tại sau thời hạn kinh doanh"
      ]
    },
    judgeQuestion: "Hãy phân biệt đầu tư trực tiếp và đầu tư gián tiếp, rồi cho biết BOT thuộc loại nào."
  },
  {
    id: "vinh-vien",
    focus: ["Chủ nghĩa tư bản có những vai trò tích cực nào đối với lịch sử phát triển của nhân loại?", "Chủ nghĩa tư bản có những giới hạn phát triển nào?", "Mâu thuẫn cơ bản của chủ nghĩa tư bản là gì, và vì sao nó quyết định CNTB không tồn tại vĩnh viễn?"],
    title: "“Chủ nghĩa tư bản là điểm cuối của lịch sử”",
    topic: "Vai trò lịch sử của chủ nghĩa tư bản",
    story: "Một diễn giả khẳng định: chủ nghĩa tư bản đã vượt qua mọi khủng hoảng, liên tục tự điều chỉnh và đưa nhân loại vào cách mạng công nghiệp lần thứ tư, vì vậy nó sẽ tồn tại vĩnh viễn.",
    claim: "Chủ nghĩa tư bản có vai trò lịch sử tích cực nhưng không tồn tại vĩnh viễn, vì không tự giải quyết được mâu thuẫn cơ bản của mình.",
    prosecution: "Chứng minh mâu thuẫn giữa trình độ xã hội hoá của lực lượng sản xuất và chế độ chiếm hữu tư nhân TBCN tất yếu dẫn đến sự thay thế.",
    defense: "Lập luận rằng khả năng tự điều chỉnh và thành tựu phát triển cho thấy chủ nghĩa tư bản sẽ còn tồn tại lâu dài, thậm chí vĩnh viễn.",
    sources: ["III.3.a", "III.3.b4", "III.3.b1"],
    hints: {
      prosecution: [
        "Mâu thuẫn giữa trình độ xã hội hoá ngày càng cao của LLSX với chiếm hữu tư nhân TBCN [III.3.b4]",
        "Quy luật quan hệ sản xuất phải phù hợp với trình độ lực lượng sản xuất [III.3.b4]",
        "Sự thống trị của độc quyền tạo ra nhân tố kìm hãm tiến bộ kỹ thuật [III.3.b1]"
      ],
      defense: [
        "CNTB thúc đẩy LLSX, xã hội hoá sản xuất và dẫn đầu cách mạng công nghiệp lần thứ tư [III.3.a]",
        "Sở hữu đã vận động từ tư nhân sang tập thể, sang nhà nước, phù hợp nhất định với LLSX [III.3.b4]",
        "Kinh tế TBCN thế giới từng có thời kỳ tăng trưởng với tốc độ cao hiếm thấy [III.3.b1]"
      ]
    },
    judgeQuestion: "Kể ba vai trò tích cực của chủ nghĩa tư bản theo giáo trình, và giải thích vì sao chúng không mâu thuẫn với kết luận CNTB không tồn tại vĩnh viễn."
  }
];
