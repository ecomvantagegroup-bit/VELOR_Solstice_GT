import { defineComponent, ref, onMounted } from 'vue';
import gsap from 'gsap';
import { getNavbarContent } from '../../../data/content.js';
import './Navbar.css';

export default defineComponent({
  name: 'Navbar',
  setup() {
    const navRef = ref(null);
    const navbarContent = getNavbarContent(); // safe: App.jsx already awaited loadConfig()

    onMounted(() => {
      if (!navRef.value) return;
      gsap.fromTo(
        navRef.value,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    });

    return () => (
      <nav
        ref={navRef}
        class="velor-navbar fixed inset-x-0 top-0 z-50 flex items-center justify-between px-10 py-5"
      >
        <div class="velor-logo text-xl font-extrabold italic tracking-tight text-white">
          {navbarContent?.logo}
        </div>
        <div class="hidden gap-10 text-sm tracking-wide text-white/70 md:flex">
          {navbarContent?.links?.map((link) => (
            <span key={link} class="nav-link transition-colors duration-300">
              {link}
            </span>
          ))}
        </div>
        <button class="btn-gold rounded-[14px] px-6 py-3 text-sm font-semibold">
          {navbarContent?.cta}
        </button>
      </nav>
    );
  },
});
