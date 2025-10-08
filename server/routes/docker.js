import express from 'express';
import Docker from 'dockerode';
import axios from 'axios';

const router = express.Router();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Helper function to check for image updates
async function checkImageUpdate(container) {
  try {
    const image = container.Image;
    const imageName = image.split(':')[0];
    const currentTag = image.split(':')[1] || 'latest';
    
    // Get local image info
    const localImage = await docker.getImage(image).inspect();
    const localDigest = localImage.RepoDigests?.[0]?.split('@')[1];
    
    // Try to get remote image info from Docker Hub
    try {
      // Parse image name (handle library images)
      let [registry, repository] = imageName.includes('/') 
        ? imageName.split('/')
        : ['library', imageName];
      
      // For official images
      if (!imageName.includes('/')) {
        repository = imageName;
        registry = 'library';
      }
      
      // Get token for Docker Hub API
      const tokenResponse = await axios.get(
        `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${registry}/${repository}:pull`,
        { timeout: 5000 }
      );
      const token = tokenResponse.data.token;
      
      // Get manifest from Docker Hub
      const manifestResponse = await axios.get(
        `https://registry-1.docker.io/v2/${registry}/${repository}/manifests/${currentTag}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.docker.distribution.manifest.v2+json'
          },
          timeout: 5000
        }
      );
      
      const remoteDigest = manifestResponse.headers['docker-content-digest'];
      
      // Compare digests
      const updateAvailable = localDigest && remoteDigest && localDigest !== remoteDigest;
      
      return {
        updateAvailable,
        currentDigest: localDigest,
        latestDigest: remoteDigest
      };
    } catch (error) {
      // If we can't check Docker Hub, assume no update
      console.log(`Could not check updates for ${imageName}:`, error.message);
      return {
        updateAvailable: false,
        error: 'Could not check for updates'
      };
    }
  } catch (error) {
    console.error('Error checking image update:', error);
    return {
      updateAvailable: false,
      error: error.message
    };
  }
}

// Get all containers
router.get('/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    
    // Enrich container data
    const enrichedContainers = await Promise.all(
      containers.map(async (container) => {
        const containerInfo = await docker.getContainer(container.Id).inspect();
        
        // Check for updates
        const updateInfo = await checkImageUpdate(container);
        
        return {
          id: container.Id,
          name: container.Names[0].replace('/', ''),
          image: container.Image,
          imageId: container.ImageID,
          state: container.State,
          status: container.Status,
          created: container.Created,
          ports: container.Ports,
          labels: container.Labels,
          updateAvailable: updateInfo.updateAvailable,
          updateInfo: updateInfo,
          // Additional info from inspect
          config: {
            env: containerInfo.Config.Env,
            cmd: containerInfo.Config.Cmd,
            volumes: containerInfo.Config.Volumes
          },
          networkSettings: {
            networks: containerInfo.NetworkSettings.Networks,
            ipAddress: containerInfo.NetworkSettings.IPAddress
          },
          mounts: containerInfo.Mounts,
          restartCount: containerInfo.RestartCount,
          platform: containerInfo.Platform
        };
      })
    );
    
    res.json(enrichedContainers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch containers',
      message: error.message 
    });
  }
});

// Get container logs
router.get('/containers/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { tail = 100 } = req.query;
    
    const container = docker.getContainer(id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: parseInt(tail),
      timestamps: true
    });
    
    // Convert buffer to string and clean up
    const logsString = logs.toString('utf8')
      .split('\n')
      .map(line => {
        // Remove Docker log prefixes (8 bytes)
        return line.length > 8 ? line.substring(8) : line;
      })
      .filter(line => line.trim())
      .join('\n');
    
    res.json({ logs: logsString });
  } catch (error) {
    console.error('Error fetching container logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch logs',
      message: error.message 
    });
  }
});

// Get container stats
router.get('/containers/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    
    // Get stats (one-time, not streaming)
    const stats = await container.stats({ stream: false });
    
    // Calculate CPU percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                     stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - 
                        stats.precpu_stats.system_cpu_usage;
    const cpuPercent = (cpuDelta / systemDelta) * 
                       stats.cpu_stats.online_cpus * 100;
    
    // Calculate memory usage
    const memoryUsage = stats.memory_stats.usage;
    const memoryLimit = stats.memory_stats.limit;
    const memoryPercent = (memoryUsage / memoryLimit) * 100;
    
    res.json({
      cpu: {
        percent: cpuPercent.toFixed(2),
        usage: cpuDelta,
        system: systemDelta
      },
      memory: {
        usage: memoryUsage,
        limit: memoryLimit,
        percent: memoryPercent.toFixed(2),
        usageMB: (memoryUsage / 1024 / 1024).toFixed(2),
        limitMB: (memoryLimit / 1024 / 1024).toFixed(2)
      },
      network: stats.networks,
      blockIO: stats.blkio_stats
    });
  } catch (error) {
    console.error('Error fetching container stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error.message 
    });
  }
});

// Start container
router.post('/containers/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.start();
    res.json({ success: true, message: 'Container started' });
  } catch (error) {
    console.error('Error starting container:', error);
    res.status(500).json({ 
      error: 'Failed to start container',
      message: error.message 
    });
  }
});

// Stop container
router.post('/containers/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.stop();
    res.json({ success: true, message: 'Container stopped' });
  } catch (error) {
    console.error('Error stopping container:', error);
    res.status(500).json({ 
      error: 'Failed to stop container',
      message: error.message 
    });
  }
});

// Restart container
router.post('/containers/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.restart();
    res.json({ success: true, message: 'Container restarted' });
  } catch (error) {
    console.error('Error restarting container:', error);
    res.status(500).json({ 
      error: 'Failed to restart container',
      message: error.message 
    });
  }
});

// Get Docker info
router.get('/info', async (req, res) => {
  try {
    const info = await docker.info();
    res.json(info);
  } catch (error) {
    console.error('Error fetching Docker info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Docker info',
      message: error.message 
    });
  }
});

export default router;