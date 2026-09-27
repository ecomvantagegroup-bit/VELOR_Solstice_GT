import { footerContent } from '../../data/content.js'
import './index.css'

export default {
  name: 'SiteFooter',

  render() {
    return (
      <footer class="w-full border-t border-white/10 bg-[#0a0a09] px-10 py-16 md:px-16">
        <div class="grid grid-cols-2 gap-10 md:grid-cols-4">
          {footerContent?.columns?.map((col) => (
            <div key={col.title}>
              <h4 class="mb-4 text-sm font-semibold text-white">{col.title}</h4>

              {col.lines ? (
                col.lines.map((line) => (
                  <p key={line} class="mb-1 text-sm text-white/60">
                    {line}
                  </p>
                ))
              ) : (
                <ul class="space-y-2">
                  {col.links?.map((link) => (
                    <li key={link} class="footer-link cursor-pointer text-sm text-white/60">
                      {link}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div class="mt-12 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 md:flex-row">
          <p class="text-xs text-white/40">{footerContent?.legal}</p>
          <p class="text-xs uppercase tracking-widest text-[#F2C83C]">{footerContent?.tagline}</p>
        </div>
      </footer>
    )
  },
}
