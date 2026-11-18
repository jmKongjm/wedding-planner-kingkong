// 스드메 업체 후기 분석
// mode "web": Claude가 웹 검색으로 공개 후기를 찾아 장점/아쉬운 점을 정리
// mode "paste": 사용자가 붙여넣은 후기 글만 근거로 정리 (검색 비용 없음)
import { DEFAULT_MODEL } from "./_claude.js";

// 웹 검색은 30초 이상 걸릴 수 있어요
export const config = { maxDuration: 60 };

const KIND = { studio: "웨딩 스튜디오", dress: "웨딩 드레스샵", makeup: "웨딩 헤어메이크업샵" };

const SYSTEM = `당신은 예비부부를 돕는 웨딩 업체 후기 분석가입니다. 주어진 후기 자료만 근거로 업체의 장점과 아쉬운 점을 정리합니다.

규칙:
- 후기에서 실제로 확인된 내용만 씁니다. 추측하거나 지어내지 않습니다.
- 여러 후기에서 반복되는 내용 위주로 고르고, 각 항목은 한 줄(40자 이내)로 씁니다.
- 후기에서 온 내용이므로 "~라는 후기가 많아요", "~라는 평이 있어요"처럼 전해 들은 말투로 씁니다. 단정하지 않습니다.
- 협찬이나 광고로 보이는 후기는 비중을 낮춥니다.
- 이름이 같은 다른 업체와 헷갈리지 않게, 해당 분류의 웨딩 업체가 맞는지 확인합니다. 확신이 없으면 found를 false로 합니다.
- 후기를 충분히 찾지 못했으면 found를 false로 하고 note에 이유를 씁니다.
- 가운뎃점과 긴 줄표는 쓰지 않습니다.

최종 답변은 아래 JSON 하나만 출력합니다. 백틱이나 설명 문장을 붙이지 않습니다.
{"found":true,"feature":"이 업체의 분위기나 스타일 한 줄 요약","pros":["장점 3~5개"],"cons":["아쉬운 점 0~4개"],"price":"후기에 언급된 가격 정보. 없으면 빈 문자열","note":"참고할 점 한 줄. 예: 2024년 이전 후기 위주예요"}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "서버에 ANTHROPIC_API_KEY가 설정돼 있지 않아요 (Vercel 환경변수 확인)" });
  const model = (process.env.ANTHROPIC_MODEL || DEFAULT_MODEL).trim();

  try {
    const { name, type, mode, text } = req.body || {};
    const vendor = String(name || "").trim().slice(0, 60);
    if (!vendor) return res.status(400).json({ error: "업체명이 없어요" });
    const kind = KIND[type] || "웨딩 업체";
    const web = mode !== "paste";
    const pasted = String(text || "").trim().slice(0, 12000);
    if (!web && pasted.length < 30) return res.status(400).json({ error: "붙여넣은 후기가 너무 짧아요" });

    const user = web
      ? `업체명: ${vendor}\n분류: ${kind}\n\n웹 검색으로 이 업체를 실제로 이용한 예비부부의 후기(블로그, 카페, 커뮤니티)를 찾아 읽고, 규칙에 맞게 정리해 주세요. 검색어 예: "${vendor} ${kind} 후기", "${vendor} 웨딩 단점"`
      : `업체명: ${vendor}\n분류: ${kind}\n\n아래는 사용자가 직접 붙여넣은 후기 글입니다. 이 글만 근거로 규칙에 맞게 정리해 주세요.\n\n<후기>\n${pasted}\n</후기>`;

    const body = { model, max_tokens: 2000, system: SYSTEM, messages: [{ role: "user", content: user }] };
    if (web) {
      body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 4, user_location: { type: "approximate", country: "KR", timezone: "Asia/Seoul" } }];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || "API error";
      console.error("Anthropic API error:", response.status, model, msg);
      let hint = "";
      if (response.status === 404) hint = `. 모델(${model})이 없거나 은퇴했어요. Vercel 환경변수 ANTHROPIC_MODEL을 현행 모델로 바꿔주세요`;
      else if (response.status === 401) hint = ". API 키가 올바르지 않아요";
      else if (response.status === 400 && /credit/i.test(msg)) hint = ". Anthropic API 크레딧이 부족해요";
      else if (response.status === 400 && /web_search|tool/i.test(msg)) hint = ". 이 API 계정에서 웹 검색이 꺼져 있을 수 있어요. '후기 붙여넣기'는 그대로 쓸 수 있어요";
      return res.status(response.status).json({ error: `[${response.status}] ${msg}${hint}`, model });
    }

    const blocks = Array.isArray(data.content) ? data.content : [];
    const out = blocks.filter((b) => b.type === "text").map((b) => b.text || "").join("");
    const seen = new Set();
    const sources = [];
    for (const b of blocks) {
      if (b.type !== "web_search_tool_result" || !Array.isArray(b.content)) continue;
      for (const r of b.content) {
        if (r?.type !== "web_search_result" || !r.url || seen.has(r.url)) continue;
        seen.add(r.url);
        sources.push({ t: String(r.title || r.url).slice(0, 80), u: r.url });
      }
    }
    return res.status(200).json({ text: out, sources: sources.slice(0, 8), stop_reason: data.stop_reason });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "서버 오류: " + (e?.message || e) });
  }
}
