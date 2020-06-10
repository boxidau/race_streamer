import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import type { ServerProto, ServerConfig } from '../api/ServerAPI'
import ServerAPI from '../api/ServerAPI'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'


type Props = {
    onSetServer: (config: ServerConfig) => void
}

type ConnectionCheckStatus = "IN_PROGRESS" | "FAILED" | null

function Setup(props: Props): React.ReactElement {

    const [host, setHost] = React.useState<string>("localhost")
    const [port, setPort] = React.useState<number>(5000)
    const [proto, setProto] = React.useState<ServerProto>("http")
    const [status, setStatus] = React.useState<ConnectionCheckStatus>(null)
    const [errorMessage, setErrorMessage] = React.useState<null | string>(null)

    const checkConnection = () => {
        setStatus("IN_PROGRESS")
        const config = { host, port, proto }
        const api = new ServerAPI(config)
        api.connectionCheck()
            .then(r => {
                if (r) {
                    props.onSetServer(config)
                    return
                }
                setStatus("FAILED")

            })
            .catch(ex => {
                setErrorMessage(ex)
                setStatus("FAILED")
            })
    }

    const buttonDisabled = status === "IN_PROGRESS";
    let buttonContent = (
        <div>
            <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
            /> Connecting...
        </div>
    )
    if (status !== "IN_PROGRESS") {
        buttonContent = <div>{'Connect'}</div>
    }


    return (
        <Modal.Dialog>
            <Modal.Header closeButton>
                <Modal.Title>Connect to stream server</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group controlId="hostname">
                    <Form.Label>Hostname</Form.Label>
                    <Form.Control
                        value={host}
                        onChange={e => { setHost(e.target.value) }}
                        type="text"
                    />
                </Form.Group>

                <Form.Group controlId="port">
                    <Form.Label>Port</Form.Label>
                    <Form.Control
                        value={port}
                        onChange={e => {
                            setPort(parseInt(e.target.value))
                        }}
                        type="text"
                    />
                </Form.Group>

                <Form.Group controlId="proto">
                    <Form.Label>Protocol</Form.Label>
                    <Form.Control
                        as="select"
                        value={proto}
                        onChange={e => {
                            const value = e.target.value as ServerProto;
                            setProto(value)
                        }}
                    >
                        <option value="http">http</option>
                        <option value="https">https</option>
                    </Form.Control>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    disabled={buttonDisabled}
                    variant="primary"
                    onClick={() => checkConnection()}>
                    {buttonContent}
                    </Button>
            </Modal.Footer>
        </Modal.Dialog>
    );
}

export default Setup