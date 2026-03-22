import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRef = process.env.SUPABASE_PROJECT_REF || "mkpcliytqudclkwtewru";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error("Missing SUPABASE_ACCESS_TOKEN.");
  process.exit(1);
}

const repoRoot = process.cwd();

async function readTemplate(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return readFile(absolutePath, "utf8");
}

const payload = {
  mailer_subjects_confirmation: "GasGx | Confirm your account",
  mailer_subjects_magic_link: "GasGx | Secure sign-in link",
  mailer_subjects_recovery: "GasGx | Reset your password",
  mailer_subjects_email_change: "GasGx | Confirm your email change",
  mailer_subjects_reauthentication: "GasGx | Security verification code",
  mailer_templates_confirmation_content: await readTemplate("supabase/templates/auth-confirmation.html"),
  mailer_templates_magic_link_content: await readTemplate("supabase/templates/auth-magic-link.html"),
  mailer_templates_recovery_content: await readTemplate("supabase/templates/auth-recovery.html"),
  mailer_templates_email_change_content: await readTemplate("supabase/templates/auth-email-change.html"),
  mailer_templates_reauthentication_content: await readTemplate("supabase/templates/auth-reauthentication.html")
};

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  console.error(`Failed to update templates: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const result = await response.json();
console.log(JSON.stringify({
  projectRef,
  mailer_subjects_confirmation: result.mailer_subjects_confirmation,
  mailer_subjects_magic_link: result.mailer_subjects_magic_link,
  mailer_subjects_recovery: result.mailer_subjects_recovery,
  mailer_subjects_email_change: result.mailer_subjects_email_change,
  mailer_subjects_reauthentication: result.mailer_subjects_reauthentication
}, null, 2));
