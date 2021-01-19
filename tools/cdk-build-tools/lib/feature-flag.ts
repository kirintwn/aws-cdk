import * as path from 'path';
import * as fs from 'fs-extra';
import * as semver from 'semver';

type Flags = {[key: string]: any} | undefined

/* eslint-disable jest/no-export */

export function withFeatureFlag<T>(
  name: string,
  flags: Flags,
  x: new (flags: Flags) => T,
  fn: (app: T) => void,
  repoRoot: string = path.join(process.cwd(), '..', '..', '..')) {

  const resolveVersionPath = path.join(repoRoot, 'scripts', 'resolve-version.js');
  if (!fs.existsSync(resolveVersionPath)) {
    throw new Error(`file not present at path ${resolveVersionPath}. You will likely need to set 'repoRoot'.`);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ver = require(resolveVersionPath).version;
  const sem = semver.parse(ver);
  if (!sem) {
    throw new Error(`version ${ver} is not a semver`);
  }
  if (sem.major === 2) {
    if (flags === undefined || Object.keys(flags).length === 0) {
      // If no feature flag is set, the test is asserting the old behaviour, i.e., feature flag disabled
      // In CDKv2, this behaviour is not supported. Skip the test.
      return;
    } else {
      // If feature flags are passed, the test is asserting the new behaviour, i.e., feature flag enabled
      // In CDKv2, ignore the context as the default behaviour is as if the feature flag is enabled.
      const app = new x(undefined);
      return test(name, async () => fn(app));
    }
  }
  const app = new x({ context: flags });
  return test(name, () => fn(app));
}