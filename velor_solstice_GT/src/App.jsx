import BackgroundLayer from './components/background_layer'
import ContentLayer from './components/content_layer'
import LoadingScreen from './components/loading_screen'
import SiteFooter from './components/site_footer'

export default {
  render() {
    return (
      <>
        {/* The cinematic sequence gets 5 chapters' worth of scroll distance.
            The inner layer is `sticky`, not `fixed`, so once the visitor
            scrolls past this container it naturally releases and the
            footer below scrolls into view like a normal page section. */}
        <div
          id="scroll-area"
          class="relative min-h-[600vh] bg-[#0a0a0a]"
        >
          <div class="sticky top-0 h-screen w-screen overflow-hidden">
            <ContentLayer />
          </div>
        </div>

        <SiteFooter />

        <LoadingScreen />
      </>
    )
  },
}
