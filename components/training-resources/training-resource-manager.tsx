"use client";

import { useMemo, useState } from "react";
import { Edit3, Link2, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  readDemoTrainingResourceLinks,
  useTeacherTrainingResourceLinks,
  writeDemoTrainingResourceLinks
} from "@/lib/training-resource-demo-store";
import {
  platformLabels,
  resourceTypeLabels,
  validateTrainingResourceUrl
} from "@/lib/training-resource-links";
import type { ModuleKey } from "@/types/module";
import type {
  TrainingResourceDisplayPosition,
  TrainingResourceLink,
  TrainingResourcePlatform,
  TrainingResourceType
} from "@/types/training-resource";

const platformOptions: TrainingResourcePlatform[] = [
  "douyin",
  "xiaohongshu",
  "bilibili",
  "wechat_channels",
  "internal",
  "other"
];

const typeOptions: TrainingResourceType[] = [
  "explanation",
  "demonstration",
  "correction",
  "warmup",
  "review",
  "related_content"
];

const positionOptions: TrainingResourceDisplayPosition[] = [
  "before_practice",
  "after_practice",
  "result_page",
  "teacher_feedback",
  "all"
];

const positionLabels: Record<TrainingResourceDisplayPosition, string> = {
  before_practice: "练前显示",
  after_practice: "练后显示",
  result_page: "结果页显示",
  teacher_feedback: "老师反馈区",
  all: "全部位置"
};

type ResourceFormState = {
  title: string;
  description: string;
  platform: TrainingResourcePlatform;
  url: string;
  resourceType: TrainingResourceType;
  displayPosition: TrainingResourceDisplayPosition;
  sortOrder: string;
  isActive: boolean;
};

function getNextSortOrder(resources: TrainingResourceLink[]) {
  const maxSortOrder = resources.reduce(
    (currentMax, resource) => Math.max(currentMax, resource.sortOrder),
    0
  );

  return `${maxSortOrder + 1}`;
}

function createBlankForm(resources: TrainingResourceLink[]): ResourceFormState {
  return {
    title: "",
    description: "",
    platform: "douyin",
    url: "https://v.douyin.com/example/",
    resourceType: "related_content",
    displayPosition: "all",
    sortOrder: getNextSortOrder(resources),
    isActive: true
  };
}

