#!/usr/bin/env node

/**
 * Docker Manager Test Script
 * Tests the Docker API connection and basic functionality
 */

import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function testDockerConnection() {
  console.log('🐳 Testing Docker connection...\n');
  
  try {
    // Test 1: Docker Info
    console.log('📊 Test 1: Getting Docker info...');
    const info = await docker.info();
    console.log('✅ Docker is running');
    console.log(`   - Version: ${info.ServerVersion}`);
    console.log(`   - Containers: ${info.Containers} (${info.ContainersRunning} running)`);
    console.log(`   - Images: ${info.Images}`);
    console.log('');
    
    // Test 2: List Containers
    console.log('📦 Test 2: Listing containers...');
    const containers = await docker.listContainers({ all: true });
    console.log(`✅ Found ${containers.length} containers:`);
    
    for (const container of containers) {
      const name = container.Names[0].replace('/', '');
      const status = container.State === 'running' ? '🟢' : '⚪';
      console.log(`   ${status} ${name} (${container.Image}) - ${container.Status}`);
    }
    console.log('');
    
    // Test 3: Container Details
    if (containers.length > 0) {
      console.log('🔍 Test 3: Getting container details...');
      const firstContainer = containers[0];
      const containerInfo = await docker.getContainer(firstContainer.Id).inspect();
      console.log(`✅ Details for ${firstContainer.Names[0].replace('/', '')}:`);
      console.log(`   - ID: ${firstContainer.Id.substring(0, 12)}`);
      console.log(`   - Created: ${new Date(containerInfo.Created).toLocaleString()}`);
      console.log(`   - Platform: ${containerInfo.Platform}`);
      console.log(`   - Restart Count: ${containerInfo.RestartCount}`);
      console.log('');
    }
    
    // Test 4: Stats (only for running containers)
    const runningContainers = containers.filter(c => c.State === 'running');
    if (runningContainers.length > 0) {
      console.log('📈 Test 4: Getting container stats...');
      const container = docker.getContainer(runningContainers[0].Id);
      const stats = await container.stats({ stream: false });
      
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                       stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - 
                          stats.precpu_stats.system_cpu_usage;
      const cpuPercent = (cpuDelta / systemDelta) * 
                         stats.cpu_stats.online_cpus * 100;
      
      const memoryUsage = stats.memory_stats.usage;
      const memoryLimit = stats.memory_stats.limit;
      const memoryPercent = (memoryUsage / memoryLimit) * 100;
      
      console.log(`✅ Stats for ${runningContainers[0].Names[0].replace('/', '')}:`);
      console.log(`   - CPU: ${cpuPercent.toFixed(2)}%`);
      console.log(`   - Memory: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB / ${(memoryLimit / 1024 / 1024).toFixed(2)} MB (${memoryPercent.toFixed(2)}%)`);
      console.log('');
    }
    
    // Test 5: Logs (only for running containers)
    if (runningContainers.length > 0) {
      console.log('📋 Test 5: Getting container logs...');
      const container = docker.getContainer(runningContainers[0].Id);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 5,
        timestamps: true
      });
      
      const logsString = logs.toString('utf8')
        .split('\n')
        .map(line => line.length > 8 ? line.substring(8) : line)
        .filter(line => line.trim())
        .slice(0, 5)
        .join('\n');
      
      console.log(`✅ Last 5 log lines for ${runningContainers[0].Names[0].replace('/', '')}:`);
      console.log(logsString);
      console.log('');
    }
    
    console.log('✅ All tests passed! Docker Manager is ready to use.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Make sure Docker is running');
    console.error('2. Check if /var/run/docker.sock exists and is accessible');
    console.error('3. Verify permissions: sudo chmod 666 /var/run/docker.sock');
    console.error('4. If running in Docker, mount the socket: -v /var/run/docker.sock:/var/run/docker.sock:ro');
    process.exit(1);
  }
}

testDockerConnection();