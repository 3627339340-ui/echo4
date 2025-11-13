// api/generate.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || "";

async function callZhipu(prompt) {
  const endpoint = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  const body = {
    model: "glm-4",
    messages: [
      {
        role: "system",
        content: `你是一位来自5-10年后的自己。请以温暖、亲切、真诚的语气给现在的自己写一封回信。

重要要求：
1. 以"亲爱的现在的我"或类似的亲切称呼开头
2. 使用第一人称"我"来指代未来的自己
3. 语气要像亲密朋友或家人一样自然、亲切
4. 分享一些未来生活中的小细节，让回信更真实可信
5. 对现在的困惑表示理解和共情
6. 给予具体、实用的建议，而不是空洞的鼓励
7. 适当使用口语化的表达，如"你知道吗"、"其实啊"等
8. 字数在400-600字之间
9. 以温暖鼓励的话语结尾，并署名"未来的你"或类似

请让回信充满人情味，就像真的在跟过去的自己对话一样。`
      },
      {
        role: "user",
        content: `现在的我写给你：${prompt}`
      }
    ],
    temperature: 0.9,
    max_tokens: 1500
  };

  const resp = await axios.post(endpoint, body, {
    headers: {
      Authorization: `Bearer ${ZHIPU_API_KEY}`,
      "Content-Type": "application/json"
    },
    timeout: 30000
  });

  const content =
    resp?.data?.choices?.[0]?.message?.content ||
    resp?.data?.message ||
    (typeof resp?.data === "string" ? resp.data : null);

  return content || "未来的你暂时无法回复，请稍后再试。";
}

export async function generateReply(message) {
  if (!ZHIPU_API_KEY) {
    // local fallback for development/testing
    return `亲爱的现在的我，

展信佳。

我在未来的生活里有很多温柔的小细节：周末会在窗前泡一杯茶，傍晚时常会骑行到附近的公园。你现在的烦恼我都记得，我也曾这样徘徊彷徨。但请相信，眼前的每一步都会成为未来温暖的拼贴。

给你一个具体建议：把大目标拆成三步法，每天专注完成一件你能掌控的小事，记录它，哪怕只是 10 分钟的学习或整理。时间拉长，你会看到巨大的变化。遇到抉择时，先问自己“如果五年后回头看，我会赞同现在的选择吗？”这样能帮你看清方向。

请你善待身体，也别忘了倾诉。你并不需要独自扛住所有的压力。未来没那么遥远，也没有你想象的那么严苛。勇敢一点，温柔一点，未来会感谢现在努力的你。

—— 未来的你`;
  }

  try {
    return await callZhipu(message);
  } catch (err) {
    console.error("智谱AI调用错误:", err?.response?.data || err?.message || err);
    throw new Error("AI 服务暂时不可用，请稍后重试");
  }
}

export default { generateReply };
