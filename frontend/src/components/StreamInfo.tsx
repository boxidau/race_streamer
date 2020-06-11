import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RTMPStreamInfoStruct, RTMPIncomingStreamStats, RTMPRepublishStream } from '../api/ServerAPI'
import { Card, List, Item } from 'semantic-ui-react'
import TimeAgo from 'react-timeago'

type Props = {
    streamKey: string,
    streamInfo: RTMPStreamInfoStruct
}

function IncomingStreamStats(props: { stats: null | RTMPIncomingStreamStats }): React.ReactElement {
    return (
        <List horizontal style={{ justifyContent: "space-around", display: "flex", flexWrap: "wrap" }}>
            <List.Item>
                <div className="image">
                    <FontAwesomeIcon
                        icon="circle"
                        color={props.stats != null ? "green" : "red"}
                        size="2x"
                    />
                </div>
                <List.Content>
                    <List.Header>Status</List.Header>
                    {props.stats != null ? "Connected" : "Not Connected"}
                </List.Content>
            </List.Item>
            <List.Item>
                <div className="image">
                    <List.Icon name='wifi' size='large' verticalAlign='middle' />
                </div>
                <List.Content>
                    <List.Header>Stream Bitrate</List.Header>
                    {((props.stats?.bandwidth ?? 0) / 1024 / 1024).toFixed(2)} mbps
                </List.Content>
            </List.Item>
            <List.Item>
                <div className="image">
                    <List.Icon name='tv' size='large' verticalAlign='middle' />
                </div>
                <List.Content>
                    <List.Header>Resolution</List.Header>
                    {props.stats?.resolution ?? "N/A"}
                </List.Content>
            </List.Item>
            <List.Item>
                <div className="image">
                    <List.Icon name='time' size='large' verticalAlign='middle' />
                </div>
                <List.Content>
                    <List.Header>Elapsed Time</List.Header>
                    {props.stats ?
                        <TimeAgo
                            formatter={(v, u) => `${v} ${u}s`}
                            date={new Date(props.stats.publish_time * 1000)}
                        /> : "N/A"}
                </List.Content>
            </List.Item>
        </List>
    )
}

type RepublishStreamInfo = { streamId: string, stream: RTMPRepublishStream }

function RepublishStreamInfo(props: RepublishStreamInfo): React.ReactElement {
    console.log(props)

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

    return (
        <Item>
            <div className="image ui tiny">
                {icon}
            </div>
            <Item.Content>
                <Item.Header as='a'>{destService}</Item.Header>
                <Item.Description>
                    <List>
                        {connectionStatus}
                        <List.Item>
                            <List.Icon name='sign-in' />
                            <List.Content>
                                <List.Header>Endpoint</List.Header>
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

function StreamInfo(props: Props): React.ReactElement {
    const outgoingStreams = []
    for (const streamId in props.streamInfo.republish_streams) {
        outgoingStreams.push(
            <RepublishStreamInfo
                key={streamId}
                streamId={streamId}
                stream={props.streamInfo.republish_streams[streamId]}
            />
        )
    }

    return (
        <Card>
            <Card.Header>
                <FontAwesomeIcon icon="key" style={{ marginRight: "10px" }} />
                {props.streamKey}
            </Card.Header>
            <Card.Content>
                <h4>Incoming Stream</h4>
                <IncomingStreamStats stats={props.streamInfo.incoming_stream_stats} />

                <h4>Outgoing Streams</h4>
                <Item.Group>
                    {outgoingStreams}
                </Item.Group>
            </Card.Content>
        </Card>
    )
}

export default StreamInfo