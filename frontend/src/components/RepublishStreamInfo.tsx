import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RTMPRepublishStream } from '../api/ServerAPI'
import { Icon, List, Item } from 'semantic-ui-react'
import APIContext from '../api/APIContext'

type RepublishStreamInfo = { streamKey: string, stream: RTMPRepublishStream }

function RepublishStreamInfo(props: RepublishStreamInfo): React.ReactElement {
    
    const { api } = React.useContext(APIContext)
    
    let connected = false
    let connectionStatus = (
        <List.Item>
            <List.Icon name='circle' color="red" />
            <List.Content>Disconnected</List.Content>
        </List.Item>
    )

    if (props.stream.stats?.state === 'connected') {
        connected = true
        connectionStatus = (
            <List.Item>
                <List.Icon name='circle' color="green" />
                <List.Content>Connected</List.Content>
            </List.Item>
        )
    }

    let destService = "Other"
    let icon = <FontAwesomeIcon icon="question-circle" size="8x" />
    if (props.stream.rule.dest_addr.includes("youtube")) {
        destService = "YouTube"
        const color = connected ? "red" : "grey"
        icon = <FontAwesomeIcon icon={["fab", "youtube"]} color={color} size="8x" />
    }
    if (props.stream.rule.dest_addr.includes("facebook")) {
        destService = "Facebook"
        const color = connected ? "#2d88ff" : "grey"
        icon = <FontAwesomeIcon icon={["fab", "facebook"]} color={color} size="8x" />
    }

    const rule = props.stream.rule
    const stats = props.stream.stats
    const proto = rule.ssl ? 'rtmps' : 'rtmp'
    const endpoint = `${proto}://${rule.dest_addr}:${rule.dest_port}/${rule.dest_app}`

    const deleteRepublishStream = () => {
        if (window.confirm("this will stop the stream and delete the configuration for this republish destination. Are you sure?")) {
            api?.deleteRepublishStream(props.streamKey, rule.id).then(console.log)
        }
    }

    return (
        <Item>
            <div className="image ui tiny">
                {icon}
            </div>
            <Item.Content>
                <Item.Header as='a'>{destService} <Icon name="delete" color="red" onClick={deleteRepublishStream} /></Item.Header>
                <Item.Description>
                    <List>
                        {connectionStatus}
                        <List.Item>
                            <List.Icon name='sign-in' />
                            <List.Content>
                                <List.Header>Stream URI</List.Header>
                                <List.Description>{endpoint}</List.Description>
                            </List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Icon name='key' />
                            <List.Content>
                                <List.Header>Stream Key</List.Header>
                                <List.Description>{rule.dest_stream}</List.Description>
                            </List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Icon name='random' />
                            <List.Content>
                                <List.Header>Bytes In/Out</List.Header>
                                <List.Description>
                                    {((stats?.bytes_recv || 0) / 1024 / 1024).toFixed(1)}
                                    {'/'}
                                    {((stats?.bytes_sent || 0) / 1024 / 1024).toFixed(1)}MB
                                </List.Description>
                            </List.Content>
                        </List.Item>
                    </List>
                </Item.Description>
            </Item.Content>
        </Item>
    )
}

export default RepublishStreamInfo