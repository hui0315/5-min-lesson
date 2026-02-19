import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════
   COURSE DATA — 總複習：從基礎到實戰
   ══════════════════════════════════════════════ */

const SECTIONS = [
  {
    id: "workflow-overview",
    title: "版本控制全貌：為什麼團隊都用 Git？",
    emoji: "🗺️",
    type: "infographic",
    panels: [
      {
        icon: "😱",
        title: "沒有版本控制的世界",
        color: "#EF4444",
        items: [
          "用 Email 互傳檔案，不知道誰改了什麼",
          "「最終版_v3_真的最終.docx」滿天飛",
          "改壞了回不去，只能 Ctrl+Z 到手痠",
          "兩個人同時改同一個檔案 → 互相覆蓋",
        ],
      },
      {
        icon: "✨",
        title: "有 Git 的世界",
        color: "#10B981",
        items: [
          "每次修改自動記錄：誰、什麼時候、改了什麼",
          "任意時間點都能回溯，永遠有後悔藥",
          "分支讓多人同時開發，互不干擾",
          "合併機制自動整合，衝突也有工具解決",
        ],
      },
    ],
    workflow: {
      title: "💼 業界標準 Git 工作流程（Git Flow）",
      steps: [
        {
          name: "main",
          desc: "永遠是穩定、可部署的版本",
          color: "#E8C872",
          detail: "這是正式環境（Production）跑的程式碼。絕對不會直接在 main 上開發。",
        },
        {
          name: "develop",
          desc: "整合所有開發中的功能",
          color: "#3B82F6",
          detail: "所有 feature 完成後先合併到 develop，通過測試後才合併到 main。",
        },
        {
          name: "feature/*",
          desc: "每個新功能一條分支",
          color: "#8B5CF6",
          detail: "命名慣例如 feature/login、feature/search。開發完成後發 PR 合併回 develop。",
        },
        {
          name: "hotfix/*",
          desc: "緊急修復直接從 main 分出",
          color: "#EF4444",
          detail: "線上出 bug 時，從 main 開 hotfix 分支，修好後同時合併回 main 和 develop。",
        },
        {
          name: "release/*",
          desc: "發版前的最後準備",
          color: "#F59E0B",
          detail: "從 develop 分出，做最後測試和修正。完成後合併到 main 並打上版本 tag。",
        },
      ],
    },
    conventions: {
      title: "📝 Commit 訊息慣例（Conventional Commits）",
      desc: "業界普遍使用語意化的 commit 訊息，讓歷史一目瞭然：",
      examples: [
        { prefix: "feat:", example: "feat: add user authentication", desc: "新功能" },
        { prefix: "fix:", example: "fix: resolve login redirect loop", desc: "修復 bug" },
        { prefix: "docs:", example: "docs: update API documentation", desc: "文件修改" },
        { prefix: "refactor:", example: "refactor: simplify auth middleware", desc: "重構（不改功能）" },
        { prefix: "test:", example: "test: add unit tests for auth", desc: "測試相關" },
        { prefix: "chore:", example: "chore: update dependencies", desc: "雜務（建置、套件等）" },
      ],
    },
  },
  {
    id: "scenario-1",
    title: "情境一：新人第一天報到",
    emoji: "👋",
    type: "scenario",
    story:
      "你剛加入一個團隊，主管請你把專案 clone 下來，建立自己的 feature 分支，完成一個小任務後提交。這是每個工程師入職的第一件事。",
    realWorldTip:
      "實務上，clone 之後第一件事通常是看 README.md 了解專案結構，然後安裝相依套件（npm install 或 pip install）。分支命名要遵循團隊慣例，通常是 feature/你的名字-功能描述 或 ticket 編號。",
    commands: [
      { prompt: "複製遠端儲存庫到本地", answer: "git clone https://github.com/team/project.git", output: "Cloning into 'project'...\nResolving deltas: 100% (1205/1205), done.", hint: "git clone + 遠端 URL" },
      { prompt: "進入專案目錄", answer: "cd project", output: "", hint: "cd + 目錄名稱", notGit: true },
      { prompt: "查看目前有哪些分支（包含遠端）", answer: "git branch -a", output: "* main\n  remotes/origin/main\n  remotes/origin/develop\n  remotes/origin/feature/auth", hint: "branch -a 顯示所有分支" },
      { prompt: "從 develop 分支建立並切換到你的 feature 分支", answer: "git checkout -b feature/welcome-page develop", output: "Switched to a new branch 'feature/welcome-page'", hint: "checkout -b 新分支名 來源分支" },
      { prompt: "完成修改後，加入所有變更", answer: "git add .", output: "", hint: "add . 加入所有檔案" },
      { prompt: "用語意化訊息提交", answer: "git commit -m \"feat: add welcome page\"", output: "[feature/welcome-page a1b2c3d] feat: add welcome page\n 2 files changed, 45 insertions(+)", hint: "commit -m \"feat: ...\"", flexible: true },
      { prompt: "推送你的分支到遠端", answer: "git push origin feature/welcome-page", output: " * [new branch] feature/welcome-page -> feature/welcome-page", hint: "push origin + 你的分支名稱" },
    ],
    quiz: {
      question: "為什麼要從 develop（而不是 main）建立 feature 分支？",
      options: [
        { text: "因為 main 不允許建立分支", correct: false },
        { text: "因為 develop 包含最新的開發進度，main 只有穩定版本", correct: true },
        { text: "兩者沒有差別，只是習慣", correct: false },
      ],
    },
  },
  {
    id: "scenario-2",
    title: "情境二：開發到一半的緊急救火",
    emoji: "🔥",
    type: "scenario",
    story:
      "你正在開發搜尋功能，已經寫了一半。突然 Slack 傳來訊息：「線上登入頁面掛了，趕快修！」你需要暫存手上的工作，切換去修 bug，然後回來繼續開發。",
    realWorldTip:
      "這是工程師日常最常見的場景。重點是：1) 用 stash 保存未完成的工作，不要 commit 半成品；2) hotfix 要從 main 分出來，因為是修正式環境的 bug；3) 修完後記得同時合併回 main 和 develop，避免 develop 上還有同樣的 bug。",
    commands: [
      { prompt: "先查看目前修改了什麼", answer: "git status", output: "On branch feature/search\nChanges not staged for commit:\n  modified: search.js\n  modified: search.test.js", hint: "用 status 查看狀態" },
      { prompt: "暫存所有未完成的修改", answer: "git stash", output: "Saved working directory and index state WIP on feature/search: b4c5d6e feat: search skeleton", hint: "stash 暫存修改" },
      { prompt: "切換到 main 分支", answer: "git checkout main", output: "Switched to branch 'main'", hint: "checkout main" },
      { prompt: "拉取最新的遠端更新", answer: "git pull origin main", output: "Already up to date.", hint: "pull origin main 更新" },
      { prompt: "建立緊急修復分支", answer: "git checkout -b hotfix/login-fix", output: "Switched to a new branch 'hotfix/login-fix'", hint: "checkout -b hotfix/..." },
      { prompt: "修復完成，加入並提交修改", answer: "git commit -am \"fix: resolve login page crash\"", output: "[hotfix/login-fix e7f8g9h] fix: resolve login page crash\n 1 file changed, 3 insertions(+), 1 deletion(-)", hint: "commit -am 可以同時 add + commit 已追蹤的檔案", flexible: true },
      { prompt: "切回 main 並合併 hotfix", answer: "git checkout main", output: "Switched to branch 'main'", hint: "先回到 main" },
      { prompt: "合併修復分支", answer: "git merge hotfix/login-fix", output: "Updating c3d4e5f..e7f8g9h\nFast-forward\n login.js | 4 +++-", hint: "merge + 分支名稱" },
      { prompt: "推送修復到遠端", answer: "git push origin main", output: "To github.com:team/project.git\n   c3d4e5f..e7f8g9h  main -> main", hint: "push origin main" },
      { prompt: "救火完成！切回你的 feature 分支", answer: "git checkout feature/search", output: "Switched to branch 'feature/search'", hint: "checkout 回 feature 分支" },
      { prompt: "取回之前暫存的修改", answer: "git stash pop", output: "On branch feature/search\nChanges not staged for commit:\n  modified: search.js\n  modified: search.test.js\nDropped refs/stash@{0}", hint: "stash pop 取回暫存" },
    ],
    quiz: {
      question: "git commit -am 中的 -a 代表什麼？",
      options: [
        { text: "自動建立新分支", correct: false },
        { text: "自動把所有「已追蹤」的修改檔案加入暫存區", correct: true },
        { text: "自動推送到遠端", correct: false },
      ],
    },
  },
  {
    id: "scenario-3",
    title: "情境三：Code Review 與合併衝突",
    emoji: "🤝",
    type: "scenario",
    story:
      "你的 feature 分支開發完成，發了 Pull Request。但在等待 review 的期間，隊友的程式碼已經先合併到 develop 了，而且你們改到了同一個檔案。你需要解決衝突。",
    realWorldTip:
      "合併衝突不可怕，Git 只是不確定該保留哪一方的修改，所以請你來做決定。實務上，建議用 rebase 而不是 merge 來同步上游變更，這樣歷史會更乾淨。解完衝突後一定要跑測試，確認兩邊的修改整合後還能正常運作。",
    commands: [
      { prompt: "確認你在 feature 分支上", answer: "git checkout feature/search", output: "Already on 'feature/search'", hint: "checkout feature/search" },
      { prompt: "先取得遠端最新狀態", answer: "git fetch origin", output: "remote: Counting objects: 15, done.\nFrom github.com:team/project\n   a1b2c3d..f4e5d6c  develop -> origin/develop", hint: "fetch origin 取得更新" },
      { prompt: "用 rebase 同步 develop 的最新變更", answer: "git rebase origin/develop", output: "First, rewinding head to replay your work...\nApplying: feat: add search component\nUsing index info to reconstruct a base tree...\nCONFLICT (content): Merge conflict in src/App.js\nerror: could not apply b7c8d9e\nhint: Resolve all conflicts manually", hint: "rebase origin/develop" },
      { prompt: "查看哪些檔案有衝突", answer: "git status", output: "interactive rebase in progress\nUnmerged paths:\n  both modified: src/App.js\n\nfix conflicts and run \"git rebase --continue\"", hint: "status 查看衝突狀態" },
      { prompt: "（手動編輯解決衝突後）將解決後的檔案標記為已解決", answer: "git add src/App.js", output: "", hint: "add 衝突檔案表示已解決" },
      { prompt: "繼續 rebase 流程", answer: "git rebase --continue", output: "Applying: feat: add search component\nApplying: feat: add search filters", hint: "rebase --continue 繼續" },
      { prompt: "強制推送更新後的分支（因為 rebase 改寫了歷史）", answer: "git push --force-with-lease origin feature/search", output: " + e1f2a3b...g4h5i6j feature/search -> feature/search (forced update)", hint: "push --force-with-lease 安全的強制推送" },
    ],
    quiz: {
      question: "為什麼 rebase 後需要 force push？",
      options: [
        { text: "因為一般 push 太慢", correct: false },
        { text: "因為 rebase 改寫了 commit 歷史，遠端的舊歷史需要被覆蓋", correct: true },
        { text: "因為遠端不接受新的分支", correct: false },
      ],
    },
  },
  {
    id: "scenario-4",
    title: "情境四：版本發布與 Tag",
    emoji: "🏷️",
    type: "scenario",
    story:
      "經過幾週的開發，develop 上的所有功能都通過測試了。現在要準備發布 v2.0.0 版本。你需要建立 release 分支、打 tag、最後合併到 main。",
    realWorldTip:
      "版本號通常遵循 Semantic Versioning（語意化版本）：MAJOR.MINOR.PATCH。MAJOR = 不向下相容的大改動、MINOR = 新增功能但向下相容、PATCH = bug 修復。Tag 打在 main 上，代表這個 commit 就是某個正式版本，方便未來快速定位。",
    commands: [
      { prompt: "從 develop 建立 release 分支", answer: "git checkout -b release/v2.0.0 develop", output: "Switched to a new branch 'release/v2.0.0'", hint: "checkout -b release/v2.0.0 develop" },
      { prompt: "做完最後修正後提交", answer: "git commit -am \"chore: bump version to 2.0.0\"", output: "[release/v2.0.0 j7k8l9m] chore: bump version to 2.0.0\n 1 file changed, 1 insertion(+), 1 deletion(-)", hint: "commit -am \"chore: ...\"", flexible: true },
      { prompt: "切到 main 準備合併", answer: "git checkout main", output: "Switched to branch 'main'", hint: "checkout main" },
      { prompt: "合併 release 分支", answer: "git merge release/v2.0.0", output: "Merge made by the 'ort' strategy.\n 15 files changed, 423 insertions(+), 87 deletions(-)", hint: "merge release/v2.0.0" },
      { prompt: "為這個版本打上標籤", answer: "git tag v2.0.0", output: "", hint: "tag + 版本號" },
      { prompt: "推送 main 和所有標籤到遠端", answer: "git push origin main --tags", output: "To github.com:team/project.git\n   h1i2j3k..m4n5o6p  main -> main\n * [new tag]         v2.0.0 -> v2.0.0", hint: "push origin main --tags" },
      { prompt: "也把 release 的修正合併回 develop", answer: "git checkout develop", output: "Switched to branch 'develop'", hint: "先切到 develop" },
      { prompt: "合併 release 到 develop", answer: "git merge release/v2.0.0", output: "Merge made by the 'ort' strategy.\n 1 file changed, 1 insertion(+), 1 deletion(-)", hint: "merge release/v2.0.0" },
    ],
    quiz: {
      question: "版本號 v2.1.0 → v3.0.0 代表什麼？",
      options: [
        { text: "修復了一個重大 bug", correct: false },
        { text: "新增了一個小功能", correct: false },
        { text: "有不向下相容的重大變更", correct: true },
      ],
    },
  },
  {
    id: "scenario-5",
    title: "情境五：災難復原 — 我把東西搞壞了",
    emoji: "💀",
    type: "scenario",
    story:
      "你不小心在 main 上直接 commit 了實驗性程式碼（違反團隊規範），而且已經 push 上去了。另外，你發現三天前的某個 commit 引入了一個隱藏 bug。你需要處理這兩個問題。",
    realWorldTip:
      "犯錯很正常！關鍵是用正確的方式修復。已經 push 的 commit 永遠用 revert（不改歷史），沒 push 的可以用 reset。git bisect 是個找 bug 神器，它用二分搜尋法幫你在幾百個 commit 中快速定位是哪個 commit 引入問題的。",
    commands: [
      { prompt: "先查看 main 上最近的提交歷史", answer: "git log --oneline", output: "z9y8x7w WRONG: experimental code on main\nv6u5t4s feat: add dashboard\nr3q2p1o fix: navbar alignment\nn0m9l8k chore: update deps", hint: "log --oneline 查看歷史" },
      { prompt: "安全地撤銷你誤推的 commit", answer: "git revert HEAD", output: "[main a1b2c3d] Revert \"WRONG: experimental code on main\"\n 3 files changed, 12 deletions(-)", hint: "revert HEAD 撤銷最新 commit" },
      { prompt: "推送 revert 的結果", answer: "git push origin main", output: "To github.com:team/project.git\n   z9y8x7w..a1b2c3d  main -> main", hint: "push origin main" },
      { prompt: "現在來找隱藏 bug：啟動二分搜尋", answer: "git bisect start", output: "", hint: "bisect start 開始搜尋" },
      { prompt: "標記目前版本為有 bug", answer: "git bisect bad", output: "", hint: "bisect bad 標記壞的" },
      { prompt: "標記四天前的版本是正常的", answer: "git bisect good n0m9l8k", output: "Bisecting: 1 revision left to test after this (roughly 1 step)\n[r3q2p1o] fix: navbar alignment", hint: "bisect good + commit hash" },
      { prompt: "測試後發現這個版本正常，標記為 good", answer: "git bisect good", output: "Bisecting: 0 revisions left to test after this\n[v6u5t4s] feat: add dashboard", hint: "bisect good" },
      { prompt: "測試後發現 bug 在這！標記為 bad", answer: "git bisect bad", output: "v6u5t4s is the first bad commit\ncommit v6u5t4s\nAuthor: teammate\n\n    feat: add dashboard", hint: "bisect bad" },
      { prompt: "找到了！結束 bisect 回到正常狀態", answer: "git bisect reset", output: "Previous HEAD position was v6u5t4s\nSwitched to branch 'main'", hint: "bisect reset 結束搜尋" },
    ],
    quiz: {
      question: "git bisect 用什麼演算法來找出問題 commit？",
      options: [
        { text: "從最新的 commit 一個一個往回找", correct: false },
        { text: "二分搜尋法（Binary Search），每次排除一半", correct: true },
        { text: "隨機抽取 commit 來測試", correct: false },
      ],
    },
  },
  {
    id: "final",
    title: "🎓 總複習完成！",
    emoji: "🏆",
    type: "final",
  },
];

