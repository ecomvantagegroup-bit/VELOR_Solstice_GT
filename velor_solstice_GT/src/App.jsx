import BackgroundLayer from './components/background_layer'
import ContentLayer from './components/content_layer'

export default {
  render() {
    return (
      <div
        id="scroll-area"
        class="
          relative
          min-h-[600vh]
          bg-transparent
        "
      >
        <BackgroundLayer />
        <ContentLayer />
      </div>
    )
  },
}
