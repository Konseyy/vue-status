<script setup lang="ts">
import type { project, status } from '@/library/types';
import ListView from '@/components/ListView.vue';

const listUrl = '/api/list'
const statusesUrl = '/api/statuses'
async function getProjects() {
	try {
		const projectsResponse = await fetch(listUrl, {
			method: 'POST',
			body: JSON.stringify({
				module: "projects"
			}),
			headers: {
				'Content-Type': 'application/json'
			}
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
				module: "projects"
			}),
			headers: {
				'Content-Type': 'application/json'
			}
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
	console.log(`changing project with id ${projectId} to status ${newStatus}`);
}
</script>

<template>
	<ListView :get-items="getProjects" :get-statuses="getProjectStatuses" :modify-status="changeStatus"
		:local-storage-key="'projects'" />
</template>
