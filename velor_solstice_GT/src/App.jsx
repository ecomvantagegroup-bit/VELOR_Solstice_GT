
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

  setup() {
    return () => (
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 class="text-5xl font-bold text-blue-600">
          Hello Vue JSX + Tailwind!
        </h1>
      </div>
    );
  },
});
