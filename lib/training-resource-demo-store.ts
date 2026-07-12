"use client";

import { useEffect, useMemo, useState } from "react";
import { trainingResourceLinks as demoTrainingResourceLinks } from "@/lib/mock-data";
import {
  selectTrainingResourceLinks,
  selectTrainingResourcesForTeacherTarget
} from "@/lib/training-resource-links";
import type {
  TrainingResourceLink,
  TrainingResourceQuery,
  TrainingResourceTarget
} from "@/types/training-resource";

const STORAGE_KEY = "liuxiang.training_resource_links.demo.v1";
const UPDATE_EVENT = "liuxiang-training-resource-links-updated";

function cloneDemoResources() {
  return demoTrainingResourceLinks.map((resource) => ({ ...resource }));
}

function isBrowser() {
  return typeof window !== "undefined";
}

function sortResources(resources: TrainingResourceLink[]) {
  return [...resources].sort((left, right) => {
    if (left.module !== right.module) {
      return left.module.localeCompare(right.module);
    }

    const leftTarget = left.questionId ?? left.assignmentId ?? "";
    const rightTarget = right.questionId ?? right.assignmentId ?? "";

    if (leftTarget !== rightTarget) {
      return leftTarget.localeCompare(rightTarget);
    }

    return left.sortOrder - right.sortOrder;
  });
}

export function readDemoTrainingResourceLinks() {
  if (!isBrowser()) {
    return cloneDemoResources();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seedResources = cloneDemoResources();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedResources));
    return seedResources;
  }

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed as TrainingResourceLink[];
    }
  } catch {
    // Fall back to the demo seed if localStorage was manually edited.
  }

  const seedResources = cloneDemoResources();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedResources));
  return seedResources;
}

export function writeDemoTrainingResourceLinks(resources: TrainingResourceLink[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortResources(resources)));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getDemoTrainingResourcesForQuery(query: TrainingResourceQuery) {
  return selectTrainingResourceLinks(readDemoTrainingResourceLinks(), query);
}

export function getDemoTrainingResourcesForTeacherTarget(target: TrainingResourceTarget) {
  return selectTrainingResourcesForTeacherTarget(readDemoTrainingResourceLinks(), target);
}

export function useTrainingResourceLinks(
  query: TrainingResourceQuery | undefined,
  initialResources: TrainingResourceLink[]
) {
  const queryKey = useMemo(() => JSON.stringify(query ?? null), [query]);
  const [resources, setResources] = useState(initialResources);

  useEffect(() => {
    if (!query) {
      setResources(initialResources);
      return;
    }

    const currentQuery = query;

    function syncResources() {
      setResources(getDemoTrainingResourcesForQuery(currentQuery));
    }

    syncResources();

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        syncResources();
      }
    }

    window.addEventListener(UPDATE_EVENT, syncResources);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncResources);
      window.removeEventListener("storage", handleStorage);
    };
  }, [initialResources, query, queryKey]);

  return resources;
}

export function useTeacherTrainingResourceLinks(
  target: TrainingResourceTarget,
  initialResources: TrainingResourceLink[]
) {
  const targetKey = useMemo(() => JSON.stringify(target), [target]);
  const [resources, setResources] = useState(initialResources);

  useEffect(() => {
    function syncResources() {
      setResources(getDemoTrainingResourcesForTeacherTarget(target));
    }

    syncResources();

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        syncResources();
      }
    }

    window.addEventListener(UPDATE_EVENT, syncResources);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncResources);
      window.removeEventListener("storage", handleStorage);
    };
  }, [initialResources, target, targetKey]);

  return resources;
}
