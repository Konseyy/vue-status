<script setup lang="ts">
import type { listItem, status } from '@/library/types';
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
const lastStatusResponseString = ref("");
const lastItemsResponseString = ref("");
const loading = ref(true);
const localStorageKey = `storage-component-${props.localStorageKey}`;
function changeStatusOrder(newOrder: status[]) {
	statuses.value = newOrder;
	// if given a storage key, set new statuses in localstorage
	if (props.localStorageKey) {
		localStorage.setItem(`${localStorageKey}-statuses`, JSON.stringify({
			apiResponse: JSON.parse(lastStatusResponseString.value),
			lastOrder: newOrder
		}));
	}
}
function getActiveStatus(itemStatus: string) {
	// determine which status from list is the item's current status or set to not found
	return statuses.value.find((status) => {
		return status.status_name.toLocaleLowerCase() === itemStatus.toLowerCase() || status.status_id.toLocaleLowerCase() === itemStatus.toLowerCase()
	}) ?? { status_id: '', status_name: 'Starting status not found', color: '#808080' }
}
function changeStatusLocally(itemId: number, newStatus: string) {
	items.value = items.value.map(i => {
		if (i.id !== itemId) return i;
		return { ...i, status: newStatus }
	})
	// if given a storage key, set new item status in localstorage
	if (props.localStorageKey) {
		localStorage.setItem(`${localStorageKey}-items`, JSON.stringify({
			apiResponse: JSON.parse(lastItemsResponseString.value),
			itemList: items.value
		}));
	}
}
onMounted(async () => {
	const receivedStatuses = await props.getStatuses();
	statuses.value = receivedStatuses;
	lastStatusResponseString.value = JSON.stringify(receivedStatuses);
	const receivedItems = await props.getItems();
	items.value = receivedItems;
	lastItemsResponseString.value = JSON.stringify(receivedItems);
	// if given a storage key, try to get previously stored info
	if (props.localStorageKey) {
		// check if this list of status options has previously been reordered
		const statusOrder = localStorage.getItem(`${localStorageKey}-statuses`);
		if (statusOrder) {
			try {
				const storedOrderData = JSON.parse(statusOrder);
				if (JSON.stringify(storedOrderData.apiResponse) === lastStatusResponseString.value) {
					statuses.value = storedOrderData.lastOrder;
				}
			}
			catch (e) {
				console.error("error setting last order", e);
			}
		}
		// retrieve items with updated statuses from local storage 
		const storedItems = localStorage.getItem(`${localStorageKey}-items`);
		if (storedItems) {
			try {
				const storedItemData = JSON.parse(storedItems);
				if (JSON.stringify(storedItemData.apiResponse) === lastItemsResponseString.value) {
					items.value = storedItemData.itemList;
				}
			}
			catch (e) {
				console.error("error setting last items", e);
			}
		}
	}
	loading.value = false;
});
</script>

<template>
	<div v-if="loading" :class="$style.loadingContainer">
		<img :class="$style.loadingImg" src="@/assets/img/spinner.png" />
	</div>
	<ul v-if="!loading" :class="$style.list">
		<li :class="$style.listItem" :key="item.id" v-for="item in items">
			<StatusComponent
				:title="item.title"
				:title-ratio="1.5"
				:class="$style.status"
				:starting-status="getActiveStatus(item.status)"
				:status-options="statuses"
				:reorder-status-options="changeStatusOrder"
				:modify-status="(newStatus: string) => {
					changeStatusLocally(item.id, newStatus);
					props.modifyStatus(item.id, newStatus);
				}"
			/>
		</li>
	</ul>
</template>

<style module lang="scss">
@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
.loadingContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	min-width: 900px;
	height: 60vh;
}
.loadingImg {
	height: 4vh;
	width: 4vh;
	animation: spin;
	animation: spin 1s linear infinite;
}
.list {
	display: grid;
	grid-template-columns: auto auto;
	min-width: 900px;
}
.listItem {
	padding-top: 0.5rem;
	padding-bottom: 0.5rem;
	padding-left: 1rem;
	padding-right: 1rem;
	display: flex;
	justify-content: center;
	&:nth-child(4n + 1),
	&:nth-child(4n + 2) {
		background-color: #f4f2fd;
	}
	&:nth-child(2n) {
		padding-right: 2rem;
	}
	&:nth-child(2n + 1) {
		padding-left: 2rem;
	}
	&:nth-last-child(1) {
		border-bottom-right-radius: 1rem;
	}
	&:nth-last-child(2) {
		border-bottom-left-radius: 1rem;
	}
}
@media (max-width: 900px) {
	.loadingContainer {
		min-width: 100%;
		width: 90vw;
	}
	.list {
		grid-template-columns: auto;
		min-width: 100%;
		width: 90vw;
	}
	.listItem {
		padding: 0.5rem 2rem;
		&:nth-child(4n + 1),
		&:nth-child(4n + 2) {
			background-color: transparent;
		}
		&:nth-child(2n) {
			background-color: #f4f2fd;
		}
		&:nth-last-child(1) {
			border-bottom-left-radius: 1rem;
			border-bottom-right-radius: 1rem;
		}
		&:nth-last-child(2) {
			border-radius: 0;
		}
	}
}
</style>