import { execSync as exec } from 'child_process';

function check(cmnd: string, err: string) {
  let isWorking: boolean;
  try {
    exec(cmnd, { stdio: 'ignore' });
    isWorking = true;
  } catch (e) {
    isWorking = false;
  }

  if (!isWorking) {
    process.stderr.write(err);
    process.exit(1);
  }

  return true;
}

export default check;
