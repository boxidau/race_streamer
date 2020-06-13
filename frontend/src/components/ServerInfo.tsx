import React from 'react'
import { Menu, Icon } from 'semantic-ui-react'
import ServerConnection from './ServerConnection'
import ServerStatus from './ServerStatus'
import ListenerSettings from './ListenerSettings'
import RepublishSettings from './RepublishSettings'


function ServerInfo(): React.ReactElement {
    return (
        <div>
            <Menu>
                <Menu.Item>
                    <Icon name='video camera' />
                    <Menu.Header>Race Streamer</Menu.Header>
                </Menu.Item>
                <ServerConnection />

            </Menu>
            <div className="App">
                <ServerStatus />
                <ListenerSettings />
                <RepublishSettings />
            </div>
        </div>
    );
}

export default ServerInfo