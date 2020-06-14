import React from 'react';
import './App.css';
import Setup from './components/Setup'
import ServerInfo from './components/ServerInfo'
import type { ServerConfig } from './api/ServerAPI'
import ServerAPI from './api/ServerAPI'
import APIContext from './api/APIContext';

function App() {

  const loadSavedServerConfig = (): ServerConfig | null => {
    try {
      const savedConfigRaw = window.localStorage.getItem('serverInformation')
      if (savedConfigRaw == null) return null
      const savedConfig = JSON.parse(savedConfigRaw)
      if (typeof (savedConfig) !== "object") return null
      if (
        typeof (savedConfig.host) !== "string"
        || typeof (savedConfig.port) !== "number"
        || (savedConfig.proto !== "http" && savedConfig.proto !== "https")
        || typeof (savedConfig.authKey) !== "string"
      ) {
        return null
      }
      return savedConfig as ServerConfig
    } catch {
      return null
    }
   
  }

  const [serverConfig, setServerConfig] = React.useState<ServerConfig | null>(loadSavedServerConfig());

  const disconnect = () => {
    window.localStorage.removeItem('serverInformation')
    setServerConfig(null)
  }

  let display = null;
  let api = null;

  if (serverConfig === null) {
    display = (
      <div style={{ padding: "20px" }}>
        <Setup onSetServer={setServerConfig} />
      </div>
    )
  } else {
    api = new ServerAPI(serverConfig)
    display = (
      <APIContext.Provider value={{ api, disconnect }}>
        <ServerInfo />
      </APIContext.Provider>
    )
  }

  return (
    <div className="Container">
      {display}
    </div>
  );
}

export default App;