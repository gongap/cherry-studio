// This is a mock file for the static web build when using vite.static.config.ts
// It replaces the original Electron-specific IpcChannel enum for the renderer process.

export const IpcChannel = {
  // Add all IpcChannel properties used in the renderer process here.
  // These values don't matter for the web build, only their existence is needed for type checking.
  Mcp_ServersChanged: 'mcp:servers-changed',
  Mcp_AddServer: 'mcp:add-server',
  Mcp_DeleteServer: 'mcp:delete-server',
  Mcp_UpdateServer: 'mcp:update-server',
  // Add other used channels as needed based on future errors or code inspection:
  // ThemeChange: 'theme:change',
  // DirectoryProcessingPercent: 'directory-processing-percent',
  // StoreSync_BroadcastSync: 'store-sync:broadcast-sync',
}; 