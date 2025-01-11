<script setup lang="ts">
import { useDynamicSizeList } from '@/composables/use-dynamic-size-list';
import { faker } from '@faker-js/faker';
import { computed, ref, watch } from 'vue';

const containerHeight = 600;
const createItems = () =>
    Array.from({ length: 10_0 }, (_) => ({
        id: Math.random().toString(36).slice(2),
        text: faker.lorem.paragraphs({
            min: 3,
            max: 6,
        }),
    }));

const listItems = ref(createItems());
const scrollElementRef = ref<HTMLElement | null>(null);
const elementsRef = ref<HTMLElement[] | null>(null);

const { virtualData, measureElement } = useDynamicSizeList({
    estimateItemHeight: () => 40,
    itemsCount: listItems.value.length,
    getScrollElement: () => scrollElementRef.value,
    getItemKey: (index) => listItems.value[index].id,
});
const virtual = computed(() => virtualData());

const handleReverseList = () => {
    listItems.value = [...listItems.value].reverse();
};

watch(
    elementsRef,
    (elements) => {
        elements?.forEach(measureElement);
    },
    { immediate: true, deep: true },
);
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
            <div :style="{ height: `${virtual.totalHeight}px` }">
                <div
                    v-for="virtualItem in virtual.virtualItems"
                    :key="virtualItem.key"
                    ref="elementsRef"
                    :data-index="virtualItem.index"
                    :style="{
                        position: 'absolute',
                        top: '0',
                        transform: `translateY(${virtualItem.offsetTop}px)`,
                        padding: '6px 12px',
                    }"
                >
                    {{ listItems[virtualItem.index].text }}
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
