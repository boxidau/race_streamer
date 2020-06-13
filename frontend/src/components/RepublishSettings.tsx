import React from 'react'
import APIContext from '../api/APIContext'
import { RTMPPublisherInfoStruct, RTMPStreamStruct } from '../api/ServerAPI'
import { Card, Loader } from 'semantic-ui-react'
import StreamInfo from './StreamInfo'
import AddRepublishDestination from './AddRepublishDestination'


function RepublishSettings(): React.ReactElement {

    const {api} = React.useContext(APIContext)
    const [publishInfo, setPublishInfo] = React.useState<null | RTMPPublisherInfoStruct>(null)
    const [inProgress, setInProgress] = React.useState(false)

    const fetchStatus = () => api?.getRepublishInfo().then(setPublishInfo)

    React.useEffect(
        () => {
            fetchStatus()
            const timer = window.setInterval(fetchStatus, 5000)
            return () => {clearInterval(timer)}
            
        }, [api]
    )

    const streamInfoElements = []
    const currentStreamKeys = []
    for (const streamKey in publishInfo) {
        currentStreamKeys.push(streamKey)
        streamInfoElements.push(
            <div key={streamKey} style={{paddingBottom: "10px"}}>
                <StreamInfo streamKey={streamKey} streamInfo={publishInfo[streamKey]} triggerFetch={() => {fetchStatus()}} />
            </div>
        )
    }

    const addRepublishDestination = (stream: RTMPStreamStruct): void => {
        const streamKey = stream.src_stream
        setInProgress(true)
        api?.createRepublishStream(streamKey, stream).then(fetchStatus).finally(() => setInProgress(false))
    }

    return (
        <Card fluid>
            
            <Card.Content header="RTMP Stream Republishing" />
            
            <Card.Content>
                <AddRepublishDestination invalidStreamKeys={currentStreamKeys} onCreate={addRepublishDestination} />
                <Loader active={inProgress} />
            </Card.Content>
            <Card.Content>
               {streamInfoElements}
            </Card.Content>
        </Card>
    )
}

export default RepublishSettings