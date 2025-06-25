import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef } from 'react';
import WebChangeLog from '../../fetch/WebChangeLogFetch';
import WebInvFetch from '../../fetch/WebInvFetch';
import Common from '../../layouts/common';

export default function AutoPriceUpdate() {
  const [logs, setLogs] = React.useState([]);
  const [classCodes, setClassCodes] = React.useState({
    fromClasscode: 1,
    toClasscode: 5,
  });
  const [isRunning, setIsRunning] = React.useState(false);
  const [dryRun, setDryRun] = React.useState(true);
  const seenLogIdsRef = useRef(new Set()); // Use ref instead of state
  const [startTime, setStartTime] = React.useState(null);
  const [stats, setStats] = React.useState({
    processed: 0,
    successful: 0,
    failed: 0,
    startTime: null,
  });

  const terminalRef = useRef(null);
  const intervalRef = useRef(null);

  function ClassCodeMenuItems() {
    const classCodeArray = Array.from(
      { length: 700 },
      (_, i) => i + 1
    );
    return classCodeArray.map((code) => (
      <MenuItem
        key={code}
        value={code}>
        {code}
      </MenuItem>
    ));
  }

  // Add log entry to terminal
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      type, // 'info', 'success', 'error', 'warning'
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

  // Start polling for changes using exact operation start time
  const startPolling = (operationStartTime) => {
    console.log(
      'startPolling called with operationStartTime:',
      operationStartTime,
      'intervalRef.current:',
      intervalRef.current
    );

    if (intervalRef.current) {
      console.log('Polling already running, skipping');
      return; // Already running
    }

    console.log('Starting new polling interval');
    addLog(`🔄 Starting real-time monitoring...`, 'system');
    seenLogIdsRef.current = new Set(); // Reset seen IDs

    intervalRef.current = setInterval(async () => {
      console.log(
        'Polling interval fired, using operationStartTime:',
        operationStartTime
      );

      try {
        // Use the passed operationStartTime instead of state
        const fromDate = operationStartTime.toISOString();
        const toDate = new Date().toISOString(); // Current time

        console.log(
          'Making API call with fromDate:',
          fromDate,
          'toDate:',
          toDate
        );

        const response = await WebChangeLog.getChangeLog({
          destination: 'shopify',
          fieldName: 'price',
          fromDate: fromDate,
          toDate: toDate,
          limit: 100,
          page: 1,
        });

        // Debug logging
        console.log('Polling from:', fromDate, 'to:', toDate);
        console.log('Change log response:', response);

        if (response && response.logs && response.logs.length > 0) {
          console.log(`Found ${response.logs.length} total logs`);

          // Debug: show current seen IDs
          console.log(
            'Current seenLogIds:',
            Array.from(seenLogIdsRef.current)
          );

          // Filter out logs we've already seen using _id
          const newLogs = response.logs.filter((log) => {
            const isNew = !seenLogIdsRef.current.has(log._id);
            if (!isNew) {
              console.log(`Skipping already seen log: ${log._id}`);
            }
            return isNew;
          });

          console.log(`${newLogs.length} new logs to process`);

          if (newLogs.length > 0) {
            console.log(
              'Processing new logs:',
              newLogs.map((l) => l._id)
            );

            // Process new logs
            newLogs.forEach((log) => {
              const userName =
                log.user?.employeeId ||
                log.user?.firstName ||
                'System';
              if (log.changes) {
                log.changes.forEach((change) => {
                  if (change.fieldName === 'price') {
                    const message = change.message?.includes('Failed')
                      ? `❌ ${log.id}: ${change.message}`
                      : `✅ ${log.id}: $${change.oldValue} → $${change.newValue} by ${userName}`;

                    addLog(
                      message,
                      change.message?.includes('Failed')
                        ? 'error'
                        : 'success'
                    );

                    // Update stats
                    setStats((prev) => ({
                      ...prev,
                      processed: prev.processed + 1,
                      [change.message?.includes('Failed')
                        ? 'failed'
                        : 'successful']:
                        prev[
                          change.message?.includes('Failed')
                            ? 'failed'
                            : 'successful'
                        ] + 1,
                    }));
                  }
                });
              }

              // Mark this log as seen immediately (ref update is synchronous)
              seenLogIdsRef.current.add(log._id);
            });

            console.log(
              'Updated seenLogIds to:',
              Array.from(seenLogIdsRef.current)
            );
          }
        } else {
          console.log('No logs found or empty response');
        }
      } catch (error) {
        console.error('Polling error:', error);
        addLog(
          `❌ Error fetching updates: ${error.message}`,
          'error'
        );
      }
    }, 1500); // Check every 3 seconds

    console.log(
      'Interval set, intervalRef.current:',
      intervalRef.current
    );
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      seenLogIdsRef.current = new Set(); // Reset for next run
      addLog(`⏹️ Stopped monitoring`, 'system');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isRunning) {
      // Stop current operation
      setIsRunning(false);
      stopPolling();
      return;
    }

    // Validation
    if (classCodes.fromClasscode > classCodes.toClasscode) {
      addLog(
        '❌ From classcode must be less than or equal to To classcode',
        'error'
      );
      return;
    }

    setIsRunning(true);
    const operationStartTime = new Date();
    setStartTime(operationStartTime); // Set this FIRST
    seenLogIdsRef.current = new Set(); // Reset seen log IDs
    setStats({
      processed: 0,
      successful: 0,
      failed: 0,
      startTime: operationStartTime,
    });

    // Clear previous logs
    setLogs([]);

    addLog(
      `🚀 Starting ${
        dryRun ? 'DRY RUN' : 'LIVE'
      } price update for classcodes ${classCodes.fromClasscode}-${
        classCodes.toClasscode
      }`,
      'system'
    );

    if (dryRun) {
      addLog(
        '⚠️ DRY RUN MODE: No actual changes will be made to Shopify',
        'warning'
      );
    }

    // Start polling BEFORE the API call so we catch logs as they're created
    console.log(
      'About to call startPolling with operationStartTime:',
      operationStartTime
    );
    startPolling(operationStartTime); // Pass the time directly
    console.log('startPolling called');

    try {
      const response = await WebInvFetch.autoUpdatePrices({
        fromClasscode: classCodes.fromClasscode,
        toClasscode: classCodes.toClasscode,
        dryRun: dryRun,
      });

      // Log completion
      if (response.summary) {
        const eligible = response.summary.eligible || 0;
        const attempted =
          response.summary.attempted ||
          response.summary.priceUpdates ||
          0;
        const successful = response.summary.successful || 0;
        const errors =
          response.summary.errors ||
          response.summary.calculationErrors ||
          0;

        addLog(
          `📊 Summary: ${eligible} eligible, ${attempted} attempted, ${successful} successful, ${errors} errors`,
          'info'
        );
        addLog(
          `⏱️ Completed in ${response.summary.duration}`,
          'success'
        );

        if (errors > 0) {
          addLog(
            `⚠️ ${errors} items failed pricing - check logs for details`,
            'warning'
          );
        }

        if (dryRun && response.sampleUpdates) {
          addLog(
            `💡 Sample updates: ${response.sampleUpdates.length} shown (use dryRun: false to execute)`,
            'info'
          );
        }

        if (!dryRun && successful > 0) {
          addLog(
            `🎉 Successfully updated ${successful} product prices in Shopify!`,
            'success'
          );
        }
      } else {
        addLog(`⚠️ No summary data received from server`, 'warning');
        console.log('Full response:', response); // Debug log
      }
    } catch (error) {
      addLog(`❌ Price update failed: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        stopPolling();
      }, 5000); // Keep monitoring for 5 more seconds
    }
  };

  // Download logs as text file
  const downloadLogs = () => {
    if (logs.length === 0) {
      addLog('⚠️ No logs to download', 'warning');
      return;
    }

    // Create formatted log content
    const logContent = logs
      .map((log) => `[${log.timestamp}] ${log.message}`)
      .join('\n');

    // Add header with operation details
    const header = [
      '='.repeat(60),
      'AUTO PRICE UPDATE LOG',
      '='.repeat(60),
      `Operation: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`,
      `Classcodes: ${classCodes.fromClasscode} - ${classCodes.toClasscode}`,
      `Date: ${new Date().toLocaleString()}`,
      `Total Logs: ${logs.length}`,
      '='.repeat(60),
      '',
    ].join('\n');

    const fullContent = header + logContent;

    // Create and download file
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `auto-price-update-${classCodes.fromClasscode}-${classCodes.toClasscode}-${timestamp}.txt`;

    link.href = url;
    link.download = filename;
    link.click();

    // Cleanup
    window.URL.revokeObjectURL(url);

    addLog(
      `📥 Downloaded ${logs.length} logs as ${filename}`,
      'success'
    );
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setClassCodes((prev) => ({
      ...prev,
      [field]: parseInt(value),
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Common>
      {/* Control Panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: '100%',
          mb: 2,
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
        }}>
        <TextField
          name='fromClasscode'
          label='From Classcode'
          size='small'
          variant='outlined'
          select
          value={classCodes.fromClasscode}
          onChange={(e) =>
            handleInputChange('fromClasscode', e.target.value)
          }
          sx={{ width: '180px' }}
          disabled={isRunning}>
          {ClassCodeMenuItems()}
        </TextField>

        <TextField
          name='toClasscode'
          label='To Classcode'
          size='small'
          variant='outlined'
          select
          value={classCodes.toClasscode}
          onChange={(e) =>
            handleInputChange('toClasscode', e.target.value)
          }
          sx={{ width: '180px' }}
          disabled={isRunning}>
          {ClassCodeMenuItems()}
        </TextField>

        <FormControlLabel
          control={
            <Switch
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={isRunning}
              color='warning'
            />
          }
          label='Dry Run'
          sx={{ mx: 2 }}
        />

        <Button
          size='medium'
          variant={isRunning ? 'contained' : 'outlined'}
          color={isRunning ? 'error' : 'primary'}
          onClick={handleSubmit}
          sx={{ width: '150px', height: '40px' }}>
          {isRunning ? 'Stop' : 'Start Update'}
        </Button>

        <Button
          size='medium'
          variant='outlined'
          color='secondary'
          onClick={downloadLogs}
          disabled={logs.length === 0}
          sx={{ width: '200px', height: '40px' }}>
          Download Logs
        </Button>
      </Box>

      {/* Stats Panel */}
      {stats.startTime && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            p: 1,
            mb: 2,
            backgroundColor: '#e3f2fd',
            borderRadius: 1,
          }}>
          <Typography variant='body2'>
            Processed: {stats.processed}
          </Typography>
          <Typography
            variant='body2'
            color='success.main'>
            Successful: {stats.successful}
          </Typography>
          <Typography
            variant='body2'
            color='error.main'>
            Failed: {stats.failed}
          </Typography>
          <Typography variant='body2'>
            Runtime:{' '}
            {stats.startTime
              ? Math.floor((Date.now() - stats.startTime) / 1000)
              : 0}
            s
          </Typography>
        </Box>
      )}

      {/* Terminal */}
      <Box
        ref={terminalRef}
        sx={{
          margin: '0 auto',
          width: '95%',
          height: '70vh',
          overflowY: 'auto',
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
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
            }}>
            Terminal ready. Configure classcodes and click "Start
            Update" to begin...
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
    </Common>
  );
}
