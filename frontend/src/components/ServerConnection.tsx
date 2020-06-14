import React from 'react'
import { Button, Menu, Icon } from 'semantic-ui-react'
import APIContext from '../api/APIContext'

function ServerConnection(): React.ReactElement {
    const {api, disconnect} = React.useContext(APIContext)
    const [connected, setConnected] = React.useState<boolean>(true)

    React.useEffect(
        () => {
            const timer = window.setInterval(() => {
                api?.connectionCheck()
                    .then((r) => {setConnected(r)})
                    .catch(() => {setConnected(false)})
            }, 1000)
            return () => {clearInterval(timer)}
        },
        [api]
    )

    return (
        <Menu.Menu position='right'>  
            <Menu.Item>
                <Icon name="circle" color={connected ? "green" : "yellow"} />
                {api?.serverURI()}
            </Menu.Item>
            <Menu.Item>
                <Button color="red" size="tiny" onClick={disconnect} content="Disconnect" />
            </Menu.Item>
        </Menu.Menu>
    )
}

export default ServerConnection