import { spawn } from "node:child_process";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

function setEnv(name, value) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["convex", "env", "set", name], {
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    });
    child.stdin.write(value);
    child.stdin.end();
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`convex env set ${name} exited ${code}`));
      }
    });
  });
}

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

await setEnv("JWT_PRIVATE_KEY", privateKey);
await setEnv("JWKS", jwks);
console.log("Set JWT_PRIVATE_KEY and JWKS on the Convex deployment.");
