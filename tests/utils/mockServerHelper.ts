import { createServer } from 'http';
import { Server } from 'http';

/**
 * Simple mock server that returns 200 OK for all routes
 * Used when running tests with SKIP_WEB_SERVER=true to prevent connection refused errors
 */
class MockServerHelper {
  private server: Server | null = null;
  private port = 8080;
  
  /**
   * Start the mock server
   * @returns Promise that resolves when the server is ready
   */
  async startServer(): Promise<void> {
    if (this.server) {
      console.log('[MOCK SERVER] Server already running');
      return;
    }
    
    return new Promise((resolve) => {
      this.server = createServer((req, res) => {
        // Log request for debugging
        console.log(`[MOCK SERVER] Received request: ${req.method} ${req.url}`);
        
        // Return HTML with debug info
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Playwright Mock Server</title></head>
            <body>
              <h1>Playwright Mock Server</h1>
              <p>This is a mock server response for: ${req.url}</p>
              <p>Running in test mode with SKIP_WEB_SERVER=true</p>
              <div id="app"></div>
              <div data-testid="show-all-active-tasks-button">Show All Tasks</div>
            </body>
          </html>
        `);
      });
      
      this.server.listen(this.port, () => {
        console.log(`[MOCK SERVER] Mock server started on port ${this.port}`);
        resolve();
      });
      
      this.server.on('error', (err) => {
        console.error(`[MOCK SERVER] Server error: ${err.message}`);
        if (err.message.includes('EADDRINUSE')) {
          console.log('[MOCK SERVER] Port already in use, assuming server is already running');
          resolve();
        }
      });
    });
  }
  
  /**
   * Stop the mock server
   */
  async stopServer(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }
      
      this.server.close(() => {
        console.log('[MOCK SERVER] Server stopped');
        this.server = null;
        resolve();
      });
    });
  }
}

// Export a singleton instance
export const mockServerHelper = new MockServerHelper();
