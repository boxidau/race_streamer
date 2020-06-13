import React from 'react'
import APIContext from '../api/APIContext'
import { StreamEndpointStruct } from '../api/ServerAPI'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card, Button, Form, Input } from 'semantic-ui-react'

function ListenerSettings(): React.ReactElement {

    const { api } = React.useContext(APIContext)
    const [streamEndpoint, setStreamEndpoint] = React.useState<null | StreamEndpointStruct>(null)
    const [port, setPort] = React.useState("")
    const [inProgress, setInProgress] = React.useState(false)

    const updatePort = () => {
        const newPort = parseInt(port)
        if (newPort > 65536 || newPort < 1024) {
            window.alert("Select a port between 1024 and 65536")
            return
        }
        if (window.confirm("Changing the listening port will stop any in progress streams. Are you sure?")) {
            setInProgress(true)
            const currentParams = streamEndpoint?.StreamEndpoint
            if (currentParams == null) {
                return
            }

            api?.setListener({
                StreamEndpoint: {
                    ...currentParams,
                    port: parseInt(port)
                }
            })
                .then(setStreamEndpoint)
                .finally(() => setInProgress(false))
        }
    }

    React.useEffect(
        () => {
            api?.getListener().then(r => {
                setStreamEndpoint(r)
                setPort(r.StreamEndpoint.port.toString())
            })
        }, [api]
    )

    return (
        <Card fluid>
            <Card.Content header="RTMP Listener Settings" />
            <Card.Content>
                <FontAwesomeIcon icon="crosshairs" />
                {' '}{streamEndpoint?.StreamEndpoint.proto}://{api?.host}:{streamEndpoint?.StreamEndpoint.port}/{streamEndpoint?.StreamEndpoint.path}
                <div style={{ marginTop: "20px" }}>
                    <Form>
                        <Form.Group>
                            <Form.Field inline>
                                <label>Listening Port</label>
                                <Input type="text" value={port} onChange={ev => { setPort(ev.target.value) }} />
                            </Form.Field>
                            <Button color="yellow" disabled={inProgress} onClick={updatePort}>
                                Update Port
                            </Button>
                        </Form.Group>
                    </Form>
                </div>
            </Card.Content>
        </Card>
    )
}

export default ListenerSettings