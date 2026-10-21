// 공통 Claude API 호출부 (파일명이 _로 시작하면 Vercel이 별도 API 경로로 만들지 않아요)
// 모델은 Vercel 환경변수 ANTHROPIC_MODEL로 바꿀 수 있어요.
// → 모델이 은퇴해도 코드 수정 없이 Vercel 설정에서 값만 바꾸고 재배포하면 돼요.
// 은퇴 일정: https://platform.claude.com/docs/en/about-claude/model-deprecations
export const DEFAULT_MODEL = "claude-sonnet-5-5";

export function makeHandler({ maxTokens }) {
  return async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "서버에 ANTHROPIC_API_KEY가 설정돼 있지 않아요 (Vercel 환경변수 확인)" });
    const model = (process.env.ANTHROPIC_MODEL || DEFAULT_MODEL).trim();

    try {
      const { system, messages } = req.body || {};
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data?.error?.message || "API error";
        console.error("Anthropic API error:", response.status, model, msg);
        let hint = "";
        if (response.status === 404) hint = ` — 모델(${model})이 없거나 은퇴했어요. Vercel 환경변수 ANTHROPIC_MODEL을 현행 모델로 바꿔주세요`;
        else if (response.status === 401) hint = " — API 키가 올바르지 않아요";
        else if (response.status === 400 && /credit/i.test(msg)) hint = " — Anthropic API 크레딧이 부족해요";
        return res.status(response.status).json({ error: `[${response.status}] ${msg}${hint}`, model });
      }
      if (data.stop_reason === "max_tokens") console.warn("Response truncated at max_tokens", model);
      return res.status(200).json(data);
    } catch (e) {
      console.error("Server error:", e);
      return res.status(500).json({ error: "서버 오류: " + (e?.message || e) });
    }
  };
}
