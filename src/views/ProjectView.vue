<script setup lang="ts">
import type { listItem, status } from '@/library/types';
import ListView from '@/components/ListView.vue';

const graphQlEndpoint = 'https://www.valdis.me/api/graphql';
async function getProjects() {
	try {
		const projectsResponse = await fetch(graphQlEndpoint, {
			method: 'POST',
			body: JSON.stringify({
				query: `
					query {
						vue_status_component_list(module: projects) {
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
		const projectsResponseJSON = await projectsResponse.json();
		return projectsResponseJSON.data.vue_status_component_list as listItem[]
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
async function getProjectStatuses() {
	try {
		const projectStatusResponse = await fetch(graphQlEndpoint, {
			method: 'POST',
			body: JSON.stringify({
				query: `
					query {
						vue_status_component_statuses(module: projects) {
							status_id
							status_name
							color
						}
					}
				`
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const projectStatusJSON = await projectStatusResponse.json();
		return projectStatusJSON.data.vue_status_component_statuses as status[];
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
async function changeStatus(projectId: number, newStatus: string) {
	// TODO api change status
	console.log(`changing project with id ${projectId} to status ${newStatus}`);
}
</script>

<template>
	<ListView :get-items="getProjects" :get-statuses="getProjectStatuses" @item-changed-status="changeStatus"
		:local-storage-key="'projects'" />
</template>
