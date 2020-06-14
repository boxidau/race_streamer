import React from 'react'
import { Button, Modal, Form, Checkbox, Message } from 'semantic-ui-react'
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
    const [remember, setRemember] = React.useState(true)

    const checkConnection = () => {
        setStatus("IN_PROGRESS")
        const config = { host, port, proto, authKey }
        const api = new ServerAPI(config)
        api.connectionCheck()
            .then(r => {
                if (r) {
                    if (remember) {
                        window.localStorage.setItem('serverInformation', JSON.stringify(config))
                    }
                    props.onSetServer(config)
                    return
                }
                setErrorMessage("Check authentication key details")
                setStatus("FAILED")

            })
            .catch((ex: Error) => {
                setErrorMessage(ex.message)
                setStatus("FAILED")
            })
    }

    const connectionError = errorMessage != null ? (
        <Message negative>
            <Message.Header>Unable to connect</Message.Header>
            <p>{errorMessage}</p>
        </Message>
        ) : <div />
        

    return (
        <Modal open size="small" basic>
            <Modal.Header>Connect to stream server</Modal.Header>
            <Modal.Content>
                {connectionError}
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
                        <Checkbox
                            label="Remember connection information"
                            checked={remember}
                            onChange={() => {setRemember(!remember)}} 
                        />
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