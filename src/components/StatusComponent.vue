<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
const statusOptions: statusOption[] = [
	{
		statusName: 'Draft',
		color: '#C05717',
	},
	{
		statusName: 'Needs prep.',
		color: '#FFC58B',
	},
	{
		statusName: 'Needs estimates',
		color: '#CBF0F0',
	},
	{
		statusName: 'Planned',
		color: '#E2E6EE',
	},
	{
		statusName: 'Needs input',
		color: '#B3BCF5',
	},
	{
		statusName: 'Waiting',
		color: '#47C1BF',
	},
	{
		statusName: 'In progress',
		color: '#50B83C',
	},
	{
		statusName: 'Needs testing',
		color: '#FAD200',
	},
	{
		statusName: 'Testing',
		color: '#FFEA8A',
	},
	{
		statusName: 'Needs review',
		color: '#5C6AC4',
	},
	{
		statusName: 'Needs attention',
		color: '#DE1818',
	},
	{
		statusName: 'Completion',
		color: '#145B39',
	},
];

const { status, changeStatusUrl, className } = defineProps<{
	status: string;
	changeStatusUrl: string;
	className: string;
}>();

type statusOption = {
	statusName: string;
	color: string;
};

const statusSelectionOpen = ref(false);
const statusValue = ref(status);
const statusColor = ref('gray');
function toggleDropdown() {
	statusSelectionOpen.value = !statusSelectionOpen.value;
	if (statusSelectionOpen.value) {
		window.addEventListener(
			'click',
			() => {
				if ((window as any).closeLastOpened) {
					(window as any).closeLastOpened();
				}
			},
			{ once: true }
		);
	}
}

function selectStatus(status: string, color: string) {
	statusValue.value = status;
	statusSelectionOpen.value = false;
	statusColor.value = color;
	(window as any).closeLastOpened = undefined;
}
onMounted(() => {
	statusOptions.forEach((statusOption) => {
		if (statusOption.statusName === status) {
			statusColor.value = statusOption.color;
		}
	});
});
watch(statusSelectionOpen, (isOpen) => {
	if (isOpen) {
		if ((window as any).closeLastOpened) {
			(window as any).closeLastOpened();
		}
		(window as any).closeLastOpened = function () {
			statusSelectionOpen.value = false;
			(window as any).closeLastOpened = undefined;
		};
	}
});
</script>

<template>
	<div :class="className">
		<button
			class="statusValue"
			:class="{ active: statusSelectionOpen }"
			:style="{
				backgroundColor: !statusSelectionOpen ? statusColor : undefined,
				border: statusSelectionOpen ? `2px solid ${statusColor}` : '2px solid transparent',
			}"
			@click.self.stop="toggleDropdown"
		>
			{{ statusValue }}
		</button>
		<div class="stautsListMount">
			<ul class="statusList" v-if="statusSelectionOpen">
				<li
					@click.stop="selectStatus(statusOption.statusName, statusOption.color)"
					class="status"
					:class="{ active: statusOption.statusName === statusValue }"
					v-for="statusOption in statusOptions"
				>
					<div class="statusColor" :style="{ backgroundColor: statusOption.color }" />
					<span class="statusName">{{ statusOption.statusName }}</span>
				</li>
			</ul>
		</div>
	</div>
</template>

<style scoped>
.statusValue {
	box-sizing: border-box;
	padding: 0.1rem 0.4rem;
	border-radius: 10px;
}
.statusValue:not(.active) {
	color: white;
}
.statusValue:hover {
	cursor: pointer;
	filter: brightness(95%);
}
.statusValue:active {
	filter: brightness(80%);
}
.stautsListMount {
	position: relative;
}
.statusList {
	position: absolute;
	background-color: white;
	border-radius: 10px;
	padding: 0;
	box-shadow: 0 0 25px 2px rgb(199, 199, 199);
}
.status {
	display: flex;
	align-items: center;
	padding: 0.2rem 1rem;
}
.status.active {
	background-color: #ebf5fa;
}
.status:hover {
	cursor: pointer;
}
.status:hover:not(.active) {
	background-color: #f7f9fd;
}
.status:first-of-type {
	padding-top: 0.5rem;
	border-radius: 10px 10px 0 0;
}
.status:last-of-type {
	padding-bottom: 0.5rem;
	border-radius: 0 0 10px 10px;
}
.statusColor {
	position: absolute;
	height: 15px;
	width: 15px;
	border-radius: 50%;
	border: 2px solid white;
}
.status:hover .statusColor {
	border: 2px solid #f7f9fd;
}
.statusName {
	margin-left: 1.5rem;
	white-space: nowrap;
}
</style>
