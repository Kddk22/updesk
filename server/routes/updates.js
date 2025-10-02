import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub Repository Information
const GITHUB_OWNER = 'uptec-ps';
const GITHUB_REPO = 'updesk';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

// Get current version from package.json
async function getCurrentVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return null;
  }
}

// Fetch latest release from GitHub
async function getLatestRelease() {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'User-Agent': 'UpDesk-Update-Checker',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      version: data.tag_name.replace(/^v/, ''), // Remove 'v' prefix if present
      name: data.name,
      body: data.body,
      publishedAt: data.published_at,
      htmlUrl: data.html_url,
      tarballUrl: data.tarball_url,
      zipballUrl: data.zipball_url
    };
  } catch (error) {
    console.error('Error fetching latest release:', error);
    throw error;
  }
}

// Compare versions (simple semantic versioning)
function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return 1; // Update available
    if (latestPart < currentPart) return -1; // Current is newer
  }

  return 0; // Same version
}

// GET /api/updates/check - Check for updates
router.get('/check', async (req, res) => {
  try {
    const currentVersion = await getCurrentVersion();
    if (!currentVersion) {
      return res.status(500).json({ error: 'Could not determine current version' });
    }

    const latestRelease = await getLatestRelease();
    const comparison = compareVersions(currentVersion, latestRelease.version);

    res.json({
      currentVersion,
      latestVersion: latestRelease.version,
      updateAvailable: comparison > 0,
      releaseInfo: comparison > 0 ? latestRelease : null
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ 
      error: 'Failed to check for updates',
      message: error.message 
    });
  }
});

// POST /api/updates/install - Install update
router.post('/install', async (req, res) => {
  try {
    const currentVersion = await getCurrentVersion();
    const latestRelease = await getLatestRelease();
    const comparison = compareVersions(currentVersion, latestRelease.version);

    if (comparison <= 0) {
      return res.status(400).json({ 
        error: 'No update available',
        currentVersion,
        latestVersion: latestRelease.version
      });
    }

    // Check if we're running in Docker
    const isDocker = await fs.access('/.dockerenv')
      .then(() => true)
      .catch(() => false);

    if (!isDocker) {
      return res.status(400).json({ 
        error: 'Updates are only supported in Docker containers',
        message: 'Please update manually or use Docker deployment'
      });
    }

    // Trigger update script
    const updateScriptPath = path.join(__dirname, '../../update.sh');
    
    // Check if update script exists
    try {
      await fs.access(updateScriptPath);
    } catch {
      return res.status(500).json({ 
        error: 'Update script not found',
        message: 'Please ensure update.sh exists in the project root'
      });
    }

    // Start update process in background
    res.json({
      success: true,
      message: 'Update process started',
      currentVersion,
      targetVersion: latestRelease.version,
      note: 'The application will restart automatically after the update'
    });

    // Execute update script after response is sent
    setTimeout(async () => {
      try {
        console.log('Starting update process...');
        await execAsync(`bash ${updateScriptPath} ${latestRelease.version}`);
      } catch (error) {
        console.error('Update failed:', error);
      }
    }, 1000);

  } catch (error) {
    console.error('Error installing update:', error);
    res.status(500).json({ 
      error: 'Failed to install update',
      message: error.message 
    });
  }
});

// GET /api/updates/status - Get update status
router.get('/status', async (req, res) => {
  try {
    const currentVersion = await getCurrentVersion();
    
    // Check if update is in progress
    const updateLockPath = '/tmp/updesk-update.lock';
    const isUpdating = await fs.access(updateLockPath)
      .then(() => true)
      .catch(() => false);

    res.json({
      currentVersion,
      isUpdating,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting update status:', error);
    res.status(500).json({ 
      error: 'Failed to get update status',
      message: error.message 
    });
  }
});

export default router;