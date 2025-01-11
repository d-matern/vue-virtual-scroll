<script setup lang="ts">
import { computed, ref } from 'vue';
import FixedVirtualScroll from './pages/FixedVirtualScroll.vue';
import NotFound from './pages/NotFound.vue';
import DynamicVirtualScroll from './pages/DynamicVirtualScroll.vue';

const routes = {
    '/': FixedVirtualScroll,
    '/dynamic': DynamicVirtualScroll,
};
const currentPath = ref(window.location.hash);

window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash;
});

const currentView = computed(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return routes[currentPath.value.slice(1) || '/'] || NotFound;
});
</script>

<template>
    <h1>Vue Virtual Scroll</h1>

    <nav>
        <a href="#/">Скролл с фиксированной высотой</a> |
        <a href="#/dynamic">Скролл с динамической высотой</a>
    </nav>

    <component :is="currentView" />
</template>
