import store, { useAppDispatch, useAppSelector } from '@renderer/store'
import { addMCPServer, deleteMCPServer, setMCPServers, updateMCPServer } from '@renderer/store/mcp'
import { MCPServer } from '@renderer/types'
import { IpcChannel } from '@shared/IpcChannel'
import { useMemo } from 'react'

// Check if running in Electron renderer process
const isElectronRenderer = typeof window !== 'undefined' && typeof window.electron !== 'undefined' && typeof window.electron.ipcRenderer !== 'undefined';

// Use 'any' type for ipcRenderer to bypass strict Electron type checking in web context
let ipcRenderer: any | undefined;

if (isElectronRenderer) {
  // Assign ipcRenderer only if in Electron environment
  ipcRenderer = window.electron.ipcRenderer;

  // Listen for server changes from main process
  ipcRenderer.on(IpcChannel.Mcp_ServersChanged, (_event: any, servers: MCPServer[]) => {
    store.dispatch(setMCPServers(servers));
  });
  ipcRenderer.on(IpcChannel.Mcp_AddServer, (_event: any, server: MCPServer) => {
    store.dispatch(addMCPServer(server));
  });
  ipcRenderer.on(IpcChannel.Mcp_DeleteServer, (_event: any, serverId: string) => {
    store.dispatch(deleteMCPServer(serverId));
  });
  ipcRenderer.on(IpcChannel.Mcp_UpdateServer, (_event: any, server: MCPServer) => {
    store.dispatch(updateMCPServer(server));
  });
  // Add checks for other ipcRenderer.on calls if they exist later in the file
}

export const useMCPServers = () => {
  const mcpServers = useAppSelector((state) => state.mcp.servers);
  const activedMcpServers = useMemo(() => mcpServers.filter((server) => server.isActive), [mcpServers]);
  const dispatch = useAppDispatch();

  // In web environment, these functions might need to call API server instead of IPC
  const addServer = (server: MCPServer) => {
    if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_AddServer, server);
    } else {
      // TODO: Call API server to add server
      console.warn('TODO: Call API server to add server in web environment');
    }
    // Optimistically update the store
    dispatch(addMCPServer(server));
  };

  const updateServer = (server: MCPServer) => {
     if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_UpdateServer, server);
    } else {
      // TODO: Call API server to update server
      console.warn('TODO: Call API server to update server in web environment');
    }
    // Optimistically update the store
    dispatch(updateMCPServer(server));
  };

  const deleteServer = (id: string) => {
    if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_DeleteServer, id);
    } else {
      // TODO: Call API server to delete server
      console.warn('TODO: Call API server to delete server in web environment');
    }
    // Optimistically update the store
    dispatch(deleteMCPServer(id));
  };

  const setServerActive = (server: MCPServer, isActive: boolean) => {
    if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_UpdateServer, { ...server, isActive });
    } else {
      // TODO: Call API server to set server active state
      console.warn('TODO: Call API server to set server active state in web environment');
    }
    // Optimistically update the store
    dispatch(updateMCPServer({ ...server, isActive }));
  };

  const getActiveMCPServers = () => mcpServers.filter((server) => server.isActive);

  const updateMcpServers = (servers: MCPServer[]) => {
    if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_ServersChanged, servers);
     } else {
      // TODO: Call API server to update all servers
      console.warn('TODO: Call API server to update all servers in web environment');
    }
    // Optimistically update the store
    dispatch(setMCPServers(servers));
  };

  return {
    mcpServers,
    activedMcpServers,
    addMCPServer: addServer,
    updateMCPServer: updateServer,
    deleteMCPServer: deleteServer,
    setMCPServerActive: setServerActive,
    getActiveMCPServers: getActiveMCPServers,
    updateMcpServers: updateMcpServers,
  };
};

export const useMCPServer = (id: string) => {
  const server = useAppSelector((state) => (state.mcp.servers || []).find((server) => server.id === id));
  const dispatch = useAppDispatch();

  const updateServer = (server: MCPServer) => {
     if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_UpdateServer, server);
    } else {
      // TODO: Call API server to update server
      console.warn('TODO: Call API server to update server in web environment');
    }
    // Optimistically update the store
    dispatch(updateMCPServer(server));
  };

  const setServerActive = (server: MCPServer, isActive: boolean) => {
    if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_UpdateServer, { ...server, isActive });
    } else {
      // TODO: Call API server to set server active state
      console.warn('TODO: Call API server to set server active state in web environment');
    }
    // Optimistically update the store
    dispatch(updateMCPServer({ ...server, isActive }));
  };

  const deleteServer = (id: string) => {
    if (isElectronRenderer && ipcRenderer) {
      ipcRenderer.invoke(IpcChannel.Mcp_DeleteServer, id);
    } else {
      // TODO: Call API server to delete server
      console.warn('TODO: Call API server to delete server in web environment');
    }
    // Optimistically update the store
    dispatch(deleteMCPServer(id));
  };

  return {
    server,
    updateMCPServer: updateServer,
    setMCPServerActive: setServerActive,
    deleteMCPServer: deleteServer,
  };
};
