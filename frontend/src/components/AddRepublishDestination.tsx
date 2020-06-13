import React from 'react'

import Url from 'url-parse'
import { RTMPStreamStruct, RTMPAuthSchema } from '../api/ServerAPI'
import { Button, Form, Modal } from 'semantic-ui-react'

type Props = {
    onCreate: (stream: RTMPStreamStruct) => void,
    existingStreamKey?: string,
    invalidStreamKeys?: Array<string>
}

function AddRepublishDestination(props: Props): React.ReactElement {

    const [streamKey, setStreamKey] = React.useState(props.existingStreamKey ?? "")
    const [destinationStreamURI, setDestinationStreamURI] = React.useState("")
    const [destinationStreamKey, setDestinationStreamKey] = React.useState("")
    const [open, setOpen] = React.useState(false)

    const createStreamStruct = (): RTMPStreamStruct => {
        const streamStruct = {
            // server will generate
            id: "",
            src_app: "", 


            src_stream: streamKey,

            // user supplied
            dest_addr: "",
            dest_port: 0,
            dest_app: "",
            dest_stream: "",
            dest_app_params: "",
            dest_stream_params: "",
            auth_schema: "NONE" as RTMPAuthSchema,
            dest_login: "",
            dest_password: "",
            keep_src_stream_params: "",
            ssl: false
        }

        const uri = new Url(destinationStreamURI)

        const ssl = uri.protocol === 'rtmps:'
        streamStruct.ssl = ssl
        const defaultPort = ssl ? 443 : 1935
        
        streamStruct.dest_port = uri.port === "" ? defaultPort : parseInt(uri.port)

        if (uri.pathname.startsWith('/')) {
            streamStruct.dest_app = uri.pathname.substring(1)
        } else {
            streamStruct.dest_app = uri.pathname
        }
        
        streamStruct.dest_addr = uri.hostname
        streamStruct.dest_stream = destinationStreamKey

        if (uri.auth !== "") {
            const [authUser, authPassword] = uri.auth.split(':')
            streamStruct.dest_login = authUser ?? ""
            streamStruct.dest_password = authPassword ?? ""
        }
        return streamStruct
    }

    const reset = () => {
        setDestinationStreamURI("")
        setDestinationStreamKey("")
    }

    const validate = () => {
        if (destinationStreamURI === "") return false
        if (destinationStreamKey === "") return false
        if ((props.invalidStreamKeys ?? []).includes(streamKey)) return false
        return true
    }

    const onSubmit = () => {
        props.onCreate(createStreamStruct())
        reset()
        setOpen(false)
    }
    
    return (
        <Modal
            open={open}
            trigger={
                <Button 
                    color="green"
                    basic
                    size="tiny"
                    content={props.invalidStreamKeys ? "Add Stream" : "Add Destination"}
                    icon="add"
                    onClick={() => setOpen(true)} 
                />
            }
            size="small"
        >
            <Modal.Header>
                Add republish stream destination
            </Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Input
                        type="text"
                        label="Incoming Stream Key"
                        value={streamKey}
                        onChange={(e, { value }) => { setStreamKey(value) }}
                        disabled={props.existingStreamKey != null}
                        placeholder="incoming-stream-key"
                        error={(props.invalidStreamKeys ?? []).includes(streamKey) ? "Incoming stream key already in use" : false}
                    />
                    <Form.Input
                        type="text"
                        label="Destination Stream URI"
                        value={destinationStreamURI}
                        onChange={(e, { value }) => { setDestinationStreamURI(value) }}
                        placeholder="rtmp://theinternet.com/rtmp"
                    />
                    <Form.Input
                        type="text"
                        label="Destination Stream Key"
                        value={destinationStreamKey}
                        onChange={(e, { value }) => { setDestinationStreamKey(value) }}
                        placeholder="super-secret-stream-key"
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" content="Cancel" onClick={() => { reset(); setOpen(false) }} />
                <Button color="green" disabled={!validate()} content="Add" onClick={onSubmit} />
            </Modal.Actions>
        </Modal>
    )
}

export default AddRepublishDestination