import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faPlug,
    faTachometerAlt,
    faMicrochip,
    faCrosshairs,
    faKey,
    faCircle,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'

import {
    faFacebook,
    faYoutube
} from '@fortawesome/free-brands-svg-icons'

function setupIconLibrary() {
    library.add(
        faPlug,
        faTachometerAlt,
        faMicrochip,
        faCrosshairs,
        faKey,
        faFacebook,
        faYoutube,
        faCircle,
        faQuestionCircle
    )
}

export default setupIconLibrary