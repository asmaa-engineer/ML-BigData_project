import type { ActionLogEntry } from "../lib/contracts";

const actionLog: ActionLogEntry[] = [];

export function listActionLogs() {
  return [...actionLog].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function appendActionLog(entry: Omit<ActionLogEntry, "id" | "createdAt">) {
  const item: ActionLogEntry = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };

  actionLog.unshift(item);

  if (actionLog.length > 100) {
    actionLog.length = 100;
  }

  return item;
}
