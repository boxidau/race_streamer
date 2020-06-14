import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

export type ServerProto = "http" | "https"
export type ListenerProto = "rtmp" | "rtmps"
export type ServerConfig = {
    host: string,
    port: number,
    proto: ServerProto,
    authKey: string
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
    republish_streams: { [key: string]: RTMPRepublishStream }
}

export type RTMPPublisherInfoStruct = { [key: string]: RTMPStreamInfoStruct }

type SupportedMethod = "GET" | "POST" | "DELETE"

class ServerAPI {
    host: string | null = null
    port: number | null = null
    proto: ServerProto = "http"
    authKey: string | null

    constructor(config: ServerConfig) {
        this.host = config.host
        this.port = config.port
        this.proto = config.proto
        this.authKey = config.authKey
    }

    _generateAuthToken(requestData: string): { Signature: string, HMACTimestamp: string } {
        const ts = Math.floor(Date.now() / 1000)
        const sig = Base64.stringify(hmacSHA256(`${ts}::${requestData}`, this.authKey))
        return { Signature: sig, HMACTimestamp: ts.toString() }
    }



    _fetchSigned(method: SupportedMethod, path: string, data: any = null): Promise<Response> {
        const dataString = data != null ? JSON.stringify(data) : ""
        const authHeaders = this._generateAuthToken(dataString)
        const request = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders
            },
            body: method === "GET" ? null : dataString
        }
        return fetch(
            `${this.serverURI()}${path}`,
            request
        )
    }


    serverURI(): string {
        return `${this.proto}://${this.host}:${this.port}`
    }

    async connectionCheck(): Promise<boolean> {
        const rawResponse = await this._fetchSigned("GET", "/")
        if (rawResponse.status !== 200) return false

        const response = await rawResponse.json()
        if ("connection" in response && response["connection"] === true) {
            return true
        }
        return false
    }

    async getStatus(): Promise<ServerStatusStruct> {
        const status = await this._fetchSigned("GET", "/status")
        const response = await status.json()
        return response
    }

    async getListener(): Promise<StreamEndpointStruct> {
        const status = await this._fetchSigned("GET", "/listener")
        const response = await status.json()
        return response
    }

    async setListener(endpoint: StreamEndpointStruct): Promise<StreamEndpointStruct> {
        const request = await this._fetchSigned("POST", "/listener", endpoint)
        const response = await request.json()
        return response
    }

    async getRepublishInfo(): Promise<RTMPPublisherInfoStruct> {
        const status = await this._fetchSigned("GET", "/streams")
        const response = await status.json()
        return response
    }

    async deleteStream(streamKey: string): Promise<boolean> {
        await this._fetchSigned("DELETE", `/streams/${streamKey}`)
        return true
    }

    async createRepublishStream(streamKey: string, republishStream: RTMPStreamStruct): Promise<any> {
        const request = await this._fetchSigned("POST", `/streams/${streamKey}`, republishStream)
        return await request.json()
    }

    async deleteRepublishStream(streamKey: string, rebublishStreamId: string): Promise<any> {
        const request = await this._fetchSigned("DELETE", `/streams/${streamKey}/${rebublishStreamId}`)
        return await request.json()
    }
}

export default ServerAPI