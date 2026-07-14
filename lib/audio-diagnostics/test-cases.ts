export type AudioDiagnosticTestStatus = "browser_self_test" | "manual_recording";

export interface AudioDiagnosticTestCase {
  id: string;
  name: string;
  purpose: string;
  status: AudioDiagnosticTestStatus;
  passCriteria: string;
}

export const audioDiagnosticTestCases: AudioDiagnosticTestCase[] = [
  {
    id: "pure-tone",
    name: "纯音标准音频",
    purpose: "检查 YIN 基频、置信度与 cents 换算。",
    status: "browser_self_test",
    passCriteria: "440 Hz 合成纯音中位频率误差不超过 5 cents。"
  },
  {
    id: "sustained-voice",
    name: "单个持续人声音",
    purpose: "检查人声谐波、颤音与单音主体区稳定性。",
    status: "manual_recording",
    passCriteria: "主体区连续，辅音和收音帧被过滤，不出现持续八度翻转。"
  },
  {
    id: "eight-note-phrase",
    name: "八音短句",
    purpose: "检查四小节节奏时间轴与逐音映射。",
    status: "manual_recording",
    passCriteria: "八个目标音均映射到独立片段，顺序不漂移。"
  },
  {
    id: "repeated-notes",
    name: "重复音",
    purpose: "检查气口或重新起音能否分开同音片段。",
    status: "manual_recording",
    passCriteria: "存在可听起音时分成两个片段；连音时标记为待复核。"
  },
  {
    id: "mixed-duration",
    name: "长短音混合",
    purpose: "检查八分音符、四分音符、长音时值差异。",
    status: "manual_recording",
    passCriteria: "目标窗口按 rhythm 配置生成，时值偏差方向正确。"
  },
  {
    id: "phrase-with-rest",
    name: "带休止符短句",
    purpose: "检查 rest_* 节奏事件和休止窗口。",
    status: "manual_recording",
    passCriteria: "休止窗口无声时通过，有持续人声时标记异常。"
  },
  {
    id: "phrase-with-breath",
    name: "有换气的短句",
    purpose: "检查短暂 unvoiced 帧不会把后续音整体错位。",
    status: "manual_recording",
    passCriteria: "换气帧被过滤，后续目标音仍按序列对齐。"
  },
  {
    id: "iphone-safari",
    name: "iPhone Safari 录音",
    purpose: "核对实际 MIME、采样率和系统音频处理开关。",
    status: "manual_recording",
    passCriteria: "可录、可回放、可解码；诊断信息与实际设置一致。"
  },
  {
    id: "desktop-chrome",
    name: "桌面 Chrome 录音",
    purpose: "建立与 iPhone 相同演唱素材的 A/B 基线。",
    status: "manual_recording",
    passCriteria: "可录、可回放、可解码，并导出可比较的逐音结果。"
  }
];
