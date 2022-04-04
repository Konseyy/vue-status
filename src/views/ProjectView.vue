<script setup lang="ts">
import type { project, status } from '@/library/types';
import { onMounted, ref } from 'vue';
import StatusComponent from '../components/StatusComponent.vue';

const listUrl = 'https://homeassignment.scoro.com/api/v2/projects/list'
const statusesUrl = 'https://homeassignment.scoro.com/api/v2/statuses/list'
const localStorageKey = "storageComponent-projects";
const projects = ref<project[]>([]);
const projectStatuses = ref<status[]>([]);
const projectStatusesApiResponse = ref<status[]>([]);
async function getProjects(): Promise<project[]> {
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
			return projectsResponseJSON.data;
		} else {
			console.error(`error fetching project data, received status code ${projectsResponseJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
async function getProjectStatuses(): Promise<status[]> {
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
			return projectStatusJSON.data;
		} else {
			console.error(`error fetching project data, received status code ${projectStatusJSON.statusCode}`);
			return [];
		}
	} catch (e) {
		console.error('error fetching project data', e);
		return [];
	}
}
onMounted(async () => {
	projectStatuses.value = await getProjectStatuses();
	projects.value = await getProjects();
	// check if this list of status options has previously been reordered
	const order = localStorage.getItem(localStorageKey);
	if (order) {
		try {
			const storedOrderData = JSON.parse(order);
			if (JSON.stringify(storedOrderData.apiResponse) === JSON.stringify(projectStatusesApiResponse.value)) {
				projectStatuses.value = storedOrderData.lastOrder;
			}
		}
		catch (e) {
			console.error("error setting last order", e);
		}
	}
});
function changeStatusOrder(newOrder: status[]) {
	projectStatuses.value = newOrder;
	localStorage.setItem(localStorageKey, JSON.stringify({
		apiResponse: projectStatusesApiResponse.value,
		lastOrder: newOrder
	}));
}
</script>

<template>
	<ul :class="$style.projectList">
		<li :class="$style.projectMeta" :key="project.project_id" v-for="project in projects">
			<StatusComponent
				:title="project.project_name"
				:title-ratio="1.5"
				:class="$style.projectStatus"
				:starting-status="project.status"
				:status-options="projectStatuses"
				:change-status-url="'https://homeassignment.scoro.com/api/v2/projects/modify/' + project.project_id"
				:reorder-status-options="changeStatusOrder"
			/>
		</li>
	</ul>
</template>

<style module>
.projectList {
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 2rem;
}
.projectMeta {
	padding-bottom: 1rem;
	display: flex;
}
.projectStatus {
	margin-left: auto;
}
</style>