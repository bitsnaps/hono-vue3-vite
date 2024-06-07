<script setup lang="ts">
import { useCounterStore } from '../store'

defineProps<{ msg: string }>()


const couterStore = useCounterStore()


const makeRequest = () => {
  fetch(`/api?count=${couterStore.count}`)
  .then(r => r.json())
  .then(data => couterStore.count = parseInt(data.count))
  
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="makeRequest">Count x2</button>
    <button type="button" @click="couterStore.increment">Count +2: {{ couterStore.doubleCount }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
