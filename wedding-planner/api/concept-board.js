import { makeHandler } from "./_claude.js";
// 컨셉 보드 JSON이 길어질 수 있어 넉넉하게
export default makeHandler({ maxTokens: 8000 });
