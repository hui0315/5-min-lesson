import { useState, useEffect, useRef, useCallback } from "react";

const STEPS = [
  {
    id: "merge-basics", title: "合併基礎：git merge", emoji: "🔀", type: "concept",
    conceptBlocks: [
      { title: "Fast-Forward 合併", icon: "⏩", color: "#10B981",
        desc: "當目標分支沒有新的 commit 時，Git 直接把指標往前移。歷史是一條直線，最乾淨。",
        diagram: ["A ─ B ─ C (main)", "            └─ D ─ E (feature)", "合併後：", "A ─ B ─ C ─ D ─ E (main)"] },
      { title: "Three-Way 合併", icon: "🔀", color: "#8B5CF6",
        desc: "當兩邊都有新 commit 時，Git 會建立一個「合併 commit」把兩條線接起來。",
        diagram: ["A ─ B ─ C ─ F (main)", "        └─ D ─ E (feature)", "合併後：", "A ─ B ─ C ─ F ─ G (main)", "        └─ D ─ E ─┘"] },
    ],
    quiz: { question: "什麼情況下 merge 會產生一個額外的「合併 commit」？",
      options: [
        { text: "當兩個分支都有各自的新 commit 時", correct: true },
        { text: "每次 merge 都一定會產生", correct: false },
        { text: "只有 merge 到 main 時才會產生", correct: false },
      ] },
  },
  {
    id: "merge-vs-rebase", title: "merge vs rebase：兩種整合策略", emoji: "⚖️", type: "concept",
    conceptBlocks: [
      { title: "git merge", icon: "🔀", color: "#3B82F6",
        desc: "保留完整的分支歷史，建立合併節點。優點是歷史真實，缺點是歷史線會比較複雜。",
        points: ["✓ 不改寫歷史，安全", "✓ 適合已 push 到遠端的分支", "✓ 團隊協作的預設選擇", "✗ 歷史圖會有很多分叉"] },
      { title: "git rebase", icon: "📐", color: "#F59E0B",
        desc: "把你的 commit「搬到」目標分支頂端，重新排列。歷史變成一條直線，但會改寫 commit hash。",
        points: ["✓ 歷史乾淨，一條直線", "✓ 適合個人的 feature 分支", "✗ 會改寫歷史（commit hash 改變）", "✗ 絕不能對已 push 且共享的 commit 做"] },
    ],
    goldenRule: { title: "🏆 黃金法則", text: "只對「還沒 push 到遠端」或「只有你自己在用」的分支做 rebase。已經共享的分支，永遠用 merge。" },
    quiz: { question: "你的 feature 分支已經推到遠端，隊友也在看了。要同步 develop 的更新，應該用？",
      options: [
        { text: "git rebase develop（歷史比較乾淨）", correct: false },
        { text: "git merge develop（不改寫共享的歷史）", correct: true },
        { text: "兩者都可以，沒差別", correct: false },
      ] },
  },
  {
    id: "conflict", title: "合併衝突：不要怕，很正常", emoji: "💥", type: "scenario",
    story: "你和隊友同時修改了 app.js 的同一個函式。你要合併他的分支時，Git 告訴你有衝突。別擔心，Git 已經標記好衝突的位置，你只需要決定保留哪邊的修改。",
    tip: "衝突只發生在兩個人改了「同一個檔案的同一個區塊」。Git 會用特殊標記 <<<<<<< / ======= / >>>>>>> 把兩邊的修改都列出來。你的任務就是：1) 看懂兩邊各自改了什麼、2) 決定最終要保留什麼、3) 刪除所有衝突標記、4) 用 git add 告訴 Git 你解完了。",
    conflictDemo: true,
    commands: [
      { prompt: "嘗試合併隊友的分支", answer: "git merge feature/teammate", output: "Auto-merging src/app.js\nCONFLICT (content): Merge conflict in src/app.js\nAutomatic merge failed; fix conflicts and then commit the result.", hint: "merge + 隊友的分支名" },
      { prompt: "查看哪些檔案有衝突", answer: "git status", output: "On branch feature/search\nUnmerged paths:\n  both modified:   src/app.js", hint: "status 查看衝突" },
      { prompt: "（手動編輯解決衝突後）將解決的檔案標記為已解決", answer: "git add src/app.js", output: "", hint: "add 衝突檔案 = 標記已解決" },
      { prompt: "完成合併 commit", answer: "git commit -m \"merge: resolve conflict in app.js\"", output: "[feature/search m3n4o5p] merge: resolve conflict in app.js", hint: "commit -m 完成合併", flexible: true },
    ],
    quiz: { question: "Git 衝突標記中，======= 上面是什麼？",
      options: [
        { text: "對方（incoming）的修改", correct: false },
        { text: "你自己（current）的修改", correct: true },
        { text: "Git 自動合併的結果", correct: false },
      ] },
  },
  {
    id: "rebase-practice", title: "Rebase 實戰：保持歷史乾淨", emoji: "📐", type: "scenario",
    story: "你的 feature 分支已經開發了幾天。在這段期間，develop 有了新的 commit。在發 PR 之前，你想用 rebase 讓你的分支基於最新的 develop。",
    tip: "rebase 的本質是「把你的 commit 拆下來，接到目標分支的最新 commit 後面」。過程中如果遇到衝突，用 git rebase --continue 而不是 git commit。想放棄可以用 git rebase --abort。",
    commands: [
      { prompt: "確認你在 feature 分支上", answer: "git checkout feature/search", output: "Already on 'feature/search'", hint: "checkout 到 feature 分支" },
      { prompt: "先下載遠端最新狀態", answer: "git fetch origin", output: "From https://github.com/team/app\n   a1b2c3d..x7y8z9a  develop -> origin/develop", hint: "fetch origin" },
      { prompt: "把你的 commit rebase 到最新的 develop 上", answer: "git rebase origin/develop", output: "First, rewinding head to replay your work on top of it...\nApplying: feat: add search component\nApplying: feat: add search filters", hint: "rebase origin/develop" },
      { prompt: "Rebase 成功！用安全的方式強制推送", answer: "git push --force-with-lease origin feature/search", output: " + a1b2c3d...x7y8z9a feature/search -> feature/search (forced update)", hint: "push --force-with-lease 安全強推" },
    ],
    quiz: { question: "如果 rebase 到一半想放棄，回到 rebase 前的狀態，要用什麼指令？",
      options: [
        { text: "git rebase --skip", correct: false },
        { text: "git rebase --abort", correct: true },
        { text: "git reset --hard", correct: false },
      ] },
  },
  {
    id: "tag-version", title: "版本標記：git tag", emoji: "🏷️", type: "scenario",
    story: "專案要發布 v1.0.0 了！你需要為這個重要的 commit 打上標籤，方便未來隨時找到這個版本。",
    tip: "Tag 分兩種：輕量標籤只是指標；附註標籤（-a）包含作者、日期、訊息。正式發版用附註標籤。版本號慣例：v主版號.次版號.修訂號（Semantic Versioning）。",
    commands: [
      { prompt: "為目前的 commit 建立一個附註標籤", answer: "git tag -a v1.0.0 -m \"Release version 1.0.0\"", output: "", hint: "tag -a 版本號 -m 訊息", flexible: true },
      { prompt: "查看所有標籤", answer: "git tag", output: "v0.1.0\nv0.2.0\nv1.0.0", hint: "直接輸入 git tag" },
      { prompt: "查看特定標籤的詳細資訊", answer: "git show v1.0.0", output: "tag v1.0.0\nTagger: You <you@email.com>\nDate:   Thu Feb 19 14:00:00 2026\n\nRelease version 1.0.0", hint: "show + 標籤名" },
      { prompt: "把所有標籤推送到遠端", answer: "git push origin --tags", output: " * [new tag] v1.0.0 -> v1.0.0", hint: "push origin --tags" },
    ],
    quiz: { question: "git tag -a 和 git tag（不加 -a）的差別是？",
      options: [
        { text: "沒有差別，-a 是可選的", correct: false },
        { text: "-a 建立附註標籤，包含作者和訊息；不加 -a 只建立輕量指標", correct: true },
        { text: "-a 代表自動推送到遠端", correct: false },
      ] },
  },
  {
    id: "force-push", title: "安全推送：force-with-lease", emoji: "🛡️", type: "concept",
    conceptBlocks: [
      { title: "git push --force", icon: "⚠️", color: "#EF4444",
        desc: "強制用你的本地版本覆蓋遠端。危險！可能覆蓋隊友的 commit。",
        points: ["強制覆蓋遠端", "不檢查遠端是否有新更新", "可能覆蓋隊友的 commit", "❌ 盡量不用"] },
      { title: "git push --force-with-lease", icon: "🛡️", color: "#10B981",
        desc: "「有條件的」強制推送。先檢查遠端是否有你不知道的新 commit，有就拒絕推送。",
        points: ["推送前先檢查遠端狀態", "有未知新 commit 就中斷", "保護隊友的工作", "✅ rebase 後的推薦用法"] },
    ],
    quiz: { question: "什麼情況下你「必須」用 force push？",
      options: [
        { text: "每次 push 都應該用 force", correct: false },
        { text: "rebase 改寫了歷史之後，本地和遠端歷史不一致", correct: true },
        { text: "當網路很慢的時候", correct: false },
      ] },
  },
  {
    id: "bisect", title: "找 Bug 神器：git bisect", emoji: "🔬", type: "scenario",
    story: "使用者回報一個 bug，但你不確定是哪個 commit 引入的。過去兩週有 50 個 commit。git bisect 用二分搜尋法，只需約 6 次就能找到！",
    tip: "bisect 的原理：告訴 Git 一個「好的」和「壞的」版本，Git 跳到中間讓你測試。根據 good/bad 再折半，直到找出第一個壞掉的 commit。log₂(50) ≈ 6 次。",
    commands: [
      { prompt: "開始二分搜尋", answer: "git bisect start", output: "", hint: "bisect start" },
      { prompt: "標記目前版本為有 bug", answer: "git bisect bad", output: "", hint: "bisect bad" },
      { prompt: "標記兩週前的版本為 good", answer: "git bisect good a1b2c3d", output: "Bisecting: 25 revisions left to test after this (roughly 5 steps)\n[f4e5d6c] feat: add payment integration", hint: "bisect good + commit hash" },
      { prompt: "測試後沒 bug，標記 good", answer: "git bisect good", output: "Bisecting: 12 revisions left to test after this (roughly 4 steps)\n[h7i8j9k] refactor: reorganize auth module", hint: "bisect good" },
      { prompt: "這個版本有 bug！", answer: "git bisect bad", output: "Bisecting: 6 revisions left to test after this\n[k2l3m4n] feat: update user validation", hint: "bisect bad" },
      { prompt: "繼續...這個也有 bug", answer: "git bisect bad", output: "Bisecting: 3 revisions left\n[n5o6p7q] fix: adjust error handling", hint: "bisect bad" },
      { prompt: "這個版本沒問題", answer: "git bisect good", output: "Bisecting: 1 revision left\n[p8q9r0s] feat: add input sanitization", hint: "bisect good" },
      { prompt: "找到了！這個有 bug", answer: "git bisect bad", output: "p8q9r0s is the first bad commit\ncommit p8q9r0s\nAuthor: dev@team.com\n\n    feat: add input sanitization", hint: "bisect bad" },
      { prompt: "搜尋完成，回到正常狀態", answer: "git bisect reset", output: "Previous HEAD position was p8q9r0s\nSwitched to branch 'main'", hint: "bisect reset" },
    ],
    quiz: { question: "在 100 個 commit 中用 bisect 找 bug，大約需要測試幾次？",
      options: [
        { text: "大約 50 次", correct: false },
        { text: "大約 7 次（log₂100 ≈ 7）", correct: true },
        { text: "一定剛好 10 次", correct: false },
      ] },
  },
];

