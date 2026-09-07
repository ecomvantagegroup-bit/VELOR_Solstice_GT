export default {
  render() {
    return (
      <footer
        role="contentinfo"
        class="relative z-20 bg-[#0a0a0a] text-white border-t border-white/10"
      >
        <div class="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div class="max-w-xl">
            <h2 class="text-3xl md:text-5xl font-bold">
              Build your own Solstice GT
            </h2>
            <p class="mt-4 text-white/70 text-lg leading-relaxed">
              Choose your trim, colorway, and performance package, then
              reserve a build slot with your local Velor studio.
            </p>
            <a
              href="/configure"
              class="
                inline-block
                mt-8
                px-8
                py-3
                bg-white
                text-[#0a0a0a]
                font-semibold
                rounded-full
                hover:bg-white/90
                transition-colors
              "
            >
              Configure your Solstice GT
            </a>
          </div>

          <div class="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            <nav aria-label="Explore">
              <h3 class="text-white/50 mb-3">Explore</h3>
              <ul class="space-y-2">
                <li><a class="hover:text-white/70" href="#arrival">Overview</a></li>
                <li><a class="hover:text-white/70" href="/design">Design</a></li>
                <li><a class="hover:text-white/70" href="/performance">Performance</a></li>
                <li><a class="hover:text-white/70" href="/specs">Specifications</a></li>
              </ul>
            </nav>

            <nav aria-label="Ownership">
              <h3 class="text-white/50 mb-3">Ownership</h3>
              <ul class="space-y-2">
                <li><a class="hover:text-white/70" href="/dealers">Find a studio</a></li>
                <li><a class="hover:text-white/70" href="/financing">Financing</a></li>
                <li><a class="hover:text-white/70" href="/service">Service</a></li>
              </ul>
            </nav>

            <nav aria-label="Company">
              <h3 class="text-white/50 mb-3">Company</h3>
              <ul class="space-y-2">
                <li><a class="hover:text-white/70" href="/about">About Velor</a></li>
                <li><a class="hover:text-white/70" href="/press">Press</a></li>
                <li><a class="hover:text-white/70" href="/careers">Careers</a></li>
              </ul>
            </nav>

            <nav aria-label="Connect">
              <h3 class="text-white/50 mb-3">Connect</h3>
              <ul class="space-y-2">
                <li><a class="hover:text-white/70" href="https://instagram.com">Instagram</a></li>
                <li><a class="hover:text-white/70" href="https://youtube.com">YouTube</a></li>
                <li><a class="hover:text-white/70" href="/contact">Contact</a></li>
              </ul>
            </nav>
          </div>

          <div
            class="
              mt-16
              pt-6
              border-t
              border-white/10
              flex
              flex-col
              sm:flex-row
              justify-between
              gap-4
              text-xs
              text-white/40
            "
          >
            <p>&copy; {new Date().getFullYear()} Velor Motors. All rights reserved.</p>
            <div class="flex gap-6">
              <a class="hover:text-white/70" href="/privacy">Privacy policy</a>
              <a class="hover:text-white/70" href="/terms">Terms of use</a>
            </div>
          </div>
        </div>
      </footer>
    )
  },
}
