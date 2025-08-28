const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function killProcessOnPort(port = 3000) {
  console.log(`🔍 Checking for processes on port ${port}...`);
  
  try {
    // For Windows
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && !isNaN(pid)) {
          console.log(`⚠️  Killing process ${pid} on port ${port}...`);
          try {
            await execAsync(`taskkill /PID ${pid} /F`);
            console.log(`✅ Process ${pid} terminated successfully`);
          } catch (killError) {
            console.log(`❌ Failed to kill process ${pid}:`, killError.message);
          }
        }
      }
    } else {
      // For Unix-like systems (macOS, Linux)
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        console.log(`⚠️  Killing process ${pid} on port ${port}...`);
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`✅ Process ${pid} terminated successfully`);
        } catch (killError) {
          console.log(`❌ Failed to kill process ${pid}:`, killError.message);
        }
      }
    }
    
    console.log(`✅ Port ${port} is now available`);
    
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    if (error.message.includes('No matching processes') || error.code === 1) {
      console.log(`✅ Port ${port} is already available`);
    } else {
      console.log(`ℹ️  No processes found on port ${port} or unable to check`);
    }
  }
}

// Run the function
killProcessOnPort(3000).then(() => {
  console.log('🚀 Ready to start development server on port 3000!');
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