/* ── Shared Components ── */
function CommandInput({ command, onComplete }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("typing");
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);
  const accent = "#A78BFA";

  useEffect(() => { setInput(""); setStatus("typing"); setShowHint(false); setTimeout(() => inputRef.current?.focus(), 100); }, [command.answer]);

  const normalize = (s) => s.trim().replace(/\s+/g, " ").replace(/[""'']/g, c => c === "\u201C" || c === "\u201D" ? '"' : c === "\u2018" || c === "\u2019" ? "'" : c);

  const checkAnswer = () => {
    const n = normalize(input), e = normalize(command.answer);
    if (command.flexible) { const p = e.split('"')[0].split("'")[0].trim(); if (n.startsWith(normalize(p)) && (n.includes('"') || n.includes("'"))) { setStatus("correct"); setTimeout(onComplete, 700); return; } }
    if (n === e) { setStatus("correct"); setTimeout(onComplete, 700); } else { setStatus("wrong"); setShakeKey(k => k + 1); setTimeout(() => setStatus("typing"), 1200); }
  };

  const exp = command.answer;
  const cc = (i) => status !== "typing" || i >= input.length ? "rgba(255,255,255,0.1)" : input[i] === exp[i] ? "#10B981" : "#EF4444";
  const bc = status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : "rgba(255,255,255,0.12)";

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8, display: "flex", gap: 8, lineHeight: 1.6 }}>
        <span style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>▸</span><span>{command.prompt}</span>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, height: 16, overflow: "hidden", marginBottom: 4, marginLeft: 24 }}>
        {status === "typing" && exp.split("").map((ch, i) => <span key={i} style={{ color: cc(i) }}>{ch}</span>)}
      </div>
      <div key={shakeKey} style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: `1.5px solid ${bc}`, borderRadius: 8, padding: "0 12px", marginLeft: 24, transition: "border-color 0.3s", animation: status === "wrong" ? "shake 0.4s ease" : "none" }}>
        <span style={{ color: "#10B981", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginRight: 8 }}>$</span>
        <input ref={inputRef} value={input} onChange={e => status === "typing" && setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && input.trim() && checkAnswer()} disabled={status === "correct"} placeholder="輸入指令..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: "11px 0", caretColor: accent }} />
        {status === "correct" && <span style={{ color: "#10B981", fontSize: 14 }}>✓</span>}
        {status === "wrong" && <span style={{ color: "#EF4444", fontSize: 11 }}>再試一次</span>}
      </div>
      {status === "typing" && <button onClick={() => setShowHint(!showHint)} style={{ marginTop: 4, marginLeft: 24, background: "none", border: "none", color: "rgba(255,255,255,0.22)", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>{showHint ? "隱藏提示" : "💡 提示"}</button>}
      {showHint && status === "typing" && <div style={{ marginTop: 2, marginLeft: 24, fontSize: 11.5, color: `${accent}88`, fontStyle: "italic" }}>{command.hint}</div>}
    </div>
  );
}

