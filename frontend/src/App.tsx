import React from 'react';
import './App.css';
import Setup from './components/Setup'
import ServerInfo from './components/ServerInfo'
import type { ServerConfig, ServerProto} from './api/ServerAPI'
import ServerAPI from './api/ServerAPI'
import APIContext from './api/APIContext';

function App() {

  const defaultServer = null
  const [serverConfig, setServerConfig] = React.useState<ServerConfig | null>(defaultServer);

  const disconnect = () => {
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
      <APIContext.Provider value={{api, disconnect}}>
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