export function TrainingResourceManager({
  resources,
  bindingLabel,
  module,
  questionId = null,
  assignmentId = null
}: {
  resources: TrainingResourceLink[];
  bindingLabel: string;
  module: ModuleKey;
  questionId?: string | null;
  assignmentId?: string | null;
}) {
  const target = useMemo(
    () => ({
      module,
      questionId,
      assignmentId
    }),
    [assignmentId, module, questionId]
  );
  const editableResources = useTeacherTrainingResourceLinks(target, resources);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceFormState>(() => createBlankForm(resources));
  const [message, setMessage] = useState<string | null>(null);
  const validation = useMemo(
    () => validateTrainingResourceUrl(form.platform, form.url),
    [form.platform, form.url]
  );
  const editingResource = editingId
    ? editableResources.find((resource) => resource.id === editingId)
    : null;

  function updateForm<K extends keyof ResourceFormState>(
    key: K,
    value: ResourceFormState[K]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value
    }));
  }

  function resetForm(currentResources = editableResources) {
    setEditingId(null);
    setForm(createBlankForm(currentResources));
  }

  function editResource(resource: TrainingResourceLink) {
    setEditingId(resource.id);
    setMessage(null);
    setForm({
      title: resource.title,
      description: resource.description ?? "",
      platform: resource.platform,
      url: resource.url,
      resourceType: resource.resourceType,
      displayPosition: resource.displayPosition,
      sortOrder: `${resource.sortOrder}`,
      isActive: resource.isActive
    });
  }

  function deleteResource(resource: TrainingResourceLink) {
    const confirmed = window.confirm(`确认删除「${resource.title}」吗？`);

    if (!confirmed) {
      return;
    }

    const nextResources = readDemoTrainingResourceLinks().filter(
      (item) => item.id !== resource.id
    );
    writeDemoTrainingResourceLinks(nextResources);
    resetForm(nextResources);
    setMessage("已删除训练资源链接。Demo 模式下改动保存在当前浏览器。");
  }

  function saveResource() {
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    const title = form.title.trim();

    if (!title) {
      setMessage("请填写资源标题。");
      return;
    }

    if (!questionId && !assignmentId) {
      setMessage("缺少 question_id 或 assignment_id，无法保存资源绑定。");
      return;
    }

    const sortOrder = Number.parseInt(form.sortOrder, 10);

    if (!Number.isFinite(sortOrder) || sortOrder < 1) {
      setMessage("排序必须是大于 0 的数字。");
      return;
    }

    const now = new Date().toISOString();
    const allResources = readDemoTrainingResourceLinks();
    const nextResource: TrainingResourceLink = {
      id: editingId ?? `resource-demo-${Date.now()}`,
      title,
      description: form.description.trim() || null,
      platform: form.platform,
      url: form.url.trim(),
      resourceType: form.resourceType,
      module,
      questionId,
      assignmentId,
      displayPosition: form.displayPosition,
      sortOrder,
      isActive: form.isActive,
      createdBy: editingResource?.createdBy ?? "teacher-demo",
      createdAt: editingResource?.createdAt ?? now,
      updatedAt: now
    };
    const nextResources = editingId
      ? allResources.map((resource) =>
          resource.id === editingId ? nextResource : resource
        )
      : [...allResources, nextResource];

    writeDemoTrainingResourceLinks(nextResources);
    resetForm(nextResources);
    setMessage(
      editingId
        ? "已保存训练资源链接。学生端将读取更新后的标题和说明。"
        : "已新增训练资源链接。学生端将读取这条资源。"
    );
  }

  return (
    <section className="liuxiang-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-ivory">训练资源链接</h2>
            <Badge tone="warning">Demo 本地数据</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">
            当前绑定：{bindingLabel}。这些字段来自 training_resource_links；当前 Demo 写入浏览器本地存储，接入 Supabase 后写入数据库。
          </p>
        </div>
        <Link2 className="h-5 w-5 shrink-0 text-brass" />
      </div>

      <div className="mt-4 space-y-3">
        {editableResources.length > 0 ? (
          editableResources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-md border border-ivory/10 bg-ink-950/40 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={resource.isActive ? "success" : "disabled"}>
                      {resource.isActive ? "启用" : "停用"}
                    </Badge>
                    <Badge tone="neutral">{platformLabels[resource.platform]}</Badge>
                    <Badge tone="neutral">{resourceTypeLabels[resource.resourceType]}</Badge>
                    <span className="text-xs text-muted">
                      {positionLabels[resource.displayPosition]} · #{resource.sortOrder}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-ivory">{resource.title}</div>
                  {resource.description ? (
                    <p className="mt-1 text-xs leading-5 text-muted">{resource.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    icon={<Edit3 className="h-4 w-4" />}
                    onClick={() => editResource(resource)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => deleteResource(resource)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-ivory/10 bg-ink-950/40 p-3 text-sm text-muted">
            暂无训练资源链接。
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ivory/10 pt-4">
        <div>
          <h3 className="text-base font-semibold text-ivory">
            {editingId ? "编辑训练资源链接" : "新增训练资源链接"}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            标题、说明、平台、链接、显示位置、排序和启停都会作为资源数据保存，不写死在学生端组件里。
          </p>
        </div>
        {editingId ? (
          <Button type="button" variant="ghost" icon={<X className="h-4 w-4" />} onClick={() => resetForm()}>
            取消编辑
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-muted">资源标题</span>
          <input
            value={form.title}
            onChange={(event) => updateForm("title", event.target.value)}
            placeholder="例如：三度跳进偏低的练后复盘"
            className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted">平台</span>
          <select
            value={form.platform}
            onChange={(event) =>
              updateForm("platform", event.target.value as TrainingResourcePlatform)
            }
            className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70"
          >
            {platformOptions.map((option) => (
              <option key={option} value={option}>
                {platformLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-muted">具体视频链接</span>
          <input
            value={form.url}
            onChange={(event) => updateForm("url", event.target.value)}
            className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
          />
          {!validation.valid ? (
            <span className="text-xs text-red-100">{validation.message}</span>
          ) : (
            <span className="text-xs text-jade">链接格式可保存</span>
          )}
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted">资源类型</span>
          <select
            value={form.resourceType}
            onChange={(event) =>
              updateForm("resourceType", event.target.value as TrainingResourceType)
            }
            className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {resourceTypeLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted">显示位置</span>
          <select
            value={form.displayPosition}
            onChange={(event) =>
              updateForm(
                "displayPosition",
                event.target.value as TrainingResourceDisplayPosition
              )
            }
            className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950 px-3 text-sm text-ivory outline-none focus:border-brass/70"
          >
            {positionOptions.map((option) => (
              <option key={option} value={option}>
                {positionLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted">排序</span>
          <input
            type="number"
            min={1}
            value={form.sortOrder}
            onChange={(event) => updateForm("sortOrder", event.target.value)}
            className="h-11 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-ivory/10 bg-ink-950/40 px-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateForm("isActive", event.target.checked)}
          />
          启用
        </label>
      </div>

      <label className="mt-3 block space-y-2">
        <span className="text-sm text-muted">资源说明</span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
          placeholder="例如：适合本题第 2-4 小节练习后复盘。"
          className="w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 py-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
        />
      </label>

      {message ? (
        <div className="mt-3 rounded-md border border-brass/20 bg-brass/10 p-3 text-sm text-brass">
          {message}
        </div>
      ) : null}

      <Button
        type="button"
        variant="primary"
        className="mt-4"
        icon={<Plus className="h-4 w-4" />}
        disabled={!validation.valid}
        onClick={saveResource}
      >
        {editingId ? "保存修改" : "添加资源链接"}
      </Button>
    </section>
  );
}
