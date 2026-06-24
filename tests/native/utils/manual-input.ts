import fs from 'node:fs';
import readline from 'node:readline';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pause the test and wait for the user to enter a value DIRECTLY ON THE DEVICE
 * (e.g. type an emailed verification code into a field in the app), then resume
 * with that value.
 *
 * `read` is a thunk that returns the field's current value — typically
 *   () => screen.getByLabel('Code').getValue()
 * We poll it until `isComplete(value)` is true (default: any non-empty value).
 * Polling the device also keeps the session alive during the wait.
 *
 * Note: read the field by a STABLE locator (getByLabel/getByTestId), NOT by
 * placeholder — the placeholder disappears once text is entered, so a
 * getByPlaceholder locator would stop matching mid-typing.
 */
export const waitForDeviceInput = async (
  read: () => Promise<string>,
  opts: {
    isComplete?: (value: string) => boolean;
    message?: string;
    pollMs?: number;
    timeoutMs?: number;
  } = {},
): Promise<string> => {
  const {
    isComplete = (value) => value.length > 0,
    message = 'Waiting for you to enter the value on the device…',
    pollMs = 1_000,
    timeoutMs = 10 * 60_000,
  } = opts;

  console.log(`\n⏸  ${message}\n`);

  const start = Date.now();
  for (;;) {
    let value = '';
    try { value = (await read())?.trim() ?? ''; } catch { /* field not ready yet */ }
    if (isComplete(value)) {
      console.log(`✅  Detected on-device input "${value}", continuing.\n`);
      return value;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`waitForDeviceInput: timed out after ${timeoutMs}ms waiting for on-device input`);
    }
    await sleep(pollMs);
  }
};

/**
 * Pause the test and wait for the user to type a value in the SAME terminal the
 * test is running in, then resume with it. One terminal — no second window.
 *
 * The runner executes tests in a worker process whose process.stdin is not wired
 * to the terminal, so we read/write /dev/tty (the controlling terminal) directly,
 * which the worker can reach.
 *
 * `keepAlive` (optional): a cheap device query (e.g. () => screen.getByLabel('Code').isVisible())
 * run every `keepAliveMs` while we wait, so a physical device session doesn't go
 * idle during the pause. Errors from it are ignored.
 *
 * Interactive only — needs a real terminal (/dev/tty); it will reject in CI /
 * headless runs, so gate callers behind nativeEnv.runManual (RUN_MANUAL=1). The
 * calling test must also relax its timeout (e.g. test.setTimeout(0)).
 */
export const promptManualInput = (
  question: string,
  opts: { keepAlive?: () => Promise<unknown>; keepAliveMs?: number } = {},
): Promise<string> =>
  new Promise((resolve, reject) => {
    const { keepAlive, keepAliveMs = 5_000 } = opts;

    let input: fs.ReadStream;
    let output: fs.WriteStream;
    try {
      input = fs.createReadStream('/dev/tty');
      output = fs.createWriteStream('/dev/tty');
    } catch {
      reject(new Error('promptManualInput: no interactive terminal (/dev/tty). Run locally in a real terminal.'));
      return;
    }

    const rl = readline.createInterface({ input, output });

    const timer = keepAlive
      ? setInterval(() => { Promise.resolve(keepAlive()).catch(() => { /* best effort */ }); }, keepAliveMs)
      : undefined;

    rl.question(`\n⏸  ${question} `, (answer) => {
      if (timer) clearInterval(timer);
      rl.close();
      input.close();
      output.close();
      resolve(answer.trim());
    });
  });
