<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const DEFAULT_OVERSCAN = 3;
const DEFAULT_SCROLLING_DELAY = 150;

const createItems = () =>
  Array.from({ length: 10_000 }, (_, index) => ({
    id: Math.random().toString(36).slice(2),
    text: String(index),
  }));

const itemHeight = 40;
const containerHeight = 600;

const listItems = ref(createItems());
const scrollElementRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const isScrolling = ref(false);
const scrollTimeout = ref<ReturnType<typeof setTimeout>>();

const totalHeight = computed(() => itemHeight * listItems.value.length);

const virtualItems = computed(() => {
  const rangeStart = scrollTop.value;
  const rangeEnd = scrollTop.value + containerHeight;

  let startIndex = Math.floor(rangeStart / itemHeight);
  let endIndex = Math.ceil(rangeEnd / itemHeight);

  startIndex = Math.max(0, startIndex - DEFAULT_OVERSCAN);
  endIndex = Math.min(listItems.value.length - 1, endIndex + DEFAULT_OVERSCAN);

  const items = [];
  for (let index = startIndex; index <= endIndex; index++) {
    items.push({
      index,
      offsetTop: index * itemHeight,
    });
  }
  return items;
});

const handleScroll = () => {
  if (!scrollElementRef.value) return;

  scrollTop.value = scrollElementRef.value.scrollTop;
  isScrolling.value = true;

  clearTimeout(scrollTimeout.value);
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false;
  }, DEFAULT_SCROLLING_DELAY);
};

const handleReverseList = () => {
  listItems.value = [...listItems.value].reverse();
};

onMounted(() => {
  if (scrollElementRef.value) {
    scrollElementRef.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (scrollElementRef.value) {
    scrollElementRef.value.removeEventListener('scroll', handleScroll);
  }
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
});
</script>

<template>
  <div style="padding: 12px">
    <div style="margin-bottom: 12px">
      <button @click="handleReverseList">reverse</button>
    </div>
    <div
      ref="scrollElementRef"
      :style="{
        height: `${containerHeight}px`,
        overflow: 'auto',
        border: '1px solid lightgrey',
        position: 'relative',
      }"
    >
      <div :style="{ height: `${totalHeight}px` }">
        <div
          v-for="virtualItem in virtualItems"
          :key="listItems[virtualItem.index].id"
          :style="{
            position: 'absolute',
            top: '0',
            transform: `translateY(${virtualItem.offsetTop}px)`,
            height: itemHeight + 'px',
            padding: '6px 12px',
          }"
        >
          {{ isScrolling ? 'Scrolling...' : listItems[virtualItem.index].text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
}
</style>
