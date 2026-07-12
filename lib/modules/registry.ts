import type { ModuleSetting } from "@/types/module";

export const moduleSettings: ModuleSetting[] = [
  {
    id: "module-sight-singing",
    module: "sight_singing",
    enabled: true,
    displayName: "视唱训练",
    sortOrder: 1
  },
  {
    id: "module-ear-training",
    module: "ear_training",
    enabled: true,
    displayName: "练耳训练",
    sortOrder: 2
  },
  {
    id: "module-theory",
    module: "theory",
    enabled: false,
    displayName: "乐理训练",
    sortOrder: 3
  }
];

export function isModuleEnabled(module: ModuleSetting["module"]) {
  return moduleSettings.some((item) => item.module === module && item.enabled);
}
