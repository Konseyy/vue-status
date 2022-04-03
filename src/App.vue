<script setup lang="ts">
import { RouterView } from 'vue-router';
import StatusComponent from './components/StatusComponent.vue';
import { onMounted, ref } from '@vue/runtime-core';
import {taskStatusOptions, projectStatusOptions} from "@/library/statusOptions";

type task = {
	status: string;
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
	<ul class="projectList">
		<li class="projectContainer" v-for="project in projects">
			<div class="projectMeta">
				<span class="projectTitle">{{ project.project_name }}</span>
				<StatusComponent  class-name="projectStatus" :status="project.status" :status-options="projectStatusOptions" change-status-url="" />
			</div>
				<li class="taskContainer" v-for="task in project.tasks">
					<span class="taskTitle">{{ task.event_name }}</span>
					<StatusComponent class-name="taskStatus" :status="task.status" :status-options="taskStatusOptions" change-status-url="" />
				</li>
		</li>
	</ul>
	<RouterView />
</template>

<style>
@import '@/assets/base.css';
ul {
	list-style: none;
}
.projectList {
	display: grid;
	grid-template-columns: auto auto auto;
}
.projectContainer {
	font-size: 1.6rem;
}
.projectMeta {
	padding-bottom: 1rem;
	display: flex;
}
.projectStatus {
	margin-left: auto;
}
.taskContainer {
	font-size: 1.4rem;
	margin: 1rem 0;
	display: flex;
	grid-template-columns: auto auto;
	row-gap: 0.5rem;
}
.taskStatus{
	margin-left:auto;
}
</style>
