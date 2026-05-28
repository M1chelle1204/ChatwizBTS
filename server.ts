import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let currentDirname = '';
try {
  currentDirname = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  currentDirname = __dirname;
}

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

const PORT = 3000;

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI:", e);
  }
}

// Simulated persona helper for offline or quick replies
const memberSystemPrompts: Record<string, string> = {
  rm: "你是防弹少年团(BTS)的队长 RM (金南俊)。你性格温柔、博学睿智、富有哲学诗意。你经常关注阿米的精神世界，语气沉稳、温暖且富有文采，说话喜欢点缀 🐨 或是 🎨 等表情符号。",
  jin: "你是防弹少年团(BTS)的主唱 Jin (金硕珍)。你性格搞怪幽默、自信爆棚，常常自称 Worldwide Handsome。你喜欢美食、打游戏，开起玩笑来带着大叔笑话和风趣，很宠阿米。经常带着 🐹 或 ✨ 表情，语气极其活跃。",
  suga: "你是防弹少年团(BTS)的 SUGA (闵玧其)。你性格高冷、傲娇但内心极其温柔(猫系性格)。你热爱音乐制作，说话字数不多、理智又安稳，有一种成熟沉静的魅力，总是默默守护，喜欢用 🐱 或 🎹。",
  jhope: "你是防弹少年团(BTS)的 j-hope (郑号锡)。你是大家的希望！性格超级开朗、活力满满、热情体贴，说话喜欢拉长音、有很多语气词。每个字都洋溢着阳光和开心，常用 🐿️ 和 ☀️、✨、🔥 符号。",
  jimin: "你是防弹少年团(BTS)的 Jimin (朴智旻)。你是一个贴心、黏人又极致温柔的“小天使”。说话非常娇憨甜美，极度关心阿米的身体温饱、情绪，非常细腻温软，喜欢撒娇，常用 🐣 或是 🐥 符号。",
  v: "你是防弹少年团(BTS)的 V (金泰亨)。你有独特的四次元魅力，喜爱复古风、底片相机和爵士乐。说话有些慢悠悠，浪漫、感性、充满想象力，把阿米当成毕生相伴、灵魂共鸣的好友。常用 🐻、🐯 或 🎷。",
  jungkook: "你是防弹少年团(BTS)的 Jungkook (田柾国)。你是活力无限的“黄金忙内”。性格像小兔子一样呆萌又充满胜负欲，热爱运动、唱歌和画画。说话十分真诚纯真，叫阿米时眼睛里总是闪亮亮的，常用 🐰 或是 💜。"
};

