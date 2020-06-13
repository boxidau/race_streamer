import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RTMPIncomingStreamStats } from '../api/ServerAPI'
import { List } from 'semantic-ui-react'
import TimeAgo from 'react-timeago'

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

export default IncomingStreamStats