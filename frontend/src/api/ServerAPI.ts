
export type ServerProto = "http" | "https"
export type ListenerProto = "rtmp" | "rtmps"
export type ServerConfig = {
    host: string,
    port: number,
    proto: ServerProto
}

export type ServerStatusStruct = {
    Connections: number,    // active connections
    OutRate: number,        // current transmission speed, bits per seconds
    SysInfo: {
        ap: number,         // available procs
        fpms: number,       // free phyical memory size
        fsss: number,       // free swap space size
        scl: number,        // system cpu load
        tpms: number,       // total physical memory size
        tsss: number,       // total swap space size
    }
}

export type StreamEndpointStruct = {
    StreamEndpoint: {
        port: number,
        path: string,
        proto: boolean
    }
}

export type RTMPAuthSchema = "NONE" | "NIMBLE" | "AKAMAI" | "LIMELIGHT" | "PERISCOPE"

export type RTMPStreamStruct = {
    id: string,
    src_app: string,
    src_stream: string,
    dest_addr: string,
    dest_port: number,
    dest_app: string,
    dest_stream: string,
    dest_app_params: string,
    dest_stream_params: string,
    auth_schema: RTMPAuthSchema
    dest_login: string
    dest_password: string,
    keep_src_stream_params: string,
    ssl: boolean
}

export type RTMPIncomingStreamStats = {
    acodec: string, 
    app: string, 
    bandwidth: number, 
    protocol: ListenerProto, 
    publish_time: number, 
    resolution: string, 
    strm: string, 
    vcodec: string,
}

export type RTMPPublisherConnectionStatus = "connected" | "disconnected"

export type RTMPRepublishStreamStats = {
    dest_addr: string, 
    dest_app: string, 
    dest_port: number, 
    dest_stream: string, 
    owner: number, 
    retry_count: number, 
    rule_id: string, 
    src_app: ListenerProto, 
    src_stream: string, 
    state: RTMPPublisherConnectionStatus

    session_duration?: number,
    bandwidth?: number, 
    bytes_recv?: number, 
    bytes_sent?: number, 
}

export type RTMPRepublishStream = {
    rule: RTMPStreamStruct,
    stats: null | RTMPRepublishStreamStats
}

export type RTMPStreamInfoStruct = {
    incoming_stream_stats: null | RTMPIncomingStreamStats,
    republish_streams: {[key: string]: RTMPRepublishStream}
}

export type RTMPPublisherInfoStruct = {[key: string]: RTMPStreamInfoStruct}

class ServerAPI {
    host: string | null = null
    port: number | null = null
    proto: ServerProto = "http"

    constructor(config: ServerConfig) {
        this.host = config.host
        this.port = config.port
        this.proto = config.proto
    }

    serverURI(): string {
        return `${this.proto}://${this.host}:${this.port}`
    }

    async connectionCheck(): Promise<boolean> {
        const status = await fetch(`${this.serverURI()}/`)
        const response = await status.json()
        if ("connection" in response && response["connection"] === true) {
            return true
        }
        return false
    }

    async getStatus(): Promise<ServerStatusStruct> {
        const status = await fetch(`${this.serverURI()}/status`)
        const response = await status.json()
        return response
    }

    async getStreamEndpoint(): Promise<StreamEndpointStruct> {
        const status = await fetch(`${this.serverURI()}/stream_endpoint`)
        const response = await status.json()
        return response
    }

    async setStreamEndpoint(endpoint: StreamEndpointStruct): Promise<StreamEndpointStruct> {
        const request = await fetch(
            `${this.serverURI()}/stream_endpoint`,
            {
                method: "POST",
                body: JSON.stringify(endpoint),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        const response = await request.json()
        return response
    }

    async getRepublishInfo(): Promise<RTMPPublisherInfoStruct> {
        const status = await fetch(`${this.serverURI()}/rtmp_publisher`)
        const response = await status.json()
        return response
    }
}

export default ServerAPI