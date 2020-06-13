import React from 'react'

import APIContext from '../api/APIContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RTMPStreamInfoStruct, RTMPStreamStruct } from '../api/ServerAPI'
import { Loader, Card, Item, Button, Dimmer } from 'semantic-ui-react'
import IncomingStreamStats from './IncomingStreamStats'
import RepublishStreamInfo from './RepublishStreamInfo'
import AddRepublishDestination from './AddRepublishDestination'

type Props = {
    streamKey: string,
    streamInfo: RTMPStreamInfoStruct,
    triggerFetch: () => void
}

function StreamInfo(props: Props): React.ReactElement {

    const { api } = React.useContext(APIContext)
    const [isDeleted, setIsDeleted] = React.useState(false)
    const [isUpdating, setIsUpdating] = React.useState(false)

    const deleteStream = () => {
        if (window.confirm("This will stop any in progress streams! You will need to re-enter all details to resume streaming. Are you sure?")) {
            setIsDeleted(true)

            api?.deleteStream(props.streamKey)
        }
    }

    const addRepublishDestination = (stream: RTMPStreamStruct): void => {
        setIsUpdating(true)
        api?.createRepublishStream(props.streamKey, stream)
            .then(() => props.triggerFetch())
            .finally(() => setIsUpdating(false))
    }

    const outgoingStreams = []
    for (const republishStreamId in props.streamInfo.republish_streams) {
        outgoingStreams.push(
            <RepublishStreamInfo
                key={republishStreamId}
                streamKey={props.streamKey}
                stream={props.streamInfo.republish_streams[republishStreamId]}
            />
        )
    }

    return (
        <Card fluid>
            <Dimmer active={isDeleted}>
                <Loader active={isDeleted} content="Deleting" />
            </Dimmer>
            <Loader active={isUpdating} content="Adding Destination" />
            <Card.Content>
                <Card.Header>
                    <FontAwesomeIcon icon="key" style={{ marginRight: "10px" }} />
                    {props.streamKey}
                    <div style={{ display: "inline-block", float: "right" }}>
                        <Button basic size="tiny" onClick={deleteStream} color="red" icon="delete" content="Delete Stream" />
                    </div>
                </Card.Header>
                <h4>Incoming Stream</h4>
                <IncomingStreamStats stats={props.streamInfo.incoming_stream_stats} />

                <h4>Outgoing Streams</h4>
                <Item.Group divided>
                    {outgoingStreams}
                </Item.Group>
            </Card.Content>
            <Card.Content extra textAlign="right">
                <AddRepublishDestination existingStreamKey={props.streamKey} onCreate={addRepublishDestination} />
            </Card.Content>
        </Card>
    )
}

export default StreamInfo