import { allure } from 'allure-playwright';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

interface AllureMeta {
  suite?: string;
  feature?: string;
  story?: string;
  severity?: Severity;
  tags?: string[];
}

export async function setAllureMeta({
  suite,
  feature,
  story,
  severity = 'normal',
  tags = [],
}: AllureMeta): Promise<void> {
  if (suite) await allure.suite(suite);
  if (feature) await allure.feature(feature);
  if (story) await allure.story(story);
  await allure.severity(severity);
  for (const tag of tags) {
    await allure.tag(tag);
  }
}

export async function attachJson(name: string, data: unknown): Promise<void> {
  await allure.attachment(name, JSON.stringify(data, null, 2), 'application/json');
}

export async function attachText(name: string, content: string): Promise<void> {
  await allure.attachment(name, content, 'text/plain');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return (await (allure.step as any)(name, fn)) as T;
}