function TerminalSim({ commands, onAllComplete }) {
  const [ci, setCi] = useState(-1);
  const ref = useRef(null);
  useEffect(() => setCi(-1), [commands]);
  useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight); if (ci === commands.length - 1) setTimeout(() => onAllComplete?.(), 500); }, [ci, commands.length, onAllComplete]);
  return (
    <div style={{ background: "#060A10", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", margin: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {["#EF4444","#F59E0B","#10B981"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
        <span style={{ marginLeft: 8, fontSize: 10.5, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>terminal</span>
      </div>
      <div ref={ref} style={{ padding: "14px 16px", maxHeight: 420, overflowY: "auto" }}>
        {commands.slice(0, ci + 1).map((cmd, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: "#10B981" }}>$ </span><span style={{ color: "#A78BFA" }}>{cmd.answer}</span><span style={{ color: "#10B981", marginLeft: 8, fontSize: 11 }}>✓</span>
            </div>
            {cmd.output && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(255,255,255,0.35)", whiteSpace: "pre-wrap", marginTop: 3, lineHeight: 1.5 }}>{cmd.output}</div>}
          </div>
        ))}
        {ci < commands.length - 1 && <CommandInput key={ci + 1} command={commands[ci + 1]} onComplete={() => setCi(i => i + 1)} />}
        {ci === commands.length - 1 && <div style={{ textAlign: "center", padding: "10px 0 2px", color: "#10B981", fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>✅ 所有指令完成！</div>}
      </div>
    </div>
  );
}

function Quiz({ quiz, onComplete }) {
  const [sel, setSel] = useState(null);
  const pick = (i) => { if (sel !== null) return; setSel(i); if (quiz.options[i].correct) setTimeout(onComplete, 700); };
  return (
    <div style={{ margin: "20px 0 0", padding: "18px", background: "rgba(167,139,250,0.04)", borderRadius: 12, border: "1px solid rgba(167,139,250,0.12)" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#A78BFA", marginBottom: 12 }}>💡 觀念確認</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 12, lineHeight: 1.6 }}>{quiz.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((o, i) => {
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.06)", tc = "rgba(255,255,255,0.65)";
          if (sel === i) { if (o.correct) { bg="rgba(16,185,129,0.12)"; bc="#10B981"; tc="#10B981"; } else { bg="rgba(239,68,68,0.12)"; bc="#EF4444"; tc="#EF4444"; } }
          else if (sel !== null && o.correct) { bg="rgba(16,185,129,0.08)"; bc="#10B981"; tc="#10B981"; }
          return <button key={i} onClick={() => pick(i)} style={{ padding: "11px 14px", background: bg, border: `1px solid ${bc}`, borderRadius: 8, color: tc, fontSize: 13, textAlign: "left", cursor: sel !== null ? "default" : "pointer", transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5 }}>{o.text}</button>;
        })}
      </div>
      {sel !== null && !quiz.options[sel].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>正確答案已用綠色標示 ✨</div>}
      {sel !== null && quiz.options[sel].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>✅ 正確！</div>}
    </div>
  );
}

function ConceptPage({ step }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
        {step.conceptBlocks.map((b, i) => (
          <div key={i} style={{ background: `${b.color}08`, border: `1px solid ${b.color}20`, borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{b.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: b.color, marginBottom: 8 }}>{b.title}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 12 }}>{b.desc}</div>
            {b.diagram && b.diagram.map((l, j) => <div key={j} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: `${b.color}99`, lineHeight: 1.6 }}>{l}</div>)}
            {b.points && b.points.map((p, j) => <div key={j} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4, lineHeight: 1.6 }}>{p}</div>)}
          </div>
        ))}
      </div>
      {step.goldenRule && (
        <div style={{ margin: "16px 0", padding: "16px", background: "rgba(232,200,114,0.06)", borderRadius: 12, border: "1px solid rgba(232,200,114,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#E8C872", marginBottom: 6 }}>{step.goldenRule.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{step.goldenRule.text}</div>
        </div>
      )}
    </div>
  );
}

