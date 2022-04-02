<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const { status, changeStatusUrl, className, statusOptions } = defineProps<{
	status: string;
	changeStatusUrl: string;
	className: string;
	statusOptions: statusOption[];
}>();

type statusOption = {
	statusName: string;
	color: string;
};

const statusSelectionOpen = ref(false);
const statusValue = ref(status);
const statusColor = ref('');
const listElementRef = ref<HTMLElement | null>(null);
const listElementOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 });

function toggleDropdown() {
	// status list toggle handler
	statusSelectionOpen.value = !statusSelectionOpen.value;
	if (statusSelectionOpen.value) {
		if ((window as any).closeLastOpened) {
			(window as any).closeLastOpened();
		}
		(window as any).closeLastOpened = function () {
			statusSelectionOpen.value = false;
			(window as any).closeLastOpened = undefined;
		};
		window.addEventListener(
			'click',
			() => {
				if ((window as any).closeLastOpened) {
					(window as any).closeLastOpened();
				}
			},
			{ once: true }
		);
	} else {
		(window as any).closeLastOpened = undefined;
	}
}

async function selectStatus(status: string, color: string) {
	// status change handler
	statusValue.value = status;
	statusSelectionOpen.value = false;
	statusColor.value = color;
	(window as any).closeLastOpened = undefined;
}
onMounted(() => {
	// find appropriate color for status
	statusColor.value = statusOptions.find((statusOption) => statusOption.statusName === status)?.color ?? '#808080';
});
watch(listElementRef, (ref) => {
	// prevent status list from rendering outside viewport
	if (ref) {
		const pos = ref.getBoundingClientRect();
		const windowHeight = window.innerHeight || document.documentElement.clientHeight;
		const windowWidth = window.innerWidth || document.documentElement.clientWidth;
		if (pos.right > windowWidth) {
			listElementOffset.value = { x: windowWidth - pos.right, y: listElementOffset.value.y };
		}
		if (pos.bottom > windowHeight) {
			listElementOffset.value = { x: listElementOffset.value.x, y: windowHeight - pos.bottom };
		}
	}
});
</script>

<template>
	<div :class="className" class="statusComponent">
		<button
			class="statusValue"
			:class="{ active: statusSelectionOpen }"
			:style="{
				border: !statusSelectionOpen ? `2px solid ${statusColor}` : '2px solid transparent',
				backgroundColor: statusSelectionOpen ? statusColor : 'transparent',
			}"
			@click.stop="toggleDropdown"
		>
			{{ statusValue }}
		</button>
		<div class="statusListMount">
			<ul
				ref="listElementRef"
				class="statusList"
				v-if="statusSelectionOpen"
				:style="{ transform: `translate(${listElementOffset.x}px,${listElementOffset.y}px)` }"
			>
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
.statusComponent {
	font-size: 1rem;
}
.statusValue {
	box-sizing: border-box;
	padding: 0.15em 0.6em;
	border-radius: 0.4rem;
	white-space: nowrap;
	transition: 0.15s;
}
.statusValue.active {
	color: white;
}
.statusValue:hover {
	cursor: pointer;
	filter: brightness(95%);
}
.statusValue:active {
	filter: brightness(80%);
}
.statusListMount {
	position: relative;
}
.statusList {
	font-size: 0.9em;
	margin-top: 3px;
	position: absolute;
	background-color: white;
	border-radius: 10px;
	padding: 0;
	box-shadow: 0 0 25px 2px rgb(199, 199, 199);
}
.status {
	display: flex;
	align-items: center;
	max-width: 13em;
	width: 13em;
	padding: 0.7em 0 0.7em 1.5em;
	/* transition: 0.05s; */
	border-left: 2px solid white;
}
.status.active {
	background-color: #ebf5fa;
	border-left: 2px solid #0085e0;
}
.status:hover {
	cursor: pointer;
}
.status:hover:not(.active) {
	background-color: #f7f9fd;
	border-left: 2px solid #f7f9fd;
}
.status:first-of-type {
	padding-top: 1.1rem;
	border-radius: 10px 10px 0 0;
}
.status:last-of-type {
	padding-bottom: 1.1rem;
	border-radius: 0 0 10px 10px;
}
.status:active {
	transition: 0.1s;
	filter: brightness(95%);
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
	margin-left: 1.8rem;
	white-space: nowrap;
}
.status.active .statusName {
	font-weight: 600;
}
</style>
