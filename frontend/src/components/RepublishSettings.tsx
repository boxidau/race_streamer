import React from 'react'
import APIContext from '../api/APIContext'
import { RTMPPublisherInfoStruct } from '../api/ServerAPI'
import { Card } from 'semantic-ui-react'
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
        <Card fluid>
            <Card.Content header="RTMP Stream Republishing" />
            <Card.Content>
               {streamInfoElements}
            </Card.Content>
        </Card>
    )
}

export default RepublishSettings