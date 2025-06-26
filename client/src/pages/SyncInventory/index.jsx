import {
  Box,
  Button,
  LinearProgress,
  Typography,
} from '@mui/material';
import React, { useRef } from 'react';
import WebInvFetch from '../../fetch/WebInvFetch';
import Common from '../../layouts/common';

export default function SyncInventory() {
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [response, setResponse] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const terminalRef = useRef(null);

  // Add log entry to terminal
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      type, // 'info', 'success', 'error', 'warning', 'system'
    };

    setLogs((prev) => [...prev, logEntry]);

    // Auto-scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop =
          terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  // Get terminal colors based on log type
  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'system':
        return '#2196f3';
      default:
        return '#ffffff';
    }
  };

  // Download logs as text file
  const downloadLogs = () => {
    if (logs.length === 0) {
      addLog('⚠️ No logs to download', 'warning');
      return;
    }

    const logContent = logs
      .map((log) => `[${log.timestamp}] ${log.message}`)
      .join('\n');

    const header = [
      '='.repeat(60),
      'INVENTORY SYNC LOG',
      '='.repeat(60),
      `Date: ${new Date().toLocaleString()}`,
      `Total Logs: ${logs.length}`,
      '='.repeat(60),
      '',
    ].join('\n');

    const fullContent = header + logContent;
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `inventory-sync-${timestamp}.txt`;

    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    addLog(`📥 Downloaded logs as ${filename}`, 'success');
  };

  const handleSync = async () => {
    setLoading(true);
    setResponse(null);
    setLogs([]);
    setProgress(0);

    addLog('🚀 Starting inventory sync...', 'system');
    addLog('📡 Connecting to Shopify GraphQL API...', 'info');

    try {
      // Simulate progress updates (you could make this real-time with WebSockets or polling)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const startTime = Date.now();
      const response = await WebInvFetch.webInvSync();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      clearInterval(progressInterval);
      setProgress(100);
      setResponse(response);

      // Log the results
      if (response.totalSynced) {
        addLog(`✅ Sync completed successfully!`, 'success');
        addLog(
          `📊 ${response.totalSynced} products synced in ${
            response.duration || duration + 's'
          }`,
          'info'
        );

        if (response.requestCount) {
          addLog(
            `🔄 Made ${response.requestCount} API requests`,
            'info'
          );
        }

        if (response.verification) {
          addLog(
            `📈 AutoUpdate: ${
              response.verification.autoUpdateStats?.length || 0
            } different values`,
            'info'
          );
          addLog(
            `💎 Gold Karat: ${
              response.verification.goldKaratStats?.length || 0
            } different types`,
            'info'
          );
        }
      } else {
        addLog(
          `⚠️ Sync completed with unexpected response format`,
          'warning'
        );
      }
    } catch (error) {
      addLog(`❌ Sync failed: ${error.message}`, 'error');
      console.error('Error during sync:', error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <Common>
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Typography
          variant='h4'
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}>
          🔄 Inventory Sync
        </Typography>

        {/* Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 3,
            p: 2,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
          }}>
          <Button
            size='small'
            variant={loading ? 'contained' : 'outlined'}
            color={loading ? 'warning' : 'primary'}
            onClick={handleSync}
            disabled={loading}
            sx={{ width: '200px' }}>
            {loading ? 'Syncing...' : 'Start Sync'}
          </Button>

          <Button
            size='small'
            variant='outlined'
            color='secondary'
            onClick={downloadLogs}
            disabled={logs.length === 0}
            sx={{ width: '200px' }}>
            Download Logs
          </Button>
        </Box>

        {/* Progress Bar */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              gutterBottom>
              Sync Progress: {Math.round(progress)}%
            </Typography>
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
        {/* Terminal & Response Wrapper */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
          }}>
          {/* Terminal */}
          <Box
            ref={terminalRef}
            sx={{
              width: '50%',
              height: '60vh',
              overflowY: 'auto',
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              fontFamily:
                'Consolas, Monaco, "Courier New", monospace',
              fontSize: '14px',
              padding: 2,
              borderRadius: 2,
              border: '2px solid #333',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#2e2e2e',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#555',
                borderRadius: '4px',
              },
            }}>
            {logs.length === 0 ? (
              <Typography
                sx={{
                  color: '#888',
                  fontStyle: 'italic',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}>
                Terminal ready. Click "Start Sync" to begin inventory
                synchronization...
              </Typography>
            ) : (
              logs.map((log) => (
                <Typography
                  key={log.id}
                  sx={{
                    color: getLogColor(log.type),
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    mb: 0.5,
                    wordBreak: 'break-word',
                    textAlign: 'left',
                  }}>
                  [{log.timestamp}] {log.message}
                </Typography>
              ))
            )}
          </Box>

          {/* Response Details (Collapsible) */}
          <Box
            sx={{
              width: '50%',
              height: '60vh',
              overflowY: 'auto',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
            }}>
            <pre
              style={{
                margin: 0,
                fontSize: '12px',
                fontFamily:
                  'Consolas, Monaco, "Courier New", monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textAlign: 'left',
              }}>
              {response == null
                ? "Terminal ready. Click 'Start Sync' to begin inventory synchronization..."
                : JSON.stringify(response, null, 2)}
            </pre>
          </Box>
        </Box>
      </Box>
    </Common>
  );
}
