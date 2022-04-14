<script setup lang="ts">
import type { task, status } from '@/library/types';
import ListView from '../components/ListView.vue';

const listUrl = 'https://www.valdis.me/api/list'
const statusesUrl = 'https://www.valdis.me/api/statuses';
async function getTasks() {
	try {
		const tasksResponse = await fetch(listUrl, {
			method: 'POST',
			body: JSON.stringify({
				module: "tasks"
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const tasksResponseJSON = await tasksResponse.json();
		if (tasksResponseJSON.statusCode === 200) {
			return (tasksResponseJSON.data as task[]).map((t) => ({
				id: t.event_id,
				title: t.event_name,
				status: t.status,
			}));
		} else {
			console.error(`error fetching task data, received status code ${tasksResponseJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching task data', e);
		return [];
	}
}
async function getTaskStatuses() {
	try {
		const taskStatusResponse = await fetch(statusesUrl, {
			method: "POST",
			body: JSON.stringify({
				module: "tasks"
			}),
			headers: {
				"Content-Type": "application/json"
			}
		})
		const taskStatusJSON = await taskStatusResponse.json();
		console.log("received", taskStatusJSON)
		if (taskStatusJSON.statusCode === 200) {
			return (taskStatusJSON.data as status[]);
		} else {
			console.error(`error fetching project data, received status code ${taskStatusJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
async function changeStatus(taskId: number, newStatus: string) {
	// TODO api change status
	console.log(`changing task with id ${taskId} to status ${newStatus}`);
}
</script>

<template>
	<ListView :get-items="getTasks" :get-statuses="getTaskStatuses" :modify-status="changeStatus"
		:local-storage-key="'tasks'" />
</template>
