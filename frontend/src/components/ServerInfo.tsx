import React from 'react'
import { Menu, Icon } from 'semantic-ui-react'
import ServerConnection from './ServerConnection'
import ServerStatus from './ServerStatus'
import RTMPSettings from './RTMPSettings'
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
                <RTMPSettings />
                <RepublishSettings />
            </div>
        </div>
    );
}

export default ServerInfo