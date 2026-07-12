import type {
  TrainingResourceLink,
  TrainingResourcePlatform,
  TrainingResourceQuery,
  TrainingResourceTarget,
  TrainingResourceType
} from "@/types/training-resource";
import { trainingResourceLinks } from "@/lib/mock-data";

const platformHosts: Record<TrainingResourcePlatform, string[]> = {
  douyin: ["douyin.com", "iesdouyin.com", "v.douyin.com"],
  xiaohongshu: ["xiaohongshu.com", "xhslink.com"],
  bilibili: ["bilibili.com", "b23.tv"],
  wechat_channels: ["weixin.qq.com", "channels.weixin.qq.com"],
  internal: [],
  other: []
};

export const platformLabels: Record<TrainingResourcePlatform, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  bilibili: "Bilibili",
  wechat_channels: "视频号",
  internal: "内部资源",
  other: "其他"
};

export const resourceTypeLabels: Record<TrainingResourceType, string> = {
  explanation: "专项讲解",
  demonstration: "示范演示",
  correction: "常见错误纠正",
  warmup: "练前准备",
  review: "练后复盘",
  related_content: "对应训练"
};

export function validateTrainingResourceUrl(
  platform: TrainingResourcePlatform,
  rawUrl: string
) {
  try {
    const parsedUrl = new URL(rawUrl);

    if (parsedUrl.protocol !== "https:") {
      return {
        valid: false,
        message: "链接必须使用 https。"
      };
    }

    const allowedHosts = platformHosts[platform];

    if (allowedHosts.length === 0) {
      return { valid: true, message: null };
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const hostAllowed = allowedHosts.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );

    return hostAllowed
      ? { valid: true, message: null }
      : {
          valid: false,
          message: `当前平台不允许该域名：${hostname}`
        };
  } catch {
    return {
      valid: false,
      message: "链接格式无效。"
    };
  }
}

export function getTrainingResourceLinks({
  module,
  questionId,
  assignmentId,
  position
}: TrainingResourceQuery) {
  return selectTrainingResourceLinks(trainingResourceLinks, {
    module,
    questionId,
    assignmentId,
    position
  });
}

export function selectTrainingResourceLinks(
  resources: TrainingResourceLink[],
  {
    module,
    questionId,
    assignmentId,
    position
  }: TrainingResourceQuery
) {
  const activeLinks = resources
    .filter((link) => {
      const positionMatches =
        link.displayPosition === "all" || link.displayPosition === position;

      return link.isActive && link.module === module && positionMatches;
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const questionLinks = questionId
    ? activeLinks.filter((link) => link.questionId === questionId)
    : [];

  if (questionLinks.length > 0) {
    return questionLinks;
  }

  return assignmentId
    ? activeLinks.filter((link) => link.assignmentId === assignmentId)
    : [];
}

export function getTrainingResourcesForTeacherTarget({
  module,
  questionId,
  assignmentId
}: TrainingResourceTarget) {
  return selectTrainingResourcesForTeacherTarget(trainingResourceLinks, {
    module,
    questionId,
    assignmentId
  });
}

export function selectTrainingResourcesForTeacherTarget(
  resources: TrainingResourceLink[],
  { module, questionId, assignmentId }: TrainingResourceTarget
) {
  return resources
    .filter((link) => {
      return (
        link.module === module &&
        ((questionId && link.questionId === questionId) ||
          (assignmentId && link.assignmentId === assignmentId))
      );
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
