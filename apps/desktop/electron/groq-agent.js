/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Groq AI Desktop Agent Engine
 * Uses Groq API (llama-3.3-70b-versatile) for deep repository analysis,
 * environment resolution, workflow generation, and failure auto-healing.
 */

const GROQ_MODEL = 'llama-3.3-70b-versatile';

function getGroqApiKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY.trim();
  try {
    const base = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
    const settingsFile = path.join(base, 'OpenStore', 'settings.json');
    if (fs.existsSync(settingsFile)) {
      const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
      if (data.groqApiKey) return data.groqApiKey.trim();
    }
  } catch {}
  return '';
}

/**
 * Perform HTTPS POST request to Groq API
 */
function callGroqAPI(messages, temperature = 0.1) {
  return new Promise((resolve, reject) => {
    const apiKey = getGroqApiKey();
    if (!apiKey) {
      return reject(new Error('Groq API Key is not configured. (Optional) Set GROQ_API_KEY in Settings or .env to enable AI Auto-Healing.'));
    }

    const payload = JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      response_format: { type: 'json_object' },
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(body);
            const content = parsed.choices?.[0]?.message?.content || '{}';
            resolve(JSON.parse(content));
          } catch (e) {
            reject(new Error(`Failed to parse Groq response JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`Groq API Error HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Groq API request timed out (30s)'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Deep scan repository files to build context for Groq AI
 */
function gatherRepoContext(repoPath) {
  const context = {
    repoPath,
    fileTree: [],
    readmeSnippet: '',
    packageJson: null,
    envExample: null,
    dockerfilePresent: false,
    dockerComposePresent: false,
    requirementsTxtPresent: false,
    makefilePresent: false,
  };

  try {
    if (!fs.existsSync(repoPath)) return context;

    // File tree (top 2 levels)
    const scanDir = (dir, depth = 0) => {
      if (depth > 2) return;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'dist' || item.name === 'out') continue;
        const rel = path.relative(repoPath, path.join(dir, item.name));
        context.fileTree.push(rel);
        if (item.isDirectory() && depth < 2) {
          scanDir(path.join(dir, item.name), depth + 1);
        }
      }
    };
    scanDir(repoPath);

    // Read README snippet
    const readmeFile = fs.readdirSync(repoPath).find(f => f.toLowerCase().startsWith('readme'));
    if (readmeFile) {
      const readmeContent = fs.readFileSync(path.join(repoPath, readmeFile), 'utf-8');
      context.readmeSnippet = readmeContent.substring(0, 3500); // Max 3.5k chars
    }

    // Read package.json
    const pkgPath = path.join(repoPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        context.packageJson = {
          name: pkg.name,
          scripts: pkg.scripts || {},
          dependencies: Object.keys(pkg.dependencies || {}).slice(0, 30),
          devDependencies: Object.keys(pkg.devDependencies || {}).slice(0, 30),
        };
      } catch {}
    }

    // Check .env.example / .env.sample
    const envExFile = fs.readdirSync(repoPath).find(f => f.startsWith('.env.example') || f.startsWith('.env.sample') || f === '.env.template');
    if (envExFile) {
      try {
        context.envExample = fs.readFileSync(path.join(repoPath, envExFile), 'utf-8').substring(0, 1500);
      } catch {}
    }

    // Flags
    context.dockerfilePresent = fs.existsSync(path.join(repoPath, 'Dockerfile'));
    context.dockerComposePresent = fs.existsSync(path.join(repoPath, 'docker-compose.yml')) || fs.existsSync(path.join(repoPath, 'docker-compose.yaml'));
    context.requirementsTxtPresent = fs.existsSync(path.join(repoPath, 'requirements.txt'));
    context.makefilePresent = fs.existsSync(path.join(repoPath, 'Makefile'));

  } catch (err) {
    console.error('[GROQ AGENT] Gather context error:', err);
  }

  return context;
}

/**
 * Ask Groq AI Agent to analyze repo architecture and output setup/start execution plan
 */
async function analyzeRepositoryWithGroq(repoPath) {
  const context = gatherRepoContext(repoPath);

  const systemPrompt = `You are OpenStore's AI Desktop Agent. 
CRITICAL PRINCIPLE: Cloned GitHub repositories contain SOURCE CODE, NOT pre-built binary executables (.exe)! 
You must NEVER expect or look for a .exe file in a source repository. Instead, analyze the repository structure, package configuration files, entry points, and README snippet to construct an exact, multi-step execution workflow from source code to install, configure, build, and run the app on a Desktop machine.

Return ONLY a valid JSON object matching this schema:
{
  "ecosystem": "node" | "python" | "docker" | "go" | "rust" | "static-html" | "unknown",
  "run_mode": "browser" | "ide" | "terminal" | "executable",
  "install_commands": ["string command 1", "string command 2"],
  "build_commands": ["string command"],
  "start_command": "string command to launch app",
  "detected_port": 3000,
  "is_web_app": true | false,
  "resolved_cwd_relative": "." | "relative/subfolder/path",
  "env_setup_required": true | false,
  "env_commands": ["copy .env.example .env"],
  "action_steps": [
    { "step": 1, "title": "Environment Setup", "command": "copy .env.example .env", "description": "Configure local environment file" },
    { "step": 2, "title": "Install Dependencies", "command": "npm install", "description": "Install node package dependencies" },
    { "step": 3, "title": "Launch App", "command": "npm run dev", "description": "Start local dev server" }
  ],
  "explanation": "Short 1-2 sentence explanation of how the app was analyzed from source and how it will be executed."
}

Rules:
1. "run_mode" must be:
   - "browser" if it is a web frontend/fullstack app (Next.js, React, Vite, Vue, Streamlit, FastAPI, Flask, Rails, Laravel, etc.) with a local web server port.
   - "terminal" if it is a CLI tool, script, or backend service without web UI.
   - "executable" ONLY if the repo explicitly builds a Desktop app binary (e.g. Electron, Tauri, Rust/C++ UI).
   - "ide" if it is a library, code collection, or non-runnable project best opened in an editor.
2. If ".env.example" or ".env.sample" exists, include a command like "copy .env.example .env" in env_commands and action_steps.
3. Be precise with ports (default to 3000 for Node/Next, 5173 for Vite, 8000 for FastAPI/Django, 8501 for Streamlit, 5000 for Flask).
4. If a monorepo subfolder (like "web", "frontend", "apps/web") contains the main app, set "resolved_cwd_relative" to that path.`;

  const userMessage = `Repository Directory Context:
Files in repository:
${context.fileTree.join('\n')}

Dockerfile present: ${context.dockerfilePresent}
Docker Compose present: ${context.dockerComposePresent}
Requirements.txt present: ${context.requirementsTxtPresent}
Makefile present: ${context.makefilePresent}

package.json:
${context.packageJson ? JSON.stringify(context.packageJson, null, 2) : 'None'}

.env example file:
${context.envExample || 'None'}

README snippet:
${context.readmeSnippet || 'No README found'}
`;

  try {
    const result = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ], 0.1);

    // Standardize result structure
    return {
      ecosystem: result.ecosystem || 'unknown',
      run_mode: result.run_mode || 'ide',
      install_commands: Array.isArray(result.install_commands) ? result.install_commands : [],
      build_commands: Array.isArray(result.build_commands) ? result.build_commands : [],
      start_command: result.start_command || '',
      detected_port: result.detected_port || 3000,
      is_web_app: result.is_web_app ?? (result.run_mode === 'browser'),
      resolved_cwd_relative: result.resolved_cwd_relative || '.',
      env_setup_required: !!result.env_setup_required,
      env_commands: Array.isArray(result.env_commands) ? result.env_commands : [],
      action_steps: Array.isArray(result.action_steps) ? result.action_steps : [],
      explanation: result.explanation || 'Analyzed with Groq AI Agent.',
    };
  } catch (err) {
    console.error('[GROQ AGENT] Analysis failed:', err.message);
    throw err;
  }
}