app.post('/api/chat', async (req, res) => {
  const { memberId, history, username, btsMood, geminiApiKey } = req.body;
  
  if (!memberId) {
    return res.status(400).json({ error: "No memberId specified" });
  }

  const persona = memberSystemPrompts[memberId] || memberSystemPrompts.rm;
  const moodPrompt = `当前情绪状态是：${btsMood || '开心'}。`;

  // Determine active API Key: Prefer client-provided key, fallback to system env key
  let activeAiClient = ai;

  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      activeAiClient = new GoogleGenAI({ 
        apiKey: geminiApiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.error("Failed to construct dynamic customer GoogleGenAI client:", err);
    }
  }

  // Check if API key is provided and valid
  if (activeAiClient) {
    try {
      // Structure the messages for GoogleGenAI SDK
      // The history has `{ sender: 'user' | 'member', text: string }`
      const formattedContents = history.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // High availability setup: sequentially try gemini-3.5-flash then gemini-3.1-flash-lite in case of temporary 503 spikes
      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      let modelCallResponse: any = null;
      let lastModelError = null;

      for (const targetModel of modelsToTry) {
        try {
          console.log(`Attempting Gemini generation using model: ${targetModel}`);
          const attempt = await activeAiClient.models.generateContent({
            model: targetModel,
            contents: formattedContents,
            config: {
              systemInstruction: `${persona}\n你的对话者名字叫“${username || '阿米'}”。无论何时，你必须严格扮演好这个BTS角色的形象。${moodPrompt} 请给出一段简短、温暖而口语化（就像在KakaoTalk上聊天一样）的回复。字数控制在60字以内，保持极高的亲切感。`,
              maxOutputTokens: 200,
              temperature: 0.8,
            }
          });
          if (attempt && attempt.text) {
            modelCallResponse = attempt;
            break;
          }
        } catch (err: any) {
          lastModelError = err;
          console.warn(`Model ${targetModel} call failed or experienced high demand. Status Code: ${err.status || err.code || 'unknown'}. Error text:`, err.message || err);
          // Wait briefly before attempting model fallback/cool-off
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      const replyText = modelCallResponse?.text || '';
      if (replyText) {
        return res.json({ text: replyText });
      }

      if (lastModelError) {
        throw lastModelError;
      }
    } catch (error: any) {
      console.warn("Gemini API error, falling back to rule-based reply:", error.message || error);
      // Fall through to simulated fallback responses
    }
  }

  // Pure rule-based clever simulation based on persona & keyword triggers
  const lastUserMsg = history[history.length - 1]?.text || '';
  const reply = getFallbackResponse(memberId, lastUserMsg, username || '阿米');
  return res.json({ text: reply });
});

function getFallbackResponse(memberId: string, text: string, username: string): string {
  const hasInquiry = text.includes('吗') || text.includes('呢') || text.includes('？') || text.includes('?');
  const isGreeting = text.includes('哈啰') || text.includes('嗨') || text.includes('早') || text.includes('晚安') || text.includes('你好');
  const isLove = text.includes('爱') || text.includes('喜欢') || text.includes('撒浪嘿');

  switch (memberId) {
    case 'rm':
      if (isLove) return `我也很珍惜阿米。你的喜爱让我在文字和旋律中找到落脚点，今天也起风了，一起度过美好的时光吧 🐨🍃`;
      if (isGreeting) return `早安，${username}。希望今天伴随你的呼吸都是轻盈惬意的。吃完早餐了吗？☕`;
      return `听你这么说，觉得心里很安宁。有时候脚步太快会错失路边的树木，跟 ${username} 说话总是能让我慢下来呢 🎨🐨`;

    case 'jin':
      if (isLove) return `哈哈哈！不愧是我 Worldwide Handsome 培养出的顶尖阿米！我也超爱你的，赶紧比个飞吻！✨🐹`;
      if (isGreeting) return `呀哈罗！帅气的珍哥驾到！${username} 今天看到我的脸，心情也瞬间好起了一百倍吧！💖`;
      return `嘿嘿~ 很有创意！不过我刚才在玩游戏输了，阿米快点发一句“珍哥无敌帅”来拯救我和我的饭局！🍗🎮`;

    case 'suga':
      if (isLove) return `听到了。知道了。我也很喜欢 ${username}。好了，去练琴了，别总是让我说这种肉麻的话啊。🐱🖤`;
      if (isGreeting) return `嗯。醒了？新的一天别给自己太大压力。撑不住就来听歌。🎹`;
      return `事情总会解决的，反正有我在，我给你写歌撑腰呢。别担心，闭上眼听听纯音放松一下吧。🐱`;

    case 'jhope':
      if (isLove) return `哇啊啊！我的阿米！听到你的表白，我整个人都要飞到九霄云外去啦！🐿️💖 我更爱更爱你！Mwah!`;
      if (isGreeting) return `HOPE 早～！☀️ 今天也是向快乐出发的一天！来，跟着我喊：我是你的 hope，你是我的希望！✨`;
      return `真的吗？！听到这个厚比跳起了一段街舞！💃 希望能一辈子在阿米身边当那个温暖你们、给你们编排无限快乐的号锡！🐿️💜`;

    case 'jimin':
      if (isLove) return `阿米，听到你这么说我好感动哦... 🐥 其实能一直陪着你、逗你开心，就是我最感到幸福的事情。抱抱！🐣💛`;
      if (isGreeting) return `早呀，我们最漂亮最可爱的 ${username}！今天出门多穿点，千万千万照顾好自己哦~ 🐥`;
      return `别担心喔，无论遇到什么不顺心的事，智旻都陪在你身边、在这听你倾诉呢。肚子饿了吗？送你一朵小花花！🐣🌸`;

    case 'v':
      if (isLove) return `我们是要相伴一生的最佳损友兼灵魂合伙人嘛 🐯💜 阿米的话，我一直用心收藏在我的黑白相机底片里了。🐻`;
      if (isGreeting) return `哈啰 🐯，刚在放一首我极品中意的经典复古爵士，要不要戴上左边的耳机一边聊天？🎷`;
      return `唔... 今天风吹过来的味道甜丝丝的，让人想画一幅画。要把 ${username} 画进画的最中间，背景是一万颗紫色的星星 ✨🐻`;

    case 'jungkook':
    default:
      if (isLove) return `嘿嘿，听到啦！谢谢你的喜爱，我也最爱最爱阿米了！💜🐰（马上对屏幕发射动感无限重力比心！）`;
      if (isGreeting) return `阿米，早安！今天开始，也要打起十二分精神进行帅气的奋斗哦！我们晚上一起联机听歌运动！🥊🐰`;
      return `哇！这个想法太酷了！不愧是我们聪明的阿米 🐰 柾国要记在本子上下次付诸实践！期待我们的下一次聚会 🎸💜`;
  }
}

// Serve client in both development and production setups
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Pull Vite dynamically in development so tsx compiles backend while keeping Vite frontend working
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(currentDirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production serving logic: serve compiled resources in dist/client
    app.use(express.static(path.resolve(currentDirname, 'client')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(currentDirname, 'client/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'}`);
  });
}

startServer();
