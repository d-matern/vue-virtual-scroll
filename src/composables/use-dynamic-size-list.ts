import { onMounted, onUnmounted, ref } from 'vue';

type Key = string | number;

interface UseDynamicSizeListProps {
  itemsCount: number;
  itemHeight?: (index: number) => number;
  estimateItemHeight?: (index: number) => number;
  getItemKey: (index: number) => Key;
  overscan?: number;
  scrollingDelay?: number;
  getScrollElement: () => HTMLElement | null;
}

interface DynamicSizeListItem {
  key: Key;
  index: number;
  offsetTop: number;
  height: number;
}

const DEFAULT_OVERSCAN = 3;
const DEFAULT_SCROLLING_DELAY = 150;

function validateProps(props: UseDynamicSizeListProps) {
  const { itemHeight, estimateItemHeight } = props;

  if (!itemHeight && !estimateItemHeight) {
    throw new Error(`you must pass either "itemHeight" or "estimateItemHeight" prop`);
  }
}

export function useDynamicSizeList(props: UseDynamicSizeListProps) {
  validateProps(props);

  const {
    itemHeight,
    estimateItemHeight,
    getItemKey,
    itemsCount,
    overscan = DEFAULT_OVERSCAN,
    scrollingDelay = DEFAULT_SCROLLING_DELAY,
    getScrollElement,
  } = props;

  const measurementCache = ref<Record<Key, number>>({});
  const listHeight = ref(0);
  const scrollTop = ref(0);
  const isScrolling = ref(false);

  const scrollElement = ref<HTMLElement | null>(null);
  const scrollTimeout = ref<ReturnType<typeof setTimeout>>();
  const resizeObserver = ref<ResizeObserver | null>(null);

  const handleScroll = () => {
    scrollTop.value = scrollElement.value!.scrollTop;
    isScrolling.value = true;

    if (typeof scrollTimeout.value === 'number') {
      clearTimeout(scrollTimeout.value);
    }
    scrollTimeout.value = setTimeout(() => {
      isScrolling.value = false;
    }, scrollingDelay);
  };

  onMounted(() => {
    scrollElement.value = getScrollElement();
    if (!scrollElement.value) {
      return;
    }

    resizeObserver.value = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      const height =
        entry.borderBoxSize[0]?.blockSize ?? entry.target.getBoundingClientRect().height;

      listHeight.value = height;
    });
    resizeObserver.value.observe(scrollElement.value);

    handleScroll();
    scrollElement.value.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    if (scrollElement.value) {
      scrollElement.value.removeEventListener('scroll', handleScroll);
    }
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value);
    }
    if (resizeObserver.value) {
      resizeObserver.value.disconnect();
    }
  });

  const virtualData = () => {
    const getItemHeight = (index: number) => {
      if (itemHeight) {
        return itemHeight(index);
      }

      const key = getItemKey(index);
      if (typeof measurementCache.value[key] === 'number') {
        return measurementCache.value[key]!;
      }

      return estimateItemHeight!(index);
    };

    const rangeStart = scrollTop.value;
    const rangeEnd = scrollTop.value + listHeight.value;

    let totalHeight = 0;
    let startIndex = -1;
    let endIndex = -1;
    const allRows: DynamicSizeListItem[] = Array(itemsCount);

    for (let index = 0; index < itemsCount; index++) {
      const key = getItemKey(index);
      const row = {
        key,
        index: index,
        height: getItemHeight(index),
        offsetTop: totalHeight,
      };

      totalHeight += row.height;
      allRows[index] = row;

      if (startIndex === -1 && row.offsetTop + row.height > rangeStart) {
        startIndex = Math.max(0, index - overscan);
      }

      if (endIndex === -1 && row.offsetTop + row.height >= rangeEnd) {
        endIndex = Math.min(itemsCount - 1, index + overscan);
      }
    }

    const virtualRows = allRows.slice(startIndex, endIndex + 1);

    return {
      virtualItems: virtualRows,
      startIndex,
      endIndex,
      allItems: allRows,
      totalHeight,
    };
  };

  const measureElement = (element: Element | null) => {
    if (!element) {
      return;
    }

    const indexAttribute = element.getAttribute('data-index') || '';
    const index = parseInt(indexAttribute, 10);

    if (Number.isNaN(index)) {
      console.error('dynamic elements must have a valid `data-index` attribute');
      return;
    }

    const key = getItemKey(index);
    const size = element.getBoundingClientRect();

    measurementCache.value = { ...measurementCache.value, [key]: size.height };
  };

  return {
    isScrolling,
    virtualData,
    measureElement,
  };
}
