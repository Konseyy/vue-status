<script setup lang="ts">
import type { task, status } from '@/library/types';
import { onMounted, ref } from 'vue';
import StatusComponent from '../components/StatusComponent.vue';

const tasks = ref<task[]>([]);
const taskStatuses = ref<status[]>([]);
const taskStatusesApiResponse = ref<status[]>([]);
const listUrl = 'https://homeassignment.scoro.com/api/v2/tasks/list'
const statusesUrl = 'https://homeassignment.scoro.com/api/v2/statuses/list';
const localStorageKey = "storageComponent-tasks";
async function getTasks() {
	try {
		const tasksResponse = await fetch(listUrl, {
			method: 'POST',
			body: JSON.stringify({
				lang: 'eng',
				company_account_id: import.meta.env.VITE_COMPANY_ID,
				apiKey: import.meta.env.VITE_API_KEY,
				request: {},
			}),
		});
		const tasksResponseJSON = await tasksResponse.json();
		if (tasksResponseJSON.statusCode === 200) {
			return tasksResponseJSON.data;
		} else {
			console.error(`error fetching task data, received status code ${tasksResponseJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching task data', e);
		return [];
	}
}
async function getTaskStatuses(): Promise<status[]> {
	try {
		const taskStatusResponse = await fetch(statusesUrl, {
			method: 'POST',
			body: JSON.stringify({
				lang: 'eng',
				company_account_id: import.meta.env.VITE_COMPANY_ID,
				apiKey: import.meta.env.VITE_API_KEY,
				filter: {
					module: [
						"tasks"
					]
				}
			}),
		});
		const taskStatusJSON = await taskStatusResponse.json();
		if (taskStatusJSON.statusCode === 200) {
			taskStatusesApiResponse.value = taskStatusJSON.data.map((s: status) => s);
			return taskStatusJSON.data;
		} else {
			console.error(`error fetching project data, received status code ${taskStatusJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
onMounted(async () => {
	taskStatuses.value = await getTaskStatuses();
	tasks.value = await getTasks();
	// check if this list of status options has previously been reordered
	const order = localStorage.getItem(localStorageKey);
	if (order) {
		try {
			const storedOrderData = JSON.parse(order);
			if (JSON.stringify(storedOrderData.apiResponse) === JSON.stringify(taskStatusesApiResponse.value)) {
				taskStatuses.value = storedOrderData.lastOrder;
			}
		}
		catch (e) {
			console.error("error setting last order", e);
		}
	}
});
function changeStatusOrder(newOrder: status[]) {
	taskStatuses.value = newOrder;
	localStorage.setItem(localStorageKey, JSON.stringify({
		apiResponse: taskStatusesApiResponse.value,
		lastOrder: newOrder
	}));
}
</script>

<template>
	<ul :class="$style.taskList">
		<li :class="$style.taskMeta" :key="task.event_id" v-for="task in tasks">
			<StatusComponent
				:title="task.event_name"
				:title-ratio="1.5"
				:class="$style.taskStatus"
				:starting-status="task.status"
				:status-options="taskStatuses"
				:change-status-url="'https://homeassignment.scoro.com/api/v2/tasks/modify/' + task.event_id"
				:reorder-status-options="changeStatusOrder"
			/>
		</li>
	</ul>
</template>

<style module>
.taskList {
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 2rem;
}
.taskMeta {
	padding-bottom: 1rem;
	display: flex;
}
.taskStatus {
	margin-left: auto;
}
</style>