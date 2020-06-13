import React from 'react'
import { Button, Modal, Form } from 'semantic-ui-react'
import type { ServerProto, ServerConfig } from '../api/ServerAPI'
import ServerAPI from '../api/ServerAPI'


type Props = {
    onSetServer: (config: ServerConfig) => void
}

type ConnectionCheckStatus = "IN_PROGRESS" | "FAILED" | null

function Setup(props: Props): React.ReactElement {

    const [authKey, setAuthKey] = React.useState<string>("0000-0000-0000-0000")
    const [host, setHost] = React.useState<string>("localhost")
    const [port, setPort] = React.useState<number>(5000)
    const [proto, setProto] = React.useState<ServerProto>("http")
    const [status, setStatus] = React.useState<ConnectionCheckStatus>(null)
    const [errorMessage, setErrorMessage] = React.useState<null | string>(null)

    const checkConnection = () => {
        setStatus("IN_PROGRESS")
        const config = { host, port, proto, authKey }
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
    
    return (
        <Modal open size="small" basic>
            <Modal.Header>Connect to stream server</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <Form>
                        <Form.Field>
                            <Form.Input
                                label="Hostname"
                                value={host}
                                onChange={e => { setHost(e.target.value) }}
                                type="text"
                            />
                        </Form.Field>

                        <Form.Field>
                            <Form.Input label="Port"
                                value={port}
                                onChange={e => {
                                    setPort(parseInt(e.target.value))
                                }}
                                type="text"
                            />
                        </Form.Field>

                        <Form.Field>
                            <Form.Select
                                label="Protocol"
                                value={proto}
                                onChange={(e, { value }) => {
                                    const proto = value as ServerProto;
                                    setProto(proto)
                                }}
                                options={[
                                    { text: "http", value: "http" },
                                    { text: "https", value: "https" }
                                ]}
                            />

                        </Form.Field>

                        <Form.Field>
                            <Form.Input label="Authentication Key"
                                value={authKey}
                                onChange={e => {
                                    setAuthKey(e.target.value)
                                }}
                                type="text"
                            />
                        </Form.Field>
                    </Form>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    disabled={status === "IN_PROGRESS"}
                    primary
                    onClick={() => checkConnection()}
                    loading={status === "IN_PROGRESS"}>
                    Connect
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default Setup