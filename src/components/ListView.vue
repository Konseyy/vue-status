<script setup lang="ts">import type { listItem, status } from '@/library/types';
import { onMounted, ref } from 'vue';
import StatusComponent from './StatusComponent.vue';

const props = defineProps<{
	getItems: () => Promise<listItem[]>;
	getStatuses: () => Promise<status[]>;
	modifyStatus: (itemId: number, newStatus: string) => Promise<void>;
	localStorageKey?: string;
}>();
const items = ref<listItem[]>([]);
const statuses = ref<status[]>([]);
const lastStatusResponse = ref<status[]>([]);
function changeStatusOrder(newOrder: status[]) {
	statuses.value = newOrder;
	if (props.localStorageKey) {
		localStorage.setItem(props.localStorageKey, JSON.stringify({
			apiResponse: lastStatusResponse.value,
			lastOrder: newOrder
		}));
	}
}
onMounted(async () => {
	statuses.value = await props.getStatuses();
	items.value = await props.getItems();
	lastStatusResponse.value = statuses.value.map((s) => s);
	// check if this list of status options has previously been reordered
	if (props.localStorageKey) {
		const order = localStorage.getItem(props.localStorageKey);
		if (order) {
			try {
				const storedOrderData = JSON.parse(order);
				if (JSON.stringify(storedOrderData.apiResponse) === JSON.stringify(lastStatusResponse.value)) {
					statuses.value = storedOrderData.lastOrder;
				}
			}
			catch (e) {
				console.error("error setting last order", e);
			}
		}
	}
});
</script>

<template>
	<ul :class="$style.list">
		<li :class="$style.meta" :key="item.id" v-for="item in items">
			<StatusComponent
				:title="item.title"
				:title-ratio="1.5"
				:class="$style.status"
				:starting-status="item.status"
				:status-options="statuses"
				:reorder-status-options="changeStatusOrder"
				:modify-status="(newStatus: string) => props.modifyStatus(item.id, newStatus)"
			/>
		</li>
	</ul>
</template>

<style module lang="scss">
.list {
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 2rem;
}
.meta {
	padding-bottom: 1rem;
	display: flex;
}
.status {
	margin-left: auto;
}
</style>