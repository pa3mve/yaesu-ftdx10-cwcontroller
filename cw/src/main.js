
import store from './store'
import { createApp } from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-3-socket.io'

const myApp = createApp(App)

myApp.use(new VueSocketIO({
    debug: true,
    connection: 'http://:8081',
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
        },   
    },
))

myApp.mount('#app')
