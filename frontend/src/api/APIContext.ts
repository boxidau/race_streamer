import React from 'react'
import ServerAPI from './ServerAPI'

export type APIContextData = {api: ServerAPI | null, disconnect: () => void}

const APIContext = React.createContext<APIContextData>({api: null, disconnect: () => {}})

export default APIContext