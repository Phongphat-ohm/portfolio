"use client"
import { useEffect, useState } from "react";

type Level =
  | {
      title: string;
      instruction: string;
      type: "anagram" | "riddle" | "cipher";
      scrambled?: string;
      answer: string;
      hint: string;
    }
  | {
      title: string;
      instruction: string;
      type: "memory";
      items: string[];
    };

const levels: Level[] = [
  {
    title: "เรียงอักษรของขวัญ",
    instruction: "ตัวอักษรพวกนี้สลับกันอยู่ เรียงให้เป็นคำเกี่ยวกับคริสต์มาสสิ!",
    type: "anagram",
    scrambled: "D E E R N I E R",
    answer: "REINDEER",
    hint: "สัตว์ที่พาซานต้าบินไปบนท้องฟ้า",
  },
  {
    title: "ความจำแสนสนุก",
    instruction: "จับคู่ภาพที่เหมือนกันให้ครบทุกใบนะ!",
    type: "memory",
    items: ["🎅", "🎄", "🎁", "⛄", "🔔", "⭐"],
  },
  {
    title: "ปริศนาตัวเลข",
    instruction:
      "กวางรูดอล์ฟกินแครอท 3 หัวต่อมื้อ มีกวาง 9 ตัว กินวันละ 2 มื้อ ต้องใช้แครอทกี่หัว?",
    type: "riddle",
    answer: "54",
    hint: "(9 × 3) × 2",
  },
  {
    title: "รหัสลับหิมะ",
    instruction: "ถอดรหัสตัวเลข (A=1, B=2, C=3, ...) 19 - 14 - 15 - 23",
    type: "cipher",
    answer: "SNOW",
    hint: "ขาว เย็น และตกจากฟ้า",
  },
  {
    title: "ทายชื่อพืช",
    instruction:
      "ใบหยักสีเขียว มีลูกสีแดงสด มักใช้ประดับพวงมาลัยคริสต์มาส คือต้นอะไร?",
    type: "riddle",
    answer: "HOLLY",
    hint: "ขึ้นต้นด้วยตัว H",
  },
];

export default function ChristmasPuzzleAdventure() {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [win, setWin] = useState(false);

  const current = levels[level];

  const checkAnswer = () => {
    if ("answer" in current && answer.trim().toUpperCase() === current.answer) {
      setScore((s) => s + 100);
      setFeedback("ยอดเยี่ยม! ถูกต้อง 🎊");
      setSuccess(true);
    } else {
      setFeedback(`ยังไม่ถูกนะ! คำใบ้: ${"hint" in current ? current.hint : ""}`);
      setSuccess(false);
    }
  };

  const nextLevel = () => {
    setAnswer("");
    setFeedback(null);
    setSuccess(false);

    if (level + 1 < levels.length) {
      setLevel(level + 1);
    } else {
      setWin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-red-700 to-yellow-400 p-6 text-white">
      <h1 className="text-5xl text-center font-bold mb-2 font-[cursive]">
        Christmas Adventure 🎄
      </h1>
      <p className="text-center mb-6">มาช่วยซานต้าแก้ปริศนากันเถอะ!</p>

      <div className="max-w-xl mx-auto bg-white text-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between mb-6">
          <span className="font-bold text-red-600">
            ด่านที่ {level + 1} / {levels.length}
          </span>
          <span className="font-bold text-yellow-600">⭐ {score}</span>
        </div>

        <h2 className="text-2xl font-bold text-red-600 mb-2">
          {current.title}
        </h2>
        <p className="mb-6">{current.instruction}</p>

        {current.type !== "memory" && (
          <>
            {"scrambled" in current && (
              <div className="text-3xl font-black tracking-widest bg-blue-50 p-4 rounded-xl text-center mb-6">
                {current.scrambled}
              </div>
            )}

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              placeholder="พิมพ์คำตอบ..."
              className="w-full text-center text-xl p-4 border-2 rounded-xl mb-4"
            />

            <button
              onClick={checkAnswer}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold"
            >
              ตรวจสอบคำตอบ
            </button>
          </>
        )}

        {feedback && (
          <div
            className={`mt-4 p-4 rounded-xl text-center font-bold ${
              success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback}
          </div>
        )}

        {success && (
          <button
            onClick={nextLevel}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold"
          >
            ไปด่านต่อไป ➜
          </button>
        )}
      </div>

      {win && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white text-gray-800 p-10 rounded-3xl text-center">
            <div className="text-7xl mb-4">🎁</div>
            <h2 className="text-3xl font-bold text-red-600 mb-2">
              สุขสันต์วันคริสต์มาส!
            </h2>
            <p className="mb-6">
              คุณผ่านทุกด่านแล้ว 🎉 ซานต้าภูมิใจในตัวคุณ!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold"
            >
              เล่นใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
