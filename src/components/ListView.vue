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
const lastStatusResponse = ref<status[]>([]);
const loading = ref(true);
function changeStatusOrder(newOrder: status[]) {
	statuses.value = newOrder;
	if (props.localStorageKey) {
		localStorage.setItem(props.localStorageKey, JSON.stringify({
			apiResponse: lastStatusResponse.value,
			lastOrder: newOrder
		}));
	}
}
function getActiveStatus(itemStatus: string) {
	return statuses.value.find((status) => {
		return status.status_name.toLocaleLowerCase() === itemStatus.toLowerCase() || status.status_id.toLocaleLowerCase() === itemStatus.toLowerCase()
	}) ?? { status_id: '', status_name: 'Starting status not found', color: '#808080' }
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
				:modify-status="(newStatus: string) => props.modifyStatus(item.id, newStatus)"
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
	width: 100%;
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
	width: 100%;
	min-width: 900px;
}
.list > .listItem:nth-child(4n + 1),
.list > .listItem:nth-child(4n + 2) {
	background-color: #f4f2fd;
}
.list > .listItem:nth-child(2n) {
	padding-right: 2rem;
}
.list > .listItem:nth-child(2n + 1) {
	padding-left: 2rem;
}
.listItem {
	padding-top: 0.5rem;
	padding-bottom: 0.5rem;
	padding-left: 1rem;
	padding-right: 1rem;
	display: flex;
	justify-content: center;
}
.status {
	margin-left: auto;
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
	.list > .listItem:nth-child(4n + 1),
	.list > .listItem:nth-child(4n + 2) {
		background-color: transparent;
	}
	.list > .listItem:nth-child(2n) {
		background-color: #f4f2fd;
	}
	.list > .listItem {
		padding: 0.5rem 2rem;
	}
}
</style>