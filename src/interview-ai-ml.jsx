import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChapterNav } from "./chapter-context";
import { colors, lessonThemes, hexToRgba } from "./theme";

const { accent: ACCENT, accent2: ACCENT2 } = lessonThemes["/interview-ai-ml"];

/* ══════════════════════════════════════════════
   面試複習：AI / ML 技術
   ══════════════════════════════════════════════ */

const STEPS = [
  /* ─── Python ─── */
  {
    id: "python",
    title: "Python",
    emoji: "🐍",
    oneLiner: "Python 是高階直譯式語言，語法簡潔，擁有最豐富的資料科學與 AI 生態系，是 ML 開發的事實標準。",
    projectUsage: "FindYourJob 整個後端用 FastAPI（Python 框架）建構，從 API 路由、資料處理、SQLite 存取到 LLM 串接全部用 Python 完成。",
    projectTag: "FindYourJob 後端",
    interviewQA: [
      {
        q: "Python 的 GIL 是什麼？對多執行緒有什麼影響？",
        a: "GIL（Global Interpreter Lock）是 CPython 的全域鎖，同一時間只有一個執行緒能執行 Python bytecode。這讓 CPU-bound 的多執行緒無法真正平行，但 I/O-bound（網路、檔案）不受影響。解法：用 multiprocessing 做 CPU 平行、用 asyncio 做 I/O 並行。",
      },
      {
        q: "List comprehension 和 generator expression 有什麼差別？",
        a: "List comprehension [x for x in range(n)] 一次建立完整 list 放在記憶體；generator expression (x for x in range(n)) 是惰性求值，一次只產生一個值。資料量大時 generator 省記憶體，但只能遍歷一次。",
      },
      {
        q: "裝飾器（Decorator）是什麼？你在專案裡怎麼用？",
        a: "裝飾器是接收函式並回傳新函式的語法糖，用 @decorator 套用。FastAPI 的 @app.get('/path') 就是裝飾器，把一般函式註冊為 API endpoint。我也用 @lru_cache 快取 LLM 回應來避免重複推論。",
      },
    ],
    quiz: {
      question: "Python 中哪種做法最適合處理 CPU-bound 的平行運算？",
      options: [
        { text: "threading 多執行緒", correct: false },
        { text: "multiprocessing 多程序", correct: true },
        { text: "單純用 for 迴圈就好", correct: false },
      ],
    },
  },

  /* ─── PyTorch ─── */
  {
    id: "pytorch",
    title: "PyTorch",
    emoji: "🔥",
    oneLiner: "PyTorch 是 Meta 開發的深度學習框架，以動態計算圖和 Pythonic API 著稱，是學術研究和產業的主流選擇。",
    projectUsage: "在論文中使用 PyTorch 建構 CNN 模型做影像分類與物件偵測，利用 autograd 自動微分和 GPU 加速訓練，並用 torchvision 做資料增強。",
    projectTag: "論文研究",
    interviewQA: [
      {
        q: "PyTorch 的動態計算圖和 TensorFlow 1.x 的靜態計算圖有什麼差別？",
        a: "PyTorch 每次 forward pass 都重新建構計算圖（define-by-run），可以用 Python 的 if/for 控制流程，方便 debug。TensorFlow 1.x 要先定義完整圖再執行（define-and-run）。不過 TF2 加了 Eager Mode 後兩者已經很接近。",
      },
      {
        q: "model.train() 和 model.eval() 的差異？",
        a: "model.train() 啟用 Dropout 和 BatchNorm 的訓練行為；model.eval() 關閉 Dropout，BatchNorm 改用移動平均。驗證和推論前一定要切 eval()，否則結果會不穩定。通常搭配 torch.no_grad() 一起用來節省記憶體。",
      },
      {
        q: "什麼是 DataLoader？為什麼要用它？",
        a: "DataLoader 把 Dataset 包裝成可迭代的 mini-batch 載入器，支援 shuffle、多程序載入（num_workers）、自動 batching。不用自己寫 batch 切割邏輯，而且多程序預載資料能讓 GPU 不用等 CPU。",
      },
    ],
    quiz: {
      question: "在進行模型推論（inference）時，應該使用哪種模式？",
      options: [
        { text: "model.train() + torch.no_grad()", correct: false },
        { text: "model.eval() + torch.no_grad()", correct: true },
        { text: "不需要特別設定，直接跑就好", correct: false },
      ],
    },
  },

  /* ─── scikit-learn ─── */
  {
    id: "sklearn",
    title: "scikit-learn",
    emoji: "🧪",
    oneLiner: "scikit-learn 是 Python 最受歡迎的傳統 ML 函式庫，提供分類、回歸、聚類、降維等演算法的統一 API。",
    projectUsage: "在 AIGO 專案中用 TfidfVectorizer 做文本向量化、用 cosine_similarity 計算職缺相似度，並用 cross_val_score 做模型評估。",
    projectTag: "AIGO 專案",
    interviewQA: [
      {
        q: "scikit-learn 的 Pipeline 是什麼？為什麼要用它？",
        a: "Pipeline 把多個處理步驟（前處理 → 特徵工程 → 模型）串成一條鏈，確保 fit/transform 順序正確。好處是：避免 data leakage（不會在 test set 上 fit）、程式碼更簡潔、方便做 GridSearchCV。",
      },
      {
        q: "train_test_split 時 stratify 參數的作用？",
        a: "stratify 確保切割後的訓練集和測試集保持和原始資料相同的類別比例。在不平衡資料集中特別重要，例如正樣本只有 5%，不加 stratify 可能切出來的 test set 完全沒有正樣本。",
      },
    ],
    quiz: {
      question: "scikit-learn 的 Pipeline 主要解決什麼問題？",
      options: [
        { text: "加速模型訓練速度", correct: false },
        { text: "確保前處理和模型訓練的順序正確，防止 data leakage", correct: true },
        { text: "自動選擇最佳演算法", correct: false },
      ],
    },
  },

  /* ─── TensorFlow ─── */
  {
    id: "tensorflow",
    title: "TensorFlow",
    emoji: "🧠",
    oneLiner: "TensorFlow 是 Google 開發的深度學習框架，強項在於生產部署（TF Serving、TF Lite）和大規模分散式訓練。",
    projectUsage: "在早期專案中使用 TensorFlow/Keras 建構影像分類模型，用 tf.data 做高效資料管線，並透過 SavedModel 格式部署。",
    projectTag: "早期專案",
    interviewQA: [
      {
        q: "TensorFlow 和 PyTorch 你怎麼選？",
        a: "研究和快速原型用 PyTorch，因為動態圖好 debug、社群論文多。要部署到 mobile/edge 用 TensorFlow，因為 TF Lite 和 TF.js 生態完整。現在兩者差距越來越小，團隊用什麼就跟什麼。",
      },
      {
        q: "Keras 和 TensorFlow 的關係？",
        a: "Keras 原本是獨立的高階 API，後來被整合為 TensorFlow 的官方高階介面（tf.keras）。它讓你用 Sequential 或 Functional API 幾行就能建模型，底層還是跑 TensorFlow 的計算。",
      },
    ],
    quiz: {
      question: "如果要把模型部署到手機上，哪個工具最適合？",
      options: [
        { text: "PyTorch Lightning", correct: false },
        { text: "TensorFlow Lite", correct: true },
        { text: "scikit-learn joblib", correct: false },
      ],
    },
  },

  /* ─── OpenCV ─── */
  {
    id: "opencv",
    title: "OpenCV",
    emoji: "📸",
    oneLiner: "OpenCV 是最廣泛使用的電腦視覺函式庫，提供影像讀取、轉換、濾波、特徵偵測等 2500+ 個函式。",
    projectUsage: "在論文中使用 OpenCV 進行影像前處理（cv2.resize、cvtColor、normalize），搭配 PyTorch 模型做物件偵測的資料管線。",
    projectTag: "論文研究",
    interviewQA: [
      {
        q: "OpenCV 讀取影像時的色彩順序是什麼？為什麼要注意？",
        a: "OpenCV 用 BGR 順序，而大部分框架（PIL、matplotlib、PyTorch）用 RGB。不轉換的話顏色會錯亂——紅色變藍色。用 cv2.cvtColor(img, cv2.COLOR_BGR2RGB) 轉換。",
      },
      {
        q: "影像前處理常見的步驟有哪些？",
        a: "Resize 到統一尺寸 → 正規化（除以 255 或 z-score）→ 資料增強（翻轉、旋轉、裁切、色彩抖動）→ 轉成 Tensor。前處理的好壞直接影響模型表現，尤其是正規化和增強策略。",
      },
    ],
    quiz: {
      question: "OpenCV 讀取的影像預設色彩順序是？",
      options: [
        { text: "RGB（紅綠藍）", correct: false },
        { text: "BGR（藍綠紅）", correct: true },
        { text: "HSV（色相飽和亮度）", correct: false },
      ],
    },
  },

  /* ─── 深度學習 ─── */
  {
    id: "deep-learning",
    title: "深度學習",
    emoji: "🔬",
    oneLiner: "深度學習是機器學習的子領域，使用多層神經網路自動學習資料中的階層特徵表示，不需手動設計特徵。",
    projectUsage: "在論文中用 CNN 做影像分類和物件偵測，在 FindYourJob 中使用基於 Transformer 的 LLM 做自然語言理解與生成。",
    projectTag: "論文 + FindYourJob",
    interviewQA: [
      {
        q: "Overfitting 是什麼？怎麼解決？",
        a: "模型在訓練集上表現很好但在新資料上很差，代表它「背答案」而非學到通則。解法：增加資料量、Data Augmentation、Dropout、Early Stopping、L2 正則化、降低模型複雜度。我在論文中組合使用 Dropout + Augmentation 有效降低了 overfitting。",
      },
      {
        q: "Batch Normalization 的作用是什麼？",
        a: "BN 在每個 mini-batch 內對每層的輸出做正規化（均值 0、標準差 1），解決 Internal Covariate Shift 問題。好處：加速收斂、允許更大 learning rate、有輕微正則化效果。通常放在 Conv/Linear 後、激活函數前。",
      },
      {
        q: "Learning Rate 太大和太小分別會怎樣？",
        a: "太大：loss 震盪不收斂甚至發散；太小：收斂極慢容易卡在 local minimum。實務上用 lr scheduler（如 CosineAnnealing）或 warmup 策略，先小後大再逐漸降低。",
      },
    ],
    quiz: {
      question: "模型在 training set 上 accuracy 99% 但 validation set 只有 60%，最可能的問題是？",
      options: [
        { text: "Underfitting（欠擬合）", correct: false },
        { text: "Overfitting（過擬合）", correct: true },
        { text: "資料標注錯誤", correct: false },
      ],
    },
  },

  /* ─── 電腦視覺 ─── */
  {
    id: "computer-vision",
    title: "電腦視覺",
    emoji: "👁️",
    oneLiner: "電腦視覺讓機器能「看懂」圖像和影片，核心任務包括影像分類、物件偵測、語意分割、OCR 等。",
    projectUsage: "論文使用 CNN + Transfer Learning 做影像分類，用預訓練的 ResNet 做 backbone 並在自訂資料集上 fine-tune，達到 90%+ 準確率。",
    projectTag: "論文研究",
    interviewQA: [
      {
        q: "CNN 為什麼特別適合處理影像？",
        a: "三個關鍵特性：局部連接（每個 filter 只看小區域，捕捉局部特徵）、權重共享（同一個 filter 掃過整張圖，大幅減少參數）、平移不變性（物體移動位置不影響偵測）。比全連接網路少了幾個數量級的參數。",
      },
      {
        q: "物件偵測和影像分類有什麼不同？",
        a: "影像分類只回答「整張圖是什麼」（一個類別標籤），物件偵測要回答「圖中有哪些物體、在哪裡」（多個 bounding box + 類別）。偵測更難，要同時做定位和分類。代表性模型：分類用 ResNet，偵測用 YOLO / Faster R-CNN。",
      },
      {
        q: "什麼是 Transfer Learning？為什麼在 CV 中很常用？",
        a: "用大資料集（如 ImageNet）預訓練的模型作為起點，再用自己的小資料集 fine-tune。因為底層 filter 學到的邊緣、紋理等特徵是通用的，不需要從零開始學。省時間、省資料、效果更好。",
      },
    ],
    quiz: {
      question: "Transfer Learning 的核心概念是？",
      options: [
        { text: "把一個任務學到的知識遷移到另一個相關任務上", correct: true },
        { text: "把模型從一台電腦複製到另一台", correct: false },
        { text: "讓模型同時學習多個不相關的任務", correct: false },
      ],
    },
  },

  /* ─── LLM ─── */
  {
    id: "llm",
    title: "LLM 大型語言模型",
    emoji: "💬",
    oneLiner: "LLM 是基於 Transformer 架構、在海量文本上預訓練的模型，能理解和生成自然語言，是當前 AI 的核心技術。",
    projectUsage: "FindYourJob 用 Ollama 在本地跑 LLM（Llama 3），分析職缺描述、萃取關鍵技能需求、生成個人化的履歷修改建議。",
    projectTag: "FindYourJob",
    interviewQA: [
      {
        q: "LLM 的 temperature 參數代表什麼？",
        a: "temperature 控制輸出的隨機性。低值（如 0.1）讓模型選擇機率最高的 token，輸出穩定但缺乏創意；高值（如 0.9）增加隨機性，更有創意但可能胡說。任務型（摘要、分析）用低溫，創作型（文案、brainstorm）用高溫。",
      },
      {
        q: "Prompt Engineering 有哪些常見技巧？",
        a: "Few-shot（給幾個範例）、Chain-of-Thought（要求逐步推理）、Role-playing（指定角色如「你是資深工程師」）、Format instruction（指定輸出為 JSON）。我在 FindYourJob 中用 system prompt 設定角色 + few-shot 範例來穩定輸出格式。",
      },
      {
        q: "LLM 的幻覺（Hallucination）問題是什麼？如何緩解？",
        a: "LLM 會自信地生成看似正確但實際不存在的資訊。緩解方式：RAG（讓模型參考外部知識）、降低 temperature、要求模型標註信心程度、加入 fact-checking 步驟。FindYourJob 用 RAG 提供真實職缺資料來降低幻覺。",
      },
    ],
    quiz: {
      question: "想讓 LLM 輸出穩定且準確的結構化資料，temperature 應該設多少？",
      options: [
        { text: "0.9 ~ 1.0（高溫，更有創意）", correct: false },
        { text: "0.1 ~ 0.3（低溫，更確定性）", correct: true },
        { text: "temperature 不影響輸出品質", correct: false },
      ],
    },
  },

  /* ─── RAG ─── */
  {
    id: "rag",
    title: "RAG 檢索增強生成",
    emoji: "🔍",
    oneLiner: "RAG 結合「檢索」和「生成」，讓 LLM 先從知識庫找到相關文件，再根據這些文件生成回答，解決幻覺和知識過時問題。",
    projectUsage: "FindYourJob 的核心架構就是 RAG：用 Embedding 把職缺資料向量化存入向量資料庫，使用者提問時先檢索最相關的職缺，再把它們作為 context 給 LLM 生成精準的求職建議。",
    projectTag: "FindYourJob",
    interviewQA: [
      {
        q: "RAG 解決了 LLM 的什麼問題？",
        a: "三個核心問題：(1) 幻覺——有真實文件佐證就不容易瞎編；(2) 知識過時——不用重新訓練，更新知識庫就好；(3) 領域知識不足——把公司內部文件加入知識庫，LLM 就能回答專業問題。",
      },
      {
        q: "RAG 的架構包含哪些元件？",
        a: "三大元件：(1) Embedding Model——把文本轉成向量；(2) Vector Database——儲存和搜尋向量（如 ChromaDB、Pinecone）；(3) LLM——接收 query + retrieved context 生成回答。流程：Query → Embed → 向量搜尋 → 取得相關文件 → LLM 生成。",
      },
      {
        q: "Chunking 策略對 RAG 效果有什麼影響？",
        a: "文件要切成合適大小的 chunk 才能有效檢索。太大：檢索精度低，塞太多無關資訊；太小：失去上下文，語意不完整。常見策略：固定長度（512 tokens）+ overlap（128 tokens），或按語意段落切割。",
      },
    ],
    quiz: {
      question: "RAG 中 Vector Database 的主要功能是？",
      options: [
        { text: "儲存原始文字檔案", correct: false },
        { text: "儲存文本向量並進行相似度搜尋", correct: true },
        { text: "訓練 LLM 模型", correct: false },
      ],
    },
  },

  /* ─── NLP ─── */
  {
    id: "nlp",
    title: "NLP 自然語言處理",
    emoji: "📝",
    oneLiner: "NLP 讓電腦能理解、分析和生成人類語言，應用涵蓋翻譯、情感分析、問答、摘要等。",
    projectUsage: "FindYourJob 用 NLP 技術分析職缺描述（tokenization、關鍵字擷取、語意比對），在 AIGO 中用 TF-IDF 做文本相似度計算。",
    projectTag: "FindYourJob + AIGO",
    interviewQA: [
      {
        q: "Tokenization 是什麼？BPE 和 WordPiece 有什麼差別？",
        a: "Tokenization 把文字切成模型能理解的 token。BPE（GPT 系列用）從字元開始，逐步合併最頻繁的 pair；WordPiece（BERT 用）則是選擇合併後最大化語言模型概率的 pair。兩者都能處理未知詞（拆成子詞），但合併策略不同。",
      },
      {
        q: "Word Embedding 和 One-Hot Encoding 的差異？",
        a: "One-Hot 每個詞是一個高維稀疏向量（維度=詞彙量），詞之間沒有語意關係。Embedding 把每個詞映射到低維稠密向量（如 300 維），語意相近的詞向量相近。例如 king - man + woman ≈ queen。",
      },
      {
        q: "Attention 機制為什麼是 NLP 的突破？",
        a: "傳統 RNN/LSTM 依序處理，長距離資訊會被遺忘。Attention 讓模型直接「注意」到序列中任意位置的相關資訊，不管距離多遠。Self-Attention 更進一步讓每個 token 和所有其他 token 互相關注，這就是 Transformer 的核心。",
      },
    ],
    quiz: {
      question: "Word Embedding 相比 One-Hot Encoding 的最大優勢是？",
      options: [
        { text: "計算速度更快", correct: false },
        { text: "能捕捉詞和詞之間的語意關係", correct: true },
        { text: "不需要預訓練就能使用", correct: false },
      ],
    },
  },

  /* ─── 生成式 AI ─── */
  {
    id: "generative-ai",
    title: "生成式 AI",
    emoji: "✨",
    oneLiner: "生成式 AI 能創造新內容（文字、圖像、程式碼、音樂），核心技術包括 LLM（GPT）、Diffusion Model（Stable Diffusion）等。",
    projectUsage: "FindYourJob 運用生成式 AI 自動產出個人化求職信草稿和面試準備建議，根據使用者背景和職缺需求量身打造內容。",
    projectTag: "FindYourJob",
    interviewQA: [
      {
        q: "生成式 AI 和判別式 AI 的關鍵區別？",
        a: "判別式 AI（如分類器）學習的是 P(Y|X)——給資料預測類別。生成式 AI 學習的是 P(X) 或 P(X|Y)——理解資料的分布並生成新樣本。簡單說：判別式 AI 分辨真假，生成式 AI 創造新東西。",
      },
      {
        q: "Transformer 架構為什麼是生成式 AI 的基礎？",
        a: "Transformer 的 Self-Attention 機制能平行處理長序列、捕捉長距離依賴關係，不像 RNN 有序列瓶頸。這讓模型能擴展到數十億參數，處理海量資料後展現出「湧現能力」（emergent capabilities），這就是 GPT、Claude 等 LLM 的基礎。",
      },
      {
        q: "如何評估生成式 AI 的輸出品質？",
        a: "文字類：人工評估（流暢度、正確性、相關性）+ 自動指標（BLEU、ROUGE、BERTScore）。但自動指標和人類判斷常常不一致，所以實務上以人工評估 + A/B test 為主。我在 FindYourJob 中設計了使用者回饋機制來評估生成品質。",
      },
    ],
    quiz: {
      question: "Transformer 相比 RNN 的核心優勢是？",
      options: [
        { text: "參數更少、更容易訓練", correct: false },
        { text: "能平行處理序列，且不受距離限制地捕捉依賴關係", correct: true },
        { text: "不需要 GPU 就能高效運行", correct: false },
      ],
    },
  },
];

