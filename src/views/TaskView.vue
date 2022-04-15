<script setup lang="ts">
import type { status, listItem } from '@/library/types';
import ListView from '../components/ListView.vue';

const graphQlEndpoint = 'https://www.valdis.me/api/graphql';
async function getTasks() {
	try {
		const tasksResponse = await fetch(graphQlEndpoint, {
			method: 'POST',
			body: JSON.stringify({
				query: `
					query {
						vue_status_component_list(module: tasks) {
							id
							title: name
							status
						}
					}
				`
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const tasksResponseJSON = await tasksResponse.json();
		return tasksResponseJSON.data.vue_status_component_list as listItem[]
	} catch (e) {
		console.error('error fetching task data', e);
		return [];
	}
}
async function getTaskStatuses() {
	try {
		const taskStatusResponse = await fetch(graphQlEndpoint, {
			method: "POST",
			body: JSON.stringify({
				query: `
					query {
						vue_status_component_statuses(module: tasks) {
							status_id
							status_name
							color
						}
					}
				`
			}),
			headers: {
				"Content-Type": "application/json"
			}
		})
		const taskStatusJSON = await taskStatusResponse.json();
		console.log("received", taskStatusJSON);
		return (taskStatusJSON.data.vue_status_component_statuses as status[]);
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
	<ListView :get-items="getTasks" :get-statuses="getTaskStatuses" @item-changed-status="changeStatus"
		:local-storage-key="'tasks'" />
</template>