/**
 * Ask Groq AI Agent to diagnose a setup error and suggest fix steps
 */
async function diagnoseFailureWithGroq(repoPath, failedCommand, errorOutput) {
  const systemPrompt = `You are OpenStore's AI Self-Healing Agent. A setup command failed while installing or starting a repository.
Analyze the error logs and output corrective commands.

Return ONLY a valid JSON object matching this schema:
{
  "cause": "Short summary of why it failed (e.g. missing .env file, missing package manager pnpm, port collision)",
  "fix_commands": ["command 1 to run", "command 2 to run"],
  "explanation": "User friendly suggestion on what was done to fix it."
}`;

  const userMessage = `Repository Path: ${repoPath}
Failed Command: ${failedCommand}
Error Output / Logs:
${errorOutput.substring(0, 3000)}
`;

  try {
    const result = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ], 0.1);

    return {
      cause: result.cause || 'Unknown setup error',
      fix_commands: Array.isArray(result.fix_commands) ? result.fix_commands : [],
      explanation: result.explanation || 'Self-healing recommendation generated.',
    };
  } catch (err) {
    console.error('[GROQ AGENT] Self-healing diagnosis failed:', err.message);
    return {
      cause: err.message,
      fix_commands: [],
      explanation: 'Could not perform AI diagnosis.',
    };
  }
}

module.exports = {
  analyzeRepositoryWithGroq,
  diagnoseFailureWithGroq,
};