/* ── Shared Components ── */
function ConceptBlocks({ blocks }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
      {blocks.map((b, i) => (
        <div
          key={i}
          style={{
            padding: "14px 16px",
            background: hexToRgba(b.color, 0.031),
            borderLeft: `3px solid ${b.color}`,
            borderRadius: "0 10px 10px 0",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 6 }}>
            {b.title}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            {b.content}
          </div>
        </div>
      ))}
    </div>
  );
}

function InterviewQA({ qas }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "16px 0" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 4 }}>
        🎤 面試官會問
      </div>
      {qas.map((item, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${openIdx === i ? hexToRgba(ACCENT, 0.3) : "rgba(255,255,255,0.06)"}`,
            borderRadius: 10,
            overflow: "hidden",
            transition: "border-color 0.3s",
          }}
        >
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: openIdx === i ? hexToRgba(ACCENT, 0.04) : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "left",
              transition: "background 0.3s",
            }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: ACCENT,
              background: hexToRgba(ACCENT, 0.12),
              padding: "2px 8px",
              borderRadius: 4,
              flexShrink: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Q{i + 1}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1, lineHeight: 1.5 }}>
              {item.q}
            </span>
            <span style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 12,
              flexShrink: 0,
              transform: openIdx === i ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s",
            }}>
              ▼
            </span>
          </button>
          {openIdx === i && (
            <div style={{
              padding: "0 16px 14px",
              borderTop: `1px solid rgba(255,255,255,0.04)`,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#10B981",
                marginTop: 12,
                marginBottom: 6,
              }}>
                💡 你應該這樣回答：
              </div>
              <div style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.8,
                padding: "10px 14px",
                background: "rgba(16,185,129,0.04)",
                borderRadius: 8,
                borderLeft: "3px solid #10B981",
              }}>
                {item.a}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Quiz({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (quiz.options[i].correct) setTimeout(onComplete, 700);
  };
  return (
    <div
      style={{
        margin: "20px 0 0",
        padding: "18px",
        background: hexToRgba(ACCENT, 0.04),
        borderRadius: 12,
        border: `1px solid ${hexToRgba(ACCENT, 0.12)}`,
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, marginBottom: 12 }}>
        🧩 快速測驗
      </div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 12, lineHeight: 1.6 }}>
        {quiz.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {quiz.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)", bc = "rgba(255,255,255,0.07)", tc = "rgba(255,255,255,0.65)";
          if (selected === i) {
            if (opt.correct) { bg = "rgba(16,185,129,0.12)"; bc = "#10B981"; tc = "#10B981"; }
            else { bg = "rgba(239,68,68,0.12)"; bc = "#EF4444"; tc = "#EF4444"; }
          } else if (selected !== null && opt.correct) {
            bg = "rgba(16,185,129,0.08)"; bc = "#10B981"; tc = "#10B981";
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              padding: "11px 14px", background: bg, border: `1px solid ${bc}`,
              borderRadius: 8, color: tc, fontSize: 13, textAlign: "left",
              cursor: selected !== null ? "default" : "pointer",
              transition: "all 0.3s", fontFamily: "inherit", lineHeight: 1.5,
            }}>
              {opt.text}
            </button>
          );
        })}
      </div>
      {selected !== null && !quiz.options[selected].correct && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "rgba(239,68,68,0.7)" }}>正確答案已用綠色標示</div>
      )}
      {selected !== null && quiz.options[selected].correct && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>✅ 正確！</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */
export default function InterviewAiMl() {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);
  const [quizDone, setQuizDone] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { prevPath, nextPath } = useChapterNav();

  const step = STEPS[currentStep];
  const goNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep((s) => s - 1); };
  const handleQuizDone = () => {
    if (!quizDone[currentStep]) {
      setQuizDone((p) => ({ ...p, [currentStep]: true }));
      setScore((s) => s + 1);
    }
  };

  return (
    <div style={{
      minHeight: "100%", background: "#080D14", color: "#E6EDF3",
      fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#fff",
            }}>
              AI
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>面試複習：AI / ML</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {STEPS.length} 個技術 · 模擬面試
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 12, color: ACCENT, fontFamily: "'JetBrains Mono', monospace",
            background: hexToRgba(ACCENT, 0.1), padding: "4px 10px", borderRadius: 6,
          }}>
            ⭐ {score}/{STEPS.length}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setCurrentStep(i)} style={{
              flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
              background: i <= currentStep ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` : "rgba(255,255,255,0.06)",
              transition: "background 0.4s",
            }} />
          ))}
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8,
            fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
          }}>
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>

        {/* Content Card */}
        <div style={{
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 16, padding: "26px 22px",
        }}>
          {/* Step title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{step.emoji}</span>
            <div>
              <h2 style={{
                margin: 0, fontSize: 20, fontWeight: 900,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {step.title}
              </h2>
              <div style={{
                fontSize: 11, color: hexToRgba(ACCENT, 0.6), marginTop: 2,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {step.projectTag}
              </div>
            </div>
          </div>

          {/* One-liner */}
          <ConceptBlocks blocks={[
            { title: "一句話說清楚", color: ACCENT, content: step.oneLiner },
            { title: "我在專案裡怎麼用", color: "#10B981", content: step.projectUsage },
          ]} />

          {/* Interview QA */}
          <InterviewQA qas={step.interviewQA} />

          {/* Quiz */}
          <Quiz key={`q-${currentStep}`} quiz={step.quiz} onComplete={handleQuizDone} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {currentStep === 0 ? (
            prevPath ? (
              <button onClick={() => navigate(prevPath)} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一章</button>
            ) : <div />
          ) : (
            <button onClick={goPrev} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← 上一個技術</button>
          )}
          {currentStep === STEPS.length - 1 ? (
            nextPath ? (
              <button onClick={() => navigate(nextPath)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一章 →</button>
            ) : <div />
          ) : (
            <button onClick={goNext} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>下一個技術 →</button>
          )}
        </div>

        {/* Completion */}
        {currentStep === STEPS.length - 1 && quizDone[currentStep] && (
          <div style={{
            marginTop: 24, textAlign: "center", padding: "24px",
            background: hexToRgba(ACCENT, 0.08), border: `1px solid ${hexToRgba(ACCENT, 0.2)}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, marginBottom: 6 }}>
              AI/ML 面試複習完成！
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              你已經複習了 {STEPS.length} 個 AI/ML 核心技術。<br />
              記得用自己的專案經驗來回答，不要背定義！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
