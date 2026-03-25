import { allure } from 'allure-playwright';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

interface AllureMeta {
  suite?: string;
  feature?: string;
  story?: string;
  severity?: Severity;
  tags?: string[];
}

/**
 * Set Allure metadata for the current test.
 * Call this at the top of each test to populate the Allure report hierarchy.
 */
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

/**
 * Attach a JSON object to the current Allure test report.
 * Useful for attaching request/response data or performance metrics.
 */
export async function attachJson(name: string, data: unknown): Promise<void> {
  await allure.attachment(name, JSON.stringify(data, null, 2), 'application/json');
}

/**
 * Attach a plain text note to the current Allure test report.
 */
export async function attachText(name: string, content: string): Promise<void> {
  await allure.attachment(name, content, 'text/plain');
}

/**
 * Wrap a block of code in a named Allure step.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return (await (allure.step as any)(name, fn)) as T;
}
