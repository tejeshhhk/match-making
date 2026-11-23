import { spawnSync } from "node:child_process";
import process from "node:process";

const prisma =
  process.platform === "win32"
    ? "node_modules/.bin/prisma.cmd"
    : "node_modules/.bin/prisma";

spawnSync(
  prisma,
  ["migrate", "resolve", "--rolled-back", "20261119200500_add_login_attempt"],
  { stdio: "inherit" },
);
