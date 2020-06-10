import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import ServerConnection from './ServerConnection'
import ServerStatus from './ServerStatus'
import RTMPSettings from './RTMPSettings'
import RepublishSettings from './RepublishSettings'


function ServerInfo(): React.ReactElement {
    return (
        <div>
            <Navbar expand="lg">
                <Navbar.Brand href="#home">Streamer</Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <ServerConnection />
                </Navbar.Collapse>
                
            </Navbar>
            <div className="App">
                <ServerStatus />
                <RTMPSettings />
                <RepublishSettings />
            </div>
        </div>
    );
}

export default ServerInfo