/* ══════════════════════════════════════════════
   COMMAND INPUT WITH TYPEWRITER FEEDBACK
   ══════════════════════════════════════════════ */
function CommandInput({ command, onComplete }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("typing");
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput(""); setStatus("typing"); setShowHint(false);
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
  }, [command.answer]);

  const normalize = (s) => s.trim().replace(/\s+/g, " ").replace(/[""'']/g, (c) => {
    if (c === "\u201C" || c === "\u201D") return '"';
    if (c === "\u2018" || c === "\u2019") return "'";
    return c;
  });

  const checkAnswer = () => {
    const norm = normalize(input);
    const expected = normalize(command.answer);
    if (command.flexible) {
      const prefix = expected.split('"')[0].split("'")[0].trim();
      if (norm.startsWith(normalize(prefix)) && (norm.includes('"') || norm.includes("'"))) {
        setStatus("correct"); setTimeout(onComplete, 700); return;
      }
    }
    if (norm === expected) {
      setStatus("correct"); setTimeout(onComplete, 700);
    } else {
      setStatus("wrong"); setShakeKey((k) => k + 1);
      setTimeout(() => setStatus("typing"), 1200);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && input.trim()) checkAnswer(); };
  const expectedNorm = command.answer;
  const getCharColor = (i) => {
    if (status !== "typing" || i >= input.length) return "rgba(255,255,255,0.12)";
    return input[i] === expectedNorm[i] ? "#10B981" : "#EF4444";
  };

  const borderColor = status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : "rgba(255,255,255,0.15)";

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8, display: "flex", gap: 8, lineHeight: 1.6 }}>
        <span style={{ color: "#E8C872", fontWeight: 700, flexShrink: 0 }}>▸</span>
        <span>{command.prompt}</span>
      </div>
      {/* Ghost preview */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, height: 16, overflow: "hidden", marginBottom: 4, marginLeft: 24 }}>
        {status === "typing" && expectedNorm.split("").map((ch, i) => (
          <span key={i} style={{ color: getCharColor(i) }}>{ch}</span>
        ))}
      </div>
      {/* Input */}
      <div key={shakeKey} style={{
        display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)",
        border: `1.5px solid ${borderColor}`, borderRadius: 8, padding: "0 12px", marginLeft: 24,
        transition: "border-color 0.3s", animation: status === "wrong" ? "shake 0.4s ease" : "none",
      }}>
        <span style={{ color: "#10B981", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginRight: 8, userSelect: "none" }}>$</span>
        <input ref={inputRef} value={input}
          onChange={(e) => { if (status === "typing") setInput(e.target.value); }}
          onKeyDown={handleKeyDown} disabled={status === "correct"}
          placeholder="輸入指令..."
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: status === "correct" ? "#10B981" : status === "wrong" ? "#EF4444" : "#E8C872",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: "11px 0", caretColor: "#E8C872",
          }}
        />
        {status === "correct" && <span style={{ color: "#10B981", fontSize: 14 }}>✓</span>}
        {status === "wrong" && <span style={{ color: "#EF4444", fontSize: 11 }}>再試一次</span>}
      </div>
      {status === "typing" && (
        <button onClick={() => setShowHint(!showHint)}
          style={{ marginTop: 4, marginLeft: 24, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
          {showHint ? "隱藏提示" : "💡 提示"}
        </button>
      )}
      {showHint && status === "typing" && (
        <div style={{ marginTop: 2, marginLeft: 24, fontSize: 11.5, color: "rgba(232,200,114,0.55)", fontStyle: "italic" }}>
          {command.hint}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   TERMINAL SIMULATION
   ══════════════════════════════════════════════ */
function TerminalSim({ commands, onAllComplete }) {
  const [completedIdx, setCompletedIdx] = useState(-1);
  const termRef = useRef(null);

  useEffect(() => { setCompletedIdx(-1); }, [commands]);
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    if (completedIdx === commands.length - 1) setTimeout(() => onAllComplete?.(), 500);
  }, [completedIdx, commands.length, onAllComplete]);

  return (
    <div style={{ background: "#080C12", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", margin: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10B981" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>terminal</span>
      </div>
      <div ref={termRef} style={{ padding: "14px 16px", maxHeight: 400, overflowY: "auto" }}>
        {commands.slice(0, completedIdx + 1).map((cmd, i) => (
          <div key={`done-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: "#10B981" }}>$ </span>
              <span style={{ color: "#E8C872" }}>{cmd.answer}</span>
              <span style={{ color: "#10B981", marginLeft: 8, fontSize: 11 }}>✓</span>
            </div>
            {cmd.output && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(255,255,255,0.4)", whiteSpace: "pre-wrap", marginTop: 3, lineHeight: 1.5 }}>{cmd.output}</div>}
          </div>
        ))}
        {completedIdx < commands.length - 1 && (
          <CommandInput key={completedIdx + 1} command={commands[completedIdx + 1]} onComplete={() => setCompletedIdx((i) => i + 1)} />
        )}
        {completedIdx === commands.length - 1 && (
          <div style={{ textAlign: "center", padding: "10px 0 2px", color: "#10B981", fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
            ✅ 所有指令完成！
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   QUIZ
   ══════════════════════════════════════════════ */
function Quiz({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (quiz.options[i].correct) setTimeout(onComplete, 700);
  };
  return (
    <div style={{ margin: "20px 0 0", padding: "18px", background: "rgba(232,200,114,0.04)", borderRadius: 12, border: "1px solid rgba(232,200,114,0.12)" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E8C872", marginBottom: 12 }}>💡 觀念確認</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 12, lineHeight: 1.6 }}>{quiz.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.07)", tc = "rgba(255,255,255,0.65)";
          if (selected === i) {
            if (opt.correct) { bg = "rgba(16,185,129,0.12)"; bc = "#10B981"; tc = "#10B981"; }
            else { bg = "rgba(239,68,68,0.12)"; bc = "#EF4444"; tc = "#EF4444"; }
          } else if (selected !== null && opt.correct) { bg = "rgba(16,185,129,0.08)"; bc = "#10B981"; tc = "#10B981"; }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "11px 14px", background: bg, border: `1px solid ${bc}`, borderRadius: 8,
              color: tc, fontSize: 13, textAlign: "left", cursor: selected !== null ? "default" : "pointer",
              transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5,
            }}>{opt.text}</button>
          );
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>正確答案已用綠色標示 ✨</div>}
      {selected !== null && quiz.options[selected].correct && <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>✅ 正確！</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   INFOGRAPHIC PAGE (STEP 1)
   ══════════════════════════════════════════════ */
function InfoPage({ step }) {
  const [expandedWf, setExpandedWf] = useState(null);
  return (
    <div>
      {/* Comparison panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
        {step.panels.map((panel, pi) => (
          <div key={pi} style={{
            background: `${panel.color}08`, border: `1px solid ${panel.color}22`,
            borderRadius: 12, padding: "16px 14px",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{panel.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: panel.color, marginBottom: 10 }}>{panel.title}</div>
            {panel.items.map((item, ii) => (
              <div key={ii} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6, display: "flex", gap: 6, lineHeight: 1.6 }}>
                <span style={{ color: panel.color, flexShrink: 0 }}>{pi === 0 ? "✗" : "✓"}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Git Flow */}
      <div style={{ margin: "24px 0", padding: "20px", background: "rgba(232,200,114,0.04)", borderRadius: 14, border: "1px solid rgba(232,200,114,0.1)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#E8C872", marginBottom: 14 }}>{step.workflow.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {step.workflow.steps.map((ws, i) => (
            <div key={i}>
              <button onClick={() => setExpandedWf(expandedWf === i ? null : i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: expandedWf === i ? `${ws.color}15` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${expandedWf === i ? ws.color + "44" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: expandedWf === i ? "10px 10px 0 0" : 10, cursor: "pointer", transition: "all 0.3s",
                }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: ws.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${ws.color}66`,
                }} />
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: ws.color, fontWeight: 700 }}>{ws.name}</code>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginLeft: "auto" }}>{ws.desc}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginLeft: 4, transition: "transform 0.2s", transform: expandedWf === i ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
              </button>
              {expandedWf === i && (
                <div style={{
                  padding: "12px 14px", background: `${ws.color}08`, borderRadius: "0 0 10px 10px",
                  border: `1px solid ${ws.color}22`, borderTop: "none",
                  fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.7,
                }}>{ws.detail}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Commit conventions */}
      <div style={{ margin: "20px 0", padding: "20px", background: "rgba(59,130,246,0.04)", borderRadius: 14, border: "1px solid rgba(59,130,246,0.1)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#60A5FA", marginBottom: 6 }}>{step.conventions.title}</div>
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.6 }}>{step.conventions.desc}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {step.conventions.examples.map((ex, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(0,0,0,0.2)", borderRadius: 8, flexWrap: "wrap" }}>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#60A5FA", fontWeight: 700, minWidth: 70 }}>{ex.prefix}</code>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(255,255,255,0.5)", flex: 1, minWidth: 180 }}>{ex.example}</code>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{ex.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FINAL SCREEN
   ══════════════════════════════════════════════ */
function FinalScreen({ score, total }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct === 100 ? "S" : pct >= 80 ? "A" : pct >= 60 ? "B" : "C";
  const gradeColor = { S: "#E8C872", A: "#10B981", B: "#3B82F6", C: "#F59E0B" }[grade];

  const skills = [
    "Git Flow 團隊工作流程",
    "Commit 訊息慣例",
    "Clone → Branch → Commit → Push",
    "Stash 暫存與復原",
    "Rebase 與合併衝突處理",
    "版本發布與 Tag",
    "Revert 安全撤銷",
    "Bisect 二分搜尋 Debug",
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
      <div style={{
        display: "inline-block", fontSize: 48, fontWeight: 900, color: gradeColor,
        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        textShadow: `0 0 40px ${gradeColor}44`,
      }}>{grade}</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, color: "rgba(255,255,255,0.9)" }}>
        總複習完成！
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
        答對 {score}/{total} 題（{pct}%）
      </div>
      <div style={{ marginTop: 24, textAlign: "left", maxWidth: 380, margin: "24px auto 0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E8C872", marginBottom: 12 }}>📋 你已掌握的技能：</div>
        {skills.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
            borderBottom: i < skills.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <span style={{ color: "#10B981", fontSize: 13 }}>✓</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 28, padding: "16px", background: "rgba(59,130,246,0.06)",
        borderRadius: 12, border: "1px solid rgba(59,130,246,0.15)",
        fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7,
      }}>
        🚀 <strong style={{ color: "#60A5FA" }}>下一步建議：</strong>在真實專案中使用 Git Flow，嘗試為開源專案發一個 Pull Request，或是設定 CI/CD 自動化部署流程。
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function GitReview() {
  const [currentStep, setCurrentStep] = useState(0);
  const [termDone, setTermDone] = useState({});
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);

  const step = SECTIONS[currentStep];
  const totalQuizzes = SECTIONS.filter((s) => s.quiz).length;

  const goNext = () => { if (currentStep < SECTIONS.length - 1) setCurrentStep((s) => s + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep((s) => s - 1); };

  const handleTermDone = useCallback(() => { setTermDone((p) => ({ ...p, [currentStep]: true })); }, [currentStep]);
  const handleQuizDone = () => { if (!quizDone[currentStep]) { setQuizDone((p) => ({ ...p, [currentStep]: true })); setScore((s) => s + 1); } };

  return (
    <div style={{
      minHeight: "100%", background: "#080C12", color: "#E6EDF3",
      fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "'JetBrains Mono', monospace",
            }}>G★</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Git 總複習：從觀念到實戰</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>結合基礎 + 進階 · 情境式練習</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace", background: "rgba(245,158,11,0.1)", padding: "4px 10px", borderRadius: 6 }}>
            ⭐ {score}/{totalQuizzes}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {SECTIONS.map((_, i) => (
            <div key={i} onClick={() => setCurrentStep(i)} style={{
              flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
              background: i <= currentStep ? "linear-gradient(90deg, #F59E0B, #EF4444)" : "rgba(255,255,255,0.06)",
              transition: "background 0.4s ease",
            }} />
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
            {currentStep + 1}/{SECTIONS.length}
          </span>
        </div>

        {/* Content Card */}
        <div style={{
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 16, padding: "26px 22px",
        }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <h2 style={{
              margin: 0, fontSize: 20, fontWeight: 900,
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{step.title}</h2>
          </div>

          {/* === INFOGRAPHIC PAGE === */}
          {step.type === "infographic" && <InfoPage step={step} />}

          {/* === SCENARIO PAGE === */}
          {step.type === "scenario" && (
            <>
              <div style={{
                padding: "14px 16px", background: "rgba(245,158,11,0.05)",
                borderLeft: "3px solid #F59E0B", borderRadius: "0 10px 10px 0",
                fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 8,
              }}>
                <span style={{ fontWeight: 700, color: "#F59E0B" }}>📖 情境：</span>{step.story}
              </div>
              <div style={{
                padding: "14px 16px", background: "rgba(16,185,129,0.04)",
                borderLeft: "3px solid #10B981", borderRadius: "0 10px 10px 0",
                fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 4,
              }}>
                <span style={{ fontWeight: 700, color: "#10B981" }}>💼 實務觀點：</span>{step.realWorldTip}
              </div>
              <TerminalSim key={currentStep} commands={step.commands} onAllComplete={handleTermDone} />
              <Quiz key={`q-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
            </>
          )}

          {/* === FINAL PAGE === */}
          {step.type === "final" && <FinalScreen score={score} total={totalQuizzes} />}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          <button onClick={goPrev} disabled={currentStep === 0}
            style={{
              padding: "12px 24px", background: currentStep === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
              color: currentStep === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)",
              fontSize: 13, fontWeight: 600, cursor: currentStep === 0 ? "default" : "pointer",
            }}>← 上一課</button>
          <button onClick={goNext} disabled={currentStep === SECTIONS.length - 1}
            style={{
              padding: "12px 24px",
              background: currentStep === SECTIONS.length - 1 ? "rgba(255,255,255,0.02)" : "linear-gradient(135deg, #F59E0B, #EF4444)",
              border: "none", borderRadius: 10,
              color: currentStep === SECTIONS.length - 1 ? "rgba(255,255,255,0.12)" : "#fff",
              fontSize: 13, fontWeight: 700, cursor: currentStep === SECTIONS.length - 1 ? "default" : "pointer",
            }}>下一課 →</button>
        </div>
      </div>
    </div>
  );
}
