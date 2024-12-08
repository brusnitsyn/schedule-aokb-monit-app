import Echo from 'laravel-echo'

import Pusher from 'pusher-js'
import 'dotenv/config'
window.Pusher = Pusher

export default ({
  $config: { reverbAppKey, reverbHost, reverbPort, reverbScheme },
}) => {
  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: reverbAppKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: (reverbScheme ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
  })
}
