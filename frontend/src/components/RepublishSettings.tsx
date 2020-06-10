import React from 'react'
import Card from 'react-bootstrap/Card'
import APIContext from '../api/APIContext'
import { RTMPPublisherInfoStruct } from '../api/ServerAPI'
import { List } from 'immutable'
import StreamInfo from './StreamInfo'


function RepublishSettings(): React.ReactElement {

    const {api} = React.useContext(APIContext)
    const [publishInfo, setPublishInfo] = React.useState<null | RTMPPublisherInfoStruct>(null)
    const [inProgress, setInProgress] = React.useState(false)

    React.useEffect(
        () => {
            const fetchStatus = () => api?.getRepublishInfo().then(setPublishInfo)
            fetchStatus()
            const timer = window.setInterval(fetchStatus, 5000)
            return () => {clearInterval(timer)}
            
        }, [api]
    )

    const streamInfoElements = []
    for (const streamKey in publishInfo) {
        streamInfoElements.push(
            <div key={streamKey} style={{paddingBottom: "10px"}}>
                <StreamInfo streamKey={streamKey} streamInfo={publishInfo[streamKey]} />
            </div>
        )
    }

    return (
        <Card>
            <Card.Header>RTMP Stream Republishing</Card.Header>
            <Card.Body>
               {streamInfoElements}
            </Card.Body>
        </Card>
    )
}

export default RepublishSettings