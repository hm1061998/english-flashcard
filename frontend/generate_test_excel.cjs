const XLSX = require('xlsx');

const data = [
  ["HƯỚNG DẪN NHẬP LIỆU"],
  ["1. Cột 'Từ vựng': Nhập từ tiếng Anh cần học (Bắt buộc)"],
  ["2. Cột 'Phiên âm': Nhập phiên âm của từ (Không bắt buộc)"],
  ["3. Cột 'Nghĩa của từ': Nhập nghĩa tiếng Việt (Bắt buộc)"],
  ["4. Cột 'Ví dụ': Nhập câu ví dụ minh họa (Không bắt buộc)"],
  [""],
  ["Từ vựng", "Phiên âm", "Nghĩa của từ", "Ví dụ"],
  ["Resilient", "/rɪˈzɪl.jənt/", "Kiên cường, mau phục hồi", "She's a resilient girl who never gives up."],
  ["Melancholy", "/ˈmel.əŋ.kɒl.i/", "Nỗi u sầu, buồn bã", "The rainy weather always makes me feel melancholy."],
  ["Ephemeral", "/ɪˈfem.ər.əl/", "Phù du, chóng tàn", "Fame in the world of pop is often ephemeral."],
  ["Eloquent", "/ˈel.ə.kwənt/", "Hùng hồn, có tài hùng biện", "He made an eloquent plea for peace."],
  ["Solitude", "/ˈsɒl.ɪ.tjuːd/", "Sự biệt lập, trạng thái một mình", "I enjoyed the solitude of the mountains."],
  ["Paradox", "/ˈpær.ə.dɒks/", "Nghịch lý", "It's a curious paradox that drinking a lot of water can make you feel thirsty."],
  ["Wanderlust", "/ˈwɒn.də.lʌst/", "Niềm đam mê du lịch", "His wanderlust took him to all corners of the globe."],
  ["Nostalgia", "/nɒsˈtæl.dʒə/", "Nỗi nhớ quê hương, hoài niệm", "I feel a wave of nostalgia when I see my old school."],
  ["Petrichor", "/ˈpet.rɪ.kɔːr/", "Mùi đất sau cơn mưa", "The smell of petrichor filled the air after the summer storm."],
  ["Defiance", "/dɪˈfaɪ.əns/", "Sự thách thức, sự bất chấp", "He was jailed for his defiance of the law."]
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Column widths
ws['!cols'] = [
  { wch: 20 },
  { wch: 20 },
  { wch: 40 },
  { wch: 60 }
];

XLSX.utils.book_append_sheet(wb, ws, "Test_Data");
XLSX.writeFile(wb, "Test_Import_10_Words.xlsx");
console.log("File 'Test_Import_10_Words.xlsx' created successfully!");
