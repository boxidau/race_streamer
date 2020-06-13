import React from 'react'
import { Card, List, Progress } from 'semantic-ui-react'

import APIContext from '../api/APIContext'
import { ServerStatusStruct } from '../api/ServerAPI'

function ServerStatus(): React.ReactElement {

    const { api } = React.useContext(APIContext)
    const [serverStatusData, setServerStatusData] = React.useState<null | ServerStatusStruct>(null)

    React.useEffect(
        () => {
            const fetchStatus = () => api?.getStatus().then(setServerStatusData)
            fetchStatus()
            const timer = window.setInterval(fetchStatus, 5000)
            return () => { clearInterval(timer) }
        },
        [api]
    )


    return (
        <Card fluid>
            <Card.Content header="Server Status" />
            <Card.Content>
                <List divided relaxed='very'>
                    <List.Item>
                        <List.Icon name='microchip' size="large" verticalAlign='middle' />
                        <List.Content>
                            <List.Header>CPU Load</List.Header>
                            <Progress percent={(serverStatusData?.SysInfo.scl || 0) * 100} success />
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='plug' size="large" verticalAlign='middle' />
                        <List.Content>
                            <List.Header>Connections</List.Header>
                            {serverStatusData?.Connections}
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='tachometer alternate' size="large" verticalAlign='middle' />
                        <List.Content>
                            <List.Header>Network Egress</List.Header>
                            {serverStatusData?.OutRate} kbps
                        </List.Content>
                    </List.Item>


                </List>
            </Card.Content>
        </Card>
    )
}

export default ServerStatus