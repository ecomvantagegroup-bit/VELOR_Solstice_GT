import { defineComponent, ref } from 'vue'

import Navbar from './components/Navbar/Navbar.jsx'
import ContentLayer from './utils/ContentLayer/ContentLayer.jsx'
import Footer from './components/Footer/Footer.jsx'
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx'

import './App.css'

export default defineComponent({
  name: 'App',
  setup() {
    // The site is not mounted at all until the loading screen has preloaded everything and
    // the visitor clicks Enter, so the hero animation starts exactly when the cover lifts.
    const entered = ref(false)

    return () => (
      <div class="app-root">
        {entered.value && <Navbar />}
        {entered.value && <ContentLayer />}
        {entered.value && <Footer />}
        <LoadingScreen onEnter={() => { entered.value = true }} />
      </div>
    )
  },
})