function ConflictDemo() {
  const [stage, setStage] = useState(0);
  const stages = [
    { label: "衝突標記", content: "<<<<<<< HEAD (你的修改)\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n=======\nfunction greet(name) {\n  return `Hi there, ${name}! Welcome back.`;\n}\n>>>>>>> feature/teammate (對方的修改)" },
    { label: "解決衝突", content: "// 結合兩邊的優點：\nfunction greet(name) {\n  return `Hello, ${name}! Welcome back.`;\n}" },
  ];
  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {stages.map((s, i) => <button key={i} onClick={() => setStage(i)} style={{ padding: "6px 14px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", background: stage === i ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${stage === i ? "#A78BFA" : "rgba(255,255,255,0.06)"}`, borderRadius: 6, color: stage === i ? "#A78BFA" : "rgba(255,255,255,0.4)", transition: "all 0.3s" }}>{s.label}</button>)}
      </div>
      <div style={{ background: "#060A10", borderRadius: 10, padding: "16px", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, whiteSpace: "pre-wrap", lineHeight: 1.7, color: stage === 0 ? "rgba(255,255,255,0.6)" : "#10B981" }}>{stages[stage].content}</div>
      {stage === 0 && <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}><span style={{ color: "#EF4444" }}>{"<<<<<<<" }</span> 到 <span style={{ color: "#F59E0B" }}>{"======="}</span> 是<strong style={{ color: "#3B82F6" }}>你的修改</strong>，<span style={{ color: "#F59E0B" }}>{"======="}</span> 到 <span style={{ color: "#10B981" }}>{">>>>>>>"}</span> 是<strong style={{ color: "#8B5CF6" }}>對方的修改</strong></div>}
    </div>
  );
}

/* ── MAIN ── */
export default function GitBridge2() {
  const [cur, setCur] = useState(0);
  const [termDone, setTermDone] = useState({});
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const step = STEPS[cur], total = STEPS.length, accent = "#A78BFA";
  const handleTermDone = useCallback(() => setTermDone(p => ({ ...p, [cur]: true })), [cur]);
  const handleQuizDone = () => { if (!quizDone[cur]) { setQuizDone(p => ({ ...p, [cur]: true })); setScore(s => s + 1); } };

  return (
    <div style={{ minHeight: "100%", background: "#0A0B14", color: "#E6EDF3", fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, #7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>4</div>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>銜接二：合併、衝突與團隊協作</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Git 課程系列 · 第四堂</div></div>
          </div>
          <div style={{ fontSize: 12, color: accent, fontFamily: "'JetBrains Mono', monospace", background: `${accent}15`, padding: "4px 10px", borderRadius: 6 }}>⭐ {score}/{total}</div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => <div key={i} onClick={() => setCur(i)} style={{ flex: 1, height: 4, borderRadius: 2, cursor: "pointer", background: i <= cur ? `linear-gradient(90deg, ${accent}, #7C3AED)` : "rgba(255,255,255,0.06)", transition: "background 0.4s" }} />)}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{cur + 1}/{total}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "26px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: `linear-gradient(135deg, ${accent}, #7C3AED)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{step.title}</h2>
          </div>
          {step.type === "concept" && <ConceptPage step={step} />}
          {step.type === "scenario" && (<>
            <div style={{ padding: "14px 16px", background: `${accent}06`, borderLeft: `3px solid ${accent}`, borderRadius: "0 10px 10px 0", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 8 }}><span style={{ fontWeight: 700, color: accent }}>📖 情境：</span>{step.story}</div>
            <div style={{ padding: "14px 16px", background: "rgba(16,185,129,0.04)", borderLeft: "3px solid #10B981", borderRadius: "0 10px 10px 0", fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 4 }}><span style={{ fontWeight: 700, color: "#10B981" }}>💼 實務觀點：</span>{step.tip}</div>
            {step.conflictDemo && <ConflictDemo />}
            <TerminalSim key={cur} commands={step.commands} onAllComplete={handleTermDone} />
          </>)}
          <Quiz key={`q-${cur}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          <button onClick={() => cur > 0 && setCur(s => s - 1)} disabled={cur === 0} style={{ padding: "12px 24px", background: cur === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: cur === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: cur === 0 ? "default" : "pointer" }}>← 上一課</button>
          <button onClick={() => cur < total - 1 && setCur(s => s + 1)} disabled={cur === total - 1} style={{ padding: "12px 24px", background: cur === total - 1 ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg, ${accent}, #7C3AED)`, border: "none", borderRadius: 10, color: cur === total - 1 ? "rgba(255,255,255,0.12)" : "#fff", fontSize: 13, fontWeight: 700, cursor: cur === total - 1 ? "default" : "pointer" }}>下一課 →</button>
        </div>
        {cur === total - 1 && quizDone[cur] && (
          <div style={{ marginTop: 24, textAlign: "center", padding: "24px", background: `${accent}08`, border: `1px solid ${accent}22`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: accent, marginBottom: 6 }}>銜接二完成！</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>你已掌握合併、衝突處理、rebase、tag 和 bisect。<br />接下來進入指令總覽與比較！</div>
          </div>
        )}
      </div>
    </div>
  );
}
