// Voice helper: panggil nomor antrian
export default function speakQueue(loketCode, number, loketName) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) {
    console.warn("Browser tidak mendukung Speech Synthesis");
    return;
  }
  if (!number) return;

  const text = `Nomor antrian ${loketCode} ${number}, silakan ke ${loketName}`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "id-ID";
  window.speechSynthesis.speak(utter);
}
