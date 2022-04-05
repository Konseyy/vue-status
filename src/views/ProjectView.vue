<script setup lang="ts">
import type { project, status } from '@/library/types';
import ListView from '@/components/ListView.vue';

const listUrl = 'https://homeassignment.scoro.com/api/v2/projects/list'
const statusesUrl = 'https://homeassignment.scoro.com/api/v2/statuses/list'
async function getProjects() {
	try {
		const projectsResponse = await fetch(listUrl, {
			method: 'POST',
			body: JSON.stringify({
				lang: 'eng',
				company_account_id: import.meta.env.VITE_COMPANY_ID,
				apiKey: import.meta.env.VITE_API_KEY,
				request: {},
			}),
		});
		const projectsResponseJSON = await projectsResponse.json();
		if (projectsResponseJSON.statusCode === 200) {
			return (projectsResponseJSON.data as project[]).map((p) => ({
				id: p.project_id,
				title: p.project_name,
				status: p.status,
			}));
		} else {
			console.error(`error fetching project data, received status code ${projectsResponseJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
async function getProjectStatuses() {
	try {
		const projectStatusResponse = await fetch(statusesUrl, {
			method: 'POST',
			body: JSON.stringify({
				lang: 'eng',
				company_account_id: import.meta.env.VITE_COMPANY_ID,
				apiKey: import.meta.env.VITE_API_KEY,
				filter: {
					module: [
						"projects"
					]
				}
			}),
		});
		const projectStatusJSON = await projectStatusResponse.json();
		if (projectStatusJSON.statusCode === 200) {
			return (projectStatusJSON.data as status[]);
		} else {
			console.error(`error fetching project data, received status code ${projectStatusJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
async function changeStatus(projectId: number, newStatus: string) {
	// TODO api change status
}
</script>

<template>
	<ListView
		:get-items="getProjects"
		:get-statuses="getProjectStatuses"
		:modify-status="changeStatus"
		:local-storage-key="'projects'"
	/>
</template>
