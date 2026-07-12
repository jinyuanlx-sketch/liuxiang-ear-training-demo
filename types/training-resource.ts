import type { ModuleKey } from "@/types/module";

export type TrainingResourcePlatform =
  | "douyin"
  | "xiaohongshu"
  | "bilibili"
  | "wechat_channels"
  | "internal"
  | "other";

export type TrainingResourceType =
  | "explanation"
  | "demonstration"
  | "correction"
  | "warmup"
  | "review"
  | "related_content";

export type TrainingResourceDisplayPosition =
  | "before_practice"
  | "after_practice"
  | "result_page"
  | "teacher_feedback"
  | "all";

export interface TrainingResourceLink {
  id: string;
  title: string;
  description?: string | null;
  platform: TrainingResourcePlatform;
  url: string;
  resourceType: TrainingResourceType;
  module: ModuleKey;
  questionId?: string | null;
  assignmentId?: string | null;
  displayPosition: TrainingResourceDisplayPosition;
  sortOrder: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingResourceQuery {
  module: ModuleKey;
  questionId?: string | null;
  assignmentId?: string | null;
  position: TrainingResourceDisplayPosition;
}

export interface TrainingResourceTarget {
  module: ModuleKey;
  questionId?: string | null;
  assignmentId?: string | null;
}
