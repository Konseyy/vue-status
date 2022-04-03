<script setup lang="ts">
import "@/assets/base.css";
import { RouterView } from 'vue-router';
import StatusComponent from './components/StatusComponent.vue';
import { onMounted, ref } from '@vue/runtime-core';
import { taskStatusOptions, projectStatusOptions } from "@/library/statusOptions";

type task = {
	status: string;
	event_id: number;
	project_id: number;
	event_name: string;
};
type project = {
	status: string;
	project_name: string;
	project_id: number;
	tasks: task[];
};
const projects = ref<project[]>([]);

async function getProjects() {
	try {
		const projectsResponse = await fetch('https://homeassignment.scoro.com/api/v2/projects/list', {
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
			projects.value = projectsResponseJSON.data;
		} else {
			console.error(`error fetching project data, received status code ${projectsResponseJSON.statusCode}`);
		}
	} catch (e) {
		console.error('error fetching project data', e);
	}
}

async function getTasks() {
	try {
		const tasksResponse = await fetch('https://homeassignment.scoro.com/api/v2/tasks/list', {
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
			projects.value.forEach((project) => {
				project.tasks = tasksResponseJSON.data.filter((task: task) => task.project_id === project.project_id);
			});
		} else {
			console.error(`error fetching task data, received status code ${tasksResponseJSON.statusCode}`);
		}
	} catch (e) {
		console.error('error fetching task data', e);
	}
}
onMounted(async () => {
	await getProjects();
	await getTasks();
});
</script>

<template>
	<ul :class="$style.projectList">
		<template :key="project.project_id" v-for="project in projects">
			<li :class="$style.projectContainer">
				<div :class="$style.projectMeta">
					<span :class="$style.projectTitle">{{ project.project_name }}</span>
					<StatusComponent
						:class="$style.projectStatus"
						:status="project.status"
						:status-options="projectStatusOptions"
						change-status-url="a"
					/>
				</div>
				<div :key="task.event_id" :class="$style.taskContainer" v-for="task in project.tasks">
					<span :class="$style.taskTitle">{{ task.event_name }}</span>
					<StatusComponent
						:class="$style.taskStatus"
						:status="task.status"
						:status-options="taskStatusOptions"
						change-status-url="a"
					/>
				</div>
			</li>
		</template>
	</ul>
	<RouterView />
</template>

<style module lang="scss">
.projectList {
	display: grid;
	grid-template-columns: auto auto auto;
	font-size: 1rem;
}
.projectContainer {
	font-size: 1.6em;
}
.projectMeta {
	padding-bottom: 1rem;
	display: flex;
}
.projectStatus {
	margin-left: auto;
}
.taskContainer {
	font-size: 0.8em;
	margin: 1rem 0;
	display: flex;
	grid-template-columns: auto auto;
	row-gap: 0.5rem;
}
.taskStatus {
	margin-left: auto;
}
</style>
