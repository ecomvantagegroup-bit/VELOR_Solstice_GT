import { defineComponent } from 'vue'

import Navbar from './components/Navbar/Navbar.jsx'
import ContentLayer from './utils/ContentLayer/ContentLayer.jsx'
import Footer from './components/Footer/Footer.jsx'

import './App.css'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <div class="app-root">
        <Navbar />
        <ContentLayer />
        <Footer />
      </div>
    )
  },
})
