import React from 'react'
import Button from 'react-bootstrap/Button'
import APIContext from '../api/APIContext'
import Form from 'react-bootstrap/Form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

    return <div>
        <Form inline>
            <Form.Label style={{paddingRight: "10px"}}>    
                <FontAwesomeIcon icon="circle" color={connected ? "green" : "yellow"} />{' '}
                <div style={{paddingLeft: "10px"}}>{api?.serverURI()}</div>
            </Form.Label>
            <Button variant="danger" size="sm" onClick={disconnect}>
                Disconnect
            </Button>
        </Form>
    </div>;
}

export default ServerConnection