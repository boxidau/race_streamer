import React from 'react'
import Card from 'react-bootstrap/Card'
import APIContext from '../api/APIContext'
import ListGroup from 'react-bootstrap/ListGroup'
import { ServerStatusStruct } from '../api/ServerAPI'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function ServerStatus(): React.ReactElement {

    const {api} = React.useContext(APIContext)
    const [serverStatusData, setServerStatusData] = React.useState<null | ServerStatusStruct>(null)
    
    React.useEffect(
        () => {
            const fetchStatus = () => api?.getStatus().then(setServerStatusData)
            fetchStatus()
            const timer = window.setInterval(fetchStatus, 5000)
            return () => {clearInterval(timer)}
        },
        [api]
    )


    return (
        <Card>
            <Card.Header>Server Status</Card.Header>
            <Card.Body>
            <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Row>
                            <Col md={1}>
                                <FontAwesomeIcon icon="microchip" /> CPU Load:
                            </Col>
                            <Col md={11}>
                                <div style={{display: "inline-block", width: "100%"}}>
                                    <ProgressBar variant="success" now={(serverStatusData?.SysInfo.scl || 0) * 100} />
                                </div>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <FontAwesomeIcon icon="plug" /> Connections: {serverStatusData?.Connections}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <FontAwesomeIcon icon="tachometer-alt" /> Network Egress: {serverStatusData?.OutRate} kbps
                    </ListGroup.Item>

                </ListGroup>
            </Card.Body>
        </Card>
    )
}

export default ServerStatus