@echo off
echo Starting ALLADIN AI with PM2...
pm2 resurrect
pm2 list
echo ALLADIN AI is now running!
echo Press Ctrl+C to stop monitoring (server will continue running)
pm2 logs